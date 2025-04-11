'use client';

import { useState, useEffect } from 'react';
import {
  ShoppingBag,
  Wrench,
  Globe,
  ArrowRight,
  Menu,
  X,
  User,
} from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import AuthButtons from '../components/common/AuthButtons';
import { openAuthModal } from '../redux/slices/uiSlice';
import { fetchFeaturedProducts } from '../redux/slices/productsSlice';
import { fetchFeaturedCategories } from '../redux/slices/categoriesSlice';
import LoadingSpinner from '../components/common/LoadingSpinner';
import ErrorMessage from '../components/common/ErrorMessage';

export default function LandingPage() {
  const [activeService, setActiveService] = useState('shop');
  const [hoveredLinks, setHoveredLinks] = useState({});
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);
  const { featuredProducts, loading: productsLoading, error: productsError } = useSelector((state) => state.products);
  const { featuredCategories, loading: categoriesLoading, error: categoriesError } = useSelector((state) => state.categories);

  const [floatingCardPosition, setFloatingCardPosition] = useState({
    top: '30%',
    right: '10%',
  });

  // Fetch featured data
  useEffect(() => {
    dispatch(fetchFeaturedProducts());
    dispatch(fetchFeaturedCategories());
  }, [dispatch]);

  // Update floating card position based on window size
  useEffect(() => {
    const updateCardPosition = () => {
      if (window.innerWidth >= 1024) {
        // lg breakpoint
        setFloatingCardPosition({
          top: '30%',
          right: '10%',
        });
      } else if (window.innerWidth >= 768) {
        // md breakpoint
        setFloatingCardPosition({
          top: '45%',
          right: '5%',
        });
      } else {
        setFloatingCardPosition({
          top: '60%',
          right: '5%',
        });
      }
    };

    updateCardPosition();
    window.addEventListener('resize', updateCardPosition);
    return () => window.removeEventListener('resize', updateCardPosition);
  }, []);

  // Close mobile menu when window is resized to desktop size
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 768 && isMobileMenuOpen) {
        setIsMobileMenuOpen(false);
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [isMobileMenuOpen]);

  const services = {
    shop: {
      title: 'Online Shop',
      description:
        'Create and manage your online store with powerful e-commerce tools, inventory management, and secure payment processing.',
      icon: <ShoppingBag className="w-6 h-6" />,
      link: '/shop',
    },
    services: {
      title: 'Digital Services',
      description:
        'Offer your services online with booking systems, client management, and automated workflows to streamline your business.',
      icon: <Wrench className="w-6 h-6" />,
      link: '/services',
    },
    websites: {
      title: 'Website Builder',
      description:
        'Design and deploy stunning websites with our intuitive builder, custom templates, and powerful SEO tools.',
      icon: <Globe className="w-6 h-6" />,
      link: '/websites',
    },
  };

  const handleLinkHover = (linkId, isHovered) => {
    setHoveredLinks({ ...hoveredLinks, [linkId]: isHovered });
  };

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  // Handle empty featured products and categories
  const hasFeaturedProducts = featuredProducts && featuredProducts.length > 0;
  const hasFeaturedCategories = featuredCategories && featuredCategories.length > 0;

  // Show loading spinner only if both are loading
  if (productsLoading && categoriesLoading) {
    return <LoadingSpinner />;
  }

  // Show error message only if both have errors
  if (productsError && categoriesError) {
    return <ErrorMessage message="Failed to load content. Please try again later." />;
  }

  return (
    <div className="relative flex flex-col min-h-screen overflow-hidden">
      {/* Background elements */}
      <div className="absolute top-[-10%] right-[-5%] w-1/2 h-1/2 rounded-full bg-blue-500/10 blur-[60px] z-0"></div>
      <div className="absolute bottom-[-15%] left-[-10%] w-2/5 h-2/5 rounded-full bg-blue-500/10 blur-[80px] z-0"></div>
      <div className="absolute top-[40%] left-[30%] w-1/5 h-1/5 rounded-full bg-blue-500/10 blur-[50px] opacity-50 z-0"></div>

      {/* Cyber background image */}
      <div className="absolute inset-0 z-[1] pointer-events-none">
        <img
          src="https://images.unsplash.com/photo-1550751827-4bd374c3f58b?auto=format&fit=crop&q=80&w=2070"
          alt="Cyber background"
          className="w-full h-full object-cover opacity-15 filter blur-[1px] brightness-120 contrast-120 mix-blend-overlay"
        />
      </div>

      {/* Cyber overlay pattern */}
      <div className="absolute inset-0 bg-[linear-gradient(45deg,rgba(0,120,215,0.05)_25%,transparent_25%,transparent_50%,rgba(0,120,215,0.05)_50%,rgba(0,120,215,0.05)_75%,transparent_75%,transparent)] bg-[length:4px_4px] opacity-30 pointer-events-none z-[2]"></div>

      {/* Header */}
      <header className="relative flex items-center justify-between px-6 py-6 z-10">
        <div className="flex items-center gap-2">
          <div className="flex items-center justify-center w-8 h-8 bg-blue-600 text-white rounded-full font-bold">
            V
          </div>
          <span className="text-xl font-bold">VoxCyber</span>
        </div>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex gap-8">
          <Link
            to="/shop"
            className={`text-sm font-medium text-gray-700 hover:text-blue-600 transition-colors ${
              hoveredLinks['shop'] ? 'text-blue-600' : ''
            }`}
            onMouseEnter={() => handleLinkHover('shop', true)}
            onMouseLeave={() => handleLinkHover('shop', false)}
          >
            Shop
          </Link>

          <Link
            to="/services"
            className={`text-sm font-medium text-gray-700 hover:text-blue-600 transition-colors ${
              hoveredLinks['services'] ? 'text-blue-600' : ''
            }`}
            onMouseEnter={() => handleLinkHover('services', true)}
            onMouseLeave={() => handleLinkHover('services', false)}
          >
            Services
          </Link>

          <Link
            to="/websites"
            className={`text-sm font-medium text-gray-700 hover:text-blue-600 transition-colors ${
              hoveredLinks['websites'] ? 'text-blue-600' : ''
            }`}
            onMouseEnter={() => handleLinkHover('websites', true)}
            onMouseLeave={() => handleLinkHover('websites', false)}
          >
            Websites
          </Link>

          {/* Show Admin link if user is admin */}
          {user?.role === 'admin' && (
            <Link
              to="/admin"
              className="text-sm font-medium text-white bg-blue-600 px-3 py-1 rounded-md hover:bg-blue-700 transition-colors"
              onMouseEnter={() => handleLinkHover('admin', true)}
              onMouseLeave={() => handleLinkHover('admin', false)}
            >
              Admin
            </Link>
          )}
        </nav>

        {/* Auth Buttons for Desktop */}
        <div className="hidden md:block">
          <AuthButtons />
        </div>

        {/* Mobile Menu Button */}
        <button
          className="md:hidden flex flex-col gap-1 p-2 focus:outline-none"
          onClick={toggleMobileMenu}
          aria-label="Toggle menu"
        >
          {isMobileMenuOpen ? (
            <X className="w-6 h-6 text-gray-800" />
          ) : (
            <Menu className="w-6 h-6 text-gray-800" />
          )}
        </button>
      </header>

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <div className="md:hidden absolute top-[72px] left-0 right-0 bg-white shadow-lg z-50 p-4 border-t border-gray-200 animate-slideDown">
          <div className="flex flex-col space-y-3">
            <Link
              to="/shop"
              className="text-gray-700 hover:text-blue-600 py-2 px-4 rounded-md hover:bg-blue-50 transition-colors"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              Shop
            </Link>
            <Link
              to="/services"
              className="text-gray-700 hover:text-blue-600 py-2 px-4 rounded-md hover:bg-blue-50 transition-colors"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              Services
            </Link>
            <Link
              to="/websites"
              className="text-gray-700 hover:text-blue-600 py-2 px-4 rounded-md hover:bg-blue-50 transition-colors"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              Websites
            </Link>

            {user?.role === 'admin' && (
              <Link
                to="/admin"
                className="text-white bg-blue-600 py-2 px-4 rounded-md hover:bg-blue-700 transition-colors"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Admin Dashboard
              </Link>
            )}

            <div className="pt-3 border-t border-gray-200">
              {!user ? (
                <>
                  <button
                    onClick={() => {
                      dispatch(openAuthModal('login'));
                      setIsMobileMenuOpen(false);
                    }}
                    className="w-full text-left py-2 px-4 text-gray-700 hover:text-blue-600 rounded-md hover:bg-blue-50 transition-colors"
                  >
                    Log In
                  </button>
                  <button
                    onClick={() => {
                      dispatch(openAuthModal('register'));
                      setIsMobileMenuOpen(false);
                    }}
                    className="w-full text-left py-2 px-4 text-gray-700 hover:text-blue-600 rounded-md hover:bg-blue-50 transition-colors"
                  >
                    Sign Up
                  </button>
                </>
              ) : (
                <div className="flex items-center gap-2 px-4 py-2">
                  <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600">
                    {user.name.charAt(0) || <User className="w-4 h-4" />}
                  </div>
                  <div>
                    <p className="font-medium text-sm">{user.name}</p>
                    <p className="text-xs text-gray-500">{user.email}</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Main content */}
      <main className="flex flex-1 flex-col lg:flex-row px-6 py-8 relative z-[5]">
        <div className="hero-section flex flex-1 items-center">
          <div className="max-w-xl">
            <div className="inline-block px-3 py-1 bg-blue-500/10 text-blue-600 rounded-lg text-xs font-medium mb-4">
              Next-Gen Cyber Solutions
            </div>
            <h1 className="text-4xl md:text-5xl font-extrabold leading-tight mb-4">
              Welcome to <span className="text-blue-600">VoxCyber</span>
              {user && (
                <span className="text-blue-400 text-2xl ml-2 font-normal">
                  , {user.name}
                </span>
              )}
            </h1>
            <p className="text-gray-600 text-lg leading-relaxed mb-8">
              Empowering your digital presence with cutting-edge cybersecurity
              solutions and comprehensive digital services.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <button
                className="inline-flex items-center justify-center px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors shadow-md"
                onClick={() => navigate('/shop')}
              >
                Get Started
                <ArrowRight className="ml-2 w-5 h-5 transition-transform group-hover:translate-x-1" />
              </button>
              <button className="inline-flex items-center justify-center px-6 py-3 border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition-colors">
                Learn More
              </button>
            </div>
          </div>
        </div>

        <div className="services-section flex flex-1 flex-col justify-center lg:pl-8 mt-12 lg:mt-0">
          <div className="flex gap-4 mb-8 overflow-x-auto pb-2 sm:justify-center lg:justify-start">
            {Object.keys(services).map((key) => (
              <button
                key={key}
                className={`flex flex-col items-center gap-2 p-4 rounded-lg transition-all ${
                  activeService === key
                    ? 'bg-blue-500/10'
                    : 'hover:bg-blue-500/5'
                }`}
                onClick={() => setActiveService(key)}
              >
                <div
                  className={`w-12 h-12 flex items-center justify-center rounded-full transition-all ${
                    activeService === key
                      ? 'bg-blue-600 text-white'
                      : 'bg-blue-500/10 text-blue-600'
                  }`}
                >
                  {services[key].icon}
                </div>
                <span
                  className={`text-sm font-medium transition-colors ${
                    activeService === key ? 'text-blue-600' : 'text-gray-700'
                  }`}
                >
                  {services[key].title}
                </span>
              </button>
            ))}
          </div>

          <div className="p-8 bg-white rounded-xl shadow-lg">
            <div className="w-16 h-16 flex items-center justify-center bg-blue-500/10 text-blue-600 rounded-full mb-6">
              {services[activeService].icon}
            </div>
            <h2 className="text-2xl font-bold mb-4">
              {services[activeService].title}
            </h2>
            <p className="text-gray-600 leading-relaxed mb-6">
              {services[activeService].description}
            </p>
            <Link
              to={services[activeService].link}
              className="inline-flex items-center text-blue-600 font-medium hover:text-blue-800 transition-colors"
              onMouseEnter={() => handleLinkHover('serviceLink', true)}
              onMouseLeave={() => handleLinkHover('serviceLink', false)}
            >
              Explore {services[activeService].title}
              <ArrowRight
                className={`ml-2 w-5 h-5 transition-transform ${
                  hoveredLinks['serviceLink'] ? 'translate-x-1' : ''
                }`}
              />
            </Link>
          </div>
        </div>

        {/* Floating service cards */}
        <div
          className={`absolute w-[220px] p-5 bg-white rounded-xl shadow-lg transition-all duration-500 z-[5] ${
            activeService === 'shop'
              ? 'opacity-100 translate-y-0'
              : 'opacity-0 translate-y-5 pointer-events-none'
          }`}
          style={{
            top: floatingCardPosition.top,
            right: floatingCardPosition.right,
          }}
        >
          <div className="w-12 h-12 flex items-center justify-center bg-blue-500/10 text-blue-600 rounded-full mb-4">
            <ShoppingBag className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-lg font-semibold mb-3">Online Shop</h3>
            <ul className="space-y-2">
              <li className="relative pl-5 text-sm text-gray-600 before:content-[''] before:absolute before:left-0 before:top-[0.5rem] before:w-2 before:h-2 before:bg-blue-500/10 before:rounded-full">
                Product Management
              </li>
              <li className="relative pl-5 text-sm text-gray-600 before:content-[''] before:absolute before:left-0 before:top-[0.5rem] before:w-2 before:h-2 before:bg-blue-500/10 before:rounded-full">
                Secure Payments
              </li>
              <li className="relative pl-5 text-sm text-gray-600 before:content-[''] before:absolute before:left-0 before:top-[0.5rem] before:w-2 before:h-2 before:bg-blue-500/10 before:rounded-full">
                Inventory Tracking
              </li>
            </ul>
          </div>
        </div>

        <div
          className={`absolute w-[220px] p-5 bg-white rounded-xl shadow-lg transition-all duration-500 z-[5] ${
            activeService === 'services'
              ? 'opacity-100 translate-y-0'
              : 'opacity-0 translate-y-5 pointer-events-none'
          }`}
          style={{
            top: floatingCardPosition.top,
            right: floatingCardPosition.right,
          }}
        >
          <div className="w-12 h-12 flex items-center justify-center bg-blue-500/10 text-blue-600 rounded-full mb-4">
            <Wrench className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-lg font-semibold mb-3">Digital Services</h3>
            <ul className="space-y-2">
              <li className="relative pl-5 text-sm text-gray-600 before:content-[''] before:absolute before:left-0 before:top-[0.5rem] before:w-2 before:h-2 before:bg-blue-500/10 before:rounded-full">
                Booking System
              </li>
              <li className="relative pl-5 text-sm text-gray-600 before:content-[''] before:absolute before:left-0 before:top-[0.5rem] before:w-2 before:h-2 before:bg-blue-500/10 before:rounded-full">
                Client Management
              </li>
              <li className="relative pl-5 text-sm text-gray-600 before:content-[''] before:absolute before:left-0 before:top-[0.5rem] before:w-2 before:h-2 before:bg-blue-500/10 before:rounded-full">
                Automated Workflows
              </li>
            </ul>
          </div>
        </div>

        <div
          className={`absolute w-[220px] p-5 bg-white rounded-xl shadow-lg transition-all duration-500 z-[5] ${
            activeService === 'websites'
              ? 'opacity-100 translate-y-0'
              : 'opacity-0 translate-y-5 pointer-events-none'
          }`}
          style={{
            top: floatingCardPosition.top,
            right: floatingCardPosition.right,
          }}
        >
          <div className="w-12 h-12 flex items-center justify-center bg-blue-500/10 text-blue-600 rounded-full mb-4">
            <Globe className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-lg font-semibold mb-3">Website Builder</h3>
            <ul className="space-y-2">
              <li className="relative pl-5 text-sm text-gray-600 before:content-[''] before:absolute before:left-0 before:top-[0.5rem] before:w-2 before:h-2 before:bg-blue-500/10 before:rounded-full">
                Drag & Drop Builder
              </li>
              <li className="relative pl-5 text-sm text-gray-600 before:content-[''] before:absolute before:left-0 before:top-[0.5rem] before:w-2 before:h-2 before:bg-blue-500/10 before:rounded-full">
                Responsive Templates
              </li>
              <li className="relative pl-5 text-sm text-gray-600 before:content-[''] before:absolute before:left-0 before:top-[0.5rem] before:w-2 before:h-2 before:bg-blue-500/10 before:rounded-full">
                SEO Tools
              </li>
            </ul>
          </div>
        </div>
      </main>

      {/* Featured Products Section - Only show if there are featured products */}
      {hasFeaturedProducts && (
        <section className="py-16 px-6 relative z-10">
          <div className="max-w-7xl mx-auto">
            <h2 className="text-3xl font-bold text-gray-900 mb-8">Featured Products</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {featuredProducts.map((product) => (
                <div key={product._id} className="bg-white rounded-lg shadow-md overflow-hidden">
                  <img
                    src={product.image}
                    alt={product.name}
                    className="w-full h-48 object-cover"
                  />
                  <div className="p-4">
                    <h3 className="text-lg font-semibold text-gray-900">{product.name}</h3>
                    <p className="text-gray-600 mt-1">${product.price.toFixed(2)}</p>
                    <Link
                      to={`/product/${product._id}`}
                      className="mt-4 inline-block bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"
                    >
                      View Details
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Featured Categories Section - Only show if there are featured categories */}
      {hasFeaturedCategories && (
        <section className="py-16 px-6 bg-gray-50 relative z-10">
          <div className="max-w-7xl mx-auto">
            <h2 className="text-3xl font-bold text-gray-900 mb-8">Featured Categories</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {featuredCategories.map((category) => (
                <div key={category._id} className="bg-white rounded-lg shadow-md overflow-hidden">
                  <img
                    src={category.image}
                    alt={category.name}
                    className="w-full h-48 object-cover"
                  />
                  <div className="p-4">
                    <h3 className="text-lg font-semibold text-gray-900">{category.name}</h3>
                    <Link
                      to={`/shop?category=${category._id}`}
                      className="mt-4 inline-block bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"
                    >
                      Browse Products
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Footer */}
      <footer className="flex flex-col sm:flex-row items-center justify-between px-6 py-6 border-t border-gray-200 relative z-10">
        <p className="text-xs text-gray-600 mb-4 sm:mb-0">
          © {new Date().getFullYear()} VoxCyber. All rights reserved.
        </p>
        <div className="flex gap-6">
          <a
            href="/terms"
            className={`text-xs text-gray-600 hover:text-blue-600 transition-colors ${
              hoveredLinks['terms'] ? 'text-blue-600' : ''
            }`}
            onMouseEnter={() => handleLinkHover('terms', true)}
            onMouseLeave={() => handleLinkHover('terms', false)}
          >
            Terms
          </a>
          <a
            href="/privacy"
            className={`text-xs text-gray-600 hover:text-blue-600 transition-colors ${
              hoveredLinks['privacy'] ? 'text-blue-600' : ''
            }`}
            onMouseEnter={() => handleLinkHover('privacy', true)}
            onMouseLeave={() => handleLinkHover('privacy', false)}
          >
            Privacy
          </a>
          <a
            href="/contact"
            className={`text-xs text-gray-600 hover:text-blue-600 transition-colors ${
              hoveredLinks['contact'] ? 'text-blue-600' : ''
            }`}
            onMouseEnter={() => handleLinkHover('contact', true)}
            onMouseLeave={() => handleLinkHover('contact', false)}
          >
            Contact
          </a>
        </div>
      </footer>
    </div>
  );
}
