const jwt = require('jsonwebtoken');
const User = require('../models/User');

const JWT_SECRET = process.env.JWT_SECRET || 'your_super_secret_jwt_key_change_this_in_production';

const auth = async (req, res, next) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');

    if (!token) {
      return res.status(401).json({ message: 'No token, authorization denied' });
    }

    const decoded = jwt.verify(token, JWT_SECRET);
    const user = await User.findById(decoded.id).select('-password');

    if (!user) {
      return res.status(401).json({ message: 'Token is not valid' });
    }

    req.user = user;
    req.token = decoded;
    next();
  } catch (error) {
    res.status(401).json({ message: 'Token is not valid' });
  }
};

// Middleware to check admin role (Now synced with Manager designation)
const adminOnly = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({ message: 'Not authenticated' });
  }

  if (req.user.role !== 'admin' && req.user.designation !== 'Manager') {
    return res.status(403).json({ message: 'Managerial access required' });
  }

  next();
};

// Middleware to check specific designations
const checkDesignation = (designations) => (req, res, next) => {
  if (!req.user) return res.status(401).json({ message: 'Not authenticated' });

  // Manager has full access across all modules
  if (req.user.designation === 'Manager') return next();

  const allowedDesignations = Array.isArray(designations) ? designations : [designations];

  if (!allowedDesignations.includes(req.user.designation)) {
    return res.status(403).json({
      message: `Access denied. This module is restricted to ${allowedDesignations.join(', ')} designations.`
    });
  }

  next();
};

// Middleware to check organization membership
const organizationMember = (req, res, next) => {
  if (!req.user || !req.token) {
    return res.status(401).json({ message: 'Not authenticated' });
  }

  const userOrgId = req.user.organizationId.toString();
  const tokenOrgId = req.token.organizationId;

  if (userOrgId !== tokenOrgId) {
    return res.status(403).json({ message: 'Not a member of this organization' });
  }

  next();
};

// Middleware to restrict access to Staff roles
const staffOnly = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({ message: 'Not authenticated' });
  }

  const validDesignations = ['Manager', 'Business Analyst', 'Business Development', 'Team Lead', 'Developer', 'DevOps', 'Tester'];

  if (!validDesignations.includes(req.user.designation) && req.user.role !== 'admin') {
    return res.status(403).json({ message: 'Authorized personnel access required' });
  }

  next();
};

module.exports = { auth, adminOnly, organizationMember, staffOnly, checkDesignation };

