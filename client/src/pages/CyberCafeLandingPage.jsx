"use client"

import { useState, useEffect, useRef, useCallback, useMemo } from "react"
import { useDispatch, useSelector } from "react-redux"
import { motion, AnimatePresence } from "framer-motion"
import {
  ShoppingCart,
  X,
  Headphones,
  Coffee,
  Monitor,
  Wifi,
  Printer,
  BookOpen,
  Star,
  Mail,
  Sun,
  Moon,
  Check,
  ShoppingBag,
  RefreshCw,
  Plus,
  Minus,
  Wrench,
  Tag,
  AlertCircle,
  Truck,
  Shield,
  Search,
  Heart,
  ChevronDown,
  ChevronLeft,
  Filter,
  Percent,
  Facebook,
  Twitter,
  Instagram,
  Youtube,
  MapPin,
  Phone,
  Clock1,
  Menu,
} from "lucide-react"
import { Link, useNavigate } from "react-router-dom"
import { addToCart, fetchCart } from "../redux/slices/cartSlice"
import { openAuthModal } from "../redux/slices/uiSlice"
import { toggleDarkMode } from "../redux/slices/uiSlice"
import CheckoutModal from "../components/checkout/CheckoutModal"
import {
  fetchProducts,
  fetchFeaturedProducts,
  fetchNewArrivals,
  fetchSaleProducts,
  setFilters,
} from "../redux/slices/productsSlice"
import { fetchCategories, fetchFeaturedCategories } from "../redux/slices/categoriesSlice"
import { fetchSpecialOffers } from "../redux/slices/specialOffersSlice"
import { fetchHeroSlides } from "../redux/slices/heroSlidesSlice"
import { clearError, clearSuccess, subscribeToNewsletter } from "../redux/slices/newsletterSlice"
import formatCurrency from '../utils/formatCurrency';

// Import our enhanced components
import LoadingScreen from "./common/LoadingScreen"
import ErrorFallback from "./common/ErrorFallback"
import StatusMessage from "./common/StatusMessage"

// Fun loading quotes and facts
const funLoadingContent = [
  {
    type: "quote",
    text: "Loading faster than your WiFi on a good day! 🚀",
    author: "The Internet"
  },
  {
    type: "quote",
    text: "Patience is a virtue, but loading screens are temporary! ⏳",
    author: "Ancient Developer Wisdom"
  },
  {
    type: "quote",
    text: "Good things come to those who wait... and refresh the page! 🔄",
    author: "Every Developer Ever"
  },
  {
    type: "fact",
    text: "The first computer bug was an actual bug - a moth found in a Harvard computer in 1947! 🐛"
  },
  {
    type: "fact",
    text: "The term 'debugging' was coined by Admiral Grace Hopper when she found that moth! 🔍"
  },
  {
    type: "fact",
    text: "The first 1GB hard drive weighed over 500 pounds and cost $40,000 in 1980! 💾"
  },
  {
    type: "fact",
    text: "Your smartphone has more computing power than NASA used to land on the moon! 🌙"
  },
  {
    type: "fact",
    text: "The first webcam was created to monitor a coffee pot at Cambridge University! ☕"
  },
  {
    type: "quote",
    text: "99 little bugs in the code, 99 little bugs... take one down, patch it around, 117 little bugs in the code! 🐛",
    author: "Developer's Lament"
  },
  {
    type: "fact",
    text: "The '@' symbol was used in email for the first time in 1971 by Ray Tomlinson! 📧"
  },
  {
    type: "quote",
    text: "There are only 10 types of people: those who understand binary and those who don't! 💻",
    author: "Binary Joke #1"
  },
  {
    type: "fact",
    text: "The first computer virus was created in 1983 and was called 'Elk Cloner'! 🦌"
  },
  {
    type: "quote",
    text: "Loading... Please wait while we untangle the internet cables! 🕸️",
    author: "IT Support"
  },
  {
    type: "fact",
    text: "Google processes over 8.5 billion searches per day! That's 99,000 searches per second! 🔍"
  },
  {
    type: "quote",
    text: "Ctrl+Z is the closest thing we have to time travel! ⏰",
    author: "Every Designer"
  }
]

// Define services array
const services = [
  {
    id: 1,
    title: "Gaming",
    description: "High-performance gaming PCs",
    icon: <Monitor className="w-6 h-6" />,
  },
  {
    id: 2,
    title: "Internet",
    description: "High-speed internet access",
    icon: <Wifi className="w-6 h-6" />,
  },
  {
    id: 3,
    title: "Printing",
    description: "Print, scan, and copy services",
    icon: <Printer className="w-6 h-6" />,
  },
  {
    id: 4,
    title: "Study Area",
    description: "Quiet space for studying",
    icon: <BookOpen className="w-6 h-6" />,
  },
  {
    id: 5,
    title: "Snacks",
    description: "Refreshments and snacks",
    icon: <Coffee className="w-6 h-6" />,
  },
  {
    id: 6,
    title: "Support",
    description: "Technical support available",
    icon: <Headphones className="w-6 h-6" />,
  },
  {
    id: 7,
    title: "Shop",
    description: "Tech accessories for sale",
    icon: <ShoppingBag className="w-6 h-6" />,
  },
  {
    id: 8,
    title: "Services",
    description: "Computer repair and maintenance",
    icon: <Wrench className="w-6 h-6" />,
  },
]

// Define testimonials array
const testimonials = [
  {
    id: 1,
    name: "John Smith",
    role: "Student",
    content:
      "The gaming PCs here are amazing! I come here every weekend to play with my friends. The staff is super friendly and the prices are reasonable.",
    avatar: "/user.png",
    rating: 5,
  },
  {
    id: 2,
    name: "Sarah Johnson",
    role: "Freelancer",
    content:
      "I work remotely and this place is perfect for me. Fast internet, quiet environment, and great coffee. It's my second office!",
    avatar: "/user.png",
    rating: 5,
  },
  {
    id: 3,
    name: "Michael Chen",
    role: "Gamer",
    content:
      "The gaming setup here is top-notch. I've tried many cyber cafes, but this one has the best equipment and the most comfortable chairs.",
    avatar: "/user.png",
    rating: 5,
  },
  {
    id: 4,
    name: "Emily Rodriguez",
    role: "Teacher",
    content:
      "I bring my students here for computer lab sessions sometimes. The staff is very accommodating and the facilities are perfect for educational purposes.",
    avatar: "/user.png",
    rating: 4,
  },
  {
    id: 5,
    name: "David Kim",
    role: "Business Owner",
    content:
      "I often have meetings here. The private rooms are perfect for client presentations, and the printing services have saved me many times.",
    avatar: "/user.png",
    rating: 5,
  },
  {
    id: 6,
    name: "Lisa Thompson",
    role: "Artist",
    content:
      "The high-resolution monitors here are perfect for digital art. I love coming here to work on my projects. The atmosphere is inspiring!",
    avatar: "/user.png",
    rating: 4,
  },
]

// Fallback data for when server data is empty or unavailable
// Updated to match the MongoDB models
const fallbackHeroSlides = [
  {
    _id: "fallback-slide-1",
    title: "Welcome to VoxCyber",
    subtitle: "Your one-stop destination for all tech needs",
    image: "/FutureCyberCafes.avif",
    backgroundColor: "bg-blue-900",
  },
  {
    _id: "fallback-slide-2",
    title: "Premium Gaming Experience",
    subtitle: "High-performance gaming stations with the latest titles",
    image: "/GamingGearSpectacular.avif",
    backgroundColor: "bg-purple-900",
  },
  {
    _id: "fallback-slide-3",
    title: "Fast Internet Connection",
    subtitle: "Blazing fast fiber optic internet for all your needs",
    image: "/FastInternetConnection.png",
    backgroundColor: "bg-green-900",
  },
]

// Updated to match the Category model
const fallbackCategories = [
  {
    _id: "fallback-cat-1",
    name: "Gaming",
    description: "Gaming PCs and accessories",
    image: "/gaming-category.jpg",
    slug: "gaming",
    featured: true,
    status: "active",
    productCount: 24,
    icon: <Monitor className="w-6 h-6" />,
  },
  {
    _id: "fallback-cat-2",
    name: "Networking",
    description: "Routers, switches and more",
    image: "/networking-category.jpg",
    slug: "networking",
    featured: true,
    status: "active",
    productCount: 18,
    icon: <Wifi className="w-6 h-6" />,
  },
  {
    _id: "fallback-cat-3",
    name: "Peripherals",
    description: "Keyboards, mice and headsets",
    image: "/peripherals-category.jpg",
    slug: "peripherals",
    featured: true,
    status: "active",
    productCount: 32,
    icon: <Headphones className="w-6 h-6" />,
  },
  {
    _id: "fallback-cat-4",
    name: "Printing",
    description: "Printers and supplies",
    image: "/printing-category.jpg",
    slug: "printing",
    featured: false,
    status: "active",
    productCount: 12,
    icon: <Printer className="w-6 h-6" />,
  },
  {
    _id: "fallback-cat-5",
    name: "Study",
    description: "Books and study materials",
    image: "/study-category.jpg",
    slug: "study",
    featured: false,
    status: "active",
    productCount: 8,
    icon: <BookOpen className="w-6 h-6" />,
  },
  {
    _id: "fallback-cat-6",
    name: "Refreshments",
    description: "Drinks and snacks",
    image: "/refreshments-category.jpg",
    slug: "refreshments",
    featured: false,
    status: "active",
    productCount: 15,
    icon: <Coffee className="w-6 h-6" />,
  },
]

// Updated to match the Product model
const fallbackProducts = [
  {
    _id: "fallback-prod-1",
    name: "Gaming Mechanical Keyboard",
    description: "RGB backlit mechanical keyboard with customizable keys",
    price: 89.99,
    salePrice: 69.99,
    images: ["/keyboard.jpg", "/keyboard-angle.jpg", "/keyboard-top.jpg"],
    category: { _id: "fallback-cat-3", name: "Peripherals", slug: "peripherals" },
    stock: 25,
    featured: true,
    isNewProduct: false,
    onSale: true,
    rating: 4.7,
    numReviews: 128,
    specifications: {
      brand: "VoxTech",
      switchType: "Blue",
      connectivity: "Wired",
      backlight: "RGB",
      layout: "Full-size",
    },
    tags: ["gaming", "keyboard", "mechanical", "rgb"],
    status: "active",
    sku: "KB-MECH-001",
  },
  {
    _id: "fallback-prod-2",
    name: "Wireless Gaming Mouse",
    description: "Ultra-responsive wireless mouse with RGB lighting",
    price: 59.99,
    salePrice: 49.99,
    images: ["/mouse.jpg", "/mouse-side.jpg", "/mouse-bottom.jpg"],
    category: { _id: "fallback-cat-3", name: "Peripherals", slug: "peripherals" },
    stock: 42,
    featured: true,
    isNewProduct: false,
    onSale: true,
    rating: 4.5,
    numReviews: 94,
    specifications: {
      brand: "VoxTech",
      dpi: "16000",
      connectivity: "Wireless",
      batteryLife: "70 hours",
      weight: "85g",
    },
    tags: ["gaming", "mouse", "wireless", "rgb"],
    status: "active",
    sku: "MS-WRLS-001",
  },
  {
    _id: "fallback-prod-3",
    name: "Gaming Headset",
    description: "Immersive surround sound gaming headset with noise-cancelling mic",
    price: 99.99,
    salePrice: 79.99,
    images: ["/GamingGearSpectacular.avif", "/headset-side.jpg", "/headset-mic.jpg"],
    category: { _id: "fallback-cat-3", name: "Peripherals", slug: "peripherals" },
    stock: 18,
    featured: false,
    isNewProduct: true,
    onSale: true,
    rating: 4.8,
    numReviews: 156,
    specifications: {
      brand: "VoxTech",
      soundType: "7.1 Surround",
      connectivity: "Wired",
      micType: "Noise-cancelling",
      weight: "320g",
    },
    tags: ["gaming", "headset", "audio", "microphone"],
    status: "active",
    sku: "HS-GAME-001",
  },
  {
    _id: "fallback-prod-4",
    name: "Gaming Monitor",
    description: "27-inch 144Hz gaming monitor with 1ms response time",
    price: 249.99,
    salePrice: 219.99,
    images: ["/GamingMonitor.avif", "/monitor-side.jpg", "/monitor-back.jpg"],
    category: { _id: "fallback-cat-1", name: "Gaming", slug: "gaming" },
    stock: 10,
    featured: true,
    isNewProduct: false,
    onSale: true,
    rating: 4.9,
    numReviews: 87,
    specifications: {
      brand: "VoxTech",
      size: "27 inch",
      resolution: "1920x1080",
      refreshRate: "144Hz",
      responseTime: "1ms",
    },
    tags: ["gaming", "monitor", "display", "high-refresh"],
    status: "active",
    sku: "MN-GAME-001",
  },
  {
    _id: "fallback-prod-5",
    name: "Wi-Fi 6 Router",
    description: "High-speed Wi-Fi 6 router for ultimate gaming and streaming",
    price: 179.99,
    salePrice: 149.99,
    images: ["/Wi-Fi6Router.webp", "/router-side.jpg", "/router-back.jpg"],
    category: { _id: "fallback-cat-2", name: "Networking", slug: "networking" },
    stock: 15,
    featured: false,
    isNewProduct: true,
    onSale: true,
    rating: 4.6,
    numReviews: 62,
    specifications: {
      brand: "VoxTech",
      standard: "Wi-Fi 6",
      speed: "3000 Mbps",
      ports: "4 Gigabit LAN",
      antennas: "4",
    },
    tags: ["networking", "router", "wifi", "high-speed"],
    status: "active",
    sku: "RT-WIFI6-001",
  },
  {
    _id: "fallback-prod-6",
    name: "Wireless Earbuds",
    description: "True wireless earbuds with active noise cancellation",
    price: 129.99,
    salePrice: 109.99,
    images: ["/earbuds.jpg", "/earbuds-case.jpg", "/earbuds-fit.jpg"],
    category: { _id: "fallback-cat-3", name: "Peripherals", slug: "peripherals" },
    stock: 30,
    featured: false,
    isNewProduct: false,
    onSale: true,
    rating: 4.4,
    numReviews: 103,
    specifications: {
      brand: "VoxTech",
      batteryLife: "8 hours",
      connectivity: "Bluetooth 5.2",
      noiseCancel: "Active",
      waterproof: "IPX5",
    },
    tags: ["audio", "earbuds", "wireless", "bluetooth"],
    status: "active",
    sku: "EB-WRLS-001",
  },
  {
    _id: "fallback-prod-7",
    name: "Portable SSD",
    description: "1TB portable SSD with USB-C connectivity",
    price: 149.99,
    salePrice: 129.99,
    images: ["/PortableSSD.jpg", "/ssd-side.jpg", "/ssd-connected.jpg"],
    category: { _id: "fallback-cat-1", name: "Gaming", slug: "gaming" },
    stock: 22,
    featured: true,
    isNewProduct: false,
    onSale: true,
    rating: 4.7,
    numReviews: 75,
    specifications: {
      brand: "VoxTech",
      capacity: "1TB",
      interface: "USB-C",
      speed: "1050 MB/s",
      dimensions: "95x50x10mm",
    },
    tags: ["storage", "ssd", "portable", "usb-c"],
    status: "active",
    sku: "SSD-PORT-001",
  },
  {
    _id: "fallback-prod-8",
    name: "Mechanical Keyboard",
    description: "Compact mechanical keyboard with RGB lighting",
    price: 79.99,
    salePrice: 69.99,
    images: ["/keyboard.jpg", "/keyboard-rgb.jpg", "/keyboard-typing.jpg"],
    category: { _id: "fallback-cat-3", name: "Peripherals", slug: "peripherals" },
    stock: 35,
    featured: false,
    isNewProduct: false,
    onSale: true,
    rating: 4.5,
    numReviews: 88,
    specifications: {
      brand: "VoxTech",
      switchType: "Red",
      connectivity: "Wired",
      backlight: "RGB",
      layout: "TKL",
    },
    tags: ["keyboard", "mechanical", "compact", "rgb"],
    status: "active",
    sku: "KB-MECH-002",
  },
]

