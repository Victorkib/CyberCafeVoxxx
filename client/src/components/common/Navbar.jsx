'use client';

import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { ShoppingCart, Menu, X, Search } from 'lucide-react';
import { openAuthModal } from '../../redux/slices/uiSlice';
import AuthButtons from './AuthButtons';

const Navbar = ({ setIsCheckoutOpen }) => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const location = useLocation();
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);
  const { items: cartItems } = useSelector((state) => state.cart);

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
  }, [location]);

  const handleSearch = (e) => {
    e.preventDefault();
    // Implement search functionality
    console.log('Searching for:', searchQuery);
  };

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  return (
    <header
      className={`sticky top-0 z-50 w-full transition-all duration-300 ${
        isScrolled
          ? 'bg-white/95 dark:bg-gray-900/95 backdrop-blur-sm shadow-md'
          : 'bg-white dark:bg-gray-900'
      }`}
    >
      {/* Top announcement bar */}
      <div className="bg-blue-600 text-white py-2 px-4 text-center text-sm">
        <p>
          🔥 Special Promotion: Get 15% off all electronics with code:{' '}
          <span className="font-bold">CYBER15</span>
        </p>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex justify-between items-center py-4">
          {/* Logo */}
          <div className="flex items-center">
            <Link to="/" className="flex items-center">
              <div className="w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold">
                V
              </div>
              <span className="ml-2 font-bold text-xl">
                Vox<span className="text-blue-600">Cyber</span>
              </span>
            </Link>
          </div>

          {/* Desktop Search */}
          <div className="hidden md:block relative flex-1 mx-10 max-w-xl">
            <form onSubmit={handleSearch} className="relative">
              <input
                type="text"
                placeholder="Search for products, categories, brands..."
                className="w-full py-2 pl-10 pr-4 rounded-full border-2 border-gray-200 focus:border-blue-500 focus:outline-none transition-all"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              <Search
                className="absolute left-3 top-2.5 text-gray-400"
                size={20}
              />
              <button
                type="submit"
                className="absolute right-2 top-1 bg-blue-600 text-white p-1.5 rounded-full hover:bg-blue-700 transition-colors"
              >
                <Search size={16} />
              </button>
            </form>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center space-x-8">
            <Link
              to="/shop"
              className={`text-sm font-medium ${
                location.pathname === '/shop'
                  ? 'text-blue-600'
                  : 'text-gray-700 hover:text-blue-600 dark:text-gray-300 dark:hover:text-blue-400'
              } transition-colors`}
            >
              Shop
            </Link>
            <Link
              to="/services"
              className={`text-sm font-medium ${
                location.pathname === '/services'
                  ? 'text-blue-600'
                  : 'text-gray-700 hover:text-blue-600 dark:text-gray-300 dark:hover:text-blue-400'
              } transition-colors`}
            >
              Services
            </Link>
            <Link
              to="/websites"
              className={`text-sm font-medium ${
                location.pathname === '/websites'
                  ? 'text-blue-600'
                  : 'text-gray-700 hover:text-blue-600 dark:text-gray-300 dark:hover:text-blue-400'
              } transition-colors`}
            >
              Websites
            </Link>

            {/* Show Admin link if user is admin */}
            {user?.role === 'admin' && (
              <Link
                to="/admin"
                className={`text-sm font-medium ${
                  location.pathname.startsWith('/admin')
                    ? 'bg-blue-600 text-white'
                    : 'bg-blue-100 text-blue-600 hover:bg-blue-200 dark:bg-blue-900 dark:text-blue-300 dark:hover:bg-blue-800'
                } px-3 py-1 rounded-md transition-colors`}
              >
                Admin
              </Link>
            )}
          </nav>

          {/* Icons and Auth */}
          <div className="flex items-center space-x-4">
            <button
              className="relative p-2 text-gray-700 hover:text-blue-600 transition-colors dark:text-gray-300 dark:hover:text-blue-400"
              onClick={() => setIsCheckoutOpen(true)}
            >
              <ShoppingCart size={24} />
              {cartItems.length > 0 && (
                <span className="absolute -top-1 -right-1 bg-blue-600 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                  {cartItems.length}
                </span>
              )}
            </button>

            {/* Auth Buttons / User Menu */}
            <div className="hidden md:block">
              <AuthButtons />
            </div>

            {/* Mobile Menu Button */}
            <button
              className="lg:hidden p-2 text-gray-700 dark:text-gray-300"
              onClick={toggleMobileMenu}
            >
              {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>

        {/* Mobile Search (Only visible on mobile) */}
        <div className="md:hidden pb-4">
          <form onSubmit={handleSearch} className="relative">
            <input
              type="text"
              placeholder="Search products..."
              className="w-full py-2 pl-10 pr-4 rounded-full border-2 border-gray-200 focus:border-blue-500 focus:outline-none dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <Search
              className="absolute left-3 top-2.5 text-gray-400"
              size={20}
            />
            <button
              type="submit"
              className="absolute right-2 top-1 bg-blue-600 text-white p-1.5 rounded-full hover:bg-blue-700 transition-colors"
            >
              <Search size={16} />
            </button>
          </form>
        </div>
      </div>

      {/* Mobile Menu */}
      <div
        className={`lg:hidden bg-white dark:bg-gray-900 absolute w-full shadow-lg transition-transform duration-300 ease-in-out z-50 ${
          isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="p-4 space-y-3">
          <Link
            to="/shop"
            className="block py-2 px-4 text-gray-700 hover:bg-blue-50 hover:text-blue-600 rounded-lg dark:text-gray-300 dark:hover:bg-gray-800"
            onClick={() => setIsMobileMenuOpen(false)}
          >
            Shop
          </Link>
          <Link
            to="/services"
            className="block py-2 px-4 text-gray-700 hover:bg-blue-50 hover:text-blue-600 rounded-lg dark:text-gray-300 dark:hover:bg-gray-800"
            onClick={() => setIsMobileMenuOpen(false)}
          >
            Services
          </Link>
          <Link
            to="/websites"
            className="block py-2 px-4 text-gray-700 hover:bg-blue-50 hover:text-blue-600 rounded-lg dark:text-gray-300 dark:hover:bg-gray-800"
            onClick={() => setIsMobileMenuOpen(false)}
          >
            Websites
          </Link>

          {/* Show Admin link if user is admin */}
          {user?.role === 'admin' && (
            <Link
              to="/admin"
              className="block py-2 px-4 text-white bg-blue-600 hover:bg-blue-700 rounded-lg"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              Admin Dashboard
            </Link>
          )}

          <div className="border-t border-gray-200 dark:border-gray-700 pt-4 mt-4">
            {!user ? (
              <>
                <button
                  onClick={() => {
                    dispatch(openAuthModal('login'));
                    setIsMobileMenuOpen(false);
                  }}
                  className="block w-full text-left py-2 px-4 text-gray-700 hover:bg-blue-50 hover:text-blue-600 rounded-lg dark:text-gray-300 dark:hover:bg-gray-800"
                >
                  Login
                </button>
                <button
                  onClick={() => {
                    dispatch(openAuthModal('register'));
                    setIsMobileMenuOpen(false);
                  }}
                  className="block w-full text-left py-2 px-4 text-gray-700 hover:bg-blue-50 hover:text-blue-600 rounded-lg dark:text-gray-300 dark:hover:bg-gray-800"
                >
                  Register
                </button>
              </>
            ) : (
              <div className="px-4 py-2">
                <p className="font-medium dark:text-white">
                  Logged in as: {user.name}
                </p>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {user.email}
                </p>
              </div>
            )}
            <button
              onClick={() => {
                setIsCheckoutOpen(true);
                setIsMobileMenuOpen(false);
              }}
              className="flex items-center w-full py-2 px-4 text-gray-700 hover:bg-blue-50 hover:text-blue-600 rounded-lg dark:text-gray-300 dark:hover:bg-gray-800"
            >
              <ShoppingCart size={18} className="mr-2" />
              Cart ({cartItems.length})
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Navbar;
