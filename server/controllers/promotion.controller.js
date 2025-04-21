import { createPromotionNotification } from '../utils/notificationHelper.js';

const createPromotion = async (req, res) => {
  try {
    // ... existing promotion creation code ...

    // Create promotion notification for all users
    await createPromotionNotification({
      title: 'New Promotion Available',
      message: `Check out our new ${promotion.name} promotion! ${promotion.description}`,
      link: `/promotions/${promotion._id}`,
      priority: 'medium'
    });

    // ... rest of the promotion creation code ...
  } catch (error) {
    // ... error handling ...
  }
};

const updatePromotion = async (req, res) => {
  try {
    // ... existing promotion update code ...

    // Create promotion update notification
    await createPromotionNotification({
      title: 'Promotion Updated',
      message: `The ${promotion.name} promotion has been updated. ${promotion.description}`,
      link: `/promotions/${promotion._id}`,
      priority: 'medium'
    });

    // ... rest of the promotion update code ...
  } catch (error) {
    // ... error handling ...
  }
};

const deletePromotion = async (req, res) => {
  try {
    // ... existing promotion deletion code ...

    // Create promotion deletion notification
    await createPromotionNotification({
      title: 'Promotion Ended',
      message: `The ${promotion.name} promotion has ended.`,
      link: '/promotions',
      priority: 'low'
    });

    // ... rest of the promotion deletion code ...
  } catch (error) {
    // ... error handling ...
  }
}; 