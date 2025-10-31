import { createError } from '../utils/error.js';

/**
 * Middleware to check if the user is an admin
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 */
export const isAdmin = async (req, res, next) => {
  try {
    if (!req.user) {
      throw createError(401, 'Authentication required');
    }

    if (!req.user.isEmailVerified) {
      throw createError(403, 'Email verification required for admin access');
    }

    if (req.user.status !== 'active') {
      throw createError(403, 'Your admin account has been deactivated');
    }

    if (!['admin', 'super_admin', 'moderator'].includes(req.user.role)) {
      throw createError(403, 'Access denied. Admin privileges required.');
    }

    next();
  } catch (error) {
    next(error);
  }
};

/**
 * Middleware to check if the user is a super admin
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 */
export const isSuperAdmin = async (req, res, next) => {
  try {
    if (!req.user) {
      throw createError(401, 'Authentication required');
    }

    if (!req.user.isEmailVerified) {
      throw createError(403, 'Email verification required for super admin access');
    }

    if (req.user.status !== 'active') {
      throw createError(403, 'Your admin account has been deactivated');
    }

    if (req.user.role !== 'super_admin') {
      throw createError(403, 'Access denied. Super admin privileges required.');
    }

    next();
  } catch (error) {
    next(error);
  }
};

/**
 * Middleware to check if the user is an admin or manager
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 */
export const isAdminOrManager = async (req, res, next) => {
  try {
    if (!req.user) {
      throw createError(401, 'Authentication required');
    }

    if (!req.user.isEmailVerified) {
      throw createError(403, 'Email verification required for admin/manager access');
    }

    if (req.user.status !== 'active') {
      throw createError(403, 'Your account has been deactivated');
    }

    if (!['admin', 'super_admin', 'manager'].includes(req.user.role)) {
      throw createError(403, 'Access denied. Admin or manager privileges required.');
    }

    next();
  } catch (error) {
    next(error);
  }
};

/**
 * Middleware to check if the user can modify data (admin or super_admin only)
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 */
export const canModify = async (req, res, next) => {
  try {
    if (!req.user) {
      throw createError(401, 'Authentication required');
    }

    if (!req.user.isEmailVerified) {
      throw createError(403, 'Email verification required');
    }

    if (req.user.status !== 'active') {
      throw createError(403, 'Your account has been deactivated');
    }

    if (!['admin', 'super_admin'].includes(req.user.role)) {
      throw createError(403, 'Access denied. Modification privileges required.');
    }

    next();
  } catch (error) {
    next(error);
  }
};

/**
 * Middleware to check if the user can only manage products and categories (admin role)
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 */
export const canManageProducts = async (req, res, next) => {
  try {
    if (!req.user) {
      throw createError(401, 'Authentication required');
    }

    if (!req.user.isEmailVerified) {
      throw createError(403, 'Email verification required');
    }

    if (req.user.status !== 'active') {
      throw createError(403, 'Your account has been deactivated');
    }

    if (!['admin', 'super_admin'].includes(req.user.role)) {
      throw createError(403, 'Access denied. Product management privileges required.');
    }

    next();
  } catch (error) {
    next(error);
  }
}; 