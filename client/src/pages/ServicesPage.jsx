"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import {
  Sparkles,
  MessageSquare,
  TrendingUp,
  Image,
  Share2,
  BarChart3,
  Users,
  Settings,
  ChevronDown,
  ArrowRight,
  Check,
  Send,
  HelpCircle
} from "lucide-react"
import { useSelector } from "react-redux"

export default function ServicesPage() {
  const { darkMode } = useSelector((state) => state.ui)
  const [activeFAQ, setActiveFAQ] = useState(null)

  // Core features of social media management
  const coreServices = [
    {
      icon: <TrendingUp className="w-6 h-6 text-blue-500" />,
      title: "Strategy & Brand Planning",
      description: "Custom monthly content calendars aligned with your specific business goals, target audience, and brand voice."
    },
    {
      icon: <Image className="w-6 h-6 text-purple-500" />,
      title: "Content Creation & Graphic Design",
      description: "Stunning custom visuals, reels, carousels, and templates that grab attention and drive engagement."
    },
    {
      icon: <Users className="w-6 h-6 text-emerald-500" />,
      title: "Community Management",
      description: "Active monitoring, prompt replies to comments/DMs, and proactive outreach to build a loyal community."
    },
    {
      icon: <Share2 className="w-6 h-6 text-pink-500" />,
      title: "Multi-Platform Scheduling",
      description: "Consistent posting schedules across Facebook, Instagram, LinkedIn, TikTok, and Twitter/X at peak times."
    },
    {
      icon: <BarChart3 className="w-6 h-6 text-orange-500" />,
      title: "Paid Campaign Management",
      description: "Strategic setup, tracking, and optimization of social ads to maximize conversions and ROI."
    },
    {
      icon: <Settings className="w-6 h-6 text-cyan-500" />,
      title: "Analytics & Performance Reporting",
      description: "Comprehensive monthly reports detailing key growth metrics, reach, engagement, and next-phase strategies."
    }
  ]

  // Pricing plans
  const packages = [
    {
      name: "Starter Plan",
      price: "KSh 19,999",
      period: "month",
      description: "Perfect for local shops and startups establishing a basic social footprint.",
      features: [
        "2 Social Media Accounts (FB & IG)",
        "3 Custom Grid Posts per week",
        "Basic Page Optimization",
        "Strategic Hashtag Research",
        "Monthly PDF Performance Report",
        "Standard Email Support"
      ],
      popular: false,
      color: "blue"
    },
    {
      name: "Growth Plan",
      price: "KSh 39,999",
      period: "month",
      description: "Best for scaling brands requiring active engagement and content diversity.",
      features: [
        "3 Accounts (FB, IG, LinkedIn/Twitter)",
        "5 Posts per week + 2 Video Reels",
        "Custom Visuals & Brand Copywriting",
        "Basic Community Management (Comments)",
        "Basic Paid Ads Campaign Management",
        "Monthly Strategy Session",
        "Priority Support"
      ],
      popular: true,
      color: "purple"
    },
    {
      name: "Enterprise Plan",
      price: "KSh 74,999",
      period: "month",
      description: "Full-service digital dominance with dedicated resources.",
      features: [
        "4+ Accounts (FB, IG, LinkedIn, TikTok)",
        "Daily Posts + 4 Short-Form Videos",
        "Dedicated Content Manager",
        "Full Community Management & DM replies",
        "Advanced Ads Setup & Retargeting",
        "Weekly Optimization & Analytics",
        "24/7 Priority Whatsapp & Slack Access"
      ],
      popular: false,
      color: "emerald"
    }
  ]

  // FAQs
  const faqs = [
    {
      question: "What platforms do you support?",
      answer: "We support all major social channels, including Facebook, Instagram, LinkedIn, Twitter/X, TikTok, Pinterest, and Google Business Profile."
    },
    {
      question: "Do I get to approve the content before it goes live?",
      answer: "Absolutely! We create content batches 1-2 weeks in advance and share a preview link for your approval or feedback before scheduling anything."
    },
    {
      question: "Is the advertising budget included in the package price?",
      answer: "No, the ad budget goes directly to Meta, LinkedIn, or Google and is paid separately. We manage and optimize your campaigns within your target budget."
    },
    {
      question: "Are we bound to long-term contracts?",
      answer: "Our plans are month-to-month. You can upgrade, downgrade, or cancel your subscription at any time with a 14-day notice."
    }
  ]

  const handleSelectPackage = (packageName) => {
    const message = `Hello VoxCyber! I'm interested in inquiring about the "${packageName}" Social Media Management package for my business.`
    window.open(`https://wa.me/+254700000000?text=${encodeURIComponent(message)}`, "_blank")
  }

  const handleCustomInquiry = () => {
    const message = `Hello VoxCyber! I would like to request a custom quote for Social Media Management/Ad campaigns for my brand.`
    window.open(`https://wa.me/+254700000000?text=${encodeURIComponent(message)}`, "_blank")
  }

  return (
    <div className="py-4 md:py-8">
      
      {/* Hero Section */}
      <section className="text-center max-w-4xl mx-auto mb-16 md:mb-24 px-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
          className="inline-flex items-center gap-2 px-3.5 py-1.5 bg-blue-500/10 text-blue-600 dark:text-blue-400 rounded-full text-xs font-semibold mb-6 border border-blue-500/15"
        >
          <Sparkles className="w-3.5 h-3.5" />
          <span>Elevate Your Online Presence</span>
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 25 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className={`text-4xl sm:text-5xl md:text-6xl font-extrabold tracking-tight mb-6 leading-tight`}
        >
          Social Media Accounts{" "}
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600 dark:from-blue-400 dark:to-purple-400">
            Management for Businesses
          </span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="text-base sm:text-lg text-gray-600 dark:text-gray-300 leading-relaxed max-w-2xl mx-auto mb-8"
        >
          Stop struggling with consistency. We design high-converting content, manage your channels, launch targeted ad campaigns, and engage your followers so you can focus on running your business.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="flex flex-wrap justify-center gap-4"
        >
          <button
            onClick={handleCustomInquiry}
            className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-full font-bold shadow-lg hover:shadow-blue-500/20 transition-all flex items-center gap-2"
          >
            <span>Consult an Expert</span>
            <Send className="w-4 h-4" />
          </button>
          <a
            href="#packages"
            className={`px-6 py-3 rounded-full font-bold border transition-colors ${
              darkMode
                ? "border-gray-800 bg-gray-900/60 hover:bg-gray-800 text-gray-200"
                : "border-gray-200 bg-white hover:bg-gray-50 text-gray-700"
            }`}
          >
            View Pricing
          </a>
        </motion.div>
      </section>

      {/* Core Deliverables Grid */}
      <section className="mb-24 px-4">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <h2 className="text-3xl font-bold mb-4">Complete Channel Management</h2>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Everything your brand needs to thrive on digital platforms. Done for you by experts.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {coreServices.map((service, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className={`p-6 rounded-2xl border transition-all duration-300 ${
                darkMode
                  ? "bg-gray-900/50 border-gray-800 hover:border-gray-700 hover:bg-gray-900"
                  : "bg-white border-gray-100 hover:border-gray-200 hover:shadow-md"
              }`}
            >
              <div className="w-12 h-12 rounded-xl bg-blue-50 dark:bg-gray-800 flex items-center justify-center mb-6">
                {service.icon}
              </div>
              <h3 className="text-lg font-bold mb-3">{service.title}</h3>
              <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed">{service.description}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Pricing / Packages Table */}
      <section id="packages" className="mb-24 px-4 scroll-mt-24">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <h2 className="text-3xl font-bold mb-4">Transparent Pricing Packages</h2>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Choose a plan that fits your current goals. No hidden setup costs.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-start">
          {packages.map((pkg, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: index * 0.15 }}
              className={`relative rounded-3xl border p-8 flex flex-col transition-all duration-300 ${
                pkg.popular
                  ? "border-blue-500 dark:border-blue-400 shadow-xl ring-2 ring-blue-500/20"
                  : darkMode
                  ? "border-gray-800 bg-gray-900/40"
                  : "border-gray-200 bg-white"
              }`}
            >
              {pkg.popular && (
                <div className="absolute top-0 right-1/2 translate-x-1/2 -translate-y-1/2 bg-gradient-to-r from-blue-600 to-purple-600 dark:from-blue-500 dark:to-purple-500 text-white text-xs font-bold px-4 py-1 rounded-full uppercase tracking-wider">
                  Most Popular
                </div>
              )}

              <div className="mb-6">
                <h3 className="text-xl font-bold mb-2">{pkg.name}</h3>
                <p className="text-xs text-gray-400 min-h-[40px]">{pkg.description}</p>
              </div>

              <div className="flex items-baseline gap-1 mb-8">
                <span className="text-4xl font-extrabold tracking-tight">{pkg.price}</span>
                <span className="text-sm text-gray-400">/{pkg.period}</span>
              </div>

              <ul className="space-y-4 mb-8 flex-grow border-t border-gray-100 dark:border-gray-800 pt-6">
                {pkg.features.map((feature, fIdx) => (
                  <li key={fIdx} className="flex items-start text-sm">
                    <Check className="w-5 h-5 text-blue-500 dark:text-blue-400 mr-2 flex-shrink-0 mt-0.5" />
                    <span className="text-gray-600 dark:text-gray-300">{feature}</span>
                  </li>
                ))}
              </ul>

              <button
                onClick={() => handleSelectPackage(pkg.name)}
                className={`w-full py-3 rounded-xl font-bold transition-all flex items-center justify-center gap-2 ${
                  pkg.popular
                    ? "bg-blue-600 hover:bg-blue-700 text-white shadow-lg hover:shadow-blue-500/20"
                    : darkMode
                    ? "bg-gray-800 hover:bg-gray-700 text-gray-200"
                    : "bg-gray-100 hover:bg-gray-200 text-gray-800"
                }`}
              >
                <span>Request Package</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </motion.div>
          ))}
        </div>
      </section>

      {/* FAQs Section */}
      <section className="max-w-3xl mx-auto mb-24 px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold flex items-center justify-center gap-2">
            <HelpCircle className="w-7 h-7 text-blue-500" />
            Frequently Asked Questions
          </h2>
        </div>

        <div className="space-y-4">
          {faqs.map((faq, index) => {
            const isOpen = activeFAQ === index
            return (
              <div
                key={index}
                className={`border rounded-2xl overflow-hidden transition-colors ${
                  darkMode ? "border-gray-800 bg-gray-950" : "border-gray-100 bg-white"
                }`}
              >
                <button
                  onClick={() => setActiveFAQ(isOpen ? null : index)}
                  className="w-full flex justify-between items-center p-6 text-left font-bold text-base transition-colors hover:text-blue-500"
                >
                  <span>{faq.question}</span>
                  <ChevronDown
                    className={`w-5 h-5 text-gray-400 transition-transform duration-300 ${
                      isOpen ? "rotate-180 text-blue-500" : ""
                    }`}
                  />
                </button>
                
                <AnimatePresence initial={false}>
                  {isOpen && (
                    <motion.div
                      initial={{ height: 0 }}
                      animate={{ height: "auto" }}
                      exit={{ height: 0 }}
                      transition={{ duration: 0.3 }}
                      className="overflow-hidden"
                    >
                      <div className="p-6 pt-0 text-sm text-gray-500 dark:text-gray-400 border-t border-gray-100 dark:border-gray-800 leading-relaxed">
                        {faq.answer}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            )
          })}
        </div>
      </section>

      {/* Custom Quote CTA Banner */}
      <section className="px-4">
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 dark:from-blue-700 dark:to-purple-700 rounded-3xl p-8 sm:p-12 text-center text-white relative overflow-hidden shadow-xl">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(255,255,255,0.15),transparent_50%)]"></div>
          <div className="relative z-10 max-w-2xl mx-auto">
            <h2 className="text-3xl font-bold mb-4">Need a Custom Social Strategy?</h2>
            <p className="text-sm sm:text-base text-blue-100 leading-relaxed mb-8">
              We understand that every business is unique. Contact us today to request a custom strategy plan and quote specifically aligned with your operations.
            </p>
            <button
              onClick={handleCustomInquiry}
              className="px-8 py-3.5 bg-white hover:bg-gray-100 text-blue-700 font-bold rounded-full shadow-lg transition-transform hover:scale-105 active:scale-95"
            >
              Get Custom Proposal
            </button>
          </div>
        </div>
      </section>

    </div>
  )
}
