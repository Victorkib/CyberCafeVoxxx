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
} from '../../../ui/card';

// Mock data
const salesData = [
  { name: 'Jan', sales: 4000, orders: 240 },
  { name: 'Feb', sales: 3000, orders: 198 },
  { name: 'Mar', sales: 5000, orders: 320 },
  { name: 'Apr', sales: 2780, orders: 190 },
  { name: 'May', sales: 1890, orders: 140 },
  { name: 'Jun', sales: 2390, orders: 150 },
  { name: 'Jul', sales: 3490, orders: 210 },
];

const productCategories = [
  { name: 'Electronics', value: 45, color: '#3B82F6' },
  { name: 'Stationery', value: 25, color: '#10B981' },
  { name: 'Office Supplies', value: 20, color: '#F59E0B' },
  { name: 'Accessories', value: 10, color: '#EF4444' },
];

const mockRecentActivities = [
  {
    id: 1,
    action: 'Product Added',
    item: 'Wireless Keyboard',
    user: 'Admin',
    time: '10 minutes ago',
  },
  {
    id: 2,
    action: 'Order Status Updated',
    item: '#ORD-002',
    user: 'Admin',
    time: '1 hour ago',
  },
  {
    id: 3,
    action: 'Customer Support Ticket',
    item: '#TKT-045',
    user: 'System',
    time: '3 hours ago',
  },
  {
    id: 4,
    action: 'New Customer Registered',
    item: 'Emily Davis',
    user: 'System',
    time: '5 hours ago',
  },
  {
    id: 5,
    action: 'Inventory Alert',
    item: 'Office Chair',
    user: 'System',
    time: '1 day ago',
  },
];

// Revenue data for area chart
const revenueData = [
  { name: 'Jan', revenue: 18000 },
  { name: 'Feb', revenue: 22000 },
  { name: 'Mar', revenue: 32000 },
  { name: 'Apr', revenue: 28000 },
  { name: 'May', revenue: 24000 },
  { name: 'Jun', revenue: 35000 },
  { name: 'Jul', revenue: 42000 },
];

