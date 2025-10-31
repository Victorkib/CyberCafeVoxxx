import { useEffect, useRef, useState } from 'react';

/**
 * Custom hook for scroll-triggered animations using Intersection Observer
 * @param {Object} options - Configuration options
 * @param {number} options.threshold - Intersection threshold (0-1)
 * @param {string} options.rootMargin - Root margin for intersection
 * @param {boolean} options.triggerOnce - Whether to trigger animation only once
 * @param {number} options.staggerDelay - Delay between staggered animations (ms)
 * @param {boolean} options.staggerChildren - Whether to stagger child animations
 * @returns {Object} - Ref and animation state
 */
export const useScrollAnimation = (options = {}) => {
  const {
    threshold = 0.1,
    rootMargin = '0px 0px -50px 0px',
    triggerOnce = true,
    staggerDelay = 100,
    staggerChildren = false
  } = options;

  const elementRef = useRef(null);
  const [isVisible, setIsVisible] = useState(false);
  const [hasTriggered, setHasTriggered] = useState(false);

  useEffect(() => {
    const element = elementRef.current;
    if (!element) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        const isIntersecting = entry.isIntersecting;
        
        if (isIntersecting && (!triggerOnce || !hasTriggered)) {
          setIsVisible(true);
          setHasTriggered(true);
          
          // Handle staggered animations for children
          if (staggerChildren) {
            const children = element.querySelectorAll('[data-animate]');
            children.forEach((child, index) => {
              setTimeout(() => {
                child.classList.add('animate-in');
              }, index * staggerDelay);
            });
          } else {
            element.classList.add('animate-in');
          }
        } else if (!triggerOnce && !isIntersecting) {
          setIsVisible(false);
          element.classList.remove('animate-in');
        }
      },
      {
        threshold,
        rootMargin
      }
    );

    observer.observe(element);

    return () => {
      observer.unobserve(element);
    };
  }, [threshold, rootMargin, triggerOnce, staggerDelay, staggerChildren, hasTriggered]);

  return {
    ref: elementRef,
    isVisible,
    hasTriggered
  };
};

/**
 * Hook for multiple elements with staggered animations
 * @param {Object} options - Configuration options
 * @returns {Function} - Function to get ref for each element
 */
export const useStaggeredScrollAnimation = (options = {}) => {
  const {
    threshold = 0.1,
    rootMargin = '0px 0px -50px 0px',
    staggerDelay = 150,
    triggerOnce = true
  } = options;

  const elementsRef = useRef([]);
  const [visibleElements, setVisibleElements] = useState(new Set());

  useEffect(() => {
    const elements = elementsRef.current.filter(Boolean);
    if (elements.length === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const elementIndex = elements.indexOf(entry.target);
            
            setTimeout(() => {
              entry.target.classList.add('animate-in');
              setVisibleElements(prev => new Set([...prev, elementIndex]));
            }, elementIndex * staggerDelay);

            if (triggerOnce) {
              observer.unobserve(entry.target);
            }
          }
        });
      },
      {
        threshold,
        rootMargin
      }
    );

    elements.forEach(element => {
      observer.observe(element);
    });

    return () => {
      elements.forEach(element => {
        observer.unobserve(element);
      });
    };
  }, [threshold, rootMargin, staggerDelay, triggerOnce]);

  const getRef = (index) => (element) => {
    elementsRef.current[index] = element;
  };

  return {
    getRef,
    visibleElements
  };
};

/**
 * Hook for scroll-triggered animations with custom callback
 * @param {Function} callback - Function to call when element is visible
 * @param {Object} options - Configuration options
 * @returns {Object} - Ref and visibility state
 */
export const useScrollTrigger = (callback, options = {}) => {
  const {
    threshold = 0.1,
    rootMargin = '0px 0px -50px 0px',
    triggerOnce = true
  } = options;

  const elementRef = useRef(null);
  const [isVisible, setIsVisible] = useState(false);
  const hasTriggeredRef = useRef(false);

  useEffect(() => {
    const element = elementRef.current;
    if (!element) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        const isIntersecting = entry.isIntersecting;
        setIsVisible(isIntersecting);

        if (isIntersecting && (!triggerOnce || !hasTriggeredRef.current)) {
          callback(entry);
          hasTriggeredRef.current = true;
        }
      },
      {
        threshold,
        rootMargin
      }
    );

    observer.observe(element);

    return () => {
      observer.unobserve(element);
    };
  }, [callback, threshold, rootMargin, triggerOnce]);

  return {
    ref: elementRef,
    isVisible
  };
};