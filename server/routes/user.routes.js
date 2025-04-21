import express from 'express';
import {
  getUsers,
  getUser,
  updateProfile,
  updateProfileImage,
  deleteUser,
  getUserStats,
} from '../controllers/user.controller.js';
import { authMiddleware, authorize } from '../middleware/auth.middleware.js';

const router = express.Router();

// Admin routes
router.get('/', authMiddleware, authorize('admin', 'super_admin'), getUsers);
router.get('/stats', authMiddleware, authorize('admin', 'super_admin'), getUserStats);
router.get('/:id', authMiddleware, authorize('admin', 'super_admin'), getUser);
router.delete('/:id', authMiddleware, authorize('admin', 'super_admin'), deleteUser);

// User routes
router.put('/profile', authMiddleware, updateProfile);
router.put('/profile/image', authMiddleware, updateProfileImage);

export default router; 