const express = require('express');
const router = express.Router();
const { checkUserExists } = require('../controllers/userController');
const { protect } = require('../middleware/auth');
const {
  getUsers,
  getUserProfile,
  updateUserProfile,
  deleteUser,
} = require('../controllers/userController');

// Ruta para verificar si un usuario existe
router.get('/check/:email', protect, checkUserExists);

// Rutas protegidas
router.route('/').get(protect, getUsers);
router.route('/profile').get(protect, getUserProfile).put(protect, updateUserProfile);
router.route('/:id').delete(protect, deleteUser);

module.exports = router;