// Main Dashboard Component
const Dashboard = () => {
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
                    856
                  </h3>
                  <span className="flex items-center ml-2 text-xs font-medium text-green-600 dark:text-green-400">
                    <ArrowUpRight className="h-3 w-3 mr-1" />
                    12%
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
                style={{ width: '75%' }}
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
                    1,458
                  </h3>
                  <span className="flex items-center ml-2 text-xs font-medium text-green-600 dark:text-green-400">
                    <ArrowUpRight className="h-3 w-3 mr-1" />
                    8%
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
                style={{ width: '65%' }}
              ></div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white dark:bg-gray-800 shadow-sm hover:shadow-md transition-shadow duration-200">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
                  Total Products
                </p>
                <div className="flex items-center mt-1">
                  <h3 className="text-2xl font-bold text-gray-900 dark:text-white">
                    245
                  </h3>
                  <span className="flex items-center ml-2 text-xs font-medium text-green-600 dark:text-green-400">
                    <ArrowUpRight className="h-3 w-3 mr-1" />
                    5%
                  </span>
                </div>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  Compared to last month
                </p>
              </div>
              <div className="bg-purple-100 dark:bg-purple-900/30 p-3 rounded-full">
                <Package className="h-6 w-6 text-purple-600 dark:text-purple-400" />
              </div>
            </div>
            <div className="mt-4 w-full bg-gray-200 dark:bg-gray-700 rounded-full h-1.5">
              <div
                className="bg-purple-600 dark:bg-purple-400 h-1.5 rounded-full"
                style={{ width: '45%' }}
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
                    $22,550
                  </h3>
                  <span className="flex items-center ml-2 text-xs font-medium text-green-600 dark:text-green-400">
                    <ArrowUpRight className="h-3 w-3 mr-1" />
                    15%
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
                style={{ width: '85%' }}
              ></div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Revenue Overview Card */}
        <Card className="bg-white dark:bg-gray-800 shadow-sm hover:shadow-md transition-shadow duration-200">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-lg font-bold text-gray-900 dark:text-white flex items-center">
                  <BarChart2 className="mr-2 h-5 w-5 text-blue-600 dark:text-blue-400" />
                  Revenue Overview
                </CardTitle>
                <CardDescription className="text-gray-500 dark:text-gray-400">
                  Monthly revenue performance
                </CardDescription>
              </div>
              <div className="flex items-center space-x-2">
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400">
                  <TrendingUp className="mr-1 h-3 w-3" />
                  +15%
                </span>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={revenueData}>
                  <defs>
                    <linearGradient
                      id="colorRevenue"
                      x1="0"
                      y1="0"
                      x2="0"
                      y2="1"
                    >
                      <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.8} />
                      <stop offset="95%" stopColor="#3B82F6" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                  <XAxis dataKey="name" stroke="#9CA3AF" />
                  <YAxis stroke="#9CA3AF" />
                  <RechartsTooltip
                    contentStyle={{
                      backgroundColor: '#1F2937',
                      border: 'none',
                      borderRadius: '0.375rem',
                      color: '#F9FAFB',
                    }}
                    itemStyle={{ color: '#F9FAFB' }}
                    formatter={(value) => [`$${value}`, 'Revenue']}
                    labelFormatter={(label) => `Month: ${label}`}
                  />
                  <Area
                    type="monotone"
                    dataKey="revenue"
                    stroke="#3B82F6"
                    fillOpacity={1}
                    fill="url(#colorRevenue)"
                    strokeWidth={2}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
            <div className="mt-6 grid grid-cols-2 gap-4">
              <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      Total Revenue
                    </p>
                    <p className="text-xl font-bold text-blue-700 dark:text-blue-400">
                      $201,550
                    </p>
                  </div>
                  <DollarSign className="h-8 w-8 text-blue-500 dark:text-blue-400 opacity-50" />
                </div>
                <div className="mt-2 flex items-center">
                  <ArrowUpRight className="h-3 w-3 text-green-600 dark:text-green-400 mr-1" />
                  <p className="text-xs text-green-600 dark:text-green-400">
                    +15% from last year
                  </p>
                </div>
              </div>
              <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      Average Order Value
                    </p>
                    <p className="text-xl font-bold text-green-700 dark:text-green-400">
                      $138.25
                    </p>
                  </div>
                  <ShoppingCart className="h-8 w-8 text-green-500 dark:text-green-400 opacity-50" />
                </div>
                <div className="mt-2 flex items-center">
                  <ArrowUpRight className="h-3 w-3 text-green-600 dark:text-green-400 mr-1" />
                  <p className="text-xs text-green-600 dark:text-green-400">
                    +8% from last month
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Product Categories Card */}
        <Card className="bg-white dark:bg-gray-800 shadow-sm hover:shadow-md transition-shadow duration-200">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-lg font-bold text-gray-900 dark:text-white flex items-center">
                  <Activity className="mr-2 h-5 w-5 text-purple-600 dark:text-purple-400" />
                  Product Categories
                </CardTitle>
                <CardDescription className="text-gray-500 dark:text-gray-400">
                  Distribution of products by category
                </CardDescription>
              </div>
              <div className="flex items-center space-x-2">
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400">
                  <Package className="mr-1 h-3 w-3" />
                  245 Products
                </span>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <RPieChart>
                  <Pie
                    data={productCategories}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) =>
                      `${name}: ${(percent * 100).toFixed(0)}%`
                    }
                    outerRadius={120}
                    fill="#8884d8"
                    dataKey="value"
                    strokeWidth={2}
                    stroke="#FFFFFF"
                  >
                    {productCategories.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Legend
                    verticalAlign="bottom"
                    height={36}
                    iconType="circle"
                    formatter={(value) => (
                      <span className="text-sm text-gray-700 dark:text-gray-300">
                        {value}
                      </span>
                    )}
                  />
                </RPieChart>
              </ResponsiveContainer>
            </div>
            <div className="mt-4">
              <div className="flex items-center justify-between mb-2">
                <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Inventory Capacity
                </p>
                <p className="text-sm font-medium text-blue-600 dark:text-blue-400">
                  80%
                </p>
              </div>
              <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                <div
                  className="bg-blue-600 dark:bg-blue-400 h-2 rounded-full"
                  style={{ width: '80%' }}
                ></div>
              </div>
              <div className="mt-4 grid grid-cols-2 gap-4">
                <div className="flex items-center">
                  <div className="w-3 h-3 rounded-full bg-blue-500 mr-2"></div>
                  <div>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      Electronics
                    </p>
                    <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      110 products
                    </p>
                  </div>
                </div>
                <div className="flex items-center">
                  <div className="w-3 h-3 rounded-full bg-green-500 mr-2"></div>
                  <div>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      Stationery
                    </p>
                    <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      62 products
                    </p>
                  </div>
                </div>
                <div className="flex items-center">
                  <div className="w-3 h-3 rounded-full bg-yellow-500 mr-2"></div>
                  <div>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      Office Supplies
                    </p>
                    <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      49 products
                    </p>
                  </div>
                </div>
                <div className="flex items-center">
                  <div className="w-3 h-3 rounded-full bg-red-500 mr-2"></div>
                  <div>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      Accessories
                    </p>
                    <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      24 products
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Bottom Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Activity Card */}
        <Card className="bg-white dark:bg-gray-800 shadow-sm hover:shadow-md transition-shadow duration-200 lg:col-span-2">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-lg font-bold text-gray-900 dark:text-white flex items-center">
                  <Clock className="mr-2 h-5 w-5 text-blue-600 dark:text-blue-400" />
                  Recent Activity
                </CardTitle>
                <CardDescription className="text-gray-500 dark:text-gray-400">
                  Latest system activities
                </CardDescription>
              </div>
              <div className="flex items-center space-x-2">
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400">
                  <Zap className="mr-1 h-3 w-3" />
                  Live Updates
                </span>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-5 max-h-96 overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-gray-300 dark:scrollbar-thumb-gray-600">
              {mockRecentActivities.map((activity) => (
                <div
                  key={activity.id}
                  className="flex items-start space-x-4 p-4 rounded-lg border border-gray-100 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors duration-150"
                >
                  <div
                    className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center 
                    ${
                      activity.action.includes('Product')
                        ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400'
                        : activity.action.includes('Order')
                        ? 'bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400'
                        : activity.action.includes('Customer')
                        ? 'bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400'
                        : activity.action.includes('Inventory')
                        ? 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-600 dark:text-yellow-400'
                        : 'bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400'
                    }`}
                  >
                    {activity.action.includes('Product') && (
                      <Package className="h-5 w-5" />
                    )}
                    {activity.action.includes('Order') && (
                      <ShoppingCart className="h-5 w-5" />
                    )}
                    {activity.action.includes('Customer') && (
                      <Users className="h-5 w-5" />
                    )}
                    {activity.action.includes('Inventory') && (
                      <AlertCircle className="h-5 w-5" />
                    )}
                    {activity.action.includes('Support') && (
                      <MessageSquare className="h-5 w-5" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-medium text-gray-900 dark:text-white">
                        {activity.action}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        {activity.time}
                      </p>
                    </div>
                    <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">
                      {activity.item} by{' '}
                      <span className="font-medium">{activity.user}</span>
                    </p>
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-6">
              <button className="w-full py-2 px-4 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors duration-200">
                View All Activities
              </button>
            </div>
          </CardContent>
        </Card>

        {/* Performance Card */}
        <Card className="bg-white dark:bg-gray-800 shadow-sm hover:shadow-md transition-shadow duration-200">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-lg font-bold text-gray-900 dark:text-white flex items-center">
                  <Award className="mr-2 h-5 w-5 text-yellow-600 dark:text-yellow-400" />
                  Performance
                </CardTitle>
                <CardDescription className="text-gray-500 dark:text-gray-400">
                  Monthly targets and achievements
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    Sales Target
                  </p>
                  <p className="text-sm font-medium text-blue-600 dark:text-blue-400">
                    85%
                  </p>
                </div>
                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5">
                  <div
                    className="bg-blue-600 dark:bg-blue-400 h-2.5 rounded-full"
                    style={{ width: '85%' }}
                  ></div>
                </div>
                <div className="flex items-center justify-between mt-2">
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    Current: $19,168
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    Target: $25,000
                  </p>
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    New Customers
                  </p>
                  <p className="text-sm font-medium text-green-600 dark:text-green-400">
                    92%
                  </p>
                </div>
                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5">
                  <div
                    className="bg-green-600 dark:bg-green-400 h-2.5 rounded-full"
                    style={{ width: '92%' }}
                  ></div>
                </div>
                <div className="flex items-center justify-between mt-2">
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    Current: 46
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    Target: 50
                  </p>
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    Customer Satisfaction
                  </p>
                  <p className="text-sm font-medium text-yellow-600 dark:text-yellow-400">
                    78%
                  </p>
                </div>
                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5">
                  <div
                    className="bg-yellow-600 dark:bg-yellow-400 h-2.5 rounded-full"
                    style={{ width: '78%' }}
                  ></div>
                </div>
                <div className="flex items-center justify-between mt-2">
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    Current: 78%
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    Target: 85%
                  </p>
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    Inventory Turnover
                  </p>
                  <p className="text-sm font-medium text-purple-600 dark:text-purple-400">
                    65%
                  </p>
                </div>
                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5">
                  <div
                    className="bg-purple-600 dark:bg-purple-400 h-2.5 rounded-full"
                    style={{ width: '65%' }}
                  ></div>
                </div>
                <div className="flex items-center justify-between mt-2">
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    Current: 3.2
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    Target: 5.0
                  </p>
                </div>
              </div>
            </div>

            <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
              <div className="flex items-center">
                <Calendar className="h-5 w-5 text-blue-600 dark:text-blue-400 mr-2" />
                <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Monthly Review
                </p>
              </div>
              <p className="text-xs text-gray-600 dark:text-gray-400 mt-2">
                Next performance review scheduled for{' '}
                <span className="font-medium">August 15, 2025</span>
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Dashboard;
