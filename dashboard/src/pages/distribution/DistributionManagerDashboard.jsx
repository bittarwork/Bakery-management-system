import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "react-hot-toast";
import {
  Calendar,
  Clock,
  Truck,
  Package,
  Users,
  MapPin,
  BarChart3,
  Download,
  Filter,
  Search,
  RefreshCw,
  Bell,
  Eye,
  Edit,
  CheckCircle,
  AlertTriangle,
  Star,
  TrendingUp,
  FileText,
  Map,
  Settings,
  Plus,
  Archive,
  UserPlus,
  Euro,
  Activity,
  Target,
  ChevronRight,
  ChevronDown,
  Loader2,
  AlertCircle,
  Award,
  DollarSign,
  Store,
  Navigation,
  Timer,
  Coffee,
} from "lucide-react";
import { Card, CardHeader, CardBody } from "../../components/ui/Card";
import EnhancedButton from "../../components/ui/EnhancedButton";
import LoadingSpinner from "../../components/ui/LoadingSpinner";
import DailyOperationsManager from "../../components/distribution/DailyOperationsManager";
import LiveDistributorTracking from "../../components/distribution/LiveDistributorTracking";
import StoreManagement from "../../components/distribution/StoreManagement";
import ReportsSystem from "../../components/distribution/ReportsSystem";
import MapsSystem from "../../components/distribution/MapsSystem";
import ArchiveSystem from "../../components/distribution/ArchiveSystem";

/**
 * Distribution Manager Dashboard
 * Complete distribution management system for daily operations
 * From order receiving to weekly reporting
 */
