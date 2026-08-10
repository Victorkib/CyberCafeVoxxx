'use client';

import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import {
  Menu,
  X,
  Sun,
  Moon,
  ChevronDown,
  User,
  LogOut,
  LayoutDashboard,
  MessageCircle
} from 'lucide-react';
import { openAuthModal, toggleDarkMode } from '../../redux/slices/uiSlice';
import { logoutUser } from '../../redux/slices/authSlice';

const Navbar = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);

  const location = useLocation();
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const { user } = useSelector((state) => state.auth);
  const { darkMode } = useSelector((state) => state.ui);

  // Handle scroll effect
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close mobile menu when route changes
  useEffect(() => {
    setIsMobileMenuOpen(false);
    setIsProfileOpen(false);
  }, [location]);

  const handleLogout = () => {
    dispatch(logoutUser());
    setIsProfileOpen(false);
    navigate('/');
  };

  const handleToggleTheme = () => {
    dispatch(toggleDarkMode());
  };

  return (
    <header
      className={`sticky top-0 z-40 w-full transition-all duration-300 ${
        isScrolled
          ? darkMode
            ? 'bg-gray-900/95 backdrop-blur-md border-b border-gray-800 shadow-lg'
            : 'bg-white/95 backdrop-blur-md border-b border-gray-200 shadow-md'
          : darkMode
          ? 'bg-gray-900 border-b border-transparent'
          : 'bg-white border-b border-transparent'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16 sm:h-20">
          
          {/* Logo */}
          <div className="flex items-center">
            <Link to="/" className="flex items-center">
              <img
                src="/logo.png"
                alt="VoxCyber"
                className="h-9 md:h-11 w-auto object-contain drop-shadow-[0_2px_8px_rgba(59,130,246,0.35)]"
              />
            </Link>
          </div>

          {/* Desktop Navigation Links */}
          <nav className="hidden lg:flex items-center space-x-8">
            <Link
              to="/"
              className={`text-sm font-semibold transition-colors ${
                location.pathname === '/'
                  ? 'text-blue-600 dark:text-blue-400'
                  : darkMode
                  ? 'text-gray-300 hover:text-blue-400'
                  : 'text-gray-700 hover:text-blue-600'
              }`}
            >
              Home
            </Link>
            <Link
              to="/shop"
              className={`text-sm font-semibold transition-colors ${
                location.pathname === '/shop'
                  ? 'text-blue-600 dark:text-blue-400'
                  : darkMode
                  ? 'text-gray-300 hover:text-blue-400'
                  : 'text-gray-700 hover:text-blue-600'
              }`}
            >
              Shop
            </Link>
            <Link
              to="/services"
              className={`text-sm font-semibold transition-colors ${
                location.pathname === '/services'
                  ? 'text-blue-600 dark:text-blue-400'
                  : darkMode
                  ? 'text-gray-300 hover:text-blue-400'
                  : 'text-gray-700 hover:text-blue-600'
              }`}
            >
              Services
            </Link>
            <Link
              to="/websites"
              className={`text-sm font-semibold transition-colors ${
                location.pathname === '/websites'
                  ? 'text-blue-600 dark:text-blue-400'
                  : darkMode
                  ? 'text-gray-300 hover:text-blue-400'
                  : 'text-gray-700 hover:text-blue-600'
              }`}
            >
              Websites
            </Link>

            {/* Show Admin link if user is admin */}
            {(user?.role === 'admin' || user?.role === 'super_admin') && (
              <Link
                to="/admin"
                className="text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 px-3 py-1.5 rounded-full transition-all shadow-sm hover:shadow-md"
              >
                Admin
              </Link>
            )}
          </nav>

          {/* Header Action Icons */}
          <div className="flex items-center space-x-3 sm:space-x-4">
            
            {/* Theme Toggle */}
            <button
              onClick={handleToggleTheme}
              className={`p-2 rounded-full transition-colors ${
                darkMode ? 'text-gray-300 hover:bg-gray-800 hover:text-yellow-400' : 'text-gray-700 hover:bg-gray-100 hover:text-blue-600'
              }`}
              aria-label="Toggle theme"
            >
              {darkMode ? <Sun size={20} /> : <Moon size={20} />}
            </button>

            {/* Get a Quote CTA */}
            <button
              onClick={() => navigate('/websites')}
              className="hidden sm:inline-flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-bold text-white bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 shadow-sm hover:shadow-md transition-all"
            >
              <MessageCircle size={14} />
              Get a Quote
            </button>

            {/* Auth Dropdown / User profile (Desktop) */}
            <div className="hidden md:block relative">
              {user ? (
                <div>
                  <button
                    onClick={() => setIsProfileOpen(!isProfileOpen)}
                    className={`flex items-center space-x-2 p-1 px-3 rounded-full border transition-all ${
                      darkMode
                        ? 'border-gray-700 hover:bg-gray-800 text-gray-200'
                        : 'border-gray-200 hover:bg-gray-50 text-gray-800'
                    }`}
                  >
                    <div className="w-6 h-6 rounded-full bg-blue-600 text-white flex items-center justify-center text-xs font-bold">
                      {user.name ? user.name.charAt(0).toUpperCase() : 'U'}
                    </div>
                    <span className="text-xs font-semibold max-w-[100px] truncate">{user.name}</span>
                    <ChevronDown size={14} className={`transform transition-transform ${isProfileOpen ? 'rotate-180' : ''}`} />
                  </button>

                  {/* Dropdown Menu */}
                  {isProfileOpen && (
                    <>
                      <div className="fixed inset-0 z-10" onClick={() => setIsProfileOpen(false)}></div>
                      <div
                        className={`absolute right-0 mt-2 w-48 rounded-xl shadow-xl py-1 z-20 border transition-all animate-scale-in ${
                          darkMode ? 'bg-gray-800 border-gray-700 text-gray-200' : 'bg-white border-gray-100 text-gray-800'
                        }`}
                      >
                        <div className="px-4 py-2 border-b border-gray-100 dark:border-gray-700">
                          <p className="text-xs text-gray-400">Signed in as</p>
                          <p className="text-xs font-bold truncate">{user.email}</p>
                        </div>
                        <Link
                          to="/account"
                          onClick={() => setIsProfileOpen(false)}
                          className={`flex items-center gap-2 px-4 py-2 text-sm hover:bg-blue-50 dark:hover:bg-gray-700 transition-colors`}
                        >
                          <User size={14} /> My Account
                        </Link>
                        {user.role === 'admin' || user.role === 'super_admin' ? (
                          <Link
                            to="/admin"
                            onClick={() => setIsProfileOpen(false)}
                            className="flex items-center gap-2 px-4 py-2 text-sm hover:bg-blue-50 dark:hover:bg-gray-700 transition-colors text-blue-600 dark:text-blue-400"
                          >
                            <LayoutDashboard size={14} /> Admin Dashboard
                          </Link>
                        ) : null}
                        <button
                          onClick={handleLogout}
                          className="flex items-center gap-2 w-full text-left px-4 py-2 text-sm hover:bg-red-50 dark:hover:bg-red-900/20 text-red-600 dark:text-red-400 transition-colors border-t border-gray-100 dark:border-gray-700 mt-1"
                        >
                          <LogOut size={14} /> Logout
                        </button>
                      </div>
                    </>
                  )}
                </div>
              ) : (
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => dispatch(openAuthModal('login'))}
                    className={`px-4 py-1.5 rounded-full text-xs font-bold border transition-colors ${
                      darkMode
                        ? 'border-gray-700 hover:bg-gray-800 text-gray-300'
                        : 'border-gray-300 hover:bg-gray-50 text-gray-700'
                    }`}
                  >
                    Login
                  </button>
                  <button
                    onClick={() => dispatch(openAuthModal('register'))}
                    className="px-4 py-1.5 rounded-full text-xs font-bold bg-blue-600 hover:bg-blue-700 text-white transition-colors shadow-sm"
                  >
                    Register
                  </button>
                </div>
              )}
            </div>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className={`lg:hidden p-2 rounded-lg transition-colors ${
                darkMode ? 'text-gray-300 hover:bg-gray-800' : 'text-gray-700 hover:bg-gray-100'
              }`}
              aria-label="Toggle Menu"
            >
              {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>

          </div>
        </div>
      </div>

      {/* Mobile Menu Drawer */}
      {isMobileMenuOpen && (
        <div
          className={`lg:hidden border-t animate-slide-down ${
            darkMode ? 'bg-gray-900 border-gray-800 text-gray-200' : 'bg-white border-gray-200 text-gray-800'
          } p-4 pb-6`}
        >
          <div className="flex flex-col space-y-3">
            <Link
              to="/"
              className={`py-2 px-3 rounded-lg text-sm font-semibold hover:bg-blue-50 dark:hover:bg-gray-800 transition-colors`}
            >
              Home
            </Link>
            <Link
              to="/shop"
              className={`py-2 px-3 rounded-lg text-sm font-semibold hover:bg-blue-50 dark:hover:bg-gray-800 transition-colors`}
            >
              Shop
            </Link>
            <Link
              to="/services"
              className={`py-2 px-3 rounded-lg text-sm font-semibold hover:bg-blue-50 dark:hover:bg-gray-800 transition-colors`}
            >
              Services
            </Link>
            <Link
              to="/websites"
              className={`py-2 px-3 rounded-lg text-sm font-semibold hover:bg-blue-50 dark:hover:bg-gray-800 transition-colors`}
            >
              Websites
            </Link>

            <button
              onClick={() => navigate('/websites')}
              className="mt-1 inline-flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-lg text-sm font-bold text-white bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 transition-all"
            >
              <MessageCircle size={16} />
              Get a Quote
            </button>

            {user?.role === 'admin' || user?.role === 'super_admin' ? (
              <Link
                to="/admin"
                className="py-2 px-3 rounded-lg text-sm font-semibold text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-gray-800 transition-colors"
              >
                Admin Dashboard
              </Link>
            ) : null}

            {/* User Profile / Mobile Auth Buttons */}
            <div className="pt-4 border-t border-gray-100 dark:border-gray-800">
              {user ? (
                <div className="space-y-3">
                  <div className="flex items-center gap-3 px-3">
                    <div className="w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center text-sm font-bold">
                      {user.name ? user.name.charAt(0).toUpperCase() : 'U'}
                    </div>
                    <div>
                      <p className="text-sm font-bold truncate max-w-[180px]">{user.name}</p>
                      <p className="text-xs text-gray-400 truncate max-w-[180px]">{user.email}</p>
                    </div>
                  </div>
                  <Link
                    to="/account"
                    className="flex items-center gap-2 py-2 px-3 rounded-lg text-sm font-semibold hover:bg-blue-50 dark:hover:bg-gray-800 transition-colors"
                  >
                    <User size={16} /> My Account
                  </Link>
                  <button
                    onClick={handleLogout}
                    className="flex items-center gap-2 w-full text-left py-2 px-3 rounded-lg text-sm font-semibold text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/10 transition-colors"
                  >
                    <LogOut size={16} /> Logout
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-3 px-3">
                  <button
                    onClick={() => dispatch(openAuthModal('login'))}
                    className={`py-2 rounded-full text-xs font-bold border text-center transition-colors ${
                      darkMode
                        ? 'border-gray-700 hover:bg-gray-800 text-gray-300'
                        : 'border-gray-300 hover:bg-gray-50 text-gray-700'
                    }`}
                  >
                    Login
                  </button>
                  <button
                    onClick={() => dispatch(openAuthModal('register'))}
                    className="py-2 rounded-full text-xs font-bold bg-blue-600 hover:bg-blue-700 text-white text-center transition-colors shadow-sm"
                  >
                    Register
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </header>
  );
};

export default Navbar;
