import axios from 'axios';

const instance = axios.create({
    baseURL: 'http://localhost:4000/api',
    withCredentials: true,
    headers: {
        'Content-Type': 'application/json',
    }
});

// Interceptor para agregar el token a todas las peticiones
instance.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Interceptor para manejar errores de respuesta
instance.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response) {
            // El servidor respondió con un código de estado fuera del rango 2xx
            console.error('Error de respuesta:', error.response.data);
            return Promise.reject(error.response.data);
        } else if (error.request) {
            // La petición fue hecha pero no se recibió respuesta
            console.error('Error de red:', error.request);
            return Promise.reject({ message: 'Error de conexión al servidor' });
        } else {
            // Algo pasó en la configuración de la petición que lanzó un error
            console.error('Error:', error.message);
            return Promise.reject({ message: 'Error en la petición' });
        }
    }
);

export default instance;