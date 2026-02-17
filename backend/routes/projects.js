const express = require('express');
const Project = require('../models/Project');
const Task = require('../models/Task');
const AuditLog = require('../models/AuditLog');
const { auth, adminOnly, organizationMember, staffOnly } = require('../middleware/auth');
const bitbucketService = require('../utils/bitbucketService');
const githubService = require('../utils/githubService');
const Organization = require('../models/Organization');

const router = express.Router();

// Create Bitbucket Repository
router.post('/create-bitbucket-repo', auth, adminOnly, organizationMember, async (req, res) => {
  try {
    const { projectId, name, description, isPrivate } = req.body;

    const org = await Organization.findById(req.user.organizationId);
    if (!org || !org.bitbucketConfig || !org.bitbucketConfig.appPassword) {
      return res.status(400).json({ message: 'Bitbucket is not configured for this organization. Please set it up in Settings.' });
    }

    const bitbucketResult = await bitbucketService.createRepository(org.bitbucketConfig, {
      name: name || 'new-repo',
      description: description || '',
      isPrivate: isPrivate !== undefined ? isPrivate : true
    });

    if (projectId) {
      await Project.findByIdAndUpdate(projectId, { repositoryUrl: bitbucketResult.repoUrl });
    }

    res.json({
      message: 'Bitbucket repository created successfully',
      repoUrl: bitbucketResult.repoUrl
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Create GitHub Repository
router.post('/create-github-repo', auth, adminOnly, organizationMember, async (req, res) => {
  try {
    const { projectId, name, description, isPrivate } = req.body;

    const org = await Organization.findById(req.user.organizationId);
    if (!org || !org.githubConfig || !org.githubConfig.personalAccessToken) {
      return res.status(400).json({ message: 'GitHub is not configured for this organization. Please set it up in Settings.' });
    }

    const githubResult = await githubService.createRepository(org.githubConfig, {
      name: name || 'new-repo',
      description: description || '',
      isPrivate: isPrivate !== undefined ? isPrivate : true
    });

    if (projectId) {
      await Project.findByIdAndUpdate(projectId, { repositoryUrl: githubResult.repoUrl });
    }

    res.json({
      message: 'GitHub repository created successfully',
      repoUrl: githubResult.repoUrl
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Helper function to create audit log
async function createAuditLog(organizationId, userId, entityType, entityId, action, changeDetails, description) {
  try {
    const auditLog = new AuditLog({
      organizationId,
      userId,
      entityType,
      entityId,
      action,
      changeDetails,
      description
    });
    await auditLog.save();
  } catch (error) {
    console.error('Error creating audit log:', error);
  }
}

// Create Project (Admin Only)
router.post('/', auth, adminOnly, organizationMember, async (req, res) => {
  try {
    const { title, description, clientName, repositoryUrl, status, priority, technologyStack, methodology, requirements, projectOwner, startDate, endDate } = req.body;

    if (!title || !projectOwner) {
      return res.status(400).json({ message: 'Title and project owner are required' });
    }

    const project = new Project({
      title,
      description,
      clientName,
      repositoryUrl,
      status: status || 'not-started',
      priority: priority || 'medium',
      technologyStack: technologyStack || [],
      methodology: methodology || 'Agile',
      requirements,
      projectOwner,
      organizationId: req.user.organizationId,
      startDate: startDate || Date.now(),
      endDate
    });

    await project.save();

    // Create audit log
    await createAuditLog(
      req.user.organizationId,
      req.user._id,
      'project',
      project._id,
      'create',
      null,
      `Created project: ${title}`
    );

    res.status(201).json({
      message: 'Project created successfully',
      project
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get all projects for organization (Designation-based filtering)
router.get('/', auth, staffOnly, organizationMember, async (req, res) => {
  try {
    let query = { organizationId: req.user.organizationId };

    const { designation, _id: userId } = req.user;

    // Tactical Project Isolation
    if (designation !== 'Manager') {
      const orConditions = [
        { projectOwner: userId },
        { assignedEmployees: userId }
      ];

      // BD (Business Development) can see all projects to track deals/clients
      if (designation === 'Business Development') {
        // Business Development has visibility into all projects for opportunity tracking
      } else {
        query.$or = orConditions;
      }
    }

    const projects = await Project.find(query)
      .populate('projectOwner', 'firstName lastName email designation')
      .populate('assignedEmployees', 'firstName lastName email designation')
      .sort('-createdAt');

    res.json(projects);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get single project
router.get('/:id', auth, organizationMember, async (req, res) => {
  try {
    const project = await Project.findOne({
      _id: req.params.id,
      organizationId: req.user.organizationId
    })
      .populate('projectOwner', 'firstName lastName email')
      .populate('assignedEmployees', 'firstName lastName email')
      .populate('tasks');

    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }

    // Check authorization for employees
    if (req.user.role === 'employee' && !project.assignedEmployees.some(emp => emp._id.toString() === req.user._id.toString())) {
      return res.status(403).json({ message: 'Not authorized to view this project' });
    }

    res.json(project);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Update project (Admin Only)
router.put('/:id', auth, adminOnly, organizationMember, async (req, res) => {
  try {
    const { title, description, clientName, status, priority, technologyStack, methodology, requirements, projectOwner, startDate, endDate, assignedEmployees } = req.body;

    const project = await Project.findOne({
      _id: req.params.id,
      organizationId: req.user.organizationId
    });

    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }

    // Track changes for audit log
    const changes = [];
    if (status && status !== project.status) {
      changes.push({
        fieldChanged: 'status',
        oldValue: project.status,
        newValue: status
      });
      project.status = status;
    }
    if (endDate && endDate !== project.endDate?.toISOString()) {
      changes.push({
        fieldChanged: 'endDate',
        oldValue: project.endDate,
        newValue: endDate
      });
      project.endDate = endDate;
    }

    // Update other fields
    if (title) project.title = title;
    if (description) project.description = description;
    if (clientName) project.clientName = clientName;
    if (priority) project.priority = priority;
    if (technologyStack) project.technologyStack = technologyStack;
    if (methodology) project.methodology = methodology;
    if (requirements) project.requirements = requirements;
    if (projectOwner) project.projectOwner = projectOwner;
    if (startDate) project.startDate = startDate;
    if (assignedEmployees) project.assignedEmployees = assignedEmployees;

    await project.save();

    // Create audit logs for changes
    for (const change of changes) {
      await createAuditLog(
        req.user.organizationId,
        req.user._id,
        'project',
        project._id,
        'update',
        change,
        `Updated ${change.fieldChanged} for project: ${project.title}`
      );
    }

    res.json({
      message: 'Project updated successfully',
      project
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Assign employees to project (Admin Only)
router.post('/:id/assign-employees', auth, adminOnly, organizationMember, async (req, res) => {
  try {
    const { employeeIds } = req.body;

    if (!employeeIds || !Array.isArray(employeeIds)) {
      return res.status(400).json({ message: 'Employee IDs must be an array' });
    }

    const project = await Project.findOne({
      _id: req.params.id,
      organizationId: req.user.organizationId
    });

    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }

    const oldAssignees = [...project.assignedEmployees];
    project.assignedEmployees = employeeIds;
    await project.save();

    // Create audit log
    await createAuditLog(
      req.user.organizationId,
      req.user._id,
      'project',
      project._id,
      'assignment_change',
      {
        fieldChanged: 'assignedEmployees',
        oldValue: oldAssignees,
        newValue: employeeIds
      },
      `Updated project assignments for: ${project.title}`
    );

    res.json({
      message: 'Employees assigned successfully',
      project
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Delete project (Admin Only)
router.delete('/:id', auth, adminOnly, organizationMember, async (req, res) => {
  try {
    const project = await Project.findOneAndDelete({
      _id: req.params.id,
      organizationId: req.user.organizationId
    });

    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }

    // Delete all associated tasks
    await Task.deleteMany({ projectId: req.params.id });

    // Create audit log
    await createAuditLog(
      req.user.organizationId,
      req.user._id,
      'project',
      req.params.id,
      'delete',
      null,
      `Deleted project: ${project.title}`
    );

    res.json({ message: 'Project deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get project history/audit logs
router.get('/:id/history', auth, adminOnly, organizationMember, async (req, res) => {
  try {
    const logs = await AuditLog.find({
      organizationId: req.user.organizationId,
      entityType: 'project',
      entityId: req.params.id
    })
      .populate('userId', 'firstName lastName email')
      .sort('-timestamp');

    res.json(logs);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;

