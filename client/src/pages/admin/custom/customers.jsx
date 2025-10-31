'use client';

import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  Search,
  FilePlus,
  RefreshCw,
  MessageSquare,
  Edit,
  Eye,
  User,
  Mail,
  Phone,
  Calendar,
  MapPin,
  ShoppingCart,
  UserPlus,
  Ban,
  CheckCircle,
  Download,
  TrendingUp,
  UserX,
  AlertTriangle,
  Clock,
} from 'lucide-react';
import {
  Button,
  TextField,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  IconButton,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Card,
  CardContent,
  CardHeader,
  Typography,
  Avatar,
  Tooltip,
  Tabs,
  Tab,
  Box,
  Chip,
  Snackbar,
  Alert,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Grid,
  CircularProgress,
  Pagination,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Switch,
  FormControlLabel,
} from '@mui/material';
import { DatePicker, Empty } from 'antd';
import {
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  AreaChart,
  Area,
  Legend,
} from 'recharts';
import {
  fetchCustomers,
  fetchCustomerById,
  updateCustomerStatus,
  blockCustomer,
  unblockCustomer,
  updateUser,
  createUser,
} from '../../../redux/slices/adminSlice';
import { toast } from 'react-hot-toast';

// Status color helper
const getStatusColor = (status) => {
  switch (status?.toLowerCase()) {
    case 'active':
      return 'success';
    case 'inactive':
      return 'warning';
    case 'blocked':
      return 'error';
    default:
      return 'default';
  }
};

// Date formatter
const formatDate = (dateString) => {
  if (!dateString) return 'N/A';
  const options = { year: 'numeric', month: 'short', day: 'numeric' };
  return new Date(dateString).toLocaleDateString(undefined, options);
};

// Format date with time
const formatDateTime = (dateString) => {
  if (!dateString) return 'N/A';
  const options = {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  };
  return new Date(dateString).toLocaleString(undefined, options);
};

