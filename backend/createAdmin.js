require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./src/models/User');
const bcrypt = require('bcryptjs');

const createAdminUser = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    // Admin user data
    const adminData = {
      username: 'admin',
      password: 'admin123',
      role: 'admin',
      isActive: true
    };

    // Check if admin already exists
    const existingAdmin = await User.findOne({ username: 'admin' });
    if (existingAdmin) {
      console.log('Admin user already exists:');
      console.log(existingAdmin);
      await mongoose.disconnect();
      return;
    }

    // Hash password
    adminData.password = await bcrypt.hash(adminData.password, 12);

    // Create admin user
    const admin = await User.create(adminData);
    console.log('Admin user created successfully:');
    console.log({
      id: admin._id,
      username: admin.username,
      role: admin.role,
      isActive: admin.isActive,
      createdAt: admin.createdAt
    });

    await mongoose.disconnect();
  } catch (error) {
    console.error('Error creating admin user:', error);
    process.exit(1);
  }
};

createAdminUser();