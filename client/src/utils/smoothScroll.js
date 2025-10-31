/**
 * Smooth scroll utility functions
 */

/**
 * Smooth scroll to element with custom easing
 * @param {string|Element} target - CSS selector or DOM element
 * @param {Object} options - Scroll options
 */
export const smoothScrollTo = (target, options = {}) => {
  const {
    duration = 800,
    offset = 0,
    easing = 'easeInOutCubic',
    callback
  } = options;

  const targetElement = typeof target === 'string' 
    ? document.querySelector(target) 
    : target;

  if (!targetElement) {
    console.warn('Smooth scroll target not found:', target);
    return;
  }

  const startPosition = window.pageYOffset;
  const targetPosition = targetElement.getBoundingClientRect().top + startPosition - offset;
  const distance = targetPosition - startPosition;
  let startTime = null;

  // Easing functions
  const easingFunctions = {
    linear: (t) => t,
    easeInQuad: (t) => t * t,
    easeOutQuad: (t) => t * (2 - t),
    easeInOutQuad: (t) => t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t,
    easeInCubic: (t) => t * t * t,
    easeOutCubic: (t) => (--t) * t * t + 1,
    easeInOutCubic: (t) => t < 0.5 ? 4 * t * t * t : (t - 1) * (2 * t - 2) * (2 * t - 2) + 1,
    easeInQuart: (t) => t * t * t * t,
    easeOutQuart: (t) => 1 - (--t) * t * t * t,
    easeInOutQuart: (t) => t < 0.5 ? 8 * t * t * t * t : 1 - 8 * (--t) * t * t * t
  };

  const easingFunction = easingFunctions[easing] || easingFunctions.easeInOutCubic;

  const animateScroll = (currentTime) => {
    if (startTime === null) startTime = currentTime;
    const timeElapsed = currentTime - startTime;
    const progress = Math.min(timeElapsed / duration, 1);
    const ease = easingFunction(progress);

    window.scrollTo(0, startPosition + distance * ease);

    if (progress < 1) {
      requestAnimationFrame(animateScroll);
    } else if (callback) {
      callback();
    }
  };

  requestAnimationFrame(animateScroll);
};

/**
 * Smooth scroll to top of page
 * @param {Object} options - Scroll options
 */
export const smoothScrollToTop = (options = {}) => {
  const { duration = 600, callback } = options;
  
  const startPosition = window.pageYOffset;
  let startTime = null;

  const animateScroll = (currentTime) => {
    if (startTime === null) startTime = currentTime;
    const timeElapsed = currentTime - startTime;
    const progress = Math.min(timeElapsed / duration, 1);
    const ease = 1 - Math.pow(1 - progress, 3); // easeOutCubic

    window.scrollTo(0, startPosition * (1 - ease));

    if (progress < 1) {
      requestAnimationFrame(animateScroll);
    } else if (callback) {
      callback();
    }
  };

  requestAnimationFrame(animateScroll);
};

/**
 * Initialize smooth scrolling for navigation links
 * @param {string} selector - CSS selector for navigation links
 * @param {Object} options - Scroll options
 */
export const initSmoothScrolling = (selector = 'a[href^="#"]', options = {}) => {
  const links = document.querySelectorAll(selector);
  
  links.forEach(link => {
    link.addEventListener('click', (e) => {
      const href = link.getAttribute('href');
      
      // Skip if it's just "#" or external link
      if (href === '#' || href.startsWith('http')) return;
      
      e.preventDefault();
      
      const targetId = href.substring(1);
      const targetElement = document.getElementById(targetId);
      
      if (targetElement) {
        smoothScrollTo(targetElement, {
          duration: 800,
          offset: 80, // Account for fixed header
          ...options
        });
        
        // Update URL without jumping
        if (history.pushState) {
          history.pushState(null, null, href);
        }
      }
    });
  });
};

/**
 * Scroll spy functionality to highlight active navigation items
 * @param {Array} sections - Array of section IDs to watch
 * @param {string} navSelector - CSS selector for navigation items
 * @param {Object} options - Configuration options
 */
export const initScrollSpy = (sections, navSelector, options = {}) => {
  const {
    offset = 100,
    activeClass = 'active',
    threshold = 0.3
  } = options;

  const navItems = document.querySelectorAll(navSelector);
  const sectionElements = sections.map(id => document.getElementById(id)).filter(Boolean);

  if (sectionElements.length === 0) return;

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach(entry => {
        const navItem = document.querySelector(`${navSelector}[href="#${entry.target.id}"]`);
        
        if (entry.isIntersecting) {
          // Remove active class from all nav items
          navItems.forEach(item => item.classList.remove(activeClass));
          // Add active class to current nav item
          if (navItem) {
            navItem.classList.add(activeClass);
          }
        }
      });
    },
    {
      threshold,
      rootMargin: `-${offset}px 0px -${offset}px 0px`
    }
  );

  sectionElements.forEach(section => {
    observer.observe(section);
  });

  return () => {
    sectionElements.forEach(section => {
      observer.unobserve(section);
    });
  };
};

/**
 * Parallax scrolling effect
 * @param {string|Element} element - Element to apply parallax to
 * @param {Object} options - Parallax options
 */
export const initParallax = (element, options = {}) => {
  const {
    speed = 0.5,
    direction = 'up',
    enableOnMobile = false
  } = options;

  const targetElement = typeof element === 'string' 
    ? document.querySelector(element) 
    : element;

  if (!targetElement) return;

  // Skip on mobile if disabled
  if (!enableOnMobile && window.innerWidth <= 768) return;

  let ticking = false;

  const updateParallax = () => {
    const scrolled = window.pageYOffset;
    const elementTop = targetElement.getBoundingClientRect().top + scrolled;
    const elementHeight = targetElement.offsetHeight;
    const windowHeight = window.innerHeight;

    // Only apply parallax when element is in viewport
    if (scrolled + windowHeight > elementTop && scrolled < elementTop + elementHeight) {
      const yPos = -(scrolled - elementTop) * speed;
      const transform = direction === 'up' 
        ? `translateY(${yPos}px)` 
        : `translateY(${-yPos}px)`;
      
      targetElement.style.transform = transform;
    }

    ticking = false;
  };

  const requestTick = () => {
    if (!ticking) {
      requestAnimationFrame(updateParallax);
      ticking = true;
    }
  };

  window.addEventListener('scroll', requestTick, { passive: true });

  return () => {
    window.removeEventListener('scroll', requestTick);
  };
};

/**
 * Throttle function for performance optimization
 * @param {Function} func - Function to throttle
 * @param {number} limit - Throttle limit in milliseconds
 * @returns {Function} - Throttled function
 */
export const throttle = (func, limit) => {
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

/**
 * Debounce function for performance optimization
 * @param {Function} func - Function to debounce
 * @param {number} wait - Wait time in milliseconds
 * @returns {Function} - Debounced function
 */
export const debounce = (func, wait) => {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
};