import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import { userRoleService, roleService } from '../../services/roleService';

const UserRoleManager = () => {
  const [users, setUsers] = useState([]);
  const [roles, setRoles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Cargar usuarios y roles al montar el componente
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // Obtener usuarios y roles en paralelo
        const [users, roles] = await Promise.all([
          userRoleService.getAllUsers(),
          roleService.getAllRoles()
        ]);
        
        setUsers(users);
        setRoles(roles);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching data:', error);
        setError('Error al cargar los datos: ' + (error.response?.data?.message || error.message));
        setLoading(false);
        toast.error('Error al cargar los datos');
      }
    };
    
    fetchData();
  }, []);

  // Función para actualizar el rol de un usuario
  const handleUpdateUserRole = async (userId, roleId) => {
    try {
      await userRoleService.updateUserRole(userId, roleId);
      
      // Actualizar el estado local para reflejar el cambio
      setUsers(users.map(user => 
        user._id === userId 
          ? { ...user, role: roleId } 
          : user
      ));
      
      toast.success('Rol de usuario actualizado correctamente');
    } catch (error) {
      console.error('Error al actualizar rol de usuario:', error);
      toast.error('Error al actualizar rol: ' + (error.response?.data?.message || error.message));
    }
  };

  // Función para actualizar el estado de administrador de un usuario
  const handleToggleAdmin = async (userId, isCurrentlyAdmin) => {
    try {
      await userRoleService.updateUserAdminStatus(userId, !isCurrentlyAdmin);
      
      // Actualizar el estado local para reflejar el cambio
      setUsers(users.map(user => 
        user._id === userId 
          ? { ...user, isAdmin: !isCurrentlyAdmin } 
          : user
      ));
      
      toast.success(`Usuario ${!isCurrentlyAdmin ? 'promovido a' : 'removido de'} administrador`);
    } catch (error) {
      console.error('Error al actualizar estado de administrador:', error);
      toast.error('Error al actualizar estado: ' + (error.response?.data?.message || error.message));
    }
  };

  if (loading) return <div className="min-h-screen flex justify-center items-center"><div className="spinner"></div></div>;
  if (error) return <div className="container mx-auto py-8"><div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">{error}</div></div>;

  return (
    <div className="container mx-auto py-8">
      <div className="max-w-4xl mx-auto">
        <h2 className="text-3xl font-extrabold text-content mb-6">
          Gestión de Usuarios y Roles
        </h2>

        <div className="card p-0 overflow-hidden">
          {users.length === 0 ? (
            <div className="text-center text-content-secondary py-8">
              No hay usuarios disponibles
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200 dark:divide-dark-border">
                <thead className="bg-gray-50 dark:bg-dark-bg-tertiary">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-content-secondary uppercase tracking-wider">Usuario</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-content-secondary uppercase tracking-wider">Rol</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-content-secondary uppercase tracking-wider">Administrador</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 dark:divide-dark-border">
                  {users.map((user) => (
                    <tr key={user._id} className="hover:bg-gray-100 dark:hover:bg-dark-bg-tertiary transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-content">{user.name}</div>
                        <div className="text-sm text-content-secondary">{user.email}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <select
                          value={user.role?._id || ''}
                          onChange={(e) => handleUpdateUserRole(user._id, e.target.value)}
                          className="input input-sm py-1"
                        >
                          <option value="">Sin rol asignado</option>
                          {roles.map((role) => (
                            <option key={role._id} value={role._id}>
                              {role.name}
                            </option>
                          ))}
                        </select>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <button
                          onClick={() => handleToggleAdmin(user._id, user.isAdmin)}
                          className={`btn btn-sm ${
                            user.isAdmin
                              ? 'bg-red-600 hover:bg-red-700 text-white'
                              : 'bg-green-600 hover:bg-green-700 text-white'
                          }`}
                        >
                          {user.isAdmin ? 'Quitar Admin' : 'Hacer Admin'}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default UserRoleManager;
