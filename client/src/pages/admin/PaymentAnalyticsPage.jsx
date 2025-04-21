import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  Card,
  CardContent,
  CardHeader,
  Grid,
  Typography,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Box,
  CircularProgress,
  TextField
} from '@mui/material';
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
} from 'recharts';
import { DatePicker } from '@mui/x-date-pickers';
import { format, subDays } from 'date-fns';
import { getPaymentAnalytics } from '../../redux/slices/paymentSlice';
import { PAYMENT_METHODS, PAYMENT_STATUS } from '../../constants/payment';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'];

export default function PaymentAnalyticsPage() {
  const dispatch = useDispatch();
  const { analytics, loading } = useSelector((state) => state.payment);
  const [dateRange, setDateRange] = useState({
    start: subDays(new Date(), 30),
    end: new Date(),
  });
  const [groupBy, setGroupBy] = useState('day');

  useEffect(() => {
    dispatch(getPaymentAnalytics({
      startDate: format(dateRange.start, 'yyyy-MM-dd'),
      endDate: format(dateRange.end, 'yyyy-MM-dd'),
      groupBy,
    }));
  }, [dispatch, dateRange, groupBy]);

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-KE', {
      style: 'currency',
      currency: 'KES',
    }).format(amount);
  };

  const formatPercentage = (value) => {
    return `${(value * 100).toFixed(1)}%`;
  };

  if (loading) {
      return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <div className="p-6">
      <Typography variant="h4" component="h1" gutterBottom>
        Payment Analytics
      </Typography>

      {/* Filters */}
      <Grid container spacing={3} className="mb-6">
        <Grid item xs={12} md={4}>
          <DatePicker
            label="Start Date"
            value={dateRange.start}
            onChange={(date) => setDateRange({ ...dateRange, start: date })}
            renderInput={(params) => <TextField {...params} fullWidth />}
          />
        </Grid>
        <Grid item xs={12} md={4}>
          <DatePicker
            label="End Date"
            value={dateRange.end}
            onChange={(date) => setDateRange({ ...dateRange, end: date })}
            renderInput={(params) => <TextField {...params} fullWidth />}
          />
        </Grid>
        <Grid item xs={12} md={4}>
          <FormControl fullWidth>
            <InputLabel>Group By</InputLabel>
            <Select
              value={groupBy}
              onChange={(e) => setGroupBy(e.target.value)}
              label="Group By"
            >
              <MenuItem value="day">Day</MenuItem>
              <MenuItem value="week">Week</MenuItem>
              <MenuItem value="month">Month</MenuItem>
            </Select>
          </FormControl>
        </Grid>
      </Grid>

      {/* Summary Cards */}
      <Grid container spacing={3} className="mb-6">
        <Grid item xs={12} md={3}>
          <Card>
            <CardHeader 
              title={<Typography variant="h6">Total Revenue</Typography>}
            />
            <CardContent>
              <Typography variant="h4">
                {formatCurrency(analytics?.totalRevenue || 0)}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={3}>
          <Card>
            <CardHeader 
              title={<Typography variant="h6">Total Transactions</Typography>}
            />
            <CardContent>
              <Typography variant="h4">
                {analytics?.totalTransactions || 0}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={3}>
          <Card>
            <CardHeader 
              title={<Typography variant="h6">Success Rate</Typography>}
            />
            <CardContent>
              <Typography variant="h4">
                {formatPercentage(analytics?.successRate || 0)}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={3}>
          <Card>
            <CardHeader 
              title={<Typography variant="h6">Average Transaction</Typography>}
            />
            <CardContent>
              <Typography variant="h4">
                {formatCurrency(analytics?.averageTransactionValue || 0)}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Charts */}
      <Grid container spacing={3}>
        <Grid item xs={12} md={8}>
          <Card>
            <CardHeader 
              title={<Typography variant="h6">Revenue Trend</Typography>}
            />
            <CardContent>
              <ResponsiveContainer width="100%" height={400}>
                <BarChart data={analytics?.revenueTrend || []}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip />
                    <Legend />
                  <Bar dataKey="revenue" fill="#8884d8" name="Revenue" />
                </BarChart>
                </ResponsiveContainer>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={4}>
          <Card>
            <CardHeader 
              title={<Typography variant="h6">Payment Methods</Typography>}
            />
            <CardContent>
              <ResponsiveContainer width="100%" height={400}>
                  <PieChart>
                    <Pie
                    data={analytics?.paymentMethods || []}
                    dataKey="value"
                    nameKey="name"
                      cx="50%"
                      cy="50%"
                    outerRadius={100}
                    label
                  >
                    {analytics?.paymentMethods?.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </div>
  );
} 