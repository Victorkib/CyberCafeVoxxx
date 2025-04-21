import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  getPaymentHistory,
  getRefundHistory,
  processRefund
} from '../../redux/slices/paymentSlice';
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Typography,
  Button,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton,
  Tooltip,
  Box,
  Chip,
  Pagination,
  CircularProgress
} from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers';
import { format } from 'date-fns';
import { toast } from 'react-toastify';
import { 
  Eye, 
  RefreshCw, 
  Search, 
  Filter, 
  Download,
  CreditCard,
  AlertCircle
} from 'lucide-react';
import { PAYMENT_METHODS, PAYMENT_STATUS } from '../../constants/payment';

export default function PaymentManagementPage() {
  const dispatch = useDispatch();
  const { paymentHistory, refundHistory, loading } = useSelector((state) => state.payment);
  const [filters, setFilters] = useState({
    status: 'all',
    paymentMethod: 'all',
    startDate: null,
    endDate: null,
    search: ''
  });
  const [selectedPayment, setSelectedPayment] = useState(null);
  const [refundDialogOpen, setRefundDialogOpen] = useState(false);
  const [refundReason, setRefundReason] = useState('');
  const [page, setPage] = useState(1);
  const [rowsPerPage] = useState(10);
  const [detailsDialogOpen, setDetailsDialogOpen] = useState(false);

  useEffect(() => {
    dispatch(getPaymentHistory());
    dispatch(getRefundHistory());
  }, [dispatch]);

  const handleFilterChange = (field, value) => {
    setFilters(prev => ({ ...prev, [field]: value }));
    setPage(1); // Reset to first page when filters change
  };

  const handleRefund = async () => {
    if (!refundReason.trim()) {
      toast.error('Please provide a reason for the refund');
      return;
    }

    try {
      await dispatch(processRefund({
        paymentId: selectedPayment._id,
        reason: refundReason
      })).unwrap();
      setRefundDialogOpen(false);
      setRefundReason('');
      setSelectedPayment(null);
      toast.success('Refund processed successfully');
    } catch (error) {
      toast.error(error.message || 'Failed to process refund');
    }
  };

  const handleViewDetails = (payment) => {
    setSelectedPayment(payment);
    setDetailsDialogOpen(true);
  };

  const filteredPayments = paymentHistory.filter(payment => {
    const matchesSearch = payment.orderId.toLowerCase().includes(filters.search.toLowerCase()) ||
      payment.transactionId.toLowerCase().includes(filters.search.toLowerCase());
    
    const matchesStatus = filters.status === 'all' || payment.status === filters.status;
    const matchesPaymentMethod = filters.paymentMethod === 'all' || payment.method === filters.paymentMethod;
    
    const paymentDate = new Date(payment.createdAt);
    const matchesDateRange = (!filters.startDate || paymentDate >= filters.startDate) &&
      (!filters.endDate || paymentDate <= filters.endDate);

    return matchesSearch && matchesStatus && matchesPaymentMethod && matchesDateRange;
  });

  const paginatedPayments = filteredPayments.slice(
    (page - 1) * rowsPerPage,
    page * rowsPerPage
  );

  const handlePageChange = (event, value) => {
    setPage(value);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case PAYMENT_STATUS.PAID:
        return 'success';
      case PAYMENT_STATUS.PENDING:
        return 'warning';
      case PAYMENT_STATUS.FAILED:
        return 'error';
      case PAYMENT_STATUS.REFUNDED:
        return 'info';
      case PAYMENT_STATUS.CANCELLED:
        return 'default';
      default:
        return 'default';
    }
  };

  const getStatusLabel = (status) => {
    switch (status) {
      case PAYMENT_STATUS.PAID:
        return 'Paid';
      case PAYMENT_STATUS.PENDING:
        return 'Pending';
      case PAYMENT_STATUS.FAILED:
        return 'Failed';
      case PAYMENT_STATUS.REFUNDED:
        return 'Refunded';
      case PAYMENT_STATUS.CANCELLED:
        return 'Cancelled';
      default:
        return status;
    }
  };

  const getPaymentMethodLabel = (method) => {
    switch (method) {
      case PAYMENT_METHODS.MPESA:
        return 'M-Pesa';
      case PAYMENT_METHODS.PAYSTACK:
        return 'Paystack';
      case PAYMENT_METHODS.PAYPAL:
        return 'PayPal';
        default:
        return method;
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-KE', {
      style: 'currency',
      currency: 'KES'
    }).format(amount);
  };

  return (
    <div className="p-6">
      <Typography variant="h4" component="h1" gutterBottom>
        Payment Management
      </Typography>

      {/* Filters */}
      <Paper className="p-4 mb-6">
        <div className="flex flex-col md:flex-row gap-4 mb-4">
          <TextField
            label="Search"
            variant="outlined"
            value={filters.search}
            onChange={(e) => handleFilterChange('search', e.target.value)}
            fullWidth
            InputProps={{
              startAdornment: <Search className="mr-2 h-5 w-5 text-gray-400" />
            }}
          />
          
          <FormControl fullWidth>
            <InputLabel>Status</InputLabel>
            <Select
              value={filters.status}
              onChange={(e) => handleFilterChange('status', e.target.value)}
              label="Status"
            >
              <MenuItem value="all">All Statuses</MenuItem>
              <MenuItem value={PAYMENT_STATUS.PAID}>Paid</MenuItem>
              <MenuItem value={PAYMENT_STATUS.PENDING}>Pending</MenuItem>
              <MenuItem value={PAYMENT_STATUS.FAILED}>Failed</MenuItem>
              <MenuItem value={PAYMENT_STATUS.REFUNDED}>Refunded</MenuItem>
              <MenuItem value={PAYMENT_STATUS.CANCELLED}>Cancelled</MenuItem>
            </Select>
          </FormControl>

          <FormControl fullWidth>
            <InputLabel>Payment Method</InputLabel>
            <Select
              value={filters.paymentMethod}
              onChange={(e) => handleFilterChange('paymentMethod', e.target.value)}
              label="Payment Method"
            >
              <MenuItem value="all">All Payment Methods</MenuItem>
              <MenuItem value={PAYMENT_METHODS.MPESA}>M-Pesa</MenuItem>
              <MenuItem value={PAYMENT_METHODS.PAYSTACK}>Paystack</MenuItem>
              <MenuItem value={PAYMENT_METHODS.PAYPAL}>PayPal</MenuItem>
            </Select>
          </FormControl>
        </div>

        <div className="flex flex-col md:flex-row gap-4">
          <DatePicker
            label="Start Date"
            value={filters.startDate}
            onChange={(date) => handleFilterChange('startDate', date)}
            renderInput={(params) => <TextField {...params} fullWidth />}
          />
          <DatePicker
            label="End Date"
            value={filters.endDate}
            onChange={(date) => handleFilterChange('endDate', date)}
            renderInput={(params) => <TextField {...params} fullWidth />}
          />
          <Button 
            variant="outlined" 
            startIcon={<RefreshCw className="h-4 w-4" />}
            onClick={() => {
              setFilters({
                status: 'all',
                paymentMethod: 'all',
                startDate: null,
                endDate: null,
                search: ''
              });
              setPage(1);
            }}
            className="h-14"
          >
            Reset Filters
          </Button>
        </div>
      </Paper>

      {/* Payment Table */}
      <Paper className="overflow-hidden">
        <TableContainer>
        <Table>
          <TableHead>
            <TableRow>
                <TableCell>Order ID</TableCell>
                <TableCell>Transaction ID</TableCell>
                <TableCell>Date</TableCell>
                <TableCell>Method</TableCell>
                <TableCell>Amount</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={7} align="center">
                    <Box display="flex" justifyContent="center" p={3}>
                      <CircularProgress />
                    </Box>
                  </TableCell>
                </TableRow>
              ) : paginatedPayments.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} align="center">
                    <Box display="flex" flexDirection="column" alignItems="center" p={3}>
                      <AlertCircle className="h-10 w-10 text-gray-400 mb-2" />
                      <Typography variant="body1" color="textSecondary">
                        No payments found matching your criteria
                      </Typography>
                    </Box>
                  </TableCell>
                </TableRow>
              ) : (
                paginatedPayments.map((payment) => (
                  <TableRow key={payment._id}>
                    <TableCell>{payment.orderId}</TableCell>
                    <TableCell>{payment.transactionId}</TableCell>
                    <TableCell>{format(new Date(payment.createdAt), 'MMM dd, yyyy HH:mm')}</TableCell>
                    <TableCell>
                      <div className="flex items-center">
                        <CreditCard className="h-4 w-4 mr-2" />
                        {getPaymentMethodLabel(payment.method)}
                      </div>
                    </TableCell>
                    <TableCell>{formatCurrency(payment.amount)}</TableCell>
                  <TableCell>
                      <Chip 
                        label={getStatusLabel(payment.status)} 
                        color={getStatusColor(payment.status)}
                        size="small"
                      />
                  </TableCell>
                  <TableCell>
                      <div className="flex space-x-2">
                        <Tooltip title="View Details">
                          <IconButton 
                            size="small" 
                            onClick={() => handleViewDetails(payment)}
                          >
                            <Eye className="h-4 w-4" />
                          </IconButton>
                        </Tooltip>
                        {payment.status === PAYMENT_STATUS.PAID && !payment.refundedAt && (
                          <Tooltip title="Process Refund">
                            <IconButton 
                      size="small"
                      onClick={() => {
                                setSelectedPayment(payment);
                                setRefundDialogOpen(true);
                              }}
                            >
                              <RefreshCw className="h-4 w-4" />
                            </IconButton>
                          </Tooltip>
                        )}
                      </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
        </TableContainer>
        
        {!loading && filteredPayments.length > 0 && (
          <Box display="flex" justifyContent="center" p={2}>
            <Pagination 
              count={Math.ceil(filteredPayments.length / rowsPerPage)} 
          page={page}
              onChange={handlePageChange} 
              color="primary" 
            />
          </Box>
        )}
      </Paper>

      {/* Refund Dialog */}
      <Dialog open={refundDialogOpen} onClose={() => setRefundDialogOpen(false)}>
        <DialogTitle>Process Refund</DialogTitle>
        <DialogContent>
          <div className="mt-4">
            <Typography variant="subtitle1" gutterBottom>
              Payment Details
            </Typography>
            <div className="bg-gray-50 p-4 rounded-md mb-4">
              <div className="grid grid-cols-2 gap-2">
                <Typography variant="body2" color="textSecondary">Order ID:</Typography>
                <Typography variant="body2">{selectedPayment?.orderId}</Typography>
                <Typography variant="body2" color="textSecondary">Transaction ID:</Typography>
                <Typography variant="body2">{selectedPayment?.transactionId}</Typography>
                <Typography variant="body2" color="textSecondary">Amount:</Typography>
                <Typography variant="body2">{formatCurrency(selectedPayment?.amount)}</Typography>
                <Typography variant="body2" color="textSecondary">Method:</Typography>
                <Typography variant="body2">{getPaymentMethodLabel(selectedPayment?.method)}</Typography>
              </div>
            </div>
            
            <Typography variant="subtitle1" gutterBottom>
              Refund Reason
            </Typography>
            <TextField
              fullWidth
              multiline
              rows={4}
              variant="outlined"
              placeholder="Please provide a reason for the refund"
              value={refundReason}
              onChange={(e) => setRefundReason(e.target.value)}
            />
          </div>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setRefundDialogOpen(false)}>Cancel</Button>
          <Button onClick={handleRefund} variant="contained" color="primary">
            Process Refund
          </Button>
        </DialogActions>
      </Dialog>

      {/* Payment Details Dialog */}
      <Dialog 
        open={detailsDialogOpen} 
        onClose={() => setDetailsDialogOpen(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>Payment Details</DialogTitle>
        <DialogContent>
          {selectedPayment && (
            <div className="mt-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <Typography variant="subtitle1" gutterBottom>
                    Basic Information
                  </Typography>
                  <div className="bg-gray-50 p-4 rounded-md">
                    <div className="grid grid-cols-2 gap-2">
                      <Typography variant="body2" color="textSecondary">Order ID:</Typography>
                      <Typography variant="body2">{selectedPayment.orderId}</Typography>
                      <Typography variant="body2" color="textSecondary">Transaction ID:</Typography>
                      <Typography variant="body2">{selectedPayment.transactionId}</Typography>
                      <Typography variant="body2" color="textSecondary">Amount:</Typography>
                      <Typography variant="body2">{formatCurrency(selectedPayment.amount)}</Typography>
                      <Typography variant="body2" color="textSecondary">Method:</Typography>
                      <Typography variant="body2">{getPaymentMethodLabel(selectedPayment.method)}</Typography>
                      <Typography variant="body2" color="textSecondary">Status:</Typography>
                      <Chip 
                        label={getStatusLabel(selectedPayment.status)} 
                        color={getStatusColor(selectedPayment.status)}
                        size="small"
                      />
                      <Typography variant="body2" color="textSecondary">Date:</Typography>
                      <Typography variant="body2">
                        {format(new Date(selectedPayment.createdAt), 'MMM dd, yyyy HH:mm:ss')}
                      </Typography>
                    </div>
                  </div>
                </div>
                
                <div>
                  <Typography variant="subtitle1" gutterBottom>
                    Customer Information
                  </Typography>
                  <div className="bg-gray-50 p-4 rounded-md">
                    <div className="grid grid-cols-2 gap-2">
                      <Typography variant="body2" color="textSecondary">Customer ID:</Typography>
                      <Typography variant="body2">{selectedPayment.userId}</Typography>
                      <Typography variant="body2" color="textSecondary">Email:</Typography>
                      <Typography variant="body2">{selectedPayment.metadata?.email || 'N/A'}</Typography>
                      <Typography variant="body2" color="textSecondary">Phone:</Typography>
                      <Typography variant="body2">{selectedPayment.metadata?.phone || 'N/A'}</Typography>
                    </div>
                  </div>
                </div>
              </div>
              
              {selectedPayment.error && (
                <div className="mt-6">
                  <Typography variant="subtitle1" gutterBottom>
                    Error Information
                  </Typography>
                  <div className="bg-red-50 p-4 rounded-md">
                    <Typography variant="body2" color="error">
                      {selectedPayment.error.message}
                    </Typography>
                    {selectedPayment.error.details && (
                      <pre className="mt-2 text-xs overflow-auto">
                        {JSON.stringify(selectedPayment.error.details, null, 2)}
                      </pre>
                    )}
                  </div>
                </div>
              )}
              
              {selectedPayment.refundedAt && (
                <div className="mt-6">
                  <Typography variant="subtitle1" gutterBottom>
                    Refund Information
                  </Typography>
                  <div className="bg-gray-50 p-4 rounded-md">
                    <div className="grid grid-cols-2 gap-2">
                      <Typography variant="body2" color="textSecondary">Refund Date:</Typography>
                      <Typography variant="body2">
                        {format(new Date(selectedPayment.refundedAt), 'MMM dd, yyyy HH:mm:ss')}
                      </Typography>
                      <Typography variant="body2" color="textSecondary">Refund Reason:</Typography>
                      <Typography variant="body2">{selectedPayment.refundReason || 'N/A'}</Typography>
                      <Typography variant="body2" color="textSecondary">Refunded By:</Typography>
                      <Typography variant="body2">{selectedPayment.refundedBy || 'System'}</Typography>
                    </div>
                  </div>
                </div>
              )}
              
              <div className="mt-6">
                <Typography variant="subtitle1" gutterBottom>
                  Additional Metadata
                </Typography>
                <div className="bg-gray-50 p-4 rounded-md">
                  <pre className="text-xs overflow-auto">
                    {JSON.stringify(selectedPayment.metadata, null, 2)}
                  </pre>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDetailsDialogOpen(false)}>Close</Button>
          <Button 
            variant="contained" 
            color="primary"
            startIcon={<Download className="h-4 w-4" />}
          >
            Export Details
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
} 