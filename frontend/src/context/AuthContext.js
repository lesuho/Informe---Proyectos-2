import React, { createContext, useState, useEffect } from 'react';
import api from '../config/axios';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Verificar si hay un usuario en localStorage al cargar la aplicación
    const storedUser = localStorage.getItem('user');
    
    if (storedUser) {
      try {
        const parsedUser = JSON.parse(storedUser);
        setUser(parsedUser);
        
        // Configurar el token para todas las solicitudes
        if (parsedUser.token) {
          api.defaults.headers.common['Authorization'] = `Bearer ${parsedUser.token}`;
        }
      } catch (error) {
        console.error('Error al parsear el usuario almacenado:', error);
        localStorage.removeItem('user');
      }
    }
    
    setLoading(false);
  }, []);

  // Función para cerrar sesión
  const logout = () => {
    localStorage.removeItem('user');
    localStorage.removeItem('token');
    setUser(null);
    delete api.defaults.headers.common['Authorization'];
  };

  return (
    <AuthContext.Provider value={{ user, setUser, loading, logout }}>
      {children}
    </AuthContext.Provider>
  );
};