// Updated to match the SpecialOffer model
const fallbackSpecialOffers = [
  {
    _id: "fallback-offer-1",
    title: "Gaming Bundle",
    description: "Complete gaming setup at a discounted price",
    discountPercentage: 27,
    startDate: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // 7 days ago
    endDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000), // 3 days from now
    isActive: true,
    image: "/GamingGearSpectacular.avif",
    products: ["fallback-prod-1", "fallback-prod-2", "fallback-prod-3"],
    categories: ["fallback-cat-1", "fallback-cat-3"],
    terms: "Cannot be combined with other offers. While supplies last.",
    maxUses: 100,
    currentUses: 42,
    // Custom fields for display
    salePrice: 399.99,
    regularPrice: 549.99,
    discount: "27% OFF",
    expiry: "Ends in 3 days",
    code: "GAME27",
    items: ["Gaming Mechanical Keyboard", "Wireless Gaming Mouse", "Gaming Headset", "Mouse Pad XL", "Headset Stand"],
  },
  {
    _id: "fallback-offer-2",
    title: "Productivity Pack",
    description: "Boost your productivity with this essential bundle",
    discountPercentage: 25,
    startDate: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000), // 14 days ago
    endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
    isActive: true,
    image: "/Productivity Pack.webp",
    products: ["fallback-prod-2", "fallback-prod-6", "fallback-prod-7"],
    categories: ["fallback-cat-3", "fallback-cat-5"],
    terms: "Limited to one per customer. Online orders only.",
    maxUses: 50,
    currentUses: 28,
    // Custom fields for display
    salePrice: 299.99,
    regularPrice: 399.99,
    discount: "25% OFF",
    expiry: "Limited time offer",
    code: "WORK25",
    items: ["Wireless Keyboard", "Wireless Mouse", "Noise-Cancelling Headphones", "Laptop Stand", "USB-C Hub"],
  },
]

// Add a function to check if data is empty and use fallback data
const useDataWithFallback = (serverData, fallbackData, isLoading, error) => {
  // If there's an error or the data is empty (but not loading), use fallback data
  if ((error || (Array.isArray(serverData) && serverData.length === 0)) && !isLoading) {
    return fallbackData
  }

  // Otherwise use the server data
  return serverData
}

// Custom hook for theme detection
const useThemeDetector = () => {
  const [isDarkTheme, setIsDarkTheme] = useState(
    window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches,
  )

  useEffect(() => {
    const darkThemeMq = window.matchMedia("(prefers-color-scheme: dark)")
    const mqListener = (e) => {
      setIsDarkTheme(e.matches)
    }

    darkThemeMq.addEventListener("change", mqListener)
    return () => darkThemeMq.removeEventListener("change", mqListener)
  }, [])

  return isDarkTheme
}

// Custom hook for intersection observer
const useIntersectionObserver = (options = {}) => {
  const [isIntersecting, setIsIntersecting] = useState(false)
  const ref = useRef(null)

  useEffect(() => {
    const observer = new IntersectionObserver(([entry]) => {
      setIsIntersecting(entry.isIntersecting)
    }, options)

    if (ref.current) {
      observer.observe(ref.current)
    }

    return () => {
      if (ref.current) {
        observer.unobserve(ref.current)
      }
    }
  }, [options])

  return [ref, isIntersecting]
}

// Format date helper function
const formatDate = (date) => {
  if (!date) return ""
  const d = new Date(date)
  return d.toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" })
}

// Calculate days remaining helper function
const getDaysRemaining = (endDate) => {
  if (!endDate) return 0
  const end = new Date(endDate)
  const now = new Date()
  const diffTime = end - now
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
  return diffDays > 0 ? diffDays : 0
}

