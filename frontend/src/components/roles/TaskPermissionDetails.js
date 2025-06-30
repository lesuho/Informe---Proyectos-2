import React, { useState, useEffect, forwardRef, useImperativeHandle, useCallback } from 'react';
import { taskPermissionService } from '../../services/roleService';
import { toast } from 'react-toastify';
import { FaUserEdit, FaUserShield, FaUserSlash, FaUsers } from 'react-icons/fa';

const TaskPermissionDetails = forwardRef(({ taskId, onRemoveUser, isOwner, currentUserId }, ref) => {
  const [permissions, setPermissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchPermissions = useCallback(async () => {
    if (!taskId) return;
    
    try {
      setLoading(true);
      setError(null);
      const data = await taskPermissionService.getTaskPermissions(taskId);
      setPermissions(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Error fetching task permissions:', error);
      // No mostrar toast aquí, el componente padre ya podría estar gestionando errores.
      setError('No se pudieron cargar los permisos.');
    } finally {
      setLoading(false);
    }
  }, [taskId]);

  useEffect(() => {
    fetchPermissions();
  }, [fetchPermissions]);

  useImperativeHandle(ref, () => ({
    refetch() {
      fetchPermissions();
    }
  }));

  const getRoleInfo = (role) => {
    switch (role) {
      case 'editor':
        return { 
          description: 'Editor',
          icon: <FaUserEdit className="text-blue-500" />,
          className: 'bg-blue-100 text-blue-800 dark:bg-blue-900/50 dark:text-blue-300'
        };
      case 'lector':
        return {
          description: 'Lector',
          icon: <FaUserShield className="text-green-500" />,
          className: 'bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-300'
        };
      default:
        return {
          description: role,
          icon: null,
          className: 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'
        };
    }
  };

  if (loading) {
        return (
      <div className="flex justify-center items-center py-4">
        <div className="spinner-sm"></div>
        <span className="ml-3 text-content-secondary">Cargando permisos...</span>
      </div>
        );
  }

  if (error) {
        return (
      <div className="text-center py-6 text-red-500">
        <p>{error}</p>
      </div>
        );
    }

  // Filtrar el usuario actual de la lista si no es el propietario
  const filteredPermissions = isOwner 
    ? permissions 
    : permissions.filter(p => p.user?._id !== currentUserId);

  return (
    <div className="space-y-3">
      {filteredPermissions.length === 0 ? (
        <div className="text-center py-8 text-content-secondary bg-background-secondary rounded-lg">
          <FaUsers className="mx-auto text-4xl opacity-50 mb-3" />
          <p className="font-semibold">{isOwner ? 'Aún no has compartido esta tarea.' : 'No hay otros usuarios con acceso.'}</p>
          <p className="text-sm">{isOwner ? 'Usa el botón de arriba para invitar a otros.' : 'El propietario puede añadir más colaboradores.'}</p>
        </div>
      ) : (
        <ul className="space-y-3">
          {filteredPermissions.map((permission) => {
            const roleInfo = getRoleInfo(permission.role);
            return (
              <li key={permission._id} className="flex flex-wrap items-center justify-between gap-2 p-3 rounded-lg bg-background-secondary hover:bg-background-tertiary transition-colors">
                <div className="flex items-center space-x-3">
                  <div className="flex-shrink-0 h-10 w-10 bg-gradient-to-br from-primary to-primary-focus rounded-full flex items-center justify-center shadow">
                    <span className="text-white font-bold text-lg">
                      {permission.user?.name?.charAt(0).toUpperCase() || permission.user?.email?.charAt(0).toUpperCase() || '?'}
                  </span>
                  </div>
                  <div>
                    <p className="font-semibold text-content">
                      {permission.user?.name || permission.user?.email}
                    </p>
                    <p className="text-sm text-content-secondary">
                      {permission.user?.name && permission.user?.email}
                    </p>
                  </div>
                </div>
              
                <div className="flex items-center space-x-4">
                   <div className={`px-2 py-1 text-xs font-medium rounded-full flex items-center gap-1.5 ${roleInfo.className}`}>
                      {roleInfo.icon}
                      <span>{roleInfo.description}</span>
                </div>
                   {isOwner && onRemoveUser && (
                     <button 
                       onClick={() => onRemoveUser(permission.user._id)}
                       className="btn btn-ghost btn-icon text-red-500 hover:bg-red-500/10"
                       title="Quitar acceso"
                     >
                       <FaUserSlash />
                     </button>
                   )}
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
});

export default TaskPermissionDetails;
