const mongoose = require('mongoose');

const RoleSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true
  },
  description: {
    type: String,
    required: true
  },
  permissions: {
    canCreateTask: {
      type: Boolean,
      default: false
    },
    canEditTask: {
      type: Boolean,
      default: false
    },
    canDeleteTask: {
      type: Boolean,
      default: false
    },
    canShareTask: {
      type: Boolean,
      default: false
    },
    canViewAllTasks: {
      type: Boolean,
      default: false
    },
    canManageUsers: {
      type: Boolean,
      default: false
    }
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Role', RoleSchema);