import React, { useContext, useState } from 'react';
import { Link } from 'react-router-dom';
import { NotificationContext } from '../../context/NotificationContext';
import { format, formatDistanceToNow } from 'date-fns';
import { es } from 'date-fns/locale';

const NotificationList = ({ onClose }) => {
  const { notifications, loading, markAsRead, markAllAsRead } = useContext(NotificationContext);
  const [filter, setFilter] = useState('all'); // 'all', 'unread', 'read'

  const handleNotificationClick = (notification) => {
    if (!notification.read) {
      markAsRead(notification._id);
    }
    onClose();
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const isToday = new Date().toDateString() === date.toDateString();
    
    if (isToday) {
      return formatDistanceToNow(date, { addSuffix: true, locale: es });
    } else {
      return format(date, "d 'de' MMMM 'a las' HH:mm", { locale: es });
    }
  };

  const getNotificationIcon = (type) => {
    switch (type) {
      case 'share_task':
        return (
          <svg className="w-5 h-5 text-purple-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
          </svg>
        );
      case 'task_update':
        return (
          <svg className="w-5 h-5 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
        );
      case 'task_complete':
        return (
          <svg className="w-5 h-5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        );
      case 'comment':
        return (
          <svg className="w-5 h-5 text-yellow-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
          </svg>
        );
      default:
        return (
          <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        );
    }
  };
  
  const filteredNotifications = notifications.filter(notification => {
    if (filter === 'all') return true;
    if (filter === 'unread') return !notification.read;
    if (filter === 'read') return notification.read;
    return true;
  });

  return (
    <div className="max-h-[calc(100vh-200px)] overflow-y-auto">
      <div className="p-4 border-b border-gray-200 dark:border-gray-700 bg-gradient-to-r from-indigo-600 to-purple-600 text-white">
        <div className="flex justify-between items-center mb-4">
          <h3 className="font-semibold text-lg flex items-center">
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
            </svg>
            Notificaciones ({notifications.length})
          </h3>
          {notifications.length > 0 && (
            <button
              onClick={markAllAsRead}
              className="text-sm bg-white/20 hover:bg-white/30 px-3 py-1 rounded transition-colors duration-200 flex items-center"
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
          >
            Todas
          </button>
          <button 
            onClick={() => setFilter('unread')} 
            className={`px-3 py-1 rounded-full transition-colors duration-200 ${filter === 'unread' ? 'bg-white text-indigo-700' : 'bg-white/20 hover:bg-white/30'}`}
          >
            No leídas
          </button>
          <button 
            onClick={() => setFilter('read')} 
            className={`px-3 py-1 rounded-full transition-colors duration-200 ${filter === 'read' ? 'bg-white text-indigo-700' : 'bg-white/20 hover:bg-white/30'}`}
          >
            Leídas
          </button>
        </div>
      </div>

      {loading ? (
        <div className="p-8 text-center text-gray-500 dark:text-gray-400 flex flex-col items-center justify-center">
          <div className="w-10 h-10 border-t-2 border-b-2 border-indigo-500 rounded-full animate-spin mb-3"></div>
          Cargando notificaciones...
        </div>
      ) : notifications.length === 0 ? (
        <div className="py-12 px-4 text-center text-gray-500 dark:text-gray-400 flex flex-col items-center">
          <svg className="w-16 h-16 text-gray-300 dark:text-gray-600 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
          </svg>
          No tienes notificaciones
        </div>
      ) : filteredNotifications.length === 0 ? (
        <div className="py-8 px-4 text-center text-gray-500 dark:text-gray-400">
          No hay notificaciones que coincidan con el filtro seleccionado
        </div>
      ) : (
        <ul className="divide-y divide-gray-200 dark:divide-gray-700">
          {filteredNotifications.map((notification) => (
            <li
              key={notification._id}
              className={`${!notification.read ? 'bg-indigo-50 dark:bg-indigo-900/20' : ''}`}
            >
              <Link
                to={`/notifications/${notification._id}`}
                className="block p-4 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors duration-150"
                onClick={() => handleNotificationClick(notification)}
              >
                <div className="flex items-start">
                  <div className="flex-shrink-0 mr-3">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center ${!notification.read ? 'bg-indigo-100 dark:bg-indigo-800/40 text-indigo-600 dark:text-indigo-300' : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300'}`}>
                      {getNotificationIcon(notification.type)}
                    </div>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className={`text-sm ${!notification.read ? 'font-semibold text-gray-900 dark:text-white' : 'text-gray-800 dark:text-gray-200'}`}>
                      {notification.message}
                    </p>
                    <div className="flex items-center mt-1">
                      <p className="text-xs text-gray-500 dark:text-gray-400 flex items-center">
                        <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        {formatDate(notification.createdAt)}
                      </p>
                      {!notification.read && (
                        <span className="ml-2 px-2 py-0.5 text-xs rounded-full bg-indigo-100 dark:bg-indigo-800/40 text-indigo-600 dark:text-indigo-300">
                          Nueva
                        </span>
                      )}
                    </div>
                  </div>
                  <button
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      if (!notification.read) {
                        markAsRead(notification._id);
                      }
                    }}
                    className={`ml-2 p-2 rounded-full ${!notification.read ? 'text-indigo-600 dark:text-indigo-400 hover:bg-indigo-100 dark:hover:bg-indigo-800/30' : 'text-gray-400 dark:text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700'}`}
                  >
                    {!notification.read ? (
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    ) : (
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                      </svg>
                    )}
                  </button>
                </div>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default NotificationList;