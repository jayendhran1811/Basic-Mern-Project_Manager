const express = require('express');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Tracker = require('../models/Tracker');
const OnlineSession = require('../models/OnlineSession');
const auth = require('../middleware/auth');
const router = express.Router();

// Register
router.post('/register', async (req, res) => {
  try {
    const { username, email, password, role } = req.body;

    if (!username || !email || !password) {
      return res.status(400).json({ message: 'Please provide all fields' });
    }

    const existingUser = await User.findOne({ $or: [{ email }, { username }] });
    if (existingUser) {
      return res.status(400).json({ message: 'User already exists' });
    }

    const sanitizedRole = role === 'admin' ? 'admin' : 'user';
    const user = new User({ username, email, password, role: sanitizedRole });
    await user.save();

    // Create tracker for new user
    const tracker = new Tracker({ userId: user._id });
    await tracker.save();

    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET || 'your_super_secret_jwt_key_change_this_in_production',
      { expiresIn: '7d' }
    );

    res.status(201).json({
      token,
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        role: user.role
      }
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: 'Please provide email and password' });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET || 'your_super_secret_jwt_key_change_this_in_production',
      { expiresIn: '7d' }
    );

    // Mark user online
    await OnlineSession.findOneAndUpdate(
      { userId: user._id },
      { lastSeen: Date.now() },
      { upsert: true }
    );

    res.json({
      token,
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        role: user.role
      }
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;

// Get all users (admin only)
router.get('/users', auth, async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Forbidden' });
    }
    const users = await User.find().select('-password');
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Heartbeat to keep user online
router.post('/ping', auth, async (req, res) => {
  try {
    await OnlineSession.findOneAndUpdate(
      { userId: req.user._id },
      { lastSeen: Date.now() },
      { upsert: true }
    );
    res.json({ message: 'ok' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get current online users (last 5 minutes)
router.get('/online', auth, async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Forbidden' });
    }
    const cutoff = new Date(Date.now() - 5 * 60 * 1000);
    const sessions = await OnlineSession.find({ lastSeen: { $gte: cutoff } }).populate('userId', 'username email role');
    res.json(sessions.map(s => ({
      userId: s.userId?._id,
      username: s.userId?.username,
      email: s.userId?.email,
      role: s.userId?.role,
      lastSeen: s.lastSeen
    })));
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

