import React, { useState } from 'react';

const MessageInput = ({ onSend }) => {
  const [value, setValue] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (value.trim()) {
      onSend(value);
      setValue('');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex items-center space-x-2 mt-2">
      <input
        type="text"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        placeholder="Escribe un mensaje..."
        className="flex-1 px-4 py-2 rounded-lg border border-gray-300 dark:border-dark-border bg-white dark:bg-dark-bg-primary text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-400 transition"
        onKeyDown={(e) => {
          if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSubmit(e);
          }
        }}
      />
      <button
        type="submit"
        className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-2 rounded-lg shadow font-semibold transition"
      >
        Enviar
      </button>
    </form>
  );
};

export default MessageInput; 