'use client';

import { motion, AnimatePresence } from 'framer-motion';
import LoaderSpinner from './LoaderSpinner';

const GlobalLoader = ({
  isVisible,
  message = 'Loading...',
  submessage = '',
  variant = 'spinner',
  backdrop = true,
}) => {
  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[9999] flex items-center justify-center"
        >
          {backdrop && (
            <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" />
          )}

          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            className="relative bg-white dark:bg-gray-800 rounded-2xl p-8 shadow-2xl max-w-sm mx-4"
          >
            <div className="text-center">
              <LoaderSpinner
                size="lg"
                color="blue"
                variant={variant}
                className="mb-4"
              />

              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                {message}
              </h3>

              {submessage && (
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {submessage}
                </p>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default GlobalLoader;
