const mongoose = require('mongoose');

const organizationSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
    unique: true
  },
  industry: {
    type: String,
    enum: ['IT', 'Finance', 'Healthcare', 'Retail', 'Manufacturing', 'Education', 'Other'],
    default: 'IT'
  },
  description: {
    type: String,
    trim: true
  },
  adminId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  employees: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  bitbucketConfig: {
    workspace: { type: String, trim: true },
    appPassword: { type: String, trim: true },
    username: { type: String, trim: true },
    apiToken: { type: String, trim: true }
  },
  githubConfig: {
    personalAccessToken: { type: String, trim: true },
    username: { type: String, trim: true },
    organization: { type: String, trim: true }
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Organization', organizationSchema);
