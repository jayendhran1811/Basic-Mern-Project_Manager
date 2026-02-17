const express = require('express');
const Task = require('../models/Task');
const Project = require('../models/Project');
const AuditLog = require('../models/AuditLog');
const Tracker = require('../models/Tracker');
const { auth, adminOnly, organizationMember, staffOnly } = require('../middleware/auth');

const router = express.Router();

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

// Create task (Admins/Employees only)
router.post('/', auth, staffOnly, organizationMember, async (req, res) => {
  try {
    let { title, description, category, projectId, priority, dueDate, assignedEmployees, assignedTeam } = req.body;

    if (!title) {
      return res.status(400).json({ message: 'Title is required' });
    }

    // Smart Project Allocation: If no projectId provided, use/create a 'General Deliverables' project
    if (!projectId) {
      let defaultProject = await Project.findOne({
        title: 'General Deliverables',
        organizationId: req.user.organizationId
      });

      if (!defaultProject) {
        defaultProject = new Project({
          title: 'General Deliverables',
          description: 'Automatic bucket for independent tasks and deliverables.',
          organizationId: req.user.organizationId,
          projectOwner: req.user._id,
          status: 'ongoing'
        });
        await defaultProject.save();
      }
      projectId = defaultProject._id;
    }

    // Verify project exists and user has access
    const project = await Project.findOne({
      _id: projectId,
      organizationId: req.user.organizationId
    });

    if (!project) {
      return res.status(404).json({ message: 'Target project not found' });
    }

    // Priority normalization
    const normalizedPriority = (priority || 'medium').toLowerCase();

    const task = new Task({
      title,
      description,
      category: category || 'General',
      projectId,
      organizationId: req.user.organizationId,
      createdBy: req.user._id,
      priority: normalizedPriority,
      dueDate: dueDate || null,
      assignedEmployees: assignedEmployees || [],
      assignedTeam: assignedTeam || null,
      status: 'todo'
    });

    await task.save();

    // Ensure project tasks array is updated
    if (!project.tasks.includes(task._id)) {
      project.tasks.push(task._id);
      await project.save();
    }

    // Create audit log
    await createAuditLog(
      req.user.organizationId,
      req.user._id,
      'task',
      task._id,
      'create',
      null,
      `Created task: ${title}`
    );

    res.status(201).json({
      message: 'Task created successfully',
      task
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get all tasks for organization (Designation-based filtering)
router.get('/', auth, staffOnly, organizationMember, async (req, res) => {
  try {
    let query = { organizationId: req.user.organizationId };

    const { designation, _id: userId } = req.user;

    // Tactical Data Isolation based on Designation
    if (designation !== 'Manager') {
      const orConditions = [
        { assignedEmployees: userId },
        { createdBy: userId }
      ];

      // Designation-specific siloed visibility
      switch (designation) {
        case 'Team Lead':
          // TLs see their team's tasks and tasks they created
          // (Assuming team logic might be linked, for now they see created/assigned + project tasks)
          break;
        case 'Business Analyst':
          orConditions.push({ category: { $in: ['Requirement', 'Documentation', 'BA'] } });
          break;
        case 'Business Development':
          orConditions.push({ category: { $in: ['Client', 'Deal', 'Market', 'BD'] } });
          break;
        case 'DevOps':
          orConditions.push({ category: { $in: ['Deployment', 'Infrastructure', 'DevOps', 'CI/CD'] } });
          break;
        case 'Tester':
          orConditions.push({ category: { $in: ['Bug', 'QA', 'Testing', 'Bugs'] } });
          break;
        case 'Developer':
          // Developers are strictly limited to assigned tasks
          break;
        default:
          break;
      }
      query.$or = orConditions;
    }

    // Optional project filtering
    if (req.query.projectId) {
      query.projectId = req.query.projectId;
    }

    const tasks = await Task.find(query)
      .populate('assignedEmployees', 'firstName lastName email designation')
      .populate('assignedTeam', 'name')
      .populate('createdBy', 'firstName lastName email designation')
      .populate('projectId', 'title')
      .sort('-createdAt');

    res.json(tasks);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get tasks by project
router.get('/project/:projectId', auth, organizationMember, async (req, res) => {
  try {
    const project = await Project.findOne({
      _id: req.params.projectId,
      organizationId: req.user.organizationId
    });

    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }

    // Check authorization for employees
    if (req.user.role === 'employee' && !project.assignedEmployees.some(emp => emp.toString() === req.user._id.toString())) {
      return res.status(403).json({ message: 'Not authorized to view tasks for this project' });
    }

    const tasks = await Task.find({
      projectId: req.params.projectId,
      organizationId: req.user.organizationId
    })
      .populate('assignedEmployees', 'firstName lastName email')
      .populate('assignedTeam', 'name')
      .populate('createdBy', 'firstName lastName email')
      .sort('priority createdAt');

    res.json(tasks);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get single task
router.get('/:id', auth, organizationMember, async (req, res) => {
  try {
    const task = await Task.findOne({
      _id: req.params.id,
      organizationId: req.user.organizationId
    })
      .populate('assignedEmployees', 'firstName lastName email')
      .populate('assignedTeam', 'name members')
      .populate('createdBy', 'firstName lastName email')
      .populate('projectId');

    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }

    // Authorization for internal staff: Already handled by staffOnly and organizationMember middleware.
    // In a flat 2-role system, staff can view any organization task.

    res.json(task);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Update task status (employees can update their assigned tasks)
router.patch('/:id/status', auth, organizationMember, async (req, res) => {
  try {
    let { status } = req.body;
    if (status) status = status.toLowerCase();

    if (!status || !['todo', 'in-progress', 'blocked', 'completed'].includes(status)) {
      return res.status(400).json({ message: 'Invalid status' });
    }

    const task = await Task.findOne({
      _id: req.params.id,
      organizationId: req.user.organizationId
    });

    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }

    // Status Lock: If task is already completed, prevent status changes
    if (task.status === 'completed') {
      return res.status(403).json({ message: 'Resource Lock: Completed tasks cannot be reverted or modified.' });
    }

    const oldStatus = task.status;
    task.status = status;

    if (status === 'completed') {
      task.completedAt = new Date();
    } else {
      task.completedAt = null;
    }

    await task.save();

    // Create audit log
    await createAuditLog(
      req.user.organizationId,
      req.user._id,
      'task',
      task._id,
      'status_change',
      {
        fieldChanged: 'status',
        oldValue: oldStatus,
        newValue: status
      },
      `Updated task status: ${task.title}`
    );

    res.json({
      message: 'Task status updated successfully',
      task
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Update task (Admin/Project owner)
router.put('/:id', auth, organizationMember, async (req, res) => {
  try {
    const { title, description, priority, dueDate, assignedEmployees } = req.body;

    const task = await Task.findOne({
      _id: req.params.id,
      organizationId: req.user.organizationId
    });

    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }

    // Check authorization
    if (req.user.role === 'employee') {
      return res.status(403).json({ message: 'Employees can only update task status' });
    }

    // Track changes
    const changes = [];
    if (dueDate && dueDate !== task.dueDate?.toISOString()) {
      changes.push({
        fieldChanged: 'dueDate',
        oldValue: task.dueDate,
        newValue: dueDate
      });
      task.dueDate = dueDate;
    }

    if (title && title !== task.title) {
      task.title = title;
    }
    if (description) task.description = description;
    if (priority) task.priority = priority;
    if (assignedEmployees) task.assignedEmployees = assignedEmployees;

    await task.save();

    // Create audit logs
    for (const change of changes) {
      await createAuditLog(
        req.user.organizationId,
        req.user._id,
        'task',
        task._id,
        'update',
        change,
        `Updated ${change.fieldChanged} for task: ${task.title}`
      );
    }

    res.json({
      message: 'Task updated successfully',
      task
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Add comment to task
router.post('/:id/comments', auth, organizationMember, async (req, res) => {
  try {
    const { text } = req.body;

    if (!text) {
      return res.status(400).json({ message: 'Comment text is required' });
    }

    const task = await Task.findOne({
      _id: req.params.id,
      organizationId: req.user.organizationId
    });

    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }

    // Check authorization
    if (req.user.role === 'employee' && !task.assignedEmployees.some(emp => emp.toString() === req.user._id.toString())) {
      return res.status(403).json({ message: 'Not authorized to comment on this task' });
    }

    task.comments.push({
      authorId: req.user._id,
      text,
      createdAt: new Date()
    });

    await task.save();
    const updatedTask = await task.populate('comments.authorId', 'firstName lastName email');

    res.json({
      message: 'Comment added successfully',
      task: updatedTask
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Update time spent on task
router.patch('/:id/time-spent', auth, organizationMember, async (req, res) => {
  try {
    const { minutes } = req.body;

    if (minutes === undefined || minutes < 0) {
      return res.status(400).json({ message: 'Valid minutes value is required' });
    }

    const task = await Task.findOne({
      _id: req.params.id,
      organizationId: req.user.organizationId
    });

    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }

    // Check authorization
    if (req.user.role === 'employee' && !task.assignedEmployees.some(emp => emp.toString() === req.user._id.toString())) {
      return res.status(403).json({ message: 'Not authorized to update this task' });
    }

    const oldTimeSpent = task.timeSpent;
    task.timeSpent = (task.timeSpent || 0) + minutes;
    await task.save();

    // Create audit log
    await createAuditLog(
      req.user.organizationId,
      req.user._id,
      'task',
      task._id,
      'update',
      {
        fieldChanged: 'timeSpent',
        oldValue: oldTimeSpent,
        newValue: task.timeSpent
      },
      `Updated time spent on task: ${task.title}`
    );

    res.json({
      message: 'Time spent updated successfully',
      task
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Block/Unblock task
router.patch('/:id/block', auth, organizationMember, async (req, res) => {
  try {
    const { isBlocked, blockReason } = req.body;

    const task = await Task.findOne({
      _id: req.params.id,
      organizationId: req.user.organizationId
    });

    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }

    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Only admins can block/unblock tasks' });
    }

    const oldBlockStatus = task.isBlocked;
    task.isBlocked = isBlocked;
    task.blockReason = isBlocked ? blockReason : '';
    task.status = isBlocked ? 'blocked' : 'todo';

    await task.save();

    // Create audit log
    await createAuditLog(
      req.user.organizationId,
      req.user._id,
      'task',
      task._id,
      'update',
      {
        fieldChanged: 'isBlocked',
        oldValue: oldBlockStatus,
        newValue: isBlocked
      },
      `${isBlocked ? 'Blocked' : 'Unblocked'} task: ${task.title}`
    );

    res.json({
      message: `Task ${isBlocked ? 'blocked' : 'unblocked'} successfully`,
      task
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Delete task (Admin only)
router.delete('/:id', auth, adminOnly, organizationMember, async (req, res) => {
  try {
    const task = await Task.findOneAndDelete({
      _id: req.params.id,
      organizationId: req.user.organizationId
    });

    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }

    await Project.findByIdAndUpdate(task.projectId, {
      $pull: { tasks: task._id }
    });

    // Create audit log
    await createAuditLog(
      req.user.organizationId,
      req.user._id,
      'task',
      req.params.id,
      'delete',
      null,
      `Deleted task: ${task.title}`
    );

    res.json({ message: 'Task deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get task history
router.get('/:id/history', auth, organizationMember, async (req, res) => {
  try {
    const task = await Task.findOne({
      _id: req.params.id,
      organizationId: req.user.organizationId
    });

    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }

    const logs = await AuditLog.find({
      organizationId: req.user.organizationId,
      entityType: 'task',
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

