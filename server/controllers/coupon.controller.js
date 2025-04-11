import Coupon from '../models/coupon.model.js';
import { asyncHandler } from '../middleware/error.middleware.js';

// @desc    Validate and apply coupon
// @route   POST /api/coupons/validate
// @access  Private
export const validateCoupon = asyncHandler(async (req, res) => {
  const { code, cartTotal } = req.body;

  const coupon = await Coupon.findOne({ code: code.toUpperCase() });

  if (!coupon) {
    res.status(404);
    throw new Error('Invalid coupon code');
  }

  if (!coupon.isValid(req.user._id, cartTotal)) {
    res.status(400);
    throw new Error('Coupon is not valid');
  }

  const discount = coupon.calculateDiscount(cartTotal);

  res.json({
    coupon: {
      code: coupon.code,
      type: coupon.type,
      value: coupon.value,
      discount,
    },
  });
});

// @desc    Apply coupon to cart
// @route   POST /api/coupons/apply
// @access  Private
export const applyCoupon = asyncHandler(async (req, res) => {
  const { code, cartTotal } = req.body;

  const coupon = await Coupon.findOne({ code: code.toUpperCase() });

  if (!coupon) {
    res.status(404);
    throw new Error('Invalid coupon code');
  }

  if (!coupon.isValid(req.user._id, cartTotal)) {
    res.status(400);
    throw new Error('Coupon is not valid');
  }

  const discount = coupon.calculateDiscount(cartTotal);
  await coupon.apply(req.user._id);

  res.json({
    coupon: {
      code: coupon.code,
      type: coupon.type,
      value: coupon.value,
      discount,
    },
  });
});

// @desc    Create a coupon
// @route   POST /api/coupons
// @access  Private/Admin
export const createCoupon = asyncHandler(async (req, res) => {
  const {
    code,
    type,
    value,
    minPurchase,
    maxDiscount,
    startDate,
    endDate,
    usageLimit,
    userUsageLimit,
    products,
    categories,
  } = req.body;

  const coupon = await Coupon.create({
    code: code.toUpperCase(),
    type,
    value,
    minPurchase,
    maxDiscount,
    startDate,
    endDate,
    usageLimit,
    userUsageLimit,
    products,
    categories,
  });

  res.status(201).json(coupon);
});

// @desc    Get all coupons
// @route   GET /api/coupons
// @access  Private/Admin
export const getCoupons = asyncHandler(async (req, res) => {
  const coupons = await Coupon.find({}).sort({ createdAt: -1 });
  res.json(coupons);
});

// @desc    Get single coupon
// @route   GET /api/coupons/:id
// @access  Private/Admin
export const getCouponById = asyncHandler(async (req, res) => {
  const coupon = await Coupon.findById(req.params.id);

  if (coupon) {
    res.json(coupon);
  } else {
    res.status(404);
    throw new Error('Coupon not found');
  }
});

// @desc    Update coupon
// @route   PUT /api/coupons/:id
// @access  Private/Admin
export const updateCoupon = asyncHandler(async (req, res) => {
  const {
    code,
    type,
    value,
    minPurchase,
    maxDiscount,
    startDate,
    endDate,
    usageLimit,
    userUsageLimit,
    products,
    categories,
    status,
  } = req.body;

  const coupon = await Coupon.findById(req.params.id);

  if (coupon) {
    coupon.code = code ? code.toUpperCase() : coupon.code;
    coupon.type = type || coupon.type;
    coupon.value = value || coupon.value;
    coupon.minPurchase = minPurchase || coupon.minPurchase;
    coupon.maxDiscount = maxDiscount || coupon.maxDiscount;
    coupon.startDate = startDate || coupon.startDate;
    coupon.endDate = endDate || coupon.endDate;
    coupon.usageLimit = usageLimit || coupon.usageLimit;
    coupon.userUsageLimit = userUsageLimit || coupon.userUsageLimit;
    coupon.products = products || coupon.products;
    coupon.categories = categories || coupon.categories;
    coupon.status = status || coupon.status;

    const updatedCoupon = await coupon.save();
    res.json(updatedCoupon);
  } else {
    res.status(404);
    throw new Error('Coupon not found');
  }
});

// @desc    Delete coupon
// @route   DELETE /api/coupons/:id
// @access  Private/Admin
export const deleteCoupon = asyncHandler(async (req, res) => {
  const coupon = await Coupon.findById(req.params.id);

  if (coupon) {
    await coupon.remove();
    res.json({ message: 'Coupon removed' });
  } else {
    res.status(404);
    throw new Error('Coupon not found');
  }
}); 