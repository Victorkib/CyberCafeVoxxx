import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { CheckCircle2, ShoppingBag, ArrowRight } from 'lucide-react';

export default function OrderConfirmationPage() {
  const { currentOrder } = useSelector((state) => state.orders);

  useEffect(() => {
    if (!currentOrder) {
      // Redirect to home if no order is found
      window.location.href = '/';
    }
  }, [currentOrder]);

  if (!currentOrder) {
    return null;
  }

  return (
    <div className="container mx-auto px-4 py-16">
      <div className="max-w-2xl mx-auto text-center">
        <div className="mb-8">
          <CheckCircle2 className="w-16 h-16 text-green-500 mx-auto" />
        </div>
        <h1 className="text-3xl font-bold text-gray-900 mb-4">
          Thank you for your order!
        </h1>
        <p className="text-lg text-gray-600 mb-8">
          Your order has been successfully placed. We'll send you an email with your order details and tracking information.
        </p>

        <div className="bg-white rounded-lg shadow p-6 mb-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold">Order Details</h2>
            <span className="text-sm text-gray-500">
              Order #{currentOrder._id.slice(-6)}
            </span>
          </div>

          <div className="space-y-4">
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Order Date</span>
              <span className="font-medium">
                {new Date(currentOrder.createdAt).toLocaleDateString()}
              </span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Total Amount</span>
              <span className="font-medium">${currentOrder.total.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Payment Method</span>
              <span className="font-medium">
                {currentOrder.payment.method === 'credit_card'
                  ? 'Credit Card'
                  : 'PayPal'}
              </span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Shipping Address</span>
              <span className="font-medium text-right">
                {currentOrder.shipping.firstName} {currentOrder.shipping.lastName}
                <br />
                {currentOrder.shipping.address}
                <br />
                {currentOrder.shipping.city}, {currentOrder.shipping.state}{' '}
                {currentOrder.shipping.zipCode}
                <br />
                {currentOrder.shipping.country}
              </span>
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <Link
            to="/shop"
            className="inline-flex items-center px-6 py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            <ShoppingBag className="w-5 h-5 mr-2" />
            Continue Shopping
          </Link>
          <div>
            <Link
              to="/orders"
              className="inline-flex items-center text-blue-600 hover:text-blue-700"
            >
              View Order History
              <ArrowRight className="w-4 h-4 ml-1" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
} 