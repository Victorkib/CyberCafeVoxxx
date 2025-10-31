import React, { useState, useEffect, useRef, useCallback } from 'react';
import { ChevronLeftIcon, ChevronRightIcon } from '@heroicons/react/24/outline';

const PortfolioCarousel = ({ 
  children, 
  itemsPerView = { mobile: 1, tablet: 2, desktop: 3 },
  autoPlay = false,
  autoPlayInterval = 5000,
  showDots = true,
  showArrows = true,
  className = ''
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [itemsToShow, setItemsToShow] = useState(itemsPerView.desktop);
  const [isAutoPlaying, setIsAutoPlaying] = useState(autoPlay);
  const [touchStart, setTouchStart] = useState(null);
  const [touchEnd, setTouchEnd] = useState(null);
  const carouselRef = useRef(null);
  const autoPlayRef = useRef(null);

  const totalItems = React.Children.count(children);
  const maxIndex = Math.max(0, totalItems - itemsToShow);

  // Responsive items per view
  useEffect(() => {
    const updateItemsToShow = () => {
      const width = window.innerWidth;
      if (width < 768) {
        setItemsToShow(itemsPerView.mobile);
      } else if (width < 1024) {
        setItemsToShow(itemsPerView.tablet);
      } else {
        setItemsToShow(itemsPerView.desktop);
      }
    };

    updateItemsToShow();
    window.addEventListener('resize', updateItemsToShow);
    return () => window.removeEventListener('resize', updateItemsToShow);
  }, [itemsPerView]);

  // Auto play functionality
  useEffect(() => {
    if (isAutoPlaying && totalItems > itemsToShow) {
      autoPlayRef.current = setInterval(() => {
        setCurrentIndex(prev => (prev >= maxIndex ? 0 : prev + 1));
      }, autoPlayInterval);
    }

    return () => {
      if (autoPlayRef.current) {
        clearInterval(autoPlayRef.current);
      }
    };
  }, [isAutoPlaying, maxIndex, autoPlayInterval, totalItems, itemsToShow]);

  // Navigation functions
  const goToNext = useCallback(() => {
    setCurrentIndex(prev => Math.min(prev + 1, maxIndex));
    setIsAutoPlaying(false);
  }, [maxIndex]);

  const goToPrev = useCallback(() => {
    setCurrentIndex(prev => Math.max(prev - 1, 0));
    setIsAutoPlaying(false);
  }, []);

  const goToSlide = useCallback((index) => {
    setCurrentIndex(Math.min(index, maxIndex));
    setIsAutoPlaying(false);
  }, [maxIndex]);

  // Touch handlers
  const handleTouchStart = (e) => {
    setTouchEnd(null);
    setTouchStart(e.targetTouches[0].clientX);
  };

  const handleTouchMove = (e) => {
    setTouchEnd(e.targetTouches[0].clientX);
  };

  const handleTouchEnd = () => {
    if (!touchStart || !touchEnd) return;
    
    const distance = touchStart - touchEnd;
    const isLeftSwipe = distance > 50;
    const isRightSwipe = distance < -50;

    if (isLeftSwipe && currentIndex < maxIndex) {
      goToNext();
    }
    if (isRightSwipe && currentIndex > 0) {
      goToPrev();
    }
  };

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'ArrowLeft') {
        goToPrev();
      } else if (e.key === 'ArrowRight') {
        goToNext();
      }
    };

    if (carouselRef.current) {
      carouselRef.current.addEventListener('keydown', handleKeyDown);
    }

    return () => {
      if (carouselRef.current) {
        carouselRef.current.removeEventListener('keydown', handleKeyDown);
      }
    };
  }, [goToNext, goToPrev]);

  // Pause auto play on hover
  const handleMouseEnter = () => {
    if (autoPlayRef.current) {
      clearInterval(autoPlayRef.current);
    }
  };

  const handleMouseLeave = () => {
    if (autoPlay && totalItems > itemsToShow) {
      setIsAutoPlaying(true);
    }
  };

  if (totalItems === 0) {
    return (
      <div className="flex items-center justify-center h-64 text-gray-500">
        No items to display
      </div>
    );
  }

  return (
    <div 
      ref={carouselRef}
      className={`portfolio-carousel relative ${className}`}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      tabIndex={0}
      role="region"
      aria-label="Portfolio carousel"
    >
      {/* Main carousel container */}
      <div className="relative overflow-hidden">
        <div 
          className="flex transition-transform duration-500 ease-out"
          style={{
            transform: `translateX(-${(currentIndex * 100) / itemsToShow}%)`,
            width: `${(totalItems * 100) / itemsToShow}%`
          }}
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
        >
          {React.Children.map(children, (child, index) => (
            <div 
              key={index}
              className="flex-shrink-0 px-2"
              style={{ width: `${100 / totalItems}%` }}
            >
              {child}
            </div>
          ))}
        </div>
      </div>

      {/* Navigation arrows */}
      {showArrows && totalItems > itemsToShow && (
        <>
          <button
            onClick={goToPrev}
            disabled={currentIndex === 0}
            className={`
              absolute left-2 top-1/2 -translate-y-1/2 z-10
              w-10 h-10 rounded-full bg-white/90 backdrop-blur-sm shadow-lg
              flex items-center justify-center transition-all duration-200
              hover:bg-white hover:scale-110 focus:outline-none focus:ring-2 focus:ring-blue-500
              ${currentIndex === 0 ? 'opacity-50 cursor-not-allowed' : 'hover:shadow-xl'}
            `}
            aria-label="Previous slide"
          >
            <ChevronLeftIcon className="w-5 h-5 text-gray-700" />
          </button>

          <button
            onClick={goToNext}
            disabled={currentIndex >= maxIndex}
            className={`
              absolute right-2 top-1/2 -translate-y-1/2 z-10
              w-10 h-10 rounded-full bg-white/90 backdrop-blur-sm shadow-lg
              flex items-center justify-center transition-all duration-200
              hover:bg-white hover:scale-110 focus:outline-none focus:ring-2 focus:ring-blue-500
              ${currentIndex >= maxIndex ? 'opacity-50 cursor-not-allowed' : 'hover:shadow-xl'}
            `}
            aria-label="Next slide"
          >
            <ChevronRightIcon className="w-5 h-5 text-gray-700" />
          </button>
        </>
      )}

      {/* Dot indicators */}
      {showDots && totalItems > itemsToShow && (
        <div className="flex justify-center mt-6 gap-2">
          {Array.from({ length: maxIndex + 1 }, (_, index) => (
            <button
              key={index}
              onClick={() => goToSlide(index)}
              className={`
                w-3 h-3 rounded-full transition-all duration-300
                focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2
                ${index === currentIndex
                  ? 'bg-blue-600 scale-125 shadow-lg shadow-blue-500/30'
                  : 'bg-gray-300 hover:bg-gray-400 hover:scale-110'
                }
              `}
              aria-label={`Go to slide ${index + 1}`}
            />
          ))}
        </div>
      )}

      {/* Progress indicator */}
      {autoPlay && isAutoPlaying && totalItems > itemsToShow && (
        <div className="absolute bottom-0 left-0 right-0 h-1 bg-gray-200">
          <div 
            className="h-full bg-gradient-to-r from-blue-500 to-purple-500 transition-all duration-100"
            style={{
              width: `${((currentIndex + 1) / (maxIndex + 1)) * 100}%`
            }}
          />
        </div>
      )}
    </div>
  );
};

export default PortfolioCarousel;