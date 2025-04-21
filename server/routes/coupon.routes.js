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
  .get(authMiddleware, authorize('admin', 'super_admin'), getCoupons)
  .post(authMiddleware, authorize('admin', 'super_admin'), createCoupon);

router.route('/:id')
  .get(authMiddleware, authorize('admin', 'super_admin'), getCouponById)
  .put(authMiddleware, authorize('admin', 'super_admin'), updateCoupon)
  .delete(authMiddleware, authorize('admin', 'super_admin'), deleteCoupon);

export default router; 