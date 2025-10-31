import { useEffect, useRef } from 'react';
import { useScrollAnimation, useStaggeredScrollAnimation } from './useScrollAnimation';
import { useAnimationOptimization } from './usePerformanceMonitor';
import { initSmoothScrolling, initScrollSpy } from '../utils/smoothScroll';

/**
 * Comprehensive scroll animation system hook
 * Combines scroll-triggered animations, performance monitoring, and smooth scrolling
 * @param {Object} options - Configuration options
 * @returns {Object} - Animation system controls and utilities
 */
export const useScrollAnimationSystem = (options = {}) => {
  const {
    enableSmoothScrolling = true,
    enableScrollSpy = true,
    sections = ['hero', 'about', 'services', 'portfolio', 'cta'],
    navSelector = '.nav-link',
    smoothScrollSelector = 'a[href^="#"]'
  } = options;

  const systemInitialized = useRef(false);
  const cleanupFunctions = useRef([]);
  
  const animationConfig = useAnimationOptimization();

  useEffect(() => {
    if (systemInitialized.current) return;

    // Initialize smooth scrolling
    if (enableSmoothScrolling && animationConfig.enableAnimations) {
      initSmoothScrolling(smoothScrollSelector, {
        duration: animationConfig.prefersReducedMotion ? 300 : 800,
        offset: 80
      });
    }

    // Initialize scroll spy
    if (enableScrollSpy) {
      const cleanup = initScrollSpy(sections, navSelector, {
        offset: 100,
        activeClass: 'active',
        threshold: 0.3
      });
      
      if (cleanup) {
        cleanupFunctions.current.push(cleanup);
      }
    }

    // Add global smooth scrolling CSS
    if (animationConfig.enableAnimations && !animationConfig.prefersReducedMotion) {
      document.documentElement.style.scrollBehavior = 'smooth';
    }

    systemInitialized.current = true;

    return () => {
      cleanupFunctions.current.forEach(cleanup => cleanup());
      cleanupFunctions.current = [];
      document.documentElement.style.scrollBehavior = '';
    };
  }, [
    enableSmoothScrolling,
    enableScrollSpy,
    animationConfig.enableAnimations,
    animationConfig.prefersReducedMotion,
    sections,
    navSelector,
    smoothScrollSelector
  ]);

  return {
    animationConfig,
    isSystemReady: systemInitialized.current
  };
};

/**
 * Hook for section-specific scroll animations
 * @param {string} sectionName - Name of the section
 * @param {Object} options - Animation options
 * @returns {Object} - Section animation controls
 */
export const useSectionScrollAnimation = (sectionName, options = {}) => {
  const {
    animationType = 'fade-up',
    staggerChildren = false,
    customThreshold = 0.1,
    customRootMargin = '0px 0px -50px 0px'
  } = options;

  const animationConfig = useAnimationOptimization();
  
  // Choose animation hook based on stagger requirement
  const scrollAnimation = staggerChildren
    ? useStaggeredScrollAnimation({
        threshold: customThreshold,
        rootMargin: customRootMargin,
        staggerDelay: animationConfig.prefersReducedMotion ? 50 : 150,
        triggerOnce: true
      })
    : useScrollAnimation({
        threshold: customThreshold,
        rootMargin: customRootMargin,
        triggerOnce: true,
        staggerChildren: false
      });

  // Get appropriate CSS classes based on animation type and config
  const getAnimationClasses = () => {
    if (!animationConfig.enableAnimations) {
      return '';
    }

    const baseClasses = {
      'fade-up': 'scroll-animate',
      'fade-left': 'scroll-animate-left',
      'fade-right': 'scroll-animate-right',
      'scale': 'scroll-animate-scale',
      'fade': 'scroll-animate-fade'
    };

    return baseClasses[animationType] || 'scroll-animate';
  };

  return {
    ...scrollAnimation,
    animationClasses: getAnimationClasses(),
    animationConfig,
    sectionName
  };
};

/**
 * Hook for hero section animations with special effects
 * @param {Object} options - Hero animation options
 * @returns {Object} - Hero animation controls
 */
export const useHeroScrollAnimation = (options = {}) => {
  const {
    enableParallax = true,
    enableTypewriter = true,
    enableFloatingShapes = true
  } = options;

  const animationConfig = useAnimationOptimization();
  const heroRef = useRef(null);

  const scrollAnimation = useScrollAnimation({
    threshold: 0.1,
    rootMargin: '0px',
    triggerOnce: false, // Hero can re-animate
    staggerChildren: true,
    staggerDelay: animationConfig.prefersReducedMotion ? 100 : 200
  });

  useEffect(() => {
    if (!heroRef.current || !animationConfig.enableComplexAnimations) return;

    // Add parallax effect to hero background elements
    if (enableParallax) {
      const parallaxElements = heroRef.current.querySelectorAll('[data-parallax]');
      
      const handleScroll = () => {
        const scrolled = window.pageYOffset;
        
        parallaxElements.forEach(element => {
          const speed = parseFloat(element.dataset.parallax) || 0.5;
          const yPos = -(scrolled * speed);
          element.style.transform = `translateY(${yPos}px)`;
        });
      };

      const throttledScroll = throttle(handleScroll, 16); // ~60fps
      window.addEventListener('scroll', throttledScroll, { passive: true });

      return () => {
        window.removeEventListener('scroll', throttledScroll);
      };
    }
  }, [enableParallax, animationConfig.enableComplexAnimations]);

  return {
    ...scrollAnimation,
    heroRef,
    animationConfig,
    enableTypewriter: enableTypewriter && animationConfig.enableComplexAnimations,
    enableFloatingShapes: enableFloatingShapes && animationConfig.enableComplexAnimations,
    enableParallax: enableParallax && animationConfig.enableComplexAnimations
  };
};

/**
 * Utility function to throttle scroll events
 * @param {Function} func - Function to throttle
 * @param {number} limit - Throttle limit in milliseconds
 * @returns {Function} - Throttled function
 */
const throttle = (func, limit) => {
  let inThrottle;
  return function() {
    const args = arguments;
    const context = this;
    if (!inThrottle) {
      func.apply(context, args);
      inThrottle = true;
      setTimeout(() => inThrottle = false, limit);
    }
  };
};