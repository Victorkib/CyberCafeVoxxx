'use client';

import { memo, useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Filter, Package, ArrowLeft } from 'lucide-react';
import EnhancedProductCard from './ProductCard';
import SectionLoader from './loaders/SectionLoader';

const DynamicProductsSection = memo(
  ({
    products,
    categories,
    selectedCategory,
    onCategoryChange,
    onQuickView,
    onAddToCart,
    onBuyNow,
    currentLoadingProduct,
    isLoading,
    darkMode,
  }) => {
    const [filteredProducts, setFilteredProducts] = useState([]);
    const [displayMode, setDisplayMode] = useState('featured'); // "featured" or "category"
    const [animationKey, setAnimationKey] = useState(0);

    // Filter products based on selected category
    useEffect(() => {
      if (selectedCategory && selectedCategory !== 'All') {
        const categoryObj = categories.find(
          (cat) => cat.name === selectedCategory
        );
        if (categoryObj) {
          const filtered = products.filter(
            (product) =>
              product.category === categoryObj._id ||
              product.category?.name === selectedCategory ||
              product.category?._id === categoryObj._id
          );
          setFilteredProducts(filtered);
          setDisplayMode('category');
          setAnimationKey((prev) => prev + 1);
        }
      } else {
        // Show featured products when no category is selected
        const featured = products.filter((product) => product.featured);
        setFilteredProducts(
          featured.length > 0 ? featured : products.slice(0, 8)
        );
        setDisplayMode('featured');
        setAnimationKey((prev) => prev + 1);
      }
    }, [selectedCategory, products, categories]);

    const handleClearFilter = () => {
      onCategoryChange('All');
    };

    const currentProducts =
      displayMode === 'category' ? filteredProducts : filteredProducts;
    const selectedCategoryObj = categories.find(
      (cat) => cat.name === selectedCategory
    );

    return (
      <section
        id="featured-products"
        className="py-20 relative overflow-hidden"
      >
        {/* Background Elements */}
        <div className="absolute inset-0 opacity-5">
          <div className="absolute top-1/4 right-1/4 w-96 h-96 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full blur-3xl" />
          <div className="absolute bottom-1/4 left-1/4 w-96 h-96 bg-gradient-to-br from-green-500 to-blue-500 rounded-full blur-3xl" />
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 relative">
          {/* Dynamic Header */}
          <motion.div
            key={`header-${animationKey}`}
            className="text-center mb-16"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            {displayMode === 'category' && selectedCategoryObj ? (
              // Category Mode Header
              <div>
                <div className="flex items-center justify-center mb-6">
                  <motion.button
                    onClick={handleClearFilter}
                    className={`flex items-center gap-2 px-4 py-2 rounded-full ${
                      darkMode
                        ? 'bg-gray-800 hover:bg-gray-700 text-gray-300 hover:text-white border border-gray-700'
                        : 'bg-white hover:bg-gray-50 text-gray-600 hover:text-gray-900 border border-gray-200'
                    } transition-all duration-200 shadow-lg hover:shadow-xl`}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <ArrowLeft size={16} />
                    <span className="text-sm font-medium">
                      Back to Featured
                    </span>
                  </motion.button>
                </div>

                <div className="flex items-center justify-center mb-6">
                  <motion.div
                    className="flex items-center gap-3 px-6 py-3 rounded-2xl bg-gradient-to-r from-blue-100 to-purple-100 dark:from-blue-900/30 dark:to-purple-900/30"
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: 'spring', stiffness: 300, delay: 0.2 }}
                  >
                    <div className="w-12 h-12 rounded-full overflow-hidden border-2 border-white dark:border-gray-700 shadow-lg">
                      <img
                        src={selectedCategoryObj.image || '/placeholder.svg'}
                        alt={selectedCategoryObj.name}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="text-left">
                      <div className="text-sm font-medium text-blue-600 dark:text-blue-400 uppercase tracking-wide">
                        Category
                      </div>
                      <div
                        className={`text-lg font-bold ${
                          darkMode ? 'text-white' : 'text-gray-900'
                        }`}
                      >
                        {selectedCategoryObj.name}
                      </div>
                    </div>
                    <div
                      className={`px-3 py-1 rounded-full text-sm font-medium ${
                        darkMode
                          ? 'bg-blue-900/50 text-blue-300'
                          : 'bg-blue-100 text-blue-700'
                      }`}
                    >
                      {currentProducts.length} items
                    </div>
                  </motion.div>
                </div>

                <h2
                  className={`text-4xl lg:text-5xl font-bold ${
                    darkMode ? 'text-white' : 'text-gray-900'
                  } mb-4`}
                >
                  {selectedCategoryObj.name} Collection
                </h2>
                <p
                  className={`text-xl ${
                    darkMode ? 'text-gray-400' : 'text-gray-600'
                  } max-w-3xl mx-auto`}
                >
                  {selectedCategoryObj.description}
                </p>
              </div>
            ) : (
              // Featured Mode Header
              <div>
                <div className="inline-block px-4 py-2 rounded-full bg-gradient-to-r from-green-100 to-blue-100 dark:from-green-900/30 dark:to-blue-900/30 text-green-600 dark:text-green-400 text-sm font-medium mb-6">
                  ⭐ Featured Collection
                </div>
                <h2
                  className={`text-4xl lg:text-5xl font-bold ${
                    darkMode ? 'text-white' : 'text-gray-900'
                  } mb-4`}
                >
                  Featured Products
                </h2>
                <p
                  className={`text-xl ${
                    darkMode ? 'text-gray-400' : 'text-gray-600'
                  } max-w-2xl mx-auto`}
                >
                  Hand-picked products for your tech needs and lifestyle
                </p>
              </div>
            )}
          </motion.div>

          {/* Filter Status Bar */}
          <AnimatePresence>
            {displayMode === 'category' && (
              <motion.div
                className={`flex items-center justify-between p-4 rounded-2xl mb-8 ${
                  darkMode
                    ? 'bg-gray-800/50 border border-gray-700'
                    : 'bg-white/50 border border-gray-200'
                } backdrop-blur-sm`}
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`p-2 rounded-lg ${
                      darkMode ? 'bg-blue-900/50' : 'bg-blue-100'
                    }`}
                  >
                    <Filter
                      size={16}
                      className="text-blue-600 dark:text-blue-400"
                    />
                  </div>
                  <div>
                    <div
                      className={`text-sm font-medium ${
                        darkMode ? 'text-white' : 'text-gray-900'
                      }`}
                    >
                      Filtered by: {selectedCategory}
                    </div>
                    <div
                      className={`text-xs ${
                        darkMode ? 'text-gray-400' : 'text-gray-500'
                      }`}
                    >
                      Showing {currentProducts.length} products
                    </div>
                  </div>
                </div>

                <motion.button
                  onClick={handleClearFilter}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium ${
                    darkMode
                      ? 'text-gray-400 hover:text-white hover:bg-gray-700'
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                  } transition-colors`}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <X size={14} />
                  Clear Filter
                </motion.button>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Products Grid */}
          <SectionLoader
            isLoading={isLoading}
            message="Loading products..."
            height="600px"
          >
            <AnimatePresence mode="wait">
              <motion.div
                key={`products-${animationKey}`}
                className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.5, staggerChildren: 0.1 }}
              >
                {currentProducts.length > 0 ? (
                  currentProducts.map((product, index) => (
                    <motion.div
                      key={`${product._id}-${animationKey}`}
                      initial={{ opacity: 0, y: 30 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.5, delay: index * 0.1 }}
                    >
                      <EnhancedProductCard
                        product={product}
                        darkMode={darkMode}
                        onQuickView={onQuickView}
                        onAddToCart={onAddToCart}
                        onBuyNow={onBuyNow}
                        isLoading={currentLoadingProduct === product._id}
                      />
                    </motion.div>
                  ))
                ) : (
                  <motion.div
                    className="col-span-full text-center py-16"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.5 }}
                  >
                    <Package
                      className={`w-16 h-16 mx-auto mb-4 ${
                        darkMode ? 'text-gray-600' : 'text-gray-400'
                      }`}
                    />
                    <h3
                      className={`text-xl font-semibold mb-2 ${
                        darkMode ? 'text-white' : 'text-gray-900'
                      }`}
                    >
                      No products found
                    </h3>
                    <p
                      className={`text-base ${
                        darkMode ? 'text-gray-400' : 'text-gray-600'
                      } mb-6`}
                    >
                      We couldn't find any products in this category.
                    </p>
                    <motion.button
                      onClick={handleClearFilter}
                      className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors"
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      Browse All Products
                    </motion.button>
                  </motion.div>
                )}
              </motion.div>
            </AnimatePresence>
          </SectionLoader>

          {/* Category Stats */}
          {displayMode === 'category' && currentProducts.length > 0 && (
            <motion.div
              className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-6"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
            >
              <div
                className={`text-center p-6 rounded-2xl ${
                  darkMode
                    ? 'bg-gray-800/50 border border-gray-700'
                    : 'bg-white/50 border border-gray-200'
                } backdrop-blur-sm`}
              >
                <div
                  className={`text-3xl font-bold ${
                    darkMode ? 'text-white' : 'text-gray-900'
                  } mb-2`}
                >
                  {currentProducts.length}
                </div>
                <div
                  className={`text-sm ${
                    darkMode ? 'text-gray-400' : 'text-gray-600'
                  }`}
                >
                  Total Products
                </div>
              </div>

              <div
                className={`text-center p-6 rounded-2xl ${
                  darkMode
                    ? 'bg-gray-800/50 border border-gray-700'
                    : 'bg-white/50 border border-gray-200'
                } backdrop-blur-sm`}
              >
                <div
                  className={`text-3xl font-bold ${
                    darkMode ? 'text-white' : 'text-gray-900'
                  } mb-2`}
                >
                  {currentProducts.filter((p) => p.onSale).length}
                </div>
                <div
                  className={`text-sm ${
                    darkMode ? 'text-gray-400' : 'text-gray-600'
                  }`}
                >
                  On Sale
                </div>
              </div>

              <div
                className={`text-center p-6 rounded-2xl ${
                  darkMode
                    ? 'bg-gray-800/50 border border-gray-700'
                    : 'bg-white/50 border border-gray-200'
                } backdrop-blur-sm`}
              >
                <div
                  className={`text-3xl font-bold ${
                    darkMode ? 'text-white' : 'text-gray-900'
                  } mb-2`}
                >
                  {currentProducts.filter((p) => p.isNewProduct).length}
                </div>
                <div
                  className={`text-sm ${
                    darkMode ? 'text-gray-400' : 'text-gray-600'
                  }`}
                >
                  New Arrivals
                </div>
              </div>
            </motion.div>
          )}
        </div>
      </section>
    );
  }
);

DynamicProductsSection.displayName = 'DynamicProductsSection';

export default DynamicProductsSection;
