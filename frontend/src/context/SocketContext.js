import React, { createContext, useContext, useEffect, useState } from 'react';
import { io } from 'socket.io-client';
import { toast } from 'react-toastify';
import { useNavigate, useLocation } from 'react-router-dom';
import { AuthContext } from './AuthContext';
import CustomToast from '../components/common/CustomToast';
import { NotificationContext } from './NotificationContext';

const SocketContext = createContext();

export const useSocket = () => {
  return useContext(SocketContext);
};

const SOCKET_URL = process.env.REACT_APP_SOCKET_URL || 'http://localhost:5000';

export const SocketProvider = ({ children }) => {
  const [socket, setSocket] = useState(null);
  const [lastMessage, setLastMessage] = useState(null);
  const { user } = useContext(AuthContext);
  const { addNotification } = useContext(NotificationContext);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    let newSocket;
    if (user) {
      newSocket = io(SOCKET_URL, {
        query: { userId: user._id },
        transports: ['websocket']
      });
      setSocket(newSocket);

      return () => {
        newSocket.disconnect();
      };
    }
  }, [user]);

  useEffect(() => {
    if (!socket) return;

    const handleNewMessage = (message) => {
      console.log(`Mensaje recibido en contexto para usuario ${user?.email}:`, message);
      
      setLastMessage(message);

      if (message.sender !== user._id && location.pathname !== '/chat') {
        toast(<CustomToast message={message} navigate={navigate} />, {
          onClick: () => navigate('/chat', { state: { conversationId: message.conversationId } })
        });
      }
    };

    socket.on('receiveMessage', handleNewMessage);

    socket.on('newNotification', (notification) => {
      if (addNotification) {
        addNotification(notification);
      }
    });

    return () => {
      socket.off('receiveMessage', handleNewMessage);
      socket.off('newNotification');
    };
  }, [socket, location.pathname, navigate, addNotification, user]);

  return (
    <SocketContext.Provider value={{ socket, lastMessage }}>
      {children}
    </SocketContext.Provider>
  );
}; 