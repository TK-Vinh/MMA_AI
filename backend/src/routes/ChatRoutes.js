const express = require('express');
const chatController = require('../controllers/ChatController');

const router = express.Router();

// GET /api/chat/:userId - Get chat history for a user
router.get('/:userId', chatController.getChatHistory);

// POST /api/chat/:userId - Send a new message
router.post('/:userId', chatController.sendMessage);

module.exports = router;