const express = require('express');
const authController = require('../controllers/AuthController');
const { protect, adminOnly } = require('../middlewares/auth');

const router = express.Router();

// Public routes (no authentication required)
router.post('/register', authController.register);
router.post('/login', authController.login);

// Protected routes (authentication required)
router.use(protect); // All routes after this middleware are protected

router.post('/logout', authController.logout);
router.get('/me', authController.getMe);
router.patch('/me', authController.updateMe);
router.patch('/change-password', authController.changePassword);

// Admin-only routes
router.post('/register-admin', adminOnly, authController.registerAdmin);

module.exports = router;