// Product Quick View Modal Component
const QuickViewModal = ({ product, isOpen, onClose, onAddToCart, onBuyNow }) => {
  const [quantity, setQuantity] = useState(1)
  const [selectedImage, setSelectedImage] = useState(0)
  const { darkMode } = useSelector((state) => state.ui)
  const [isClosing, setIsClosing] = useState(false)
  const [selectedTab, setSelectedTab] = useState("description")
  const modalRef = useRef(null)

  const incrementQuantity = () => setQuantity((prev) => prev + 1)
  const decrementQuantity = () => setQuantity((prev) => (prev > 1 ? prev - 1 : 1))

  // Lock body scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      // Save current scroll position
      const scrollY = window.scrollY
      // Add styles to body to prevent scrolling
      document.body.style.position = "fixed"
      document.body.style.top = `-${scrollY}px`
      document.body.style.width = "100%"
    } else {
      // Restore scroll position when modal closes
      const scrollY = document.body.style.top
      document.body.style.position = ""
      document.body.style.top = ""
      document.body.style.width = ""
      window.scrollTo(0, Number.parseInt(scrollY || "0") * -1)
    }

    return () => {
      // Clean up in case component unmounts while modal is open
      document.body.style.position = ""
      document.body.style.top = ""
      document.body.style.width = ""
    }
  }, [isOpen])

  // Handle click outside to close
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (modalRef.current && !modalRef.current.contains(event.target)) {
        handleClose()
      }
    }

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside)
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
    }
  }, [isOpen])

  // Handle escape key to close
  useEffect(() => {
    const handleEscKey = (e) => {
      if (e.key === "Escape") {
        handleClose()
      }
    }

    if (isOpen) {
      document.addEventListener("keydown", handleEscKey)
    }

    return () => {
      document.removeEventListener("keydown", handleEscKey)
    }
  }, [isOpen])

  const handleClose = () => {
    setIsClosing(true)
    setTimeout(() => {
      onClose()
      setIsClosing(false)
      setSelectedTab("description") // Reset tab when closing
      setQuantity(1) // Reset quantity when closing
    }, 300)
  }

  if (!isOpen || !product) return null

  // Use real product images
  const productImages = product.images || [product.image || "/Techsetup.jpg"]

  // Calculate discount percentage
  const discountPercentage =
    product.salePrice && product.price ? Math.round(((product.price - product.salePrice) / product.price) * 100) : 0

  // Get product status label
  const getStatusLabel = () => {
    if (product.stock <= 0 || product.status === "out_of_stock") {
      return (
        <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200">
          <div className="w-2 h-2 rounded-full bg-red-500 mr-2"></div>
          Out of Stock
        </span>
      )
    } else if (product.stock < 10) {
      return (
        <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200">
          <div className="w-2 h-2 rounded-full bg-yellow-500 mr-2"></div>
          Low Stock ({product.stock} left)
        </span>
      )
    } else {
      return (
        <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
          <div className="w-2 h-2 rounded-full bg-green-500 mr-2"></div>
          In Stock
        </span>
      )
    }
  }

  return (
    <motion.div
      className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black bg-opacity-0 overflow-hidden"
      initial={{ backgroundColor: "rgba(0, 0, 0, 0)" }}
      animate={{
        backgroundColor: isClosing ? "rgba(0, 0, 0, 0)" : "rgba(0, 0, 0, 0.75)",
        backdropFilter: isClosing ? "blur(0px)" : "blur(5px)",
      }}
      transition={{ duration: 0.3 }}
    >
      <motion.div
        ref={modalRef}
        className={`relative w-full max-w-4xl rounded-2xl shadow-2xl ${darkMode ? "bg-gray-800" : "bg-white"
          } max-h-[90vh] flex flex-col`}
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{
          opacity: isClosing ? 0 : 1,
          scale: isClosing ? 0.9 : 1,
          y: isClosing ? 20 : 0,
        }}
        transition={{
          type: "spring",
          damping: 25,
          stiffness: 300,
          duration: 0.3,
        }}
      >
        <button
          onClick={handleClose}
          className="absolute top-2 right-2 sm:top-4 sm:right-4 z-10 p-2 rounded-full bg-white/10 backdrop-blur-md text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 transition-all duration-200 shadow-md"
          aria-label="Close modal"
        >
          <X size={20} />
        </button>

        <div className="flex flex-col md:flex-row overflow-hidden max-h-[90vh]">
          {/* Product Images - Reduced width */}
          <div className="relative bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 md:w-2/5">
            <div className="aspect-square overflow-hidden">
              <motion.img
                key={selectedImage}
                src={productImages[selectedImage] || "/Techsetup.jpg"}
                alt={product.name}
                className="w-full h-full object-contain p-2 sm:p-4"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.3 }}
              />

              {/* Product badges */}
              <div className="absolute top-2 left-2 sm:top-4 sm:left-4 flex flex-col gap-2">
                {product.onSale && (
                  <div className="px-2 sm:px-3 py-1 text-xs font-bold rounded-full bg-red-600 text-white shadow-md backdrop-blur-sm bg-opacity-90">
                    Sale
                  </div>
                )}
                {product.isNewProduct && (
                  <div className="px-2 sm:px-3 py-1 text-xs font-bold rounded-full bg-green-600 text-white shadow-md backdrop-blur-sm bg-opacity-90">
                    New
                  </div>
                )}
                {product.featured && (
                  <div className="px-2 sm:px-3 py-1 text-xs font-bold rounded-full bg-yellow-500 text-white shadow-md backdrop-blur-sm bg-opacity-90">
                    Featured
                  </div>
                )}
              </div>
            </div>

            {/* Thumbnail Navigation */}
            <div className="flex justify-center mt-2 sm:mt-4 space-x-1 sm:space-x-2 px-2 sm:px-4 pb-2 sm:pb-4 overflow-x-auto">
              {productImages.map((img, idx) => (
                <button
                  key={idx}
                  onClick={() => setSelectedImage(idx)}
                  className={`w-12 h-12 sm:w-16 sm:h-16 rounded-lg overflow-hidden border-2 transition-all flex-shrink-0 ${selectedImage === idx
                    ? "border-blue-600 dark:border-blue-400 shadow-md scale-110"
                    : "border-transparent hover:border-gray-300 dark:hover:border-gray-600 opacity-70 hover:opacity-100"
                    }`}
                  aria-label={`View image ${idx + 1}`}
                >
                  <img
                    src={img || "/placeholder.svg"}
                    alt={`Thumbnail ${idx + 1}`}
                    className="w-full h-full object-cover"
                  />
                </button>
              ))}
            </div>
          </div>

          {/* Product Details - Increased width */}
          <div className="p-4 sm:p-6 md:p-8 flex flex-col overflow-y-auto md:w-3/5 max-h-[90vh] md:max-h-none">
            <div className="mb-2 flex flex-wrap gap-2">
              <span className="text-xs sm:text-sm font-medium px-2 sm:px-3 py-1 rounded-full bg-blue-100 dark:bg-blue-900/40 text-blue-800 dark:text-blue-300">
                {product.category?.name || "Uncategorized"}
              </span>
              {product.sku && (
                <span className="text-xs sm:text-sm font-medium px-2 sm:px-3 py-1 rounded-full bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-300">
                  SKU: {product.sku}
                </span>
              )}
            </div>

            <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-900 dark:text-white mb-2">
              {product.name}
            </h2>

            <div className="flex items-center mb-3 sm:mb-4">
              <div className="flex">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    size={16}
                    className={
                      i < Math.floor(product.rating || 0)
                        ? "text-yellow-400 fill-yellow-400"
                        : "text-gray-300 dark:text-gray-600"
                    }
                  />
                ))}
              </div>
              <span className="ml-2 text-xs sm:text-sm text-gray-600 dark:text-gray-400">
                {product.rating?.toFixed(1) || "0.0"} ({product.numReviews || 0} reviews)
              </span>
            </div>

            <div className="mb-4 sm:mb-6">
              <div className="flex items-baseline">
                {product.salePrice ? (
                  <>
                    <span className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">
                      {formatCurrency(product.salePrice)}
                    </span>
                    <span className="ml-2 sm:ml-3 text-base sm:text-lg text-gray-500 dark:text-gray-400 line-through">
                      {formatCurrency(product.price)}
                    </span>
                  </>
                ) : (
                  <span className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">
                    {formatCurrency(product.price || 0)}
                  </span>
                )}
              </div>
              {discountPercentage > 0 && (
                <span className="inline-block mt-1 text-xs sm:text-sm font-medium text-green-600 dark:text-green-400 bg-green-100 dark:bg-green-900/30 px-2 py-0.5 rounded-full">
                  Save {discountPercentage}% for a limited time
                </span>
              )}
            </div>

            {/* Tabs for product information */}
            <div className="mb-4 sm:mb-6 border-b border-gray-200 dark:border-gray-700">
              <div className="flex space-x-4">
                <button
                  onClick={() => setSelectedTab("description")}
                  className={`pb-2 text-sm font-medium ${selectedTab === "description"
                    ? "text-blue-600 dark:text-blue-400 border-b-2 border-blue-600 dark:border-blue-400"
                    : "text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
                    }`}
                >
                  Description
                </button>
                <button
                  onClick={() => setSelectedTab("specifications")}
                  className={`pb-2 text-sm font-medium ${selectedTab === "specifications"
                    ? "text-blue-600 dark:text-blue-400 border-b-2 border-blue-600 dark:border-blue-400"
                    : "text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
                    }`}
                >
                  Specifications
                </button>
                <button
                  onClick={() => setSelectedTab("shipping")}
                  className={`pb-2 text-sm font-medium ${selectedTab === "shipping"
                    ? "text-blue-600 dark:text-blue-400 border-b-2 border-blue-600 dark:border-blue-400"
                    : "text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
                    }`}
                >
                  Shipping
                </button>
              </div>
            </div>

            {/* Tab content */}
            <div className="mb-4 sm:mb-6">
              {selectedTab === "description" && (
                <div>
                  <p className="text-sm sm:text-base text-gray-600 dark:text-gray-300 leading-relaxed">
                    {product.description}
                  </p>

                  <div className="mt-4 bg-gray-50 dark:bg-gray-700/50 p-3 sm:p-4 rounded-xl">
                    <h3 className="text-xs sm:text-sm font-medium text-gray-900 dark:text-white mb-2 sm:mb-3">
                      Key Features:
                    </h3>
                    <ul className="space-y-1 sm:space-y-2">
                      <li className="flex items-center text-xs sm:text-sm text-gray-600 dark:text-gray-300">
                        <div className="w-4 h-4 sm:w-5 sm:h-5 rounded-full bg-green-100 dark:bg-green-900/50 flex items-center justify-center mr-2 sm:mr-3 flex-shrink-0">
                          <Check size={10} className="text-green-600 dark:text-green-400" />
                        </div>
                        Premium quality materials
                      </li>
                      <li className="flex items-center text-xs sm:text-sm text-gray-600 dark:text-gray-300">
                        <div className="w-4 h-4 sm:w-5 sm:h-5 rounded-full bg-green-100 dark:bg-green-900/50 flex items-center justify-center mr-2 sm:mr-3 flex-shrink-0">
                          <Check size={10} className="text-green-600 dark:text-green-400" />
                        </div>
                        Enhanced performance
                      </li>
                      <li className="flex items-center text-xs sm:text-sm text-gray-600 dark:text-gray-300">
                        <div className="w-4 h-4 sm:w-5 sm:h-5 rounded-full bg-green-100 dark:bg-green-900/50 flex items-center justify-center mr-2 sm:mr-3 flex-shrink-0">
                          <Check size={10} className="text-green-600 dark:text-green-400" />
                        </div>
                        Durable construction
                      </li>
                      <li className="flex items-center text-xs sm:text-sm text-gray-600 dark:text-gray-300">
                        <div className="w-4 h-4 sm:w-5 sm:h-5 rounded-full bg-green-100 dark:bg-green-900/50 flex items-center justify-center mr-2 sm:mr-3 flex-shrink-0">
                          <Check size={10} className="text-green-600 dark:text-green-400" />
                        </div>
                        1-year warranty
                      </li>
                    </ul>
                  </div>
                </div>
              )}

              {selectedTab === "specifications" && (
                <div>
                  {product.specifications && Object.keys(product.specifications).length > 0 ? (
                    <div className="bg-gray-50 dark:bg-gray-700/50 rounded-xl overflow-hidden">
                      <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                        <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                          {Object.entries(product.specifications).map(([key, value]) => (
                            <tr key={key}>
                              <td className="px-4 py-2 text-sm font-medium text-gray-900 dark:text-white capitalize">
                                {key.replace(/([A-Z])/g, " $1").trim()}
                              </td>
                              <td className="px-4 py-2 text-sm text-gray-600 dark:text-gray-300">{value}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  ) : (
                    <p className="text-sm text-gray-500 dark:text-gray-400 italic">
                      Detailed specifications not available for this product.
                    </p>
                  )}

                  {product.tags && product.tags.length > 0 && (
                    <div className="mt-4">
                      <h4 className="text-xs font-medium uppercase text-gray-500 dark:text-gray-400 mb-2">Tags:</h4>
                      <div className="flex flex-wrap gap-2">
                        {product.tags.map((tag, idx) => (
                          <span
                            key={idx}
                            className="inline-flex items-center px-2 py-1 rounded-md text-xs bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300"
                          >
                            <Tag size={12} className="mr-1" />
                            {tag}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {selectedTab === "shipping" && (
                <div className="space-y-4">
                  <div className="flex items-start">
                    <Truck className="w-5 h-5 text-blue-600 dark:text-blue-400 mt-0.5 mr-3 flex-shrink-0" />
                    <div>
                      <h4 className="text-sm font-medium text-gray-900 dark:text-white">Free Shipping</h4>
                      <p className="text-xs text-gray-600 dark:text-gray-300">
                        On orders over $50. Delivery within 3-5 business days.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start">
                    <RefreshCw className="w-5 h-5 text-blue-600 dark:text-blue-400 mt-0.5 mr-3 flex-shrink-0" />
                    <div>
                      <h4 className="text-sm font-medium text-gray-900 dark:text-white">Easy Returns</h4>
                      <p className="text-xs text-gray-600 dark:text-gray-300">
                        30-day money back guarantee. Return shipping is free.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start">
                    <Shield className="w-5 h-5 text-blue-600 dark:text-blue-400 mt-0.5 mr-3 flex-shrink-0" />
                    <div>
                      <h4 className="text-sm font-medium text-gray-900 dark:text-white">Warranty</h4>
                      <p className="text-xs text-gray-600 dark:text-gray-300">
                        All products come with a 1-year limited warranty.
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>

            <div className="flex flex-col sm:flex-row items-center gap-3 sm:gap-4 mb-4 sm:mb-6 bg-gray-50 dark:bg-gray-700/50 p-3 sm:p-4 rounded-xl">
              <div className="w-full sm:w-auto">
                <label className="block text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 sm:mb-2">
                  Quantity
                </label>
                <div className="flex items-center border border-gray-300 dark:border-gray-600 rounded-lg overflow-hidden">
                  <button
                    onClick={decrementQuantity}
                    className="px-2 sm:px-3 py-2 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                    disabled={product.stock <= 0}
                    aria-label="Decrease quantity"
                  >
                    <Minus size={14} />
                  </button>
                  <span className="w-8 sm:w-10 text-center py-2 font-medium text-gray-900 dark:text-white">
                    {quantity}
                  </span>
                  <button
                    onClick={incrementQuantity}
                    className="px-2 sm:px-3 py-2 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                    disabled={product.stock <= 0 || quantity >= product.stock}
                    aria-label="Increase quantity"
                  >
                    <Plus size={14} />
                  </button>
                </div>
              </div>

              <div className="w-full sm:w-auto">
                <label className="block text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 sm:mb-2">
                  Availability
                </label>
                {getStatusLabel()}
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 mt-auto">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => onAddToCart(product, quantity)}
                className="flex-1 flex items-center justify-center px-4 sm:px-6 py-2 sm:py-3 border border-transparent rounded-lg shadow-sm text-sm sm:text-base font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={product.stock <= 0}
              >
                <ShoppingCart size={16} className="mr-1 sm:mr-2" />
                Add to Cart
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => onBuyNow(product, quantity)}
                className="flex-1 flex items-center justify-center px-4 sm:px-6 py-2 sm:py-3 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm text-sm sm:text-base font-medium text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={product.stock <= 0}
              >
                Buy Now
              </motion.button>
            </div>
          </div>
        </div>
      </motion.div>
    </motion.div>
  )
}

// Newsletter Popup Component
const NewsletterPopup = ({ isOpen, onClose }) => {
  const dispatch = useDispatch()
  const { subscribeLoading, subscribeError, subscribeSuccess } = useSelector((state) => state.newsletter)
  const [email, setEmail] = useState("")
  const [isClosing, setIsClosing] = useState(false)
  const modalRef = useRef(null)
  const { darkMode } = useSelector((state) => state.ui)

  // Lock body scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      // Save current scroll position
      const scrollY = window.scrollY
      // Add styles to body to prevent scrolling
      document.body.style.position = "fixed"
      document.body.style.top = `-${scrollY}px`
      document.body.style.width = "100%"
    } else {
      // Restore scroll position when modal closes
      const scrollY = document.body.style.top
      document.body.style.position = ""
      document.body.style.top = ""
      document.body.style.width = ""
      window.scrollTo(0, Number.parseInt(scrollY || "0") * -1)
    }

    return () => {
      // Clean up in case component unmounts while modal is open
      document.body.style.position = ""
      document.body.style.top = ""
      document.body.style.width = ""
    }
  }, [isOpen])

  useEffect(() => {
    // Clear error and success messages when component unmounts
    return () => {
      dispatch(clearError())
      dispatch(clearSuccess())
    }
  }, [dispatch])

  // Handle click outside to close
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (modalRef.current && !modalRef.current.contains(event.target)) {
        handleClose()
      }
    }

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside)
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
    }
  }, [isOpen])

  // Handle escape key to close
  useEffect(() => {
    const handleEscKey = (e) => {
      if (e.key === "Escape") {
        handleClose()
      }
    }

    if (isOpen) {
      document.addEventListener("keydown", handleEscKey)
    }

    return () => {
      document.removeEventListener("keydown", handleEscKey)
    }
  }, [isOpen])

  const handleClose = () => {
    setIsClosing(true)
    setTimeout(() => {
      onClose()
      setIsClosing(false)
    }, 300)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!email) return

    try {
      await dispatch(
        subscribeToNewsletter({
          email,
          source: "popup",
          preferences: ["marketing", "updates"],
        }),
      ).unwrap()
      setEmail("")
      if (subscribeSuccess) {
        setTimeout(() => {
          handleClose()
        }, 2000)
      }
    } catch (err) {
      // Error is handled by the slice
    }
  }

  if (!isOpen) return null

  return (
    <motion.div
      className="fixed inset-0 bg-black bg-opacity-0 flex items-center justify-center z-50 overflow-hidden"
      initial={{ backgroundColor: "rgba(0, 0, 0, 0)" }}
      animate={{
        backgroundColor: isClosing ? "rgba(0, 0, 0, 0)" : "rgba(0, 0, 0, 0.75)",
        backdropFilter: isClosing ? "blur(0px)" : "blur(5px)",
      }}
      transition={{ duration: 0.3 }}
    >
      <motion.div
        ref={modalRef}
        className={`${darkMode ? "bg-gray-800" : "bg-white"} p-0 rounded-2xl shadow-2xl max-w-md w-full mx-4 overflow-hidden max-h-[90vh] flex flex-col`}
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{
          opacity: isClosing ? 0 : 1,
          scale: isClosing ? 0.9 : 1,
          y: isClosing ? 20 : 0,
        }}
        transition={{
          type: "spring",
          damping: 25,
          stiffness: 300,
          duration: 0.3,
        }}
      >
        <div className={`${darkMode ? "bg-blue-900" : "bg-blue-600"} p-6 relative`}>
          <button
            onClick={handleClose}
            className="absolute top-4 right-4 text-white/80 hover:text-white p-1 rounded-full hover:bg-white/10 transition-colors"
            aria-label="Close newsletter popup"
          >
            <X size={20} />
          </button>

          <div className="w-16 h-16 bg-white/10 backdrop-blur-md rounded-full flex items-center justify-center mb-4">
            <Mail className="h-8 w-8 text-white" />
          </div>

          <h2 className="text-2xl font-bold text-white mb-2">Stay Updated</h2>
          <p className="text-blue-100 text-sm">Join our newsletter for exclusive deals and tech tips</p>
        </div>

        <div className="p-6 overflow-y-auto">
          {subscribeError && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 rounded mb-4"
            >
              <div className="flex">
                <div className="flex-shrink-0">
                  <AlertCircle className="h-5 w-5 text-red-500" />
                </div>
                <div className="ml-3">
                  <p className="text-sm">{subscribeError}</p>
                </div>
              </div>
            </motion.div>
          )}

          {subscribeSuccess && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-green-100 border-l-4 border-green-500 text-green-700 p-4 rounded mb-4"
            >
              <div className="flex">
                <div className="flex-shrink-0">
                  <Check className="h-5 w-5 text-green-500" />
                </div>
                <div className="ml-3">
                  <p className="text-sm">
                    Thank you for subscribing! Please check your email to confirm your subscription.
                  </p>
                </div>
              </div>
            </motion.div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label
                htmlFor="email"
                className={`block text-sm font-medium ${darkMode ? "text-gray-300" : "text-gray-700"} mb-1`}
              >
                Email Address
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Mail size={16} className={`${darkMode ? "text-gray-500" : "text-gray-400"}`} />
                </div>
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  className={`w-full pl-10 pr-4 py-3 border rounded-lg ${darkMode
                    ? "bg-gray-700 border-gray-600 text-white placeholder-gray-400 focus:ring-blue-500 focus:border-blue-500"
                    : "bg-white border-gray-300 text-gray-900 placeholder-gray-400 focus:ring-blue-500 focus:border-blue-500"
                    }`}
                  required
                  disabled={subscribeLoading}
                />
              </div>
            </div>

            <div className="flex items-start">
              <div className="flex items-center h-5">
                <input
                  id="terms"
                  type="checkbox"
                  className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                  required
                />
              </div>
              <div className="ml-3 text-sm">
                <label htmlFor="terms" className={`${darkMode ? "text-gray-300" : "text-gray-700"}`}>
                  I agree to receive marketing emails and accept the{" "}
                  <a href="#" className="text-blue-600 hover:underline">
                    Privacy Policy
                  </a>
                </label>
              </div>
            </div>

            <div className="flex justify-end gap-2">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                type="button"
                onClick={handleClose}
                className={`px-4 py-2 text-sm font-medium rounded-lg ${darkMode ? "text-gray-300 hover:bg-gray-700" : "text-gray-700 hover:bg-gray-100"
                  } transition-colors`}
                disabled={subscribeLoading}
              >
                Maybe Later
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                type="submit"
                className="px-4 py-2 text-sm font-medium bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors shadow-sm"
                disabled={subscribeLoading}
              >
                {subscribeLoading ? (
                  <div className="flex items-center">
                    <svg
                      className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      ></circle>
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      ></path>
                    </svg>
                    Subscribing...
                  </div>
                ) : (
                  "Subscribe Now"
                )}
              </motion.button>
            </div>
          </form>

          <div className="mt-4 text-center">
            <p className={`text-xs ${darkMode ? "text-gray-400" : "text-gray-500"}`}>
              We respect your privacy. Unsubscribe at any time.
            </p>
          </div>
        </div>
      </motion.div>
    </motion.div>
  )
}

