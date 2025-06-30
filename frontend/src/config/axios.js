import axios from 'axios';

const api = axios.create({
  baseURL: process.env.NODE_ENV === 'development' 
    ? 'http://localhost:5000/api' 
    : '/api',
  withCredentials: true
});

// Interceptor para manejar errores globalmente
api.interceptors.response.use(
  response => response,
  error => {
    if (error.response) {
      // El servidor respondió con un estado fuera del rango 2xx
      console.error('Error de respuesta:', error.response.status, error.response.data);
    } else if (error.request) {
      // La petición fue hecha pero no se recibió respuesta
      console.error('Error de red:', error.request);
    } else {
      // Algo sucedió al configurar la petición que desencadenó un error
      console.error('Error:', error.message);
    }
    return Promise.reject(error);
  }
);

export default api;
