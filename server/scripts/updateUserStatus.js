import mongoose from 'mongoose';
import User from '../models/user.model.js';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load environment variables
dotenv.config({ path: join(__dirname, '../.env') });

async function updateUserStatus() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    // Update users without status field
    const result = await User.updateMany(
      { status: { $exists: false } },
      { $set: { status: 'active' } }
    );

    console.log(`Updated ${result.modifiedCount} users`);
    
    // Disconnect from MongoDB
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  } catch (error) {
    console.error('Error updating user status:', error);
    process.exit(1);
  }
}

updateUserStatus(); 