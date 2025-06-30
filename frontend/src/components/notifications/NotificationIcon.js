import React, { useState, useEffect, useRef, useContext } from 'react';
import { Link } from 'react-router-dom';
import { NotificationContext } from '../../context/NotificationContext';
import { format, formatDistanceToNow } from 'date-fns';
import { es } from 'date-fns/locale';

const NotificationIcon = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { notifications, unreadCount, markAsRead, markAllAsRead } = useContext(NotificationContext);
  const dropdownRef = useRef(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const toggleDropdown = () => setIsOpen(!isOpen);

  const handleMarkAsRead = async (e, notificationId) => {
    e.stopPropagation();
    await markAsRead(notificationId);
  };

  const handleMarkAllAsRead = async (e) => {
    e.preventDefault();
    await markAllAsRead();
  };

  // Format notification date
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const isToday = new Date().toDateString() === date.toDateString();
    
    if (isToday) {
      return formatDistanceToNow(date, { addSuffix: true, locale: es });
    } else {
      return format(date, "d 'de' MMMM 'a las' HH:mm", { locale: es });
    }
  };

  // Get notification type icon
  const getNotificationIcon = (type) => {
    switch (type) {
      case 'share_task':
        return '🔗';
      case 'task_update':
        return '🔄';
      case 'task_complete':
        return '✅';
      default:
        return '📣';
    }
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={toggleDropdown}
        className={`relative p-2 rounded-full focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all duration-200 ${unreadCount > 0 ? 'text-indigo-600 dark:text-indigo-400 bg-indigo-100 dark:bg-indigo-900/30 hover:bg-indigo-200 dark:hover:bg-indigo-800/40' : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'}`}
        aria-label="Notificaciones"
      >
        <div className="relative">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className={`h-6 w-6 ${unreadCount > 0 ? 'animate-pulse' : ''}`}
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={unreadCount > 0 ? 2.5 : 2}
              d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
            />
          </svg>
          
          {unreadCount > 0 && (
            <span className="absolute -top-1 -right-1 inline-flex items-center justify-center w-5 h-5 text-xs font-bold text-white bg-red-500 rounded-full shadow-sm border border-white dark:border-gray-800 transform scale-110">
              {unreadCount > 99 ? '99+' : unreadCount}
            </span>
          )}
        </div>
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-96 bg-white dark:bg-gray-800 rounded-lg shadow-xl overflow-hidden z-50 border border-gray-200 dark:border-gray-700">
          <div className="py-3 px-4 bg-gradient-to-r from-indigo-600 to-purple-600 flex justify-between items-center">
            <h3 className="text-sm font-semibold text-white flex items-center">
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
              </svg>
              Notificaciones ({notifications.length})
            </h3>
            {unreadCount > 0 && (
              <button
                onClick={handleMarkAllAsRead}
                className="text-xs bg-white/20 hover:bg-white/30 text-white px-2 py-1 rounded transition-colors duration-200 flex items-center"
              >
                <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                Marcar todas como leídas
              </button>
            )}
          </div>
          
          <div className="max-h-[calc(100vh-200px)] overflow-y-auto scrollbar-thin scrollbar-thumb-gray-400 dark:scrollbar-thumb-gray-600 scrollbar-track-transparent">
            {notifications.length === 0 ? (
              <div className="py-8 px-4 text-sm text-gray-500 dark:text-gray-400 text-center">
                <svg className="w-12 h-12 mx-auto mb-3 text-gray-300 dark:text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                </svg>
                No tienes notificaciones
              </div>
            ) : (
              <div>
                {notifications.map((notification) => (
                  <Link
                    key={notification._id}
                    to={`/tasks/${notification.task?._id}`}
                    className={`block px-4 py-3 border-b border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors duration-150 ${!notification.read ? 'bg-indigo-50 dark:bg-indigo-900/20' : ''}`}
                    onClick={() => !notification.read && markAsRead(notification._id)}
                  >
                    <div className="flex items-start">
                      <div className="flex-shrink-0 mr-3">
                        <div className={`w-9 h-9 rounded-full flex items-center justify-center ${!notification.read ? 'bg-indigo-100 dark:bg-indigo-800/40 text-indigo-600 dark:text-indigo-300' : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300'}`}>
                          <span className="text-lg">{getNotificationIcon(notification.type)}</span>
                        </div>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className={`text-sm ${!notification.read ? 'font-semibold text-gray-900 dark:text-white' : 'font-medium text-gray-800 dark:text-gray-200'}`}>
                          {notification.message}
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 flex items-center">
                          <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          {formatDate(notification.createdAt)}
                        </p>
                      </div>
                      {!notification.read && (
                        <button
                          onClick={(e) => handleMarkAsRead(e, notification._id)}
                          className="ml-2 text-xs bg-indigo-100 dark:bg-indigo-800/40 text-indigo-600 dark:text-indigo-300 px-2 py-1 rounded-full hover:bg-indigo-200 dark:hover:bg-indigo-700/40 transition-colors duration-200"
                        >
                          Marcar leída
                        </button>
                      )}
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>
          
          <div className="p-3 bg-gray-50 dark:bg-gray-700/50 border-t border-gray-200 dark:border-gray-700">
            <Link 
              to="/notifications"
              className="block w-full py-2 px-3 text-center text-sm font-medium text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-900/20 hover:bg-indigo-100 dark:hover:bg-indigo-800/30 rounded-md transition-colors duration-200"
              onClick={() => setIsOpen(false)}
            >
              Ver todas las notificaciones
            </Link>
          </div>
        </div>
      )}
    </div>
  );
};

export default NotificationIcon;