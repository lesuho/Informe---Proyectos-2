import React from 'react';

const CustomToast = ({ message }) => {
  // message es el objeto de mensaje completo del backend/socket
  const sender = message.sender?.name || message.sender?.email || 'Nuevo Mensaje';
  const content = message.content || '';

  return (
    <div className="flex items-center p-2">
      <div className="text-2xl mr-3">💬</div>
      <div>
        <div className="font-bold text-gray-800 dark:text-white">{sender}</div>
        <div className="text-sm text-gray-600 dark:text-gray-300">
          {content.substring(0, 50)}{content.length > 50 ? '...' : ''}
        </div>
      </div>
    </div>
  );
};

export default CustomToast;