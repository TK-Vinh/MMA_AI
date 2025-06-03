// const { GoogleGenerativeAI } = require('@google/generative-ai');
// const Chat = require('../models/Chat');

// const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// const chatController = {
//   // Get chat history for a user
//   getChatHistory: async (req, res) => {
//     try {
//       const chat = await Chat.findOne({ userId: req.params.userId });
//       if (!chat) {
//         return res.status(404).json({ 
//           status: 'fail',
//           message: 'Chat not found' 
//         });
//       }
      
//       res.status(200).json({
//         status: 'success',
//         data: {
//           chat
//         }
//       });
//     } catch (error) {
//       res.status(500).json({ 
//         status: 'error',
//         message: error.message 
//       });
//     }
//   },

//   // Send a new message and get AI response
//   sendMessage: async (req, res) => {
//     try {
//       const { message } = req.body;
//       const { userId } = req.params;

//       // Validate input
//       if (!message) {
//         return res.status(400).json({ 
//           status: 'fail',
//           message: 'Message is required' 
//         });
//       }

//       // Generate AI response
//       const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });
//       const result = await model.generateContent(message);
//       const response = await result.response;
      
//       res.status(200).json({ 
//         status: 'success',
//         data: {
//           response: response.text(),
//           userId
//         }
//       });

//     } catch (error) {
//       console.error('Gemini Error:', error);
//       res.status(500).json({ 
//         status: 'error',
//         message: 'Failed to process message',
//         error: error.message 
//       });
//     }
//   }
// };

// module.exports = chatController;