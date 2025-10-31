import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { checkPaymentStatus } from '../../redux/slices/paymentSlice';
import { toast } from 'react-toastify';

const PaymentCallback = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [processing, setProcessing] = useState(true);
  const [paymentResult, setPaymentResult] = useState(null);

  useEffect(() => {
    const handlePaymentCallback = async () => {
      try {
        // Get parameters from URL
        const reference = searchParams.get('reference');
        const trxref = searchParams.get('trxref');
        const orderId =
          searchParams.get('orderId') || searchParams.get('order_id');

        // Paystack sends 'reference', M-Pesa might send 'trxref'
        const paymentReference = reference || trxref;

        if (!paymentReference && !orderId) {
          throw new Error('No payment reference or order ID found');
        }

        // Check payment status
        const result = await dispatch(
          checkPaymentStatus(orderId || paymentReference)
        ).unwrap();

        setPaymentResult(result);

        if (result.status === 'paid' || result.status === 'success') {
          toast.success('Payment successful! Redirecting...');

          // Store payment success in localStorage for the shop page to detect
          localStorage.setItem(
            'paymentSuccess',
            JSON.stringify({
              orderId: result.orderId,
              reference: paymentReference,
              timestamp: new Date().toISOString(),
            })
          );

          // Redirect back to shop page after 2 seconds
          setTimeout(() => {
            navigate('/shop?payment=success', { replace: true });
          }, 2000);
        } else if (
          result.status === 'failed' ||
          result.status === 'cancelled'
        ) {
          toast.error('Payment failed or was cancelled');

          // Store payment failure in localStorage
          localStorage.setItem(
            'paymentFailure',
            JSON.stringify({
              orderId: result.orderId,
              reference: paymentReference,
              reason: result.failureReason || 'Payment failed',
              timestamp: new Date().toISOString(),
            })
          );

          // Redirect back to shop page
          setTimeout(() => {
            navigate('/shop?payment=failed', { replace: true });
          }, 2000);
        } else {
          // Payment is still pending
          toast.info('Payment is being processed...');

          setTimeout(() => {
            navigate('/shop?payment=pending', { replace: true });
          }, 2000);
        }
      } catch (error) {
        console.error('Payment callback error:', error);
        toast.error('Error processing payment callback');

        // Redirect back to shop with error
        setTimeout(() => {
          navigate('/shop?payment=error', { replace: true });
        }, 2000);
      } finally {
        setProcessing(false);
      }
    };

    handlePaymentCallback();
  }, [searchParams, navigate, dispatch]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8 text-center">
        {processing ? (
          <>
            <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <h2 className="text-xl font-semibold text-gray-900 mb-2">
              Processing Payment...
            </h2>
            <p className="text-gray-600">
              Please wait while we verify your payment.
            </p>
          </>
        ) : (
          <>
            {paymentResult?.status === 'paid' ||
            paymentResult?.status === 'success' ? (
              <>
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg
                    className="w-8 h-8 text-green-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M5 13l4 4L19 7"
                    ></path>
                  </svg>
                </div>
                <h2 className="text-xl font-semibold text-gray-900 mb-2">
                  Payment Successful!
                </h2>
                <p className="text-gray-600 mb-4">
                  Your payment has been processed successfully.
                </p>
              </>
            ) : (
              <>
                <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg
                    className="w-8 h-8 text-red-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M6 18L18 6M6 6l12 12"
                    ></path>
                  </svg>
                </div>
                <h2 className="text-xl font-semibold text-gray-900 mb-2">
                  Payment{' '}
                  {paymentResult?.status === 'failed' ? 'Failed' : 'Cancelled'}
                </h2>
                <p className="text-gray-600 mb-4">
                  {paymentResult?.failureReason ||
                    'Your payment could not be processed.'}
                </p>
              </>
            )}
            <p className="text-sm text-gray-500">
              Redirecting you back to the shop...
            </p>
          </>
        )}
      </div>
    </div>
  );
};

export default PaymentCallback;
