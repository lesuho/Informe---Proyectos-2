const User = require('../models/User');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const cookieOptions = require('../config/cookies');

// @desc    Registrar un nuevo usuario
// @route   POST /api/auth/register
// @access  Public
const register = async (req, res) => {
  try {
    console.log('Datos recibidos:', req.body);
    const { name, email, password } = req.body;

    // Verificar si todos los campos están presentes
    if (!name || !email || !password) {
      return res.status(400).json({ message: 'Por favor proporciona todos los campos requeridos' });
    }

    // Verificar si el usuario ya existe
    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ message: 'El usuario ya existe' });
    }

    // Crear nuevo usuario con username derivado del email
    const user = new User({
      name,
      email,
      username: email.split('@')[0], // Usar la parte del email antes de @ como username
      password
    });

    // Guardar usuario en la base de datos
    const savedUser = await user.save();
    console.log('Usuario guardado:', savedUser);

    // Generar token JWT
    const token = jwt.sign(
      { id: user._id },
      process.env.JWT_SECRET,
      { expiresIn: '30d' }
    );

    // Establecer cookie con el token usando la configuración centralizada
    res.cookie('token', token, cookieOptions);

    // Responder con datos del usuario y token
    res.status(201).json({
      _id: user._id,
      name: user.name,
      email: user.email,
      token
    });
  } catch (error) {
    console.error('Error en registro:', error);
    res.status(500).json({ message: 'Error del servidor: ' + error.message });
  }
};

// @desc    Autenticar usuario / obtener token
// @route   POST /api/auth/login
// @access  Public
const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Verificar si el usuario existe
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ message: 'Credenciales inválidas' });
    }

    // Verificar contraseña
    const isMatch = await user.matchPassword(password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Credenciales inválidas' });
    }

    // Generar token JWT
    const token = jwt.sign(
      { id: user._id },
      process.env.JWT_SECRET,
      { expiresIn: '30d' }
    );

    // Establecer cookie con el token usando la configuración centralizada
    res.cookie('token', token, cookieOptions);

    // Responder con datos del usuario y token
    res.json({
      _id: user._id,
      name: user.name,
      email: user.email,
      token
    });
  } catch (error) {
    console.error('Error en login:', error);
    res.status(500).json({ message: 'Error del servidor' });
  }
};

// @desc    Obtener datos del usuario actual
// @route   GET /api/auth/me
// @access  Private
const getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('-password');
    res.json(user);
  } catch (error) {
    console.error('Error al obtener usuario:', error);
    res.status(500).json({ message: 'Error del servidor' });
  }
};

// @desc    Cerrar sesión
// @route   POST /api/auth/logout
// @access  Public
const logout = (req, res) => {
  res.cookie('token', '', {
    ...cookieOptions,
    expires: new Date(0)
  });
  res.status(200).json({ message: 'Sesión cerrada correctamente' });
};

// Exportar funciones
module.exports = {
  register,
  login,
  getMe,
  logout
};
