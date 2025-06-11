const express = require('express');
const router = express.Router();
const { checkUserExists } = require('../controllers/userController');
const { protect } = require('../middleware/auth');

// Ruta para verificar si un usuario existe
router.get('/check/:email', protect, checkUserExists);

module.exports = router;