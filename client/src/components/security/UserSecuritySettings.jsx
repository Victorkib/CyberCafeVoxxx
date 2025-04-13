import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { toast } from 'react-toastify';
import { Card } from '../../ui/Card';
import { Button } from '../../ui/Button';
import { Input } from '../../ui/Input';
import { Shield, Key, Smartphone, History } from 'lucide-react';
import { format } from 'date-fns';

const UserSecuritySettings = () => {
  const dispatch = useDispatch();
  const { user, sessions } = useSelector((state) => state.auth);
  const [loading, setLoading] = useState(false);
  const [showChangePassword, setShowChangePassword] = useState(false);
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      toast.error('New passwords do not match');
      return;
    }

    setLoading(true);
    try {
      await dispatch(validatePasswordHistory(passwordForm.newPassword)).unwrap();
      
      const response = await fetch('/api/users/change-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          currentPassword: passwordForm.currentPassword,
          newPassword: passwordForm.newPassword,
        }),
      });

      if (!response.ok) throw new Error('Failed to change password');

      toast.success('Password changed successfully');
      setShowChangePassword(false);
      setPasswordForm({
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
      });
    } catch (error) {
      toast.error(error.message || 'Failed to change password');
    } finally {
      setLoading(false);
    }
  };

  const handleTerminateOtherSessions = async () => {
    try {
      await fetch('/api/users/sessions/terminate-others', { method: 'POST' });
      toast.success('Other sessions terminated successfully');
      // Refresh sessions list
      dispatch(createSession());
    } catch (error) {
      toast.error('Failed to terminate other sessions');
    }
  };

  const handleEnableTwoFactor = async () => {
    try {
      const response = await fetch('/api/users/2fa/enable', { method: 'POST' });
      const data = await response.json();
      
      // Show QR code or setup instructions
      // This would typically open a modal with the QR code
      toast.success('Two-factor authentication enabled');
    } catch (error) {
      toast.error('Failed to enable two-factor authentication');
    }
  };

  return (
    <div className="space-y-6 p-6">
      <h2 className="text-2xl font-bold mb-6">Security Settings</h2>

      {/* Password Management */}
      <Card className="p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-2">
            <Key className="w-5 h-5 text-gray-500" />
            <h3 className="text-lg font-semibold">Password Management</h3>
          </div>
          <Button
            variant="outline"
            onClick={() => setShowChangePassword(!showChangePassword)}
          >
            Change Password
          </Button>
        </div>

        {showChangePassword && (
          <form onSubmit={handlePasswordChange} className="space-y-4">
            <Input
              type="password"
              placeholder="Current Password"
              value={passwordForm.currentPassword}
              onChange={(e) =>
                setPasswordForm({ ...passwordForm, currentPassword: e.target.value })
              }
              required
            />
            <Input
              type="password"
              placeholder="New Password"
              value={passwordForm.newPassword}
              onChange={(e) =>
                setPasswordForm({ ...passwordForm, newPassword: e.target.value })
              }
              required
            />
            <Input
              type="password"
              placeholder="Confirm New Password"
              value={passwordForm.confirmPassword}
              onChange={(e) =>
                setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })
              }
              required
            />
            <Button type="submit" disabled={loading}>
              {loading ? 'Changing Password...' : 'Update Password'}
            </Button>
          </form>
        )}

        <div className="mt-4 text-sm text-gray-500">
          Last changed: {format(new Date(user.passwordLastChanged || user.createdAt), 'PPp')}
        </div>
      </Card>

      {/* Two-Factor Authentication */}
      <Card className="p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Shield className="w-5 h-5 text-gray-500" />
            <h3 className="text-lg font-semibold">Two-Factor Authentication</h3>
          </div>
          <Button
            variant={user.twoFactorEnabled ? "destructive" : "default"}
            onClick={handleEnableTwoFactor}
          >
            {user.twoFactorEnabled ? 'Disable 2FA' : 'Enable 2FA'}
          </Button>
        </div>
        <p className="mt-2 text-sm text-gray-500">
          {user.twoFactorEnabled
            ? 'Two-factor authentication is enabled for your account.'
            : 'Add an extra layer of security to your account with two-factor authentication.'}
        </p>
      </Card>

      {/* Active Sessions */}
      <Card className="p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-2">
            <Smartphone className="w-5 h-5 text-gray-500" />
            <h3 className="text-lg font-semibold">Active Sessions</h3>
          </div>
          {sessions.length > 1 && (
            <Button variant="outline" onClick={handleTerminateOtherSessions}>
              End Other Sessions
            </Button>
          )}
        </div>

        <div className="space-y-4">
          {sessions.map((session) => (
            <div
              key={session.id}
              className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg"
            >
              <div>
                <p className="font-medium">{session.deviceInfo.platform}</p>
                <p className="text-sm text-gray-500">{session.deviceInfo.userAgent}</p>
                <p className="text-xs text-gray-400">
                  Started: {format(new Date(session.startTime), 'PPp')}
                </p>
              </div>
              {session.isCurrent && (
                <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded">
                  Current Session
                </span>
              )}
            </div>
          ))}
        </div>
      </Card>

      {/* Login History */}
      <Card className="p-6">
        <div className="flex items-center space-x-2 mb-4">
          <History className="w-5 h-5 text-gray-500" />
          <h3 className="text-lg font-semibold">Recent Login Activity</h3>
        </div>

        <div className="space-y-4">
          {user.loginHistory?.slice(0, 5).map((login) => (
            <div
              key={login.id}
              className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg"
            >
              <div>
                <p className="text-sm">
                  {login.successful ? (
                    <span className="text-green-600">Successful login</span>
                  ) : (
                    <span className="text-red-600">Failed login attempt</span>
                  )}
                </p>
                <p className="text-xs text-gray-500">{login.ipAddress}</p>
                <p className="text-xs text-gray-400">
                  {format(new Date(login.timestamp), 'PPp')}
                </p>
              </div>
              <div className="text-sm text-gray-500">{login.location}</div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
};

export default UserSecuritySettings; 