"use client"

import { useState, useEffect } from "react"
import { ShoppingBag, Wrench, Globe, ArrowRight, Menu, X, User, RefreshCw, Package, Loader2 } from "lucide-react"
import { Link, useNavigate } from "react-router-dom"
import { useSelector, useDispatch } from "react-redux"
import AuthButtons from "../components/common/AuthButtons"
import { openAuthModal } from "../redux/slices/uiSlice"
import { fetchFeaturedProducts } from "../redux/slices/productsSlice"
import { fetchFeaturedCategories } from "../redux/slices/categoriesSlice"
import LoadingSpinner from "./common/LoadingSpinner"
import ErrorMessage from "./common/ErrorMessage"
import StatusMessage from "./common/StatusMessage"
import EmptyState from "./common/EmptyState"
import LoadingOverlay from "./common/LoadingOverlay"
import { TypewriterEffect, FloatingShapes, AnimatedBackground } from "../components/animated"
import useParallax from "../hooks/useParallax"
import useStaggeredAnimation from "../hooks/useStaggeredAnimation"
import CTAButton from "../components/ui/CTAButton"
import Footer from "../components/common/Footer"

export default function LandingPage() {
  const [activeService, setActiveService] = useState("shop")
  const [hoveredLinks, setHoveredLinks] = useState({})
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [statusMessages, setStatusMessages] = useState([])
  const [isInitialLoad, setIsInitialLoad] = useState(true)
  const navigate = useNavigate()
  const dispatch = useDispatch()

  const { user, loading: authLoading } = useSelector((state) => state.auth)
  const { featuredProducts, loading: productsLoading, error: productsError } = useSelector((state) => state.products)
  const {
    featuredCategories,
    loading: categoriesLoading,
    error: categoriesError,
  } = useSelector((state) => state.categories)

  const [floatingCardPosition, setFloatingCardPosition] = useState({
    top: "30%",
    right: "10%",
  })

  // Animation states
  const [typewriterComplete, setTypewriterComplete] = useState(false)
  const parallaxOffset = useParallax(0.3)
  const visibleItems = useStaggeredAnimation(4, 300) // 4 items with 300ms delay

  // CTA button handlers
  const handleGetStarted = () => {
    // Scroll to services section or navigate to contact
    const servicesSection = document.querySelector('.services-section');
    if (servicesSection) {
      servicesSection.scrollIntoView({ behavior: 'smooth' });
    } else {
      navigate('/services');
    }
  };

  const handleSeeOurWork = () => {
    // Scroll to portfolio section or navigate to portfolio page
    const portfolioSection = document.querySelector('.portfolio-section');
    if (portfolioSection) {
      portfolioSection.scrollIntoView({ behavior: 'smooth' });
    } else {
      // For now, scroll to featured products as a placeholder
      const featuredSection = document.querySelector('.featured-products-section');
      if (featuredSection) {
        featuredSection.scrollIntoView({ behavior: 'smooth' });
      }
    }
  };

  // Add a status message
  const addStatusMessage = (message) => {
    const id = Date.now()
    setStatusMessages((prev) => [...prev, { id, ...message }])
    return id
  }

  // Remove a status message
  const removeStatusMessage = (id) => {
    setStatusMessages((prev) => prev.filter((msg) => msg.id !== id))
  }

  // Fetch featured data
  useEffect(() => {
    const fetchData = async () => {
      try {
        // Dispatch both actions and handle them gracefully
        const [productsResult, categoriesResult] = await Promise.allSettled([
          dispatch(fetchFeaturedProducts()),
          dispatch(fetchFeaturedCategories())
        ])

        // Show success message only if not initial load and at least one succeeded
        if (!isInitialLoad && (productsResult.status === 'fulfilled' || categoriesResult.status === 'fulfilled')) {
          addStatusMessage({
            type: "success",
            title: "Content Updated",
            message: "Featured content has been refreshed.",
            duration: 3,
          })
        }
      } catch (error) {
        // Don't show error message on initial load
        if (!isInitialLoad) {
          addStatusMessage({
            type: "error",
            title: "Update Failed",
            message: "Failed to refresh content. Please try again.",
            duration: 5,
          })
        }
      } finally {
        setIsInitialLoad(false)
      }
    }

    fetchData()
  }, [dispatch])

  // Handle manual refresh
  const handleRefresh = () => {
    setIsInitialLoad(false) // Ensure messages show on manual refresh
    dispatch(fetchFeaturedProducts())
    dispatch(fetchFeaturedCategories())
  }

  // Update floating card position based on window size
  useEffect(() => {
    const updateCardPosition = () => {
      if (window.innerWidth >= 1024) {
        // lg breakpoint
        setFloatingCardPosition({
          top: "30%",
          right: "10%",
        })
      } else if (window.innerWidth >= 768) {
        // md breakpoint
        setFloatingCardPosition({
          top: "45%",
          right: "5%",
        })
      } else {
        setFloatingCardPosition({
          top: "60%",
          right: "5%",
        })
      }
    }

    updateCardPosition()
    window.addEventListener("resize", updateCardPosition)
    return () => window.removeEventListener("resize", updateCardPosition)
  }, [])

  // Close mobile menu when window is resized to desktop size
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 768 && isMobileMenuOpen) {
        setIsMobileMenuOpen(false)
      }
    }

    window.addEventListener("resize", handleResize)
    return () => window.removeEventListener("resize", handleResize)
  }, [isMobileMenuOpen])

  const services = {
    shop: {
      title: "Online Shop",
      description:
        "Create and manage your online store with powerful e-commerce tools, inventory management, and secure payment processing.",
      icon: <ShoppingBag className="w-6 h-6" />,
      link: "/shop",
    },
    services: {
      title: "Digital Services",
      description:
        "Offer your services online with booking systems, client management, and automated workflows to streamline your business.",
      icon: <Wrench className="w-6 h-6" />,
      link: "/services",
    },
    websites: {
      title: "Website Builder",
      description:
        "Design and deploy stunning websites with our intuitive builder, custom templates, and powerful SEO tools.",
      icon: <Globe className="w-6 h-6" />,
      link: "/websites",
    },
  }

  const handleLinkHover = (linkId, isHovered) => {
    setHoveredLinks({ ...hoveredLinks, [linkId]: isHovered })
  }

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen)
  }

  // Handle empty featured products and categories with fallback
  const hasFeaturedProducts = Array.isArray(featuredProducts) && featuredProducts.length > 0
  const hasFeaturedCategories = Array.isArray(featuredCategories) && featuredCategories.length > 0

  // Determine loading states
  const isLoading = (productsLoading || categoriesLoading) && isInitialLoad
  const hasError = productsError && categoriesError && isInitialLoad

  // Show full-page loading spinner only on initial load
  if (isLoading) {
    return <LoadingSpinner fullScreen message="Loading VoxCyber..." />
  }

  // Show full-page error only if both have errors
  if (hasError && isInitialLoad) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <ErrorMessage
          message="Failed to load content"
          description="We couldn't load the necessary content. Please try again later."
          onRetry={handleRefresh}
          type="error"
        />
      </div>
    )
  }

  return (
    <div className="relative flex flex-col min-h-screen overflow-hidden">
      {/* Status Messages */}
      <div className="fixed top-4 right-4 z-50 flex flex-col gap-2 max-w-md">
        {statusMessages.map((msg) => (
          <StatusMessage
            key={msg.id}
            type={msg.type}
            title={msg.title}
            message={msg.message}
            duration={msg.duration}
            onDismiss={() => removeStatusMessage(msg.id)}
          />
        ))}
      </div>

      {/* Animated Background */}
      <div className="absolute inset-0 z-0">
        <AnimatedBackground variant="particles" intensity="medium" />
      </div>

      {/* Parallax Background Elements */}
      <div 
        className="absolute top-[-10%] right-[-5%] w-1/2 h-1/2 rounded-full bg-blue-500/10 blur-[60px] z-[1]"
        style={{ transform: `translateY(${parallaxOffset * 0.5}px)` }}
      ></div>
      <div 
        className="absolute bottom-[-15%] left-[-10%] w-2/5 h-2/5 rounded-full bg-blue-500/10 blur-[80px] z-[1]"
        style={{ transform: `translateY(${-parallaxOffset * 0.3}px)` }}
      ></div>
      <div 
        className="absolute top-[40%] left-[30%] w-1/5 h-1/5 rounded-full bg-blue-500/10 blur-[50px] opacity-50 z-[1]"
        style={{ transform: `translateY(${parallaxOffset * 0.7}px)` }}
      ></div>

      {/* Floating Geometric Shapes */}
      <FloatingShapes count={8} className="z-[2]" />

      {/* Cyber background image with parallax */}
      <div 
        className="absolute inset-0 z-[3] pointer-events-none"
        style={{ transform: `translateY(${parallaxOffset * 0.2}px)` }}
      >
        <img
          src="https://images.unsplash.com/photo-1550751827-4bd374c3f58b?auto=format&fit=crop&q=80&w=2070"
          alt="Cyber background"
          className="w-full h-full object-cover opacity-15 filter blur-[1px] brightness-120 contrast-120 mix-blend-overlay"
        />
      </div>

      {/* Cyber overlay pattern */}
      <div className="absolute inset-0 bg-[linear-gradient(45deg,rgba(0,120,215,0.05)_25%,transparent_25%,transparent_50%,rgba(0,120,215,0.05)_50%,rgba(0,120,215,0.05)_75%,transparent_75%,transparent)] bg-[length:4px_4px] opacity-30 pointer-events-none z-[4]"></div>

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
              hoveredLinks["shop"] ? "text-blue-600" : ""
            }`}
            onMouseEnter={() => handleLinkHover("shop", true)}
            onMouseLeave={() => handleLinkHover("shop", false)}
          >
            Shop
          </Link>

          <Link
            to="/services"
            className={`text-sm font-medium text-gray-700 hover:text-blue-600 transition-colors ${
              hoveredLinks["services"] ? "text-blue-600" : ""
            }`}
            onMouseEnter={() => handleLinkHover("services", true)}
            onMouseLeave={() => handleLinkHover("services", false)}
          >
            Services
          </Link>

          <Link
            to="/websites"
            className={`text-sm font-medium text-gray-700 hover:text-blue-600 transition-colors ${
              hoveredLinks["websites"] ? "text-blue-600" : ""
            }`}
            onMouseEnter={() => handleLinkHover("websites", true)}
            onMouseLeave={() => handleLinkHover("websites", false)}
          >
            Websites
          </Link>

          {/* Show Admin link if user is admin */}
          {!authLoading && (user?.role === "admin" || user?.role === "super_admin") && (
            <Link
              to="/admin"
              className="text-sm font-medium text-white bg-blue-600 px-3 py-1 rounded-md hover:bg-blue-700 transition-colors"
              onMouseEnter={() => handleLinkHover("admin", true)}
              onMouseLeave={() => handleLinkHover("admin", false)}
            >
              Admin
            </Link>
          )}
        </nav>

        {/* Auth Buttons for Desktop */}
        <div className="hidden md:block">{!authLoading && <AuthButtons />}</div>

        {/* Mobile Menu Button */}
        <button
          className="md:hidden flex flex-col gap-1 p-2 focus:outline-none"
          onClick={toggleMobileMenu}
          aria-label="Toggle menu"
        >
          {isMobileMenuOpen ? <X className="w-6 h-6 text-gray-800" /> : <Menu className="w-6 h-6 text-gray-800" />}
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

            {!authLoading && (user?.role === "admin" || user?.role === "super_admin") && (
              <Link
                to="/admin"
                className="text-white bg-blue-600 py-2 px-4 rounded-md hover:bg-blue-700 transition-colors"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Admin Dashboard
              </Link>
            )}

            <div className="pt-3 border-t border-gray-200">
              {!authLoading && !user ? (
                <>
                  <button
                    onClick={() => {
                      dispatch(openAuthModal("login"))
                      setIsMobileMenuOpen(false)
                    }}
                    className="w-full text-left py-2 px-4 text-gray-700 hover:text-blue-600 rounded-md hover:bg-blue-50 transition-colors"
                  >
                    Log In
                  </button>
                  <button
                    onClick={() => {
                      dispatch(openAuthModal("register"))
                      setIsMobileMenuOpen(false)
                    }}
                    className="w-full text-left py-2 px-4 text-gray-700 hover:text-blue-600 rounded-md hover:bg-blue-50 transition-colors"
                  >
                    Sign Up
                  </button>
                </>
              ) : !authLoading && user ? (
                <div className="flex items-center gap-2 px-4 py-2">
                  <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600">
                    {user.name.charAt(0) || <User className="w-4 h-4" />}
                  </div>
                  <div>
                    <p className="font-medium text-sm">{user.name}</p>
                    <p className="text-xs text-gray-500">{user.email}</p>
                  </div>
                </div>
              ) : null}
            </div>
          </div>
        </div>
      )}

      {/* Main content */}
      <main className="flex flex-1 flex-col lg:flex-row px-6 py-8 relative z-[5]">
        <div className="hero-section flex flex-1 items-center">
          <div className="max-w-xl">
            <div 
              className={`inline-block px-3 py-1 bg-blue-500/10 text-blue-600 rounded-lg text-xs font-medium mb-4 transition-all duration-700 ${
                visibleItems.has(0) ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
              }`}
            >
              Digital Solutions Experts
            </div>
            <h1 className="text-4xl md:text-5xl font-extrabold leading-tight mb-4">
              <TypewriterEffect
                text="Innovative "
                speed={100}
                delay={500}
                className="text-gray-900"
                onComplete={() => setTypewriterComplete(true)}
              />
              {typewriterComplete && (
                <span className="animate-fade-in animate-delay-200">
                  <span className="text-blue-600">Websites & Web Apps</span> Solutions
                </span>
              )}
              {!authLoading && user && typewriterComplete && (
                <span className="text-blue-400 text-2xl ml-2 font-normal animate-fade-in animate-delay-500">
                  , {user.name}
                </span>
              )}
            </h1>
            <p 
              className={`text-gray-600 text-lg leading-relaxed mb-8 transition-all duration-700 ${
                visibleItems.has(1) ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
              }`}
            >
              We build creative, scalable, and business-driven digital solutions to help brands grow
            </p>
            <div 
              className={`flex flex-col sm:flex-row gap-4 transition-all duration-700 ${
                visibleItems.has(2) ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
              }`}
            >
              <CTAButton
                variant="primary"
                onClick={handleGetStarted}
                className="animate-delay-300"
              >
                Get Started
              </CTAButton>
              <CTAButton
                variant="secondary"
                onClick={handleSeeOurWork}
                className="animate-delay-500"
                icon={null}
              >
                See Our Work
              </CTAButton>
            </div>
          </div>
        </div>

        <div className="services-section flex flex-1 flex-col justify-center lg:pl-8 mt-12 lg:mt-0">
          <div className="flex gap-4 mb-8 overflow-x-auto pb-2 sm:justify-center lg:justify-start">
            {Object.keys(services).map((key) => (
              <button
                key={key}
                className={`flex flex-col items-center gap-2 p-4 rounded-lg transition-all ${
                  activeService === key ? "bg-blue-500/10" : "hover:bg-blue-500/5"
                }`}
                onClick={() => setActiveService(key)}
              >
                <div
                  className={`w-12 h-12 flex items-center justify-center rounded-full transition-all ${
                    activeService === key ? "bg-blue-600 text-white" : "bg-blue-500/10 text-blue-600"
                  }`}
                >
                  {services[key].icon}
                </div>
                <span
                  className={`text-sm font-medium transition-colors ${
                    activeService === key ? "text-blue-600" : "text-gray-700"
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
            <h2 className="text-2xl font-bold mb-4">{services[activeService].title}</h2>
            <p className="text-gray-600 leading-relaxed mb-6">{services[activeService].description}</p>
            <Link
              to={services[activeService].link}
              className="inline-flex items-center text-blue-600 font-medium hover:text-blue-800 transition-colors"
              onMouseEnter={() => handleLinkHover("serviceLink", true)}
              onMouseLeave={() => handleLinkHover("serviceLink", false)}
            >
              Explore {services[activeService].title}
              <ArrowRight
                className={`ml-2 w-5 h-5 transition-transform ${hoveredLinks["serviceLink"] ? "translate-x-1" : ""}`}
              />
            </Link>
          </div>
        </div>

        {/* Floating service cards */}
        <div
          className={`absolute w-[220px] p-5 bg-white rounded-xl shadow-lg transition-all duration-500 z-[5] ${
            activeService === "shop" ? "opacity-100 translate-y-0" : "opacity-0 translate-y-5 pointer-events-none"
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
            activeService === "services" ? "opacity-100 translate-y-0" : "opacity-0 translate-y-5 pointer-events-none"
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
            activeService === "websites" ? "opacity-100 translate-y-0" : "opacity-0 translate-y-5 pointer-events-none"
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

      {/* Featured Products Section */}
      <section className="featured-products-section py-16 px-6 relative z-10">
        <div className="max-w-7xl mx-auto">
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-3xl font-bold text-gray-900">Featured Products</h2>
            {(productsLoading || categoriesLoading) && !isInitialLoad && (
              <div className="flex items-center text-blue-600">
                <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                <span className="text-sm font-medium">Refreshing...</span>
              </div>
            )}
            {!isInitialLoad && (
              <button
                onClick={handleRefresh}
                className="flex items-center text-blue-600 hover:text-blue-800 transition-colors"
              >
                <RefreshCw className="w-4 h-4 mr-1" />
                <span className="text-sm font-medium">Refresh</span>
              </button>
            )}
          </div>

          {/* Loading overlay for products */}
          <LoadingOverlay isLoading={productsLoading && !isInitialLoad} message="Updating products..." opacity={70}>
            {hasFeaturedProducts ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                {featuredProducts.map((product) => (
                  <div
                    key={product._id}
                    className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow"
                  >
                    <img
                      src={product.image || "/placeholder.svg"}
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
            ) : productsError ? (
              <ErrorMessage
                message="Couldn't load products"
                description={productsError.message || "There was an error loading the featured products."}
                onRetry={handleRefresh}
                fullWidth
              />
            ) : (
              <EmptyState
                title="No Featured Products"
                message="There are no featured products to display at this time."
                icon={<Package className="w-12 h-12 text-gray-400" />}
              />
            )}
          </LoadingOverlay>
        </div>
      </section>

      {/* Featured Categories Section */}
      <section className="py-16 px-6 bg-gray-50 relative z-10">
        <div className="max-w-7xl mx-auto">
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-3xl font-bold text-gray-900">Featured Categories</h2>
            {categoriesLoading && !isInitialLoad && (
              <div className="flex items-center text-blue-600">
                <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                <span className="text-sm font-medium">Refreshing...</span>
              </div>
            )}
          </div>

          {/* Loading overlay for categories */}
          <LoadingOverlay isLoading={categoriesLoading && !isInitialLoad} message="Updating categories..." opacity={70}>
            {hasFeaturedCategories ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                {featuredCategories.map((category) => (
                  <div
                    key={category._id}
                    className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow"
                  >
                    <img
                      src={category.image || "/placeholder.svg"}
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
            ) : categoriesError ? (
              <ErrorMessage
                message="Couldn't load categories"
                description={categoriesError.message || "There was an error loading the featured categories."}
                onRetry={handleRefresh}
                fullWidth
              />
            ) : (
              <EmptyState
                title="No Featured Categories"
                message="There are no featured categories to display at this time."
                icon={<Package className="w-12 h-12 text-gray-400" />}
              />
            )}
          </LoadingOverlay>
        </div>
      </section>

      {/* Enhanced Footer */}
      <Footer />
    </div>
  )
}
