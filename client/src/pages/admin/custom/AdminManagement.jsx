'use client';

import { useState, useEffect, useMemo, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  Box,
  Typography,
  Paper,
  Grid,
  Card,
  CardContent,
  Avatar,
  Chip,
  Button,
  IconButton,
  Tabs,
  Tab,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  InputAdornment,
  Divider,
  Menu,
  Tooltip,
  CircularProgress,
  Checkbox,
  useTheme,
  alpha,
  Skeleton,
  useMediaQuery,
  Breadcrumbs,
  Link,
  Dialog,
  ListItemIcon,
  ListItemText,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  FormControlLabel,
  Alert,
} from '@mui/material';
import {
  Search,
  Edit,
  FlipVerticalIcon as MoreVert,
  RefreshCwIcon as Refresh,
  ListFilterIcon as FilterList,
  Mail,
  PersonStandingIcon as Person,
  Shield,
  ShieldCheck,
  Lock,
  Unlock,
  UserPlus,
  CheckCircle,
  Users,
  Download,
  Trash2,
  X,
  Info,
  Home,
  ChevronRight,
  ArrowUpRight,
  ArrowDownRight,
  Clock,
  ShieldAlert,
  UserCheck,
  ChevronLeft,
  EyeOff,
  Save,
  AlertTriangle,
  Eye,
  Send,
} from 'lucide-react';
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
import { motion, AnimatePresence } from 'framer-motion';

// Custom TabPanel component
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
      {value === index && (
        <Box sx={{ pt: 3 }}>
          <AnimatePresence mode="wait">
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
            >
              {children}
            </motion.div>
          </AnimatePresence>
        </Box>
      )}
    </div>
  );
}

// Activity Log Component
const ActivityLog = ({ activities }) => {
  const theme = useTheme();

  return (
    <Box sx={{ maxHeight: 400, overflow: 'auto', p: 1 }}>
      {activities.map((activity, index) => (
        <motion.div
          key={index}
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.2, delay: index * 0.05 }}
        >
          <Box
            sx={{
              display: 'flex',
              alignItems: 'flex-start',
              mb: 2,
              p: 1.5,
              borderRadius: 1,
              bgcolor: (theme) => alpha(theme.palette.background.paper, 0.5),
              '&:hover': {
                bgcolor: (theme) => alpha(theme.palette.background.paper, 0.8),
                boxShadow: theme.shadows[1],
              },
              transition: 'all 0.2s ease',
              border: `1px solid ${alpha(theme.palette.divider, 0.5)}`,
            }}
          >
            <Avatar
              sx={{
                bgcolor: activity.color,
                width: 36,
                height: 36,
                mr: 2,
              }}
            >
              {activity.icon}
            </Avatar>
            <Box sx={{ flex: 1 }}>
              <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                {activity.action}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {activity.description}
              </Typography>
              <Box sx={{ display: 'flex', alignItems: 'center', mt: 0.5 }}>
                <Clock
                  size={12}
                  style={{
                    marginRight: 4,
                    color: theme.palette.text.secondary,
                  }}
                />
                <Typography variant="caption" color="text.secondary">
                  {activity.time}
                </Typography>
              </Box>
            </Box>
          </Box>
        </motion.div>
      ))}
    </Box>
  );
};

// Stats Card Component
const StatsCard = ({
  title,
  value,
  icon,
  color,
  subtitle,
  trend,
  loading = false,
}) => {
  const theme = useTheme();

  return (
    <Card
      elevation={0}
      sx={{
        height: '100%',
        border: `1px solid ${theme.palette.divider}`,
        transition: 'all 0.3s ease',
        '&:hover': {
          boxShadow: theme.shadows[4],
          transform: 'translateY(-4px)',
        },
        borderRadius: 2,
        overflow: 'hidden',
      }}
    >
      <CardContent sx={{ p: 3 }}>
        {loading ? (
          <>
            <Box
              sx={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'flex-start',
              }}
            >
              <Box>
                <Skeleton
                  variant="text"
                  width={100}
                  height={20}
                  sx={{ mb: 1 }}
                />
                <Skeleton
                  variant="text"
                  width={60}
                  height={40}
                  sx={{ mb: 1 }}
                />
                <Skeleton variant="text" width={120} height={20} />
              </Box>
              <Skeleton variant="circular" width={48} height={48} />
            </Box>
            <Skeleton
              variant="rectangular"
              width="100%"
              height={6}
              sx={{ mt: 2, borderRadius: 1 }}
            />
          </>
        ) : (
          <>
            <Box
              sx={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'flex-start',
              }}
            >
              <Box>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  {title}
                </Typography>
                <Typography
                  variant="h4"
                  component="div"
                  sx={{ fontWeight: 'bold', mb: 1 }}
                >
                  {value}
                </Typography>
                {subtitle && (
                  <Typography variant="body2" color="text.secondary">
                    {subtitle}
                  </Typography>
                )}
              </Box>
              <Avatar
                sx={{
                  bgcolor: alpha(color, 0.1),
                  color: color,
                  width: 48,
                  height: 48,
                }}
              >
                {icon}
              </Avatar>
            </Box>
            {trend && (
              <Box sx={{ display: 'flex', alignItems: 'center', mt: 2 }}>
                <Chip
                  size="small"
                  icon={
                    trend.direction === 'up' ? (
                      <ArrowUpRight size={16} />
                    ) : (
                      <ArrowDownRight size={16} />
                    )
                  }
                  label={`${trend.value}%`}
                  color={trend.direction === 'up' ? 'success' : 'error'}
                  sx={{ mr: 1, height: 24 }}
                />
                <Typography variant="caption" color="text.secondary">
                  {trend.text}
                </Typography>
              </Box>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
};

// User Detail Panel Component
const UserDetailPanel = ({
  user,
  onClose,
  onEdit,
  onLock,
  onUnlock,
  onDelete,
}) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  if (!user) return null;

  const getRoleColor = (role) => {
    switch (role) {
      case 'super_admin':
        return theme.palette.secondary.main;
      case 'admin':
        return theme.palette.primary.main;
      case 'manager':
        return theme.palette.info.main;
      case 'staff':
        return theme.palette.success.main;
      default:
        return theme.palette.text.primary;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'active':
        return theme.palette.success.main;
      case 'inactive':
        return theme.palette.warning.main;
      case 'blocked':
        return theme.palette.error.main;
      default:
        return theme.palette.text.primary;
    }
  };

  return (
    <Box
      sx={{
        p: 3,
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'auto',
      }}
    >
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          mb: 3,
        }}
      >
        <Typography variant="h6">User Details</Typography>
        <IconButton onClick={onClose} size="small">
          <X size={18} />
        </IconButton>
      </Box>

      <Box sx={{ textAlign: 'center', mb: 3 }}>
        <Avatar
          sx={{
            width: 100,
            height: 100,
            mx: 'auto',
            mb: 2,
            bgcolor: user.isLocked
              ? theme.palette.error.main
              : theme.palette.primary.main,
            fontSize: '2.5rem',
            border: `4px solid ${theme.palette.background.paper}`,
            boxShadow: theme.shadows[3],
          }}
        >
          {user.name?.charAt(0).toUpperCase() || 'U'}
        </Avatar>
        <Typography variant="h5" gutterBottom>
          {user.name}
        </Typography>
        <Typography variant="body2" color="text.secondary" gutterBottom>
          {user.email}
        </Typography>

        <Box sx={{ display: 'flex', justifyContent: 'center', gap: 1, mt: 1 }}>
          <Chip
            label={user.role.replace('_', ' ')}
            sx={{
              bgcolor: alpha(getRoleColor(user.role), 0.1),
              color: getRoleColor(user.role),
            }}
            size="small"
          />
          <Chip
            label={user.status}
            sx={{
              bgcolor: alpha(getStatusColor(user.status), 0.1),
              color: getStatusColor(user.status),
            }}
            size="small"
          />
          {user.isLocked && (
            <Chip
              icon={<Lock size={14} />}
              label="Locked"
              sx={{
                bgcolor: alpha(theme.palette.error.main, 0.1),
                color: theme.palette.error.main,
              }}
              size="small"
            />
          )}
        </Box>
      </Box>

      <Divider sx={{ my: 2 }} />

      <Grid container spacing={2}>
        <Grid item xs={6}>
          <Typography variant="caption" color="text.secondary" display="block">
            Last Login
          </Typography>
          <Typography variant="body2" fontWeight={500}>
            {user.lastLogin
              ? new Date(user.lastLogin).toLocaleString()
              : 'Never'}
          </Typography>
        </Grid>
        <Grid item xs={6}>
          <Typography variant="caption" color="text.secondary" display="block">
            Account Created
          </Typography>
          <Typography variant="body2" fontWeight={500}>
            {new Date(user.createdAt).toLocaleString()}
          </Typography>
        </Grid>
        {user.phone && (
          <Grid item xs={6}>
            <Typography
              variant="caption"
              color="text.secondary"
              display="block"
            >
              Phone
            </Typography>
            <Typography variant="body2" fontWeight={500}>
              {user.phone}
            </Typography>
          </Grid>
        )}
        {user.isLocked && (
          <>
            <Grid item xs={12}>
              <Typography
                variant="caption"
                color="text.secondary"
                display="block"
              >
                Lock Reason
              </Typography>
              <Typography variant="body2" fontWeight={500}>
                {user.lockReason || 'N/A'}
              </Typography>
            </Grid>
            <Grid item xs={12}>
              <Typography
                variant="caption"
                color="text.secondary"
                display="block"
              >
                Locked Until
              </Typography>
              <Typography variant="body2" fontWeight={500}>
                {user.lockedUntil
                  ? new Date(user.lockedUntil).toLocaleString()
                  : 'N/A'}
              </Typography>
            </Grid>
          </>
        )}
      </Grid>

      <Box sx={{ flexGrow: 1 }} />

      <Box sx={{ mt: 4 }}>
        <Typography variant="subtitle2" gutterBottom>
          Recent Activity
        </Typography>
        <Box
          sx={{
            p: 2,
            borderRadius: 1,
            bgcolor: alpha(theme.palette.background.default, 0.5),
            border: `1px solid ${theme.palette.divider}`,
          }}
        >
          <Typography
            variant="body2"
            color="text.secondary"
            sx={{ fontStyle: 'italic' }}
          >
            No recent activity to display
          </Typography>
        </Box>
      </Box>

      <Divider sx={{ my: 3 }} />

      <Box
        sx={{
          display: 'flex',
          flexDirection: isMobile ? 'column' : 'row',
          gap: 1,
        }}
      >
        <Button
          variant="outlined"
          startIcon={<Edit size={16} />}
          onClick={onEdit}
          fullWidth={isMobile}
        >
          Edit
        </Button>
        {user.isLocked ? (
          <Button
            variant="outlined"
            color="success"
            startIcon={<Unlock size={16} />}
            onClick={onUnlock}
            fullWidth={isMobile}
          >
            Unlock
          </Button>
        ) : (
          <Button
            variant="outlined"
            color="warning"
            startIcon={<Lock size={16} />}
            onClick={onLock}
            fullWidth={isMobile}
          >
            Lock
          </Button>
        )}
        <Button
          variant="outlined"
          color="error"
          startIcon={<Trash2 size={16} />}
          onClick={onDelete}
          disabled={user.role === 'super_admin'}
          fullWidth={isMobile}
        >
          Delete
        </Button>
      </Box>
    </Box>
  );
};

