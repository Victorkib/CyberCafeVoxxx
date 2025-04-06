import React, { useState, useEffect } from 'react';
import { Routes, Route, NavLink, useNavigate } from 'react-router-dom';
import {
  ChevronDown,
  ChevronUp,
  Users,
  Package,
  ShoppingCart,
  Settings,
  BarChart2,
  CreditCard,
  MessageSquare,
  Bell,
  Search,
  LogOut,
  Grid,
  Truck,
  Gift,
  HelpCircle,
  FilePlus,
  Trash2,
  Edit,
  Eye,
  Calendar,
  Clock,
  AlertCircle,
  CheckCircle,
  X,
  RefreshCw,
  Layers,
  Database,
  Tag,
  PieChart,
  Zap,
  Shield,
  Coffee,
} from 'lucide-react';
import {
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Autocomplete,
  Chip,
  Avatar,
  Divider,
  CircularProgress,
  Box,
  Tooltip,
  Snackbar,
  Alert,
  Switch,
  FormControlLabel,
} from '@mui/material';
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
  PieChart as RPieChart,
  Pie,
  Cell,
} from 'recharts';
import {
  Table,
  Input,
  Select,
  Popconfirm,
  message,
  DatePicker,
  Upload,
  Dropdown,
  Menu,
  Spin,
  Tag as AntTag,
  Statistic,
} from 'antd';
import {
  Alert as ShadcnAlert,
  AlertDescription,
  AlertTitle,
} from '../../ui/alert';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '../../ui/card';
// import { Calendar as ShadcnCalendar } from '@/components/ui/calendar';
// import { Badge } from '@/components/ui/badge';

// Mock data
const salesData = [
  { name: 'Jan', sales: 4000, orders: 240 },
  { name: 'Feb', sales: 3000, orders: 198 },
  { name: 'Mar', sales: 5000, orders: 320 },
  { name: 'Apr', sales: 2780, orders: 190 },
  { name: 'May', sales: 1890, orders: 140 },
  { name: 'Jun', sales: 2390, orders: 150 },
  { name: 'Jul', sales: 3490, orders: 210 },
];

const productCategories = [
  { name: 'Electronics', value: 45, color: '#0088FE' },
  { name: 'Stationery', value: 25, color: '#00C49F' },
  { name: 'Office Supplies', value: 20, color: '#FFBB28' },
  { name: 'Accessories', value: 10, color: '#FF8042' },
];

const orderStatuses = [
  'Pending',
  'Processing',
  'Shipped',
  'Delivered',
  'Cancelled',
];

const mockProducts = [
  {
    id: 1,
    name: 'Wireless Mouse',
    sku: 'WM001',
    category: 'Electronics',
    price: 24.99,
    stock: 45,
    status: 'In Stock',
  },
  {
    id: 2,
    name: 'USB Flash Drive',
    sku: 'UFD32',
    category: 'Electronics',
    price: 15.99,
    stock: 78,
    status: 'In Stock',
  },
  {
    id: 3,
    name: 'Notebook Set',
    sku: 'NB100',
    category: 'Stationery',
    price: 9.99,
    stock: 120,
    status: 'In Stock',
  },
  {
    id: 4,
    name: 'Office Chair',
    sku: 'OC220',
    category: 'Office Supplies',
    price: 149.99,
    stock: 12,
    status: 'Low Stock',
  },
  {
    id: 5,
    name: 'Laptop Cooling Pad',
    sku: 'LCP50',
    category: 'Accessories',
    price: 29.99,
    stock: 0,
    status: 'Out of Stock',
  },
];

const mockOrders = [
  {
    id: '#ORD-001',
    customer: 'John Doe',
    date: '2025-03-15',
    total: 74.98,
    status: 'Delivered',
    items: 3,
  },
  {
    id: '#ORD-002',
    customer: 'Jane Smith',
    date: '2025-03-16',
    total: 159.99,
    status: 'Processing',
    items: 2,
  },
  {
    id: '#ORD-003',
    customer: 'Robert Johnson',
    date: '2025-03-17',
    total: 45.99,
    status: 'Shipped',
    items: 1,
  },
  {
    id: '#ORD-004',
    customer: 'Emily Davis',
    date: '2025-03-17',
    total: 89.97,
    status: 'Pending',
    items: 4,
  },
  {
    id: '#ORD-005',
    customer: 'Michael Wilson',
    date: '2025-03-18',
    total: 179.98,
    status: 'Cancelled',
    items: 2,
  },
];

const mockCustomers = [
  {
    id: 1,
    name: 'John Doe',
    email: 'john.doe@example.com',
    joined: '2024-12-10',
    orders: 5,
    spent: 249.95,
  },
  {
    id: 2,
    name: 'Jane Smith',
    email: 'jane.smith@example.com',
    joined: '2025-01-15',
    orders: 3,
    spent: 189.97,
  },
  {
    id: 3,
    name: 'Robert Johnson',
    email: 'robert.j@example.com',
    joined: '2025-02-05',
    orders: 2,
    spent: 99.98,
  },
  {
    id: 4,
    name: 'Emily Davis',
    email: 'emily.d@example.com',
    joined: '2025-02-20',
    orders: 4,
    spent: 159.96,
  },
  {
    id: 5,
    name: 'Michael Wilson',
    email: 'michael.w@example.com',
    joined: '2025-03-01',
    orders: 1,
    spent: 179.98,
  },
];

const mockEvents = [
  {
    id: 1,
    title: 'New Product Launch',
    start: '2025-03-25',
    end: '2025-03-25',
    type: 'event',
  },
  {
    id: 2,
    title: 'Inventory Check',
    start: '2025-03-20',
    end: '2025-03-20',
    type: 'task',
  },
  {
    id: 3,
    title: 'Supplier Meeting',
    start: '2025-03-22',
    end: '2025-03-22',
    type: 'meeting',
  },
];

