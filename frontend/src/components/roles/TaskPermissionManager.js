import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import { taskPermissionService } from '../../services/roleService';

const TaskPermissionManager = ({ taskId, onClose, onPermissionsUpdated }) => {
  const [permissions, setPermissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [newUser, setNewUser] = useState({ email: '', role: 'lector' });

  useEffect(() => {
    const fetchPermissions = async () => {
      try {
        setLoading(true);
        const data = await taskPermissionService.getTaskPermissions(taskId);
        setPermissions(data);
      } catch (err) {
        setError('No se pudieron cargar los permisos.');
        toast.error('No se pudieron cargar los permisos.');
      } finally {
        setLoading(false);
      }
    };
    fetchPermissions();
  }, [taskId]);

  const handleUpdateAndRefetch = async (apiCall, successMessage) => {
    setIsSubmitting(true);
    try {
      await apiCall();
      toast.success(successMessage);
      const data = await taskPermissionService.getTaskPermissions(taskId);
      setPermissions(data);
      if (onPermissionsUpdated) onPermissionsUpdated();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Ocurrió un error.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleAddPermission = (e) => {
    e.preventDefault();
    if (!newUser.email) return;
    handleUpdateAndRefetch(
      () => taskPermissionService.addTaskPermission(taskId, newUser.email, newUser.role),
      'Permiso añadido correctamente.'
    );
    setNewUser({ email: '', role: 'lector' });
  };

  const handleUpdatePermission = (permissionId, newRole) => {
    handleUpdateAndRefetch(
      () => taskPermissionService.updateTaskPermission(taskId, permissionId, newRole),
      'Permiso actualizado.'
    );
  };

  const handleDeletePermission = (permissionId) => {
    if (!window.confirm('¿Eliminar este permiso?')) return;
    handleUpdateAndRefetch(
      () => taskPermissionService.deleteTaskPermission(taskId, permissionId),
      'Permiso eliminado.'
    );
  };
      
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewUser(prev => ({ ...prev, [name]: value }));
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center p-4 z-50">
      <div className="modal">
        <div className="card w-full max-w-lg p-6">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-xl font-semibold text-content">Gestionar Permisos</h3>
            <button onClick={onClose} className="text-content-secondary hover:text-content text-2xl">&times;</button>
          </div>
          
          <div className="space-y-6">
            <form onSubmit={handleAddPermission}>
              <fieldset className="card p-4 space-y-3">
                <legend className="font-medium text-content">Añadir nuevo usuario</legend>
                <div className="form-control grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <input
                    type="email"
                    name="email"
                    value={newUser.email}
                    onChange={handleInputChange}
                    className="input"
                    placeholder="correo@ejemplo.com"
                    required
                  />
                  <select
                    name="role"
                    value={newUser.role}
                    onChange={handleInputChange}
                    className="input"
                  >
                    <option value="lector">Lector</option>
                    <option value="editor">Editor</option>
                  </select>
                </div>
                <button type="submit" className="btn btn-primary w-full" disabled={isSubmitting}>
                  {isSubmitting ? 'Añadiendo...' : 'Añadir Permiso'}
                </button>
              </fieldset>
            </form>
            
            <div className="space-y-3">
              <h4 className="font-medium text-content">Usuarios con acceso</h4>
              {loading ? <p className="text-content-secondary text-center py-4">Cargando...</p> : 
               error ? <p className="text-red-500 text-center py-4">{error}</p> :
               permissions.length === 0 ? (
                  <div className="text-center py-6 text-content-secondary bg-gray-100 dark:bg-dark-bg-tertiary rounded-lg">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mx-auto mb-2 opacity-50" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                      <p>Nadie tiene acceso a esta tarea.</p>
                </div>
              ) : (
                <div className="space-y-2 max-h-64 overflow-y-auto pr-2">
                  {permissions.map((p) => (
                    <div key={p._id} className="card flex items-center justify-between p-3">
                      <span className="text-content-secondary">{p.user?.email || 'ID: ' + p.userId}</span>
                      <div className="flex items-center gap-2">
                          <select
                          value={p.role} 
                          onChange={(e) => handleUpdatePermission(p._id, e.target.value)}
                          className="input input-sm"
                          disabled={isSubmitting}
                          >
                            <option value="lector">Lector</option>
                            <option value="editor">Editor</option>
                          </select>
                        <button onClick={() => handleDeletePermission(p._id)} className="btn btn-icon text-red-500 hover:text-red-600 disabled:opacity-50" disabled={isSubmitting}>
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" /></svg>
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TaskPermissionManager;
