import Notification from '../models/notification.model.js';
import { handleAsync } from '../utils/errorHandler.js';
import { RateLimiter } from '../utils/rateLimiter.js';

class NotificationService {
  constructor(io) {
    this.io = io;
    this.userSockets = new Map(); // Map to store user ID to socket ID mapping
    this.rateLimiter = new RateLimiter({
      windowMs: 15 * 60 * 1000, // 15 minutes
      max: 100 // limit each IP to 100 requests per windowMs
    });
    this.setupSocketHandlers();
  }

  setupSocketHandlers() {
    this.io.on('connection', (socket) => {
      console.log('Client connected:', socket.id);

      // Handle user authentication
      socket.on('authenticate', (userId) => {
        this.userSockets.set(userId, socket.id);
        console.log(`User ${userId} authenticated with socket ${socket.id}`);
      });

      // Handle disconnection
      socket.on('disconnect', () => {
        // Remove user from mapping
        for (const [userId, socketId] of this.userSockets.entries()) {
          if (socketId === socket.id) {
            this.userSockets.delete(userId);
            console.log(`User ${userId} disconnected`);
            break;
          }
        }
      });
    });
  }

  async checkRateLimit(userId) {
    return await this.rateLimiter.checkLimit(userId);
  }

  async saveAndDeliver(userId, notification) {
    const savedNotification = await Notification.create({
      ...notification,
      user: userId,
      delivered: false,
      deliveryAttempts: 0
    });

    const socketId = this.io.sockets.adapter.rooms.get(userId)?.values().next().value;
    if (socketId) {
      this.io.to(socketId).emit('notification', savedNotification);
      savedNotification.delivered = true;
      savedNotification.deliveryAttempts += 1;
      await savedNotification.save();
    }

    return savedNotification;
  }

  /**
   * Send a notification to a specific user
   * @param {string} userId - The ID of the user to notify
   * @param {Object} notification - The notification object
   */
  async sendNotificationToUser(userId, notification) {
    try {
      // Check rate limit
      const rateLimit = await this.checkRateLimit(userId);
      if (!rateLimit.allowed) {
        throw new Error('Rate limit exceeded. Please try again later.');
      }

      // Add retry mechanism
      const maxRetries = 3;
      let attempts = 0;
      let lastError = null;
      
      while (attempts < maxRetries) {
        try {
          const savedNotification = await this.saveAndDeliver(userId, notification);
          return savedNotification;
        } catch (error) {
          lastError = error;
          attempts++;
          if (attempts === maxRetries) break;
          await new Promise(resolve => setTimeout(resolve, 1000 * attempts));
        }
      }

      throw lastError || new Error('Failed to send notification after multiple attempts');
    } catch (error) {
      console.error('Error sending notification:', error);
      throw error;
    }
  }

  /**
   * Send a notification to multiple users
   * @param {Array<string>} userIds - Array of user IDs to notify
   * @param {Object} notification - The notification object
   */
  async sendNotificationToUsers(userIds, notification) {
    const savedNotifications = [];
    
    for (const userId of userIds) {
      try {
        const savedNotification = await this.sendNotificationToUser(userId, notification);
        savedNotifications.push(savedNotification);
      } catch (error) {
        console.error(`Error sending notification to user ${userId}:`, error);
      }
    }
    
    return savedNotifications;
  }

  /**
   * Send a notification to all connected users
   * @param {Object} notification - The notification object
   */
  async sendNotificationToAll(notification) {
    const savedNotifications = [];
    
    for (const [userId, socketId] of this.userSockets.entries()) {
      try {
        const savedNotification = await this.sendNotificationToUser(userId, notification);
        savedNotifications.push(savedNotification);
      } catch (error) {
        console.error(`Error sending notification to user ${userId}:`, error);
      }
    }
    
    return savedNotifications;
  }

  /**
   * Get notifications for a user with pagination
   */
  async getNotifications(userId, { page = 1, limit = 10 }) {
    const skip = (page - 1) * limit;
    
    const [notifications, total] = await Promise.all([
      Notification.find({ user: userId })
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),
      Notification.countDocuments({ user: userId })
    ]);

    return {
      notifications,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    };
  }

  /**
   * Mark a notification as read
   */
  async markAsRead(userId, notificationId) {
    const notification = await Notification.findOneAndUpdate(
      { _id: notificationId, user: userId },
      { read: true },
      { new: true }
    );
    
    if (!notification) {
      throw new Error('Notification not found');
    }
    
    return notification;
  }

  /**
   * Mark all notifications as read for a user
   */
  async markAllAsRead(userId) {
    await Notification.updateMany(
      { user: userId, read: false },
      { read: true }
    );
  }

  /**
   * Delete a notification
   */
  async deleteNotification(userId, notificationId) {
    const notification = await Notification.findOneAndDelete({
      _id: notificationId,
      user: userId
    });
    
    if (!notification) {
      throw new Error('Notification not found');
    }
    
    return notification;
  }

  /**
   * Get unread notification count for a user
   */
  async getUnreadCount(userId) {
    return Notification.countDocuments({
      user: userId,
      read: false
    });
  }
}

export default NotificationService; 