'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Bell,
  BellRing,
  X as XIcon,
  Package,
  ShoppingCart,
  CheckCircle,
  XCircle,
  Info,
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import {
  fetchNotifications,
  markAsRead,
  markAllAsRead,
  getUnreadCount,
} from '../../redux/slices/notificationSlice';
import ButtonLoader from '../../pages/components/loaders/ButtonLoader';
import { Link, useNavigate } from 'react-router-dom';

const iconMap = {
  order: Package,
  promotion: ShoppingCart,
  success: CheckCircle,
  error: XCircle,
  info: Info,
};

const NotificationBell = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { notifications, unreadCount, loading } = useSelector(
    (state) => state.notifications
  );

  const [showDropdown, setShowDropdown] = useState(false);
  const [actionLoading, setActionLoading] = useState(null);
  const dropdownRef = useRef(null);

  // Initial unread count
  useEffect(() => {
    dispatch(getUnreadCount());
  }, [dispatch]);

  // Handle outside click
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleToggleDropdown = () => {
    setShowDropdown(!showDropdown);
    if (!showDropdown) {
      dispatch(fetchNotifications({ page: 1, limit: 5 }));
    }
  };

  const handleMarkAsRead = useCallback(
    async (id, e) => {
      e.stopPropagation();
      setActionLoading(`read-${id}`);
      try {
        await dispatch(markAsRead(id));
      } finally {
        setActionLoading(null);
      }
    },
    [dispatch]
  );

  const handleMarkAllAsRead = async () => {
    setActionLoading('mark-all');
    try {
      await dispatch(markAllAsRead());
    } finally {
      setActionLoading(null);
    }
  };

  const handleNotificationClick = (notification) => {
    if (!notification.read) {
      dispatch(markAsRead(notification._id));
    }

    if (notification.link) {
      // window.location.href = notification.link;
      navigate(notification.link);
    }

    setShowDropdown(false);
  };

  const getPriorityBorder = (priority) => {
    switch (priority) {
      case 'high':
        return 'border-l-4 border-red-500';
      case 'medium':
        return 'border-l-4 border-yellow-500';
      default:
        return 'border-l-4 border-green-500';
    }
  };

  const renderIcon = (type, color = 'text-gray-500') => {
    const Icon = iconMap[type] || Info;
    return (
      <div className="p-2 rounded-full bg-gray-100">
        <Icon size={16} className={color} />
      </div>
    );
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <motion.button
        whileTap={{ scale: 0.95 }}
        className="relative p-2 rounded-full hover:bg-gray-100 focus:outline-none"
        onClick={handleToggleDropdown}
        aria-label={`Notifications - ${unreadCount} unread`}
      >
        {unreadCount > 0 ? (
          <BellRing size={24} className="text-blue-600 animate-pulse" />
        ) : (
          <Bell size={24} className="text-gray-600" />
        )}

        {unreadCount > 0 && (
          <motion.span
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="absolute top-0 right-0 bg-red-500 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center"
          >
            {unreadCount > 99 ? '99+' : unreadCount}
          </motion.span>
        )}
      </motion.button>

      <AnimatePresence>
        {showDropdown && (
          <motion.div
            initial={{ opacity: 0, y: -10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="absolute right-0 mt-2 w-80 bg-white rounded-md shadow-lg z-50 overflow-hidden border border-gray-200"
          >
            <div className="p-4 border-b border-gray-200 flex justify-between items-center">
              <h3 className="text-lg font-semibold">Notifications</h3>
              {unreadCount > 0 && (
                <ButtonLoader
                  isLoading={actionLoading === 'mark-all'}
                  onClick={handleMarkAllAsRead}
                  className="text-sm text-blue-600 hover:underline"
                  size="sm"
                  loadingText="Marking..."
                >
                  Mark all as read
                </ButtonLoader>
              )}
            </div>

            <div className="max-h-96 overflow-y-auto">
              {loading ? (
                <div className="p-4 text-center text-gray-500">
                  <div className="animate-spin h-6 w-6 border-b-2 border-blue-600 mx-auto mb-2 rounded-full" />
                  Loading notifications...
                </div>
              ) : notifications.length > 0 ? (
                notifications.map((notification) => (
                  <div
                    key={notification._id}
                    onClick={() => handleNotificationClick(notification)}
                    className={`p-3 flex items-start gap-3 hover:bg-gray-50 cursor-pointer ${
                      !notification.read ? 'bg-blue-50' : ''
                    } ${getPriorityBorder(notification.priority)}`}
                  >
                    {renderIcon(notification.type, 'text-blue-500')}
                    <div className="flex-1">
                      <div className="flex justify-between items-start">
                        <h4 className="font-semibold text-sm">
                          {notification.title}
                        </h4>
                        {!notification.read && (
                          <ButtonLoader
                            isLoading={
                              actionLoading === `read-${notification._id}`
                            }
                            onClick={(e) =>
                              handleMarkAsRead(notification._id, e)
                            }
                            className="p-1 text-gray-400 hover:text-green-600"
                            size="sm"
                            aria-label="Mark as read"
                          >
                            <XIcon size={14} />
                          </ButtonLoader>
                        )}
                      </div>
                      <p className="text-sm text-gray-600">
                        {notification.message}
                      </p>
                      <p className="text-xs text-gray-400 mt-1">
                        {formatDistanceToNow(new Date(notification.createdAt), {
                          addSuffix: true,
                        })}
                      </p>
                    </div>
                  </div>
                ))
              ) : (
                <div className="p-6 text-center text-gray-500">
                  <Bell size={32} className="mx-auto mb-2 text-gray-300" />
                  No notifications
                </div>
              )}
            </div>

            <div className="p-2 border-t border-gray-200 text-center">
              <Link
                to="/notifications"
                className="text-sm text-blue-500 hover:text-blue-700"
              >
                View all notifications
              </Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default NotificationBell;
