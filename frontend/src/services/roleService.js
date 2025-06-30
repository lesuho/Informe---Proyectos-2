import axios from 'axios';

// Función auxiliar para obtener el token de autenticación
const getAuthConfig = () => {
  const user = JSON.parse(localStorage.getItem('user'));
  return {
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${user.token}`
    }
  };
};

// Servicios para roles
export const roleService = {
  // Obtener todos los roles
  getAllRoles: async () => {
    try {
      const response = await axios.get('/api/roles', getAuthConfig());
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Obtener un rol por su ID
  getRoleById: async (roleId) => {
    try {
      const response = await axios.get(`/api/roles/${roleId}`, getAuthConfig());
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Crear un nuevo rol
  createRole: async (roleData) => {
    try {
      const response = await axios.post('/api/roles', roleData, getAuthConfig());
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Actualizar un rol existente
  updateRole: async (roleId, roleData) => {
    try {
      const response = await axios.put(`/api/roles/${roleId}`, roleData, getAuthConfig());
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Eliminar un rol
  deleteRole: async (roleId) => {
    try {
      const response = await axios.delete(`/api/roles/${roleId}`, getAuthConfig());
      return response.data;
    } catch (error) {
      throw error;
    }
  }
};

// Servicios para permisos de tareas
export const taskPermissionService = {
  // Obtener permisos para una tarea
  getTaskPermissions: async (taskId) => {
    try {
      console.log(`Llamando a API para obtener permisos de tarea ${taskId}`);
      const config = getAuthConfig();
      console.log('Configuración de autenticación:', config);
      
      const response = await axios.get(`/api/task-permissions/${taskId}/permissions`, config);
      console.log(`Respuesta de permisos recibida:`, response.data);
      return response.data;
    } catch (error) {
      console.error(`Error al obtener permisos para tarea ${taskId}:`, error.response || error);
      throw error;
    }
  },

  // Añadir permiso a un usuario para una tarea
  addTaskPermission: async (taskId, email, role) => {
    try {
      const response = await axios.post(`/api/task-permissions/${taskId}/permissions`, {
        email,
        role
      }, getAuthConfig());
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Actualizar el rol de un usuario para una tarea
  updateTaskPermission: async (taskId, permissionId, role) => {
    try {
      const response = await axios.put(`/api/task-permissions/${taskId}/permissions/${permissionId}`, {
        role
      }, getAuthConfig());
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Eliminar el permiso de un usuario para una tarea
  deleteTaskPermission: async (taskId, permissionId) => {
    try {
      const response = await axios.delete(`/api/task-permissions/${taskId}/permissions/${permissionId}`, getAuthConfig());
      return response.data;
    } catch (error) {
      throw error;
    }
  },
  
  // Eliminar el permiso de un usuario para una tarea (por userId)
  removeUserPermission: async (taskId, userId) => {
    try {
      const response = await axios.delete(`/api/task-permissions/${taskId}/user/${userId}`, getAuthConfig());
      return response.data;
    } catch (error) {
      throw error;
    }
  }
};

// Servicios para gestión de roles de usuarios
export const userRoleService = {
  // Obtener todos los usuarios
  getAllUsers: async () => {
    try {
      const response = await axios.get('/api/users', getAuthConfig());
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Actualizar el rol de un usuario
  updateUserRole: async (userId, roleId) => {
    try {
      const response = await axios.put(`/api/users/${userId}/role`, { roleId }, getAuthConfig());
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Actualizar el estado de administrador de un usuario
  updateUserAdminStatus: async (userId, isAdmin) => {
    try {
      const response = await axios.put(`/api/users/${userId}/admin`, { isAdmin }, getAuthConfig());
      return response.data;
    } catch (error) {
      throw error;
    }
  }
};

export default {
  roleService,
  taskPermissionService,
  userRoleService
};
