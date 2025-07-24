import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
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
  ArrowRight,
} from "lucide-react";
import { Card, CardHeader, CardBody } from "../../components/ui/Card";
import EnhancedButton from "../../components/ui/EnhancedButton";
import LoadingSpinner from "../../components/ui/LoadingSpinner";
import DailyOperationsManager from "../../components/distribution/DailyOperationsManager";
import LiveDistributorTracking from "../../components/distribution/LiveDistributorTracking";

/**
 * Distribution Manager Dashboard - Overview Page
 * Main dashboard with links to specialized pages
 */
const DistributionManagerDashboard = () => {
  const navigate = useNavigate();
  
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
  });

  // Load dashboard data
  useEffect(() => {
    loadDashboardData();

    // Set up real-time updates
    const interval = setInterval(loadLiveData, 30000); // Update every 30 seconds
    return () => clearInterval(interval);
  }, [selectedDate]);

  const loadDashboardData = async () => {
    try {
      setIsLoading(true);
      setError("");

      // Mock data for development - replace with actual API calls
      const mockData = {
        statistics: {
          totalOrders: 156,
          activeDistributors: 8,
          completedDeliveries: 124,
          pendingOrders: 32,
          todayRevenue: 8450.75,
          averageDeliveryTime: 42,
          customerSatisfaction: 4.2,
          onTimeDeliveryRate: 89,
        },
        dailyOrders: [
          { id: 1, orderNumber: "ORD-001", store: "متجر الصباح", status: "pending", amount: 245.50 },
          { id: 2, orderNumber: "ORD-002", store: "مخبز النور", status: "delivered", amount: 180.25 },
          { id: 3, orderNumber: "ORD-003", store: "متجر السلام", status: "in_progress", amount: 320.00 },
        ],
        distributors: [
          { id: 1, name: "أحمد محمد", status: "active", orders: 12, location: "وسط البلد" },
          { id: 2, name: "سارة أحمد", status: "active", orders: 8, location: "الحمرا" },
          { id: 3, name: "محمد علي", status: "break", orders: 15, location: "الأشرفية" },
        ],
        notifications: [
          { id: 1, type: "warning", message: "تأخير في التسليم - الطلب #ORD-001", time: "10 دقائق" },
          { id: 2, type: "success", message: "تم تسليم الطلب #ORD-002 بنجاح", time: "15 دقيقة" },
          { id: 3, type: "info", message: "موزع جديد انضم للفريق", time: "30 دقيقة" },
        ],
      };

      setDashboardData(mockData);
    } catch (error) {
      console.error("Error loading dashboard data:", error);
      setError("خطأ في تحميل بيانات لوحة التحكم");
    } finally {
      setIsLoading(false);
    }
  };

  const loadLiveData = async () => {
    // Update live data without showing loading
    try {
      // Mock live updates
      console.log("Refreshing live data...");
    } catch (error) {
      console.error("Error updating live data:", error);
    }
  };

  // Helper function to parse JSON safely
  const parseJsonSafely = (response) => {
    if (typeof response === 'string') {
      try {
        return JSON.parse(response);
      } catch (error) {
        console.warn('Failed to parse JSON response:', error);
        return null;
      }
    }
    return response;
  };

  // Quick action cards for main sections
  const QuickActionCard = ({ title, description, icon: Icon, color, count, route, onClick }) => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ scale: 1.02 }}
      className="bg-white rounded-xl shadow-lg border-0 overflow-hidden cursor-pointer hover:shadow-xl transition-all duration-300"
      onClick={onClick || (() => navigate(route))}
    >
      <div className={`bg-gradient-to-r ${getColorGradient(color)} p-6`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <div className="p-3 bg-white/20 rounded-lg ml-4">
              <Icon className="w-8 h-8 text-white" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-white">{title}</h3>
              <p className="text-white/80">{description}</p>
            </div>
          </div>
          <div className="text-right">
            {count && (
              <div className="text-3xl font-bold text-white mb-1">{count}</div>
            )}
            <ArrowRight className="w-6 h-6 text-white/60" />
          </div>
        </div>
      </div>
    </motion.div>
  );

  // Statistics cards
  const StatCard = ({ title, value, change, icon: Icon, color }) => (
    <Card className="border-0 shadow-lg">
      <CardBody className="p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-gray-600 text-sm font-medium">{title}</p>
            <p className="text-2xl font-bold text-gray-900 mt-1">{value}</p>
            {change && (
              <p className="text-sm text-green-600 font-medium mt-1">{change}</p>
            )}
          </div>
          <div className={`p-3 rounded-lg bg-${color}-100`}>
            <Icon className={`w-6 h-6 text-${color}-600`} />
          </div>
        </div>
      </CardBody>
    </Card>
  );

  // Helper functions
  const getColorGradient = (color) => {
    const gradients = {
      blue: "from-blue-600 to-blue-700",
      green: "from-green-600 to-green-700",
      purple: "from-purple-600 to-purple-700",
      orange: "from-orange-600 to-orange-700",
      red: "from-red-600 to-red-700",
      indigo: "from-indigo-600 to-indigo-700",
    };
    return gradients[color] || gradients.blue;
  };

  // Navigation items for main sections
  const navigationItems = [
    { key: "overview", label: "نظرة عامة", icon: BarChart3 },
    { key: "dailyOps", label: "العمليات اليومية", icon: Coffee },
    { key: "tracking", label: "التتبع المباشر", icon: Navigation },
    { key: "stores", label: "إدارة المحلات", icon: Store },
  ];

  // Quick actions for specialized pages
  const quickActions = [
    {
      title: "تقارير التوزيع",
      description: "تقارير شاملة وتحليلات",
      icon: FileText,
      color: "blue",
      count: "12",
      route: "/distribution/reports"
    },
    {
      title: "الخرائط والمسارات",
      description: "تتبع مباشر وتحسين المسارات",
      icon: Map,
      color: "green",
      count: "8",
      route: "/distribution/maps"
    },
    {
      title: "أرشيف العمليات",
      description: "أرشيف شامل للعمليات والتقارير",
      icon: Archive,
      color: "purple",
      count: "156",
      route: "/distribution/archive"
    }
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
                لوحة تحكم التوزيع
              </h1>
              <p className="text-gray-600 mt-1">
                إدارة شاملة لعمليات التوزيع والمتابعة المباشرة
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

          {/* Overview Content */}
          {currentView === "overview" && (
            <div className="space-y-6">
              {/* Quick Actions for Specialized Pages */}
              <div>
                <h2 className="text-xl font-bold text-gray-900 mb-4">الأقسام الرئيسية</h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {quickActions.map((action, index) => (
                    <QuickActionCard key={index} {...action} />
                  ))}
                </div>
              </div>

              {/* Statistics */}
              <div>
                <h2 className="text-xl font-bold text-gray-900 mb-4">إحصائيات اليوم</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  <StatCard
                    title="إجمالي الطلبات"
                    value={dashboardData.statistics.totalOrders}
                    change="+12%"
                    icon={Package}
                    color="blue"
                  />
                  <StatCard
                    title="الموزعين النشطين"
                    value={dashboardData.statistics.activeDistributors}
                    change="+2"
                    icon={Users}
                    color="green"
                  />
                  <StatCard
                    title="التسليمات المكتملة"
                    value={dashboardData.statistics.completedDeliveries}
                    change="+8%"
                    icon={CheckCircle}
                    color="purple"
                  />
                  <StatCard
                    title="إيرادات اليوم"
                    value={`€${dashboardData.statistics.todayRevenue}`}
                    change="+15%"
                    icon={Euro}
                    color="orange"
                  />
                </div>
              </div>

              {/* Recent Activity & Notifications */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card className="border-0 shadow-lg">
                  <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50 border-b border-blue-100">
                    <h3 className="text-lg font-bold text-gray-900 flex items-center">
                      <Activity className="w-5 h-5 text-blue-600 ml-2" />
                      الطلبات الحديثة
                    </h3>
                  </CardHeader>
                  <CardBody className="p-6">
                    <div className="space-y-4">
                      {dashboardData.dailyOrders.map((order) => (
                        <div key={order.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                          <div>
                            <p className="font-semibold text-gray-900">{order.orderNumber}</p>
                            <p className="text-sm text-gray-600">{order.store}</p>
                          </div>
                          <div className="text-right">
                            <p className="text-sm font-semibold text-green-600">€{order.amount}</p>
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                              order.status === 'delivered' ? 'bg-green-100 text-green-800' :
                              order.status === 'in_progress' ? 'bg-blue-100 text-blue-800' :
                              'bg-yellow-100 text-yellow-800'
                            }`}>
                              {order.status === 'delivered' ? 'مسلم' :
                               order.status === 'in_progress' ? 'قيد التنفيذ' : 'معلق'}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardBody>
                </Card>

                <Card className="border-0 shadow-lg">
                  <CardHeader className="bg-gradient-to-r from-green-50 to-emerald-50 border-b border-green-100">
                    <h3 className="text-lg font-bold text-gray-900 flex items-center">
                      <Bell className="w-5 h-5 text-green-600 ml-2" />
                      التنبيهات والإشعارات
                    </h3>
                  </CardHeader>
                  <CardBody className="p-6">
                    <div className="space-y-4">
                      {dashboardData.notifications.map((notification) => (
                        <div key={notification.id} className="flex items-start p-3 bg-gray-50 rounded-lg">
                          <div className={`p-1 rounded-full ml-3 ${
                            notification.type === 'warning' ? 'bg-yellow-100' :
                            notification.type === 'success' ? 'bg-green-100' : 'bg-blue-100'
                          }`}>
                            {notification.type === 'warning' ? 
                              <AlertTriangle className="w-4 h-4 text-yellow-600" /> :
                              notification.type === 'success' ?
                              <CheckCircle className="w-4 h-4 text-green-600" /> :
                              <Bell className="w-4 h-4 text-blue-600" />
                            }
                          </div>
                          <div className="flex-1">
                            <p className="text-sm text-gray-900">{notification.message}</p>
                            <p className="text-xs text-gray-500 mt-1">منذ {notification.time}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardBody>
                </Card>
              </div>
            </div>
          )}

          {/* Other Views */}
          {currentView === "dailyOps" && <DailyOperationsManager selectedDate={selectedDate} />}
          {currentView === "tracking" && <LiveDistributorTracking selectedDate={selectedDate} />}
          {currentView === "stores" && <StoreManagement selectedDate={selectedDate} />}
        </motion.div>
      </div>
    </div>
  );
};

export default DistributionManagerDashboard;
