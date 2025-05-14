'use client';

import { useState, useEffect, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Bell } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import {
  fetchAdminNotifications,
  markNotificationAsRead,
} from '../../../redux/slices/adminNotificationSlice';
import { Link } from 'react-router-dom';

const AdminNotificationBell = () => {
  const dispatch = useDispatch();
  const { notifications, loading } = useSelector(
    (state) => state.adminNotifications
  );
  const [showDropdown, setShowDropdown] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const dropdownRef = useRef(null);

  // Fetch notifications on mount
  useEffect(() => {
    if (showDropdown) {
      dispatch(
        fetchAdminNotifications({
          page: 1,
          limit: 5,
          priority: 'high', // Only show high priority notifications in the dropdown
        })
      );
    }
  }, [dispatch, showDropdown]);

  // Calculate unread count from admin notifications
  useEffect(() => {
    // For admin, we'll consider high priority notifications as "unread"
    const highPriorityCount = notifications.filter(
      (n) => n.priority === 'high' && !n.isRead
    ).length;
    setUnreadCount(highPriorityCount);
  }, [notifications]);

  // Handle click outside to close dropdown
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleToggleDropdown = () => {
    setShowDropdown(!showDropdown);
  };

  const handleNotificationClick = (notification) => {
    // Mark as read
    if (!notification.isRead) {
      dispatch(markNotificationAsRead(notification._id));
    }

    // Navigate to link if available
    if (notification.link) {
      window.location.href = notification.link;
    } else {
      // Otherwise go to admin notification management
      window.location.href = '/admin/notifications';
    }

    // Close dropdown
    setShowDropdown(false);
  };

  const getPriorityClass = (priority) => {
    switch (priority) {
      case 'high':
        return 'border-l-4 border-red-500 dark:border-red-400';
      case 'medium':
        return 'border-l-4 border-yellow-500 dark:border-yellow-400';
      default:
        return 'border-l-4 border-green-500 dark:border-green-400';
    }
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={handleToggleDropdown}
        className="relative p-1 rounded-full text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors duration-200"
        aria-label={`Admin Notifications - ${unreadCount} alerts`}
      >
        <Bell className="h-5 w-5" />
        {unreadCount > 0 && (
          <span className="absolute top-0 right-0 inline-flex items-center justify-center w-4 h-4 text-xs font-bold text-white bg-red-500 dark:bg-red-600 rounded-full transform translate-x-1/2 -translate-y-1/2">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {showDropdown && (
        <div className="absolute right-0 mt-2 w-80 bg-white dark:bg-gray-800 rounded-md shadow-lg z-50 overflow-hidden border border-gray-200 dark:border-gray-700">
          <div className="p-3 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              Admin Alerts
            </h3>
            <Link
              to="/admin/notifications"
              className="text-sm text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300"
            >
              Manage
            </Link>
          </div>

          <div className="max-h-96 overflow-y-auto">
            {loading ? (
              <div className="p-4 text-center text-gray-600 dark:text-gray-400">
                <div
                  className="animate-spin inline-block w-5 h-5 border-2 border-current border-t-transparent rounded-full mr-2"
                  aria-hidden="true"
                ></div>
                Loading...
              </div>
            ) : notifications.length > 0 ? (
              notifications.map((notification) => (
                <div
                  key={notification._id}
                  className={`p-3 border-b border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/50 cursor-pointer ${
                    !notification.isRead ? 'bg-blue-50 dark:bg-blue-900/20' : ''
                  } ${getPriorityClass(notification.priority)}`}
                  onClick={() => handleNotificationClick(notification)}
                >
                  <div className="flex justify-between">
                    <h4 className="font-semibold text-gray-900 dark:text-white">
                      {notification.title}
                    </h4>
                    <span
                      className={`px-2 py-0.5 text-xs rounded-full ${
                        notification.priority === 'high'
                          ? 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400'
                          : notification.priority === 'medium'
                          ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400'
                          : 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
                      }`}
                    >
                      {notification.priority}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-300">
                    {notification.message}
                  </p>
                  <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
                    {formatDistanceToNow(new Date(notification.createdAt), {
                      addSuffix: true,
                    })}
                  </p>
                </div>
              ))
            ) : (
              <div className="p-4 text-center text-gray-500 dark:text-gray-400">
                No alerts
              </div>
            )}
          </div>

          <div className="p-2 border-t border-gray-200 dark:border-gray-700 text-center bg-gray-50 dark:bg-gray-700/50">
            <Link
              to="/admin/notifications"
              className="text-sm text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300"
            >
              View all notifications
            </Link>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminNotificationBell;
