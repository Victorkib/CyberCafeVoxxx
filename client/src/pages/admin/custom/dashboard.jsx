'use client';

import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  Package,
  ShoppingCart,
  Users,
  CreditCard,
  TrendingUp,
  DollarSign,
  Activity,
  ArrowUpRight,
  Award,
  Trash2,
  AlertCircle,
  Clock,
  TrendingDown,
  Download,
  RefreshCw,
  ChevronDown,
} from 'lucide-react';
import {
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  Legend,
  ResponsiveContainer,
  PieChart as RPieChart,
  Pie,
  Cell,
  AreaChart,
  Area,
  BarChart,
  Bar,
  LineChart,
  Line,
} from 'recharts';
import {
  fetchDashboardStats,
  fetchSalesAnalytics,
  fetchInventoryStats,
  fetchCustomerStats,
  cleanupExpiredInvitations,
} from '../../../redux/slices/adminSlice';
import { toast } from 'react-hot-toast';

const Dashboard = () => {
  const dispatch = useDispatch();
  const {
    dashboardStats,
    salesAnalytics,
    inventoryStats,
    customerStats,
    loading,
    error,
  } = useSelector((state) => state.admin);

  const [timeRange, setTimeRange] = useState('year');
  const [refreshing, setRefreshing] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');

  const handleCleanupInvitations = async () => {
    try {
      await dispatch(cleanupExpiredInvitations()).unwrap();
      toast.success('Expired invitations cleaned up successfully');
    } catch (error) {
      toast.error(error.message || 'Failed to cleanup invitations');
    }
  };

  const handleRefreshData = async () => {
    setRefreshing(true);
    try {
      await Promise.all([
        dispatch(fetchDashboardStats()),
        dispatch(
          fetchSalesAnalytics({
            startDate: getDateRangeStart(timeRange),
            endDate: new Date().toISOString().split('T')[0],
          })
        ),
        dispatch(fetchInventoryStats()),
        dispatch(fetchCustomerStats()),
      ]);
      toast.success('Dashboard data refreshed');
    } catch (error) {
      toast.error('Failed to refresh data');
    } finally {
      setRefreshing(false);
    }
  };

  const getDateRangeStart = (range) => {
    const today = new Date();
    switch (range) {
      case 'week':
        const weekAgo = new Date(today);
        weekAgo.setDate(today.getDate() - 7);
        return weekAgo.toISOString().split('T')[0];
      case 'month':
        const monthAgo = new Date(today);
        monthAgo.setMonth(today.getMonth() - 1);
        return monthAgo.toISOString().split('T')[0];
      case 'quarter':
        const quarterAgo = new Date(today);
        quarterAgo.setMonth(today.getMonth() - 3);
        return quarterAgo.toISOString().split('T')[0];
      case 'year':
      default:
        const yearAgo = new Date(today);
        yearAgo.setFullYear(today.getFullYear() - 1);
        return yearAgo.toISOString().split('T')[0];
    }
  };

  useEffect(() => {
    // Fetch all dashboard data
    dispatch(fetchDashboardStats());
    dispatch(
      fetchSalesAnalytics({
        startDate: getDateRangeStart(timeRange),
        endDate: new Date().toISOString().split('T')[0],
      })
    );
    dispatch(fetchInventoryStats());
    dispatch(fetchCustomerStats());
  }, [dispatch, timeRange]);

  if (loading && !dashboardStats) {
    return <DashboardSkeleton />;
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-96 gap-4">
        <AlertCircle className="h-12 w-12 text-red-500" />
        <div className="text-xl font-semibold text-red-600">{error}</div>
        <button
          onClick={handleRefreshData}
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
        >
          Try Again
        </button>
      </div>
    );
  }

  // Default stats object with safe fallbacks
  const stats = {
    totalSales: 0,
    totalOrders: 0,
    totalProducts: 0,
    totalCustomers: 0,
    ...dashboardStats,
    customers: {
      total: dashboardStats?.totalCustomers || 0,
      growth: calculateGrowth(customerStats),
    },
    orders: {
      total: dashboardStats?.totalOrders || 0,
      growth: 5, // Placeholder, calculate from actual data when available
    },
    revenue: {
      total: dashboardStats?.totalSales || 0,
      growth: 12, // Placeholder, calculate from actual data when available
    },
    performance: {
      salesTarget: { current: 8500, target: 10000, percentage: 85 },
      orderFulfillment: { current: 95, target: 100, percentage: 95 },
      customerSatisfaction: { current: 4.7, target: 5, percentage: 94 },
      inventoryTurnover: { current: 6, target: 8, percentage: 75 },
    },
  };

  // Process data for charts
  const processedSalesData = processSalesData(
    salesAnalytics?.data || generateSalesData()
  );
  const processedInventoryData = processInventoryData(inventoryStats || []);
  const processedCustomerData = processCustomerData(customerStats || []);
  const recentActivities = generateRecentActivities();
  const topProducts = generateTopProducts();

  return (
    <div className="space-y-6">
      {/* Dashboard Header with Actions */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">
            Dashboard Overview
          </h1>
          <p className="text-gray-500 dark:text-gray-400">
            Welcome back! Here's what's happening with your store today.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <div className="relative">
            <select
              value={timeRange}
              onChange={(e) => setTimeRange(e.target.value)}
              className="appearance-none bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-md py-2 pl-3 pr-10 text-sm leading-5 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="week">Last 7 days</option>
              <option value="month">Last 30 days</option>
              <option value="quarter">Last 3 months</option>
              <option value="year">Last 12 months</option>
            </select>
            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700 dark:text-gray-300">
              <ChevronDown className="h-4 w-4" />
            </div>
          </div>
          <button
            onClick={handleRefreshData}
            disabled={refreshing}
            className="p-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <RefreshCw
              className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`}
            />
          </button>
          <button className="flex items-center px-4 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500">
            <Download className="mr-2 h-4 w-4" />
            Export
          </button>
        </div>
      </div>

      {/* Quick Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatsCard
          title="Total Customers"
          value={stats.customers.total}
          growth={stats.customers.growth}
          icon={<Users className="h-6 w-6 text-blue-600 dark:text-blue-400" />}
          iconBg="bg-blue-100 dark:bg-blue-900/30"
          progressColor="bg-blue-600 dark:bg-blue-400"
        />

        <StatsCard
          title="Total Orders"
          value={stats.orders.total}
          growth={stats.orders.growth}
          icon={
            <ShoppingCart className="h-6 w-6 text-green-600 dark:text-green-400" />
          }
          iconBg="bg-green-100 dark:bg-green-900/30"
          progressColor="bg-green-600 dark:bg-green-400"
        />

        <StatsCard
          title="Total Revenue"
          value={`$${stats.revenue.total.toLocaleString()}`}
          growth={stats.revenue.growth}
          icon={
            <DollarSign className="h-6 w-6 text-purple-600 dark:text-purple-400" />
          }
          iconBg="bg-purple-100 dark:bg-purple-900/30"
          progressColor="bg-purple-600 dark:bg-purple-400"
        />

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm hover:shadow-md transition-shadow duration-200 border border-gray-200 dark:border-gray-700">
          <div className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
                  Admin Actions
                </p>
                <button
                  onClick={handleCleanupInvitations}
                  className="mt-2 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Cleanup Expired
                </button>
              </div>
              <div className="bg-red-100 dark:bg-red-900/30 p-3 rounded-full">
                <Trash2 className="h-6 w-6 text-red-600 dark:text-red-400" />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs Navigation */}
      <div className="border-b border-gray-200 dark:border-gray-700">
        <nav className="flex -mb-px">
          <button
            onClick={() => setActiveTab('overview')}
            className={`py-4 px-6 text-sm font-medium ${
              activeTab === 'overview'
                ? 'border-b-2 border-blue-500 text-blue-600 dark:text-blue-400'
                : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
            }`}
          >
            Overview
          </button>
          <button
            onClick={() => setActiveTab('analytics')}
            className={`py-4 px-6 text-sm font-medium ${
              activeTab === 'analytics'
                ? 'border-b-2 border-blue-500 text-blue-600 dark:text-blue-400'
                : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
            }`}
          >
            Analytics
          </button>
          <button
            onClick={() => setActiveTab('products')}
            className={`py-4 px-6 text-sm font-medium ${
              activeTab === 'products'
                ? 'border-b-2 border-blue-500 text-blue-600 dark:text-blue-400'
                : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
            }`}
          >
            Products
          </button>
          <button
            onClick={() => setActiveTab('customers')}
            className={`py-4 px-6 text-sm font-medium ${
              activeTab === 'customers'
                ? 'border-b-2 border-blue-500 text-blue-600 dark:text-blue-400'
                : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
            }`}
          >
            Customers
          </button>
        </nav>
      </div>

      {/* Tab Content */}
      <div className="mt-6">
        {/* Overview Tab */}
        {activeTab === 'overview' && (
          <div className="space-y-6">
            {/* Charts Section */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Sales Analytics Chart */}
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm hover:shadow-md transition-shadow duration-200 border border-gray-200 dark:border-gray-700">
                <div className="p-4 border-b border-gray-200 dark:border-gray-700">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-lg font-bold text-gray-900 dark:text-white flex items-center">
                        <TrendingUp className="mr-2 h-5 w-5 text-green-600 dark:text-green-400" />
                        Sales Analytics
                      </h3>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        Monthly sales performance
                      </p>
                    </div>
                  </div>
                </div>
                <div className="p-4">
                  <div className="h-[300px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={processedSalesData}>
                        <defs>
                          <linearGradient
                            id="colorSales"
                            x1="0"
                            y1="0"
                            x2="0"
                            y2="1"
                          >
                            <stop
                              offset="5%"
                              stopColor="#10B981"
                              stopOpacity={0.8}
                            />
                            <stop
                              offset="95%"
                              stopColor="#10B981"
                              stopOpacity={0}
                            />
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="date" />
                        <YAxis />
                        <RechartsTooltip />
                        <Area
                          type="monotone"
                          dataKey="sales"
                          stroke="#10B981"
                          fillOpacity={1}
                          fill="url(#colorSales)"
                        />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                </div>
                <div className="border-t border-gray-200 dark:border-gray-700 px-6 py-3">
                  <div className="flex justify-between items-center w-full">
                    <div className="flex items-center gap-2">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                        +{stats.revenue.growth}%
                      </span>
                      <span className="text-sm text-gray-500 dark:text-gray-400">
                        vs previous period
                      </span>
                    </div>
                    <button className="text-sm text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300">
                      View Details
                    </button>
                  </div>
                </div>
              </div>

              {/* Inventory Stats Chart */}
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm hover:shadow-md transition-shadow duration-200 border border-gray-200 dark:border-gray-700">
                <div className="p-4 border-b border-gray-200 dark:border-gray-700">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-lg font-bold text-gray-900 dark:text-white flex items-center">
                        <Package className="mr-2 h-5 w-5 text-blue-600 dark:text-blue-400" />
                        Inventory Overview
                      </h3>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        Stock levels by category
                      </p>
                    </div>
                  </div>
                </div>
                <div className="p-4">
                  <div className="h-[300px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <RPieChart>
                        <Pie
                          data={processedInventoryData}
                          dataKey="value"
                          nameKey="name"
                          cx="50%"
                          cy="50%"
                          outerRadius={100}
                          label={({ name, percent }) =>
                            `${name}: ${(percent * 100).toFixed(0)}%`
                          }
                        >
                          {processedInventoryData.map((entry, index) => (
                            <Cell
                              key={`cell-${index}`}
                              fill={`hsl(${index * 45}, 70%, 50%)`}
                            />
                          ))}
                        </Pie>
                        <RechartsTooltip />
                        <Legend />
                      </RPieChart>
                    </ResponsiveContainer>
                  </div>
                </div>
                <div className="border-t border-gray-200 dark:border-gray-700 px-6 py-3">
                  <div className="flex justify-between items-center w-full">
                    <div className="flex items-center gap-2">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
                        {stats.totalProducts} Products
                      </span>
                      <span className="text-sm text-gray-500 dark:text-gray-400">
                        across all categories
                      </span>
                    </div>
                    <button className="text-sm text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300">
                      Manage Inventory
                    </button>
                  </div>
                </div>
              </div>

              {/* Customer Growth Chart */}
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm hover:shadow-md transition-shadow duration-200 border border-gray-200 dark:border-gray-700">
                <div className="p-4 border-b border-gray-200 dark:border-gray-700">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-lg font-bold text-gray-900 dark:text-white flex items-center">
                        <Users className="mr-2 h-5 w-5 text-purple-600 dark:text-purple-400" />
                        Customer Growth
                      </h3>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        Monthly customer acquisition
                      </p>
                    </div>
                  </div>
                </div>
                <div className="p-4">
                  <div className="h-[300px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={processedCustomerData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="date" />
                        <YAxis />
                        <RechartsTooltip />
                        <Bar
                          dataKey="customers"
                          fill="#8B5CF6"
                          radius={[4, 4, 0, 0]}
                        />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>
                <div className="border-t border-gray-200 dark:border-gray-700 px-6 py-3">
                  <div className="flex justify-between items-center w-full">
                    <div className="flex items-center gap-2">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200">
                        +{stats.customers.growth}%
                      </span>
                      <span className="text-sm text-gray-500 dark:text-gray-400">
                        new customers
                      </span>
                    </div>
                    <button className="text-sm text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300">
                      View All Customers
                    </button>
                  </div>
                </div>
              </div>

              {/* Performance Metrics */}
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm hover:shadow-md transition-shadow duration-200 border border-gray-200 dark:border-gray-700">
                <div className="p-4 border-b border-gray-200 dark:border-gray-700">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-lg font-bold text-gray-900 dark:text-white flex items-center">
                        <Activity className="mr-2 h-5 w-5 text-yellow-600 dark:text-yellow-400" />
                        Performance Metrics
                      </h3>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        Key performance indicators
                      </p>
                    </div>
                  </div>
                </div>
                <div className="p-6">
                  <div className="space-y-6">
                    {/* Sales Target */}
                    <div>
                      <div className="flex justify-between mb-1">
                        <span className="text-sm font-medium text-gray-600 dark:text-gray-300">
                          Sales Target
                        </span>
                        <span className="text-sm font-medium text-gray-600 dark:text-gray-300">
                          $
                          {stats.performance.salesTarget.current.toLocaleString()}{' '}
                          / $
                          {stats.performance.salesTarget.target.toLocaleString()}
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                        <div
                          className="bg-blue-600 dark:bg-blue-400 h-2 rounded-full"
                          style={{
                            width: `${stats.performance.salesTarget.percentage}%`,
                          }}
                        ></div>
                      </div>
                      <div className="flex justify-between mt-1">
                        <span className="text-xs text-gray-500 dark:text-gray-400">
                          {stats.performance.salesTarget.percentage}% of target
                        </span>
                        <span className="text-xs text-gray-500 dark:text-gray-400">
                          $
                          {(
                            stats.performance.salesTarget.target -
                            stats.performance.salesTarget.current
                          ).toLocaleString()}{' '}
                          to go
                        </span>
                      </div>
                    </div>

                    {/* Order Fulfillment */}
                    <div>
                      <div className="flex justify-between mb-1">
                        <span className="text-sm font-medium text-gray-600 dark:text-gray-300">
                          Order Fulfillment
                        </span>
                        <span className="text-sm font-medium text-gray-600 dark:text-gray-300">
                          {stats.performance.orderFulfillment.percentage}%
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                        <div
                          className="bg-green-600 dark:bg-green-400 h-2 rounded-full"
                          style={{
                            width: `${stats.performance.orderFulfillment.percentage}%`,
                          }}
                        ></div>
                      </div>
                      <div className="flex justify-between mt-1">
                        <span className="text-xs text-gray-500 dark:text-gray-400">
                          Orders fulfilled on time
                        </span>
                        <span className="text-xs text-green-600 dark:text-green-400">
                          Excellent
                        </span>
                      </div>
                    </div>

                    {/* Customer Satisfaction */}
                    <div>
                      <div className="flex justify-between mb-1">
                        <span className="text-sm font-medium text-gray-600 dark:text-gray-300">
                          Customer Satisfaction
                        </span>
                        <span className="text-sm font-medium text-gray-600 dark:text-gray-300">
                          {stats.performance.customerSatisfaction.current} /{' '}
                          {stats.performance.customerSatisfaction.target}
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                        <div
                          className="bg-yellow-600 dark:bg-yellow-400 h-2 rounded-full"
                          style={{
                            width: `${stats.performance.customerSatisfaction.percentage}%`,
                          }}
                        ></div>
                      </div>
                      <div className="flex justify-between mt-1">
                        <span className="text-xs text-gray-500 dark:text-gray-400">
                          Average rating
                        </span>
                        <span className="text-xs text-yellow-600 dark:text-yellow-400">
                          Very Good
                        </span>
                      </div>
                    </div>

                    {/* Inventory Turnover */}
                    <div>
                      <div className="flex justify-between mb-1">
                        <span className="text-sm font-medium text-gray-600 dark:text-gray-300">
                          Inventory Turnover
                        </span>
                        <span className="text-sm font-medium text-gray-600 dark:text-gray-300">
                          {stats.performance.inventoryTurnover.current} /{' '}
                          {stats.performance.inventoryTurnover.target}
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                        <div
                          className="bg-red-600 dark:bg-red-400 h-2 rounded-full"
                          style={{
                            width: `${stats.performance.inventoryTurnover.percentage}%`,
                          }}
                        ></div>
                      </div>
                      <div className="flex justify-between mt-1">
                        <span className="text-xs text-gray-500 dark:text-gray-400">
                          Times per year
                        </span>
                        <span className="text-xs text-red-600 dark:text-red-400">
                          Needs Improvement
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="border-t border-gray-200 dark:border-gray-700 px-6 py-3">
                  <button className="text-sm text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 ml-auto">
                    View Detailed Reports
                  </button>
                </div>
              </div>
            </div>

            {/* Recent Activity and Top Products */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Recent Activity */}
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm hover:shadow-md transition-shadow duration-200 border border-gray-200 dark:border-gray-700">
                <div className="p-4 border-b border-gray-200 dark:border-gray-700">
                  <h3 className="text-lg font-bold text-gray-900 dark:text-white flex items-center">
                    <Clock className="mr-2 h-5 w-5 text-gray-500" />
                    Recent Activity
                  </h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Latest actions and updates
                  </p>
                </div>
                <div className="p-4">
                  <div className="space-y-4">
                    {recentActivities.map((activity, index) => (
                      <div key={index} className="flex items-start gap-4">
                        <div className={`p-2 rounded-full ${activity.iconBg}`}>
                          {activity.icon}
                        </div>
                        <div className="flex-1">
                          <p className="font-medium">{activity.title}</p>
                          <p className="text-sm text-gray-500 dark:text-gray-400">
                            {activity.description}
                          </p>
                          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                            {activity.time}
                          </p>
                        </div>
                        {activity.badge && (
                          <span
                            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                              activity.badge.variant === 'success'
                                ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                                : activity.badge.variant === 'warning'
                                ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
                                : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                            }`}
                          >
                            {activity.badge.text}
                          </span>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
                <div className="border-t border-gray-200 dark:border-gray-700 px-6 py-3">
                  <button className="text-sm text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 ml-auto">
                    View All Activity
                  </button>
                </div>
              </div>

              {/* Top Products */}
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm hover:shadow-md transition-shadow duration-200 border border-gray-200 dark:border-gray-700">
                <div className="p-4 border-b border-gray-200 dark:border-gray-700">
                  <h3 className="text-lg font-bold text-gray-900 dark:text-white flex items-center">
                    <Award className="mr-2 h-5 w-5 text-gray-500" />
                    Top Products
                  </h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Best performing products
                  </p>
                </div>
                <div className="p-4">
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                      <thead className="bg-gray-50 dark:bg-gray-800">
                        <tr>
                          <th
                            scope="col"
                            className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider"
                          >
                            Product
                          </th>
                          <th
                            scope="col"
                            className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider"
                          >
                            Sales
                          </th>
                          <th
                            scope="col"
                            className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider"
                          >
                            Revenue
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                        {topProducts.map((product, index) => (
                          <tr key={index}>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                              {product.name}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400 text-right">
                              {product.sales}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400 text-right">
                              ${product.revenue.toLocaleString()}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
                <div className="border-t border-gray-200 dark:border-gray-700 px-6 py-3">
                  <button className="text-sm text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 ml-auto">
                    View All Products
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Analytics Tab */}
        {activeTab === 'analytics' && (
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm hover:shadow-md transition-shadow duration-200 border border-gray-200 dark:border-gray-700">
            <div className="p-4 border-b border-gray-200 dark:border-gray-700">
              <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                Advanced Analytics
              </h3>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Detailed performance metrics and trends
              </p>
            </div>
            <div className="p-4">
              <div className="h-[400px]">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={processedSalesData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <RechartsTooltip />
                    <Legend />
                    <Line
                      type="monotone"
                      dataKey="sales"
                      stroke="#8884d8"
                      activeDot={{ r: 8 }}
                    />
                    <Line type="monotone" dataKey="orders" stroke="#82ca9d" />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        )}

        {/* Products Tab */}
        {activeTab === 'products' && (
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm hover:shadow-md transition-shadow duration-200 border border-gray-200 dark:border-gray-700">
            <div className="p-4 border-b border-gray-200 dark:border-gray-700">
              <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                Product Performance
              </h3>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Sales and inventory metrics by product
              </p>
            </div>
            <div className="p-4">
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                  <thead className="bg-gray-50 dark:bg-gray-800">
                    <tr>
                      <th
                        scope="col"
                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider"
                      >
                        Product
                      </th>
                      <th
                        scope="col"
                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider"
                      >
                        Category
                      </th>
                      <th
                        scope="col"
                        className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider"
                      >
                        Stock
                      </th>
                      <th
                        scope="col"
                        className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider"
                      >
                        Sales
                      </th>
                      <th
                        scope="col"
                        className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider"
                      >
                        Revenue
                      </th>
                      <th
                        scope="col"
                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider"
                      >
                        Status
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                    {generateProductList().map((product, index) => (
                      <tr key={index}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                          {product.name}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                          {product.category}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400 text-right">
                          {product.stock}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400 text-right">
                          {product.sales}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400 text-right">
                          ${product.revenue.toLocaleString()}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                          <span
                            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                              product.status === 'In Stock'
                                ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                                : product.status === 'Low Stock'
                                ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
                                : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                            }`}
                          >
                            {product.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* Customers Tab */}
        {activeTab === 'customers' && (
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm hover:shadow-md transition-shadow duration-200 border border-gray-200 dark:border-gray-700">
            <div className="p-4 border-b border-gray-200 dark:border-gray-700">
              <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                Customer Insights
              </h3>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Customer acquisition and retention metrics
              </p>
            </div>
            <div className="p-4">
              <div className="h-[400px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={processedCustomerData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <RechartsTooltip />
                    <Legend />
                    <Bar
                      dataKey="customers"
                      name="New Customers"
                      fill="#8884d8"
                    />
                    <Bar
                      dataKey="returning"
                      name="Returning Customers"
                      fill="#82ca9d"
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

// Helper Components
const StatsCard = ({ title, value, growth, icon, iconBg, progressColor }) => {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm hover:shadow-md transition-shadow duration-200 border border-gray-200 dark:border-gray-700">
      <div className="p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
              {title}
            </p>
            <div className="flex items-center mt-1">
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white">
                {value}
              </h3>
              <span
                className={`flex items-center ml-2 text-xs font-medium ${
                  growth >= 0
                    ? 'text-green-600 dark:text-green-400'
                    : 'text-red-600 dark:text-red-400'
                }`}
              >
                {growth >= 0 ? (
                  <ArrowUpRight className="h-3 w-3 mr-1" />
                ) : (
                  <TrendingDown className="h-3 w-3 mr-1" />
                )}
                {Math.abs(growth)}%
              </span>
            </div>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              Compared to last month
            </p>
          </div>
          <div className={`${iconBg} p-3 rounded-full`}>{icon}</div>
        </div>
        <div className="mt-4 w-full bg-gray-200 dark:bg-gray-700 rounded-full h-1.5">
          <div
            className={`${progressColor} h-1.5 rounded-full`}
            style={{ width: `${Math.min(Math.abs(growth), 100)}%` }}
          ></div>
        </div>
      </div>
    </div>
  );
};

const DashboardSkeleton = () => {
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <div className="h-8 w-64 mb-2 bg-gray-200 dark:bg-gray-700 rounded"></div>
          <div className="h-4 w-96 bg-gray-200 dark:bg-gray-700 rounded"></div>
        </div>
        <div className="flex items-center gap-2">
          <div className="h-10 w-[180px] bg-gray-200 dark:bg-gray-700 rounded"></div>
          <div className="h-10 w-10 bg-gray-200 dark:bg-gray-700 rounded"></div>
          <div className="h-10 w-24 bg-gray-200 dark:bg-gray-700 rounded"></div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[1, 2, 3, 4].map((i) => (
          <div
            key={i}
            className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6"
          >
            <div className="flex items-center justify-between">
              <div>
                <div className="h-4 w-32 mb-2 bg-gray-200 dark:bg-gray-700 rounded"></div>
                <div className="h-8 w-24 mb-1 bg-gray-200 dark:bg-gray-700 rounded"></div>
                <div className="h-3 w-40 bg-gray-200 dark:bg-gray-700 rounded"></div>
              </div>
              <div className="h-12 w-12 bg-gray-200 dark:bg-gray-700 rounded-full"></div>
            </div>
            <div className="h-2 w-full mt-4 bg-gray-200 dark:bg-gray-700 rounded"></div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {[1, 2].map((i) => (
          <div
            key={i}
            className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700"
          >
            <div className="p-4 border-b border-gray-200 dark:border-gray-700">
              <div className="h-6 w-48 mb-1 bg-gray-200 dark:bg-gray-700 rounded"></div>
              <div className="h-4 w-64 bg-gray-200 dark:bg-gray-700 rounded"></div>
            </div>
            <div className="p-4">
              <div className="h-[300px] w-full bg-gray-200 dark:bg-gray-700 rounded"></div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

// Helper Functions
function calculateGrowth(customerStats) {
  if (
    !customerStats ||
    !Array.isArray(customerStats) ||
    customerStats.length < 2
  ) {
    return 5; // Default growth value
  }

  // Sort by date
  const sortedStats = [...customerStats].sort((a, b) =>
    a._id.localeCompare(b._id)
  );

  // Get the last two months
  const currentMonth = sortedStats[sortedStats.length - 1];
  const previousMonth = sortedStats[sortedStats.length - 2];

  if (!currentMonth || !previousMonth) return 5;

  const currentCount = currentMonth.count || 0;
  const previousCount = previousMonth.count || 1; // Avoid division by zero

  const growthRate = ((currentCount - previousCount) / previousCount) * 100;
  return Math.round(growthRate);
}

function processSalesData(data) {
  if (!data || !Array.isArray(data) || data.length === 0) {
    return generateSalesData();
  }

  return data.map((item) => ({
    date: item._id || item.date,
    sales: item.total || item.sales || 0,
    orders: item.count || item.orders || 0,
  }));
}

function processInventoryData(data) {
  if (!data || !Array.isArray(data) || data.length === 0) {
    return [
      { name: 'Electronics', value: 35 },
      { name: 'Clothing', value: 25 },
      { name: 'Home Goods', value: 20 },
      { name: 'Books', value: 15 },
      { name: 'Other', value: 5 },
    ];
  }

  return data.map((item) => ({
    name: item.categoryName || 'Category',
    value: item.totalStock || 0,
  }));
}

function processCustomerData(data) {
  if (!data || !Array.isArray(data) || data.length === 0) {
    return generateCustomerData();
  }

  return data.map((item) => ({
    date: item._id || 'Unknown',
    customers: item.count || 0,
    returning: Math.floor(item.count * 0.4) || 0, // Estimate returning customers
  }));
}

function generateSalesData() {
  const months = [
    'Jan',
    'Feb',
    'Mar',
    'Apr',
    'May',
    'Jun',
    'Jul',
    'Aug',
    'Sep',
    'Oct',
    'Nov',
    'Dec',
  ];
  return months.map((month, index) => ({
    date: month,
    sales: Math.floor(Math.random() * 10000) + 1000,
    orders: Math.floor(Math.random() * 100) + 10,
  }));
}

function generateCustomerData() {
  const months = [
    'Jan',
    'Feb',
    'Mar',
    'Apr',
    'May',
    'Jun',
    'Jul',
    'Aug',
    'Sep',
    'Oct',
    'Nov',
    'Dec',
  ];
  return months.map((month, index) => ({
    date: month,
    customers: Math.floor(Math.random() * 50) + 10,
    returning: Math.floor(Math.random() * 30) + 5,
  }));
}

function generateRecentActivities() {
  return [
    {
      title: 'New Order Received',
      description: 'Order #1234 for Ksh 15,600 has been placed',
      time: '5 minutes ago',
      icon: <ShoppingCart className="h-4 w-4 text-green-600" />,
      iconBg: 'bg-green-100',
      badge: { text: 'New', variant: 'success' },
    },
    {
      title: 'Product Stock Update',
      description: 'Wireless Headphones stock updated to 45 units',
      time: '1 hour ago',
      icon: <Package className="h-4 w-4 text-blue-600" />,
      iconBg: 'bg-blue-100',
    },
    {
      title: 'Customer Registration',
      description: 'John Doe has created a new account',
      time: '3 hours ago',
      icon: <Users className="h-4 w-4 text-purple-600" />,
      iconBg: 'bg-purple-100',
    },
    {
      title: 'Payment Received',
      description: 'Payment for order #1233 has been processed',
      time: 'Yesterday',
      icon: <CreditCard className="h-4 w-4 text-yellow-600" />,
      iconBg: 'bg-yellow-100',
    },
    {
      title: 'Low Stock Alert',
      description: 'Smart Watch is running low on stock (5 units left)',
      time: 'Yesterday',
      icon: <AlertCircle className="h-4 w-4 text-red-600" />,
      iconBg: 'bg-red-100',
      badge: { text: 'Alert', variant: 'destructive' },
    },
  ];
}

function generateTopProducts() {
  return [
    { name: 'Wireless Headphones', sales: 156, revenue: 7800 },
    { name: 'Smart Watch', sales: 129, revenue: 6450 },
    { name: 'Bluetooth Speaker', sales: 98, revenue: 4900 },
    { name: 'Laptop Backpack', sales: 87, revenue: 3480 },
    { name: 'USB-C Hub', sales: 76, revenue: 2280 },
  ];
}

function generateProductList() {
  return [
    {
      name: 'Wireless Headphones',
      category: 'Electronics',
      stock: 45,
      sales: 156,
      revenue: 7800,
      status: 'In Stock',
    },
    {
      name: 'Smart Watch',
      category: 'Electronics',
      stock: 5,
      sales: 129,
      revenue: 6450,
      status: 'Low Stock',
    },
    {
      name: 'Bluetooth Speaker',
      category: 'Electronics',
      stock: 28,
      sales: 98,
      revenue: 4900,
      status: 'In Stock',
    },
    {
      name: 'Laptop Backpack',
      category: 'Accessories',
      stock: 0,
      sales: 87,
      revenue: 3480,
      status: 'Out of Stock',
    },
    {
      name: 'USB-C Hub',
      category: 'Electronics',
      stock: 12,
      sales: 76,
      revenue: 2280,
      status: 'In Stock',
    },
  ];
}

export default Dashboard;
