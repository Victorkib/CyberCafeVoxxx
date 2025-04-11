import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line
} from 'recharts';
import { Calendar, Download, RefreshCw, AlertTriangle } from 'lucide-react';
import { toast } from 'react-hot-toast';
import {
  Box,
  Container,
  Typography,
  Grid,
  Paper,
  Button,
  CircularProgress,
  Card,
  CardContent,
  Alert,
  Skeleton,
  IconButton,
  Tooltip as MuiTooltip,
  useTheme,
} from '@mui/material';
import { styled } from '@mui/material/styles';
import DateRangePicker from '../../components/common/DateRangePicker';
import { apiRequest } from '../../utils/api';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042'];

const StyledPaper = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(3),
  height: '100%',
  display: 'flex',
  flexDirection: 'column',
}));

const SummaryCard = styled(Card)(({ theme }) => ({
  height: '100%',
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'center',
  alignItems: 'center',
  textAlign: 'center',
  padding: theme.spacing(2),
  transition: 'transform 0.2s',
  '&:hover': {
    transform: 'translateY(-4px)',
  },
}));

const ChartSkeleton = () => (
  <Box height={400} display="flex" alignItems="center" justifyContent="center">
    <Skeleton variant="rectangular" width="100%" height="100%" />
  </Box>
);

const CardSkeleton = () => (
  <SummaryCard>
    <Skeleton width="60%" height={24} />
    <Skeleton width="40%" height={40} style={{ marginTop: 8 }} />
  </SummaryCard>
);

