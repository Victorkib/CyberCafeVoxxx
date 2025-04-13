import React from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { AlertTriangle, Shield, Clock, X } from 'lucide-react';
import { format } from 'date-fns';
import { toast } from 'react-toastify';

const SecurityAlerts = () => {
  const dispatch = useDispatch();
  const { securityAlerts, user, passwordExpiryDays } = useSelector((state) => state.auth);
  const { sessions } = useSelector((state) => state.auth);

  const getAlertIcon = (type) => {
    switch (type) {
      case 'warning':
        return <AlertTriangle className="w-5 h-5 text-yellow-500" />;
      case 'danger':
        return <Shield className="w-5 h-5 text-red-500" />;
      default:
        return <Clock className="w-5 h-5 text-blue-500" />;
    }
  };

  const handleDismissAlert = (alertId) => {
    dispatch({ type: 'auth/dismissAlert', payload: alertId });
  };

  const renderPasswordExpiryWarning = () => {
    if (!passwordExpiryDays) return null;

    if (passwordExpiryDays <= 0) {
      return (
        <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-4">
          <div className="flex items-center">
            <Shield className="w-5 h-5 text-red-500 mr-2" />
            <div>
              <h3 className="font-medium text-red-800">Password Expired</h3>
              <p className="text-sm text-red-700">
                Your password has expired. Please change it immediately to maintain access to your account.
              </p>
            </div>
          </div>
        </div>
      );
    }

    if (passwordExpiryDays <= 7) {
      return (
        <div className="bg-yellow-50 border-l-4 border-yellow-500 p-4 mb-4">
          <div className="flex items-center">
            <AlertTriangle className="w-5 h-5 text-yellow-500 mr-2" />
            <div>
              <h3 className="font-medium text-yellow-800">Password Expiring Soon</h3>
              <p className="text-sm text-yellow-700">
                Your password will expire in {passwordExpiryDays} days. Please change it soon.
              </p>
            </div>
          </div>
        </div>
      );
    }

    return null;
  };

  const renderActiveSessions = () => {
    if (!sessions || sessions.length <= 1) return null;

    return (
      <div className="bg-blue-50 border-l-4 border-blue-500 p-4 mb-4">
        <div className="flex items-center">
          <Clock className="w-5 h-5 text-blue-500 mr-2" />
          <div>
            <h3 className="font-medium text-blue-800">Active Sessions</h3>
            <p className="text-sm text-blue-700">
              You have {sessions.length} active sessions on different devices.
            </p>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-4">
      {renderPasswordExpiryWarning()}
      {renderActiveSessions()}
      
      {securityAlerts.map((alert) => (
        <div
          key={alert.id}
          className={`border-l-4 p-4 ${
            alert.type === 'danger'
              ? 'bg-red-50 border-red-500'
              : alert.type === 'warning'
              ? 'bg-yellow-50 border-yellow-500'
              : 'bg-blue-50 border-blue-500'
          }`}
        >
          <div className="flex justify-between items-start">
            <div className="flex items-start">
              {getAlertIcon(alert.type)}
              <div className="ml-3">
                <h3 className={`text-sm font-medium ${
                  alert.type === 'danger'
                    ? 'text-red-800'
                    : alert.type === 'warning'
                    ? 'text-yellow-800'
                    : 'text-blue-800'
                }`}>
                  {alert.title}
                </h3>
                <p className={`mt-1 text-sm ${
                  alert.type === 'danger'
                    ? 'text-red-700'
                    : alert.type === 'warning'
                    ? 'text-yellow-700'
                    : 'text-blue-700'
                }`}>
                  {alert.message}
                </p>
                <p className="mt-1 text-xs text-gray-500">
                  {format(new Date(alert.timestamp), 'PPp')}
                </p>
              </div>
            </div>
            <button
              onClick={() => handleDismissAlert(alert.id)}
              className="ml-4 text-gray-400 hover:text-gray-500"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      ))}
    </div>
  );
};

export default SecurityAlerts; 