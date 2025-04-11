import { toast } from 'react-hot-toast';

// Toast notifications
export const showSuccessToast = (message) => {
  toast.success(message, {
    duration: 3000,
    position: 'top-right',
    style: {
      background: '#4CAF50',
      color: '#fff',
    },
  });
};

export const showErrorToast = (message) => {
  toast.error(message, {
    duration: 3000,
    position: 'top-right',
    style: {
      background: '#f44336',
      color: '#fff',
    },
  });
};

export const showInfoToast = (message) => {
  toast(message, {
    duration: 3000,
    position: 'top-right',
    style: {
      background: '#2196F3',
      color: '#fff',
    },
  });
};

// Loading states
export const LoadingSpinner = ({ size = 'md' }) => {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-6 h-6',
    lg: 'w-8 h-8',
  };

  return (
    <div className={`animate-spin ${sizeClasses[size]}`}>
      <svg
        className="text-current"
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
      >
        <circle
          className="opacity-25"
          cx="12"
          cy="12"
          r="10"
          stroke="currentColor"
          strokeWidth="4"
        />
        <path
          className="opacity-75"
          fill="currentColor"
          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
        />
      </svg>
    </div>
  );
};

// Button styles
export const buttonStyles = {
  base: 'inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2',
  primary: 'bg-primary-600 text-white hover:bg-primary-700 focus:ring-primary-500',
  secondary: 'bg-secondary-600 text-white hover:bg-secondary-700 focus:ring-secondary-500',
  success: 'bg-green-600 text-white hover:bg-green-700 focus:ring-green-500',
  danger: 'bg-red-600 text-white hover:bg-red-700 focus:ring-red-500',
  warning: 'bg-yellow-600 text-white hover:bg-yellow-700 focus:ring-yellow-500',
  info: 'bg-blue-600 text-white hover:bg-blue-700 focus:ring-blue-500',
  outline: 'border border-gray-300 text-gray-700 hover:bg-gray-50 focus:ring-primary-500',
};

// Input styles
export const inputStyles = {
  base: 'block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm',
  error: 'border-red-300 text-red-900 placeholder-red-300 focus:border-red-500 focus:ring-red-500',
};

// Card styles
export const cardStyles = {
  base: 'bg-white overflow-hidden shadow rounded-lg',
  header: 'px-4 py-5 sm:px-6',
  body: 'px-4 py-5 sm:p-6',
  footer: 'px-4 py-4 sm:px-6',
};

// Table styles
export const tableStyles = {
  base: 'min-w-full divide-y divide-gray-200',
  header: 'bg-gray-50',
  headerCell: 'px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider',
  row: 'bg-white border-b',
  cell: 'px-6 py-4 whitespace-nowrap text-sm text-gray-500',
};

// Badge styles
export const badgeStyles = {
  base: 'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium',
  success: 'bg-green-100 text-green-800',
  error: 'bg-red-100 text-red-800',
  warning: 'bg-yellow-100 text-yellow-800',
  info: 'bg-blue-100 text-blue-800',
};

// Modal styles
export const modalStyles = {
  overlay: 'fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity',
  container: 'fixed inset-0 z-10 overflow-y-auto',
  content: 'flex min-h-full items-end justify-center p-4 text-center sm:items-center sm:p-0',
  panel: 'relative transform overflow-hidden rounded-lg bg-white px-4 pb-4 pt-5 text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-lg sm:p-6',
};

// Form styles
export const formStyles = {
  label: 'block text-sm font-medium text-gray-700',
  help: 'mt-2 text-sm text-gray-500',
  error: 'mt-2 text-sm text-red-600',
};

// Grid styles
export const gridStyles = {
  container: 'grid gap-6',
  cols: {
    1: 'grid-cols-1',
    2: 'grid-cols-1 sm:grid-cols-2',
    3: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3',
    4: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-4',
  },
};

// Responsive breakpoints
export const breakpoints = {
  sm: '640px',
  md: '768px',
  lg: '1024px',
  xl: '1280px',
  '2xl': '1536px',
};

// Animation classes
export const animationClasses = {
  fadeIn: 'animate-fade-in',
  slideIn: 'animate-slide-in',
  scaleIn: 'animate-scale-in',
  spin: 'animate-spin',
  bounce: 'animate-bounce',
  pulse: 'animate-pulse',
};

// Z-index layers
export const zIndex = {
  base: 0,
  dropdown: 1000,
  sticky: 1020,
  fixed: 1030,
  modal: 1040,
  popover: 1050,
  tooltip: 1060,
}; 