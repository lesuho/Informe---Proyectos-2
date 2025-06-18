import React, { useState } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import './ShareTask.css';

const ShareTask = ({ taskId, onClose, onShare }) => {
  const [email, setEmail] = useState('');
  const [role, setRole] = useState('lector');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!email) {
      toast.error('Por favor ingresa un correo electrónico');
      return;
    }
    
    try {
      setLoading(true);
      
      const token = JSON.parse(localStorage.getItem('user')).token;
      
      const config = {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        withCredentials: true
      };
      
      console.log('Compartiendo tarea con ID:', taskId);
      const response = await axios.post(
        `/api/tasks/${taskId}/share`,
        { email, role },
        config
      );
      
      // Actualizar la lista de usuarios compartidos en el componente padre
      if (onShare) {
        onShare(response.data);
      }
      
      toast.success('Tarea compartida exitosamente');
      onClose();
    } catch (error) {
      console.error('Error al compartir tarea:', error);
      
      if (error.response && error.response.data) {
        if (error.response.data.message === 'La tarea ya está compartida con este usuario') {
          toast.info('Esta tarea ya ha sido compartida con este usuario');
        } else if (error.response.data.message === 'Usuario no encontrado') {
          toast.warning('El usuario con este correo no existe en el sistema');
        } else {
          toast.error(error.response.data.message || 'Error al compartir tarea');
        }
      } else {
        toast.error('Error al compartir tarea. Por favor intenta nuevamente.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white dark:bg-dark-bg-secondary rounded-lg shadow-xl w-full max-w-md transform transition-all">
        <div className="p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-dark-text-primary mb-4">Compartir Tarea</h3>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-dark-text-secondary mb-1">
                Correo electrónico
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="usuario@ejemplo.com"
                required
                className="input"
              />
            </div>
            
            <div>
              <label htmlFor="role" className="block text-sm font-medium text-gray-700 dark:text-dark-text-secondary mb-1">
                Rol del usuario
              </label>
              <select
                id="role"
                value={role}
                onChange={(e) => setRole(e.target.value)}
                className="input"
              >
                <option value="lector">Lector</option>
                <option value="editor">Editor</option>
              </select>
            </div>

            <div className="flex justify-end space-x-3 mt-6">
              <button
                type="button"
                onClick={onClose}
                className="btn btn-secondary"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={loading}
                className="btn btn-primary"
              >
                {loading ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white inline-block" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Compartiendo...
                  </>
                ) : 'Compartir Tarea'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ShareTask;