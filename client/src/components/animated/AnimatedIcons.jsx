import React, { useState, useEffect, useRef } from 'react';

// Innovation Icon - Lightbulb
export const InnovationIcon = ({ isVisible, className = "" }) => {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <div 
      className={`relative w-16 h-16 mx-auto ${className}`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <svg
        viewBox="0 0 64 64"
        className={`w-full h-full transition-all duration-500 ${
          isVisible ? 'animate-bounce-in' : 'opacity-0 scale-75'
        } ${isHovered ? 'scale-110 drop-shadow-lg' : ''}`}
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* Lightbulb base */}
        <circle
          cx="32"
          cy="28"
          r="12"
          stroke="currentColor"
          strokeWidth="2"
          fill="none"
          className={`transition-all duration-300 ${
            isHovered ? 'stroke-yellow-400 fill-yellow-100' : 'stroke-blue-500'
          }`}
        />
        
        {/* Lightbulb screw threads */}
        <rect
          x="28"
          y="40"
          width="8"
          height="8"
          rx="1"
          stroke="currentColor"
          strokeWidth="2"
          fill="none"
          className="stroke-blue-500"
        />
        <line x1="26" y1="42" x2="38" y2="42" stroke="currentColor" strokeWidth="1" className="stroke-blue-400" />
        <line x1="26" y1="44" x2="38" y2="44" stroke="currentColor" strokeWidth="1" className="stroke-blue-400" />
        <line x1="26" y1="46" x2="38" y2="46" stroke="currentColor" strokeWidth="1" className="stroke-blue-400" />
        
        {/* Filament */}
        <path
          d="M28 24 L36 24 M28 28 L36 28 M28 32 L36 32"
          stroke="currentColor"
          strokeWidth="1"
          className={`transition-all duration-300 ${
            isHovered ? 'stroke-yellow-500' : 'stroke-blue-400'
          }`}
        />
        
        {/* Glow effect when hovered */}
        {isHovered && (
          <circle
            cx="32"
            cy="28"
            r="16"
            fill="none"
            stroke="rgba(251, 191, 36, 0.3)"
            strokeWidth="4"
            className="animate-pulse"
          />
        )}
        
        {/* Sparkle effects */}
        {isVisible && (
          <>
            <circle
              cx="20"
              cy="20"
              r="1"
              fill="currentColor"
              className="text-yellow-400 animate-twinkle"
              style={{ animationDelay: '0.5s' }}
            />
            <circle
              cx="44"
              cy="18"
              r="1"
              fill="currentColor"
              className="text-yellow-400 animate-twinkle"
              style={{ animationDelay: '1s' }}
            />
            <circle
              cx="18"
              cy="36"
              r="1"
              fill="currentColor"
              className="text-yellow-400 animate-twinkle"
              style={{ animationDelay: '1.5s' }}
            />
          </>
        )}
      </svg>
    </div>
  );
};

// Creativity Icon - Palette
export const CreativityIcon = ({ isVisible, className = "" }) => {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <div 
      className={`relative w-16 h-16 mx-auto ${className}`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <svg
        viewBox="0 0 64 64"
        className={`w-full h-full transition-all duration-500 ${
          isVisible ? 'animate-bounce-in' : 'opacity-0 scale-75'
        } ${isHovered ? 'scale-110 drop-shadow-lg' : ''}`}
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* Palette base */}
        <path
          d="M32 12C20 12 10 22 10 34C10 46 20 56 32 56C36 56 40 54 42 50C44 46 42 42 38 42H34C30 42 28 40 28 36C28 32 30 30 34 30H50C52 30 54 28 54 26C54 18 44 12 32 12Z"
          stroke="currentColor"
          strokeWidth="2"
          fill="none"
          className={`transition-all duration-300 ${
            isHovered ? 'stroke-purple-500 fill-purple-50' : 'stroke-blue-500'
          }`}
        />
        
        {/* Paint colors */}
        <circle
          cx="22"
          cy="26"
          r="3"
          className={`transition-all duration-300 ${
            isVisible ? 'fill-red-400' : 'fill-gray-300'
          } ${isHovered ? 'animate-pulse' : ''}`}
          style={{ animationDelay: '0.2s' }}
        />
        <circle
          cx="32"
          cy="22"
          r="3"
          className={`transition-all duration-300 ${
            isVisible ? 'fill-blue-400' : 'fill-gray-300'
          } ${isHovered ? 'animate-pulse' : ''}`}
          style={{ animationDelay: '0.4s' }}
        />
        <circle
          cx="42"
          cy="26"
          r="3"
          className={`transition-all duration-300 ${
            isVisible ? 'fill-green-400' : 'fill-gray-300'
          } ${isHovered ? 'animate-pulse' : ''}`}
          style={{ animationDelay: '0.6s' }}
        />
        <circle
          cx="26"
          cy="36"
          r="3"
          className={`transition-all duration-300 ${
            isVisible ? 'fill-yellow-400' : 'fill-gray-300'
          } ${isHovered ? 'animate-pulse' : ''}`}
          style={{ animationDelay: '0.8s' }}
        />
        <circle
          cx="38"
          cy="38"
          r="3"
          className={`transition-all duration-300 ${
            isVisible ? 'fill-purple-400' : 'fill-gray-300'
          } ${isHovered ? 'animate-pulse' : ''}`}
          style={{ animationDelay: '1s' }}
        />
        
        {/* Paintbrush */}
        <line
          x1="48"
          y1="16"
          x2="52"
          y2="12"
          stroke="currentColor"
          strokeWidth="2"
          className={`transition-all duration-300 ${
            isHovered ? 'stroke-amber-600' : 'stroke-blue-500'
          }`}
        />
        <circle
          cx="50"
          cy="14"
          r="2"
          className={`transition-all duration-300 ${
            isHovered ? 'fill-amber-400' : 'fill-blue-400'
          }`}
        />
        
        {/* Color splash effects when hovered */}
        {isHovered && (
          <>
            <circle cx="16" cy="20" r="2" fill="rgba(248, 113, 113, 0.6)" className="animate-ping" />
            <circle cx="48" cy="16" r="2" fill="rgba(96, 165, 250, 0.6)" className="animate-ping" style={{ animationDelay: '0.3s' }} />
            <circle cx="20" cy="44" r="2" fill="rgba(34, 197, 94, 0.6)" className="animate-ping" style={{ animationDelay: '0.6s' }} />
          </>
        )}
      </svg>
    </div>
  );
};

