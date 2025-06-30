const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const { 
  getTaskPermissions, 
  addTaskPermission, 
  updateTaskPermission, 
  deleteTaskPermission,
  deleteTaskPermissionByUserId
} = require('../controllers/taskPermissionController');

// Ruta para eliminar permisos por userId (debe ir primero para evitar conflictos)
router.route('/:taskId/user/:userId')
  .delete(protect, deleteTaskPermissionByUserId);

// Rutas para permisos de tareas
router.route('/:taskId/permissions')
  .get(protect, getTaskPermissions)
  .post(protect, addTaskPermission);

router.route('/:taskId/permissions/:permissionId')
  .put(protect, updateTaskPermission)
  .delete(protect, deleteTaskPermission);

module.exports = router;
