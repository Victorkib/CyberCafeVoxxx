import express from 'express';
import {
  register,
  login,
  getMe,
  updatePassword,
  forgotPassword,
  resetPassword,
} from '../controllers/auth.controller.js';
import { authMiddleware } from '../middleware/auth.middleware.js';

const router = express.Router();

// Public routes
router.post('/register', register);
router.post('/login', login);
router.post('/forgot-password', forgotPassword);
router.post('/reset-password', resetPassword);

// Protected routes
router.get('/me', authMiddleware, getMe);
router.put('/update-password', authMiddleware, updatePassword);

export default router; 