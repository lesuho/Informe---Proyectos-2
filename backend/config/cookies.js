const isProduction = process.env.NODE_ENV === 'production';

const cookieOptions = {
  httpOnly: true,
  secure: isProduction, // Solo HTTPS en producción
  maxAge: 30 * 24 * 60 * 60 * 1000, // 30 días
  sameSite: isProduction ? 'strict' : 'lax', // Usar 'lax' en desarrollo para permitir cookies desde localhost
  domain: isProduction ? 'tudominio.com' : 'localhost' // Configurar el dominio según el entorno
};

module.exports = cookieOptions;
