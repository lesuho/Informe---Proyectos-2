const jwt = require('jsonwebtoken');
const User = require('../models/User');

const protect = async (req, res, next) => {
  let token;

  // Verificar si hay token en cookies
  if (req.cookies && req.cookies.token) {
    token = req.cookies.token;
  } 
  // Verificar si hay token en los headers (mantener para compatibilidad)
  else if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    return res.status(401).json({ message: 'No autorizado, no se proporcionó token' });
  }

  try {
    // Verificar token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Obtener usuario del token
    req.user = await User.findById(decoded.id).select('-password');
    
    if (!req.user) {
      return res.status(401).json({ message: 'Usuario no encontrado' });
    }

    next();
  } catch (error) {
    console.error(error);
    res.status(401).json({ message: 'No autorizado, token inválido' });
  }
};

module.exports = { protect };