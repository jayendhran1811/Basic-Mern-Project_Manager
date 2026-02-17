const mongoose = require('mongoose');

const trackerSchema = new mongoose.Schema({
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
  stats: {
    totalProjects: {
      type: Number,
      default: 0
    },
    completedProjects: {
      type: Number,
      default: 0
    },
    totalTasks: {
      type: Number,
      default: 0
    },
    completedTasks: {
      type: Number,
      default: 0
    },
    tasksByStatus: {
      todo: {
        type: Number,
        default: 0
      },
      'in-progress': {
        type: Number,
        default: 0
      },
      blocked: {
        type: Number,
        default: 0
      },
      completed: {
        type: Number,
        default: 0
      }
    },
    tasksByPriority: {
      low: {
        type: Number,
        default: 0
      },
      medium: {
        type: Number,
        default: 0
      },
      high: {
        type: Number,
        default: 0
      }
    },
    totalHoursWorked: {
      type: Number,
      default: 0
    },
    lastActivityDate: {
      type: Date
    }
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

module.exports = mongoose.model('Tracker', trackerSchema);

