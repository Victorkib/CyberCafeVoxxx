import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  Search,
  Filter,
  Download,
  RefreshCw,
  AlertCircle,
  CheckCircle2,
  XCircle,
  Clock,
} from 'lucide-react';
import { fetchOrders } from '../../redux/slices/orderSlice';
import { toast } from 'react-hot-toast';
import {
  Box,
  Container,
  Typography,
  Button,
  TextField,
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
  IconButton,
  InputAdornment,
  TablePagination,
  Skeleton,
  Chip,
} from '@mui/material';
import { styled } from '@mui/material/styles';

const StyledTableCell = styled(TableCell)(({ theme }) => ({
  fontWeight: 'bold',
  backgroundColor: theme.palette.grey[50],
}));

const StatusIcon = styled(Box)(({ theme, status }) => ({
  display: 'flex',
  alignItems: 'center',
  color: status === 'paid' 
    ? theme.palette.success.main 
    : status === 'pending'
    ? theme.palette.warning.main
    : status === 'failed'
    ? theme.palette.error.main
    : theme.palette.grey[500],
}));

const LoadingSkeleton = () => (
  <TableRow>
    <TableCell><Skeleton animation="wave" /></TableCell>
    <TableCell><Skeleton animation="wave" /></TableCell>
    <TableCell><Skeleton animation="wave" /></TableCell>
    <TableCell><Skeleton animation="wave" /></TableCell>
    <TableCell><Skeleton animation="wave" /></TableCell>
    <TableCell><Skeleton animation="wave" /></TableCell>
    <TableCell><Skeleton animation="wave" /></TableCell>
  </TableRow>
);

