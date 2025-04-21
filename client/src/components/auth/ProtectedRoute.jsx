import { Navigate, useLocation } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { useEffect, useRef, useState } from 'react';
import { logoutUser } from '../../redux/slices/authSlice';
import { openAuthModal } from '../../redux/slices/uiSlice';

const ProtectedRoute = ({ children, allowedRoles }) => {
  const dispatch = useDispatch();
  const { user, isAuthenticated, loading } = useSelector((state) => state.auth);
  const location = useLocation();
  const hasCheckedToken = useRef(false);
  const isHandlingInvalidToken = useRef(false);
  const [shouldShowLogin, setShouldShowLogin] = useState(false);

  // Allow access to admin invitation routes without authentication
  if (location.pathname.startsWith('/admin/invitation/')) {
    return children;
  }

  // Check if token exists but is invalid
  useEffect(() => {
    const handleInvalidToken = async () => {
      if (isHandlingInvalidToken.current) return;
      
      const token = localStorage.getItem('token');
      if (token && !isAuthenticated && !loading && !hasCheckedToken.current) {
        isHandlingInvalidToken.current = true;
        hasCheckedToken.current = true;
        
        try {
          // First logout
          await dispatch(logoutUser()).unwrap();
          // Then show login modal after a small delay
          setTimeout(() => {
            setShouldShowLogin(true);
            isHandlingInvalidToken.current = false;
          }, 100);
        } catch (error) {
          isHandlingInvalidToken.current = false;
        }
      }
    };

    handleInvalidToken();
  }, [isAuthenticated, loading, dispatch]);

  // Handle showing login modal
  useEffect(() => {
    if (shouldShowLogin) {
      dispatch(openAuthModal('login'));
      setShouldShowLogin(false);
    }
  }, [shouldShowLogin, dispatch]);

  // Handle unauthenticated state
  useEffect(() => {
    if (!isAuthenticated && !loading) {
      setShouldShowLogin(true);
    }
  }, [isAuthenticated, loading]);

  // Show loading state while checking authentication
  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  // Check role-based access
  if (allowedRoles && !allowedRoles.includes(user?.role)) {
    return <Navigate to="/" replace />;
  }

  return children;
};

export default ProtectedRoute;
