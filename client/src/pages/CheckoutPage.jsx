import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import {
  CreditCard,
  Truck,
  Lock,
  ChevronLeft,
  CheckCircle2,
  Loader2,
} from 'lucide-react';
import { createOrder } from '../redux/slices/orderSlice';
import { clearCart } from '../redux/slices/cartSlice';
import { getPaymentMethods, initializePayment, checkPaymentStatus } from '../redux/slices/paymentSlice';
import { toast } from 'react-hot-toast';
import formatCurrency from '../utils/formatCurrency';

export default function CheckoutPage() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { items, total } = useSelector((state) => state.cart);
  const { user } = useSelector((state) => state.auth);
  const { methods, loading: paymentLoading, error: paymentError } = useSelector((state) => state.payment);

  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    shipping: {
      firstName: user?.firstName || '',
      lastName: user?.lastName || '',
      email: user?.email || '',
      phone: user?.phone || '',
      address: '',
      city: '',
      state: '',
      zipCode: '',
      country: 'United States',
    },
    payment: {
      method: '',
      phoneNumber: '',
    },
  });

  useEffect(() => {
    dispatch(getPaymentMethods());
  }, [dispatch]);

  const handleInputChange = (section, field, value) => {
    setFormData((prev) => ({
      ...prev,
      [section]: {
        ...prev[section],
        [field]: value,
      },
    }));
  };

  const validateShipping = () => {
    const { shipping } = formData;
    return (
      shipping.firstName &&
      shipping.lastName &&
      shipping.email &&
      shipping.phone &&
      shipping.address &&
      shipping.city &&
      shipping.state &&
      shipping.zipCode
    );
  };

  const validatePayment = () => {
    const { payment } = formData;
    if (!payment.method) {
      toast.error('Please select a payment method');
      return false;
    }
    if (payment.method === 'mpesa' && !payment.phoneNumber) {
      toast.error('Please enter your phone number for M-Pesa payment');
      return false;
    }
    return true;
  };

  const handleNext = () => {
    if (step === 1 && !validateShipping()) {
      toast.error('Please fill in all shipping information');
      return;
    }
    if (step === 2 && !validatePayment()) {
      return;
    }
    setStep((prev) => prev + 1);
  };

  const handleBack = () => {
    setStep((prev) => prev - 1);
  };

  const handleSubmit = async () => {
    try {
      // Create order first
      const orderData = {
        items: items.map((item) => ({
          product: item._id,
          quantity: item.quantity,
          price: item.price,
        })),
        shipping: formData.shipping,
        payment: {
          method: formData.payment.method,
        },
        total,
      };

      const orderResult = await dispatch(createOrder(orderData)).unwrap();

      // Initialize payment
      const paymentResult = await dispatch(initializePayment({
        method: formData.payment.method,
        orderId: orderResult._id,
        phoneNumber: formData.payment.phoneNumber,
      })).unwrap();

      // Handle different payment methods
      switch (formData.payment.method) {
        case 'mpesa':
          // M-Pesa payment is initiated via STK Push
          toast.success('Please check your phone for the M-Pesa prompt');
          // Start polling for payment status
          startPaymentStatusCheck(orderResult._id);
          break;

        case 'paystack':
          // Redirect to Paystack payment page
          window.location.href = paymentResult.data.authorization_url;
          break;

        case 'paypal':
          // Handle PayPal payment
          if (window.paypal) {
            window.paypal.Buttons({
              createOrder: () => paymentResult.data.id,
              onApprove: async (data) => {
                try {
                  await dispatch(checkPaymentStatus(orderResult._id)).unwrap();
                  dispatch(clearCart());
                  toast.success('Payment successful!');
                  navigate('/order-confirmation');
                } catch (error) {
                  toast.error('Failed to verify payment');
                }
              },
            }).render('#paypal-button-container');
          }
          break;

        default:
          toast.error('Unsupported payment method');
          return;
      }
    } catch (error) {
      toast.error(error.message || 'Failed to process payment');
    }
  };

  // Add payment status polling
  const startPaymentStatusCheck = (orderId) => {
    const checkStatus = async () => {
      try {
        const result = await dispatch(checkPaymentStatus(orderId)).unwrap();
        if (result.status === 'paid') {
          toast.success('Payment successful!');
          navigate('/order-confirmation');
          return true;
        } else if (result.status === 'failed') {
          toast.error('Payment failed');
          return true;
        }
        return false;
      } catch (error) {
        console.error('Error checking payment status:', error);
        return true;
      }
    };

    const poll = async () => {
      const shouldStop = await checkStatus();
      if (!shouldStop) {
        setTimeout(poll, 5000); // Check every 5 seconds
      }
    };

    poll();
  };

  if (!items.length) {
    navigate('/cart');
    return null;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        {/* Progress Steps */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center">
            <div
              className={`w-8 h-8 rounded-full flex items-center justify-center ${
                step >= 1 ? 'bg-blue-600 text-white' : 'bg-gray-200'
              }`}
            >
              1
            </div>
            <div className="ml-2">Shipping</div>
          </div>
          <div className="flex-1 h-1 mx-4 bg-gray-200">
            <div
              className="h-full bg-blue-600"
              style={{ width: `${((step - 1) / 2) * 100}%` }}
            />
          </div>
          <div className="flex items-center">
            <div
              className={`w-8 h-8 rounded-full flex items-center justify-center ${
                step >= 2 ? 'bg-blue-600 text-white' : 'bg-gray-200'
              }`}
            >
              2
            </div>
            <div className="ml-2">Payment</div>
          </div>
          <div className="flex-1 h-1 mx-4 bg-gray-200">
            <div
              className="h-full bg-blue-600"
              style={{ width: `${((step - 1) / 2) * 100}%` }}
            />
          </div>
          <div className="flex items-center">
            <div
              className={`w-8 h-8 rounded-full flex items-center justify-center ${
                step >= 3 ? 'bg-blue-600 text-white' : 'bg-gray-200'
              }`}
            >
              3
            </div>
            <div className="ml-2">Review</div>
          </div>
        </div>

        {/* Step Content */}
        <div className="bg-white rounded-lg shadow p-6">
          {step === 1 && (
            <div>
              <h2 className="text-2xl font-bold mb-6">Shipping Information</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    First Name
                  </label>
                  <input
                    type="text"
                    value={formData.shipping.firstName}
                    onChange={(e) =>
                      handleInputChange('shipping', 'firstName', e.target.value)
                    }
                    className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Last Name
                  </label>
                  <input
                    type="text"
                    value={formData.shipping.lastName}
                    onChange={(e) =>
                      handleInputChange('shipping', 'lastName', e.target.value)
                    }
                    className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Email
                  </label>
                  <input
                    type="email"
                    value={formData.shipping.email}
                    onChange={(e) =>
                      handleInputChange('shipping', 'email', e.target.value)
                    }
                    className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Phone
                  </label>
                  <input
                    type="tel"
                    value={formData.shipping.phone}
                    onChange={(e) =>
                      handleInputChange('shipping', 'phone', e.target.value)
                    }
                    className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Address
                  </label>
                  <input
                    type="text"
                    value={formData.shipping.address}
                    onChange={(e) =>
                      handleInputChange('shipping', 'address', e.target.value)
                    }
                    className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    City
                  </label>
                  <input
                    type="text"
                    value={formData.shipping.city}
                    onChange={(e) =>
                      handleInputChange('shipping', 'city', e.target.value)
                    }
                    className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    State
                  </label>
                  <input
                    type="text"
                    value={formData.shipping.state}
                    onChange={(e) =>
                      handleInputChange('shipping', 'state', e.target.value)
                    }
                    className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    ZIP Code
                  </label>
                  <input
                    type="text"
                    value={formData.shipping.zipCode}
                    onChange={(e) =>
                      handleInputChange('shipping', 'zipCode', e.target.value)
                    }
                    className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Country
                  </label>
                  <input
                    type="text"
                    value={formData.shipping.country}
                    onChange={(e) =>
                      handleInputChange('shipping', 'country', e.target.value)
                    }
                    className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
            </div>
          )}

          {step === 2 && (
            <div>
              <h2 className="text-2xl font-bold mb-6">Payment Method</h2>
              <div className="space-y-4">
                {paymentLoading ? (
                  <div className="flex items-center justify-center py-8">
                    <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
                  </div>
                ) : (
                  methods.map((method) => (
                    <div
                      key={method.id}
                      className={`border rounded-lg p-4 cursor-pointer ${
                        formData.payment.method === method.id
                          ? 'border-blue-600 bg-blue-50'
                          : 'border-gray-200'
                      }`}
                      onClick={() =>
                        handleInputChange('payment', 'method', method.id)
                      }
                    >
                      <div className="flex items-center">
                        <img
                          src={method.icon}
                          alt={method.name}
                          className="w-8 h-8 mr-4"
                        />
                        <div>
                          <h3 className="font-medium">{method.name}</h3>
                          <p className="text-sm text-gray-500">
                            {method.description}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))
                )}

                {formData.payment.method === 'mpesa' && (
                  <div className="mt-4">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Phone Number
                    </label>
                    <input
                      type="tel"
                      value={formData.payment.phoneNumber}
                      onChange={(e) =>
                        handleInputChange('payment', 'phoneNumber', e.target.value)
                      }
                      placeholder="e.g., 254712345678"
                      className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                )}
              </div>
            </div>
          )}

          {step === 3 && (
            <div>
              <h2 className="text-2xl font-bold mb-6">Review Order</h2>
              <div className="space-y-6">
                {/* Shipping Information */}
                <div>
                  <h3 className="font-medium mb-2">Shipping Information</h3>
                  <div className="bg-gray-50 p-4 rounded-md">
                    <p>
                      {formData.shipping.firstName} {formData.shipping.lastName}
                    </p>
                    <p>{formData.shipping.email}</p>
                    <p>{formData.shipping.phone}</p>
                    <p>
                      {formData.shipping.address}, {formData.shipping.city},{' '}
                      {formData.shipping.state} {formData.shipping.zipCode}
                    </p>
                    <p>{formData.shipping.country}</p>
                  </div>
                </div>

                {/* Payment Method */}
                <div>
                  <h3 className="font-medium mb-2">Payment Method</h3>
                  <div className="bg-gray-50 p-4 rounded-md">
                    <p>
                      {methods.find((m) => m.id === formData.payment.method)?.name}
                    </p>
                    {formData.payment.method === 'mpesa' && (
                      <p>Phone: {formData.payment.phoneNumber}</p>
                    )}
                  </div>
                </div>

                {/* Order Summary */}
                <div>
                  <h3 className="font-medium mb-2">Order Summary</h3>
                  <div className="bg-gray-50 p-4 rounded-md">
                    {items.map((item) => (
                      <div
                        key={item._id}
                        className="flex justify-between py-2 border-b last:border-0"
                      >
                        <div>
                          <p className="font-medium">{item.name}</p>
                          <p className="text-sm text-gray-500">
                            Quantity: {item.quantity}
                          </p>
                        </div>
                        <p className="font-medium">
                          {formatCurrency(item.price * item.quantity)}
                        </p>
                      </div>
                    ))}
                    <div className="mt-4 pt-4 border-t">
                      <div className="flex justify-between font-medium">
                        <p>Total</p>
                        <p>{formatCurrency(total)}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Navigation Buttons */}
          <div className="mt-8 flex justify-between">
            {step > 1 && (
              <button
                onClick={handleBack}
                className="flex items-center px-4 py-2 text-gray-600 hover:text-gray-900"
              >
                <ChevronLeft className="w-5 h-5 mr-1" />
                Back
              </button>
            )}
            <div className="ml-auto">
              {step < 3 ? (
                <button
                  onClick={handleNext}
                  className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                >
                  Next
                </button>
              ) : (
                <button
                  onClick={handleSubmit}
                  disabled={paymentLoading}
                  className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {paymentLoading ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : (
                    'Place Order'
                  )}
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 