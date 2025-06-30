const mongoose = require('mongoose');

// Asegúrate de que el modelo Task tenga el campo sharedWith y referencia a subtasks
const TaskSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    required: true
  },
  priority: {
    type: String,
    enum: ['Baja', 'Media', 'Alta'],
    default: 'Media'
  },
  progress: {
    type: Number,
    default: 0,
    min: 0,
    max: 100
  },
  estado: {
    type: String,
    enum: ['Pendiente', 'En progreso', 'Completada'],
    default: 'Pendiente'
  },
  suggestedDate: {
    type: Date,
    required: true,
    default: Date.now
  },
  user: {  // Cambiado de createdBy a user para mantener consistencia
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  completed: {  // Añadido campo completed que faltaba
    type: Boolean,
    default: false
  },
  sharedWith: [  // Añadido campo sharedWith que faltaba
    {
      user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
      },
      role: {
        type: String,
        enum: ['editor', 'lector'],
        default: 'lector'
      }
    }
  ],
  subtasks: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Subtask'
  }], // Referencia a documentos de Subtask
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Middleware para actualizar la fecha de modificación
TaskSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

module.exports = mongoose.model('Task', TaskSchema);