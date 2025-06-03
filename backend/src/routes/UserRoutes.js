const express = require('express');
const { protect, adminOnly, restrictToOwnerOrAdmin } = require('../middlewares/auth');
const User = require('../models/User');

const router = express.Router();

// All routes require authentication
router.use(protect);

// GET /api/users - Get current user info (or all users for admin)
router.get('/', async (req, res) => {
  try {
    if (req.user.role === 'admin') {
      // Admin can see all users
      const { page = 1, limit = 20, isActive } = req.query;
      const skip = (page - 1) * limit;
      
      const filter = {};
      if (isActive !== undefined) {
        filter.isActive = isActive === 'true';
      }

      const users = await User.find(filter)
        .select('-password')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(Number(limit));

      const total = await User.countDocuments(filter);

      res.status(200).json({
        status: 'success',
        results: users.length,
        totalPages: Math.ceil(total / limit),
        currentPage: Number(page),
        data: {
          users
        }
      });
    } else {
      // Regular users see only their own info
      res.status(200).json({
        status: 'success',
        data: {
          user: {
            id: req.user._id,
            username: req.user.username,
            role: req.user.role,
            isActive: req.user.isActive,
            createdAt: req.user.createdAt,
            lastLogin: req.user.lastLogin
          }
        }
      });
    }
  } catch (err) {
    res.status(500).json({
      status: 'error',
      message: err.message
    });
  }
});

// GET /api/users/:id - Get specific user (admin only or own profile)
router.get('/:id', restrictToOwnerOrAdmin, async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select('-password');
    
    if (!user) {
      return res.status(404).json({
        status: 'fail',
        message: 'User not found'
      });
    }

    res.status(200).json({
      status: 'success',
      data: {
        user
      }
    });
  } catch (err) {
    res.status(500).json({
      status: 'error',
      message: err.message
    });
  }
});

// PATCH /api/users/:id/status - Update user status (admin only)
router.patch('/:id/status', adminOnly, async (req, res) => {
  try {
    const { isActive } = req.body;
    
    if (typeof isActive !== 'boolean') {
      return res.status(400).json({
        status: 'fail',
        message: 'isActive must be a boolean value'
      });
    }

    const user = await User.findByIdAndUpdate(
      req.params.id,
      { isActive },
      { new: true, runValidators: true }
    ).select('-password');

    if (!user) {
      return res.status(404).json({
        status: 'fail',
        message: 'User not found'
      });
    }

    res.status(200).json({
      status: 'success',
      data: {
        user
      }
    });
  } catch (err) {
    res.status(400).json({
      status: 'fail',
      message: err.message
    });
  }
});

// PATCH /api/users/:id/role - Update user role (admin only)
router.patch('/:id/role', adminOnly, async (req, res) => {
  try {
    const { role } = req.body;
    
    if (!['user', 'admin'].includes(role)) {
      return res.status(400).json({
        status: 'fail',
        message: 'Role must be either "user" or "admin"'
      });
    }

    const user = await User.findByIdAndUpdate(
      req.params.id,
      { role },
      { new: true, runValidators: true }
    ).select('-password');

    if (!user) {
      return res.status(404).json({
        status: 'fail',
        message: 'User not found'
      });
    }

    res.status(200).json({
      status: 'success',
      data: {
        user
      }
    });
  } catch (err) {
    res.status(400).json({
      status: 'fail',
      message: err.message
    });
  }
});

module.exports = router;