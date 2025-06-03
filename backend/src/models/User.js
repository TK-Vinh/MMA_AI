const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  username: { 
    type: String, 
    unique: true,
    required: [true, 'Username is required'],
    minlength: [3, 'Username must be at least 3 characters']
  },
  password: {
    type: String,
    required: [true, 'Password is required'],
    minlength: [6, 'Password must be at least 6 characters']
  },
  role: {
    type: String,
    enum: ['user', 'admin'],
    default: 'user'
  },
  isActive: {
    type: Boolean,
    default: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  lastLogin: {
    type: Date
  }
}, {
  timestamps: true
});

// Hash password before saving
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

// Password verification method
userSchema.methods.correctPassword = async function(candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

// Check if user has required role
userSchema.methods.hasRole = function(requiredRole) {
  if (requiredRole === 'admin') {
    return this.role === 'admin';
  }
  return true; // Users can access user-level resources
};

// Check if user can manage other users
userSchema.methods.canManageUsers = function() {
  return this.role === 'admin';
};

// Check if user can manage fragrances
userSchema.methods.canManageFragrances = function() {
  return this.role === 'admin';
};

module.exports = mongoose.model('User', userSchema);