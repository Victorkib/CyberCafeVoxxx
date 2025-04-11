'use client';

import { useState, useEffect, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ChevronRight,
  ShoppingCart,
  Search,
  Heart,
  Menu,
  X,
  Headphones,
  Coffee,
  Monitor,
  Wifi,
  Printer,
  BookOpen,
  Package,
  ChevronLeft,
  Star,
  MapPin,
  Phone,
  Facebook,
  Twitter,
  Instagram,
  Youtube,
  Mail,
  Clock1,
  Sun,
  Moon,
  Filter,
  Zap,
  Check,
  Percent,
  ShoppingBag,
  Truck,
  RefreshCw,
  Shield,
  ThumbsUp,
  ChevronDown,
  Plus,
  Minus,
} from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { addToCart } from '../redux/slices/cartSlice';
import { openAuthModal } from '../redux/slices/uiSlice';
import { toggleDarkMode } from '../redux/slices/uiSlice';
import AuthButtons from '../components/common/AuthButtons';
import CheckoutModal from '../components/checkout/CheckoutModal';
import {
  fetchProducts,
  fetchFeaturedProducts,
  fetchNewArrivals,
  fetchSaleProducts,
  setFilters,
} from '../redux/slices/productsSlice';
import {
  fetchCategories,
  fetchFeaturedCategories,
} from '../redux/slices/categoriesSlice';
import { fetchSpecialOffers } from '../redux/slices/specialOffersSlice';
import { fetchHeroSlides } from '../redux/slices/heroSlidesSlice';
import LoadingSpinner from '../components/common/LoadingSpinner';
import ErrorMessage from '../components/common/ErrorMessage';
import { clearError, clearSuccess, subscribeToNewsletter } from '../redux/slices/newsletterSlice';

// Custom hook for theme detection
const useThemeDetector = () => {
  const [isDarkTheme, setIsDarkTheme] = useState(
    window.matchMedia &&
      window.matchMedia('(prefers-color-scheme: dark)').matches
  );

  useEffect(() => {
    const darkThemeMq = window.matchMedia('(prefers-color-scheme: dark)');
    const mqListener = (e) => {
      setIsDarkTheme(e.matches);
    };

    darkThemeMq.addEventListener('change', mqListener);
    return () => darkThemeMq.removeEventListener('change', mqListener);
  }, []);

  return isDarkTheme;
};

// Custom hook for intersection observer
const useIntersectionObserver = (options = {}) => {
  const [isIntersecting, setIsIntersecting] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const observer = new IntersectionObserver(([entry]) => {
      setIsIntersecting(entry.isIntersecting);
    }, options);

    if (ref.current) {
      observer.observe(ref.current);
    }

    return () => {
      if (ref.current) {
        observer.unobserve(ref.current);
      }
    };
  }, [options]);

  return [ref, isIntersecting];
};

