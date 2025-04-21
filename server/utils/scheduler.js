import cron from 'node-cron';
import Cart from '../models/cart.model.js';
import Notification from '../models/notification.model.js';
import { sendAbandonedCartEmail } from './email.js';

// Initialize scheduled tasks
export const initializeScheduledTasks = () => {
  // Schedule abandoned cart check to run daily at midnight
  cron.schedule('0 0 * * *', async () => {
    console.log('Running scheduled task: Checking abandoned carts...');
    await processAbandonedCarts();
  });

  // Clean up expired and old notifications daily at midnight
  cron.schedule('0 0 * * *', async () => {
    try {
      console.log('Running scheduled task: Cleaning up notifications...');

      // Delete expired notifications
      const expiredResult = await Notification.deleteMany({
        expiresAt: { $lt: new Date() },
      });
      console.log(`Deleted ${expiredResult.deletedCount} expired notifications`);

      // Delete notifications older than 90 days
      const ninetyDaysAgo = new Date();
      ninetyDaysAgo.setDate(ninetyDaysAgo.getDate() - 90);

      const oldResult = await Notification.deleteMany({
        createdAt: { $lt: ninetyDaysAgo },
      });
      console.log(`Deleted ${oldResult.deletedCount} old notifications`);
    } catch (error) {
      console.error('Error cleaning up notifications:', error);
    }
  });

  // Retry undelivered notifications every hour
  cron.schedule('0 * * * *', async () => {
    try {
      console.log('Running scheduled task: Retrying undelivered notifications...');

      if (global.notificationService) {
        const result = await global.notificationService.retryUndeliveredNotifications();
        console.log(`Retried ${result.total} notifications, ${result.success} successful`);
      }
    } catch (error) {
      console.error('Error retrying notifications:', error);
    }
  });

  // Add more scheduled tasks here as needed
};

// Process abandoned carts
const processAbandonedCarts = async () => {
  try {
    const abandonedCarts = await Cart.find({
      items: { $exists: true, $ne: [] },
      updatedAt: { $lt: new Date(Date.now() - 24 * 60 * 60 * 1000) },
    }).populate('user', 'email name');

    console.log(`Found ${abandonedCarts.length} abandoned carts`);

    for (const cart of abandonedCarts) {
      try {
        if (cart.user?.email) {
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
