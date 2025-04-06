"use client"

import { useState, useEffect, useRef } from "react"
import { ShoppingBag, Wrench, Globe, ArrowRight, Menu, X, User, Check } from "lucide-react"
import { Link, useNavigate } from "react-router-dom"
import { useSelector, useDispatch } from "react-redux"
import AuthButtons from "../components/common/AuthButtons"
import { openAuthModal } from "../redux/slices/uiSlice"

// Custom components for the enhanced landing page
const ShieldCheck = ({ className }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
    <path d="m9 12 2 2 4-4" />
  </svg>
)

const Cloud = ({ className }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    <path d="M17.5 19H9a7 7 0 1 1 6.71-9h1.79a4.5 4.5 0 1 1 0 9Z" />
  </svg>
)

const Lightbulb = ({ className }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    <path d="M15 14c.2-1 .7-1.7 1.5-2.5 1-.9 1.5-2.2 1.5-3.5A6 6 0 0 0 6 8c0 1 .2 2.2 1.5 3.5.7.7 1.3 1.5 1.5 2.5" />
    <path d="M9 18h6" />
    <path d="M10 22h4" />
  </svg>
)

const HeadphonesIcon = ({ className }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    <path d="M3 18v-6a9 9 0 0 1 18 0v6" />
    <path d="M21 19a2 2 0 0 1-2 2h-1a2 2 0 0 1-2-2v-3a2 2 0 0 1 2-2h3zM3 19a2 2 0 0 0 2 2h1a2 2 0 0 0 2-2v-3a2 2 0 0 0-2-2H3z" />
  </svg>
)