// Scalability Icon - Growth Chart
export const ScalabilityIcon = ({ isVisible, className = "" }) => {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <div 
      className={`relative w-16 h-16 mx-auto ${className}`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <svg
        viewBox="0 0 64 64"
        className={`w-full h-full transition-all duration-500 ${
          isVisible ? 'animate-bounce-in' : 'opacity-0 scale-75'
        } ${isHovered ? 'scale-110 drop-shadow-lg' : ''}`}
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* Chart axes */}
        <line
          x1="12"
          y1="52"
          x2="52"
          y2="52"
          stroke="currentColor"
          strokeWidth="2"
          className="stroke-blue-500"
        />
        <line
          x1="12"
          y1="52"
          x2="12"
          y2="12"
          stroke="currentColor"
          strokeWidth="2"
          className="stroke-blue-500"
        />
        
        {/* Chart bars with staggered animation */}
        <rect
          x="16"
          y="44"
          width="6"
          height="8"
          rx="1"
          className={`transition-all duration-500 ${
            isVisible ? 'fill-blue-400' : 'fill-gray-300'
          } ${isHovered ? 'fill-blue-500' : ''}`}
          style={{ 
            animationDelay: '0.2s',
            transform: isVisible ? 'scaleY(1)' : 'scaleY(0)',
            transformOrigin: 'bottom'
          }}
        />
        <rect
          x="26"
          y="36"
          width="6"
          height="16"
          rx="1"
          className={`transition-all duration-500 ${
            isVisible ? 'fill-green-400' : 'fill-gray-300'
          } ${isHovered ? 'fill-green-500' : ''}`}
          style={{ 
            animationDelay: '0.4s',
            transform: isVisible ? 'scaleY(1)' : 'scaleY(0)',
            transformOrigin: 'bottom'
          }}
        />
        <rect
          x="36"
          y="28"
          width="6"
          height="24"
          rx="1"
          className={`transition-all duration-500 ${
            isVisible ? 'fill-yellow-400' : 'fill-gray-300'
          } ${isHovered ? 'fill-yellow-500' : ''}`}
          style={{ 
            animationDelay: '0.6s',
            transform: isVisible ? 'scaleY(1)' : 'scaleY(0)',
            transformOrigin: 'bottom'
          }}
        />
        <rect
          x="46"
          y="20"
          width="6"
          height="32"
          rx="1"
          className={`transition-all duration-500 ${
            isVisible ? 'fill-purple-400' : 'fill-gray-300'
          } ${isHovered ? 'fill-purple-500' : ''}`}
          style={{ 
            animationDelay: '0.8s',
            transform: isVisible ? 'scaleY(1)' : 'scaleY(0)',
            transformOrigin: 'bottom'
          }}
        />
        
        {/* Growth arrow */}
        <path
          d="M20 40 L44 16"
          stroke="currentColor"
          strokeWidth="2"
          className={`transition-all duration-500 ${
            isHovered ? 'stroke-green-500' : 'stroke-blue-500'
          }`}
          strokeDasharray={isVisible ? "0" : "100"}
          strokeDashoffset={isVisible ? "0" : "100"}
          style={{ 
            transition: 'stroke-dashoffset 1s ease-in-out',
            animationDelay: '1s'
          }}
        />
        
        {/* Arrow head */}
        <path
          d="M40 12 L44 16 L40 20"
          stroke="currentColor"
          strokeWidth="2"
          fill="none"
          className={`transition-all duration-300 ${
            isHovered ? 'stroke-green-500' : 'stroke-blue-500'
          }`}
          style={{ 
            opacity: isVisible ? 1 : 0,
            transition: 'opacity 0.5s ease-in-out 1.2s'
          }}
        />
        
        {/* Floating numbers when hovered */}
        {isHovered && (
          <>
            <text x="19" y="38" className="text-xs fill-blue-600 animate-float" style={{ animationDelay: '0.1s' }}>25%</text>
            <text x="29" y="30" className="text-xs fill-green-600 animate-float" style={{ animationDelay: '0.2s' }}>50%</text>
            <text x="39" y="22" className="text-xs fill-yellow-600 animate-float" style={{ animationDelay: '0.3s' }}>75%</text>
            <text x="49" y="14" className="text-xs fill-purple-600 animate-float" style={{ animationDelay: '0.4s' }}>100%</text>
          </>
        )}
      </svg>
    </div>
  );
};