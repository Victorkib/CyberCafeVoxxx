import { asyncHandler } from '../middleware/error.middleware.js';
import SpecialOffer from '../models/specialOffer.model.js';
import { createPromotionNotification } from '../utils/notificationHelper.js';
import User from '../models/user.model.js';

// @desc    Get all special offers
// @route   GET /api/special-offers
// @access  Public
export const getSpecialOffers = asyncHandler(async (req, res) => {
  const specialOffers = await SpecialOffer.find().sort({ createdAt: -1 });

  res.json({
    success: true,
    data: specialOffers,
  });
});

// @desc    Get active special offers
// @route   GET /api/special-offers/active
// @access  Public
export const getActiveSpecialOffers = asyncHandler(async (req, res) => {
  const now = new Date();
  const activeOffers = await SpecialOffer.find({
    startDate: { $lte: now },
    endDate: { $gte: now },
    isActive: true,
  }).sort({ createdAt: -1 });

  res.json({
    success: true,
    data: activeOffers,
  });
});

// @desc    Create a special offer
// @route   POST /api/special-offers
// @access  Private/Admin
export const createSpecialOffer = asyncHandler(async (req, res) => {
  const specialOffer = await SpecialOffer.create(req.body);

  // Notify all users about the new special offer
  try {
    // Get all active users
    const users = await User.find({ isActive: true });
    
    // Create notifications for each user
    for (const user of users) {
      await createPromotionNotification({
        userId: user._id,
        title: `New Special Offer: ${specialOffer.title}`,
        message: specialOffer.description,
        link: `/special-offers/${specialOffer._id}`
      });
    }
  } catch (error) {
    console.error('Error creating special offer notifications:', error);
    // Continue with the response even if notifications fail
  }

  res.status(201).json({
    success: true,
    data: specialOffer,
  });
});

// @desc    Update a special offer
// @route   PUT /api/special-offers/:id
// @access  Private/Admin
export const updateSpecialOffer = asyncHandler(async (req, res) => {
  const specialOffer = await SpecialOffer.findById(req.params.id);

  if (!specialOffer) {
    return res.status(404).json({
      success: false,
      error: 'Special offer not found',
    });
  }

  const updatedSpecialOffer = await SpecialOffer.findByIdAndUpdate(
    req.params.id,
    req.body,
    {
      new: true,
      runValidators: true,
    }
  );

  // If the offer is being activated, notify users
  if (req.body.isActive && !specialOffer.isActive) {
    try {
      // Get all active users
      const users = await User.find({ isActive: true });
      
      // Create notifications for each user
      for (const user of users) {
        await createPromotionNotification({
          userId: user._id,
          title: `Special Offer Available: ${updatedSpecialOffer.title}`,
          message: updatedSpecialOffer.description,
          link: `/special-offers/${updatedSpecialOffer._id}`
        });
      }
    } catch (error) {
      console.error('Error creating special offer notifications:', error);
      // Continue with the response even if notifications fail
    }
  }

  res.json({
    success: true,
    data: updatedSpecialOffer,
  });
});

// @desc    Delete a special offer
// @route   DELETE /api/special-offers/:id
// @access  Private/Admin
export const deleteSpecialOffer = asyncHandler(async (req, res) => {
  const specialOffer = await SpecialOffer.findById(req.params.id);

  if (!specialOffer) {
    return res.status(404).json({
      success: false,
      error: 'Special offer not found',
    });
  }

  await specialOffer.remove();

  res.json({
    success: true,
    data: {},
  });
}); 