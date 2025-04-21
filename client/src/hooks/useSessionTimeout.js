import { useEffect, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { refreshToken, logoutUser } from '../redux/slices/authSlice';
import { openAuthModal } from '../redux/slices/uiSlice'; // Optional

export const useSessionTimeout = () => {
  const dispatch = useDispatch();
  const { isAuthenticated } = useSelector((state) => state.auth);
  const refreshTimerRef = useRef(null);
  const inactivityTimerRef = useRef(null);

  // Setup refresh token timer
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token || !isAuthenticated) return;

    const setupRefreshTimer = () => {
      if (refreshTimerRef.current) {
        clearInterval(refreshTimerRef.current);
      }

      refreshTimerRef.current = setInterval(() => {
        dispatch(refreshToken())
          .unwrap()
          .catch(error => {
            console.error('Auto-refresh failed:', error);
            dispatch(logoutUser());
            dispatch(openAuthModal('login')); // Optional: prompt re-login
          });
      }, 10 * 60 * 1000); // Every 10 min
    };

    setupRefreshTimer();

    return () => {
      if (refreshTimerRef.current) {
        clearInterval(refreshTimerRef.current);
      }
    };
  }, [isAuthenticated, dispatch]);

  // Setup inactivity detection
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token || !isAuthenticated) return;

    const resetInactivityTimer = () => {
      if (inactivityTimerRef.current) {
        clearTimeout(inactivityTimerRef.current);
      }

      inactivityTimerRef.current = setTimeout(() => {
        dispatch(refreshToken())
          .unwrap()
          .catch(() => {
            console.log('Inactivity refresh failed, logging out');
            dispatch(logoutUser());
            dispatch(openAuthModal('login')); // Optional: show login modal
          });
      }, 25 * 60 * 1000); // 25 minutes
    };

    const activityEvents = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart'];
    const activityListener = () => resetInactivityTimer();

    activityEvents.forEach(event =>
      document.addEventListener(event, activityListener)
    );

    resetInactivityTimer();

    return () => {
      if (inactivityTimerRef.current) {
        clearTimeout(inactivityTimerRef.current);
      }

      activityEvents.forEach(event =>
        document.removeEventListener(event, activityListener)
      );
    };
  }, [isAuthenticated, dispatch]);
};

export default useSessionTimeout;