const DistributionManagerDashboard = () => {
  // Main states
  const [currentView, setCurrentView] = useState("overview");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedDate, setSelectedDate] = useState(
    new Date().toISOString().split("T")[0]
  );

  // Data states
  const [dashboardData, setDashboardData] = useState({
    dailyOrders: [],
    distributors: [],
    stores: [],
    statistics: {},
    liveTracking: [],
    notifications: [],
    reports: [],
    routes: [],
  });

  // Filter states
  const [filters, setFilters] = useState({
    dateRange: "today",
    distributor: "",
    store: "",
    status: "",
    priority: "",
  });

  // Load dashboard data
  useEffect(() => {
    loadDashboardData();

    // Set up real-time updates
    const interval = setInterval(loadLiveData, 30000); // Update every 30 seconds
    return () => clearInterval(interval);
  }, [selectedDate, filters]);

  const loadDashboardData = async () => {
    try {
      setIsLoading(true);
      setError("");

      // Load all data in parallel
      const [
        ordersRes,
        distributorsRes,
        storesRes,
        statsRes,
        trackingRes,
        notificationsRes,
      ] = await Promise.all([
        fetch(`/api/distribution/daily-orders?date=${selectedDate}`),
        fetch("/api/distribution/distributors?status=active"),
        fetch("/api/stores?status=active"),
        fetch(`/api/distribution/statistics?date=${selectedDate}`),
        fetch("/api/distribution/live-tracking"),
        fetch("/api/distribution/notifications?unread=true"),
      ]);

      const [
        orders,
        distributors,
        stores,
        statistics,
        tracking,
        notifications,
      ] = await Promise.all([
        ordersRes.json(),
        distributorsRes.json(),
        storesRes.json(),
        statsRes.json(),
        trackingRes.json(),
        notificationsRes.json(),
      ]);

      setDashboardData({
        dailyOrders: orders.data || [],
        distributors: distributors.data || [],
        stores: stores.data || [],
        statistics: statistics.data || {},
        liveTracking: tracking.data || [],
        notifications: notifications.data || [],
        reports: [],
        routes: [],
      });
    } catch (error) {
      console.error("Error loading dashboard data:", error);
      setError("خطأ في تحميل بيانات لوحة التحكم");

      // Mock data for development
      setDashboardData({
        dailyOrders: [
          {
            id: 1,
            store_name: "متجر الصباح",
            total_amount: 85.5,
            items_count: 5,
            status: "pending",
            priority: "normal",
            scheduled_delivery: "09:00",
          },
          {
            id: 2,
            store_name: "مخبز النور",
            total_amount: 120.75,
            items_count: 8,
            status: "confirmed",
            priority: "high",
            scheduled_delivery: "08:30",
          },
        ],
        distributors: [
          {
            id: 1,
            name: "أحمد محمد",
            current_load: 8,
            max_capacity: 15,
            current_location: "المنطقة الشمالية",
            status: "active",
            completion_rate: 95.5,
          },
          {
            id: 2,
            name: "خالد السوري",
            current_load: 12,
            max_capacity: 18,
            current_location: "المنطقة الجنوبية",
            status: "active",
            completion_rate: 88.2,
          },
        ],
        stores: [
          {
            id: 1,
            name: "متجر الصباح",
            last_order: "2024-01-15",
            payment_status: "paid",
            avg_order_value: 75.25,
            total_orders: 156,
          },
        ],
        statistics: {
          total_orders: 45,
          completed_orders: 38,
          pending_orders: 7,
          total_revenue: 2850.5,
          active_distributors: 3,
          delivery_completion_rate: 84.4,
        },
        liveTracking: [],
        notifications: [
          {
            id: 1,
            type: "delay",
            message: "الموزع أحمد محمد متأخر عن الموعد المحدد",
            store: "متجر الصباح",
            time: "10:30",
          },
        ],
      });
    } finally {
      setIsLoading(false);
    }
  };

  const loadLiveData = async () => {
    try {
      const trackingRes = await fetch("/api/distribution/live-tracking");
      const notificationsRes = await fetch(
        "/api/distribution/notifications?unread=true"
      );

      const [tracking, notifications] = await Promise.all([
        trackingRes.json(),
        notificationsRes.json(),
      ]);

      setDashboardData((prev) => ({
        ...prev,
        liveTracking: tracking.data || [],
        notifications: notifications.data || [],
      }));
    } catch (error) {
      console.warn("Error updating live data:", error);
    }
  };

  // Main view components
  const DashboardOverview = () => (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Statistics Cards */}
      <div className="lg:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-4">
        <StatCard
          title="إجمالي الطلبات اليوم"
          value={dashboardData.statistics.total_orders || 0}
          change="+12%"
          changeType="positive"
          icon={Package}
          color="blue"
        />
        <StatCard
          title="الطلبات المكتملة"
          value={dashboardData.statistics.completed_orders || 0}
          change="+5%"
          changeType="positive"
          icon={CheckCircle}
          color="green"
        />
        <StatCard
          title="إجمالي الإيرادات"
          value={`€${parseFloat(
            dashboardData.statistics.total_revenue || 0
          ).toFixed(2)}`}
          change="+8%"
          changeType="positive"
          icon={Euro}
          color="purple"
        />
        <StatCard
          title="معدل إكمال التوصيل"
          value={`${parseFloat(
            dashboardData.statistics.delivery_completion_rate || 0
          ).toFixed(1)}%`}
          change="-2%"
          changeType="negative"
          icon={Target}
          color="orange"
        />
      </div>

      {/* Live Notifications */}
      <Card className="border-0 shadow-lg">
        <CardHeader className="bg-gradient-to-r from-red-50 to-orange-50 border-b border-red-100">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-bold text-gray-900 flex items-center">
              <Bell className="w-5 h-5 text-red-600 ml-2" />
              إشعارات مهمة
            </h3>
            <span className="bg-red-100 text-red-600 px-2 py-1 rounded-full text-xs font-medium">
              {dashboardData.notifications.length}
            </span>
          </div>
        </CardHeader>
        <CardBody className="p-4 max-h-80 overflow-y-auto">
          {dashboardData.notifications.length > 0 ? (
            <div className="space-y-3">
              {dashboardData.notifications.map((notification) => (
                <div
                  key={notification.id}
                  className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg"
                >
                  <div className="flex items-start">
                    <AlertTriangle className="w-4 h-4 text-yellow-600 mt-0.5 ml-2 flex-shrink-0" />
                    <div className="flex-1">
                      <p className="text-sm text-gray-800 font-medium">
                        {notification.message}
                      </p>
                      <p className="text-xs text-gray-500 mt-1">
                        {notification.store} - {notification.time}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              <Bell className="w-8 h-8 mx-auto mb-2 text-gray-300" />
              <p>لا توجد إشعارات جديدة</p>
            </div>
          )}
        </CardBody>
      </Card>
    </div>
  );

  const DailyOperations = () => (
    <DailyOperationsManager
      selectedDate={selectedDate}
      onDateChange={setSelectedDate}
    />
  );

  const LiveTracking = () => (
    <LiveDistributorTracking selectedDate={selectedDate} />
  );

  // Helper components
  const StatCard = ({
    title,
    value,
    change,
    changeType,
    icon: Icon,
    color,
  }) => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-xl border-0 shadow-lg overflow-hidden"
    >
      <div className={`bg-gradient-to-r ${getColorGradient(color)} p-4`}>
        <div className="flex items-center justify-between">
          <div>
            <p className="text-white/80 text-sm font-medium">{title}</p>
            <p className="text-white text-2xl font-bold mt-1">{value}</p>
          </div>
          <div className="p-3 bg-white/20 rounded-lg">
            <Icon className="w-6 h-6 text-white" />
          </div>
        </div>
        <div className="flex items-center mt-3">
          <span
            className={`text-xs font-medium px-2 py-1 rounded-full ${
              changeType === "positive"
                ? "bg-green-100 text-green-800"
                : "bg-red-100 text-red-800"
            }`}
          >
            {change}
          </span>
          <span className="text-white/80 text-xs mr-2">من الأمس</span>
        </div>
      </div>
    </motion.div>
  );

  const OrderCard = ({ order }) => (
    <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
      <div className="flex items-center justify-between">
        <div>
          <h5 className="font-semibold text-gray-900">{order.store_name}</h5>
          <p className="text-sm text-gray-600">
            {order.items_count} منتج - €
            {parseFloat(order.total_amount).toFixed(2)}
          </p>
          <p className="text-xs text-gray-500 mt-1">
            موعد التوصيل: {order.scheduled_delivery}
          </p>
        </div>
        <div className="text-left">
          <span
            className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(
              order.status
            )}`}
          >
            {getStatusText(order.status)}
          </span>
          <span
            className={`block mt-1 px-2 py-1 rounded-full text-xs font-medium ${getPriorityColor(
              order.priority
            )}`}
          >
            {getPriorityText(order.priority)}
          </span>
        </div>
      </div>
    </div>
  );

  const DistributorCard = ({ distributor }) => (
    <div className="bg-white rounded-lg border border-gray-200 p-4">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center">
          <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center ml-3">
            <User className="w-5 h-5 text-blue-600" />
          </div>
          <div>
            <h5 className="font-semibold text-gray-900">{distributor.name}</h5>
            <p className="text-sm text-gray-600">
              {distributor.current_location}
            </p>
          </div>
        </div>
        <span
          className={`px-2 py-1 rounded-full text-xs font-medium ${
            distributor.status === "active"
              ? "bg-green-100 text-green-800"
              : "bg-gray-100 text-gray-800"
          }`}
        >
          {distributor.status === "active" ? "نشط" : "غير نشط"}
        </span>
      </div>

      <div className="space-y-2">
        <div className="flex justify-between text-sm">
          <span className="text-gray-600">الحمولة الحالية:</span>
          <span className="font-medium">
            {distributor.current_load}/{distributor.max_capacity}
          </span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div
            className="bg-blue-600 h-2 rounded-full"
            style={{
              width: `${
                (distributor.current_load / distributor.max_capacity) * 100
              }%`,
            }}
          />
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-gray-600">معدل الإكمال:</span>
          <span className="font-medium text-green-600">
            {distributor.completion_rate}%
          </span>
        </div>
      </div>

      <div className="flex gap-2 mt-4">
        <EnhancedButton size="sm" variant="primary" className="flex-1">
          تتبع مباشر
        </EnhancedButton>
        <EnhancedButton size="sm" variant="secondary" className="flex-1">
          إرسال رسالة
        </EnhancedButton>
      </div>
    </div>
  );

  const SuggestionCard = ({ title, description, action, type }) => (
    <div
      className={`rounded-lg p-4 border-l-4 ${
        type === "warning"
          ? "bg-yellow-50 border-yellow-400"
          : "bg-blue-50 border-blue-400"
      }`}
    >
      <h5 className="font-semibold text-gray-900 mb-1">{title}</h5>
      <p className="text-sm text-gray-600 mb-3">{description}</p>
      <EnhancedButton
        size="sm"
        variant={type === "warning" ? "warning" : "primary"}
      >
        {action}
      </EnhancedButton>
    </div>
  );

  // Helper functions
  const getColorGradient = (color) => {
    const gradients = {
      blue: "from-blue-600 to-blue-700",
      green: "from-green-600 to-green-700",
      purple: "from-purple-600 to-purple-700",
      orange: "from-orange-600 to-orange-700",
    };
    return gradients[color] || gradients.blue;
  };

  const getStatusColor = (status) => {
    const colors = {
      pending: "bg-yellow-100 text-yellow-800",
      confirmed: "bg-blue-100 text-blue-800",
      in_progress: "bg-purple-100 text-purple-800",
      completed: "bg-green-100 text-green-800",
      cancelled: "bg-red-100 text-red-800",
    };
    return colors[status] || colors.pending;
  };

  const getStatusText = (status) => {
    const texts = {
      pending: "معلق",
      confirmed: "مؤكد",
      in_progress: "قيد التنفيذ",
      completed: "مكتمل",
      cancelled: "ملغي",
    };
    return texts[status] || "غير معروف";
  };

  const getPriorityColor = (priority) => {
    const colors = {
      low: "bg-gray-100 text-gray-800",
      normal: "bg-blue-100 text-blue-800",
      high: "bg-orange-100 text-orange-800",
      urgent: "bg-red-100 text-red-800",
    };
    return colors[priority] || colors.normal;
  };

  const getPriorityText = (priority) => {
    const texts = {
      low: "منخفض",
      normal: "عادي",
      high: "عالي",
      urgent: "عاجل",
    };
    return texts[priority] || "عادي";
  };

  // Navigation menu
  const navigationItems = [
    { key: "overview", label: "نظرة عامة", icon: BarChart3 },
    { key: "dailyOps", label: "العمليات اليومية", icon: Coffee },
    { key: "tracking", label: "التتبع المباشر", icon: Navigation },
    { key: "stores", label: "إدارة المحلات", icon: Store },
    { key: "reports", label: "التقارير", icon: FileText },
    { key: "maps", label: "الخرائط والمسارات", icon: Map },
    { key: "archive", label: "الأرشيف", icon: Archive },
  ];

  if (isLoading) {
    return (
      <LoadingSpinner fullScreen text="جاري تحميل لوحة التحكم..." size="lg" />
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white shadow-lg border-b border-gray-200"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between py-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 flex items-center">
                <Truck className="w-7 h-7 text-blue-600 ml-3" />
                إدارة التوزيع الشاملة
              </h1>
              <p className="text-gray-600 mt-1">
                نظام إدارة شامل لعمليات التوزيع اليومية والأسبوعية
              </p>
            </div>
            <div className="flex items-center gap-3">
              <div className="flex items-center bg-gray-100 rounded-lg p-1">
                <Clock className="w-4 h-4 text-gray-600 ml-2" />
                <span className="text-sm font-medium">
                  {new Date().toLocaleTimeString("ar-SA", {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </span>
              </div>
              <EnhancedButton
                onClick={loadDashboardData}
                variant="secondary"
                icon={<RefreshCw className="w-4 h-4" />}
              >
                تحديث
              </EnhancedButton>
            </div>
          </div>
        </div>
      </motion.div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Navigation Tabs */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white rounded-xl border-0 shadow-lg mb-6 overflow-hidden"
        >
          <div className="flex overflow-x-auto">
            {navigationItems.map((item) => (
              <button
                key={item.key}
                onClick={() => setCurrentView(item.key)}
                className={`flex items-center px-6 py-4 text-sm font-medium border-b-2 transition-all whitespace-nowrap ${
                  currentView === item.key
                    ? "text-blue-600 border-blue-600 bg-blue-50"
                    : "text-gray-600 border-transparent hover:text-blue-600 hover:bg-blue-50"
                }`}
              >
                <item.icon className="w-4 h-4 ml-2" />
                {item.label}
              </button>
            ))}
          </div>
        </motion.div>

        {/* Main Content */}
        <motion.div
          key={currentView}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.3 }}
        >
          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl">
              <div className="flex items-center">
                <AlertCircle className="w-5 h-5 text-red-600 ml-2" />
                <span className="text-red-800 font-medium">{error}</span>
              </div>
            </div>
          )}

          {currentView === "overview" && <DashboardOverview />}
          {currentView === "dailyOps" && <DailyOperations />}
          {currentView === "tracking" && <LiveTracking />}
          {currentView === "stores" && (
            <StoreManagement selectedDate={selectedDate} />
          )}
          {currentView === "reports" && (
            <ReportsSystem selectedDate={selectedDate} />
          )}
          {currentView === "maps" && (
            <MapsSystem selectedDate={selectedDate} />
          )}
          {currentView === "archive" && (
            <ArchiveSystem selectedDate={selectedDate} />
          )}
        </motion.div>
      </div>
    </div>
  );
};

export default DistributionManagerDashboard;
