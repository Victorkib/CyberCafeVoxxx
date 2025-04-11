import Settings from '../models/settings.model.js';

// Default payment settings
const defaultPaymentSettings = {
  mpesaEnabled: true,
  paystackEnabled: true,
  paypalEnabled: true,
  mpesaTestMode: process.env.NODE_ENV !== 'production',
  paystackTestMode: process.env.NODE_ENV !== 'production',
  paypalTestMode: process.env.NODE_ENV !== 'production',
  mpesaShortcode: process.env.MPESA_SHORTCODE,
  mpesaPasskey: process.env.MPESA_PASSKEY,
  mpesaConsumerKey: process.env.MPESA_CONSUMER_KEY,
  mpesaConsumerSecret: process.env.MPESA_CONSUMER_SECRET,
  paystackSecretKey: process.env.PAYSTACK_SECRET_KEY,
  paystackPublicKey: process.env.PAYSTACK_PUBLIC_KEY,
  paypalClientId: process.env.PAYPAL_CLIENT_ID,
  paypalClientSecret: process.env.PAYPAL_CLIENT_SECRET,
  paypalMode: process.env.PAYPAL_MODE || 'sandbox',
  refundPolicy: {
    enabled: true,
    maxDays: 30,
    conditions: [
      'Product must be unused and in original packaging',
      'Original receipt or proof of purchase required',
      'Shipping costs are non-refundable'
    ]
  },
  currency: {
    code: 'KES',
    symbol: 'KSh',
    position: 'before'
  },
  tax: {
    enabled: true,
    rate: 16, // 16% VAT
    inclusive: true
  },
  minimumOrderAmount: 100,
  maximumOrderAmount: 1000000
};

// Get payment settings
export const getPaymentSettings = async () => {
  let settings = await Settings.findOne({ type: 'payment' });
  
  if (!settings) {
    settings = await Settings.create({
      type: 'payment',
      data: defaultPaymentSettings
    });
  }
  
  return settings.data;
};

// Update payment settings
export const updatePaymentSettings = async (updates) => {
  let settings = await Settings.findOne({ type: 'payment' });
  
  if (!settings) {
    settings = await Settings.create({
      type: 'payment',
      data: { ...defaultPaymentSettings, ...updates }
    });
  } else {
    settings.data = { ...settings.data, ...updates };
    await settings.save();
  }
  
  return settings.data;
};

// Validate payment settings
export const validatePaymentSettings = (settings) => {
  const errors = [];
  
  // Validate currency
  if (!settings.currency?.code || !settings.currency?.symbol) {
    errors.push('Currency settings are required');
  }
  
  // Validate tax
  if (settings.tax?.enabled) {
    if (typeof settings.tax.rate !== 'number' || settings.tax.rate < 0) {
      errors.push('Invalid tax rate');
    }
  }
  
  // Validate order amounts
  if (typeof settings.minimumOrderAmount !== 'number' || settings.minimumOrderAmount < 0) {
    errors.push('Invalid minimum order amount');
  }
  
  if (typeof settings.maximumOrderAmount !== 'number' || settings.maximumOrderAmount < settings.minimumOrderAmount) {
    errors.push('Invalid maximum order amount');
  }
  
  // Validate refund policy
  if (settings.refundPolicy?.enabled) {
    if (typeof settings.refundPolicy.maxDays !== 'number' || settings.refundPolicy.maxDays < 0) {
      errors.push('Invalid refund period');
    }
    
    if (!Array.isArray(settings.refundPolicy.conditions)) {
      errors.push('Refund conditions must be an array');
    }
  }
  
  return errors;
}; 