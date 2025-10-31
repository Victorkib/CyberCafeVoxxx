'use client';

import { motion } from 'framer-motion';
import LoaderSpinner from './LoaderSpinner';

const SectionLoader = ({
  isLoading,
  children,
  message = 'Loading content...',
  height = 'auto',
  className = '',
}) => {
  if (!isLoading) {
    return children;
  }

  return (
    <div className={`relative ${className}`} style={{ minHeight: height }}>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="absolute inset-0 bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm z-50 flex items-center justify-center rounded-lg"
      >
        <div className="text-center">
          <LoaderSpinner size="lg" color="blue" variant="pulse" />
          <p className="mt-4 text-sm font-medium text-gray-600 dark:text-gray-400">
            {message}
          </p>
        </div>
      </motion.div>

      <div className="opacity-30 pointer-events-none">{children}</div>
    </div>
  );
};

export default SectionLoader;
