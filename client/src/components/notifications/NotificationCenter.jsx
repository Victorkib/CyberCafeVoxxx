import React, { useEffect, useState, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  IconButton,
  Typography,
  Box,
  Tabs,
  Tab,
  Button,
  CircularProgress,
  Divider,
  TextField,
  InputAdornment,
  Chip,
  Collapse,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import SearchIcon from '@mui/icons-material/Search';
import FilterListIcon from '@mui/icons-material/FilterList';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import {
  fetchNotifications,
  markAllAsRead,
  deleteNotification,
  getUnreadCount,
} from '../../redux/slices/notificationSlice';
import { formatDistanceToNow, format } from 'date-fns';
import { useNotification } from '../../contexts/NotificationContext';
import { motion, AnimatePresence } from 'framer-motion';

const NotificationCenter = ({ open, onClose }) => {
  const dispatch = useDispatch();
  const { notifications, loading, pagination, groupedNotifications } = useNotification();
  const [tab, setTab] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedType, setSelectedType] = useState('all');
  const [expandedGroups, setExpandedGroups] = useState({});
  const [sortBy, setSortBy] = useState('date'); // 'date' or 'priority'

  useEffect(() => {
    if (open) {
      dispatch(fetchNotifications({ page: 1, limit: 10 }));
    }
  }, [dispatch, open]);

  const handleTabChange = (event, newValue) => {
    setTab(newValue);
    dispatch(
      fetchNotifications({
        page: 1,
        limit: 10,
        read: newValue === 1 ? true : newValue === 2 ? false : undefined,
      })
    );
  };

  const handleMarkAllAsRead = async () => {
    await dispatch(markAllAsRead());
    dispatch(getUnreadCount());
  };

  const handleDelete = async (id) => {
    await dispatch(deleteNotification(id));
    dispatch(getUnreadCount());
  };

  const handleLoadMore = () => {
    if (pagination.hasNextPage) {
      dispatch(
        fetchNotifications({
          page: pagination.currentPage + 1,
          limit: 10,
          read: tab === 1 ? true : tab === 2 ? false : undefined,
        })
      );
    }
  };

  const toggleGroup = (type) => {
    setExpandedGroups(prev => ({
      ...prev,
      [type]: !prev[type]
    }));
  };

  // Filter and sort notifications
  const filteredNotifications = useMemo(() => {
    let filtered = notifications;

    // Apply search filter
    if (searchQuery) {
      filtered = filtered.filter(
        notification =>
          notification.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          notification.message.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Apply type filter
    if (selectedType !== 'all') {
      filtered = filtered.filter(notification => notification.type === selectedType);
    }

    // Apply sorting
    filtered = [...filtered].sort((a, b) => {
      if (sortBy === 'date') {
        return new Date(b.createdAt) - new Date(a.createdAt);
      } else {
        // Priority sorting (assuming priority is a number, higher is more important)
        return (b.priority || 0) - (a.priority || 0);
      }
    });

    return filtered;
  }, [notifications, searchQuery, selectedType, sortBy]);

  // Group notifications by date
  const groupedByDate = useMemo(() => {
    const groups = {};
    filteredNotifications.forEach(notification => {
      const date = format(new Date(notification.createdAt), 'yyyy-MM-dd');
      if (!groups[date]) {
        groups[date] = [];
      }
      groups[date].push(notification);
    });
    return groups;
  }, [filteredNotifications]);

  const getNotificationTypeColor = (type) => {
    const colors = {
      order: '#4CAF50',
      payment: '#2196F3',
      system: '#FFC107',
      promotion: '#9C27B0',
      security: '#F44336',
      product: '#00BCD4',
      review: '#FF9800',
      wishlist: '#795548',
    };
    return colors[type] || '#757575';
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="sm"
      fullWidth
      PaperProps={{
        sx: { height: '80vh' },
      }}
    >
      <DialogTitle>
        <Box display="flex" justifyContent="space-between" alignItems="center">
          <Typography variant="h6">Notifications</Typography>
          <Box>
            <Button
              variant="text"
              color="primary"
              onClick={handleMarkAllAsRead}
              disabled={loading}
            >
              Mark all as read
            </Button>
            <IconButton onClick={onClose} size="small">
              <CloseIcon />
            </IconButton>
          </Box>
        </Box>
      </DialogTitle>

      <Box sx={{ px: 2, pb: 2 }}>
        <TextField
          fullWidth
          variant="outlined"
          placeholder="Search notifications..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon />
              </InputAdornment>
            ),
          }}
          size="small"
        />
      </Box>

      <Box sx={{ px: 2, pb: 2, display: 'flex', gap: 1, flexWrap: 'wrap' }}>
        <Chip
          label="All Types"
          onClick={() => setSelectedType('all')}
          color={selectedType === 'all' ? 'primary' : 'default'}
          size="small"
        />
        {Object.keys(groupedNotifications).map((type) => (
          <Chip
            key={type}
            label={type}
            onClick={() => setSelectedType(type)}
            color={selectedType === type ? 'primary' : 'default'}
            size="small"
            sx={{
              backgroundColor: getNotificationTypeColor(type),
              color: 'white',
              '&:hover': {
                backgroundColor: getNotificationTypeColor(type),
                opacity: 0.8,
              },
            }}
          />
        ))}
      </Box>

      <Tabs value={tab} onChange={handleTabChange} centered>
        <Tab label="All" />
        <Tab label="Read" />
        <Tab label="Unread" />
      </Tabs>

      <DialogContent dividers>
        {loading && notifications.length === 0 ? (
          <Box display="flex" justifyContent="center" p={3}>
            <CircularProgress />
          </Box>
        ) : filteredNotifications.length === 0 ? (
          <Typography align="center" color="textSecondary">
            No notifications found
          </Typography>
        ) : (
          <Box>
            <AnimatePresence>
              {Object.entries(groupedByDate).map(([date, dateNotifications]) => (
                <motion.div
                  key={date}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                >
                  <Box
                    sx={{
                      display: 'flex',
                      alignItems: 'center',
                      mb: 1,
                      mt: 2,
                    }}
                  >
                    <Typography variant="subtitle2" color="textSecondary">
                      {format(new Date(date), 'MMMM d, yyyy')}
                    </Typography>
                    <Chip
                      label={dateNotifications.length}
                      size="small"
                      sx={{ ml: 1 }}
                    />
                  </Box>
                  <List>
                    {dateNotifications.map((notification) => (
                      <ListItem
                        key={notification._id}
                        sx={{
                          bgcolor: notification.read ? 'transparent' : 'action.hover',
                          borderRadius: 1,
                          mb: 1,
                        }}
                      >
                        <ListItemText
                          primary={
                            <Typography variant="subtitle1">
                              {notification.title}
                            </Typography>
                          }
                          secondary={
                            <>
                              <Typography variant="body2" color="textSecondary">
                                {notification.message}
                              </Typography>
                              <Box sx={{ mt: 1, display: 'flex', gap: 1 }}>
                                <Chip
                                  label={notification.type}
                                  size="small"
                                  sx={{
                                    backgroundColor: getNotificationTypeColor(notification.type),
                                    color: 'white',
                                  }}
                                />
                                <Typography variant="caption" color="textSecondary">
                                  {formatDistanceToNow(new Date(notification.createdAt), {
                                    addSuffix: true,
                                  })}
                                </Typography>
                              </Box>
                            </>
                          }
                        />
                        <ListItemSecondaryAction>
                          <IconButton
                            edge="end"
                            size="small"
                            onClick={() => handleDelete(notification._id)}
                            disabled={loading}
                          >
                            <CloseIcon fontSize="small" />
                          </IconButton>
                        </ListItemSecondaryAction>
                      </ListItem>
                    ))}
                  </List>
                </motion.div>
              ))}
            </AnimatePresence>

            {pagination.hasNextPage && (
              <Box display="flex" justifyContent="center" mt={2}>
                <Button
                  variant="outlined"
                  onClick={handleLoadMore}
                  disabled={loading}
                >
                  Load More
                </Button>
              </Box>
            )}
          </Box>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default NotificationCenter; 