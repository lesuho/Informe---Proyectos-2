const User = require('../models/User');

// @desc    Verificar si un usuario existe por correo electrónico
// @route   GET /api/users/check/:email
// @access  Private
const checkUserExists = async (req, res) => {
  try {
    const email = req.params.email;
    
    // Buscar usuario por correo electrónico
    const user = await User.findOne({ email });
    
    if (user) {
      return res.status(200).json({ exists: true, userId: user._id });
    } else {
      return res.status(404).json({ exists: false, message: 'Usuario no encontrado' });
    }
  } catch (error) {
    console.error('Error al verificar usuario:', error);
    res.status(500).json({ message: 'Error del servidor' });
  }
};

// Asegúrate de exportar la función
module.exports = {
  checkUserExists
};