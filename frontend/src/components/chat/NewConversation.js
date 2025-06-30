import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../../context/AuthContext';
import chatService from '../../services/chatService';
import api from '../../config/axios';
import { useTheme } from '../../context/ThemeContext';
import { FiSearch } from 'react-icons/fi';

const NewConversation = ({ onConversationCreated, onClose }) => {
  const { user } = useContext(AuthContext);
  const { isDarkMode } = useTheme();
  const [users, setUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [loading, setLoading] = useState(false);
  const [loadingUsers, setLoadingUsers] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredUsers, setFilteredUsers] = useState([]);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        setLoadingUsers(true);
        setError(null);
        const response = await api.get('/users');
        setUsers(response.data);
        setFilteredUsers(response.data);
      } catch (error) {
        setError('No se pudieron cargar los usuarios. Intenta de nuevo.');
        setUsers([]);
        setFilteredUsers([]);
      } finally {
        setLoadingUsers(false);
      }
    };
    fetchUsers();
  }, [user]);

  const handleCreateConversation = async (userId) => {
    if (!userId) return;
    setLoading(true);
    try {
      const user = users.find(u => u._id === userId);
      const newMsg = await chatService.sendMessage({
        receiverId: user._id,
        content: '¡Hola! Iniciando conversación.'
      });
      const newConversation = {
        _id: newMsg.conversationId || Date.now().toString(),
        participants: [user],
        lastMessage: {
          content: '¡Hola! Iniciando conversación.'
        }
      };
      onConversationCreated(newConversation);
      onClose();
    } catch (error) {
      setError('No se pudo crear la conversación. Intenta de nuevo.');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (term) => {
    setSearchTerm(term);
    const filtered = users.filter(user =>
      user.name.toLowerCase().includes(term.toLowerCase()) ||
      user.email.toLowerCase().includes(term.toLowerCase())
    );
    setFilteredUsers(filtered);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 transition-opacity">
      <div className="modal relative animate-fade-in">
        <div
          className={`rounded-2xl shadow-2xl p-8 w-full max-w-md border relative animate-fade-in ${
            isDarkMode
              ? 'bg-dark-bg-secondary border-dark-border'
              : 'bg-white border-gray-200'
          }`}
        >
          <button
            onClick={onClose}
            className={`absolute top-4 right-4 text-gray-400 hover:text-gray-500 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
          <h3 className="text-xl font-bold text-center mb-6 text-gray-800 dark:text-gray-100">
            Iniciar una nueva conversación
          </h3>
          <div className="relative">
            <input
              type="text"
              placeholder="Buscar usuarios por nombre o email..."
              value={searchTerm}
              onChange={(e) => handleSearch(e.target.value)}
              className="w-full px-5 py-2 rounded-lg border transition bg-transparent focus:ring-2 focus:ring-blue-400 focus:outline-none dark:border-dark-border dark:text-gray-100"
            />
            <FiSearch className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400" />
          </div>

          {loading && <p className="text-center mt-4 text-gray-600 dark:text-gray-400">Buscando...</p>}

          <ul className="mt-4 space-y-2 max-h-60 overflow-y-auto">
            {filteredUsers.map((user) => (
              <li
                key={user._id}
                onClick={() => handleCreateConversation(user._id)}
                className="p-3 rounded-lg cursor-pointer transition-colors flex items-center gap-4 dark:hover:bg-dark-bg-tertiary hover:bg-gray-100"
              >
                <div className="w-10 h-10 rounded-full bg-blue-200 dark:bg-blue-900 flex-shrink-0" />
                <div>
                  <div className="font-semibold text-gray-800 dark:text-gray-100">{user.name}</div>
                  <div className="text-sm text-gray-500 dark:text-gray-400">{user.email}</div>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
};

export default NewConversation; 