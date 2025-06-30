import React, { useState, useRef, useEffect, useContext } from 'react';
import MessageList from './MessageList';
import MessageInput from './MessageInput';
import NewConversation from './NewConversation';
import chatService from '../../services/chatService';
import { AuthContext } from '../../context/AuthContext';
import { FiTrash2 } from 'react-icons/fi';
import { useSocket } from '../../context/SocketContext';

const ChatWindow = () => {
  const { user } = useContext(AuthContext);
  const { socket, lastMessage } = useSocket();
  const [conversations, setConversations] = useState([]);
  const [selectedConv, setSelectedConv] = useState(null);
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showNewConversation, setShowNewConversation] = useState(false);
  const messagesEndRef = useRef(null);

  // Cargar conversaciones al montar
  useEffect(() => {
    if (!user) return;
    const fetchConvs = async () => {
      setLoading(true);
      try {
        const data = await chatService.getConversations();
        setConversations(data);
        if (data.length > 0) setSelectedConv(data[0]);
      } catch (e) {
        console.error('Error cargando conversaciones:', e);
        setConversations([]);
      } finally {
        setLoading(false);
      }
    };
    fetchConvs();
  }, [user]);

  // Cargar mensajes de la conversación seleccionada
  useEffect(() => {
    if (!selectedConv || !user) return;
    const fetchMsgs = async () => {
      setLoading(true);
      try {
        const data = await chatService.getMessages(selectedConv._id);
        setMessages(data.map(m => ({
          id: m._id,
          sender: m.sender._id === user._id ? 'Tú' : (m.sender.name || m.sender.email),
          content: m.content,
          timestamp: new Date(m.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        })));
      } catch (e) {
        console.error('Error cargando mensajes:', e);
        setMessages([]);
      } finally {
        setLoading(false);
      }
    };
    fetchMsgs();
  }, [selectedConv, user]);

  // Efecto para manejar mensajes entrantes desde el contexto
  useEffect(() => {
    if (lastMessage && selectedConv && lastMessage.conversationId === selectedConv._id) {
      setMessages((prevMessages) => {
        // Evitar duplicados
        if (prevMessages.some(m => m.id === lastMessage._id || m._id === lastMessage._id)) {
          return prevMessages;
        }

        const otherUser = selectedConv.participants.find(p => p._id !== user._id);
        
        return [...prevMessages, {
          id: lastMessage._id,
          _id: lastMessage._id,
          sender: lastMessage.sender === user._id ? 'Tú' : (otherUser?.name || otherUser?.email || 'Otro'),
          content: lastMessage.content,
          timestamp: new Date(lastMessage.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }];
      });
    }
  }, [lastMessage, selectedConv, user]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async (msg) => {
    if (!selectedConv) return;
    const receiverId = selectedConv.participants.find(p => p._id !== user._id)?._id;
    if (!receiverId) {
      console.error('No se pudo encontrar el destinatario');
      return;
    }
    try {
      await chatService.sendMessage({ receiverId, content: msg });
      // No agregues el mensaje localmente, espera a recibirlo por el socket
    } catch (error) {
      console.error('Error enviando mensaje:', error);
    }
  };

  const handleNewConversation = (newConversation) => {
    setConversations(prev => [newConversation, ...prev]);
    setSelectedConv(newConversation);
  };

  const handleDeleteConversation = async (id) => {
    try {
      await chatService.deleteConversation(id);
      setConversations((prev) => prev.filter((conv) => conv._id !== id));
      if (selectedConv && selectedConv._id === id) {
        setSelectedConv(null);
        setMessages([]);
      }
    } catch (error) {
      alert('No se pudo borrar la conversación en el servidor.');
    }
  };

  return (
    <div className="w-full max-w-4xl h-[70vh] bg-white dark:bg-dark-bg-secondary rounded-2xl shadow-2xl flex overflow-hidden border border-gray-200 dark:border-dark-border">
      {/* Lista de conversaciones */}
      <div className="w-1/3 border-r border-gray-200 dark:border-dark-border bg-gray-50 dark:bg-dark-bg-tertiary p-3 overflow-y-auto">
        <div className="flex justify-between items-center mb-3">
          <h2 className="font-bold text-content text-lg">Conversaciones</h2>
          <button
            onClick={() => setShowNewConversation(true)}
            className="p-1 text-blue-500 hover:text-blue-600 text-sm font-semibold"
          >
            + Nueva
          </button>
        </div>
        
        {loading && <div className="text-content-secondary">Cargando...</div>}
        {conversations.map(conv => {
          const other = conv.participants.find(p => p._id !== user._id);
          return (
            <div
              key={conv._id}
              className={`flex items-center justify-between p-2 rounded cursor-pointer mb-1 transition-colors ${
                selectedConv && conv._id === selectedConv._id 
                  ? 'bg-primary-500 text-white' 
                  : 'hover:bg-gray-200 dark:hover:bg-dark-hover text-content'
              }`}
            >
              <div
                className="flex-1"
                onClick={() => setSelectedConv(conv)}
              >
                <div className="font-semibold">{other?.name || other?.email || 'Usuario'}</div>
                <div className="text-xs text-content-secondary truncate max-w-full">
                  {conv.lastMessage?.content?.slice(0, 30) || 'Sin mensajes'}
                </div>
              </div>
              <button
                type="button"
                title="Borrar conversación"
                onClick={(e) => {
                  e.stopPropagation();
                  handleDeleteConversation(conv._id);
                }}
                className="ml-2 text-gray-400 hover:text-red-500 dark:hover:text-red-400 transition"
              >
                <FiTrash2 size={16} />
              </button>
            </div>
          );
        })}
        {conversations.length === 0 && !loading && (
          <div className="text-content-secondary">No hay conversaciones.</div>
        )}
      </div>
      
      {/* Ventana de mensajes */}
      <div className="flex-1 flex flex-col p-4 bg-white dark:bg-dark-bg-secondary">
        {selectedConv ? (
          <>
            <div className="flex-1 overflow-y-auto mb-2">
              <MessageList messages={messages} onDelete={handleDeleteConversation} />
              <div ref={messagesEndRef} />
            </div>
            <MessageInput onSend={handleSend} />
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center text-content-secondary">
            Selecciona una conversación para comenzar a chatear
          </div>
        )}
      </div>

      {/* Modal de nueva conversación */}
      {showNewConversation && (
        <NewConversation
          onConversationCreated={handleNewConversation}
          onClose={() => setShowNewConversation(false)}
        />
      )}
    </div>
  );
};

export default ChatWindow; 