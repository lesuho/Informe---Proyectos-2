import React, { useContext } from 'react';
import { Link } from 'react-router-dom';
import { NotificationContext } from '../../context/NotificationContext';

const NotificationList = ({ onClose }) => {
  const { notifications, loading, markAsRead, markAllAsRead } = useContext(NotificationContext);

  const handleNotificationClick = (notification) => {
    if (!notification.read) {
      markAsRead(notification._id);
    }
    onClose();
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleString('es-ES', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getNotificationIcon = (type) => {
    switch (type) {
      case 'share_task':
        return (
          <svg className="w-5 h-5 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
          </svg>
        );
      case 'task_complete':
        return (
          <svg className="w-5 h-5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
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

  return (
    <div className="max-h-96 overflow-y-auto">
      <div className="p-3 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center bg-gray-50 dark:bg-dark-hover">
        <h3 className="font-semibold text-lg">Notificaciones</h3>
        {notifications.length > 0 && (
          <button
            onClick={markAllAsRead}
            className="text-sm text-primary-600 dark:text-primary-400 hover:underline"
          >
            Marcar todas como leídas
          </button>
        )}
      </div>

      {loading ? (
        <div className="p-4 text-center text-gray-500 dark:text-gray-400">
          Cargando notificaciones...
        </div>
      ) : notifications.length === 0 ? (
        <div className="p-4 text-center text-gray-500 dark:text-gray-400">
          No tienes notificaciones
        </div>
      ) : (
        <ul>
          {notifications.map((notification) => (
            <li
              key={notification._id}
              className={`border-b border-gray-200 dark:border-gray-700 last:border-b-0 ${!notification.read ? 'bg-blue-50 dark:bg-blue-900/20' : ''}`}
            >
              <Link
                to={`/tasks/${notification.task._id}`}
                className="block p-3 hover:bg-gray-50 dark:hover:bg-dark-hover transition-colors"
                onClick={() => handleNotificationClick(notification)}
              >
                <div className="flex items-start">
                  <div className="flex-shrink-0 mr-3 mt-1">
                    {getNotificationIcon(notification.type)}
                  </div>
                  <div className="flex-1">
                    <p className={`text-sm ${!notification.read ? 'font-semibold' : ''}`}>
                      {notification.message}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                      {formatDate(notification.createdAt)}
                    </p>
                  </div>
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