const express = require('express');
const router = express.Router();
const {
  getConversations,
  getMessages,
  sendMessage,
  deleteConversation,
} = require('../controllers/chatController');
const { protect } = require('../middleware/auth');

router.route('/conversations').get(protect, getConversations);
router.route('/conversations/:conversationId').get(protect, getMessages);
router.route('/conversations/:conversationId').delete(protect, deleteConversation);
router.route('/messages').post(protect, sendMessage);

module.exports = router; 