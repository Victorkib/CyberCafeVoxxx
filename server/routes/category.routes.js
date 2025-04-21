import express from 'express';
import {
  getCategories,
  getCategoryById,
  createCategory,
  updateCategory,
  deleteCategory,
  getFeaturedCategories,
} from '../controllers/category.controller.js';
import { authMiddleware, authorize } from '../middleware/auth.middleware.js';

const router = express.Router();

// Public routes
router.get('/', getCategories);
router.get('/featured', getFeaturedCategories);
router.get('/:id', getCategoryById);

// Admin routes
router.post('/', authMiddleware, authorize('admin', 'super_admin'), createCategory);
router.put('/:id', authMiddleware, authorize('admin', 'super_admin'), updateCategory);
router.delete('/:id', authMiddleware, authorize('admin', 'super_admin'), deleteCategory);

export default router; 