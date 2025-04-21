import React from 'react';
import { Box, RadioGroup, FormControlLabel, Radio, Typography, Card, CardContent } from '@mui/material';
import { PAYMENT_METHODS, PAYMENT_METHOD_NAMES } from '../../constants/payment';
import { CreditCard, Smartphone, ShoppingBag } from 'lucide-react';

const PaymentMethodSelector = ({ selectedMethod, onMethodChange, disabled = false }) => {
  const getMethodIcon = (method) => {
    switch (method) {
      case PAYMENT_METHODS.MPESA:
        return <Smartphone size={24} />;
      case PAYMENT_METHODS.PAYSTACK:
        return <CreditCard size={24} />;
      case PAYMENT_METHODS.PAYPAL:
        return <ShoppingBag size={24} />;
      default:
        return null;
    }
  };

  return (
    <Box>
      <Typography variant="h6" gutterBottom>
        Select Payment Method
      </Typography>
      <RadioGroup
        value={selectedMethod}
        onChange={(e) => onMethodChange(e.target.value)}
        sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}
      >
        {Object.values(PAYMENT_METHODS).map((method) => (
          <Card key={method} variant="outlined">
            <CardContent sx={{ p: 2 }}>
              <FormControlLabel
                value={method}
                control={<Radio disabled={disabled} />}
                label={
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    {getMethodIcon(method)}
                    <Box>
                      <Typography variant="subtitle1">
                        {PAYMENT_METHOD_NAMES[method]}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {method === PAYMENT_METHODS.MPESA
                          ? 'Pay using M-Pesa mobile money'
                          : method === PAYMENT_METHODS.PAYSTACK
                          ? 'Pay with card via Paystack'
                          : 'Pay with PayPal'}
                      </Typography>
                    </Box>
                  </Box>
                }
                sx={{
                  width: '100%',
                  margin: 0,
                  '& .MuiFormControlLabel-label': {
                    width: '100%'
                  }
                }}
              />
            </CardContent>
          </Card>
        ))}
      </RadioGroup>
    </Box>
  );
};

export default PaymentMethodSelector; 