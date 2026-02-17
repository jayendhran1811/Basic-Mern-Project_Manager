const express = require('express');
const router = express.Router();
const Task = require('../models/Task');
const { auth, organizationMember } = require('../middleware/auth');

// Helper function to get week boundaries
const getWeekBoundaries = (weeksAgo = 0) => {
    const now = new Date();
    const dayOfWeek = now.getDay();
    const diffToMonday = (dayOfWeek === 0 ? -6 : 1) - dayOfWeek;

    const startOfWeek = new Date(now);
    startOfWeek.setDate(now.getDate() + diffToMonday - (weeksAgo * 7));
    startOfWeek.setHours(0, 0, 0, 0);

    const endOfWeek = new Date(startOfWeek);
    endOfWeek.setDate(startOfWeek.getDate() + 6);
    endOfWeek.setHours(23, 59, 59, 999);

    return { startOfWeek, endOfWeek };
};

// Helper function to get week label
const getWeekLabel = (startDate) => {
    const options = { month: 'short', day: 'numeric' };
    const endDate = new Date(startDate);
    endDate.setDate(startDate.getDate() + 6);

    return `${startDate.toLocaleDateString('en-US', options)} - ${endDate.toLocaleDateString('en-US', options)}`;
};

// GET /api/reports/weekly - Get weekly task reports
router.get('/weekly', auth, organizationMember, async (req, res) => {
    try {
        const { weeks = 4, employeeId } = req.query;
        const organizationId = req.user.organizationId;
        const weeksToFetch = parseInt(weeks) || 4;

        const weeklyData = [];

        for (let i = 0; i < weeksToFetch; i++) {
            const { startOfWeek, endOfWeek } = getWeekBoundaries(i);

            // Build match criteria
            const matchCriteria = {
                organizationId,
                createdAt: {
                    $gte: startOfWeek,
                    $lte: endOfWeek
                }
            };

            // Add employee filter if provided (admin only)
            if (employeeId && req.user.role === 'admin') {
                matchCriteria.assignedEmployees = employeeId;
            }

            // Aggregate task data for this week
            const weekStats = await Task.aggregate([
                { $match: matchCriteria },
                {
                    $group: {
                        _id: null,
                        total: { $sum: 1 },
                        completed: {
                            $sum: { $cond: [{ $eq: ['$status', 'completed'] }, 1, 0] }
                        },
                        inProgress: {
                            $sum: { $cond: [{ $eq: ['$status', 'in-progress'] }, 1, 0] }
                        },
                        pending: {
                            $sum: { $cond: [{ $eq: ['$status', 'todo'] }, 1, 0] }
                        },
                        blocked: {
                            $sum: { $cond: [{ $eq: ['$status', 'blocked'] }, 1, 0] }
                        }
                    }
                }
            ]);

            const stats = weekStats[0] || {
                total: 0,
                completed: 0,
                inProgress: 0,
                pending: 0,
                blocked: 0
            };

            // Calculate completion rate
            const completionRate = stats.total > 0
                ? Math.round((stats.completed / stats.total) * 100)
                : 0;

            weeklyData.push({
                week: i === 0 ? 'This Week' : i === 1 ? 'Last Week' : getWeekLabel(startOfWeek),
                weekNumber: weeksToFetch - i,
                startDate: startOfWeek,
                endDate: endOfWeek,
                total: stats.total,
                completed: stats.completed,
                inProgress: stats.inProgress,
                pending: stats.pending,
                blocked: stats.blocked,
                completionRate
            });
        }

        // Reverse to show oldest to newest
        weeklyData.reverse();

        res.json(weeklyData);
    } catch (error) {
        console.error('Weekly report error:', error);
        res.status(500).json({ message: error.message });
    }
});

// GET /api/reports/summary - Get overall summary statistics
router.get('/summary', auth, organizationMember, async (req, res) => {
    try {
        const { employeeId } = req.query;
        const organizationId = req.user.organizationId;

        const matchCriteria = { organizationId };

        if (employeeId && req.user.role === 'admin') {
            matchCriteria.assignedEmployees = employeeId;
        }

        // Get overall stats
        const overallStats = await Task.aggregate([
            { $match: matchCriteria },
            {
                $group: {
                    _id: null,
                    total: { $sum: 1 },
                    completed: {
                        $sum: { $cond: [{ $eq: ['$status', 'completed'] }, 1, 0] }
                    },
                    inProgress: {
                        $sum: { $cond: [{ $eq: ['$status', 'in-progress'] }, 1, 0] }
                    },
                    pending: {
                        $sum: { $cond: [{ $eq: ['$status', 'todo'] }, 1, 0] }
                    },
                    overdue: {
                        $sum: {
                            $cond: [
                                {
                                    $and: [
                                        { $ne: ['$status', 'completed'] },
                                        { $lt: ['$dueDate', new Date()] },
                                        { $ne: ['$dueDate', null] }
                                    ]
                                },
                                1,
                                0
                            ]
                        }
                    }
                }
            }
        ]);

        const stats = overallStats[0] || {
            total: 0,
            completed: 0,
            inProgress: 0,
            pending: 0,
            overdue: 0
        };

        const completionPercentage = stats.total > 0
            ? Math.round((stats.completed / stats.total) * 100)
            : 0;

        res.json({
            ...stats,
            completionPercentage
        });
    } catch (error) {
        console.error('Summary report error:', error);
        res.status(500).json({ message: error.message });
    }
});

module.exports = router;
