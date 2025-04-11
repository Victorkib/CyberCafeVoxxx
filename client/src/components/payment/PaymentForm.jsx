import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { toast } from 'react-toastify';
import {
  Card,
  CardContent,
  CardHeader,
  CardFooter,
  Typography,
  Button,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Box,
  CircularProgress,
  Alert,
  Divider,
} from '@mui/material';
import { 
  CreditCard, 
  Wallet, 
  Smartphone, 
  CheckCircle,
  Cancel,
  AlertCircle,
  Info
} from 'lucide-react';
import { paymentAPI } from '../../utils/api';
import { useNotification } from '../../contexts/NotificationContext';

const PaymentForm = ({ orderId, amount, onSuccess }) => {
  const dispatch = useDispatch();
  const { showNotification } = useNotification();
  const [paymentMethods, setPaymentMethods] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [selectedMethod, setSelectedMethod] = useState('');
  const [paymentStatus, setPaymentStatus] = useState(null);
  const [formData, setFormData] = useState({
    phoneNumber: '',
    email: '',
  });

  useEffect(() => {
    fetchPaymentMethods();
  }, []);

  const fetchPaymentMethods = async () => {
    try {
      setLoading(true);
      const methods = await paymentAPI.getMethods();
      setPaymentMethods(methods);
    } catch (error) {
      setError(error.message || 'Failed to load payment methods');
      showNotification('error', 'Failed to load payment methods');
    } finally {
      setLoading(false);
    }
  };

  const handlePaymentMethodChange = (event) => {
    setSelectedMethod(event.target.value);
    setPaymentStatus(null);
    setError(null);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const validateForm = () => {
    if (!selectedMethod) {
      setError('Please select a payment method');
      return false;
    }

    if (selectedMethod === 'mpesa' && !formData.phoneNumber) {
      setError('Please enter your M-Pesa phone number');
      return false;
    }

    if (selectedMethod === 'paystack' && !formData.email) {
      setError('Please enter your email address');
      return false;
    }

    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    try {
      setLoading(true);
      setError(null);
      setPaymentStatus('processing');

      const paymentData = {
        orderId,
        amount,
        method: selectedMethod,
        ...formData
      };

      const result = await paymentAPI.initialize(paymentData);
      
      if (result.redirectUrl) {
        // For payment methods that require redirect (PayPal, etc.)
        window.location.href = result.redirectUrl;
      } else if (result.paymentUrl) {
        // For payment methods that provide a payment URL (M-Pesa, etc.)
        window.open(result.paymentUrl, '_blank');
      } else {
        // For direct payment methods (Paystack, etc.)
        if (result.status === 'success') {
          setPaymentStatus('success');
          showNotification('success', 'Payment successful!');
          onSuccess && onSuccess(result);
        } else {
          setPaymentStatus('failed');
          setError(result.message || 'Payment failed. Please try again.');
          showNotification('error', 'Payment failed. Please try again.');
        }
      }
    } catch (error) {
      setPaymentStatus('failed');
      setError(error.message || 'Payment failed. Please try again.');
      showNotification('error', error.message || 'Payment failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const renderPaymentForm = () => {
    switch (selectedMethod) {
      case 'mpesa':
        return (
          <Box sx={{ mt: 2 }}>
            <TextField
              fullWidth
              id="phoneNumber"
              name="phoneNumber"
              label="Phone Number"
              type="tel"
              placeholder="254XXXXXXXXX"
              value={formData.phoneNumber}
              onChange={handleInputChange}
              required
              error={!!error && error.includes('phone number')}
              helperText={error && error.includes('phone number') ? error : "Enter your M-Pesa registered phone number"}
            />
          </Box>
        );
      
      case 'paystack':
        return (
          <Box sx={{ mt: 2 }}>
            <TextField
              fullWidth
              id="email"
              name="email"
              label="Email Address"
              type="email"
              placeholder="your@email.com"
              value={formData.email}
              onChange={handleInputChange}
              required
              error={!!error && error.includes('email')}
              helperText={error && error.includes('email') ? error : "Enter your email address for payment confirmation"}
            />
          </Box>
        );
      
      case 'paypal':
        return (
          <Box sx={{ textAlign: 'center', py: 2 }}>
            <Typography variant="body2" color="text.secondary">
              You will be redirected to PayPal to complete your payment
            </Typography>
          </Box>
        );
      
      default:
        return (
          <Box sx={{ textAlign: 'center', py: 2 }}>
            <Typography variant="body2" color="text.secondary">
              Please select a payment method
            </Typography>
          </Box>
        );
    }
  };

  return (
    <Card sx={{ maxWidth: 500, mx: 'auto' }}>
      <CardHeader
        title="Payment Details"
        subheader="Complete your payment to process your order"
      />
      <CardContent>
        <form onSubmit={handleSubmit}>
          <FormControl fullWidth sx={{ mb: 2 }}>
            <InputLabel>Payment Method</InputLabel>
            <Select
              value={selectedMethod}
              onChange={handlePaymentMethodChange}
              label="Payment Method"
              error={!!error && error.includes('select')}
            >
              {paymentMethods.map((method) => (
                <MenuItem key={method.id} value={method.id}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    {method.id === 'mpesa' && <Smartphone size={16} />}
                    {method.id === 'paystack' && <CreditCard size={16} />}
                    {method.id === 'paypal' && <Wallet size={16} />}
                    {method.name}
                  </Box>
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          {renderPaymentForm()}

          {error && (
            <Alert severity="error" sx={{ mt: 2 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <AlertCircle size={16} />
                {error}
              </Box>
            </Alert>
          )}

          {paymentStatus === 'processing' && (
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 1, mt: 2 }}>
              <CircularProgress size={16} />
              <Typography variant="body2" color="text.secondary">
                Processing payment...
              </Typography>
            </Box>
          )}

          {paymentStatus === 'success' && (
            <Alert severity="success" sx={{ mt: 2 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <CheckCircle size={16} />
                Payment successful!
              </Box>
            </Alert>
          )}

          {paymentStatus === 'failed' && (
            <Alert severity="error" sx={{ mt: 2 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Cancel size={16} />
                Payment failed. Please try again.
              </Box>
            </Alert>
          )}
        </form>
      </CardContent>
      <Divider />
      <CardFooter>
        <Button
          fullWidth
          variant="contained"
          type="submit"
          disabled={!selectedMethod || loading || paymentStatus === 'processing'}
          onClick={handleSubmit}
        >
          {loading ? (
            <>
              <CircularProgress size={16} sx={{ mr: 1 }} />
              Processing...
            </>
          ) : (
            `Pay ${amount.toLocaleString('en-US', {
              style: 'currency',
              currency: 'KES'
            })}`
          )}
        </Button>
      </CardFooter>
    </Card>
  );
};

export default PaymentForm; 