export default function EnhancedLandingPage() {
  const [activeService, setActiveService] = useState("shop")
  const [hoveredLinks, setHoveredLinks] = useState({})
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [activeFeature, setActiveFeature] = useState(0)
  const [isVisible, setIsVisible] = useState(false)
  const heroRef = useRef(null)
  const navigate = useNavigate()
  const dispatch = useDispatch()
  const { user } = useSelector((state) => state.auth)

  // Features data
  const features = [
    {
      title: "Comprehensive Security Solutions",
      description: "Advanced protection for your digital assets with real-time threat monitoring and response.",
      icon: <ShieldCheck className="w-6 h-6" />,
    },
    {
      title: "Cloud Infrastructure Management",
      description: "Scalable and secure cloud solutions tailored to your business needs.",
      icon: <Cloud className="w-6 h-6" />,
    },
    {
      title: "Digital Transformation Consulting",
      description: "Strategic guidance to modernize your business processes and technology stack.",
      icon: <Lightbulb className="w-6 h-6" />,
    },
    {
      title: "24/7 Technical Support",
      description: "Round-the-clock assistance from our team of certified cybersecurity experts.",
      icon: <HeadphonesIcon className="w-6 h-6" />,
    },
  ]

  // Services data
  const services = {
    shop: {
      title: "Online Shop",
      description:
        "Create and manage your online store with powerful e-commerce tools, inventory management, and secure payment processing.",
      icon: <ShoppingBag className="w-6 h-6" />,
      link: "/shop",
      features: [
        "Product Management",
        "Secure Payments",
        "Inventory Tracking",
        "Customer Analytics",
        "Mobile Optimization",
      ],
      image: "/api/placeholder/600/400",
    },
    services: {
      title: "Digital Services",
      description:
        "Offer your services online with booking systems, client management, and automated workflows to streamline your business.",
      icon: <Wrench className="w-6 h-6" />,
      link: "/services",
      features: [
        "Booking System",
        "Client Management",
        "Automated Workflows",
        "Service Analytics",
        "Payment Processing",
      ],
      image: "/api/placeholder/600/400",
    },
    websites: {
      title: "Website Builder",
      description:
        "Design and deploy stunning websites with our intuitive builder, custom templates, and powerful SEO tools.",
      icon: <Globe className="w-6 h-6" />,
      link: "/websites",
      features: ["Drag & Drop Builder", "Responsive Templates", "SEO Tools", "Custom Domains", "Analytics Dashboard"],
      image: "/api/placeholder/600/400",
    },
  }

  // Testimonials data
  const testimonials = [
    {
      id: 1,
      name: "Sarah Johnson",
      role: "CTO, TechStart Inc.",
      content:
        "VoxCyber transformed our digital security infrastructure. Their comprehensive solutions and proactive approach have given us peace of mind in an increasingly complex threat landscape.",
      avatar: "/api/placeholder/80/80",
    },
    {
      id: 2,
      name: "Michael Chen",
      role: "Founder, DataFlow Systems",
      content:
        "The website builder tool is incredibly intuitive yet powerful. We were able to launch our new product site in days instead of weeks, with all the advanced features we needed.",
      avatar: "/api/placeholder/80/80",
    },
    {
      id: 3,
      name: "Emily Rodriguez",
      role: "Digital Marketing Director, Elevate Brands",
      content:
        "VoxCyber's e-commerce platform has significantly increased our conversion rates. The seamless integration with our existing systems made the transition smooth and hassle-free.",
      avatar: "/api/placeholder/80/80",
    },
  ]

  // Auto-cycle through features
  useEffect(() => {
    const interval = setInterval(() => {
      setActiveFeature((prev) => (prev === features.length - 1 ? 0 : prev + 1))
    }, 5000)

    return () => clearInterval(interval)
  }, [features.length])

  // Intersection Observer for animations
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          setIsVisible(true)
        }
      },
      { threshold: 0.1 },
    )

    if (heroRef.current) {
      observer.observe(heroRef.current)
    }

    return () => {
      if (heroRef.current) {
        observer.unobserve(heroRef.current)
      }
    }
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

  const handleLinkHover = (linkId, isHovered) => {
    setHoveredLinks({ ...hoveredLinks, [linkId]: isHovered })
  }

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen)
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
          {user?.role === "admin" && (
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
        <div className="hidden md:block">
          <AuthButtons />
        </div>

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

            {user?.role === "admin" && (
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

      {/* Hero Section */}
      <section
        ref={heroRef}
        className={`relative flex flex-col items-center justify-center px-6 py-16 md:py-24 z-[5] transition-all duration-1000 ${
          isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"
        }`}
      >
        <div className="max-w-7xl mx-auto w-full">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className="text-center lg:text-left">
              <div className="inline-block px-3 py-1 bg-blue-500/10 text-blue-600 rounded-lg text-xs font-medium mb-4">
                Next-Gen Cyber Solutions
              </div>
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold leading-tight mb-4 text-gray-900 dark:text-white">
                Secure Your <span className="text-blue-600">Digital Future</span>
                {user && <span className="text-blue-400 text-2xl ml-2 font-normal">, {user.name}</span>}
              </h1>
              <p className="text-lg md:text-xl text-gray-600 dark:text-gray-300 mb-8 max-w-xl mx-auto lg:mx-0">
                Empowering your digital presence with cutting-edge cybersecurity solutions and comprehensive digital
                services.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
                <button
                  className="inline-flex items-center justify-center px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors shadow-md"
                  onClick={() => navigate("/shop")}
                >
                  Get Started
                  <ArrowRight className="ml-2 w-5 h-5 transition-transform group-hover:translate-x-1" />
                </button>
                <button className="inline-flex items-center justify-center px-6 py-3 border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition-colors">
                  Watch Demo
                </button>
              </div>
            </div>
            <div className="relative hidden lg:block">
              <div className="absolute inset-0 bg-blue-500/10 blur-[60px] rounded-full"></div>
              <img
                src="/api/placeholder/600/400"
                alt="Cyber Security"
                className="relative z-10 rounded-xl shadow-xl w-full h-auto object-cover"
              />
              <div className="absolute -bottom-6 -right-6 bg-white dark:bg-gray-800 p-4 rounded-lg shadow-lg z-20">
                <div className="flex items-center gap-2">
                  <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center text-green-600">
                    <Check className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900 dark:text-white">Protected & Secure</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">24/7 Monitoring</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Trusted by section */}
          <div className="mt-16 text-center">
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">TRUSTED BY LEADING COMPANIES</p>
            <div className="flex flex-wrap justify-center gap-8 md:gap-16">
              {[1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="h-8 w-24 bg-gray-200 dark:bg-gray-700 rounded opacity-50"></div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="relative py-16 md:py-24 bg-gray-50 dark:bg-gray-900/50 z-[5]">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">
              Comprehensive Cyber Solutions
            </h2>
            <p className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
              Our suite of services is designed to protect, optimize, and enhance your digital presence.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
            <div>
              {features.map((feature, index) => (
                <div
                  key={index}
                  className={`mb-6 p-6 rounded-xl transition-all duration-300 cursor-pointer ${
                    activeFeature === index
                      ? "bg-white dark:bg-gray-800 shadow-md"
                      : "hover:bg-white/50 dark:hover:bg-gray-800/50"
                  }`}
                  onClick={() => setActiveFeature(index)}
                >
                  <div className="flex items-start">
                    <div
                      className={`p-3 rounded-lg mr-4 ${
                        activeFeature === index
                          ? "bg-blue-100 text-blue-600 dark:bg-blue-900 dark:text-blue-400"
                          : "bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-400"
                      }`}
                    >
                      {feature.icon}
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">{feature.title}</h3>
                      <p className="text-gray-600 dark:text-gray-400">{feature.description}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <div className="relative">
              <div className="absolute inset-0 bg-blue-500/10 blur-[40px] rounded-full"></div>
              <img
                src="/api/placeholder/600/600"
                alt="Feature illustration"
                className="relative z-10 rounded-xl shadow-xl w-full h-auto object-cover"
              />
              <div className="absolute -bottom-6 -left-6 bg-white dark:bg-gray-800 p-4 rounded-lg shadow-lg z-20">
                <div className="flex items-center gap-2">
                  <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center text-blue-600">
                    <ShieldCheck className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900 dark:text-white">Enterprise-Grade Security</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">For businesses of all sizes</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Services Section */}
      <section className="relative py-16 md:py-24 z-[5]">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">Our Core Services</h2>
            <p className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
              Explore our range of solutions designed to enhance your digital presence
            </p>
          </div>

          <div className="flex flex-col md:flex-row gap-8 mb-12">
            {Object.keys(services).map((key) => (
              <button
                key={key}
                className={`flex flex-col items-center gap-3 p-6 rounded-xl transition-all ${
                  activeService === key
                    ? "bg-blue-50 dark:bg-blue-900/20 border-2 border-blue-200 dark:border-blue-800"
                    : "bg-white dark:bg-gray-800 border-2 border-transparent hover:border-gray-200 dark:hover:border-gray-700"
                } shadow-sm flex-1`}
                onClick={() => setActiveService(key)}
              >
                <div
                  className={`w-16 h-16 flex items-center justify-center rounded-full transition-all ${
                    activeService === key
                      ? "bg-blue-100 text-blue-600 dark:bg-blue-900 dark:text-blue-400"
                      : "bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-400"
                  }`}
                >
                  {services[key].icon}
                </div>
                <h3
                  className={`text-xl font-semibold transition-colors ${
                    activeService === key ? "text-blue-600 dark:text-blue-400" : "text-gray-900 dark:text-white"
                  }`}
                >
                  {services[key].title}
                </h3>
              </button>
            ))}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className="order-2 lg:order-1">
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">{services[activeService].title}</h3>
              <p className="text-gray-600 dark:text-gray-400 mb-6">{services[activeService].description}</p>

              <ul className="space-y-3 mb-8">
                {services[activeService].features.map((feature, index) => (
                  <li key={index} className="flex items-center gap-3">
                    <div className="w-6 h-6 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center text-blue-600 dark:text-blue-400">
                      <Check className="w-4 h-4" />
                    </div>
                    <span className="text-gray-700 dark:text-gray-300">{feature}</span>
                  </li>
                ))}
              </ul>

              <Link
                to={services[activeService].link}
                className="inline-flex items-center px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors"
              >
                Explore {services[activeService].title}
                <ArrowRight className="ml-2 w-5 h-5" />
              </Link>
            </div>

            <div className="order-1 lg:order-2 relative">
              <div className="absolute inset-0 bg-blue-500/10 blur-[40px] rounded-full"></div>
              <img
                src={services[activeService].image || "/placeholder.svg"}
                alt={services[activeService].title}
                className="relative z-10 rounded-xl shadow-xl w-full h-auto object-cover"
              />

              {/* Service-specific floating card */}
              <div className="absolute -bottom-6 -right-6 bg-white dark:bg-gray-800 p-4 rounded-lg shadow-lg z-20 max-w-[250px]">
                <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center text-blue-600 dark:text-blue-400 mb-2">
                  {services[activeService].icon}
                </div>
                <h4 className="text-sm font-semibold text-gray-900 dark:text-white mb-1">
                  {services[activeService].title}
                </h4>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  Start exploring our {services[activeService].title.toLowerCase()} solutions today
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="relative py-16 md:py-24 bg-gray-50 dark:bg-gray-900/50 z-[5]">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">What Our Clients Say</h2>
            <p className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
              Hear from businesses that have transformed their digital presence with VoxCyber
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {testimonials.map((testimonial) => (
              <div
                key={testimonial.id}
                className="bg-white dark:bg-gray-800 p-8 rounded-xl shadow-md hover:shadow-lg transition-shadow"
              >
                <div className="flex items-center mb-6">
                  <img
                    src={testimonial.avatar || "/placeholder.svg"}
                    alt={testimonial.name}
                    className="w-12 h-12 rounded-full mr-4"
                  />
                  <div>
                    <h4 className="text-lg font-semibold text-gray-900 dark:text-white">{testimonial.name}</h4>
                    <p className="text-sm text-gray-500 dark:text-gray-400">{testimonial.role}</p>
                  </div>
                </div>
                <p className="text-gray-600 dark:text-gray-300 italic">"{testimonial.content}"</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="relative py-16 md:py-24 z-[5]">
        <div className="max-w-5xl mx-auto px-6">
          <div className="bg-blue-600 dark:bg-blue-700 rounded-2xl p-8 md:p-12 text-center text-white">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Ready to Secure Your Digital Future?</h2>
            <p className="text-lg text-blue-100 mb-8 max-w-2xl mx-auto">
              Join thousands of businesses that trust VoxCyber for their cybersecurity and digital needs.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button
                className="px-8 py-3 bg-white text-blue-600 font-bold rounded-lg hover:bg-blue-50 transition-colors"
                onClick={() => navigate("/shop")}
              >
                Get Started
              </button>
              <button className="px-8 py-3 bg-blue-700 dark:bg-blue-800 text-white font-bold rounded-lg border border-blue-400 hover:bg-blue-800 dark:hover:bg-blue-900 transition-colors">
                Contact Sales
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative bg-gray-900 text-white z-[5]">
        <div className="max-w-7xl mx-auto px-6 pt-16 pb-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
            <div className="md:col-span-1">
              <div className="flex items-center mb-4">
                <div className="flex items-center justify-center w-8 h-8 bg-blue-600 text-white rounded-full font-bold mr-2">
                  V
                </div>
                <span className="text-xl font-bold">VoxCyber</span>
              </div>
              <p className="text-gray-400 mb-4">
                Empowering your digital presence with cutting-edge cybersecurity solutions and comprehensive digital
                services.
              </p>
            </div>

            <div>
              <h3 className="text-lg font-semibold mb-4">Services</h3>
              <ul className="space-y-2">
                <li>
                  <Link to="/shop" className="text-gray-400 hover:text-white transition-colors">
                    Online Shop
                  </Link>
                </li>
                <li>
                  <Link to="/services" className="text-gray-400 hover:text-white transition-colors">
                    Digital Services
                  </Link>
                </li>
                <li>
                  <Link to="/websites" className="text-gray-400 hover:text-white transition-colors">
                    Website Builder
                  </Link>
                </li>
              </ul>
            </div>

            <div>
              <h3 className="text-lg font-semibold mb-4">Company</h3>
              <ul className="space-y-2">
                <li>
                  <a href="#" className="text-gray-400 hover:text-white transition-colors">
                    About Us
                  </a>
                </li>
                <li>
                  <a href="#" className="text-gray-400 hover:text-white transition-colors">
                    Careers
                  </a>
                </li>
                <li>
                  <a href="#" className="text-gray-400 hover:text-white transition-colors">
                    Contact
                  </a>
                </li>
              </ul>
            </div>

            <div>
              <h3 className="text-lg font-semibold mb-4">Legal</h3>
              <ul className="space-y-2">
                <li>
                  <a href="#" className="text-gray-400 hover:text-white transition-colors">
                    Terms
                  </a>
                </li>
                <li>
                  <a href="#" className="text-gray-400 hover:text-white transition-colors">
                    Privacy
                  </a>
                </li>
                <li>
                  <a href="#" className="text-gray-400 hover:text-white transition-colors">
                    Cookies
                  </a>
                </li>
              </ul>
            </div>
          </div>

          <div className="border-t border-gray-800 pt-8 flex flex-col md:flex-row justify-between items-center">
            <p className="text-sm text-gray-500 mb-4 md:mb-0">
              © {new Date().getFullYear()} VoxCyber. All rights reserved.
            </p>
            <div className="flex space-x-6">
              <a href="#" className="text-gray-400 hover:text-white transition-colors">
                <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M22.675 0h-21.35c-.732 0-1.325.593-1.325 1.325v21.351c0 .731.593 1.324 1.325 1.324h11.495v-9.294h-3.128v-3.622h3.128v-2.671c0-3.1 1.893-4.788 4.659-4.788 1.325 0 2.463.099 2.795.143v3.24l-1.918.001c-1.504 0-1.795.715-1.795 1.763v2.313h3.587l-.467 3.622h-3.12v9.293h6.116c.73 0 1.323-.593 1.323-1.325v-21.35c0-.732-.593-1.325-1.325-1.325z" />
                </svg>
              </a>
              <a href="#" className="text-gray-400 hover:text-white transition-colors">
                <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M23.954 4.569c-.885.389-1.83.654-2.825.775 1.014-.611 1.794-1.574 2.163-2.723-.951.555-2.005.959-3.127 1.184-.896-.959-2.173-1.559-3.591-1.559-2.717 0-4.92 2.203-4.92 4.917 0 .39.045.765.127 1.124-4.09-.193-7.715-2.157-10.141-5.126-.427.722-.666 1.561-.666 2.475 0 1.71.87 3.213 2.188 4.096-.807-.026-1.566-.248-2.228-.616v.061c0 2.385 1.693 4.374 3.946 4.827-.413.111-.849.171-1.296.171-.314 0-.615-.03-.916-.086.631 1.953 2.445 3.377 4.604 3.417-1.68 1.319-3.809 2.105-6.102 2.105-.39 0-.779-.023-1.17-.067 2.189 1.394 4.768 2.209 7.557 2.209 9.054 0 14-7.503 14-14v-.617c.961-.689 1.8-1.56 2.46-2.548z" />
                </svg>
              </a>
              <a href="#" className="text-gray-400 hover:text-white transition-colors">
                <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
                </svg>
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}

