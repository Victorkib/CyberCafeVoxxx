import express from 'express';
import {
  validateCoupon,
  applyCoupon,
  createCoupon,
  getCoupons,
  getCouponById,
  updateCoupon,
  deleteCoupon,
} from '../controllers/coupon.controller.js';
import { authMiddleware, authorize } from '../middleware/auth.middleware.js';

const router = express.Router();

// Public routes
router.post('/validate', authMiddleware, validateCoupon);
router.post('/apply', authMiddleware, applyCoupon);

// Admin routes
router.route('/')
  .get(authMiddleware, authorize('admin'), getCoupons)
  .post(authMiddleware, authorize('admin'), createCoupon);

router.route('/:id')
  .get(authMiddleware, authorize('admin'), getCouponById)
  .put(authMiddleware, authorize('admin'), updateCoupon)
  .delete(authMiddleware, authorize('admin'), deleteCoupon);

export default router; 