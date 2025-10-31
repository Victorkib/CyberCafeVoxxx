'use client';

import { memo, useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import { ArrowRight, Package, TrendingUp } from 'lucide-react';

const EnhancedCategoryCard = memo(
  ({ category, darkMode, onCategorySelect, isSelected = false, index = 0 }) => {
    const [imageLoaded, setImageLoaded] = useState(false);
    const [imageError, setImageError] = useState(false);
    const [isHovered, setIsHovered] = useState(false);

    const handleImageLoad = useCallback(() => {
      setImageLoaded(true);
    }, []);

    const handleImageError = useCallback(() => {
      setImageError(true);
      setImageLoaded(true);
    }, []);

    const handleClick = useCallback(() => {
      onCategorySelect(category.name);
    }, [category.name, onCategorySelect]);

    return (
      <motion.div
        className={`group relative overflow-hidden rounded-2xl cursor-pointer ${
          darkMode
            ? 'bg-gradient-to-br from-gray-800 via-gray-900 to-black border-gray-700'
            : 'bg-gradient-to-br from-white via-gray-50 to-gray-100 border-gray-200'
        } border shadow-lg hover:shadow-2xl transition-all duration-500 ${
          isSelected
            ? 'ring-2 ring-blue-500 ring-offset-2 dark:ring-offset-gray-900'
            : ''
        }`}
        onClick={handleClick}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: index * 0.1 }}
        whileHover={{ y: -8, scale: 1.02 }}
      >
        {/* Background Image */}
        <div className="relative h-48 overflow-hidden">
          {!imageLoaded && (
            <div className="w-full h-full bg-gradient-to-br from-gray-200 via-gray-300 to-gray-400 dark:from-gray-700 dark:via-gray-800 dark:to-gray-900 animate-pulse" />
          )}
          <img
            src={
              imageError
                ? '/placeholder.svg'
                : category.image || '/placeholder.svg'
            }
            alt={category.name}
            className={`w-full h-full object-cover transition-all duration-700 group-hover:scale-110 ${
              imageLoaded ? 'opacity-100' : 'opacity-0'
            }`}
            loading="lazy"
            onLoad={handleImageLoad}
            onError={handleImageError}
          />

          {/* Gradient Overlays */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-r from-blue-600/20 to-purple-600/20 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

          {/* Featured Badge */}
          {category.featured && (
            <motion.div
              className="absolute top-4 right-4 bg-gradient-to-r from-yellow-500 to-orange-500 text-white px-3 py-1 rounded-full text-xs font-bold shadow-lg"
              initial={{ scale: 0, rotate: -10 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ delay: 0.3, type: 'spring', stiffness: 300 }}
            >
              ⭐ FEATURED
            </motion.div>
          )}

          {/* Category Stats */}
          <div className="absolute top-4 left-4">
            <motion.div
              className="bg-white/20 backdrop-blur-md rounded-lg px-3 py-2 text-white"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: isHovered ? 1 : 0, x: isHovered ? 0 : -20 }}
              transition={{ duration: 0.3 }}
            >
              <div className="flex items-center gap-2 text-sm font-medium">
                <Package size={14} />
                {category.order || 0} items
              </div>
            </motion.div>
          </div>

          {/* Hover Arrow */}
          <motion.div
            className="absolute bottom-4 right-4 bg-white/20 backdrop-blur-md rounded-full p-2 text-white"
            initial={{ opacity: 0, scale: 0 }}
            animate={{
              opacity: isHovered ? 1 : 0,
              scale: isHovered ? 1 : 0,
              rotate: isHovered ? 0 : -90,
            }}
            transition={{ duration: 0.3 }}
          >
            <ArrowRight size={16} />
          </motion.div>
        </div>

        {/* Content */}
        <div className="p-6">
          <div className="flex items-start justify-between mb-3">
            <h3
              className={`text-xl font-bold ${
                darkMode ? 'text-white' : 'text-gray-900'
              } group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors`}
            >
              {category.name}
            </h3>

            {category.parent && (
              <div
                className={`text-xs px-2 py-1 rounded-full ${
                  darkMode
                    ? 'bg-gray-700 text-gray-300'
                    : 'bg-gray-100 text-gray-600'
                }`}
              >
                Subcategory
              </div>
            )}
          </div>

          <p
            className={`text-sm ${
              darkMode ? 'text-gray-400' : 'text-gray-600'
            } line-clamp-3 mb-4 leading-relaxed`}
          >
            {category.description}
          </p>

          {/* Category Metrics */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-1">
                <TrendingUp
                  size={14}
                  className={darkMode ? 'text-green-400' : 'text-green-600'}
                />
                <span
                  className={`text-xs font-medium ${
                    darkMode ? 'text-green-400' : 'text-green-600'
                  }`}
                >
                  Popular
                </span>
              </div>

              <div
                className={`text-xs ${
                  darkMode ? 'text-gray-500' : 'text-gray-400'
                }`}
              >
                Order: {category.order}
              </div>
            </div>

            <motion.div
              className={`w-8 h-8 rounded-full ${
                darkMode ? 'bg-gray-700' : 'bg-gray-100'
              } flex items-center justify-center group-hover:bg-blue-600 transition-colors`}
              whileHover={{ rotate: 90 }}
              transition={{ duration: 0.2 }}
            >
              <ArrowRight
                size={14}
                className={`${
                  darkMode ? 'text-gray-400' : 'text-gray-600'
                } group-hover:text-white`}
              />
            </motion.div>
          </div>
        </div>

        {/* Selection Indicator */}
        {isSelected && (
          <motion.div
            className="absolute inset-0 border-2 border-blue-500 rounded-2xl pointer-events-none"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.2 }}
          />
        )}
      </motion.div>
    );
  }
);

EnhancedCategoryCard.displayName = 'EnhancedCategoryCard';

export default EnhancedCategoryCard;
