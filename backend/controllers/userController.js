const asyncHandler = require('express-async-handler');
const User = require('../models/User');

// @desc    Obtener todos los usuarios
// @route   GET /api/users
// @access  Private
const getUsers = asyncHandler(async (req, res) => {
  const users = await User.find({ _id: { $ne: req.user._id } })
    .select('name email')
    .sort({ name: 1 });
  
  res.json(users);
});

// @desc    Obtener perfil del usuario actual
// @route   GET /api/users/profile
// @access  Private
const getUserProfile = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id).select('-password');
  res.json(user);
});

// @desc    Actualizar perfil del usuario
// @route   PUT /api/users/profile
// @access  Private
const updateUserProfile = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);
  
  if (user) {
    user.name = req.body.name || user.name;
    user.email = req.body.email || user.email;
    
    if (req.body.password) {
      user.password = req.body.password;
    }
    
    const updatedUser = await user.save();
    
    res.json({
      _id: updatedUser._id,
      name: updatedUser.name,
      email: updatedUser.email,
    });
  } else {
    res.status(404);
    throw new Error('Usuario no encontrado');
  }
});

// @desc    Eliminar usuario
// @route   DELETE /api/users/:id
// @access  Private
const deleteUser = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id);
  
  if (user) {
    await user.remove();
    res.json({ message: 'Usuario eliminado' });
  } else {
    res.status(404);
    throw new Error('Usuario no encontrado');
  }
});

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

module.exports = {
  getUsers,
  getUserProfile,
  updateUserProfile,
  deleteUser,
  checkUserExists
};