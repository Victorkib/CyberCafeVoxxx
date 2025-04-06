'use client';

import { useState } from 'react';
import {
  ShoppingCart,
  Search,
  FilePlus,
  RefreshCw,
  Database,
  Layers,
  Truck,
  Clock,
  CheckCircle,
  X,
  Trash2,
  Edit,
  Eye,
  Download,
  Filter,
  CreditCard,
  Package,
  MapPin,
  User,
  Phone,
  Mail,
  BarChart2,
  TrendingUp,
  DollarSign,
  AlertTriangle,
} from 'lucide-react';
import {
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Tooltip,
  Snackbar,
  Alert,
  Chip,
  Avatar,
  IconButton,
  Divider,
  Box,
  Tab,
  Tabs,
  Badge as MuiBadge,
} from '@mui/material';
import {
  Table,
  Input,
  Select,
  Popconfirm,
  DatePicker,
  Timeline,
  Badge,
  Empty,
} from 'antd';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '../../../ui/card';

// Mock data
const mockOrders = [
  {
    id: '#ORD-001',
    customer: 'John Doe',
    email: 'john.doe@example.com',
    phone: '(555) 123-4567',
    date: '2025-03-15',
    total: 74.98,
    status: 'Delivered',
    items: 3,
    payment: 'Credit Card',
    address: '123 Main St, New York, NY 10001',
    tracking: 'TRK12345678',
    notes: 'Leave at the door',
  },
  {
    id: '#ORD-002',
    customer: 'Jane Smith',
    email: 'jane.smith@example.com',
    phone: '(555) 987-6543',
    date: '2025-03-16',
    total: 159.99,
    status: 'Processing',
    items: 2,
    payment: 'PayPal',
    address: '456 Oak Ave, Chicago, IL 60611',
    tracking: '',
    notes: '',
  },
  {
    id: '#ORD-003',
    customer: 'Robert Johnson',
    email: 'robert.j@example.com',
    phone: '(555) 456-7890',
    date: '2025-03-17',
    total: 45.99,
    status: 'Shipped',
    items: 1,
    payment: 'Credit Card',
    address: '789 Pine Blvd, Los Angeles, CA 90001',
    tracking: 'TRK87654321',
    notes: 'Call before delivery',
  },
  {
    id: '#ORD-004',
    customer: 'Emily Davis',
    email: 'emily.d@example.com',
    phone: '(555) 234-5678',
    date: '2025-03-17',
    total: 89.97,
    status: 'Pending',
    items: 4,
    payment: 'Bank Transfer',
    address: '321 Maple Dr, Houston, TX 77001',
    tracking: '',
    notes: '',
  },
  {
    id: '#ORD-005',
    customer: 'Michael Wilson',
    email: 'michael.w@example.com',
    phone: '(555) 876-5432',
    date: '2025-03-18',
    total: 179.98,
    status: 'Cancelled',
    items: 2,
    payment: 'Credit Card',
    address: '654 Cedar St, Phoenix, AZ 85001',
    tracking: '',
    notes: 'Customer requested cancellation',
  },
];

const orderStatuses = [
  'Pending',
  'Processing',
  'Shipped',
  'Delivered',
  'Cancelled',
];

// Status color mapper
const getStatusColor = (status) => {
  const statusColors = {
    Pending:
      'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400',
    Processing:
      'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400',
    Shipped:
      'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400',
    Delivered:
      'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
    Cancelled: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400',
  };
  return (
    statusColors[status] ||
    'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'
  );
};

// Status icon mapper
const getStatusIcon = (status) => {
  switch (status) {
    case 'Pending':
      return <Clock className="h-5 w-5" />;
    case 'Processing':
      return <RefreshCw className="h-5 w-5" />;
    case 'Shipped':
      return <Truck className="h-5 w-5" />;
    case 'Delivered':
      return <CheckCircle className="h-5 w-5" />;
    case 'Cancelled':
      return <X className="h-5 w-5" />;
    default:
      return <Clock className="h-5 w-5" />;
  }
};

// Date formatter
const formatDate = (dateString) => {
  const options = { year: 'numeric', month: 'short', day: 'numeric' };
  return new Date(dateString).toLocaleDateString(undefined, options);
};

