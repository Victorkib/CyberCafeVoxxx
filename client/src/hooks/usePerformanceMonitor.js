import { useEffect, useRef, useState } from 'react';

/**
 * Hook for monitoring animation performance and frame rate
 * @param {Object} options - Configuration options
 * @param {number} options.targetFPS - Target frame rate (default: 60)
 * @param {number} options.sampleSize - Number of frames to sample (default: 60)
 * @param {Function} options.onPerformanceIssue - Callback when performance drops
 * @returns {Object} - Performance metrics and controls
 */
export const usePerformanceMonitor = (options = {}) => {
  const {
    targetFPS = 60,
    sampleSize = 60,
    onPerformanceIssue
  } = options;

  const [fps, setFPS] = useState(60);
  const [isPerformanceGood, setIsPerformanceGood] = useState(true);
  const frameTimesRef = useRef([]);
  const lastFrameTimeRef = useRef(performance.now());
  const animationFrameRef = useRef();

  useEffect(() => {
    const measureFPS = () => {
      const now = performance.now();
      const delta = now - lastFrameTimeRef.current;
      lastFrameTimeRef.current = now;

      // Add frame time to our samples
      frameTimesRef.current.push(delta);
      
      // Keep only the last N samples
      if (frameTimesRef.current.length > sampleSize) {
        frameTimesRef.current.shift();
      }

      // Calculate average FPS
      if (frameTimesRef.current.length >= 10) {
        const avgFrameTime = frameTimesRef.current.reduce((a, b) => a + b, 0) / frameTimesRef.current.length;
        const currentFPS = Math.round(1000 / avgFrameTime);
        
        setFPS(currentFPS);
        
        const performanceGood = currentFPS >= targetFPS * 0.8; // 80% of target FPS
        setIsPerformanceGood(performanceGood);
        
        if (!performanceGood && onPerformanceIssue) {
          onPerformanceIssue(currentFPS, targetFPS);
        }
      }

      animationFrameRef.current = requestAnimationFrame(measureFPS);
    };

    animationFrameRef.current = requestAnimationFrame(measureFPS);

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [targetFPS, sampleSize, onPerformanceIssue]);

  const resetMetrics = () => {
    frameTimesRef.current = [];
    setFPS(60);
    setIsPerformanceGood(true);
  };

  return {
    fps,
    isPerformanceGood,
    resetMetrics
  };
};

/**
 * Hook for detecting reduced motion preference
 * @returns {boolean} - Whether user prefers reduced motion
 */
export const useReducedMotion = () => {
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);

  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    setPrefersReducedMotion(mediaQuery.matches);

    const handleChange = (event) => {
      setPrefersReducedMotion(event.matches);
    };

    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, []);

  return prefersReducedMotion;
};

/**
 * Hook for optimizing animations based on device capabilities
 * @returns {Object} - Animation optimization settings
 */
export const useAnimationOptimization = () => {
  const [optimizationLevel, setOptimizationLevel] = useState('high');
  const prefersReducedMotion = useReducedMotion();
  const { isPerformanceGood } = usePerformanceMonitor({
    onPerformanceIssue: (currentFPS) => {
      if (currentFPS < 30) {
        setOptimizationLevel('low');
      } else if (currentFPS < 45) {
        setOptimizationLevel('medium');
      }
    }
  });

  useEffect(() => {
    if (prefersReducedMotion) {
      setOptimizationLevel('none');
      return;
    }

    // Check device capabilities
    const isLowEndDevice = navigator.hardwareConcurrency <= 2 || 
                          navigator.deviceMemory <= 2;
    
    if (isLowEndDevice) {
      setOptimizationLevel('medium');
    } else if (isPerformanceGood) {
      setOptimizationLevel('high');
    }
  }, [prefersReducedMotion, isPerformanceGood]);

  const getAnimationConfig = () => {
    switch (optimizationLevel) {
      case 'none':
        return {
          enableAnimations: false,
          enableParticles: false,
          enableComplexAnimations: false,
          maxParticles: 0
        };
      case 'low':
        return {
          enableAnimations: true,
          enableParticles: false,
          enableComplexAnimations: false,
          maxParticles: 0,
          animationDuration: 0.3
        };
      case 'medium':
        return {
          enableAnimations: true,
          enableParticles: true,
          enableComplexAnimations: false,
          maxParticles: 20,
          animationDuration: 0.4
        };
      case 'high':
      default:
        return {
          enableAnimations: true,
          enableParticles: true,
          enableComplexAnimations: true,
          maxParticles: 50,
          animationDuration: 0.6
        };
    }
  };

  return {
    optimizationLevel,
    prefersReducedMotion,
    isPerformanceGood,
    ...getAnimationConfig()
  };
};