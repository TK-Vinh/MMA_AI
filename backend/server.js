require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const authRouter = require('./src/routes/AuthRoutes');
const chatRouter = require('./src/routes/ChatRoutes');
const collectionRouter = require('./src/routes/CollectionRoutes');
const fragranceRouter = require('./src/routes/FragranceRoutes');
const userRouter = require('./src/routes/UserRoutes');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/auth', authRouter);
app.use('/api/chat', chatRouter);
app.use('/api/collection', collectionRouter);
app.use('/api/fragrance', fragranceRouter);
app.use('/api/user', userRouter);
// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    status: 'error',
    message: 'Something went wrong!'
  });
});

// Database connection
mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('Connected to MongoDB'))
  .catch(err => console.error('MongoDB connection error:', err));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});