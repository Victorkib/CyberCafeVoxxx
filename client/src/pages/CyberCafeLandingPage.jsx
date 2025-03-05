import React, { useState, useEffect } from 'react';
import {
  ChevronRight,
  ShoppingCart,
  Search,
  Heart,
  User,
  Menu,
  X,
  ArrowRight,
  Clock,
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
  CreditCard,
  Truck,
  Gift,
  Shield,
  Facebook,
  Twitter,
  Instagram,
  Youtube,
  Mail,
  Clock1,
} from 'lucide-react';

const CyberCafeLandingPage = () => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearchFocused, setIsSearchFocused] = useState(false);

  // Featured products data
  const featuredProducts = [
    {
      id: 1,
      name: 'High-Performance Gaming Mouse',
      price: 49.99,
      rating: 4.8,
      image: '/mouse.jpg',
      category: 'Electronics',
      tag: 'New',
    },
    {
      id: 2,
      name: 'Mechanical Keyboard - RGB Backlit',
      price: 89.99,
      rating: 4.7,
      image: '/keyboard.jpg',
      category: 'Electronics',
      tag: 'Best Seller',
    },
    {
      id: 3,
      name: 'Ultra HD Webcam',
      price: 59.99,
      rating: 4.5,
      image: '/webcam.jpg',
      category: 'Electronics',
      tag: 'Hot',
    },
    {
      id: 4,
      name: 'USB Flash Drive - 128GB',
      price: 24.99,
      rating: 4.6,
      image: '/usb.jpg',
      category: 'Storage',
      tag: '',
    },
    {
      id: 5,
      name: 'Wireless Earbuds',
      price: 39.99,
      rating: 4.4,
      image: '/earbuds.jpg',
      category: 'Audio',
      tag: 'Sale',
    },
    {
      id: 6,
      name: 'Premium Notebook Set',
      price: 19.99,
      rating: 4.3,
      image: '/notebook.webp',
      category: 'Stationery',
      tag: '',
    },
  ];

  // Categories data
  const categories = [
    { id: 1, name: 'Electronics', icon: <Monitor size={24} />, count: 42 },
    { id: 2, name: 'Stationery', icon: <BookOpen size={24} />, count: 28 },
    { id: 3, name: 'Office Supplies', icon: <Package size={24} />, count: 35 },
    { id: 4, name: 'Accessories', icon: <Headphones size={24} />, count: 23 },
    { id: 5, name: 'Internet Services', icon: <Wifi size={24} />, count: 15 },
    { id: 6, name: 'Printing', icon: <Printer size={24} />, count: 18 },
  ];

  // Special offers data
  const specialOffers = [
    {
      id: 1,
      title: 'Student Bundle',
      description: 'Notebook, pen set & 2 hours of internet access',
      discount: '25% OFF',
      expiry: '3 days left',
      image: '/notebook.webp',
    },
    {
      id: 2,
      title: 'Work From Home Kit',
      description: 'Webcam, headset & premium mouse',
      discount: '30% OFF',
      expiry: '5 days left',
      image: '/webcam.jpg',
    },
    {
      id: 3,
      title: 'Gaming Essentials',
      description: 'RGB keyboard, gaming mouse & mousepad',
      discount: '20% OFF',
      expiry: '7 days left',
      image: '/keyboard.jpg',
    },
  ];

  // Hero slider data
  const heroSlides = [
    {
      id: 1,
      title: 'Tech Essentials for Digital Nomads',
      subtitle: 'Upgrade your work and play experience',
      btnText: 'Shop Now',
      image: '/api/placeholder/1200/600',
      color: 'bg-blue-700',
    },
    {
      id: 2,
      title: 'Back to School Tech Sale',
      subtitle: 'Everything students need for the new semester',
      btnText: 'View Deals',
      image: '/api/placeholder/1200/600',
      color: 'bg-blue-900',
    },
    {
      id: 3,
      title: 'Gaming Gear Spectacular',
      subtitle: 'Level up your gameplay with pro equipment',
      btnText: 'Explore',
      image: '/api/placeholder/1200/600',
      color: 'bg-blue-800',
    },
  ];

  // Testimonials data
  const testimonials = [
    {
      id: 1,
      name: 'Michael Chen',
      role: 'Student',
      content:
        'Smartx Cyber has been my go-to place for all my tech and stationery needs. The online shop makes it even more convenient!',
      avatar: '/David.jpg',
    },
    {
      id: 2,
      name: 'Sarah Johnson',
      role: 'Freelancer',
      content:
        'The quality of products and the speed of delivery exceeded my expectations. Definitely recommending to my colleagues.',
      avatar: '/David.jpg',
    },
    {
      id: 3,
      name: 'David Okoro',
      role: 'IT Professional',
      content:
        'Their selection of tech accessories is impressive, and the prices are very competitive. Great customer service too!',
      avatar: '/David.jpg',
    },
  ];

  // Blog posts data
  const blogPosts = [
    {
      id: 1,
      title: 'Setting Up Your Perfect Home Office',
      excerpt:
        'Learn how to create an ergonomic and productive workspace at home.',
      date: 'Feb 28, 2025',
      image: '/FutureCyberCafes.avif',
    },
    {
      id: 2,
      title: 'Top 10 Gadgets for Students in 2025',
      excerpt:
        'Discover the must-have tech tools for academic success this year.',
      date: 'Feb 20, 2025',
      image: '/FutureCyberCafes.avif',
    },
    {
      id: 3,
      title: 'The Future of Cyber Cafes in Digital Age',
      excerpt:
        'How cyber cafes are evolving to meet modern technological demands.',
      date: 'Feb 15, 2025',
      image: '/FutureCyberCafes.avif',
    },
  ];

  // Stats
  const stats = [
    { id: 1, value: '5000+', label: 'Products', icon: <Package size={20} /> },
    {
      id: 2,
      value: '10K+',
      label: 'Happy Customers',
      icon: <User size={20} />,
    },
    {
      id: 3,
      value: '99%',
      label: 'Satisfaction Rate',
      icon: <Star size={20} />,
    },
    {
      id: 4,
      value: '24/7',
      label: 'Customer Support',
      icon: <Headphones size={20} />,
    },
  ];

  // Services
  const services = [
    {
      id: 1,
      title: 'Fast Delivery',
      description: 'Same-day delivery available within the city',
      icon: <Package size={28} />,
    },
    {
      id: 2,
      title: '24/7 Support',
      description: 'Get help anytime via chat or phone',
      icon: <Headphones size={28} />,
    },
    {
      id: 3,
      title: 'Secure Payments',
      description: 'Multiple payment options with encryption',
      icon: <ShoppingCart size={28} />,
    },
    {
      id: 4,
      title: 'Extended Warranty',
      description: 'Additional protection for electronics',
      icon: <Clock size={28} />,
    },
  ];

  // Navigation menu
  const navLinks = [
    { id: 1, name: 'Home', url: '#' },
    { id: 2, name: 'Shop', url: '#' },
    { id: 3, name: 'Categories', url: '#' },
    { id: 4, name: 'Deals', url: '#' },
    { id: 5, name: 'About Us', url: '#' },
    { id: 6, name: 'Contact', url: '#' },
  ];

  // Auto-cycle through hero slides
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentSlide((prevSlide) =>
        prevSlide === heroSlides.length - 1 ? 0 : prevSlide + 1
      );
    }, 5000);

    return () => clearInterval(interval);
  }, [heroSlides.length]);

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

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const handleSearch = (e) => {
    e.preventDefault();
    // Add search functionality here
    console.log('Searching for:', searchQuery);
  };

  return (
    <div className="min-h-screen bg-gray-50 overflow-x-hidden">
      {/* Top Bar - Announcements & Quick Links */}
      <div className="bg-blue-900 text-white py-2 px-4">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <p className="text-sm font-medium">
            🔥 Special Promotion: Get 15% off all electronics this week with
            code: <span className="font-bold">CYBER15</span>
          </p>
          <div className="hidden md:flex space-x-4 text-sm">
            <a href="#" className="hover:underline">
              Track Order
            </a>
            <span>|</span>
            <a href="#" className="hover:underline">
              Customer Support
            </a>
            <span>|</span>
            <a href="#" className="hover:underline">
              Find Store
            </a>
          </div>
        </div>
      </div>

      {/* Header and Navigation */}
      <header className="bg-white shadow-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="flex justify-between items-center py-4">
            {/* Logo */}
            <div className="flex items-center">
              <a href="#" className="flex items-center">
                <Coffee size={28} className="text-blue-700 mr-2" />
                <span className="font-bold text-2xl text-blue-900">
                  Vox<span className="text-blue-600">Cyber</span>
                </span>
              </a>
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
                  className="w-full py-2 pl-10 pr-4 rounded-full border-2 border-gray-200 focus:border-blue-500 focus:outline-none transition-all"
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
              {navLinks.map((link) => (
                <a
                  key={link.id}
                  href={link.url}
                  className="text-gray-700 hover:text-blue-600 font-medium transition-colors"
                >
                  {link.name}
                </a>
              ))}
            </nav>

            {/* Icons */}
            <div className="flex items-center space-x-4">
              <button className="relative p-2 text-gray-700 hover:text-blue-600 transition-colors">
                <Heart size={24} />
                <span className="absolute -top-1 -right-1 bg-blue-600 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                  3
                </span>
              </button>
              <button className="relative p-2 text-gray-700 hover:text-blue-600 transition-colors">
                <ShoppingCart size={24} />
                <span className="absolute -top-1 -right-1 bg-blue-600 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                  2
                </span>
              </button>
              <button className="hidden md:block p-2 text-gray-700 hover:text-blue-600 transition-colors">
                <User size={24} />
              </button>

              {/* Mobile Menu Button */}
              <button
                className="lg:hidden p-2 text-gray-700"
                onClick={toggleMenu}
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
                className="w-full py-2 pl-10 pr-4 rounded-full border-2 border-gray-200 focus:border-blue-500 focus:outline-none"
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
          className={`lg:hidden bg-white absolute w-full shadow-lg transition-transform duration-300 ease-in-out z-50 ${
            isMenuOpen ? 'translate-x-0' : '-translate-x-full'
          }`}
        >
          <div className="p-4 space-y-3">
            {navLinks.map((link) => (
              <a
                key={link.id}
                href={link.url}
                className="block py-2 px-4 text-gray-700 hover:bg-blue-50 hover:text-blue-600 rounded-lg"
                onClick={() => setIsMenuOpen(false)}
              >
                {link.name}
              </a>
            ))}
            <div className="border-t border-gray-200 pt-4 mt-4">
              <a
                href="#"
                className="block py-2 px-4 text-gray-700 hover:bg-blue-50 hover:text-blue-600 rounded-lg"
              >
                Login
              </a>
              <a
                href="#"
                className="block py-2 px-4 text-gray-700 hover:bg-blue-50 hover:text-blue-600 rounded-lg"
              >
                Register
              </a>
              <a
                href="#"
                className="block py-2 px-4 text-gray-700 hover:bg-blue-50 hover:text-blue-600 rounded-lg"
              >
                Track Order
              </a>
              <a
                href="#"
                className="block py-2 px-4 text-gray-700 hover:bg-blue-50 hover:text-blue-600 rounded-lg"
              >
                Customer Support
              </a>
            </div>
          </div>
        </div>
      </header>

      <main>
        {/* Hero Slider Section */}
        <section className="relative">
          <div className="relative h-96 md:h-[500px] overflow-hidden">
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
                  src={slide.image}
                  alt={slide.title}
                  className="absolute object-cover w-full h-full mix-blend-overlay"
                />
                <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 flex flex-col justify-center h-full">
                  <div className="max-w-xl">
                    <h1 className="text-3xl md:text-5xl font-bold text-white mb-2 md:mb-4">
                      {slide.title}
                    </h1>
                    <p className="text-lg md:text-xl text-white mb-6">
                      {slide.subtitle}
                    </p>
                    <button className="bg-white text-blue-700 font-medium py-2.5 px-6 rounded-full inline-flex items-center hover:bg-blue-50 transition-colors shadow-lg">
                      {slide.btnText}
                      <ChevronRight size={20} className="ml-1" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Navigation Buttons */}
          <button
            onClick={prevSlide}
            className="absolute top-1/2 left-4 -translate-y-1/2 z-20 bg-white/30 backdrop-blur-sm text-white p-2 rounded-full hover:bg-white/50 transition-colors"
          >
            <ChevronLeft size={24} />
          </button>
          <button
            onClick={nextSlide}
            className="absolute top-1/2 right-4 -translate-y-1/2 z-20 bg-white/30 backdrop-blur-sm text-white p-2 rounded-full hover:bg-white/50 transition-colors"
          >
            <ChevronRight size={24} />
          </button>

          {/* Indicators */}
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-20 flex space-x-2">
            {heroSlides.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentSlide(index)}
                className={`h-2 rounded-full transition-all ${
                  currentSlide === index ? 'w-8 bg-white' : 'w-2 bg-white/50'
                }`}
              ></button>
            ))}
          </div>
        </section>

        {/* Categories Section */}
        <section className="py-12 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-gray-900 mb-2">
                Browse By Category
              </h2>
              <p className="text-gray-600">
                Find everything you need for work or study
              </p>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
              {categories.map((category) => (
                <a
                  key={category.id}
                  href="#"
                  className="bg-gray-50 border border-gray-100 rounded-xl p-6 text-center hover:shadow-md hover:border-blue-200 transition-all group"
                >
                  <div className="flex justify-center mb-4">
                    <div className="w-16 h-16 flex items-center justify-center bg-blue-100 rounded-full text-blue-600 group-hover:bg-blue-600 group-hover:text-white transition-colors">
                      {category.icon}
                    </div>
                  </div>
                  <h3 className="font-medium text-gray-900 mb-1">
                    {category.name}
                  </h3>
                  <p className="text-sm text-gray-500">
                    {category.count} items
                  </p>
                </a>
              ))}
            </div>
          </div>
        </section>

        {/* Special Offers Banner */}
        <section className="py-12 bg-gradient-to-r from-blue-800 to-blue-600">
          <div className="max-w-7xl mx-auto px-4 sm:px-6">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-white mb-2">
                Special Offers
              </h2>
              <p className="text-blue-100">
                Limited time deals you don't want to miss
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {specialOffers.map((offer) => (
                <div
                  key={offer.id}
                  className="bg-white rounded-xl overflow-hidden shadow-lg group"
                >
                  <div className="relative">
                    <img
                      src={offer.image}
                      alt={offer.title}
                      className="w-full h-48 object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                    <div className="absolute top-4 right-4 bg-red-600 text-white px-3 py-1 rounded-full text-sm font-bold">
                      {offer.discount}
                    </div>
                  </div>
                  <div className="p-6">
                    <h3 className="text-xl font-bold text-gray-900 mb-2">
                      {offer.title}
                    </h3>
                    <p className="text-gray-600 mb-4">{offer.description}</p>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-500 flex items-center">
                        <Clock size={16} className="mr-1" />
                        {offer.expiry}
                      </span>
                      <button className="text-blue-600 font-medium hover:text-blue-800 flex items-center">
                        Shop Now
                        <ArrowRight size={16} className="ml-1" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Featured Products Section */}
        <section className="py-12 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6">
            <div className="flex justify-between items-center mb-8">
              <div>
                <h2 className="text-3xl font-bold text-gray-900 mb-2">
                  Featured Products
                </h2>
                <p className="text-gray-600">
                  Hand-picked products for your tech needs
                </p>
              </div>
              <a
                href="#"
                className="hidden md:flex items-center text-blue-600 font-medium hover:text-blue-800"
              >
                View All
                <ChevronRight size={20} className="ml-1" />
              </a>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-6">
              {featuredProducts.map((product) => (
                <div
                  key={product.id}
                  className="bg-white rounded-xl border border-gray-200 overflow-hidden hover:shadow-lg transition-shadow group"
                >
                  <div className="relative">
                    <img
                      src={product.image}
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
                    <button className="absolute bottom-2 right-2 p-2 bg-white rounded-full shadow-md text-gray-700 hover:text-blue-600 transition-colors">
                      <Heart size={18} />
                    </button>
                  </div>
                  <div className="p-4">
                    <div className="text-xs text-gray-500 mb-1">
                      {product.category}
                    </div>
                    <h3 className="font-medium text-gray-900 mb-2 hover:text-blue-600 transition-colors">
                      {product.name}
                    </h3>
                    <div className="flex items-center mb-2">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          size={14}
                          className={
                            i < Math.floor(product.rating)
                              ? 'text-yellow-400 fill-yellow-400'
                              : 'text-gray-300'
                          }
                        />
                      ))}
                      <span className="text-xs text-gray-500 ml-1">
                        {product.rating}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="font-bold text-gray-900">
                        ${product.price}
                      </span>
                      <button className="p-2 bg-blue-600 text-white rounded-full hover:bg-blue-700 transition-colors">
                        <ShoppingCart size={16} />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-8 text-center md:hidden">
              <a
                href="#"
                className="inline-flex items-center text-blue-600 font-medium hover:text-blue-800"
              >
                View All Products
                <ChevronRight size={20} className="ml-1" />
              </a>
            </div>
          </div>
        </section>

        {/* Stats Section */}
        <section className="py-12 bg-blue-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              {stats.map((stat) => (
                <div
                  key={stat.id}
                  className="bg-white rounded-xl p-6 text-center shadow"
                >
                  <div className="flex justify-center mb-4">
                    <div className="w-12 h-12 flex items-center justify-center bg-blue-100 rounded-full text-blue-600">
                      {stat.icon}
                    </div>
                  </div>
                  <h3 className="text-2xl md:text-3xl font-bold text-gray-900 mb-1">
                    {stat.value}
                  </h3>
                  <p className="text-gray-600">{stat.label}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Services Section */}
        <section className="py-12 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-gray-900 mb-2">
                Why Choose Us
              </h2>
              <p className="text-gray-600">
                We go beyond just selling products
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {services.map((service) => (
                <div
                  key={service.id}
                  className="p-6 bg-blue-50 rounded-xl hover:shadow-md transition-shadow"
                >
                  <div className="flex items-center mb-4">
                    <div className="mr-4 text-blue-600">{service.icon}</div>
                    <h3 className="text-xl font-bold text-gray-900">
                      {service.title}
                    </h3>
                  </div>
                  <p className="text-gray-600">{service.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Testimonials Section */}
        <section className="py-12 bg-gradient-to-r from-blue-900 to-blue-700">
          <div className="max-w-7xl mx-auto px-4 sm:px-6">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-white mb-2">
                What Our Customers Say
              </h2>
              <p className="text-blue-100">
                Trusted by thousands of satisfied customers
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {testimonials.map((testimonial) => (
                <div
                  key={testimonial.id}
                  className="bg-white p-6 rounded-xl shadow-lg"
                >
                  <div className="flex items-center mb-4">
                    <img
                      src={testimonial.avatar}
                      alt={testimonial.name}
                      className="w-12 h-12 rounded-full object-cover mr-4 border-2 border-blue-500"
                    />
                    <div>
                      <h4 className="font-bold text-gray-900">
                        {testimonial.name}
                      </h4>
                      <p className="text-sm text-gray-500">
                        {testimonial.role}
                      </p>
                    </div>
                  </div>
                  <p className="text-gray-600 italic">
                    "{testimonial.content}"
                  </p>
                  <div className="mt-4 flex">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        size={16}
                        className="text-yellow-400 fill-yellow-400"
                      />
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Blog Section */}
        <section className="py-12 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6">
            <div className="flex justify-between items-center mb-8">
              <div>
                <h2 className="text-3xl font-bold text-gray-900 mb-2">
                  Latest Articles
                </h2>
                <p className="text-gray-600">
                  Stay updated with tech trends and tips
                </p>
              </div>
              <a
                href="#"
                className="hidden md:flex items-center text-blue-600 font-medium hover:text-blue-800"
              >
                View All Articles
                <ChevronRight size={20} className="ml-1" />
              </a>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {blogPosts.map((post) => (
                <div
                  key={post.id}
                  className="bg-white border border-gray-200 rounded-xl overflow-hidden hover:shadow-lg transition-all group"
                >
                  <div className="relative">
                    <img
                      src={post.image}
                      alt={post.title}
                      className="w-full h-48 object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                    <div className="absolute bottom-0 left-0 bg-blue-600 text-white px-4 py-1 text-sm font-semibold">
                      {post.date}
                    </div>
                  </div>
                  <div className="p-6">
                    <h3 className="text-xl font-bold text-gray-900 mb-3 group-hover:text-blue-600 transition-colors">
                      {post.title}
                    </h3>
                    <p className="text-gray-600 mb-4">{post.excerpt}</p>
                    <a
                      href="#"
                      className="inline-flex items-center text-blue-600 font-medium hover:text-blue-800"
                    >
                      Read More
                      <ChevronRight size={16} className="ml-1" />
                    </a>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-8 text-center md:hidden">
              <a
                href="#"
                className="inline-flex items-center text-blue-600 font-medium hover:text-blue-800"
              >
                View All Articles
                <ChevronRight size={20} className="ml-1" />
              </a>
            </div>
          </div>
        </section>

        {/* Newsletter Section */}
        <section className="py-12 bg-blue-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6">
            <div className="bg-blue-900 rounded-2xl p-8 md:p-12 shadow-xl relative overflow-hidden">
              <div className="absolute top-0 right-0 w-64 h-64 bg-blue-800 rounded-full -translate-y-1/2 translate-x-1/2 opacity-50"></div>
              <div className="absolute bottom-0 left-0 w-48 h-48 bg-blue-700 rounded-full translate-y-1/3 -translate-x-1/3 opacity-30"></div>
              <div className="relative z-10">
                <div className="max-w-3xl mx-auto text-center">
                  <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
                    Subscribe to Our Newsletter
                  </h2>
                  <p className="text-blue-100 text-lg mb-8">
                    Stay updated with new products, special offers, and tech
                    tips delivered straight to your inbox.
                  </p>
                  <form className="flex flex-col md:flex-row gap-4 max-w-2xl mx-auto">
                    <div className="flex-1 relative">
                      <input
                        type="email"
                        placeholder="Enter your email address"
                        className="w-full px-6 py-4 rounded-full border-2 border-transparent focus:border-blue-300 focus:outline-none"
                        required
                      />
                    </div>
                    <button
                      type="submit"
                      className="bg-white text-blue-700 font-bold px-8 py-4 rounded-full hover:bg-blue-50 transition-colors shadow-lg"
                    >
                      Subscribe Now
                    </button>
                  </form>
                  <p className="text-blue-200 text-sm mt-4">
                    By subscribing you agree to our Privacy Policy. No spam,
                    ever.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Call To Action Section */}
        <section className="py-16 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
              <div>
                <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                  Ready to Upgrade Your Tech?
                </h2>
                <p className="text-gray-600 text-lg mb-6">
                  Explore our wide selection of products and services designed
                  to enhance your digital experience. Whether you're a student,
                  professional, or tech enthusiast, we have everything you need.
                </p>
                <div className="flex flex-col sm:flex-row gap-4">
                  <button className="bg-blue-600 text-white font-bold py-3 px-8 rounded-full hover:bg-blue-700 transition-colors shadow-lg">
                    Shop Now
                  </button>
                  <button className="bg-white text-blue-600 font-bold py-3 px-8 rounded-full border-2 border-blue-600 hover:bg-blue-50 transition-colors">
                    Contact Sales
                  </button>
                </div>
              </div>
              <div className="flex justify-center">
                <img
                  src="/api/placeholder/600/400"
                  alt="Tech setup"
                  className="rounded-xl shadow-lg"
                />
              </div>
            </div>
          </div>
        </section>

        {/* Physical Stores Section */}
        <section className="py-12 bg-gray-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-gray-900 mb-2">
                Our Physical Stores
              </h2>
              <p className="text-gray-600">
                Visit us in person for the full Vox Cyber experience
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Store Location 1 */}
              <div className="bg-white rounded-xl p-6 shadow-md hover:shadow-lg transition-shadow">
                <h3 className="text-xl font-bold text-gray-900 mb-2">
                  Vox Cyber - Downtown
                </h3>
                <div className="flex items-start mb-4">
                  <MapPin
                    size={20}
                    className="text-blue-600 mr-2 mt-1 flex-shrink-0"
                  />
                  <p className="text-gray-600">
                    123 Tech Avenue, Downtown District, City
                  </p>
                </div>
                <div className="flex items-center mb-4">
                  <Phone
                    size={20}
                    className="text-blue-600 mr-2 flex-shrink-0"
                  />
                  <p className="text-gray-600">+1 (234) 567-8901</p>
                </div>
                <div className="flex items-center mb-6">
                  <Clock
                    size={20}
                    className="text-blue-600 mr-2 flex-shrink-0"
                  />
                  <p className="text-gray-600">
                    Mon-Sat: 9AM-9PM, Sun: 10AM-6PM
                  </p>
                </div>
                <img
                  src="/api/placeholder/400/200"
                  alt="Downtown Store"
                  className="w-full h-40 object-cover rounded-lg mb-4"
                />
                <button className="w-full bg-blue-100 text-blue-600 font-medium py-2 rounded-lg hover:bg-blue-200 transition-colors">
                  Get Directions
                </button>
              </div>

              {/* Store Location 2 */}
              <div className="bg-white rounded-xl p-6 shadow-md hover:shadow-lg transition-shadow">
                <h3 className="text-xl font-bold text-gray-900 mb-2">
                  Vox Cyber - Tech Mall
                </h3>
                <div className="flex items-start mb-4">
                  <MapPin
                    size={20}
                    className="text-blue-600 mr-2 mt-1 flex-shrink-0"
                  />
                  <p className="text-gray-600">
                    456 Digital Lane, Tech Mall, 2nd Floor, City
                  </p>
                </div>
                <div className="flex items-center mb-4">
                  <Phone
                    size={20}
                    className="text-blue-600 mr-2 flex-shrink-0"
                  />
                  <p className="text-gray-600">+1 (234) 567-8902</p>
                </div>
                <div className="flex items-center mb-6">
                  <Clock
                    size={20}
                    className="text-blue-600 mr-2 flex-shrink-0"
                  />
                  <p className="text-gray-600">Daily: 10AM-10PM</p>
                </div>
                <img
                  src="/api/placeholder/400/200"
                  alt="Tech Mall Store"
                  className="w-full h-40 object-cover rounded-lg mb-4"
                />
                <button className="w-full bg-blue-100 text-blue-600 font-medium py-2 rounded-lg hover:bg-blue-200 transition-colors">
                  Get Directions
                </button>
              </div>

              {/* Store Location 3 */}
              <div className="bg-white rounded-xl p-6 shadow-md hover:shadow-lg transition-shadow">
                <h3 className="text-xl font-bold text-gray-900 mb-2">
                  Vox Cyber - University
                </h3>
                <div className="flex items-start mb-4">
                  <MapPin
                    size={20}
                    className="text-blue-600 mr-2 mt-1 flex-shrink-0"
                  />
                  <p className="text-gray-600">
                    789 Campus Drive, University Area, City
                  </p>
                </div>
                <div className="flex items-center mb-4">
                  <Phone
                    size={20}
                    className="text-blue-600 mr-2 flex-shrink-0"
                  />
                  <p className="text-gray-600">+1 (234) 567-8903</p>
                </div>
                <div className="flex items-center mb-6">
                  <Clock
                    size={20}
                    className="text-blue-600 mr-2 flex-shrink-0"
                  />
                  <p className="text-gray-600">
                    Mon-Fri: 8AM-8PM, Sat-Sun: 10AM-6PM
                  </p>
                </div>
                <img
                  src="/api/placeholder/400/200"
                  alt="University Store"
                  className="w-full h-40 object-cover rounded-lg mb-4"
                />
                <button className="w-full bg-blue-100 text-blue-600 font-medium py-2 rounded-lg hover:bg-blue-200 transition-colors">
                  Get Directions
                </button>
              </div>
            </div>
          </div>
        </section>

        {/* Trust Badges Section */}
        <section className="py-8 bg-white border-t border-gray-100">
          <div className="max-w-7xl mx-auto px-4 sm:px-6">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 items-center">
              <div className="flex flex-col items-center text-center">
                <div className="w-16 h-16 flex items-center justify-center bg-blue-100 rounded-full text-blue-600 mb-3">
                  <CreditCard size={28} />
                </div>
                <h3 className="font-medium text-gray-900 mb-1">
                  Secure Payment
                </h3>
                <p className="text-sm text-gray-500">Multiple secure options</p>
              </div>

              <div className="flex flex-col items-center text-center">
                <div className="w-16 h-16 flex items-center justify-center bg-blue-100 rounded-full text-blue-600 mb-3">
                  <Truck size={28} />
                </div>
                <h3 className="font-medium text-gray-900 mb-1">
                  Fast Delivery
                </h3>
                <p className="text-sm text-gray-500">From store to your door</p>
              </div>

              <div className="flex flex-col items-center text-center">
                <div className="w-16 h-16 flex items-center justify-center bg-blue-100 rounded-full text-blue-600 mb-3">
                  <Gift size={28} />
                </div>
                <h3 className="font-medium text-gray-900 mb-1">
                  Special Discounts
                </h3>
                <p className="text-sm text-gray-500">For loyal customers</p>
              </div>

              <div className="flex flex-col items-center text-center">
                <div className="w-16 h-16 flex items-center justify-center bg-blue-100 rounded-full text-blue-600 mb-3">
                  <Shield size={28} />
                </div>
                <h3 className="font-medium text-gray-900 mb-1">
                  Quality Guarantee
                </h3>
                <p className="text-sm text-gray-500">30-day return policy</p>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="bg-blue-900 text-white">
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
                  <a
                    href="#"
                    className="text-blue-100 hover:text-white transition-colors"
                  >
                    About Us
                  </a>
                </li>
                <li>
                  <a
                    href="#"
                    className="text-blue-100 hover:text-white transition-colors"
                  >
                    Shop All
                  </a>
                </li>
                <li>
                  <a
                    href="#"
                    className="text-blue-100 hover:text-white transition-colors"
                  >
                    Featured Products
                  </a>
                </li>
                <li>
                  <a
                    href="#"
                    className="text-blue-100 hover:text-white transition-colors"
                  >
                    Special Offers
                  </a>
                </li>
                <li>
                  <a
                    href="#"
                    className="text-blue-100 hover:text-white transition-colors"
                  >
                    Blog
                  </a>
                </li>
                <li>
                  <a
                    href="#"
                    className="text-blue-100 hover:text-white transition-colors"
                  >
                    Store Locations
                  </a>
                </li>
                <li>
                  <a
                    href="#"
                    className="text-blue-100 hover:text-white transition-colors"
                  >
                    Careers
                  </a>
                </li>
              </ul>
            </div>

            {/* Customer Service */}
            <div>
              <h3 className="text-lg font-bold mb-4 text-white">
                Customer Service
              </h3>
              <ul className="space-y-3">
                <li>
                  <a
                    href="#"
                    className="text-blue-100 hover:text-white transition-colors"
                  >
                    Contact Us
                  </a>
                </li>
                <li>
                  <a
                    href="#"
                    className="text-blue-100 hover:text-white transition-colors"
                  >
                    FAQs
                  </a>
                </li>
                <li>
                  <a
                    href="#"
                    className="text-blue-100 hover:text-white transition-colors"
                  >
                    Shipping & Delivery
                  </a>
                </li>
                <li>
                  <a
                    href="#"
                    className="text-blue-100 hover:text-white transition-colors"
                  >
                    Returns & Refunds
                  </a>
                </li>
                <li>
                  <a
                    href="#"
                    className="text-blue-100 hover:text-white transition-colors"
                  >
                    Payment Methods
                  </a>
                </li>
                <li>
                  <a
                    href="#"
                    className="text-blue-100 hover:text-white transition-colors"
                  >
                    Terms & Conditions
                  </a>
                </li>
                <li>
                  <a
                    href="#"
                    className="text-blue-100 hover:text-white transition-colors"
                  >
                    Privacy Policy
                  </a>
                </li>
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
          </div>

          {/* Newsletter Form */}
          <div className="mt-12 pt-8 border-t border-blue-800">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
              <div>
                <h3 className="text-lg font-bold mb-2 text-white">
                  Sign Up for Our Newsletter
                </h3>
                <p className="text-blue-100 mb-4">
                  Get the latest updates on new products and special sales
                </p>
              </div>
              <div>
                <form className="flex">
                  <input
                    type="email"
                    placeholder="Your email address"
                    className="flex-1 py-3 px-4 rounded-l-lg focus:outline-none"
                    required
                  />
                  <button
                    type="submit"
                    className="bg-blue-600 text-white font-medium py-3 px-6 rounded-r-lg hover:bg-blue-500 transition-colors"
                  >
                    Subscribe
                  </button>
                </form>
              </div>
            </div>
          </div>
        </div>

        {/* Copyright */}
        <div className="bg-blue-950 py-6">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 flex flex-col md:flex-row justify-between items-center">
            <p className="text-blue-200 text-sm mb-4 md:mb-0">
              © 2025 Vox Cyber. All rights reserved.
            </p>
            <div className="flex space-x-4">
              <img src="/api/placeholder/40/25" alt="Visa" className="h-6" />
              <img
                src="/api/placeholder/40/25"
                alt="Mastercard"
                className="h-6"
              />
              <img src="/api/placeholder/40/25" alt="PayPal" className="h-6" />
              <img
                src="/api/placeholder/40/25"
                alt="Apple Pay"
                className="h-6"
              />
            </div>
          </div>
        </div>
      </footer>

      {/* Floating Button - Back to Top */}
      <button
        onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
        className="fixed bottom-6 right-6 bg-blue-600 text-white p-3 rounded-full shadow-lg hover:bg-blue-700 transition-colors z-50"
      >
        <ChevronLeft size={24} className="transform rotate-90" />
      </button>
    </div>
  );
};

export default CyberCafeLandingPage;
