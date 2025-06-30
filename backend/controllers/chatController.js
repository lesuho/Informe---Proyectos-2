const asyncHandler = require('express-async-handler');
const Conversation = require('../models/Conversation');
const Message = require('../models/Message');
const User = require('../models/User');
const { createNotification } = require('./notificationController');

// @desc    Obtener todas las conversaciones de un usuario
// @route   GET /api/chat/conversations
// @access  Private
const getConversations = asyncHandler(async (req, res) => {
  const conversations = await Conversation.find({ participants: req.user._id })
    .populate('participants', 'name email')
    .populate('lastMessage')
    .sort({ updatedAt: -1 });

  res.json(conversations);
});

// @desc    Obtener mensajes de una conversación
// @route   GET /api/chat/conversations/:conversationId
// @access  Private
const getMessages = asyncHandler(async (req, res) => {
  const { conversationId } = req.params;

  const conversation = await Conversation.findOne({
    _id: conversationId,
    participants: req.user._id,
  });

  if (!conversation) {
    res.status(404);
    throw new Error('Conversación no encontrada o no tienes acceso.');
  }

  const messages = await Message.find({ conversationId })
    .populate('sender', 'name email')
    .sort({ createdAt: 'asc' });

  res.json(messages);
});

// @desc    Enviar un nuevo mensaje
// @route   POST /api/chat/messages
// @access  Private
const sendMessage = asyncHandler(async (req, res) => {
  const { receiverId, content } = req.body;

  if (!receiverId || !content) {
    res.status(400);
    throw new Error('Faltan datos: se requiere receptor y contenido.');
  }
  
  const receiver = await User.findById(receiverId);
  if(!receiver) {
      res.status(404);
      throw new Error('Usuario receptor no encontrado');
  }

  let conversation = await Conversation.findOne({
    participants: { $all: [req.user._id, receiverId] },
  });

  if (!conversation) {
    conversation = await Conversation.create({
      participants: [req.user._id, receiverId],
    });
  }

  const newMessage = await Message.create({
    conversationId: conversation._id,
    sender: req.user._id,
    content,
  });

  // Populate sender info for socket emission
  await newMessage.populate('sender', 'name email');

  conversation.lastMessage = newMessage._id;
  await conversation.save();
  
  // Preparar mensaje para socket con información completa
  const messageForSocket = {
    _id: newMessage._id,
    conversationId: conversation._id,
    sender: req.user._id,
    senderName: req.user.name,
    receiver: receiverId,
    receiverName: receiver.name,
    content: newMessage.content,
    createdAt: newMessage.createdAt
  };

  // Emitir evento de socket usando el objeto io disponible
  const io = req.app.get('io');
  if (io) {
    const senderId = req.user._id.toString();
    const receiverIdString = receiverId.toString();

    // Enviar al destinatario (juan) y al remitente (dany) a sus respectivas salas
    io.to(receiverIdString).emit('receiveMessage', messageForSocket);
    io.to(senderId).emit('receiveMessage', messageForSocket);

    // Crear y emitir una notificación para el receptor
    const notificationMessage = `Has recibido un nuevo mensaje de ${req.user.name || req.user.email}`;
    const notification = await createNotification(
      receiverIdString, 
      senderId, 
      null, // No hay una tarea asociada, se puede omitir o manejar
      'new_message', 
      notificationMessage
    );
    io.to(receiverIdString).emit('newNotification', notification);
  }

  res.status(201).json(newMessage);
});

// @desc    Eliminar una conversación y sus mensajes
// @route   DELETE /api/chat/conversations/:conversationId
// @access  Private
const deleteConversation = asyncHandler(async (req, res) => {
  const { conversationId } = req.params;
  const conversation = await Conversation.findOne({
    _id: conversationId,
    participants: req.user._id,
  });
  if (!conversation) {
    res.status(404);
    throw new Error('Conversación no encontrada o no tienes acceso.');
  }
  // Eliminar todos los mensajes asociados
  await Message.deleteMany({ conversationId });
  // Eliminar la conversación
  await conversation.deleteOne();
  res.json({ message: 'Conversación eliminada correctamente' });
});

module.exports = {
  getConversations,
  getMessages,
  sendMessage,
  deleteConversation,
}; 