const express = require('express');
const OnlineSession = require('../models/OnlineSession');
const { auth, adminOnly, organizationMember } = require('../middleware/auth');

const router = express.Router();

// Get personal work hours history (employee)
router.get('/personal', auth, organizationMember, async (req, res) => {
  try {
    const sessions = await OnlineSession.find({
      userId: req.user._id,
      organizationId: req.user.organizationId
    }).sort('-loginAt');

    // Calculate stats
    const totalMinutes = sessions.reduce((sum, session) => sum + (session.duration || 0), 0);
    const totalHours = Math.floor(totalMinutes / 60);
    const totalDays = new Set(sessions.map(s => new Date(s.loginAt).toDateString())).size;

    res.json({
      sessions,
      stats: {
        totalSessions: sessions.length,
        totalHours,
        totalMinutes,
        totalDays,
        averageHoursPerDay: totalDays > 0 ? (totalHours / totalDays).toFixed(2) : 0
      }
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get work hours for specific date range (employee)
router.get('/personal/range', auth, organizationMember, async (req, res) => {
  try {
    const { startDate, endDate } = req.query;

    if (!startDate || !endDate) {
      return res.status(400).json({ message: 'startDate and endDate are required' });
    }

    const sessions = await OnlineSession.find({
      userId: req.user._id,
      organizationId: req.user.organizationId,
      loginAt: {
        $gte: new Date(startDate),
        $lte: new Date(endDate)
      }
    }).sort('-loginAt');

    const totalMinutes = sessions.reduce((sum, session) => sum + (session.duration || 0), 0);

    res.json({
      sessions,
      totalHours: Math.floor(totalMinutes / 60),
      totalMinutes
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get all employees' work hours (admin only)
router.get('/organization/all', auth, adminOnly, organizationMember, async (req, res) => {
  try {
    const sessions = await OnlineSession.find({
      organizationId: req.user.organizationId
    })
      .populate('userId', 'firstName lastName email department')
      .sort('-loginAt');

    // Group by user and calculate stats
    const userStats = {};
    sessions.forEach(session => {
      const userId = session.userId._id.toString();
      if (!userStats[userId]) {
        userStats[userId] = {
          user: session.userId,
          totalSessions: 0,
          totalMinutes: 0,
          lastLogin: null,
          sessions: []
        };
      }
      userStats[userId].totalSessions += 1;
      userStats[userId].totalMinutes += session.duration || 0;
      userStats[userId].lastLogin = session.loginAt;
      userStats[userId].sessions.push(session);
    });

    const result = Object.values(userStats).map(stat => ({
      ...stat,
      totalHours: Math.floor(stat.totalMinutes / 60)
    }));

    res.json(result);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get work hours for specific employee (admin only)
router.get('/employee/:userId', auth, adminOnly, organizationMember, async (req, res) => {
  try {
    const sessions = await OnlineSession.find({
      userId: req.params.userId,
      organizationId: req.user.organizationId
    }).sort('-loginAt');

    const totalMinutes = sessions.reduce((sum, session) => sum + (session.duration || 0), 0);
    const totalHours = Math.floor(totalMinutes / 60);
    const totalDays = new Set(sessions.map(s => new Date(s.loginAt).toDateString())).size;

    res.json({
      sessions,
      stats: {
        totalSessions: sessions.length,
        totalHours,
        totalMinutes,
        totalDays,
        averageHoursPerDay: totalDays > 0 ? (totalHours / totalDays).toFixed(2) : 0
      }
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get currently logged-in employees
router.get('/organization/active', auth, adminOnly, organizationMember, async (req, res) => {
  try {
    const activeSessions = await OnlineSession.find({
      organizationId: req.user.organizationId,
      isActive: true
    })
      .populate('userId', 'firstName lastName email department')
      .sort('-loginAt');

    const result = activeSessions.map(session => ({
      sessionId: session._id,
      user: session.userId,
      loginAt: session.loginAt,
      duration: Math.floor(((new Date() - session.loginAt) / 1000 / 60))
    }));

    res.json(result);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get daily work hours summary for organization
router.get('/organization/daily-summary', auth, adminOnly, organizationMember, async (req, res) => {
  try {
    const { date } = req.query;
    const targetDate = date ? new Date(date) : new Date();
    targetDate.setHours(0, 0, 0, 0);
    
    const nextDate = new Date(targetDate);
    nextDate.setDate(nextDate.getDate() + 1);

    const sessions = await OnlineSession.find({
      organizationId: req.user.organizationId,
      loginAt: {
        $gte: targetDate,
        $lt: nextDate
      }
    })
      .populate('userId', 'firstName lastName email department')
      .sort('-loginAt');

    const userSummary = {};
    sessions.forEach(session => {
      const userId = session.userId._id.toString();
      if (!userSummary[userId]) {
        userSummary[userId] = {
          user: session.userId,
          sessions: [],
          totalMinutes: 0
        };
      }
      userSummary[userId].sessions.push(session);
      userSummary[userId].totalMinutes += session.duration || 0;
    });

    const result = Object.values(userSummary).map(summary => ({
      ...summary,
      totalHours: (summary.totalMinutes / 60).toFixed(2)
    }));

    res.json({
      date: targetDate,
      summary: result
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
