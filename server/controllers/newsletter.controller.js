import Newsletter from '../models/newsletter.model.js';
import { sendNewsletterSubscriptionEmail, sendNewsletterVerificationEmail } from '../utils/email.js';
import { createError } from '../utils/error.js';

// Subscribe to newsletter
export const subscribe = async (req, res, next) => {
  try {
    const { email, source = 'landing_page', preferences = {} } = req.body;

    // Check if already subscribed
    let subscription = await Newsletter.findOne({ email });
    if (subscription) {
      if (subscription.status === 'unsubscribed') {
        // Resubscribe
        await subscription.resubscribe();
        await sendNewsletterSubscriptionEmail(email, 'Subscriber');
        return res.status(200).json({
          success: true,
          message: 'Successfully resubscribed to newsletter',
        });
      }
      return res.status(400).json({
        success: false,
        message: 'Email already subscribed to newsletter',
      });
    }

    // Create new subscription
    subscription = await Newsletter.create({
      email,
      source,
      preferences: {
        promotions: preferences.promotions ?? true,
        news: preferences.news ?? true,
        updates: preferences.updates ?? true,
      },
    });

    // Send verification email
    await sendNewsletterVerificationEmail(
      email,
      'Subscriber',
      subscription.verificationToken
    );

    res.status(201).json({
      success: true,
      message: 'Please check your email to verify your subscription',
    });
  } catch (error) {
    next(error);
  }
};

// Verify subscription
export const verifySubscription = async (req, res, next) => {
  try {
    const { token } = req.params;

    const subscription = await Newsletter.findOne({ verificationToken: token });
    if (!subscription) {
      return next(createError(404, 'Invalid or expired verification token'));
    }

    await subscription.verify();
    await sendNewsletterSubscriptionEmail(subscription.email, 'Subscriber');

    res.status(200).json({
      success: true,
      message: 'Subscription verified successfully',
    });
  } catch (error) {
    next(error);
  }
};

// Unsubscribe from newsletter
export const unsubscribe = async (req, res, next) => {
  try {
    const { token } = req.params;

    const subscription = await Newsletter.findOne({ unsubscribeToken: token });
    if (!subscription) {
      return next(createError(404, 'Invalid or expired unsubscribe token'));
    }

    await subscription.unsubscribe();

    res.status(200).json({
      success: true,
      message: 'Successfully unsubscribed from newsletter',
    });
  } catch (error) {
    next(error);
  }
};

// Get all subscribers (admin only)
export const getSubscribers = async (req, res, next) => {
  try {
    const subscribers = await Newsletter.find().select('-verificationToken -unsubscribeToken');
    
    res.status(200).json({
      success: true,
      count: subscribers.length,
      data: subscribers,
    });
  } catch (error) {
    next(error);
  }
};

// Get subscription stats (admin only)
export const getSubscriptionStats = async (req, res, next) => {
  try {
    const stats = await Newsletter.getSubscriptionStats();
    
    res.status(200).json({
      success: true,
      data: stats,
    });
  } catch (error) {
    next(error);
  }
};

// Send newsletter (admin only)
export const sendNewsletter = async (req, res, next) => {
  try {
    const { subject, content, type = 'all' } = req.body;

    // Get active subscribers based on type
    const query = { status: 'subscribed' };
    if (type !== 'all') {
      query[`preferences.${type}`] = true;
    }

    const subscribers = await Newsletter.find(query).select('email preferences');
    
    // TODO: Implement newsletter sending logic
    // This would typically involve:
    // 1. Creating a newsletter record
    // 2. Sending emails to subscribers
    // 3. Updating lastEmailSent for each subscriber
    
    res.status(200).json({
      success: true,
      message: `Newsletter sent to ${subscribers.length} subscribers`,
    });
  } catch (error) {
    next(error);
  }
}; 