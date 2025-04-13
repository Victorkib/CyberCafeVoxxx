import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { toast } from 'react-toastify';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../../ui/Table';
import { Button } from '../../ui/Button';
import { Badge } from '../../ui/Badge';
import { Card } from '../../ui/Card';
import { Lock, Unlock, Shield, Clock, Users } from 'lucide-react';
import { format } from 'date-fns';

const UserSecurityManagement = () => {
  const dispatch = useDispatch();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedUser, setSelectedUser] = useState(null);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const response = await fetch('/api/admin/users/security');
      const data = await response.json();
      setUsers(data);
    } catch (error) {
      toast.error('Failed to fetch users');
    } finally {
      setLoading(false);
    }
  };

  const handleLockAccount = async (userId) => {
    try {
      await fetch(`/api/admin/users/${userId}/lock`, { method: 'POST' });
      toast.success('Account locked successfully');
      fetchUsers();
    } catch (error) {
      toast.error('Failed to lock account');
    }
  };

  const handleUnlockAccount = async (userId) => {
    try {
      await fetch(`/api/admin/users/${userId}/unlock`, { method: 'POST' });
      toast.success('Account unlocked successfully');
      fetchUsers();
    } catch (error) {
      toast.error('Failed to unlock account');
    }
  };

  const handleForcePasswordReset = async (userId) => {
    try {
      await fetch(`/api/admin/users/${userId}/force-password-reset`, { method: 'POST' });
      toast.success('Password reset requested');
      fetchUsers();
    } catch (error) {
      toast.error('Failed to request password reset');
    }
  };

  const handleTerminateSessions = async (userId) => {
    try {
      await fetch(`/api/admin/users/${userId}/terminate-sessions`, { method: 'POST' });
      toast.success('All sessions terminated');
      fetchUsers();
    } catch (error) {
      toast.error('Failed to terminate sessions');
    }
  };

  return (
    <div className="p-6">
      <div className="mb-6">
        <h2 className="text-2xl font-bold mb-2">User Security Management</h2>
        <p className="text-gray-600">Manage user account security and sessions</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <Card className="p-4">
          <div className="flex items-center space-x-2">
            <Lock className="w-5 h-5 text-red-500" />
            <div>
              <h3 className="font-semibold">Locked Accounts</h3>
              <p className="text-2xl">{users.filter(u => u.isLocked).length}</p>
            </div>
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center space-x-2">
            <Shield className="w-5 h-5 text-yellow-500" />
            <div>
              <h3 className="font-semibold">Password Expired</h3>
              <p className="text-2xl">{users.filter(u => u.passwordExpired).length}</p>
            </div>
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center space-x-2">
            <Clock className="w-5 h-5 text-blue-500" />
            <div>
              <h3 className="font-semibold">Active Sessions</h3>
              <p className="text-2xl">{users.reduce((acc, u) => acc + (u.activeSessions || 0), 0)}</p>
            </div>
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center space-x-2">
            <Users className="w-5 h-5 text-green-500" />
            <div>
              <h3 className="font-semibold">Total Users</h3>
              <p className="text-2xl">{users.length}</p>
            </div>
          </div>
        </Card>
      </div>

      <Card>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>User</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Last Login</TableHead>
              <TableHead>Password Expires</TableHead>
              <TableHead>Active Sessions</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {users.map((user) => (
              <TableRow key={user.id}>
                <TableCell>
                  <div>
                    <p className="font-medium">{user.name}</p>
                    <p className="text-sm text-gray-500">{user.email}</p>
                  </div>
                </TableCell>
                <TableCell>
                  {user.isLocked ? (
                    <Badge variant="destructive">Locked</Badge>
                  ) : (
                    <Badge variant="success">Active</Badge>
                  )}
                </TableCell>
                <TableCell>
                  {user.lastLogin ? format(new Date(user.lastLogin), 'PPp') : 'Never'}
                </TableCell>
                <TableCell>
                  {user.passwordExpiryDate && (
                    <span className={user.passwordExpired ? 'text-red-500' : ''}>
                      {format(new Date(user.passwordExpiryDate), 'PP')}
                    </span>
                  )}
                </TableCell>
                <TableCell>{user.activeSessions || 0}</TableCell>
                <TableCell>
                  <div className="flex space-x-2">
                    {user.isLocked ? (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleUnlockAccount(user.id)}
                      >
                        <Unlock className="w-4 h-4 mr-1" />
                        Unlock
                      </Button>
                    ) : (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleLockAccount(user.id)}
                      >
                        <Lock className="w-4 h-4 mr-1" />
                        Lock
                      </Button>
                    )}
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleForcePasswordReset(user.id)}
                    >
                      Reset Password
                    </Button>
                    {user.activeSessions > 0 && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleTerminateSessions(user.id)}
                      >
                        End Sessions
                      </Button>
                    )}
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>
    </div>
  );
};

export default UserSecurityManagement; 