// Enhanced CyberCafeLandingPage Component
const CyberCafeLandingPage = () => {
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const { user } = useSelector((state) => state.auth)
  const { darkMode } = useSelector((state) => state.ui)
  const systemPrefersDark = useThemeDetector() // Add this line to use the hook

  // Redux state
  const {
    products: productsData,
    featuredProducts,
    newArrivals,
    saleProducts,
    loading: productsLoading,
    error: productsError,
    filters,
  } = useSelector((state) => state.products)

  const {
    categories: categoriesData,
    featuredCategories = [],
    loading: categoriesLoading,
    error: categoriesError,
  } = useSelector((state) => state.categories)

  const {
    specialOffers: specialOffersData,
    loading: offersLoading,
    error: offersError,
  } = useSelector((state) => state.specialOffers)

  const {
    heroSlides: heroSlidesData,
    loading: slidesLoading,
    error: slidesError,
  } = useSelector((state) => state.heroSlides)

  const { items: cartItems } = useSelector((state) => state.cart)

  // Use the hook to get data with fallback
  const heroSlides = useDataWithFallback(heroSlidesData, fallbackHeroSlides, slidesLoading, slidesError)
  const categories = useDataWithFallback(categoriesData, fallbackCategories, categoriesLoading, categoriesError)
  const products = useDataWithFallback(productsData, fallbackProducts, productsLoading, productsError)
  const specialOffers = useDataWithFallback(specialOffersData, fallbackSpecialOffers, offersLoading, offersError)

  // Rotate loading content every 3 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      setLoadingContentIndex((prevIndex) => {
        const nextIndex = (prevIndex + 1) % funLoadingContent.length
        setCurrentLoadingContent(funLoadingContent[nextIndex])
        return nextIndex
      })
    }, 3000)

    return () => clearInterval(interval)
  }, [])

  // Fetch cart when user is authenticated
  useEffect(() => {
    if (user) {
      dispatch(fetchCart())
    }
  }, [user, dispatch])

  // Add this after the Redux state declarations

  // Use fallback data when server data is empty
  const effectiveHeroSlides = useDataWithFallback(heroSlidesData, fallbackHeroSlides, slidesLoading, slidesError)
  const effectiveCategories = useDataWithFallback(categoriesData, fallbackCategories, categoriesLoading, categoriesError)
  const allProducts = useDataWithFallback(productsData?.products || productsData, fallbackProducts, productsLoading, productsError)
  const effectiveSpecialOffers = useDataWithFallback(specialOffersData, fallbackSpecialOffers, offersLoading, offersError)


  // Local state
  const [isInitialLoading, setIsInitialLoading] = useState(true)
  const [loadingProgress, setLoadingProgress] = useState(0)
  const [statusMessages, setStatusMessages] = useState([])
  const [retryCount, setRetryCount] = useState(0)
  const [hasError, setHasError] = useState(false)
  const [errorDetails, setErrorDetails] = useState(null)
  const [currentSlide, setCurrentSlide] = useState(0)
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [isSearchFocused, setIsSearchFocused] = useState(false)
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false)
  const [selectedCategory, setSelectedCategory] = useState("All")
  const [showCategoryView, setShowCategoryView] = useState(false)
  const [currentLoadingContent, setCurrentLoadingContent] = useState(funLoadingContent[0])
  const [loadingContentIndex, setLoadingContentIndex] = useState(0)
  const [selectedSort, setSelectedSort] = useState("featured")
  const [quickViewProduct, setQuickViewProduct] = useState(null)
  const [isQuickViewOpen, setIsQuickViewOpen] = useState(false)
  const [isNewsletterOpen, setIsNewsletterOpen] = useState(false)
  const [showScrollTop, setShowScrollTop] = useState(false)
  const [sectionLoadingStates, setSectionLoadingStates] = useState({
    hero: true,
    categories: true,
    products: true,
    offers: true,
  })
  const [areFiltersShown, setAreFiltersShown] = useState(false)

  // Refs for intersection observer
  const [heroRef, heroVisible] = useIntersectionObserver({ threshold: 0.1 })
  const [categoriesRef, categoriesVisible] = useIntersectionObserver({
    threshold: 0.1,
  })

  // Filter products based on selected category (ensure `selectedCategory` is defined first)
  const effectiveProducts = useMemo(() => {
    if (!Array.isArray(allProducts)) return []

    if (selectedCategory === "All") {
      return allProducts
    }

    return allProducts.filter(product => {
      const categoryName = product.category?.name || product.categoryName
      return categoryName === selectedCategory
    })
  }, [allProducts, selectedCategory])
  const [productsRef, productsVisible] = useIntersectionObserver({
    threshold: 0.1,
  })
  const [specialOffersRef, specialOffersVisible] = useIntersectionObserver({
    threshold: 0.1,
  })
  const [ctaRef, ctaVisible] = useIntersectionObserver({ threshold: 0.1 })

  // Add a status message
  const addStatusMessage = useCallback((message) => {
    const id = Date.now()
    setStatusMessages((prev) => [...prev, { id, ...message }])
    return id
  }, [])

  // Remove a status message
  const removeStatusMessage = useCallback((id) => {
    setStatusMessages((prev) => prev.filter((msg) => msg.id !== id))
  }, [])

  // Fetch all necessary data
  const fetchAllData = useCallback(async () => {
    setLoadingProgress(10)

    try {
      // Fetch data in parallel
      const promises = [
        dispatch(fetchProducts({})).unwrap(), // Fetch all products without filters
        dispatch(fetchFeaturedProducts()).unwrap(),
        dispatch(fetchNewArrivals()).unwrap(),
        dispatch(fetchSaleProducts()).unwrap(),
        dispatch(fetchCategories()).unwrap(),
        dispatch(fetchFeaturedCategories()).unwrap(),
        dispatch(fetchSpecialOffers()).unwrap(),
        dispatch(fetchHeroSlides()).unwrap(),

      ]

      // Update progress as promises resolve
      let completedPromises = 0
      const totalPromises = promises.length

      const progressInterval = setInterval(() => {
        setLoadingProgress((prev) => {
          if (prev >= 90) return prev
          return prev + 1
        })
      }, 200)

      // Wait for all promises to resolve
      await Promise.all(
        promises.map((promise) =>
          promise
            .then(() => {
              completedPromises++
              setLoadingProgress(10 + Math.floor((completedPromises / totalPromises) * 80))
            })
            .catch((error) => {
              throw error
            }),
        ),
      )

      clearInterval(progressInterval)
      setLoadingProgress(100)

      // Show success message if not initial load
      if (!isInitialLoading) {
        addStatusMessage({
          type: "success",
          title: "Content Updated",
          message: "All content has been refreshed successfully.",
          duration: 3,
        })
      }

      setHasError(false)
      setErrorDetails(null)
    } catch (error) {
      console.error("Error fetching data:", error)
      setHasError(true)
      setErrorDetails(error)

      // Show error message if not initial load
      if (!isInitialLoading) {
        addStatusMessage({
          type: "error",
          title: "Update Failed",
          message: "Failed to refresh content. Please try again.",
          duration: 5,
          actions: [
            {
              text: "Retry",
              primary: true,
              icon: <RefreshCw size={14} />,
              onClick: handleRefresh,
            },
          ],
        })
      }
    } finally {
      // Set section loading states to false
      setSectionLoadingStates({
        hero: false,
        categories: false,
        products: false,
        offers: false,
      })

      // Set initial loading to false after first load
      setIsInitialLoading(false)
    }
  }, [dispatch, filters, isInitialLoading, addStatusMessage])

  // Initial data fetch
  useEffect(() => {
    fetchAllData()
  }, [fetchAllData])

  // Handle refresh
  const handleRefresh = useCallback(() => {
    setRetryCount((prev) => prev + 1)

    // Reset section loading states
    setSectionLoadingStates({
      hero: true,
      categories: true,
      products: true,
      offers: true,
    })

    // Add status message
    addStatusMessage({
      type: "info",
      title: "Refreshing Content",
      message: "Please wait while we update the page...",
      duration: 2,
    })

    // Fetch data
    fetchAllData()
  }, [fetchAllData, addStatusMessage])

  // Auto-cycle through hero slides
  useEffect(() => {
    if (!effectiveHeroSlides || effectiveHeroSlides.length <= 1) return

    const interval = setInterval(() => {
      setCurrentSlide((prevSlide) => (prevSlide === effectiveHeroSlides.length - 1 ? 0 : prevSlide + 1))
    }, 5000)

    return () => clearInterval(interval)
  }, [effectiveHeroSlides])

  // Show newsletter popup after 5 seconds
  useEffect(() => {
    const timer = setTimeout(() => {
      // Check if user hasn't seen it yet
      const hasSeenNewsletter = localStorage.getItem("hasSeenNewsletter")
      if (!hasSeenNewsletter) {
        setIsNewsletterOpen(true)
        localStorage.setItem("hasSeenNewsletter", "true")
      }
    }, 5000)

    return () => clearTimeout(timer)
  }, [])

  // Handle scroll events
  useEffect(() => {
    const handleScroll = () => {
      setShowScrollTop(window.scrollY > 300)
    }

    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  // Initialize theme based on user preference or system preference
  useEffect(() => {
    // If user hasn't set a preference, use system preference
    const savedDarkMode = localStorage.getItem("darkMode")
    if (savedDarkMode === null && systemPrefersDark !== darkMode) {
      dispatch(toggleDarkMode())
    }
  }, [systemPrefersDark, darkMode, dispatch])

  // Navigation functions
  const nextSlide = () => {
    setCurrentSlide((prevSlide) => (prevSlide === effectiveHeroSlides.length - 1 ? 0 : prevSlide + 1))
  }

  const prevSlide = () => {
    setCurrentSlide((prevSlide) => (prevSlide === 0 ? effectiveHeroSlides.length - 1 : prevSlide - 1))
  }

  const handleSearch = (e) => {
    e.preventDefault()
    // Scroll to products section
    document.getElementById("featured-products").scrollIntoView({ behavior: "smooth" })
  }

  // Cart and checkout functions
  const handleAddToCart = (product, quantity = 1) => {
    // Check if user is authenticated
    if (!user) {
      addStatusMessage({
        type: "error",
        message: "Please login to add items to cart",
        duration: 5000
      })
      dispatch(openAuthModal("login"))
      return
    }

    // Add the product to cart with correct API format
    dispatch(addToCart({
      productId: product._id,
      quantity: quantity
    })).then(() => {
      // Show feedback via status message
      addStatusMessage({
        type: "success",
        message: `${product.name} added to cart!`,
        duration: 3000
      })
    }).catch((error) => {
      // Show error message
      addStatusMessage({
        type: "error",
        message: error.message || "Failed to add item to cart",
        duration: 5000
      })
    })

    // Legacy status message (keeping for compatibility)
    addStatusMessage({
      type: "success",
      title: "Added to Cart",
      message: `${product.name} has been added to your cart.`,
      duration: 3,
      actions: [
        {
          text: "View Cart",
          primary: true,
          onClick: () => setIsCheckoutOpen(true),
        },
      ],
    })
  }

  const handleBuyNow = (product, quantity = 1) => {
    if (!user) {
      dispatch(openAuthModal("login"))
      return
    }

    // Add to cart and open checkout
    handleAddToCart(product, quantity)
    setIsCheckoutOpen(true)
  }

  const handleQuickView = (product) => {
    setQuickViewProduct(product)
    setIsQuickViewOpen(true)
  }

  // Theme toggle function
  const handleToggleTheme = () => {
    dispatch(toggleDarkMode())
    localStorage.setItem("darkMode", !darkMode ? "true" : "false")
  }

  // Scroll to top function
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" })
  }

  // Handle filter changes
  const handleFilterChange = (newFilters) => {
    dispatch(setFilters(newFilters))

    // Show loading state for products section
    setSectionLoadingStates((prev) => ({
      ...prev,
      products: true,
    }))

    // Add status message
    addStatusMessage({
      type: "info",
      title: "Filters Applied",
      message: "Updating product list...",
      duration: 2,
    })
  }

  // If initial loading, show loading screen
  if (isInitialLoading) {
    return <LoadingScreen message="Loading VoxCyber..." />
  }

  // If there's an error during initial load, show error fallback
  if (hasError && errorDetails) {
    return (
      <ErrorFallback
        error={errorDetails}
        resetErrorBoundary={handleRefresh}
        onHome={() => navigate("/")}
        onSupport={() => window.open("/support", "_blank")}
      />
    )
  }

  return (
    <div
      className={`min-h-screen ${darkMode ? "dark bg-gray-900 text-white" : "bg-gray-50 text-gray-900"
        } overflow-x-hidden transition-colors duration-300`}
    >
      {/* Status Messages */}
      <div className="fixed top-4 right-4 z-50 flex flex-col gap-2 max-w-md">
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
      <CheckoutModal isOpen={isCheckoutOpen} onClose={() => setIsCheckoutOpen(false)} />
      <QuickViewModal
        product={quickViewProduct}
        isOpen={isQuickViewOpen}
        onClose={() => setIsQuickViewOpen(false)}
        onAddToCart={handleAddToCart}
        onBuyNow={handleBuyNow}
      />
      <NewsletterPopup isOpen={isNewsletterOpen} onClose={() => setIsNewsletterOpen(false)} />

      {/* Top Bar - Announcements & Quick Links */}
      <div className="bg-blue-900 text-white py-2 px-4">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row justify-between items-center">
          <p className="text-sm font-medium text-center sm:text-left mb-2 sm:mb-0">
            🔥 Special Promotion: Get 15% off all electronics with code: <span className="font-bold">CYBER15</span>
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
            <button onClick={handleToggleTheme} className="hover:underline flex items-center">
              {darkMode ? <Sun size={14} className="mr-1" /> : <Moon size={14} className="mr-1" />}
              {darkMode ? "Light Mode" : "Dark Mode"}
            </button>
          </div>
        </div>
      </div>

      {/* Header and Navigation */}
      <header
        className={`sticky top-0 z-40 ${darkMode ? "bg-gray-800" : "bg-white"
          } shadow-md transition-colors duration-300`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="flex justify-between items-center py-4">
            {/* Logo */}
            <div className="flex items-center">
              <Link to="/" className="flex items-center">
                <Coffee size={28} className={`${darkMode ? "text-blue-400" : "text-blue-700"} mr-2`} />
                <span className={`font-bold text-2xl ${darkMode ? "text-white" : "text-blue-900"}`}>
                  Vox
                  <span className={darkMode ? "text-blue-400" : "text-blue-600"}>Cyber</span>
                </span>
              </Link>
            </div>

            {/* Search Bar */}
            <div
              className={`hidden md:block relative flex-1 mx-10 max-w-2xl transition-all ${isSearchFocused ? "scale-105" : ""
                }`}
            >
              <form onSubmit={handleSearch} className="relative">
                <input
                  type="text"
                  placeholder="Search for products, categories, brands..."
                  className={`w-full py-2 pl-10 pr-4 rounded-full border-2 ${darkMode
                    ? "border-gray-600 bg-gray-700 text-white focus:border-blue-500"
                    : "border-gray-200 bg-white text-gray-900 focus:border-blue-500"
                    } focus:outline-none transition-all`}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onFocus={() => setIsSearchFocused(true)}
                  onBlur={() => setIsSearchFocused(false)}
                  aria-label="Search"
                />
                <Search className="absolute left-3 top-2.5 text-gray-400" size={20} />
                <button
                  type="submit"
                  className="absolute right-2 top-1 bg-blue-600 text-white p-1.5 rounded-full hover:bg-blue-700 transition-colors"
                  aria-label="Submit search"
                >
                  <Search size={16} />
                </button>
              </form>
            </div>

            {/* Desktop Navigation Links */}
            <nav className="hidden lg:flex items-center space-x-8">
              <Link
                to="/shop"
                className={`text-sm font-medium ${darkMode ? "text-gray-300 hover:text-blue-400" : "text-gray-700 hover:text-blue-600"
                  } transition-colors`}
              >
                Shop
              </Link>
              <Link
                to="/services"
                className={`text-sm font-medium ${darkMode ? "text-gray-300 hover:text-blue-400" : "text-gray-700 hover:text-blue-600"
                  } transition-colors`}
              >
                Services
              </Link>
              <Link
                to="/websites"
                className={`text-sm font-medium ${darkMode ? "text-gray-300 hover:text-blue-400" : "text-gray-700 hover:text-blue-600"
                  } transition-colors`}
              >
                Websites
              </Link>

              {/* Show Admin link if user is admin */}
              {(user?.role === "admin" || user?.role === "super_admin") && (
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
                className={`relative p-2 ${darkMode ? "text-gray-300 hover:text-blue-400" : "text-gray-700 hover:text-blue-600"
                  } transition-colors`}
                aria-label="Wishlist"
              >
                <Heart size={24} />
                <span className="absolute -top-1 -right-1 bg-blue-600 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                  3
                </span>
              </button>
              <button
                className={`relative p-2 ${darkMode ? "text-gray-300 hover:text-blue-400" : "text-gray-700 hover:text-blue-600"
                  } transition-colors`}
                onClick={() => setIsCheckoutOpen(true)}
                aria-label="Cart"
              >
                <ShoppingCart size={24} />
                {cartItems && cartItems.length > 0 && (
                  <span className="absolute -top-1 -right-1 bg-blue-600 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                    {cartItems.length}
                  </span>
                )}
              </button>

              {/* Auth Buttons / User Menu */}
              <div className="hidden md:block">
                {user ? (
                  <div className="relative group">
                    <button
                      className={`flex items-center space-x-1 ${darkMode ? "text-white hover:text-blue-400" : "text-gray-900 hover:text-blue-600"
                        }`}
                    >
                      <span className="font-medium text-sm">{user.name}</span>
                      <ChevronDown size={16} />
                    </button>
                    <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 rounded-md shadow-lg py-1 z-10 hidden group-hover:block">
                      <Link
                        to="/account"
                        className="block px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                      >
                        My Account
                      </Link>
                      <Link
                        to="/orders"
                        className="block px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                      >
                        Orders
                      </Link>
                      <button
                        className="block w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                        onClick={() => {
                          // Handle logout
                        }}
                      >
                        Logout
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="flex space-x-2">
                    <button
                      onClick={() => dispatch(openAuthModal("login"))}
                      className="px-3 py-1 text-sm font-medium text-blue-600 dark:text-blue-400 border border-blue-600 dark:border-blue-400 rounded-md hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors"
                    >
                      Login
                    </button>
                    <button
                      onClick={() => dispatch(openAuthModal("register"))}
                      className="px-3 py-1 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 transition-colors"
                    >
                      Register
                    </button>
                  </div>
                )}
              </div>

              {/* Mobile Menu Button */}
              <button
                className={`lg:hidden p-2 ${darkMode ? "text-gray-300" : "text-gray-700"}`}
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                aria-label={isMenuOpen ? "Close menu" : "Open menu"}
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
                className={`w-full py-2 pl-10 pr-4 rounded-full border-2 ${darkMode ? "border-gray-600 bg-gray-700 text-white" : "border-gray-200 bg-white text-gray-900"
                  } focus:border-blue-500 focus:outline-none`}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                aria-label="Search"
              />
              <Search className="absolute left-3 top-2.5 text-gray-400" size={20} />
              <button
                type="submit"
                className="absolute right-2 top-1 bg-blue-600 text-white p-1.5 rounded-full hover:bg-blue-700 transition-colors"
                aria-label="Submit search"
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
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.3 }}
              className={`lg:hidden ${darkMode ? "bg-gray-800" : "bg-white"
                } absolute w-full shadow-lg z-50 overflow-hidden`}
            >
              <div className="p-4 space-y-3">
                <Link
                  to="/shop"
                  className={`block py-2 px-4 ${darkMode
                    ? "text-gray-300 hover:bg-gray-700 hover:text-blue-400"
                    : "text-gray-700 hover:bg-blue-50 hover:text-blue-600"
                    } rounded-lg`}
                  onClick={() => setIsMenuOpen(false)}
                >
                  Shop
                </Link>
                <Link
                  to="/services"
                  className={`block py-2 px-4 ${darkMode
                    ? "text-gray-300 hover:bg-gray-700 hover:text-blue-400"
                    : "text-gray-700 hover:bg-blue-50 hover:text-blue-600"
                    } rounded-lg`}
                  onClick={() => setIsMenuOpen(false)}
                >
                  Services
                </Link>
                <Link
                  to="/websites"
                  className={`block py-2 px-4 ${darkMode
                    ? "text-gray-300 hover:bg-gray-700 hover:text-blue-400"
                    : "text-gray-700 hover:bg-blue-50 hover:text-blue-600"
                    } rounded-lg`}
                  onClick={() => setIsMenuOpen(false)}
                >
                  Websites
                </Link>

                {/* Show Admin link if user is admin */}
                {(user?.role === "admin" || user?.role === "super_admin") && (
                  <Link
                    to="/admin"
                    className="block py-2 px-4 text-white bg-blue-600 hover:bg-blue-700 rounded-lg"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Admin Dashboard
                  </Link>
                )}

                <div className={`border-t pt-4 mt-4 ${darkMode ? "border-gray-700" : "border-gray-200"}`}>
                  {!user ? (
                    <>
                      <button
                        onClick={() => {
                          dispatch(openAuthModal("login"))
                          setIsMenuOpen(false)
                        }}
                        className={`block w-full text-left py-2 px-4 ${darkMode
                          ? "text-gray-300 hover:bg-gray-700 hover:text-blue-400"
                          : "text-gray-700 hover:bg-blue-50 hover:text-blue-600"
                          } rounded-lg`}
                      >
                        Login
                      </button>
                      <button
                        onClick={() => {
                          dispatch(openAuthModal("register"))
                          setIsMenuOpen(false)
                        }}
                        className={`block w-full text-left py-2 px-4 ${darkMode
                          ? "text-gray-300 hover:bg-gray-700 hover:text-blue-400"
                          : "text-gray-700 hover:bg-blue-50 hover:text-blue-600"
                          } rounded-lg`}
                      >
                        Register
                      </button>
                    </>
                  ) : (
                    <div className="px-4 py-2">
                      <p className={`font-medium ${darkMode ? "text-white" : "text-gray-900"}`}>
                        Logged in as: {user.name}
                      </p>
                      <p className={`text-sm ${darkMode ? "text-gray-400" : "text-gray-500"}`}>{user.email}</p>
                      <div className="mt-2 space-y-1">
                        <Link
                          to="/account"
                          className={`block py-1 px-2 text-sm ${darkMode
                            ? "text-gray-300 hover:bg-gray-700 hover:text-blue-400"
                            : "text-gray-700 hover:bg-blue-50 hover:text-blue-600"
                            } rounded`}
                          onClick={() => setIsMenuOpen(false)}
                        >
                          My Account
                        </Link>
                        <Link
                          to="/orders"
                          className={`block py-1 px-2 text-sm ${darkMode
                            ? "text-gray-300 hover:bg-gray-700 hover:text-blue-400"
                            : "text-gray-700 hover:bg-blue-50 hover:text-blue-600"
                            } rounded`}
                          onClick={() => setIsMenuOpen(false)}
                        >
                          Orders
                        </Link>
                        <button
                          className={`block w-full text-left py-1 px-2 text-sm ${darkMode
                            ? "text-gray-300 hover:bg-gray-700 hover:text-blue-400"
                            : "text-gray-700 hover:bg-blue-50 hover:text-blue-600"
                            } rounded`}
                          onClick={() => {
                            // Handle logout
                            setIsMenuOpen(false)
                          }}
                        >
                          Logout
                        </button>
                      </div>
                    </div>
                  )}
                  <a
                    href="#"
                    className={`block py-2 px-4 ${darkMode
                      ? "text-gray-300 hover:bg-gray-700 hover:text-blue-400"
                      : "text-gray-700 hover:bg-blue-50 hover:text-blue-600"
                      } rounded-lg`}
                  >
                    Track Order
                  </a>
                  <a
                    href="#"
                    className={`block py-2 px-4 ${darkMode
                      ? "text-gray-300 hover:bg-gray-700 hover:text-blue-400"
                      : "text-gray-700 hover:bg-blue-50 hover:text-blue-600"
                      } rounded-lg`}
                  >
                    Customer Support
                  </a>
                  <button
                    onClick={handleToggleTheme}
                    className={`flex items-center w-full py-2 px-4 ${darkMode
                      ? "text-gray-300 hover:bg-gray-700 hover:text-blue-400"
                      : "text-gray-700 hover:bg-blue-50 hover:text-blue-600"
                      } rounded-lg`}
                  >
                    {darkMode ? <Sun size={18} className="mr-2" /> : <Moon size={18} className="mr-2" />}
                    Switch to {darkMode ? "Light" : "Dark"} Mode
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
          {sectionLoadingStates.hero ? (
            <div className="flex items-center justify-center h-[500px] bg-gray-100 dark:bg-gray-800">
              <div className="text-center">
                <div className="inline-block animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600 dark:border-blue-400 mb-4"></div>
                <p className="text-gray-600 dark:text-gray-300">Loading hero content...</p>
              </div>
            </div>
          ) : slidesError ? (
            <div className="py-12">
              <ErrorFallback
                error={slidesError}
                resetErrorBoundary={() => {
                  setSectionLoadingStates((prev) => ({ ...prev, hero: true }))
                  dispatch(fetchHeroSlides())
                }}
              />
            </div>
          ) : (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: heroVisible ? 1 : 0 }}
              transition={{ duration: 0.5 }}
              className="relative h-[400px] sm:h-[500px] md:h-[600px] overflow-hidden"
            >
              {Array.isArray(effectiveHeroSlides) && effectiveHeroSlides.length > 0 ? (
                <>
                  {effectiveHeroSlides.map((slide, index) => (
                    <div
                      key={slide._id}
                      className={`absolute inset-0 flex items-center transition-opacity duration-1000 ease-in-out ${index === currentSlide ? "opacity-100" : "opacity-0"
                        }`}
                      aria-hidden={index !== currentSlide}
                    >
                      <div className={`absolute inset-0 ${slide.backgroundColor || "bg-black"} bg-opacity-80`}></div>
                      <div className="absolute inset-0 bg-gradient-to-r from-blue-900 to-transparent opacity-70"></div>
                      <img
                        src={slide.image || "/placeholder.svg"}
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
                          <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{
                              opacity: index === currentSlide ? 1 : 0,
                              y: index === currentSlide ? 0 : 20,
                            }}
                            transition={{ duration: 0.5, delay: 0.4 }}
                          >
                            <button className="mt-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors shadow-md">
                              Shop Now
                            </button>
                          </motion.div>
                        </div>
                      </div>
                    </div>
                  ))}

                  {/* Navigation Arrows */}
                  <button
                    onClick={prevSlide}
                    className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-white/20 backdrop-blur-sm hover:bg-white/30 text-white p-2 rounded-full z-10 transition-colors"
                    aria-label="Previous slide"
                  >
                    <ChevronLeft size={24} />
                  </button>
                  <button
                    onClick={nextSlide}
                    className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-white/20 backdrop-blur-sm hover:bg-white/30 text-white p-2 rounded-full z-10 transition-colors"
                    aria-label="Next slide"
                  >
                    <ChevronLeft size={24} className="transform rotate-180" />
                  </button>

                  {/* Slide Indicators */}
                  <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-2 z-10">
                    {effectiveHeroSlides.map((_, index) => (
                      <button
                        key={index}
                        onClick={() => setCurrentSlide(index)}
                        className={`w-2.5 h-2.5 rounded-full transition-colors ${index === currentSlide ? "bg-white" : "bg-white/50 hover:bg-white/70"
                          }`}
                        aria-label={`Go to slide ${index + 1}`}
                        aria-current={index === currentSlide}
                      ></button>
                    ))}
                  </div>
                </>
              ) : (
                <div className="absolute inset-0 flex items-center justify-center">
                  <p className="text-white text-xl">No slides available</p>
                </div>
              )}
            </motion.div>
          )}
        </section>

        {/* Services Bar */}
        <section
          className={`py-6 ${darkMode ? "bg-gray-800" : "bg-white"} border-b ${darkMode ? "border-gray-700" : "border-gray-200"
            }`}
        >
          <div className="max-w-7xl mx-auto px-4 sm:px-6">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {services.slice(0, 4).map((service) => (
                <div key={service.id} className="flex items-center justify-center md:justify-start">
                  <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center ${darkMode ? "bg-blue-900/50 text-blue-400" : "bg-blue-100 text-blue-600"
                      } mr-3`}
                  >
                    {service.icon}
                  </div>
                  <div>
                    <h3 className={`text-sm font-medium ${darkMode ? "text-white" : "text-gray-900"}`}>
                      {service.title}
                    </h3>
                    <p className={`text-xs ${darkMode ? "text-gray-400" : "text-gray-500"}`}>{service.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Categories Section */}
        <section ref={categoriesRef} className="py-20 relative overflow-hidden">
          {/* Gradient Background */}
          <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-blue-900 to-slate-800"></div>
          <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent"></div>

          {sectionLoadingStates.categories ? (
            <div className="relative z-10 flex items-center justify-center h-[500px]">
              <div className="text-center max-w-md mx-auto px-6">
                <div className="inline-block animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-blue-400 mb-6"></div>
                <motion.div
                  key={loadingContentIndex}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.5 }}
                  className="space-y-4"
                >
                  {currentLoadingContent.type === 'quote' ? (
                    <>
                      <p className="text-lg text-gray-200 italic">"{currentLoadingContent.text}"</p>
                      <p className="text-sm text-blue-400">- {currentLoadingContent.author}</p>
                    </>
                  ) : (
                    <>
                      <p className="text-sm text-blue-400 font-semibold">💡 Did you know?</p>
                      <p className="text-lg text-gray-200">{currentLoadingContent.text}</p>
                    </>
                  )}
                </motion.div>
                <div className="mt-6 flex justify-center space-x-1">
                  {funLoadingContent.map((_, index) => (
                    <div
                      key={index}
                      className={`w-2 h-2 rounded-full transition-colors duration-300 ${index === loadingContentIndex ? 'bg-blue-400' : 'bg-gray-600'
                        }`}
                    />
                  ))}
                </div>
              </div>
            </div>
          ) : categoriesError ? (
            <div className="relative z-10 py-12">
              <ErrorFallback
                error={categoriesError}
                resetErrorBoundary={() => {
                  setSectionLoadingStates((prev) => ({ ...prev, categories: true }))
                  dispatch(fetchCategories())
                }}
              />
            </div>
          ) : (
            <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{
                  opacity: categoriesVisible ? 1 : 0,
                  y: categoriesVisible ? 0 : 20,
                }}
                transition={{ duration: 0.5 }}
                className="text-center mb-16"
              >
                <div className="inline-flex items-center justify-center w-12 h-12 bg-blue-500/20 rounded-full mb-4">
                  <div className="w-6 h-6 bg-blue-500 rounded-full"></div>
                </div>
                <h2 className="text-4xl font-bold text-white mb-4">
                  Browse By Category
                </h2>
                <p className="text-xl text-gray-300 max-w-2xl mx-auto">
                  Discover everything you need for work, study, and entertainment
                </p>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{
                  opacity: categoriesVisible ? 1 : 0,
                  y: categoriesVisible ? 0 : 20,
                }}
                transition={{ duration: 0.5, delay: 0.2 }}
                className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8"
              >
                {effectiveCategories.map((category, index) => (
                  <motion.button
                    key={category._id}
                    type="button"
                    onClick={() => {
                      setSelectedCategory(category.name)
                      setShowCategoryView(true)
                    }}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: index * 0.1 }}
                    whileHover={{
                      scale: 1.05,
                      transition: { duration: 0.2 }
                    }}
                    whileTap={{ scale: 0.98 }}
                    className="group relative bg-gradient-to-br from-slate-800/80 to-slate-900/80 backdrop-blur-sm border border-slate-700/50 rounded-2xl overflow-hidden hover:border-blue-500/50 transition-all duration-300 hover:shadow-2xl hover:shadow-blue-500/10"
                  >
                    {/* Category Image */}
                    <div className="relative h-48 overflow-hidden">
                      {category.image ? (
                        <img
                          src={category.image}
                          alt={category.name}
                          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                        />
                      ) : (
                        <div className="w-full h-full bg-gradient-to-br from-blue-600/20 to-purple-600/20 flex items-center justify-center">
                          <div className="text-4xl text-blue-400 group-hover:scale-110 transition-transform duration-300">
                            {category.icon}
                          </div>
                        </div>
                      )}

                      {/* Featured Badge */}
                      {category.featured && (
                        <div className="absolute top-3 right-3">
                          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-orange-500 text-white">
                            FEATURED
                          </span>
                        </div>
                      )}

                      {/* Item Count Badge */}
                      <div className="absolute top-3 left-3">
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-slate-900/80 text-gray-300 backdrop-blur-sm">
                          <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M3 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" clipRule="evenodd" />
                          </svg>
                          {category.productCount || 0} items
                        </span>
                      </div>
                    </div>

                    {/* Category Content */}
                    <div className="p-6">
                      <h3 className="text-xl font-bold text-white mb-2 group-hover:text-blue-400 transition-colors">
                        {category.name}
                      </h3>

                      <p className="text-gray-400 text-sm mb-4 line-clamp-2">
                        {category.description}
                      </p>

                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <span className="inline-flex items-center text-sm text-green-400 font-medium">
                            <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                            </svg>
                            Popular
                          </span>
                        </div>

                        <div className="text-right">
                          <span className="text-xs text-gray-500">Order: {category.order || 0}</span>
                        </div>
                      </div>
                    </div>

                    {/* Hover Effect Overlay */}
                    <div className="absolute inset-0 bg-gradient-to-t from-blue-600/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"></div>
                  </motion.button>
                ))}
              </motion.div>
            </div>
          )}
        </section>

        {/* Category Detail View */}
        <AnimatePresence>
          {showCategoryView && selectedCategory !== "All" && (
            <motion.section
              initial={{ opacity: 0, x: "100%" }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: "100%" }}
              transition={{ duration: 0.5, ease: "easeInOut" }}
              className="fixed inset-0 z-50 bg-gradient-to-br from-slate-900 via-blue-900 to-slate-800 overflow-y-auto"
            >
              {/* Header */}
              <div className="sticky top-0 z-10 bg-slate-900/90 backdrop-blur-sm border-b border-slate-700/50">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4">
                  <div className="flex items-center justify-between">
                    <button
                      onClick={() => setShowCategoryView(false)}
                      className="flex items-center space-x-2 text-gray-300 hover:text-white transition-colors"
                    >
                      <ChevronLeft className="w-5 h-5" />
                      <span>Back to Featured</span>
                    </button>

                    <div className="flex items-center space-x-4">
                      <span className="text-sm text-gray-400">CATEGORY</span>
                      <div className="flex items-center space-x-2">
                        <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                        <span className="text-white font-medium">{selectedCategory}</span>
                        <span className="text-sm text-gray-400">
                          {effectiveProducts.length} items
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Category Hero */}
              <div className="relative py-20">
                <div className="max-w-7xl mx-auto px-4 sm:px-6">
                  <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.2 }}
                    className="text-center"
                  >
                    <h1 className="text-5xl font-bold text-white mb-6">
                      {selectedCategory} Collection
                    </h1>
                    <p className="text-xl text-gray-300 max-w-3xl mx-auto mb-8">
                      {effectiveCategories.find(cat => cat.name === selectedCategory)?.description ||
                        `Discover the latest in cutting-edge technology with our wide range of ${selectedCategory.toLowerCase()} goods. From powerful laptops and sleek smartphones to essential accessories like headphones, keyboards, and chargers, we bring you top-quality devices designed to enhance your daily life. Whether you're upgrading your home setup, shopping for work essentials, or looking for the perfect gift, our ${selectedCategory.toLowerCase()} collection combines performance, innovation, and great value—all in one place.`}
                    </p>

                    <div className="flex items-center justify-center space-x-8 text-sm text-gray-400">
                      <div className="flex items-center space-x-2">
                        <div className="w-4 h-4 bg-green-500 rounded-full flex items-center justify-center">
                          <Check className="w-2 h-2 text-white" />
                        </div>
                        <span>Filtered by: {selectedCategory}</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Filter className="w-4 h-4" />
                        <span>Showing {effectiveProducts.length} products</span>
                      </div>
                    </div>
                  </motion.div>
                </div>
              </div>

              {/* Products Grid */}
              <div className="pb-20">
                <div className="max-w-7xl mx-auto px-4 sm:px-6">
                  {effectiveProducts.length > 0 ? (
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.6, delay: 0.4 }}
                      className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8"
                    >
                      {effectiveProducts.map((product, index) => (
                        <motion.div
                          key={product._id}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ duration: 0.5, delay: index * 0.1 }}
                          className="group relative bg-gradient-to-br from-slate-800/80 to-slate-900/80 backdrop-blur-sm border border-slate-700/50 rounded-2xl overflow-hidden hover:border-blue-500/50 transition-all duration-300 hover:shadow-2xl hover:shadow-blue-500/10"
                        >
                          {/* Product Image */}
                          <div className="relative h-48 overflow-hidden">
                            <img
                              src={product.images?.[0] || '/Techsetup.jpg'}
                              alt={product.name}
                              className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                              onError={(e) => {
                                e.target.src = "/Techsetup.jpg";
                              }}
                            />

                            {/* Sale Badge */}
                            {product.salePrice && product.salePrice < product.price && (
                              <div className="absolute top-3 right-3">
                                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-500 text-white">
                                  -{Math.round(((product.price - product.salePrice) / product.price) * 100)}%
                                </span>
                              </div>
                            )}

                            {/* New Badge */}
                            {product.isNew && (
                              <div className="absolute top-3 left-3">
                                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-500 text-white">
                                  NEW
                                </span>
                              </div>
                            )}
                          </div>

                          {/* Product Content */}
                          <div className="p-6">
                            <h3 className="text-lg font-bold text-white mb-2 group-hover:text-blue-400 transition-colors line-clamp-2">
                              {product.name}
                            </h3>

                            <p className="text-gray-400 text-sm mb-4 line-clamp-2">
                              {product.description}
                            </p>

                            <div className="flex items-center justify-between mb-4">
                              <div className="flex items-center space-x-2">
                                {product.salePrice && product.salePrice < product.price ? (
                                  <>
                                    <span className="text-xl font-bold text-green-400">
                                      {formatCurrency(product.salePrice)}
                                    </span>
                                    <span className="text-sm text-gray-500 line-through">
                                      {formatCurrency(product.price)}
                                    </span>
                                  </>
                                ) : (
                                  <span className="text-xl font-bold text-white">
                                    {formatCurrency(product.price)}
                                  </span>
                                )}
                              </div>

                              <div className="flex items-center space-x-1">
                                <Star className="w-4 h-4 text-yellow-400 fill-current" />
                                <span className="text-sm text-gray-400">
                                  {product.rating || 4.5}
                                </span>
                              </div>
                            </div>

                            <button
                              onClick={() => {
                                // Check if user is authenticated
                                if (!user) {
                                  addStatusMessage({
                                    type: "error",
                                    message: "Please login to add items to cart",
                                    duration: 5000
                                  })
                                  dispatch(openAuthModal("login"))
                                  return
                                }

                                dispatch(addToCart({
                                  productId: product._id,
                                  quantity: 1
                                })).then(() => {
                                  // Show success feedback
                                  addStatusMessage({
                                    type: "success",
                                    message: `${product.name} added to cart!`,
                                    duration: 3000
                                  })
                                }).catch((error) => {
                                  // Show error feedback
                                  addStatusMessage({
                                    type: "error",
                                    message: error.message || "Failed to add item to cart",
                                    duration: 5000
                                  })
                                })
                              }}
                              className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-medium py-3 px-4 rounded-xl transition-all duration-300 hover:shadow-lg hover:shadow-blue-500/25"
                            >
                              Add to Cart
                            </button>
                          </div>

                          {/* Hover Effect Overlay */}
                          <div className="absolute inset-0 bg-gradient-to-t from-blue-600/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"></div>
                        </motion.div>
                      ))}
                    </motion.div>
                  ) : (
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.6, delay: 0.4 }}
                      className="text-center py-20"
                    >
                      <div className="text-6xl text-gray-600 mb-4">🔍</div>
                      <h3 className="text-2xl font-bold text-white mb-2">No products found</h3>
                      <p className="text-gray-400 mb-6">
                        We couldn't find any products in the {selectedCategory} category.
                      </p>
                      <button
                        onClick={() => setShowCategoryView(false)}
                        className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-medium py-3 px-6 rounded-xl transition-all duration-300"
                      >
                        Browse All Categories
                      </button>
                    </motion.div>
                  )}
                </div>
              </div>
            </motion.section>
          )}
        </AnimatePresence>

        {/* Products Section */}
        <section ref={productsRef} id="featured-products" className="py-16">
          {sectionLoadingStates.products ? (
            <div className={`flex items-center justify-center h-[500px] ${darkMode ? 'bg-gray-800' : 'bg-gray-100'}`}>
              <div className="text-center max-w-md mx-auto px-6">
                <div className={`inline-block animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 ${darkMode ? 'border-blue-400' : 'border-blue-600'} mb-6`}></div>
                <motion.div
                  key={loadingContentIndex}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.5 }}
                  className="space-y-4"
                >
                  {currentLoadingContent.type === 'quote' ? (
                    <>
                      <p className={`text-lg ${darkMode ? 'text-gray-200' : 'text-gray-700'} italic`}>"{currentLoadingContent.text}"</p>
                      <p className={`text-sm ${darkMode ? 'text-blue-400' : 'text-blue-600'}`}>- {currentLoadingContent.author}</p>
                    </>
                  ) : (
                    <>
                      <p className={`text-sm ${darkMode ? 'text-blue-400' : 'text-blue-600'} font-semibold`}>💡 Did you know?</p>
                      <p className={`text-lg ${darkMode ? 'text-gray-200' : 'text-gray-700'}`}>{currentLoadingContent.text}</p>
                    </>
                  )}
                </motion.div>
                <div className="mt-6 flex justify-center space-x-1">
                  {funLoadingContent.map((_, index) => (
                    <div
                      key={index}
                      className={`w-2 h-2 rounded-full transition-colors duration-300 ${index === loadingContentIndex
                        ? (darkMode ? 'bg-blue-400' : 'bg-blue-600')
                        : (darkMode ? 'bg-gray-600' : 'bg-gray-400')
                        }`}
                    />
                  ))}
                </div>
              </div>
            </div>
          ) : productsError ? (
            <div className="py-12">
              <ErrorFallback
                error={productsError}
                resetErrorBoundary={() => {
                  setSectionLoadingStates((prev) => ({ ...prev, products: true }))
                  dispatch(fetchProducts({}))
                }}
              />
            </div>
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
                  <h2 className={`text-3xl font-bold ${darkMode ? "text-white" : "text-gray-900"} mb-2`}>
                    {selectedCategory === 'All' ? 'Featured Products' : `${selectedCategory} Collection`}
                  </h2>
                  <p className={`text-lg ${darkMode ? "text-gray-400" : "text-gray-600"}`}>
                    {selectedCategory === 'All' ? 'Hand-picked products for your tech needs' : `Discover the best products in ${selectedCategory}`}
                  </p>
                </div>
                <div className="mt-4 md:mt-0 flex flex-col sm:flex-row gap-3">
                  <button
                    onClick={() => setAreFiltersShown(!areFiltersShown)}
                    className={`flex items-center px-4 py-2 ${darkMode ? "bg-gray-700 hover:bg-gray-600 text-white" : "bg-white hover:bg-gray-100 text-gray-700"
                      } rounded-lg border ${darkMode ? "border-gray-600" : "border-gray-300"}`}
                    aria-expanded={areFiltersShown}
                    aria-controls="product-filters"
                  >
                    <Filter size={18} className="mr-2" />
                    Filters
                    <ChevronDown
                      size={18}
                      className={`ml-2 transition-transform ${areFiltersShown ? "rotate-180" : ""}`}
                    />
                  </button>
                  <select
                    value={selectedSort}
                    onChange={(e) => setSelectedSort(e.target.value)}
                    className={`px-4 py-2 rounded-lg border ${darkMode ? "bg-gray-700 border-gray-600 text-white" : "bg-white border-gray-300 text-gray-700"
                      }`}
                    aria-label="Sort products"
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
                {areFiltersShown && (
                  <motion.div
                    id="product-filters"
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.3 }}
                    className={`mb-8 p-4 rounded-lg ${darkMode ? "bg-gray-700" : "bg-white"} overflow-hidden`}
                  >
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      <div>
                        <h3 className={`text-sm font-medium mb-3 ${darkMode ? "text-white" : "text-gray-900"}`}>
                          Categories
                        </h3>
                        <div className="space-y-2">
                          <button
                            onClick={() => {
                              setSelectedCategory("All")
                              setShowCategoryView(false)
                            }}
                            className={`block px-3 py-2 rounded-md text-sm w-full text-left ${selectedCategory === "All"
                              ? darkMode
                                ? "bg-blue-900/30 text-blue-400"
                                : "bg-blue-100 text-blue-700"
                              : darkMode
                                ? "text-gray-300 hover:bg-gray-600"
                                : "text-gray-700 hover:bg-gray-100"
                              }`}
                          >
                            All Categories
                          </button>
                          {effectiveCategories.map((category) => (
                            <button
                              key={category._id}
                              onClick={() => {
                                setSelectedCategory(category.name)
                                setShowCategoryView(true)
                              }}
                              className={`block px-3 py-2 rounded-md text-sm w-full text-left ${selectedCategory === category.name
                                ? darkMode
                                  ? "bg-blue-900/30 text-blue-400"
                                  : "bg-blue-100 text-blue-700"
                                : darkMode
                                  ? "text-gray-300 hover:bg-gray-600"
                                  : "text-gray-700 hover:bg-gray-100"
                                }`}
                            >
                              {category.name}
                            </button>
                          ))}
                        </div>
                      </div>
                      <div>
                        <h3 className={`text-sm font-medium mb-3 ${darkMode ? "text-white" : "text-gray-900"}`}>
                          Price Range
                        </h3>
                        <div className="space-y-2">
                          <div className="flex items-center">
                            <input type="range" min="0" max="200" className="w-full" aria-label="Price range" />
                          </div>
                          <div className="flex justify-between">
                            <span className={`text-sm ${darkMode ? "text-gray-400" : "text-gray-600"}`}>$0</span>
                            <span className={`text-sm ${darkMode ? "text-gray-400" : "text-gray-600"}`}>$200+</span>
                          </div>
                        </div>
                      </div>
                      <div>
                        <h3 className={`text-sm font-medium mb-3 ${darkMode ? "text-white" : "text-gray-900"}`}>
                          Availability
                        </h3>
                        <div className="space-y-2">
                          <label className="flex items-center">
                            <input
                              type="checkbox"
                              className="rounded text-blue-600 focus:ring-blue-500"
                              defaultChecked
                            />
                            <span className={`ml-2 text-sm ${darkMode ? "text-gray-300" : "text-gray-700"}`}>
                              In Stock
                            </span>
                          </label>
                          <label className="flex items-center">
                            <input type="checkbox" className="rounded text-blue-600 focus:ring-blue-500" />
                            <span className={`ml-2 text-sm ${darkMode ? "text-gray-300" : "text-gray-700"}`}>
                              On Sale
                            </span>
                          </label>
                          <label className="flex items-center">
                            <input type="checkbox" className="rounded text-blue-600 focus:ring-blue-500" />
                            <span className={`ml-2 text-sm ${darkMode ? "text-gray-300" : "text-gray-700"}`}>
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
                {effectiveProducts.length > 0 ? (
                  effectiveProducts.map((product) => (
                    <motion.div
                      key={product._id}
                      whileHover={{ y: -5 }}
                      className={`${darkMode ? "bg-gray-700 border-gray-600" : "bg-white border-gray-200"
                        } rounded-xl border overflow-hidden hover:shadow-lg transition-shadow group`}
                    >
                      <div className="relative">
                        <img
                          src={product.images?.[0] || product.image || "/Techsetup.jpg"}
                          alt={product.name}
                          className="w-full h-48 object-cover transition-transform duration-500 group-hover:scale-105"
                          onError={(e) => {
                            e.target.src = "/Techsetup.jpg";
                          }}
                        />
                        {/* Product badges */}
                        <div className="absolute top-2 left-2 flex flex-col gap-2">
                          {product.onSale && (
                            <div className="px-2 py-1 text-xs font-bold rounded-md bg-red-600 text-white">Sale</div>
                          )}
                          {product.isNewProduct && (
                            <div className="px-2 py-1 text-xs font-bold rounded-md bg-green-600 text-white">New</div>
                          )}
                          {product.featured && (
                            <div className="px-2 py-1 text-xs font-bold rounded-md bg-yellow-500 text-white">
                              Featured
                            </div>
                          )}
                        </div>
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
                            e.stopPropagation()
                            // Add to wishlist functionality
                          }}
                          aria-label="Add to wishlist"
                        >
                          <Heart size={18} />
                        </button>
                      </div>
                      <div className="p-4">
                        <div className={`text-xs ${darkMode ? "text-gray-400" : "text-gray-500"} mb-1`}>
                          {product.category?.name || "Uncategorized"}
                        </div>
                        <h3
                          className={`font-medium ${darkMode ? "text-white" : "text-gray-900"
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
                                  ? "text-yellow-400 fill-yellow-400"
                                  : darkMode
                                    ? "text-gray-600"
                                    : "text-gray-300"
                              }
                            />
                          ))}
                          <span className={`text-xs ${darkMode ? "text-gray-400" : "text-gray-500"} ml-1`}>
                            {product.rating?.toFixed(1) || "0.0"}
                          </span>
                        </div>
                        <div className="flex justify-between items-center mb-3">
                          {product.salePrice ? (
                            <div>
                              <span className={`font-bold ${darkMode ? "text-white" : "text-gray-900"}`}>
                                {formatCurrency(product.salePrice)}
                              </span>
                              <span className="ml-2 text-sm text-gray-500 line-through">
                                {formatCurrency(product.price)}
                              </span>
                            </div>
                          ) : (
                            <span className={`font-bold ${darkMode ? "text-white" : "text-gray-900"}`}>
                              {formatCurrency(product.price)}
                            </span>
                          )}
                          <button
                            className={`p-2 ${darkMode ? "bg-blue-600 hover:bg-blue-700" : "bg-blue-600 hover:bg-blue-700"
                              } text-white rounded-full transition-colors ${product.stock <= 0 ? "opacity-50 cursor-not-allowed" : ""
                              }`}
                            onClick={() => handleAddToCart(product)}
                            disabled={product.stock <= 0}
                            aria-label="Add to cart"
                          >
                            <ShoppingCart size={16} />
                          </button>
                        </div>
                        <button
                          onClick={() => handleBuyNow(product)}
                          className={`w-full py-1.5 text-center text-sm font-medium ${darkMode
                            ? "text-blue-400 border-blue-400 hover:bg-blue-900/20"
                            : "text-blue-600 border-blue-600 hover:bg-blue-50"
                            } border rounded-lg transition-colors ${product.stock <= 0 ? "opacity-50 cursor-not-allowed" : ""
                            }`}
                          disabled={product.stock <= 0}
                        >
                          {product.stock <= 0 ? "Out of Stock" : "Buy Now"}
                        </button>
                      </div>
                    </motion.div>
                  ))
                ) : (
                  <div className={`col-span-full text-center py-12 ${darkMode ? "text-gray-400" : "text-gray-600"}`}>
                    <ShoppingBag size={48} className="mx-auto mb-4 opacity-30" />
                    <h3 className={`text-xl font-medium ${darkMode ? "text-white" : "text-gray-900"} mb-2`}>
                      No products found
                    </h3>
                    <p>Try adjusting your search or filter criteria</p>
                    <button
                      onClick={() => {
                        setSelectedCategory("All")
                        setSearchQuery("")
                      }}
                      className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                    >
                      Reset Filters
                    </button>
                  </div>
                )}
              </motion.div>

              {effectiveProducts.length > 0 && (
                <div className="mt-8 text-center">
                  <button
                    className={`inline-flex items-center px-6 py-3 ${darkMode ? "bg-blue-600 hover:bg-blue-700" : "bg-blue-600 hover:bg-blue-700"
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
          {sectionLoadingStates.offers ? (
            <div className="flex items-center justify-center h-[400px] bg-gray-100 dark:bg-gray-800">
              <div className="text-center">
                <div className="inline-block animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600 dark:border-blue-400 mb-4"></div>
                <p className="text-gray-600 dark:text-gray-300">Loading special offers...</p>
              </div>
            </div>
          ) : offersError ? (
            <div className="py-12">
              <ErrorFallback
                error={offersError}
                resetErrorBoundary={() => {
                  setSectionLoadingStates((prev) => ({ ...prev, offers: true }))
                  dispatch(fetchSpecialOffers())
                }}
              />
            </div>
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
                <h2 className={`text-3xl font-bold ${darkMode ? "text-white" : "text-gray-900"} mb-2`}>
                  Special Deals & Bundles
                </h2>
                <p className={`text-lg ${darkMode ? "text-gray-400" : "text-gray-600"} max-w-2xl mx-auto`}>
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
                {effectiveSpecialOffers.map((offer) => {
                  // Calculate days remaining
                  const daysRemaining = getDaysRemaining(offer.endDate)

                  return (
                    <motion.div
                      key={offer._id}
                      whileHover={{ scale: 1.02 }}
                      className={`${darkMode ? "bg-gray-800 border-gray-700" : "bg-gray-50 border-gray-200"
                        } rounded-xl border overflow-hidden shadow-md`}
                    >
                      <div className="flex flex-col md:flex-row">
                        <div className="md:w-2/5">
                          <div className="relative h-48 md:h-full">
                            <img
                              src={offer.image || "/placeholder.svg"}
                              alt={offer.title}
                              className="w-full h-full object-cover"
                            />
                            <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-r from-blue-600/20 to-transparent"></div>
                            <div className="absolute top-4 left-4 px-3 py-1 bg-red-600 text-white text-sm font-bold rounded-md">
                              {offer.discount || `${offer.discountPercentage}% OFF`}
                            </div>
                          </div>
                        </div>
                        <div className="p-6 md:w-3/5">
                          <div className="flex justify-between items-start mb-2">
                            <h3 className={`text-xl font-bold ${darkMode ? "text-white" : "text-gray-900"}`}>
                              {offer.title}
                            </h3>
                            <span className={`text-sm font-medium ${darkMode ? "text-yellow-400" : "text-yellow-600"}`}>
                              {daysRemaining > 0
                                ? `Ends in ${daysRemaining} day${daysRemaining !== 1 ? "s" : ""}`
                                : offer.expiry || "Limited time offer"}
                            </span>
                          </div>
                          <p className={`text-sm ${darkMode ? "text-gray-400" : "text-gray-600"} mb-4`}>
                            {offer.description}
                          </p>
                          <div className="mb-4">
                            <div className="flex items-baseline">
                              <span className={`text-2xl font-bold ${darkMode ? "text-white" : "text-gray-900"} mr-2`}>
                                {formatCurrency(offer.salePrice)}
                              </span>
                              <span className={`text-sm line-through ${darkMode ? "text-gray-500" : "text-gray-500"}`}>
                                {formatCurrency(offer.regularPrice)}
                              </span>
                            </div>
                          </div>
                          <div className="mb-4">
                            <h4
                              className={`text-xs font-medium uppercase ${darkMode ? "text-gray-400" : "text-gray-500"
                                } mb-2`}
                            >
                              Includes:
                            </h4>
                            <ul className="space-y-1">
                              {offer.items?.map((item, idx) => (
                                <li
                                  key={idx}
                                  className={`text-sm flex items-start ${darkMode ? "text-gray-300" : "text-gray-700"}`}
                                >
                                  <Check
                                    size={16}
                                    className={`mr-2 mt-0.5 flex-shrink-0 ${darkMode ? "text-green-400" : "text-green-500"
                                      }`}
                                  />
                                  {item}
                                </li>
                              ))}
                            </ul>
                          </div>
                          {offer.terms && (
                            <p className={`text-xs ${darkMode ? "text-gray-500" : "text-gray-500"} mb-4 italic`}>
                              {offer.terms}
                            </p>
                          )}
                          <div className="flex flex-col sm:flex-row gap-3">
                            <button
                              className={`flex-1 py-2 px-4 ${darkMode ? "bg-blue-600 hover:bg-blue-700" : "bg-blue-600 hover:bg-blue-700"
                                } text-white font-medium rounded-lg transition-colors`}
                            >
                              Add Bundle to Cart
                            </button>
                            <div className="flex items-center px-3 py-2 bg-gray-100 dark:bg-gray-700 rounded-lg">
                              <Percent size={16} className={`mr-2 ${darkMode ? "text-blue-400" : "text-blue-600"}`} />
                              <span className={`text-sm font-medium ${darkMode ? "text-white" : "text-gray-900"}`}>
                                Code: {offer.code}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  )
                })}
              </motion.div>
            </div>
          )}
        </section>

        {/* Testimonials Section */}
        <section className={`py-12 ${darkMode ? "bg-gray-800" : "bg-gray-50"}`}>
          <div className="max-w-7xl mx-auto px-4 sm:px-6">
            <div className="text-center mb-12">
              <h2 className={`text-3xl font-bold ${darkMode ? "text-white" : "text-gray-900"} mb-2`}>
                What Our Customers Say
              </h2>
              <p className={`text-lg ${darkMode ? "text-gray-400" : "text-gray-600"}`}>
                Don't just take our word for it
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {testimonials.map((testimonial) => (
                <div
                  key={testimonial.id}
                  className={`${darkMode ? "bg-gray-700 border-gray-600" : "bg-white border-gray-200"
                    } rounded-xl border p-6 shadow-md`}
                >
                  <div className="flex items-center mb-4">
                    <img
                      src={testimonial.avatar || "/placeholder.svg"}
                      alt={testimonial.name}
                      className="w-12 h-12 rounded-full object-cover mr-4"
                    />
                    <div>
                      <h3 className={`font-medium ${darkMode ? "text-white" : "text-gray-900"}`}>{testimonial.name}</h3>
                      <p className={`text-sm ${darkMode ? "text-gray-400" : "text-gray-500"}`}>{testimonial.role}</p>
                    </div>
                  </div>
                  <div className="mb-4">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        size={16}
                        className={
                          i < testimonial.rating
                            ? "text-yellow-400 fill-yellow-400 inline-block mr-1"
                            : "text-gray-300 dark:text-gray-600 inline-block mr-1"
                        }
                      />
                    ))}
                  </div>
                  <p className={`text-sm italic ${darkMode ? "text-gray-300" : "text-gray-600"}`}>
                    "{testimonial.content}"
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Call To Action Section */}
        <section ref={ctaRef} className={`py-16 ${darkMode ? "bg-gray-900" : "bg-blue-50"}`}>
          <div className="max-w-7xl mx-auto px-4 sm:px-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: ctaVisible ? 1 : 0, y: ctaVisible ? 0 : 20 }}
              transition={{ duration: 0.5 }}
              className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center"
            >
              <div>
                <h2 className={`text-3xl md:text-4xl font-bold ${darkMode ? "text-white" : "text-gray-900"} mb-4`}>
                  Ready to Upgrade Your Tech?
                </h2>
                <p className={`text-lg ${darkMode ? "text-gray-300" : "text-gray-600"} mb-6`}>
                  Explore our wide selection of products and services designed to enhance your digital experience.
                  Whether you're a student, professional, or tech enthusiast, we have everything you need.
                </p>
                <div className="flex flex-col sm:flex-row gap-4">
                  <button
                    className={`${darkMode ? "bg-blue-600 hover:bg-blue-700" : "bg-blue-600 hover:bg-blue-700"
                      } text-white font-bold py-3 px-8 rounded-lg transition-colors shadow-lg`}
                    onClick={() => setIsCheckoutOpen(true)}
                  >
                    View Cart
                  </button>
                  <button
                    className={`${darkMode
                      ? "bg-gray-800 text-blue-400 border-blue-400 hover:bg-gray-700"
                      : "bg-white text-blue-600 border-blue-600 hover:bg-blue-50"
                      } font-bold py-3 px-8 rounded-lg border-2 transition-colors`}
                  >
                    Contact Sales
                  </button>
                </div>
              </div>
              <div className="flex justify-center">
                <img src="/Techsetup.jpg" alt="Tech setup" className="rounded-xl shadow-xl" />
              </div>
            </motion.div>
          </div>
        </section>

        {/* Newsletter Section */}
        <section className={`py-12 ${darkMode ? "bg-gray-800" : "bg-white"}`}>
          <div className="max-w-3xl mx-auto px-4 sm:px-6 text-center">
            <div
              className={`p-8 ${darkMode ? "bg-gray-700 border-gray-600" : "bg-blue-50 border-blue-100"
                } rounded-2xl border`}
            >
              <div className="w-16 h-16 mx-auto mb-6 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center">
                <Mail className="h-8 w-8 text-blue-600 dark:text-blue-400" />
              </div>
              <h2 className={`text-2xl font-bold ${darkMode ? "text-white" : "text-gray-900"} mb-2`}>
                Subscribe to Our Newsletter
              </h2>
              <p className={`text-${darkMode ? "gray-300" : "gray-600"} mb-6`}>
                Get the latest updates, offers and tech tips delivered straight to your inbox
              </p>
              <form className="flex flex-col sm:flex-row gap-2">
                <input
                  type="email"
                  placeholder="Your email address"
                  className={`flex-1 px-4 py-3 rounded-lg ${darkMode ? "bg-gray-800 border-gray-600 text-white" : "bg-white border-gray-300 text-gray-900"
                    } border focus:outline-none focus:ring-2 focus:ring-blue-500`}
                  required
                  aria-label="Email address"
                />
                <button
                  type="submit"
                  className="px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Subscribe
                </button>
              </form>
              <p className={`mt-4 text-xs ${darkMode ? "text-gray-400" : "text-gray-500"}`}>
                By subscribing, you agree to our Terms and Privacy Policy
              </p>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className={`${darkMode ? "bg-gray-900 text-white" : "bg-blue-900 text-white"}`}>
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
                Your one-stop shop for all things tech, stationery, and digital services. Serving both online and
                in-store customers with the best products and experiences.
              </p>
              <div className="flex space-x-4">
                <a
                  href="#"
                  className="bg-blue-800 hover:bg-blue-700 p-2 rounded-full transition-colors"
                  aria-label="Facebook"
                >
                  <Facebook size={20} />
                </a>
                <a
                  href="#"
                  className="bg-blue-800 hover:bg-blue-700 p-2 rounded-full transition-colors"
                  aria-label="Twitter"
                >
                  <Twitter size={20} />
                </a>
                <a
                  href="#"
                  className="bg-blue-800 hover:bg-blue-700 p-2 rounded-full transition-colors"
                  aria-label="Instagram"
                >
                  <Instagram size={20} />
                </a>
                <a
                  href="#"
                  className="bg-blue-800 hover:bg-blue-700 p-2 rounded-full transition-colors"
                  aria-label="YouTube"
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
                  <Link to="/" className="text-blue-100 hover:text-white transition-colors">
                    Home
                  </Link>
                </li>
                <li>
                  <Link to="/shop" className="text-blue-100 hover:text-white transition-colors">
                    Shop
                  </Link>
                </li>
                <li>
                  <Link to="/services" className="text-blue-100 hover:text-white transition-colors">
                    Services
                  </Link>
                </li>
                <li>
                  <Link to="/websites" className="text-blue-100 hover:text-white transition-colors">
                    Websites
                  </Link>
                </li>
                {(user?.role === "admin" || user?.role === "super_admin") && (
                  <li>
                    <Link to="/admin" className="text-blue-100 hover:text-white transition-colors">
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
                  <MapPin size={20} className="text-blue-300 mr-2 mt-1 flex-shrink-0" />
                  <span className="text-blue-100">08 Vox Hse, Rurii Road, Githurai</span>
                </li>
                <li className="flex items-center">
                  <Phone size={20} className="text-blue-300 mr-2 flex-shrink-0" />
                  <span className="text-blue-100">+254 710 345 787</span>
                </li>
                <li className="flex items-center">
                  <Mail size={20} className="text-blue-300 mr-2 flex-shrink-0" />
                  <span className="text-blue-100">info@voxcyber.co.ke/voxcyber254@gmail.com</span>
                </li>
                <li className="flex items-center">
                  <Clock1 size={20} className="text-blue-300 mr-2 flex-shrink-0" />
                  <span className="text-blue-100">Mon-Sat: 9AM-9PM, Sun: 10AM-6PM</span>
                </li>
              </ul>
            </div>

            {/* Newsletter Form */}
            <div>
              <h3 className="text-lg font-bold mb-4 text-white">Newsletter</h3>
              <p className="text-blue-100 mb-4">Subscribe to our newsletter for the latest updates and offers.</p>
              <form className="flex">
                <input
                  type="email"
                  placeholder="Your email address"
                  className="flex-1 py-2 px-4 rounded-l-lg focus:outline-none dark:bg-gray-700 dark:text-white"
                  required
                  aria-label="Email for newsletter"
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
            <p className="text-blue-200 text-sm">© {new Date().getFullYear()} Vox Cyber. All rights reserved.</p>
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
            aria-label="Back to top"
          >
            <ChevronLeft size={24} className="transform rotate-90" />
          </motion.button>
        )}
      </AnimatePresence>

      {/* Cart Notification */}
      <div id="cart-notification" className="fixed bottom-4 right-4 z-50"></div>
    </div>
  )
}

export default CyberCafeLandingPage
