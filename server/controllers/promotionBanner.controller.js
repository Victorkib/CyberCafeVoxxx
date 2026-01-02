import { asyncHandler } from '../middleware/error.middleware.js';
import PromotionBanner from '../models/promotionBanner.model.js';

// @desc    Get active promotion banner
// @route   GET /api/promotion-banner/active
// @access  Public
export const getActivePromotionBanner = asyncHandler(async (req, res) => {
  const now = new Date();
  const banner = await PromotionBanner.findOne({
    isActive: true,
    startDate: { $lte: now },
    $or: [
      { endDate: { $gte: now } },
      { endDate: null }
    ]
  }).sort({ createdAt: -1 });

  res.json({
    success: true,
    data: banner,
  });
});

// @desc    Get all promotion banners
// @route   GET /api/promotion-banner
// @access  Private/Admin
export const getPromotionBanners = asyncHandler(async (req, res) => {
  const banners = await PromotionBanner.find().sort({ createdAt: -1 });

  res.json({
    success: true,
    data: banners,
  });
});

// @desc    Create a promotion banner
// @route   POST /api/promotion-banner
// @access  Private/Admin
export const createPromotionBanner = asyncHandler(async (req, res) => {
  const { startDate, endDate, ...rest } = req.body;
  
  const bannerData = {
    ...rest,
    startDate: startDate ? new Date(startDate) : new Date(),
    endDate: endDate && endDate.trim() !== '' ? new Date(endDate) : undefined,
  };

  const banner = await PromotionBanner.create(bannerData);

  res.status(201).json({
    success: true,
    data: banner,
  });
});

// @desc    Update a promotion banner
// @route   PUT /api/promotion-banner/:id
// @access  Private/Admin
export const updatePromotionBanner = asyncHandler(async (req, res) => {
  const banner = await PromotionBanner.findById(req.params.id);

  if (!banner) {
    return res.status(404).json({
      success: false,
      error: 'Promotion banner not found',
    });
  }

  const { startDate, endDate, ...rest } = req.body;
  
  const updateData = {
    ...rest,
  };

  if (startDate) {
    updateData.startDate = new Date(startDate);
  }

  if (endDate !== undefined) {
    updateData.endDate = endDate && endDate.trim() !== '' ? new Date(endDate) : null;
  }

  const updatedBanner = await PromotionBanner.findByIdAndUpdate(
    req.params.id,
    updateData,
    {
      new: true,
      runValidators: true,
    }
  );

  res.json({
    success: true,
    data: updatedBanner,
  });
});

// @desc    Delete a promotion banner
// @route   DELETE /api/promotion-banner/:id
// @access  Private/Admin
export const deletePromotionBanner = asyncHandler(async (req, res) => {
  const banner = await PromotionBanner.findById(req.params.id);

  if (!banner) {
    return res.status(404).json({
      success: false,
      error: 'Promotion banner not found',
    });
  }

  await banner.deleteOne();

  res.json({
    success: true,
    data: {},
  });
});
