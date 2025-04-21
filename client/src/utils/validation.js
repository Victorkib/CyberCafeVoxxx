// Email validation
export const isValidEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

export const PASSWORD_REGEX = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;

// Password validation (min 8 chars, uppercase, lowercase, number, special char)
export const isValidPassword = (password) => {
  return PASSWORD_REGEX.test(password);
};

export const getPasswordValidationMessage = () => {
  return 'Password must be at least 8 characters long and contain at least one uppercase letter, one lowercase letter, one number, and one special character';
};

// Phone number validation (basic format)
export const isValidPhone = (phone) => {
  const phoneRegex = /^\+?[\d\s-]{10,}$/;
  return phoneRegex.test(phone);
};

// Credit card number validation (Luhn algorithm)
export const isValidCreditCard = (cardNumber) => {
  const sanitized = cardNumber.replace(/\D/g, '');
  if (!/^\d{13,19}$/.test(sanitized)) return false;
  
  let sum = 0;
  let isEven = false;
  
  for (let i = sanitized.length - 1; i >= 0; i--) {
    let digit = parseInt(sanitized[i]);
    
    if (isEven) {
      digit *= 2;
      if (digit > 9) {
        digit -= 9;
      }
    }
    
    sum += digit;
    isEven = !isEven;
  }
  
  return sum % 10 === 0;
};

// CVV validation
export const isValidCVV = (cvv) => {
  return /^\d{3,4}$/.test(cvv);
};

// Expiry date validation
export const isValidExpiryDate = (expiry) => {
  const [month, year] = expiry.split('/');
  const currentDate = new Date();
  const currentYear = currentDate.getFullYear() % 100;
  const currentMonth = currentDate.getMonth() + 1;
  
  const expMonth = parseInt(month);
  const expYear = parseInt(year);
  
  if (expMonth < 1 || expMonth > 12) return false;
  if (expYear < currentYear) return false;
  if (expYear === currentYear && expMonth < currentMonth) return false;
  
  return true;
};

// ZIP code validation
export const isValidZipCode = (zipCode) => {
  return /^\d{5}(-\d{4})?$/.test(zipCode);
};

// Required field validation
export const isRequired = (value) => {
  return value !== null && value !== undefined && value.toString().trim() !== '';
};

// Number range validation
export const isInRange = (value, min, max) => {
  const num = parseFloat(value);
  return !isNaN(num) && num >= min && num <= max;
};

// URL validation
export const isValidUrl = (url) => {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
};

// Form validation helper
export const validateForm = (values, rules) => {
  const errors = {};
  
  Object.keys(rules).forEach(field => {
    const value = values[field];
    const fieldRules = rules[field];
    
    if (fieldRules.required && !isRequired(value)) {
      errors[field] = 'This field is required';
    } else if (value) {
      if (fieldRules.email && !isValidEmail(value)) {
        errors[field] = 'Invalid email address';
      }
      if (fieldRules.password && !isValidPassword(value)) {
        errors[field] = 'Password must be at least 8 characters with one letter and one number';
      }
      if (fieldRules.phone && !isValidPhone(value)) {
        errors[field] = 'Invalid phone number';
      }
      if (fieldRules.creditCard && !isValidCreditCard(value)) {
        errors[field] = 'Invalid credit card number';
      }
      if (fieldRules.cvv && !isValidCVV(value)) {
        errors[field] = 'Invalid CVV';
      }
      if (fieldRules.expiry && !isValidExpiryDate(value)) {
        errors[field] = 'Invalid expiry date';
      }
      if (fieldRules.zipCode && !isValidZipCode(value)) {
        errors[field] = 'Invalid ZIP code';
      }
      if (fieldRules.url && !isValidUrl(value)) {
        errors[field] = 'Invalid URL';
      }
      if (fieldRules.min && !isInRange(value, fieldRules.min, Infinity)) {
        errors[field] = `Value must be at least ${fieldRules.min}`;
      }
      if (fieldRules.max && !isInRange(value, -Infinity, fieldRules.max)) {
        errors[field] = `Value must be at most ${fieldRules.max}`;
      }
    }
  });
  
  return errors;
};

export const validateEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

export const validateResetToken = (token) => {
  return /^[a-f0-9]{64}$/.test(token);
}; 