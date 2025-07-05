'use client';

import { useState, useEffect, useCallback } from 'react';
import { ChevronLeft } from 'lucide-react';

const HeroSlider = ({ heroSlides, isLoading, error }) => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [imagesLoaded, setImagesLoaded] = useState({});

  const handleImageLoad = useCallback((slideId) => {
    setImagesLoaded((prev) => ({ ...prev, [slideId]: true }));
  }, []);

  // Auto-cycle through hero slides
  useEffect(() => {
    if (!heroSlides || heroSlides.length <= 1) return;

    const interval = setInterval(() => {
      setCurrentSlide((prevSlide) =>
        prevSlide === heroSlides.length - 1 ? 0 : prevSlide + 1
      );
    }, 5000);

    return () => clearInterval(interval);
  }, [heroSlides]);

  const nextSlide = useCallback(() => {
    setCurrentSlide((prevSlide) =>
      prevSlide === heroSlides.length - 1 ? 0 : prevSlide + 1
    );
  }, [heroSlides]);

  const prevSlide = useCallback(() => {
    setCurrentSlide((prevSlide) =>
      prevSlide === 0 ? heroSlides.length - 1 : prevSlide - 1
    );
  }, [heroSlides]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-[500px] bg-gray-100 dark:bg-gray-800">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600 dark:border-blue-400 mb-4"></div>
          <p className="text-gray-600 dark:text-gray-300">
            Loading hero content...
          </p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-[500px] bg-gray-100 dark:bg-gray-800">
        <div className="text-center">
          <p className="text-red-600 dark:text-red-400">
            Error loading hero content
          </p>
        </div>
      </div>
    );
  }

  return (
    <section className="relative">
      <div className="relative h-[400px] sm:h-[500px] md:h-[600px] overflow-hidden">
        {Array.isArray(heroSlides) && heroSlides.length > 0 ? (
          <>
            {heroSlides.map((slide, index) => (
              <div
                key={slide._id}
                className={`absolute inset-0 flex items-center transition-opacity duration-1000 ease-in-out ${
                  index === currentSlide ? 'opacity-100' : 'opacity-0'
                }`}
                aria-hidden={index !== currentSlide}
              >
                <div
                  className={`absolute inset-0 ${
                    slide.backgroundColor || 'bg-black'
                  } bg-opacity-80`}
                ></div>
                <div className="absolute inset-0 bg-gradient-to-r from-blue-900 to-transparent opacity-70"></div>

                {!imagesLoaded[slide._id] && (
                  <div className="absolute inset-0 bg-gray-200 dark:bg-gray-700 animate-pulse"></div>
                )}

                <img
                  src={slide.image || '/placeholder.svg'}
                  alt={slide.title}
                  className={`absolute object-cover w-full h-full mix-blend-overlay transition-opacity duration-300 ${
                    imagesLoaded[slide._id] ? 'opacity-100' : 'opacity-0'
                  }`}
                  loading={index === 0 ? 'eager' : 'lazy'}
                  onLoad={() => handleImageLoad(slide._id)}
                />

                <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 flex flex-col justify-center h-full">
                  <div className="max-w-xl">
                    <h1
                      className={`text-3xl md:text-5xl font-bold text-white mb-2 md:mb-4 transition-opacity duration-500 ${
                        index === currentSlide ? 'opacity-100' : 'opacity-0'
                      }`}
                    >
                      {slide.title}
                    </h1>
                    <p
                      className={`text-lg md:text-xl text-white mb-3 transition-opacity duration-500 delay-100 ${
                        index === currentSlide ? 'opacity-100' : 'opacity-0'
                      }`}
                    >
                      {slide.subtitle}
                    </p>
                    <div
                      className={`transition-opacity duration-500 delay-200 ${
                        index === currentSlide ? 'opacity-100' : 'opacity-0'
                      }`}
                    >
                      <button className="mt-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors shadow-md">
                        Shop Now
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}

            {/* Navigation Arrows */}
            <button
              onClick={prevSlide}
              className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-white/20 backdrop-blur-sm hover:bg-white/30 text-white p-2 rounded-full z-10 transition-colors"
              aria-label="Previous slide"
            >
              <ChevronLeft size={24} />
            </button>
            <button
              onClick={nextSlide}
              className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-white/20 backdrop-blur-sm hover:bg-white/30 text-white p-2 rounded-full z-10 transition-colors"
              aria-label="Next slide"
            >
              <ChevronLeft size={24} className="transform rotate-180" />
            </button>

            {/* Slide Indicators */}
            <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-2 z-10">
              {heroSlides.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentSlide(index)}
                  className={`w-2.5 h-2.5 rounded-full transition-colors ${
                    index === currentSlide
                      ? 'bg-white'
                      : 'bg-white/50 hover:bg-white/70'
                  }`}
                  aria-label={`Go to slide ${index + 1}`}
                  aria-current={index === currentSlide}
                ></button>
              ))}
            </div>
          </>
        ) : (
          <div className="absolute inset-0 flex items-center justify-center">
            <p className="text-white text-xl">No slides available</p>
          </div>
        )}
      </div>
    </section>
  );
};

export default HeroSlider;
