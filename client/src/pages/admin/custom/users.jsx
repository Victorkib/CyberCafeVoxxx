'use client';

import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Button,
  TextField,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Typography,
  Box,
  Card,
  CardContent,
  CardHeader,
  Tabs,
  Tab,
  IconButton,
  Chip,
  Grid,
  CircularProgress,
  Divider,
  FormControlLabel,
  Checkbox,
  Menu,
  Avatar,
  Tooltip,
} from '@mui/material';
import {
  Search,
  PersonAdd,
  Shield,
  Edit,
  Delete,
  Mail,
  Cancel,
  Refresh,
  Visibility,
  Lock,
  LockOpen,
  MoreVert,
  Warning,
} from '@mui/icons-material';
import { toast } from 'react-hot-toast';
import {
  fetchUsers,
  createUser,
  updateUser,
  deleteUser,
  updateUserRole,
  updateUserStatus,
  inviteAdmin,
  fetchAdminInvitations,
  resendInvitation,
  cancelInvitation,
  lockAccount,
  unlockAccount,
  cleanupExpiredInvitations,
} from '../../../redux/slices/adminSlice';

// TabPanel component for the tabs
function TabPanel(props) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`admin-tabpanel-${index}`}
      aria-labelledby={`admin-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
    </div>
  );
}

const Users = () => {
  const dispatch = useDispatch();
  const { users, invitations, loading, error } = useSelector(
    (state) => state.admin
  );
  console.log('FetchedUsers', users);
  const { user: currentUser } = useSelector((state) => state.auth);
  const isSuperAdmin = currentUser?.role === 'super_admin';

  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isInviteDialogOpen, setIsInviteDialogOpen] = useState(false);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [isLockDialogOpen, setIsLockDialogOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [activeTab, setActiveTab] = useState(0);
  const [anchorEl, setAnchorEl] = useState(null);
  const [actionUser, setActionUser] = useState(null);

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    role: 'admin',
    status: 'active',
    phone: '',
  });

  const [inviteData, setInviteData] = useState({
    name: '',
    email: '',
    role: 'admin',
    sendWelcomeEmail: true,
    message: '',
  });

  const [lockData, setLockData] = useState({
    userId: '',
    reason: '',
    durationMinutes: 60,
  });

  useEffect(() => {
    dispatch(fetchUsers());
    dispatch(fetchAdminInvitations());
  }, [dispatch]);

  // Show error toast if there's an error
  useEffect(() => {
    if (error) {
      toast.error(error);
    }
  }, [error]);

  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
  };

  const handleRoleFilter = (e) => {
    setRoleFilter(e.target.value);
  };

  const handleStatusFilter = (e) => {
    setStatusFilter(e.target.value);
  };

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };

  const handleMenuOpen = (event, user) => {
    setAnchorEl(event.currentTarget);
    setActionUser(user);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setActionUser(null);
  };

  const handleAddUser = async () => {
    try {
      await dispatch(createUser(formData)).unwrap();
      setIsAddDialogOpen(false);
      resetForm();
    } catch (error) {
      // Error is handled by the toast in the thunk
    }
  };

  const handleEditUser = async () => {
    try {
      await dispatch(
        updateUser({ id: selectedUser._id, userData: formData })
      ).unwrap();
      setIsEditDialogOpen(false);
      resetForm();
    } catch (error) {
      // Error is handled by the toast in the thunk
    }
  };

  const handleDeleteUser = async (userId) => {
    if (window.confirm('Are you sure you want to delete this user?')) {
      try {
        await dispatch(deleteUser(userId)).unwrap();
      } catch (error) {
        // Error is handled by the toast in the thunk
      }
    }
  };

  const handleUpdateRole = async (userId, role) => {
    try {
      await dispatch(updateUserRole({ id: userId, role })).unwrap();
    } catch (error) {
      // Error is handled by the toast in the thunk
    }
  };

  const handleUpdateStatus = async (userId, status) => {
    try {
      await dispatch(updateUserStatus({ id: userId, status })).unwrap();
    } catch (error) {
      // Error is handled by the toast in the thunk
    }
  };

  const handleInviteAdmin = async () => {
    try {
      await dispatch(inviteAdmin(inviteData)).unwrap();
      setIsInviteDialogOpen(false);
      resetInviteForm();
    } catch (error) {
      // Error is handled by the toast in the thunk
    }
  };

  const handleResendInvitation = async (invitationId) => {
    try {
      await dispatch(resendInvitation(invitationId)).unwrap();
    } catch (error) {
      // Error is handled by the toast in the thunk
    }
  };

  const handleCancelInvitation = async (invitationId) => {
    if (window.confirm('Are you sure you want to cancel this invitation?')) {
      try {
        await dispatch(cancelInvitation(invitationId)).unwrap();
      } catch (error) {
        // Error is handled by the toast in the thunk
      }
    }
  };

  const handleLockAccount = async () => {
    try {
      await dispatch(
        lockAccount({
          userId: selectedUser._id,
          ...lockData,
        })
      ).unwrap();
      setIsLockDialogOpen(false);
    } catch (error) {
      // Error is handled by the toast in the thunk
    }
  };

  const handleUnlockAccount = async (userId) => {
    try {
      await dispatch(unlockAccount({ userId })).unwrap();
    } catch (error) {
      // Error is handled by the toast in the thunk
    }
  };

  const handleCleanupInvitations = async () => {
    try {
      await dispatch(cleanupExpiredInvitations()).unwrap();
    } catch (error) {
      // Error is handled by the toast in the thunk
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      email: '',
      password: '',
      role: 'admin',
      status: 'active',
      phone: '',
    });
    setSelectedUser(null);
  };

  const resetInviteForm = () => {
    setInviteData({
      name: '',
      email: '',
      role: 'admin',
      sendWelcomeEmail: true,
      message: '',
    });
  };

  const resetLockForm = () => {
    setLockData({
      userId: '',
      reason: '',
      durationMinutes: 60,
    });
  };

  const openEditDialog = (user) => {
    setSelectedUser(user);
    setFormData({
      name: user.name,
      email: user.email,
      role: user.role,
      status: user.status,
      phone: user.phone || '',
    });
    setIsEditDialogOpen(true);
  };

  const openViewDialog = (user) => {
    setSelectedUser(user);
    setIsViewDialogOpen(true);
  };

  const openLockDialog = (user) => {
    setSelectedUser(user);
    resetLockForm();
    setLockData((prev) => ({
      ...prev,
      userId: user._id,
    }));
    setIsLockDialogOpen(true);
  };

  const getRoleColor = (role) => {
    switch (role) {
      case 'super_admin':
        return 'secondary';
      case 'admin':
        return 'error';
      case 'manager':
        return 'primary';
      case 'staff':
        return 'success';
      default:
        return 'default';
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'active':
        return 'success';
      case 'inactive':
        return 'warning';
      case 'blocked':
        return 'error';
      default:
        return 'default';
    }
  };

  const getInvitationStatusColor = (status) => {
    switch (status) {
      case 'pending':
        return 'primary';
      case 'accepted':
        return 'success';
      case 'expired':
        return 'error';
      default:
        return 'default';
    }
  };

  const filteredUsers =
    users?.filter((user) => {
      // Filter by search term
      const matchesSearch =
        user.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email?.toLowerCase().includes(searchTerm.toLowerCase());

      // Filter by role
      const matchesRole = roleFilter === 'all' || user.role === roleFilter;

      // Filter by status
      const matchesStatus =
        statusFilter === 'all' || user.status === statusFilter;

      // Filter by tab (admins or all users)
      const matchesTab =
        (activeTab === 0 && ['admin', 'super_admin'].includes(user.role)) ||
        activeTab === 1;

      return matchesSearch && matchesRole && matchesStatus && matchesTab;
    }) || [];

  if (loading && !users?.length) {
    return (
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          height: '400px',
        }}
      >
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ width: '100%', mb: 4 }}>
      <Card>
        <CardHeader
          title={
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <Shield sx={{ mr: 1, color: 'primary.main' }} />
              <Typography variant="h5" component="div">
                Admin Management
              </Typography>
            </Box>
          }
          subheader="Manage admin accounts and permissions"
          action={
            <Box sx={{ display: 'flex', gap: 1 }}>
              {isSuperAdmin && (
                <Button
                  variant="contained"
                  color="secondary"
                  startIcon={<Mail />}
                  onClick={() => setIsInviteDialogOpen(true)}
                >
                  Invite Admin
                </Button>
              )}
              <Button
                variant="contained"
                color="primary"
                startIcon={<PersonAdd />}
                onClick={() => setIsAddDialogOpen(true)}
              >
                Add User
              </Button>
            </Box>
          }
        />

        <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <Tabs
            value={activeTab}
            onChange={handleTabChange}
            aria-label="admin tabs"
          >
            <Tab label="Admins" />
            <Tab label="All Users" />
            <Tab label="Invitations" />
          </Tabs>
        </Box>

        <TabPanel value={activeTab} index={0}>
          <Box sx={{ mb: 3 }}>
            <Grid container spacing={2} alignItems="center">
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  placeholder="Search admins..."
                  value={searchTerm}
                  onChange={handleSearch}
                  InputProps={{
                    startAdornment: (
                      <Search sx={{ color: 'action.active', mr: 1 }} />
                    ),
                  }}
                  variant="outlined"
                  size="small"
                />
              </Grid>
              <Grid item xs={6} md={3}>
                <FormControl fullWidth size="small">
                  <InputLabel>Role</InputLabel>
                  <Select
                    value={roleFilter}
                    onChange={handleRoleFilter}
                    label="Role"
                  >
                    <MenuItem value="all">All Roles</MenuItem>
                    <MenuItem value="super_admin">Super Admin</MenuItem>
                    <MenuItem value="admin">Admin</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={6} md={3}>
                <FormControl fullWidth size="small">
                  <InputLabel>Status</InputLabel>
                  <Select
                    value={statusFilter}
                    onChange={handleStatusFilter}
                    label="Status"
                  >
                    <MenuItem value="all">All Status</MenuItem>
                    <MenuItem value="active">Active</MenuItem>
                    <MenuItem value="inactive">Inactive</MenuItem>
                    <MenuItem value="blocked">Blocked</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
            </Grid>
          </Box>

          <TableContainer component={Paper}>
            <Table sx={{ minWidth: 650 }} aria-label="admin users table">
              <TableHead>
                <TableRow>
                  <TableCell>Name</TableCell>
                  <TableCell>Email</TableCell>
                  <TableCell>Role</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Last Login</TableCell>
                  <TableCell align="right">Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredUsers.length > 0 ? (
                  filteredUsers.map((user) => (
                    <TableRow key={user._id} hover>
                      <TableCell component="th" scope="row">
                        {user.name}
                      </TableCell>
                      <TableCell>{user.email}</TableCell>
                      <TableCell>
                        {isSuperAdmin ? (
                          <FormControl fullWidth size="small">
                            <Select
                              value={user.role}
                              onChange={(e) =>
                                handleUpdateRole(user._id, e.target.value)
                              }
                              disabled={
                                user.role === 'super_admin' &&
                                user._id !== currentUser._id
                              }
                              size="small"
                            >
                              <MenuItem value="super_admin">
                                Super Admin
                              </MenuItem>
                              <MenuItem value="admin">Admin</MenuItem>
                              <MenuItem value="manager">Manager</MenuItem>
                              <MenuItem value="staff">Staff</MenuItem>
                            </Select>
                          </FormControl>
                        ) : (
                          <Chip
                            label={user.role}
                            color={getRoleColor(user.role)}
                            size="small"
                          />
                        )}
                      </TableCell>
                      <TableCell>
                        {user.isLocked ? (
                          <Chip
                            icon={<Lock fontSize="small" />}
                            label="Locked"
                            color="error"
                            size="small"
                          />
                        ) : isSuperAdmin ? (
                          <FormControl fullWidth size="small">
                            <Select
                              value={user.status}
                              onChange={(e) =>
                                handleUpdateStatus(user._id, e.target.value)
                              }
                              disabled={
                                user.role === 'super_admin' &&
                                user._id !== currentUser._id
                              }
                              size="small"
                            >
                              <MenuItem value="active">Active</MenuItem>
                              <MenuItem value="inactive">Inactive</MenuItem>
                              <MenuItem value="blocked">Blocked</MenuItem>
                            </Select>
                          </FormControl>
                        ) : (
                          <Chip
                            label={user.status}
                            color={getStatusColor(user.status)}
                            size="small"
                          />
                        )}
                      </TableCell>
                      <TableCell>
                        {user.lastLogin
                          ? new Date(user.lastLogin).toLocaleString()
                          : 'Never'}
                      </TableCell>
                      <TableCell align="right">
                        <IconButton
                          aria-label="more actions"
                          aria-controls="user-menu"
                          aria-haspopup="true"
                          onClick={(e) => handleMenuOpen(e, user)}
                        >
                          <MoreVert />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={6} align="center" sx={{ py: 3 }}>
                      <Typography variant="body2" color="text.secondary">
                        No admin users found
                      </Typography>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </TabPanel>

        <TabPanel value={activeTab} index={1}>
          <Box sx={{ mb: 3 }}>
            <Grid container spacing={2} alignItems="center">
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  placeholder="Search users..."
                  value={searchTerm}
                  onChange={handleSearch}
                  InputProps={{
                    startAdornment: (
                      <Search sx={{ color: 'action.active', mr: 1 }} />
                    ),
                  }}
                  variant="outlined"
                  size="small"
                />
              </Grid>
              <Grid item xs={6} md={3}>
                <FormControl fullWidth size="small">
                  <InputLabel>Role</InputLabel>
                  <Select
                    value={roleFilter}
                    onChange={handleRoleFilter}
                    label="Role"
                  >
                    <MenuItem value="all">All Roles</MenuItem>
                    <MenuItem value="super_admin">Super Admin</MenuItem>
                    <MenuItem value="admin">Admin</MenuItem>
                    <MenuItem value="manager">Manager</MenuItem>
                    <MenuItem value="staff">Staff</MenuItem>
                    <MenuItem value="user">User</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={6} md={3}>
                <FormControl fullWidth size="small">
                  <InputLabel>Status</InputLabel>
                  <Select
                    value={statusFilter}
                    onChange={handleStatusFilter}
                    label="Status"
                  >
                    <MenuItem value="all">All Status</MenuItem>
                    <MenuItem value="active">Active</MenuItem>
                    <MenuItem value="inactive">Inactive</MenuItem>
                    <MenuItem value="blocked">Blocked</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
            </Grid>
          </Box>

          <TableContainer component={Paper}>
            <Table sx={{ minWidth: 650 }} aria-label="all users table">
              <TableHead>
                <TableRow>
                  <TableCell>Name</TableCell>
                  <TableCell>Email</TableCell>
                  <TableCell>Role</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Last Login</TableCell>
                  <TableCell align="right">Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredUsers.length > 0 ? (
                  filteredUsers.map((user) => (
                    <TableRow key={user._id} hover>
                      <TableCell component="th" scope="row">
                        {user.name}
                      </TableCell>
                      <TableCell>{user.email}</TableCell>
                      <TableCell>
                        <Chip
                          label={user.role}
                          color={getRoleColor(user.role)}
                          size="small"
                        />
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={user.status}
                          color={getStatusColor(user.status)}
                          size="small"
                        />
                      </TableCell>
                      <TableCell>
                        {user.lastLogin
                          ? new Date(user.lastLogin).toLocaleString()
                          : 'Never'}
                      </TableCell>
                      <TableCell align="right">
                        <Tooltip title="View Details">
                          <IconButton
                            size="small"
                            onClick={() => openViewDialog(user)}
                          >
                            <Visibility fontSize="small" />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Edit User">
                          <IconButton
                            size="small"
                            onClick={() => openEditDialog(user)}
                          >
                            <Edit fontSize="small" />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Delete User">
                          <IconButton
                            size="small"
                            onClick={() => handleDeleteUser(user._id)}
                            disabled={user.role === 'super_admin'}
                          >
                            <Delete fontSize="small" color="error" />
                          </IconButton>
                        </Tooltip>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={6} align="center" sx={{ py: 3 }}>
                      <Typography variant="body2" color="text.secondary">
                        No users found
                      </Typography>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </TabPanel>

        <TabPanel value={activeTab} index={2}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
            <Typography variant="h6">Admin Invitations</Typography>
            <Box>
              <Button
                variant="outlined"
                startIcon={<Refresh />}
                onClick={handleCleanupInvitations}
                sx={{ mr: 1 }}
                size="small"
              >
                Clean Up Expired
              </Button>
              <Button
                variant="contained"
                startIcon={<Mail />}
                onClick={() => setIsInviteDialogOpen(true)}
                size="small"
              >
                New Invitation
              </Button>
            </Box>
          </Box>

          {!invitations || invitations.length === 0 ? (
            <Box
              sx={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                py: 6,
                textAlign: 'center',
              }}
            >
              <Mail sx={{ fontSize: 48, color: 'text.disabled', mb: 2 }} />
              <Typography variant="h6" gutterBottom>
                No invitations found
              </Typography>
              <Typography
                variant="body2"
                color="text.secondary"
                sx={{ maxWidth: 'md', mt: 1 }}
              >
                There are no pending or recent admin invitations. Click the "New
                Invitation" button to invite an admin.
              </Typography>
            </Box>
          ) : (
            <TableContainer component={Paper}>
              <Table sx={{ minWidth: 650 }} aria-label="invitations table">
                <TableHead>
                  <TableRow>
                    <TableCell>Name</TableCell>
                    <TableCell>Email</TableCell>
                    <TableCell>Role</TableCell>
                    <TableCell>Status</TableCell>
                    <TableCell>Invited By</TableCell>
                    <TableCell>Expires</TableCell>
                    <TableCell align="right">Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {invitations.map((invitation) => (
                    <TableRow key={invitation._id} hover>
                      <TableCell component="th" scope="row">
                        {invitation.name}
                      </TableCell>
                      <TableCell>{invitation.email}</TableCell>
                      <TableCell>
                        <Chip
                          label={invitation.role}
                          color={getRoleColor(invitation.role)}
                          size="small"
                        />
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={invitation.status}
                          color={getInvitationStatusColor(invitation.status)}
                          size="small"
                        />
                      </TableCell>
                      <TableCell>
                        {invitation.invitedBy?.name || 'Unknown'}
                      </TableCell>
                      <TableCell>
                        {new Date(invitation.expiresAt).toLocaleString()}
                      </TableCell>
                      <TableCell align="right">
                        {invitation.status === 'pending' && (
                          <>
                            <Tooltip title="Resend Invitation">
                              <IconButton
                                size="small"
                                onClick={() =>
                                  handleResendInvitation(invitation._id)
                                }
                              >
                                <Refresh fontSize="small" color="primary" />
                              </IconButton>
                            </Tooltip>
                            <Tooltip title="Cancel Invitation">
                              <IconButton
                                size="small"
                                onClick={() =>
                                  handleCancelInvitation(invitation._id)
                                }
                              >
                                <Cancel fontSize="small" color="error" />
                              </IconButton>
                            </Tooltip>
                          </>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </TabPanel>

        <CardContent
          sx={{
            display: 'flex',
            justifyContent: 'space-between',
            borderTop: '1px solid',
            borderColor: 'divider',
            pt: 2,
          }}
        >
          <Typography variant="body2" color="text.secondary">
            {filteredUsers.length} users shown
          </Typography>
          <Button
            variant="outlined"
            startIcon={<Refresh />}
            onClick={() => dispatch(fetchUsers())}
            size="small"
          >
            Refresh
          </Button>
        </CardContent>
      </Card>

      {/* Action Menu */}
      <Menu
        id="user-menu"
        anchorEl={anchorEl}
        keepMounted
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
      >
        <MenuItem
          onClick={() => {
            openViewDialog(actionUser);
            handleMenuClose();
          }}
        >
          <Visibility fontSize="small" sx={{ mr: 1 }} /> View Details
        </MenuItem>
        <MenuItem
          onClick={() => {
            openEditDialog(actionUser);
            handleMenuClose();
          }}
        >
          <Edit fontSize="small" sx={{ mr: 1 }} /> Edit
        </MenuItem>
        <Divider />
        {actionUser?.isLocked ? (
          <MenuItem
            onClick={() => {
              handleUnlockAccount(actionUser._id);
              handleMenuClose();
            }}
          >
            <LockOpen fontSize="small" sx={{ mr: 1 }} /> Unlock Account
          </MenuItem>
        ) : (
          <MenuItem
            onClick={() => {
              openLockDialog(actionUser);
              handleMenuClose();
            }}
          >
            <Lock fontSize="small" sx={{ mr: 1 }} /> Lock Account
          </MenuItem>
        )}
        <Divider />
        <MenuItem
          onClick={() => {
            handleDeleteUser(actionUser._id);
            handleMenuClose();
          }}
          disabled={actionUser?.role === 'super_admin'}
          sx={{ color: 'error.main' }}
        >
          <Delete fontSize="small" sx={{ mr: 1 }} /> Delete
        </MenuItem>
      </Menu>

      {/* Add User Dialog */}
      <Dialog
        open={isAddDialogOpen}
        onClose={() => setIsAddDialogOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Add New User</DialogTitle>
        <DialogContent>
          <DialogContentText sx={{ mb: 2 }}>
            Create a new admin or staff account
          </DialogContentText>
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <TextField
                label="Full Name"
                fullWidth
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                margin="normal"
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                label="Email"
                type="email"
                fullWidth
                value={formData.email}
                onChange={(e) =>
                  setFormData({ ...formData, email: e.target.value })
                }
                margin="normal"
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                label="Password"
                type="password"
                fullWidth
                value={formData.password}
                onChange={(e) =>
                  setFormData({ ...formData, password: e.target.value })
                }
                margin="normal"
              />
            </Grid>
            <Grid item xs={12}>
              <FormControl fullWidth margin="normal">
                <InputLabel>Role</InputLabel>
                <Select
                  value={formData.role}
                  onChange={(e) =>
                    setFormData({ ...formData, role: e.target.value })
                  }
                  label="Role"
                >
                  {isSuperAdmin && (
                    <MenuItem value="super_admin">Super Admin</MenuItem>
                  )}
                  <MenuItem value="admin">Admin</MenuItem>
                  <MenuItem value="manager">Manager</MenuItem>
                  <MenuItem value="staff">Staff</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12}>
              <TextField
                label="Phone"
                fullWidth
                value={formData.phone}
                onChange={(e) =>
                  setFormData({ ...formData, phone: e.target.value })
                }
                margin="normal"
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setIsAddDialogOpen(false)}>Cancel</Button>
          <Button onClick={handleAddUser} variant="contained" color="primary">
            Add User
          </Button>
        </DialogActions>
      </Dialog>

      {/* Edit User Dialog */}
      <Dialog
        open={isEditDialogOpen}
        onClose={() => setIsEditDialogOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Edit User</DialogTitle>
        <DialogContent>
          <DialogContentText sx={{ mb: 2 }}>
            Update user information
          </DialogContentText>
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <TextField
                label="Full Name"
                fullWidth
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                margin="normal"
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                label="Email"
                type="email"
                fullWidth
                value={formData.email}
                onChange={(e) =>
                  setFormData({ ...formData, email: e.target.value })
                }
                margin="normal"
              />
            </Grid>
            <Grid item xs={12}>
              <FormControl fullWidth margin="normal">
                <InputLabel>Role</InputLabel>
                <Select
                  value={formData.role}
                  onChange={(e) =>
                    setFormData({ ...formData, role: e.target.value })
                  }
                  label="Role"
                >
                  {isSuperAdmin && (
                    <MenuItem value="super_admin">Super Admin</MenuItem>
                  )}
                  <MenuItem value="admin">Admin</MenuItem>
                  <MenuItem value="manager">Manager</MenuItem>
                  <MenuItem value="staff">Staff</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12}>
              <FormControl fullWidth margin="normal">
                <InputLabel>Status</InputLabel>
                <Select
                  value={formData.status}
                  onChange={(e) =>
                    setFormData({ ...formData, status: e.target.value })
                  }
                  label="Status"
                >
                  <MenuItem value="active">Active</MenuItem>
                  <MenuItem value="inactive">Inactive</MenuItem>
                  <MenuItem value="blocked">Blocked</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12}>
              <TextField
                label="Phone"
                fullWidth
                value={formData.phone}
                onChange={(e) =>
                  setFormData({ ...formData, phone: e.target.value })
                }
                margin="normal"
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setIsEditDialogOpen(false)}>Cancel</Button>
          <Button onClick={handleEditUser} variant="contained" color="primary">
            Update User
          </Button>
        </DialogActions>
      </Dialog>

      {/* Invite Admin Dialog */}
      <Dialog
        open={isInviteDialogOpen}
        onClose={() => setIsInviteDialogOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Invite Admin</DialogTitle>
        <DialogContent>
          <DialogContentText sx={{ mb: 2 }}>
            Send an invitation to a new admin user
          </DialogContentText>
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <TextField
                label="Full Name"
                fullWidth
                value={inviteData.name}
                onChange={(e) =>
                  setInviteData({ ...inviteData, name: e.target.value })
                }
                margin="normal"
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                label="Email"
                type="email"
                fullWidth
                value={inviteData.email}
                onChange={(e) =>
                  setInviteData({ ...inviteData, email: e.target.value })
                }
                margin="normal"
              />
            </Grid>
            <Grid item xs={12}>
              <FormControl fullWidth margin="normal">
                <InputLabel>Role</InputLabel>
                <Select
                  value={inviteData.role}
                  onChange={(e) =>
                    setInviteData({ ...inviteData, role: e.target.value })
                  }
                  label="Role"
                >
                  {isSuperAdmin && (
                    <MenuItem value="super_admin">Super Admin</MenuItem>
                  )}
                  <MenuItem value="admin">Admin</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12}>
              <TextField
                label="Personal Message (Optional)"
                multiline
                rows={4}
                fullWidth
                placeholder="Add a personal message to the invitation email..."
                value={inviteData.message}
                onChange={(e) =>
                  setInviteData({ ...inviteData, message: e.target.value })
                }
                margin="normal"
              />
            </Grid>
            <Grid item xs={12}>
              <FormControlLabel
                control={
                  <Checkbox
                    checked={inviteData.sendWelcomeEmail}
                    onChange={(e) =>
                      setInviteData({
                        ...inviteData,
                        sendWelcomeEmail: e.target.checked,
                      })
                    }
                  />
                }
                label="Send welcome email with instructions"
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setIsInviteDialogOpen(false)}>Cancel</Button>
          <Button
            onClick={handleInviteAdmin}
            variant="contained"
            color="primary"
          >
            Send Invitation
          </Button>
        </DialogActions>
      </Dialog>

      {/* View User Dialog */}
      <Dialog
        open={isViewDialogOpen}
        onClose={() => setIsViewDialogOpen(false)}
        maxWidth="sm"
      >
        <DialogTitle>User Details</DialogTitle>
        <DialogContent>
          {selectedUser && (
            <Box sx={{ textAlign: 'center', mb: 2 }}>
              <Avatar
                sx={{
                  width: 80,
                  height: 80,
                  mx: 'auto',
                  mb: 2,
                  bgcolor: 'primary.main',
                  fontSize: '2rem',
                }}
              >
                {selectedUser.name?.charAt(0).toUpperCase() || 'U'}
              </Avatar>
              <Grid container spacing={2}>
                <Grid item xs={6}>
                  <Typography
                    variant="caption"
                    color="text.secondary"
                    display="block"
                  >
                    Name
                  </Typography>
                  <Typography variant="body1" fontWeight="medium">
                    {selectedUser.name}
                  </Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography
                    variant="caption"
                    color="text.secondary"
                    display="block"
                  >
                    Email
                  </Typography>
                  <Typography variant="body1" fontWeight="medium">
                    {selectedUser.email}
                  </Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography
                    variant="caption"
                    color="text.secondary"
                    display="block"
                  >
                    Role
                  </Typography>
                  <Chip
                    label={selectedUser.role}
                    color={getRoleColor(selectedUser.role)}
                    size="small"
                  />
                </Grid>
                <Grid item xs={6}>
                  <Typography
                    variant="caption"
                    color="text.secondary"
                    display="block"
                  >
                    Status
                  </Typography>
                  <Chip
                    label={selectedUser.status}
                    color={getStatusColor(selectedUser.status)}
                    size="small"
                  />
                </Grid>
                <Grid item xs={6}>
                  <Typography
                    variant="caption"
                    color="text.secondary"
                    display="block"
                  >
                    Last Login
                  </Typography>
                  <Typography variant="body2">
                    {selectedUser.lastLogin
                      ? new Date(selectedUser.lastLogin).toLocaleString()
                      : 'Never'}
                  </Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography
                    variant="caption"
                    color="text.secondary"
                    display="block"
                  >
                    Account Created
                  </Typography>
                  <Typography variant="body2">
                    {new Date(selectedUser.createdAt).toLocaleString()}
                  </Typography>
                </Grid>
                {selectedUser.isLocked && (
                  <>
                    <Grid item xs={6}>
                      <Typography
                        variant="caption"
                        color="text.secondary"
                        display="block"
                      >
                        Lock Reason
                      </Typography>
                      <Typography variant="body2">
                        {selectedUser.lockReason || 'N/A'}
                      </Typography>
                    </Grid>
                    <Grid item xs={6}>
                      <Typography
                        variant="caption"
                        color="text.secondary"
                        display="block"
                      >
                        Locked Until
                      </Typography>
                      <Typography variant="body2">
                        {selectedUser.lockedUntil
                          ? new Date(selectedUser.lockedUntil).toLocaleString()
                          : 'N/A'}
                      </Typography>
                    </Grid>
                  </>
                )}
              </Grid>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setIsViewDialogOpen(false)}>Close</Button>
        </DialogActions>
      </Dialog>

      {/* Lock Account Dialog */}
      <Dialog
        open={isLockDialogOpen}
        onClose={() => setIsLockDialogOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Lock User Account</DialogTitle>
        <DialogContent>
          <DialogContentText sx={{ mb: 2 }}>
            {selectedUser && `Lock ${selectedUser.name}'s account temporarily`}
          </DialogContentText>
          <Box
            sx={{
              mb: 3,
              p: 2,
              bgcolor: 'warning.light',
              borderRadius: 1,
              display: 'flex',
              alignItems: 'center',
            }}
          >
            <Warning color="warning" sx={{ mr: 1 }} />
            <Typography variant="body2" color="warning.dark">
              Locking this account will prevent the user from logging in until
              the lock expires or is manually removed.
            </Typography>
          </Box>
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <TextField
                label="Reason for Locking"
                multiline
                rows={3}
                fullWidth
                placeholder="Provide a reason for locking this account..."
                value={lockData.reason}
                onChange={(e) =>
                  setLockData({ ...lockData, reason: e.target.value })
                }
                margin="normal"
              />
            </Grid>
            <Grid item xs={12}>
              <FormControl fullWidth margin="normal">
                <InputLabel>Lock Duration</InputLabel>
                <Select
                  value={lockData.durationMinutes.toString()}
                  onChange={(e) =>
                    setLockData({
                      ...lockData,
                      durationMinutes: Number.parseInt(e.target.value),
                    })
                  }
                  label="Lock Duration"
                >
                  <MenuItem value="30">30 minutes</MenuItem>
                  <MenuItem value="60">1 hour</MenuItem>
                  <MenuItem value="360">6 hours</MenuItem>
                  <MenuItem value="720">12 hours</MenuItem>
                  <MenuItem value="1440">24 hours</MenuItem>
                  <MenuItem value="10080">7 days</MenuItem>
                </Select>
              </FormControl>
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setIsLockDialogOpen(false)}>Cancel</Button>
          <Button onClick={handleLockAccount} variant="contained" color="error">
            Lock Account
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Users;
