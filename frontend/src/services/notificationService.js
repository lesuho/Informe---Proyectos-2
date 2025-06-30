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

// Servicios para notificaciones
const notificationService = {
  // Obtener notificaciones del usuario
  getUserNotifications: async () => {
    try {
      const response = await axios.get('/api/notifications', getAuthConfig());
      return response.data;
    } catch (error) {
      throw error;
    }
  },
  
  // Obtener una notificación específica por ID
  getNotificationById: async (notificationId) => {
    try {
      const response = await axios.get(`/api/notifications/${notificationId}`, getAuthConfig());
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Marcar notificación como leída
  markAsRead: async (notificationId) => {
    try {
      const response = await axios.put(`/api/notifications/${notificationId}/read`, {}, getAuthConfig());
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Marcar todas las notificaciones como leídas
  markAllAsRead: async () => {
    try {
      const response = await axios.put('/api/notifications/read-all', {}, getAuthConfig());
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Eliminar una notificación
  deleteNotification: async (notificationId) => {
    try {
      const response = await axios.delete(`/api/notifications/${notificationId}`, getAuthConfig());
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Obtener el número de notificaciones no leídas
  getUnreadCount: async () => {
    try {
      const response = await axios.get('/api/notifications/unread-count', getAuthConfig());
      return response.data.count;
    } catch (error) {
      throw error;
    }
  }
};

export default notificationService;
