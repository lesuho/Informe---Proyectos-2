import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import { roleService } from '../../services/roleService';
import RoleForm from './RoleForm';

const RoleList = () => {
  const [roles, setRoles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingRole, setEditingRole] = useState(null);

  // Cargar roles al montar el componente
  useEffect(() => {
    fetchRoles();
  }, []);

  // Función para obtener todos los roles
  const fetchRoles = async () => {
    try {
      setLoading(true);
      const data = await roleService.getAllRoles();
      setRoles(data);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching roles:', error);
      setError('Error al cargar los roles: ' + (error.response?.data?.message || error.message));
      setLoading(false);
      toast.error('Error al cargar los roles');
    }
  };

  // Función para eliminar un rol
  const handleDeleteRole = async (roleId) => {
    if (!window.confirm('¿Estás seguro de que deseas eliminar este rol?')) {
      return;
    }
    
    try {
      await roleService.deleteRole(roleId);
      toast.success('Rol eliminado correctamente');
      // Actualizar la lista de roles
      fetchRoles();
    } catch (error) {
      console.error('Error al eliminar el rol:', error);
      toast.error('Error al eliminar el rol: ' + (error.response?.data?.message || error.message));
    }
  };

  // Función para editar un rol
  const handleEditRole = (role) => {
    setEditingRole(role);
    setShowCreateModal(true);
  };

  // Función para cerrar el modal y limpiar el estado de edición
  const handleCloseModal = () => {
    setShowCreateModal(false);
    setEditingRole(null);
  };

  // Función para actualizar la lista después de crear o editar un rol
  const handleRoleUpdated = () => {
    fetchRoles();
    handleCloseModal();
  };

  if (loading) return <div className="text-center p-8">Cargando roles...</div>;
  if (error) return <div className="container mx-auto py-8"><div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">{error}</div></div>;

  return (
    <div className="container mx-auto py-8">
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-3xl font-extrabold text-content">
            Gestión de Roles
          </h2>
          <button
            onClick={() => {
              setEditingRole(null);
              setShowCreateModal(true);
            }}
            className="btn btn-primary flex items-center"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z" clipRule="evenodd" />
            </svg>
            Crear Rol
          </button>
        </div>

        {roles.length === 0 ? (
          <div className="card text-center p-8">
            <p className="text-content-secondary">No hay roles disponibles. Crea uno nuevo para comenzar.</p>
          </div>
        ) : (
          <div className="card p-0 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200 dark:divide-dark-border">
                <thead className="bg-gray-50 dark:bg-dark-bg-tertiary">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-content-secondary uppercase tracking-wider">Nombre</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-content-secondary uppercase tracking-wider">Descripción</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-content-secondary uppercase tracking-wider">Permisos</th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-content-secondary uppercase tracking-wider">Acciones</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 dark:divide-dark-border">
                  {roles.map((role) => (
                    <tr key={role._id} className="hover:bg-gray-100 dark:hover:bg-dark-bg-tertiary transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-content">{role.name}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-content-secondary">{role.description}</td>
                      <td className="px-6 py-4 text-sm text-content-secondary">
                        <div className="flex flex-wrap gap-2">
                          {role.permissions && Object.entries(role.permissions)
                            .filter(([_, value]) => value === true)
                            .map(([key]) => (
                              <span key={key} className="px-2 py-1 bg-primary-100 text-primary-800 dark:bg-primary-900/50 dark:text-primary-300 rounded-full text-xs font-medium">
                                {key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
                              </span>
                            ))
                          }
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <button
                          onClick={() => handleEditRole(role)}
                          className="font-medium text-primary-600 hover:text-primary-500 dark:text-primary-400 dark:hover:text-primary-300 transition-colors mr-4"
                        >
                          Editar
                        </button>
                        <button
                          onClick={() => handleDeleteRole(role._id)}
                          className="font-medium text-red-600 hover:text-red-500 dark:text-red-400 dark:hover:text-red-300 transition-colors"
                        >
                          Eliminar
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {showCreateModal && (
          <RoleForm
            role={editingRole}
            onClose={handleCloseModal}
            onRoleUpdated={handleRoleUpdated}
          />
        )}
      </div>
    </div>
  );
};

export default RoleList;
