const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const { 
  getTasks, 
  getTaskById, 
  createTask, 
  updateTask, 
  deleteTask, 
  shareTask,
  removeUserFromTask,
  getSubtasks,
  addSubtask,
  updateSubtask,
  deleteSubtask,
  generateTaskPriority,
  generateTaskDate
} = require('../controllers/taskController');

// Rutas existentes
router.route('/').get(protect, getTasks).post(protect, createTask);
router.route('/:id').get(protect, getTaskById).put(protect, updateTask).delete(protect, deleteTask);
router.route('/:id/share').post(protect, shareTask);
// Ruta para eliminar permisos de usuario
router.route('/:id/share/:userId').delete(protect, removeUserFromTask);

// Rutas para subtareas
router.route('/:id/subtasks').get(protect, getSubtasks).post(protect, addSubtask);
router.route('/:id/subtasks/:subtaskId').put(protect, updateSubtask).delete(protect, deleteSubtask);

// Nuevas rutas para generación automática con IA
router.route('/generate-priority').post(protect, generateTaskPriority);
router.route('/generate-date').post(protect, generateTaskDate);

module.exports = router;