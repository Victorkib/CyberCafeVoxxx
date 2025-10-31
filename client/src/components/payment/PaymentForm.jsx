import React, { useState } from 'react';
import { Box, TextField, Button, Typography, Alert, CircularProgress } from '@mui/material';
import { PAYMENT_METHODS, PAYMENT_VALIDATION, PAYMENT_ERROR_MESSAGES } from '../../constants/payment';
import PaymentMethodSelector from './PaymentMethodSelector';
import PaymentStatus from './PaymentStatus';
import formatCurrency from '../../utils/formatCurrency';

const PaymentForm = ({ order, onPaymentComplete, onPaymentError }) => {
  const [selectedMethod, setSelectedMethod] = useState('');
  const [formData, setFormData] = useState({
    phoneNumber: '',
    email: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleMethodChange = (method) => {
    setSelectedMethod(method);
    setError(null);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const validateForm = () => {
    if (!selectedMethod) {
      setError(PAYMENT_ERROR_MESSAGES.NO_METHOD_SELECTED);
      return false;
    }

    if (selectedMethod === PAYMENT_METHODS.MPESA) {
      if (!formData.phoneNumber) {
        setError(PAYMENT_ERROR_MESSAGES.MISSING_PHONE);
        return false;
      }
      if (!PAYMENT_VALIDATION.MPESA_PHONE.test(formData.phoneNumber)) {
        setError(PAYMENT_ERROR_MESSAGES.INVALID_PHONE);
        return false;
      }
    }

    if (selectedMethod === PAYMENT_METHODS.PAYSTACK) {
      if (!formData.email) {
        setError(PAYMENT_ERROR_MESSAGES.MISSING_EMAIL);
        return false;
      }
      if (!PAYMENT_VALIDATION.EMAIL.test(formData.email)) {
        setError(PAYMENT_ERROR_MESSAGES.INVALID_EMAIL);
        return false;
      }
    }

    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/payments/initialize', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          orderId: order._id,
          method: selectedMethod,
          ...formData,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || PAYMENT_ERROR_MESSAGES.INITIALIZATION_FAILED);
      }

      // Handle different payment methods
      switch (selectedMethod) {
        case PAYMENT_METHODS.MPESA:
          // Redirect to M-Pesa payment page or handle STK push
          window.location.href = data.paymentUrl;
          break;
        case PAYMENT_METHODS.PAYSTACK:
          // Initialize Paystack payment
          const handler = PaystackPop.setup({
            key: data.publicKey,
            email: formData.email,
            amount: order.total * 100, // Convert to cents
            currency: 'KES',
            ref: data.reference,
            callback: (response) => {
              onPaymentComplete(response);
            },
            onClose: () => {
              setLoading(false);
            },
          });
          handler.openIframe();
          break;
        case PAYMENT_METHODS.PAYPAL:
          // Redirect to PayPal
          window.location.href = data.paymentUrl;
          break;
        default:
          throw new Error(PAYMENT_ERROR_MESSAGES.UNSUPPORTED_METHOD);
      }
    } catch (err) {
      setError(err.message);
      onPaymentError?.(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box component="form" onSubmit={handleSubmit} sx={{ maxWidth: 600, mx: 'auto' }}>
      <PaymentMethodSelector
        selectedMethod={selectedMethod}
        onMethodChange={handleMethodChange}
        disabled={loading}
      />

      {selectedMethod === PAYMENT_METHODS.MPESA && (
        <TextField
          fullWidth
          label="M-Pesa Phone Number"
          name="phoneNumber"
          value={formData.phoneNumber}
          onChange={handleInputChange}
          placeholder="e.g., 254712345678"
          margin="normal"
          disabled={loading}
          error={!!error && error.includes('phone')}
          helperText={error && error.includes('phone') ? error : 'Format: 254XXXXXXXXX'}
        />
      )}

      {selectedMethod === PAYMENT_METHODS.PAYSTACK && (
        <TextField
          fullWidth
          label="Email Address"
          name="email"
          type="email"
          value={formData.email}
          onChange={handleInputChange}
          margin="normal"
          disabled={loading}
          error={!!error && error.includes('email')}
          helperText={error && error.includes('email') ? error : 'For payment receipt'}
        />
      )}

      {error && (
        <Alert severity="error" sx={{ mt: 2 }}>
          {error}
        </Alert>
      )}

      <Box sx={{ mt: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography variant="h6">
          Total: {formatCurrency(order.total)}
        </Typography>
        <Button
          type="submit"
          variant="contained"
          size="large"
          disabled={loading || !selectedMethod}
          startIcon={loading ? <CircularProgress size={20} /> : null}
        >
          {loading ? 'Processing...' : 'Pay Now'}
        </Button>
      </Box>
    </Box>
  );
};

export default PaymentForm; 