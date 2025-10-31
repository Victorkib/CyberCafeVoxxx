'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';
import LoaderSpinner from './LoaderSpinner';

const ToastLoader = ({
  isVisible,
  message,
  onDismiss,
  type = 'loading',
  position = 'top-right',
}) => {
  const positionClasses = {
    'top-right': 'top-4 right-4',
    'top-left': 'top-4 left-4',
    'bottom-right': 'bottom-4 right-4',
    'bottom-left': 'bottom-4 left-4',
    'top-center': 'top-4 left-1/2 transform -translate-x-1/2',
    'bottom-center': 'bottom-4 left-1/2 transform -translate-x-1/2',
  };

  const typeStyles = {
    loading: 'bg-blue-600 text-white',
    success: 'bg-green-600 text-white',
    error: 'bg-red-600 text-white',
    warning: 'bg-yellow-600 text-white',
  };

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, y: -20, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -20, scale: 0.95 }}
          className={`fixed ${positionClasses[position]} z-[9998] max-w-sm`}
        >
          <div
            className={`${typeStyles[type]} rounded-lg shadow-lg p-4 flex items-center space-x-3`}
          >
            {type === 'loading' && <LoaderSpinner size="sm" color="white" />}

            <span className="flex-1 text-sm font-medium">{message}</span>

            {onDismiss && (
              <button
                onClick={onDismiss}
                className="text-white/80 hover:text-white transition-colors"
              >
                <X size={16} />
              </button>
            )}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default ToastLoader;