// Orders Component
export const Orders = () => {
  const [orders, setOrders] = useState(mockOrders);
  const [loading, setLoading] = useState(false);
  const [notification, setNotification] = useState({
    open: false,
    message: '',
    type: 'success',
  });
  const [isViewOrderModalOpen, setIsViewOrderModalOpen] = useState(false);
  const [isEditOrderModalOpen, setIsEditOrderModalOpen] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [dateRange, setDateRange] = useState(null);
  const [tabValue, setTabValue] = useState(0);
  const [bulkSelected, setBulkSelected] = useState([]);

  const handleStatusChange = (orderId, newStatus) => {
    setLoading(true);
    // Simulate API call
    setTimeout(() => {
      const updatedOrders = orders.map((order) =>
        order.id === orderId ? { ...order, status: newStatus } : order
      );
      setOrders(updatedOrders);
      setLoading(false);
      setNotification({
        open: true,
        message: `Order ${orderId} status updated to ${newStatus}`,
        type: 'success',
      });
    }, 1000);
  };

  const handleCloseNotification = () => {
    setNotification({ ...notification, open: false });
  };

  const handleViewOrder = (order) => {
    setSelectedOrder(order);
    setIsViewOrderModalOpen(true);
  };

  const handleEditOrder = (order) => {
    setSelectedOrder(order);
    setIsEditOrderModalOpen(true);
  };

  const handleDeleteOrder = (orderId) => {
    setLoading(true);
    // Simulate API call
    setTimeout(() => {
      const updatedOrders = orders.filter((order) => order.id !== orderId);
      setOrders(updatedOrders);
      setLoading(false);
      setNotification({
        open: true,
        message: `Order ${orderId} deleted successfully`,
        type: 'success',
      });
    }, 1000);
  };

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);

    if (newValue === 0) {
      setSelectedStatus('all');
    } else {
      setSelectedStatus(orderStatuses[newValue - 1]);
    }
  };

  const handleBulkSelect = (selectedRowKeys) => {
    setBulkSelected(selectedRowKeys);
  };

  const handleBulkDelete = () => {
    if (bulkSelected.length === 0) return;

    setLoading(true);
    setTimeout(() => {
      const updatedOrders = orders.filter(
        (order) => !bulkSelected.includes(order.id)
      );
      setOrders(updatedOrders);
      setBulkSelected([]);
      setLoading(false);
      setNotification({
        open: true,
        message: `${bulkSelected.length} orders deleted successfully`,
        type: 'success',
      });
    }, 1000);
  };

  // Filter orders based on search, status, and date range
  const filteredOrders = orders.filter((order) => {
    const matchesSearch =
      order.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.customer.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus =
      selectedStatus === 'all' || order.status === selectedStatus;

    let matchesDateRange = true;
    if (dateRange && dateRange[0] && dateRange[1]) {
      const orderDate = new Date(order.date);
      const startDate = new Date(dateRange[0]);
      const endDate = new Date(dateRange[1]);
      matchesDateRange = orderDate >= startDate && orderDate <= endDate;
    }

    return matchesSearch && matchesStatus && matchesDateRange;
  });

  // Calculate status counts
  const statusCounts = orderStatuses.reduce((acc, status) => {
    acc[status] = orders.filter((order) => order.status === status).length;
    return acc;
  }, {});

  // Order analytics data
  const dailyOrdersData = [
    { date: '03/12', orders: 12, revenue: 1250 },
    { date: '03/13', orders: 15, revenue: 1680 },
    { date: '03/14', orders: 18, revenue: 2100 },
    { date: '03/15', orders: 14, revenue: 1450 },
    { date: '03/16', orders: 16, revenue: 1850 },
    { date: '03/17', orders: 19, revenue: 2300 },
    { date: '03/18', orders: 20, revenue: 2450 },
  ];

  const statusDistributionData = Object.entries(statusCounts).map(
    ([status, count]) => ({
      name: status,
      value: count,
      color:
        status === 'Pending'
          ? '#F59E0B'
          : status === 'Processing'
          ? '#3B82F6'
          : status === 'Shipped'
          ? '#8B5CF6'
          : status === 'Delivered'
          ? '#10B981'
          : '#EF4444',
    })
  );

  const columns = [
    {
      title: 'Order ID',
      dataIndex: 'id',
      key: 'id',
      render: (text) => (
        <span className="text-sm font-medium text-blue-600 dark:text-blue-400">
          {text}
        </span>
      ),
    },
    {
      title: 'Customer',
      dataIndex: 'customer',
      key: 'customer',
      render: (text, record) => (
        <div className="flex items-center">
          <Avatar className="mr-2 bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400">
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
      title: 'Date',
      dataIndex: 'date',
      key: 'date',
      render: (text) => (
        <span className="text-sm text-gray-700 dark:text-gray-300">
          {formatDate(text)}
        </span>
      ),
    },
    {
      title: 'Total',
      dataIndex: 'total',
      key: 'total',
      render: (text) => (
        <span className="text-sm font-medium text-gray-900 dark:text-white">
          ${text.toFixed(2)}
        </span>
      ),
    },
    {
      title: 'Items',
      dataIndex: 'items',
      key: 'items',
      render: (text) => <Badge count={text} className="site-badge-count-4" />,
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (text, record) => (
        <Select
          value={text}
          style={{ width: 130 }}
          onChange={(value) => handleStatusChange(record.id, value)}
          options={orderStatuses.map((status) => ({
            value: status,
            label: status,
          }))}
          className="status-select"
        />
      ),
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_, record) => (
        <div className="flex space-x-1">
          <Tooltip title="View Order">
            <IconButton
              size="small"
              className="text-blue-600 dark:text-blue-400"
              onClick={() => handleViewOrder(record)}
            >
              <Eye className="h-4 w-4" />
            </IconButton>
          </Tooltip>
          <Tooltip title="Edit Order">
            <IconButton
              size="small"
              className="text-green-600 dark:text-green-400"
              onClick={() => handleEditOrder(record)}
            >
              <Edit className="h-4 w-4" />
            </IconButton>
          </Tooltip>
          <Popconfirm
            title="Are you sure you want to delete this order?"
            onConfirm={() => handleDeleteOrder(record.id)}
            okText="Yes"
            cancelText="No"
          >
            <Tooltip title="Delete Order">
              <IconButton
                size="small"
                className="text-red-600 dark:text-red-400"
              >
                <Trash2 className="h-4 w-4" />
              </IconButton>
            </Tooltip>
          </Popconfirm>
          <Tooltip title="Download Invoice">
            <IconButton
              size="small"
              className="text-purple-600 dark:text-purple-400"
            >
              <Download className="h-4 w-4" />
            </IconButton>
          </Tooltip>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
            Orders
          </h2>
          <p className="text-gray-500 dark:text-gray-400">
            Manage and track all orders
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button
            variant="contained"
            className="bg-blue-600 hover:bg-blue-700 dark:bg-blue-600 dark:hover:bg-blue-700 shadow-sm"
            startIcon={<FilePlus className="h-5 w-5" />}
          >
            Create Order
          </Button>
          <Button
            variant="outlined"
            className="border-blue-600 text-blue-600 hover:bg-blue-50 dark:border-blue-400 dark:text-blue-400 dark:hover:bg-blue-900/20"
            startIcon={<RefreshCw className="h-5 w-5" />}
            onClick={() => {
              setLoading(true);
              setTimeout(() => setLoading(false), 1000);
            }}
          >
            Refresh
          </Button>
          <Button
            variant="outlined"
            className="border-gray-300 text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-800"
            startIcon={<Filter className="h-5 w-5" />}
          >
            Filters
          </Button>
        </div>
      </div>

      {/* Order Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        {orderStatuses.map((status) => (
          <Card
            key={status}
            className="bg-white dark:bg-gray-800 shadow-sm hover:shadow-md transition-shadow duration-200"
          >
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-3">
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center ${getStatusColor(
                    status
                  )}`}
                >
                  {getStatusIcon(status)}
                </div>
                <MuiBadge
                  badgeContent={statusCounts[status] || 0}
                  color={
                    status === 'Pending'
                      ? 'warning'
                      : status === 'Processing'
                      ? 'primary'
                      : status === 'Shipped'
                      ? 'secondary'
                      : status === 'Delivered'
                      ? 'success'
                      : 'error'
                  }
                />
              </div>
              <h3 className="font-medium text-gray-800 dark:text-gray-200">
                {status}
              </h3>
              <div className="mt-2 flex items-center justify-between">
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {statusCounts[status] || 0}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  {statusCounts[status]
                    ? ((statusCounts[status] / orders.length) * 100).toFixed(0)
                    : 0}
                  % of orders
                </p>
              </div>
              <div className="mt-2 w-full bg-gray-200 dark:bg-gray-700 rounded-full h-1.5">
                <div
                  className={`h-1.5 rounded-full ${
                    status === 'Pending'
                      ? 'bg-yellow-500 dark:bg-yellow-400'
                      : status === 'Processing'
                      ? 'bg-blue-500 dark:bg-blue-400'
                      : status === 'Shipped'
                      ? 'bg-purple-500 dark:bg-purple-400'
                      : status === 'Delivered'
                      ? 'bg-green-500 dark:bg-green-400'
                      : 'bg-red-500 dark:bg-red-400'
                  }`}
                  style={{
                    width: `${
                      statusCounts[status]
                        ? (statusCounts[status] / orders.length) * 100
                        : 0
                    }%`,
                  }}
                ></div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Order Analytics */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="bg-white dark:bg-gray-800 shadow-sm">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-lg font-bold text-gray-900 dark:text-white flex items-center">
                  <BarChart2 className="mr-2 h-5 w-5 text-blue-600 dark:text-blue-400" />
                  Daily Orders
                </CardTitle>
                <CardDescription className="text-gray-500 dark:text-gray-400">
                  Last 7 days order activity
                </CardDescription>
              </div>
              <div className="flex items-center space-x-2">
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400">
                  <TrendingUp className="mr-1 h-3 w-3" />
                  +12%
                </span>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={dailyOrdersData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                  <XAxis dataKey="date" stroke="#9CA3AF" />
                  <YAxis stroke="#9CA3AF" />
                  <RechartsTooltip
                    contentStyle={{
                      backgroundColor: '#1F2937',
                      border: 'none',
                      borderRadius: '0.375rem',
                      color: '#F9FAFB',
                    }}
                    itemStyle={{ color: '#F9FAFB' }}
                  />
                  <Legend />
                  <Bar
                    dataKey="orders"
                    name="Orders"
                    fill="#3B82F6"
                    radius={[4, 4, 0, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white dark:bg-gray-800 shadow-sm">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-lg font-bold text-gray-900 dark:text-white flex items-center">
                  <DollarSign className="mr-2 h-5 w-5 text-green-600 dark:text-green-400" />
                  Revenue
                </CardTitle>
                <CardDescription className="text-gray-500 dark:text-gray-400">
                  Last 7 days revenue
                </CardDescription>
              </div>
              <div className="flex items-center space-x-2">
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400">
                  <TrendingUp className="mr-1 h-3 w-3" />
                  +15%
                </span>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={dailyOrdersData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                  <XAxis dataKey="date" stroke="#9CA3AF" />
                  <YAxis stroke="#9CA3AF" />
                  <RechartsTooltip
                    contentStyle={{
                      backgroundColor: '#1F2937',
                      border: 'none',
                      borderRadius: '0.375rem',
                      color: '#F9FAFB',
                    }}
                    itemStyle={{ color: '#F9FAFB' }}
                    formatter={(value) => [`$${value}`, 'Revenue']}
                    labelFormatter={(label) => `Date: ${label}`}
                  />
                  <Legend />
                  <Line
                    type="monotone"
                    dataKey="revenue"
                    name="Revenue"
                    stroke="#10B981"
                    strokeWidth={2}
                    dot={{ r: 4 }}
                    activeDot={{ r: 6 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="bg-white dark:bg-gray-800 shadow-sm">
        <CardContent className="p-6">
          <div className="mb-6">
            <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
              <Tabs
                value={tabValue}
                onChange={handleTabChange}
                indicatorColor="primary"
                textColor="primary"
              >
                <Tab label="All Orders" />
                {orderStatuses.map((status) => (
                  <Tab key={status} label={status} />
                ))}
              </Tabs>
            </Box>
          </div>

          <div className="mb-4 flex flex-col md:flex-row justify-between items-start md:items-center space-y-3 md:space-y-0">
            <div className="flex flex-wrap items-center gap-2">
              <Input
                placeholder="Search orders..."
                prefix={<Search className="h-4 w-4 text-gray-400" />}
                className="w-full md:w-64"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              <DatePicker.RangePicker
                style={{ width: 240 }}
                onChange={setDateRange}
              />
              <Select
                placeholder="Status"
                style={{ width: 120 }}
                value={selectedStatus}
                onChange={(value) => setSelectedStatus(value)}
                options={[
                  { value: 'all', label: 'All' },
                  ...orderStatuses.map((status) => ({
                    value: status,
                    label: status,
                  })),
                ]}
              />
            </div>
            <div className="flex flex-wrap items-center gap-2">
              {bulkSelected.length > 0 && (
                <Button
                  variant="outlined"
                  color="error"
                  startIcon={<Trash2 className="h-4 w-4" />}
                  onClick={handleBulkDelete}
                >
                  Delete ({bulkSelected.length})
                </Button>
              )}
              <Button
                variant="outlined"
                className="border-gray-300 text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-800"
                startIcon={<Database className="h-4 w-4" />}
              >
                Export
              </Button>
              <Button
                variant="outlined"
                className="border-gray-300 text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-800"
                startIcon={<Layers className="h-4 w-4" />}
              >
                Bulk Actions
              </Button>
            </div>
          </div>

          <Table
            columns={columns}
            dataSource={filteredOrders}
            rowKey="id"
            pagination={{
              pageSize: 5,
              showSizeChanger: true,
              pageSizeOptions: ['5', '10', '20'],
              showTotal: (total, range) =>
                `${range[0]}-${range[1]} of ${total} items`,
            }}
            loading={loading}
            rowSelection={{
              type: 'checkbox',
              selectedRowKeys: bulkSelected,
              onChange: handleBulkSelect,
            }}
            expandable={{
              expandedRowRender: (record) => (
                <div className="p-4 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        Customer Information
                      </p>
                      <p className="text-sm font-medium text-gray-900 dark:text-white">
                        {record.customer}
                      </p>
                      <p className="text-sm text-gray-700 dark:text-gray-300">
                        {record.email}
                      </p>
                      <p className="text-sm text-gray-700 dark:text-gray-300">
                        {record.phone}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        Shipping Address
                      </p>
                      <p className="text-sm text-gray-700 dark:text-gray-300">
                        {record.address}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        Payment Information
                      </p>
                      <p className="text-sm text-gray-700 dark:text-gray-300">
                        <span className="font-medium">Method:</span>{' '}
                        {record.payment}
                      </p>
                      <p className="text-sm text-gray-700 dark:text-gray-300">
                        <span className="font-medium">Total:</span> $
                        {record.total.toFixed(2)}
                      </p>
                    </div>
                  </div>
                  <Divider className="my-4" />
                  <h4 className="font-medium text-gray-800 dark:text-white mb-2">
                    Order Timeline
                  </h4>
                  <Timeline
                    mode="left"
                    items={[
                      {
                        label: formatDate(record.date),
                        children: 'Order Placed',
                        dot: <Clock className="h-4 w-4 text-blue-500" />,
                      },
                      {
                        label:
                          record.status === 'Processing' ||
                          record.status === 'Shipped' ||
                          record.status === 'Delivered'
                            ? formatDate(
                                new Date(
                                  new Date(record.date).setDate(
                                    new Date(record.date).getDate() + 1
                                  )
                                )
                              )
                            : null,
                        children: 'Processing',
                        dot:
                          record.status === 'Processing' ||
                          record.status === 'Shipped' ||
                          record.status === 'Delivered' ? (
                            <RefreshCw className="h-4 w-4 text-blue-500" />
                          ) : null,
                        color: record.status === 'Processing' ? 'blue' : 'gray',
                      },
                      {
                        label:
                          record.status === 'Shipped' ||
                          record.status === 'Delivered'
                            ? formatDate(
                                new Date(
                                  new Date(record.date).setDate(
                                    new Date(record.date).getDate() + 2
                                  )
                                )
                              )
                            : null,
                        children: record.tracking
                          ? `Shipped (Tracking: ${record.tracking})`
                          : 'Shipped',
                        dot:
                          record.status === 'Shipped' ||
                          record.status === 'Delivered' ? (
                            <Truck className="h-4 w-4 text-purple-500" />
                          ) : null,
                        color: record.status === 'Shipped' ? 'purple' : 'gray',
                      },
                      {
                        label:
                          record.status === 'Delivered'
                            ? formatDate(
                                new Date(
                                  new Date(record.date).setDate(
                                    new Date(record.date).getDate() + 4
                                  )
                                )
                              )
                            : null,
                        children: 'Delivered',
                        dot:
                          record.status === 'Delivered' ? (
                            <CheckCircle className="h-4 w-4 text-green-500" />
                          ) : null,
                        color: record.status === 'Delivered' ? 'green' : 'gray',
                      },
                      {
                        label:
                          record.status === 'Cancelled'
                            ? formatDate(
                                new Date(
                                  new Date(record.date).setDate(
                                    new Date(record.date).getDate() + 1
                                  )
                                )
                              )
                            : null,
                        children: 'Cancelled',
                        dot:
                          record.status === 'Cancelled' ? (
                            <X className="h-4 w-4 text-red-500" />
                          ) : null,
                        color: record.status === 'Cancelled' ? 'red' : 'gray',
                      },
                    ].filter((item) => item.label !== null)}
                  />
                  {record.notes && (
                    <>
                      <Divider className="my-4" />
                      <div>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          Order Notes
                        </p>
                        <p className="text-sm text-gray-700 dark:text-gray-300 mt-1 p-2 bg-gray-100 dark:bg-gray-700 rounded-md">
                          {record.notes}
                        </p>
                      </div>
                    </>
                  )}
                </div>
              ),
            }}
            locale={{
              emptyText: (
                <Empty
                  image={Empty.PRESENTED_IMAGE_SIMPLE}
                  description={
                    <span className="text-gray-500 dark:text-gray-400">
                      No orders found
                    </span>
                  }
                />
              ),
            }}
            className="orders-table"
          />
        </CardContent>
      </Card>

      {/* View Order Modal */}
      <Dialog
        open={isViewOrderModalOpen}
        onClose={() => setIsViewOrderModalOpen(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <ShoppingCart className="h-5 w-5 text-blue-600 dark:text-blue-400 mr-2" />
              <span>Order Details - {selectedOrder?.id}</span>
            </div>
            <Chip
              label={selectedOrder?.status}
              className={`${getStatusColor(selectedOrder?.status)}`}
            />
          </div>
        </DialogTitle>
        <DialogContent>
          {selectedOrder && (
            <div className="space-y-6 mt-2">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
                  <div className="flex items-center mb-3">
                    <User className="h-5 w-5 text-blue-600 dark:text-blue-400 mr-2" />
                    <h3 className="text-sm font-medium text-gray-900 dark:text-white">
                      Customer
                    </h3>
                  </div>
                  <p className="text-sm text-gray-700 dark:text-gray-300">
                    {selectedOrder.customer}
                  </p>
                  <div className="flex items-center mt-2">
                    <Mail className="h-4 w-4 text-gray-500 dark:text-gray-400 mr-2" />
                    <p className="text-sm text-gray-700 dark:text-gray-300">
                      {selectedOrder.email}
                    </p>
                  </div>
                  <div className="flex items-center mt-1">
                    <Phone className="h-4 w-4 text-gray-500 dark:text-gray-400 mr-2" />
                    <p className="text-sm text-gray-700 dark:text-gray-300">
                      {selectedOrder.phone}
                    </p>
                  </div>
                </div>

                <div className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
                  <div className="flex items-center mb-3">
                    <MapPin className="h-5 w-5 text-green-600 dark:text-green-400 mr-2" />
                    <h3 className="text-sm font-medium text-gray-900 dark:text-white">
                      Shipping
                    </h3>
                  </div>
                  <p className="text-sm text-gray-700 dark:text-gray-300">
                    {selectedOrder.address}
                  </p>
                  {selectedOrder.tracking && (
                    <div className="mt-2">
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        Tracking Number
                      </p>
                      <p className="text-sm font-medium text-blue-600 dark:text-blue-400">
                        {selectedOrder.tracking}
                      </p>
                    </div>
                  )}
                </div>

                <div className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
                  <div className="flex items-center mb-3">
                    <CreditCard className="h-5 w-5 text-purple-600 dark:text-purple-400 mr-2" />
                    <h3 className="text-sm font-medium text-gray-900 dark:text-white">
                      Payment
                    </h3>
                  </div>
                  <p className="text-sm text-gray-700 dark:text-gray-300">
                    Method: {selectedOrder.payment}
                  </p>
                  <div className="mt-2">
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      Amount
                    </p>
                    <p className="text-lg font-bold text-gray-900 dark:text-white">
                      ${selectedOrder.total.toFixed(2)}
                    </p>
                  </div>
                </div>
              </div>

              <div className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
                <div className="flex items-center mb-3">
                  <Package className="h-5 w-5 text-orange-600 dark:text-orange-400 mr-2" />
                  <h3 className="text-sm font-medium text-gray-900 dark:text-white">
                    Order Items
                  </h3>
                </div>
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                    <thead className="bg-gray-50 dark:bg-gray-800">
                      <tr>
                        <th
                          scope="col"
                          className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider"
                        >
                          Product
                        </th>
                        <th
                          scope="col"
                          className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider"
                        >
                          Price
                        </th>
                        <th
                          scope="col"
                          className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider"
                        >
                          Quantity
                        </th>
                        <th
                          scope="col"
                          className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider"
                        >
                          Total
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                      {/* Mock items based on the order's item count */}
                      {Array.from({ length: selectedOrder.items }).map(
                        (_, index) => {
                          const price = (
                            (selectedOrder.total / selectedOrder.items) *
                            (0.7 + Math.random() * 0.6)
                          ).toFixed(2);
                          const quantity = Math.floor(Math.random() * 3) + 1;
                          return (
                            <tr key={index}>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <div className="flex items-center">
                                  <div className="flex-shrink-0 h-10 w-10 rounded-md overflow-hidden bg-gray-100 dark:bg-gray-700">
                                    <img
                                      src={`/placeholder.svg?height=40&width=40`}
                                      alt="Product"
                                      className="h-full w-full object-cover"
                                    />
                                  </div>
                                  <div className="ml-4">
                                    <div className="text-sm font-medium text-gray-900 dark:text-white">
                                      {
                                        [
                                          'Wireless Mouse',
                                          'USB Flash Drive',
                                          'Notebook Set',
                                          'Office Chair',
                                          'Laptop Cooling Pad',
                                        ][index % 5]
                                      }
                                    </div>
                                    <div className="text-sm text-gray-500 dark:text-gray-400">
                                      SKU:{' '}
                                      {
                                        [
                                          'WM001',
                                          'UFD32',
                                          'NB100',
                                          'OC220',
                                          'LCP50',
                                        ][index % 5]
                                      }
                                    </div>
                                  </div>
                                </div>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700 dark:text-gray-300">
                                ${price}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700 dark:text-gray-300">
                                {quantity}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                                ${(price * quantity).toFixed(2)}
                              </td>
                            </tr>
                          );
                        }
                      )}
                    </tbody>
                  </table>
                </div>
                <div className="mt-4 flex justify-end">
                  <div className="w-64 space-y-1">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-500 dark:text-gray-400">
                        Subtotal:
                      </span>
                      <span className="text-gray-700 dark:text-gray-300">
                        ${(selectedOrder.total * 0.9).toFixed(2)}
                      </span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-500 dark:text-gray-400">
                        Tax:
                      </span>
                      <span className="text-gray-700 dark:text-gray-300">
                        ${(selectedOrder.total * 0.1).toFixed(2)}
                      </span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-500 dark:text-gray-400">
                        Shipping:
                      </span>
                      <span className="text-gray-700 dark:text-gray-300">
                        $0.00
                      </span>
                    </div>
                    <div className="border-t border-gray-200 dark:border-gray-700 pt-1 mt-1">
                      <div className="flex justify-between text-sm font-medium">
                        <span className="text-gray-900 dark:text-white">
                          Total:
                        </span>
                        <span className="text-gray-900 dark:text-white">
                          ${selectedOrder.total.toFixed(2)}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {selectedOrder.notes && (
                <div className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
                  <div className="flex items-center mb-3">
                    <AlertTriangle className="h-5 w-5 text-yellow-600 dark:text-yellow-400 mr-2" />
                    <h3 className="text-sm font-medium text-gray-900 dark:text-white">
                      Notes
                    </h3>
                  </div>
                  <p className="text-sm text-gray-700 dark:text-gray-300 p-2 bg-gray-50 dark:bg-gray-700 rounded-md">
                    {selectedOrder.notes}
                  </p>
                </div>
              )}
            </div>
          )}
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() => setIsViewOrderModalOpen(false)}
            className="text-gray-700 dark:text-gray-300"
          >
            Close
          </Button>
          <Button
            variant="outlined"
            className="border-blue-600 text-blue-600 hover:bg-blue-50 dark:border-blue-400 dark:text-blue-400 dark:hover:bg-blue-900/20"
            startIcon={<Download className="h-4 w-4" />}
          >
            Download Invoice
          </Button>
          <Button
            variant="contained"
            className="bg-blue-600 hover:bg-blue-700 dark:bg-blue-600 dark:hover:bg-blue-700"
            onClick={() => {
              setIsViewOrderModalOpen(false);
              handleEditOrder(selectedOrder);
            }}
          >
            Edit Order
          </Button>
        </DialogActions>
      </Dialog>

      {/* Edit Order Modal */}
      <Dialog
        open={isEditOrderModalOpen}
        onClose={() => setIsEditOrderModalOpen(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>Edit Order - {selectedOrder?.id}</DialogTitle>
        <DialogContent>
          {selectedOrder && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
              <TextField
                label="Customer Name"
                variant="outlined"
                fullWidth
                defaultValue={selectedOrder.customer}
              />
              <TextField
                label="Email"
                variant="outlined"
                fullWidth
                defaultValue={selectedOrder.email}
              />
              <TextField
                label="Phone"
                variant="outlined"
                fullWidth
                defaultValue={selectedOrder.phone}
              />
              <TextField
                label="Order Date"
                variant="outlined"
                type="date"
                fullWidth
                defaultValue={selectedOrder.date}
                InputLabelProps={{ shrink: true }}
              />
              <TextField
                label="Shipping Address"
                variant="outlined"
                fullWidth
                multiline
                rows={2}
                defaultValue={selectedOrder.address}
              />
              <div>
                <Select
                  placeholder="Status"
                  style={{ width: '100%' }}
                  defaultValue={selectedOrder.status}
                  options={orderStatuses.map((status) => ({
                    value: status,
                    label: status,
                  }))}
                />
              </div>
              <TextField
                label="Tracking Number"
                variant="outlined"
                fullWidth
                defaultValue={selectedOrder.tracking}
              />
              <TextField
                label="Payment Method"
                variant="outlined"
                fullWidth
                defaultValue={selectedOrder.payment}
              />
              <div className="md:col-span-2">
                <TextField
                  label="Order Notes"
                  variant="outlined"
                  fullWidth
                  multiline
                  rows={3}
                  defaultValue={selectedOrder.notes}
                />
              </div>
            </div>
          )}
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() => setIsEditOrderModalOpen(false)}
            className="text-gray-700 dark:text-gray-300"
          >
            Cancel
          </Button>
          <Button
            variant="contained"
            className="bg-blue-600 hover:bg-blue-700 dark:bg-blue-600 dark:hover:bg-blue-700"
            onClick={() => {
              setIsEditOrderModalOpen(false);
              setNotification({
                open: true,
                message: `Order ${selectedOrder?.id} updated successfully`,
                type: 'success',
              });
            }}
          >
            Save Changes
          </Button>
        </DialogActions>
      </Dialog>

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

export default Orders;
