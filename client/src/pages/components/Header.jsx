'use client';

import { useState, useEffect, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Coffee,
  Search,
  ShoppingCart,
  ChevronDown,
  X,
  Menu,
  Sun,
  Moon,
  User,
  MapPin,
  Headphones,
  Store,
} from 'lucide-react';
import { openAuthModal, toggleDarkMode } from '../../redux/slices/uiSlice';
import { logoutUser } from '../../redux/slices/authSlice';

// Import our loader components
import ButtonLoader from './loaders/ButtonLoader';
import ToastLoader from './loaders/ToastLoader';
import NotificationBell from '../../components/notifications/NotificationBell';

const Header = ({
  searchQuery,
  setSearchQuery,
  isSearchFocused,
  setIsSearchFocused,
  handleSearch,
  setIsCheckoutOpen,
  cartItems = [],
  isSearching = false,
}) => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user } = useSelector((state) => state.auth);
  const { darkMode } = useSelector((state) => state.ui);

  // Local loading states
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [isTogglingTheme, setIsTogglingTheme] = useState(false);
  const [loadingNavItem, setLoadingNavItem] = useState(null);
  const [isAuthLoading, setIsAuthLoading] = useState(false);

  // Toast loader states
  const [showToastLoader, setShowToastLoader] = useState(false);
  const [toastMessage, setToastMessage] = useState('');

  // Handle outside clicks for user menu
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (isUserMenuOpen && !event.target.closest('.user-menu-container')) {
        setIsUserMenuOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isUserMenuOpen]);

  // Close mobile menu when screen size changes
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 1024) {
        setIsMenuOpen(false);
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Prevent body scroll when mobile menu is open
  useEffect(() => {
    if (isMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }

    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isMenuOpen]);

  // Toast loader helpers
  const showToastLoaderWithMessage = useCallback((message) => {
    setToastMessage(message);
    setShowToastLoader(true);
  }, []);

  const hideToastLoader = useCallback(() => {
    setShowToastLoader(false);
    setToastMessage('');
  }, []);

  // Enhanced theme toggle with loading
  const handleToggleTheme = useCallback(async () => {
    setIsTogglingTheme(true);
    showToastLoaderWithMessage(
      `Switching to ${darkMode ? 'light' : 'dark'} mode...`
    );

    try {
      // Add a small delay for smooth UX
      await new Promise((resolve) => setTimeout(resolve, 500));

      dispatch(toggleDarkMode());

      // Store preference in localStorage
      try {
        localStorage.setItem('darkMode', !darkMode ? 'true' : 'false');
      } catch (error) {
        console.warn(
          'Could not save dark mode preference to localStorage:',
          error
        );
      }
    } finally {
      setIsTogglingTheme(false);
      hideToastLoader();
    }
  }, [dispatch, darkMode, showToastLoaderWithMessage, hideToastLoader]);

  // Enhanced search submit with loading
  const handleSearchSubmit = useCallback(
    async (e) => {
      e.preventDefault();
      if (searchQuery.trim()) {
        showToastLoaderWithMessage('Searching products...');
        try {
          await handleSearch(e);
          setIsSearchFocused(false);
        } finally {
          hideToastLoader();
        }
      }
    },
    [
      searchQuery,
      handleSearch,
      setIsSearchFocused,
      showToastLoaderWithMessage,
      hideToastLoader,
    ]
  );

  // Enhanced logout with loading
  const handleLogout = useCallback(async () => {
    setIsLoggingOut(true);
    showToastLoaderWithMessage('Logging out...');

    try {
      await dispatch(logoutUser());
      setIsUserMenuOpen(false);
      setIsMenuOpen(false);
      navigate('/');
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      setIsLoggingOut(false);
      hideToastLoader();
    }
  }, [dispatch, navigate, showToastLoaderWithMessage, hideToastLoader]);

  // Enhanced navigation with loading
  const handleNavigation = useCallback(
    async (path, label) => {
      setLoadingNavItem(path);
      showToastLoaderWithMessage(`Loading ${label}...`);

      try {
        // Add small delay for smooth UX
        await new Promise((resolve) => setTimeout(resolve, 300));
        navigate(path);
        setIsMenuOpen(false);
      } finally {
        setLoadingNavItem(null);
        hideToastLoader();
      }
    },
    [navigate, showToastLoaderWithMessage, hideToastLoader]
  );

  // Enhanced auth modal opening
  const handleAuthModal = useCallback(
    async (type) => {
      setIsAuthLoading(true);
      showToastLoaderWithMessage(`Opening ${type} form...`);

      try {
        await new Promise((resolve) => setTimeout(resolve, 200));
        dispatch(openAuthModal(type));
        setIsMenuOpen(false);
      } finally {
        setIsAuthLoading(false);
        hideToastLoader();
      }
    },
    [dispatch, showToastLoaderWithMessage, hideToastLoader]
  );

  const cartItemCount = cartItems.reduce(
    (total, item) => total + (item.quantity || 0),
    0
  );

  return (
    <>
      {/* Toast Loader */}
      <ToastLoader
        isVisible={showToastLoader}
        message={toastMessage}
        position="top-center"
      />

      {/* Top Bar */}
      <div className="bg-blue-900 text-white py-2 px-4 relative z-50">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row justify-between items-center">
          <p className="text-sm font-medium text-center sm:text-left mb-2 sm:mb-0">
            🔥 Special Promotion: Get 15% off all electronics with code:{' '}
            <span className="font-bold bg-blue-800 px-2 py-1 rounded text-yellow-300">
              CYBER15
            </span>
          </p>
          <div className="flex flex-wrap justify-center sm:justify-end items-center gap-2 sm:gap-4 text-sm">
            <a
              href="#"
              className="hover:underline hover:text-blue-200 transition-colors flex items-center gap-1"
            >
              <MapPin size={14} />
              Track Order
            </a>
            <span className="hidden sm:inline text-blue-300">|</span>
            <a
              href="#"
              className="hover:underline hover:text-blue-200 transition-colors flex items-center gap-1"
            >
              <Headphones size={14} />
              Support
            </a>
            <span className="hidden sm:inline text-blue-300">|</span>
            <a
              href="#"
              className="hover:underline hover:text-blue-200 transition-colors flex items-center gap-1"
            >
              <Store size={14} />
              Find Store
            </a>
            <span className="hidden sm:inline text-blue-300">|</span>
            <ButtonLoader
              isLoading={isTogglingTheme}
              onClick={handleToggleTheme}
              className="hover:underline hover:text-blue-200 flex items-center gap-1 transition-colors bg-transparent border-none text-white p-0 text-sm"
              aria-label={`Switch to ${darkMode ? 'light' : 'dark'} mode`}
              loadingText="Switching..."
              size="sm"
            >
              {darkMode ? (
                <Sun size={14} className="flex-shrink-0" />
              ) : (
                <Moon size={14} className="flex-shrink-0" />
              )}
              <span className="hidden sm:inline">
                {darkMode ? 'Light Mode' : 'Dark Mode'}
              </span>
            </ButtonLoader>
          </div>
        </div>
      </div>

      {/* Main Header */}
      <header
        className={`sticky top-0 z-40 ${
          darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
        } border-b shadow-md transition-all duration-300`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="flex justify-between items-center py-3 sm:py-4">
            {/* Logo */}
            <div className="flex items-center flex-shrink-0">
              <Link to="/" className="flex items-center group">
                <Coffee
                  size={28}
                  className={`${
                    darkMode ? 'text-blue-400' : 'text-blue-700'
                  } mr-2 group-hover:scale-110 transition-transform duration-200`}
                />
                <span
                  className={`font-bold text-xl sm:text-2xl ${
                    darkMode ? 'text-white' : 'text-blue-900'
                  }`}
                >
                  Vox
                  <span
                    className={`${
                      darkMode ? 'text-blue-400' : 'text-blue-600'
                    }`}
                  >
                    Cyber
                  </span>
                </span>
              </Link>
            </div>

            {/* Desktop Search Bar */}
            <div
              className={`hidden md:block relative flex-1 mx-4 lg:mx-10 max-w-2xl transition-all duration-200 ${
                isSearchFocused ? 'scale-105' : ''
              }`}
            >
              <form onSubmit={handleSearchSubmit} className="relative">
                <input
                  type="text"
                  placeholder="Search for products, categories, brands..."
                  className={`w-full py-2.5 pl-12 pr-16 rounded-full border-2 transition-all duration-200 ${
                    darkMode
                      ? 'border-gray-600 bg-gray-700 text-white placeholder-gray-400 focus:border-blue-400 focus:bg-gray-600'
                      : 'border-gray-300 bg-white text-gray-900 placeholder-gray-500 focus:border-blue-500 focus:bg-gray-50'
                  } focus:outline-none focus:ring-2 focus:ring-blue-500/20`}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onFocus={() => setIsSearchFocused(true)}
                  onBlur={() => setIsSearchFocused(false)}
                  aria-label="Search products"
                  disabled={isSearching}
                />
                <Search
                  className={`absolute left-4 top-1/2 transform -translate-y-1/2 ${
                    darkMode ? 'text-gray-400' : 'text-gray-500'
                  }`}
                  size={20}
                />
                <ButtonLoader
                  type="submit"
                  isLoading={isSearching}
                  className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-blue-600 text-white p-2 rounded-full hover:bg-blue-700 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                  aria-label="Submit search"
                  size="sm"
                >
                  <Search size={16} />
                </ButtonLoader>
              </form>
            </div>

            {/* Desktop Navigation Links */}
            <nav className="hidden lg:flex items-center space-x-6 xl:space-x-8">
              <ButtonLoader
                isLoading={loadingNavItem === '/shop'}
                onClick={() => handleNavigation('/shop', 'Shop')}
                className={`text-sm font-medium transition-colors duration-200 ${
                  darkMode
                    ? 'text-gray-300 hover:text-blue-400'
                    : 'text-gray-700 hover:text-blue-600'
                } hover:underline bg-transparent border-none p-0`}
                loadingText="Loading..."
                size="sm"
              >
                Shop
              </ButtonLoader>

              <ButtonLoader
                isLoading={loadingNavItem === '/services'}
                onClick={() => handleNavigation('/services', 'Services')}
                className={`text-sm font-medium transition-colors duration-200 ${
                  darkMode
                    ? 'text-gray-300 hover:text-blue-400'
                    : 'text-gray-700 hover:text-blue-600'
                } hover:underline bg-transparent border-none p-0`}
                loadingText="Loading..."
                size="sm"
              >
                Services
              </ButtonLoader>

              <ButtonLoader
                isLoading={loadingNavItem === '/websites'}
                onClick={() => handleNavigation('/websites', 'Websites')}
                className={`text-sm font-medium transition-colors duration-200 ${
                  darkMode
                    ? 'text-gray-300 hover:text-blue-400'
                    : 'text-gray-700 hover:text-blue-600'
                } hover:underline bg-transparent border-none p-0`}
                loadingText="Loading..."
                size="sm"
              >
                Websites
              </ButtonLoader>

              {/* Admin Link */}
              {(user?.role === 'admin' || user?.role === 'super_admin') && (
                <ButtonLoader
                  isLoading={loadingNavItem === '/admin'}
                  onClick={() => handleNavigation('/admin', 'Admin Dashboard')}
                  className="text-sm font-medium text-white bg-blue-600 px-3 py-1.5 rounded-md hover:bg-blue-700 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                  loadingText="Loading..."
                  size="sm"
                >
                  Admin
                </ButtonLoader>
              )}
            </nav>

            {/* Action Icons */}
            <div className="flex items-center space-x-2 sm:space-x-4">
              {/* Notifications */}
              <NotificationBell />

              {/* Cart */}
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className={`relative p-2 rounded-full transition-colors duration-200 ${
                  darkMode
                    ? 'text-gray-300 hover:text-blue-400 hover:bg-gray-700'
                    : 'text-gray-700 hover:text-blue-600 hover:bg-gray-100'
                }`}
                onClick={() => setIsCheckoutOpen(true)}
                aria-label={`Cart with ${cartItemCount} items`}
              >
                <ShoppingCart size={24} />
                {cartItemCount > 0 && (
                  <motion.span
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                    className="absolute -top-1 -right-1 bg-blue-600 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center font-medium"
                  >
                    {cartItemCount > 9 ? '9+' : cartItemCount}
                  </motion.span>
                )}
              </motion.button>

              {/* Desktop Auth / User Menu */}
              <div className="hidden md:block">
                {user ? (
                  <div className="relative user-menu-container">
                    <button
                      className={`flex items-center space-x-2 p-2 rounded-lg transition-colors duration-200 ${
                        darkMode
                          ? 'text-white hover:text-blue-400 hover:bg-gray-700'
                          : 'text-gray-900 hover:text-blue-600 hover:bg-gray-100'
                      }`}
                      onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                      aria-label="User menu"
                    >
                      <User size={20} />
                      <span className="font-medium text-sm max-w-24 truncate">
                        {user.name}
                      </span>
                      <ChevronDown
                        size={16}
                        className={`transition-transform duration-200 ${
                          isUserMenuOpen ? 'rotate-180' : ''
                        }`}
                      />
                    </button>

                    <AnimatePresence>
                      {isUserMenuOpen && (
                        <motion.div
                          initial={{ opacity: 0, y: -10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -10 }}
                          transition={{ duration: 0.2 }}
                          className={`absolute right-0 mt-2 w-48 ${
                            darkMode ? 'bg-gray-800' : 'bg-white'
                          } rounded-lg shadow-lg border ${
                            darkMode ? 'border-gray-700' : 'border-gray-200'
                          } py-1 z-50`}
                        >
                          <ButtonLoader
                            isLoading={loadingNavItem === '/account'}
                            onClick={() =>
                              handleNavigation('/account', 'Account')
                            }
                            className={`block w-full text-left px-4 py-2 text-sm transition-colors duration-200 ${
                              darkMode
                                ? 'text-gray-300 hover:bg-gray-700 hover:text-white'
                                : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900'
                            } bg-transparent border-none`}
                            loadingText="Loading..."
                            size="sm"
                          >
                            My Account
                          </ButtonLoader>

                          <ButtonLoader
                            isLoading={loadingNavItem === '/orders'}
                            onClick={() =>
                              handleNavigation('/orders', 'Orders')
                            }
                            className={`block w-full text-left px-4 py-2 text-sm transition-colors duration-200 ${
                              darkMode
                                ? 'text-gray-300 hover:bg-gray-700 hover:text-white'
                                : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900'
                            } bg-transparent border-none`}
                            loadingText="Loading..."
                            size="sm"
                          >
                            Orders
                          </ButtonLoader>

                          <ButtonLoader
                            isLoading={loadingNavItem === '/notifications'}
                            onClick={() =>
                              handleNavigation(
                                '/notifications',
                                'Notifications'
                              )
                            }
                            className={`block w-full text-left px-4 py-2 text-sm transition-colors duration-200 ${
                              darkMode
                                ? 'text-gray-300 hover:bg-gray-700 hover:text-white'
                                : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900'
                            } bg-transparent border-none`}
                            loadingText="Loading..."
                            size="sm"
                          >
                            Notifications
                          </ButtonLoader>

                          <hr
                            className={`my-1 ${
                              darkMode ? 'border-gray-700' : 'border-gray-200'
                            }`}
                          />

                          <ButtonLoader
                            isLoading={isLoggingOut}
                            onClick={handleLogout}
                            className={`block w-full text-left px-4 py-2 text-sm transition-colors duration-200 ${
                              darkMode
                                ? 'text-gray-300 hover:bg-gray-700 hover:text-white'
                                : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900'
                            } bg-transparent border-none`}
                            loadingText="Logging out..."
                            size="sm"
                          >
                            Logout
                          </ButtonLoader>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                ) : (
                  <div className="flex space-x-2">
                    <ButtonLoader
                      isLoading={isAuthLoading}
                      onClick={() => handleAuthModal('login')}
                      className={`px-4 py-2 text-sm font-medium border rounded-md transition-colors duration-200 ${
                        darkMode
                          ? 'text-blue-400 border-blue-400 hover:bg-blue-900/20'
                          : 'text-blue-600 border-blue-600 hover:bg-blue-50'
                      } focus:outline-none focus:ring-2 focus:ring-blue-500/50`}
                      loadingText="Loading..."
                      size="sm"
                    >
                      Login
                    </ButtonLoader>

                    <ButtonLoader
                      isLoading={isAuthLoading}
                      onClick={() => handleAuthModal('register')}
                      className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                      loadingText="Loading..."
                      size="sm"
                    >
                      Register
                    </ButtonLoader>
                  </div>
                )}
              </div>

              {/* Mobile Menu Toggle */}
              <button
                className={`lg:hidden p-2 rounded-lg transition-colors duration-200 ${
                  darkMode
                    ? 'text-gray-300 hover:text-white hover:bg-gray-700'
                    : 'text-gray-700 hover:text-gray-900 hover:bg-gray-100'
                }`}
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                aria-label={isMenuOpen ? 'Close menu' : 'Open menu'}
              >
                {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
              </button>
            </div>
          </div>

          {/* Mobile Search */}
          <div className="md:hidden pb-4">
            <form onSubmit={handleSearchSubmit} className="relative">
              <input
                type="text"
                placeholder="Search products..."
                className={`w-full py-2.5 pl-12 pr-16 rounded-full border-2 transition-all duration-200 ${
                  darkMode
                    ? 'border-gray-600 bg-gray-700 text-white placeholder-gray-400 focus:border-blue-400'
                    : 'border-gray-300 bg-white text-gray-900 placeholder-gray-500 focus:border-blue-500'
                } focus:outline-none focus:ring-2 focus:ring-blue-500/20`}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                aria-label="Search products"
                disabled={isSearching}
              />
              <Search
                className={`absolute left-4 top-1/2 transform -translate-y-1/2 ${
                  darkMode ? 'text-gray-400' : 'text-gray-500'
                }`}
                size={20}
              />
              <ButtonLoader
                type="submit"
                isLoading={isSearching}
                className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-blue-600 text-white p-2 rounded-full hover:bg-blue-700 transition-colors duration-200"
                aria-label="Submit search"
                size="sm"
              >
                <Search size={16} />
              </ButtonLoader>
            </form>
          </div>
        </div>

        {/* Mobile Menu */}
        <AnimatePresence>
          {isMenuOpen && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.3, ease: 'easeInOut' }}
              className={`lg:hidden ${
                darkMode
                  ? 'bg-gray-800 border-gray-700'
                  : 'bg-white border-gray-200'
              } absolute w-full shadow-lg z-50 overflow-hidden border-t`}
            >
              <div className="p-4 space-y-2 max-h-96 overflow-y-auto">
                {/* Navigation Links */}
                <ButtonLoader
                  isLoading={loadingNavItem === '/shop'}
                  onClick={() => handleNavigation('/shop', 'Shop')}
                  className={`block w-full text-left py-3 px-4 rounded-lg transition-colors duration-200 ${
                    darkMode
                      ? 'text-gray-300 hover:bg-gray-700 hover:text-blue-400'
                      : 'text-gray-700 hover:bg-blue-50 hover:text-blue-600'
                  } bg-transparent border-none`}
                  loadingText="Loading Shop..."
                  size="sm"
                >
                  🛍️ Shop
                </ButtonLoader>

                <ButtonLoader
                  isLoading={loadingNavItem === '/services'}
                  onClick={() => handleNavigation('/services', 'Services')}
                  className={`block w-full text-left py-3 px-4 rounded-lg transition-colors duration-200 ${
                    darkMode
                      ? 'text-gray-300 hover:bg-gray-700 hover:text-blue-400'
                      : 'text-gray-700 hover:bg-blue-50 hover:text-blue-600'
                  } bg-transparent border-none`}
                  loadingText="Loading Services..."
                  size="sm"
                >
                  ⚙️ Services
                </ButtonLoader>

                <ButtonLoader
                  isLoading={loadingNavItem === '/websites'}
                  onClick={() => handleNavigation('/websites', 'Websites')}
                  className={`block w-full text-left py-3 px-4 rounded-lg transition-colors duration-200 ${
                    darkMode
                      ? 'text-gray-300 hover:bg-gray-700 hover:text-blue-400'
                      : 'text-gray-700 hover:bg-blue-50 hover:text-blue-600'
                  } bg-transparent border-none`}
                  loadingText="Loading Websites..."
                  size="sm"
                >
                  🌐 Websites
                </ButtonLoader>

                {/* Admin Link */}
                {(user?.role === 'admin' || user?.role === 'super_admin') && (
                  <ButtonLoader
                    isLoading={loadingNavItem === '/admin'}
                    onClick={() =>
                      handleNavigation('/admin', 'Admin Dashboard')
                    }
                    className="block w-full text-left py-3 px-4 text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors duration-200"
                    loadingText="Loading Admin..."
                    size="sm"
                  >
                    👑 Admin Dashboard
                  </ButtonLoader>
                )}

                {/* Divider */}
                <div
                  className={`border-t pt-4 mt-4 ${
                    darkMode ? 'border-gray-700' : 'border-gray-200'
                  }`}
                >
                  {/* Auth Section */}
                  {!user ? (
                    <div className="space-y-2">
                      <ButtonLoader
                        isLoading={isAuthLoading}
                        onClick={() => handleAuthModal('login')}
                        className={`block w-full text-left py-3 px-4 rounded-lg transition-colors duration-200 ${
                          darkMode
                            ? 'text-gray-300 hover:bg-gray-700 hover:text-blue-400'
                            : 'text-gray-700 hover:bg-blue-50 hover:text-blue-600'
                        } bg-transparent border-none`}
                        loadingText="Opening Login..."
                        size="sm"
                      >
                        🔐 Login
                      </ButtonLoader>

                      <ButtonLoader
                        isLoading={isAuthLoading}
                        onClick={() => handleAuthModal('register')}
                        className={`block w-full text-left py-3 px-4 rounded-lg transition-colors duration-200 ${
                          darkMode
                            ? 'text-gray-300 hover:bg-gray-700 hover:text-blue-400'
                            : 'text-gray-700 hover:bg-blue-50 hover:text-blue-600'
                        } bg-transparent border-none`}
                        loadingText="Opening Register..."
                        size="sm"
                      >
                        📝 Register
                      </ButtonLoader>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      <div className="px-4 py-3">
                        <p
                          className={`font-medium ${
                            darkMode ? 'text-white' : 'text-gray-900'
                          }`}
                        >
                          👋 {user.name}
                        </p>
                        <p
                          className={`text-sm ${
                            darkMode ? 'text-gray-400' : 'text-gray-500'
                          }`}
                        >
                          {user.email}
                        </p>
                      </div>

                      <ButtonLoader
                        isLoading={loadingNavItem === '/account'}
                        onClick={() => handleNavigation('/account', 'Account')}
                        className={`block w-full text-left py-3 px-4 rounded-lg transition-colors duration-200 ${
                          darkMode
                            ? 'text-gray-300 hover:bg-gray-700 hover:text-blue-400'
                            : 'text-gray-700 hover:bg-blue-50 hover:text-blue-600'
                        } bg-transparent border-none`}
                        loadingText="Loading Account..."
                        size="sm"
                      >
                        👤 My Account
                      </ButtonLoader>

                      <ButtonLoader
                        isLoading={loadingNavItem === '/orders'}
                        onClick={() => handleNavigation('/orders', 'Orders')}
                        className={`block w-full text-left py-3 px-4 rounded-lg transition-colors duration-200 ${
                          darkMode
                            ? 'text-gray-300 hover:bg-gray-700 hover:text-blue-400'
                            : 'text-gray-700 hover:bg-blue-50 hover:text-blue-600'
                        } bg-transparent border-none`}
                        loadingText="Loading Orders..."
                        size="sm"
                      >
                        📦 Orders
                      </ButtonLoader>

                      <ButtonLoader
                        isLoading={loadingNavItem === '/notifications'}
                        onClick={() =>
                          handleNavigation('/notifications', 'Notifications')
                        }
                        className={`block w-full text-left py-3 px-4 rounded-lg transition-colors duration-200 ${
                          darkMode
                            ? 'text-gray-300 hover:bg-gray-700 hover:text-blue-400'
                            : 'text-gray-700 hover:bg-blue-50 hover:text-blue-600'
                        } bg-transparent border-none`}
                        loadingText="Loading Notifications..."
                        size="sm"
                      >
                        🔔 Notifications
                      </ButtonLoader>

                      <ButtonLoader
                        isLoading={isLoggingOut}
                        onClick={handleLogout}
                        className={`block w-full text-left py-3 px-4 rounded-lg transition-colors duration-200 ${
                          darkMode
                            ? 'text-gray-300 hover:bg-gray-700 hover:text-blue-400'
                            : 'text-gray-700 hover:bg-blue-50 hover:text-blue-600'
                        } bg-transparent border-none`}
                        loadingText="Logging out..."
                        size="sm"
                      >
                        🚪 Logout
                      </ButtonLoader>
                    </div>
                  )}

                  {/* Additional Links */}
                  <div className="mt-4 pt-4 border-t space-y-2 border-gray-200 dark:border-gray-700">
                    <a
                      href="#"
                      className={`flex items-center w-full py-3 px-4 rounded-lg transition-colors duration-200 ${
                        darkMode
                          ? 'text-gray-300 hover:bg-gray-700 hover:text-blue-400'
                          : 'text-gray-700 hover:bg-blue-50 hover:text-blue-600'
                      }`}
                    >
                      <MapPin size={18} className="mr-3" />
                      Track Order
                    </a>
                    <a
                      href="#"
                      className={`flex items-center w-full py-3 px-4 rounded-lg transition-colors duration-200 ${
                        darkMode
                          ? 'text-gray-300 hover:bg-gray-700 hover:text-blue-400'
                          : 'text-gray-700 hover:bg-blue-50 hover:text-blue-600'
                      }`}
                    >
                      <Headphones size={18} className="mr-3" />
                      Customer Support
                    </a>
                    <ButtonLoader
                      isLoading={isTogglingTheme}
                      onClick={handleToggleTheme}
                      className={`flex items-center w-full py-3 px-4 rounded-lg transition-colors duration-200 ${
                        darkMode
                          ? 'text-gray-300 hover:bg-gray-700 hover:text-blue-400'
                          : 'text-gray-700 hover:bg-blue-50 hover:text-blue-600'
                      } bg-transparent border-none`}
                      loadingText="Switching theme..."
                      size="sm"
                    >
                      {darkMode ? (
                        <Sun size={18} className="mr-3" />
                      ) : (
                        <Moon size={18} className="mr-3" />
                      )}
                      Switch to {darkMode ? 'Light' : 'Dark'} Mode
                    </ButtonLoader>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </header>
    </>
  );
};

export default Header;
