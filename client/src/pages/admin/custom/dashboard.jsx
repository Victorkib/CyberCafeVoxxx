import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  BarChart2,
  Package,
  ShoppingCart,
  Users,
  CreditCard,
  MessageSquare,
  Clock,
  AlertCircle,
  TrendingUp,
  DollarSign,
  Calendar,
  Activity,
  ArrowUpRight,
  Zap,
  Award,
  Trash2,
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
} from 'recharts';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  fetchDashboardStats,
  fetchSalesAnalytics,
  fetchInventoryStats,
  fetchCustomerStats,
  cleanupExpiredInvitations,
} from '@/redux/slices/adminSlice';
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

  const handleCleanupInvitations = async () => {
    try {
      await dispatch(cleanupExpiredInvitations()).unwrap();
      toast.success('Expired invitations cleaned up successfully');
    } catch (error) {
      toast.error(error.message || 'Failed to cleanup invitations');
    }
  };

  useEffect(() => {
    // Fetch all dashboard data
    dispatch(fetchDashboardStats());
    dispatch(fetchSalesAnalytics({ startDate: '2024-01-01', endDate: '2024-12-31' }));
    dispatch(fetchInventoryStats());
    dispatch(fetchCustomerStats());
  }, [dispatch]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-red-600">{error}</div>
      </div>
    );
  }

  // Default stats object with safe fallbacks
  const stats = {
    customers: { total: 0, growth: 0 },
    orders: { total: 0, growth: 0 },
    revenue: { total: 0, growth: 0 },
    salesData: [],
    productCategories: [],
    recentActivities: [],
    performance: {
      salesTarget: { current: 0, target: 0, percentage: 0 },
      orderFulfillment: { current: 0, target: 0, percentage: 0 },
      customerSatisfaction: { current: 0, target: 0, percentage: 0 },
      inventoryTurnover: { current: 0, target: 0, percentage: 0 },
    },
    ...dashboardStats
  };

  const salesData = salesAnalytics?.data || [];
  const inventoryData = inventoryStats?.data || [];
  const customerData = customerStats?.data || [];

  return (
    <div className="space-y-6">
      {/* Quick Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="bg-white dark:bg-gray-800 shadow-sm hover:shadow-md transition-shadow duration-200">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
                  Total Customers
                </p>
                <div className="flex items-center mt-1">
                  <h3 className="text-2xl font-bold text-gray-900 dark:text-white">
                    {stats.customers.total.toLocaleString()}
                  </h3>
                  <span className="flex items-center ml-2 text-xs font-medium text-green-600 dark:text-green-400">
                    <ArrowUpRight className="h-3 w-3 mr-1" />
                    {stats.customers.growth}%
                  </span>
                </div>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  Compared to last month
                </p>
              </div>
              <div className="bg-blue-100 dark:bg-blue-900/30 p-3 rounded-full">
                <Users className="h-6 w-6 text-blue-600 dark:text-blue-400" />
              </div>
            </div>
            <div className="mt-4 w-full bg-gray-200 dark:bg-gray-700 rounded-full h-1.5">
              <div
                className="bg-blue-600 dark:bg-blue-400 h-1.5 rounded-full"
                style={{ width: `${stats.customers.growth}%` }}
              ></div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white dark:bg-gray-800 shadow-sm hover:shadow-md transition-shadow duration-200">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
                  Total Orders
                </p>
                <div className="flex items-center mt-1">
                  <h3 className="text-2xl font-bold text-gray-900 dark:text-white">
                    {stats.orders.total.toLocaleString()}
                  </h3>
                  <span className="flex items-center ml-2 text-xs font-medium text-green-600 dark:text-green-400">
                    <ArrowUpRight className="h-3 w-3 mr-1" />
                    {stats.orders.growth}%
                  </span>
                </div>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  Compared to last month
                </p>
              </div>
              <div className="bg-green-100 dark:bg-green-900/30 p-3 rounded-full">
                <ShoppingCart className="h-6 w-6 text-green-600 dark:text-green-400" />
              </div>
            </div>
            <div className="mt-4 w-full bg-gray-200 dark:bg-gray-700 rounded-full h-1.5">
              <div
                className="bg-green-600 dark:bg-green-400 h-1.5 rounded-full"
                style={{ width: `${stats.orders.growth}%` }}
              ></div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white dark:bg-gray-800 shadow-sm hover:shadow-md transition-shadow duration-200">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
                  Total Revenue
                </p>
                <div className="flex items-center mt-1">
                  <h3 className="text-2xl font-bold text-gray-900 dark:text-white">
                    ${stats.revenue.total.toLocaleString()}
                  </h3>
                  <span className="flex items-center ml-2 text-xs font-medium text-green-600 dark:text-green-400">
                    <ArrowUpRight className="h-3 w-3 mr-1" />
                    {stats.revenue.growth}%
                  </span>
                </div>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  Compared to last month
                </p>
              </div>
              <div className="bg-red-100 dark:bg-red-900/30 p-3 rounded-full">
                <CreditCard className="h-6 w-6 text-red-600 dark:text-red-400" />
              </div>
            </div>
            <div className="mt-4 w-full bg-gray-200 dark:bg-gray-700 rounded-full h-1.5">
              <div
                className="bg-red-600 dark:bg-red-400 h-1.5 rounded-full"
                style={{ width: `${stats.revenue.growth}%` }}
              ></div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white dark:bg-gray-800 shadow-sm hover:shadow-md transition-shadow duration-200">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
                  Cleanup Invitations
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
          </CardContent>
        </Card>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Sales Analytics Chart */}
        <Card className="bg-white dark:bg-gray-800 shadow-sm hover:shadow-md transition-shadow duration-200">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-lg font-bold text-gray-900 dark:text-white flex items-center">
                  <TrendingUp className="mr-2 h-5 w-5 text-green-600 dark:text-green-400" />
                  Sales Analytics
                </CardTitle>
                <CardDescription className="text-gray-500 dark:text-gray-400">
                  Monthly sales performance
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={salesData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <RechartsTooltip />
                  <Area
                    type="monotone"
                    dataKey="sales"
                    stroke="#10B981"
                    fill="#10B981"
                    fillOpacity={0.2}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Inventory Stats Chart */}
        <Card className="bg-white dark:bg-gray-800 shadow-sm hover:shadow-md transition-shadow duration-200">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-lg font-bold text-gray-900 dark:text-white flex items-center">
                  <Package className="mr-2 h-5 w-5 text-blue-600 dark:text-blue-400" />
                  Inventory Overview
                </CardTitle>
                <CardDescription className="text-gray-500 dark:text-gray-400">
                  Stock levels by category
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <RPieChart>
                  <Pie
                    data={inventoryData}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    outerRadius={100}
                    label
                  >
                    {inventoryData.map((entry, index) => (
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
          </CardContent>
        </Card>

        {/* Customer Growth Chart */}
        <Card className="bg-white dark:bg-gray-800 shadow-sm hover:shadow-md transition-shadow duration-200">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-lg font-bold text-gray-900 dark:text-white flex items-center">
                  <Users className="mr-2 h-5 w-5 text-purple-600 dark:text-purple-400" />
                  Customer Growth
                </CardTitle>
                <CardDescription className="text-gray-500 dark:text-gray-400">
                  Monthly customer acquisition
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={customerData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <RechartsTooltip />
                  <Area
                    type="monotone"
                    dataKey="customers"
                    stroke="#8B5CF6"
                    fill="#8B5CF6"
                    fillOpacity={0.2}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Performance Metrics */}
        <Card className="bg-white dark:bg-gray-800 shadow-sm hover:shadow-md transition-shadow duration-200">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-lg font-bold text-gray-900 dark:text-white flex items-center">
                  <Activity className="mr-2 h-5 w-5 text-yellow-600 dark:text-yellow-400" />
                  Performance Metrics
                </CardTitle>
                <CardDescription className="text-gray-500 dark:text-gray-400">
                  Key performance indicators
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {/* Sales Target */}
              <div>
                <div className="flex justify-between mb-1">
                  <span className="text-sm font-medium text-gray-600 dark:text-gray-300">
                    Sales Target
                  </span>
                  <span className="text-sm font-medium text-gray-600 dark:text-gray-300">
                    {stats.performance.salesTarget.percentage}%
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
              </div>

              {/* Customer Satisfaction */}
              <div>
                <div className="flex justify-between mb-1">
                  <span className="text-sm font-medium text-gray-600 dark:text-gray-300">
                    Customer Satisfaction
                  </span>
                  <span className="text-sm font-medium text-gray-600 dark:text-gray-300">
                    {stats.performance.customerSatisfaction.percentage}%
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
              </div>

              {/* Inventory Turnover */}
              <div>
                <div className="flex justify-between mb-1">
                  <span className="text-sm font-medium text-gray-600 dark:text-gray-300">
                    Inventory Turnover
                  </span>
                  <span className="text-sm font-medium text-gray-600 dark:text-gray-300">
                    {stats.performance.inventoryTurnover.percentage}%
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
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Dashboard;