const mockRecentActivities = [
  {
    id: 1,
    action: 'Product Added',
    item: 'Wireless Keyboard',
    user: 'Admin',
    time: '10 minutes ago',
  },
  {
    id: 2,
    action: 'Order Status Updated',
    item: '#ORD-002',
    user: 'Admin',
    time: '1 hour ago',
  },
  {
    id: 3,
    action: 'Customer Support Ticket',
    item: '#TKT-045',
    user: 'System',
    time: '3 hours ago',
  },
  {
    id: 4,
    action: 'New Customer Registered',
    item: 'Emily Davis',
    user: 'System',
    time: '5 hours ago',
  },
  {
    id: 5,
    action: 'Inventory Alert',
    item: 'Office Chair',
    user: 'System',
    time: '1 day ago',
  },
];

// Status color mapper
const getStatusColor = (status) => {
  const statusColors = {
    Pending: 'bg-yellow-200 text-yellow-800',
    Processing: 'bg-blue-200 text-blue-800',
    Shipped: 'bg-purple-200 text-purple-800',
    Delivered: 'bg-green-200 text-green-800',
    Cancelled: 'bg-red-200 text-red-800',
    'In Stock': 'bg-green-200 text-green-800',
    'Low Stock': 'bg-yellow-200 text-yellow-800',
    'Out of Stock': 'bg-red-200 text-red-800',
  };
  return statusColors[status] || 'bg-gray-200 text-gray-800';
};

// Date formatter
const formatDate = (dateString) => {
  const options = { year: 'numeric', month: 'short', day: 'numeric' };
  return new Date(dateString).toLocaleDateString(undefined, options);
};

// Main Dashboard Component
const Admin = () => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-6">
      {/* Sales Overview Card */}
      <Card className="bg-white shadow-md">
        <CardHeader className="pb-2">
          <CardTitle className="text-lg font-bold flex items-center">
            <BarChart2 className="mr-2 h-5 w-5 text-blue-600" />
            Sales Overview
          </CardTitle>
          <CardDescription>Last 30 days sales performance</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={salesData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <RechartsTooltip />
                <Line
                  type="monotone"
                  dataKey="sales"
                  stroke="#0078D7"
                  strokeWidth={2}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
          <div className="mt-4 grid grid-cols-2 gap-4">
            <div className="bg-blue-50 p-3 rounded-lg">
              <p className="text-sm text-gray-500">Total Sales</p>
              <p className="text-xl font-bold text-blue-700">$22,550</p>
              <p className="text-xs text-green-600">+15% from last month</p>
            </div>
            <div className="bg-green-50 p-3 rounded-lg">
              <p className="text-sm text-gray-500">Orders</p>
              <p className="text-xl font-bold text-green-700">1,458</p>
              <p className="text-xs text-green-600">+8% from last month</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Product Categories Card */}
      <Card className="bg-white shadow-md">
        <CardHeader className="pb-2">
          <CardTitle className="text-lg font-bold flex items-center">
            <PieChart className="mr-2 h-5 w-5 text-blue-600" />
            Product Categories
          </CardTitle>
          <CardDescription>
            Distribution of products by category
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <RPieChart>
                <Pie
                  data={productCategories}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) =>
                    `${name}: ${(percent * 100).toFixed(0)}%`
                  }
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {productCategories.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Legend />
              </RPieChart>
            </ResponsiveContainer>
          </div>
          <div className="mt-2">
            <p className="text-sm text-gray-500 mb-1">
              Total Products: <span className="font-semibold">245</span>
            </p>
            <div className="w-full bg-gray-200 rounded-full h-2.5">
              <div
                className="bg-blue-600 h-2.5 rounded-full"
                style={{ width: '80%' }}
              ></div>
            </div>
            <p className="text-xs text-blue-600 mt-1">
              80% of inventory capacity
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Recent Activity Card */}
      <Card className="bg-white shadow-md">
        <CardHeader className="pb-2">
          <CardTitle className="text-lg font-bold flex items-center">
            <Clock className="mr-2 h-5 w-5 text-blue-600" />
            Recent Activity
          </CardTitle>
          <CardDescription>Latest system activities</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4 max-h-64 overflow-y-auto">
            {mockRecentActivities.map((activity) => (
              <div
                key={activity.id}
                className="flex items-start space-x-3 border-b border-gray-100 pb-3"
              >
                <div className="bg-blue-100 p-2 rounded-full">
                  {activity.action.includes('Product') && (
                    <Package className="h-4 w-4 text-blue-600" />
                  )}
                  {activity.action.includes('Order') && (
                    <ShoppingCart className="h-4 w-4 text-blue-600" />
                  )}
                  {activity.action.includes('Customer') && (
                    <Users className="h-4 w-4 text-blue-600" />
                  )}
                  {activity.action.includes('Inventory') && (
                    <AlertCircle className="h-4 w-4 text-blue-600" />
                  )}
                  {activity.action.includes('Support') && (
                    <MessageSquare className="h-4 w-4 text-blue-600" />
                  )}
                </div>
                <div>
                  <p className="text-sm font-medium">{activity.action}</p>
                  <p className="text-xs text-gray-500">
                    {activity.item} by {activity.user}
                  </p>
                  <p className="text-xs text-gray-400">{activity.time}</p>
                </div>
              </div>
            ))}
          </div>
          <div className="mt-4">
            <Button
              variant="outlined"
              size="small"
              className="text-blue-600 border-blue-600 hover:bg-blue-50"
            >
              View All Activities
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Quick Stats Widgets */}
      <div className="lg:col-span-3 grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="bg-white shadow-md">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Total Customers</p>
              <p className="text-2xl font-bold text-blue-700">856</p>
              <p className="text-xs text-green-600">+12% from last month</p>
            </div>
            <div className="bg-blue-100 p-3 rounded-full">
              <Users className="h-6 w-6 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white shadow-md">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Total Orders</p>
              <p className="text-2xl font-bold text-green-700">1,458</p>
              <p className="text-xs text-green-600">+8% from last month</p>
            </div>
            <div className="bg-green-100 p-3 rounded-full">
              <ShoppingCart className="h-6 w-6 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white shadow-md">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Total Products</p>
              <p className="text-2xl font-bold text-purple-700">245</p>
              <p className="text-xs text-purple-600">+5% from last month</p>
            </div>
            <div className="bg-purple-100 p-3 rounded-full">
              <Package className="h-6 w-6 text-purple-600" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white shadow-md">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Revenue</p>
              <p className="text-2xl font-bold text-red-700">$22,550</p>
              <p className="text-xs text-green-600">+15% from last month</p>
            </div>
            <div className="bg-red-100 p-3 rounded-full">
              <CreditCard className="h-6 w-6 text-red-600" />
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

