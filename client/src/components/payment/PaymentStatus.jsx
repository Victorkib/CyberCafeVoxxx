import React from 'react';
import { Box, Typography, Chip } from '@mui/material';
import { CheckCircle, XCircle, Clock, AlertCircle } from 'lucide-react';
import { PAYMENT_STATUS, PAYMENT_STATUS_COLORS, PAYMENT_STATUS_NAMES } from '../../constants/payment';

const PaymentStatus = ({ status }) => {
  const getStatusIcon = () => {
    switch (status) {
      case PAYMENT_STATUS.COMPLETED:
        return <CheckCircle className="text-green-500" size={20} />;
      case PAYMENT_STATUS.FAILED:
        return <XCircle className="text-red-500" size={20} />;
      case PAYMENT_STATUS.PENDING:
      case PAYMENT_STATUS.PROCESSING:
        return <Clock className="text-yellow-500" size={20} />;
      case PAYMENT_STATUS.REFUNDED:
        return <AlertCircle className="text-blue-500" size={20} />;
      default:
        return <AlertCircle className="text-gray-500" size={20} />;
    }
  };

  const getStatusColor = () => {
    return PAYMENT_STATUS_COLORS[status] || 'default';
  };

  return (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
      {getStatusIcon()}
      <Chip
        label={PAYMENT_STATUS_NAMES[status] || 'Unknown'}
        color={getStatusColor()}
        size="small"
        sx={{ fontWeight: 500 }}
      />
    </Box>
  );
};

export default PaymentStatus; 