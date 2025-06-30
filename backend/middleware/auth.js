const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Role = require('../models/Role');

const protect = async (req, res, next) => {
  console.log('\n=== MIDDLEWARE DE AUTENTICACIÓN INICIADO ===');
  console.log('URL:', req.originalUrl);
  console.log('Método:', req.method);
  console.log('Headers:', {
    authorization: req.headers.authorization ? 'Presente' : 'No presente',
    cookie: req.headers.cookie ? 'Presente' : 'No presente'
  });
  
  let token;

  // Verificar si hay token en cookies
  if (req.cookies?.token) {
    token = req.cookies.token;
    console.log('✅ Token encontrado en cookies');
  } 
  // Verificar si hay token en los headers (mantener para compatibilidad)
  else if (req.headers.authorization?.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
    console.log('✅ Token encontrado en headers de autorización');
  }
  
  console.log('🔍 Token encontrado:', token ? 'Sí' : 'No');

  if (!token) {
    console.error('Error: No se proporcionó token de autenticación');
    return res.status(401).json({ 
      success: false,
      message: 'No autorizado, no se proporcionó token',
      error: 'MISSING_TOKEN'
    });
  }

  try {
    console.log('🔐 Verificando token JWT...');
    
    // Verificar que el token sea una cadena
    if (typeof token !== 'string') {
      console.error('❌ Error: El token no es una cadena válida');
      return res.status(401).json({
        success: false,
        message: 'Token inválido',
        error: 'INVALID_TOKEN_FORMAT'
      });
    }
    
    // Verificar que el token tenga el formato correcto
    if (!/^[A-Za-z0-9-_=]+\.[A-Za-z0-9-_=]+\.?[A-Za-z0-9-_.+/=]*$/.test(token)) {
      console.error('❌ Error: Formato de token inválido');
      return res.status(401).json({
        success: false,
        message: 'Formato de token inválido',
        error: 'INVALID_TOKEN_FORMAT'
      });
    }
    
    // Verificar token
    console.log('🔑 Token a verificar:', token);
    console.log('🔑 JWT_SECRET:', process.env.JWT_SECRET ? 'Definido' : 'No definido');
    
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    console.log('✅ Token decodificado correctamente:', {
      id: decoded.id,
      iat: decoded.iat ? new Date(decoded.iat * 1000).toISOString() : 'No disponible',
      exp: decoded.exp ? new Date(decoded.exp * 1000).toISOString() : 'No disponible'
    });

    if (!decoded?.id) {
      console.error('❌ Error: Token inválido - Falta el ID de usuario');
      return res.status(401).json({
        success: false,
        message: 'Token inválido - Falta el ID de usuario',
        error: 'INVALID_TOKEN_PAYLOAD'
      });
    }

    // Obtener usuario del token
    console.log('🔍 Buscando usuario con ID:', decoded.id);
    const user = await User.findById(decoded.id).select('-password');
    
    if (!user) {
      console.error(`❌ Error: Usuario con ID ${decoded.id} no encontrado`);
      return res.status(401).json({
        success: false,
        message: 'Usuario no encontrado',
        error: 'USER_NOT_FOUND'
      });
    }
    
    req.user = user;
    console.log(`✅ Usuario autenticado: ${user.email} (${user._id})`);
    
    if (!req.user) {
      console.error('Error: Usuario no encontrado para el token proporcionado');
      return res.status(401).json({ 
        success: false,
        message: 'Usuario no encontrado',
        error: 'USER_NOT_FOUND'
      });
    }

    console.log('Usuario autenticado:', { id: req.user._id, email: req.user.email });
    next();
  } catch (error) {
    console.error('Error en la autenticación:', error);
    
    let errorMessage = 'Error de autenticación';
    let errorCode = 'AUTH_ERROR';
    
    if (error.name === 'JsonWebTokenError') {
      errorMessage = 'Token inválido';
      errorCode = 'INVALID_TOKEN';
    } else if (error.name === 'TokenExpiredError') {
      errorMessage = 'Token expirado';
      errorCode = 'TOKEN_EXPIRED';
    }
    
    res.status(401).json({ 
      success: false,
      message: errorMessage,
      error: errorCode,
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// Middleware para verificar si el usuario es administrador
const admin = async (req, res, next) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: 'No autorizado' });
    }

    // Verificar si el usuario tiene el rol de administrador
    if (req.user.isAdmin) {
      next();
    } else {
      res.status(403).json({ message: 'No tienes permiso para realizar esta acción' });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error del servidor' });
  }
};

// Middleware para verificar permisos basados en roles
const checkRolePermission = (requiredPermission) => {
  return async (req, res, next) => {
    try {
      if (!req.user) {
        return res.status(401).json({ message: 'No autorizado' });
      }

      // Si el usuario es administrador, tiene todos los permisos
      if (req.user.isAdmin) {
        return next();
      }

      // Si el usuario tiene un rol asignado, verificar los permisos
      if (req.user.role) {
        const role = await Role.findById(req.user.role);
        if (role && role.permissions && role.permissions[requiredPermission]) {
          return next();
        }
      }

      // Si no tiene los permisos necesarios
      res.status(403).json({ message: 'No tienes permiso para realizar esta acción' });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Error del servidor' });
    }
  };
};

module.exports = { protect, admin, checkRolePermission };