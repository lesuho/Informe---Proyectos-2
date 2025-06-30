import React, { useState, useEffect } from 'react';
import { taskPermissionService } from '../../services/roleService';
import { toast } from 'react-toastify';

const TaskPermissionDetails = ({ taskId }) => {
  const [permissions, setPermissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchPermissions = async () => {
      if (!taskId) return;
      
      try {
        setLoading(true);
        console.log(`Obteniendo permisos para la tarea ${taskId}`);
        const data = await taskPermissionService.getTaskPermissions(taskId);
        console.log('Permisos obtenidos:', data);
        setPermissions(Array.isArray(data) ? data : []);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching task permissions:', error);
        setError('Error al cargar los permisos: ' + (error.response?.data?.message || error.message));
        setLoading(false);
        
        // Solo mostrar toast si es un error diferente a 403 (no autorizado)
        if (error.response?.status !== 403) {
          toast.error('Error al cargar los permisos de la tarea');
        }
      }
    };

    fetchPermissions();
  }, [taskId]);

  // Función para obtener el texto descriptivo del rol
  const getRoleDescription = (role) => {
    switch (role) {
      case 'editor':
        return 'Editor (puede editar la tarea)';
      case 'lector':
        return 'Lector (solo puede ver la tarea)';
      default:
        return role;
    }
  };

  // Función para obtener el ícono del rol
  const getRoleIcon = (role) => {
    switch (role) {
      case 'editor':
        return (
          <svg className="w-5 h-5 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
          </svg>
        );
      case 'lector':
        return (
          <svg className="w-5 h-5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
          </svg>
        );
      default:
        return (
          <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
          </svg>
        );
    }
  };

  return (
    <div className="bg-gray-800 rounded-lg p-4 shadow-md">
      {loading ? (
        <div className="flex justify-center items-center py-3">
          <div className="animate-spin rounded-full h-6 w-6 border-t-2 border-b-2 border-purple-500"></div>
          <span className="ml-3 text-gray-400">Cargando permisos...</span>
        </div>
      ) : error ? (
        <div className="text-red-400 text-center p-3 border border-red-800 bg-red-900 bg-opacity-30 rounded-md">
          <svg className="w-5 h-5 mx-auto mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <p>{error}</p>
        </div>
      ) : permissions.length === 0 ? (
        <div className="text-center py-6 text-gray-400">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mx-auto mb-3 text-gray-500 opacity-50" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
          </svg>
          <p>No hay usuarios con acceso a esta tarea</p>
        </div>
      ) : (
        <div className="bg-gray-800/50 rounded-lg p-3 space-y-3">
          {permissions.map((permission) => (
            <div key={permission._id} className="flex items-center justify-between bg-gray-700/40 p-3 rounded-lg hover:bg-gray-700/60 transition-all duration-200">
              <div className="flex items-center">
                <div className="flex-shrink-0 h-10 w-10 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-full flex items-center justify-center shadow-lg">
                  <span className="text-white font-medium text-sm">
                    {permission.user && permission.user.name 
                      ? permission.user.name.charAt(0).toUpperCase()
                      : permission.user && permission.user.email 
                        ? permission.user.email.charAt(0).toUpperCase()
                        : '?'}
                  </span>
                </div>
                <div className="ml-3">
                  <div className="text-sm font-medium text-white">
                    {permission.user && permission.user.name 
                      ? permission.user.name 
                      : permission.user && permission.user.email 
                        ? permission.user.email 
                        : 'Usuario desconocido'}
                  </div>
                  <div className="text-xs text-gray-400">
                    {permission.user && permission.user.email 
                      ? permission.user.email 
                      : 'Email no disponible'}
                  </div>
                </div>
              </div>
              
              <div className="flex items-center space-x-3">
                <div className="flex items-center">
                  <div className="mr-2">
                    {getRoleIcon(permission.role)}
                  </div>
                  <span className={`px-2 py-1 inline-flex text-xs leading-4 font-medium rounded-full ${permission.role === 'editor' ? 'bg-purple-900/70 text-purple-300' : 'bg-blue-900/70 text-blue-300'}`}>
                    {getRoleDescription(permission.role)}
                  </span>
                </div>
                
                <div className="text-xs text-gray-400 hidden sm:block" title={new Date(permission.createdAt).toLocaleString()}>
                  {new Date(permission.createdAt).toLocaleDateString()}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default TaskPermissionDetails;
