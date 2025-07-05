'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { ChevronUp } from 'lucide-react';
import { toast, ToastContainer } from 'react-toastify';

// Redux actions
import {
  addToCart,
  fetchCart,
  removeFromCart,
  updateCartItemQuantity,
} from '../redux/slices/cartSlice';
import {
  fetchProducts,
  fetchFeaturedProducts,
  fetchNewArrivals,
  fetchSaleProducts,
} from '../redux/slices/productsSlice';
import {
  fetchCategories,
  fetchFeaturedCategories,
} from '../redux/slices/categoriesSlice';
import { fetchSpecialOffers } from '../redux/slices/specialOffersSlice';
import { fetchHeroSlides } from '../redux/slices/heroSlidesSlice';

// Components
import Header from './components/Header';
import HeroSlider from './components/HeroSlider';
import ServicesBar from './components/ServicesBar';
import SectionHeader from './components/SectionHeader';
import QuickViewModal from './components/QuickViewModal';
import NewsletterPopup from './components/NewsletterPopup';
import Footer from './components/Footer';
import LoadingScreen from './common/LoadingScreen';
import ErrorFallback from './common/ErrorFallback';
import StatusMessage from './common/StatusMessage';
import CheckoutModal from '../components/checkout/CheckoutModal';
// import DialogflowChatbot from './DialogflowChatbot';

// Loaders
import GlobalLoader from './components/loaders/GlobalLoader';
import SectionLoader from './components/loaders/SectionLoader';
import ToastLoader from './components/loaders/ToastLoader';
import SkeletonLoader from './components/loaders/SkeletonLoader';

// Enhanced Components
import EnhancedCategoryCard from './components/EnhancedCategoryCard';
import EnhancedSpecialOffers from './components/EnhancedSpecialOffers';
import DynamicProductsSection from './components/DynamicProductsSection';

// Data
import {
  fallbackHeroSlides,
  fallbackCategories,
  fallbackProducts,
  fallbackSpecialOffers,
} from '../lib/data/data';

// Custom hooks
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

const useIntersectionObserver = (options = {}) => {
  const [isIntersecting, setIsIntersecting] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsIntersecting(entry.isIntersecting);
      },
      {
        threshold: 0.1,
        rootMargin: '50px',
        ...options,
      }
    );

    const currentRef = ref.current;
    if (currentRef) {
      observer.observe(currentRef);
    }

    return () => {
      if (currentRef) {
        observer.unobserve(currentRef);
      }
    };
  }, []);

  return [ref, isIntersecting];
};

// Testimonials data
const testimonials = [
  {
    id: 1,
    name: 'John Smith',
    role: 'Student',
    content:
      'The gaming PCs here are amazing! I come here every weekend to play with my friends. The staff is super friendly and the prices are reasonable.',
    avatar: '/user.png',
    rating: 5,
  },
  {
    id: 2,
    name: 'Sarah Johnson',
    role: 'Freelancer',
    content:
      "I work remotely and this place is perfect for me. Fast internet, quiet environment, and great coffee. It's my second office!",
    avatar: '/user.png',
    rating: 5,
  },
  {
    id: 3,
    name: 'Michael Chen',
    role: 'Gamer',
    content:
      "The gaming setup here is top-notch. I've tried many cyber cafes, but this one has the best equipment and the most comfortable chairs.",
    avatar: '/user.png',
    rating: 5,
  },
];

const useDataWithFallback = (serverData, fallbackData, isLoading, error) => {
  if (
    (error || (Array.isArray(serverData) && serverData.length === 0)) &&
    !isLoading
  ) {
    return fallbackData;
  }
  return serverData;
};

