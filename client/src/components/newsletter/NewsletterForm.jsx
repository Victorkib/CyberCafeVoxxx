import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { subscribeToNewsletter, clearError, clearSuccess } from '../../redux/slices/newsletterSlice';
import { Button, TextField, Typography, Box, Alert } from '@mui/material';

const NewsletterForm = () => {
  const dispatch = useDispatch();
  const { subscribeLoading, subscribeError, subscribeSuccess } = useSelector((state) => state.newsletter);
  const [email, setEmail] = useState('');

  useEffect(() => {
    // Clear error and success messages when component unmounts
    return () => {
      dispatch(clearError());
      dispatch(clearSuccess());
    };
  }, [dispatch]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email) return;

    try {
      await dispatch(subscribeToNewsletter({
        email,
        source: 'website',
        preferences: ['marketing', 'updates']
      })).unwrap();
      setEmail('');
    } catch (err) {
      // Error is handled by the slice
    }
  };

  return (
    <Box component="form" onSubmit={handleSubmit} sx={{ maxWidth: 400, mx: 'auto', p: 2 }}>
      <Typography variant="h6" gutterBottom>
        Subscribe to Our Newsletter
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
        Stay updated with our latest products and offers.
      </Typography>
      
      {subscribeError && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {subscribeError}
        </Alert>
      )}
      
      {subscribeSuccess && (
        <Alert severity="success" sx={{ mb: 2 }}>
          Thank you for subscribing! Please check your email to confirm your subscription.
        </Alert>
      )}

      <TextField
        fullWidth
        type="email"
        label="Email Address"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        disabled={subscribeLoading}
        required
        sx={{ mb: 2 }}
      />

      <Button
        type="submit"
        variant="contained"
        fullWidth
        disabled={subscribeLoading}
      >
        {subscribeLoading ? 'Subscribing...' : 'Subscribe'}
      </Button>
    </Box>
  );
};

export default NewsletterForm; 