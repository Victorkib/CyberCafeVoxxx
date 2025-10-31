import React from 'react';
import { useSelector } from 'react-redux';

/**
 * Component to conditionally render content based on user role and permissions
 */
const RoleBasedAccess = ({ 
  allowedRoles = [], 
  requiredPermissions = [], 
  children, 
  fallback = null,
  showFallback = true 
}) => {
  const { user } = useSelector((state) => state.auth);

  // If no user is logged in, don't show anything
  if (!user) {
    return showFallback ? fallback : null;
  }

  // Check if user has required role
  const hasRequiredRole = allowedRoles.length === 0 || allowedRoles.includes(user.role);

  // Define permissions based on role
  const rolePermissions = {
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

  // Check if user has required permissions
  const userPermissions = rolePermissions[user.role] || {};
  const hasRequiredPermissions = requiredPermissions.length === 0 || 
    requiredPermissions.every(permission => userPermissions[permission]);

  // Show content if user has required role and permissions
  if (hasRequiredRole && hasRequiredPermissions) {
    return children;
  }

  // Show fallback if access is denied
  return showFallback ? fallback : null;
};

/**
 * Hook to get user permissions
 */
export const useUserPermissions = () => {
  const { user } = useSelector((state) => state.auth);

  const rolePermissions = {
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

  return {
    permissions: rolePermissions[user?.role] || {},
    role: user?.role,
    hasPermission: (permission) => rolePermissions[user?.role]?.[permission] || false,
    hasRole: (role) => user?.role === role,
    hasAnyRole: (roles) => roles.includes(user?.role)
  };
};

/**
 * Component to show role badge
 */
export const RoleBadge = ({ role, className = "" }) => {
  const getRoleColor = (role) => {
    switch (role) {
      case 'super_admin':
        return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
      case 'admin':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
      case 'moderator':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
    }
  };

  const getRoleLabel = (role) => {
    switch (role) {
      case 'super_admin':
        return 'Super Admin';
      case 'admin':
        return 'Admin';
      case 'moderator':
        return 'Moderator';
      default:
        return 'User';
    }
  };

  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getRoleColor(role)} ${className}`}>
      {getRoleLabel(role)}
    </span>
  );
};

export default RoleBasedAccess;