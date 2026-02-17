const express = require('express');
const Notification = require('../models/Notification');
const User = require('../models/User');
const { auth, organizationMember } = require('../middleware/auth');

const router = express.Router();

// Get user notifications
router.get('/', auth, organizationMember, async (req, res) => {
    try {
        const notifications = await Notification.find({
            recipientId: req.user._id,
            organizationId: req.user.organizationId
        })
            .populate('senderId', 'firstName lastName username')
            .sort('-createdAt')
            .limit(50);

        res.json(notifications);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Mark as read
router.patch('/:id/read', auth, organizationMember, async (req, res) => {
    try {
        const notification = await Notification.findOneAndUpdate(
            { _id: req.params.id, recipientId: req.user._id },
            { status: 'read' },
            { new: true }
        );
        res.json(notification);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Create notification (internal use or specific endpoint)
router.post('/', auth, organizationMember, async (req, res) => {
    try {
        const { recipientId, type, title, message, taskId } = req.body;

        // If no specific recipient, and it's from a customer, maybe send to admin?
        // User requested "send as notification for admin accnt"
        let targetRecipientId = recipientId;
        if (!targetRecipientId) {
            const admin = await User.findOne({
                organizationId: req.user.organizationId,
                role: 'admin'
            });
            if (admin) targetRecipientId = admin._id;
        }

        if (!targetRecipientId) {
            return res.status(400).json({ message: 'No recipient found for notification' });
        }

        const notification = new Notification({
            recipientId: targetRecipientId,
            senderId: req.user._id,
            organizationId: req.user.organizationId,
            type,
            title,
            message,
            taskId
        });

        await notification.save();
        res.status(201).json(notification);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

module.exports = router;
