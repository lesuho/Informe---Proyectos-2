import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import { roleService } from '../../services/roleService';

const RoleForm = ({ role, onClose, onRoleUpdated }) => {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    permissions: {
      createTask: false,
      updateTask: false,
      deleteTask: false,
      assignTask: false,
      viewAllTasks: false,
      manageUsers: false
    }
  });
  const [loading, setLoading] = useState(false);

  // Si se está editando un rol, cargar sus datos
  useEffect(() => {
    if (role) {
      setFormData({
        name: role.name || '',
        description: role.description || '',
        permissions: {
          createTask: role.permissions?.createTask || false,
          updateTask: role.permissions?.updateTask || false,
          deleteTask: role.permissions?.deleteTask || false,
          assignTask: role.permissions?.assignTask || false,
          viewAllTasks: role.permissions?.viewAllTasks || false,
          manageUsers: role.permissions?.manageUsers || false
        }
      });
    }
  }, [role]);

  // Manejar cambios en los campos del formulario
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prevState => ({
      ...prevState,
      [name]: value
    }));
  };

  // Manejar cambios en los permisos (checkboxes)
  const handlePermissionChange = (e) => {
    const { name, checked } = e.target;
    setFormData(prevState => ({
      ...prevState,
      permissions: {
        ...prevState.permissions,
        [name]: checked
      }
    }));
  };

  // Enviar el formulario
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.name) {
      toast.error('El nombre del rol es obligatorio');
      return;
    }
    
    try {
      setLoading(true);
      
      if (role) {
        // Actualizar rol existente
        await roleService.updateRole(role._id, formData);
        toast.success('Rol actualizado correctamente');
      } else {
        // Crear nuevo rol
        await roleService.createRole(formData);
        toast.success('Rol creado correctamente');
      }
      
      if (onRoleUpdated) {
        onRoleUpdated();
      }
    } catch (error) {
      console.error('Error al guardar el rol:', error);
      toast.error('Error al guardar el rol: ' + (error.response?.data?.message || error.message));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="modal">
        <div className="card w-full max-w-md">
          <div className="p-6">
            <h3 className="text-xl font-semibold text-content mb-4">
              {role ? 'Editar Rol' : 'Crear Nuevo Rol'}
            </h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-content-secondary mb-1">
                  Nombre del Rol
                </label>
                <input
                  id="name"
                  name="name"
                  type="text"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="Ej: Administrador, Editor, Lector"
                  required
                  className="input"
                />
              </div>
              
              <div>
                <label htmlFor="description" className="block text-sm font-medium text-content-secondary mb-1">
                  Descripción
                </label>
                <textarea
                  id="description"
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  placeholder="Describe las funciones de este rol"
                  rows="3"
                  className="input"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-content-secondary mb-2">
                  Permisos
                </label>
                <div className="space-y-2 bg-gray-100 dark:bg-dark-bg-tertiary p-3 rounded-md">
                  {Object.keys(formData.permissions).map((permission) => (
                    <div key={permission} className="flex items-center">
                      <input
                        id={permission}
                        name={permission}
                        type="checkbox"
                        checked={formData.permissions[permission]}
                        onChange={handlePermissionChange}
                        className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 dark:border-dark-border rounded bg-white dark:bg-dark-bg-secondary"
                      />
                      <label htmlFor={permission} className="ml-2 block text-sm text-content">
                        {permission.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
                      </label>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex justify-end space-x-3 pt-4">
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
                  className="btn btn-primary flex items-center"
                >
                  {loading ? (
                    <>
                      <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      <span>{role ? 'Actualizando...' : 'Creando...'}</span>
                    </>
                  ) : (
                    role ? 'Actualizar Rol' : 'Crear Rol'
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RoleForm;
