import React, { useState } from 'react';
import { motion } from 'framer-motion';

const ServiceCard = ({ 
  service, 
  index = 0,
  className = '' 
}) => {
  const [isHovered, setIsHovered] = useState(false);

  const cardVariants = {
    hidden: { 
      opacity: 0, 
      y: 50,
      scale: 0.9
    },
    visible: { 
      opacity: 1, 
      y: 0,
      scale: 1,
      transition: {
        duration: 0.6,
        delay: index * 0.1,
        ease: "easeOut"
      }
    },
    hover: {
      y: -8,
      scale: 1.02,
      transition: {
        duration: 0.3,
        ease: "easeOut"
      }
    }
  };

  const iconVariants = {
    initial: { 
      scale: 1,
      rotate: 0
    },
    hover: { 
      scale: 1.1,
      rotate: 5,
      transition: {
        duration: 0.3,
        ease: "easeOut"
      }
    }
  };

  const glowVariants = {
    initial: {
      boxShadow: "0 10px 25px rgba(0, 0, 0, 0.1)"
    },
    hover: {
      boxShadow: [
        "0 10px 25px rgba(0, 0, 0, 0.1)",
        "0 20px 40px rgba(37, 99, 235, 0.2), 0 0 20px rgba(37, 99, 235, 0.1)",
        "0 25px 50px rgba(37, 99, 235, 0.3), 0 0 30px rgba(37, 99, 235, 0.2)"
      ],
      transition: {
        duration: 0.4,
        ease: "easeInOut"
      }
    }
  };

  return (
    <motion.div
      className={`relative bg-white rounded-xl p-4 sm:p-6 border border-gray-100 cursor-pointer overflow-hidden ${className}`}
      variants={cardVariants}
      initial="hidden"
      whileInView="visible"
      whileHover="hover"
      animate={glowVariants}
      onHoverStart={() => setIsHovered(true)}
      onHoverEnd={() => setIsHovered(false)}
      viewport={{ once: true, margin: "-50px" }}
    >
      {/* Gradient overlay that appears on hover */}
      <motion.div
        className="absolute inset-0 bg-gradient-to-br from-blue-50/50 to-purple-50/50 opacity-0"
        animate={{
          opacity: isHovered ? 1 : 0
        }}
        transition={{ duration: 0.3 }}
      />
      
      {/* Animated border glow */}
      <motion.div
        className="absolute inset-0 rounded-xl"
        animate={{
          background: isHovered 
            ? "linear-gradient(45deg, rgba(37, 99, 235, 0.1), rgba(139, 92, 246, 0.1))"
            : "transparent"
        }}
        transition={{ duration: 0.3 }}
      />

      <div className="relative z-10">
        {/* Icon container */}
        <motion.div
          className="w-12 h-12 sm:w-16 sm:h-16 mb-3 sm:mb-4 flex items-center justify-center rounded-lg bg-gradient-to-br from-blue-500 to-blue-600 text-white"
          variants={iconVariants}
          initial="initial"
          animate={isHovered ? "hover" : "initial"}
        >
          <span className="text-xl sm:text-2xl">{service.icon}</span>
        </motion.div>

        {/* Title */}
        <motion.h3 
          className="text-lg sm:text-xl font-bold text-gray-900 mb-2 sm:mb-3 leading-tight"
          animate={{
            color: isHovered ? "#2563eb" : "#111827"
          }}
          transition={{ duration: 0.3 }}
        >
          {service.title}
        </motion.h3>

        {/* Description */}
        <p className="text-sm sm:text-base text-gray-600 mb-3 sm:mb-4 leading-relaxed">
          {service.description}
        </p>

        {/* Features list */}
        {service.features && service.features.length > 0 && (
          <motion.ul 
            className="space-y-1.5 sm:space-y-2 mb-4"
            animate={{
              opacity: isHovered ? 1 : 0.8
            }}
            transition={{ duration: 0.3 }}
          >
            {service.features.slice(0, 3).map((feature, idx) => (
              <motion.li 
                key={idx}
                className="flex items-start text-xs sm:text-sm text-gray-600"
                initial={{ x: -10, opacity: 0 }}
                animate={{ 
                  x: isHovered ? 0 : -10, 
                  opacity: isHovered ? 1 : 0.7 
                }}
                transition={{ 
                  duration: 0.3, 
                  delay: idx * 0.05 
                }}
              >
                <motion.span 
                  className="w-1.5 h-1.5 bg-blue-500 rounded-full mr-2 sm:mr-3 flex-shrink-0 mt-1.5"
                  animate={{
                    scale: isHovered ? 1.2 : 1,
                    backgroundColor: isHovered ? "#2563eb" : "#3b82f6"
                  }}
                  transition={{ duration: 0.3 }}
                />
                <span className="leading-relaxed">{feature}</span>
              </motion.li>
            ))}
          </motion.ul>
        )}

        {/* Technologies badge (visible on hover) */}
        {service.technologies && (
          <motion.div
            className="flex flex-wrap gap-1 sm:gap-2 mb-2"
            initial={{ opacity: 0, height: 0 }}
            animate={{ 
              opacity: isHovered ? 1 : 0,
              height: isHovered ? 'auto' : 0
            }}
            transition={{ duration: 0.3 }}
          >
            {service.technologies.slice(0, 3).map((tech, idx) => (
              <span
                key={idx}
                className="px-2 py-1 bg-blue-50 text-blue-600 text-xs rounded-full font-medium"
              >
                {tech}
              </span>
            ))}
          </motion.div>
        )}

        {/* Hover indicator */}
        <motion.div
          className="absolute bottom-3 sm:bottom-4 right-3 sm:right-4 w-6 h-6 sm:w-8 sm:h-8 rounded-full bg-blue-500 flex items-center justify-center text-white opacity-0"
          animate={{
            opacity: isHovered ? 1 : 0,
            scale: isHovered ? 1 : 0.8,
            rotate: isHovered ? 0 : -90
          }}
          transition={{ duration: 0.3 }}
        >
          <svg 
            className="w-3 h-3 sm:w-4 sm:h-4" 
            fill="none" 
            stroke="currentColor" 
            viewBox="0 0 24 24"
          >
            <path 
              strokeLinecap="round" 
              strokeLinejoin="round" 
              strokeWidth={2} 
              d="M9 5l7 7-7 7" 
            />
          </svg>
        </motion.div>
      </div>
    </motion.div>
  );
};

export default ServiceCard;