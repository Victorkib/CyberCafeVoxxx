import { validationResult, check } from 'express-validator';

// Validation middleware
export const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      errors: errors.array(),
    });
  }
  next();
};

// Middleware factory for validation rules
export const validateRequest = (validationRules) => {
  return [...validationRules, validate];
};

// User validation rules
export const userValidationRules = {
  register: [
    check('name')
      .trim()
      .notEmpty()
      .withMessage('Name is required')
      .isLength({ min: 2, max: 50 })
      .withMessage('Name must be between 2 and 50 characters'),
    check('email')
      .trim()
      .notEmpty()
      .withMessage('Email is required')
      .isEmail()
      .withMessage('Please provide a valid email'),
    check('password')
      .trim()
      .notEmpty()
      .withMessage('Password is required')
      .isLength({ min: 6 })
      .withMessage('Password must be at least 6 characters')
      .matches(/\d/)
      .withMessage('Password must contain at least one number')
      .matches(/[a-zA-Z]/)
      .withMessage('Password must contain at least one letter'),
  ],
  login: [
    check('email')
      .trim()
      .notEmpty()
      .withMessage('Email is required')
      .isEmail()
      .withMessage('Please provide a valid email'),
    check('password')
      .trim()
      .notEmpty()
      .withMessage('Password is required'),
  ],
  updateProfile: [
    check('name')
      .optional()
      .trim()
      .isLength({ min: 2, max: 50 })
      .withMessage('Name must be between 2 and 50 characters'),
    check('email')
      .optional()
      .trim()
      .isEmail()
      .withMessage('Please provide a valid email'),
  ],
};

// Product validation rules
export const productValidationRules = {
  create: [
    check('name')
      .trim()
      .notEmpty()
      .withMessage('Product name is required')
      .isLength({ max: 100 })
      .withMessage('Product name cannot be more than 100 characters'),
    check('description')
      .trim()
      .notEmpty()
      .withMessage('Product description is required')
      .isLength({ max: 2000 })
      .withMessage('Description cannot be more than 2000 characters'),
    check('price')
      .notEmpty()
      .withMessage('Price is required')
      .isFloat({ min: 0 })
      .withMessage('Price must be a positive number'),
    check('category')
      .notEmpty()
      .withMessage('Category is required')
      .isMongoId()
      .withMessage('Invalid category ID'),
    check('stock')
      .notEmpty()
      .withMessage('Stock is required')
      .isInt({ min: 0 })
      .withMessage('Stock must be a positive number'),
  ],
  update: [
    check('name')
      .optional()
      .trim()
      .isLength({ max: 100 })
      .withMessage('Product name cannot be more than 100 characters'),
    check('description')
      .optional()
      .trim()
      .isLength({ max: 2000 })
      .withMessage('Description cannot be more than 2000 characters'),
    check('price')
      .optional()
      .isFloat({ min: 0 })
      .withMessage('Price must be a positive number'),
    check('category')
      .optional()
      .isMongoId()
      .withMessage('Invalid category ID'),
    check('stock')
      .optional()
      .isInt({ min: 0 })
      .withMessage('Stock must be a positive number'),
  ],
};

// Category validation rules
export const categoryValidationRules = {
  create: [
    check('name')
      .trim()
      .notEmpty()
      .withMessage('Category name is required')
      .isLength({ max: 50 })
      .withMessage('Category name cannot be more than 50 characters'),
    check('description')
      .optional()
      .trim()
      .isLength({ max: 500 })
      .withMessage('Description cannot be more than 500 characters'),
  ],
  update: [
    check('name')
      .optional()
      .trim()
      .isLength({ max: 50 })
      .withMessage('Category name cannot be more than 50 characters'),
    check('description')
      .optional()
      .trim()
      .isLength({ max: 500 })
      .withMessage('Description cannot be more than 500 characters'),
  ],
};

// Cart validation rules
export const cartValidationRules = {
  addItem: [
    check('productId')
      .notEmpty()
      .withMessage('Product ID is required')
      .isMongoId()
      .withMessage('Invalid product ID'),
    check('quantity')
      .notEmpty()
      .withMessage('Quantity is required')
      .isInt({ min: 1 })
      .withMessage('Quantity must be at least 1'),
  ],
  updateItem: [
    check('quantity')
      .notEmpty()
      .withMessage('Quantity is required')
      .isInt({ min: 1 })
      .withMessage('Quantity must be at least 1'),
  ],
};

// Order validation rules
export const orderValidationRules = {
  create: [
    check('shippingAddress.street')
      .trim()
      .notEmpty()
      .withMessage('Street address is required'),
    check('shippingAddress.city')
      .trim()
      .notEmpty()
      .withMessage('City is required'),
    check('shippingAddress.state')
      .trim()
      .notEmpty()
      .withMessage('State is required'),
    check('shippingAddress.country')
      .trim()
      .notEmpty()
      .withMessage('Country is required'),
    check('shippingAddress.zipCode')
      .trim()
      .notEmpty()
      .withMessage('ZIP code is required'),
    check('paymentMethod')
      .trim()
      .notEmpty()
      .withMessage('Payment method is required')
      .isIn(['stripe', 'paypal'])
      .withMessage('Invalid payment method'),
  ],
};

// Newsletter validation rules
export const newsletterValidationRules = {
  subscribe: [
    check('email')
      .trim()
      .notEmpty()
      .withMessage('Email is required')
      .isEmail()
      .withMessage('Please provide a valid email'),
  ],
}; 