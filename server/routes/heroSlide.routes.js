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
import { uploadFields, handleMulterError } from '../middleware/upload.middleware.js';

const router = express.Router();

// Public routes
router.get('/', getHeroSlides);
router.get('/active', getActiveHeroSlides);

// Multer fields for hero slide image uploads
const heroSlideUpload = uploadFields([
  { name: 'imageFile', maxCount: 1 },
  { name: 'mobileImageFile', maxCount: 1 },
]);

// Protected routes (admin only)
router.use(authMiddleware, authorize('admin', 'super_admin'));
router.post('/', heroSlideUpload, handleMulterError, createHeroSlide);
router.put('/:id', heroSlideUpload, handleMulterError, updateHeroSlide);
router.delete('/:id', deleteHeroSlide);
router.put('/order', updateHeroSlidesOrder);

export default router; 