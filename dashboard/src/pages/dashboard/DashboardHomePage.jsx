import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  TrendingUp,
  TrendingDown,
  Package,
  DollarSign,
  Store,
  Truck,
  Plus,
  FileText,
  BarChart3,
  AlertCircle,
  RefreshCw,
} from "lucide-react";
import { useAuthStore } from "../../stores/authStore";
import { Card, CardHeader, CardBody } from "../../components/ui/Card";
import Button from "../../components/ui/Button";
import dashboardService from "../../services/dashboardService";

const DashboardHomePage = () => {
  const { user } = useAuthStore();
  const [stats, setStats] = useState({
    totalOrders: 0,
    revenue: 0,
    activeStores: 0,
    pendingDeliveries: 0,
  });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [lastUpdated, setLastUpdated] = useState(null);

  const fetchDashboardData = async () => {
    try {
      setIsLoading(true);
      setError(null);

      // Get default date range (last 30 days)
      const { dateFrom, dateTo } = dashboardService.getDefaultDateRange();

      // Fetch comprehensive dashboard statistics
      const response = await dashboardService.getDashboardStats({
        dateFrom,
        dateTo,
        currency: "EUR",
      });

      if (response.success && response.data) {
        const data = response.data;

        // Extract data from daily overview
        const dailyOverview = data.daily_overview || {};

        setStats({
          totalOrders: dailyOverview.total_orders || 0,
          revenue: dailyOverview.total_sales || 0,
          activeStores: dailyOverview.active_stores || 0,
          pendingDeliveries: dailyOverview.pending_orders || 0,
        });

        setLastUpdated(new Date());
      } else {
        setError(response.message || "خطأ في جلب البيانات");
      }
    } catch (error) {
      console.error("Error fetching dashboard data:", error);
      setError("خطأ في الاتصال بالخادم");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const statCards = [
    {
      title: "Total Orders",
      value: stats.totalOrders.toLocaleString(),
      change: "Real-time",
      trend: "neutral",
      icon: Package,
      color: "blue",
    },
    {
      title: "Revenue",
      value: dashboardService.formatCurrency(stats.revenue, "EUR"),
      change: "Real-time",
      trend: "neutral",
      icon: DollarSign,
      color: "green",
    },
    {
      title: "Active Stores",
      value: stats.activeStores.toLocaleString(),
      change: "Real-time",
      trend: "neutral",
      icon: Store,
      color: "purple",
    },
    {
      title: "Pending Deliveries",
      value: stats.pendingDeliveries.toLocaleString(),
      change: "Real-time",
      trend: "neutral",
      icon: Truck,
      color: "orange",
    },
  ];

  const quickActions = [
    {
      title: "Create Order",
      description: "Add a new order to the system",
      icon: Plus,
      color: "blue",
      path: "/orders/create",
    },
    {
      title: "Add Store",
      description: "Register a new store location",
      icon: Store,
      color: "green",
      path: "/stores/create",
    },
    {
      title: "View Reports",
      description: "Access detailed analytics",
      icon: BarChart3,
      color: "purple",
      path: "/reports",
    },
  ];

  const recentActivities = [
    {
      id: 1,
      type: "order",
      message: "New order #1234 created for Store ABC",
      time: "2 minutes ago",
      status: "pending",
    },
    {
      id: 2,
      type: "payment",
      message: "Payment received from Store XYZ - €1,250",
      time: "15 minutes ago",
      status: "completed",
    },
    {
      id: 3,
      type: "delivery",
      message: "Delivery completed for Store DEF",
      time: "1 hour ago",
      status: "completed",
    },
    {
      id: 4,
      type: "store",
      message: "New store registered: Store GHI",
      time: "2 hours ago",
      status: "pending",
    },
  ];

  const getStatusColor = (status) => {
    switch (status) {
      case "completed":
        return "text-green-600 bg-green-100";
      case "pending":
        return "text-yellow-600 bg-yellow-100";
      case "failed":
        return "text-red-600 bg-red-100";
      default:
        return "text-gray-600 bg-gray-100";
    }
  };

  const getActivityIcon = (type) => {
    switch (type) {
      case "order":
        return Package;
      case "payment":
        return DollarSign;
      case "delivery":
        return Truck;
      case "store":
        return Store;
      default:
        return FileText;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between"
      >
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-600">Welcome back, {user?.name || "Admin"}</p>
          {lastUpdated && (
            <p className="text-xs text-gray-400 mt-1">
              Last updated: {lastUpdated.toLocaleTimeString()}
            </p>
          )}
        </div>
        <div className="flex items-center space-x-4">
          <Button
            onClick={fetchDashboardData}
            disabled={isLoading}
            variant="outline"
            size="sm"
            className="flex items-center space-x-2"
          >
            <RefreshCw
              className={`w-4 h-4 ${isLoading ? "animate-spin" : ""}`}
            />
            <span>Refresh</span>
          </Button>
          <div className="text-sm text-gray-500">
            {new Date().toLocaleDateString("en-US", {
              weekday: "long",
              year: "numeric",
              month: "long",
              day: "numeric",
            })}
          </div>
        </div>
      </motion.div>

      {/* Error Message */}
      {error && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-red-50 border border-red-200 rounded-lg p-4"
        >
          <div className="flex items-center space-x-3">
            <AlertCircle className="w-5 h-5 text-red-500" />
            <div>
              <h3 className="text-sm font-medium text-red-800">
                Error Loading Data
              </h3>
              <p className="text-sm text-red-700 mt-1">{error}</p>
            </div>
            <Button
              onClick={fetchDashboardData}
              variant="outline"
              size="sm"
              className="ml-auto"
            >
              Retry
            </Button>
          </div>
        </motion.div>
      )}

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <motion.div
              key={stat.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <Card className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">
                      {stat.title}
                    </p>
                    <p className="mt-2 text-3xl font-bold text-gray-900">
                      {isLoading ? "..." : stat.value}
                    </p>
                    <div className="flex items-center mt-2">
                      {stat.trend === "up" ? (
                        <TrendingUp className="w-4 h-4 text-green-500 mr-1" />
                      ) : stat.trend === "down" ? (
                        <TrendingDown className="w-4 h-4 text-red-500 mr-1" />
                      ) : (
                        <div className="w-4 h-4 mr-1" />
                      )}
                      <span
                        className={`text-sm font-medium ${
                          stat.trend === "up"
                            ? "text-green-600"
                            : stat.trend === "down"
                            ? "text-red-600"
                            : "text-blue-600"
                        }`}
                      >
                        {stat.change}
                      </span>
                      {stat.trend !== "neutral" && (
                        <span className="text-sm text-gray-500 ml-1">
                          from last month
                        </span>
                      )}
                    </div>
                  </div>
                  <div
                    className={`p-3 rounded-full bg-${stat.color}-100 text-${stat.color}-600`}
                  >
                    <Icon className="w-6 h-6" />
                  </div>
                </div>
              </Card>
            </motion.div>
          );
        })}
      </div>

      {/* Quick Actions and Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <h2 className="text-xl font-semibold text-gray-900">
              Quick Actions
            </h2>
          </CardHeader>
          <CardBody>
            <div className="space-y-4">
              {quickActions.map((action, index) => {
                const Icon = action.icon;
                return (
                  <motion.div
                    key={action.title}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                  >
                    <Button
                      variant="outline"
                      className="w-full justify-start h-auto p-4"
                      icon={<Icon className="w-5 h-5" />}
                    >
                      <div className="text-left">
                        <div className="font-medium text-gray-900">
                          {action.title}
                        </div>
                        <div className="text-sm text-gray-600">
                          {action.description}
                        </div>
                      </div>
                    </Button>
                  </motion.div>
                );
              })}
            </div>
          </CardBody>
        </Card>

        {/* Recent Activity */}
        <Card>
          <CardHeader>
            <h2 className="text-xl font-semibold text-gray-900">
              Recent Activity
            </h2>
          </CardHeader>
          <CardBody>
            <div className="space-y-4">
              {recentActivities.map((activity, index) => {
                const Icon = getActivityIcon(activity.type);
                return (
                  <motion.div
                    key={activity.id}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="flex items-start space-x-3"
                  >
                    <div className="flex-shrink-0">
                      <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center">
                        <Icon className="w-4 h-4 text-gray-600" />
                      </div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-gray-900">
                        {activity.message}
                      </p>
                      <div className="flex items-center mt-1 space-x-2">
                        <span className="text-xs text-gray-500">
                          {activity.time}
                        </span>
                        <span
                          className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${getStatusColor(
                            activity.status
                          )}`}
                        >
                          {activity.status}
                        </span>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </CardBody>
        </Card>
      </div>
    </div>
  );
};

export default DashboardHomePage;