// Empty State Component
const EmptyState = ({ icon, title, description, actionLabel, onAction }) => {
  const theme = useTheme();

  return (
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
      <Box
        sx={{
          p: 2,
          borderRadius: '50%',
          bgcolor: alpha(theme.palette.primary.main, 0.1),
          mb: 2,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        {icon}
      </Box>
      <Typography variant="h6" gutterBottom>
        {title}
      </Typography>
      <Typography
        variant="body2"
        color="text.secondary"
        sx={{ maxWidth: 'sm', mb: 3 }}
      >
        {description}
      </Typography>
      {actionLabel && (
        <Button variant="contained" onClick={onAction}>
          {actionLabel}
        </Button>
      )}
    </Box>
  );
};

// Loading Skeleton Component
const TableSkeleton = ({ rowsCount = 5, columnsCount = 6 }) => {
  return (
    <Box sx={{ width: '100%' }}>
      <Box sx={{ mb: 2 }}>
        <Skeleton variant="rectangular" width="100%" height={52} />
      </Box>
      {Array.from({ length: rowsCount }).map((_, rowIndex) => (
        <Box key={rowIndex} sx={{ display: 'flex', mb: 1 }}>
          {Array.from({ length: columnsCount }).map((_, colIndex) => (
            <Box key={colIndex} sx={{ flex: 1, mx: 0.5 }}>
              <Skeleton variant="text" width="100%" height={40} />
            </Box>
          ))}
        </Box>
      ))}
    </Box>
  );
};

// Main Component
const AdminManagement = () => {
  const theme = useTheme();
  const dispatch = useDispatch();
  const { users, invitations, loading, error } = useSelector(
    (state) => state.admin
  );
  const { user: currentUser } = useSelector((state) => state.auth);
  const isSuperAdmin = currentUser?.role === 'super_admin';

  // Responsive breakpoints
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const isTablet = useMediaQuery(theme.breakpoints.down('md'));
  const isLargeScreen = useMediaQuery(theme.breakpoints.up('lg'));

  // State for UI
  const [activeTab, setActiveTab] = useState(0);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [sortBy, setSortBy] = useState('createdAt');
  const [sortOrder, setSortOrder] = useState('desc');
  const [filterMenuAnchor, setFilterMenuAnchor] = useState(null);
  const [actionMenuAnchor, setActionMenuAnchor] = useState(null);
  const [selectedUser, setSelectedUser] = useState(null);
  const [detailPanelOpen, setDetailPanelOpen] = useState(false);
  const [expandedFilters, setExpandedFilters] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [notificationCount, setNotificationCount] = useState(3);
  const [darkMode, setDarkMode] = useState(false);
  const [notificationAnchor, setNotificationAnchor] = useState(null);
  const [userMenuAnchor, setUserMenuAnchor] = useState(null);
  const [helpAnchor, setHelpAnchor] = useState(null);

  // Dialog states
  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [inviteDialogOpen, setInviteDialogOpen] = useState(false);
  const [viewDialogOpen, setViewDialogOpen] = useState(false);
  const [lockDialogOpen, setLockDialogOpen] = useState(false);
  const [passwordVisible, setPasswordVisible] = useState(false);
  const [bulkActionDialogOpen, setBulkActionDialogOpen] = useState(false);
  const [exportDialogOpen, setExportDialogOpen] = useState(false);

  // Selection state
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [selectAll, setSelectAll] = useState(false);

  // Form data
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

  const [bulkActionData, setBulkActionData] = useState({
    action: 'status',
    value: 'active',
  });

  const [exportData, setExportData] = useState({
    format: 'csv',
    includeFields: [
      'name',
      'email',
      'role',
      'status',
      'lastLogin',
      'createdAt',
    ],
  });

  // Refs
  const searchInputRef = useRef(null);

  // Mock data for activity log
  const recentActivities = [
    {
      action: 'New Admin Invited',
      description: 'Sarah Johnson was invited as an admin',
      time: '10 minutes ago',
      icon: <Mail size={16} />,
      color: theme.palette.primary.main,
    },
    {
      action: 'User Role Updated',
      description: 'Michael Brown was promoted to Super Admin',
      time: '2 hours ago',
      icon: <ShieldCheck size={16} />,
      color: theme.palette.secondary.main,
    },
    {
      action: 'Account Locked',
      description: "James Wilson's account was locked for security reasons",
      time: '5 hours ago',
      icon: <Lock size={16} />,
      color: theme.palette.error.main,
    },
    {
      action: 'New User Created',
      description: 'Emily Davis was added as a staff member',
      time: 'Yesterday',
      icon: <UserPlus size={16} />,
      color: theme.palette.success.main,
    },
    {
      action: 'Invitation Accepted',
      description: 'Robert Martinez accepted the admin invitation',
      time: '2 days ago',
      icon: <CheckCircle size={16} />,
      color: theme.palette.info.main,
    },
  ];

  // Mock data for notifications
  const notifications = [
    {
      id: 1,
      title: 'New Admin Invitation Accepted',
      message: 'John Doe has accepted your admin invitation',
      time: '10 minutes ago',
      read: false,
      icon: <UserCheck size={16} />,
      color: theme.palette.success.main,
    },
    {
      id: 2,
      title: 'Account Locked',
      message: 'An admin account has been locked due to suspicious activity',
      time: '1 hour ago',
      read: false,
      icon: <ShieldAlert size={16} />,
      color: theme.palette.error.main,
    },
    {
      id: 3,
      title: 'System Update',
      message: 'Admin dashboard will undergo maintenance tonight at 2 AM',
      time: '3 hours ago',
      read: false,
      icon: <Info size={16} />,
      color: theme.palette.info.main,
    },
  ];

  // Fetch users and invitations on component mount
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

  // Handle selection of all users
  useEffect(() => {
    if (selectAll) {
      setSelectedUsers(paginatedUsers.map((user) => user._id));
    } else {
      setSelectedUsers([]);
    }
  }, [selectAll]);

  // Handle refresh data
  const handleRefreshData = async () => {
    setRefreshing(true);
    try {
      await Promise.all([
        dispatch(fetchUsers()),
        dispatch(fetchAdminInvitations()),
      ]);
      toast.success('Data refreshed successfully');
    } catch (error) {
      toast.error('Failed to refresh data');
    } finally {
      setRefreshing(false);
    }
  };

  // Handle tab change
  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
    setPage(0);
    setSelectedUsers([]);
    setSelectAll(false);
  };

  // Handle pagination
  const handleChangePage = (event, newPage) => {
    setPage(newPage);
    setSelectedUsers([]);
    setSelectAll(false);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(Number.parseInt(event.target.value, 10));
    setPage(0);
    setSelectedUsers([]);
    setSelectAll(false);
  };

  // Handle search and filters
  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
    setPage(0);
  };

  const handleRoleFilter = (e) => {
    setRoleFilter(e.target.value);
    setPage(0);
  };

  const handleStatusFilter = (e) => {
    setStatusFilter(e.target.value);
    setPage(0);
  };

  const handleSortChange = (field) => {
    if (sortBy === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setSortOrder('asc');
    }
  };

  const handleFilterMenuOpen = (event) => {
    setFilterMenuAnchor(event.currentTarget);
  };

  const handleFilterMenuClose = () => {
    setFilterMenuAnchor(null);
  };

  const handleActionMenuOpen = (event, user) => {
    event.stopPropagation();
    setActionMenuAnchor(event.currentTarget);
    setSelectedUser(user);
  };

  const handleActionMenuClose = () => {
    setActionMenuAnchor(null);
  };

  const handleNotificationMenuOpen = (event) => {
    setNotificationAnchor(event.currentTarget);
  };

  const handleNotificationMenuClose = () => {
    setNotificationAnchor(null);
  };

  const handleUserMenuOpen = (event) => {
    setUserMenuAnchor(event.currentTarget);
  };

  const handleUserMenuClose = () => {
    setUserMenuAnchor(null);
  };

  const handleHelpMenuOpen = (event) => {
    setHelpAnchor(event.currentTarget);
  };

  const handleHelpMenuClose = () => {
    setHelpAnchor(null);
  };

  const resetFilters = () => {
    setSearchTerm('');
    setRoleFilter('all');
    setStatusFilter('all');
    setSortBy('createdAt');
    setSortOrder('desc');
    handleFilterMenuClose();
  };

  // Selection handlers
  const handleSelectAllClick = (event) => {
    setSelectAll(event.target.checked);
  };

  const handleSelectUser = (userId) => {
    setSelectedUsers((prev) => {
      if (prev.includes(userId)) {
        return prev.filter((id) => id !== userId);
      } else {
        return [...prev, userId];
      }
    });
  };

  // Dialog handlers
  const openAddDialog = () => {
    setFormData({
      name: '',
      email: '',
      password: '',
      role: 'admin',
      status: 'active',
      phone: '',
    });
    setAddDialogOpen(true);
  };

  const openEditDialog = (user) => {
    setSelectedUser(user);
    setFormData({
      name: user.name,
      email: user.email,
      role: user.role,
      status: user.status,
      phone: user.phone || '',
      password: '',
    });
    setEditDialogOpen(true);
  };

  const openDeleteDialog = (user) => {
    setSelectedUser(user);
    setDeleteDialogOpen(true);
  };

  const openViewDialog = (user) => {
    setSelectedUser(user);
    setViewDialogOpen(true);
  };

  const openDetailPanel = (user) => {
    setSelectedUser(user);
    setDetailPanelOpen(true);
  };

  const closeDetailPanel = () => {
    setDetailPanelOpen(false);
  };

  const openLockDialog = (user) => {
    setSelectedUser(user);
    setLockData({
      userId: user._id,
      reason: '',
      durationMinutes: 60,
    });
    setLockDialogOpen(true);
  };

  const openInviteDialog = () => {
    setInviteData({
      name: '',
      email: '',
      role: 'admin',
      sendWelcomeEmail: true,
      message: '',
    });
    setInviteDialogOpen(true);
  };

  const openBulkActionDialog = () => {
    setBulkActionData({
      action: 'status',
      value: 'active',
    });
    setBulkActionDialogOpen(true);
  };

  const openExportDialog = () => {
    setExportData({
      format: 'csv',
      includeFields: [
        'name',
        'email',
        'role',
        'status',
        'lastLogin',
        'createdAt',
      ],
    });
    setExportDialogOpen(true);
  };

  // Form handlers
  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleInviteFormChange = (e) => {
    const { name, value, checked } = e.target;
    setInviteData((prev) => ({
      ...prev,
      [name]: name === 'sendWelcomeEmail' ? checked : value,
    }));
  };

  const handleLockFormChange = (e) => {
    const { name, value } = e.target;
    setLockData((prev) => ({
      ...prev,
      [name]: name === 'durationMinutes' ? Number.parseInt(value, 10) : value,
    }));
  };

  const handleBulkActionChange = (e) => {
    const { name, value } = e.target;
    setBulkActionData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleExportDataChange = (e) => {
    const { name, value } = e.target;
    setExportData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleExportFieldToggle = (field) => {
    setExportData((prev) => {
      const fields = [...prev.includeFields];
      const index = fields.indexOf(field);

      if (index === -1) {
        fields.push(field);
      } else {
        fields.splice(index, 1);
      }

      return {
        ...prev,
        includeFields: fields,
      };
    });
  };

  // CRUD operations
  const handleAddUser = async () => {
    try {
      await dispatch(createUser(formData)).unwrap();
      setAddDialogOpen(false);
      toast.success('User created successfully');
    } catch (error) {
      // Error is handled by the toast in the thunk
    }
  };

  const handleEditUser = async () => {
    try {
      await dispatch(
        updateUser({ id: selectedUser._id, userData: formData })
      ).unwrap();
      setEditDialogOpen(false);
      toast.success('User updated successfully');
    } catch (error) {
      // Error is handled by the toast in the thunk
    }
  };

  const handleDeleteUser = async () => {
    try {
      await dispatch(deleteUser(selectedUser._id)).unwrap();
      setDeleteDialogOpen(false);
      toast.success('User deleted successfully');

      // Close detail panel if the deleted user was being viewed
      if (detailPanelOpen && selectedUser._id === selectedUser?._id) {
        setDetailPanelOpen(false);
      }
    } catch (error) {
      // Error is handled by the toast in the thunk
    }
  };

  const handleUpdateRole = async (userId, role) => {
    try {
      await dispatch(updateUserRole({ id: userId, role })).unwrap();
      toast.success('User role updated successfully');
    } catch (error) {
      // Error is handled by the toast in the thunk
    }
  };

  const handleUpdateStatus = async (userId, status) => {
    try {
      await dispatch(updateUserStatus({ id: userId, status })).unwrap();
      toast.success('User status updated successfully');
    } catch (error) {
      // Error is handled by the toast in the thunk
    }
  };

  const handleInviteAdmin = async () => {
    try {
      await dispatch(inviteAdmin(inviteData)).unwrap();
      setInviteDialogOpen(false);
      toast.success('Admin invitation sent successfully');
    } catch (error) {
      // Error is handled by the toast in the thunk
    }
  };

  const handleResendInvitation = async (invitationId) => {
    try {
      await dispatch(resendInvitation(invitationId)).unwrap();
      toast.success('Invitation resent successfully');
    } catch (error) {
      // Error is handled by the toast in the thunk
    }
  };

  const handleCancelInvitation = async (invitationId) => {
    try {
      await dispatch(cancelInvitation(invitationId)).unwrap();
      toast.success('Invitation cancelled successfully');
    } catch (error) {
      // Error is handled by the toast in the thunk
    }
  };

  const handleLockAccount = async () => {
    try {
      await dispatch(lockAccount(lockData)).unwrap();
      setLockDialogOpen(false);
      toast.success('Account locked successfully');
    } catch (error) {
      // Error is handled by the toast in the thunk
    }
  };

  const handleUnlockAccount = async (userId) => {
    try {
      await dispatch(unlockAccount({ userId })).unwrap();
      toast.success('Account unlocked successfully');
    } catch (error) {
      // Error is handled by the toast in the thunk
    }
  };

  const handleCleanupInvitations = async () => {
    try {
      await dispatch(cleanupExpiredInvitations()).unwrap();
      toast.success('Expired invitations cleaned up successfully');
    } catch (error) {
      // Error is handled by the toast in the thunk
    }
  };

  const handleBulkAction = async () => {
    try {
      const { action, value } = bulkActionData;

      if (selectedUsers.length === 0) {
        toast.error('No users selected');
        return;
      }

      // Perform bulk action based on the selected action
      switch (action) {
        case 'status':
          // Update status for all selected users
          await Promise.all(
            selectedUsers.map((userId) =>
              dispatch(updateUserStatus({ id: userId, status: value }))
            )
          );
          toast.success(`Status updated for ${selectedUsers.length} users`);
          break;

        case 'role':
          // Update role for all selected users
          await Promise.all(
            selectedUsers.map((userId) =>
              dispatch(updateUserRole({ id: userId, role: value }))
            )
          );
          toast.success(`Role updated for ${selectedUsers.length} users`);
          break;

        case 'delete':
          // Delete all selected users
          await Promise.all(
            selectedUsers.map((userId) => dispatch(deleteUser(userId)))
          );
          toast.success(`${selectedUsers.length} users deleted successfully`);
          break;

        default:
          toast.error('Invalid action');
      }

      setBulkActionDialogOpen(false);
      setSelectedUsers([]);
      setSelectAll(false);
    } catch (error) {
      toast.error('Failed to perform bulk action');
    }
  };

  const handleExport = () => {
    try {
      // In a real application, this would generate and download the export file
      // For this example, we'll just show a success message

      toast.success(`Users exported as ${exportData.format.toUpperCase()}`);
      setExportDialogOpen(false);

      // Simulate download
      setTimeout(() => {
        const link = document.createElement('a');
        link.download = `admin-users-export.${exportData.format}`;
        link.href = '#';
        link.click();
      }, 500);
    } catch (error) {
      toast.error('Failed to export users');
    }
  };

  const markAllNotificationsAsRead = () => {
    setNotificationCount(0);
    handleNotificationMenuClose();
  };

  // Helper functions
  const getRoleColor = (role) => {
    switch (role) {
      case 'super_admin':
        return 'secondary';
      case 'admin':
        return 'primary';
      case 'manager':
        return 'info';
      case 'staff':
        return 'success';
      default:
        return 'default';
    }
  };

  const getRoleIcon = (role) => {
    switch (role) {
      case 'super_admin':
        return <ShieldCheck size={16} />;
      case 'admin':
        return <Shield size={16} />;
      case 'manager':
        return <Users size={16} />;
      case 'staff':
        return <Person size={16} />;
      default:
        return <Person size={16} />;
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
        return 'info';
      case 'accepted':
        return 'success';
      case 'expired':
        return 'error';
      default:
        return 'default';
    }
  };

  // Filter and sort users
  const filteredUsers = useMemo(() => {
    if (!users) return [];

    return users
      .filter((user) => {
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
      })
      .sort((a, b) => {
        // Sort by selected field
        if (a[sortBy] < b[sortBy]) {
          return sortOrder === 'asc' ? -1 : 1;
        }
        if (a[sortBy] > b[sortBy]) {
          return sortOrder === 'asc' ? 1 : -1;
        }
        return 0;
      });
  }, [
    users,
    searchTerm,
    roleFilter,
    statusFilter,
    activeTab,
    sortBy,
    sortOrder,
  ]);

  // Pagination
  const paginatedUsers = useMemo(() => {
    return filteredUsers.slice(
      page * rowsPerPage,
      page * rowsPerPage + rowsPerPage
    );
  }, [filteredUsers, page, rowsPerPage]);

  // Stats for dashboard
  const stats = useMemo(() => {
    if (!users)
      return {
        totalAdmins: 0,
        totalSuperAdmins: 0,
        lockedAccounts: 0,
        pendingInvitations: 0,
      };

    return {
      totalAdmins: users.filter((u) => u.role === 'admin').length,
      totalSuperAdmins: users.filter((u) => u.role === 'super_admin').length,
      lockedAccounts: users.filter((u) => u.isLocked).length,
      pendingInvitations:
        invitations?.filter((i) => i.status === 'pending').length || 0,
    };
  }, [users, invitations]);

  // Loading state
  if (loading && !users?.length) {
    return (
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          height: '100vh',
        }}
      >
        <CircularProgress size={60} thickness={4} />
        <Typography variant="h6" sx={{ mt: 2 }}>
          Loading Admin Dashboard...
        </Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ pb: 6 }}>
      {/* Header */}
      <Paper
        elevation={0}
        sx={{
          p: { xs: 2, sm: 3 },
          mb: 3,
          borderRadius: 2,
          border: `1px solid ${theme.palette.divider}`,
          background: `linear-gradient(to right, ${alpha(
            theme.palette.primary.main,
            0.05
          )}, ${alpha(theme.palette.background.paper, 0.7)})`,
        }}
      >
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} md={6}>
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <Avatar
                sx={{
                  bgcolor: theme.palette.primary.main,
                  width: { xs: 40, sm: 48 },
                  height: { xs: 40, sm: 48 },
                  mr: 2,
                }}
              >
                <Shield size={24} />
              </Avatar>
              <Box>
                <Typography
                  variant="h5"
                  component="h1"
                  sx={{
                    fontWeight: 'bold',
                    fontSize: { xs: '1.25rem', sm: '1.5rem' },
                  }}
                >
                  Admin Management
                </Typography>
                <Typography
                  variant="body2"
                  color="text.secondary"
                  sx={{ display: { xs: 'none', sm: 'block' } }}
                >
                  Manage administrators, permissions, and user accounts
                </Typography>
              </Box>
            </Box>
          </Grid>
          <Grid item xs={12} md={6}>
            <Box
              sx={{
                display: 'flex',
                justifyContent: { xs: 'flex-start', md: 'flex-end' },
                gap: 1,
                flexWrap: 'wrap',
                mt: { xs: 1, md: 0 },
              }}
            >
              <Button
                variant="outlined"
                startIcon={<Refresh />}
                onClick={handleRefreshData}
                disabled={refreshing}
                sx={{ minWidth: { xs: 'auto', sm: 120 } }}
                size={isMobile ? 'small' : 'medium'}
              >
                {refreshing ? 'Refreshing...' : isMobile ? '' : 'Refresh'}
              </Button>
              {isSuperAdmin && (
                <Button
                  variant="contained"
                  color="secondary"
                  startIcon={<Mail />}
                  onClick={openInviteDialog}
                  sx={{ minWidth: { xs: 'auto', sm: 140 } }}
                  size={isMobile ? 'small' : 'medium'}
                >
                  {isMobile ? '' : 'Invite Admin'}
                </Button>
              )}
              <Button
                variant="contained"
                color="primary"
                startIcon={<UserPlus />}
                onClick={openAddDialog}
                sx={{ minWidth: { xs: 'auto', sm: 120 } }}
                size={isMobile ? 'small' : 'medium'}
              >
                {isMobile ? '' : 'Add User'}
              </Button>
            </Box>
          </Grid>
        </Grid>

        {/* Breadcrumbs */}
        <Breadcrumbs
          separator={<ChevronRight size={16} />}
          aria-label="breadcrumb"
          sx={{ mt: 2, display: { xs: 'none', sm: 'flex' } }}
        >
          <Link
            underline="hover"
            color="inherit"
            href="#"
            sx={{ display: 'flex', alignItems: 'center' }}
          >
            <Home size={16} style={{ marginRight: 4 }} />
            Dashboard
          </Link>
          <Typography
            color="text.primary"
            sx={{ display: 'flex', alignItems: 'center' }}
          >
            <Shield size={16} style={{ marginRight: 4 }} />
            Admin Management
          </Typography>
        </Breadcrumbs>
      </Paper>

      {/* Stats Cards */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={6} sm={6} md={3}>
          <StatsCard
            title="Total Admins"
            value={stats.totalAdmins}
            icon={<Shield size={24} />}
            color={theme.palette.primary.main}
            subtitle="Active administrators"
            trend={{ direction: 'up', value: 12, text: 'vs last month' }}
            loading={loading}
          />
        </Grid>
        <Grid item xs={6} sm={6} md={3}>
          <StatsCard
            title="Pending Invitations"
            value={stats.pendingInvitations}
            icon={<Mail size={24} />}
            color={theme.palette.info.main}
            subtitle="Awaiting response"
            trend={{ direction: 'down', value: 5, text: 'vs last month' }}
            loading={loading}
          />
        </Grid>
        <Grid item xs={6} sm={6} md={3}>
          <StatsCard
            title="Locked Accounts"
            value={stats.lockedAccounts}
            icon={<Lock size={24} />}
            color={theme.palette.error.main}
            subtitle="Temporarily restricted"
            loading={loading}
          />
        </Grid>
        <Grid item xs={6} sm={6} md={3}>
          <StatsCard
            title="Super Admins"
            value={stats.totalSuperAdmins}
            icon={<ShieldCheck size={24} />}
            color={theme.palette.secondary.main}
            subtitle="With full permissions"
            loading={loading}
          />
        </Grid>
      </Grid>

      {/* Main Content */}
      <Grid container spacing={3}>
        {/* Left Column - User Management */}
        <Grid item xs={12} lg={detailPanelOpen ? 8 : 12}>
          <Paper
            elevation={0}
            sx={{
              borderRadius: 2,
              border: `1px solid ${theme.palette.divider}`,
              overflow: 'hidden',
            }}
          >
            {/* Tabs */}
            <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
              <Tabs
                value={activeTab}
                onChange={handleTabChange}
                aria-label="admin tabs"
                variant={isMobile ? 'fullWidth' : 'standard'}
                sx={{
                  px: 2,
                  '& .MuiTab-root': {
                    minHeight: 64,
                    textTransform: 'none',
                    fontSize: '0.95rem',
                  },
                }}
              >
                <Tab
                  label={
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <Shield size={18} style={{ marginRight: 8 }} />
                      {isMobile ? '' : 'Administrators'}
                    </Box>
                  }
                  aria-label="Administrators tab"
                />
                <Tab
                  label={
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <Users size={18} style={{ marginRight: 8 }} />
                      {isMobile ? '' : 'All Users'}
                    </Box>
                  }
                  aria-label="All Users tab"
                />
                <Tab
                  label={
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <Mail size={18} style={{ marginRight: 8 }} />
                      {isMobile ? '' : 'Invitations'}
                    </Box>
                  }
                  aria-label="Invitations tab"
                />
              </Tabs>
            </Box>

            {/* Search and Filters */}
            <Box
              sx={{ p: 2, borderBottom: `1px solid ${theme.palette.divider}` }}
            >
              <Grid container spacing={2} alignItems="center">
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    placeholder={
                      activeTab === 2
                        ? 'Search invitations...'
                        : 'Search users...'
                    }
                    value={searchTerm}
                    onChange={handleSearch}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <Search size={20} />
                        </InputAdornment>
                      ),
                    }}
                    size="small"
                    inputRef={searchInputRef}
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <Box
                    sx={{
                      display: 'flex',
                      gap: 1,
                      justifyContent: { xs: 'space-between', md: 'flex-end' },
                    }}
                  >
                    <Button
                      variant="outlined"
                      startIcon={<FilterList />}
                      onClick={handleFilterMenuOpen}
                      size="small"
                    >
                      {isMobile ? '' : 'Filters'}
                    </Button>

                    {selectedUsers.length > 0 && (
                      <Button
                        variant="outlined"
                        color="primary"
                        onClick={openBulkActionDialog}
                        size="small"
                      >
                        Actions ({selectedUsers.length})
                      </Button>
                    )}

                    {activeTab !== 2 && (
                      <Button
                        variant="outlined"
                        startIcon={<Download />}
                        onClick={openExportDialog}
                        size="small"
                      >
                        {isMobile ? '' : 'Export'}
                      </Button>
                    )}

                    {activeTab === 2 && (
                      <Button
                        variant="outlined"
                        color="error"
                        startIcon={<Trash2 />}
                        onClick={handleCleanupInvitations}
                        size="small"
                      >
                        {isMobile ? '' : 'Clean Up Expired'}
                      </Button>
                    )}
                  </Box>
                </Grid>
              </Grid>

              {/* Active Filters Display */}
              {(roleFilter !== 'all' ||
                statusFilter !== 'all' ||
                searchTerm) && (
                <Box sx={{ mt: 2, display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                  {searchTerm && (
                    <Chip
                      label={`Search: ${searchTerm}`}
                      onDelete={() => setSearchTerm('')}
                      size="small"
                      color="primary"
                      variant="outlined"
                    />
                  )}
                  {roleFilter !== 'all' && (
                    <Chip
                      label={`Role: ${roleFilter}`}
                      onDelete={() => setRoleFilter('all')}
                      size="small"
                      color="primary"
                      variant="outlined"
                    />
                  )}
                  {statusFilter !== 'all' && (
                    <Chip
                      label={`Status: ${statusFilter}`}
                      onDelete={() => setStatusFilter('all')}
                      size="small"
                      color="primary"
                      variant="outlined"
                    />
                  )}
                  <Button
                    variant="text"
                    size="small"
                    onClick={resetFilters}
                    sx={{ ml: 1 }}
                  >
                    Clear All
                  </Button>
                </Box>
              )}
            </Box>

            {/* Filter Menu */}
            <Menu
              anchorEl={filterMenuAnchor}
              open={Boolean(filterMenuAnchor)}
              onClose={handleFilterMenuClose}
              PaperProps={{
                elevation: 3,
                sx: { width: 280, p: 1 },
              }}
            >
              <Typography variant="subtitle2" sx={{ px: 2, py: 1 }}>
                Filter Options
              </Typography>
              <Divider sx={{ mb: 1 }} />
              <Box sx={{ p: 1 }}>
                <FormControl fullWidth size="small" sx={{ mb: 2 }}>
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
                  </Select>
                </FormControl>
                <FormControl fullWidth size="small" sx={{ mb: 2 }}>
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
                <FormControl fullWidth size="small">
                  <InputLabel>Sort By</InputLabel>
                  <Select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    label="Sort By"
                  >
                    <MenuItem value="name">Name</MenuItem>
                    <MenuItem value="email">Email</MenuItem>
                    <MenuItem value="role">Role</MenuItem>
                    <MenuItem value="status">Status</MenuItem>
                    <MenuItem value="createdAt">Date Created</MenuItem>
                    <MenuItem value="lastLogin">Last Login</MenuItem>
                  </Select>
                </FormControl>
                <Box
                  sx={{
                    mt: 2,
                    display: 'flex',
                    justifyContent: 'space-between',
                  }}
                >
                  <Button
                    variant="outlined"
                    size="small"
                    onClick={resetFilters}
                  >
                    Reset
                  </Button>
                  <Button
                    variant="contained"
                    size="small"
                    onClick={handleFilterMenuClose}
                  >
                    Apply
                  </Button>
                </Box>
              </Box>
            </Menu>

            {/* Tab Content */}
            <TabPanel value={activeTab} index={0}>
              {/* Administrators Tab */}
              {loading && !users?.length ? (
                <TableSkeleton />
              ) : (
                <>
                  <TableContainer>
                    <Table
                      sx={{ minWidth: 650 }}
                      aria-label="admin users table"
                    >
                      <TableHead>
                        <TableRow>
                          <TableCell padding="checkbox">
                            <Checkbox
                              indeterminate={
                                selectedUsers.length > 0 &&
                                selectedUsers.length < paginatedUsers.length
                              }
                              checked={
                                paginatedUsers.length > 0 &&
                                selectedUsers.length === paginatedUsers.length
                              }
                              onChange={handleSelectAllClick}
                              inputProps={{ 'aria-label': 'select all users' }}
                            />
                          </TableCell>
                          <TableCell>Name</TableCell>
                          <TableCell>Email</TableCell>
                          <TableCell>Role</TableCell>
                          <TableCell>Status</TableCell>
                          <TableCell>Last Login</TableCell>
                          <TableCell align="right">Actions</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {paginatedUsers.length > 0 ? (
                          paginatedUsers.map((user) => (
                            <TableRow
                              key={user._id}
                              hover
                              onClick={() => openDetailPanel(user)}
                              sx={{ cursor: 'pointer' }}
                              selected={selectedUsers.includes(user._id)}
                            >
                              <TableCell
                                padding="checkbox"
                                onClick={(e) => e.stopPropagation()}
                              >
                                <Checkbox
                                  checked={selectedUsers.includes(user._id)}
                                  onChange={() => handleSelectUser(user._id)}
                                  inputProps={{
                                    'aria-labelledby': `user-${user._id}`,
                                  }}
                                />
                              </TableCell>
                              <TableCell component="th" scope="row">
                                <Box
                                  sx={{ display: 'flex', alignItems: 'center' }}
                                >
                                  <Avatar
                                    sx={{
                                      width: 32,
                                      height: 32,
                                      mr: 1.5,
                                      bgcolor: user.isLocked
                                        ? theme.palette.error.main
                                        : theme.palette.primary.main,
                                    }}
                                  >
                                    {user.name?.charAt(0).toUpperCase() || 'U'}
                                  </Avatar>
                                  <Typography
                                    variant="body2"
                                    sx={{ fontWeight: 500 }}
                                  >
                                    {user.name}
                                    {user.isLocked && (
                                      <Tooltip title="Account Locked">
                                        <Lock
                                          size={14}
                                          style={{
                                            marginLeft: 8,
                                            color: theme.palette.error.main,
                                          }}
                                        />
                                      </Tooltip>
                                    )}
                                  </Typography>
                                </Box>
                              </TableCell>
                              <TableCell>{user.email}</TableCell>
                              <TableCell>
                                {isSuperAdmin ? (
                                  <FormControl
                                    fullWidth
                                    size="small"
                                    onClick={(e) => e.stopPropagation()}
                                  >
                                    <Select
                                      value={user.role}
                                      onChange={(e) =>
                                        handleUpdateRole(
                                          user._id,
                                          e.target.value
                                        )
                                      }
                                      disabled={
                                        user.role === 'super_admin' &&
                                        user._id !== currentUser._id
                                      }
                                      size="small"
                                      sx={{ minWidth: 130 }}
                                    >
                                      <MenuItem value="super_admin">
                                        Super Admin
                                      </MenuItem>
                                      <MenuItem value="admin">Admin</MenuItem>
                                      <MenuItem value="manager">
                                        Manager
                                      </MenuItem>
                                      <MenuItem value="staff">Staff</MenuItem>
                                    </Select>
                                  </FormControl>
                                ) : (
                                  <Chip
                                    icon={getRoleIcon(user.role)}
                                    label={user.role.replace('_', ' ')}
                                    color={getRoleColor(user.role)}
                                    size="small"
                                  />
                                )}
                              </TableCell>
                              <TableCell>
                                {user.isLocked ? (
                                  <Chip
                                    icon={<Lock size={14} />}
                                    label="Locked"
                                    color="error"
                                    size="small"
                                  />
                                ) : isSuperAdmin ? (
                                  <FormControl
                                    fullWidth
                                    size="small"
                                    onClick={(e) => e.stopPropagation()}
                                  >
                                    <Select
                                      value={user.status}
                                      onChange={(e) =>
                                        handleUpdateStatus(
                                          user._id,
                                          e.target.value
                                        )
                                      }
                                      disabled={
                                        user.role === 'super_admin' &&
                                        user._id !== currentUser._id
                                      }
                                      size="small"
                                      sx={{ minWidth: 110 }}
                                    >
                                      <MenuItem value="active">Active</MenuItem>
                                      <MenuItem value="inactive">
                                        Inactive
                                      </MenuItem>
                                      <MenuItem value="blocked">
                                        Blocked
                                      </MenuItem>
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
                              <TableCell
                                align="right"
                                onClick={(e) => e.stopPropagation()}
                              >
                                <IconButton
                                  aria-label="more actions"
                                  aria-controls="user-menu"
                                  aria-haspopup="true"
                                  onClick={(e) => handleActionMenuOpen(e, user)}
                                  size="small"
                                >
                                  <MoreVert size={20} />
                                </IconButton>
                              </TableCell>
                            </TableRow>
                          ))
                        ) : (
                          <TableRow>
                            <TableCell
                              colSpan={7}
                              align="center"
                              sx={{ py: 3 }}
                            >
                              <Box sx={{ textAlign: 'center', py: 3 }}>
                                <Shield
                                  size={40}
                                  style={{
                                    color: theme.palette.text.secondary,
                                    opacity: 0.5,
                                    marginBottom: 16,
                                  }}
                                />
                                <Typography
                                  variant="body1"
                                  sx={{ fontWeight: 500 }}
                                >
                                  No admin users found
                                </Typography>
                                <Typography
                                  variant="body2"
                                  color="text.secondary"
                                  sx={{ mt: 1 }}
                                >
                                  {searchTerm ||
                                  roleFilter !== 'all' ||
                                  statusFilter !== 'all'
                                    ? 'Try adjusting your search or filters'
                                    : 'Add your first admin user to get started'}
                                </Typography>
                              </Box>
                            </TableCell>
                          </TableRow>
                        )}
                      </TableBody>
                    </Table>
                  </TableContainer>
                  <Box
                    sx={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      p: 2,
                    }}
                  >
                    <Typography variant="body2" color="text.secondary">
                      {selectedUsers.length > 0 &&
                        `${selectedUsers.length} selected`}
                    </Typography>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <Typography
                        variant="body2"
                        color="text.secondary"
                        sx={{ mr: 2 }}
                      >
                        Rows per page:
                      </Typography>
                      <Select
                        value={rowsPerPage}
                        onChange={handleChangeRowsPerPage}
                        size="small"
                        sx={{ minWidth: 80 }}
                      >
                        <MenuItem value={5}>5</MenuItem>
                        <MenuItem value={10}>10</MenuItem>
                        <MenuItem value={25}>25</MenuItem>
                        <MenuItem value={50}>50</MenuItem>
                      </Select>
                      <Box
                        sx={{ display: 'flex', alignItems: 'center', ml: 4 }}
                      >
                        <IconButton
                          onClick={() => setPage(page > 0 ? page - 1 : 0)}
                          disabled={page === 0}
                          size="small"
                        >
                          <ChevronLeft size={20} />
                        </IconButton>
                        <Typography variant="body2" sx={{ mx: 2 }}>
                          Page {page + 1} of{' '}
                          {Math.max(
                            1,
                            Math.ceil(filteredUsers.length / rowsPerPage)
                          )}
                        </Typography>
                        <IconButton
                          onClick={() =>
                            setPage(
                              page <
                                Math.ceil(filteredUsers.length / rowsPerPage) -
                                  1
                                ? page + 1
                                : page
                            )
                          }
                          disabled={
                            page >=
                            Math.ceil(filteredUsers.length / rowsPerPage) - 1
                          }
                          size="small"
                        >
                          <ChevronRight size={20} />
                        </IconButton>
                      </Box>
                    </Box>
                  </Box>
                </>
              )}
            </TabPanel>

            <TabPanel value={activeTab} index={1}>
              {/* All Users Tab */}
              {loading && !users?.length ? (
                <TableSkeleton />
              ) : (
                <>
                  <TableContainer>
                    <Table sx={{ minWidth: 650 }} aria-label="all users table">
                      <TableHead>
                        <TableRow>
                          <TableCell padding="checkbox">
                            <Checkbox
                              indeterminate={
                                selectedUsers.length > 0 &&
                                selectedUsers.length < paginatedUsers.length
                              }
                              checked={
                                paginatedUsers.length > 0 &&
                                selectedUsers.length === paginatedUsers.length
                              }
                              onChange={handleSelectAllClick}
                              inputProps={{ 'aria-label': 'select all users' }}
                            />
                          </TableCell>
                          <TableCell>Name</TableCell>
                          <TableCell>Email</TableCell>
                          <TableCell>Role</TableCell>
                          <TableCell>Status</TableCell>
                          <TableCell>Last Login</TableCell>
                          <TableCell align="right">Actions</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {paginatedUsers.length > 0 ? (
                          paginatedUsers.map((user) => (
                            <TableRow
                              key={user._id}
                              hover
                              onClick={() => openDetailPanel(user)}
                              sx={{ cursor: 'pointer' }}
                              selected={selectedUsers.includes(user._id)}
                            >
                              <TableCell
                                padding="checkbox"
                                onClick={(e) => e.stopPropagation()}
                              >
                                <Checkbox
                                  checked={selectedUsers.includes(user._id)}
                                  onChange={() => handleSelectUser(user._id)}
                                  inputProps={{
                                    'aria-labelledby': `user-${user._id}`,
                                  }}
                                />
                              </TableCell>
                              <TableCell component="th" scope="row">
                                <Box
                                  sx={{ display: 'flex', alignItems: 'center' }}
                                >
                                  <Avatar
                                    sx={{
                                      width: 32,
                                      height: 32,
                                      mr: 1.5,
                                      bgcolor: user.isLocked
                                        ? theme.palette.error.main
                                        : theme.palette.primary.main,
                                    }}
                                  >
                                    {user.name?.charAt(0).toUpperCase() || 'U'}
                                  </Avatar>
                                  <Typography
                                    variant="body2"
                                    sx={{ fontWeight: 500 }}
                                  >
                                    {user.name}
                                    {user.isLocked && (
                                      <Tooltip title="Account Locked">
                                        <Lock
                                          size={14}
                                          style={{
                                            marginLeft: 8,
                                            color: theme.palette.error.main,
                                          }}
                                        />
                                      </Tooltip>
                                    )}
                                  </Typography>
                                </Box>
                              </TableCell>
                              <TableCell>{user.email}</TableCell>
                              <TableCell>
                                <Chip
                                  icon={getRoleIcon(user.role)}
                                  label={user.role.replace('_', ' ')}
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
                              <TableCell
                                align="right"
                                onClick={(e) => e.stopPropagation()}
                              >
                                <Box
                                  sx={{
                                    display: 'flex',
                                    justifyContent: 'flex-end',
                                  }}
                                >
                                  <Tooltip title="Edit User">
                                    <IconButton
                                      size="small"
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        openEditDialog(user);
                                      }}
                                    >
                                      <Edit size={18} />
                                    </IconButton>
                                  </Tooltip>
                                  <Tooltip title="Delete User">
                                    <IconButton
                                      size="small"
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        openDeleteDialog(user);
                                      }}
                                      disabled={user.role === 'super_admin'}
                                    >
                                      <Trash2
                                        size={18}
                                        color={theme.palette.error.main}
                                      />
                                    </IconButton>
                                  </Tooltip>
                                </Box>
                              </TableCell>
                            </TableRow>
                          ))
                        ) : (
                          <TableRow>
                            <TableCell
                              colSpan={7}
                              align="center"
                              sx={{ py: 3 }}
                            >
                              <Box sx={{ textAlign: 'center', py: 3 }}>
                                <Users
                                  size={40}
                                  style={{
                                    color: theme.palette.text.secondary,
                                    opacity: 0.5,
                                    marginBottom: 16,
                                  }}
                                />
                                <Typography
                                  variant="body1"
                                  sx={{ fontWeight: 500 }}
                                >
                                  No users found
                                </Typography>
                                <Typography
                                  variant="body2"
                                  color="text.secondary"
                                  sx={{ mt: 1 }}
                                >
                                  {searchTerm ||
                                  roleFilter !== 'all' ||
                                  statusFilter !== 'all'
                                    ? 'Try adjusting your search or filters'
                                    : 'Add your first user to get started'}
                                </Typography>
                              </Box>
                            </TableCell>
                          </TableRow>
                        )}
                      </TableBody>
                    </Table>
                  </TableContainer>
                  <Box
                    sx={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      p: 2,
                    }}
                  >
                    <Typography variant="body2" color="text.secondary">
                      {selectedUsers.length > 0 &&
                        `${selectedUsers.length} selected`}
                    </Typography>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      {/* <Typography variant="body2" color="text.secondary" sx  alignItems: 'center' }}> */}
                      <Typography
                        variant="body2"
                        color="text.secondary"
                        sx={{ mr: 2 }}
                      >
                        Rows per page:
                      </Typography>
                      <Select
                        value={rowsPerPage}
                        onChange={handleChangeRowsPerPage}
                        size="small"
                        sx={{ minWidth: 80 }}
                      >
                        <MenuItem value={5}>5</MenuItem>
                        <MenuItem value={10}>10</MenuItem>
                        <MenuItem value={25}>25</MenuItem>
                        <MenuItem value={50}>50</MenuItem>
                      </Select>
                      <Box
                        sx={{ display: 'flex', alignItems: 'center', ml: 4 }}
                      >
                        <IconButton
                          onClick={() => setPage(page > 0 ? page - 1 : 0)}
                          disabled={page === 0}
                          size="small"
                        >
                          <ChevronLeft size={20} />
                        </IconButton>
                        <Typography variant="body2" sx={{ mx: 2 }}>
                          Page {page + 1} of{' '}
                          {Math.max(
                            1,
                            Math.ceil(filteredUsers.length / rowsPerPage)
                          )}
                        </Typography>
                        <IconButton
                          onClick={() =>
                            setPage(
                              page <
                                Math.ceil(filteredUsers.length / rowsPerPage) -
                                  1
                                ? page + 1
                                : page
                            )
                          }
                          disabled={
                            page >=
                            Math.ceil(filteredUsers.length / rowsPerPage) - 1
                          }
                          size="small"
                        >
                          <ChevronRight size={20} />
                        </IconButton>
                      </Box>
                    </Box>
                  </Box>
                </>
              )}
            </TabPanel>

            <TabPanel value={activeTab} index={2}>
              {/* Invitations Tab */}
              {loading ? (
                <TableSkeleton />
              ) : (
                <>
                  <Box
                    sx={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      mb: 2,
                    }}
                  >
                    <Typography variant="h6">Admin Invitations</Typography>
                    <Button
                      variant="contained"
                      startIcon={<Mail />}
                      onClick={openInviteDialog}
                      size={isMobile ? 'small' : 'medium'}
                    >
                      New Invitation
                    </Button>
                  </Box>

                  {!invitations || invitations.length === 0 ? (
                    <EmptyState
                      icon={
                        <Mail size={48} color={theme.palette.text.secondary} />
                      }
                      title="No invitations found"
                      description="There are no pending or recent admin invitations. Click the 'New Invitation' button to invite an admin."
                      actionLabel="Invite Admin"
                      onAction={openInviteDialog}
                    />
                  ) : (
                    <TableContainer>
                      <Table
                        sx={{ minWidth: 650 }}
                        aria-label="invitations table"
                      >
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
                                <Box
                                  sx={{ display: 'flex', alignItems: 'center' }}
                                >
                                  <Avatar
                                    sx={{
                                      width: 32,
                                      height: 32,
                                      mr: 1.5,
                                      bgcolor:
                                        invitation.status === 'pending'
                                          ? theme.palette.info.main
                                          : invitation.status === 'accepted'
                                          ? theme.palette.success.main
                                          : theme.palette.error.main,
                                    }}
                                  >
                                    {invitation.name?.charAt(0).toUpperCase() ||
                                      'U'}
                                  </Avatar>
                                  <Typography
                                    variant="body2"
                                    sx={{ fontWeight: 500 }}
                                  >
                                    {invitation.name}
                                  </Typography>
                                </Box>
                              </TableCell>
                              <TableCell>{invitation.email}</TableCell>
                              <TableCell>
                                <Chip
                                  icon={getRoleIcon(invitation.role)}
                                  label={invitation.role.replace('_', ' ')}
                                  color={getRoleColor(invitation.role)}
                                  size="small"
                                />
                              </TableCell>
                              <TableCell>
                                <Chip
                                  label={invitation.status}
                                  color={getInvitationStatusColor(
                                    invitation.status
                                  )}
                                  size="small"
                                />
                              </TableCell>
                              <TableCell>
                                {invitation.invitedBy?.name || 'Unknown'}
                              </TableCell>
                              <TableCell>
                                {new Date(
                                  invitation.expiresAt
                                ).toLocaleString()}
                              </TableCell>
                              <TableCell align="right">
                                {invitation.status === 'pending' && (
                                  <Box
                                    sx={{
                                      display: 'flex',
                                      justifyContent: 'flex-end',
                                    }}
                                  >
                                    <Tooltip title="Resend Invitation">
                                      <IconButton
                                        size="small"
                                        onClick={() =>
                                          handleResendInvitation(invitation._id)
                                        }
                                      >
                                        <Send
                                          size={18}
                                          color={theme.palette.primary.main}
                                        />
                                      </IconButton>
                                    </Tooltip>
                                    <Tooltip title="Cancel Invitation">
                                      <IconButton
                                        size="small"
                                        onClick={() =>
                                          handleCancelInvitation(invitation._id)
                                        }
                                      >
                                        <X
                                          size={18}
                                          color={theme.palette.error.main}
                                        />
                                      </IconButton>
                                    </Tooltip>
                                  </Box>
                                )}
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </TableContainer>
                  )}
                </>
              )}
            </TabPanel>
          </Paper>
        </Grid>

        {/* Right Column - User Detail Panel */}
        {detailPanelOpen && isLargeScreen && (
          <Grid item xs={12} lg={4}>
            <Paper
              elevation={0}
              sx={{
                borderRadius: 2,
                border: `1px solid ${theme.palette.divider}`,
                height: '100%',
                overflow: 'hidden',
              }}
            >
              {selectedUser && (
                <UserDetailPanel
                  user={selectedUser}
                  onClose={closeDetailPanel}
                  onEdit={() => openEditDialog(selectedUser)}
                  onLock={() => openLockDialog(selectedUser)}
                  onUnlock={() => handleUnlockAccount(selectedUser._id)}
                  onDelete={() => openDeleteDialog(selectedUser)}
                />
              )}
            </Paper>
          </Grid>
        )}
      </Grid>

      {/* Mobile User Detail Dialog */}
      <Dialog
        open={detailPanelOpen && !isLargeScreen}
        onClose={closeDetailPanel}
        fullScreen={isMobile}
        maxWidth="sm"
        fullWidth
      >
        {selectedUser && (
          <UserDetailPanel
            user={selectedUser}
            onClose={closeDetailPanel}
            onEdit={() => {
              closeDetailPanel();
              openEditDialog(selectedUser);
            }}
            onLock={() => {
              closeDetailPanel();
              openLockDialog(selectedUser);
            }}
            onUnlock={() => {
              closeDetailPanel();
              handleUnlockAccount(selectedUser._id);
            }}
            onDelete={() => {
              closeDetailPanel();
              openDeleteDialog(selectedUser);
            }}
          />
        )}
      </Dialog>

      {/* Action Menu */}
      <Menu
        id="user-menu"
        anchorEl={actionMenuAnchor}
        keepMounted
        open={Boolean(actionMenuAnchor)}
        onClose={handleActionMenuClose}
        PaperProps={{
          elevation: 3,
          sx: { width: 200 },
        }}
      >
        <MenuItem
          onClick={() => {
            openDetailPanel(selectedUser);
            handleActionMenuClose();
          }}
        >
          <ListItemIcon>
            <Eye size={18} />
          </ListItemIcon>
          <ListItemText primary="View Details" />
        </MenuItem>
        <MenuItem
          onClick={() => {
            openEditDialog(selectedUser);
            handleActionMenuClose();
          }}
        >
          <ListItemIcon>
            <Edit size={18} />
          </ListItemIcon>
          <ListItemText primary="Edit" />
        </MenuItem>
        <Divider />
        {selectedUser?.isLocked ? (
          <MenuItem
            onClick={() => {
              handleUnlockAccount(selectedUser._id);
              handleActionMenuClose();
            }}
          >
            <ListItemIcon>
              <Unlock size={18} />
            </ListItemIcon>
            <ListItemText primary="Unlock Account" />
          </MenuItem>
        ) : (
          <MenuItem
            onClick={() => {
              openLockDialog(selectedUser);
              handleActionMenuClose();
            }}
          >
            <ListItemIcon>
              <Lock size={18} />
            </ListItemIcon>
            <ListItemText primary="Lock Account" />
          </MenuItem>
        )}
        <Divider />
        <MenuItem
          onClick={() => {
            openDeleteDialog(selectedUser);
            handleActionMenuClose();
          }}
          disabled={selectedUser?.role === 'super_admin'}
          sx={{ color: theme.palette.error.main }}
        >
          <ListItemIcon>
            <Trash2 size={18} color={theme.palette.error.main} />
          </ListItemIcon>
          <ListItemText primary="Delete" />
        </MenuItem>
      </Menu>

      {/* Add User Dialog */}
      <Dialog
        open={addDialogOpen}
        onClose={() => setAddDialogOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <UserPlus size={20} style={{ marginRight: 8 }} />
            Add New User
          </Box>
        </DialogTitle>
        <DialogContent dividers>
          <DialogContentText sx={{ mb: 2 }}>
            Create a new admin or staff account with appropriate permissions.
          </DialogContentText>
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <TextField
                label="Full Name"
                name="name"
                fullWidth
                value={formData.name}
                onChange={handleFormChange}
                margin="normal"
                required
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                label="Email"
                name="email"
                type="email"
                fullWidth
                value={formData.email}
                onChange={handleFormChange}
                margin="normal"
                required
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                label="Password"
                name="password"
                type={passwordVisible ? 'text' : 'password'}
                fullWidth
                value={formData.password}
                onChange={handleFormChange}
                margin="normal"
                required
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton
                        onClick={() => setPasswordVisible(!passwordVisible)}
                        edge="end"
                      >
                        {passwordVisible ? (
                          <EyeOff size={18} />
                        ) : (
                          <Eye size={18} />
                        )}
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
              />
            </Grid>
            <Grid item xs={12}>
              <FormControl fullWidth margin="normal">
                <InputLabel>Role</InputLabel>
                <Select
                  name="role"
                  value={formData.role}
                  onChange={handleFormChange}
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
                name="phone"
                fullWidth
                value={formData.phone}
                onChange={handleFormChange}
                margin="normal"
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions sx={{ px: 3, py: 2 }}>
          <Button onClick={() => setAddDialogOpen(false)}>Cancel</Button>
          <Button
            onClick={handleAddUser}
            variant="contained"
            color="primary"
            startIcon={<UserPlus size={18} />}
          >
            Add User
          </Button>
        </DialogActions>
      </Dialog>

      {/* Edit User Dialog */}
      <Dialog
        open={editDialogOpen}
        onClose={() => setEditDialogOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <Edit size={20} style={{ marginRight: 8 }} />
            Edit User
          </Box>
        </DialogTitle>
        <DialogContent dividers>
          <DialogContentText sx={{ mb: 2 }}>
            Update user information and permissions.
          </DialogContentText>
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <TextField
                label="Full Name"
                name="name"
                fullWidth
                value={formData.name}
                onChange={handleFormChange}
                margin="normal"
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                label="Email"
                name="email"
                type="email"
                fullWidth
                value={formData.email}
                onChange={handleFormChange}
                margin="normal"
              />
            </Grid>
            <Grid item xs={12}>
              <FormControl fullWidth margin="normal">
                <InputLabel>Role</InputLabel>
                <Select
                  name="role"
                  value={formData.role}
                  onChange={handleFormChange}
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
                  name="status"
                  value={formData.status}
                  onChange={handleFormChange}
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
                name="phone"
                fullWidth
                value={formData.phone}
                onChange={handleFormChange}
                margin="normal"
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                label="New Password (leave blank to keep current)"
                name="password"
                type={passwordVisible ? 'text' : 'password'}
                fullWidth
                value={formData.password}
                onChange={handleFormChange}
                margin="normal"
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton
                        onClick={() => setPasswordVisible(!passwordVisible)}
                        edge="end"
                      >
                        {passwordVisible ? (
                          <EyeOff size={18} />
                        ) : (
                          <Eye size={18} />
                        )}
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions sx={{ px: 3, py: 2 }}>
          <Button onClick={() => setEditDialogOpen(false)}>Cancel</Button>
          <Button
            onClick={handleEditUser}
            variant="contained"
            color="primary"
            startIcon={<Save size={18} />}
          >
            Update User
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete User Dialog */}
      <Dialog
        open={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
        maxWidth="sm"
      >
        <DialogTitle>
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              color: theme.palette.error.main,
            }}
          >
            <AlertTriangle size={20} style={{ marginRight: 8 }} />
            Confirm Deletion
          </Box>
        </DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to delete the user{' '}
            <strong>{selectedUser?.name}</strong>? This action cannot be undone.
          </DialogContentText>
          <Alert severity="warning" sx={{ mt: 2 }}>
            All data associated with this user will be permanently removed from
            the system.
          </Alert>
        </DialogContent>
        <DialogActions sx={{ px: 3, py: 2 }}>
          <Button onClick={() => setDeleteDialogOpen(false)}>Cancel</Button>
          <Button
            onClick={handleDeleteUser}
            variant="contained"
            color="error"
            startIcon={<Trash2 size={18} />}
          >
            Delete User
          </Button>
        </DialogActions>
      </Dialog>

      {/* Invite Admin Dialog */}
      <Dialog
        open={inviteDialogOpen}
        onClose={() => setInviteDialogOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <Mail size={20} style={{ marginRight: 8 }} />
            Invite Admin
          </Box>
        </DialogTitle>
        <DialogContent dividers>
          <DialogContentText sx={{ mb: 2 }}>
            Send an invitation to a new admin user. They will receive an email
            with instructions to set up their account.
          </DialogContentText>
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <TextField
                label="Full Name"
                name="name"
                fullWidth
                value={inviteData.name}
                onChange={handleInviteFormChange}
                margin="normal"
                required
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                label="Email"
                name="email"
                type="email"
                fullWidth
                value={inviteData.email}
                onChange={handleInviteFormChange}
                margin="normal"
                required
              />
            </Grid>
            <Grid item xs={12}>
              <FormControl fullWidth margin="normal">
                <InputLabel>Role</InputLabel>
                <Select
                  name="role"
                  value={inviteData.role}
                  onChange={handleInviteFormChange}
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
                name="message"
                multiline
                rows={4}
                fullWidth
                placeholder="Add a personal message to the invitation email..."
                value={inviteData.message}
                onChange={handleInviteFormChange}
                margin="normal"
              />
            </Grid>
            <Grid item xs={12}>
              <FormControlLabel
                control={
                  <Checkbox
                    checked={inviteData.sendWelcomeEmail}
                    onChange={handleInviteFormChange}
                    name="sendWelcomeEmail"
                  />
                }
                label="Send welcome email with instructions"
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions sx={{ px: 3, py: 2 }}>
          <Button onClick={() => setInviteDialogOpen(false)}>Cancel</Button>
          <Button
            onClick={handleInviteAdmin}
            variant="contained"
            color="primary"
            startIcon={<Send size={18} />}
          >
            Send Invitation
          </Button>
        </DialogActions>
      </Dialog>

      {/* Lock Account Dialog */}
      <Dialog
        open={lockDialogOpen}
        onClose={() => setLockDialogOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <Lock size={20} style={{ marginRight: 8 }} />
            Lock User Account
          </Box>
        </DialogTitle>
        <DialogContent dividers>
          <DialogContentText sx={{ mb: 2 }}>
            {selectedUser && `Lock ${selectedUser.name}'s account temporarily`}
          </DialogContentText>
          <Alert severity="warning" sx={{ mb: 3 }} icon={<AlertTriangle />}>
            Locking this account will prevent the user from logging in until the
            lock expires or is manually removed.
          </Alert>
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <TextField
                label="Reason for Locking"
                name="reason"
                multiline
                rows={3}
                fullWidth
                placeholder="Provide a reason for locking this account..."
                value={lockData.reason}
                onChange={handleLockFormChange}
                margin="normal"
                required
              />
            </Grid>
            <Grid item xs={12}>
              <FormControl fullWidth margin="normal">
                <InputLabel>Lock Duration</InputLabel>
                <Select
                  name="durationMinutes"
                  value={lockData.durationMinutes.toString()}
                  onChange={handleLockFormChange}
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
        <DialogActions sx={{ px: 3, py: 2 }}>
          <Button onClick={() => setLockDialogOpen(false)}>Cancel</Button>
          <Button
            onClick={handleLockAccount}
            variant="contained"
            color="error"
            startIcon={<Lock size={18} />}
          >
            Lock Account
          </Button>
        </DialogActions>
      </Dialog>

      {/* Bulk Action Dialog */}
      <Dialog
        open={bulkActionDialogOpen}
        onClose={() => setBulkActionDialogOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <Users size={20} style={{ marginRight: 8 }} />
            Bulk Actions
          </Box>
        </DialogTitle>
        <DialogContent dividers>
          <DialogContentText sx={{ mb: 2 }}>
            Apply actions to {selectedUsers.length} selected users.
          </DialogContentText>
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <FormControl fullWidth margin="normal">
                <InputLabel>Action</InputLabel>
                <Select
                  name="action"
                  value={bulkActionData.action}
                  onChange={handleBulkActionChange}
                  label="Action"
                >
                  <MenuItem value="status">Update Status</MenuItem>
                  <MenuItem value="role">Update Role</MenuItem>
                  <MenuItem value="delete">Delete Users</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            {bulkActionData.action === 'status' && (
              <Grid item xs={12}>
                <FormControl fullWidth margin="normal">
                  <InputLabel>Status</InputLabel>
                  <Select
                    name="value"
                    value={bulkActionData.value}
                    onChange={handleBulkActionChange}
                    label="Status"
                  >
                    <MenuItem value="active">Active</MenuItem>
                    <MenuItem value="inactive">Inactive</MenuItem>
                    <MenuItem value="blocked">Blocked</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
            )}
            {bulkActionData.action === 'role' && (
              <Grid item xs={12}>
                <FormControl fullWidth margin="normal">
                  <InputLabel>Role</InputLabel>
                  <Select
                    name="value"
                    value={bulkActionData.value}
                    onChange={handleBulkActionChange}
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
            )}
            {bulkActionData.action === 'delete' && (
              <Grid item xs={12}>
                <Alert severity="error" sx={{ mt: 1 }}>
                  This action will permanently delete {selectedUsers.length}{' '}
                  users and cannot be undone.
                </Alert>
              </Grid>
            )}
          </Grid>
        </DialogContent>
        <DialogActions sx={{ px: 3, py: 2 }}>
          <Button onClick={() => setBulkActionDialogOpen(false)}>Cancel</Button>
          <Button
            onClick={handleBulkAction}
            variant="contained"
            color={bulkActionData.action === 'delete' ? 'error' : 'primary'}
          >
            Apply to {selectedUsers.length} Users
          </Button>
        </DialogActions>
      </Dialog>

      {/* Export Dialog */}
      <Dialog
        open={exportDialogOpen}
        onClose={() => setExportDialogOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <Download size={20} style={{ marginRight: 8 }} />
            Export Users
          </Box>
        </DialogTitle>
        <DialogContent dividers>
          <DialogContentText sx={{ mb: 2 }}>
            Export user data in your preferred format.
          </DialogContentText>
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <FormControl fullWidth margin="normal">
                <InputLabel>Format</InputLabel>
                <Select
                  name="format"
                  value={exportData.format}
                  onChange={handleExportDataChange}
                  label="Format"
                >
                  <MenuItem value="csv">CSV</MenuItem>
                  <MenuItem value="json">JSON</MenuItem>
                  <MenuItem value="xlsx">Excel (XLSX)</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12}>
              <Typography variant="subtitle2" gutterBottom>
                Fields to Include
              </Typography>
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mt: 1 }}>
                <Chip
                  label="Name"
                  color={
                    exportData.includeFields.includes('name')
                      ? 'primary'
                      : 'default'
                  }
                  onClick={() => handleExportFieldToggle('name')}
                  variant={
                    exportData.includeFields.includes('name')
                      ? 'filled'
                      : 'outlined'
                  }
                />
                <Chip
                  label="Email"
                  color={
                    exportData.includeFields.includes('email')
                      ? 'primary'
                      : 'default'
                  }
                  onClick={() => handleExportFieldToggle('email')}
                  variant={
                    exportData.includeFields.includes('email')
                      ? 'filled'
                      : 'outlined'
                  }
                />
                <Chip
                  label="Role"
                  color={
                    exportData.includeFields.includes('role')
                      ? 'primary'
                      : 'default'
                  }
                  onClick={() => handleExportFieldToggle('role')}
                  variant={
                    exportData.includeFields.includes('role')
                      ? 'filled'
                      : 'outlined'
                  }
                />
                <Chip
                  label="Status"
                  color={
                    exportData.includeFields.includes('status')
                      ? 'primary'
                      : 'default'
                  }
                  onClick={() => handleExportFieldToggle('status')}
                  variant={
                    exportData.includeFields.includes('status')
                      ? 'filled'
                      : 'outlined'
                  }
                />
                <Chip
                  label="Last Login"
                  color={
                    exportData.includeFields.includes('lastLogin')
                      ? 'primary'
                      : 'default'
                  }
                  onClick={() => handleExportFieldToggle('lastLogin')}
                  variant={
                    exportData.includeFields.includes('lastLogin')
                      ? 'filled'
                      : 'outlined'
                  }
                />
                <Chip
                  label="Created At"
                  color={
                    exportData.includeFields.includes('createdAt')
                      ? 'primary'
                      : 'default'
                  }
                  onClick={() => handleExportFieldToggle('createdAt')}
                  variant={
                    exportData.includeFields.includes('createdAt')
                      ? 'filled'
                      : 'outlined'
                  }
                />
                <Chip
                  label="Phone"
                  color={
                    exportData.includeFields.includes('phone')
                      ? 'primary'
                      : 'default'
                  }
                  onClick={() => handleExportFieldToggle('phone')}
                  variant={
                    exportData.includeFields.includes('phone')
                      ? 'filled'
                      : 'outlined'
                  }
                />
              </Box>
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions sx={{ px: 3, py: 2 }}>
          <Button onClick={() => setExportDialogOpen(false)}>Cancel</Button>
          <Button
            onClick={handleExport}
            variant="contained"
            color="primary"
            startIcon={<Download size={18} />}
            disabled={exportData.includeFields.length === 0}
          >
            Export Users
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default AdminManagement;
