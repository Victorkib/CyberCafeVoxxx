import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { verifyEmail } from '../redux/slices/authSlice';
import { Loader2, CheckCircle2, XCircle, Mail } from 'lucide-react';

const VerifyEmail = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { loading, error, isAuthenticated } = useSelector((state) => state.auth);

  useEffect(() => {
    const token = searchParams.get('token');
    console.log("token: ", token);
    if (token) {
      dispatch(verifyEmail(token))
        .unwrap()
        .then(() => {
          // Redirect to appropriate page after 3 seconds on success
          setTimeout(() => {
            if (isAuthenticated) {
              navigate('/dashboard');
            } else {
              navigate('/');
            }
          }, 3000);
        })
        .catch(() => {
          // Redirect to home page after 5 seconds on error
          setTimeout(() => {
            navigate('/');
          }, 5000);
        });
    } else {
      // If no token, redirect to home page
      navigate('/');
    }
  }, [dispatch, navigate, searchParams, isAuthenticated]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-blue-100 dark:bg-blue-900">
            <Mail className="h-6 w-6 text-blue-600 dark:text-blue-300" />
          </div>
          <h2 className="mt-6 text-3xl font-extrabold text-gray-900 dark:text-white">
            Email Verification
          </h2>
        </div>

        <div className="mt-8 space-y-6">
          {loading ? (
            <div className="flex flex-col items-center justify-center space-y-4">
              <Loader2 className="h-12 w-12 text-blue-500 animate-spin" />
              <p className="text-gray-600 dark:text-gray-300">
                Verifying your email...
              </p>
            </div>
          ) : error ? (
            <div className="flex flex-col items-center justify-center space-y-4">
              <XCircle className="h-12 w-12 text-red-500" />
              <p className="text-red-500 text-center">
                {error}
              </p>
              <p className="text-gray-600 dark:text-gray-300 text-sm">
                You will be redirected to the home page shortly.
              </p>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center space-y-4">
              <CheckCircle2 className="h-12 w-12 text-green-500" />
              <p className="text-green-500 text-center">
                Email verified successfully!
              </p>
              <p className="text-gray-600 dark:text-gray-300 text-sm">
                {isAuthenticated 
                  ? 'You will be redirected to your dashboard shortly.'
                  : 'You will be redirected to the home page shortly.'}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default VerifyEmail; 