import React from 'react';

const MessageList = ({ messages }) => {
  return (
    <div className="space-y-3 transition-colors">
      {messages.map((msg) => (
        <div
          key={msg.id}
          className={`flex ${msg.sender === 'Tú' ? 'justify-end' : 'justify-start'}`}
        >
          <div
            className={`max-w-xs px-4 py-2 rounded-2xl shadow-md text-sm break-words
              ${msg.sender === 'Tú'
                ? 'bg-primary-500 text-white rounded-br-md dark:bg-primary-600'
                : 'bg-gray-200 text-gray-800 rounded-bl-md dark:bg-dark-bg-tertiary dark:text-gray-100'}
            `}
            style={{ boxShadow: '0 2px 8px 0 rgba(0,0,0,0.08)' }}
          >
            <div className="font-semibold mb-1 opacity-80">{msg.sender}</div>
            <div>{msg.content}</div>
            <div className="text-xs text-right opacity-60 mt-1">{msg.timestamp}</div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default MessageList; 