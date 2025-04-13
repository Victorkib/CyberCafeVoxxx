import { Navigate, useLocation } from 'react-router-dom';
import { useSelector } from 'react-redux';

const ProtectedRoute = ({ children, requiredRole }) => {
  const { user, isAuthenticated } = useSelector((state) => state.auth);
  const location = useLocation();

  // Allow access to admin invitation routes without authentication
  if (location.pathname.startsWith('/admin/invitation/')) {
    return children;
  }

  if (!isAuthenticated) {
    // Redirect to admin login if trying to access admin routes
    if (location.pathname.startsWith('/admin')) {
      return <Navigate to="/admin/login" state={{ from: location }} replace />;
    }
    // Redirect to regular login for other protected routes
    return <Navigate to="/" state={{ from: location }} replace />;
  }

  // Check role-based access
  if (requiredRole) {
    if (requiredRole === 'admin' && !['admin', 'super_admin'].includes(user.role)) {
      return <Navigate to="/" state={{ from: location }} replace />;
    }
    if (requiredRole === 'super_admin' && user.role !== 'super_admin') {
      return <Navigate to="/" state={{ from: location }} replace />;
    }
  }

  return children;
};

export default ProtectedRoute;