// Products Component
export const Products = () => {
  const [products, setProducts] = useState(mockProducts);
  const [isAddProductModalOpen, setIsAddProductModalOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [loading, setLoading] = useState(false);
  const [notification, setNotification] = useState({
    open: false,
    message: '',
    type: 'success',
  });

  const handleAddProduct = () => {
    setSelectedProduct(null);
    setIsAddProductModalOpen(true);
  };

  const handleEditProduct = (product) => {
    setSelectedProduct(product);
    setIsAddProductModalOpen(true);
  };

  const handleDeleteProduct = (productId) => {
    setLoading(true);
    // Simulate API call
    setTimeout(() => {
      const updatedProducts = products.filter(
        (product) => product.id !== productId
      );
      setProducts(updatedProducts);
      setLoading(false);
      setNotification({
        open: true,
        message: 'Product deleted successfully',
        type: 'success',
      });
    }, 1000);
  };

  const handleCloseNotification = () => {
    setNotification({ ...notification, open: false });
  };

  const columns = [
    {
      title: 'Product',
      dataIndex: 'name',
      key: 'name',
      render: (text, record) => (
        <div className="flex items-center space-x-3">
          <div className="bg-gray-200 rounded-md w-10 h-10 flex items-center justify-center">
            <Package className="h-5 w-5 text-gray-500" />
          </div>
          <div>
            <p className="font-medium">{text}</p>
            <p className="text-xs text-gray-500">SKU: {record.sku}</p>
          </div>
        </div>
      ),
    },
    {
      title: 'Category',
      dataIndex: 'category',
      key: 'category',
      render: (text) => (
        <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded-full text-xs">
          {text}
        </span>
      ),
    },
    {
      title: 'Price',
      dataIndex: 'price',
      key: 'price',
      render: (text) => <span className="font-medium">${text}</span>,
    },
    {
      title: 'Stock',
      dataIndex: 'stock',
      key: 'stock',
      render: (text) => <span className="font-medium">{text}</span>,
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (text) => (
        <span
          className={`px-2 py-1 rounded-full text-xs ${getStatusColor(text)}`}
        >
          {text}
        </span>
      ),
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_, record) => (
        <div className="flex space-x-2">
          <Tooltip title="View Product">
            <Button size="small" variant="outlined" className="min-w-0 p-1">
              <Eye className="h-4 w-4 text-blue-600" />
            </Button>
          </Tooltip>
          <Tooltip title="Edit Product">
            <Button
              size="small"
              variant="outlined"
              className="min-w-0 p-1"
              onClick={() => handleEditProduct(record)}
            >
              <Edit className="h-4 w-4 text-green-600" />
            </Button>
          </Tooltip>
          <Popconfirm
            title="Are you sure you want to delete this product?"
            onConfirm={() => handleDeleteProduct(record.id)}
            okText="Yes"
            cancelText="No"
          >
            <Tooltip title="Delete Product">
              <Button size="small" variant="outlined" className="min-w-0 p-1">
                <Trash2 className="h-4 w-4 text-red-600" />
              </Button>
            </Tooltip>
          </Popconfirm>
        </div>
      ),
    },
  ];

  return (
    <div>
      <div className="mb-6 flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Products</h2>
          <p className="text-gray-500">Manage your inventory and products</p>
        </div>
        <div className="flex space-x-2">
          <Button
            variant="contained"
            className="bg-blue-600 hover:bg-blue-700"
            startIcon={<FilePlus className="h-5 w-5" />}
            onClick={handleAddProduct}
          >
            Add Product
          </Button>
          <Button
            variant="outlined"
            className="border-blue-600 text-blue-600 hover:bg-blue-50"
            startIcon={<RefreshCw className="h-5 w-5" />}
          >
            Refresh
          </Button>
        </div>
      </div>

      <Card className="bg-white shadow-md">
        <CardContent className="p-6">
          <div className="mb-4 flex flex-col md:flex-row justify-between items-start md:items-center space-y-3 md:space-y-0">
            <div className="flex items-center space-x-2">
              <Input
                placeholder="Search products..."
                prefix={<Search className="h-4 w-4 text-gray-400" />}
                className="w-full md:w-64"
              />
              <Select
                placeholder="Category"
                style={{ width: 120 }}
                options={[
                  { value: 'all', label: 'All' },
                  { value: 'electronics', label: 'Electronics' },
                  { value: 'stationery', label: 'Stationery' },
                  { value: 'office', label: 'Office Supplies' },
                  { value: 'accessories', label: 'Accessories' },
                ]}
              />
              <Select
                placeholder="Status"
                style={{ width: 120 }}
                options={[
                  { value: 'all', label: 'All' },
                  { value: 'in-stock', label: 'In Stock' },
                  { value: 'low-stock', label: 'Low Stock' },
                  { value: 'out-of-stock', label: 'Out of Stock' },
                ]}
              />
            </div>
            <div className="flex items-center space-x-2">
              <Button
                variant="outlined"
                className="border-gray-300 text-gray-600 hover:bg-gray-50"
                startIcon={<Database className="h-4 w-4" />}
              >
                Export
              </Button>
              <Button
                variant="outlined"
                className="border-gray-300 text-gray-600 hover:bg-gray-50"
                startIcon={<Tag className="h-4 w-4" />}
              >
                Bulk Actions
              </Button>
            </div>
          </div>

          <Table
            columns={columns}
            dataSource={products}
            rowKey="id"
            pagination={{ pageSize: 5 }}
            loading={loading}
          />
        </CardContent>
      </Card>

      <Dialog
        open={isAddProductModalOpen}
        onClose={() => setIsAddProductModalOpen(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          {selectedProduct ? 'Edit Product' : 'Add New Product'}
        </DialogTitle>
        <DialogContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
            <TextField
              label="Product Name"
              variant="outlined"
              fullWidth
              defaultValue={selectedProduct?.name || ''}
            />
            <TextField
              label="SKU"
              variant="outlined"
              fullWidth
              defaultValue={selectedProduct?.sku || ''}
            />
            <TextField
              label="Price"
              variant="outlined"
              type="number"
              fullWidth
              defaultValue={selectedProduct?.price || ''}
            />
            <TextField
              label="Stock Quantity"
              variant="outlined"
              type="number"
              fullWidth
              defaultValue={selectedProduct?.stock || ''}
            />
            <Select
              placeholder="Category"
              style={{ width: '100%' }}
              defaultValue={selectedProduct?.category || undefined}
              options={[
                { value: 'Electronics', label: 'Electronics' },
                { value: 'Stationery', label: 'Stationery' },
                { value: 'Office Supplies', label: 'Office Supplies' },
                { value: 'Accessories', label: 'Accessories' },
              ]}
            />
            <Select
              placeholder="Status"
              style={{ width: '100%' }}
              defaultValue={selectedProduct?.status || undefined}
              options={[
                { value: 'In Stock', label: 'In Stock' },
                { value: 'Low Stock', label: 'Low Stock' },
                { value: 'Out of Stock', label: 'Out of Stock' },
              ]}
            />
            <div className="md:col-span-2">
              <TextField
                label="Product Description"
                variant="outlined"
                multiline
                rows={4}
                fullWidth
              />
            </div>
            <div className="md:col-span-2">
              <Upload
                action="https://www.mocky.io/v2/5cc8019d300000980a055e76"
                listType="picture-card"
                maxCount={5}
              >
                <div>
                  <div className="ant-upload-text">Upload</div>
                </div>
              </Upload>
            </div>
          </div>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setIsAddProductModalOpen(false)}>
            Cancel
          </Button>
          <Button
            variant="contained"
            className="bg-blue-600 hover:bg-blue-700"
            onClick={() => {
              setIsAddProductModalOpen(false);
              setNotification({
                open: true,
                message: selectedProduct
                  ? 'Product updated successfully'
                  : 'Product added successfully',
                type: 'success',
              });
            }}
          >
            {selectedProduct ? 'Update' : 'Add'} Product
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

// Orders Component
export const Orders = () => {
  const [orders, setOrders] = useState(mockOrders);
  const [loading, setLoading] = useState(false);
  const [notification, setNotification] = useState({
    open: false,
    message: '',
    type: 'success',
  });

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

  const columns = [
    {
      title: 'Order ID',
      dataIndex: 'id',
      key: 'id',
      render: (text) => (
        <span className="font-medium text-blue-600">{text}</span>
      ),
    },
    {
      title: 'Customer',
      dataIndex: 'customer',
      key: 'customer',
    },
    {
      title: 'Date',
      dataIndex: 'date',
      key: 'date',
      render: (text) => formatDate(text),
    },
    {
      title: 'Total',
      dataIndex: 'total',
      key: 'total',
      render: (text) => <span className="font-medium">${text}</span>,
    },
    {
      title: 'Items',
      dataIndex: 'items',
      key: 'items',
      render: (text) => <span>{text} items</span>,
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
        />
      ),
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_, record) => (
        <div className="flex space-x-2">
          <Tooltip title="View Order">
            <Button size="small" variant="outlined" className="min-w-0 p-1">
              <Eye className="h-4 w-4 text-blue-600" />
            </Button>
          </Tooltip>
          <Tooltip title="Edit Order">
            <Button size="small" variant="outlined" className="min-w-0 p-1">
              <Edit className="h-4 w-4 text-green-600" />
            </Button>
          </Tooltip>
          <Popconfirm
            title="Are you sure you want to delete this order?"
            onConfirm={() => {
              setLoading(true);
              setTimeout(() => {
                const updatedOrders = orders.filter(
                  (order) => order.id !== record.id
                );
                setOrders(updatedOrders);
                setLoading(false);
                setNotification({
                  open: true,
                  message: `Order ${record.id} deleted successfully`,
                  type: 'success',
                });
              }, 1000);
            }}
            okText="Yes"
            cancelText="No"
          >
            <Tooltip title="Delete Order">
              <Button size="small" variant="outlined" className="min-w-0 p-1">
                <Trash2 className="h-4 w-4 text-red-600" />
              </Button>
            </Tooltip>
          </Popconfirm>
          <Tooltip title="Print Invoice">
            <Button size="small" variant="outlined" className="min-w-0 p-1">
              <Layers className="h-4 w-4 text-purple-600" />
            </Button>
          </Tooltip>
        </div>
      ),
    },
  ];

  const statusCounts = orderStatuses.reduce((acc, status) => {
    acc[status] = orders.filter((order) => order.status === status).length;
    return acc;
  }, {});

  return (
    <div>
      <div className="mb-6 flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Orders</h2>
          <p className="text-gray-500">Manage and track all orders</p>
        </div>
        <div className="flex space-x-2">
          <Button
            variant="contained"
            className="bg-blue-600 hover:bg-blue-700"
            startIcon={<FilePlus className="h-5 w-5" />}
          >
            Create Order
          </Button>
          <Button
            variant="outlined"
            className="border-blue-600 text-blue-600 hover:bg-blue-50"
            startIcon={<RefreshCw className="h-5 w-5" />}
            onClick={() =>
              setLoading(true) || setTimeout(() => setLoading(false), 1000)
            }
          >
            Refresh
          </Button>
        </div>
      </div>

      {/* Order Status Cards */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
        {orderStatuses.map((status) => (
          <Card key={status} className="bg-white shadow-md">
            <CardContent className="p-4">
              <div
                className={`w-10 h-10 rounded-full flex items-center justify-center mb-3 ${getStatusColor(
                  status
                )}`}
              >
                {status === 'Pending' && <Clock className="h-5 w-5" />}
                {status === 'Processing' && <RefreshCw className="h-5 w-5" />}
                {status === 'Shipped' && <Truck className="h-5 w-5" />}
                {status === 'Delivered' && <CheckCircle className="h-5 w-5" />}
                {status === 'Cancelled' && <X className="h-5 w-5" />}
              </div>
              <h3 className="font-medium text-gray-800">{status}</h3>
              <p className="text-2xl font-bold">{statusCounts[status] || 0}</p>
              <p className="text-xs text-gray-500">
                {statusCounts[status]
                  ? ((statusCounts[status] / orders.length) * 100).toFixed(0)
                  : 0}
                % of orders
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card className="bg-white shadow-md mb-6">
        <CardContent className="p-6">
          <div className="mb-4 flex flex-col md:flex-row justify-between items-start md:items-center space-y-3 md:space-y-0">
            <div className="flex items-center space-x-2">
              <Input
                placeholder="Search orders..."
                prefix={<Search className="h-4 w-4 text-gray-400" />}
                className="w-full md:w-64"
              />
              <DatePicker.RangePicker style={{ width: 240 }} />
              <Select
                placeholder="Status"
                style={{ width: 120 }}
                options={[
                  { value: 'all', label: 'All' },
                  ...orderStatuses.map((status) => ({
                    value: status.toLowerCase(),
                    label: status,
                  })),
                ]}
              />
            </div>
            <div className="flex items-center space-x-2">
              <Button
                variant="outlined"
                className="border-gray-300 text-gray-600 hover:bg-gray-50"
                startIcon={<Database className="h-4 w-4" />}
              >
                Export
              </Button>
              <Button
                variant="outlined"
                className="border-gray-300 text-gray-600 hover:bg-gray-50"
                startIcon={<Layers className="h-4 w-4" />}
              >
                Bulk Actions
              </Button>
            </div>
          </div>

          <Table
            columns={columns}
            dataSource={orders}
            rowKey="id"
            pagination={{ pageSize: 5 }}
            loading={loading}
            expandable={{
              expandedRowRender: (record) => (
                <div className="p-4 bg-gray-50 rounded-lg">
                  <h4 className="font-medium text-gray-800 mb-2">
                    Order Details
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <p className="text-sm text-gray-500">
                        Customer Information
                      </p>
                      <p className="font-medium">{record.customer}</p>
                      <p className="text-sm">customer@example.com</p>
                      <p className="text-sm">+1 (555) 123-4567</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Shipping Address</p>
                      <p className="text-sm">123 Main Street</p>
                      <p className="text-sm">Apt 4B</p>
                      <p className="text-sm">New York, NY 10001</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">
                        Payment Information
                      </p>
                      <p className="text-sm">Credit Card ending in 4242</p>
                      <p className="text-sm">
                        Transaction ID: TXN-{Math.floor(Math.random() * 10000)}
                      </p>
                    </div>
                  </div>
                  <Divider className="my-4" />
                  <h4 className="font-medium text-gray-800 mb-2">
                    Order Items
                  </h4>
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-100">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Product
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Unit Price
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Quantity
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Total
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {Array(record.items)
                          .fill()
                          .map((_, index) => (
                            <tr key={index}>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <div className="flex items-center">
                                  <div className="flex-shrink-0 h-10 w-10 bg-gray-200 rounded-md flex items-center justify-center">
                                    <Package className="h-5 w-5 text-gray-500" />
                                  </div>
                                  <div className="ml-4">
                                    <div className="text-sm font-medium text-gray-900">
                                      {
                                        mockProducts[
                                          index % mockProducts.length
                                        ].name
                                      }
                                    </div>
                                    <div className="text-sm text-gray-500">
                                      SKU:{' '}
                                      {
                                        mockProducts[
                                          index % mockProducts.length
                                        ].sku
                                      }
                                    </div>
                                  </div>
                                </div>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                $
                                {
                                  mockProducts[index % mockProducts.length]
                                    .price
                                }
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                {Math.floor(Math.random() * 3) + 1}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                $
                                {(
                                  (Math.floor(Math.random() * 3) + 1) *
                                  mockProducts[index % mockProducts.length]
                                    .price
                                ).toFixed(2)}
                              </td>
                            </tr>
                          ))}
                      </tbody>
                    </table>
                  </div>
                  <Divider className="my-4" />
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="text-sm text-gray-500">Order Notes</p>
                      <p className="text-sm">
                        {record.status === 'Cancelled'
                          ? 'Customer requested cancellation'
                          : 'No notes available'}
                      </p>
                    </div>
                    <div className="text-right">
                      <div className="flex justify-between w-64">
                        <p className="text-sm text-gray-500">Subtotal:</p>
                        <p className="text-sm">
                          ${(record.total * 0.9).toFixed(2)}
                        </p>
                      </div>
                      <div className="flex justify-between w-64">
                        <p className="text-sm text-gray-500">Tax:</p>
                        <p className="text-sm">
                          ${(record.total * 0.1).toFixed(2)}
                        </p>
                      </div>
                      <div className="flex justify-between w-64">
                        <p className="text-sm text-gray-500">Shipping:</p>
                        <p className="text-sm">$0.00</p>
                      </div>
                      <div className="flex justify-between w-64 font-bold">
                        <p>Total:</p>
                        <p>${record.total}</p>
                      </div>
                    </div>
                  </div>
                </div>
              ),
            }}
          />
        </CardContent>
      </Card>

      {/* Order Analytics */}
      <Card className="bg-white shadow-md">
        <CardHeader className="pb-0">
          <CardTitle className="text-lg font-bold">Order Analytics</CardTitle>
          <CardDescription>Recent order trends and performance</CardDescription>
        </CardHeader>
        <CardContent className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-medium text-gray-800 mb-4">
                Orders by Status
              </h4>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={Object.entries(statusCounts).map(
                      ([status, count]) => ({ name: status, count })
                    )}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <RechartsTooltip />
                    <Bar dataKey="count" fill="#0078D7" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
            <div>
              <h4 className="font-medium text-gray-800 mb-4">Daily Orders</h4>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart
                    data={[
                      { date: '03/12', orders: 12 },
                      { date: '03/13', orders: 15 },
                      { date: '03/14', orders: 18 },
                      { date: '03/15', orders: 14 },
                      { date: '03/16', orders: 16 },
                      { date: '03/17', orders: 19 },
                      { date: '03/18', orders: 20 },
                    ]}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <RechartsTooltip />
                    <Line
                      type="monotone"
                      dataKey="orders"
                      stroke="#00C49F"
                      strokeWidth={2}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

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

// Customers Component
export const Customers = () => {
  const [customers, setCustomers] = useState(mockCustomers);
  const [loading, setLoading] = useState(false);
  const [notification, setNotification] = useState({
    open: false,
    message: '',
    type: 'success',
  });
  const [isAddCustomerModalOpen, setIsAddCustomerModalOpen] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState(null);

  const handleCloseNotification = () => {
    setNotification({ ...notification, open: false });
  };

  const handleAddCustomer = () => {
    setSelectedCustomer(null);
    setIsAddCustomerModalOpen(true);
  };

  const handleEditCustomer = (customer) => {
    setSelectedCustomer(customer);
    setIsAddCustomerModalOpen(true);
  };

  const handleDeleteCustomer = (customerId) => {
    setLoading(true);
    // Simulate API call
    setTimeout(() => {
      const updatedCustomers = customers.filter(
        (customer) => customer.id !== customerId
      );
      setCustomers(updatedCustomers);
      setLoading(false);
      setNotification({
        open: true,
        message: 'Customer deleted successfully',
        type: 'success',
      });
    }, 1000);
  };

  const columns = [
    {
      title: 'Customer',
      dataIndex: 'name',
      key: 'name',
      render: (text, record) => (
        <div className="flex items-center space-x-3">
          <Avatar>{text.charAt(0)}</Avatar>
          <div>
            <p className="font-medium">{text}</p>
            <p className="text-xs text-gray-500">{record.email}</p>
          </div>
        </div>
      ),
    },
    {
      title: 'Joined',
      dataIndex: 'joined',
      key: 'joined',
      render: (text) => formatDate(text),
    },
    {
      title: 'Orders',
      dataIndex: 'orders',
      key: 'orders',
    },
    {
      title: 'Spent',
      dataIndex: 'spent',
      key: 'spent',
      render: (text) => <span className="font-medium">${text}</span>,
    },
    {
      title: 'Status',
      key: 'status',
      render: (_, record) => (
        <span
          className={`px-2 py-1 rounded-full text-xs ${
            record.orders > 3
              ? 'bg-green-200 text-green-800'
              : 'bg-blue-200 text-blue-800'
          }`}
        >
          {record.orders > 3 ? 'Repeat Customer' : 'New Customer'}
        </span>
      ),
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_, record) => (
        <div className="flex space-x-2">
          <Tooltip title="View Customer">
            <Button size="small" variant="outlined" className="min-w-0 p-1">
              <Eye className="h-4 w-4 text-blue-600" />
            </Button>
          </Tooltip>
          <Tooltip title="Edit Customer">
            <Button
              size="small"
              variant="outlined"
              className="min-w-0 p-1"
              onClick={() => handleEditCustomer(record)}
            >
              <Edit className="h-4 w-4 text-green-600" />
            </Button>
          </Tooltip>
          <Popconfirm
            title="Are you sure you want to delete this customer?"
            onConfirm={() => handleDeleteCustomer(record.id)}
            okText="Yes"
            cancelText="No"
          >
            <Tooltip title="Delete Customer">
              <Button size="small" variant="outlined" className="min-w-0 p-1">
                <Trash2 className="h-4 w-4 text-red-600" />
              </Button>
            </Tooltip>
          </Popconfirm>
          <Tooltip title="Send Message">
            <Button size="small" variant="outlined" className="min-w-0 p-1">
              <MessageSquare className="h-4 w-4 text-purple-600" />
            </Button>
          </Tooltip>
        </div>
      ),
    },
  ];

  return (
    <div>
      <div className="mb-6 flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Customers</h2>
          <p className="text-gray-500">Manage your customer base</p>
        </div>
        <div className="flex space-x-2">
          <Button
            variant="contained"
            className="bg-blue-600 hover:bg-blue-700"
            startIcon={<FilePlus className="h-5 w-5" />}
            onClick={handleAddCustomer}
          >
            Add Customer
          </Button>
          <Button
            variant="outlined"
            className="border-blue-600 text-blue-600 hover:bg-blue-50"
            startIcon={<RefreshCw className="h-5 w-5" />}
            onClick={() =>
              setLoading(true) || setTimeout(() => setLoading(false), 1000)
            }
          >
            Refresh
          </Button>
        </div>
      </div>

      {/* Customer Insights */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <Card className="bg-white shadow-md">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <h3 className="font-medium text-gray-800">
                Customer Satisfaction
              </h3>
              <div className="bg-blue-100 p-2 rounded-full">
                <Zap className="h-5 w-5 text-blue-600" />
              </div>
            </div>
            <div className="mt-4 flex items-center">
              <div className="relative w-24 h-24">
                <CircularProgress
                  variant="determinate"
                  value={85}
                  size={96}
                  thickness={4}
                  sx={{ color: '#10B981' }}
                />
                <Box
                  sx={{
                    top: 0,
                    left: 0,
                    bottom: 0,
                    right: 0,
                    position: 'absolute',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <span className="text-2xl font-bold">85%</span>
                </Box>
              </div>
              <div className="ml-4">
                <p className="text-sm text-gray-500">Total Ratings</p>
                <p className="text-lg font-bold">324</p>
                <p className="text-xs text-green-600">+5% from last month</p>
              </div>
            </div>
            <div className="mt-4 grid grid-cols-5 gap-1">
              <div className="text-center">
                <p className="text-sm">★</p>
                <p className="text-xs">5</p>
                <div className="bg-gray-200 h-16 rounded-md relative">
                  <div
                    className="absolute bottom-0 left-0 right-0 bg-green-500 rounded-md"
                    style={{ height: '70%' }}
                  ></div>
                </div>
                <p className="text-xs mt-1">70%</p>
              </div>
              <div className="text-center">
                <p className="text-sm">★</p>
                <p className="text-xs">4</p>
                <div className="bg-gray-200 h-16 rounded-md relative">
                  <div
                    className="absolute bottom-0 left-0 right-0 bg-green-400 rounded-md"
                    style={{ height: '15%' }}
                  ></div>
                </div>
                <p className="text-xs mt-1">15%</p>
              </div>
              <div className="text-center">
                <p className="text-sm">★</p>
                <p className="text-xs">3</p>
                <div className="bg-gray-200 h-16 rounded-md relative">
                  <div
                    className="absolute bottom-0 left-0 right-0 bg-yellow-400 rounded-md"
                    style={{ height: '8%' }}
                  ></div>
                </div>
                <p className="text-xs mt-1">8%</p>
              </div>
              <div className="text-center">
                <p className="text-sm">★</p>
                <p className="text-xs">2</p>
                <div className="bg-gray-200 h-16 rounded-md relative">
                  <div
                    className="absolute bottom-0 left-0 right-0 bg-orange-400 rounded-md"
                    style={{ height: '5%' }}
                  ></div>
                </div>
                <p className="text-xs mt-1">5%</p>
              </div>
              <div className="text-center">
                <p className="text-sm">★</p>
                <p className="text-xs">1</p>
                <div className="bg-gray-200 h-16 rounded-md relative">
                  <div
                    className="absolute bottom-0 left-0 right-0 bg-red-500 rounded-md"
                    style={{ height: '2%' }}
                  ></div>
                </div>
                <p className="text-xs mt-1">2%</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white shadow-md">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <h3 className="font-medium text-gray-800">
                Customer Acquisition
              </h3>
              <div className="bg-green-100 p-2 rounded-full">
                <Users className="h-5 w-5 text-green-600" />
              </div>
            </div>
            <div className="mt-4 h-64">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart
                  data={[
                    { month: 'Oct', customers: 120 },
                    { month: 'Nov', customers: 145 },
                    { month: 'Dec', customers: 190 },
                    { month: 'Jan', customers: 220 },
                    { month: 'Feb', customers: 250 },
                    { month: 'Mar', customers: 275 },
                  ]}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <RechartsTooltip />
                  <Line
                    type="monotone"
                    dataKey="customers"
                    stroke="#10B981"
                    strokeWidth={2}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
            <div className="mt-4 flex justify-between">
              <div className="text-center">
                <p className="text-sm text-gray-500">New This Month</p>
                <p className="text-lg font-bold text-green-600">+35</p>
              </div>
              <div className="text-center">
                <p className="text-sm text-gray-500">Growth Rate</p>
                <p className="text-lg font-bold text-green-600">+12.5%</p>
              </div>
              <div className="text-center">
                <p className="text-sm text-gray-500">Target</p>
                <p className="text-lg font-bold">50</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white shadow-md">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <h3 className="font-medium text-gray-800">Customer Retention</h3>
              <div className="bg-purple-100 p-2 rounded-full">
                <Shield className="h-5 w-5 text-purple-600" />
              </div>
            </div>
            <div className="mt-4 h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={[
                    { category: 'One-time', count: 120 },
                    { category: '2-3 orders', count: 85 },
                    { category: '4-6 orders', count: 55 },
                    { category: '7+ orders', count: 40 },
                  ]}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="category" />
                  <YAxis />
                  <RechartsTooltip />
                  <Bar dataKey="count" fill="#8884d8" />
                </BarChart>
              </ResponsiveContainer>
            </div>
            <div className="mt-4">
              <p className="text-sm text-gray-500">Retention Rate</p>
              <div className="w-full bg-gray-200 rounded-full h-2.5 mt-2">
                <div
                  className="bg-purple-600 h-2.5 rounded-full"
                  style={{ width: '68%' }}
                ></div>
              </div>
              <div className="flex justify-between mt-1">
                <p className="text-xs text-gray-500">0%</p>
                <p className="text-xs text-purple-600 font-medium">68%</p>
                <p className="text-xs text-gray-500">100%</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="bg-white shadow-md">
        <CardContent className="p-6">
          <div className="mb-4 flex flex-col md:flex-row justify-between items-start md:items-center space-y-3 md:space-y-0">
            <div className="flex items-center space-x-2">
              <Input
                placeholder="Search customers..."
                prefix={<Search className="h-4 w-4 text-gray-400" />}
                className="w-full md:w-64"
              />
              <DatePicker.RangePicker style={{ width: 240 }} />
              <Select
                placeholder="Status"
                style={{ width: 150 }}
                options={[
                  { value: 'all', label: 'All Customers' },
                  { value: 'new', label: 'New Customers' },
                  { value: 'repeat', label: 'Repeat Customers' },
                ]}
              />
            </div>
            <div className="flex items-center space-x-2">
              <Button
                variant="outlined"
                className="border-gray-300 text-gray-600 hover:bg-gray-50"
                startIcon={<Database className="h-4 w-4" />}
              >
                Export
              </Button>
              <Button
                variant="outlined"
                className="border-gray-300 text-gray-600 hover:bg-gray-50"
                startIcon={<MessageSquare className="h-4 w-4" />}
              >
                Bulk Message
              </Button>
            </div>
          </div>

          <Table
            columns={columns}
            dataSource={customers}
            rowKey="id"
            pagination={{ pageSize: 5 }}
            loading={loading}
            expandable={{
              expandedRowRender: (record) => (
                <div className="p-4 bg-gray-50 rounded-lg">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <p className="text-sm text-gray-500">
                        Contact Information
                      </p>
                      <p className="text-sm">
                        <strong>Email:</strong> {record.email}
                      </p>
                      <p className="text-sm">
                        <strong>Phone:</strong> +1 (555){' '}
                        {Math.floor(100 + Math.random() * 900)}-
                        {Math.floor(1000 + Math.random() * 9000)}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Address</p>
                      <p className="text-sm">
                        {Math.floor(100 + Math.random() * 900)}{' '}
                        {
                          ['Main', 'Oak', 'Pine', 'Maple', 'Cedar'][
                            Math.floor(Math.random() * 5)
                          ]
                        }{' '}
                        Street
                      </p>
                      <p className="text-sm">
                        {
                          [
                            'New York',
                            'Chicago',
                            'Los Angeles',
                            'Houston',
                            'Phoenix',
                          ][Math.floor(Math.random() * 5)]
                        }
                        ,{' '}
                        {
                          ['NY', 'IL', 'CA', 'TX', 'AZ'][
                            Math.floor(Math.random() * 5)
                          ]
                        }{' '}
                        {Math.floor(10000 + Math.random() * 90000)}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Order History</p>
                      <p className="text-sm">
                        <strong>Total Orders:</strong> {record.orders}
                      </p>
                      <p className="text-sm">
                        <strong>Total Spent:</strong> ${record.spent}
                      </p>
                      <p className="text-sm">
                        <strong>Last Order:</strong>{' '}
                        {formatDate(new Date().toISOString().split('T')[0])}
                      </p>
                    </div>
                  </div>
                  <Divider className="my-4" />
                  <h4 className="font-medium text-gray-800 mb-2">
                    Recent Orders
                  </h4>
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-100">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Order ID
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Date
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Total
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Status
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {Array.from({ length: record.orders }).map(
                          (_, index) => (
                            <tr key={index}>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <span className="text-sm font-medium text-blue-600">
                                  #ORD-{Math.floor(1000 + Math.random() * 9000)}
                                </span>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <span className="text-sm">
                                  {formatDate(
                                    new Date().toISOString().split('T')[0]
                                  )}
                                </span>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <span className="text-sm font-medium">
                                  ${(Math.random() * 200 + 50).toFixed(2)}
                                </span>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <span
                                  className={`px-2 py-1 rounded-full text-xs ${getStatusColor(
                                    [
                                      'Pending',
                                      'Processing',
                                      'Shipped',
                                      'Delivered',
                                      'Cancelled',
                                    ][Math.floor(Math.random() * 5)]
                                  )}`}
                                >
                                  {
                                    [
                                      'Pending',
                                      'Processing',
                                      'Shipped',
                                      'Delivered',
                                      'Cancelled',
                                    ][Math.floor(Math.random() * 5)]
                                  }
                                </span>
                              </td>
                            </tr>
                          )
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              ),
            }}
          />
        </CardContent>
      </Card>

      {/* Add/Edit Customer Modal */}
      <Dialog
        open={isAddCustomerModalOpen}
        onClose={() => setIsAddCustomerModalOpen(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          {selectedCustomer ? 'Edit Customer' : 'Add New Customer'}
        </DialogTitle>
        <DialogContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
            <TextField
              label="Full Name"
              variant="outlined"
              fullWidth
              defaultValue={selectedCustomer?.name || ''}
            />
            <TextField
              label="Email"
              variant="outlined"
              fullWidth
              defaultValue={selectedCustomer?.email || ''}
            />
            <TextField
              label="Phone Number"
              variant="outlined"
              fullWidth
              defaultValue={selectedCustomer?.phone || ''}
            />
            <TextField
              label="Address"
              variant="outlined"
              fullWidth
              defaultValue={selectedCustomer?.address || ''}
            />
            <TextField
              label="City"
              variant="outlined"
              fullWidth
              defaultValue={selectedCustomer?.city || ''}
            />
            <TextField
              label="State"
              variant="outlined"
              fullWidth
              defaultValue={selectedCustomer?.state || ''}
            />
            <TextField
              label="Zip Code"
              variant="outlined"
              fullWidth
              defaultValue={selectedCustomer?.zip || ''}
            />
            <TextField
              label="Country"
              variant="outlined"
              fullWidth
              defaultValue={selectedCustomer?.country || ''}
            />
          </div>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setIsAddCustomerModalOpen(false)}>
            Cancel
          </Button>
          <Button
            variant="contained"
            className="bg-blue-600 hover:bg-blue-700"
            onClick={() => {
              setIsAddCustomerModalOpen(false);
              setNotification({
                open: true,
                message: selectedCustomer
                  ? 'Customer updated successfully'
                  : 'Customer added successfully',
                type: 'success',
              });
            }}
          >
            {selectedCustomer ? 'Update' : 'Add'} Customer
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

export default Admin;
