'use client';

import { motion } from 'framer-motion';

const SkeletonLoader = ({
  variant = 'card',
  count = 1,
  className = '',
  animate = true,
}) => {
  const shimmer = animate
    ? {
        backgroundPosition: ['200% 0', '-200% 0'],
        transition: {
          duration: 1.5,
          repeat: Number.POSITIVE_INFINITY,
          ease: 'linear',
        },
      }
    : {};

  const SkeletonCard = () => (
    <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
      <motion.div
        className="h-48 bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 dark:from-gray-700 dark:via-gray-600 dark:to-gray-700"
        animate={shimmer}
        style={{
          backgroundSize: '200% 100%',
        }}
      />
      <div className="p-4 space-y-3">
        <motion.div
          className="h-4 bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 dark:from-gray-700 dark:via-gray-600 dark:to-gray-700 rounded w-3/4"
          animate={shimmer}
          style={{
            backgroundSize: '200% 100%',
          }}
        />
        <motion.div
          className="h-3 bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 dark:from-gray-700 dark:via-gray-600 dark:to-gray-700 rounded w-1/2"
          animate={shimmer}
          style={{
            backgroundSize: '200% 100%',
          }}
        />
        <motion.div
          className="h-8 bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 dark:from-gray-700 dark:via-gray-600 dark:to-gray-700 rounded"
          animate={shimmer}
          style={{
            backgroundSize: '200% 100%',
          }}
        />
      </div>
    </div>
  );

  const SkeletonText = () => (
    <div className="space-y-2">
      {[...Array(3)].map((_, i) => (
        <motion.div
          key={i}
          className={`h-4 bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 dark:from-gray-700 dark:via-gray-600 dark:to-gray-700 rounded ${
            i === 2 ? 'w-2/3' : 'w-full'
          }`}
          animate={shimmer}
          style={{
            backgroundSize: '200% 100%',
          }}
        />
      ))}
    </div>
  );

  const SkeletonList = () => (
    <div className="space-y-4">
      {[...Array(5)].map((_, i) => (
        <div key={i} className="flex items-center space-x-4">
          <motion.div
            className="w-12 h-12 bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 dark:from-gray-700 dark:via-gray-600 dark:to-gray-700 rounded-full"
            animate={shimmer}
            style={{
              backgroundSize: '200% 100%',
            }}
          />
          <div className="flex-1 space-y-2">
            <motion.div
              className="h-4 bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 dark:from-gray-700 dark:via-gray-600 dark:to-gray-700 rounded w-3/4"
              animate={shimmer}
              style={{
                backgroundSize: '200% 100%',
              }}
            />
            <motion.div
              className="h-3 bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 dark:from-gray-700 dark:via-gray-600 dark:to-gray-700 rounded w-1/2"
              animate={shimmer}
              style={{
                backgroundSize: '200% 100%',
              }}
            />
          </div>
        </div>
      ))}
    </div>
  );

  const variants = {
    card: SkeletonCard,
    text: SkeletonText,
    list: SkeletonList,
  };

  const Component = variants[variant];

  return (
    <div className={className}>
      {[...Array(count)].map((_, i) => (
        <Component key={i} />
      ))}
    </div>
  );
};

export default SkeletonLoader;
