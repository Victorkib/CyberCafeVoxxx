import express from 'express';
import {
  getHeroSlides,
  getActiveHeroSlides,
  createHeroSlide,
  updateHeroSlide,
  deleteHeroSlide,
  updateHeroSlidesOrder,
} from '../controllers/heroSlide.controller.js';
import { authMiddleware, authorize } from '../middleware/auth.middleware.js';

const router = express.Router();

// Public routes
router.get('/', getHeroSlides);
router.get('/active', getActiveHeroSlides);

// Protected routes (admin only)
router.use(authMiddleware, authorize('admin', 'super_admin'));
router.post('/', createHeroSlide);
router.put('/:id', updateHeroSlide);
router.delete('/:id', deleteHeroSlide);
router.put('/order', updateHeroSlidesOrder);

export default router; 