export default function PaymentAnalyticsPage() {
  const theme = useTheme();
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [dateRange, setDateRange] = useState({
    startDate: new Date(new Date().setDate(new Date().getDate() - 30)),
    endDate: new Date()
  });

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await apiRequest.get('/payments/analytics', {
        params: {
          startDate: dateRange.startDate.toISOString(),
          endDate: dateRange.endDate.toISOString()
        }
      });
      setAnalytics(response.data);
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Failed to fetch payment analytics';
      setError(errorMessage);
      toast.error(errorMessage);
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalytics();
  }, [dateRange]);

  const handleDateRangeChange = (range) => {
    setDateRange(range);
  };

  const handleExport = () => {
    // TODO: Implement export functionality
    toast.info('Export functionality coming soon');
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  // Format daily volume data for chart
  const dailyVolumeData = analytics ? Object.entries(analytics.dailyVolume).map(([date, count]) => ({
    date,
    count,
    amount: analytics.dailyAmount[date] || 0
  })) : [];

  // Format method distribution data for pie chart
  const methodDistributionData = analytics ? Object.entries(analytics.methodDistribution).map(([method, count]) => ({
    name: method,
    value: count
  })) : [];

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <Paper sx={{ p: 2 }}>
          <Typography variant="subtitle2">{label}</Typography>
          {payload.map((entry, index) => (
            <Typography key={index} variant="body2" color={entry.color}>
              {entry.name}: {entry.name === 'Amount' ? formatCurrency(entry.value) : entry.value}
            </Typography>
          ))}
        </Paper>
      );
    }
    return null;
  };

  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4" component="h1">Payment Analytics</Typography>
        <Box display="flex" gap={2}>
          <DateRangePicker
            startDate={dateRange.startDate}
            endDate={dateRange.endDate}
            onChange={handleDateRangeChange}
            disabled={loading}
          />
          <Button
            variant="outlined"
            startIcon={<RefreshCw size={20} />}
            onClick={fetchAnalytics}
            disabled={loading}
          >
            Refresh
          </Button>
          <Button
            variant="contained"
            startIcon={<Download size={20} />}
            onClick={handleExport}
            disabled={loading}
          >
            Export
          </Button>
        </Box>
      </Box>

      {error && (
        <Alert 
          severity="error" 
          sx={{ mb: 3 }}
          action={
            <Button color="inherit" size="small" onClick={fetchAnalytics}>
              Retry
            </Button>
          }
        >
          {error}
        </Alert>
      )}

      {/* Summary Cards */}
      <Grid container spacing={3} mb={4}>
        <Grid item xs={12} sm={6} md={3}>
          {loading ? <CardSkeleton /> : (
            <SummaryCard>
              <Typography color="text.secondary" gutterBottom>Total Transactions</Typography>
              <Typography variant="h4">{analytics?.summary.totalTransactions.toLocaleString()}</Typography>
              <Typography variant="caption" color="text.secondary">
                In selected date range
              </Typography>
            </SummaryCard>
          )}
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          {loading ? <CardSkeleton /> : (
            <SummaryCard>
              <Typography color="text.secondary" gutterBottom>Success Rate</Typography>
              <Typography variant="h4">{analytics?.summary.successRate}%</Typography>
              <Typography variant="caption" color="text.secondary">
                Of total transactions
              </Typography>
            </SummaryCard>
          )}
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          {loading ? <CardSkeleton /> : (
            <SummaryCard>
              <Typography color="text.secondary" gutterBottom>Total Amount</Typography>
              <Typography variant="h4">{formatCurrency(analytics?.summary.totalAmount)}</Typography>
              <Typography variant="caption" color="text.secondary">
                All transactions
              </Typography>
            </SummaryCard>
          )}
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          {loading ? <CardSkeleton /> : (
            <SummaryCard>
              <Typography color="text.secondary" gutterBottom>Successful Amount</Typography>
              <Typography variant="h4">{formatCurrency(analytics?.summary.successfulAmount)}</Typography>
              <Typography variant="caption" color="text.secondary">
                Completed transactions
              </Typography>
            </SummaryCard>
          )}
        </Grid>
      </Grid>

      {/* Charts */}
      <Grid container spacing={3} mb={4}>
        {/* Daily Transaction Volume and Amount */}
        <Grid item xs={12} lg={6}>
          <StyledPaper>
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
              <Typography variant="h6">Daily Transaction Overview</Typography>
              <MuiTooltip title="Shows both transaction count and amount per day">
                <IconButton size="small">
                  <AlertTriangle size={16} />
                </IconButton>
              </MuiTooltip>
            </Box>
            {loading ? <ChartSkeleton /> : (
              <Box height={400}>
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart
                    data={dailyVolumeData}
                    margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis yAxisId="left" />
                    <YAxis yAxisId="right" orientation="right" />
                    <Tooltip content={<CustomTooltip />} />
                    <Legend />
                    <Line
                      yAxisId="left"
                      type="monotone"
                      dataKey="count"
                      name="Transactions"
                      stroke={theme.palette.primary.main}
                      activeDot={{ r: 8 }}
                    />
                    <Line
                      yAxisId="right"
                      type="monotone"
                      dataKey="amount"
                      name="Amount"
                      stroke={theme.palette.secondary.main}
                      activeDot={{ r: 8 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </Box>
            )}
          </StyledPaper>
        </Grid>

        {/* Payment Method Distribution */}
        <Grid item xs={12} lg={6}>
          <StyledPaper>
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
              <Typography variant="h6">Payment Method Distribution</Typography>
              <MuiTooltip title="Distribution of payment methods used">
                <IconButton size="small">
                  <AlertTriangle size={16} />
                </IconButton>
              </MuiTooltip>
            </Box>
            {loading ? <ChartSkeleton /> : (
              <Box height={400}>
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={methodDistributionData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      outerRadius={120}
                      fill="#8884d8"
                      dataKey="value"
                      label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                    >
                      {methodDistributionData.map((entry, index) => (
                        <Cell 
                          key={`cell-${index}`} 
                          fill={COLORS[index % COLORS.length]}
                        />
                      ))}
                    </Pie>
                    <Tooltip />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </Box>
            )}
          </StyledPaper>
        </Grid>
      </Grid>

      {/* Transaction Status Breakdown */}
      <StyledPaper>
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
          <Typography variant="h6">Transaction Status Breakdown</Typography>
          <MuiTooltip title="Current status of all transactions">
            <IconButton size="small">
              <AlertTriangle size={16} />
            </IconButton>
          </MuiTooltip>
        </Box>
        <Grid container spacing={3}>
          <Grid item xs={12} md={4}>
            {loading ? <CardSkeleton /> : (
              <Card sx={{ bgcolor: 'success.light' }}>
                <CardContent>
                  <Typography color="success.dark" variant="subtitle1">Successful</Typography>
                  <Typography color="success.dark" variant="h4">
                    {analytics?.summary.successfulTransactions.toLocaleString()}
                  </Typography>
                  <Typography color="success.dark" variant="caption">
                    {formatCurrency(analytics?.summary.successfulAmount)}
                  </Typography>
                </CardContent>
              </Card>
            )}
          </Grid>
          <Grid item xs={12} md={4}>
            {loading ? <CardSkeleton /> : (
              <Card sx={{ bgcolor: 'warning.light' }}>
                <CardContent>
                  <Typography color="warning.dark" variant="subtitle1">Pending</Typography>
                  <Typography color="warning.dark" variant="h4">
                    {analytics?.summary.pendingTransactions.toLocaleString()}
                  </Typography>
                  <Typography color="warning.dark" variant="caption">
                    {formatCurrency(analytics?.summary.pendingAmount)}
                  </Typography>
                </CardContent>
              </Card>
            )}
          </Grid>
          <Grid item xs={12} md={4}>
            {loading ? <CardSkeleton /> : (
              <Card sx={{ bgcolor: 'error.light' }}>
                <CardContent>
                  <Typography color="error.dark" variant="subtitle1">Failed</Typography>
                  <Typography color="error.dark" variant="h4">
                    {analytics?.summary.failedTransactions.toLocaleString()}
                  </Typography>
                  <Typography color="error.dark" variant="caption">
                    {formatCurrency(analytics?.summary.failedAmount)}
                  </Typography>
                </CardContent>
              </Card>
            )}
          </Grid>
        </Grid>
      </StyledPaper>
    </Container>
  );
} 