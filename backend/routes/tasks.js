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
  removeSharedUser,
  getTaskPermissions
} = require('../controllers/taskController');

// Rutas existentes
router.route('/').get(protect, getTasks).post(protect, createTask);
router.route('/:id').get(protect, getTaskById).put(protect, updateTask).delete(protect, deleteTask);
router.route('/:id/share').post(protect, shareTask);
// Agregar esta nueva ruta para eliminar permisos de usuario
router.route('/:id/share/:userId').delete(protect, removeSharedUser);

// Nueva ruta para verificar permisos
router.route('/:id/permissions').get(protect, getTaskPermissions);

module.exports = router;