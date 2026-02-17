const express = require('express');
const Leave = require('../models/Leave');
const User = require('../models/User');
const AuditLog = require('../models/AuditLog');
const { auth, adminOnly, organizationMember } = require('../middleware/auth');

const router = express.Router();

// Helper function to calculate number of days
function calculateDays(startDate, endDate, leaveType) {
  const start = new Date(startDate);
  const end = new Date(endDate);
  const diffTime = Math.abs(end - start);
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;

  if (leaveType === 'Half Day') {
    return 0.5;
  }
  return diffDays;
}

// Apply for leave
router.post('/apply', auth, organizationMember, async (req, res) => {
  try {
    const { leaveType, startDate, endDate, reason } = req.body;

    if (!leaveType || !startDate || !endDate) {
      return res.status(400).json({ message: 'Leave type, start date, and end date are required' });
    }

    const allowedTypes = ['Full Day', 'Half Day', 'Sick Leave', 'Paid Leave', 'Work From Home'];
    if (!allowedTypes.includes(leaveType)) {
      return res.status(400).json({ message: 'Invalid leave type' });
    }

    const numberOfDays = calculateDays(startDate, endDate, leaveType);

    const leave = new Leave({
      userId: req.user._id,
      organizationId: req.user.organizationId,
      leaveType,
      startDate: new Date(startDate),
      endDate: new Date(endDate),
      reason,
      numberOfDays,
      status: 'pending'
    });

    await leave.save();

    res.status(201).json({
      message: 'Leave request submitted successfully',
      leave
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get personal leave applications
router.get('/personal', auth, organizationMember, async (req, res) => {
  try {
    const leaves = await Leave.find({
      userId: req.user._id,
      organizationId: req.user.organizationId
    })
      .populate('approvedBy', 'firstName lastName email')
      .sort('-createdAt');

    res.json(leaves);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get personal leave applications by status
router.get('/personal/:status', auth, organizationMember, async (req, res) => {
  try {
    const { status } = req.params;

    if (!['pending', 'approved', 'rejected'].includes(status)) {
      return res.status(400).json({ message: 'Invalid status' });
    }

    const leaves = await Leave.find({
      userId: req.user._id,
      organizationId: req.user.organizationId,
      status
    })
      .populate('approvedBy', 'firstName lastName email')
      .sort('-createdAt');

    res.json(leaves);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get all leave requests (admin only)
router.get('/organization/all', auth, adminOnly, organizationMember, async (req, res) => {
  try {
    const leaves = await Leave.find({
      organizationId: req.user.organizationId
    })
      .populate('userId', 'firstName lastName email department')
      .populate('approvedBy', 'firstName lastName email')
      .sort('-createdAt');

    res.json(leaves);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get pending leave requests (admin only)
router.get('/organization/pending', auth, adminOnly, organizationMember, async (req, res) => {
  try {
    const leaves = await Leave.find({
      organizationId: req.user.organizationId,
      status: 'pending'
    })
      .populate('userId', 'firstName lastName email department')
      .sort('createdAt');

    res.json(leaves);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Approve leave request (admin only)
router.post('/:id/approve', auth, adminOnly, organizationMember, async (req, res) => {
  try {
    const leave = await Leave.findOne({
      _id: req.params.id,
      organizationId: req.user.organizationId
    });

    if (!leave) {
      return res.status(404).json({ message: 'Leave request not found' });
    }

    if (leave.status !== 'pending') {
      return res.status(400).json({ message: 'Leave request is already processed' });
    }

    leave.status = 'approved';
    leave.approvedBy = req.user._id;
    leave.approvalDate = new Date();
    await leave.save();

    // Update user's leave status if it's an ongoing leave
    const now = new Date();
    const user = await User.findById(leave.userId);
    if (now >= leave.startDate && now <= leave.endDate) {
      user.isCurrentlyOnLeave = true;
      await user.save();
    }

    res.json({
      message: 'Leave request approved successfully',
      leave
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Reject leave request (admin only)
router.post('/:id/reject', auth, adminOnly, organizationMember, async (req, res) => {
  try {
    const { rejectionReason } = req.body;

    const leave = await Leave.findOne({
      _id: req.params.id,
      organizationId: req.user.organizationId
    });

    if (!leave) {
      return res.status(404).json({ message: 'Leave request not found' });
    }

    if (leave.status !== 'pending') {
      return res.status(400).json({ message: 'Leave request is already processed' });
    }

    leave.status = 'rejected';
    leave.approvedBy = req.user._id;
    leave.rejectionReason = rejectionReason || '';
    leave.approvalDate = new Date();
    await leave.save();

    res.json({
      message: 'Leave request rejected successfully',
      leave
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get employees on leave (admin only)
router.get('/organization/on-leave', auth, adminOnly, organizationMember, async (req, res) => {
  try {
    const now = new Date();

    const activeLeaves = await Leave.find({
      organizationId: req.user.organizationId,
      status: 'approved',
      startDate: { $lte: now },
      endDate: { $gte: now }
    })
      .populate('userId', 'firstName lastName email department')
      .sort('startDate');

    const result = activeLeaves.map(leave => ({
      leave,
      daysRemaining: Math.ceil((leave.endDate - now) / (1000 * 60 * 60 * 24))
    }));

    res.json(result);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get employee's leave history
router.get('/employee/:userId', auth, adminOnly, organizationMember, async (req, res) => {
  try {
    const leaves = await Leave.find({
      userId: req.params.userId,
      organizationId: req.user.organizationId
    })
      .populate('approvedBy', 'firstName lastName email')
      .sort('-createdAt');

    if (leaves.length === 0) {
      return res.status(404).json({ message: 'No leave records found' });
    }

    res.json(leaves);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get leave calendar (admin only)
router.get('/organization/calendar', auth, adminOnly, organizationMember, async (req, res) => {
  try {
    const { year, month } = req.query;

    if (!year || !month) {
      return res.status(400).json({ message: 'Year and month are required' });
    }

    const startDate = new Date(year, month - 1, 1);
    const endDate = new Date(year, month, 0, 23, 59, 59);

    const leaves = await Leave.find({
      organizationId: req.user.organizationId,
      status: 'approved',
      startDate: { $lte: endDate },
      endDate: { $gte: startDate }
    })
      .populate('userId', 'firstName lastName')
      .sort('startDate');

    res.json({
      year,
      month,
      leaves
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get employees currently on leave or WFH (Everyone in org)
router.get('/organization/on-leave', auth, organizationMember, async (req, res) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const leaves = await Leave.find({
      organizationId: req.user.organizationId,
      status: 'approved',
      startDate: { $lte: new Date() },
      endDate: { $gte: today }
    }).populate('userId', 'firstName lastName email department');

    res.json(leaves);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Delete/Cancel leave request (employee only, if pending)
router.delete('/:id', auth, organizationMember, async (req, res) => {
  try {
    const leave = await Leave.findOne({
      _id: req.params.id,
      organizationId: req.user.organizationId
    });

    if (!leave) {
      return res.status(404).json({ message: 'Leave request not found' });
    }

    // Only the user who applied or admin can cancel
    if (req.user.role === 'employee' && leave.userId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to cancel this leave' });
    }

    if (leave.status !== 'pending') {
      return res.status(400).json({ message: 'Can only cancel pending leave requests' });
    }

    await Leave.findByIdAndDelete(req.params.id);

    res.json({ message: 'Leave request cancelled successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