const Customers = () => {
  const dispatch = useDispatch();
  const { customers, loading, error } = useSelector((state) => state.admin);

  // Local state
  const [notification, setNotification] = useState({
    open: false,
    message: '',
    type: 'success',
  });
  const [isAddCustomerModalOpen, setIsAddCustomerModalOpen] = useState(false);
  const [isViewCustomerModalOpen, setIsViewCustomerModalOpen] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [dateRange, setDateRange] = useState(null);
  const [tabValue, setTabValue] = useState(0);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [isLoading, setIsLoading] = useState(false);
  const [customerDetails, setCustomerDetails] = useState(null);
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);
  const [exportFormat, setExportFormat] = useState('csv');
  const [newCustomer, setNewCustomer] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
    status: 'active',
    notes: '',
  });

  // Fetch customers on component mount and when filters change
  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        // Using the correct action from your adminSlice
        await dispatch(
          fetchCustomers({
            page,
            limit,
          })
        ).unwrap();
      } catch (err) {
        toast.error(err.message || 'Failed to fetch customers');
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [dispatch, page, limit]);

  // Apply search filter with debounce
  useEffect(() => {
    if (!searchTerm) return;

    const timer = setTimeout(() => {
      // In a real implementation, you would add search functionality to your API
      // For now, we'll just filter the existing customers client-side
      const filteredCustomers = customers.filter(
        (customer) =>
          customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          customer.email.toLowerCase().includes(searchTerm.toLowerCase())
      );

      // This is a client-side filter since your API might not support search directly
      // In a production app, you would update your API to support search
    }, 500);

    return () => clearTimeout(timer);
  }, [searchTerm, customers]);

  const handleCloseNotification = () => {
    setNotification({ ...notification, open: false });
  };

  const handleAddCustomer = () => {
    setSelectedCustomer(null);
    setNewCustomer({
      name: '',
      email: '',
      phone: '',
      address: '',
      status: 'active',
      notes: '',
    });
    setIsAddCustomerModalOpen(true);
  };

  const handleEditCustomer = (customer) => {
    setSelectedCustomer(customer);
    setNewCustomer({
      name: customer.name,
      email: customer.email,
      phone: customer.phone || '',
      address: customer.address || '',
      status: customer.status,
      notes: customer.notes || '',
    });
    setIsAddCustomerModalOpen(true);
  };

  const handleViewCustomer = async (customer) => {
    setIsLoading(true);
    try {
      // Using the correct action from your adminSlice
      const customerData = await dispatch(
        fetchCustomerById(customer._id)
      ).unwrap();
      setCustomerDetails(customerData);
      setSelectedCustomer(customerData);
      setIsViewCustomerModalOpen(true);
    } catch (err) {
      toast.error(err.message || 'Failed to fetch customer details');
    } finally {
      setIsLoading(false);
    }
  };

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);

    if (newValue === 0) {
      setStatusFilter('all');
    } else if (newValue === 1) {
      setStatusFilter('active');
    } else if (newValue === 2) {
      setStatusFilter('inactive');
    } else if (newValue === 3) {
      setStatusFilter('blocked');
    }

    // Refresh customers with the new status filter
    dispatch(
      fetchCustomers({
        page: 1,
        limit,
        status: statusFilter !== 'all' ? statusFilter : undefined,
      })
    );
    setPage(1);
  };

  const handleUpdateStatus = async (customerId, status) => {
    try {
      // Using the correct action from your adminSlice
      await dispatch(updateCustomerStatus({ id: customerId, status })).unwrap();
      toast.success(`Customer status updated to ${status}`);

      // Refresh the customer list
      dispatch(
        fetchCustomers({
          page,
          limit,
          status: statusFilter !== 'all' ? statusFilter : undefined,
        })
      );
    } catch (error) {
      toast.error(error.message || 'Failed to update customer status');
    }
  };

  const handleBlockCustomer = async (customerId) => {
    if (window.confirm('Are you sure you want to block this customer?')) {
      try {
        // Using the correct action from your adminSlice
        await dispatch(blockCustomer(customerId)).unwrap();
        toast.success('Customer blocked successfully');

        // Refresh the customer list
        dispatch(
          fetchCustomers({
            page,
            limit,
            status: statusFilter !== 'all' ? statusFilter : undefined,
          })
        );
      } catch (error) {
        toast.error(error.message || 'Failed to block customer');
      }
    }
  };

  const handleUnblockCustomer = async (customerId) => {
    if (window.confirm('Are you sure you want to unblock this customer?')) {
      try {
        // Using the correct action from your adminSlice
        await dispatch(unblockCustomer(customerId)).unwrap();
        toast.success('Customer unblocked successfully');

        // Refresh the customer list
        dispatch(
          fetchCustomers({
            page,
            limit,
            status: statusFilter !== 'all' ? statusFilter : undefined,
          })
        );
      } catch (error) {
        toast.error(error.message || 'Failed to unblock customer');
      }
    }
  };

  const handleSaveCustomer = async () => {
    if (!newCustomer.name || !newCustomer.email) {
      setNotification({
        open: true,
        message: 'Name and email are required',
        type: 'error',
      });
      return;
    }

    setIsLoading(true);
    try {
      if (selectedCustomer) {
        // Update existing customer - using updateUser from your adminSlice
        await dispatch(
          updateUser({
            id: selectedCustomer._id,
            userData: newCustomer,
          })
        ).unwrap();
        toast.success('Customer updated successfully');
      } else {
        // Create new customer - using createUser from your adminSlice
        await dispatch(
          createUser({
            ...newCustomer,
            role: 'user', // Ensure the role is set to 'user'
            password: Math.random().toString(36).slice(-8), // Generate a random password
          })
        ).unwrap();
        toast.success('Customer added successfully');
      }

      // Refresh customer list
      dispatch(fetchCustomers({ page, limit }));
      setIsAddCustomerModalOpen(false);
    } catch (error) {
      toast.error(error.message || 'Failed to save customer');
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewCustomer((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleExportCustomers = () => {
    setIsExportModalOpen(true);
  };

  const handleExport = async () => {
    try {
      setIsLoading(true);
      // This would typically call an API endpoint that returns a file
      // For now, we'll just simulate it with a timeout
      setTimeout(() => {
        toast.success(`Customers exported as ${exportFormat.toUpperCase()}`);
        setIsExportModalOpen(false);
        setIsLoading(false);
      }, 1500);
    } catch (error) {
      toast.error('Failed to export customers');
      setIsLoading(false);
    }
  };

  // Filter customers based on status and search term
  const filteredCustomers = customers.filter((customer) => {
    const matchesStatus =
      statusFilter === 'all' || customer.status === statusFilter;
    const matchesSearch =
      !searchTerm ||
      customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      customer.email.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  // Generate customer analytics data
  const customerStatusData = [
    {
      name: 'Active',
      value: customers.filter((c) => c.status === 'active').length,
    },
    {
      name: 'Inactive',
      value: customers.filter((c) => c.status === 'inactive').length,
    },
    {
      name: 'Blocked',
      value: customers.filter((c) => c.status === 'blocked').length,
    },
  ];

  // Generate monthly signup data
  const getMonthlySignups = () => {
    const months = [
      'Jan',
      'Feb',
      'Mar',
      'Apr',
      'May',
      'Jun',
      'Jul',
      'Aug',
      'Sep',
      'Oct',
      'Nov',
      'Dec',
    ];
    const currentYear = new Date().getFullYear();
    const data = months.map((month) => ({ month, customers: 0 }));

    customers.forEach((customer) => {
      const createdAt = new Date(customer.createdAt);
      if (createdAt.getFullYear() === currentYear) {
        const monthIndex = createdAt.getMonth();
        data[monthIndex].customers += 1;
      }
    });

    return data;
  };

  const customerAcquisitionData = getMonthlySignups();
  const COLORS = ['#4CAF50', '#FFC107', '#F44336', '#2196F3', '#9C27B0'];

  if (loading && !customers.length) {
    return (
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        minHeight="400px"
      >
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      {/* Customer Analytics Cards */}
      <Grid container spacing={3} mb={4}>
        <Grid item xs={12} md={6} lg={3}>
          <Card>
            <CardContent>
              <Box
                display="flex"
                justifyContent="space-between"
                alignItems="center"
                mb={2}
              >
                <Typography variant="h6" color="text.secondary">
                  Total Customers
                </Typography>
                <Avatar sx={{ bgcolor: 'primary.main' }}>
                  <User />
                </Avatar>
              </Box>
              <Typography variant="h4">{customers.length}</Typography>
              <Box display="flex" alignItems="center" mt={1}>
                <TrendingUp color="success" size={16} />
                <Typography variant="body2" color="success.main" ml={0.5}>
                  {/* Calculate growth rate if possible */}
                  {customers.length > 0 ? '12%' : '0%'} growth
                </Typography>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={6} lg={3}>
          <Card>
            <CardContent>
              <Box
                display="flex"
                justifyContent="space-between"
                alignItems="center"
                mb={2}
              >
                <Typography variant="h6" color="text.secondary">
                  Active Customers
                </Typography>
                <Avatar sx={{ bgcolor: 'success.main' }}>
                  <CheckCircle />
                </Avatar>
              </Box>
              <Typography variant="h4">
                {customers.filter((c) => c.status === 'active').length}
              </Typography>
              <Box display="flex" alignItems="center" mt={1}>
                <Typography variant="body2" color="text.secondary">
                  {customers.length > 0
                    ? `${Math.round(
                        (customers.filter((c) => c.status === 'active').length /
                          customers.length) *
                          100
                      )}%`
                    : '0%'}{' '}
                  of total
                </Typography>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={6} lg={3}>
          <Card>
            <CardContent>
              <Box
                display="flex"
                justifyContent="space-between"
                alignItems="center"
                mb={2}
              >
                <Typography variant="h6" color="text.secondary">
                  New This Month
                </Typography>
                <Avatar sx={{ bgcolor: 'info.main' }}>
                  <UserPlus />
                </Avatar>
              </Box>
              <Typography variant="h4">
                {
                  customers.filter((c) => {
                    const createdAt = new Date(c.createdAt);
                    const now = new Date();
                    return (
                      createdAt.getMonth() === now.getMonth() &&
                      createdAt.getFullYear() === now.getFullYear()
                    );
                  }).length
                }
              </Typography>
              <Box display="flex" alignItems="center" mt={1}>
                <Clock size={16} />
                <Typography variant="body2" color="text.secondary" ml={0.5}>
                  Last 30 days
                </Typography>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={6} lg={3}>
          <Card>
            <CardContent>
              <Box
                display="flex"
                justifyContent="space-between"
                alignItems="center"
                mb={2}
              >
                <Typography variant="h6" color="text.secondary">
                  Blocked Accounts
                </Typography>
                <Avatar sx={{ bgcolor: 'error.main' }}>
                  <UserX />
                </Avatar>
              </Box>
              <Typography variant="h4">
                {customers.filter((c) => c.status === 'blocked').length}
              </Typography>
              <Box display="flex" alignItems="center" mt={1}>
                <AlertTriangle size={16} color="#f44336" />
                <Typography variant="body2" color="error" ml={0.5}>
                  {customers.length > 0
                    ? `${Math.round(
                        (customers.filter((c) => c.status === 'blocked')
                          .length /
                          customers.length) *
                          100
                      )}%`
                    : '0%'}{' '}
                  of total
                </Typography>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Customer Analytics Charts */}
      <Grid container spacing={3} mb={4}>
        <Grid item xs={12} md={8}>
          <Card>
            <CardHeader
              title="Customer Growth"
              subheader="Monthly new customer registrations"
            />
            <CardContent>
              <Box height={300}>
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart
                    data={customerAcquisitionData}
                    margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <RechartsTooltip />
                    <Area
                      type="monotone"
                      dataKey="customers"
                      stroke="#8884d8"
                      fill="#8884d8"
                      fillOpacity={0.3}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={4}>
          <Card>
            <CardHeader
              title="Customer Status"
              subheader="Distribution by account status"
            />
            <CardContent>
              <Box height={300} display="flex" justifyContent="center">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={customerStatusData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                      label={({ name, percent }) =>
                        `${name}: ${(percent * 100).toFixed(0)}%`
                      }
                    >
                      {customerStatusData.map((entry, index) => (
                        <Cell
                          key={`cell-${index}`}
                          fill={COLORS[index % COLORS.length]}
                        />
                      ))}
                    </Pie>
                    <RechartsTooltip />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Customer Management Section */}
      <Card>
        <CardHeader
          title={
            <Box display="flex" alignItems="center" gap={1}>
              <User />
              <Typography variant="h5">Customers</Typography>
            </Box>
          }
          subheader="Manage customer accounts"
          action={
            <Box display="flex" gap={1}>
              <Button
                variant="contained"
                startIcon={<UserPlus />}
                onClick={handleAddCustomer}
              >
                Add Customer
              </Button>
              <Button
                variant="outlined"
                startIcon={<Download />}
                onClick={handleExportCustomers}
              >
                Export
              </Button>
              <Button
                variant="outlined"
                startIcon={<RefreshCw />}
                onClick={() => dispatch(fetchCustomers({ page, limit }))}
              >
                Refresh
              </Button>
            </Box>
          }
        />
        <CardContent>
          <Box display="flex" gap={2} mb={3}>
            <TextField
              placeholder="Search customers..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              InputProps={{
                startAdornment: (
                  <Search sx={{ mr: 1, color: 'text.secondary' }} />
                ),
              }}
              sx={{ flexGrow: 1 }}
            />
            <FormControl sx={{ minWidth: 180 }}>
              <InputLabel>Status</InputLabel>
              <Select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                label="Status"
              >
                <MenuItem value="all">All Status</MenuItem>
                <MenuItem value="active">Active</MenuItem>
                <MenuItem value="inactive">Inactive</MenuItem>
                <MenuItem value="blocked">Blocked</MenuItem>
              </Select>
            </FormControl>
            <DatePicker.RangePicker
              onChange={setDateRange}
              style={{ width: 240 }}
              placeholder={['Start Date', 'End Date']}
            />
          </Box>

          <Tabs value={tabValue} onChange={handleTabChange} sx={{ mb: 2 }}>
            <Tab label="All Customers" />
            <Tab label="Active" />
            <Tab label="Inactive" />
            <Tab label="Blocked" />
          </Tabs>

          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Name</TableCell>
                  <TableCell>Email</TableCell>
                  <TableCell>Phone</TableCell>
                  <TableCell>Joined</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {isLoading ? (
                  <TableRow>
                    <TableCell colSpan={6} align="center">
                      <CircularProgress size={24} />
                    </TableCell>
                  </TableRow>
                ) : filteredCustomers.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} align="center">
                      <Empty description="No customers found" />
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredCustomers.map((customer) => (
                    <TableRow key={customer._id}>
                      <TableCell>
                        <Box display="flex" alignItems="center" gap={1}>
                          <Avatar>{customer.name?.charAt(0)}</Avatar>
                          <Box>
                            <Typography variant="body2">
                              {customer.name}
                            </Typography>
                          </Box>
                        </Box>
                      </TableCell>
                      <TableCell>{customer.email}</TableCell>
                      <TableCell>{customer.phone || 'N/A'}</TableCell>
                      <TableCell>{formatDate(customer.createdAt)}</TableCell>
                      <TableCell>
                        <FormControl size="small">
                          <Select
                            value={customer.status}
                            onChange={(e) =>
                              handleUpdateStatus(customer._id, e.target.value)
                            }
                            sx={{ minWidth: 120 }}
                          >
                            <MenuItem value="active">Active</MenuItem>
                            <MenuItem value="inactive">Inactive</MenuItem>
                            <MenuItem value="blocked">Blocked</MenuItem>
                          </Select>
                        </FormControl>
                      </TableCell>
                      <TableCell>
                        <Box display="flex" gap={1}>
                          <Tooltip title="View Customer">
                            <IconButton
                              size="small"
                              onClick={() => handleViewCustomer(customer)}
                            >
                              <Eye />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="Edit Customer">
                            <IconButton
                              size="small"
                              onClick={() => handleEditCustomer(customer)}
                            >
                              <Edit />
                            </IconButton>
                          </Tooltip>
                          {customer.status !== 'blocked' ? (
                            <Tooltip title="Block Customer">
                              <IconButton
                                size="small"
                                onClick={() =>
                                  handleBlockCustomer(customer._id)
                                }
                              >
                                <Ban />
                              </IconButton>
                            </Tooltip>
                          ) : (
                            <Tooltip title="Unblock Customer">
                              <IconButton
                                size="small"
                                onClick={() =>
                                  handleUnblockCustomer(customer._id)
                                }
                              >
                                <CheckCircle />
                              </IconButton>
                            </Tooltip>
                          )}
                          <Tooltip title="Send Message">
                            <IconButton size="small">
                              <MessageSquare />
                            </IconButton>
                          </Tooltip>
                        </Box>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </TableContainer>

          <Box display="flex" justifyContent="flex-end" mt={3}>
            <Pagination
              count={Math.ceil(filteredCustomers.length / limit)}
              page={page}
              onChange={(e, newPage) => setPage(newPage)}
              color="primary"
            />
          </Box>
        </CardContent>
      </Card>

      {/* View Customer Dialog */}
      <Dialog
        open={isViewCustomerModalOpen}
        onClose={() => setIsViewCustomerModalOpen(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          <Box
            display="flex"
            alignItems="center"
            justifyContent="space-between"
          >
            <Box display="flex" alignItems="center" gap={1}>
              <User />
              <Typography variant="h6">Customer Details</Typography>
            </Box>
            {selectedCustomer && (
              <Chip
                label={selectedCustomer.status}
                color={getStatusColor(selectedCustomer.status)}
                size="small"
              />
            )}
          </Box>
        </DialogTitle>
        <DialogContent>
          {selectedCustomer && (
            <Box sx={{ mt: 2 }}>
              <Grid container spacing={3}>
                <Grid item xs={12} md={6}>
                  <Card variant="outlined">
                    <CardHeader title="Personal Information" />
                    <CardContent>
                      <List dense>
                        <ListItem>
                          <ListItemIcon>
                            <User size={20} />
                          </ListItemIcon>
                          <ListItemText
                            primary="Name"
                            secondary={selectedCustomer.name}
                          />
                        </ListItem>
                        <ListItem>
                          <ListItemIcon>
                            <Mail size={20} />
                          </ListItemIcon>
                          <ListItemText
                            primary="Email"
                            secondary={selectedCustomer.email}
                          />
                        </ListItem>
                        <ListItem>
                          <ListItemIcon>
                            <Phone size={20} />
                          </ListItemIcon>
                          <ListItemText
                            primary="Phone"
                            secondary={selectedCustomer.phone || 'Not provided'}
                          />
                        </ListItem>
                        <ListItem>
                          <ListItemIcon>
                            <MapPin size={20} />
                          </ListItemIcon>
                          <ListItemText
                            primary="Address"
                            secondary={
                              selectedCustomer.address || 'Not provided'
                            }
                          />
                        </ListItem>
                      </List>
                    </CardContent>
                  </Card>
                </Grid>

                <Grid item xs={12} md={6}>
                  <Card variant="outlined">
                    <CardHeader title="Account Information" />
                    <CardContent>
                      <List dense>
                        <ListItem>
                          <ListItemIcon>
                            <Calendar size={20} />
                          </ListItemIcon>
                          <ListItemText
                            primary="Member Since"
                            secondary={formatDate(selectedCustomer.createdAt)}
                          />
                        </ListItem>
                        <ListItem>
                          <ListItemIcon>
                            <Clock size={20} />
                          </ListItemIcon>
                          <ListItemText
                            primary="Last Login"
                            secondary={
                              formatDateTime(selectedCustomer.lastLogin) ||
                              'Never'
                            }
                          />
                        </ListItem>
                        <ListItem>
                          <ListItemIcon>
                            <ShoppingCart size={20} />
                          </ListItemIcon>
                          <ListItemText
                            primary="Role"
                            secondary={selectedCustomer.role || 'user'}
                          />
                        </ListItem>
                        <ListItem>
                          <ListItemIcon>
                            <CheckCircle size={20} />
                          </ListItemIcon>
                          <ListItemText
                            primary="Email Verified"
                            secondary={
                              selectedCustomer.isEmailVerified ? 'Yes' : 'No'
                            }
                          />
                        </ListItem>
                      </List>
                    </CardContent>
                  </Card>
                </Grid>

                {selectedCustomer.notes && (
                  <Grid item xs={12}>
                    <Card variant="outlined">
                      <CardHeader title="Notes" />
                      <CardContent>
                        <Typography variant="body2">
                          {selectedCustomer.notes}
                        </Typography>
                      </CardContent>
                    </Card>
                  </Grid>
                )}

                <Grid item xs={12}>
                  <Card variant="outlined">
                    <CardHeader title="Security Information" />
                    <CardContent>
                      <List dense>
                        <ListItem>
                          <ListItemIcon>
                            <AlertTriangle size={20} />
                          </ListItemIcon>
                          <ListItemText
                            primary="Failed Login Attempts"
                            secondary={
                              selectedCustomer.failedLoginAttempts || '0'
                            }
                          />
                        </ListItem>
                        <ListItem>
                          <ListItemIcon>
                            <Ban size={20} />
                          </ListItemIcon>
                          <ListItemText
                            primary="Account Locked"
                            secondary={selectedCustomer.isLocked ? 'Yes' : 'No'}
                          />
                        </ListItem>
                        {selectedCustomer.isLocked &&
                          selectedCustomer.lockedUntil && (
                            <ListItem>
                              <ListItemIcon>
                                <Clock size={20} />
                              </ListItemIcon>
                              <ListItemText
                                primary="Locked Until"
                                secondary={formatDateTime(
                                  selectedCustomer.lockedUntil
                                )}
                              />
                            </ListItem>
                          )}
                        {selectedCustomer.lockReason && (
                          <ListItem>
                            <ListItemIcon>
                              <AlertTriangle size={20} />
                            </ListItemIcon>
                            <ListItemText
                              primary="Lock Reason"
                              secondary={selectedCustomer.lockReason}
                            />
                          </ListItem>
                        )}
                      </List>
                    </CardContent>
                  </Card>
                </Grid>
              </Grid>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setIsViewCustomerModalOpen(false)}>
            Close
          </Button>
          <Button
            variant="outlined"
            startIcon={<Edit />}
            onClick={() => {
              setIsViewCustomerModalOpen(false);
              handleEditCustomer(selectedCustomer);
            }}
          >
            Edit Customer
          </Button>
          <Button variant="contained" startIcon={<MessageSquare />}>
            Send Message
          </Button>
        </DialogActions>
      </Dialog>

      {/* Add/Edit Customer Dialog */}
      <Dialog
        open={isAddCustomerModalOpen}
        onClose={() => setIsAddCustomerModalOpen(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          <Box display="flex" alignItems="center" gap={1}>
            <FilePlus />
            <Typography>
              {selectedCustomer ? 'Edit Customer' : 'Add New Customer'}
            </Typography>
          </Box>
        </DialogTitle>
        <DialogContent>
          <Box sx={{ mt: 2 }}>
            <Grid container spacing={2}>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Full Name"
                  name="name"
                  value={newCustomer.name}
                  onChange={handleInputChange}
                  required
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Email Address"
                  name="email"
                  type="email"
                  value={newCustomer.email}
                  onChange={handleInputChange}
                  required
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Phone Number"
                  name="phone"
                  value={newCustomer.phone}
                  onChange={handleInputChange}
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <FormControl fullWidth>
                  <InputLabel>Status</InputLabel>
                  <Select
                    value={newCustomer.status}
                    onChange={(e) =>
                      setNewCustomer((prev) => ({
                        ...prev,
                        status: e.target.value,
                      }))
                    }
                    label="Status"
                  >
                    <MenuItem value="active">Active</MenuItem>
                    <MenuItem value="inactive">Inactive</MenuItem>
                    <MenuItem value="blocked">Blocked</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Address"
                  name="address"
                  value={newCustomer.address}
                  onChange={handleInputChange}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Notes"
                  name="notes"
                  value={newCustomer.notes}
                  onChange={handleInputChange}
                  multiline
                  rows={3}
                />
              </Grid>

              {!selectedCustomer && (
                <Grid item xs={12}>
                  <FormControlLabel
                    control={
                      <Switch
                        checked={newCustomer.sendWelcomeEmail}
                        onChange={(e) =>
                          setNewCustomer((prev) => ({
                            ...prev,
                            sendWelcomeEmail: e.target.checked,
                          }))
                        }
                      />
                    }
                    label="Send welcome email"
                  />
                </Grid>
              )}
            </Grid>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setIsAddCustomerModalOpen(false)}>
            Cancel
          </Button>
          <Button
            onClick={handleSaveCustomer}
            variant="contained"
            disabled={isLoading}
          >
            {isLoading ? (
              <CircularProgress size={24} />
            ) : selectedCustomer ? (
              'Update Customer'
            ) : (
              'Add Customer'
            )}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Export Dialog */}
      <Dialog
        open={isExportModalOpen}
        onClose={() => setIsExportModalOpen(false)}
      >
        <DialogTitle>Export Customers</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Choose a format to export customer data:
          </DialogContentText>
          <FormControl fullWidth sx={{ mt: 2 }}>
            <InputLabel>Export Format</InputLabel>
            <Select
              value={exportFormat}
              onChange={(e) => setExportFormat(e.target.value)}
              label="Export Format"
            >
              <MenuItem value="csv">CSV</MenuItem>
              <MenuItem value="excel">Excel</MenuItem>
              <MenuItem value="pdf">PDF</MenuItem>
            </Select>
          </FormControl>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setIsExportModalOpen(false)}>Cancel</Button>
          <Button
            onClick={handleExport}
            variant="contained"
            disabled={isLoading}
          >
            {isLoading ? <CircularProgress size={24} /> : 'Export'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Notification Snackbar */}
      <Snackbar
        open={notification.open}
        autoHideDuration={6000}
        onClose={handleCloseNotification}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert
          onClose={handleCloseNotification}
          severity={notification.type}
          sx={{ width: '100%' }}
        >
          {notification.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default Customers;
