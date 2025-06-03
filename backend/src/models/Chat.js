// const express = require('express');
// const { GoogleGenerativeAI } = require('@google/generative-ai');
// const authenticate = require('../middlewares/rolePermissions');
// const Chat = require('../models/Chat');

// const router = express.Router();
// const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// router.post('/', authenticate, async (req, res) => {
//   try {
//     const { message } = req.body;
    
//     // Get or create chat
//     let chat = await Chat.findOne({ userId: req.user._id });
//     if (!chat) chat = new Chat({ userId: req.user._id, messages: [] });
    
//     // Add user message
//     chat.messages.push({ role: 'user', content: message });
    
//     // Get AI response
//     const model = genAI.getGenerativeModel({ model: "gemini-pro" });
//     const result = await model.generateContent(message);
//     const response = await result.response;
//     const text = response.text();
    
//     // Add AI response
//     chat.messages.push({ role: 'assistant', content: text });
//     await chat.save();
    
//     res.json({ 
//       status: 'success',
//       data: {
//         response: text,
//         history: chat.messages 
//       }
//     });
//   } catch (err) {
//     res.status(500).json({
//       status: 'error',
//       message: err.message
//     });
//   }
// });

// router.get('/history', authenticate, async (req, res) => {
//   try {
//     const chat = await Chat.findOne({ userId: req.user._id });
//     res.json({
//       status: 'success',
//       data: chat?.messages || []
//     });
//   } catch (err) {
//     res.status(500).json({
//       status: 'error',
//       message: err.message
//     });
//   }
// });

// module.exports = router;