import axios from 'axios';

// Crear instancia de axios con configuración base
const api = axios.create({
  baseURL: process.env.NODE_ENV === 'production' 
    ? '/api' 
    : 'http://localhost:5000/api',
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor para agregar el token de autenticación a cada solicitud
api.interceptors.request.use(
  (config) => {
    const user = JSON.parse(localStorage.getItem('user'));
    if (user?.token) {
      config.headers.Authorization = `Bearer ${user.token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Interceptor para manejar errores globales
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response) {
      // El servidor respondió con un código de estado fuera del rango 2xx
      console.error('Error de respuesta del servidor:', error.response.data);
      
      // Manejar errores de autenticación
      if (error.response.status === 401) {
        // Redirigir al login si el token es inválido o ha expirado
        localStorage.removeItem('user');
        window.location.href = '/login';
      }
    } else if (error.request) {
      // La solicitud fue hecha pero no se recibió respuesta
      console.error('No se recibió respuesta del servidor:', error.request);
    } else {
      // Algo más causó un error
      console.error('Error al configurar la solicitud:', error.message);
    }
    
    return Promise.reject(error);
  }
);

export default api;
