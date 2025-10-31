'use client';

import { useState, useEffect, useRef, memo } from 'react';
import { useSelector } from 'react-redux';
import { motion } from 'framer-motion';
import {
  X,
  Star,
  Check,
  Plus,
  Minus,
  ShoppingCart,
  Truck,
  RefreshCw,
  Shield,
  Tag,
} from 'lucide-react';

const QuickViewModal = memo(
  ({ product, isOpen, onClose, onAddToCart, onBuyNow }) => {
    const [quantity, setQuantity] = useState(1);
    const [selectedImage, setSelectedImage] = useState(0);
    const { darkMode } = useSelector((state) => state.ui);
    const [isClosing, setIsClosing] = useState(false);
    const [selectedTab, setSelectedTab] = useState('description');
    const modalRef = useRef(null);

    const incrementQuantity = () => setQuantity((prev) => prev + 1);
    const decrementQuantity = () =>
      setQuantity((prev) => (prev > 1 ? prev - 1 : 1));

    // Lock body scroll when modal is open - IMPROVED VERSION
    useEffect(() => {
      if (isOpen) {
        // Store the current scroll position
        const scrollY = window.scrollY;
        document.body.style.position = 'fixed';
        document.body.style.top = `-${scrollY}px`;
        document.body.style.width = '100%';
        document.body.style.left = '0';
        document.body.style.right = '0';

        // Store scroll position in a data attribute for cleanup
        document.body.setAttribute('data-scroll-y', scrollY.toString());
      } else {
        // Restore scroll position
        const scrollY = document.body.getAttribute('data-scroll-y');
        document.body.style.position = '';
        document.body.style.top = '';
        document.body.style.width = '';
        document.body.style.left = '';
        document.body.style.right = '';
        document.body.removeAttribute('data-scroll-y');

        // Restore the scroll position without scrolling to top
        if (scrollY) {
          window.scrollTo(0, Number.parseInt(scrollY));
        }
      }

      return () => {
        // Cleanup function
        const scrollY = document.body.getAttribute('data-scroll-y');
        document.body.style.position = '';
        document.body.style.top = '';
        document.body.style.width = '';
        document.body.style.left = '';
        document.body.style.right = '';
        document.body.removeAttribute('data-scroll-y');

        if (scrollY) {
          window.scrollTo(0, Number.parseInt(scrollY));
        }
      };
    }, [isOpen]);

    // Handle click outside to close
    useEffect(() => {
      const handleClickOutside = (event) => {
        if (modalRef.current && !modalRef.current.contains(event.target)) {
          handleClose();
        }
      };

      if (isOpen) {
        document.addEventListener('mousedown', handleClickOutside);
      }

      return () => {
        document.removeEventListener('mousedown', handleClickOutside);
      };
    }, [isOpen]);

    // Handle escape key to close
    useEffect(() => {
      const handleEscKey = (e) => {
        if (e.key === 'Escape') {
          handleClose();
        }
      };

      if (isOpen) {
        document.addEventListener('keydown', handleEscKey);
      }

      return () => {
        document.removeEventListener('keydown', handleEscKey);
      };
    }, [isOpen]);

    const handleClose = () => {
      setIsClosing(true);
      setTimeout(() => {
        onClose();
        setIsClosing(false);
        setSelectedTab('description');
        setQuantity(1);
      }, 300);
    };

    if (!isOpen || !product) return null;

    const productImages = product.images || [
      product.image || '/placeholder.svg',
    ];

    const discountPercentage =
      product.salePrice && product.price
        ? Math.round(
            ((product.price - product.salePrice) / product.price) * 100
          )
        : 0;

    const getStatusLabel = () => {
      if (product.stock <= 0 || product.status === 'out_of_stock') {
        return (
          <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200">
            <div className="w-2 h-2 rounded-full bg-red-500 mr-2"></div>
            Out of Stock
          </span>
        );
      } else if (product.stock < 10) {
        return (
          <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200">
            <div className="w-2 h-2 rounded-full bg-yellow-500 mr-2"></div>
            Low Stock ({product.stock} left)
          </span>
        );
      } else {
        return (
          <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
            <div className="w-2 h-2 rounded-full bg-green-500 mr-2"></div>
            In Stock
          </span>
        );
      }
    };

    return (
      <motion.div
        className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black bg-opacity-0 overflow-hidden"
        initial={{ backgroundColor: 'rgba(0, 0, 0, 0)' }}
        animate={{
          backgroundColor: isClosing
            ? 'rgba(0, 0, 0, 0)'
            : 'rgba(0, 0, 0, 0.75)',
          backdropFilter: isClosing ? 'blur(0px)' : 'blur(5px)',
        }}
        transition={{ duration: 0.3 }}
      >
        <motion.div
          ref={modalRef}
          className={`relative w-full max-w-4xl rounded-2xl shadow-2xl ${
            darkMode ? 'bg-gray-800' : 'bg-white'
          } max-h-[90vh] flex flex-col`}
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{
            opacity: isClosing ? 0 : 1,
            scale: isClosing ? 0.9 : 1,
            y: isClosing ? 20 : 0,
          }}
          transition={{
            type: 'spring',
            damping: 25,
            stiffness: 300,
            duration: 0.3,
          }}
        >
          <button
            onClick={handleClose}
            className="absolute top-2 right-2 sm:top-4 sm:right-4 z-10 p-2 rounded-full bg-white/10 backdrop-blur-md text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 transition-all duration-200 shadow-md"
            aria-label="Close modal"
          >
            <X size={20} />
          </button>

          <div className="flex flex-col md:flex-row overflow-hidden max-h-[90vh]">
            {/* Product Images */}
            <div className="relative bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 md:w-2/5">
              <div className="aspect-square overflow-hidden">
                <motion.img
                  key={selectedImage}
                  src={productImages[selectedImage] || '/placeholder.svg'}
                  alt={product.name}
                  className="w-full h-full object-contain p-2 sm:p-4"
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.3 }}
                />

                {/* Product badges */}
                <div className="absolute top-2 left-2 sm:top-4 sm:left-4 flex flex-col gap-2">
                  {product.onSale && (
                    <div className="px-2 sm:px-3 py-1 text-xs font-bold rounded-full bg-red-600 text-white shadow-md backdrop-blur-sm bg-opacity-90">
                      Sale
                    </div>
                  )}
                  {product.isNewProduct && (
                    <div className="px-2 sm:px-3 py-1 text-xs font-bold rounded-full bg-green-600 text-white shadow-md backdrop-blur-sm bg-opacity-90">
                      New
                    </div>
                  )}
                  {product.featured && (
                    <div className="px-2 sm:px-3 py-1 text-xs font-bold rounded-full bg-yellow-500 text-white shadow-md backdrop-blur-sm bg-opacity-90">
                      Featured
                    </div>
                  )}
                </div>
              </div>

              {/* Thumbnail Navigation */}
              <div className="flex justify-center mt-2 sm:mt-4 space-x-1 sm:space-x-2 px-2 sm:px-4 pb-2 sm:pb-4 overflow-x-auto">
                {productImages.map((img, idx) => (
                  <button
                    key={idx}
                    onClick={() => setSelectedImage(idx)}
                    className={`w-12 h-12 sm:w-16 sm:h-16 rounded-lg overflow-hidden border-2 transition-all flex-shrink-0 ${
                      selectedImage === idx
                        ? 'border-blue-600 dark:border-blue-400 shadow-md scale-110'
                        : 'border-transparent hover:border-gray-300 dark:hover:border-gray-600 opacity-70 hover:opacity-100'
                    }`}
                    aria-label={`View image ${idx + 1}`}
                  >
                    <img
                      src={img || '/placeholder.svg'}
                      alt={`Thumbnail ${idx + 1}`}
                      className="w-full h-full object-cover"
                    />
                  </button>
                ))}
              </div>
            </div>

            {/* Product Details */}
            <div className="p-4 sm:p-6 md:p-8 flex flex-col overflow-y-auto md:w-3/5 max-h-[90vh] md:max-h-none">
              <div className="mb-2 flex flex-wrap gap-2">
                <span className="text-xs sm:text-sm font-medium px-2 sm:px-3 py-1 rounded-full bg-blue-100 dark:bg-blue-900/40 text-blue-800 dark:text-blue-300">
                  {product.category?.name || 'Uncategorized'}
                </span>
                {product.sku && (
                  <span className="text-xs sm:text-sm font-medium px-2 sm:px-3 py-1 rounded-full bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-300">
                    SKU: {product.sku}
                  </span>
                )}
              </div>

              <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-900 dark:text-white mb-2">
                {product.name}
              </h2>

              <div className="flex items-center mb-3 sm:mb-4">
                <div className="flex">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      size={16}
                      className={
                        i < Math.floor(product.rating || 0)
                          ? 'text-yellow-400 fill-yellow-400'
                          : 'text-gray-300 dark:text-gray-600'
                      }
                    />
                  ))}
                </div>
                <span className="ml-2 text-xs sm:text-sm text-gray-600 dark:text-gray-400">
                  {product.rating?.toFixed(1) || '0.0'} (
                  {product.numReviews || 0} reviews)
                </span>
              </div>

              <div className="mb-4 sm:mb-6">
                <div className="flex items-baseline">
                  {product.salePrice ? (
                    <>
                      <span className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">
                        ${product.salePrice?.toFixed(2)}
                      </span>
                      <span className="ml-2 sm:ml-3 text-base sm:text-lg text-gray-500 dark:text-gray-400 line-through">
                        ${product.price?.toFixed(2)}
                      </span>
                    </>
                  ) : (
                    <span className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">
                      ${product.price?.toFixed(2) || '0.00'}
                    </span>
                  )}
                </div>
                {discountPercentage > 0 && (
                  <span className="inline-block mt-1 text-xs sm:text-sm font-medium text-green-600 dark:text-green-400 bg-green-100 dark:bg-green-900/30 px-2 py-0.5 rounded-full">
                    Save {discountPercentage}% for a limited time
                  </span>
                )}
              </div>

              {/* Tabs for product information */}
              <div className="mb-4 sm:mb-6 border-b border-gray-200 dark:border-gray-700">
                <div className="flex space-x-4">
                  <button
                    onClick={() => setSelectedTab('description')}
                    className={`pb-2 text-sm font-medium ${
                      selectedTab === 'description'
                        ? 'text-blue-600 dark:text-blue-400 border-b-2 border-blue-600 dark:border-blue-400'
                        : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
                    }`}
                  >
                    Description
                  </button>
                  <button
                    onClick={() => setSelectedTab('specifications')}
                    className={`pb-2 text-sm font-medium ${
                      selectedTab === 'specifications'
                        ? 'text-blue-600 dark:text-blue-400 border-b-2 border-blue-600 dark:border-blue-400'
                        : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
                    }`}
                  >
                    Specifications
                  </button>
                  <button
                    onClick={() => setSelectedTab('shipping')}
                    className={`pb-2 text-sm font-medium ${
                      selectedTab === 'shipping'
                        ? 'text-blue-600 dark:text-blue-400 border-b-2 border-blue-600 dark:border-blue-400'
                        : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
                    }`}
                  >
                    Shipping
                  </button>
                </div>
              </div>

              {/* Tab content */}
              <div className="mb-4 sm:mb-6">
                {selectedTab === 'description' && (
                  <div>
                    <p className="text-sm sm:text-base text-gray-600 dark:text-gray-300 leading-relaxed">
                      {product.description}
                    </p>

                    <div className="mt-4 bg-gray-50 dark:bg-gray-700/50 p-3 sm:p-4 rounded-xl">
                      <h3 className="text-xs sm:text-sm font-medium text-gray-900 dark:text-white mb-2 sm:mb-3">
                        Key Features:
                      </h3>
                      <ul className="space-y-1 sm:space-y-2">
                        <li className="flex items-center text-xs sm:text-sm text-gray-600 dark:text-gray-300">
                          <div className="w-4 h-4 sm:w-5 sm:h-5 rounded-full bg-green-100 dark:bg-green-900/50 flex items-center justify-center mr-2 sm:mr-3 flex-shrink-0">
                            <Check
                              size={10}
                              className="text-green-600 dark:text-green-400"
                            />
                          </div>
                          Premium quality materials
                        </li>
                        <li className="flex items-center text-xs sm:text-sm text-gray-600 dark:text-gray-300">
                          <div className="w-4 h-4 sm:w-5 sm:h-5 rounded-full bg-green-100 dark:bg-green-900/50 flex items-center justify-center mr-2 sm:mr-3 flex-shrink-0">
                            <Check
                              size={10}
                              className="text-green-600 dark:text-green-400"
                            />
                          </div>
                          Enhanced performance
                        </li>
                        <li className="flex items-center text-xs sm:text-sm text-gray-600 dark:text-gray-300">
                          <div className="w-4 h-4 sm:w-5 sm:h-5 rounded-full bg-green-100 dark:bg-green-900/50 flex items-center justify-center mr-2 sm:mr-3 flex-shrink-0">
                            <Check
                              size={10}
                              className="text-green-600 dark:text-green-400"
                            />
                          </div>
                          Durable construction
                        </li>
                        <li className="flex items-center text-xs sm:text-sm text-gray-600 dark:text-gray-300">
                          <div className="w-4 h-4 sm:w-5 sm:h-5 rounded-full bg-green-100 dark:bg-green-900/50 flex items-center justify-center mr-2 sm:mr-3 flex-shrink-0">
                            <Check
                              size={10}
                              className="text-green-600 dark:text-green-400"
                            />
                          </div>
                          1-year warranty
                        </li>
                      </ul>
                    </div>
                  </div>
                )}

                {selectedTab === 'specifications' && (
                  <div>
                    {product.specifications &&
                    Object.keys(product.specifications).length > 0 ? (
                      <div className="bg-gray-50 dark:bg-gray-700/50 rounded-xl overflow-hidden">
                        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                          <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                            {Object.entries(product.specifications).map(
                              ([key, value]) => (
                                <tr key={key}>
                                  <td className="px-4 py-2 text-sm font-medium text-gray-900 dark:text-white capitalize">
                                    {key.replace(/([A-Z])/g, ' $1').trim()}
                                  </td>
                                  <td className="px-4 py-2 text-sm text-gray-600 dark:text-gray-300">
                                    {value}
                                  </td>
                                </tr>
                              )
                            )}
                          </tbody>
                        </table>
                      </div>
                    ) : (
                      <p className="text-sm text-gray-500 dark:text-gray-400 italic">
                        Detailed specifications not available for this product.
                      </p>
                    )}

                    {product.tags && product.tags.length > 0 && (
                      <div className="mt-4">
                        <h4 className="text-xs font-medium uppercase text-gray-500 dark:text-gray-400 mb-2">
                          Tags:
                        </h4>
                        <div className="flex flex-wrap gap-2">
                          {product.tags.map((tag, idx) => (
                            <span
                              key={idx}
                              className="inline-flex items-center px-2 py-1 rounded-md text-xs bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300"
                            >
                              <Tag size={12} className="mr-1" />
                              {tag}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {selectedTab === 'shipping' && (
                  <div className="space-y-4">
                    <div className="flex items-start">
                      <Truck className="w-5 h-5 text-blue-600 dark:text-blue-400 mt-0.5 mr-3 flex-shrink-0" />
                      <div>
                        <h4 className="text-sm font-medium text-gray-900 dark:text-white">
                          Free Shipping
                        </h4>
                        <p className="text-xs text-gray-600 dark:text-gray-300">
                          On orders over Ksh 5,000. Delivery within 3-5 business days.
                        </p>
                      </div>
                    </div>

                    <div className="flex items-start">
                      <RefreshCw className="w-5 h-5 text-blue-600 dark:text-blue-400 mt-0.5 mr-3 flex-shrink-0" />
                      <div>
                        <h4 className="text-sm font-medium text-gray-900 dark:text-white">
                          Easy Returns
                        </h4>
                        <p className="text-xs text-gray-600 dark:text-gray-300">
                          30-day money back guarantee. Return shipping is free.
                        </p>
                      </div>
                    </div>

                    <div className="flex items-start">
                      <Shield className="w-5 h-5 text-blue-600 dark:text-blue-400 mt-0.5 mr-3 flex-shrink-0" />
                      <div>
                        <h4 className="text-sm font-medium text-gray-900 dark:text-white">
                          Warranty
                        </h4>
                        <p className="text-xs text-gray-600 dark:text-gray-300">
                          All products come with a 1-year limited warranty.
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              <div className="flex flex-col sm:flex-row items-center gap-3 sm:gap-4 mb-4 sm:mb-6 bg-gray-50 dark:bg-gray-700/50 p-3 sm:p-4 rounded-xl">
                <div className="w-full sm:w-auto">
                  <label className="block text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 sm:mb-2">
                    Quantity
                  </label>
                  <div className="flex items-center border border-gray-300 dark:border-gray-600 rounded-lg overflow-hidden">
                    <button
                      onClick={decrementQuantity}
                      className="px-2 sm:px-3 py-2 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                      disabled={product.stock <= 0}
                      aria-label="Decrease quantity"
                    >
                      <Minus size={14} />
                    </button>
                    <span className="w-8 sm:w-10 text-center py-2 font-medium text-gray-900 dark:text-white">
                      {quantity}
                    </span>
                    <button
                      onClick={incrementQuantity}
                      className="px-2 sm:px-3 py-2 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                      disabled={product.stock <= 0 || quantity >= product.stock}
                      aria-label="Increase quantity"
                    >
                      <Plus size={14} />
                    </button>
                  </div>
                </div>

                <div className="w-full sm:w-auto">
                  <label className="block text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 sm:mb-2">
                    Availability
                  </label>
                  {getStatusLabel()}
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 mt-auto">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => {
                    onAddToCart(product, quantity);
                    onClose();
                  }}
                  autoFocus
                  className="flex-1 flex items-center justify-center px-4 sm:px-6 py-2 sm:py-3 border border-transparent rounded-lg shadow-sm text-sm sm:text-base font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  disabled={product.stock <= 0}
                >
                  <ShoppingCart size={16} className="mr-1 sm:mr-2" />
                  Add to Cart
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => {
                    onBuyNow(product);
                    onClose();
                  }}
                  autoFocus
                  className="flex-1 flex items-center justify-center px-4 sm:px-6 py-2 sm:py-3 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm text-sm sm:text-base font-medium text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  disabled={product.stock <= 0}
                >
                  Buy Now
                </motion.button>
              </div>
            </div>
          </div>
        </motion.div>
      </motion.div>
    );
  }
);

export default QuickViewModal;
