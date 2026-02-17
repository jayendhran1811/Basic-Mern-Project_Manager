const express = require('express');
const Team = require('../models/Team');
const { auth, adminOnly, organizationMember } = require('../middleware/auth');

const router = express.Router();

// Get all teams for organization
router.get('/', auth, organizationMember, async (req, res) => {
    try {
        const teams = await Team.find({ organizationId: req.user.organizationId })
            .populate('members', 'firstName lastName email')
            .populate('managerId', 'firstName lastName email');
        res.json(teams);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Create team (Admin only)
router.post('/', auth, adminOnly, organizationMember, async (req, res) => {
    try {
        const { name, description, managerId, members } = req.body;

        if (!name) {
            return res.status(400).json({ message: 'Team name is required' });
        }

        const team = new Team({
            name,
            description,
            managerId: managerId || req.user._id,
            members: members || [],
            organizationId: req.user.organizationId
        });

        await team.save();
        res.status(201).json(team);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Update team
router.put('/:id', auth, adminOnly, organizationMember, async (req, res) => {
    try {
        const team = await Team.findOneAndUpdate(
            { _id: req.params.id, organizationId: req.user.organizationId },
            req.body,
            { new: true }
        );
        if (!team) return res.status(404).json({ message: 'Team not found' });
        res.json(team);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

module.exports = router;
