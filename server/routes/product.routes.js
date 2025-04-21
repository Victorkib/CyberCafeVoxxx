import express from 'express';
import {
  getProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
  createProductReview,
  getTopProducts,
  getNewArrivals,
  getSaleProducts,
  getRelatedProducts,
  getFeaturedProducts,
  updateProductStatus,
  bulkDeleteProducts,
  bulkUpdateProductStatus
} from '../controllers/product.controller.js';
import { authMiddleware, authorize } from '../middleware/auth.middleware.js';

const router = express.Router();

// Public routes
router.get('/', getProducts);
router.get('/top', getTopProducts);
router.get('/featured', getFeaturedProducts);
router.get('/new-arrivals', getNewArrivals);
router.get('/sale', getSaleProducts);
router.get('/:id/related', getRelatedProducts);
router.get('/:id', getProductById);

// Protected routes
router.post('/:id/reviews', authMiddleware, createProductReview);

// Admin routes
router.post('/', authMiddleware, authorize('admin', 'super_admin'), createProduct);
router.put('/:id', authMiddleware, authorize('admin', 'super_admin'), updateProduct);
router.delete('/:id', authMiddleware, authorize('admin', 'super_admin'), deleteProduct);
router.patch('/:id/status', authMiddleware, authorize('admin', 'super_admin'), updateProductStatus);

// Bulk operations
router.post('/bulk-delete', authMiddleware, authorize('admin', 'super_admin'), bulkDeleteProducts);
router.post('/bulk-update-status', authMiddleware, authorize('admin', 'super_admin'), bulkUpdateProductStatus);

export default router;