import { Outlet, useLocation, Navigate } from 'react-router-dom';
import Cookies from 'js-cookie';
import { ArrowUpCircle } from 'lucide-react';
import { useEffect, useState } from 'react';
import './layout.scss';
import { TailSpin } from 'react-loader-spinner';
// import { useDispatch } from 'react-redux';
import apiRequest from '../utils/api';

export const Layout = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const location = useLocation();

  // Function to determine if the current navigation is an anchor link
  const isAnchorLink = (pathname) => pathname.includes('#');

  // Handle scroll visibility for the button
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 200) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };

    window.addEventListener('scroll', handleScroll);

    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  // Scroll to top on route change, but skip for in-page navigation
  useEffect(() => {
    if (!isAnchorLink(location.hash)) {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }, [location]);

  return (
    <div className="layout">
      <TopBar />
      <main className="layoutMain">
        <Outlet />
      </main>
      <button
        className={`scroll-to-top ${isScrolled ? 'visible' : ''}`}
        onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
      >
        <ArrowUpCircle size={24} />
      </button>
    </div>
  );
};

export const RequireAuth = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(null); // null indicates "loading" state
  const [loading, setLoading] = useState(true);
  // const dispatch = useDispatch();

  useEffect(() => {
    const verifyToken = async () => {
      const token =
        Cookies.get('authToken') || localStorage.getItem('authToken');
      if (!token) {
        setIsAuthenticated(false);
        setLoading(false);
        return;
      }

      try {
        const response = await apiRequest.post('/verifyToken', { token });
        if (response.data?.isValid) {
          setIsAuthenticated(true);
          // dispatch(setUser(response.data.user));
        } else {
          setIsAuthenticated(false);
        }
      } catch (error) {
        console.error('Token validation failed:', error);
        setIsAuthenticated(false);
      } finally {
        setLoading(false);
      }
    };

    verifyToken();
  }, []);

  if (loading) {
    return (
      <>
        {loading && (
          <div className="loader-overlay">
            <TailSpin
              height="100"
              width="100"
              color="#4fa94d"
              ariaLabel="loading"
              visible={true}
            />
          </div>
        )}
      </>
    ); // Replace with a spinner or custom loading component
  }

  return isAuthenticated ? <Outlet /> : <Navigate to="/login" replace />;
};
