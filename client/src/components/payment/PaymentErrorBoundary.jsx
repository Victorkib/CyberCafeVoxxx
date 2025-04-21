import React from 'react';
import { Box, Typography, Button } from '@mui/material';
import { AlertCircle } from 'lucide-react';
import { PAYMENT_ERROR_MESSAGES } from '../../constants/payment';

class PaymentErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    // Log the error to an error reporting service
    console.error('Payment Error:', error, errorInfo);
  }

  handleRetry = () => {
    this.setState({ hasError: false, error: null });
    if (this.props.onRetry) {
      this.props.onRetry();
    }
  };

  render() {
    if (this.state.hasError) {
      return (
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            p: 4,
            textAlign: 'center',
            minHeight: '300px'
          }}
        >
          <AlertCircle size={48} color="#ef4444" />
          <Typography variant="h5" sx={{ mt: 2, mb: 1 }}>
            Payment Error
          </Typography>
          <Typography color="text.secondary" sx={{ mb: 3 }}>
            {this.state.error?.message || PAYMENT_ERROR_MESSAGES.UNEXPECTED_ERROR}
          </Typography>
          <Button
            variant="contained"
            color="primary"
            onClick={this.handleRetry}
            startIcon={<RefreshCw size={20} />}
          >
            Try Again
          </Button>
        </Box>
      );
    }

    return this.props.children;
  }
}

export default PaymentErrorBoundary; 