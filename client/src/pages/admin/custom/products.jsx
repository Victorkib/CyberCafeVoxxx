'use client';

import { useState, useEffect } from 'react';
import {
  Package,
  Search,
  FilePlus,
  RefreshCw,
  Database,
  Trash2,
  Edit,
  Eye,
  Filter,
  Plus,
  CheckCircle,
  AlertTriangle,
  XCircle,
  MoreHorizontal,
  Download,
  LucideUpload,
  Printer,
  Clipboard,
  BarChart2,
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
  IconButton,
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
  Switch,
  FormControlLabel,
  Divider,
  Box,
  Tab,
  Tabs,
} from '@mui/material';
import {
  Table,
  Input,
  Select,
  Popconfirm,
  DatePicker,
  Upload as AntUpload,
  Empty,
} from 'antd';
import { Card, CardContent } from '../../../ui/card';

// Mock data
const mockProducts = [
  {
    id: 1,
    name: 'Wireless Mouse',
    sku: 'WM001',
    category: 'Electronics',
    price: 24.99,
    stock: 45,
    status: 'In Stock',
    image: '/placeholder.svg?height=40&width=40',
    description: 'High-performance wireless mouse with ergonomic design',
    created: '2025-01-15',
    updated: '2025-03-10',
    rating: 4.5,
    sales: 128,
  },
  {
    id: 2,
    name: 'USB Flash Drive',
    sku: 'UFD32',
    category: 'Electronics',
    price: 15.99,
    stock: 78,
    status: 'In Stock',
    image: '/placeholder.svg?height=40&width=40',
    description: '32GB USB 3.0 flash drive with metal casing',
    created: '2025-01-20',
    updated: '2025-03-05',
    rating: 4.2,
    sales: 215,
  },
  {
    id: 3,
    name: 'Notebook Set',
    sku: 'NB100',
    category: 'Stationery',
    price: 9.99,
    stock: 120,
    status: 'In Stock',
    image: '/placeholder.svg?height=40&width=40',
    description: 'Set of 3 premium notebooks with different paper types',
    created: '2025-02-01',
    updated: '2025-03-01',
    rating: 4.8,
    sales: 89,
  },
  {
    id: 4,
    name: 'Office Chair',
    sku: 'OC220',
    category: 'Office Supplies',
    price: 149.99,
    stock: 12,
    status: 'Low Stock',
    image: '/placeholder.svg?height=40&width=40',
    description:
      'Ergonomic office chair with lumbar support and adjustable height',
    created: '2025-02-10',
    updated: '2025-03-12',
    rating: 4.7,
    sales: 42,
  },
  {
    id: 5,
    name: 'Laptop Cooling Pad',
    sku: 'LCP50',
    category: 'Accessories',
    price: 29.99,
    stock: 0,
    status: 'Out of Stock',
    image: '/placeholder.svg?height=40&width=40',
    description:
      'Laptop cooling pad with 5 fans and adjustable height settings',
    created: '2025-02-15',
    updated: '2025-03-08',
    rating: 4.0,
    sales: 67,
  },
];

// Status color mapper
const getStatusColor = (status) => {
  const statusColors = {
    'In Stock':
      'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
    'Low Stock':
      'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400',
    'Out of Stock':
      'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400',
  };
  return (
    statusColors[status] ||
    'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'
  );
};

