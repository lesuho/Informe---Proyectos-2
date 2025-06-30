import React, { useContext, useState } from 'react';
import { NotificationContext } from '../context/NotificationContext';
import { format, formatDistanceToNow } from 'date-fns';
import { es } from 'date-fns/locale';
import { Link } from 'react-router-dom';
import { toast } from 'react-toastify';

const NotificationsPage = () => {
  const { notifications, loading, markAsRead, markAllAsRead } = useContext(NotificationContext);
  const [filter, setFilter] = useState('all'); // 'all', 'unread', 'read'
  const [searchTerm, setSearchTerm] = useState('');

  // Marcar como leída una notificación
  const handleMarkAsRead = (id) => {
    markAsRead(id);
    toast.success('Notificación marcada como leída');
  };

  // Marcar todas las notificaciones como leídas
  const handleMarkAllAsRead = () => {
    markAllAsRead();
    toast.success('Todas las notificaciones marcadas como leídas');
  };

  // Filtrar notificaciones según criterios
  const filteredNotifications = notifications.filter(notification => {
    // Filtro por estado (leída/no leída)
    const statusMatch = 
      filter === 'all' ? true : 
      filter === 'unread' ? !notification.read : 
      notification.read;
    
    // Filtro por término de búsqueda
    const searchMatch = 
      !searchTerm || 
      notification.message.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (notification.task?.title && notification.task.title.toLowerCase().includes(searchTerm.toLowerCase()));
    
    return statusMatch && searchMatch;
  });

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

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center">
          Notificaciones
          {loading && (
            <div className="ml-3 w-5 h-5 border-t-2 border-b-2 border-indigo-500 rounded-full animate-spin"></div>
          )}
        </h1>
        <Link 
          to="/dashboard" 
          className="text-indigo-600 dark:text-indigo-400 hover:text-indigo-800 dark:hover:text-indigo-300 flex items-center"
        >
          <svg className="w-5 h-5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
          </svg>
          Dashboard
        </Link>
      </div>
      
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden">
        <div className="p-4 bg-gradient-to-r from-indigo-600 to-purple-600 text-white">
          <div className="flex justify-between items-center mb-4">
            <h2 className="font-semibold text-lg flex items-center">
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
              </svg>
              Todas tus notificaciones
              {!loading && (
                <span className="ml-2 text-sm opacity-80">({notifications.length})</span>
              )}
            </h2>
            {notifications.length > 0 && (
              <button
                onClick={handleMarkAllAsRead}
                className="text-sm bg-white/20 hover:bg-white/30 px-3 py-1 rounded transition-colors duration-200 flex items-center"
                disabled={loading}
              >
                <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                Marcar todas como leídas
              </button>
            )}
          </div>
          
          <div className="flex space-x-2 text-sm">
            <button 
              onClick={() => setFilter('all')} 
              className={`px-3 py-1 rounded-full transition-colors duration-200 ${filter === 'all' ? 'bg-white text-indigo-700' : 'bg-white/20 hover:bg-white/30'}`}
              disabled={loading}
            >
              Todas
            </button>
            <button 
              onClick={() => setFilter('unread')} 
              className={`px-3 py-1 rounded-full transition-colors duration-200 ${filter === 'unread' ? 'bg-white text-indigo-700' : 'bg-white/20 hover:bg-white/30'}`}
              disabled={loading}
            >
              No leídas
            </button>
            <button 
              onClick={() => setFilter('read')} 
              className={`px-3 py-1 rounded-full transition-colors duration-200 ${filter === 'read' ? 'bg-white text-indigo-700' : 'bg-white/20 hover:bg-white/30'}`}
              disabled={loading}
            >
              Leídas
            </button>
          </div>
          
          <div className="mt-4">
            <div className="relative">
              <input
                type="text"
                placeholder="Buscar notificaciones..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-4 py-2 rounded-md bg-white/10 text-white placeholder-white/70 border border-white/20 focus:outline-none focus:ring-2 focus:ring-white/30"
                disabled={loading}
              />
              <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                <svg className="w-5 h-5 text-white/70" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
            </div>
          </div>
        </div>

        {loading ? (
          <div className="p-12 text-center text-gray-500 dark:text-gray-400 flex flex-col items-center justify-center">
            <div className="w-12 h-12 border-t-2 border-b-2 border-indigo-500 rounded-full animate-spin mb-4"></div>
            <p className="text-lg font-medium">Cargando notificaciones</p>
            <p className="text-sm mt-2">Esto puede tardar un momento...</p>
          </div>
        ) : filteredNotifications.length === 0 ? (
          <div className="py-16 px-4 text-center text-gray-500 dark:text-gray-400 flex flex-col items-center">
            <svg className="w-20 h-20 text-gray-300 dark:text-gray-600 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
            </svg>
            {searchTerm ? (
              <>
                <p className="text-xl font-medium mb-2">No se encontraron resultados</p>
                <p className="max-w-md mx-auto">No hay notificaciones que coincidan con <span className="font-medium text-indigo-600 dark:text-indigo-400">"{searchTerm}"</span></p>
                <button 
                  onClick={() => setSearchTerm('')} 
                  className="mt-4 text-indigo-600 dark:text-indigo-400 hover:text-indigo-800 dark:hover:text-indigo-300 flex items-center"
                >
                  <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                  Limpiar búsqueda
                </button>
              </>
            ) : filter !== 'all' ? (
              <>
                <p className="text-xl font-medium mb-2">No hay notificaciones {filter === 'unread' ? 'no leídas' : 'leídas'}</p>
                <p className="max-w-md mx-auto">Prueba a cambiar el filtro para ver más notificaciones</p>
                <button 
                  onClick={() => setFilter('all')} 
                  className="mt-4 text-indigo-600 dark:text-indigo-400 hover:text-indigo-800 dark:hover:text-indigo-300 flex items-center"
                >
                  <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                  </svg>
                  Ver todas las notificaciones
                </button>
              </>
            ) : (
              <>
                <p className="text-xl font-medium mb-2">No tienes notificaciones</p>
                <p className="max-w-md mx-auto">Las notificaciones aparecerán aquí cuando recibas actualizaciones sobre tus tareas o cuando alguien comparta una tarea contigo</p>
              </>
            )}
          </div>
        ) : (
          <div className="divide-y divide-gray-200 dark:divide-gray-700">
            {filteredNotifications.map((notification) => (
              <div key={notification._id} className={`p-6 ${!notification.read ? 'bg-indigo-50 dark:bg-indigo-900/10' : ''}`}>
                <div className="flex items-start">
                  {getNotificationIcon(notification.type)}
                  
                  <div className="ml-4 flex-1">
                    <div className="flex items-start justify-between">
                      <div>
                        <p className={`text-base ${!notification.read ? 'font-semibold text-gray-900 dark:text-white' : 'text-gray-800 dark:text-gray-200'}`}>
                          {notification.message}
                        </p>
                        <div className="flex items-center mt-1 text-sm text-gray-500 dark:text-gray-400">
                          <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          {formatDate(notification.createdAt)}
                        </div>
                      </div>
                      
                      <div className="flex space-x-2">
                        {!notification.read && (
                          <button 
                            onClick={() => handleMarkAsRead(notification._id)}
                            className="text-indigo-600 dark:text-indigo-400 hover:text-indigo-800 dark:hover:text-indigo-300 p-1 rounded-full hover:bg-indigo-50 dark:hover:bg-indigo-900/20"
                            title="Marcar como leída"
                          >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                          </button>
                        )}
                        
                        <Link 
                          to={`/notifications/${notification._id}`}
                          className="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 p-1 rounded-full hover:bg-blue-50 dark:hover:bg-blue-900/20"
                          title="Ver detalles"
                        >
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                          </svg>
                        </Link>
                        
                        {notification.task && (
                          <Link 
                            to={`/tasks/${notification.task._id}`}
                            className="text-green-600 dark:text-green-400 hover:text-green-800 dark:hover:text-green-300 p-1 rounded-full hover:bg-green-50 dark:hover:bg-green-900/20"
                            title="Ir a la tarea"
                          >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                            </svg>
                          </Link>
                        )}
                      </div>
                    </div>
                    
                    {notification.task && (
                      <div className="mt-2 bg-gray-50 dark:bg-gray-700/30 p-2 rounded text-sm">
                        <span className="font-medium text-gray-700 dark:text-gray-300">Tarea relacionada: </span>
                        <Link 
                          to={`/tasks/${notification.task._id}`}
                          className="text-indigo-600 dark:text-indigo-400 hover:underline"
                        >
                          {notification.task.title}
                        </Link>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default NotificationsPage;
