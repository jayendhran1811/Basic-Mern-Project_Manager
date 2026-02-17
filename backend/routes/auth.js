const express = require('express');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Organization = require('../models/Organization');
const OnlineSession = require('../models/OnlineSession');
const Tracker = require('../models/Tracker');
const bitbucketService = require('../utils/bitbucketService');
const githubService = require('../utils/githubService');
const sendEmail = require('../utils/emailService');
const { sendSMS } = require('../utils/smsService');
const { auth, adminOnly, organizationMember } = require('../middleware/auth');

const router = express.Router();

const JWT_SECRET = process.env.JWT_SECRET || 'your_super_secret_jwt_key_change_this_in_production';

// Create Organization & Register Admin
router.post('/create-organization', async (req, res) => {
  try {
    const {
      organizationName,
      industry,
      adminUsername,
      adminEmail,
      adminPassword,
      adminFirstName,
      adminLastName,
      // Support alternative field names from frontend
      email,
      password,
      firstName,
      lastName,
      username
    } = req.body;

    const finalEmail = adminEmail || email;
    const finalPassword = adminPassword || password;
    const finalFirstName = adminFirstName || firstName || '';
    const finalLastName = adminLastName || lastName || '';
    const finalUsername = adminUsername || username || (finalEmail ? (finalEmail.split('@')[0].length >= 3 ? finalEmail.split('@')[0] : finalEmail) : '');

    if (!organizationName || !finalEmail || !finalPassword || !finalUsername) {
      return res.status(400).json({ message: 'Missing required fields (organizationName, email, password, and username/first name)' });
    }

    // Check if organization exists
    const existingOrg = await Organization.findOne({ name: organizationName });
    if (existingOrg) {
      return res.status(400).json({ message: 'Organization already exists' });
    }

    // Check if email exists globally
    const existingUser = await User.findOne({ email: finalEmail });
    if (existingUser) {
      return res.status(400).json({ message: 'Email already registered' });
    }

    // Create organization
    const organization = new Organization({
      name: organizationName,
      industry: industry || 'IT'
    });

    // Create manager (admin) user
    const admin = new User({
      username: finalUsername,
      email: finalEmail,
      password: finalPassword,
      firstName: finalFirstName,
      lastName: finalLastName,
      role: 'admin',
      designation: 'Manager', // Manager is always the creator/admin
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
    const {
      organizationName, // Changed from organizationId
      username,
      email,
      password,
      firstName,
      lastName,
      department,
      designation
    } = req.body;

    const finalUsername = username || (email ? (email.split('@')[0].length >= 3 ? email.split('@')[0] : email) : '');

    if (!organizationName) {
      return res.status(400).json({ message: 'Organization name is required' });
    }

    if (!email || !password || !finalUsername) {
      return res.status(400).json({ message: 'Missing user credentials (email, password, or username)' });
    }

    // Check if organization exists by name
    const organization = await Organization.findOne({ name: organizationName });
    if (!organization) {
      return res.status(400).json({ message: `Organization "${organizationName}" not found. Please check the name and try again.` });
    }

    const organizationId = organization._id;

    // Check if email already exists in any organization
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'Email already registered' });
    }

    // Simplified Role & Designation Detection
    const validDesignations = ['Manager', 'Business Analyst', 'Business Development', 'Team Lead', 'Developer', 'DevOps', 'Tester'];
    const finalDesignation = validDesignations.includes(designation) ? designation : 'Developer';

    let role = (finalDesignation === 'Manager') ? 'admin' : 'employee';

    const orgSlug = organization.name.replace(/\s+/g, '').toLowerCase();
    const adminPattern = new RegExp(`@${orgSlug}\\.ac\\.in$`, 'i');

    if (adminPattern.test(email)) {
      role = 'admin';
      // If email matches admin pattern, ensure they are Manager if not specified
      if (finalDesignation !== 'Manager') {
        // We could force Manager here or just keep role:admin
      }
    }

    // Create user with determined role and designation
    const employee = new User({
      username: finalUsername,
      email,
      password,
      firstName: firstName || '',
      lastName: lastName || '',
      role: role,
      organizationId,
      designation: finalDesignation
    });

    await employee.save();
    organization.employees.push(employee._id);
    await organization.save();

    // Create tracker for user
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
    let { email, password, organizationId } = req.body;
    if (email) email = email.toLowerCase();

    console.log(`Login attempt: email=${email}, org=${organizationId}`);

    if (!email || !password || !organizationId) {
      console.log('Login failed: Missing fields');
      return res.status(400).json({ message: 'Please provide email, password, and organization ID' });
    }

    const user = await User.findOne({ email, organizationId });
    if (!user) {
      console.log(`Login failed: User not found for email=${email} and org=${organizationId}`);
      // Debug lookup
      const allUsersWithEmail = await User.find({ email });
      console.log(`Found ${allUsersWithEmail.length} users with this email across all orgs:`,
        allUsersWithEmail.map(u => ({ email: u.email, org: u.organizationId })));

      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      console.log('Login failed: Password mismatch');
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    if (!user.isActive) {
      return res.status(403).json({ message: 'User account is disabled' });
    }

    // Clear any existing sessions for this user to avoid duplicate key errors
    await OnlineSession.deleteMany({ userId: user._id });

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

    // Fetch user again with populated organization for the frontend
    const populatedUser = await User.findById(user._id)
      .select('-password')
      .populate('organizationId', 'name industry');

    const token = jwt.sign(
      { id: user._id, role: user.role, organizationId },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.json({
      message: 'Login successful',
      token,
      sessionId: session._id,
      user: populatedUser
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

// Get all users in organization (admin only)
router.get('/organization-users', auth, adminOnly, organizationMember, async (req, res) => {
  try {
    const users = await User.find({ organizationId: req.user.organizationId })
      .select('-password')
      .sort('firstName');
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Manage Bitbucket Config (Admin Only)
router.get('/bitbucket-config', auth, adminOnly, organizationMember, async (req, res) => {
  try {
    const org = await Organization.findById(req.user.organizationId);
    if (!org) return res.status(404).json({ message: 'Organization not found' });
    res.json(org.bitbucketConfig || {});
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.post('/test-bitbucket', auth, adminOnly, organizationMember, async (req, res) => {
  try {
    const { username, appPassword, workspace, apiToken } = req.body;
    const result = await bitbucketService.testConnection({ username, appPassword, workspace, apiToken });
    res.json({ message: `Connected successfully to workspace: ${result.workspaceName}` });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

router.post('/bitbucket-config', auth, adminOnly, organizationMember, async (req, res) => {
  try {
    const { username, appPassword, workspace, apiToken } = req.body;
    const org = await Organization.findById(req.user.organizationId);
    if (!org) return res.status(404).json({ message: 'Organization not found' });

    org.bitbucketConfig = { username, appPassword, workspace, apiToken };
    await org.save();

    res.json({ message: 'Bitbucket configuration saved successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Manage GitHub Config (Admin Only)
router.get('/github-config', auth, adminOnly, organizationMember, async (req, res) => {
  try {
    const org = await Organization.findById(req.user.organizationId);
    if (!org) return res.status(404).json({ message: 'Organization not found' });
    res.json(org.githubConfig || {});
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.post('/github-config', auth, adminOnly, organizationMember, async (req, res) => {
  try {
    const { username, personalAccessToken, organization } = req.body;
    const org = await Organization.findById(req.user.organizationId);
    if (!org) return res.status(404).json({ message: 'Organization not found' });

    org.githubConfig = { username, personalAccessToken, organization };
    await org.save();

    res.json({ message: 'GitHub configuration saved successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.post('/test-github', auth, adminOnly, organizationMember, async (req, res) => {
  try {
    const { username, personalAccessToken, organization } = req.body;
    const result = await githubService.testConnection({ username, personalAccessToken, organization });
    res.json({ message: result.info });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});
router.get('/organization-users', auth, adminOnly, organizationMember, async (req, res) => {
  try {
    const users = await User.find({ organizationId: req.user.organizationId })
      .select('-password')
      .sort('firstName');
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get currently active employees (logged in)
router.get('/active-employees', auth, adminOnly, organizationMember, async (req, res) => {
  try {
    const activeSessions = await OnlineSession.find({
      organizationId: req.user.organizationId,
      isActive: true
    }).populate('userId', 'username email firstName lastName');

    res.json(activeSessions.map(s => ({
      sessionId: s._id,
      user: s.userId,
      loginAt: s.loginAt
    })));
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Cleanup stale/incomplete sessions (Admin Only)
router.post('/cleanup-sessions', auth, adminOnly, organizationMember, async (req, res) => {
  console.log('Cleanup sessions request received');
  try {
    const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);

    const result = await OnlineSession.updateMany(
      {
        organizationId: req.user.organizationId,
        isActive: true,
        $or: [
          { loginAt: { $lt: twentyFourHoursAgo } },
          { userId: { $exists: false } },
          { userId: null }
        ]
      },
      {
        $set: { isActive: false, logoutAt: new Date() }
      }
    );

    res.json({ message: `Purged ${result.modifiedCount} stale or incomplete sessions` });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Terminate a specific session (Admin Only)
router.post('/terminate-session/:sessionId', auth, adminOnly, organizationMember, async (req, res) => {
  try {
    const session = await OnlineSession.findOne({
      _id: req.params.sessionId,
      organizationId: req.user.organizationId
    });

    if (!session) {
      return res.status(404).json({ message: 'Session not found' });
    }

    session.isActive = false;
    session.logoutAt = new Date();
    await session.save();

    res.json({ message: 'Session terminated successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Update User Role (Admin Only)
router.patch('/update-role/:userId', auth, adminOnly, organizationMember, async (req, res) => {
  try {
    const { designation } = req.body;
    const { userId } = req.params;

    const validDesignations = ['Manager', 'Business Analyst', 'Business Development', 'Team Lead', 'Developer', 'DevOps', 'Tester'];

    if (!validDesignations.includes(designation)) {
      return res.status(400).json({ message: 'Invalid designation provided' });
    }

    // Check if user belongs to the same organization
    const userToUpdate = await User.findOne({
      _id: userId,
      organizationId: req.user.organizationId
    });

    if (!userToUpdate) {
      return res.status(404).json({ message: 'User not found in your organization' });
    }

    // Sync role with designation
    const newRole = (designation === 'Manager') ? 'admin' : 'employee';

    // Prevent manager from demoting themselves if they are the last manager
    if (userId === req.user.id && designation !== 'Manager') {
      const managersCount = await User.countDocuments({
        organizationId: req.user.organizationId,
        designation: 'Manager'
      });
      if (managersCount <= 1) {
        return res.status(400).json({ message: 'Action restricted: You are the last Manager. Promote another user first.' });
      }
    }

    userToUpdate.designation = designation;
    userToUpdate.role = newRole;
    await userToUpdate.save();

    res.json({ message: `User moved to ${designation} designation` });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Forgot Password
router.post('/forgot-password', async (req, res) => {
  try {
    const { email, phoneNumber } = req.body;

    let user;
    if (phoneNumber) {
      user = await User.findOne({ phoneNumber });
      if (!user) {
        return res.status(400).json({ message: 'User not found with this phone number' });
      }
    } else if (email) {
      user = await User.findOne({ email: email.toLowerCase() });
      if (!user) {
        return res.status(400).json({ message: 'User not found with this email' });
      }
    } else {
      return res.status(400).json({ message: 'Email or Phone Number is required' });
    }

    // Generate 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    // Set expiry (10 minutes)
    user.resetPasswordOtp = otp;
    user.resetPasswordExpires = Date.now() + 10 * 60 * 1000;
    await user.save();

    if (phoneNumber) {
      try {
        await sendSMS(phoneNumber, `Your Pro Manager password reset OTP is: ${otp}. Valid for 10 minutes.`);
        return res.json({ message: 'OTP sent to your phone number' });
      } catch (smsError) {
        console.error('Failed to send real SMS:', smsError.message);

        // Log OTP to console as fallback for development
        console.log(`\n=== SMS FAILED - FALLBACK OTP ===\nTarget: ${phoneNumber}\nOTP: ${otp}\nError: ${smsError.message}\n===============================\n`);

        return res.json({
          message: `SMS delivery failed. Check server console for OTP (Development Fallback).`,
          error: smsError.message
        });
      }
    }

    // Send Email via Nodemailer
    const emailHtml = `
      <div style="font-family: Arial, sans-serif; padding: 20px; color: #333;">
        <h2 style="color: #6C3FF5;">Password Reset Request</h2>
        <p>You requested a password reset for your Pro Manager account.</p>
        <p>Your One-Time Password (OTP) is:</p>
        <h1 style="font-size: 32px; letter-spacing: 5px; color: #333; background: #f4f4f4; padding: 10px; display: inline-block; border-radius: 5px;">${otp}</h1>
        <p>This code is valid for 10 minutes.</p>
        <p>If you did not request this, please ignore this email.</p>
        <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;">
        <p style="font-size: 12px; color: #888;">Pro Manager Security Team</p>
      </div>
    `;

    try {
      await sendEmail(email, 'Your Password Reset OTP', emailHtml);
      res.json({ message: 'OTP sent to your registered email' });
    } catch (emailError) {
      console.error('Failed to send email:', emailError.message);

      // FALLBACK FOR DEVELOPMENT/DEMO: Log OTP to console if email fails
      console.log(`\n=== EMAIL FAILED - FALLBACK OTP ===\nTarget: ${email}\nOTP: ${otp}\nError: ${emailError.message}\n===============================\n`);

      // We still return success to frontend so flow continues, but warn in backend logs
      res.status(200).json({
        message: 'Email delivery failed. Check server console for OTP (Development Fallback).',
        error: emailError.message
      });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Reset Password
router.post('/reset-password', async (req, res) => {
  try {
    const { email, phoneNumber, otp, newPassword } = req.body;

    if (!newPassword || newPassword.length < 6) {
      return res.status(400).json({ message: 'Password must be at least 6 characters' });
    }

    let query = {
      resetPasswordOtp: otp,
      resetPasswordExpires: { $gt: Date.now() }
    };

    if (phoneNumber) {
      query.phoneNumber = phoneNumber;
    } else if (email) {
      query.email = email.toLowerCase();
    } else {
      return res.status(400).json({ message: 'Email or Phone Number is required' });
    }

    const user = await User.findOne(query);

    if (!user) {
      return res.status(400).json({ message: 'Invalid or expired OTP' });
    }

    // Update Password (hashed by pre-save hook)
    user.password = newPassword;
    user.resetPasswordOtp = undefined;
    user.resetPasswordExpires = undefined;

    await user.save();

    res.json({ message: 'Password has been reset successfully. Please login.' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// GET /api/auth/employees - Get all employees (for admin filtering)
router.get('/employees', auth, organizationMember, async (req, res) => {
  try {
    const organizationId = req.user.organizationId;

    const employees = await User.find({
      organizationId,
      role: { $in: ['employee', 'admin'] }
    })
      .select('firstName lastName email role')
      .sort({ firstName: 1 });

    res.json(employees);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Update Profile (Any user can update their own profile)
router.patch('/update-profile', auth, async (req, res) => {
  console.log('Update profile request received:', req.body);
  try {
    const { firstName, lastName, phoneNumber, avatarUrl } = req.body;

    const updateData = {};
    if (firstName) updateData.firstName = firstName;
    if (lastName) updateData.lastName = lastName;
    if (phoneNumber !== undefined) updateData.phoneNumber = phoneNumber;
    if (avatarUrl !== undefined) updateData.avatarUrl = avatarUrl;
    updateData.updatedAt = new Date();

    const user = await User.findByIdAndUpdate(
      req.user.id,
      { $set: updateData },
      { new: true, runValidators: true }
    ).select('-password').populate('organizationId', 'name industry');

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    console.log('Profile updated in DB:', user.email);

    res.json({
      message: 'Profile updated successfully',
      user: user
    });
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;

