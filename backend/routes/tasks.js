const express = require('express');
const Task = require('../models/Task');
const Project = require('../models/Project');
const Tracker = require('../models/Tracker');
const auth = require('../middleware/auth');
const router = express.Router();

// Get all tasks for user (owner or assignee)
router.get('/', auth, async (req, res) => {
  try {
    const tasks = await Task.find({ 
      $or: [
        { userId: req.user._id },
        { assigneeId: req.user._id }
      ]
    })
      .populate('projectId')
      .populate('assigneeId', 'username email role')
      .sort({ createdAt: -1 });
    res.json(tasks);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get tasks by project
router.get('/project/:projectId', auth, async (req, res) => {
  try {
    const tasks = await Task.find({ 
      projectId: req.params.projectId, 
      $or: [
        { userId: req.user._id },
        { assigneeId: req.user._id }
      ]
    })
    .populate('assigneeId', 'username email role')
    .sort({ createdAt: -1 });
    res.json(tasks);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Create task
router.post('/', auth, async (req, res) => {
  try {
    const project = await Project.findOne({ 
      _id: req.body.projectId, 
      userId: req.user._id 
    });
    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }
    
    const task = new Task({
      ...req.body,
      userId: req.user._id,
      assigneeId: req.body.assigneeId || req.user._id
    });
    await task.save();
    
    project.tasks.push(task._id);
    await project.save();
    
    await updateTracker(req.user._id);
    res.status(201).json(task);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Update task
router.put('/:id', auth, async (req, res) => {
  try {
    const task = await Task.findOneAndUpdate(
      { _id: req.params.id, $or: [{ userId: req.user._id }, { assigneeId: req.user._id }] },
      req.body,
      { new: true, runValidators: true }
    );
    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }
    
    await updateTracker(req.user._id);
    res.json(task);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Delete task
router.delete('/:id', auth, async (req, res) => {
  try {
    const task = await Task.findOne({ 
      _id: req.params.id, 
      $or: [{ userId: req.user._id }, { assigneeId: req.user._id }] 
    });
    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }
    
    await Project.findByIdAndUpdate(task.projectId, {
      $pull: { tasks: task._id }
    });
    
    await Task.findByIdAndDelete(task._id);
    await updateTracker(req.user._id);
    res.json({ message: 'Task deleted' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Helper function to update tracker stats
async function updateTracker(userId) {
  const tasks = await Task.find({ userId });
  const projects = await Project.find({ userId });
  
  const stats = {
    totalProjects: projects.length,
    completedProjects: projects.filter(p => p.status === 'completed').length,
    totalTasks: tasks.length,
    completedTasks: tasks.filter(t => t.status === 'completed').length,
    tasksByStatus: {
      todo: tasks.filter(t => t.status === 'todo').length,
      'in-progress': tasks.filter(t => t.status === 'in-progress').length,
      completed: tasks.filter(t => t.status === 'completed').length
    },
    tasksByPriority: {
      low: tasks.filter(t => t.priority === 'low').length,
      medium: tasks.filter(t => t.priority === 'medium').length,
      high: tasks.filter(t => t.priority === 'high').length
    }
  };
  
  await Tracker.findOneAndUpdate(
    { userId },
    { stats, updatedAt: Date.now() },
    { upsert: true }
  );
}

module.exports = router;

