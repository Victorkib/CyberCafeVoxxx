'use client';

import { useState, useEffect, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  fetchSubscribers,
  fetchNewsletterStats,
  sendNewsletter,
  clearError,
  clearSuccess,
} from '../../redux/slices/newsletterSlice';
import { toast } from 'react-toastify';
import {
  Box,
  Typography,
  TextField,
  Button,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  CircularProgress,
  Alert,
  Card,
  CardContent,
  Grid,
  Chip,
  IconButton,
  Tooltip,
  Tabs,
  Tab,
  Divider,
  Switch,
  FormControlLabel,
  Pagination,
  useTheme,
  ThemeProvider,
  createTheme,
  CssBaseline,
} from '@mui/material';
import {
  Mail,
  Send,
  Users,
  BarChart2,
  RefreshCw,
  Download,
  CheckCircle,
  AlertTriangle,
  Edit,
  Trash2,
  FileText,
  Settings,
  Eye,
  PlusCircle,
  Search,
  ArrowUpRight,
  Clock,
  Tag,
} from 'lucide-react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from 'recharts';

// Create a dark theme to use as fallback
const darkTheme = createTheme({
  palette: {
    mode: 'dark',
  },
});

const NewsletterManagement = () => {
  const dispatch = useDispatch();
  const {
    subscribers,
    stats,
    loading,
    error,
    sendLoading,
    sendError,
    sendSuccess,
  } = useSelector((state) => state.newsletter);
  const muiTheme = useTheme();

  // Check if we have a theme, if not use dark theme as fallback
  const theme = muiTheme?.palette?.mode ? muiTheme : darkTheme;
  const isDarkMode = theme.palette.mode === 'dark';

  const [activeTab, setActiveTab] = useState(0);
  const [newsletterData, setNewsletterData] = useState({
    subject: '',
    content: '',
    type: 'marketing',
    schedule: false,
    scheduledDate: '',
    template: 'blank',
  });
  const [filterStatus, setFilterStatus] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [previewMode, setPreviewMode] = useState(false);
  const itemsPerPage = 10;

  // Mock data for charts
  const subscriberGrowthData = [
    { month: 'Jan', subscribers: 120 },
    { month: 'Feb', subscribers: 150 },
    { month: 'Mar', subscribers: 200 },
    { month: 'Apr', subscribers: 220 },
    { month: 'May', subscribers: 280 },
    { month: 'Jun', subscribers: 310 },
  ];

  const openRateData = [
    { month: 'Jan', rate: 45 },
    { month: 'Feb', rate: 52 },
    { month: 'Mar', rate: 48 },
    { month: 'Apr', rate: 61 },
    { month: 'May', rate: 58 },
    { month: 'Jun', rate: 65 },
  ];

  const newsletterTemplates = [
    { id: 'blank', name: 'Blank Template', description: 'Start from scratch' },
    {
      id: 'welcome',
      name: 'Welcome Email',
      description: 'For new subscribers',
    },
    {
      id: 'product',
      name: 'Product Update',
      description: 'Announce new features',
    },
    {
      id: 'promotion',
      name: 'Promotion',
      description: 'Sales and special offers',
    },
  ];

  const subscriberTypeData = [
    { name: 'Direct', value: 45 },
    { name: 'Referral', value: 30 },
    { name: 'Social', value: 15 },
    { name: 'Other', value: 10 },
  ];

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042'];

  useEffect(() => {
    dispatch(fetchSubscribers());
    dispatch(fetchNewsletterStats());
  }, [dispatch]);

  useEffect(() => {
    // Clear error and success messages when component unmounts
    return () => {
      dispatch(clearError());
      dispatch(clearSuccess());
    };
  }, [dispatch]);

  const handleSendNewsletter = async (e) => {
    e.preventDefault();
    try {
      await dispatch(sendNewsletter(newsletterData)).unwrap();
      setNewsletterData({
        subject: '',
        content: '',
        type: 'marketing',
        schedule: false,
        scheduledDate: '',
        template: 'blank',
      });
      toast.success('Newsletter sent successfully!');
      setActiveTab(0); // Return to dashboard after sending
    } catch (err) {
      toast.error(err.message || 'Failed to send newsletter');
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'active':
        return 'success';
      case 'unsubscribed':
        return 'error';
      case 'pending':
        return 'warning';
      default:
        return 'default';
    }
  };

  const filteredSubscribers = useMemo(() => {
    if (!Array.isArray(subscribers)) return [];

    return subscribers.filter((sub) => {
      const matchesStatus =
        filterStatus === 'all' || sub.status === filterStatus;
      const matchesSearch =
        !searchTerm ||
        sub.email.toLowerCase().includes(searchTerm.toLowerCase());
      return matchesStatus && matchesSearch;
    });
  }, [subscribers, filterStatus, searchTerm]);

  // Pagination
  const paginatedSubscribers = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return filteredSubscribers.slice(startIndex, startIndex + itemsPerPage);
  }, [filteredSubscribers, currentPage]);

  const pageCount = Math.ceil(filteredSubscribers.length / itemsPerPage);

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };

  const handleTemplateSelect = (templateId) => {
    setNewsletterData((prev) => ({
      ...prev,
      template: templateId,
      subject:
        templateId === 'welcome'
          ? 'Welcome to our newsletter!'
          : templateId === 'product'
          ? "New features you'll love"
          : templateId === 'promotion'
          ? 'Special offer inside!'
          : prev.subject,
      content:
        templateId === 'welcome'
          ? "Thank you for subscribing to our newsletter! We're excited to have you join our community."
          : templateId === 'product'
          ? "We're excited to announce our latest features that will enhance your experience."
          : templateId === 'promotion'
          ? 'For a limited time, enjoy special discounts on our premium offerings.'
          : prev.content,
    }));
  };

  const renderTabContent = () => {
    switch (activeTab) {
      case 0: // Dashboard
        return (
          <Box>
            {/* Stats Cards */}
            <Grid container spacing={3} mb={4}>
              <Grid item xs={12} md={4}>
                <Card
                  className={`shadow-sm hover:shadow-md transition-shadow duration-200 ${
                    isDarkMode ? 'bg-gray-800 text-white' : 'bg-white'
                  }`}
                >
                  <CardContent>
                    <Box display="flex" alignItems="center" mb={2}>
                      <Box
                        className={`w-12 h-12 rounded-full flex items-center justify-center ${
                          isDarkMode
                            ? 'bg-blue-900/30 text-blue-400'
                            : 'bg-blue-100 text-blue-600'
                        }`}
                        mr={2}
                      >
                        <Users size={24} />
                      </Box>
                      <Box>
                        <Typography
                          variant="h4"
                          className={
                            isDarkMode ? 'text-white' : 'text-gray-900'
                          }
                          fontWeight="bold"
                        >
                          {stats?.totalSubscribers || 0}
                        </Typography>
                        <Typography
                          variant="body2"
                          className={
                            isDarkMode ? 'text-gray-300' : 'text-gray-600'
                          }
                        >
                          Total Subscribers
                        </Typography>
                      </Box>
                    </Box>
                    <Box
                      display="flex"
                      alignItems="center"
                      justifyContent="space-between"
                      mt={2}
                    >
                      <Typography
                        variant="body2"
                        className={
                          isDarkMode ? 'text-gray-400' : 'text-gray-500'
                        }
                      >
                        {stats?.activeSubscribers || 0} active
                      </Typography>
                      <Chip
                        label="+12% this month"
                        size="small"
                        className={`${
                          isDarkMode
                            ? 'bg-green-900/30 text-green-400'
                            : 'bg-green-100 text-green-800'
                        }`}
                        icon={<ArrowUpRight size={14} />}
                      />
                    </Box>
                  </CardContent>
                </Card>
              </Grid>

              <Grid item xs={12} md={4}>
                <Card
                  className={`shadow-sm hover:shadow-md transition-shadow duration-200 ${
                    isDarkMode ? 'bg-gray-800 text-white' : 'bg-white'
                  }`}
                >
                  <CardContent>
                    <Box display="flex" alignItems="center" mb={2}>
                      <Box
                        className={`w-12 h-12 rounded-full flex items-center justify-center ${
                          isDarkMode
                            ? 'bg-green-900/30 text-green-400'
                            : 'bg-green-100 text-green-600'
                        }`}
                        mr={2}
                      >
                        <Mail size={24} />
                      </Box>
                      <Box>
                        <Typography
                          variant="h4"
                          className={
                            isDarkMode ? 'text-white' : 'text-gray-900'
                          }
                          fontWeight="bold"
                        >
                          {stats?.newslettersSent || 0}
                        </Typography>
                        <Typography
                          variant="body2"
                          className={
                            isDarkMode ? 'text-gray-300' : 'text-gray-600'
                          }
                        >
                          Newsletters Sent
                        </Typography>
                      </Box>
                    </Box>
                    <Box display="flex" alignItems="center" mt={2}>
                      <Clock
                        size={16}
                        className={
                          isDarkMode ? 'text-gray-400' : 'text-gray-500'
                        }
                      />
                      <Typography
                        variant="body2"
                        className={
                          isDarkMode ? 'text-gray-400' : 'text-gray-500'
                        }
                        ml={1}
                      >
                        Last sent:{' '}
                        {stats?.lastSentDate
                          ? new Date(stats.lastSentDate).toLocaleDateString()
                          : 'Never'}
                      </Typography>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>

              <Grid item xs={12} md={4}>
                <Card
                  className={`shadow-sm hover:shadow-md transition-shadow duration-200 ${
                    isDarkMode ? 'bg-gray-800 text-white' : 'bg-white'
                  }`}
                >
                  <CardContent>
                    <Box display="flex" alignItems="center" mb={2}>
                      <Box
                        className={`w-12 h-12 rounded-full flex items-center justify-center ${
                          isDarkMode
                            ? 'bg-purple-900/30 text-purple-400'
                            : 'bg-purple-100 text-purple-600'
                        }`}
                        mr={2}
                      >
                        <BarChart2 size={24} />
                      </Box>
                      <Box>
                        <Typography
                          variant="h4"
                          className={
                            isDarkMode ? 'text-white' : 'text-gray-900'
                          }
                          fontWeight="bold"
                        >
                          {stats?.openRate ? `${stats.openRate}%` : 'N/A'}
                        </Typography>
                        <Typography
                          variant="body2"
                          className={
                            isDarkMode ? 'text-gray-300' : 'text-gray-600'
                          }
                        >
                          Open Rate
                        </Typography>
                      </Box>
                    </Box>
                    <Box
                      display="flex"
                      alignItems="center"
                      justifyContent="space-between"
                      mt={2}
                    >
                      <Typography
                        variant="body2"
                        className={
                          isDarkMode ? 'text-gray-400' : 'text-gray-500'
                        }
                      >
                        {stats?.clickRate ? `${stats.clickRate}%` : 'N/A'} click
                        rate
                      </Typography>
                      <Chip
                        label="+5% this month"
                        size="small"
                        className={`${
                          isDarkMode
                            ? 'bg-blue-900/30 text-blue-400'
                            : 'bg-blue-100 text-blue-800'
                        }`}
                        icon={<ArrowUpRight size={14} />}
                      />
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            </Grid>

            {/* Charts */}
            <Grid container spacing={3} mb={4}>
              <Grid item xs={12} md={8}>
                <Card
                  className={`shadow-sm ${
                    isDarkMode ? 'bg-gray-800 text-white' : 'bg-white'
                  }`}
                >
                  <CardContent>
                    <Typography
                      variant="h6"
                      className={isDarkMode ? 'text-white' : 'text-gray-900'}
                      mb={3}
                    >
                      Subscriber Growth
                    </Typography>
                    <Box height={300}>
                      <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={subscriberGrowthData}>
                          <CartesianGrid
                            strokeDasharray="3 3"
                            stroke={isDarkMode ? '#374151' : '#E5E7EB'}
                          />
                          <XAxis
                            dataKey="month"
                            stroke={isDarkMode ? '#9CA3AF' : '#6B7280'}
                          />
                          <YAxis stroke={isDarkMode ? '#9CA3AF' : '#6B7280'} />
                          <RechartsTooltip
                            contentStyle={{
                              backgroundColor: isDarkMode
                                ? 'rgba(17, 24, 39, 0.8)'
                                : 'rgba(255, 255, 255, 0.8)',
                              border: 'none',
                              borderRadius: '4px',
                              color: isDarkMode ? '#F3F4F6' : '#111827',
                            }}
                          />
                          <Legend />
                          <Line
                            type="monotone"
                            dataKey="subscribers"
                            stroke="#3B82F6"
                            strokeWidth={2}
                            dot={{ r: 4 }}
                            activeDot={{ r: 6 }}
                          />
                        </LineChart>
                      </ResponsiveContainer>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>

              <Grid item xs={12} md={4}>
                <Card
                  className={`shadow-sm ${
                    isDarkMode ? 'bg-gray-800 text-white' : 'bg-white'
                  }`}
                >
                  <CardContent>
                    <Typography
                      variant="h6"
                      className={isDarkMode ? 'text-white' : 'text-gray-900'}
                      mb={3}
                    >
                      Subscriber Sources
                    </Typography>
                    <Box height={300} display="flex" justifyContent="center">
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie
                            data={subscriberTypeData}
                            cx="50%"
                            cy="50%"
                            labelLine={false}
                            outerRadius={100}
                            fill="#8884d8"
                            dataKey="value"
                            label={({ name, percent }) =>
                              `${name}: ${(percent * 100).toFixed(0)}%`
                            }
                          >
                            {subscriberTypeData.map((entry, index) => (
                              <Cell
                                key={`cell-${index}`}
                                fill={COLORS[index % COLORS.length]}
                              />
                            ))}
                          </Pie>
                          <RechartsTooltip
                            contentStyle={{
                              backgroundColor: isDarkMode
                                ? 'rgba(17, 24, 39, 0.8)'
                                : 'rgba(255, 255, 255, 0.8)',
                              border: 'none',
                              borderRadius: '4px',
                              color: isDarkMode ? '#F3F4F6' : '#111827',
                            }}
                          />
                        </PieChart>
                      </ResponsiveContainer>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            </Grid>

            {/* Recent Campaigns */}
            <Card
              className={`shadow-sm ${
                isDarkMode ? 'bg-gray-800 text-white' : 'bg-white'
              }`}
            >
              <CardContent>
                <Box
                  display="flex"
                  justifyContent="space-between"
                  alignItems="center"
                  mb={3}
                >
                  <Typography
                    variant="h6"
                    className={isDarkMode ? 'text-white' : 'text-gray-900'}
                  >
                    Recent Campaigns
                  </Typography>
                  <Button
                    variant="outlined"
                    startIcon={<PlusCircle size={16} />}
                    className={`${
                      isDarkMode
                        ? 'border-blue-500 text-blue-400 hover:bg-blue-900/20'
                        : 'border-blue-600 text-blue-600 hover:bg-blue-50'
                    }`}
                    onClick={() => setActiveTab(1)}
                  >
                    New Campaign
                  </Button>
                </Box>
                <TableContainer>
                  <Table>
                    <TableHead>
                      <TableRow>
                        <TableCell
                          className={
                            isDarkMode
                              ? 'text-gray-300 font-medium'
                              : 'text-gray-700 font-medium'
                          }
                        >
                          Campaign
                        </TableCell>
                        <TableCell
                          className={
                            isDarkMode
                              ? 'text-gray-300 font-medium'
                              : 'text-gray-700 font-medium'
                          }
                        >
                          Sent
                        </TableCell>
                        <TableCell
                          className={
                            isDarkMode
                              ? 'text-gray-300 font-medium'
                              : 'text-gray-700 font-medium'
                          }
                        >
                          Open Rate
                        </TableCell>
                        <TableCell
                          className={
                            isDarkMode
                              ? 'text-gray-300 font-medium'
                              : 'text-gray-700 font-medium'
                          }
                        >
                          Click Rate
                        </TableCell>
                        <TableCell
                          className={
                            isDarkMode
                              ? 'text-gray-300 font-medium'
                              : 'text-gray-700 font-medium'
                          }
                        >
                          Status
                        </TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {[
                        {
                          id: 1,
                          name: 'June Newsletter',
                          sent: 'Jun 15, 2023',
                          openRate: '62%',
                          clickRate: '24%',
                          status: 'completed',
                        },
                        {
                          id: 2,
                          name: 'Product Update',
                          sent: 'May 28, 2023',
                          openRate: '58%',
                          clickRate: '31%',
                          status: 'completed',
                        },
                        {
                          id: 3,
                          name: 'Summer Sale',
                          sent: 'May 10, 2023',
                          openRate: '71%',
                          clickRate: '42%',
                          status: 'completed',
                        },
                        {
                          id: 4,
                          name: 'July Newsletter',
                          sent: 'Scheduled',
                          openRate: '-',
                          clickRate: '-',
                          status: 'scheduled',
                        },
                      ].map((campaign) => (
                        <TableRow
                          key={campaign.id}
                          className={
                            isDarkMode
                              ? 'hover:bg-gray-700/50'
                              : 'hover:bg-gray-50'
                          }
                        >
                          <TableCell
                            className={
                              isDarkMode ? 'text-white' : 'text-gray-900'
                            }
                          >
                            <Box display="flex" alignItems="center">
                              <Mail size={16} className="mr-2" />
                              {campaign.name}
                            </Box>
                          </TableCell>
                          <TableCell
                            className={
                              isDarkMode ? 'text-gray-300' : 'text-gray-700'
                            }
                          >
                            {campaign.sent}
                          </TableCell>
                          <TableCell
                            className={
                              isDarkMode ? 'text-gray-300' : 'text-gray-700'
                            }
                          >
                            {campaign.openRate}
                          </TableCell>
                          <TableCell
                            className={
                              isDarkMode ? 'text-gray-300' : 'text-gray-700'
                            }
                          >
                            {campaign.clickRate}
                          </TableCell>
                          <TableCell>
                            <Chip
                              label={campaign.status}
                              size="small"
                              className={
                                campaign.status === 'completed'
                                  ? isDarkMode
                                    ? 'bg-green-900/30 text-green-400'
                                    : 'bg-green-100 text-green-800'
                                  : isDarkMode
                                  ? 'bg-blue-900/30 text-blue-400'
                                  : 'bg-blue-100 text-blue-800'
                              }
                            />
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              </CardContent>
            </Card>
          </Box>
        );

      case 1: // Create Newsletter
        return (
          <Box>
            <Card
              className={`shadow-sm mb-4 ${
                isDarkMode ? 'bg-gray-800 text-white' : 'bg-white'
              }`}
            >
              <CardContent>
                <Box display="flex" alignItems="center" mb={3}>
                  <FileText
                    size={20}
                    className={
                      isDarkMode ? 'text-blue-400 mr-2' : 'text-blue-600 mr-2'
                    }
                  />
                  <Typography
                    variant="h6"
                    className={isDarkMode ? 'text-white' : 'text-gray-900'}
                  >
                    Create Newsletter
                  </Typography>
                </Box>

                {/* Template Selection */}
                <Box mb={4}>
                  <Typography
                    variant="subtitle1"
                    className={
                      isDarkMode ? 'text-white mb-2' : 'text-gray-900 mb-2'
                    }
                  >
                    Choose a Template
                  </Typography>
                  <Grid container spacing={2}>
                    {newsletterTemplates.map((template) => (
                      <Grid item xs={12} sm={6} md={3} key={template.id}>
                        <Card
                          className={`cursor-pointer transition-all duration-200 ${
                            newsletterData.template === template.id
                              ? isDarkMode
                                ? 'border-2 border-blue-500 bg-blue-900/20'
                                : 'border-2 border-blue-600 bg-blue-50'
                              : isDarkMode
                              ? 'bg-gray-700 hover:bg-gray-700/80'
                              : 'bg-gray-50 hover:bg-gray-100'
                          }`}
                          onClick={() => handleTemplateSelect(template.id)}
                        >
                          <CardContent>
                            <Box
                              display="flex"
                              flexDirection="column"
                              alignItems="center"
                              textAlign="center"
                              p={2}
                            >
                              {template.id === 'blank' ? (
                                <PlusCircle
                                  size={32}
                                  className={
                                    isDarkMode
                                      ? 'text-gray-400 mb-2'
                                      : 'text-gray-500 mb-2'
                                  }
                                />
                              ) : template.id === 'welcome' ? (
                                <Users
                                  size={32}
                                  className={
                                    isDarkMode
                                      ? 'text-blue-400 mb-2'
                                      : 'text-blue-600 mb-2'
                                  }
                                />
                              ) : template.id === 'product' ? (
                                <Tag
                                  size={32}
                                  className={
                                    isDarkMode
                                      ? 'text-green-400 mb-2'
                                      : 'text-green-600 mb-2'
                                  }
                                />
                              ) : (
                                <Mail
                                  size={32}
                                  className={
                                    isDarkMode
                                      ? 'text-purple-400 mb-2'
                                      : 'text-purple-600 mb-2'
                                  }
                                />
                              )}
                              <Typography
                                variant="subtitle1"
                                className={
                                  isDarkMode ? 'text-white' : 'text-gray-900'
                                }
                              >
                                {template.name}
                              </Typography>
                              <Typography
                                variant="body2"
                                className={
                                  isDarkMode ? 'text-gray-400' : 'text-gray-500'
                                }
                              >
                                {template.description}
                              </Typography>
                            </Box>
                          </CardContent>
                        </Card>
                      </Grid>
                    ))}
                  </Grid>
                </Box>

                <form onSubmit={handleSendNewsletter}>
                  <TextField
                    fullWidth
                    label="Subject"
                    value={newsletterData.subject}
                    onChange={(e) =>
                      setNewsletterData({
                        ...newsletterData,
                        subject: e.target.value,
                      })
                    }
                    required
                    sx={{ mb: 3 }}
                    className={isDarkMode ? 'bg-gray-700 rounded' : ''}
                    InputLabelProps={{
                      className: isDarkMode ? 'text-gray-300' : '',
                    }}
                    InputProps={{
                      className: isDarkMode ? 'text-white' : '',
                    }}
                  />

                  <Box mb={3}>
                    <Box
                      display="flex"
                      justifyContent="space-between"
                      alignItems="center"
                      mb={1}
                    >
                      <Typography
                        variant="subtitle1"
                        className={isDarkMode ? 'text-white' : 'text-gray-900'}
                      >
                        Content
                      </Typography>
                      <Box>
                        <Button
                          size="small"
                          startIcon={<Eye size={16} />}
                          onClick={() => setPreviewMode(!previewMode)}
                          className={
                            isDarkMode ? 'text-blue-400' : 'text-blue-600'
                          }
                        >
                          {previewMode ? 'Edit' : 'Preview'}
                        </Button>
                      </Box>
                    </Box>

                    {previewMode ? (
                      <Card
                        className={`p-4 min-h-[300px] ${
                          isDarkMode ? 'bg-white text-gray-900' : 'bg-white'
                        }`}
                      >
                        <Box p={2}>
                          <Typography variant="h5" gutterBottom>
                            {newsletterData.subject || 'Newsletter Subject'}
                          </Typography>
                          <Divider sx={{ mb: 2 }} />
                          <Typography variant="body1" component="div">
                            {newsletterData.content ||
                              'Your newsletter content will appear here.'}
                          </Typography>
                        </Box>
                      </Card>
                    ) : (
                      <TextField
                        fullWidth
                        multiline
                        rows={12}
                        value={newsletterData.content}
                        onChange={(e) =>
                          setNewsletterData({
                            ...newsletterData,
                            content: e.target.value,
                          })
                        }
                        required
                        placeholder="Write your newsletter content here..."
                        className={isDarkMode ? 'bg-gray-700 rounded' : ''}
                        InputProps={{
                          className: isDarkMode ? 'text-white' : '',
                        }}
                      />
                    )}
                  </Box>

                  <Grid container spacing={3} mb={3}>
                    <Grid item xs={12} md={4}>
                      <FormControl
                        fullWidth
                        className={isDarkMode ? 'bg-gray-700 rounded' : ''}
                      >
                        <InputLabel
                          className={isDarkMode ? 'text-gray-300' : ''}
                        >
                          Type
                        </InputLabel>
                        <Select
                          value={newsletterData.type}
                          label="Type"
                          onChange={(e) =>
                            setNewsletterData({
                              ...newsletterData,
                              type: e.target.value,
                            })
                          }
                          className={isDarkMode ? 'text-white' : ''}
                        >
                          <MenuItem value="marketing">Marketing</MenuItem>
                          <MenuItem value="update">Update</MenuItem>
                          <MenuItem value="announcement">Announcement</MenuItem>
                          <MenuItem value="welcome">Welcome</MenuItem>
                        </Select>
                      </FormControl>
                    </Grid>
                    <Grid item xs={12} md={8}>
                      <Box display="flex" alignItems="center">
                        <FormControlLabel
                          control={
                            <Switch
                              checked={newsletterData.schedule}
                              onChange={(e) =>
                                setNewsletterData({
                                  ...newsletterData,
                                  schedule: e.target.checked,
                                })
                              }
                              color="primary"
                            />
                          }
                          label="Schedule for later"
                          className={isDarkMode ? 'text-white' : ''}
                        />
                        {newsletterData.schedule && (
                          <TextField
                            type="datetime-local"
                            value={newsletterData.scheduledDate}
                            onChange={(e) =>
                              setNewsletterData({
                                ...newsletterData,
                                scheduledDate: e.target.value,
                              })
                            }
                            sx={{ ml: 2, width: 250 }}
                            className={isDarkMode ? 'bg-gray-700 rounded' : ''}
                            InputProps={{
                              className: isDarkMode ? 'text-white' : '',
                            }}
                          />
                        )}
                      </Box>
                    </Grid>
                  </Grid>

                  <Box
                    display="flex"
                    justifyContent="space-between"
                    alignItems="center"
                  >
                    <Button
                      variant="outlined"
                      onClick={() => setActiveTab(0)}
                      className={
                        isDarkMode
                          ? 'border-gray-600 text-gray-300 hover:bg-gray-700'
                          : 'border-gray-300 text-gray-700 hover:bg-gray-50'
                      }
                    >
                      Cancel
                    </Button>
                    <Box>
                      <Button
                        variant="outlined"
                        className={`mr-2 ${
                          isDarkMode
                            ? 'border-blue-500 text-blue-400 hover:bg-blue-900/20'
                            : 'border-blue-600 text-blue-600 hover:bg-blue-50'
                        }`}
                      >
                        Save Draft
                      </Button>
                      <Button
                        type="submit"
                        variant="contained"
                        disabled={sendLoading}
                        startIcon={sendLoading ? null : <Send size={16} />}
                        className={
                          isDarkMode
                            ? 'bg-blue-600 hover:bg-blue-700'
                            : 'bg-blue-600 hover:bg-blue-700'
                        }
                      >
                        {sendLoading ? (
                          <>
                            <CircularProgress
                              size={16}
                              color="inherit"
                              className="mr-2"
                            />
                            Sending...
                          </>
                        ) : newsletterData.schedule ? (
                          'Schedule'
                        ) : (
                          'Send Newsletter'
                        )}
                      </Button>
                    </Box>
                  </Box>
                </form>
              </CardContent>
            </Card>
          </Box>
        );

      case 2: // Subscribers
        return (
          <Box>
            <Card
              className={`shadow-sm ${
                isDarkMode ? 'bg-gray-800 text-white' : 'bg-white'
              }`}
            >
              <CardContent>
                <Box
                  display="flex"
                  justifyContent="space-between"
                  alignItems="center"
                  mb={3}
                >
                  <Box display="flex" alignItems="center">
                    <Users
                      size={20}
                      className={
                        isDarkMode ? 'text-blue-400 mr-2' : 'text-blue-600 mr-2'
                      }
                    />
                    <Typography
                      variant="h6"
                      className={isDarkMode ? 'text-white' : 'text-gray-900'}
                    >
                      Subscribers
                    </Typography>
                  </Box>
                  <Box display="flex" gap={2}>
                    <TextField
                      placeholder="Search subscribers..."
                      size="small"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      InputProps={{
                        startAdornment: <Search size={16} className="mr-2" />,
                        className: isDarkMode ? 'text-white' : '',
                      }}
                      className={isDarkMode ? 'bg-gray-700 rounded' : ''}
                    />
                    <FormControl
                      size="small"
                      sx={{ minWidth: 150 }}
                      className={isDarkMode ? 'bg-gray-700 rounded' : ''}
                    >
                      <InputLabel className={isDarkMode ? 'text-gray-300' : ''}>
                        Status
                      </InputLabel>
                      <Select
                        value={filterStatus}
                        label="Status"
                        onChange={(e) => setFilterStatus(e.target.value)}
                        className={isDarkMode ? 'text-white' : ''}
                      >
                        <MenuItem value="all">All</MenuItem>
                        <MenuItem value="active">Active</MenuItem>
                        <MenuItem value="unsubscribed">Unsubscribed</MenuItem>
                        <MenuItem value="pending">Pending</MenuItem>
                      </Select>
                    </FormControl>
                    <Button
                      variant="outlined"
                      startIcon={<Download size={16} />}
                      className={
                        isDarkMode
                          ? 'border-gray-600 text-gray-300 hover:bg-gray-700'
                          : 'border-gray-300 text-gray-700 hover:bg-gray-50'
                      }
                    >
                      Export
                    </Button>
                    <Button
                      variant="contained"
                      startIcon={<PlusCircle size={16} />}
                      className={
                        isDarkMode
                          ? 'bg-blue-600 hover:bg-blue-700'
                          : 'bg-blue-600 hover:bg-blue-700'
                      }
                    >
                      Add Subscriber
                    </Button>
                  </Box>
                </Box>

                <TableContainer>
                  <Table>
                    <TableHead>
                      <TableRow>
                        <TableCell
                          className={
                            isDarkMode
                              ? 'text-gray-300 font-medium'
                              : 'text-gray-700 font-medium'
                          }
                        >
                          Email
                        </TableCell>
                        <TableCell
                          className={
                            isDarkMode
                              ? 'text-gray-300 font-medium'
                              : 'text-gray-700 font-medium'
                          }
                        >
                          Status
                        </TableCell>
                        <TableCell
                          className={
                            isDarkMode
                              ? 'text-gray-300 font-medium'
                              : 'text-gray-700 font-medium'
                          }
                        >
                          Subscribed Date
                        </TableCell>
                        <TableCell
                          className={
                            isDarkMode
                              ? 'text-gray-300 font-medium'
                              : 'text-gray-700 font-medium'
                          }
                        >
                          Source
                        </TableCell>
                        <TableCell
                          className={
                            isDarkMode
                              ? 'text-gray-300 font-medium'
                              : 'text-gray-700 font-medium'
                          }
                        >
                          Actions
                        </TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {paginatedSubscribers.length > 0 ? (
                        paginatedSubscribers.map((subscriber) => (
                          <TableRow
                            key={subscriber._id}
                            className={
                              isDarkMode
                                ? 'hover:bg-gray-700/50'
                                : 'hover:bg-gray-50'
                            }
                          >
                            <TableCell
                              className={
                                isDarkMode ? 'text-white' : 'text-gray-900'
                              }
                            >
                              {subscriber.email}
                            </TableCell>
                            <TableCell>
                              <Chip
                                label={subscriber.status}
                                color={getStatusColor(subscriber.status)}
                                size="small"
                                className={
                                  subscriber.status === 'active'
                                    ? isDarkMode
                                      ? 'bg-green-900/30 text-green-400'
                                      : 'bg-green-100 text-green-800'
                                    : subscriber.status === 'unsubscribed'
                                    ? isDarkMode
                                      ? 'bg-red-900/30 text-red-400'
                                      : 'bg-red-100 text-red-800'
                                    : isDarkMode
                                    ? 'bg-yellow-900/30 text-yellow-400'
                                    : 'bg-yellow-100 text-yellow-800'
                                }
                              />
                            </TableCell>
                            <TableCell
                              className={
                                isDarkMode ? 'text-gray-300' : 'text-gray-700'
                              }
                            >
                              {new Date(
                                subscriber.createdAt
                              ).toLocaleDateString()}
                            </TableCell>
                            <TableCell
                              className={
                                isDarkMode ? 'text-gray-300' : 'text-gray-700'
                              }
                            >
                              {subscriber.source || 'Direct'}
                            </TableCell>
                            <TableCell>
                              <Box display="flex" gap={1}>
                                <Tooltip title="Send Test Email">
                                  <IconButton
                                    size="small"
                                    className={
                                      isDarkMode
                                        ? 'text-blue-400'
                                        : 'text-blue-600'
                                    }
                                  >
                                    <Send size={16} />
                                  </IconButton>
                                </Tooltip>
                                <Tooltip title="Edit">
                                  <IconButton
                                    size="small"
                                    className={
                                      isDarkMode
                                        ? 'text-gray-400'
                                        : 'text-gray-600'
                                    }
                                  >
                                    <Edit size={16} />
                                  </IconButton>
                                </Tooltip>
                                {subscriber.status !== 'active' ? (
                                  <Tooltip title="Reactivate">
                                    <IconButton
                                      size="small"
                                      className={
                                        isDarkMode
                                          ? 'text-green-400'
                                          : 'text-green-600'
                                      }
                                    >
                                      <CheckCircle size={16} />
                                    </IconButton>
                                  </Tooltip>
                                ) : (
                                  <Tooltip title="Unsubscribe">
                                    <IconButton
                                      size="small"
                                      className={
                                        isDarkMode
                                          ? 'text-red-400'
                                          : 'text-red-600'
                                      }
                                    >
                                      <AlertTriangle size={16} />
                                    </IconButton>
                                  </Tooltip>
                                )}
                                <Tooltip title="Delete">
                                  <IconButton
                                    size="small"
                                    className={
                                      isDarkMode
                                        ? 'text-red-400'
                                        : 'text-red-600'
                                    }
                                  >
                                    <Trash2 size={16} />
                                  </IconButton>
                                </Tooltip>
                              </Box>
                            </TableCell>
                          </TableRow>
                        ))
                      ) : (
                        <TableRow>
                          <TableCell
                            colSpan={5}
                            align="center"
                            className={`py-8 ${
                              isDarkMode ? 'text-gray-400' : 'text-gray-500'
                            }`}
                          >
                            {searchTerm ? (
                              <>No subscribers found matching "{searchTerm}"</>
                            ) : (
                              <>No subscribers found</>
                            )}
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </TableContainer>

                {filteredSubscribers.length > 0 && (
                  <Box display="flex" justifyContent="center" mt={3}>
                    <Pagination
                      count={pageCount}
                      page={currentPage}
                      onChange={(e, page) => setCurrentPage(page)}
                      color="primary"
                      className={isDarkMode ? 'text-white' : ''}
                    />
                  </Box>
                )}
              </CardContent>
            </Card>
          </Box>
        );

      case 3: // Settings
        return (
          <Box>
            <Card
              className={`shadow-sm ${
                isDarkMode ? 'bg-gray-800 text-white' : 'bg-white'
              }`}
            >
              <CardContent>
                <Box display="flex" alignItems="center" mb={3}>
                  <Settings
                    size={20}
                    className={
                      isDarkMode ? 'text-blue-400 mr-2' : 'text-blue-600 mr-2'
                    }
                  />
                  <Typography
                    variant="h6"
                    className={isDarkMode ? 'text-white' : 'text-gray-900'}
                  >
                    Newsletter Settings
                  </Typography>
                </Box>

                <Box mb={4}>
                  <Typography
                    variant="subtitle1"
                    className={
                      isDarkMode ? 'text-white mb-2' : 'text-gray-900 mb-2'
                    }
                  >
                    Email Settings
                  </Typography>
                  <Grid container spacing={3}>
                    <Grid item xs={12} md={6}>
                      <TextField
                        fullWidth
                        label="Sender Name"
                        defaultValue="Your Company"
                        className={isDarkMode ? 'bg-gray-700 rounded' : ''}
                        InputLabelProps={{
                          className: isDarkMode ? 'text-gray-300' : '',
                        }}
                        InputProps={{
                          className: isDarkMode ? 'text-white' : '',
                        }}
                      />
                    </Grid>
                    <Grid item xs={12} md={6}>
                      <TextField
                        fullWidth
                        label="Sender Email"
                        defaultValue="newsletter@yourcompany.com"
                        className={isDarkMode ? 'bg-gray-700 rounded' : ''}
                        InputLabelProps={{
                          className: isDarkMode ? 'text-gray-300' : '',
                        }}
                        InputProps={{
                          className: isDarkMode ? 'text-white' : '',
                        }}
                      />
                    </Grid>
                  </Grid>
                </Box>

                <Divider
                  className={isDarkMode ? 'bg-gray-700' : ''}
                  sx={{ my: 3 }}
                />

                <Box mb={4}>
                  <Typography
                    variant="subtitle1"
                    className={
                      isDarkMode ? 'text-white mb-2' : 'text-gray-900 mb-2'
                    }
                  >
                    Default Content
                  </Typography>
                  <Grid container spacing={3}>
                    <Grid item xs={12}>
                      <TextField
                        fullWidth
                        label="Footer Text"
                        multiline
                        rows={3}
                        defaultValue="© 2023 Your Company. All rights reserved. You're receiving this email because you signed up for updates from us. You can unsubscribe at any time."
                        className={isDarkMode ? 'bg-gray-700 rounded' : ''}
                        InputLabelProps={{
                          className: isDarkMode ? 'text-gray-300' : '',
                        }}
                        InputProps={{
                          className: isDarkMode ? 'text-white' : '',
                        }}
                      />
                    </Grid>
                  </Grid>
                </Box>

                <Divider
                  className={isDarkMode ? 'bg-gray-700' : ''}
                  sx={{ my: 3 }}
                />

                <Box mb={4}>
                  <Typography
                    variant="subtitle1"
                    className={
                      isDarkMode ? 'text-white mb-2' : 'text-gray-900 mb-2'
                    }
                  >
                    Subscription Settings
                  </Typography>
                  <Grid container spacing={3}>
                    <Grid item xs={12} md={6}>
                      <FormControlLabel
                        control={<Switch defaultChecked color="primary" />}
                        label="Double opt-in"
                        className={isDarkMode ? 'text-white' : ''}
                      />
                      <Typography
                        variant="body2"
                        className={
                          isDarkMode
                            ? 'text-gray-400 mt-1'
                            : 'text-gray-500 mt-1'
                        }
                      >
                        Send confirmation email before subscribing
                      </Typography>
                    </Grid>
                    <Grid item xs={12} md={6}>
                      <FormControlLabel
                        control={<Switch defaultChecked color="primary" />}
                        label="Welcome email"
                        className={isDarkMode ? 'text-white' : ''}
                      />
                      <Typography
                        variant="body2"
                        className={
                          isDarkMode
                            ? 'text-gray-400 mt-1'
                            : 'text-gray-500 mt-1'
                        }
                      >
                        Send welcome email to new subscribers
                      </Typography>
                    </Grid>
                  </Grid>
                </Box>

                <Box display="flex" justifyContent="flex-end" mt={3}>
                  <Button
                    variant="contained"
                    className={
                      isDarkMode
                        ? 'bg-blue-600 hover:bg-blue-700'
                        : 'bg-blue-600 hover:bg-blue-700'
                    }
                  >
                    Save Settings
                  </Button>
                </Box>
              </CardContent>
            </Card>
          </Box>
        );

      default:
        return null;
    }
  };

  if (loading) {
    return (
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        minHeight="400px"
      >
        <CircularProgress
          className={isDarkMode ? 'text-blue-400' : 'text-blue-600'}
        />
      </Box>
    );
  }

  // Wrap the component with ThemeProvider to ensure dark mode works
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Box
        p={3}
        className={isDarkMode ? 'bg-gray-900 text-white' : 'bg-gray-50'}
      >
        <Box
          mb={4}
          display="flex"
          justifyContent="space-between"
          alignItems="center"
        >
          <Box>
            <Typography
              variant="h4"
              gutterBottom
              className={isDarkMode ? 'text-white' : 'text-gray-900'}
              fontWeight="bold"
            >
              Newsletter Management
            </Typography>
            <Typography
              variant="body1"
              className={isDarkMode ? 'text-gray-300' : 'text-gray-600'}
            >
              Create, manage, and track your newsletter campaigns
            </Typography>
          </Box>
          <Box>
            <Button
              variant="contained"
              startIcon={<RefreshCw size={16} />}
              onClick={() => {
                dispatch(fetchSubscribers());
                dispatch(fetchNewsletterStats());
              }}
              className={`mr-2 ${
                isDarkMode
                  ? 'bg-blue-600 hover:bg-blue-700'
                  : 'bg-blue-600 hover:bg-blue-700'
              }`}
            >
              Refresh
            </Button>
            <Button
              variant="outlined"
              startIcon={<Settings size={16} />}
              onClick={() => setActiveTab(3)}
              className={
                isDarkMode
                  ? 'border-gray-600 text-gray-300 hover:bg-gray-800'
                  : 'border-gray-300 text-gray-700 hover:bg-gray-50'
              }
            >
              Settings
            </Button>
          </Box>
        </Box>

        {error && (
          <Alert
            severity="error"
            sx={{ mb: 3 }}
            className={isDarkMode ? 'bg-red-900/30 text-red-200' : ''}
          >
            {error}
          </Alert>
        )}

        {sendSuccess && (
          <Alert
            severity="success"
            sx={{ mb: 3 }}
            className={isDarkMode ? 'bg-green-900/30 text-green-200' : ''}
          >
            Newsletter sent successfully!
          </Alert>
        )}

        {sendError && (
          <Alert
            severity="error"
            sx={{ mb: 3 }}
            className={isDarkMode ? 'bg-red-900/30 text-red-200' : ''}
          >
            {sendError}
          </Alert>
        )}

        <Box
          sx={{
            borderBottom: 1,
            borderColor: isDarkMode ? 'rgba(255,255,255,0.1)' : 'divider',
            mb: 3,
          }}
        >
          <Tabs
            value={activeTab}
            onChange={handleTabChange}
            className={isDarkMode ? 'text-white' : ''}
            TabIndicatorProps={{
              style: {
                backgroundColor: isDarkMode ? '#3B82F6' : '#2563EB',
              },
            }}
          >
            <Tab
              label="Dashboard"
              icon={<BarChart2 size={16} />}
              iconPosition="start"
              className={isDarkMode ? 'text-white' : ''}
            />
            <Tab
              label="Create Newsletter"
              icon={<FileText size={16} />}
              iconPosition="start"
              className={isDarkMode ? 'text-white' : ''}
            />
            <Tab
              label="Subscribers"
              icon={<Users size={16} />}
              iconPosition="start"
              className={isDarkMode ? 'text-white' : ''}
            />
            <Tab
              label="Settings"
              icon={<Settings size={16} />}
              iconPosition="start"
              className={isDarkMode ? 'text-white' : ''}
            />
          </Tabs>
        </Box>

        {renderTabContent()}
      </Box>
    </ThemeProvider>
  );
};

export default NewsletterManagement;
