import api from '../config/axios';

const chatService = {
  getConversations: async () => {
    const res = await api.get('/chat/conversations');
    return res.data;
  },
  getMessages: async (conversationId) => {
    const res = await api.get(`/chat/conversations/${conversationId}`);
    return res.data;
  },
  sendMessage: async ({ receiverId, content }) => {
    const res = await api.post('/chat/messages', { receiverId, content });
    return res.data;
  },
  deleteConversation: async (conversationId) => {
    const res = await api.delete(`/chat/conversations/${conversationId}`);
    return res.data;
  },
};

export default chatService; 