// Products Component
const Products = () => {
  const [products, setProducts] = useState(mockProducts);
  const [isAddProductModalOpen, setIsAddProductModalOpen] = useState(false);
  const [isFilterModalOpen, setIsFilterModalOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [loading, setLoading] = useState(false);
  const [notification, setNotification] = useState({
    open: false,
    message: '',
    type: 'success',
  });
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [anchorEl, setAnchorEl] = useState(null);
  const [tabValue, setTabValue] = useState(0);
  const [bulkSelected, setBulkSelected] = useState([]);
  const [sortOrder, setSortOrder] = useState({
    field: 'name',
    direction: 'asc',
  });

  // Add this at the top of the component to ensure dark mode is applied to MUI components
  useEffect(() => {
    // Check if dark mode is enabled
    const isDarkMode = document.documentElement.classList.contains('dark');

    // Apply appropriate styles to MUI components
    const muiComponents = document.querySelectorAll(
      '.MuiPaper-root, .MuiDialog-paper'
    );
    muiComponents.forEach((component) => {
      if (isDarkMode) {
        component.classList.add('dark-mui');
      } else {
        component.classList.remove('dark-mui');
      }
    });
  }, []);

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

  const handleMenuOpen = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  const handleBulkSelect = (selectedRowKeys) => {
    setBulkSelected(selectedRowKeys);
  };

  const handleBulkDelete = () => {
    if (bulkSelected.length === 0) return;

    setLoading(true);
    setTimeout(() => {
      const updatedProducts = products.filter(
        (product) => !bulkSelected.includes(product.id)
      );
      setProducts(updatedProducts);
      setBulkSelected([]);
      setLoading(false);
      setNotification({
        open: true,
        message: `${bulkSelected.length} products deleted successfully`,
        type: 'success',
      });
    }, 1000);
  };

  const handleSort = (field) => {
    setSortOrder({
      field,
      direction:
        sortOrder.field === field && sortOrder.direction === 'asc'
          ? 'desc'
          : 'asc',
    });
  };

  // Filter products based on search, category, and status
  const filteredProducts = products.filter((product) => {
    const matchesSearch =
      product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.sku.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory =
      selectedCategory === 'all' || product.category === selectedCategory;
    const matchesStatus =
      selectedStatus === 'all' || product.status === selectedStatus;

    return matchesSearch && matchesCategory && matchesStatus;
  });

  // Sort products
  const sortedProducts = [...filteredProducts].sort((a, b) => {
    if (
      sortOrder.field === 'price' ||
      sortOrder.field === 'stock' ||
      sortOrder.field === 'sales'
    ) {
      return sortOrder.direction === 'asc'
        ? a[sortOrder.field] - b[sortOrder.field]
        : b[sortOrder.field] - a[sortOrder.field];
    } else {
      return sortOrder.direction === 'asc'
        ? a[sortOrder.field].localeCompare(b[sortOrder.field])
        : b[sortOrder.field].localeCompare(a[sortOrder.field]);
    }
  });

  const columns = [
    {
      title: 'Product',
      dataIndex: 'name',
      key: 'name',
      render: (text, record) => (
        <div className="flex items-center space-x-3">
          <div className="flex-shrink-0 h-10 w-10 rounded-md overflow-hidden bg-gray-100 dark:bg-gray-700 border border-gray-200 dark:border-gray-600">
            <img
              src={record.image || '/placeholder.svg'}
              alt={text}
              className="h-full w-full object-cover"
            />
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
              {text}
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              SKU: {record.sku}
            </p>
          </div>
        </div>
      ),
      sorter: true,
      sortOrder: sortOrder.field === 'name' ? sortOrder.direction : null,
    },
    {
      title: 'Category',
      dataIndex: 'category',
      key: 'category',
      render: (text) => (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400">
          {text}
        </span>
      ),
      sorter: true,
      sortOrder: sortOrder.field === 'category' ? sortOrder.direction : null,
    },
    {
      title: 'Price',
      dataIndex: 'price',
      key: 'price',
      render: (text) => (
        <span className="text-sm font-medium">${text.toFixed(2)}</span>
      ),
      sorter: true,
      sortOrder: sortOrder.field === 'price' ? sortOrder.direction : null,
    },
    {
      title: 'Stock',
      dataIndex: 'stock',
      key: 'stock',
      render: (text) => <span className="text-sm font-medium">{text}</span>,
      sorter: true,
      sortOrder: sortOrder.field === 'stock' ? sortOrder.direction : null,
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (text) => (
        <span
          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(
            text
          )}`}
        >
          {text === 'In Stock' && <CheckCircle className="mr-1 h-3 w-3" />}
          {text === 'Low Stock' && <AlertTriangle className="mr-1 h-3 w-3" />}
          {text === 'Out of Stock' && <XCircle className="mr-1 h-3 w-3" />}
          {text}
        </span>
      ),
      sorter: true,
      sortOrder: sortOrder.field === 'status' ? sortOrder.direction : null,
    },
    {
      title: 'Sales',
      dataIndex: 'sales',
      key: 'sales',
      render: (text) => (
        <div className="flex items-center">
          <span className="text-sm font-medium mr-2">{text}</span>
          <div className="w-16 bg-gray-200 dark:bg-gray-700 rounded-full h-1.5">
            <div
              className="bg-blue-600 dark:bg-blue-400 h-1.5 rounded-full"
              style={{ width: `${Math.min(100, (text / 250) * 100)}%` }}
            ></div>
          </div>
        </div>
      ),
      sorter: true,
      sortOrder: sortOrder.field === 'sales' ? sortOrder.direction : null,
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_, record) => (
        <div className="flex space-x-1">
          <Tooltip title="View Product">
            <IconButton
              size="small"
              className="text-blue-600 dark:text-blue-400"
            >
              <Eye className="h-4 w-4" />
            </IconButton>
          </Tooltip>
          <Tooltip title="Edit Product">
            <IconButton
              size="small"
              className="text-green-600 dark:text-green-400"
              onClick={() => handleEditProduct(record)}
            >
              <Edit className="h-4 w-4" />
            </IconButton>
          </Tooltip>
          <Popconfirm
            title="Are you sure you want to delete this product?"
            onConfirm={() => handleDeleteProduct(record.id)}
            okText="Yes"
            cancelText="No"
          >
            <Tooltip title="Delete Product">
              <IconButton
                size="small"
                className="text-red-600 dark:text-red-400"
              >
                <Trash2 className="h-4 w-4" />
              </IconButton>
            </Tooltip>
          </Popconfirm>
          <Tooltip title="More Actions">
            <IconButton
              size="small"
              className="text-gray-600 dark:text-gray-400"
              onClick={handleMenuOpen}
            >
              <MoreHorizontal className="h-4 w-4" />
            </IconButton>
          </Tooltip>
        </div>
      ),
    },
  ];

  const actionMenu = (
    <Menu
      anchorEl={anchorEl}
      open={Boolean(anchorEl)}
      onClose={handleMenuClose}
      anchorOrigin={{
        vertical: 'bottom',
        horizontal: 'right',
      }}
      transformOrigin={{
        vertical: 'top',
        horizontal: 'right',
      }}
    >
      <MenuItem onClick={handleMenuClose}>
        <ListItemIcon>
          <Download className="h-4 w-4" />
        </ListItemIcon>
        <ListItemText>Export Product</ListItemText>
      </MenuItem>
      <MenuItem onClick={handleMenuClose}>
        <ListItemIcon>
          <Printer className="h-4 w-4" />
        </ListItemIcon>
        <ListItemText>Print Details</ListItemText>
      </MenuItem>
      <MenuItem onClick={handleMenuClose}>
        <ListItemIcon>
          <Clipboard className="h-4 w-4" />
        </ListItemIcon>
        <ListItemText>Duplicate Product</ListItemText>
      </MenuItem>
      <Divider />
      <MenuItem onClick={handleMenuClose}>
        <ListItemIcon>
          <BarChart2 className="h-4 w-4" />
        </ListItemIcon>
        <ListItemText>View Analytics</ListItemText>
      </MenuItem>
    </Menu>
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
            Products
          </h2>
          <p className="text-gray-500 dark:text-gray-400">
            Manage your inventory and products
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button
            variant="contained"
            className="bg-blue-600 hover:bg-blue-700 dark:bg-blue-600 dark:hover:bg-blue-700 shadow-sm"
            startIcon={<FilePlus className="h-5 w-5" />}
            onClick={handleAddProduct}
          >
            Add Product
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
            onClick={() => setIsFilterModalOpen(true)}
          >
            Filters
          </Button>
        </div>
      </div>

      {/* Product Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="bg-white dark:bg-gray-800 shadow-sm hover:shadow-md transition-shadow duration-200">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Total Products
                </p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {products.length}
                </p>
              </div>
              <div className="p-3 bg-blue-100 dark:bg-blue-900/30 rounded-full">
                <Package className="h-6 w-6 text-blue-600 dark:text-blue-400" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white dark:bg-gray-800 shadow-sm hover:shadow-md transition-shadow duration-200">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  In Stock
                </p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {products.filter((p) => p.status === 'In Stock').length}
                </p>
              </div>
              <div className="p-3 bg-green-100 dark:bg-green-900/30 rounded-full">
                <CheckCircle className="h-6 w-6 text-green-600 dark:text-green-400" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white dark:bg-gray-800 shadow-sm hover:shadow-md transition-shadow duration-200">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Low Stock
                </p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {products.filter((p) => p.status === 'Low Stock').length}
                </p>
              </div>
              <div className="p-3 bg-yellow-100 dark:bg-yellow-900/30 rounded-full">
                <AlertTriangle className="h-6 w-6 text-yellow-600 dark:text-yellow-400" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white dark:bg-gray-800 shadow-sm hover:shadow-md transition-shadow duration-200">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Out of Stock
                </p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {products.filter((p) => p.status === 'Out of Stock').length}
                </p>
              </div>
              <div className="p-3 bg-red-100 dark:bg-red-900/30 rounded-full">
                <XCircle className="h-6 w-6 text-red-600 dark:text-red-400" />
              </div>
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
                <Tab label="All Products" />
                <Tab label="In Stock" />
                <Tab label="Low Stock" />
                <Tab label="Out of Stock" />
              </Tabs>
            </Box>
          </div>

          <div className="mb-4 flex flex-col md:flex-row justify-between items-start md:items-center space-y-3 md:space-y-0">
            <div className="flex flex-wrap items-center gap-2">
              <Input
                placeholder="Search products..."
                prefix={<Search className="h-4 w-4 text-gray-400" />}
                className="w-full md:w-64"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              <Select
                placeholder="Category"
                style={{ width: 120 }}
                value={selectedCategory}
                onChange={(value) => setSelectedCategory(value)}
                options={[
                  { value: 'all', label: 'All' },
                  { value: 'Electronics', label: 'Electronics' },
                  { value: 'Stationery', label: 'Stationery' },
                  { value: 'Office Supplies', label: 'Office Supplies' },
                  { value: 'Accessories', label: 'Accessories' },
                ]}
              />
              <Select
                placeholder="Status"
                style={{ width: 120 }}
                value={selectedStatus}
                onChange={(value) => setSelectedStatus(value)}
                options={[
                  { value: 'all', label: 'All' },
                  { value: 'In Stock', label: 'In Stock' },
                  { value: 'Low Stock', label: 'Low Stock' },
                  { value: 'Out of Stock', label: 'Out of Stock' },
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
                startIcon={<LucideUpload className="h-4 w-4" />}
              >
                Import
              </Button>
            </div>
          </div>

          <Table
            columns={columns}
            dataSource={sortedProducts}
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
            onChange={(pagination, filters, sorter) => {
              if (sorter.field && sorter.order) {
                handleSort(sorter.field);
              }
            }}
            locale={{
              emptyText: (
                <Empty
                  image={Empty.PRESENTED_IMAGE_SIMPLE}
                  description={
                    <span className="text-gray-500 dark:text-gray-400">
                      No products found
                    </span>
                  }
                />
              ),
            }}
            className="product-table"
          />
        </CardContent>
      </Card>

      {/* Add/Edit Product Modal */}
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
              InputProps={{
                startAdornment: <span className="mr-1">$</span>,
              }}
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
                defaultValue={selectedProduct?.description || ''}
              />
            </div>
            <div className="md:col-span-2">
              <p className="mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                Product Images
              </p>
              <AntUpload
                action="https://www.mocky.io/v2/5cc8019d300000980a055e76"
                listType="picture-card"
                maxCount={5}
              >
                <div>
                  <Plus className="h-5 w-5 text-gray-400" />
                  <div className="mt-1 text-xs">Upload</div>
                </div>
              </AntUpload>
            </div>
            <div className="md:col-span-2">
              <FormControlLabel
                control={<Switch defaultChecked />}
                label="Product is active and visible in store"
              />
            </div>
          </div>
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() => setIsAddProductModalOpen(false)}
            className="text-gray-700 dark:text-gray-300"
          >
            Cancel
          </Button>
          <Button
            variant="contained"
            className="bg-blue-600 hover:bg-blue-700 dark:bg-blue-600 dark:hover:bg-blue-700"
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

      {/* Filter Modal */}
      <Dialog
        open={isFilterModalOpen}
        onClose={() => setIsFilterModalOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Filter Products</DialogTitle>
        <DialogContent>
          <div className="space-y-4 mt-2">
            <div>
              <p className="mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                Price Range
              </p>
              <div className="flex items-center space-x-2">
                <TextField
                  label="Min"
                  variant="outlined"
                  type="number"
                  size="small"
                  InputProps={{
                    startAdornment: <span className="mr-1">$</span>,
                  }}
                />
                <span className="text-gray-500">to</span>
                <TextField
                  label="Max"
                  variant="outlined"
                  type="number"
                  size="small"
                  InputProps={{
                    startAdornment: <span className="mr-1">$</span>,
                  }}
                />
              </div>
            </div>

            <div>
              <p className="mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                Categories
              </p>
              <div className="flex flex-wrap gap-2">
                {[
                  'Electronics',
                  'Stationery',
                  'Office Supplies',
                  'Accessories',
                ].map((category) => (
                  <Chip
                    key={category}
                    label={category}
                    variant="outlined"
                    onClick={() => {}}
                    className="bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                  />
                ))}
              </div>
            </div>

            <div>
              <p className="mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                Status
              </p>
              <div className="flex flex-wrap gap-2">
                {['In Stock', 'Low Stock', 'Out of Stock'].map((status) => (
                  <Chip
                    key={status}
                    label={status}
                    variant="outlined"
                    onClick={() => {}}
                    className="bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                  />
                ))}
              </div>
            </div>

            <div>
              <p className="mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                Date Added
              </p>
              <DatePicker.RangePicker style={{ width: '100%' }} />
            </div>
          </div>
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() => setIsFilterModalOpen(false)}
            className="text-gray-700 dark:text-gray-300"
          >
            Cancel
          </Button>
          <Button
            variant="outlined"
            className="border-gray-300 text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-800"
            onClick={() => setIsFilterModalOpen(false)}
          >
            Reset
          </Button>
          <Button
            variant="contained"
            className="bg-blue-600 hover:bg-blue-700 dark:bg-blue-600 dark:hover:bg-blue-700"
            onClick={() => {
              setIsFilterModalOpen(false);
            }}
          >
            Apply Filters
          </Button>
        </DialogActions>
      </Dialog>

      {actionMenu}

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

export default Products;
