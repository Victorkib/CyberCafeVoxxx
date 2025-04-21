import express from 'express';
import {
  getSpecialOffers,
  getActiveSpecialOffers,
  createSpecialOffer,
  updateSpecialOffer,
  deleteSpecialOffer,
} from '../controllers/specialOffer.controller.js';
import { authMiddleware, authorize } from '../middleware/auth.middleware.js';

const router = express.Router();

// Public routes
router.get('/', getSpecialOffers);
router.get('/active', getActiveSpecialOffers);

// Protected routes (admin only)
router.use(authMiddleware, authorize('admin', 'super_admin'));
router.post('/', createSpecialOffer);
router.put('/:id', updateSpecialOffer);
router.delete('/:id', deleteSpecialOffer);

export default router; 