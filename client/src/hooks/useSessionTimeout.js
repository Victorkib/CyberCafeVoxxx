import { useEffect, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { refreshToken, logoutUser } from '../redux/slices/authSlice';
import { openAuthModal } from '../redux/slices/uiSlice'; // Optional

export const useSessionTimeout = () => {
  const dispatch = useDispatch();
  const { isAuthenticated } = useSelector((state) => state.auth);
  const refreshTimerRef = useRef(null);
  const inactivityTimerRef = useRef(null);

  // Setup refresh token timer - refresh before token expires
  useEffect(() => {
    if (!isAuthenticated) return;

    const setupRefreshTimer = () => {
      if (refreshTimerRef.current) {
        clearInterval(refreshTimerRef.current);
      }

      // Refresh token every 10 minutes (before 15-min access token expires)
      refreshTimerRef.current = setInterval(() => {
        console.log('Scheduled refresh triggered');
        dispatch(refreshToken())
          .unwrap()
          .catch((error) => {
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
    if (!isAuthenticated) return;

    const resetInactivityTimer = () => {
      if (inactivityTimerRef.current) {
        clearTimeout(inactivityTimerRef.current);
      }

      // After 14 minutes of inactivity, try to refresh the token
      // (just before the 15-min token expires)
      inactivityTimerRef.current = setTimeout(() => {
        console.log('Inactivity refresh triggered');
        dispatch(refreshToken())
          .unwrap()
          .catch(() => {
            console.log('Inactivity refresh failed, logging out');
            dispatch(logoutUser());
            dispatch(openAuthModal('login')); // Optional: show login modal
          });
      }, 14 * 60 * 1000); // 14 minutes
    };

    const activityEvents = [
      'mousedown',
      'mousemove',
      'keypress',
      'scroll',
      'touchstart',
    ];

    const activityListener = () => {
      resetInactivityTimer();
    };

    // Add event listeners for user activity
    activityEvents.forEach((event) =>
      document.addEventListener(event, activityListener)
    );

    // Initial setup of inactivity timer
    resetInactivityTimer();

    return () => {
      if (inactivityTimerRef.current) {
        clearTimeout(inactivityTimerRef.current);
      }

      // Clean up event listeners
      activityEvents.forEach((event) =>
        document.removeEventListener(event, activityListener)
      );
    };
  }, [isAuthenticated, dispatch]);
};

export default useSessionTimeout;
