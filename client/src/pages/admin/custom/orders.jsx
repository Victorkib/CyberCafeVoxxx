import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'react-hot-toast';
import {
  Search,
  Filter,
  Eye,
  Package,
  Truck,
  CreditCard,
  AlertCircle,
  CheckCircle,
  XCircle,
} from 'lucide-react';
import {
  fetchOrders,
  updateOrderStatus,
  updateOrderTracking,
  cancelOrder,
  refundOrder,
} from '@/redux/slices/adminSlice';

const Orders = () => {
  const dispatch = useDispatch();
  const { orders, loading } = useSelector((state) => state.admin);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [trackingInfo, setTrackingInfo] = useState({
    trackingNumber: '',
    carrier: '',
  });

  useEffect(() => {
    dispatch(fetchOrders());
  }, [dispatch]);

  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
  };

  const handleStatusFilter = (value) => {
    setStatusFilter(value);
  };

  const handleUpdateStatus = async (orderId, status) => {
    try {
      await dispatch(updateOrderStatus({ id: orderId, status })).unwrap();
      toast.success('Order status updated successfully');
    } catch (error) {
      toast.error(error.message || 'Failed to update order status');
    }
  };

  const handleUpdateTracking = async (orderId) => {
    try {
      await dispatch(
        updateOrderTracking({
          id: orderId,
          trackingNumber: trackingInfo.trackingNumber,
          carrier: trackingInfo.carrier,
        })
      ).unwrap();
      toast.success('Tracking information updated successfully');
      setIsViewDialogOpen(false);
      setTrackingInfo({ trackingNumber: '', carrier: '' });
    } catch (error) {
      toast.error(error.message || 'Failed to update tracking information');
    }
  };

  const handleCancelOrder = async (orderId) => {
    if (window.confirm('Are you sure you want to cancel this order?')) {
      try {
        await dispatch(cancelOrder(orderId)).unwrap();
        toast.success('Order cancelled successfully');
      } catch (error) {
        toast.error(error.message || 'Failed to cancel order');
      }
    }
  };

  const handleRefundOrder = async (orderId) => {
    if (window.confirm('Are you sure you want to refund this order?')) {
      try {
        await dispatch(refundOrder(orderId)).unwrap();
        toast.success('Order refunded successfully');
      } catch (error) {
        toast.error(error.message || 'Failed to refund order');
      }
    }
  };

  const openViewDialog = (order) => {
    setSelectedOrder(order);
    setTrackingInfo({
      trackingNumber: order.trackingNumber || '',
      carrier: order.carrier || '',
    });
    setIsViewDialogOpen(true);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending':
        return 'text-yellow-600 dark:text-yellow-400';
      case 'processing':
        return 'text-blue-600 dark:text-blue-400';
      case 'shipped':
        return 'text-purple-600 dark:text-purple-400';
      case 'delivered':
        return 'text-green-600 dark:text-green-400';
      case 'cancelled':
        return 'text-red-600 dark:text-red-400';
      case 'refunded':
        return 'text-gray-600 dark:text-gray-400';
      default:
        return 'text-gray-600 dark:text-gray-400';
    }
  };

  const filteredOrders = orders.filter((order) => {
    const matchesSearch =
      order.orderNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.customer.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || order.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

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
                <Package className="mr-2 h-6 w-6 text-blue-600 dark:text-blue-400" />
                Orders
              </CardTitle>
              <CardDescription className="text-gray-500 dark:text-gray-400">
                Manage customer orders
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
                  placeholder="Search orders..."
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
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="processing">Processing</SelectItem>
                <SelectItem value="shipped">Shipped</SelectItem>
                <SelectItem value="delivered">Delivered</SelectItem>
                <SelectItem value="cancelled">Cancelled</SelectItem>
                <SelectItem value="refunded">Refunded</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Order #</TableHead>
                  <TableHead>Customer</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Total</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Payment</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredOrders.map((order) => (
                  <TableRow key={order._id}>
                    <TableCell className="font-medium">{order.orderNumber}</TableCell>
                    <TableCell>
                      <div>
                        <div className="font-medium">{order.customer.name}</div>
                        <div className="text-sm text-gray-500">{order.customer.email}</div>
                      </div>
                    </TableCell>
                    <TableCell>
                      {new Date(order.createdAt).toLocaleDateString()}
                    </TableCell>
                    <TableCell>${order.total.toFixed(2)}</TableCell>
                    <TableCell>
                      <Select
                        value={order.status}
                        onValueChange={(value) => handleUpdateStatus(order._id, value)}
                      >
                        <SelectTrigger className={`w-[130px] ${getStatusColor(order.status)}`}>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="pending">Pending</SelectItem>
                          <SelectItem value="processing">Processing</SelectItem>
                          <SelectItem value="shipped">Shipped</SelectItem>
                          <SelectItem value="delivered">Delivered</SelectItem>
                          <SelectItem value="cancelled">Cancelled</SelectItem>
                          <SelectItem value="refunded">Refunded</SelectItem>
                        </SelectContent>
                      </Select>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center">
                        <CreditCard className="h-4 w-4 mr-2" />
                        {order.paymentMethod}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => openViewDialog(order)}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        {order.status !== 'cancelled' && order.status !== 'refunded' && (
                          <>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleCancelOrder(order._id)}
                            >
                              <XCircle className="h-4 w-4 text-red-500" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleRefundOrder(order._id)}
                            >
                              <CreditCard className="h-4 w-4 text-yellow-500" />
                            </Button>
                          </>
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

      {/* View Order Dialog */}
      <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>Order Details</DialogTitle>
            <DialogDescription>
              View and manage order information
            </DialogDescription>
          </DialogHeader>
          {selectedOrder && (
            <div className="space-y-6">
              {/* Order Information */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h3 className="font-medium mb-2">Order Information</h3>
                  <div className="space-y-1 text-sm">
                    <p>
                      <span className="font-medium">Order Number:</span>{' '}
                      {selectedOrder.orderNumber}
                    </p>
                    <p>
                      <span className="font-medium">Date:</span>{' '}
                      {new Date(selectedOrder.createdAt).toLocaleString()}
                    </p>
                    <p>
                      <span className="font-medium">Status:</span>{' '}
                      <span className={getStatusColor(selectedOrder.status)}>
                        {selectedOrder.status}
                      </span>
                    </p>
                    <p>
                      <span className="font-medium">Total:</span> $
                      {selectedOrder.total.toFixed(2)}
                    </p>
                  </div>
                </div>
                <div>
                  <h3 className="font-medium mb-2">Customer Information</h3>
                  <div className="space-y-1 text-sm">
                    <p>
                      <span className="font-medium">Name:</span>{' '}
                      {selectedOrder.customer.name}
                    </p>
                    <p>
                      <span className="font-medium">Email:</span>{' '}
                      {selectedOrder.customer.email}
                    </p>
                    <p>
                      <span className="font-medium">Phone:</span>{' '}
                      {selectedOrder.customer.phone}
                    </p>
                  </div>
                </div>
              </div>

              {/* Shipping Information */}
              <div>
                <h3 className="font-medium mb-2">Shipping Information</h3>
                <div className="space-y-1 text-sm">
                  <p>
                    <span className="font-medium">Address:</span>{' '}
                    {selectedOrder.shippingAddress.street},{' '}
                    {selectedOrder.shippingAddress.city},{' '}
                    {selectedOrder.shippingAddress.state}{' '}
                    {selectedOrder.shippingAddress.zipCode}
                  </p>
                  <p>
                    <span className="font-medium">Country:</span>{' '}
                    {selectedOrder.shippingAddress.country}
                  </p>
                </div>
              </div>

              {/* Tracking Information */}
              <div>
                <h3 className="font-medium mb-2">Tracking Information</h3>
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="carrier">Carrier</Label>
                      <Input
                        id="carrier"
                        value={trackingInfo.carrier}
                        onChange={(e) =>
                          setTrackingInfo({
                            ...trackingInfo,
                            carrier: e.target.value,
                          })
                        }
                      />
                    </div>
                    <div>
                      <Label htmlFor="trackingNumber">Tracking Number</Label>
                      <Input
                        id="trackingNumber"
                        value={trackingInfo.trackingNumber}
                        onChange={(e) =>
                          setTrackingInfo({
                            ...trackingInfo,
                            trackingNumber: e.target.value,
                          })
                        }
                      />
                    </div>
                  </div>
                  <Button onClick={() => handleUpdateTracking(selectedOrder._id)}>
                    Update Tracking
                  </Button>
                </div>
              </div>

              {/* Order Items */}
              <div>
                <h3 className="font-medium mb-2">Order Items</h3>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Product</TableHead>
                      <TableHead>Quantity</TableHead>
                      <TableHead>Price</TableHead>
                      <TableHead>Total</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {selectedOrder.items.map((item) => (
                      <TableRow key={item._id}>
                        <TableCell>{item.product.name}</TableCell>
                        <TableCell>{item.quantity}</TableCell>
                        <TableCell>${item.price.toFixed(2)}</TableCell>
                        <TableCell>
                          ${(item.quantity * item.price).toFixed(2)}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsViewDialogOpen(false)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Orders; 