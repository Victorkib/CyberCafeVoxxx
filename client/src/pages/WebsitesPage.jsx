import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Globe, 
  Code, 
  Smartphone, 
  Monitor, 
  Palette, 
  Zap, 
  Shield, 
  Search,
  ArrowRight,
  Check,
  Star,
  ExternalLink,
  Github,
  Eye
} from 'lucide-react';

const WebsitesPage = () => {
  const [activeTab, setActiveTab] = useState('websites');

  const websiteServices = [
    {
      id: 1,
      title: "Corporate Websites",
      description: "Professional business websites that build trust and drive conversions",
      features: ["Responsive Design", "SEO Optimized", "Fast Loading", "Mobile First"],
      price: "From $299",
      icon: <Monitor className="w-8 h-8" />,
      color: "bg-blue-500"
    },
    {
      id: 2,
      title: "E-commerce Stores",
      description: "Complete online stores with payment processing and inventory management",
      features: ["Payment Integration", "Inventory Management", "Order Tracking", "Analytics"],
      price: "From $599",
      icon: <Globe className="w-8 h-8" />,
      color: "bg-green-500"
    },
    {
      id: 3,
      title: "Web Applications",
      description: "Custom web applications tailored to your business needs",
      features: ["Custom Features", "User Management", "API Integration", "Scalable"],
      price: "From $999",
      icon: <Code className="w-8 h-8" />,
      color: "bg-purple-500"
    },
    {
      id: 4,
      title: "Mobile-First Sites",
      description: "Optimized for mobile devices with progressive web app features",
      features: ["PWA Ready", "Offline Support", "Push Notifications", "App-like Experience"],
      price: "From $399",
      icon: <Smartphone className="w-8 h-8" />,
      color: "bg-orange-500"
    }
  ];

  const sampleWorks = [
    {
      id: 1,
      title: "TechCorp Solutions",
      description: "Modern corporate website with advanced animations and responsive design",
      image: "/Techsetup.jpg",
      category: "Corporate",
      technologies: ["React", "Tailwind CSS", "Framer Motion"],
      liveUrl: "#",
      githubUrl: "#",
      rating: 5,
      features: ["Responsive Design", "SEO Optimized", "Fast Loading"]
    },
    {
      id: 2,
      title: "E-Shop Pro",
      description: "Complete e-commerce solution with payment integration and admin dashboard",
      image: "/GamingGearSpectacular.avif",
      category: "E-commerce",
      technologies: ["Next.js", "Stripe", "MongoDB"],
      liveUrl: "#",
      githubUrl: "#",
      rating: 5,
      features: ["Payment Processing", "Inventory Management", "User Dashboard"]
    },
    {
      id: 3,
      title: "CyberCafe Portal",
      description: "Interactive web application for cyber cafe management and booking system",
      image: "/FutureCyberCafes.avif",
      category: "Web App",
      technologies: ["React", "Node.js", "Socket.io"],
      liveUrl: "#",
      githubUrl: "#",
      rating: 5,
      features: ["Real-time Updates", "Booking System", "Admin Panel"]
    },
    {
      id: 4,
      title: "Portfolio Showcase",
      description: "Creative portfolio website with smooth animations and modern design",
      image: "/GamingMonitor.avif",
      category: "Portfolio",
      technologies: ["Vue.js", "GSAP", "Three.js"],
      liveUrl: "#",
      githubUrl: "#",
      rating: 5,
      features: ["3D Animations", "Interactive Elements", "Modern Design"]
    },
    {
      id: 5,
      title: "Restaurant Booking",
      description: "Mobile-first restaurant booking system with real-time availability",
      image: "/notebook.webp",
      category: "Mobile App",
      technologies: ["React Native", "Firebase", "Stripe"],
      liveUrl: "#",
      githubUrl: "#",
      rating: 5,
      features: ["Mobile Optimized", "Real-time Booking", "Payment Integration"]
    },
    {
      id: 6,
      title: "Learning Platform",
      description: "Educational platform with video streaming and progress tracking",
      image: "/Productivity Pack.webp",
      category: "Education",
      technologies: ["React", "Node.js", "AWS"],
      liveUrl: "#",
      githubUrl: "#",
      rating: 5,
      features: ["Video Streaming", "Progress Tracking", "Certificates"]
    }
  ];

  const technologies = [
    { name: "React", icon: "⚛️" },
    { name: "Next.js", icon: "▲" },
    { name: "Vue.js", icon: "💚" },
    { name: "Node.js", icon: "🟢" },
    { name: "MongoDB", icon: "🍃" },
    { name: "PostgreSQL", icon: "🐘" },
    { name: "AWS", icon: "☁️" },
    { name: "Docker", icon: "🐳" }
  ];

  const processSteps = [
    {
      step: 1,
      title: "Discovery & Planning",
      description: "We analyze your requirements and create a detailed project plan"
    },
    {
      step: 2,
      title: "Design & Prototyping",
      description: "Create wireframes and design mockups for your approval"
    },
    {
      step: 3,
      title: "Development",
      description: "Build your website using modern technologies and best practices"
    },
    {
      step: 4,
      title: "Testing & Launch",
      description: "Thorough testing and deployment with ongoing support"
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      {/* Hero Section */}
      <section className="relative py-20 px-4 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-600/10 to-purple-600/10"></div>
        <div className="container mx-auto max-w-7xl relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center"
          >
            <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6">
              Professional
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600">
                {" "}Web Development
              </span>
            </h1>
            <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
              Transform your ideas into stunning, high-performance websites and web applications. 
              From simple landing pages to complex e-commerce platforms, we deliver excellence.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="bg-blue-600 text-white px-8 py-4 rounded-lg font-semibold flex items-center gap-2 hover:bg-blue-700 transition-colors"
              >
                Start Your Project
                <ArrowRight className="w-5 h-5" />
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="border-2 border-blue-600 text-blue-600 px-8 py-4 rounded-lg font-semibold hover:bg-blue-50 transition-colors"
              >
                View Our Work
              </motion.button>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Services Section */}
      <section className="py-20 px-4">
        <div className="container mx-auto max-w-7xl">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Our Web Development Services</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              We offer comprehensive web development solutions tailored to your business needs
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {websiteServices.map((service, index) => (
              <motion.div
                key={service.id}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: index * 0.1 }}
                className="bg-white rounded-xl p-6 shadow-lg hover:shadow-xl transition-shadow"
              >
                <div className={`${service.color} w-16 h-16 rounded-lg flex items-center justify-center text-white mb-4`}>
                  {service.icon}
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">{service.title}</h3>
                <p className="text-gray-600 mb-4">{service.description}</p>
                <ul className="space-y-2 mb-4">
                  {service.features.map((feature, idx) => (
                    <li key={idx} className="flex items-center gap-2 text-sm text-gray-600">
                      <Check className="w-4 h-4 text-green-500" />
                      {feature}
                    </li>
                  ))}
                </ul>
                <div className="text-lg font-bold text-blue-600">{service.price}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Sample Works Section */}
      <section className="py-20 px-4 bg-gray-50">
        <div className="container mx-auto max-w-7xl">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Our Recent Work</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Explore our portfolio of successful web development projects
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {sampleWorks.map((work, index) => (
              <motion.div
                key={work.id}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: index * 0.1 }}
                className="bg-white rounded-xl overflow-hidden shadow-lg hover:shadow-xl transition-shadow"
              >
                <div className="relative h-48 overflow-hidden">
                  <img
                    src={work.image}
                    alt={work.title}
                    className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                  />
                  <div className="absolute top-4 left-4 bg-blue-600 text-white px-3 py-1 rounded-full text-sm font-medium">
                    {work.category}
                  </div>
                  <div className="absolute top-4 right-4 flex items-center gap-1 bg-white/90 backdrop-blur-sm px-2 py-1 rounded-full">
                    <Star className="w-4 h-4 text-yellow-500 fill-current" />
                    <span className="text-sm font-medium">{work.rating}</span>
                  </div>
                </div>
                <div className="p-6">
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">{work.title}</h3>
                  <p className="text-gray-600 mb-4">{work.description}</p>
                  
                  <div className="flex flex-wrap gap-2 mb-4">
                    {work.technologies.map((tech, idx) => (
                      <span key={idx} className="bg-gray-100 text-gray-700 px-3 py-1 rounded-full text-sm">
                        {tech}
                      </span>
                    ))}
                  </div>

                  <div className="space-y-2 mb-4">
                    {work.features.map((feature, idx) => (
                      <div key={idx} className="flex items-center gap-2 text-sm text-gray-600">
                        <Check className="w-4 h-4 text-green-500" />
                        {feature}
                      </div>
                    ))}
                  </div>

                  <div className="flex gap-3">
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-lg font-medium flex items-center justify-center gap-2 hover:bg-blue-700 transition-colors"
                    >
                      <Eye className="w-4 h-4" />
                      View Live
                    </motion.button>
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      className="flex-1 border border-gray-300 text-gray-700 py-2 px-4 rounded-lg font-medium flex items-center justify-center gap-2 hover:bg-gray-50 transition-colors"
                    >
                      <Github className="w-4 h-4" />
                      Code
                    </motion.button>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Technologies Section */}
      <section className="py-20 px-4">
        <div className="container mx-auto max-w-7xl">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Technologies We Use</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              We stay up-to-date with the latest technologies to deliver cutting-edge solutions
            </p>
          </motion.div>

          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-6">
            {technologies.map((tech, index) => (
              <motion.div
                key={tech.name}
                initial={{ opacity: 0, scale: 0.8 }}
                whileInView={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="bg-white rounded-lg p-6 shadow-md hover:shadow-lg transition-shadow text-center"
              >
                <div className="text-3xl mb-2">{tech.icon}</div>
                <div className="text-sm font-medium text-gray-700">{tech.name}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Process Section */}
      <section className="py-20 px-4 bg-gray-50">
        <div className="container mx-auto max-w-7xl">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Our Development Process</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              We follow a proven process to ensure your project is delivered on time and exceeds expectations
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {processSteps.map((step, index) => (
              <motion.div
                key={step.step}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: index * 0.1 }}
                className="text-center"
              >
                <div className="w-16 h-16 bg-blue-600 text-white rounded-full flex items-center justify-center text-2xl font-bold mx-auto mb-4">
                  {step.step}
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">{step.title}</h3>
                <p className="text-gray-600">{step.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4">
        <div className="container mx-auto max-w-4xl">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl p-12 text-center text-white"
          >
            <h2 className="text-4xl font-bold mb-4">Ready to Start Your Project?</h2>
            <p className="text-xl mb-8 opacity-90">
              Let's discuss your vision and bring it to life with our expert web development team
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="bg-white text-blue-600 px-8 py-4 rounded-lg font-semibold hover:bg-gray-100 transition-colors"
              >
                Get Free Quote
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="border-2 border-white text-white px-8 py-4 rounded-lg font-semibold hover:bg-white/10 transition-colors"
              >
                Schedule Consultation
              </motion.button>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
};

export default WebsitesPage;

