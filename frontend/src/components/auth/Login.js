import React, { useState, useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../../config/axios';
import { toast } from 'react-toastify';
import { AuthContext } from '../../context/AuthContext';

const Login = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [loading, setLoading] = useState(false);
  const { setUser } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await api.post('/auth/login', formData);

      // Asegurarse de que la respuesta tenga el formato esperado
      const userData = response.data;
      
      // Configurar el token para futuras solicitudes
      if (userData.token) {
        localStorage.setItem('token', userData.token);
        api.defaults.headers.common['Authorization'] = `Bearer ${userData.token}`;
      }

      // Guardar el token y la información del usuario en localStorage
      localStorage.setItem('user', JSON.stringify(userData));
      
      // Actualizar el contexto de autenticación
      setUser(userData);
      
      toast.success('Inicio de sesión exitoso');
      navigate('/tasks'); // Cambiado de '/dashboard' a '/tasks'
    } catch (error) {
      console.error('Error de inicio de sesión:', error);
      toast.error(error.response?.data?.message || 'Error al iniciar sesión');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-dark-bg-primary p-4">
      <div className="card w-full max-w-md">
        <div className="text-center">
          <h2 className="text-3xl font-extrabold text-content mb-2">
            Iniciar sesión
          </h2>
          <p className="text-content-secondary">
            Bienvenido de nuevo
          </p>
        </div>
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="space-y-4">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-content-secondary mb-1">
                Correo electrónico
              </label>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                className="input"
                placeholder="ejemplo@correo.com"
                value={formData.email}
                onChange={handleChange}
              />
            </div>
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-content-secondary mb-1">
                Contraseña
              </label>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="current-password"
                required
                className="input"
                placeholder="Mínimo 6 caracteres"
                value={formData.password}
                onChange={handleChange}
              />
            </div>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <input
                id="remember-me"
                name="remember-me"
                type="checkbox"
                className="h-4 w-4 text-primary-600 dark:text-primary-400 focus:ring-primary-500 border-gray-300 dark:border-dark-border rounded bg-gray-50 dark:bg-dark-bg-tertiary"
              />
              <label htmlFor="remember-me" className="ml-2 block text-sm text-content-secondary">
                Recordarme
              </label>
            </div>

            <div className="text-sm">
              <a href="#" className="font-medium text-primary-600 hover:text-primary-500 dark:text-primary-400 dark:hover:text-primary-300 transition-colors">
                ¿Olvidaste tu contraseña?
              </a>
            </div>
          </div>

          <div>
            <button
              type="submit"
              disabled={loading}
              className={`w-full flex justify-center btn btn-primary ${loading ? 'opacity-70 cursor-not-allowed' : ''}`}
            >
              {loading ? (
                <span className="flex items-center">
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Iniciando sesión...
                </span>
              ) : 'Iniciar sesión'}
            </button>

            <div className="mt-6 text-center">
              <p className="text-sm text-content-secondary">
                ¿No tienes una cuenta?{' '}
                <Link to="/register" className="font-medium text-primary-600 hover:text-primary-500 dark:text-primary-400 dark:hover:text-primary-300 transition-colors">
                  Regístrate
                </Link>
              </p>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Login;