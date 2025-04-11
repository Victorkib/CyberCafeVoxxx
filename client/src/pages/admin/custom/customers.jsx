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
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Avatar,
  Tooltip,
  Snackbar,
  Alert,
  Chip,
  IconButton,
  Box,
  Tab,
  Tabs,
  CircularProgress,
  Divider,
} from '@mui/material';
import {
  Table,
  Input,
  Select,
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
import { Card, CardContent } from '../../../components/ui/card';
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
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-2xl font-bold text-gray-900 dark:text-white flex items-center">
                <User className="mr-2 h-6 w-6 text-blue-600 dark:text-blue-400" />
                Customers
              </CardTitle>
              <CardDescription className="text-gray-500 dark:text-gray-400">
                Manage customer accounts
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex items-center space-x-4 mb-6">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search customers..."
                  value={searchTerm}
                  onChange={handleSearch}
                  className="pl-10"
                />
              </div>
            </div>
            <Select value={statusFilter} onValueChange={handleStatusFilter}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="inactive">Inactive</SelectItem>
                <SelectItem value="blocked">Blocked</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Phone</TableHead>
                  <TableHead>Orders</TableHead>
                  <TableHead>Total Spent</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredCustomers.map((customer) => (
                  <TableRow key={customer._id}>
                    <TableCell className="font-medium">{customer.name}</TableCell>
                    <TableCell>{customer.email}</TableCell>
                    <TableCell>{customer.phone}</TableCell>
                    <TableCell>{customer.orderCount}</TableCell>
                    <TableCell>${customer.totalSpent.toFixed(2)}</TableCell>
                    <TableCell>
                      <Select
                        value={customer.status}
                        onValueChange={(value) => handleUpdateStatus(customer._id, value)}
                      >
                        <SelectTrigger className={`w-[130px] ${getStatusColor(customer.status)}`}>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="active">Active</SelectItem>
                          <SelectItem value="inactive">Inactive</SelectItem>
                          <SelectItem value="blocked">Blocked</SelectItem>
                        </SelectContent>
                      </Select>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleViewCustomer(customer)}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        {customer.status !== 'blocked' ? (
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleBlockCustomer(customer._id)}
                          >
                            <Ban className="h-4 w-4 text-red-500" />
                          </Button>
                        ) : (
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleUnblockCustomer(customer._id)}
                          >
                            <CheckCircle className="h-4 w-4 text-green-500" />
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* View Customer Dialog */}
      <Dialog open={isViewCustomerModalOpen} onOpenChange={setIsViewCustomerModalOpen}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>Customer Details</DialogTitle>
            <DialogDescription>
              View customer information and order history
            </DialogDescription>
          </DialogHeader>
          {selectedCustomer && (
            <div className="space-y-6">
              {/* Customer Information */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h3 className="font-medium mb-2">Personal Information</h3>
                  <div className="space-y-1 text-sm">
                    <p>
                      <span className="font-medium">Name:</span>{' '}
                      {selectedCustomer.name}
                    </p>
                    <p>
                      <span className="font-medium">Email:</span>{' '}
                      {selectedCustomer.email}
                    </p>
                    <p>
                      <span className="font-medium">Phone:</span>{' '}
                      {selectedCustomer.phone}
                    </p>
                    <p>
                      <span className="font-medium">Status:</span>{' '}
                      <span className={getStatusColor(selectedCustomer.status)}>
                        {selectedCustomer.status}
                      </span>
                    </p>
                  </div>
                </div>
                <div>
                  <h3 className="font-medium mb-2">Account Statistics</h3>
                  <div className="space-y-1 text-sm">
                    <p>
                      <span className="font-medium">Total Orders:</span>{' '}
                      {selectedCustomer.orderCount}
                    </p>
                    <p>
                      <span className="font-medium">Total Spent:</span>{' '}
                      ${selectedCustomer.totalSpent.toFixed(2)}
                    </p>
                    <p>
                      <span className="font-medium">Member Since:</span>{' '}
                      {new Date(selectedCustomer.createdAt).toLocaleDateString()}
                    </p>
                    <p>
                      <span className="font-medium">Last Login:</span>{' '}
                      {new Date(selectedCustomer.lastLogin).toLocaleString()}
                    </p>
                  </div>
                </div>
              </div>

              {/* Shipping Addresses */}
              <div>
                <h3 className="font-medium mb-2">Shipping Addresses</h3>
                <div className="space-y-4">
                  {selectedCustomer.addresses.map((address, index) => (
                    <div
                      key={index}
                      className="p-4 border rounded-lg space-y-1 text-sm"
                    >
                      <p>
                        <span className="font-medium">Address {index + 1}:</span>{' '}
                        {address.street}, {address.city}, {address.state}{' '}
                        {address.zipCode}
                      </p>
                      <p>
                        <span className="font-medium">Country:</span>{' '}
                        {address.country}
                      </p>
                      {address.isDefault && (
                        <p className="text-green-600 dark:text-green-400">
                          Default Address
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Recent Orders */}
              <div>
                <h3 className="font-medium mb-2">Recent Orders</h3>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Order #</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead>Total</TableHead>
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {selectedCustomer.recentOrders.map((order) => (
                      <TableRow key={order._id}>
                        <TableCell className="font-medium">
                          {order.orderNumber}
                        </TableCell>
                        <TableCell>
                          {new Date(order.createdAt).toLocaleDateString()}
                        </TableCell>
                        <TableCell>${order.total.toFixed(2)}</TableCell>
                        <TableCell>
                          <span className={getStatusColor(order.status)}>
                            {order.status}
                          </span>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsViewCustomerModalOpen(false)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Add/Edit Customer Modal */}
      <Dialog
        open={isAddCustomerModalOpen}
        onClose={() => setIsAddCustomerModalOpen(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          <div className="flex items-center">
            <FilePlus className="h-5 w-5 text-blue-600 dark:text-blue-400 mr-2" />
            <span>
              {selectedCustomer ? 'Edit Customer' : 'Add New Customer'}
            </span>
          </div>
        </DialogTitle>
        <DialogContent>
          <div className="space-y-4 mt-2">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <TextField
                label="Full Name"
                name="name"
                value={newCustomer.name}
                onChange={handleInputChange}
                fullWidth
                required
                variant="outlined"
                placeholder="John Doe"
              />
              <TextField
                label="Email Address"
                name="email"
                value={newCustomer.email}
                onChange={handleInputChange}
                fullWidth
                required
                variant="outlined"
                placeholder="john.doe@example.com"
                type="email"
              />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <TextField
                label="Phone Number"
                name="phone"
                value={newCustomer.phone}
                onChange={handleInputChange}
                fullWidth
                variant="outlined"
                placeholder="(555) 123-4567"
              />
              <Select
                placeholder="Status"
                style={{ width: '100%' }}
                value={newCustomer.status}
                onChange={(value) =>
                  setNewCustomer((prev) => ({ ...prev, status: value }))
                }
                options={[
                  { value: 'Active', label: 'Active' },
                  { value: 'Inactive', label: 'Inactive' },
                ]}
              />
            </div>
            <TextField
              label="Address"
              name="address"
              value={newCustomer.address}
              onChange={handleInputChange}
              fullWidth
              variant="outlined"
              placeholder="123 Main St, New York, NY 10001"
              multiline
              rows={2}
            />
            <div>
              <p className="text-sm text-gray-700 dark:text-gray-300 mb-2">
                Tags
              </p>
              <Select
                mode="multiple"
                placeholder="Select tags"
                style={{ width: '100%' }}
                value={newCustomer.tags}
                onChange={handleTagChange}
                options={[
                  { value: 'New', label: 'New' },
                  { value: 'Loyal', label: 'Loyal' },
                  { value: 'High Value', label: 'High Value' },
                  { value: 'Repeat', label: 'Repeat' },
                  { value: 'VIP', label: 'VIP' },
                ]}
              />
            </div>
            <TextField
              label="Notes"
              name="notes"
              value={newCustomer.notes}
              onChange={handleInputChange}
              fullWidth
              variant="outlined"
              placeholder="Add any notes about this customer"
              multiline
              rows={3}
            />
          </div>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setIsAddCustomerModalOpen(false)}>
            Cancel
          </Button>
          <Button
            variant="contained"
            className="bg-blue-600 hover:bg-blue-700 dark:bg-blue-600 dark:hover:bg-blue-700"
            onClick={handleSaveCustomer}
            disabled={loading}
          >
            {loading ? (
              <CircularProgress size={24} color="inherit" />
            ) : selectedCustomer ? (
              'Update Customer'
            ) : (
              'Add Customer'
            )}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Notification */}
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
    </div>
  );
};

export default Customers;
