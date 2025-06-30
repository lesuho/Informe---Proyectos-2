const mongoose = require('mongoose');

const TaskPermissionSchema = new mongoose.Schema({
  taskId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Task',
    required: true
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  role: {
    type: String,
    enum: ['propietario', 'editor', 'lector'],
    default: 'lector',
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Índice compuesto para evitar duplicados
TaskPermissionSchema.index({ taskId: 1, userId: 1 }, { unique: true });

module.exports = mongoose.model('TaskPermission', TaskPermissionSchema);