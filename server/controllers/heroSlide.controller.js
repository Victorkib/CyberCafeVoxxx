
import { asyncHandler } from '../middleware/error.middleware.js';
import HeroSlide from '../models/heroSlide.model.js';

// @desc    Get all hero slides
// @route   GET /api/hero-slides
// @access  Public
export const getHeroSlides = asyncHandler(async (req, res) => {
  const heroSlides = await HeroSlide.find().sort({ order: 1 });

  res.json({
    success: true,
    data: heroSlides,
  });
});

// @desc    Get active hero slides
// @route   GET /api/hero-slides/active
// @access  Public
export const getActiveHeroSlides = asyncHandler(async (req, res) => {
  const now = new Date();
  const activeSlides = await HeroSlide.find({
    startDate: { $lte: now },
    endDate: { $gte: now },
    isActive: true,
  }).sort({ order: 1 });

  res.json({
    success: true,
    data: activeSlides,
  });
});

// @desc    Create a hero slide
// @route   POST /api/hero-slides
// @access  Private/Admin
export const createHeroSlide = asyncHandler(async (req, res) => {
  const heroSlide = await HeroSlide.create(req.body);

  res.status(201).json({
    success: true,
    data: heroSlide,
  });
});

// @desc    Update a hero slide
// @route   PUT /api/hero-slides/:id
// @access  Private/Admin
export const updateHeroSlide = asyncHandler(async (req, res) => {
  const heroSlide = await HeroSlide.findById(req.params.id);

  if (!heroSlide) {
    return res.status(404).json({
      success: false,
      error: 'Hero slide not found',
    });
  }

  const updatedHeroSlide = await HeroSlide.findByIdAndUpdate(
    req.params.id,
    req.body,
    {
      new: true,
      runValidators: true,
    }
  );

  res.json({
    success: true,
    data: updatedHeroSlide,
  });
});

// @desc    Delete a hero slide
// @route   DELETE /api/hero-slides/:id
// @access  Private/Admin
export const deleteHeroSlide = asyncHandler(async (req, res) => {
  const heroSlide = await HeroSlide.findById(req.params.id);

  if (!heroSlide) {
    return res.status(404).json({
      success: false,
      error: 'Hero slide not found',
    });
  }

  await heroSlide.remove();

  res.json({
    success: true,
    data: {},
  });
});

// @desc    Update hero slides order
// @route   PUT /api/hero-slides/order
// @access  Private/Admin
export const updateHeroSlidesOrder = asyncHandler(async (req, res) => {
  const { slides } = req.body;

  // Update each slide's order
  await Promise.all(
    slides.map(async (slide) => {
      await HeroSlide.findByIdAndUpdate(slide.id, { order: slide.order });
    })
  );

  res.json({
    success: true,
    message: 'Hero slides order updated successfully',
  });
}); 