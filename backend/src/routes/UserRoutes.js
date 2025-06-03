const express = require('express');
const authMiddleware = require('../middlewares/auth');
const User = require('../models/User');

const router = express.Router();

// GET /api/user - Get current user info
router.get('/', authMiddleware, async (req, res) => {
  try {
    res.status(200).json({
      status: 'success',
      user: {
        id: req.user._id,
        username: req.user.username,
        createdAt: req.user.createdAt
      }
    });
  } catch (err) {
    res.status(500).json({
      status: 'error',
      message: err.message
    });
  }
});

module.exports = router;