const User = require('../models/User');
const { signToken } = require('../utils/jwt');

const authController = {
  // Register a new user
  register: async (req, res) => {
    try {
      const { username, password } = req.body;
      
      // 1) Check if user exists
      const existingUser = await User.findOne({ username });
      if (existingUser) {
        return res.status(400).json({
          status: 'fail',
          message: 'Username already exists'
        });
      }

      // 2) Create new user
      const newUser = await User.create({ username, password });

      // 3) Generate token
      const token = signToken(newUser._id);

      res.status(201).json({
        status: 'success',
        token,
        data: {
          user: {
            id: newUser._id,
            username: newUser.username
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

      // 1) Check if user exists
      const user = await User.findOne({ username });
      if (!user) {
        return res.status(401).json({
          status: 'fail',
          message: 'Incorrect username or password'
        });
      }

      // 2) Check if password is correct
      if (!(await user.correctPassword(password))) {
        return res.status(401).json({
          status: 'fail',
          message: 'Incorrect username or password'
        });
      }

      // 3) Generate token
      const token = signToken(user._id);

      res.status(200).json({
        status: 'success',
        token,
        data: {
          user: {
            id: user._id,
            username: user.username
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
  logout: async (req, res) => {
  try {
    // Here you could implement token blacklisting if needed
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
}
};

module.exports = authController;