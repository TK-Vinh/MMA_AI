const User = require('../models/User');
const { signToken } = require('../utils/jwt');

const authController = {
  // Register a new user (public registration - users only)
  register: async (req, res) => {
    try {
      const { username, password } = req.body;
      
      // Check if user exists
      const existingUser = await User.findOne({ username });
      if (existingUser) {
        return res.status(400).json({
          status: 'fail',
          message: 'Username already exists'
        });
      }

      // Create new user (always 'user' role for public registration)
      const newUser = await User.create({ 
        username, 
        password,
        role: 'user'
      });

      // Generate token
      const token = signToken(newUser._id);

      res.status(201).json({
        status: 'success',
        token,
        data: {
          user: {
            id: newUser._id,
            username: newUser.username,
            role: newUser.role,
            isActive: newUser.isActive,
            createdAt: newUser.createdAt
          }
        }
      });
    } catch (err) {
      res.status(400).json({
        status: 'fail',
        message: err.message
      });
    }
  },

  // Register admin (admin-only route)
  registerAdmin: async (req, res) => {
    try {
      const { username, password } = req.body;
      
      // Check if user exists
      const existingUser = await User.findOne({ username });
      if (existingUser) {
        return res.status(400).json({
          status: 'fail',
          message: 'Username already exists'
        });
      }

      // Create new admin user
      const newAdmin = await User.create({ 
        username, 
        password,
        role: 'admin'
      });

      // Generate token
      const token = signToken(newAdmin._id);

      res.status(201).json({
        status: 'success',
        token,
        data: {
          user: {
            id: newAdmin._id,
            username: newAdmin.username,
            role: newAdmin.role,
            isActive: newAdmin.isActive,
            createdAt: newAdmin.createdAt
          }
        }
      });
    } catch (err) {
      res.status(400).json({
        status: 'fail',
        message: err.message
      });
    }
  },

  // Login user
  login: async (req, res) => {
    try {
      const { username, password } = req.body;

      // Validate input
      if (!username || !password) {
        return res.status(400).json({
          status: 'fail',
          message: 'Please provide username and password'
        });
      }

      // Check if user exists
      const user = await User.findOne({ username });
      if (!user) {
        return res.status(401).json({
          status: 'fail',
          message: 'Incorrect username or password'
        });
      }

      // Check if user is active
      if (!user.isActive) {
        return res.status(401).json({
          status: 'fail',
          message: 'Your account has been deactivated. Please contact support.'
        });
      }

      // Check if password is correct
      const isPasswordCorrect = await user.correctPassword(password);
      if (!isPasswordCorrect) {
        return res.status(401).json({
          status: 'fail',
          message: 'Incorrect username or password'
        });
      }

      // Update last login
      user.lastLogin = new Date();
      await user.save({ validateBeforeSave: false });

      // Generate token
      const token = signToken(user._id);

      res.status(200).json({
        status: 'success',
        token,
        data: {
          user: {
            id: user._id,
            username: user.username,
            role: user.role,
            isActive: user.isActive,
            lastLogin: user.lastLogin
          }
        }
      });
    } catch (err) {
      console.error('Login error:', err);
      res.status(500).json({
        status: 'error',
        message: 'Something went wrong during login'
      });
    }
  },

  // Logout user
  logout: async (req, res) => {
    try {
      res.status(200).json({
        status: 'success',
        message: 'Logged out successfully'
      });
    } catch (err) {
      res.status(500).json({
        status: 'error',
        message: err.message
      });
    }
  },

  // Get current user profile
  getMe: async (req, res) => {
    try {
      const user = await User.findById(req.user._id).select('-password');
      
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
  },

  // Update current user profile
  updateMe: async (req, res) => {
    try {
      // Filter out restricted fields
      const restrictedFields = ['role', 'password', 'isActive'];
      const updates = { ...req.body };
      
      restrictedFields.forEach(field => {
        if (updates[field]) {
          delete updates[field];
        }
      });

      if (Object.keys(updates).length === 0) {
        return res.status(400).json({
          status: 'fail',
          message: 'No valid fields to update. Role, password, and isActive cannot be updated through this endpoint.'
        });
      }

      const updatedUser = await User.findByIdAndUpdate(
        req.user._id,
        updates,
        {
          new: true,
          runValidators: true
        }
      ).select('-password');

      res.status(200).json({
        status: 'success',
        data: {
          user: updatedUser
        }
      });
    } catch (err) {
      res.status(400).json({
        status: 'fail',
        message: err.message
      });
    }
  },

  // Change password
  changePassword: async (req, res) => {
    try {
      const { currentPassword, newPassword } = req.body;

      // Validate input
      if (!currentPassword || !newPassword) {
        return res.status(400).json({
          status: 'fail',
          message: 'Please provide both current and new password'
        });
      }

      // Get user
      const user = await User.findById(req.user._id);

      // Check if current password is correct
      const isCurrentPasswordCorrect = await user.correctPassword(currentPassword);
      if (!isCurrentPasswordCorrect) {
        return res.status(401).json({
          status: 'fail',
          message: 'Current password is incorrect'
        });
      }

      // Update password
      user.password = newPassword;
      await user.save();

      // Generate new token
      const token = signToken(user._id);

      res.status(200).json({
        status: 'success',
        token,
        message: 'Password changed successfully'
      });
    } catch (err) {
      res.status(400).json({
        status: 'fail',
        message: err.message
      });
    }
  }
};

module.exports = authController;