/**
 * Handles errors in a standardized way
 * @param {Object} res - Express response object
 * @param {Error} error - The error object
 * @param {number} statusCode - HTTP status code (default: 500)
 * @returns {Object} - JSON response
 */
export const handleError = (res, error, statusCode = 500) => {
  console.error('Error:', error);
  
  return res.status(statusCode).json({
    status: 'error',
    message: error.message || 'Internal Server Error',
    ...(process.env.NODE_ENV === 'development' && { stack: error.stack })
  });
};

/**
 * Creates an error object with status code and message
 * @param {number} statusCode - HTTP status code
 * @param {string} message - Error message
 * @returns {Error} - Error object
 */
export const createError = (statusCode, message) => {
  const error = new Error(message);
  error.statusCode = statusCode;
  return error;
};

/**
 * Logs errors to console
 * @param {Error} error - The error object
 */
export const logError = (error) => {
  console.error('Error:', error);
  if (error.stack) {
    console.error('Stack:', error.stack);
  }
}; 