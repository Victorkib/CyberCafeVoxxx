import cron from 'node-cron';
import Cart from '../models/cart.model.js';
import { sendAbandonedCartEmail } from './email.js';

// Initialize scheduled tasks
export const initializeScheduledTasks = () => {
  // Schedule abandoned cart check to run daily at midnight
  cron.schedule('0 0 * * *', async () => {
    console.log('Running abandoned cart check...');
    await processAbandonedCarts();
  });

  // Add more scheduled tasks here as needed
  // For example:
  // - Daily sales reports
  // - Inventory alerts
  // - Customer feedback requests
  // - Newsletter distribution
};

// Process abandoned carts
const processAbandonedCarts = async () => {
  try {
    // Find carts that have items and were last updated more than 24 hours ago
    const abandonedCarts = await Cart.find({
      items: { $exists: true, $ne: [] },
      updatedAt: { $lt: new Date(Date.now() - 24 * 60 * 60 * 1000) }
    }).populate('user', 'email name');

    console.log(`Found ${abandonedCarts.length} abandoned carts`);

    for (const cart of abandonedCarts) {
      try {
        if (cart.user && cart.user.email) {
          await sendAbandonedCartEmail(cart.user.email, cart.user.name, cart.items);
          console.log(`Sent abandoned cart email to ${cart.user.email}`);
        }
      } catch (error) {
        console.error(`Error sending abandoned cart email to ${cart.user?.email}:`, error);
      }
    }
  } catch (error) {
    console.error('Error processing abandoned carts:', error);
  }
}; 