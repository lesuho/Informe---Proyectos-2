import React, { createContext, useState, useEffect, useContext } from 'react';
import { AuthContext } from './AuthContext';
import notificationService from '../services/notificationService';

export const NotificationContext = createContext();

export const NotificationProvider = ({ children }) => {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const { user } = useContext(AuthContext);

  // Fetch notifications when user is logged in
  useEffect(() => {
    const fetchNotifications = async () => {
      if (!user) {
        setNotifications([]);
        setUnreadCount(0);
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const data = await notificationService.getUserNotifications();
        setNotifications(data);
        
        // Count unread notifications
        const unread = data.filter(notification => !notification.read).length;
        setUnreadCount(unread);
      } catch (error) {
        console.error('Error fetching notifications:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchNotifications();

    // Set up polling to check for new notifications every minute
    const intervalId = setInterval(fetchNotifications, 60000);

    return () => clearInterval(intervalId);
  }, [user]);

  // Mark a notification as read
  const markAsRead = async (notificationId) => {
    try {
      await notificationService.markAsRead(notificationId);
      
      // Update local state
      setNotifications(prevNotifications => 
        prevNotifications.map(notification => 
          notification._id === notificationId 
            ? { ...notification, read: true } 
            : notification
        )
      );
      
      // Update unread count
      setUnreadCount(prevCount => Math.max(0, prevCount - 1));
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  // Mark all notifications as read
  const markAllAsRead = async () => {
    try {
      await notificationService.markAllAsRead();
      
      // Update local state
      setNotifications(prevNotifications => 
        prevNotifications.map(notification => ({ ...notification, read: true }))
      );
      
      // Reset unread count
      setUnreadCount(0);
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
    }
  };
  
  // Eliminar una notificación
  const deleteNotification = async (notificationId) => {
    try {
      await notificationService.deleteNotification(notificationId);
      
      // Actualizar estado local
      const updatedNotifications = notifications.filter(
        notification => notification._id !== notificationId
      );
      setNotifications(updatedNotifications);
      
      // Actualizar contador de no leídas si era una notificación no leída
      const wasUnread = notifications.find(n => n._id === notificationId && !n.read);
      if (wasUnread) {
        setUnreadCount(prevCount => Math.max(0, prevCount - 1));
      }
      
      return true;
    } catch (error) {
      console.error('Error eliminando notificación:', error);
      return false;
    }
  };

  // Añadir una notificación en tiempo real (desde socket)
  const addNotification = (newNotification) => {
    setNotifications(prevNotifications => [newNotification, ...prevNotifications]);
    setUnreadCount(prevCount => prevCount + 1);
  };

  return (
    <NotificationContext.Provider 
      value={{ 
        notifications, 
        unreadCount, 
        loading, 
        markAsRead, 
        markAllAsRead,
        deleteNotification,
        addNotification
      }}
    >
      {children}
    </NotificationContext.Provider>
  );
};