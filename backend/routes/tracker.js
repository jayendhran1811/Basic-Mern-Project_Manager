const express = require('express');
const Tracker = require('../models/Tracker');
const Task = require('../models/Task');
const Project = require('../models/Project');
const { auth, organizationMember } = require('../middleware/auth');

const router = express.Router();

// Get personal tracker stats
router.get('/personal', auth, organizationMember, async (req, res) => {
  try {
    let tracker = await Tracker.findOne({
      userId: req.user._id,
      organizationId: req.user.organizationId
    });

    if (!tracker) {
      tracker = new Tracker({
        userId: req.user._id,
        organizationId: req.user.organizationId
      });
      await tracker.save();
    }

    // Update stats in real-time
    const tasks = await Task.find({
      organizationId: req.user.organizationId,
      assignedEmployees: req.user._id
    });

    const projects = await Project.find({
      organizationId: req.user.organizationId,
      assignedEmployees: req.user._id
    });

    tracker.stats = {
      totalProjects: projects.length,
      completedProjects: projects.filter(p => p.status === 'completed').length,
      totalTasks: tasks.length,
      completedTasks: tasks.filter(t => t.status === 'completed').length,
      tasksByStatus: {
        todo: tasks.filter(t => t.status === 'todo').length,
        'in-progress': tasks.filter(t => t.status === 'in-progress').length,
        blocked: tasks.filter(t => t.status === 'blocked').length,
        completed: tasks.filter(t => t.status === 'completed').length
      },
      tasksByPriority: {
        low: tasks.filter(t => t.priority === 'low').length,
        medium: tasks.filter(t => t.priority === 'medium').length,
        high: tasks.filter(t => t.priority === 'high').length
      },
      lastActivityDate: new Date()
    };

    await tracker.save();
    res.json(tracker);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get tracker stats by user ID (admin only)
router.get('/user/:userId', auth, organizationMember, async (req, res) => {
  try {
    let tracker = await Tracker.findOne({
      userId: req.params.userId,
      organizationId: req.user.organizationId
    });

    if (!tracker) {
      return res.status(404).json({ message: 'Tracker not found' });
    }

    res.json(tracker);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get organization-wide tracker stats (admin only)
router.get('/organization', auth, organizationMember, async (req, res) => {
  try {
    const organizationId = req.user.organizationId;

    // Aggregate status from all users in the organization
    const trackers = await Tracker.find({ organizationId });

    const aggregatedStats = {
      totalTrackers: trackers.length,
      overview: {
        totalProjects: 0,
        completedProjects: 0,
        totalTasks: 0,
        completedTasks: 0
      },
      statusDistribution: {
        todo: 0,
        'in-progress': 0,
        blocked: 0,
        completed: 0
      }
    };

    trackers.forEach(t => {
      if (t.stats) {
        aggregatedStats.overview.totalProjects += t.stats.totalProjects || 0;
        aggregatedStats.overview.completedProjects += t.stats.completedProjects || 0;
        aggregatedStats.overview.totalTasks += t.stats.totalTasks || 0;
        aggregatedStats.overview.completedTasks += t.stats.completedTasks || 0;

        if (t.stats.tasksByStatus) {
          aggregatedStats.statusDistribution.todo += t.stats.tasksByStatus.todo || 0;
          aggregatedStats.statusDistribution['in-progress'] += t.stats.tasksByStatus['in-progress'] || 0;
          aggregatedStats.statusDistribution.blocked += t.stats.tasksByStatus.blocked || 0;
          aggregatedStats.statusDistribution.completed += t.stats.tasksByStatus.completed || 0;
        }
      }
    });

    res.json(aggregatedStats);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;

