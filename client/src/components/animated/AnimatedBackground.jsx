import React, { useEffect, useRef, useState } from 'react';
import PropTypes from 'prop-types';
import GradientWaves from './GradientWaves';
import CircuitPattern from './CircuitPattern';

const AnimatedBackground = ({ 
  variant = 'particles', 
  intensity = 'medium',
  particleCount,
  speed,
  connectionDistance,
  className = ''
}) => {
  const canvasRef = useRef(null);
  const animationRef = useRef(null);
  const particlesRef = useRef([]);
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });

  // Configuration based on intensity and props
  const getConfig = () => {
    const baseConfigs = {
      low: { particles: 30, speed: 0.3, connections: 80 },
      medium: { particles: 50, speed: 0.5, connections: 100 },
      high: { particles: 80, speed: 0.8, connections: 120 }
    };

    const config = baseConfigs[intensity];
    return {
      particleCount: particleCount || config.particles,
      speed: speed || config.speed,
      connectionDistance: connectionDistance || config.connections
    };
  };

  // Particle class
  class Particle {
    constructor(width, height, config) {
      this.x = Math.random() * width;
      this.y = Math.random() * height;
      this.vx = (Math.random() - 0.5) * config.speed;
      this.vy = (Math.random() - 0.5) * config.speed;
      this.radius = Math.random() * 2 + 1;
      this.opacity = Math.random() * 0.5 + 0.3;
    }

    update(width, height, config) {
      this.x += this.vx;
      this.y += this.vy;

      // Bounce off edges
      if (this.x < 0 || this.x > width) this.vx *= -1;
      if (this.y < 0 || this.y > height) this.vy *= -1;

      // Keep particles within bounds
      this.x = Math.max(0, Math.min(width, this.x));
      this.y = Math.max(0, Math.min(height, this.y));
    }

    draw(ctx) {
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(37, 99, 235, ${this.opacity})`;
      ctx.fill();
    }
  }

  // Initialize particles
  const initParticles = (width, height, config) => {
    const particles = [];
    for (let i = 0; i < config.particleCount; i++) {
      particles.push(new Particle(width, height, config));
    }
    return particles;
  };

  // Draw connections between nearby particles
  const drawConnections = (ctx, particles, config) => {
    for (let i = 0; i < particles.length; i++) {
      for (let j = i + 1; j < particles.length; j++) {
        const dx = particles[i].x - particles[j].x;
        const dy = particles[i].y - particles[j].y;
        const distance = Math.sqrt(dx * dx + dy * dy);

        if (distance < config.connectionDistance) {
          const opacity = (1 - distance / config.connectionDistance) * 0.2;
          ctx.beginPath();
          ctx.moveTo(particles[i].x, particles[i].y);
          ctx.lineTo(particles[j].x, particles[j].y);
          ctx.strokeStyle = `rgba(37, 99, 235, ${opacity})`;
          ctx.lineWidth = 1;
          ctx.stroke();
        }
      }
    }
  };

  // Animation loop
  const animate = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    const config = getConfig();

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Update and draw particles
    particlesRef.current.forEach(particle => {
      particle.update(canvas.width, canvas.height, config);
      particle.draw(ctx);
    });

    // Draw connections
    drawConnections(ctx, particlesRef.current, config);

    animationRef.current = requestAnimationFrame(animate);
  };

  // Handle resize
  const handleResize = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const dpr = window.devicePixelRatio || 1;
    
    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;
    
    const ctx = canvas.getContext('2d');
    ctx.scale(dpr, dpr);
    
    canvas.style.width = rect.width + 'px';
    canvas.style.height = rect.height + 'px';

    setDimensions({ width: rect.width, height: rect.height });

    // Reinitialize particles with new dimensions
    const config = getConfig();
    particlesRef.current = initParticles(rect.width, rect.height, config);
  };

  // Initialize canvas and start animation
  useEffect(() => {
    if (variant !== 'particles') return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    // Set up canvas
    handleResize();

    // Start animation
    animate();

    // Add resize listener
    window.addEventListener('resize', handleResize);

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
      window.removeEventListener('resize', handleResize);
    };
  }, [variant, intensity, particleCount, speed, connectionDistance]);

  // Render based on variant
  const renderBackground = () => {
    switch (variant) {
      case 'particles':
        return (
          <canvas
            ref={canvasRef}
            className={`absolute inset-0 pointer-events-none ${className}`}
            style={{ 
              width: '100%', 
              height: '100%',
              zIndex: -1
            }}
          />
        );
      case 'waves':
        return <GradientWaves intensity={intensity} className={className} />;
      case 'circuit':
        return <CircuitPattern intensity={intensity} className={className} />;
      default:
        return null;
    }
  };

  return renderBackground();
};

AnimatedBackground.propTypes = {
  variant: PropTypes.oneOf(['particles', 'waves', 'circuit']),
  intensity: PropTypes.oneOf(['low', 'medium', 'high']),
  particleCount: PropTypes.number,
  speed: PropTypes.number,
  connectionDistance: PropTypes.number,
  className: PropTypes.string
};

export default AnimatedBackground;