const CyberCafeLandingPage = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user } = useSelector((state) => state.auth);
  const { darkMode } = useSelector((state) => state.ui);
  const systemPrefersDark = useThemeDetector();

  // Redux state
  const {
    products: productsData,
    loading: productsLoading,
    error: productsError,
    filters,
  } = useSelector((state) => state.products);

  const {
    categories: categoriesData,
    loading: categoriesLoading,
    error: categoriesError,
  } = useSelector((state) => state.categories);

  const {
    specialOffers: specialOffersData,
    loading: offersLoading,
    error: offersError,
  } = useSelector((state) => state.specialOffers);

  const {
    heroSlides: heroSlidesData,
    loading: slidesLoading,
    error: slidesError,
  } = useSelector((state) => state.heroSlides);

  const { items: cartItems, loading: cartLoading } = useSelector(
    (state) => state.cart
  );

  // Effective data with fallbacks
  const effectiveHeroSlides = useDataWithFallback(
    heroSlidesData,
    fallbackHeroSlides,
    slidesLoading,
    slidesError
  );

  const effectiveCategories = useDataWithFallback(
    categoriesData,
    fallbackCategories,
    categoriesLoading,
    categoriesError
  );

  const effectiveProducts = useDataWithFallback(
    productsData,
    fallbackProducts,
    productsLoading,
    productsError
  );

  const effectiveSpecialOffers = useDataWithFallback(
    specialOffersData,
    fallbackSpecialOffers,
    offersLoading,
    offersError
  );

  // Local state
  const [isInitialLoading, setIsInitialLoading] = useState(true);
  const [statusMessages, setStatusMessages] = useState([]);
  const [hasError, setHasError] = useState(false);
  const [errorDetails, setErrorDetails] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [quickViewProduct, setQuickViewProduct] = useState(null);
  const [isQuickViewOpen, setIsQuickViewOpen] = useState(false);
  const [isNewsletterOpen, setIsNewsletterOpen] = useState(false);
  const [showScrollTop, setShowScrollTop] = useState(false);

  // Loading states for different operations
  const [isAddingToCart, setIsAddingToCart] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const [isFilteringCategory, setIsFilteringCategory] = useState(false);
  const [currentLoadingProduct, setCurrentLoadingProduct] = useState(null);
  const [globalLoadingMessage, setGlobalLoadingMessage] = useState('');
  const [showGlobalLoader, setShowGlobalLoader] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [showToastLoader, setShowToastLoader] = useState(false);

  const [categoriesRef] = useIntersectionObserver();
  const [productsRef] = useIntersectionObserver();
  const [specialOffersRef] = useIntersectionObserver();
  const [ctaRef] = useIntersectionObserver();

  const [searchParams, setSearchParams] = useSearchParams();

  // Status message functions
  const addStatusMessage = useCallback((message) => {
    const id = Date.now();
    setStatusMessages((prev) => [...prev, { id, ...message }]);
    return id;
  }, []);

  const removeStatusMessage = useCallback((id) => {
    setStatusMessages((prev) => prev.filter((msg) => msg.id !== id));
  }, []);

  // Show global loader helper
  const showGlobalLoaderWithMessage = useCallback(
    (message, submessage = '') => {
      setGlobalLoadingMessage(message);
      setShowGlobalLoader(true);
    },
    []
  );

  const hideGlobalLoader = useCallback(() => {
    setShowGlobalLoader(false);
    setGlobalLoadingMessage('');
  }, []);

  // Show toast loader helper
  const showToastLoaderWithMessage = useCallback((message) => {
    setToastMessage(message);
    setShowToastLoader(true);
  }, []);

  const hideToastLoader = useCallback(() => {
    setShowToastLoader(false);
    setToastMessage('');
  }, []);

  // Fetch all data
  const fetchAllData = useCallback(async () => {
    try {
      if (!isInitialLoading) {
        showGlobalLoaderWithMessage(
          'Refreshing content...',
          'Please wait while we update the latest data'
        );
      }

      const promises = [
        dispatch(fetchProducts(filters)).unwrap(),
        dispatch(fetchFeaturedProducts()).unwrap(),
        dispatch(fetchNewArrivals()).unwrap(),
        dispatch(fetchSaleProducts()).unwrap(),
        dispatch(fetchCategories()).unwrap(),
        dispatch(fetchFeaturedCategories()).unwrap(),
        dispatch(fetchSpecialOffers()).unwrap(),
        dispatch(fetchHeroSlides()).unwrap(),
      ];

      await Promise.all(promises);

      if (!isInitialLoading) {
        hideGlobalLoader();
        addStatusMessage({
          type: 'success',
          title: 'Content Updated',
          message: 'All content has been refreshed successfully.',
          duration: 3,
        });
      }

      setHasError(false);
      setErrorDetails(null);
    } catch (error) {
      console.error('Error fetching data:', error);
      setHasError(true);
      setErrorDetails(error);
      hideGlobalLoader();

      if (!isInitialLoading) {
        addStatusMessage({
          type: 'error',
          title: 'Update Failed',
          message: 'Failed to refresh content. Please try again.',
          duration: 5,
        });
      }
    } finally {
      setIsInitialLoading(false);
    }
  }, [
    dispatch,
    filters,
    isInitialLoading,
    addStatusMessage,
    showGlobalLoaderWithMessage,
    hideGlobalLoader,
  ]);

  // Initial data fetch
  useEffect(() => {
    fetchAllData();
  }, [fetchAllData]);

  // Fetch cart data
  useEffect(() => {
    if (user?._id) {
      showToastLoaderWithMessage('Loading your cart...');
      dispatch(fetchCart()).finally(() => {
        hideToastLoader();
      });
    }
  }, [dispatch, user, showToastLoaderWithMessage, hideToastLoader]);

  // Newsletter popup
  useEffect(() => {
    if (isInitialLoading) return;

    const timer = setTimeout(() => {
      const hasSeenNewsletter = localStorage.getItem('hasSeenNewsletter');
      if (!hasSeenNewsletter) {
        setIsNewsletterOpen(true);
        localStorage.setItem('hasSeenNewsletter', 'true');
      }
    }, 5000);

    return () => clearTimeout(timer);
  }, [isInitialLoading]);

  // Handle scroll events
  useEffect(() => {
    let ticking = false;

    const handleScroll = () => {
      if (!ticking) {
        requestAnimationFrame(() => {
          setShowScrollTop(window.scrollY > 300);
          ticking = false;
        });
        ticking = true;
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Payment status handling
  useEffect(() => {
    const paymentStatus = searchParams.get('payment');

    if (paymentStatus) {
      switch (paymentStatus) {
        case 'success': {
          const successData = localStorage.getItem('paymentSuccess');
          if (successData) {
            const { orderId } = JSON.parse(successData);
            toast.success(`Payment successful! Order ID: ${orderId}`);
            localStorage.removeItem('paymentSuccess');
          }
          break;
        }
        case 'failed': {
          const failureData = localStorage.getItem('paymentFailure');
          if (failureData) {
            const { reason } = JSON.parse(failureData);
            toast.error(`Payment failed: ${reason}`);
            localStorage.removeItem('paymentFailure');
          }
          break;
        }
        case 'pending':
          toast.info(
            'Payment is still being processed. We will notify you once completed.'
          );
          break;
        case 'error':
          toast.error(
            'There was an error processing your payment. Please try again.'
          );
          break;
      }
      setSearchParams({});
    }
  }, [searchParams, setSearchParams]);

  // Event handlers
  const handleSearch = useCallback(
    async (e) => {
      e.preventDefault();
      setIsSearching(true);
      showToastLoaderWithMessage('Searching products...');

      try {
        // Simulate search delay
        await new Promise((resolve) => setTimeout(resolve, 1000));
        document
          .getElementById('featured-products')
          ?.scrollIntoView({ behavior: 'smooth' });
      } finally {
        setIsSearching(false);
        hideToastLoader();
      }
    },
    [showToastLoaderWithMessage, hideToastLoader]
  );

  const handleAddToCart = useCallback(
    async (product, quantity = 1) => {
      if (!product || !product._id) {
        console.error('Invalid product data:', product);
        addStatusMessage({
          type: 'error',
          title: 'Error',
          message: 'Could not add product to cart. Invalid product data.',
          duration: 3,
        });
        return;
      }

      setIsAddingToCart(true);
      setCurrentLoadingProduct(product._id);
      showToastLoaderWithMessage(`Adding ${product.name} to cart...`);

      try {
        await dispatch(
          addToCart({
            productId: product._id,
            quantity,
          })
        ).unwrap();

        addStatusMessage({
          type: 'success',
          title: 'Added to Cart',
          message: `${product.name} has been added to your cart.`,
          duration: 3,
          actions: [
            {
              text: 'View Cart',
              primary: true,
              onClick: () => setIsCheckoutOpen(true),
            },
          ],
        });
      } catch (error) {
        console.error('Error adding to cart:', error);
        addStatusMessage({
          type: 'error',
          title: 'Error',
          message: `Failed to add ${product.name} to cart: ${error}`,
          duration: 3,
        });
      } finally {
        setIsAddingToCart(false);
        setCurrentLoadingProduct(null);
        hideToastLoader();
      }
    },
    [dispatch, addStatusMessage, showToastLoaderWithMessage, hideToastLoader]
  );

  const handleUpdateCartQuantity = useCallback(
    async (productId, quantity) => {
      showToastLoaderWithMessage('Updating cart...');
      try {
        await dispatch(updateCartItemQuantity({ productId, quantity }));
      } finally {
        hideToastLoader();
      }
    },
    [dispatch, showToastLoaderWithMessage, hideToastLoader]
  );

  const handleRemoveFromCart = useCallback(
    async (productId) => {
      showToastLoaderWithMessage('Removing item from cart...');
      try {
        await dispatch(removeFromCart(productId));
        addStatusMessage({
          type: 'info',
          title: 'Item Removed',
          message: 'Item has been removed from your cart.',
          duration: 3,
        });
      } finally {
        hideToastLoader();
      }
    },
    [dispatch, addStatusMessage, showToastLoaderWithMessage, hideToastLoader]
  );

  const handleBuyNow = useCallback(
    async (product) => {
      showGlobalLoaderWithMessage(
        'Adding item to cart...',
        'Adding item to cart and redirecting'
      );

      try {
        await dispatch(
          addToCart({ productId: product._id, quantity: 1 })
        ).unwrap();
        // navigate('/checkout');
      } catch (error) {
        console.error('Error adding to cart:', error);
        addStatusMessage({
          type: 'error',
          title: 'Error',
          message: `Failed to add ${product.name} to cart: ${error}`,
          duration: 3,
        });
      } finally {
        hideGlobalLoader();
      }
    },
    [
      dispatch,
      navigate,
      addStatusMessage,
      showGlobalLoaderWithMessage,
      hideGlobalLoader,
    ]
  );

  const handleQuickView = useCallback((product) => {
    setQuickViewProduct(product);
    setIsQuickViewOpen(true);
  }, []);

  const handleCategoryFilter = useCallback(
    async (categoryName) => {
      setIsFilteringCategory(true);
      showToastLoaderWithMessage(`Loading ${categoryName} products...`);

      try {
        // Simulate filtering delay for smooth UX
        await new Promise((resolve) => setTimeout(resolve, 500));

        setSelectedCategory(categoryName);

        // Scroll to products section smoothly
        setTimeout(() => {
          document.getElementById('featured-products')?.scrollIntoView({
            behavior: 'smooth',
            block: 'start',
          });
        }, 100);

        addStatusMessage({
          type: 'success',
          title: 'Category Filtered',
          message: `Now showing ${categoryName} products.`,
          duration: 2,
        });
      } finally {
        setIsFilteringCategory(false);
        hideToastLoader();
      }
    },
    [showToastLoaderWithMessage, hideToastLoader, addStatusMessage]
  );

  const scrollToTop = useCallback(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  // Loading screen
  if (isInitialLoading) {
    return <LoadingScreen message="Loading VoxCyber..." />;
  }

  // Error fallback
  if (hasError && errorDetails) {
    return (
      <ErrorFallback
        error={errorDetails}
        resetErrorBoundary={fetchAllData}
        onHome={() => navigate('/')}
        onSupport={() => window.open('/support', '_blank')}
      />
    );
  }

  return (
    <div
      className={`min-h-screen ${
        darkMode ? 'dark bg-gray-900 text-white' : 'bg-gray-50 text-gray-900'
      } overflow-x-hidden transition-colors duration-300`}
    >
      {/* Global Loaders */}
      <GlobalLoader
        isVisible={showGlobalLoader}
        message={globalLoadingMessage}
        variant="pulse"
      />

      <ToastLoader
        isVisible={showToastLoader}
        message={toastMessage}
        position="top-center"
      />

      {/* Status Messages */}
      <div className="fixed top-4 right-4 z-[9997] flex flex-col gap-2 max-w-md">
        <AnimatePresence>
          {statusMessages.map((msg) => (
            <motion.div
              key={msg.id}
              initial={{ opacity: 0, y: -20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -20, scale: 0.95 }}
              transition={{ duration: 0.2 }}
            >
              <StatusMessage
                id={msg.id}
                type={msg.type}
                title={msg.title}
                message={msg.message}
                duration={msg.duration}
                actions={msg.actions}
                onDismiss={() => removeStatusMessage(msg.id)}
              />
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* Modals */}
      <CheckoutModal
        isOpen={isCheckoutOpen}
        onClose={() => setIsCheckoutOpen(false)}
        onUpdateQuantity={handleUpdateCartQuantity}
        onRemoveItem={handleRemoveFromCart}
        isLoading={cartLoading}
      />
      <QuickViewModal
        product={quickViewProduct}
        isOpen={isQuickViewOpen}
        onClose={() => setIsQuickViewOpen(false)}
        onAddToCart={(product, quantity) => {
          if (!product || !product._id) {
            console.error('Invalid product data in QuickViewModal:', product);
            return;
          }
          handleAddToCart(product, quantity);
        }}
        onBuyNow={handleBuyNow}
        isLoading={currentLoadingProduct === quickViewProduct?._id}
      />
      <NewsletterPopup
        isOpen={isNewsletterOpen}
        onClose={() => setIsNewsletterOpen(false)}
      />

      {/* <DialogflowChatbot /> */}

      {/* Header */}
      <Header
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        isSearchFocused={isSearchFocused}
        setIsSearchFocused={setIsSearchFocused}
        handleSearch={handleSearch}
        setIsCheckoutOpen={setIsCheckoutOpen}
        cartItems={cartItems}
        isSearching={isSearching}
      />

      <main>
        {/* Hero Slider */}
        <HeroSlider
          heroSlides={effectiveHeroSlides}
          isLoading={slidesLoading}
          error={slidesError}
        />

        {/* Services Bar */}
        <ServicesBar darkMode={darkMode} />

        {/* Categories Section - ENHANCED */}
        <section ref={categoriesRef} className="py-20 relative overflow-hidden">
          {/* Background Decorations */}
          <div className="absolute inset-0 opacity-5">
            <div className="absolute top-0 left-1/4 w-96 h-96 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full blur-3xl" />
            <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-gradient-to-br from-pink-500 to-yellow-500 rounded-full blur-3xl" />
          </div>

          <div className="max-w-7xl mx-auto px-4 sm:px-6 relative">
            <motion.div
              className="text-center mb-16"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <div className="inline-block px-4 py-2 rounded-full bg-gradient-to-r from-blue-100 to-purple-100 dark:from-blue-900/30 dark:to-purple-900/30 text-blue-600 dark:text-blue-400 text-sm font-medium mb-6">
                🎯 Explore Categories
              </div>
              <h2
                className={`text-4xl lg:text-5xl font-bold ${
                  darkMode ? 'text-white' : 'text-gray-900'
                } mb-4`}
              >
                Browse By Category
              </h2>
              <p
                className={`text-xl ${
                  darkMode ? 'text-gray-400' : 'text-gray-600'
                } max-w-2xl mx-auto`}
              >
                Discover everything you need for work, study, and entertainment
              </p>
            </motion.div>

            <SectionLoader
              isLoading={categoriesLoading || isFilteringCategory}
              message="Loading categories..."
              height="400px"
            >
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
                {effectiveCategories.length > 0 ? (
                  effectiveCategories.map((category, index) => (
                    <EnhancedCategoryCard
                      key={category._id}
                      category={category}
                      darkMode={darkMode}
                      onCategorySelect={handleCategoryFilter}
                      isSelected={selectedCategory === category.name}
                      index={index}
                    />
                  ))
                ) : (
                  <SkeletonLoader
                    variant="card"
                    count={8}
                    className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8"
                  />
                )}
              </div>
            </SectionLoader>
          </div>
        </section>

        {/* Dynamic Products Section - REPLACES FEATURED PRODUCTS */}
        <DynamicProductsSection
          products={effectiveProducts}
          categories={effectiveCategories}
          selectedCategory={selectedCategory}
          onCategoryChange={setSelectedCategory}
          onQuickView={handleQuickView}
          onAddToCart={handleAddToCart}
          onBuyNow={handleBuyNow}
          currentLoadingProduct={currentLoadingProduct}
          isLoading={productsLoading}
          darkMode={darkMode}
        />

        {/* Special Offers Section - ENHANCED */}
        <section
          ref={specialOffersRef}
          className="py-20 relative overflow-hidden"
        >
          {/* Background Elements */}
          <div className="absolute inset-0 opacity-10">
            <div className="absolute top-1/4 left-0 w-72 h-72 bg-gradient-to-br from-red-500 to-pink-500 rounded-full blur-3xl -translate-x-1/2" />
            <div className="absolute bottom-1/4 right-0 w-72 h-72 bg-gradient-to-br from-orange-500 to-yellow-500 rounded-full blur-3xl translate-x-1/2" />
          </div>

          <div className="max-w-7xl mx-auto px-4 sm:px-6 relative">
            <motion.div
              className="text-center mb-16"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <div className="inline-block px-4 py-2 rounded-full bg-gradient-to-r from-red-100 to-orange-100 dark:from-red-900/30 dark:to-orange-900/30 text-red-600 dark:text-red-400 text-sm font-medium mb-6 animate-pulse">
                🔥 Limited Time Only
              </div>
              <h2
                className={`text-4xl lg:text-5xl font-bold ${
                  darkMode ? 'text-white' : 'text-gray-900'
                } mb-4`}
              >
                Special Deals & Bundles
              </h2>
              <p
                className={`text-xl ${
                  darkMode ? 'text-gray-400' : 'text-gray-600'
                } max-w-3xl mx-auto`}
              >
                Take advantage of these exclusive offers before they're gone
                forever
              </p>
            </motion.div>

            <SectionLoader
              isLoading={offersLoading}
              message="Loading special offers..."
              height="500px"
            >
              <EnhancedSpecialOffers
                offers={effectiveSpecialOffers}
                darkMode={darkMode}
              />
            </SectionLoader>
          </div>
        </section>

        {/* Call to Action Section */}
        <section ref={ctaRef} className="py-24">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 text-center">
            <div className="inline-block px-3 py-1 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 text-sm font-medium mb-4 animate-fade-in">
              Ready to get started?
            </div>
            <h2
              className={`text-4xl font-bold ${
                darkMode ? 'text-white' : 'text-gray-900'
              } mb-4 animate-fade-in`}
            >
              Explore the future of tech with VoxCyber
            </h2>
            <p
              className={`text-xl ${
                darkMode ? 'text-gray-400' : 'text-gray-600'
              } max-w-3xl mx-auto mb-8 animate-fade-in`}
            >
              Join our community of tech enthusiasts and discover the latest
              innovations in gaming, internet, and computer services.
            </p>
            <div className="flex justify-center gap-4 animate-fade-in">
              <button className="px-8 py-4 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors shadow-md">
                Get Started Now
              </button>
              <button className="px-8 py-4 border rounded-lg transition-colors shadow-md">
                Learn More
              </button>
            </div>
          </div>
        </section>

        {/* Testimonials Section */}
        <section className="py-16">
          <div className="max-w-6xl mx-auto px-4 sm:px-6">
            <SectionHeader
              title="What Our Customers Say"
              subtitle="Real stories from real people"
              darkMode={darkMode}
            />
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {testimonials.map((testimonial) => (
                <div
                  key={testimonial.id}
                  className={`${
                    darkMode
                      ? 'bg-gray-800 border-gray-700'
                      : 'bg-white border-gray-200'
                  } rounded-xl border overflow-hidden shadow-md`}
                >
                  <div className="p-6">
                    <div className="flex items-center mb-4">
                      <img
                        src={testimonial.avatar || '/placeholder.svg'}
                        alt={testimonial.name}
                        className="w-12 h-12 rounded-full mr-4"
                        loading="lazy"
                      />
                      <div>
                        <h4
                          className={`text-lg font-medium ${
                            darkMode ? 'text-white' : 'text-gray-900'
                          }`}
                        >
                          {testimonial.name}
                        </h4>
                        <p
                          className={`text-sm ${
                            darkMode ? 'text-gray-400' : 'text-gray-500'
                          }`}
                        >
                          {testimonial.role}
                        </p>
                      </div>
                    </div>
                    <p
                      className={`text-sm ${
                        darkMode ? 'text-gray-400' : 'text-gray-600'
                      }`}
                    >
                      {testimonial.content}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <Footer darkMode={darkMode} />

      {/* Scroll to Top Button */}
      <AnimatePresence>
        {showScrollTop && (
          <motion.button
            onClick={scrollToTop}
            className="fixed bottom-8 right-8 bg-blue-600 hover:bg-blue-700 text-white p-3 rounded-full shadow-lg transition-colors z-[9996]"
            aria-label="Scroll to top"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            transition={{ duration: 0.2 }}
          >
            <ChevronUp size={24} />
          </motion.button>
        )}
      </AnimatePresence>

      <ToastContainer />
    </div>
  );
};

export default CyberCafeLandingPage;
