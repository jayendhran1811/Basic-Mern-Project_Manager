const express = require('express');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Organization = require('../models/Organization');
const OnlineSession = require('../models/OnlineSession');
const Tracker = require('../models/Tracker');
const auth = require('../middleware/auth');

const router = express.Router();

const JWT_SECRET = process.env.JWT_SECRET || 'your_super_secret_jwt_key_change_this_in_production';

// Create Organization & Register Admin
router.post('/create-organization', async (req, res) => {
  try {
    const { organizationName, industry, adminUsername, adminEmail, adminPassword, adminFirstName, adminLastName } = req.body;

    if (!organizationName || !adminEmail || !adminPassword || !adminUsername) {
      return res.status(400).json({ message: 'Missing required fields' });
    }

    // Check if organization exists
    const existingOrg = await Organization.findOne({ name: organizationName });
    if (existingOrg) {
      return res.status(400).json({ message: 'Organization already exists' });
    }

    // Check if email exists globally
    const existingUser = await User.findOne({ email: adminEmail });
    if (existingUser) {
      return res.status(400).json({ message: 'Email already registered' });
    }

    // Create organization
    const organization = new Organization({
      name: organizationName,
      industry: industry || 'IT'
    });

    // Create admin user
    const admin = new User({
      username: adminUsername,
      email: adminEmail,
      password: adminPassword,
      firstName: adminFirstName || '',
      lastName: adminLastName || '',
      role: 'admin',
      organizationId: organization._id
    });

    await admin.save();
    organization.adminId = admin._id;
    organization.employees.push(admin._id);
    await organization.save();

    // Create tracker for admin
    const tracker = new Tracker({
      userId: admin._id,
      organizationId: organization._id
    });
    await tracker.save();

    const token = jwt.sign(
      { id: admin._id, role: admin.role, organizationId: organization._id },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.status(201).json({
      message: 'Organization and admin created successfully',
      token,
      organization: {
        id: organization._id,
        name: organization.name,
        industry: organization.industry
      },
      user: {
        id: admin._id,
        username: admin.username,
        email: admin.email,
        role: admin.role,
        organizationId: organization._id
      }
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Register Employee in Organization
router.post('/register-employee', async (req, res) => {
  try {
    const { organizationId, username, email, password, firstName, lastName, department, designation } = req.body;

    if (!organizationId || !email || !password || !username) {
      return res.status(400).json({ message: 'Missing required fields' });
    }

    // Check if organization exists
    const organization = await Organization.findById(organizationId);
    if (!organization) {
      return res.status(400).json({ message: 'Organization not found' });
    }

    // Check if email already exists in any organization
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'Email already registered' });
    }

    // Create employee user
    const employee = new User({
      username,
      email,
      password,
      firstName: firstName || '',
      lastName: lastName || '',
      role: 'employee',
      organizationId,
      department: department || '',
      designation: designation || ''
    });

    await employee.save();
    organization.employees.push(employee._id);
    await organization.save();

    // Create tracker for employee
    const tracker = new Tracker({
      userId: employee._id,
      organizationId
    });
    await tracker.save();

    const token = jwt.sign(
      { id: employee._id, role: employee.role, organizationId },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.status(201).json({
      message: 'Employee registered successfully',
      token,
      user: {
        id: employee._id,
        username: employee.username,
        email: employee.email,
        role: employee.role,
        firstName: employee.firstName,
        lastName: employee.lastName,
        organizationId
      }
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Login (Universal - both admin and employee)
router.post('/login', async (req, res) => {
  try {
    const { email, password, organizationId } = req.body;

    if (!email || !password || !organizationId) {
      return res.status(400).json({ message: 'Please provide email, password, and organization ID' });
    }

    const user = await User.findOne({ email, organizationId });
    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    if (!user.isActive) {
      return res.status(403).json({ message: 'User account is disabled' });
    }

    // Create login session
    const session = new OnlineSession({
      userId: user._id,
      organizationId,
      loginAt: new Date(),
      isActive: true
    });
    await session.save();

    // Update last login
    user.lastLoginAt = new Date();
    await user.save();

    const token = jwt.sign(
      { id: user._id, role: user.role, organizationId },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.json({
      message: 'Login successful',
      token,
      sessionId: session._id,
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        role: user.role,
        firstName: user.firstName,
        lastName: user.lastName,
        department: user.department,
        designation: user.designation,
        organizationId,
        isCurrentlyOnLeave: user.isCurrentlyOnLeave
      }
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Logout
router.post('/logout', auth, async (req, res) => {
  try {
    const { sessionId } = req.body;

    if (sessionId) {
      const session = await OnlineSession.findById(sessionId);
      if (session && session.isActive) {
        session.logoutAt = new Date();
        session.isActive = false;
        await session.save();
      }
    }

    res.json({ message: 'Logout successful' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get current user
router.get('/me', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id)
      .select('-password')
      .populate('organizationId', 'name industry');

    res.json(user);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get all organizations (for selection during login)
router.get('/organizations', async (req, res) => {
  try {
    const organizations = await Organization.find().select('name industry').limit(50);
    res.json(organizations);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Update Profile
router.patch('/update-profile', auth, async (req, res) => {
  try {
    const { firstName, lastName, phoneNumber, avatarUrl } = req.body;
    const updateData = {};
    if (firstName) updateData.firstName = firstName;
    if (lastName) updateData.lastName = lastName;
    if (phoneNumber !== undefined) updateData.phoneNumber = phoneNumber;
    if (avatarUrl !== undefined) updateData.avatarUrl = avatarUrl;

    const user = await User.findByIdAndUpdate(
      req.user.id,
      { $set: updateData },
      { new: true }
    ).select('-password');

    res.json({ message: 'Profile updated successfully', user });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