export default function PaymentManagementPage() {
  const dispatch = useDispatch();
  const { orders, loading } = useSelector((state) => state.order);
  const [filters, setFilters] = useState({
    status: 'all',
    paymentMethod: 'all',
    dateRange: 'all',
  });
  const [searchTerm, setSearchTerm] = useState('');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [activeFilters, setActiveFilters] = useState([]);

  useEffect(() => {
    dispatch(fetchOrders());
  }, [dispatch]);

  useEffect(() => {
    // Update active filters
    const newActiveFilters = [];
    if (filters.status !== 'all') newActiveFilters.push({ key: 'status', value: filters.status });
    if (filters.paymentMethod !== 'all') newActiveFilters.push({ key: 'method', value: filters.paymentMethod });
    if (filters.dateRange !== 'all') newActiveFilters.push({ key: 'date', value: filters.dateRange });
    if (searchTerm) newActiveFilters.push({ key: 'search', value: searchTerm });
    setActiveFilters(newActiveFilters);
  }, [filters, searchTerm]);

  const handleFilterChange = (field, value) => {
    setFilters((prev) => ({
      ...prev,
      [field]: value,
    }));
    setPage(0); // Reset to first page when filter changes
  };

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleExport = () => {
    // TODO: Implement export functionality
    toast.info('Export functionality coming soon');
  };

  const handleRemoveFilter = (key) => {
    if (key === 'search') {
      setSearchTerm('');
    } else {
      setFilters(prev => ({
        ...prev,
        [key]: 'all'
      }));
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'paid':
        return <CheckCircle2 size={20} />;
      case 'pending':
        return <Clock size={20} />;
      case 'failed':
        return <XCircle size={20} />;
      default:
        return <AlertCircle size={20} />;
    }
  };

  const filteredOrders = orders.filter((order) => {
    const matchesSearch =
      order._id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.user.email.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus =
      filters.status === 'all' || order.paymentStatus === filters.status;

    const matchesPaymentMethod =
      filters.paymentMethod === 'all' ||
      order.paymentMethod === filters.paymentMethod;

    // Add date range filtering logic here
    const matchesDateRange = filters.dateRange === 'all' || (() => {
      const orderDate = new Date(order.createdAt);
      const today = new Date();
      switch (filters.dateRange) {
        case 'today':
          return orderDate.toDateString() === today.toDateString();
        case 'week':
          const weekAgo = new Date(today.setDate(today.getDate() - 7));
          return orderDate >= weekAgo;
        case 'month':
          const monthAgo = new Date(today.setMonth(today.getMonth() - 1));
          return orderDate >= monthAgo;
        default:
          return true;
      }
    })();

    return matchesSearch && matchesStatus && matchesPaymentMethod && matchesDateRange;
  });

  const paginatedOrders = filteredOrders.slice(
    page * rowsPerPage,
    page * rowsPerPage + rowsPerPage
  );

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4" component="h1">Payment Management</Typography>
        <Box display="flex" gap={2}>
          <Button
            variant="outlined"
            startIcon={<RefreshCw size={20} />}
            onClick={() => dispatch(fetchOrders())}
            disabled={loading}
          >
            Refresh
          </Button>
          <Button
            variant="contained"
            startIcon={<Download size={20} />}
            onClick={handleExport}
            disabled={loading}
          >
            Export
          </Button>
        </Box>
      </Box>

      {/* Filters */}
      <Paper sx={{ p: 3, mb: 3 }}>
        <Box display="grid" gridTemplateColumns={{ xs: '1fr', md: 'repeat(4, 1fr)' }} gap={2}>
          <TextField
            fullWidth
            placeholder="Search by order ID or email"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <Search size={20} />
                </InputAdornment>
              ),
            }}
          />
          <FormControl fullWidth>
            <InputLabel>Status</InputLabel>
            <Select
              value={filters.status}
              onChange={(e) => handleFilterChange('status', e.target.value)}
              label="Status"
            >
              <MenuItem value="all">All Status</MenuItem>
              <MenuItem value="paid">Paid</MenuItem>
              <MenuItem value="pending">Pending</MenuItem>
              <MenuItem value="failed">Failed</MenuItem>
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
              <MenuItem value="mpesa">M-Pesa</MenuItem>
              <MenuItem value="paystack">Paystack</MenuItem>
              <MenuItem value="paypal">PayPal</MenuItem>
            </Select>
          </FormControl>
          <FormControl fullWidth>
            <InputLabel>Date Range</InputLabel>
            <Select
              value={filters.dateRange}
              onChange={(e) => handleFilterChange('dateRange', e.target.value)}
              label="Date Range"
            >
              <MenuItem value="all">All Time</MenuItem>
              <MenuItem value="today">Today</MenuItem>
              <MenuItem value="week">This Week</MenuItem>
              <MenuItem value="month">This Month</MenuItem>
            </Select>
          </FormControl>
        </Box>

        {/* Active Filters */}
        {activeFilters.length > 0 && (
          <Box display="flex" gap={1} mt={2} flexWrap="wrap">
            {activeFilters.map(({ key, value }) => (
              <Chip
                key={key}
                label={`${key}: ${value}`}
                onDelete={() => handleRemoveFilter(key)}
                size="small"
              />
            ))}
          </Box>
        )}
      </Paper>

      {/* Payment Transactions Table */}
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <StyledTableCell>Order ID</StyledTableCell>
              <StyledTableCell>Customer</StyledTableCell>
              <StyledTableCell>Amount</StyledTableCell>
              <StyledTableCell>Payment Method</StyledTableCell>
              <StyledTableCell>Status</StyledTableCell>
              <StyledTableCell>Date</StyledTableCell>
              <StyledTableCell>Actions</StyledTableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {loading ? (
              Array.from({ length: rowsPerPage }).map((_, index) => (
                <LoadingSkeleton key={index} />
              ))
            ) : paginatedOrders.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} align="center">
                  <Typography color="text.secondary">No payments found</Typography>
                </TableCell>
              </TableRow>
            ) : (
              paginatedOrders.map((order) => (
                <TableRow key={order._id}>
                  <TableCell>{order._id}</TableCell>
                  <TableCell>{order.user.email}</TableCell>
                  <TableCell>${order.totalPrice.toFixed(2)}</TableCell>
                  <TableCell>
                    <Chip
                      label={order.paymentMethod}
                      size="small"
                      color="default"
                    />
                  </TableCell>
                  <TableCell>
                    <StatusIcon status={order.paymentStatus}>
                      {getStatusIcon(order.paymentStatus)}
                      <Typography variant="body2" sx={{ ml: 1 }}>
                        {order.paymentStatus}
                      </Typography>
                    </StatusIcon>
                  </TableCell>
                  <TableCell>
                    {new Date(order.createdAt).toLocaleDateString()}
                  </TableCell>
                  <TableCell>
                    <Button
                      size="small"
                      onClick={() => {
                        // TODO: Implement view details functionality
                        toast.info('View details functionality coming soon');
                      }}
                    >
                      View Details
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
        <TablePagination
          rowsPerPageOptions={[5, 10, 25]}
          component="div"
          count={filteredOrders.length}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
        />
      </TableContainer>
    </Container>
  );
} 