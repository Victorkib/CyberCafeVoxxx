import mongoose from 'mongoose';
import User from '../models/user.model.js';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

const setupAdmin = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    // Check if super admin already exists
    const existingSuperAdmin = await User.findOne({ role: 'super_admin' });
    
    if (existingSuperAdmin) {
      console.log('Super admin already exists:', existingSuperAdmin.email);
      
      let updated = false;
      
      // Update the name to voxcyberAdmin if it's different
      if (existingSuperAdmin.name !== 'voxcyberAdmin') {
        existingSuperAdmin.name = 'voxcyberAdmin';
        updated = true;
        console.log('Updated super admin name to voxcyberAdmin');
      }
      
      // Update the email to voxcyberadmin@gmail.com if it's different
      const targetEmail = 'voxcyberadmin@gmail.com';
      if (existingSuperAdmin.email !== targetEmail) {
        // Check if the target email is already taken by another user
        const emailExists = await User.findOne({ 
          email: targetEmail, 
          _id: { $ne: existingSuperAdmin._id } 
        });
        
        if (emailExists) {
          console.log('Target email already exists for another user. Removing duplicate...');
          await User.deleteOne({ _id: emailExists._id });
          console.log('Duplicate user removed');
        }
        
        existingSuperAdmin.email = targetEmail;
        updated = true;
        console.log('Updated super admin email to', targetEmail);
      }
      
      if (updated) {
        await existingSuperAdmin.save();
        console.log('Super admin updated successfully');
      } else {
        console.log('Super admin already has correct name and email');
      }
    } else {
      // Create new super admin user
      const superAdmin = new User({
        name: 'voxcyberAdmin',
        email: 'voxcyberadmin@gmail.com',
        password: process.env.INITIAL_ADMIN_PASSWORD || 'SecurePassword123!',
        role: 'super_admin',
        status: 'active',
        isEmailVerified: true
      });

      await superAdmin.save();
      console.log('Super admin created successfully:', superAdmin.email);
    }

    // Update any existing admin users to have proper names
    const adminUsers = await User.find({ role: 'admin' });
    for (const admin of adminUsers) {
      if (admin.name.includes('admin') && admin.name !== 'voxcyberAdmin') {
        admin.name = `${admin.name.replace(/admin/gi, 'Admin')}`;
        await admin.save();
        console.log(`Updated admin name: ${admin.email} -> ${admin.name}`);
      }
    }

    console.log('Admin setup completed successfully!');
    
  } catch (error) {
    console.error('Error setting up admin:', error);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  }
};

// Run the setup
setupAdmin();