const express = require('express');
const { protect, restrictToOwnerOrAdmin } = require('../middlewares/auth');
const chatController = require('../controllers/ChatController');

const router = express.Router();

// All routes require authentication
router.use(protect);

// GET /api/chat/:userId - Get chat history for a user (user can access their own, admin can access any)
router.get('/:userId', restrictToOwnerOrAdmin, chatController.getChatHistory);

// POST /api/chat/:userId - Send a new message (user can send to their own chat, admin can send to any)
router.post('/:userId', restrictToOwnerOrAdmin, chatController.sendMessage);

module.exports = router;