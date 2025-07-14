import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  BarChart3,
  TrendingUp,
  TrendingDown,
  DollarSign,
  Package,
  Store,
  Users,
  Calendar,
  Clock,
  FileText,
  Download,
  RefreshCw,
  Eye,
  Filter,
  Search,
  PieChart,
  Activity,
  Target,
} from "lucide-react";
import { Link } from "react-router-dom";
import { Card, CardHeader, CardBody } from "../../components/ui/Card";
import Button from "../../components/ui/Button";
import Input from "../../components/ui/Input";

const ReportsOverviewPage = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [selectedPeriod, setSelectedPeriod] = useState("month");
  const [filters, setFilters] = useState({
    store: "",
    category: "",
    dateRange: "",
  });

  useEffect(() => {
    // Simulate loading data
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 1000);

    return () => clearTimeout(timer);
  }, []);

  const stats = {
    totalSales: 15250.0,
    totalOrders: 1247,
    activeStores: 24,
    avgOrderValue: 12.24,
    salesGrowth: 8.5,
    ordersGrowth: 12,
    storesGrowth: 2,
    avgOrderGrowth: -2.1,
  };

  const reportTypes = [
    {
      id: "daily",
      title: "Daily Reports",
      description:
        "View detailed daily sales reports with hourly breakdowns and performance metrics.",
      icon: Calendar,
      color: "blue",
      path: "/reports/daily",
      features: ["Hourly breakdowns", "Performance metrics", "Real-time data"],
    },
    {
      id: "weekly",
      title: "Weekly Reports",
      description:
        "Analyze weekly trends, compare performance, and identify growth patterns.",
      icon: BarChart3,
      color: "green",
      path: "/reports/weekly",
      features: ["Trend analysis", "Performance comparison", "Growth patterns"],
    },
    {
      id: "monthly",
      title: "Monthly Reports",
      description:
        "Comprehensive monthly analysis with revenue trends and business insights.",
      icon: PieChart,
      color: "purple",
      path: "/reports/monthly",
      features: [
        "Revenue trends",
        "Business insights",
        "Comprehensive analysis",
      ],
    },
    {
      id: "custom",
      title: "Custom Reports",
      description:
        "Create custom reports with specific date ranges and detailed analytics.",
      icon: FileText,
      color: "orange",
      path: "/reports/custom",
      features: ["Custom date ranges", "Detailed analytics", "Export options"],
    },
  ];

  const recentActivities = [
    {
      id: 1,
      type: "daily_report",
      title: "Daily Report Generated",
      description: "March 25, 2024 - 09:00 AM",
      amount: "€2,450.00",
      status: "completed",
      icon: Calendar,
    },
    {
      id: 2,
      type: "weekly_report",
      title: "Weekly Report Completed",
      description: "March 24, 2024 - 18:00 PM",
      amount: "€15,200.00",
      status: "completed",
      icon: BarChart3,
    },
    {
      id: 3,
      type: "monthly_report",
      title: "Monthly Report Ready",
      description: "March 23, 2024 - 23:59 PM",
      amount: "€45,800.00",
      status: "pending",
      icon: PieChart,
    },
    {
      id: 4,
      type: "export",
      title: "Report Exported",
      description: "March 22, 2024 - 14:30 PM",
      amount: "€12,300.00",
      status: "completed",
      icon: Download,
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

  const getGrowthIcon = (growth) => {
    return growth >= 0 ? TrendingUp : TrendingDown;
  };

  const getGrowthColor = (growth) => {
    return growth >= 0 ? "text-green-600" : "text-red-600";
  };

  const handlePeriodChange = (period) => {
    setSelectedPeriod(period);
    // Here you would typically fetch data for the new period
  };

  const handleExport = () => {
    console.log("Exporting reports...");
  };

  const handleRefresh = () => {
    setIsLoading(true);
    setTimeout(() => setIsLoading(false), 1000);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between"
      >
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Reports Overview</h1>
          <p className="text-gray-600">
            Comprehensive analytics and business insights
          </p>
        </div>
        <div className="flex items-center space-x-3">
          <Button
            variant="outline"
            icon={<Download className="w-4 h-4" />}
            onClick={handleExport}
          >
            Export All
          </Button>
          <Button
            variant="outline"
            icon={<RefreshCw className="w-4 h-4" />}
            onClick={handleRefresh}
          >
            Refresh
          </Button>
        </div>
      </motion.div>

      {/* Period Selector */}
      <Card>
        <CardBody>
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-900">
              Report Period
            </h2>
            <div className="flex space-x-2">
              {[
                { key: "week", label: "This Week" },
                { key: "month", label: "This Month" },
                { key: "quarter", label: "This Quarter" },
                { key: "year", label: "This Year" },
              ].map((period) => (
                <Button
                  key={period.key}
                  variant={
                    selectedPeriod === period.key ? "primary" : "outline"
                  }
                  size="sm"
                  onClick={() => handlePeriodChange(period.key)}
                >
                  {period.label}
                </Button>
              ))}
            </div>
          </div>
        </CardBody>
      </Card>

      {/* Summary Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Card>
            <div className="flex items-center">
              <div className="p-3 bg-blue-100 rounded-full">
                <DollarSign className="w-6 h-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Sales</p>
                <p className="text-2xl font-bold text-gray-900">
                  €{stats.totalSales.toLocaleString()}
                </p>
                <div className="flex items-center mt-1">
                  {React.createElement(getGrowthIcon(stats.salesGrowth), {
                    className: `w-4 h-4 mr-1 ${getGrowthColor(
                      stats.salesGrowth
                    )}`,
                  })}
                  <span
                    className={`text-sm font-medium ${getGrowthColor(
                      stats.salesGrowth
                    )}`}
                  >
                    {stats.salesGrowth > 0 ? "+" : ""}
                    {stats.salesGrowth}%
                  </span>
                  <span className="text-sm text-gray-500 ml-1">
                    from last month
                  </span>
                </div>
              </div>
            </div>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Card>
            <div className="flex items-center">
              <div className="p-3 bg-green-100 rounded-full">
                <Package className="w-6 h-6 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">
                  Total Orders
                </p>
                <p className="text-2xl font-bold text-gray-900">
                  {stats.totalOrders.toLocaleString()}
                </p>
                <div className="flex items-center mt-1">
                  {React.createElement(getGrowthIcon(stats.ordersGrowth), {
                    className: `w-4 h-4 mr-1 ${getGrowthColor(
                      stats.ordersGrowth
                    )}`,
                  })}
                  <span
                    className={`text-sm font-medium ${getGrowthColor(
                      stats.ordersGrowth
                    )}`}
                  >
                    {stats.ordersGrowth > 0 ? "+" : ""}
                    {stats.ordersGrowth}%
                  </span>
                  <span className="text-sm text-gray-500 ml-1">
                    from last month
                  </span>
                </div>
              </div>
            </div>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <Card>
            <div className="flex items-center">
              <div className="p-3 bg-purple-100 rounded-full">
                <Store className="w-6 h-6 text-purple-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">
                  Active Stores
                </p>
                <p className="text-2xl font-bold text-gray-900">
                  {stats.activeStores}
                </p>
                <div className="flex items-center mt-1">
                  {React.createElement(getGrowthIcon(stats.storesGrowth), {
                    className: `w-4 h-4 mr-1 ${getGrowthColor(
                      stats.storesGrowth
                    )}`,
                  })}
                  <span
                    className={`text-sm font-medium ${getGrowthColor(
                      stats.storesGrowth
                    )}`}
                  >
                    {stats.storesGrowth > 0 ? "+" : ""}
                    {stats.storesGrowth}
                  </span>
                  <span className="text-sm text-gray-500 ml-1">
                    new this month
                  </span>
                </div>
              </div>
            </div>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <Card>
            <div className="flex items-center">
              <div className="p-3 bg-orange-100 rounded-full">
                <Target className="w-6 h-6 text-orange-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">
                  Avg Order Value
                </p>
                <p className="text-2xl font-bold text-gray-900">
                  €{stats.avgOrderValue}
                </p>
                <div className="flex items-center mt-1">
                  {React.createElement(getGrowthIcon(stats.avgOrderGrowth), {
                    className: `w-4 h-4 mr-1 ${getGrowthColor(
                      stats.avgOrderGrowth
                    )}`,
                  })}
                  <span
                    className={`text-sm font-medium ${getGrowthColor(
                      stats.avgOrderGrowth
                    )}`}
                  >
                    {stats.avgOrderGrowth > 0 ? "+" : ""}
                    {stats.avgOrderGrowth}%
                  </span>
                  <span className="text-sm text-gray-500 ml-1">
                    from last month
                  </span>
                </div>
              </div>
            </div>
          </Card>
        </motion.div>
      </div>

      {/* Report Types */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {reportTypes.map((report, index) => {
          const Icon = report.icon;
          return (
            <motion.div
              key={report.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 + index * 0.1 }}
            >
              <Link to={report.path}>
                <Card className="h-full hover:shadow-lg transition-shadow cursor-pointer">
                  <CardBody>
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-lg font-medium text-gray-900">
                        {report.title}
                      </h3>
                      <div
                        className={`w-8 h-8 bg-${report.color}-100 rounded-lg flex items-center justify-center`}
                      >
                        <Icon className={`w-5 h-5 text-${report.color}-600`} />
                      </div>
                    </div>
                    <p className="text-gray-600 text-sm mb-4">
                      {report.description}
                    </p>
                    <div className="space-y-2">
                      {report.features.map((feature, featureIndex) => (
                        <div
                          key={featureIndex}
                          className="flex items-center text-sm text-gray-500"
                        >
                          <div className="w-1 h-1 bg-gray-400 rounded-full mr-2"></div>
                          {feature}
                        </div>
                      ))}
                    </div>
                    <div className="flex items-center text-blue-600 text-sm font-medium mt-4">
                      View Reports
                      <Eye className="w-4 h-4 ml-1" />
                    </div>
                  </CardBody>
                </Card>
              </Link>
            </motion.div>
          );
        })}
      </div>

      {/* Recent Activity */}
      <Card>
        <CardHeader>
          <h2 className="text-lg font-semibold text-gray-900">
            Recent Report Activity
          </h2>
        </CardHeader>
        <CardBody>
          <div className="space-y-4">
            {recentActivities.map((activity, index) => {
              const Icon = activity.icon;
              return (
                <motion.div
                  key={activity.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.6 + index * 0.1 }}
                  className="flex items-center justify-between"
                >
                  <div className="flex items-center">
                    <div
                      className={`w-2 h-2 rounded-full mr-3 ${
                        getStatusColor(activity.status).split(" ")[1]
                      }`}
                    ></div>
                    <Icon className="w-5 h-5 text-gray-400 mr-3" />
                    <div>
                      <p className="text-sm font-medium text-gray-900">
                        {activity.title}
                      </p>
                      <p className="text-xs text-gray-500">
                        {activity.description}
                      </p>
                    </div>
                  </div>
                  <span className="text-xs text-gray-500">
                    {activity.amount}
                  </span>
                </motion.div>
              );
            })}
          </div>
        </CardBody>
      </Card>
    </div>
  );
};

export default ReportsOverviewPage;
