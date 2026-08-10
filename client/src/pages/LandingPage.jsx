"use client"

import { useState, useEffect } from "react"
import {
  ShoppingBag,
  ArrowRight,
  ArrowUpRight,
  MessageSquare,
  Sparkles,
  Headphones,
  ShieldCheck,
  Wrench,
  Truck,
  Users,
  Star,
  Award,
  DollarSign,
  HeartHandshake,
  Store,
  Code2,
  MessageCircle,
  Quote,
  CheckCircle2,
  Zap,
} from "lucide-react"
import { useNavigate } from "react-router-dom"
import { useSelector } from "react-redux"
import { motion } from "framer-motion"

import Navbar from "../components/common/Navbar"
import Footer from "../components/common/Footer"
import { TypewriterEffect, FloatingShapes, AnimatedBackground } from "../components/animated"
import useParallax from "../hooks/useParallax"

const WHATSAPP_NUMBER = "+254710345787"

export default function LandingPage() {
  const navigate = useNavigate()
  const { darkMode } = useSelector((state) => state.ui)
  const { user } = useSelector((state) => state.auth)

  const [typewriterComplete, setTypewriterComplete] = useState(false)
  const [activeTestimonial, setActiveTestimonial] = useState(0)
  const parallaxOffset = useParallax(0.3)

  const openWhatsApp = () => {
    window.open(
      `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(
        "Hi VoxCyber! I'd like to learn more about your products and services."
      )}`,
      "_blank"
    )
  }

  // Hero highlight stats
  const stats = [
    { icon: <Users className="w-4 h-4" />, value: "1000+", label: "Happy Clients" },
    { icon: <HeartHandshake className="w-4 h-4" />, value: "50+", label: "Business Partners" },
    { icon: <Star className="w-4 h-4" />, value: "5★", label: "Customer Rating" },
    { icon: <Truck className="w-4 h-4" />, value: "Fast", label: "Nationwide Delivery" },
  ]

  // Main offering cards
  const cards = [
    {
      id: "shop",
      title: "Tech Store",
      description: "Shop quality tech products and accessories from trusted brands at the best prices.",
      icon: <ShoppingBag className="w-8 h-8 text-blue-400" />,
      link: "/shop",
      image: "/GamingGearSpectacular.avif",
      accent: "blue",
      glowClass: "hover:shadow-blue-500/30 border-blue-500/20 hover:border-blue-500/50",
      features: ["Laptops & Computers", "Accessories & Peripherals", "Networking Devices", "Fast, Secure Delivery"],
      cta: "Shop Now",
    },
    {
      id: "services",
      title: "Digital Services",
      description: "Grow your brand with expert social media account management, content and audience growth.",
      icon: <MessageSquare className="w-8 h-8 text-purple-400" />,
      link: "/services",
      image: "/David.jpg",
      accent: "purple",
      glowClass: "hover:shadow-purple-500/30 border-purple-500/20 hover:border-purple-500/50",
      features: ["Social Media Management", "Content Creation", "Audience Growth", "Analytics & Reporting"],
      cta: "View Services",
    },
    {
      id: "websites",
      title: "Web Development",
      description: "We design, develop and deploy modern websites and custom digital solutions that scale.",
      icon: <Code2 className="w-8 h-8 text-emerald-400" />,
      link: "/websites",
      image: "/Techsetup.jpg",
      accent: "emerald",
      glowClass: "hover:shadow-emerald-500/30 border-emerald-500/20 hover:border-emerald-500/50",
      features: ["Custom Website Design", "Web Applications", "SEO & Performance", "Maintenance & Support"],
      cta: "See Our Work",
    },
  ]

  // Trust strip
  const highlights = [
    { icon: <Headphones className="w-5 h-5" />, label: "Professional Support" },
    { icon: <ShieldCheck className="w-5 h-5" />, label: "Genuine Tech Products" },
    { icon: <Wrench className="w-5 h-5" />, label: "Fast Repairs" },
    { icon: <Truck className="w-5 h-5" />, label: "Nationwide Delivery" },
    { icon: <Users className="w-5 h-5" />, label: "Serving Businesses & Individuals" },
  ]

  // Why choose us
  const reasons = [
    {
      icon: <Award className="w-6 h-6" />,
      title: "Experience You Trust",
      description: "Years of experience serving our clients with excellence.",
    },
    {
      icon: <ShieldCheck className="w-6 h-6" />,
      title: "Quality & Reliability",
      description: "We deliver top quality products and services you can rely on.",
    },
    {
      icon: <DollarSign className="w-6 h-6" />,
      title: "Affordable Prices",
      description: "Best prices in the market without compromising on quality.",
    },
    {
      icon: <HeartHandshake className="w-6 h-6" />,
      title: "Customer First",
      description: "We listen, we care, and we are always here for you.",
    },
    {
      icon: <Store className="w-6 h-6" />,
      title: "All In One Shop",
      description: "Everything you need under one roof — save time and money.",
    },
  ]

  // Testimonials
  const testimonials = [
    {
      name: "James Mwangi",
      role: "Business Owner",
      avatar: "/David.jpg",
      quote:
        "VoxCyber has been a game changer for our business. Their products are genuine, services are fast and reliable, and their support is unmatched.",
    },
    {
      name: "Aisha Noor",
      role: "Content Creator",
      avatar: "/user.png",
      quote:
        "Their social media management team grew my audience faster than I imagined. Professional, creative and always on time.",
    },
    {
      name: "Daniel Otieno",
      role: "Startup Founder",
      avatar: "/user.png",
      quote:
        "They built our website from scratch and it looks stunning. Great communication and delivery from start to finish.",
    },
  ]

  useEffect(() => {
    const id = setInterval(() => {
      setActiveTestimonial((prev) => (prev + 1) % testimonials.length)
    }, 6000)
    return () => clearInterval(id)
  }, [testimonials.length])

  const sectionTitle = darkMode ? "text-white" : "text-gray-900"
  const sectionSub = "text-gray-500 dark:text-gray-400"

  const accent = {
    blue: "text-blue-400",
    purple: "text-purple-400",
    emerald: "text-emerald-400",
  }

  return (
    <div
      className={`relative flex flex-col min-h-screen overflow-hidden transition-colors duration-300 ${
        darkMode ? "dark bg-gray-950 text-white" : "bg-gray-50 text-gray-900"
      }`}
    >
      <Navbar />

      {/* ================= HERO ================= */}
      <section className="relative overflow-hidden">
        {/* Animated Background */}
        <div className="absolute inset-0 z-0 pointer-events-none">
          <AnimatedBackground variant="particles" intensity="medium" />
        </div>

        {/* Parallax Background Glows */}
        <div
          className="absolute top-[-10%] right-[-5%] w-[400px] sm:w-[600px] h-[400px] sm:h-[600px] rounded-full bg-blue-500/5 dark:bg-blue-500/10 blur-[80px] sm:blur-[120px] z-[1] pointer-events-none"
          style={{ transform: `translateY(${parallaxOffset * 0.4}px)` }}
        ></div>
        <div
          className="absolute bottom-[-10%] left-[-5%] w-[300px] sm:w-[500px] h-[300px] sm:h-[500px] rounded-full bg-purple-500/5 dark:bg-purple-500/10 blur-[80px] sm:blur-[120px] z-[1] pointer-events-none"
          style={{ transform: `translateY(${-parallaxOffset * 0.3}px)` }}
        ></div>

        <FloatingShapes count={6} className="z-[2] pointer-events-none opacity-40" />

        <div className="relative z-[5] max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-12 sm:py-20">
          <div className="grid lg:grid-cols-2 gap-10 lg:gap-12 items-center">
            {/* Left: copy */}
            <div className="text-center lg:text-left">
              <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="inline-flex items-center gap-2 px-3.5 py-1.5 bg-blue-500/10 text-blue-600 dark:text-blue-400 rounded-full text-xs font-semibold mb-6 border border-blue-500/15"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>Trusted Technology Partner</span>
              </motion.div>

              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight leading-[1.1] mb-6">
                <TypewriterEffect
                  text="Technology That "
                  speed={70}
                  delay={300}
                  className={darkMode ? "text-white" : "text-gray-900"}
                  onComplete={() => setTypewriterComplete(true)}
                />
                {typewriterComplete && (
                  <motion.span
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.5 }}
                    className="block sm:inline"
                  >
                    Powers{" "}
                    <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600 dark:from-blue-400 dark:to-purple-400">
                      Your Business
                    </span>
                  </motion.span>
                )}
                {user && typewriterComplete && (
                  <motion.span
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="text-2xl sm:text-3xl block mt-2 text-gray-500 dark:text-gray-400 font-normal"
                  >
                    Welcome back, {user.name}
                  </motion.span>
                )}
              </h1>

              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.7, delay: 0.5 }}
                className="text-base sm:text-lg text-gray-600 dark:text-gray-300 leading-relaxed max-w-xl mx-auto lg:mx-0"
              >
                Premium tech products, expert social media management, and modern websites — all under one trusted brand.
              </motion.p>

              {/* CTA buttons */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.6 }}
                className="mt-8 flex flex-col sm:flex-row gap-4 justify-center lg:justify-start"
              >
                <button
                  onClick={() => navigate("/shop")}
                  className="group inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl font-semibold text-white bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-700 hover:to-blue-600 shadow-lg shadow-blue-500/25 transition-all hover:-translate-y-0.5"
                >
                  <ShoppingBag className="w-5 h-5" />
                  Shop Products
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </button>
                <button
                  onClick={() => navigate("/services")}
                  className={`group inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl font-semibold border transition-all hover:-translate-y-0.5 ${
                    darkMode
                      ? "border-gray-700 bg-gray-900/60 text-white hover:bg-gray-800"
                      : "border-gray-300 bg-white text-gray-900 hover:bg-gray-100"
                  }`}
                >
                  Explore Services
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </button>
              </motion.div>

              {/* Stats */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.7, delay: 0.8 }}
                className="mt-10 grid grid-cols-2 sm:grid-cols-4 gap-4 max-w-lg mx-auto lg:mx-0"
              >
                {stats.map((stat, i) => (
                  <div key={i} className="text-center lg:text-left">
                    <div className="flex items-center justify-center lg:justify-start gap-1.5 text-blue-500 dark:text-blue-400 mb-1">
                      {stat.icon}
                      <span className="text-xl font-bold text-gray-900 dark:text-white">{stat.value}</span>
                    </div>
                    <p className="text-xs text-gray-500 dark:text-gray-400">{stat.label}</p>
                  </div>
                ))}
              </motion.div>
            </div>

            {/* Right: product image */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.7, delay: 0.3 }}
              className="relative"
            >
              <div className="absolute inset-0 -inset-x-8 bg-gradient-to-tr from-blue-500/25 via-purple-500/15 to-transparent blur-3xl rounded-full"></div>
              <img
                src="/voxhero.png"
                alt="VoxCyber premium tech products"
                className="relative w-full max-w-xl mx-auto object-contain drop-shadow-2xl rounded-2xl"
              />
            </motion.div>
          </div>
        </div>
      </section>

      {/* ================= OFFERING CARDS ================= */}
      <section className="relative z-[5] max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8">
          {cards.map((card, index) => (
            <motion.div
              key={card.id}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.2 }}
              transition={{ duration: 0.6, delay: 0.1 + index * 0.1 }}
              whileHover={{ y: -10, transition: { duration: 0.2 } }}
              whileTap={{ scale: 0.98 }}
              onClick={() => navigate(card.link)}
              className={`group cursor-pointer relative p-6 sm:p-8 rounded-3xl border overflow-hidden transition-all duration-300 bg-gray-900 shadow-xl hover:shadow-2xl ${card.glowClass}`}
            >
              {/* Faded background image */}
              <img
                src={card.image}
                alt=""
                aria-hidden="true"
                className="absolute inset-0 w-full h-full object-cover opacity-25 group-hover:opacity-35 group-hover:scale-105 transition-all duration-500"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-gray-950 via-gray-950/90 to-gray-900/70"></div>

              {/* Content */}
              <div className="relative z-10">
                <div className="absolute -top-1 right-0 p-2 rounded-full bg-white/10 backdrop-blur text-gray-300 group-hover:text-white group-hover:bg-white/20 transition-all duration-300">
                  <ArrowUpRight className="w-4 h-4" />
                </div>

                <div className="w-16 h-16 rounded-2xl flex items-center justify-center mb-6 bg-white/10 backdrop-blur ring-1 ring-white/10 group-hover:scale-110 transition-transform duration-300">
                  {card.icon}
                </div>

                <h3 className="text-xl sm:text-2xl font-bold mb-3 text-white">{card.title}</h3>

                <p className="text-sm text-gray-300 leading-relaxed mb-6">{card.description}</p>

                <ul className="space-y-2.5 mb-6 border-t border-white/10 pt-4">
                  {card.features.map((feature, fIdx) => (
                    <li key={fIdx} className="flex items-center text-xs text-gray-200">
                      <CheckCircle2 className={`w-3.5 h-3.5 mr-2 flex-shrink-0 ${accent[card.accent]}`} />
                      {feature}
                    </li>
                  ))}
                </ul>

                <div className={`inline-flex items-center text-sm font-semibold group-hover:translate-x-1.5 transition-transform duration-300 ${accent[card.accent]}`}>
                  <span>{card.cta}</span>
                  <ArrowRight className="w-4 h-4 ml-1.5" />
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ================= TRUST STRIP ================= */}
      <section className="relative z-[5] max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 pb-4">
        <div
          className={`rounded-2xl border px-4 sm:px-8 py-5 ${
            darkMode ? "bg-gray-900/60 border-gray-800" : "bg-white/70 border-gray-200"
          }`}
        >
          <div className="flex flex-wrap items-center justify-center gap-x-8 gap-y-4">
            {highlights.map((item, i) => (
              <div key={i} className="flex items-center gap-2.5 text-sm font-medium text-gray-600 dark:text-gray-300">
                <span className="text-blue-500 dark:text-blue-400">{item.icon}</span>
                {item.label}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ================= WHY CHOOSE US ================= */}
      <section className="relative z-[5] max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-14 sm:py-20">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.2 }}
          transition={{ duration: 0.6 }}
          className={`relative overflow-hidden rounded-3xl border grid lg:grid-cols-3 ${
            darkMode ? "bg-gray-900/70 border-gray-800" : "bg-white border-gray-200 shadow-lg"
          }`}
        >
          {/* Left: reasons */}
          <div className="lg:col-span-2 p-6 sm:p-10">
            <div className="text-center lg:text-left mb-8">
              <span className="inline-flex items-center gap-2 px-3.5 py-1.5 bg-purple-500/10 text-purple-600 dark:text-purple-400 rounded-full text-xs font-semibold mb-4 border border-purple-500/15">
                <Zap className="w-3.5 h-3.5" /> Why Choose VoxCyber?
              </span>
              <h2 className={`text-2xl sm:text-3xl font-extrabold tracking-tight ${sectionTitle}`}>
                Your success is our priority
              </h2>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-6">
              {reasons.map((reason, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.4, delay: i * 0.08 }}
                  className="text-center lg:text-left"
                >
                  <div className="w-12 h-12 rounded-xl flex items-center justify-center mb-3 mx-auto lg:mx-0 bg-blue-500/10 text-blue-500 dark:text-blue-400">
                    {reason.icon}
                  </div>
                  <h3 className={`font-bold text-sm mb-1.5 ${sectionTitle}`}>{reason.title}</h3>
                  <p className={`text-xs leading-relaxed ${sectionSub}`}>{reason.description}</p>
                </motion.div>
              ))}
            </div>
          </div>

          {/* Right: image */}
          <div className="relative min-h-[240px] lg:min-h-full">
            <img src="/David.jpg" alt="Dedicated customer support" className="absolute inset-0 w-full h-full object-cover" />
            <div className="absolute inset-0 bg-gradient-to-t lg:bg-gradient-to-l from-gray-950/80 via-gray-950/30 to-transparent"></div>
            <div className="absolute bottom-4 left-4 right-4 flex items-center gap-3 rounded-2xl bg-gray-950/70 backdrop-blur-md border border-white/10 p-3.5">
              <Headphones className="w-6 h-6 text-blue-400 flex-shrink-0" />
              <div>
                <p className="text-white font-semibold text-sm">Dedicated Support Team</p>
                <p className="text-gray-300 text-xs">Real people, ready to help you.</p>
              </div>
            </div>
          </div>
        </motion.div>
      </section>

      {/* ================= TESTIMONIALS + CTA ================= */}
      <section className="relative z-[5] max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 pb-16 sm:pb-24">
        <div className="grid lg:grid-cols-2 gap-6 lg:gap-8 items-stretch">
          {/* Left: testimonials */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className={`relative p-8 sm:p-10 rounded-3xl border flex flex-col ${
              darkMode ? "bg-gray-900/70 border-gray-800" : "bg-white border-gray-200 shadow-lg"
            }`}
          >
            <h2 className={`text-2xl sm:text-3xl font-extrabold tracking-tight mb-6 ${sectionTitle}`}>
              What Our Clients Say
            </h2>

            <div className="flex-grow flex flex-col justify-center">
              <div className="flex gap-1 mb-4">
                {Array.from({ length: 5 }).map((_, s) => (
                  <Star key={s} className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                ))}
              </div>
              <Quote className="w-9 h-9 text-blue-500/30 mb-3" />
              <p className={`text-base leading-relaxed mb-6 ${darkMode ? "text-gray-200" : "text-gray-700"}`}>
                {testimonials[activeTestimonial].quote}
              </p>
              <div className="flex items-center gap-3">
                <img
                  src={testimonials[activeTestimonial].avatar}
                  alt={testimonials[activeTestimonial].name}
                  className="w-11 h-11 rounded-full object-cover border border-white/10"
                />
                <div>
                  <p className={`text-sm font-bold ${sectionTitle}`}>{testimonials[activeTestimonial].name}</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">{testimonials[activeTestimonial].role}</p>
                </div>
              </div>
            </div>

            {/* Dots */}
            <div className="flex gap-2 mt-8">
              {testimonials.map((_, i) => (
                <button
                  key={i}
                  onClick={() => setActiveTestimonial(i)}
                  aria-label={`Show testimonial ${i + 1}`}
                  className={`h-2 rounded-full transition-all ${
                    i === activeTestimonial ? "w-6 bg-blue-500" : "w-2 bg-gray-400/40 hover:bg-gray-400/70"
                  }`}
                ></button>
              ))}
            </div>
          </motion.div>

          {/* Right: CTA */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-blue-600 via-blue-600 to-purple-600 p-8 sm:p-10 flex flex-col justify-center shadow-2xl shadow-blue-500/20"
          >
            <div className="absolute inset-0 opacity-20">
              <div className="absolute -top-10 -right-10 w-60 h-60 rounded-full bg-white/20 blur-3xl"></div>
              <div className="absolute -bottom-10 -left-10 w-60 h-60 rounded-full bg-purple-300/30 blur-3xl"></div>
            </div>
            <div className="relative">
              <div className="inline-flex w-14 h-14 rounded-2xl bg-white/15 items-center justify-center mb-5">
                <Headphones className="w-7 h-7 text-white" />
              </div>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-white mb-3">Ready to Get Started?</h2>
              <p className="text-blue-50 max-w-md mb-8">
                Let's bring your ideas to life. Contact us today for quality solutions tailored to your needs.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <button
                  onClick={openWhatsApp}
                  className="inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl font-semibold bg-white text-blue-600 hover:bg-blue-50 shadow-lg transition-all hover:-translate-y-0.5"
                >
                  <MessageCircle className="w-5 h-5" />
                  WhatsApp Us
                </button>
                <button
                  onClick={() => navigate("/websites")}
                  className="inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl font-semibold border border-white/40 text-white hover:bg-white/10 transition-all hover:-translate-y-0.5"
                >
                  Get a Free Quote
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      <Footer />
    </div>
  )
}
