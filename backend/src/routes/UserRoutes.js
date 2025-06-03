const express = require('express');
const { protect, adminOnly, restrictToOwnerOrAdmin } = require('../middlewares/auth');
const userController = require('../controllers/UserController');

const router = express.Router();

// All routes require authentication
router.use(protect);

// User routes
router.route('/')
  .get(userController.getUsers);

router.route('/:id')
  .get(restrictToOwnerOrAdmin, userController.getUser);

// Admin-only routes for user management
router.patch('/:id/status', adminOnly, userController.updateUserStatus);
router.patch('/:id/role', adminOnly, userController.updateUserRole);

module.exports = router;