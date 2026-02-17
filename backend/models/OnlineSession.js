const mongoose = require('mongoose');

const onlineSessionSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  organizationId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Organization',
    required: true
  },
  loginAt: {
    type: Date,
    default: Date.now,
    required: true
  },
  logoutAt: {
    type: Date
  },
  duration: {
    type: Number, // in seconds
    default: 0
  },
  ipAddress: {
    type: String
  },
  userAgent: {
    type: String
  },
  isActive: {
    type: Boolean,
    default: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Calculate duration before saving
onlineSessionSchema.pre('save', function(next) {
  if (this.logoutAt && this.loginAt) {
    this.duration = Math.floor((this.logoutAt - this.loginAt) / 1000); // in seconds
  }
  next();
});

module.exports = mongoose.model('OnlineSession', onlineSessionSchema);

