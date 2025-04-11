/**
 * Wraps an async function to handle errors automatically
 * @param {Function} fn - The async function to wrap
 * @returns {Function} - Express middleware function
 */
export const handleAsync = (fn) => {
  return (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};

/**
 * Creates a standardized error response
 * @param {Error} err - The error object
 * @param {Object} res - Express response object
 * @returns {Object} - JSON response
 */
export const createErrorResponse = (err, res) => {
  const statusCode = err.statusCode || 500;
  const message = err.message || 'Internal Server Error';
  
  return res.status(statusCode).json({
    status: 'error',
    message,
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
}; 