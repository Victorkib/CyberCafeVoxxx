import express from 'express';
import { authMiddleware, authorize } from '../middleware/auth.middleware.js';
import {
  getSalesReport,
  getInventoryReport,
  getCustomerReport,
  getOrderReport
} from '../controllers/report.controller.js';

const router = express.Router();

// Protect all routes after this middleware
router.use(authMiddleware);
router.use(authorize('admin', 'super_admin'));

router.get('/sales', getSalesReport);
router.get('/inventory', getInventoryReport);
router.get('/customers', getCustomerReport);
router.get('/orders', getOrderReport);

export default router; 