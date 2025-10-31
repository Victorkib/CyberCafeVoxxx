// Date formatting utilities
export const formatDate = (date, options = {}) => {
  if (!date) return '';

  const defaultOptions = {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    ...options,
  };

  return new Date(date).toLocaleDateString('en-US', defaultOptions);
};

export const formatDateTime = (date) => {
  if (!date) return '';

  return new Date(date).toLocaleString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

export const formatRelativeTime = (date) => {
  if (!date) return '';

  const now = new Date();
  const targetDate = new Date(date);
  const diffInSeconds = Math.floor((now - targetDate) / 1000);

  if (diffInSeconds < 60) return 'Just now';
  if (diffInSeconds < 3600)
    return `${Math.floor(diffInSeconds / 60)} minutes ago`;
  if (diffInSeconds < 86400)
    return `${Math.floor(diffInSeconds / 3600)} hours ago`;
  if (diffInSeconds < 2592000)
    return `${Math.floor(diffInSeconds / 86400)} days ago`;

  return formatDate(date);
};

// Currency formatting utilities
export const formatCurrency = (amount, currency = 'KES', locale = 'en-KE') => {
  if (amount === null || amount === undefined) return '';

  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency: currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(amount);
};

export const formatNumber = (number, locale = 'en-US') => {
  if (number === null || number === undefined) return '';

  return new Intl.NumberFormat(locale).format(number);
};

export const formatPercentage = (value, decimals = 1) => {
  if (value === null || value === undefined) return '';

  return `${(value * 100).toFixed(decimals)}%`;
};

// Text formatting utilities
export const truncateText = (text, maxLength = 100, suffix = '...') => {
  if (!text || text.length <= maxLength) return text;

  return text.substring(0, maxLength).trim() + suffix;
};

export const capitalizeFirst = (str) => {
  if (!str) return '';

  return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
};

export const capitalizeWords = (str) => {
  if (!str) return '';

  return str.replace(
    /\w\S*/g,
    (txt) => txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase()
  );
};

// Phone number formatting
export const formatPhoneNumber = (phoneNumber) => {
  if (!phoneNumber) return '';

  // Remove all non-digits
  const cleaned = phoneNumber.replace(/\D/g, '');

  // Format for Kenyan numbers
  if (cleaned.startsWith('254')) {
    return `+${cleaned.slice(0, 3)} ${cleaned.slice(3, 6)} ${cleaned.slice(
      6,
      9
    )} ${cleaned.slice(9)}`;
  }

  // Format for local numbers starting with 0
  if (cleaned.startsWith('0')) {
    return `${cleaned.slice(0, 4)} ${cleaned.slice(4, 7)} ${cleaned.slice(7)}`;
  }

  return phoneNumber;
};

// File size formatting
export const formatFileSize = (bytes) => {
  if (bytes === 0) return '0 Bytes';

  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return (
    Number.parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  );
};

// Order status formatting
export const formatOrderStatus = (status) => {
  const statusMap = {
    pending: 'Pending',
    processing: 'Processing',
    shipped: 'Shipped',
    delivered: 'Delivered',
    cancelled: 'Cancelled',
    refunded: 'Refunded',
  };

  return statusMap[status] || capitalizeFirst(status);
};

// Payment status formatting
export const formatPaymentStatus = (status) => {
  const statusMap = {
    pending: 'Pending',
    completed: 'Completed',
    failed: 'Failed',
    cancelled: 'Cancelled',
    refunded: 'Refunded',
  };

  return statusMap[status] || capitalizeFirst(status);
};

// Address formatting
export const formatAddress = (address) => {
  if (!address) return '';

  const parts = [
    address.street,
    address.city,
    address.state,
    address.country,
    address.zipCode,
  ].filter(Boolean);

  return parts.join(', ');
};

// URL formatting
export const formatUrl = (url) => {
  if (!url) return '';

  if (!url.startsWith('http://') && !url.startsWith('https://')) {
    return `https://${url}`;
  }

  return url;
};

// Social media handle formatting
export const formatSocialHandle = (handle, platform) => {
  if (!handle) return '';

  const cleaned = handle.replace(/^@/, '');

  switch (platform) {
    case 'twitter':
      return `@${cleaned}`;
    case 'instagram':
      return `@${cleaned}`;
    case 'linkedin':
      return cleaned;
    default:
      return handle;
  }
};
