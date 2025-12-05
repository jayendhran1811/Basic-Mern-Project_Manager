const express = require('express');
const Tracker = require('../models/Tracker');
const Task = require('../models/Task');
const Project = require('../models/Project');
const auth = require('../middleware/auth');
const router = express.Router();

// Get tracker stats
router.get('/', auth, async (req, res) => {
  try {
    let tracker = await Tracker.findOne({ userId: req.user._id });
    
    if (!tracker) {
      // Create tracker if doesn't exist
      tracker = new Tracker({ userId: req.user._id });
      await tracker.save();
    }
    
    // Calculate streak
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    
    const tasksToday = await Task.countDocuments({
      userId: req.user._id,
      updatedAt: { $gte: today }
    });
    
    const tasksYesterday = await Task.countDocuments({
      userId: req.user._id,
      updatedAt: { $gte: yesterday, $lt: today }
    });
    
    // Simple streak calculation
    let streak = tracker.stats.streak || 0;
    if (tasksToday > 0) {
      if (tasksYesterday > 0 || tracker.stats.lastActivityDate?.toDateString() === yesterday.toDateString()) {
        streak += 1;
      } else {
        streak = 1;
      }
    }
    
    tracker.stats.streak = streak;
    tracker.stats.lastActivityDate = new Date();
    await tracker.save();
    
    res.json(tracker);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;

