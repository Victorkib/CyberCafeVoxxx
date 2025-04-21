import express from 'express';
import { authMiddleware, authorize } from '../middleware/auth.middleware.js';
import {
  getSettings,
  updateGeneralSettings,
  updatePaymentSettings,
  updateShippingSettings,
  updateEmailSettings
} from '../controllers/settings.controller.js';

const router = express.Router();

// Protect all routes after this middleware
router.use(authMiddleware);
router.use(authorize('admin', 'super_admin'));

router.get('/', getSettings);
router.patch('/general', updateGeneralSettings);
router.patch('/payment', updatePaymentSettings);
router.patch('/shipping', updateShippingSettings);
router.patch('/email', updateEmailSettings);

export default router; 