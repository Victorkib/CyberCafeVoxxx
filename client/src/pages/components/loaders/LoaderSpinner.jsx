'use client';

import { motion } from 'framer-motion';

const LoaderSpinner = ({
  size = 'md',
  color = 'blue',
  text = '',
  className = '',
  variant = 'spinner',
}) => {
  const sizeClasses = {
    xs: 'w-4 h-4',
    sm: 'w-6 h-6',
    md: 'w-8 h-8',
    lg: 'w-12 h-12',
    xl: 'w-16 h-16',
  };

  const colorClasses = {
    blue: 'border-blue-600',
    white: 'border-white',
    gray: 'border-gray-600',
    green: 'border-green-600',
    red: 'border-red-600',
  };

  if (variant === 'dots') {
    return (
      <div
        className={`flex items-center justify-center space-x-1 ${className}`}
      >
        {[0, 1, 2].map((i) => (
          <motion.div
            key={i}
            className={`${sizeClasses[size]} ${colorClasses[color].replace(
              'border-',
              'bg-'
            )} rounded-full`}
            animate={{
              scale: [1, 1.2, 1],
              opacity: [0.7, 1, 0.7],
            }}
            transition={{
              duration: 0.8,
              repeat: Number.POSITIVE_INFINITY,
              delay: i * 0.2,
            }}
          />
        ))}
        {text && <span className="ml-2 text-sm font-medium">{text}</span>}
      </div>
    );
  }

  if (variant === 'pulse') {
    return (
      <div className={`flex flex-col items-center justify-center ${className}`}>
        <motion.div
          className={`${sizeClasses[size]} ${colorClasses[color].replace(
            'border-',
            'bg-'
          )} rounded-full`}
          animate={{
            scale: [1, 1.3, 1],
            opacity: [1, 0.5, 1],
          }}
          transition={{
            duration: 1,
            repeat: Number.POSITIVE_INFINITY,
          }}
        />
        {text && <span className="mt-2 text-sm font-medium">{text}</span>}
      </div>
    );
  }

  return (
    <div className={`flex flex-col items-center justify-center ${className}`}>
      <div
        className={`${sizeClasses[size]} border-2 ${colorClasses[color]} border-t-transparent rounded-full animate-spin`}
      />
      {text && <span className="mt-2 text-sm font-medium">{text}</span>}
    </div>
  );
};

export default LoaderSpinner;
