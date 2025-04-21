'use client';

import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  Search,
  FilePlus,
  RefreshCw,
  Database,
  MessageSquare,
  Trash2,
  Edit,
  Eye,
  Filter,
  User,
  Mail,
  Phone,
  Calendar,
  CreditCard,
  MapPin,
  ShoppingCart,
  UserPlus,
  Zap,
  Award,
  Heart,
  Ban,
  CheckCircle,
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
} from '@mui/material';
import {
  Popconfirm,
  DatePicker,
  Timeline,
  Tag,
  Badge,
  Empty,
} from 'antd';
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
} from 'recharts';
import {
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../../../components/ui/select';
import {
  fetchCustomers,
  updateCustomerStatus,
  blockCustomer,
  unblockCustomer,
} from '../../../redux/slices/adminSlice';
import { toast } from 'react-hot-toast';

// Mock data
const mockCustomers = [
  {
    id: 1,
    name: 'John Doe',
    email: 'john.doe@example.com',
    phone: '(555) 123-4567',
    joined: '2024-12-10',
    orders: 5,
    spent: 249.95,
    status: 'Active',
    lastOrder: '2025-03-10',
    address: '123 Main St, New York, NY 10001',
    avatar: '/placeholder.svg?height=40&width=40',
    notes: 'Prefers email communication',
    tags: ['Loyal', 'High Value'],
  },
  {
    id: 2,
    name: 'Jane Smith',
    email: 'jane.smith@example.com',
    phone: '(555) 987-6543',
    joined: '2025-01-15',
    orders: 3,
    spent: 189.97,
    status: 'Active',
    lastOrder: '2025-03-05',
    address: '456 Oak Ave, Chicago, IL 60611',
    avatar: '/placeholder.svg?height=40&width=40',
    notes: '',
    tags: ['New'],
  },
  {
    id: 3,
    name: 'Robert Johnson',
    email: 'robert.j@example.com',
    phone: '(555) 456-7890',
    joined: '2025-02-05',
    orders: 2,
    spent: 99.98,
    status: 'Active',
    lastOrder: '2025-02-28',
    address: '789 Pine Blvd, Los Angeles, CA 90001',
    avatar: '/placeholder.svg?height=40&width=40',
    notes: 'Interested in office supplies',
    tags: ['New'],
  },
  {
    id: 4,
    name: 'Emily Davis',
    email: 'emily.d@example.com',
    phone: '(555) 234-5678',
    joined: '2025-02-20',
    orders: 4,
    spent: 159.96,
    status: 'Active',
    lastOrder: '2025-03-12',
    address: '321 Maple Dr, Houston, TX 77001',
    avatar: '/placeholder.svg?height=40&width=40',
    notes: '',
    tags: ['Repeat'],
  },
  {
    id: 5,
    name: 'Michael Wilson',
    email: 'michael.w@example.com',
    phone: '(555) 876-5432',
    joined: '2025-03-01',
    orders: 1,
    spent: 179.98,
    status: 'Inactive',
    lastOrder: '2025-03-01',
    address: '654 Cedar St, Phoenix, AZ 85001',
    avatar: '/placeholder.svg?height=40&width=40',
    notes: 'Requested product catalog',
    tags: ['New'],
  },
];

// Date formatter
const formatDate = (dateString) => {
  const options = { year: 'numeric', month: 'short', day: 'numeric' };
  return new Date(dateString).toLocaleDateString(undefined, options);
};

// Status color helper
const getStatusColor = (status) => {
  switch (status.toLowerCase()) {
    case 'active':
      return 'text-green-600 dark:text-green-400';
    case 'inactive':
      return 'text-gray-600 dark:text-gray-400';
    case 'blocked':
      return 'text-red-600 dark:text-red-400';
    default:
      return 'text-gray-600 dark:text-gray-400';
  }
};

const Customers = () => {
  const dispatch = useDispatch();
  const { customers, loading } = useSelector((state) => state.admin);
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
  const [bulkSelected, setBulkSelected] = useState([]);
  const [newCustomer, setNewCustomer] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
    status: 'Active',
    tags: ['New'],
    notes: '',
  });

  useEffect(() => {
    dispatch(fetchCustomers());
  }, [dispatch]);

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
      status: 'Active',
      tags: ['New'],
      notes: '',
    });
    setIsAddCustomerModalOpen(true);
  };

  const handleEditCustomer = (customer) => {
    setSelectedCustomer(customer);
    setNewCustomer({
      name: customer.name,
      email: customer.email,
      phone: customer.phone,
      address: customer.address,
      status: customer.status,
      tags: [...customer.tags],
      notes: customer.notes,
    });
    setIsAddCustomerModalOpen(true);
  };

  const handleViewCustomer = (customer) => {
    setSelectedCustomer(customer);
    setIsViewCustomerModalOpen(true);
  };

  const handleDeleteCustomer = (customerId) => {
    // Simulate API call
    setTimeout(() => {
      const updatedCustomers = customers.filter(
        (customer) => customer.id !== customerId
      );
      dispatch(fetchCustomers(updatedCustomers));
      setNotification({
        open: true,
        message: 'Customer deleted successfully',
        type: 'success',
      });
    }, 1000);
  };

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);

    if (newValue === 0) {
      setStatusFilter('all');
    } else if (newValue === 1) {
      setStatusFilter('Active');
    } else if (newValue === 2) {
      setStatusFilter('Inactive');
    }
  };

  const handleBulkSelect = (selectedRowKeys) => {
    setBulkSelected(selectedRowKeys);
  };

  const handleBulkDelete = () => {
    if (bulkSelected.length === 0) return;

    setTimeout(() => {
      const updatedCustomers = customers.filter(
        (customer) => !bulkSelected.includes(customer.id)
      );
      dispatch(fetchCustomers(updatedCustomers));
      setBulkSelected([]);
      setNotification({
        open: true,
        message: `${bulkSelected.length} customers deleted successfully`,
        type: 'success',
      });
    }, 1000);
  };

  const handleSaveCustomer = () => {
    if (!newCustomer.name || !newCustomer.email) {
      setNotification({
        open: true,
        message: 'Name and email are required',
        type: 'error',
      });
      return;
    }

    setTimeout(() => {
      let updatedCustomers;

      if (selectedCustomer) {
        // Edit existing customer
        updatedCustomers = customers.map((customer) =>
          customer.id === selectedCustomer.id
            ? {
                ...customer,
                name: newCustomer.name,
                email: newCustomer.email,
                phone: newCustomer.phone,
                address: newCustomer.address,
                status: newCustomer.status,
                tags: newCustomer.tags,
                notes: newCustomer.notes,
              }
            : customer
        );
        dispatch(fetchCustomers(updatedCustomers));
        setNotification({
          open: true,
          message: 'Customer updated successfully',
          type: 'success',
        });
      } else {
        // Add new customer
        const newId = Math.max(...customers.map((c) => c.id)) + 1;
        const today = new Date().toISOString().split('T')[0];

        const customerToAdd = {
          id: newId,
          name: newCustomer.name,
          email: newCustomer.email,
          phone: newCustomer.phone,
          address: newCustomer.address,
          status: newCustomer.status,
          tags: newCustomer.tags,
          notes: newCustomer.notes,
          joined: today,
          orders: 0,
          spent: 0,
          lastOrder: null,
          avatar: '/placeholder.svg?height=40&width=40',
        };

        updatedCustomers = [...customers, customerToAdd];
        dispatch(fetchCustomers(updatedCustomers));
        setNotification({
          open: true,
          message: 'Customer added successfully',
          type: 'success',
        });
      }

      setIsAddCustomerModalOpen(false);
    }, 1000);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewCustomer((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleTagChange = (value) => {
    setNewCustomer((prev) => ({
      ...prev,
      tags: value,
    }));
  };

  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
  };

  const handleStatusFilter = (value) => {
    setStatusFilter(value);
  };

  const handleUpdateStatus = async (customerId, status) => {
    try {
      await dispatch(updateCustomerStatus({ id: customerId, status })).unwrap();
      toast.success('Customer status updated successfully');
    } catch (error) {
      toast.error(error.message || 'Failed to update customer status');
    }
  };

  const handleBlockCustomer = async (customerId) => {
    if (window.confirm('Are you sure you want to block this customer?')) {
      try {
        await dispatch(blockCustomer(customerId)).unwrap();
        toast.success('Customer blocked successfully');
      } catch (error) {
        toast.error(error.message || 'Failed to block customer');
      }
    }
  };

  const handleUnblockCustomer = async (customerId) => {
    if (window.confirm('Are you sure you want to unblock this customer?')) {
      try {
        await dispatch(unblockCustomer(customerId)).unwrap();
        toast.success('Customer unblocked successfully');
      } catch (error) {
        toast.error(error.message || 'Failed to unblock customer');
      }
    }
  };

  const filteredCustomers = customers.filter((customer) => {
    const matchesSearch =
      customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      customer.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      customer.phone.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || customer.status === statusFilter;
    let matchesDateRange = true;
    if (dateRange && dateRange[0] && dateRange[1]) {
      const joinedDate = new Date(customer.joined);
      const startDate = new Date(dateRange[0]);
      const endDate = new Date(dateRange[1]);
      matchesDateRange = joinedDate >= startDate && joinedDate <= endDate;
    }
    return matchesSearch && matchesStatus && matchesDateRange;
  });

  // Customer analytics data
  const customerAcquisitionData = [
    { month: 'Oct', customers: 120 },
    { month: 'Nov', customers: 145 },
    { month: 'Dec', customers: 190 },
    { month: 'Jan', customers: 220 },
    { month: 'Feb', customers: 250 },
    { month: 'Mar', customers: 275 },
  ];

  const customerRetentionData = [
    { category: 'One-time', count: 120 },
    { category: '2-3 orders', count: 85 },
    { category: '4-6 orders', count: 55 },
    { category: '7+ orders', count: 40 },
  ];

  const customerSpendingData = [
    { name: '$0-$50', value: 30 },
    { name: '$51-$100', value: 25 },
    { name: '$101-$200', value: 20 },
    { name: '$201-$500', value: 15 },
    { name: '$500+', value: 10 },
  ];

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'];

  const columns = [
    {
      title: 'Customer',
      dataIndex: 'name',
      key: 'name',
      render: (text, record) => (
        <div className="flex items-center">
          <Avatar src={record.avatar} alt={text} className="mr-2">
            {text.charAt(0)}
          </Avatar>
          <div>
            <p className="text-sm font-medium text-gray-900 dark:text-white">
              {text}
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              {record.email}
            </p>
          </div>
        </div>
      ),
    },
    {
      title: 'Joined',
      dataIndex: 'joined',
      key: 'joined',
      render: (text) => (
        <span className="text-sm text-gray-700 dark:text-gray-300">
          {formatDate(text)}
        </span>
      ),
    },
    {
      title: 'Orders',
      dataIndex: 'orders',
      key: 'orders',
      render: (text) => <Badge count={text} className="site-badge-count-4" />,
    },
    {
      title: 'Spent',
      dataIndex: 'spent',
      key: 'spent',
      render: (text) => (
        <span className="text-sm font-medium text-gray-900 dark:text-white">
          ${text.toFixed(2)}
        </span>
      ),
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (text) => (
        <span
          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
            text === 'Active'
              ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
              : 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400'
          }`}
        >
          {text}
        </span>
      ),
    },
    {
      title: 'Tags',
      dataIndex: 'tags',
      key: 'tags',
      render: (tags) => (
        <div className="flex flex-wrap gap-1">
          {tags.map((tag) => (
            <Tag
              key={tag}
              color={
                tag === 'Loyal'
                  ? 'blue'
                  : tag === 'High Value'
                  ? 'gold'
                  : tag === 'New'
                  ? 'green'
                  : tag === 'Repeat'
                  ? 'purple'
                  : 'default'
              }
            >
              {tag}
            </Tag>
          ))}
        </div>
      ),
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_, record) => (
        <div className="flex space-x-1">
          <Tooltip title="View Customer">
            <IconButton
              size="small"
              className="text-blue-600 dark:text-blue-400"
              onClick={() => handleViewCustomer(record)}
            >
              <Eye className="h-4 w-4" />
            </IconButton>
          </Tooltip>
          <Tooltip title="Edit Customer">
            <IconButton
              size="small"
              className="text-green-600 dark:text-green-400"
              onClick={() => handleEditCustomer(record)}
            >
              <Edit className="h-4 w-4" />
            </IconButton>
          </Tooltip>
          <Popconfirm
            title="Are you sure you want to delete this customer?"
            onConfirm={() => handleDeleteCustomer(record.id)}
            okText="Yes"
            cancelText="No"
          >
            <Tooltip title="Delete Customer">
              <IconButton
                size="small"
                className="text-red-600 dark:text-red-400"
              >
                <Trash2 className="h-4 w-4" />
              </IconButton>
            </Tooltip>
          </Popconfirm>
          <Tooltip title="Send Message">
            <IconButton
              size="small"
              className="text-purple-600 dark:text-purple-400"
            >
              <MessageSquare className="h-4 w-4" />
            </IconButton>
          </Tooltip>
        </div>
      ),
    },
  ];

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      <Card>
        <CardHeader
          title={
            <Box display="flex" alignItems="center" gap={1}>
              <User />
              <Typography variant="h5">Customers</Typography>
            </Box>
          }
          subheader="Manage customer accounts"
        />
        <CardContent>
          <Box display="flex" gap={2} mb={3}>
            <TextField
                  placeholder="Search customers..."
                  value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              InputProps={{
                startAdornment: <Search sx={{ mr: 1, color: 'text.secondary' }} />,
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
          </Box>

          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Name</TableCell>
                  <TableCell>Email</TableCell>
                  <TableCell>Phone</TableCell>
                  <TableCell>Orders</TableCell>
                  <TableCell>Total Spent</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredCustomers.map((customer) => (
                  <TableRow key={customer._id}>
                    <TableCell>
                      <Box display="flex" alignItems="center" gap={1}>
                        <Avatar src={customer.avatar}>
                          {customer.name.charAt(0)}
                        </Avatar>
                        <Box>
                          <Typography variant="body2">{customer.name}</Typography>
                          <Typography variant="caption" color="text.secondary">
                            {customer.email}
                          </Typography>
                        </Box>
                      </Box>
                    </TableCell>
                    <TableCell>{customer.email}</TableCell>
                    <TableCell>{customer.phone}</TableCell>
                    <TableCell>{customer.orderCount}</TableCell>
                    <TableCell>${customer.totalSpent.toFixed(2)}</TableCell>
                    <TableCell>
                      <FormControl size="small">
                      <Select
                        value={customer.status}
                          onChange={(e) => handleUpdateStatus(customer._id, e.target.value)}
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
                        {customer.status !== 'blocked' ? (
                          <Tooltip title="Block Customer">
                            <IconButton
                              size="small"
                            onClick={() => handleBlockCustomer(customer._id)}
                          >
                              <Ban />
                            </IconButton>
                          </Tooltip>
                        ) : (
                          <Tooltip title="Unblock Customer">
                            <IconButton
                              size="small"
                            onClick={() => handleUnblockCustomer(customer._id)}
                          >
                              <CheckCircle />
                            </IconButton>
                          </Tooltip>
                        )}
                      </Box>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </CardContent>
      </Card>

      {/* View Customer Dialog */}
      <Dialog
        open={isViewCustomerModalOpen}
        onClose={() => setIsViewCustomerModalOpen(false)}
        maxWidth="md"
        fullWidth
      >
            <DialogTitle>Customer Details</DialogTitle>
        <DialogContent>
          {selectedCustomer && (
            <Box sx={{ mt: 2 }}>
              <Grid container spacing={3}>
                <Grid item xs={12} md={6}>
                  <Typography variant="h6" gutterBottom>
                    Personal Information
                  </Typography>
                  <Box sx={{ mb: 2 }}>
                    <Typography variant="body2">
                      <strong>Name:</strong> {selectedCustomer.name}
                    </Typography>
                    <Typography variant="body2">
                      <strong>Email:</strong> {selectedCustomer.email}
                    </Typography>
                    <Typography variant="body2">
                      <strong>Phone:</strong> {selectedCustomer.phone}
                    </Typography>
                    <Typography variant="body2">
                      <strong>Status:</strong>{' '}
                      <Chip
                        label={selectedCustomer.status}
                        color={
                          selectedCustomer.status === 'active'
                            ? 'success'
                            : selectedCustomer.status === 'blocked'
                            ? 'error'
                            : 'default'
                        }
                        size="small"
                      />
                    </Typography>
                  </Box>
                </Grid>
                <Grid item xs={12} md={6}>
                  <Typography variant="h6" gutterBottom>
                    Account Statistics
                  </Typography>
                  <Box sx={{ mb: 2 }}>
                    <Typography variant="body2">
                      <strong>Total Orders:</strong> {selectedCustomer.orderCount}
                    </Typography>
                    <Typography variant="body2">
                      <strong>Total Spent:</strong> ${selectedCustomer.totalSpent.toFixed(2)}
                    </Typography>
                    <Typography variant="body2">
                      <strong>Member Since:</strong>{' '}
                      {new Date(selectedCustomer.createdAt).toLocaleDateString()}
                    </Typography>
                    <Typography variant="body2">
                      <strong>Last Login:</strong>{' '}
                      {new Date(selectedCustomer.lastLogin).toLocaleString()}
                    </Typography>
                  </Box>
                </Grid>
              </Grid>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setIsViewCustomerModalOpen(false)}>Close</Button>
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
                      setNewCustomer((prev) => ({ ...prev, status: e.target.value }))
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
            </Grid>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setIsAddCustomerModalOpen(false)}>Cancel</Button>
          <Button
            onClick={handleSaveCustomer}
            variant="contained"
            disabled={loading}
          >
            {loading ? 'Saving...' : selectedCustomer ? 'Update Customer' : 'Add Customer'}
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
