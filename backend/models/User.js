const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    trim: true,
    minlength: 3
  },
  email: {
    type: String,
    required: true,
    trim: true,
    lowercase: true
  },
  firstName: {
    type: String,
    trim: true
  },
  lastName: {
    type: String,
    trim: true
  },
  role: {
    type: String,
    enum: ['admin', 'employee'],
    default: 'employee'
  },
  password: {
    type: String,
    required: true,
    minlength: 6
  },
  organizationId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Organization',
    required: true
  },
  department: {
    type: String,
    trim: true
  },
  designation: {
    type: String,
    enum: ['Manager', 'Business Analyst', 'Business Development', 'Team Lead', 'Developer', 'DevOps', 'Tester'],
    required: true,
    default: 'Developer'
  },
  phoneNumber: {
    type: String,
    trim: true
  },
  avatarUrl: {
    type: String,
    trim: true
  },
  isActive: {
    type: Boolean,
    default: true
  },
  isCurrentlyOnLeave: {
    type: Boolean,
    default: false
  },
  lastLoginAt: {
    type: Date
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  },
  resetPasswordOtp: {
    type: String
  },
  resetPasswordExpires: {
    type: Date
  }
});

userSchema.pre('save', async function (next) {
  // Sync Role with Designation
  if (this.isModified('designation')) {
    this.role = (this.designation === 'Manager') ? 'admin' : 'employee';
  }

  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 10);
  next();
});

userSchema.methods.comparePassword = async function (candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

module.exports = mongoose.model('User', userSchema);

