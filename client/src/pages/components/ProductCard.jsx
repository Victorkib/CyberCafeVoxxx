'use client';

import { memo, useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import {
  ShoppingCart,
  Star,
  Heart,
  Eye,
  Zap,
  Award,
  Clock,
  Truck,
} from 'lucide-react';
import ButtonLoader from './loaders/ButtonLoader';

const EnhancedProductCard = memo(
  ({
    product,
    darkMode,
    onQuickView,
    onAddToCart,
    onBuyNow,
    isLoading = false,
  }) => {
    const [imageLoaded, setImageLoaded] = useState(false);
    const [imageError, setImageError] = useState(false);
    const [isAddingToCart, setIsAddingToCart] = useState(false);
    const [isBuyingNow, setIsBuyingNow] = useState(false);
    const [isHovered, setIsHovered] = useState(false);

    const handleImageLoad = useCallback(() => {
      setImageLoaded(true);
    }, []);

    const handleImageError = useCallback(() => {
      setImageError(true);
      setImageLoaded(true);
    }, []);

    const handleQuickView = useCallback(
      (e) => {
        e.preventDefault();
        if (!isLoading) {
          onQuickView(product);
        }
      },
      [product, onQuickView, isLoading]
    );

    const handleAddToCart = useCallback(
      async (e) => {
        e.preventDefault();
        e.stopPropagation();
        if (!isLoading) {
          setIsAddingToCart(true);
          try {
            await onAddToCart(product);
          } finally {
            setIsAddingToCart(false);
          }
        }
      },
      [product, onAddToCart, isLoading]
    );

    const handleBuyNow = useCallback(
      async (e) => {
        e.preventDefault();
        e.stopPropagation();
        if (!isLoading) {
          setIsBuyingNow(true);
          try {
            await onBuyNow(product);
          } finally {
            setIsBuyingNow(false);
          }
        }
      },
      [product, onBuyNow, isLoading]
    );

    // Calculate discount percentage
    const discountPercentage =
      product.salePrice && product.price
        ? Math.round(
            ((product.price - product.salePrice) / product.price) * 100
          )
        : 0;

    // Get stock status
    const getStockStatus = () => {
      if (product.stock <= 0)
        return { text: 'Out of Stock', color: 'red', icon: Clock };
      if (product.stock < 5)
        return {
          text: `Only ${product.stock} left`,
          color: 'yellow',
          icon: Zap,
        };
      return { text: 'In Stock', color: 'green', icon: Truck };
    };

    const stockStatus = getStockStatus();
    const StockIcon = stockStatus.icon;

    return (
      <motion.div
        className={`group relative ${
          darkMode
            ? 'bg-gradient-to-br from-gray-800 to-gray-900 border-gray-700'
            : 'bg-gradient-to-br from-white to-gray-50 border-gray-200'
        } rounded-2xl border overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300 cursor-pointer ${
          isLoading ? 'opacity-75 pointer-events-none' : ''
        }`}
        onClick={handleQuickView}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        whileHover={{ y: -8, scale: 1.02 }}
        transition={{ type: 'spring', stiffness: 300, damping: 20 }}
      >
        {/* Loading overlay */}
        {isLoading && (
          <div className="absolute inset-0 bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm z-20 flex items-center justify-center rounded-2xl">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        )}

        {/* Image Section */}
        <div className="relative overflow-hidden">
          <div className="aspect-[4/3] bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-800 dark:to-gray-900">
            {!imageLoaded && (
              <div className="w-full h-full flex items-center justify-center">
                <div className="animate-pulse bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 dark:from-gray-700 dark:via-gray-600 dark:to-gray-700 w-full h-full"></div>
              </div>
            )}
            <img
              src={
                imageError
                  ? '/placeholder.svg'
                  : product.images?.[0] || product.image || '/placeholder.svg'
              }
              alt={product.name}
              className={`w-full h-full object-cover transition-all duration-500 group-hover:scale-110 ${
                imageLoaded ? 'opacity-100' : 'opacity-0'
              }`}
              loading="lazy"
              onLoad={handleImageLoad}
              onError={handleImageError}
            />

            {/* Gradient overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          </div>

          {/* Badges */}
          <div className="absolute top-3 left-3 flex flex-col gap-2">
            {product.onSale && discountPercentage > 0 && (
              <motion.div
                className="px-3 py-1 text-xs font-bold rounded-full bg-gradient-to-r from-red-500 to-pink-500 text-white shadow-lg"
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.1 }}
              >
                -{discountPercentage}%
              </motion.div>
            )}
            {product.isNewProduct && (
              <motion.div
                className="px-3 py-1 text-xs font-bold rounded-full bg-gradient-to-r from-green-500 to-emerald-500 text-white shadow-lg"
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.2 }}
              >
                NEW
              </motion.div>
            )}
            {product.featured && (
              <motion.div
                className="px-3 py-1 text-xs font-bold rounded-full bg-gradient-to-r from-yellow-500 to-orange-500 text-white shadow-lg flex items-center gap-1"
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.3 }}
              >
                <Award size={12} />
                FEATURED
              </motion.div>
            )}
          </div>

          {/* Action buttons */}
          <div className="absolute top-3 right-3 flex flex-col gap-2">
            <motion.button
              className="p-2 bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm rounded-full shadow-lg text-gray-700 dark:text-gray-300 hover:text-red-500 dark:hover:text-red-400 transition-colors"
              onClick={(e) => {
                e.stopPropagation();
                // Add to wishlist functionality
              }}
              aria-label="Add to wishlist"
              disabled={isLoading}
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: isHovered ? 1 : 0, opacity: isHovered ? 1 : 0 }}
              transition={{ duration: 0.2 }}
            >
              <Heart size={16} />
            </motion.button>

            <motion.button
              className="p-2 bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm rounded-full shadow-lg text-gray-700 dark:text-gray-300 hover:text-blue-500 dark:hover:text-blue-400 transition-colors"
              onClick={handleQuickView}
              aria-label="Quick view"
              disabled={isLoading}
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: isHovered ? 1 : 0, opacity: isHovered ? 1 : 0 }}
              transition={{ duration: 0.2, delay: 0.1 }}
            >
              <Eye size={16} />
            </motion.button>
          </div>

          {/* Stock status */}
          <div className="absolute bottom-3 left-3">
            <motion.div
              className={`px-2 py-1 text-xs font-medium rounded-full flex items-center gap-1 ${
                stockStatus.color === 'green'
                  ? 'bg-green-100 dark:bg-green-900/50 text-green-700 dark:text-green-300'
                  : stockStatus.color === 'yellow'
                  ? 'bg-yellow-100 dark:bg-yellow-900/50 text-yellow-700 dark:text-yellow-300'
                  : 'bg-red-100 dark:bg-red-900/50 text-red-700 dark:text-red-300'
              } backdrop-blur-sm`}
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: isHovered ? 1 : 0, opacity: isHovered ? 1 : 0 }}
              transition={{ duration: 0.2 }}
            >
              <StockIcon size={12} />
              {stockStatus.text}
            </motion.div>
          </div>
        </div>

        {/* Content Section */}
        <div className="p-5">
          {/* Category */}
          <div
            className={`text-xs font-medium ${
              darkMode ? 'text-blue-400' : 'text-blue-600'
            } mb-2 uppercase tracking-wide`}
          >
            {product.category?.name || 'Uncategorized'}
          </div>

          {/* Title */}
          <h3
            className={`font-bold text-lg ${
              darkMode ? 'text-white' : 'text-gray-900'
            } mb-2 line-clamp-2 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors`}
          >
            {product.name}
          </h3>

          {/* Rating */}
          <div className="flex items-center mb-3">
            <div className="flex">
              {[...Array(5)].map((_, i) => (
                <Star
                  key={i}
                  size={14}
                  className={
                    i < Math.floor(product.rating || 0)
                      ? 'text-yellow-400 fill-yellow-400'
                      : darkMode
                      ? 'text-gray-600'
                      : 'text-gray-300'
                  }
                />
              ))}
            </div>
            <span
              className={`text-xs ${
                darkMode ? 'text-gray-400' : 'text-gray-500'
              } ml-2`}
            >
              ({product.numReviews || 0} reviews)
            </span>
          </div>

          {/* Price */}
          <div className="flex items-baseline justify-between mb-4">
            <div className="flex items-baseline gap-2">
              {product.salePrice ? (
                <>
                  <span
                    className={`text-xl font-bold ${
                      darkMode ? 'text-white' : 'text-gray-900'
                    }`}
                  >
                    ${product.salePrice.toFixed(2)}
                  </span>
                  <span className="text-sm text-gray-500 line-through">
                    ${product.price.toFixed(2)}
                  </span>
                </>
              ) : (
                <span
                  className={`text-xl font-bold ${
                    darkMode ? 'text-white' : 'text-gray-900'
                  }`}
                >
                  ${product.price?.toFixed(2) || '0.00'}
                </span>
              )}
            </div>

            {discountPercentage > 0 && (
              <div className="text-xs font-bold text-green-600 dark:text-green-400 bg-green-100 dark:bg-green-900/30 px-2 py-1 rounded-full">
                Save ${(product.price - product.salePrice).toFixed(2)}
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex gap-2">
            <ButtonLoader
              isLoading={isAddingToCart}
              onClick={handleAddToCart}
              disabled={product.stock <= 0 || isLoading}
              className="flex-1 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-medium py-2.5 px-4 rounded-xl transition-all duration-200 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
              size="sm"
              variant="primary"
              loadingText="Adding..."
            >
              <ShoppingCart size={16} className="mr-2" />
              Add to Cart
            </ButtonLoader>

            <ButtonLoader
              isLoading={isBuyingNow}
              onClick={handleBuyNow}
              disabled={product.stock <= 0 || isLoading}
              className={`px-4 py-2.5 border-2 ${
                darkMode
                  ? 'border-gray-600 text-gray-300 hover:bg-gray-700 hover:border-gray-500'
                  : 'border-gray-300 text-gray-700 hover:bg-gray-50 hover:border-gray-400'
              } font-medium rounded-xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed`}
              variant="outline"
              size="sm"
              loadingText="..."
            >
              <Zap size={16} />
            </ButtonLoader>
          </div>

          {/* SKU */}
          {product.sku && (
            <div
              className={`text-xs ${
                darkMode ? 'text-gray-500' : 'text-gray-400'
              } mt-2 text-center`}
            >
              SKU: {product.sku}
            </div>
          )}
        </div>
      </motion.div>
    );
  }
);

EnhancedProductCard.displayName = 'EnhancedProductCard';

export default EnhancedProductCard;