// Product Quick View Modal Component
const QuickViewModal = ({
  product,
  isOpen,
  onClose,
  onAddToCart,
  onBuyNow,
}) => {
  const [quantity, setQuantity] = useState(1);
  const [selectedImage, setSelectedImage] = useState(0);
  const { darkMode } = useSelector((state) => state.ui);

  const incrementQuantity = () => setQuantity((prev) => prev + 1);
  const decrementQuantity = () =>
    setQuantity((prev) => (prev > 1 ? prev - 1 : 1));

  if (!isOpen || !product) return null;

  // Use real product images
  const productImages = product.images || [product.image || '/placeholder.svg'];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-75">
      <div
        className={`relative w-full max-w-4xl rounded-lg shadow-2xl overflow-hidden ${
          darkMode ? 'bg-gray-800' : 'bg-white'
        }`}
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-10 p-2 rounded-full bg-white/10 backdrop-blur-sm text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700"
        >
          <X size={20} />
        </button>

        <div className="grid grid-cols-1 md:grid-cols-2">
          {/* Product Images */}
          <div className="relative">
            <div className="aspect-square overflow-hidden">
              <img
                src={productImages[selectedImage] || '/placeholder.svg'}
                alt={product.name}
                className="w-full h-full object-cover"
              />
              {product.tag && (
                <div
                  className={`absolute top-4 left-4 px-3 py-1 text-xs font-bold rounded-md ${
                    product.tag === 'Sale'
                      ? 'bg-red-600 text-white'
                      : product.tag === 'New'
                      ? 'bg-green-600 text-white'
                      : product.tag === 'Best Seller'
                      ? 'bg-yellow-500 text-white'
                      : 'bg-blue-600 text-white'
                  }`}
                >
                  {product.tag}
                </div>
              )}
            </div>

            {/* Thumbnail Navigation */}
            <div className="flex justify-center mt-4 space-x-2 px-4">
              {productImages.map((img, idx) => (
                <button
                  key={idx}
                  onClick={() => setSelectedImage(idx)}
                  className={`w-16 h-16 rounded-md overflow-hidden border-2 transition-all ${
                    selectedImage === idx
                      ? 'border-blue-600 dark:border-blue-400'
                      : 'border-transparent hover:border-gray-300 dark:hover:border-gray-600'
                  }`}
                >
                  <img
                    src={img || '/placeholder.svg'}
                    alt={`Thumbnail ${idx + 1}`}
                    className="w-full h-full object-cover"
                  />
                </button>
              ))}
            </div>
          </div>

          {/* Product Details */}
          <div className="p-6 md:p-8 flex flex-col h-full">
            <div className="mb-2">
              <span className="text-sm font-medium px-2 py-1 rounded-full bg-blue-100 dark:bg-blue-900/40 text-blue-800 dark:text-blue-300">
                {product.category?.name || 'Uncategorized'}
              </span>
            </div>

            <h2 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white mb-2">
              {product.name}
            </h2>

            <div className="flex items-center mb-4">
              <div className="flex">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    size={18}
                    className={
                      i < Math.floor(product.rating || 0)
                        ? 'text-yellow-400 fill-yellow-400'
                        : 'text-gray-300 dark:text-gray-600'
                    }
                  />
                ))}
              </div>
              <span className="ml-2 text-sm text-gray-600 dark:text-gray-400">
                {product.rating?.toFixed(1) || '0.0'} (
                {product.reviewCount || 0} reviews)
              </span>
            </div>

            <div className="mb-6">
              <div className="flex items-baseline">
                <span className="text-3xl font-bold text-gray-900 dark:text-white">
                  ${product.price?.toFixed(2) || '0.00'}
                </span>
                {product.originalPrice && (
                  <span className="ml-3 text-lg text-gray-500 dark:text-gray-400 line-through">
                    ${product.originalPrice.toFixed(2)}
                  </span>
                )}
              </div>
              {product.discountPercentage && (
                <span className="inline-block mt-1 text-sm font-medium text-green-600 dark:text-green-400">
                  Save {product.discountPercentage}% for a limited time
                </span>
              )}
            </div>

            <p className="text-gray-600 dark:text-gray-300 mb-6">
              {product.description}
            </p>

            <div className="mb-6">
              <h3 className="text-sm font-medium text-gray-900 dark:text-white mb-2">
                Key Features:
              </h3>
              <ul className="space-y-1">
                <li className="flex items-center text-sm text-gray-600 dark:text-gray-300">
                  <Check size={16} className="mr-2 text-green-500" />
                  Premium quality materials
                </li>
                <li className="flex items-center text-sm text-gray-600 dark:text-gray-300">
                  <Check size={16} className="mr-2 text-green-500" />
                  Enhanced performance
                </li>
                <li className="flex items-center text-sm text-gray-600 dark:text-gray-300">
                  <Check size={16} className="mr-2 text-green-500" />
                  Durable construction
                </li>
                <li className="flex items-center text-sm text-gray-600 dark:text-gray-300">
                  <Check size={16} className="mr-2 text-green-500" />
                  1-year warranty
                </li>
              </ul>
            </div>

            <div className="flex items-center mb-6">
              <div className="mr-6">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Quantity
                </label>
                <div className="flex items-center border border-gray-300 dark:border-gray-600 rounded-md">
                  <button
                    onClick={decrementQuantity}
                    className="px-3 py-2 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                  >
                    <Minus size={16} />
                  </button>
                  <span className="px-3 py-2 text-gray-900 dark:text-white">
                    {quantity}
                  </span>
                  <button
                    onClick={incrementQuantity}
                    className="px-3 py-2 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                  >
                    <Plus size={16} />
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Availability
                </label>
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                  In Stock
                </span>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 mt-auto">
              <button
                onClick={() => onAddToCart(product, quantity)}
                className="flex-1 flex items-center justify-center px-6 py-3 border border-transparent rounded-lg shadow-sm text-base font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                <ShoppingCart size={20} className="mr-2" />
                Add to Cart
              </button>
              <button
                onClick={() => onBuyNow(product, quantity)}
                className="flex-1 flex items-center justify-center px-6 py-3 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm text-base font-medium text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                Buy Now
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Newsletter Popup Component
const NewsletterPopup = ({ isOpen, onClose }) => {
  const dispatch = useDispatch();
  const { subscribeLoading, subscribeError, subscribeSuccess } = useSelector((state) => state.newsletter);
  const [email, setEmail] = useState('');

  useEffect(() => {
    // Clear error and success messages when component unmounts
    return () => {
      dispatch(clearError());
      dispatch(clearSuccess());
    };
  }, [dispatch]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email) return;

    try {
      await dispatch(subscribeToNewsletter({
        email,
        source: 'popup',
        preferences: ['marketing', 'updates']
      })).unwrap();
      setEmail('');
      if (subscribeSuccess) {
        setTimeout(() => {
          onClose();
        }, 2000);
      }
    } catch (err) {
      // Error is handled by the slice
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg max-w-md w-full mx-4">
        <h2 className="text-2xl font-bold mb-4">Join Our Newsletter</h2>
        <p className="text-gray-600 dark:text-gray-300 mb-4">
          Subscribe to our newsletter for the latest updates and offers.
        </p>
        
        {subscribeError && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            {subscribeError}
          </div>
        )}
        
        {subscribeSuccess && (
          <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4">
            Thank you for subscribing! Please check your email to confirm your subscription.
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Enter your email"
            className="w-full p-2 border rounded mb-4 dark:bg-gray-700 dark:border-gray-600"
            required
            disabled={subscribeLoading}
          />
          <div className="flex justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-600 dark:text-gray-300 hover:text-gray-800 dark:hover:text-white"
              disabled={subscribeLoading}
            >
              Close
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
              disabled={subscribeLoading}
            >
              {subscribeLoading ? 'Subscribing...' : 'Subscribe'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// Enhanced CyberCafeLandingPage Component
const CyberCafeLandingPage = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user } = useSelector((state) => state.auth);
  const { darkMode } = useSelector((state) => state.ui);
  const {
    products,
    featuredProducts,
    newArrivals,
    saleProducts,
    loading: productsLoading,
    error: productsError,
    filters,
  } = useSelector((state) => state.products);
  const {
    categories,
    featuredCategories,
    loading: categoriesLoading,
    error: categoriesError,
  } = useSelector((state) => state.categories);
  const {
    specialOffers,
    loading: offersLoading,
    error: offersError,
  } = useSelector((state) => state.specialOffers);
  const {
    heroSlides,
    loading: slidesLoading,
    error: slidesError,
  } = useSelector((state) => state.heroSlides);

  // Fetch all necessary data
  useEffect(() => {
    dispatch(fetchProducts(filters));
    dispatch(fetchFeaturedProducts());
    dispatch(fetchNewArrivals());
    dispatch(fetchSaleProducts());
    dispatch(fetchCategories());
    dispatch(fetchFeaturedCategories());
    dispatch(fetchSpecialOffers());
    dispatch(fetchHeroSlides());
  }, [dispatch, filters]);

  // Handle filter changes
  const handleFilterChange = (newFilters) => {
    dispatch(setFilters(newFilters));
  };

  // State for UI elements
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedSort, setSelectedSort] = useState('featured');
  const [quickViewProduct, setQuickViewProduct] = useState(null);
  const [isQuickViewOpen, setIsQuickViewOpen] = useState(false);
  const [isNewsletterOpen, setIsNewsletterOpen] = useState(false);
  const [showScrollTop, setShowScrollTop] = useState(false);
  const [showFilters, setShowFilters] = useState(false);

  // Refs for intersection observer
  const [heroRef, heroVisible] = useIntersectionObserver({ threshold: 0.1 });
  const [categoriesRef, categoriesVisible] = useIntersectionObserver({
    threshold: 0.1,
  });
  const [productsRef, productsVisible] = useIntersectionObserver({
    threshold: 0.1,
  });
  const [specialOffersRef, specialOffersVisible] = useIntersectionObserver({
    threshold: 0.1,
  });
  const [ctaRef, ctaVisible] = useIntersectionObserver({ threshold: 0.1 });

  // Auto-cycle through hero slides
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentSlide((prevSlide) =>
        prevSlide === heroSlides.length - 1 ? 0 : prevSlide + 1
      );
    }, 5000);

    return () => clearInterval(interval);
  }, [heroSlides.length]);

  // Show newsletter popup after 5 seconds
  useEffect(() => {
    const timer = setTimeout(() => {
      // Check if user hasn't seen it yet (in a real app, you'd use localStorage)
      const hasSeenNewsletter = localStorage.getItem('hasSeenNewsletter');
      if (!hasSeenNewsletter) {
        setIsNewsletterOpen(true);
        localStorage.setItem('hasSeenNewsletter', 'true');
      }
    }, 5000);

    return () => clearTimeout(timer);
  }, []);

  // Handle scroll events
  useEffect(() => {
    const handleScroll = () => {
      setShowScrollTop(window.scrollY > 300);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Initialize theme based on user preference or system preference
  useEffect(() => {
    // If user hasn't set a preference, use system preference
    const savedDarkMode = localStorage.getItem('darkMode');
    if (savedDarkMode === null && systemPrefersDark !== darkMode) {
      dispatch(toggleDarkMode());
    }
  }, [systemPrefersDark, darkMode, dispatch]);

  // Navigation functions
  const nextSlide = () => {
    setCurrentSlide((prevSlide) =>
      prevSlide === heroSlides.length - 1 ? 0 : prevSlide + 1
    );
  };

  const prevSlide = () => {
    setCurrentSlide((prevSlide) =>
      prevSlide === 0 ? heroSlides.length - 1 : prevSlide - 1
    );
  };

  const handleSearch = (e) => {
    e.preventDefault();
    // Scroll to products section
    document
      .getElementById('featured-products')
      .scrollIntoView({ behavior: 'smooth' });
  };

  // Cart and checkout functions
  const handleAddToCart = (product, quantity = 1) => {
    // Add the product to cart multiple times based on quantity
    for (let i = 0; i < quantity; i++) {
      dispatch(addToCart(product));
    }

    // Show feedback
    const toast = document.createElement('div');
    toast.className = `fixed bottom-4 right-4 bg-green-600 text-white px-4 py-2 rounded-lg shadow-lg z-50 flex items-center ${
      darkMode ? 'dark-toast' : ''
    }`;
    toast.innerHTML = `
      <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
      </svg>
      ${product.name} added to cart
    `;
    document.body.appendChild(toast);

    // Remove toast after 3 seconds
    setTimeout(() => {
      toast.classList.add('opacity-0');
      setTimeout(() => {
        document.body.removeChild(toast);
      }, 300);
    }, 3000);
  };

  const handleBuyNow = (product, quantity = 1) => {
    if (!user) {
      dispatch(openAuthModal('login'));
      return;
    }

    // Add to cart and open checkout
    handleAddToCart(product, quantity);
    setIsCheckoutOpen(true);
  };

  const handleQuickView = (product) => {
    setQuickViewProduct(product);
    setIsQuickViewOpen(true);
  };

  // Theme toggle function
  const handleToggleTheme = () => {
    dispatch(toggleDarkMode());
    localStorage.setItem('darkMode', !darkMode ? 'true' : 'false');
  };

  // Scroll to top function
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  if (productsLoading || categoriesLoading || offersLoading || slidesLoading) {
    return <LoadingSpinner />;
  }

  if (productsError || categoriesError || offersError || slidesError) {
    return (
      <ErrorMessage
        message={productsError || categoriesError || offersError || slidesError}
      />
    );
  }

  return (
    <div
      className={`min-h-screen ${
        darkMode ? 'dark bg-gray-900 text-white' : 'bg-gray-50 text-gray-900'
      } overflow-x-hidden transition-colors duration-300`}
    >
      {/* Modals */}
      <CheckoutModal
        isOpen={isCheckoutOpen}
        onClose={() => setIsCheckoutOpen(false)}
      />
      <QuickViewModal
        product={quickViewProduct}
        isOpen={isQuickViewOpen}
        onClose={() => setIsQuickViewOpen(false)}
        onAddToCart={handleAddToCart}
        onBuyNow={handleBuyNow}
      />
      <NewsletterPopup
        isOpen={isNewsletterOpen}
        onClose={() => setIsNewsletterOpen(false)}
      />

      {/* Top Bar - Announcements & Quick Links */}
      <div className="bg-blue-900 text-white py-2 px-4">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row justify-between items-center">
          <p className="text-sm font-medium text-center sm:text-left mb-2 sm:mb-0">
            🔥 Special Promotion: Get 15% off all electronics with code:{' '}
            <span className="font-bold">CYBER15</span>
          </p>
          <div className="flex space-x-4 text-sm">
            <a href="#" className="hover:underline">
              Track Order
            </a>
            <span className="hidden sm:inline">|</span>
            <a href="#" className="hover:underline">
              Support
            </a>
            <span className="hidden sm:inline">|</span>
            <a href="#" className="hover:underline">
              Find Store
            </a>
            <span className="hidden sm:inline">|</span>
            <button
              onClick={handleToggleTheme}
              className="hover:underline flex items-center"
            >
              {darkMode ? (
                <Sun size={14} className="mr-1" />
              ) : (
                <Moon size={14} className="mr-1" />
              )}
              {darkMode ? 'Light Mode' : 'Dark Mode'}
            </button>
          </div>
        </div>
      </div>

      {/* Header and Navigation */}
      <header
        className={`sticky top-0 z-40 ${
          darkMode ? 'bg-gray-800' : 'bg-white'
        } shadow-md transition-colors duration-300`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="flex justify-between items-center py-4">
            {/* Logo */}
            <div className="flex items-center">
              <Link to="/" className="flex items-center">
                <Coffee
                  size={28}
                  className={`${
                    darkMode ? 'text-blue-400' : 'text-blue-700'
                  } mr-2`}
                />
                <span
                  className={`font-bold text-2xl ${
                    darkMode ? 'text-white' : 'text-blue-900'
                  }`}
                >
                  Vox
                  <span
                    className={darkMode ? 'text-blue-400' : 'text-blue-600'}
                  >
                    Cyber
                  </span>
                </span>
              </Link>
            </div>

            {/* Search Bar */}
            <div
              className={`hidden md:block relative flex-1 mx-10 max-w-2xl transition-all ${
                isSearchFocused ? 'scale-105' : ''
              }`}
            >
              <form onSubmit={handleSearch} className="relative">
                <input
                  type="text"
                  placeholder="Search for products, categories, brands..."
                  className={`w-full py-2 pl-10 pr-4 rounded-full border-2 ${
                    darkMode
                      ? 'border-gray-600 bg-gray-700 text-white focus:border-blue-500'
                      : 'border-gray-200 bg-white text-gray-900 focus:border-blue-500'
                  } focus:outline-none transition-all`}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onFocus={() => setIsSearchFocused(true)}
                  onBlur={() => setIsSearchFocused(false)}
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

            {/* Desktop Navigation Links */}
            <nav className="hidden lg:flex items-center space-x-8">
              <Link
                to="/shop"
                className={`text-sm font-medium ${
                  darkMode
                    ? 'text-gray-300 hover:text-blue-400'
                    : 'text-gray-700 hover:text-blue-600'
                } transition-colors`}
              >
                Shop
              </Link>
              <Link
                to="/services"
                className={`text-sm font-medium ${
                  darkMode
                    ? 'text-gray-300 hover:text-blue-400'
                    : 'text-gray-700 hover:text-blue-600'
                } transition-colors`}
              >
                Services
              </Link>
              <Link
                to="/websites"
                className={`text-sm font-medium ${
                  darkMode
                    ? 'text-gray-300 hover:text-blue-400'
                    : 'text-gray-700 hover:text-blue-600'
                } transition-colors`}
              >
                Websites
              </Link>

              {/* Show Admin link if user is admin */}
              {user?.role === 'admin' && (
                <Link
                  to="/admin"
                  className="text-sm font-medium text-white bg-blue-600 px-3 py-1 rounded-md hover:bg-blue-700 transition-colors"
                >
                  Admin
                </Link>
              )}
            </nav>

            {/* Icons */}
            <div className="flex items-center space-x-4">
              <button
                className={`relative p-2 ${
                  darkMode
                    ? 'text-gray-300 hover:text-blue-400'
                    : 'text-gray-700 hover:text-blue-600'
                } transition-colors`}
              >
                <Heart size={24} />
                <span className="absolute -top-1 -right-1 bg-blue-600 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                  3
                </span>
              </button>
              <button
                className={`relative p-2 ${
                  darkMode
                    ? 'text-gray-300 hover:text-blue-400'
                    : 'text-gray-700 hover:text-blue-600'
                } transition-colors`}
                onClick={() => setIsCheckoutOpen(true)}
              >
                <ShoppingCart size={24} />
                <span className="absolute -top-1 -right-1 bg-blue-600 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                  {cartItems.length}
                </span>
              </button>

              {/* Auth Buttons / User Menu */}
              <div className="hidden md:block">
                <AuthButtons />
              </div>

              {/* Mobile Menu Button */}
              <button
                className={`lg:hidden p-2 ${
                  darkMode ? 'text-gray-300' : 'text-gray-700'
                }`}
                onClick={() => setIsMenuOpen(!isMenuOpen)}
              >
                {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
              </button>
            </div>
          </div>

          {/* Mobile Search (Only visible on mobile) */}
          <div className="md:hidden pb-4">
            <form onSubmit={handleSearch} className="relative">
              <input
                type="text"
                placeholder="Search products..."
                className={`w-full py-2 pl-10 pr-4 rounded-full border-2 ${
                  darkMode
                    ? 'border-gray-600 bg-gray-700 text-white'
                    : 'border-gray-200 bg-white text-gray-900'
                } focus:border-blue-500 focus:outline-none`}
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
        <AnimatePresence>
          {isMenuOpen && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.3 }}
              className={`lg:hidden ${
                darkMode ? 'bg-gray-800' : 'bg-white'
              } absolute w-full shadow-lg z-50 overflow-hidden`}
            >
              <div className="p-4 space-y-3">
                <Link
                  to="/shop"
                  className={`block py-2 px-4 ${
                    darkMode
                      ? 'text-gray-300 hover:bg-gray-700 hover:text-blue-400'
                      : 'text-gray-700 hover:bg-blue-50 hover:text-blue-600'
                  } rounded-lg`}
                  onClick={() => setIsMenuOpen(false)}
                >
                  Shop
                </Link>
                <Link
                  to="/services"
                  className={`block py-2 px-4 ${
                    darkMode
                      ? 'text-gray-300 hover:bg-gray-700 hover:text-blue-400'
                      : 'text-gray-700 hover:bg-blue-50 hover:text-blue-600'
                  } rounded-lg`}
                  onClick={() => setIsMenuOpen(false)}
                >
                  Services
                </Link>
                <Link
                  to="/websites"
                  className={`block py-2 px-4 ${
                    darkMode
                      ? 'text-gray-300 hover:bg-gray-700 hover:text-blue-400'
                      : 'text-gray-700 hover:bg-blue-50 hover:text-blue-600'
                  } rounded-lg`}
                  onClick={() => setIsMenuOpen(false)}
                >
                  Websites
                </Link>

                {/* Show Admin link if user is admin */}
                {user?.role === 'admin' && (
                  <Link
                    to="/admin"
                    className="block py-2 px-4 text-white bg-blue-600 hover:bg-blue-700 rounded-lg"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Admin Dashboard
                  </Link>
                )}

                <div
                  className={`border-t pt-4 mt-4 ${
                    darkMode ? 'border-gray-700' : 'border-gray-200'
                  }`}
                >
                  {!user ? (
                    <>
                      <button
                        onClick={() => {
                          dispatch(openAuthModal('login'));
                          setIsMenuOpen(false);
                        }}
                        className={`block w-full text-left py-2 px-4 ${
                          darkMode
                            ? 'text-gray-300 hover:bg-gray-700 hover:text-blue-400'
                            : 'text-gray-700 hover:bg-blue-50 hover:text-blue-600'
                        } rounded-lg`}
                      >
                        Login
                      </button>
                      <button
                        onClick={() => {
                          dispatch(openAuthModal('register'));
                          setIsMenuOpen(false);
                        }}
                        className={`block w-full text-left py-2 px-4 ${
                          darkMode
                            ? 'text-gray-300 hover:bg-gray-700 hover:text-blue-400'
                            : 'text-gray-700 hover:bg-blue-50 hover:text-blue-600'
                        } rounded-lg`}
                      >
                        Register
                      </button>
                    </>
                  ) : (
                    <div className="px-4 py-2">
                      <p
                        className={`font-medium ${
                          darkMode ? 'text-white' : 'text-gray-900'
                        }`}
                      >
                        Logged in as: {user.name}
                      </p>
                      <p
                        className={`text-sm ${
                          darkMode ? 'text-gray-400' : 'text-gray-500'
                        }`}
                      >
                        {user.email}
                      </p>
                    </div>
                  )}
                  <a
                    href="#"
                    className={`block py-2 px-4 ${
                      darkMode
                        ? 'text-gray-300 hover:bg-gray-700 hover:text-blue-400'
                        : 'text-gray-700 hover:bg-blue-50 hover:text-blue-600'
                    } rounded-lg`}
                  >
                    Track Order
                  </a>
                  <a
                    href="#"
                    className={`block py-2 px-4 ${
                      darkMode
                        ? 'text-gray-300 hover:bg-gray-700 hover:text-blue-400'
                        : 'text-gray-700 hover:bg-blue-50 hover:text-blue-600'
                    } rounded-lg`}
                  >
                    Customer Support
                  </a>
                  <button
                    onClick={handleToggleTheme}
                    className={`flex items-center w-full py-2 px-4 ${
                      darkMode
                        ? 'text-gray-300 hover:bg-gray-700 hover:text-blue-400'
                        : 'text-gray-700 hover:bg-blue-50 hover:text-blue-600'
                    } rounded-lg`}
                  >
                    {darkMode ? (
                      <Sun size={18} className="mr-2" />
                    ) : (
                      <Moon size={18} className="mr-2" />
                    )}
                    Switch to {darkMode ? 'Light' : 'Dark'} Mode
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </header>

      <main>
        {/* Hero Slider Section */}
        <section ref={heroRef} className="relative">
          {slidesLoading ? (
            <LoadingSpinner size="large" />
          ) : slidesError ? (
            <ErrorMessage
              message={slidesError}
              onRetry={() => dispatch(fetchHeroSlides())}
            />
          ) : (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: heroVisible ? 1 : 0 }}
              transition={{ duration: 0.5 }}
              className="relative h-[400px] sm:h-[500px] md:h-[600px] overflow-hidden"
            >
              {heroSlides.map((slide, index) => (
                <div
                  key={slide.id}
                  className={`absolute inset-0 flex items-center transition-opacity duration-1000 ease-in-out ${
                    index === currentSlide ? 'opacity-100' : 'opacity-0'
                  }`}
                >
                  <div
                    className={`absolute inset-0 ${slide.color} bg-opacity-80`}
                  ></div>
                  <div className="absolute inset-0 bg-gradient-to-r from-blue-900 to-transparent opacity-70"></div>
                  <img
                    src={slide.image || '/placeholder.svg'}
                    alt={slide.title}
                    className="absolute object-cover w-full h-full mix-blend-overlay"
                  />
                  <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 flex flex-col justify-center h-full">
                    <div className="max-w-xl">
                      <motion.h1
                        initial={{ opacity: 0, y: 20 }}
                        animate={{
                          opacity: index === currentSlide ? 1 : 0,
                          y: index === currentSlide ? 0 : 20,
                        }}
                        transition={{ duration: 0.5, delay: 0.2 }}
                        className="text-3xl md:text-5xl font-bold text-white mb-2 md:mb-4"
                      >
                        {slide.title}
                      </motion.h1>
                      <motion.p
                        initial={{ opacity: 0, y: 20 }}
                        animate={{
                          opacity: index === currentSlide ? 1 : 0,
                          y: index === currentSlide ? 0 : 20,
                        }}
                        transition={{ duration: 0.5, delay: 0.3 }}
                        className="text-lg md:text-xl text-white mb-3"
                      >
                        {slide.subtitle}
                      </motion.p>
                      <motion.p
                        initial={{ opacity: 0, y: 20 }}
                        animate={{
                          opacity: index === currentSlide ? 1 : 0,
                          y: index === currentSlide ? 0 : 20,
                        }}
                        transition={{ duration: 0.5, delay: 0.4 }}
                        className="text-sm md:text-base text-white/80 mb-6 max-w-md"
                      >
                        {slide.description}
                      </motion.p>
                      <motion.a
                        initial={{ opacity: 0, y: 20 }}
                        animate={{
                          opacity: index === currentSlide ? 1 : 0,
                          y: index === currentSlide ? 0 : 20,
                        }}
                        transition={{ duration: 0.5, delay: 0.5 }}
                        href={slide.link}
                        className="inline-flex items-center px-6 py-3 bg-white text-blue-700 font-medium rounded-full hover:bg-blue-50 transition-colors shadow-lg"
                      >
                        {slide.btnText}
                        <ChevronRight size={20} className="ml-1" />
                      </motion.a>
                    </div>
                  </div>
                </div>
              ))}
            </motion.div>
          )}
        </section>

        {/* Services Bar */}
        <section
          className={`py-6 ${darkMode ? 'bg-gray-800' : 'bg-white'} border-b ${
            darkMode ? 'border-gray-700' : 'border-gray-200'
          }`}
        >
          <div className="max-w-7xl mx-auto px-4 sm:px-6">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {services.map((service) => (
                <div
                  key={service.id}
                  className="flex items-center justify-center md:justify-start"
                >
                  <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center ${
                      darkMode
                        ? 'bg-blue-900/50 text-blue-400'
                        : 'bg-blue-100 text-blue-600'
                    } mr-3`}
                  >
                    {service.icon}
                  </div>
                  <div>
                    <h3
                      className={`text-sm font-medium ${
                        darkMode ? 'text-white' : 'text-gray-900'
                      }`}
                    >
                      {service.title}
                    </h3>
                    <p
                      className={`text-xs ${
                        darkMode ? 'text-gray-400' : 'text-gray-500'
                      }`}
                    >
                      {service.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Categories Section */}
        <section ref={categoriesRef} className="py-16">
          {categoriesLoading ? (
            <LoadingSpinner size="large" />
          ) : categoriesError ? (
            <ErrorMessage
              message={categoriesError}
              onRetry={() => dispatch(fetchCategories())}
            />
          ) : (
            <div className="max-w-7xl mx-auto px-4 sm:px-6">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{
                  opacity: categoriesVisible ? 1 : 0,
                  y: categoriesVisible ? 0 : 20,
                }}
                transition={{ duration: 0.5 }}
                className="text-center mb-12"
              >
                <h2
                  className={`text-3xl font-bold ${
                    darkMode ? 'text-white' : 'text-gray-900'
                  } mb-2`}
                >
                  Browse By Category
                </h2>
                <p
                  className={`text-lg ${
                    darkMode ? 'text-gray-400' : 'text-gray-600'
                  }`}
                >
                  Find everything you need for work or study
                </p>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{
                  opacity: categoriesVisible ? 1 : 0,
                  y: categoriesVisible ? 0 : 20,
                }}
                transition={{ duration: 0.5, delay: 0.2 }}
                className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6"
              >
                {categories.map((category) => (
                  <motion.a
                    key={category.id}
                    href="#featured-products"
                    onClick={() => setSelectedCategory(category.name)}
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.98 }}
                    className={`${
                      darkMode
                        ? 'bg-gray-800 border-gray-700 hover:border-blue-500'
                        : 'bg-gray-50 border-gray-100 hover:border-blue-200'
                    } border rounded-xl p-6 text-center hover:shadow-md transition-all group`}
                  >
                    <div className="flex justify-center mb-4">
                      <div
                        className={`w-16 h-16 flex items-center justify-center rounded-full ${
                          darkMode
                            ? 'bg-blue-900/40 text-blue-400 group-hover:bg-blue-800 group-hover:text-blue-300'
                            : 'bg-blue-100 text-blue-600 group-hover:bg-blue-600 group-hover:text-white'
                        } transition-colors`}
                      >
                        {category.icon}
                      </div>
                    </div>
                    <h3
                      className={`font-medium ${
                        darkMode ? 'text-white' : 'text-gray-900'
                      } mb-1`}
                    >
                      {category.name}
                    </h3>
                    <p
                      className={`text-sm ${
                        darkMode ? 'text-gray-400' : 'text-gray-500'
                      }`}
                    >
                      {category.count} items
                    </p>
                    <p
                      className={`text-xs mt-2 ${
                        darkMode ? 'text-gray-500' : 'text-gray-600'
                      }`}
                    >
                      {category.description}
                    </p>
                  </motion.a>
                ))}
              </motion.div>
            </div>
          )}
        </section>

        {/* Products Section */}
        <section ref={productsRef} className="py-16">
          {productsLoading ? (
            <LoadingSpinner size="large" />
          ) : productsError ? (
            <ErrorMessage
              message={productsError}
              onRetry={() => dispatch(fetchProducts(filters))}
            />
          ) : (
            <div className="max-w-7xl mx-auto px-4 sm:px-6">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{
                  opacity: productsVisible ? 1 : 0,
                  y: productsVisible ? 0 : 20,
                }}
                transition={{ duration: 0.5 }}
                className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8"
              >
                <div>
                  <h2
                    className={`text-3xl font-bold ${
                      darkMode ? 'text-white' : 'text-gray-900'
                    } mb-2`}
                  >
                    Featured Products
                  </h2>
                  <p
                    className={`text-lg ${
                      darkMode ? 'text-gray-400' : 'text-gray-600'
                    }`}
                  >
                    Hand-picked products for your tech needs
                  </p>
                </div>
                <div className="mt-4 md:mt-0 flex flex-col sm:flex-row gap-3">
                  <button
                    onClick={() => setShowFilters(!showFilters)}
                    className={`flex items-center px-4 py-2 ${
                      darkMode
                        ? 'bg-gray-700 hover:bg-gray-600 text-white'
                        : 'bg-white hover:bg-gray-100 text-gray-700'
                    } rounded-lg border ${
                      darkMode ? 'border-gray-600' : 'border-gray-300'
                    }`}
                  >
                    <Filter size={18} className="mr-2" />
                    Filters
                    <ChevronDown
                      size={18}
                      className={`ml-2 transition-transform ${
                        showFilters ? 'rotate-180' : ''
                      }`}
                    />
                  </button>
                  <select
                    value={selectedSort}
                    onChange={(e) => setSelectedSort(e.target.value)}
                    className={`px-4 py-2 rounded-lg border ${
                      darkMode
                        ? 'bg-gray-700 border-gray-600 text-white'
                        : 'bg-white border-gray-300 text-gray-700'
                    }`}
                  >
                    <option value="featured">Featured</option>
                    <option value="price-low">Price: Low to High</option>
                    <option value="price-high">Price: High to Low</option>
                    <option value="rating">Highest Rated</option>
                    <option value="newest">Newest</option>
                  </select>
                </div>
              </motion.div>

              {/* Filters */}
              <AnimatePresence>
                {showFilters && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.3 }}
                    className={`mb-8 p-4 rounded-lg ${
                      darkMode ? 'bg-gray-700' : 'bg-white'
                    } overflow-hidden`}
                  >
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      <div>
                        <h3
                          className={`text-sm font-medium mb-3 ${
                            darkMode ? 'text-white' : 'text-gray-900'
                          }`}
                        >
                          Categories
                        </h3>
                        <div className="space-y-2">
                          <button
                            onClick={() => setSelectedCategory('All')}
                            className={`block px-3 py-2 rounded-md text-sm w-full text-left ${
                              selectedCategory === 'All'
                                ? darkMode
                                  ? 'bg-blue-900/30 text-blue-400'
                                  : 'bg-blue-100 text-blue-700'
                                : darkMode
                                ? 'text-gray-300 hover:bg-gray-600'
                                : 'text-gray-700 hover:bg-gray-100'
                            }`}
                          >
                            All Categories
                          </button>
                          {categories.map((category) => (
                            <button
                              key={category.id}
                              onClick={() => setSelectedCategory(category.name)}
                              className={`block px-3 py-2 rounded-md text-sm w-full text-left ${
                                selectedCategory === category.name
                                  ? darkMode
                                    ? 'bg-blue-900/30 text-blue-400'
                                    : 'bg-blue-100 text-blue-700'
                                  : darkMode
                                  ? 'text-gray-300 hover:bg-gray-600'
                                  : 'text-gray-700 hover:bg-gray-100'
                              }`}
                            >
                              {category.name}
                            </button>
                          ))}
                        </div>
                      </div>
                      <div>
                        <h3
                          className={`text-sm font-medium mb-3 ${
                            darkMode ? 'text-white' : 'text-gray-900'
                          }`}
                        >
                          Price Range
                        </h3>
                        <div className="space-y-2">
                          <div className="flex items-center">
                            <input
                              type="range"
                              min="0"
                              max="200"
                              className="w-full"
                            />
                          </div>
                          <div className="flex justify-between">
                            <span
                              className={`text-sm ${
                                darkMode ? 'text-gray-400' : 'text-gray-600'
                              }`}
                            >
                              $0
                            </span>
                            <span
                              className={`text-sm ${
                                darkMode ? 'text-gray-400' : 'text-gray-600'
                              }`}
                            >
                              $200+
                            </span>
                          </div>
                        </div>
                      </div>
                      <div>
                        <h3
                          className={`text-sm font-medium mb-3 ${
                            darkMode ? 'text-white' : 'text-gray-900'
                          }`}
                        >
                          Availability
                        </h3>
                        <div className="space-y-2">
                          <label className="flex items-center">
                            <input
                              type="checkbox"
                              className="rounded text-blue-600 focus:ring-blue-500"
                              defaultChecked
                            />
                            <span
                              className={`ml-2 text-sm ${
                                darkMode ? 'text-gray-300' : 'text-gray-700'
                              }`}
                            >
                              In Stock
                            </span>
                          </label>
                          <label className="flex items-center">
                            <input
                              type="checkbox"
                              className="rounded text-blue-600 focus:ring-blue-500"
                            />
                            <span
                              className={`ml-2 text-sm ${
                                darkMode ? 'text-gray-300' : 'text-gray-700'
                              }`}
                            >
                              On Sale
                            </span>
                          </label>
                          <label className="flex items-center">
                            <input
                              type="checkbox"
                              className="rounded text-blue-600 focus:ring-blue-500"
                            />
                            <span
                              className={`ml-2 text-sm ${
                                darkMode ? 'text-gray-300' : 'text-gray-700'
                              }`}
                            >
                              New Arrivals
                            </span>
                          </label>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Products Grid */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{
                  opacity: productsVisible ? 1 : 0,
                  y: productsVisible ? 0 : 20,
                }}
                transition={{ duration: 0.5, delay: 0.2 }}
                className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6"
              >
                {products.length > 0 ? (
                  products.map((product) => (
                    <motion.div
                      key={product.id}
                      whileHover={{ y: -5 }}
                      className={`${
                        darkMode
                          ? 'bg-gray-700 border-gray-600'
                          : 'bg-white border-gray-200'
                      } rounded-xl border overflow-hidden hover:shadow-lg transition-shadow group`}
                    >
                      <div className="relative">
                        <img
                          src={product.image || '/placeholder.svg'}
                          alt={product.name}
                          className="w-full h-48 object-cover transition-transform duration-500 group-hover:scale-105"
                        />
                        {product.tag && (
                          <div
                            className={`absolute top-2 left-2 px-2 py-1 text-xs font-bold rounded-md ${
                              product.tag === 'Sale'
                                ? 'bg-red-600 text-white'
                                : product.tag === 'New'
                                ? 'bg-green-600 text-white'
                                : product.tag === 'Best Seller'
                                ? 'bg-yellow-500 text-white'
                                : 'bg-blue-600 text-white'
                            }`}
                          >
                            {product.tag}
                          </div>
                        )}
                        <div className="absolute inset-0 bg-black bg-opacity-20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                          <button
                            onClick={() => handleQuickView(product)}
                            className="px-4 py-2 bg-white text-gray-900 rounded-full font-medium transform translate-y-4 group-hover:translate-y-0 transition-transform"
                          >
                            Quick View
                          </button>
                        </div>
                        <button
                          className="absolute bottom-2 right-2 p-2 bg-white dark:bg-gray-800 rounded-full shadow-md text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                          onClick={(e) => {
                            e.stopPropagation();
                            // Add to wishlist functionality
                          }}
                        >
                          <Heart size={18} />
                        </button>
                      </div>
                      <div className="p-4">
                        <div
                          className={`text-xs ${
                            darkMode ? 'text-gray-400' : 'text-gray-500'
                          } mb-1`}
                        >
                          {product.category?.name || 'Uncategorized'}
                        </div>
                        <h3
                          className={`font-medium ${
                            darkMode ? 'text-white' : 'text-gray-900'
                          } mb-2 hover:text-blue-600 dark:hover:text-blue-400 transition-colors cursor-pointer`}
                          onClick={() => handleQuickView(product)}
                        >
                          {product.name}
                        </h3>
                        <div className="flex items-center mb-2">
                          {[...Array(5)].map((_, i) => (
                            <Star
                              key={i}
                              size={14}
                              className={
                                i < Math.floor(product.rating || 0)
                                  ? 'text-yellow-400 fill-yellow-400'
                                  : darkMode
                                  ? 'text-gray-600'
                                  : 'text-gray-300'
                              }
                            />
                          ))}
                          <span
                            className={`text-xs ${
                              darkMode ? 'text-gray-400' : 'text-gray-500'
                            } ml-1`}
                          >
                            {product.rating?.toFixed(1) || '0.0'}
                          </span>
                        </div>
                        <div className="flex justify-between items-center mb-3">
                          <span
                            className={`font-bold ${
                              darkMode ? 'text-white' : 'text-gray-900'
                            }`}
                          >
                            ${product.price?.toFixed(2) || '0.00'}
                          </span>
                          <button
                            className={`p-2 ${
                              darkMode
                                ? 'bg-blue-600 hover:bg-blue-700'
                                : 'bg-blue-600 hover:bg-blue-700'
                            } text-white rounded-full transition-colors`}
                            onClick={() => handleAddToCart(product)}
                          >
                            <ShoppingCart size={16} />
                          </button>
                        </div>
                        <button
                          onClick={() => handleBuyNow(product)}
                          className={`w-full py-1.5 text-center text-sm font-medium ${
                            darkMode
                              ? 'text-blue-400 border-blue-400 hover:bg-blue-900/20'
                              : 'text-blue-600 border-blue-600 hover:bg-blue-50'
                          } border rounded-lg transition-colors`}
                        >
                          Buy Now
                        </button>
                      </div>
                    </motion.div>
                  ))
                ) : (
                  <div
                    className={`col-span-full text-center py-12 ${
                      darkMode ? 'text-gray-400' : 'text-gray-600'
                    }`}
                  >
                    <ShoppingBag
                      size={48}
                      className="mx-auto mb-4 opacity-30"
                    />
                    <h3
                      className={`text-xl font-medium ${
                        darkMode ? 'text-white' : 'text-gray-900'
                      } mb-2`}
                    >
                      No products found
                    </h3>
                    <p>Try adjusting your search or filter criteria</p>
                    <button
                      onClick={() => {
                        setSelectedCategory('All');
                        setSearchQuery('');
                      }}
                      className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                    >
                      Reset Filters
                    </button>
                  </div>
                )}
              </motion.div>

              {products.length > 0 && (
                <div className="mt-8 text-center">
                  <button
                    className={`inline-flex items-center px-6 py-3 ${
                      darkMode
                        ? 'bg-blue-600 hover:bg-blue-700'
                        : 'bg-blue-600 hover:bg-blue-700'
                    } text-white font-medium rounded-lg transition-colors shadow-md`}
                  >
                    Load More Products
                    <ChevronDown size={20} className="ml-2" />
                  </button>
                </div>
              )}
            </div>
          )}
        </section>

        {/* Special Offers Section */}
        <section ref={specialOffersRef} className="py-16">
          {offersLoading ? (
            <LoadingSpinner size="large" />
          ) : offersError ? (
            <ErrorMessage
              message={offersError}
              onRetry={() => dispatch(fetchSpecialOffers())}
            />
          ) : (
            <div className="max-w-7xl mx-auto px-4 sm:px-6">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{
                  opacity: specialOffersVisible ? 1 : 0,
                  y: specialOffersVisible ? 0 : 20,
                }}
                transition={{ duration: 0.5 }}
                className="text-center mb-12"
              >
                <div className="inline-block px-3 py-1 rounded-full bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 text-sm font-medium mb-4">
                  Limited Time Offers
                </div>
                <h2
                  className={`text-3xl font-bold ${
                    darkMode ? 'text-white' : 'text-gray-900'
                  } mb-2`}
                >
                  Special Deals & Bundles
                </h2>
                <p
                  className={`text-lg ${
                    darkMode ? 'text-gray-400' : 'text-gray-600'
                  } max-w-2xl mx-auto`}
                >
                  Take advantage of these exclusive offers before they're gone
                </p>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{
                  opacity: specialOffersVisible ? 1 : 0,
                  y: specialOffersVisible ? 0 : 20,
                }}
                transition={{ duration: 0.5, delay: 0.2 }}
                className="grid grid-cols-1 md:grid-cols-2 gap-8"
              >
                {specialOffers.map((offer) => (
                  <motion.div
                    key={offer.id}
                    whileHover={{ scale: 1.02 }}
                    className={`${
                      darkMode
                        ? 'bg-gray-800 border-gray-700'
                        : 'bg-gray-50 border-gray-200'
                    } rounded-xl border overflow-hidden shadow-md`}
                  >
                    <div className="flex flex-col md:flex-row">
                      <div className="md:w-2/5">
                        <div className="relative h-48 md:h-full">
                          <img
                            src={offer.image || '/placeholder.svg'}
                            alt={offer.title}
                            className="w-full h-full object-cover"
                          />
                          <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-r from-blue-600/20 to-transparent"></div>
                          <div className="absolute top-4 left-4 px-3 py-1 bg-red-600 text-white text-sm font-bold rounded-md">
                            {offer.discount}
                          </div>
                        </div>
                      </div>
                      <div className="p-6 md:w-3/5">
                        <div className="flex justify-between items-start mb-2">
                          <h3
                            className={`text-xl font-bold ${
                              darkMode ? 'text-white' : 'text-gray-900'
                            }`}
                          >
                            {offer.title}
                          </h3>
                          <span
                            className={`text-sm font-medium ${
                              darkMode ? 'text-yellow-400' : 'text-yellow-600'
                            }`}
                          >
                            {offer.expiry}
                          </span>
                        </div>
                        <p
                          className={`text-sm ${
                            darkMode ? 'text-gray-400' : 'text-gray-600'
                          } mb-4`}
                        >
                          {offer.description}
                        </p>
                        <div className="mb-4">
                          <div className="flex items-baseline">
                            <span
                              className={`text-2xl font-bold ${
                                darkMode ? 'text-white' : 'text-gray-900'
                              } mr-2`}
                            >
                              ${offer.salePrice.toFixed(2)}
                            </span>
                            <span
                              className={`text-sm line-through ${
                                darkMode ? 'text-gray-500' : 'text-gray-500'
                              }`}
                            >
                              ${offer.regularPrice.toFixed(2)}
                            </span>
                          </div>
                        </div>
                        <div className="mb-4">
                          <h4
                            className={`text-xs font-medium uppercase ${
                              darkMode ? 'text-gray-400' : 'text-gray-500'
                            } mb-2`}
                          >
                            Includes:
                          </h4>
                          <ul className="space-y-1">
                            {offer.items.map((item, idx) => (
                              <li
                                key={idx}
                                className={`text-sm flex items-start ${
                                  darkMode ? 'text-gray-300' : 'text-gray-700'
                                }`}
                              >
                                <Check
                                  size={16}
                                  className={`mr-2 mt-0.5 flex-shrink-0 ${
                                    darkMode
                                      ? 'text-green-400'
                                      : 'text-green-500'
                                  }`}
                                />
                                {item}
                              </li>
                            ))}
                          </ul>
                        </div>
                        <div className="flex flex-col sm:flex-row gap-3">
                          <button
                            className={`flex-1 py-2 px-4 ${
                              darkMode
                                ? 'bg-blue-600 hover:bg-blue-700'
                                : 'bg-blue-600 hover:bg-blue-700'
                            } text-white font-medium rounded-lg transition-colors`}
                          >
                            Add Bundle to Cart
                          </button>
                          <div className="flex items-center px-3 py-2 bg-gray-100 dark:bg-gray-700 rounded-lg">
                            <Percent
                              size={16}
                              className={`mr-2 ${
                                darkMode ? 'text-blue-400' : 'text-blue-600'
                              }`}
                            />
                            <span
                              className={`text-sm font-medium ${
                                darkMode ? 'text-white' : 'text-gray-900'
                              }`}
                            >
                              Code: {offer.code}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </motion.div>
            </div>
          )}
        </section>

        {/* Testimonials Section */}
        <section className={`py-12 ${darkMode ? 'bg-gray-800' : 'bg-gray-50'}`}>
          <div className="max-w-7xl mx-auto px-4 sm:px-6">
            <div className="text-center mb-12">
              <h2
                className={`text-3xl font-bold ${
                  darkMode ? 'text-white' : 'text-gray-900'
                } mb-2`}
              >
                What Our Customers Say
              </h2>
              <p
                className={`text-lg ${
                  darkMode ? 'text-gray-400' : 'text-gray-600'
                }`}
              >
                Don't just take our word for it
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {testimonials.map((testimonial) => (
                <div
                  key={testimonial.id}
                  className={`${
                    darkMode
                      ? 'bg-gray-700 border-gray-600'
                      : 'bg-white border-gray-200'
                  } rounded-xl border p-6 shadow-md`}
                >
                  <div className="flex items-center mb-4">
                    <img
                      src={testimonial.avatar || '/placeholder.svg'}
                      alt={testimonial.name}
                      className="w-12 h-12 rounded-full object-cover mr-4"
                    />
                    <div>
                      <h3
                        className={`font-medium ${
                          darkMode ? 'text-white' : 'text-gray-900'
                        }`}
                      >
                        {testimonial.name}
                      </h3>
                      <p
                        className={`text-sm ${
                          darkMode ? 'text-gray-400' : 'text-gray-500'
                        }`}
                      >
                        {testimonial.role}
                      </p>
                    </div>
                  </div>
                  <div className="mb-4">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        size={16}
                        className="text-yellow-400 fill-yellow-400 inline-block mr-1"
                      />
                    ))}
                  </div>
                  <p
                    className={`text-sm italic ${
                      darkMode ? 'text-gray-300' : 'text-gray-600'
                    }`}
                  >
                    "{testimonial.content}"
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Call To Action Section */}
        <section
          ref={ctaRef}
          className={`py-16 ${darkMode ? 'bg-gray-900' : 'bg-blue-50'}`}
        >
          <div className="max-w-7xl mx-auto px-4 sm:px-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: ctaVisible ? 1 : 0, y: ctaVisible ? 0 : 20 }}
              transition={{ duration: 0.5 }}
              className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center"
            >
              <div>
                <h2
                  className={`text-3xl md:text-4xl font-bold ${
                    darkMode ? 'text-white' : 'text-gray-900'
                  } mb-4`}
                >
                  Ready to Upgrade Your Tech?
                </h2>
                <p
                  className={`text-lg ${
                    darkMode ? 'text-gray-300' : 'text-gray-600'
                  } mb-6`}
                >
                  Explore our wide selection of products and services designed
                  to enhance your digital experience. Whether you're a student,
                  professional, or tech enthusiast, we have everything you need.
                </p>
                <div className="flex flex-col sm:flex-row gap-4">
                  <button
                    className={`${
                      darkMode
                        ? 'bg-blue-600 hover:bg-blue-700'
                        : 'bg-blue-600 hover:bg-blue-700'
                    } text-white font-bold py-3 px-8 rounded-lg transition-colors shadow-lg`}
                    onClick={() => setIsCheckoutOpen(true)}
                  >
                    View Cart
                  </button>
                  <button
                    className={`${
                      darkMode
                        ? 'bg-gray-800 text-blue-400 border-blue-400 hover:bg-gray-700'
                        : 'bg-white text-blue-600 border-blue-600 hover:bg-blue-50'
                    } font-bold py-3 px-8 rounded-lg border-2 transition-colors`}
                  >
                    Contact Sales
                  </button>
                </div>
              </div>
              <div className="flex justify-center">
                <img
                  src="/Techsetup.jpg"
                  alt="Tech setup"
                  className="rounded-xl shadow-xl"
                />
              </div>
            </motion.div>
          </div>
        </section>

        {/* Newsletter Section */}
        <section className={`py-12 ${darkMode ? 'bg-gray-800' : 'bg-white'}`}>
          <div className="max-w-3xl mx-auto px-4 sm:px-6 text-center">
            <div
              className={`p-8 ${
                darkMode
                  ? 'bg-gray-700 border-gray-600'
                  : 'bg-blue-50 border-blue-100'
              } rounded-2xl border`}
            >
              <div className="w-16 h-16 mx-auto mb-6 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center">
                <Mail className="h-8 w-8 text-blue-600 dark:text-blue-400" />
              </div>
              <h2
                className={`text-2xl font-bold ${
                  darkMode ? 'text-white' : 'text-gray-900'
                } mb-2`}
              >
                Subscribe to Our Newsletter
              </h2>
              <p className={`text-${darkMode ? 'gray-300' : 'gray-600'} mb-6`}>
                Get the latest updates, offers and tech tips delivered straight
                to your inbox
              </p>
              <form className="flex flex-col sm:flex-row gap-2">
                <input
                  type="email"
                  placeholder="Your email address"
                  className={`flex-1 px-4 py-3 rounded-lg ${
                    darkMode
                      ? 'bg-gray-800 border-gray-600 text-white'
                      : 'bg-white border-gray-300 text-gray-900'
                  } border focus:outline-none focus:ring-2 focus:ring-blue-500`}
                  required
                />
                <button
                  type="submit"
                  className="px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Subscribe
                </button>
              </form>
              <p
                className={`mt-4 text-xs ${
                  darkMode ? 'text-gray-400' : 'text-gray-500'
                }`}
              >
                By subscribing, you agree to our Terms and Privacy Policy
              </p>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer
        className={`${
          darkMode ? 'bg-gray-900 text-white' : 'bg-blue-900 text-white'
        }`}
      >
        {/* Main Footer */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 pt-16 pb-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {/* Company Info */}
            <div>
              <div className="flex items-center mb-4">
                <Coffee size={28} className="text-blue-300 mr-2" />
                <span className="font-bold text-2xl text-white">
                  Vox<span className="text-blue-300">Cyber</span>
                </span>
              </div>
              <p className="text-blue-100 mb-6">
                Your one-stop shop for all things tech, stationery, and digital
                services. Serving both online and in-store customers with the
                best products and experiences.
              </p>
              <div className="flex space-x-4">
                <a
                  href="#"
                  className="bg-blue-800 hover:bg-blue-700 p-2 rounded-full transition-colors"
                >
                  <Facebook size={20} />
                </a>
                <a
                  href="#"
                  className="bg-blue-800 hover:bg-blue-700 p-2 rounded-full transition-colors"
                >
                  <Twitter size={20} />
                </a>
                <a
                  href="#"
                  className="bg-blue-800 hover:bg-blue-700 p-2 rounded-full transition-colors"
                >
                  <Instagram size={20} />
                </a>
                <a
                  href="#"
                  className="bg-blue-800 hover:bg-blue-700 p-2 rounded-full transition-colors"
                >
                  <Youtube size={20} />
                </a>
              </div>
            </div>

            {/* Quick Links */}
            <div>
              <h3 className="text-lg font-bold mb-4 text-white">Quick Links</h3>
              <ul className="space-y-3">
                <li>
                  <Link
                    to="/"
                    className="text-blue-100 hover:text-white transition-colors"
                  >
                    Home
                  </Link>
                </li>
                <li>
                  <Link
                    to="/shop"
                    className="text-blue-100 hover:text-white transition-colors"
                  >
                    Shop
                  </Link>
                </li>
                <li>
                  <Link
                    to="/services"
                    className="text-blue-100 hover:text-white transition-colors"
                  >
                    Services
                  </Link>
                </li>
                <li>
                  <Link
                    to="/websites"
                    className="text-blue-100 hover:text-white transition-colors"
                  >
                    Websites
                  </Link>
                </li>
                {user?.role === 'admin' && (
                  <li>
                    <Link
                      to="/admin"
                      className="text-blue-100 hover:text-white transition-colors"
                    >
                      Admin Dashboard
                    </Link>
                  </li>
                )}
              </ul>
            </div>

            {/* Contact Information */}
            <div>
              <h3 className="text-lg font-bold mb-4 text-white">Contact Us</h3>
              <ul className="space-y-4">
                <li className="flex items-start">
                  <MapPin
                    size={20}
                    className="text-blue-300 mr-2 mt-1 flex-shrink-0"
                  />
                  <span className="text-blue-100">
                    123 Tech Avenue, Downtown District, City, State, 12345
                  </span>
                </li>
                <li className="flex items-center">
                  <Phone
                    size={20}
                    className="text-blue-300 mr-2 flex-shrink-0"
                  />
                  <span className="text-blue-100">+1 (234) 567-8900</span>
                </li>
                <li className="flex items-center">
                  <Mail
                    size={20}
                    className="text-blue-300 mr-2 flex-shrink-0"
                  />
                  <span className="text-blue-100">info@VoxCyber.com</span>
                </li>
                <li className="flex items-center">
                  <Clock1
                    size={20}
                    className="text-blue-300 mr-2 flex-shrink-0"
                  />
                  <span className="text-blue-100">
                    Mon-Sat: 9AM-9PM, Sun: 10AM-6PM
                  </span>
                </li>
              </ul>
            </div>

            {/* Newsletter Form */}
            <div>
              <h3 className="text-lg font-bold mb-4 text-white">Newsletter</h3>
              <p className="text-blue-100 mb-4">
                Subscribe to our newsletter for the latest updates and offers.
              </p>
              <form className="flex">
                <input
                  type="email"
                  placeholder="Your email address"
                  className="flex-1 py-2 px-4 rounded-l-lg focus:outline-none dark:bg-gray-700 dark:text-white"
                  required
                />
                <button
                  type="submit"
                  className="bg-blue-600 text-white font-medium py-2 px-4 rounded-r-lg hover:bg-blue-500 transition-colors"
                >
                  Subscribe
                </button>
              </form>
            </div>
          </div>

          {/* Copyright */}
          <div className="mt-12 pt-8 border-t border-blue-800 text-center">
            <p className="text-blue-200 text-sm">
              © {new Date().getFullYear()} Vox Cyber. All rights reserved.
            </p>
          </div>
        </div>
      </footer>

      {/* Floating Button - Back to Top */}
      <AnimatePresence>
        {showScrollTop && (
          <motion.button
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            onClick={scrollToTop}
            className="fixed bottom-6 right-6 bg-blue-600 text-white p-3 rounded-full shadow-lg hover:bg-blue-700 transition-colors z-50"
          >
            <ChevronLeft size={24} className="transform rotate-90" />
          </motion.button>
        )}
      </AnimatePresence>

      {/* Cart Notification */}
      <div id="cart-notification" className="fixed bottom-4 right-4 z-50"></div>
    </div>
  );
};

export default CyberCafeLandingPage;
