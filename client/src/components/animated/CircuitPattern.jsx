import React, { useEffect, useRef } from 'react';
import PropTypes from 'prop-types';

const CircuitPattern = ({ 
  intensity = 'medium',
  className = ''
}) => {
  const svgRef = useRef(null);

  // Configuration based on intensity
  const getConfig = () => {
    const configs = {
      low: { density: 0.3, glowIntensity: 0.2, animationSpeed: 3 },
      medium: { density: 0.5, glowIntensity: 0.3, animationSpeed: 2 },
      high: { density: 0.7, glowIntensity: 0.4, animationSpeed: 1.5 }
    };
    return configs[intensity];
  };

  const config = getConfig();

  // Generate circuit paths
  const generateCircuitPaths = (width, height) => {
    const paths = [];
    const gridSize = 40;
    const cols = Math.floor(width / gridSize);
    const rows = Math.floor(height / gridSize);

    // Generate horizontal lines
    for (let row = 0; row < rows; row++) {
      for (let col = 0; col < cols - 1; col++) {
        if (Math.random() < config.density) {
          const x1 = col * gridSize + gridSize / 2;
          const y1 = row * gridSize + gridSize / 2;
          const x2 = (col + 1) * gridSize + gridSize / 2;
          const y2 = y1;
          
          paths.push({
            d: `M ${x1} ${y1} L ${x2} ${y2}`,
            type: 'line',
            delay: Math.random() * 3
          });
        }
      }
    }

    // Generate vertical lines
    for (let col = 0; col < cols; col++) {
      for (let row = 0; row < rows - 1; row++) {
        if (Math.random() < config.density) {
          const x1 = col * gridSize + gridSize / 2;
          const y1 = row * gridSize + gridSize / 2;
          const x2 = x1;
          const y2 = (row + 1) * gridSize + gridSize / 2;
          
          paths.push({
            d: `M ${x1} ${y1} L ${x2} ${y2}`,
            type: 'line',
            delay: Math.random() * 3
          });
        }
      }
    }

    // Generate nodes (connection points)
    for (let row = 0; row < rows; row++) {
      for (let col = 0; col < cols; col++) {
        if (Math.random() < config.density * 0.6) {
          const x = col * gridSize + gridSize / 2;
          const y = row * gridSize + gridSize / 2;
          
          paths.push({
            d: `M ${x} ${y} m -2 0 a 2 2 0 1 0 4 0 a 2 2 0 1 0 -4 0`,
            type: 'node',
            delay: Math.random() * 4
          });
        }
      }
    }

    return paths;
  };

  // Update SVG content
  const updateSVG = () => {
    const svg = svgRef.current;
    if (!svg) return;

    const rect = svg.getBoundingClientRect();
    const width = rect.width || 800;
    const height = rect.height || 600;

    svg.setAttribute('viewBox', `0 0 ${width} ${height}`);
    
    const paths = generateCircuitPaths(width, height);
    
    // Clear existing content
    svg.innerHTML = '';

    // Add defs for gradients and filters
    const defs = document.createElementNS('http://www.w3.org/2000/svg', 'defs');
    
    // Glow filter
    const filter = document.createElementNS('http://www.w3.org/2000/svg', 'filter');
    filter.setAttribute('id', 'glow');
    filter.setAttribute('x', '-50%');
    filter.setAttribute('y', '-50%');
    filter.setAttribute('width', '200%');
    filter.setAttribute('height', '200%');
    
    const feGaussianBlur = document.createElementNS('http://www.w3.org/2000/svg', 'feGaussianBlur');
    feGaussianBlur.setAttribute('stdDeviation', '2');
    feGaussianBlur.setAttribute('result', 'coloredBlur');
    
    const feMerge = document.createElementNS('http://www.w3.org/2000/svg', 'feMerge');
    const feMergeNode1 = document.createElementNS('http://www.w3.org/2000/svg', 'feMergeNode');
    feMergeNode1.setAttribute('in', 'coloredBlur');
    const feMergeNode2 = document.createElementNS('http://www.w3.org/2000/svg', 'feMergeNode');
    feMergeNode2.setAttribute('in', 'SourceGraphic');
    
    feMerge.appendChild(feMergeNode1);
    feMerge.appendChild(feMergeNode2);
    filter.appendChild(feGaussianBlur);
    filter.appendChild(feMerge);
    defs.appendChild(filter);

    // Gradient for animated lines
    const gradient = document.createElementNS('http://www.w3.org/2000/svg', 'linearGradient');
    gradient.setAttribute('id', 'circuitGradient');
    gradient.setAttribute('x1', '0%');
    gradient.setAttribute('y1', '0%');
    gradient.setAttribute('x2', '100%');
    gradient.setAttribute('y2', '0%');
    
    const stop1 = document.createElementNS('http://www.w3.org/2000/svg', 'stop');
    stop1.setAttribute('offset', '0%');
    stop1.setAttribute('stop-color', 'rgba(37, 99, 235, 0)');
    
    const stop2 = document.createElementNS('http://www.w3.org/2000/svg', 'stop');
    stop2.setAttribute('offset', '50%');
    stop2.setAttribute('stop-color', `rgba(37, 99, 235, ${config.glowIntensity})`);
    
    const stop3 = document.createElementNS('http://www.w3.org/2000/svg', 'stop');
    stop3.setAttribute('offset', '100%');
    stop3.setAttribute('stop-color', 'rgba(37, 99, 235, 0)');
    
    gradient.appendChild(stop1);
    gradient.appendChild(stop2);
    gradient.appendChild(stop3);
    defs.appendChild(gradient);

    svg.appendChild(defs);

    // Create paths
    paths.forEach((pathData, index) => {
      const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
      path.setAttribute('d', pathData.d);
      path.setAttribute('fill', pathData.type === 'node' ? `rgba(37, 99, 235, ${config.glowIntensity})` : 'none');
      path.setAttribute('stroke', pathData.type === 'node' ? 'none' : `rgba(37, 99, 235, ${config.glowIntensity * 0.6})`);
      path.setAttribute('stroke-width', pathData.type === 'node' ? '0' : '1');
      path.setAttribute('filter', 'url(#glow)');
      
      // Add animation
      const animate = document.createElementNS('http://www.w3.org/2000/svg', 'animate');
      animate.setAttribute('attributeName', pathData.type === 'node' ? 'fill-opacity' : 'stroke-opacity');
      animate.setAttribute('values', '0.2;0.8;0.2');
      animate.setAttribute('dur', `${config.animationSpeed + Math.random()}s`);
      animate.setAttribute('begin', `${pathData.delay}s`);
      animate.setAttribute('repeatCount', 'indefinite');
      
      path.appendChild(animate);
      svg.appendChild(path);
    });
  };

  useEffect(() => {
    updateSVG();
    
    const handleResize = () => {
      setTimeout(updateSVG, 100); // Debounce resize
    };

    window.addEventListener('resize', handleResize);
    
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, [intensity]);

  return (
    <div className={`circuit-pattern-container ${className}`}>
      <svg
        ref={svgRef}
        className="circuit-pattern-svg"
        style={{
          position: 'absolute',
          inset: 0,
          width: '100%',
          height: '100%',
          pointerEvents: 'none',
          zIndex: -1,
          opacity: 0.6
        }}
      />
      <style jsx>{`
        .circuit-pattern-container {
          position: absolute;
          inset: 0;
          overflow: hidden;
          pointer-events: none;
        }

        .circuit-pattern-svg {
          mix-blend-mode: screen;
        }

        /* Responsive adjustments */
        @media (max-width: 768px) {
          .circuit-pattern-svg {
            opacity: 0.4;
          }
        }

        @media (max-width: 480px) {
          .circuit-pattern-svg {
            opacity: 0.3;
          }
        }

        /* Reduced motion support */
        @media (prefers-reduced-motion: reduce) {
          .circuit-pattern-svg animate {
            animation-duration: 0s !important;
          }
          
          .circuit-pattern-svg {
            opacity: 0.3;
          }
        }
      `}</style>
    </div>
  );
};

CircuitPattern.propTypes = {
  intensity: PropTypes.oneOf(['low', 'medium', 'high']),
  className: PropTypes.string
};

export default CircuitPattern;