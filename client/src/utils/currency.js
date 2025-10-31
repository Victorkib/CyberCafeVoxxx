/**
 * Currency utility functions for Kenyan Shillings (KSh)
 */

// Currency configuration
export const CURRENCY_CONFIG = {
  code: 'KES',
  symbol: 'KSh',
  name: 'Kenyan Shilling',
  locale: 'en-KE'
};

/**
 * Format amount as Kenyan Shillings
 * @param {number} amount - The amount to format
 * @param {object} options - Formatting options
 * @returns {string} Formatted currency string
 */
export const formatCurrency = (amount, options = {}) => {
  const {
    showSymbol = true,
    minimumFractionDigits = 2,
    maximumFractionDigits = 2,
    locale = CURRENCY_CONFIG.locale
  } = options;

  if (amount === null || amount === undefined || isNaN(amount)) {
    return showSymbol ? `${CURRENCY_CONFIG.symbol} 0.00` : '0.00';
  }

  const formattedAmount = new Intl.NumberFormat(locale, {
    minimumFractionDigits,
    maximumFractionDigits,
  }).format(Number(amount));

  return showSymbol ? `${CURRENCY_CONFIG.symbol} ${formattedAmount}` : formattedAmount;
};

/**
 * Format amount as compact currency (e.g., KSh 1.2K, KSh 1.5M)
 * @param {number} amount - The amount to format
 * @returns {string} Compact formatted currency string
 */
export const formatCompactCurrency = (amount) => {
  if (amount === null || amount === undefined || isNaN(amount)) {
    return `${CURRENCY_CONFIG.symbol} 0`;
  }

  const num = Number(amount);
  
  if (num >= 1000000) {
    return `${CURRENCY_CONFIG.symbol} ${(num / 1000000).toFixed(1)}M`;
  } else if (num >= 1000) {
    return `${CURRENCY_CONFIG.symbol} ${(num / 1000).toFixed(1)}K`;
  } else {
    return formatCurrency(num, { minimumFractionDigits: 0, maximumFractionDigits: 0 });
  }
};

/**
 * Parse currency string to number
 * @param {string} currencyString - Currency string to parse
 * @returns {number} Parsed amount
 */
export const parseCurrency = (currencyString) => {
  if (!currencyString) return 0;
  
  // Remove currency symbol and spaces, then parse
  const cleanString = currencyString
    .replace(CURRENCY_CONFIG.symbol, '')
    .replace(/[^\d.-]/g, '');
    
  return parseFloat(cleanString) || 0;
};

/**
 * Convert USD to KES (approximate conversion for display)
 * Note: In production, you should use real-time exchange rates
 * @param {number} usdAmount - Amount in USD
 * @param {number} exchangeRate - USD to KES exchange rate (default: ~150)
 * @returns {number} Amount in KES
 */
export const convertUSDToKES = (usdAmount, exchangeRate = 150) => {
  return Number(usdAmount) * exchangeRate;
};

/**
 * Get currency symbol
 * @returns {string} Currency symbol
 */
export const getCurrencySymbol = () => CURRENCY_CONFIG.symbol;

/**
 * Get currency code
 * @returns {string} Currency code
 */
export const getCurrencyCode = () => CURRENCY_CONFIG.code;

/**
 * Format price with sale price handling
 * @param {number} price - Regular price
 * @param {number} salePrice - Sale price (optional)
 * @returns {object} Formatted price object
 */
export const formatPriceWithSale = (price, salePrice = null) => {
  const regular = formatCurrency(price);
  
  if (salePrice && salePrice < price) {
    return {
      current: formatCurrency(salePrice),
      original: regular,
      discount: Math.round(((price - salePrice) / price) * 100),
      onSale: true
    };
  }
  
  return {
    current: regular,
    original: null,
    discount: 0,
    onSale: false
  };
};

export default {
  formatCurrency,
  formatCompactCurrency,
  parseCurrency,
  convertUSDToKES,
  getCurrencySymbol,
  getCurrencyCode,
  formatPriceWithSale,
  CURRENCY_CONFIG
};