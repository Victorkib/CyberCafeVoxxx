import { createError } from '../utils/error.js';

/**
 * Permission definitions for different roles
 */
const PERMISSIONS = {
  super_admin: {
    canViewAll: true,
    canModifyAll: true,
    canManageUsers: true,
    canManageProducts: true,
    canManageCategories: true,
    canManageOrders: true,
    canManageSettings: true,
    canViewReports: true,
    canManageAdmins: true
  },
  admin: {
    canViewAll: true,
    canModifyAll: false,
    canManageUsers: false,
    canManageProducts: true,
    canManageCategories: true,
    canManageOrders: true,
    canManageSettings: false,
    canViewReports: true,
    canManageAdmins: false
  },
  moderator: {
    canViewAll: true,
    canModifyAll: false,
    canManageUsers: false,
    canManageProducts: false,
    canManageCategories: false,
    canManageOrders: false,
    canManageSettings: false,
    canViewReports: false,
    canManageAdmins: false
  }
};

/**
 * Check if user has specific permission
 * @param {string} permission - Permission to check
 * @returns {Function} Middleware function
 */
export const hasPermission = (permission) => {
  return async (req, res, next) => {
    try {
      if (!req.user) {
        throw createError(401, 'Authentication required');
      }

      const userRole = req.user.role;
      const userPermissions = PERMISSIONS[userRole];

      if (!userPermissions) {
        throw createError(403, 'Invalid user role');
      }

      if (!userPermissions[permission]) {
        throw createError(403, `Access denied. ${permission} permission required.`);
      }

      next();
    } catch (error) {
      next(error);
    }
  };
};

/**
 * Get user permissions
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 */
export const getUserPermissions = async (req, res, next) => {
  try {
    if (!req.user) {
      throw createError(401, 'Authentication required');
    }

    const userRole = req.user.role;
    const permissions = PERMISSIONS[userRole] || {};

    res.json({
      success: true,
      permissions,
      role: userRole
    });
  } catch (error) {
    next(error);
  }
};

export default {
  hasPermission,
  getUserPermissions,
  PERMISSIONS
};