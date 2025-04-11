'use client';

import { useState, useRef, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import {
  User,
  LogOut,
  Settings,
  ShoppingBag,
  Heart,
  ChevronDown,
  Bell,
  CreditCard,
} from 'lucide-react';
import { logoutUser } from '../../redux/slices/authSlice';
import NotificationDropdown from './NotificationDropdown';

const UserMenu = () => {
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);
  const [isOpen, setIsOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const menuRef = useRef(null);
  const notificationsRef = useRef(null);

  const handleLogout = () => {
    dispatch(logoutUser());
    setIsOpen(false);
  };

  // Sample notifications
  const notifications = [
    {
      id: 1,
      title: 'Welcome to VoxCyber',
      message: 'Thanks for joining our platform!',
      time: 'Just now',
      isRead: false,
    },
    {
      id: 2,
      title: 'New Products Available',
      message: 'Check out our latest tech gadgets',
      time: '2 hours ago',
      isRead: false,
    },
    {
      id: 3,
      title: 'Your Order Has Shipped',
      message: 'Order #12345 is on its way',
      time: 'Yesterday',
      isRead: true,
    },
  ];

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setIsOpen(false);
      }
      if (
        notificationsRef.current &&
        !notificationsRef.current.contains(event.target)
      ) {
        setIsNotificationsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  return (
    <div className="flex items-center gap-2">
      <NotificationDropdown />
      {/* Notifications */}
      <div className="relative" ref={notificationsRef}>
        <button
          onClick={() => {
            setIsNotificationsOpen(!isNotificationsOpen);
            setIsOpen(false);
          }}
          className="relative p-2 text-gray-700 hover:text-blue-600 transition-colors rounded-full hover:bg-gray-100 focus:outline-none"
          aria-label="Notifications"
        >
          <Bell className="w-5 h-5" />
          {notifications.some((n) => !n.isRead) && (
            <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
          )}
        </button>

        {isNotificationsOpen && (
          <div className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-lg py-1 z-50 border border-gray-200 animate-fadeIn">
            <div className="px-4 py-2 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-medium text-gray-900">
                  Notifications
                </h3>
                <button className="text-xs font-medium text-blue-600 hover:text-blue-800">
                  Mark all as read
                </button>
              </div>
            </div>

            <div className="max-h-60 overflow-y-auto">
              {notifications.length > 0 ? (
                notifications.map((notification) => (
                  <div
                    key={notification.id}
                    className={`px-4 py-3 hover:bg-gray-50 ${
                      !notification.isRead ? 'bg-blue-50' : ''
                    }`}
                  >
                    <div className="flex">
                      <div
                        className={`flex-shrink-0 h-8 w-8 rounded-full flex items-center justify-center ${
                          notification.isRead ? 'bg-gray-200' : 'bg-blue-100'
                        }`}
                      >
                        {notification.title.includes('Order') ? (
                          <ShoppingBag className="h-4 w-4 text-blue-600" />
                        ) : notification.title.includes('Welcome') ? (
                          <User className="h-4 w-4 text-blue-600" />
                        ) : (
                          <Bell className="h-4 w-4 text-blue-600" />
                        )}
                      </div>
                      <div className="ml-3 w-0 flex-1">
                        <p className="text-sm font-medium text-gray-900">
                          {notification.title}
                        </p>
                        <p className="text-sm text-gray-500">
                          {notification.message}
                        </p>
                        <p className="mt-1 text-xs text-gray-400">
                          {notification.time}
                        </p>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="px-4 py-6 text-center text-gray-500">
                  No notifications yet
                </div>
              )}
            </div>

            <div className="py-2 px-4 border-t border-gray-200">
              <button className="text-sm font-medium text-blue-600 hover:text-blue-800 w-full text-center">
                View all notifications
              </button>
            </div>
          </div>
        )}
      </div>

      {/* User Menu */}
      <div className="relative" ref={menuRef}>
        <button
          onClick={() => {
            setIsOpen(!isOpen);
            setIsNotificationsOpen(false);
          }}
          className="flex items-center gap-2 focus:outline-none"
        >
          <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600">
            {user?.name?.charAt(0) || <User className="w-4 h-4" />}
          </div>
          <span className="hidden md:block text-sm font-medium">
            {user?.name || 'User'}
          </span>
          <ChevronDown
            className={`w-4 h-4 transition-transform ${
              isOpen ? 'rotate-180' : ''
            }`}
          />
        </button>

        {isOpen && (
          <div className="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-lg py-1 z-50 border border-gray-200 animate-fadeIn">
            <div className="px-4 py-3 border-b border-gray-200">
              <p className="text-sm font-medium text-gray-900">{user?.name}</p>
              <p className="text-xs text-gray-500 truncate">{user?.email}</p>
            </div>

            <Link
              to="/profile"
              className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
              onClick={() => setIsOpen(false)}
            >
              <User className="mr-3 h-4 w-4 text-gray-500" />
              Profile
            </Link>

            <Link
              to="/orders"
              className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
              onClick={() => setIsOpen(false)}
            >
              <ShoppingBag className="mr-3 h-4 w-4 text-gray-500" />
              My Orders
            </Link>

            <Link
              to="/wishlist"
              className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
              onClick={() => setIsOpen(false)}
            >
              <Heart className="mr-3 h-4 w-4 text-gray-500" />
              Wishlist
            </Link>

            <Link
              to="/payment-methods"
              className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
              onClick={() => setIsOpen(false)}
            >
              <CreditCard className="mr-3 h-4 w-4 text-gray-500" />
              Payment Methods
            </Link>

            {user?.role === 'admin' && (
              <Link
                to="/admin"
                className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                onClick={() => setIsOpen(false)}
              >
                <Settings className="mr-3 h-4 w-4 text-gray-500" />
                Admin Dashboard
              </Link>
            )}

            <div className="border-t border-gray-200 mt-1"></div>

            <button
              onClick={handleLogout}
              className="flex items-center w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-100"
            >
              <LogOut className="mr-3 h-4 w-4 text-red-500" />
              Sign out
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default UserMenu;
