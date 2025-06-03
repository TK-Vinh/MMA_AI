// const { verifyToken } = require('../utils/jwt');
// const User = require('../models/User');

// // Middleware to protect routes - requires authentication
// exports.protect = async (req, res, next) => {
//   try {
//     // 1) Get token from header
//     let token;
//     if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
//       token = req.headers.authorization.split(' ')[1];
//     }

//     if (!token) {
//       return res.status(401).json({
//         status: 'fail',
//         message: 'You are not logged in! Please log in to get access.'
//       });
//     }

//     // 2) Verify token
//     const decoded = verifyToken(token);

//     // 3) Check if user still exists
//     const currentUser = await User.findById(decoded.userId);
//     if (!currentUser) {
//       return res.status(401).json({
//         status: 'fail',
//         message: 'The user belonging to this token does no longer exist.'
//       });
//     }

//     // 4) Check if user is active
//     if (!currentUser.isActive) {
//       return res.status(401).json({
//         status: 'fail',
//         message: 'Your account has been deactivated. Please contact support.'
//       });
//     }

//     // Grant access to protected route
//     req.user = currentUser;
//     next();
//   } catch (error) {
//     return res.status(401).json({
//       status: 'fail',
//       message: 'Invalid token. Please log in again!'
//     });
//   }
// };

// // Middleware to restrict access to specific roles
// exports.restrictTo = (...roles) => {
//   return (req, res, next) => {
//     // roles is an array like ['admin', 'user']
//     if (!roles.includes(req.user.role)) {
//       return res.status(403).json({
//         status: 'fail',
//         message: 'You do not have permission to perform this action'
//       });
//     }
//     next();
//   };
// };

// // Middleware specifically for admin-only routes
// exports.adminOnly = (req, res, next) => {
//   if (req.user.role !== 'admin') {
//     return res.status(403).json({
//       status: 'fail',
//       message: 'Access denied. Admin privileges required.'
//     });
//   }
//   next();
// };

// // Middleware to check if user can manage other users
// exports.canManageUsers = (req, res, next) => {
//   if (!req.user.canManageUsers()) {
//     return res.status(403).json({
//       status: 'fail',
//       message: 'You do not have permission to manage users'
//     });
//   }
//   next();
// };

// // Middleware to check if user can manage fragrances
// exports.canManageFragrances = (req, res, next) => {
//   if (!req.user.canManageFragrances()) {
//     return res.status(403).json({
//       status: 'fail',
//       message: 'You do not have permission to manage fragrances'
//     });
//   }
//   next();
// };

// // Middleware to allow users to access their own data or admins to access any data
// exports.restrictToOwnerOrAdmin = (req, res, next) => {
//   const userId = req.params.userId || req.params.id;
  
//   // Admin can access any user's data
//   if (req.user.role === 'admin') {
//     return next();
//   }
  
//   // Users can only access their own data
//   if (req.user._id.toString() !== userId) {
//     return res.status(403).json({
//       status: 'fail',
//       message: 'You can only access your own data'
//     });
//   }
  
//   next();
// };