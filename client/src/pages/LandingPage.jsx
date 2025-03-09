"use client"

import { useState } from "react"
import { ShoppingBag, Wrench, Globe, ArrowRight } from "lucide-react"
import "./landing.scss"

export default function LandingPage() {
  const [activeService, setActiveService] = useState("shop")
  const [hoveredLinks, setHoveredLinks] = useState({})

  const services = {
    shop: {
      title: "Online Shop",
      description:
        "Create and manage your online store with powerful e-commerce tools, inventory management, and secure payment processing.",
      icon: <ShoppingBag />,
      link: "/shop",
    },
    services: {
      title: "Digital Services",
      description:
        "Offer your services online with booking systems, client management, and automated workflows to streamline your business.",
      icon: <Wrench />,
      link: "/services",
    },
    websites: {
      title: "Website Builder",
      description:
        "Design and deploy stunning websites with our intuitive builder, custom templates, and powerful SEO tools.",
      icon: <Globe />,
      link: "/websites",
    },
  }

  const handleLinkHover = (linkId, isHovered) => {
    setHoveredLinks({ ...hoveredLinks, [linkId]: isHovered })
  }

  return (
    <div className="landing-container">
      {/* Background elements */}
      <div className="bg-circle bg-circle-1"></div>
      <div className="bg-circle bg-circle-2"></div>
      <div className="bg-circle bg-circle-3"></div>

      {/* Cyber background image */}
      <div className="cyber-image-container">
        <img
          src="https://images.unsplash.com/photo-1550751827-4bd374c3f58b?auto=format&fit=crop&q=80&w=2070"
          alt="Cyber background"
        />
      </div>

      {/* Cyber overlay pattern */}
      <div className="cyber-overlay"></div>

      {/* Header */}
      <header className="header">
        <div className="logo">
          <div className="logo-icon">V</div>
          <span className="logo-text">VoxCyber</span>
        </div>
        <nav className="nav">
          <a
            href="#shop"
            className={`nav-link ${hoveredLinks["shop"] ? "hover" : ""}`}
            onClick={(e) => {
              e.preventDefault()
              setActiveService("shop")
            }}
            onMouseEnter={() => handleLinkHover("shop", true)}
            onMouseLeave={() => handleLinkHover("shop", false)}
          >
            Shop
          </a>
          <a
            href="#services"
            className={`nav-link ${hoveredLinks["services"] ? "hover" : ""}`}
            onClick={(e) => {
              e.preventDefault()
              setActiveService("services")
            }}
            onMouseEnter={() => handleLinkHover("services", true)}
            onMouseLeave={() => handleLinkHover("services", false)}
          >
            Services
          </a>
          <a
            href="#websites"
            className={`nav-link ${hoveredLinks["websites"] ? "hover" : ""}`}
            onClick={(e) => {
              e.preventDefault()
              setActiveService("websites")
            }}
            onMouseEnter={() => handleLinkHover("websites", true)}
            onMouseLeave={() => handleLinkHover("websites", false)}
          >
            Websites
          </a>
        </nav>
        <div className="auth-buttons">
          <button className="btn btn-outline">Log In</button>
          <button className="btn btn-primary">Sign Up</button>
        </div>
        <button className="menu-toggle">
          <span></span>
          <span></span>
          <span></span>
        </button>
      </header>

      {/* Main content */}
      <main className="main-content">
        <div className="hero-section">
          <div className="hero-content">
            <div className="badge">Next-Gen Cyber Solutions</div>
            <h1 className="hero-title">
              Welcome to <span className="highlight">VoxCyber</span>
            </h1>
            <p className="hero-description">
              Empowering your digital presence with cutting-edge cybersecurity solutions and comprehensive digital
              services.
            </p>
            <div className="hero-buttons">
              <button className="btn btn-primary btn-lg">
                Get Started
                <ArrowRight className="btn-icon" />
              </button>
              <button className="btn btn-outline btn-lg">Learn More</button>
            </div>
          </div>
        </div>

        <div className="services-section">
          <div className="services-tabs">
            {Object.keys(services).map((key) => (
              <button
                key={key}
                className={`service-tab ${activeService === key ? "active" : ""}`}
                onClick={() => setActiveService(key)}
              >
                <div className="service-tab-icon">{services[key].icon}</div>
                <span className="service-tab-text">{services[key].title}</span>
              </button>
            ))}
          </div>

          <div className="service-details">
            <div className="service-icon">{services[activeService].icon}</div>
            <h2 className="service-title">{services[activeService].title}</h2>
            <p className="service-description">{services[activeService].description}</p>
            <a
              href={services[activeService].link}
              className="service-link"
              onMouseEnter={() => handleLinkHover("serviceLink", true)}
              onMouseLeave={() => handleLinkHover("serviceLink", false)}
            >
              Explore {services[activeService].title}
              <ArrowRight className={`link-icon ${hoveredLinks["serviceLink"] ? "hover" : ""}`} />
            </a>
          </div>
        </div>
      </main>

      {/* Floating service cards */}
      <div className={`service-card service-card-shop ${activeService === "shop" ? "active" : ""}`}>
        <div className="service-card-icon">
          <ShoppingBag />
        </div>
        <div className="service-card-content">
          <h3>Online Shop</h3>
          <ul className="feature-list">
            <li>Product Management</li>
            <li>Secure Payments</li>
            <li>Inventory Tracking</li>
          </ul>
        </div>
      </div>

      <div className={`service-card service-card-services ${activeService === "services" ? "active" : ""}`}>
        <div className="service-card-icon">
          <Wrench />
        </div>
        <div className="service-card-content">
          <h3>Digital Services</h3>
          <ul className="feature-list">
            <li>Booking System</li>
            <li>Client Management</li>
            <li>Automated Workflows</li>
          </ul>
        </div>
      </div>

      <div className={`service-card service-card-websites ${activeService === "websites" ? "active" : ""}`}>
        <div className="service-card-icon">
          <Globe />
        </div>
        <div className="service-card-content">
          <h3>Website Builder</h3>
          <ul className="feature-list">
            <li>Drag & Drop Builder</li>
            <li>Responsive Templates</li>
            <li>SEO Tools</li>
          </ul>
        </div>
      </div>

      {/* Footer */}
      <footer className="footer">
        <p className="copyright">© {new Date().getFullYear()} VoxCyber. All rights reserved.</p>
        <div className="footer-links">
          <a
            href="/terms"
            className={`footer-link ${hoveredLinks["terms"] ? "hover" : ""}`}
            onMouseEnter={() => handleLinkHover("terms", true)}
            onMouseLeave={() => handleLinkHover("terms", false)}
          >
            Terms
          </a>
          <a
            href="/privacy"
            className={`footer-link ${hoveredLinks["privacy"] ? "hover" : ""}`}
            onMouseEnter={() => handleLinkHover("privacy", true)}
            onMouseLeave={() => handleLinkHover("privacy", false)}
          >
            Privacy
          </a>
          <a
            href="/contact"
            className={`footer-link ${hoveredLinks["contact"] ? "hover" : ""}`}
            onMouseEnter={() => handleLinkHover("contact", true)}
            onMouseLeave={() => handleLinkHover("contact", false)}
          >
            Contact
          </a>
        </div>
      </footer>
    </div>
  )
}

