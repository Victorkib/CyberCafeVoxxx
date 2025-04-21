import express from 'express';
import {
  register,
  login,
  getMe,
  updatePassword,
  forgotPassword,
  resetPassword,
  getActiveSessions,
  revokeSession,
  lockAccount,
  unlockAccount,
  refreshAccessToken,
  logout
} from '../controllers/auth.controller.js';
import { authMiddleware, rateLimiter } from '../middleware/auth.middleware.js';

const router = express.Router();

// Public routes
router.post('/register', rateLimiter, register);
router.post('/login', rateLimiter, login);
router.post('/forgot-password', rateLimiter, forgotPassword);
router.post('/reset-password', rateLimiter, resetPassword);
router.post('/refresh-token', rateLimiter, refreshAccessToken);
router.post('/logout', logout);

// Protected routes
router.get('/me', authMiddleware, getMe);
router.put('/update-password', authMiddleware, updatePassword);
router.get('/sessions', authMiddleware, getActiveSessions);
router.delete('/sessions/:token', authMiddleware, revokeSession);

// Admin routes
router.post('/lock-account', authMiddleware, lockAccount);
router.post('/unlock-account', authMiddleware, unlockAccount);

export default router;