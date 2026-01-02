import jwt from 'jsonwebtoken';
import User from '../models/user.model.js';
import { asyncHandler } from './error.middleware.js';
import rateLimit from 'express-rate-limit';

// Rate limiter configuration
export const rateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 1000, // limit each IP to 10 requests per windowMs
  message: 'Too many attempts, please try again after 15 minutes',
});

const SESSION_TIMEOUT = 2 * 60 * 60 * 1000; // 2 hours

// SOLUTION: Auth middleware with refresh token
export const authMiddleware = asyncHandler(async (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    try {
      token = req.headers.authorization.split(' ')[1];

      // First, find user via token in active sessions
      const user = await User.findOne({
        'activeSessions.token': token,
      }).select('-password');

      if (!user) {
        res.status(401);
        throw new Error('Session invalid or expired');
      }

      // Get matching session
      const session = user.activeSessions.find((s) => s.token === token);
      if (!session) {
        res.status(401);
        throw new Error('Invalid session. Please login again.');
      }

      const lastActivity = new Date(session.lastActivity);

      // ⏰ Session expired?
      if (Date.now() - lastActivity > SESSION_TIMEOUT) {
        console.log('Session timeout detected');

        const refreshToken = session.refreshToken;
        if (refreshToken) {
          try {
            // Attempt refresh
            const refreshDecoded = jwt.verify(
              refreshToken,
              process.env.JWT_REFRESH_SECRET
            );
            // If valid, refresh activity and allow
            await user.updateSessionActivity(token);
            console.log('Session refreshed via middleware');
          } catch (refreshError) {
            await user.removeSession(token);
            res.status(401);
            throw new Error('Session timeout. Please login again.');
          }
        } else {
          await user.removeSession(token);
          res.status(401);
          throw new Error('Session timeout. Please login again.');
        }
      } else {
        // Session is still valid → update activity
        await user.updateSessionActivity(token);
      }

      // ✅ Now verify the JWT itself
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      if (decoded.id !== user._id.toString()) {
        res.status(401);
        throw new Error('Invalid token');
      }

      // 🔒 Account lock check
      if (user.isLocked) {
        if (user.lockedUntil && user.lockedUntil > new Date()) {
          res.status(403);
          throw new Error('Account is locked');
        } else {
          await user.unlockAccount();
        }
      }

      // 🔐 Password expiration check
      // Allow read operations and essential routes even with expired passwords
      const isUpdatePasswordRoute = req.path.includes('/update-password');
      const isReadOperation = req.method === 'GET';
      const isAuthRoute = req.path.includes('/auth/me') || req.path.includes('/auth/sessions');
      
      // Only enforce password expiration for write operations (POST, PUT, DELETE, PATCH)
      // Allow read operations and auth routes so users can view their profile and update password
      const shouldCheckExpiration = !isUpdatePasswordRoute && !isReadOperation && !isAuthRoute;
      
      if (shouldCheckExpiration && user.passwordExpiresAt && user.passwordExpiresAt < new Date()) {
        return res.status(403).json({
          success: false,
          error: 'Password has expired. Please update your password.',
          message: 'Password has expired. Please update your password.'
        });
      }

      // ✅ Attach user to request
      req.user = user;
      next();
    } catch (error) {
      console.error('Auth error:', error.message);
      if (error.name === 'JsonWebTokenError') {
        res.status(401);
        throw new Error('Invalid token');
      } else if (error.name === 'TokenExpiredError') {
        res.status(401);
        throw new Error('Token expired');
      }
      throw error;
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

// Admin rate limiting middleware (more restrictive)
export const adminRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 1000, // limit each IP to 50 requests per windowMs
  message: {
    success: false,
    error:
      'Too many admin requests from this IP, please try again after 15 minutes',
  },
});
