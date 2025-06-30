import React, { useState, useEffect, useContext } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { NotificationContext } from '../../context/NotificationContext';
import { format, formatDistanceToNow } from 'date-fns';
import { es } from 'date-fns/locale';
import { toast } from 'react-toastify';
import notificationService from '../../services/notificationService';

const NotificationDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [notification, setNotification] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Formatear fecha
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const isToday = new Date().toDateString() === date.toDateString();
    
    if (isToday) {
      return formatDistanceToNow(date, { addSuffix: true, locale: es });
    } else {
      return format(date, "d 'de' MMMM 'a las' HH:mm", { locale: es });
    }
  };

  const { markAsRead, deleteNotification } = useContext(NotificationContext);

  useEffect(() => {
    const fetchNotification = async () => {
      try {
        setLoading(true);
        const data = await notificationService.getNotificationById(id);
        setNotification(data);
        
        // Marcar como leída automáticamente al visualizar
        if (data && !data.read) {
          await markAsRead(id);
          // Actualizar la notificación local para mostrar que ya está leída
          setNotification(prev => ({ ...prev, read: true }));
        }
      } catch (error) {
        console.error('Error fetching notification:', error);
        setError('No se pudo cargar la notificación');
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchNotification();
    }
  }, [id, markAsRead]);

  const handleDelete = async () => {
    if (!window.confirm('¿Estás seguro de que deseas eliminar esta notificación?')) {
      return;
    }
    
    try {
      const success = await deleteNotification(id);
      if (success) {
        toast.success('Notificación eliminada correctamente');
        navigate('/notifications');
      } else {
        toast.error('Error al eliminar la notificación');
      }
    } catch (error) {
      console.error('Error deleting notification:', error);
      toast.error('Error al eliminar la notificación');
    }
  };

  // Obtener el ícono según el tipo de notificación
  const getNotificationIcon = (type) => {
    switch (type) {
      case 'share_task':
        return (
          <div className="w-12 h-12 rounded-full bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400 flex items-center justify-center">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
            </svg>
          </div>
        );
      case 'task_update':
        return (
          <div className="w-12 h-12 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 flex items-center justify-center">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
          </div>
        );
      case 'task_complete':
        return (
          <div className="w-12 h-12 rounded-full bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 flex items-center justify-center">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
        );
      case 'comment':
        return (
          <div className="w-12 h-12 rounded-full bg-yellow-100 dark:bg-yellow-900/30 text-yellow-600 dark:text-yellow-400 flex items-center justify-center">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
            </svg>
          </div>
        );
      default:
        return (
          <div className="w-12 h-12 rounded-full bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 flex items-center justify-center">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
            </svg>
          </div>
        );
    }
  };

  if (loading) return <div className="min-h-screen flex justify-center items-center"><div className="spinner"></div></div>;
  if (error) return <div className="min-h-screen flex justify-center items-center"><div className="bg-red-100 bg-opacity-20 text-red-500 p-4 rounded-md">{error}</div></div>;
  if (!notification) return <div className="min-h-screen flex justify-center items-center"><div className="text-center text-gray-400 p-8">Notificación no encontrada</div></div>;

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="mb-4 flex items-center">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center text-indigo-600 dark:text-indigo-400 hover:text-indigo-800 dark:hover:text-indigo-300 transition-colors duration-200"
        >
          <svg className="w-5 h-5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          Volver a notificaciones
        </button>
      </div>
      
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden">
        <div className="p-6">
          <div className="flex items-start">
            {getNotificationIcon(notification.type)}
            
            <div className="ml-4 flex-1">
              <h1 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                {notification.title || 'Notificación'}
              </h1>
              
              <div className="flex items-center text-sm text-gray-500 dark:text-gray-400 mb-4">
                <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                {formatDate(notification.createdAt)}
                
                {notification.read ? (
                  <span className="ml-4 flex items-center">
                    <svg className="w-4 h-4 mr-1 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    Leída
                  </span>
                ) : (
                  <span className="ml-4 flex items-center text-indigo-600 dark:text-indigo-400">
                    <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                    No leída
                  </span>
                )}
              </div>
              
              <div className="bg-gray-50 dark:bg-gray-700/50 p-4 rounded-lg mb-6">
                <p className="text-gray-700 dark:text-gray-300">
                  {notification.message}
                </p>
              </div>
              
              {notification.task && (
                <Link 
                  to={`/tasks/${notification.task._id}`}
                  className="inline-flex items-center px-4 py-2 bg-indigo-600 dark:bg-indigo-700 text-white rounded-md hover:bg-indigo-700 dark:hover:bg-indigo-600 transition-colors duration-200 mb-4"
                >
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                  </svg>
                  Ver tarea relacionada
                </Link>
              )}
              
              <div className="mt-6 pt-4 border-t border-gray-200 dark:border-gray-700">
                <button
                  onClick={handleDelete}
                  className="inline-flex items-center px-3 py-2 border border-red-600 dark:border-red-400 text-red-600 dark:text-red-400 rounded hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors duration-200"
                >
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                  Eliminar notificación
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NotificationDetail;
