import jwt from 'jsonwebtoken';
import User from '../models/user.model.js';
import { asyncHandler } from './error.middleware.js';
import rateLimit from 'express-rate-limit';

// Protect routes
export const authMiddleware = asyncHandler(async (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    try {
      // Get token from header
      token = req.headers.authorization.split(' ')[1];

      // Verify token
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      // Get user from the token
      const user = await User.findById(decoded.id).select('-password');

      if (!user) {
        res.status(401);
        throw new Error('Not authorized');
      }

      // Check if account is locked
      if (user.isLocked) {
        if (user.lockedUntil && user.lockedUntil > new Date()) {
          res.status(403);
          throw new Error('Account is locked');
        } else {
          // Auto-unlock if lock duration has expired
          await user.unlockAccount();
        }
      }

      // Check if password has expired
      if (user.passwordExpiresAt && user.passwordExpiresAt < new Date()) {
        res.status(403);
        throw new Error('Password has expired. Please update your password.');
      }

      // Check if session is valid
      const session = user.activeSessions.find(s => s.token === token);
      if (!session) {
        res.status(401);
        throw new Error('Session expired or invalid');
      }

      // Update session activity
      await user.updateSessionActivity(token);

      // Add user to request
      req.user = user;
      next();
    } catch (error) {
      res.status(401);
      throw new Error('Not authorized');
    }
  }

  if (!token) {
    res.status(401);
    throw new Error('Not authorized, no token');
  }
});

// Grant access to specific roles
export const authorize = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        error: `User role ${req.user.role} is not authorized to access this route`,
      });
    }
    next();
  };
};

// Check if user is verified
export const requireVerified = asyncHandler(async (req, res, next) => {
  if (!req.user.isEmailVerified) {
    return res.status(403).json({
      success: false,
      error: 'Please verify your email to access this route',
    });
  }
  next();
});

// Rate limiting middleware
export const rateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: {
    success: false,
    error: 'Too many requests from this IP, please try again after 15 minutes',
  },
});

// Admin rate limiting middleware (more restrictive)
export const adminRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 50, // limit each IP to 50 requests per windowMs
  message: {
    success: false,
    error: 'Too many admin requests from this IP, please try again after 15 minutes',
  },
}); 