const express = require('express');
const router = express.Router();
const { protect, admin } = require('../middleware/auth');
const { 
  getRoles, 
  getRoleById, 
  createRole, 
  updateRole, 
  deleteRole 
} = require('../controllers/roleController');

// Rutas para roles (protegidas por autenticación y solo para administradores)
router.route('/')
  .get(protect, getRoles)
  .post(protect, admin, createRole);

router.route('/:id')
  .get(protect, getRoleById)
  .put(protect, admin, updateRole)
  .delete(protect, admin, deleteRole);

module.exports = router;
