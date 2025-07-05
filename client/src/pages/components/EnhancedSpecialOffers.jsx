'use client';

import { memo, useState } from 'react';
import { motion } from 'framer-motion';
import {
  Clock,
  Zap,
  Gift,
  ArrowRight,
  Star,
  FlameIcon as Fire,
} from 'lucide-react';

const EnhancedSpecialOffers = memo(({ offers, darkMode }) => {
  const [hoveredOffer, setHoveredOffer] = useState(null);

  if (!offers || offers.length === 0) {
    return (
      <div className="text-center py-12">
        <Gift
          className={`w-16 h-16 mx-auto mb-4 ${
            darkMode ? 'text-gray-600' : 'text-gray-400'
          }`}
        />
        <p
          className={`text-lg ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}
        >
          No special offers available at the moment
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
      {offers.map((offer, index) => (
        <motion.div
          key={offer._id}
          className={`group relative overflow-hidden rounded-3xl ${
            darkMode
              ? 'bg-gradient-to-br from-gray-800 via-gray-900 to-black border-gray-700'
              : 'bg-gradient-to-br from-white via-gray-50 to-gray-100 border-gray-200'
          } border shadow-xl hover:shadow-2xl transition-all duration-500`}
          onMouseEnter={() => setHoveredOffer(offer._id)}
          onMouseLeave={() => setHoveredOffer(null)}
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: index * 0.2 }}
          whileHover={{ y: -10, scale: 1.02 }}
        >
          {/* Background Pattern */}
          <div className="absolute inset-0 opacity-5">
            <div className="absolute inset-0 bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500" />
            <div
              className="absolute inset-0"
              style={{
                backgroundImage: `radial-gradient(circle at 25% 25%, rgba(255,255,255,0.1) 0%, transparent 50%), 
                               radial-gradient(circle at 75% 75%, rgba(255,255,255,0.1) 0%, transparent 50%)`,
              }}
            />
          </div>

          <div className="relative flex flex-col lg:flex-row h-full">
            {/* Image Section */}
            <div className="lg:w-2/5 relative overflow-hidden">
              <div className="aspect-[4/3] lg:h-full">
                <img
                  src={offer.image || '/placeholder.svg'}
                  alt={offer.title}
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                />

                {/* Image Overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />

                {/* Floating Discount Badge */}
                <motion.div
                  className="absolute top-6 left-6 bg-gradient-to-r from-red-500 via-pink-500 to-red-600 text-white px-4 py-2 rounded-2xl shadow-2xl"
                  initial={{ scale: 0, rotate: -10 }}
                  animate={{ scale: 1, rotate: 0 }}
                  transition={{
                    delay: 0.3 + index * 0.1,
                    type: 'spring',
                    stiffness: 300,
                  }}
                  whileHover={{ scale: 1.1, rotate: 5 }}
                >
                  <div className="flex items-center gap-2">
                    <Fire size={16} />
                    <span className="font-bold text-lg">
                      {offer.discount || `${offer.discountPercentage}% OFF`}
                    </span>
                  </div>
                </motion.div>

                {/* Limited Time Indicator */}
                <motion.div
                  className="absolute bottom-6 left-6 bg-black/50 backdrop-blur-md text-white px-3 py-2 rounded-xl"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{
                    opacity: hoveredOffer === offer._id ? 1 : 0,
                    y: hoveredOffer === offer._id ? 0 : 20,
                  }}
                  transition={{ duration: 0.3 }}
                >
                  <div className="flex items-center gap-2 text-sm">
                    <Clock size={14} />
                    <span>Limited Time</span>
                  </div>
                </motion.div>
              </div>
            </div>

            {/* Content Section */}
            <div className="lg:w-3/5 p-8 flex flex-col justify-between">
              <div>
                {/* Category Tag */}
                <motion.div
                  className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-gradient-to-r from-blue-500/20 to-purple-500/20 text-blue-600 dark:text-blue-400 text-sm font-medium mb-4"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.4 + index * 0.1 }}
                >
                  <Zap size={14} />
                  Special Deal
                </motion.div>

                {/* Title */}
                <motion.h3
                  className={`text-2xl lg:text-3xl font-bold ${
                    darkMode ? 'text-white' : 'text-gray-900'
                  } mb-4 leading-tight`}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5 + index * 0.1 }}
                >
                  {offer.title}
                </motion.h3>

                {/* Description */}
                <motion.p
                  className={`text-base ${
                    darkMode ? 'text-gray-300' : 'text-gray-600'
                  } mb-6 leading-relaxed`}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.6 + index * 0.1 }}
                >
                  {offer.description}
                </motion.p>

                {/* Features/Benefits */}
                <motion.div
                  className="flex flex-wrap gap-3 mb-6"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.7 + index * 0.1 }}
                >
                  {[
                    'Free Shipping',
                    'Extended Warranty',
                    'Premium Support',
                  ].map((feature, idx) => (
                    <div
                      key={idx}
                      className={`flex items-center gap-2 px-3 py-1 rounded-full text-sm ${
                        darkMode
                          ? 'bg-gray-700/50 text-gray-300'
                          : 'bg-gray-100 text-gray-700'
                      }`}
                    >
                      <Star size={12} className="text-yellow-500" />
                      {feature}
                    </div>
                  ))}
                </motion.div>
              </div>

              {/* Action Button */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.8 + index * 0.1 }}
              >
                <motion.button
                  className="group/btn relative overflow-hidden bg-gradient-to-r from-blue-600 via-blue-700 to-blue-800 hover:from-blue-700 hover:via-blue-800 hover:to-blue-900 text-white font-bold py-4 px-8 rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-300 w-full lg:w-auto"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  {/* Button Background Animation */}
                  <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 -translate-x-full group-hover/btn:translate-x-full transition-transform duration-1000" />

                  <div className="relative flex items-center justify-center gap-3">
                    <span className="text-lg">Shop This Deal</span>
                    <motion.div
                      animate={{ x: hoveredOffer === offer._id ? 5 : 0 }}
                      transition={{ duration: 0.2 }}
                    >
                      <ArrowRight size={20} />
                    </motion.div>
                  </div>
                </motion.button>
              </motion.div>
            </div>
          </div>

          {/* Decorative Elements */}
          <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-blue-500/10 to-purple-500/10 rounded-full -translate-y-16 translate-x-16" />
          <div className="absolute bottom-0 left-0 w-24 h-24 bg-gradient-to-tr from-pink-500/10 to-yellow-500/10 rounded-full translate-y-12 -translate-x-12" />
        </motion.div>
      ))}
    </div>
  );
});

EnhancedSpecialOffers.displayName = 'EnhancedSpecialOffers';

export default EnhancedSpecialOffers;
