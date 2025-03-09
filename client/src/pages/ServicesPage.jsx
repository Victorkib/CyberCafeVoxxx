"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import {
  Car,
  Briefcase,
  FileText,
  Users,
  Search,
  BadgeCheck,
  BookOpen,
  Building2,
  StampIcon as Passport,
  Calendar,
  ClipboardCheck,
  RotateCw,
  MessageCircle,
} from "lucide-react"
import "./services.scss"

export default function ServicesPage() {
  const [activeTab, setActiveTab] = useState("all")
  const [selectedService, setSelectedService] = useState(null)
  const [isModalOpen, setIsModalOpen] = useState(false)

  const services = {
    vehicle: [
      {
        id: "motor-search",
        title: "Motor Vehicle Search",
        icon: <Car />,
        description: "Requirements : Vehicle Details (On Number Plate)",
        category: "vehicle",
        steps: ["Enter vehicle registration number", "Verify ownership details", "Receive comprehensive report"],
      },
      {
        id: "tsv-badge",
        title: "TSV Badge Application",
        icon: <BadgeCheck />,
        description: "Tour Service Vehicle (TSV) Badge Application for Tour Drivers and Tour Guides",
        category: "vehicle",
        steps: ["Submit required documents", "Complete application form", "Pay processing fee", "Receive TSV badge"],
      },
      {
        id: "psv-badge",
        title: "PSV Badge Application",
        icon: <Users />,
        description: "Passenger Service Vehicle (PSV) Badge Application for Uber and Institution Drivers",
        category: "vehicle",
        steps: ["Submit driver credentials", "Complete PSV application", "Pay badge fee", "Collect PSV badge"],
      },
      {
        id: "logbook",
        title: "Logbook Transfer",
        icon: <BookOpen />,
        description: "Includes Transfer of Logbook & Acceptance of Ownership",
        category: "vehicle",
        steps: ["Submit current logbook", "Complete transfer forms", "Pay transfer fees", "Receive new logbook"],
      },
    ],
    government: [
      {
        id: "kra-pin",
        title: "KRA Pin Registration & Returns",
        icon: <FileText />,
        description:
          "KRA PIN registration for Individual & Non Individual. Returns for Individual, VAT RENTAL & PAYE. Advance tax for Commercial & PSV vehicles.",
        category: "government",
        steps: ["Submit personal information", "Verify identity", "Receive KRA PIN", "File returns online"],
      },
      {
        id: "business-reg",
        title: "Business Name Registration",
        icon: <Briefcase />,
        description: "Includes Name search & Business name registration.",
        category: "government",
        steps: ["Search business name", "Reserve name", "Submit registration", "Receive certificate"],
      },
      {
        id: "company-reg",
        title: "Limited Company Registration",
        icon: <Building2 />,
        description: "Includes Name search, Registration, Certificate of Incorporation & CR12",
        category: "government",
        steps: [
          "Company name search",
          "Submit required documents",
          "Pay registration fees",
          "Receive incorporation certificate",
        ],
      },
    ],
    travel: [
      {
        id: "passport-app",
        title: "Passport Application",
        icon: <Passport />,
        description: "Include renew or replace your passport to the current version",
        category: "travel",
        steps: ["Complete application form", "Submit required documents", "Pay passport fees", "Schedule appointment"],
      },
      {
        id: "passport-booking",
        title: "Passport Booking",
        icon: <Calendar />,
        description: "Booking the convenient date and time for Photo capture",
        category: "travel",
        steps: ["Choose preferred date", "Select time slot", "Confirm booking", "Receive confirmation"],
      },
      {
        id: "passport-collection",
        title: "Passport Collection Booking",
        icon: <ClipboardCheck />,
        description: "Includes Booking the convenient date and time to pick the passport",
        category: "travel",
        steps: ["Enter passport details", "Choose collection date", "Select time slot", "Get collection slip"],
      },
    ],
    inspection: [
      {
        id: "vehicle-inspection",
        title: "Inspection Booking",
        icon: <Search />,
        description:
          "Includes Annual inspection, Change of particular Inspection like Number of passengers, Engine, Colour etc. date extend & Centre change",
        category: "inspection",
        steps: ["Select inspection type", "Choose inspection center", "Book appointment", "Pay inspection fees"],
      },
      {
        id: "duplicate-logbook",
        title: "Application of Duplicate Logbook",
        icon: <RotateCw />,
        description: "Includes lost and defaced logbook.",
        category: "inspection",
        steps: [
          "Report lost/damaged logbook",
          "Submit required documents",
          "Pay processing fee",
          "Receive duplicate logbook",
        ],
      },
    ],
  }

  const categories = [
    { id: "all", label: "ALL SERVICES" },
    { id: "vehicle", label: "VEHICLE" },
    { id: "government", label: "GOVERNMENT" },
    { id: "travel", label: "TRAVEL" },
    { id: "inspection", label: "INSPECTION" },
  ]

  const filterServices = (category) => {
    if (category === "all") {
      return Object.values(services).flat()
    }
    return services[category] || []
  }

  const handleRequest = (service) => {
    const message = `Hello, I would like to inquire about ${service.title}`
    window.open(`https://wa.me/+254700000000?text=${encodeURIComponent(message)}`, "_blank")
  }

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  }

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        duration: 0.5,
      },
    },
  }

  return (
    <div className="services-page">
      {/* Hero Section */}
      <div className="services-hero">
        <div className="cyber-grid"></div>
        <div className="hero-content">
          <nav className="breadcrumb">
            <a href="/">Home</a>
            <span className="separator">/</span>
            <span className="current">Services</span>
          </nav>
          <motion.h1 initial={{ y: -20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ duration: 0.5 }}>
            Our Services
          </motion.h1>
          <motion.p
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            Fast, reliable, and secure government service processing
          </motion.p>
        </div>
      </div>

      {/* Main Content */}
      <div className="services-content">
        {/* Category Tabs */}
        <div className="category-tabs">
          {categories.map((category, index) => (
            <motion.button
              key={category.id}
              className={`category-tab ${activeTab === category.id ? "active" : ""}`}
              onClick={() => setActiveTab(category.id)}
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              {category.label}
              {activeTab === category.id && <motion.div className="tab-indicator" layoutId="tab-indicator" />}
            </motion.button>
          ))}
        </div>

        {/* Services Grid */}
        <motion.div className="services-grid" variants={containerVariants} initial="hidden" animate="visible">
          <AnimatePresence mode="wait">
            {filterServices(activeTab).map((service) => (
              <motion.div
                key={service.id}
                className="service-card"
                variants={itemVariants}
                whileHover={{ y: -5, transition: { duration: 0.2 } }}
                onClick={() => {
                  setSelectedService(service)
                  setIsModalOpen(true)
                }}
              >
                <div className="service-icon">
                  {service.icon}
                  <div className="icon-bg"></div>
                </div>
                <h3>{service.title}</h3>
                <p>{service.description}</p>
                <button
                  className="request-btn"
                  onClick={(e) => {
                    e.stopPropagation()
                    handleRequest(service)
                  }}
                >
                  REQUEST
                  <MessageCircle className="whatsapp-icon" />
                </button>
              </motion.div>
            ))}
          </AnimatePresence>
        </motion.div>
      </div>

      {/* Service Detail Modal */}
      <AnimatePresence>
        {isModalOpen && selectedService && (
          <motion.div
            className="modal-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsModalOpen(false)}
          >
            <motion.div
              className="modal-content"
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="modal-header">
                <div className="modal-icon">{selectedService.icon}</div>
                <h2>{selectedService.title}</h2>
                <button className="close-btn" onClick={() => setIsModalOpen(false)}>
                  ×
                </button>
              </div>
              <div className="modal-body">
                <p>{selectedService.description}</p>
                <h4>Process Steps:</h4>
                <ul className="steps-list">
                  {selectedService.steps.map((step, index) => (
                    <motion.li
                      key={index}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1 }}
                    >
                      <span className="step-number">{index + 1}</span>
                      {step}
                    </motion.li>
                  ))}
                </ul>
                <button className="request-btn-large" onClick={() => handleRequest(selectedService)}>
                  Request via WhatsApp
                  <MessageCircle className="whatsapp-icon" />
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* CTA Section */}
      <div className="services-cta">
        <div className="cta-content">
          <motion.h2 initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
            Need Help with Government Services?
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
          >
            Our team of experts is ready to assist you with any service request
          </motion.p>
          <motion.div
            className="cta-buttons"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.4 }}
          >
            <button className="btn-primary">Contact Us</button>
            <button className="btn-secondary">View All Services</button>
          </motion.div>
        </div>
      </div>
    </div>
  )
}

