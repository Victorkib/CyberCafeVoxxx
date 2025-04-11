import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { 
  fetchSubscribers, 
  fetchNewsletterStats, 
  sendNewsletter,
  clearError,
  clearSuccess
} from '../../redux/slices/newsletterSlice';
import { toast } from 'react-toastify';
import {
  Box,
  Typography,
  TextField,
  Button,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  CircularProgress,
  Alert
} from '@mui/material';

const NewsletterManagement = () => {
  const dispatch = useDispatch();
  const { 
    subscribers, 
    stats, 
    loading, 
    error,
    sendLoading,
    sendError,
    sendSuccess
  } = useSelector((state) => state.newsletter);

  const [newsletterData, setNewsletterData] = useState({
    subject: '',
    content: '',
    type: 'marketing'
  });

  useEffect(() => {
    dispatch(fetchSubscribers());
    dispatch(fetchNewsletterStats());
  }, [dispatch]);

  useEffect(() => {
    // Clear error and success messages when component unmounts
    return () => {
      dispatch(clearError());
      dispatch(clearSuccess());
    };
  }, [dispatch]);

  const handleSendNewsletter = async (e) => {
    e.preventDefault();
    try {
      await dispatch(sendNewsletter(newsletterData)).unwrap();
      setNewsletterData({
        subject: '',
        content: '',
        type: 'marketing'
      });
      toast.success('Newsletter sent successfully!');
    } catch (err) {
      toast.error(err.message || 'Failed to send newsletter');
    }
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box p={3}>
      <Typography variant="h4" gutterBottom>
        Newsletter Management
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      {sendSuccess && (
        <Alert severity="success" sx={{ mb: 2 }}>
          Newsletter sent successfully!
        </Alert>
      )}

      {sendError && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {sendError}
        </Alert>
      )}

      {/* Stats Section */}
      <Paper sx={{ p: 2, mb: 3 }}>
        <Typography variant="h6" gutterBottom>
          Newsletter Statistics
        </Typography>
        {stats && (
          <Box>
            <Typography>Total Subscribers: {stats.totalSubscribers}</Typography>
            <Typography>Active Subscribers: {stats.activeSubscribers}</Typography>
            <Typography>Newsletters Sent: {stats.newslettersSent}</Typography>
          </Box>
        )}
      </Paper>

      {/* Send Newsletter Form */}
      <Paper sx={{ p: 2, mb: 3 }}>
        <Typography variant="h6" gutterBottom>
          Send Newsletter
        </Typography>
        <form onSubmit={handleSendNewsletter}>
          <TextField
            fullWidth
            label="Subject"
            value={newsletterData.subject}
            onChange={(e) => setNewsletterData({ ...newsletterData, subject: e.target.value })}
            required
            sx={{ mb: 2 }}
          />
          <TextField
            fullWidth
            label="Content"
            multiline
            rows={4}
            value={newsletterData.content}
            onChange={(e) => setNewsletterData({ ...newsletterData, content: e.target.value })}
            required
            sx={{ mb: 2 }}
          />
          <FormControl fullWidth sx={{ mb: 2 }}>
            <InputLabel>Type</InputLabel>
            <Select
              value={newsletterData.type}
              label="Type"
              onChange={(e) => setNewsletterData({ ...newsletterData, type: e.target.value })}
            >
              <MenuItem value="marketing">Marketing</MenuItem>
              <MenuItem value="update">Update</MenuItem>
              <MenuItem value="announcement">Announcement</MenuItem>
            </Select>
          </FormControl>
          <Button
            type="submit"
            variant="contained"
            disabled={sendLoading}
          >
            {sendLoading ? 'Sending...' : 'Send Newsletter'}
          </Button>
        </form>
      </Paper>

      {/* Subscribers List */}
      <Paper sx={{ p: 2 }}>
        <Typography variant="h6" gutterBottom>
          Subscribers List
        </Typography>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Email</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Subscribed Date</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {subscribers.map((subscriber) => (
                <TableRow key={subscriber._id}>
                  <TableCell>{subscriber.email}</TableCell>
                  <TableCell>{subscriber.status}</TableCell>
                  <TableCell>{new Date(subscriber.createdAt).toLocaleDateString()}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>
    </Box>
  );
};

export default NewsletterManagement; 