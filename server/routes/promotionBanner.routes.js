import express from 'express';
import {
  getActivePromotionBanner,
  getPromotionBanners,
  createPromotionBanner,
  updatePromotionBanner,
  deletePromotionBanner,
} from '../controllers/promotionBanner.controller.js';
import { authMiddleware, authorize } from '../middleware/auth.middleware.js';

const router = express.Router();

// Public routes
router.get('/active', getActivePromotionBanner);

// Protected routes (admin only)
router.use(authMiddleware, authorize('admin', 'super_admin'));
router.get('/', getPromotionBanners);
router.post('/', createPromotionBanner);
router.put('/:id', updatePromotionBanner);
router.delete('/:id', deletePromotionBanner);

export default router;
