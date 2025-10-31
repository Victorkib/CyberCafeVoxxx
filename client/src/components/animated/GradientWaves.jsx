import React from 'react';
import PropTypes from 'prop-types';

const GradientWaves = ({ 
  intensity = 'medium',
  className = ''
}) => {
  // Configuration based on intensity
  const getWaveConfig = () => {
    const configs = {
      low: { layers: 2, speed: 'slow', opacity: 0.3 },
      medium: { layers: 3, speed: 'medium', opacity: 0.4 },
      high: { layers: 4, speed: 'fast', opacity: 0.5 }
    };
    return configs[intensity];
  };

  const config = getWaveConfig();

  // Generate wave layers
  const renderWaveLayers = () => {
    const layers = [];
    
    for (let i = 0; i < config.layers; i++) {
      const delay = i * 0.5; // Stagger animations
      const duration = config.speed === 'slow' ? 8 : config.speed === 'medium' ? 6 : 4;
      const opacity = config.opacity * (1 - i * 0.1); // Decrease opacity for each layer
      
      layers.push(
        <div
          key={i}
          className={`wave-layer wave-layer-${i + 1}`}
          style={{
            '--wave-duration': `${duration + i}s`,
            '--wave-delay': `${delay}s`,
            '--wave-opacity': opacity,
            '--wave-scale': 1 + i * 0.1
          }}
        />
      );
    }
    
    return layers;
  };

  return (
    <div className={`gradient-waves-container ${className}`}>
      {renderWaveLayers()}
      <style jsx>{`
        .gradient-waves-container {
          position: absolute;
          inset: 0;
          overflow: hidden;
          pointer-events: none;
          z-index: -1;
        }

        .wave-layer {
          position: absolute;
          inset: 0;
          background: linear-gradient(
            45deg,
            rgba(37, 99, 235, var(--wave-opacity)) 0%,
            rgba(139, 92, 246, var(--wave-opacity)) 25%,
            rgba(16, 185, 129, var(--wave-opacity)) 50%,
            rgba(0, 212, 255, var(--wave-opacity)) 75%,
            rgba(37, 99, 235, var(--wave-opacity)) 100%
          );
          background-size: 400% 400%;
          animation: waveFlow var(--wave-duration) ease-in-out infinite;
          animation-delay: var(--wave-delay);
          transform: scale(var(--wave-scale));
          mix-blend-mode: multiply;
        }

        .wave-layer-1 {
          clip-path: polygon(
            0% 60%,
            15% 65%,
            35% 55%,
            50% 70%,
            65% 60%,
            80% 75%,
            100% 65%,
            100% 100%,
            0% 100%
          );
        }

        .wave-layer-2 {
          clip-path: polygon(
            0% 70%,
            20% 60%,
            40% 75%,
            60% 65%,
            75% 80%,
            90% 70%,
            100% 75%,
            100% 100%,
            0% 100%
          );
        }

        .wave-layer-3 {
          clip-path: polygon(
            0% 80%,
            25% 70%,
            45% 85%,
            65% 75%,
            85% 90%,
            100% 80%,
            100% 100%,
            0% 100%
          );
        }

        .wave-layer-4 {
          clip-path: polygon(
            0% 85%,
            30% 75%,
            50% 90%,
            70% 80%,
            90% 95%,
            100% 85%,
            100% 100%,
            0% 100%
          );
        }

        @keyframes waveFlow {
          0%, 100% {
            background-position: 0% 50%;
            transform: scale(var(--wave-scale)) translateX(0%);
          }
          25% {
            background-position: 100% 25%;
            transform: scale(var(--wave-scale)) translateX(-2%);
          }
          50% {
            background-position: 100% 75%;
            transform: scale(var(--wave-scale)) translateX(0%);
          }
          75% {
            background-position: 0% 100%;
            transform: scale(var(--wave-scale)) translateX(2%);
          }
        }

        /* Responsive adjustments */
        @media (max-width: 768px) {
          .wave-layer {
            background-size: 300% 300%;
          }
          
          .wave-layer-1 {
            clip-path: polygon(
              0% 70%,
              20% 75%,
              40% 65%,
              60% 80%,
              80% 70%,
              100% 75%,
              100% 100%,
              0% 100%
            );
          }

          .wave-layer-2 {
            clip-path: polygon(
              0% 80%,
              25% 70%,
              50% 85%,
              75% 75%,
              100% 80%,
              100% 100%,
              0% 100%
            );
          }

          .wave-layer-3 {
            clip-path: polygon(
              0% 85%,
              30% 80%,
              60% 90%,
              90% 85%,
              100% 90%,
              100% 100%,
              0% 100%
            );
          }
        }

        @media (max-width: 480px) {
          .wave-layer {
            background-size: 250% 250%;
          }
        }

        /* Reduced motion support */
        @media (prefers-reduced-motion: reduce) {
          .wave-layer {
            animation: none;
            opacity: calc(var(--wave-opacity) * 0.5);
          }
        }
      `}</style>
    </div>
  );
};

GradientWaves.propTypes = {
  intensity: PropTypes.oneOf(['low', 'medium', 'high']),
  className: PropTypes.string
};

export default GradientWaves;