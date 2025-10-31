import { useEffect, useRef } from 'react';

const FloatingShapes = ({ count = 6, className = '' }) => {
  const containerRef = useRef(null);

  useEffect(() => {
    const shapes = containerRef.current?.children;
    if (!shapes) return;

    // Animate each shape with different delays and durations
    Array.from(shapes).forEach((shape, index) => {
      const delay = index * 0.5;
      const duration = 8 + (index % 3) * 2; // 8-12 seconds
      
      shape.style.animationDelay = `${delay}s`;
      shape.style.animationDuration = `${duration}s`;
    });
  }, []);

  const shapes = Array.from({ length: count }, (_, i) => {
    const shapeTypes = ['circle', 'square', 'triangle', 'hexagon'];
    const shapeType = shapeTypes[i % shapeTypes.length];
    const size = 20 + (i % 3) * 15; // 20-50px
    const opacity = 0.1 + (i % 3) * 0.05; // 0.1-0.2
    
    // Random positioning
    const top = Math.random() * 80 + 10; // 10-90%
    const left = Math.random() * 80 + 10; // 10-90%

    return {
      id: i,
      type: shapeType,
      size,
      opacity,
      top,
      left
    };
  });

  const getShapeElement = (shape) => {
    const baseClasses = `absolute animate-float-gentle`;
    const style = {
      top: `${shape.top}%`,
      left: `${shape.left}%`,
      width: `${shape.size}px`,
      height: `${shape.size}px`,
      opacity: shape.opacity,
    };

    switch (shape.type) {
      case 'circle':
        return (
          <div
            key={shape.id}
            className={`${baseClasses} rounded-full bg-blue-500`}
            style={style}
          />
        );
      case 'square':
        return (
          <div
            key={shape.id}
            className={`${baseClasses} bg-blue-400 rotate-45`}
            style={style}
          />
        );
      case 'triangle':
        return (
          <div
            key={shape.id}
            className={`${baseClasses}`}
            style={{
              ...style,
              width: 0,
              height: 0,
              borderLeft: `${shape.size / 2}px solid transparent`,
              borderRight: `${shape.size / 2}px solid transparent`,
              borderBottom: `${shape.size}px solid rgba(59, 130, 246, ${shape.opacity})`,
              backgroundColor: 'transparent'
            }}
          />
        );
      case 'hexagon':
        return (
          <div
            key={shape.id}
            className={`${baseClasses} bg-blue-300`}
            style={{
              ...style,
              clipPath: 'polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%)'
            }}
          />
        );
      default:
        return null;
    }
  };

  return (
    <div 
      ref={containerRef}
      className={`absolute inset-0 pointer-events-none overflow-hidden ${className}`}
    >
      {shapes.map(getShapeElement)}
    </div>
  );
};

export default FloatingShapes;