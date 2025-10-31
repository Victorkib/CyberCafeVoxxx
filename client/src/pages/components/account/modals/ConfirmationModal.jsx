'use client';
import { useSelector } from 'react-redux';
import { motion, AnimatePresence } from 'framer-motion';
import {
  AlertTriangle,
  Info,
  CheckCircle,
  XCircle,
  X,
  Trash2,
  AlertCircle,
} from 'lucide-react';
import ButtonLoader from '../../loaders/ButtonLoader';

const ConfirmationModal = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  type = 'warning', // 'warning', 'danger', 'info', 'success'
  isLoading = false,
  icon: CustomIcon,
  details,
}) => {
  const { darkMode } = useSelector((state) => state.ui);

  // Icon and color configurations based on type
  const typeConfig = {
    warning: {
      icon: AlertTriangle,
      iconColor: 'text-yellow-600 dark:text-yellow-400',
      iconBg: 'bg-yellow-100 dark:bg-yellow-900/30',
      confirmBg: 'bg-yellow-600 hover:bg-yellow-700 focus:ring-yellow-500',
      borderColor: 'border-yellow-200 dark:border-yellow-800',
    },
    danger: {
      icon: XCircle,
      iconColor: 'text-red-600 dark:text-red-400',
      iconBg: 'bg-red-100 dark:bg-red-900/30',
      confirmBg: 'bg-red-600 hover:bg-red-700 focus:ring-red-500',
      borderColor: 'border-red-200 dark:border-red-800',
    },
    info: {
      icon: Info,
      iconColor: 'text-blue-600 dark:text-blue-400',
      iconBg: 'bg-blue-100 dark:bg-blue-900/30',
      confirmBg: 'bg-blue-600 hover:bg-blue-700 focus:ring-blue-500',
      borderColor: 'border-blue-200 dark:border-blue-800',
    },
    success: {
      icon: CheckCircle,
      iconColor: 'text-green-600 dark:text-green-400',
      iconBg: 'bg-green-100 dark:bg-green-900/30',
      confirmBg: 'bg-green-600 hover:bg-green-700 focus:ring-green-500',
      borderColor: 'border-green-200 dark:border-green-800',
    },
  };

  const config = typeConfig[type];
  const IconComponent = CustomIcon || config.icon;

  const handleConfirm = async () => {
    if (onConfirm) {
      await onConfirm();
    }
  };

  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget && !isLoading) {
      onClose();
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Escape' && !isLoading) {
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div
        className="fixed inset-0 z-50 overflow-y-auto"
        onKeyDown={handleKeyDown}
        tabIndex={-1}
      >
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="fixed inset-0 bg-black/50 backdrop-blur-sm"
          onClick={handleBackdropClick}
        />

        {/* Modal Container */}
        <div className="flex min-h-full items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{
              type: 'spring',
              stiffness: 300,
              damping: 30,
              duration: 0.3,
            }}
            className={`relative w-full max-w-md transform overflow-hidden rounded-2xl ${
              darkMode ? 'bg-gray-800' : 'bg-white'
            } shadow-2xl transition-all`}
          >
            {/* Close Button */}
            {!isLoading && (
              <button
                onClick={onClose}
                className={`absolute right-4 top-4 p-1 rounded-full transition-colors ${
                  darkMode
                    ? 'text-gray-400 hover:text-gray-300 hover:bg-gray-700'
                    : 'text-gray-400 hover:text-gray-600 hover:bg-gray-100'
                }`}
                aria-label="Close modal"
              >
                <X size={20} />
              </button>
            )}

            {/* Content */}
            <div className="p-6">
              {/* Icon */}
              <div className="flex justify-center mb-4">
                <div className={`p-3 rounded-full ${config.iconBg}`}>
                  <IconComponent size={32} className={config.iconColor} />
                </div>
              </div>

              {/* Title */}
              <div className="text-center mb-4">
                <h3
                  className={`text-lg font-semibold ${
                    darkMode ? 'text-white' : 'text-gray-900'
                  }`}
                >
                  {title}
                </h3>
              </div>

              {/* Message */}
              <div className="text-center mb-6">
                <p
                  className={`text-sm leading-relaxed ${
                    darkMode ? 'text-gray-300' : 'text-gray-600'
                  }`}
                >
                  {message}
                </p>

                {/* Additional Details */}
                {details && (
                  <div
                    className={`mt-4 p-3 rounded-lg border ${
                      darkMode
                        ? 'bg-gray-700 border-gray-600'
                        : 'bg-gray-50 border-gray-200'
                    }`}
                  >
                    <div className="text-left">
                      {Array.isArray(details) ? (
                        <ul className="space-y-1">
                          {details.map((detail, index) => (
                            <li
                              key={index}
                              className={`text-xs ${
                                darkMode ? 'text-gray-400' : 'text-gray-600'
                              }`}
                            >
                              • {detail}
                            </li>
                          ))}
                        </ul>
                      ) : (
                        <p
                          className={`text-xs ${
                            darkMode ? 'text-gray-400' : 'text-gray-600'
                          }`}
                        >
                          {details}
                        </p>
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col-reverse sm:flex-row gap-3">
                <ButtonLoader
                  onClick={onClose}
                  disabled={isLoading}
                  className={`flex-1 px-4 py-2.5 text-sm font-medium rounded-lg border transition-colors ${
                    darkMode
                      ? 'border-gray-600 text-gray-300 hover:bg-gray-700 focus:ring-gray-500'
                      : 'border-gray-300 text-gray-700 hover:bg-gray-50 focus:ring-gray-500'
                  } focus:outline-none focus:ring-2 focus:ring-offset-2`}
                >
                  {cancelText}
                </ButtonLoader>

                <ButtonLoader
                  onClick={handleConfirm}
                  isLoading={isLoading}
                  loadingText="Processing..."
                  className={`flex-1 px-4 py-2.5 text-sm font-medium text-white rounded-lg transition-colors ${config.confirmBg} focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed`}
                >
                  {confirmText}
                </ButtonLoader>
              </div>
            </div>

            {/* Loading Overlay */}
            {isLoading && (
              <div className="absolute inset-0 bg-black/20 backdrop-blur-sm rounded-2xl flex items-center justify-center">
                <div className="flex items-center gap-3 px-4 py-2 bg-white/90 dark:bg-gray-800/90 rounded-lg">
                  <div className="animate-spin rounded-full h-4 w-4 border-2 border-blue-600 border-t-transparent"></div>
                  <span
                    className={`text-sm font-medium ${
                      darkMode ? 'text-gray-200' : 'text-gray-700'
                    }`}
                  >
                    Processing...
                  </span>
                </div>
              </div>
            )}
          </motion.div>
        </div>
      </div>
    </AnimatePresence>
  );
};

export default ConfirmationModal;
