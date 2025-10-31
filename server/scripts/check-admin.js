import mongoose from 'mongoose';
import User from '../models/user.model.js';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

const checkAdmin = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    // Find all admin users
    const adminUsers = await User.find({ 
      role: { $in: ['admin', 'super_admin'] } 
    }).select('name email role status createdAt');

    console.log('Current admin users:');
    adminUsers.forEach(user => {
      console.log(`- Name: ${user.name}, Email: ${user.email}, Role: ${user.role}, Status: ${user.status}`);
    });

    // Find user with the target email
    const targetUser = await User.findOne({ email: 'voxcyberadmin@gmail.com' });
    if (targetUser) {
      console.log('\nTarget user found:');
      console.log(`- Name: ${targetUser.name}, Email: ${targetUser.email}, Role: ${targetUser.role}`);
    } else {
      console.log('\nNo user found with email: voxcyberadmin@gmail.com');
    }

  } catch (error) {
    console.error('Error checking admin:', error);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  }
};

// Run the check
checkAdmin();