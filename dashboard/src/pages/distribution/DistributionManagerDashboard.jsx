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
  Navigation,
  Timer,
  Coffee,
  ArrowRight,
  User,
} from "lucide-react";
import { Card, CardHeader, CardBody } from "../../components/ui/Card";
import EnhancedButton from "../../components/ui/EnhancedButton";
import LoadingSpinner from "../../components/ui/LoadingSpinner";
import DailyOperationsManager from "../../components/distribution/DailyOperationsManager";
import LiveDistributorTracking from "../../components/distribution/LiveDistributorTracking";
// Import the updated distribution service
import distributionService from "../../services/distributionService";

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

      // Use the updated distribution service
      const response = await distributionService.getDashboardData(selectedDate);

      if (response.success) {
        setDashboardData(response.data);
      } else {
        // Fallback to mock data
        setDashboardData(getMockDashboardData().data);
        toast.error("خطأ في تحميل البيانات - جاري استخدام بيانات تجريبية");
      }
    } catch (error) {
      console.error("Error loading dashboard data:", error);
      setError("خطأ في تحميل بيانات لوحة التحكم");
      // Fallback to mock data
      setDashboardData(getMockDashboardData().data);
    } finally {
      setIsLoading(false);
    }
  };

  const loadLiveData = async () => {
    // Update live data without showing loading
    try {
      const response = await distributionService.getLiveTracking(selectedDate);
      if (response.success && response.data) {
        setDashboardData((prev) => ({
          ...prev,
          liveTracking: response.data,
          distributors: response.data.distributors || prev.distributors,
        }));
      }
    } catch (error) {
      console.error("Error updating live data:", error);
    }
  };

  // Get mock data for fallback
  const getMockDashboardData = () => {
    return {
      success: true,
      data: {
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
          {
            id: 1,
            orderNumber: "ORD-001",
            store: "متجر الصباح",
            status: "pending",
            amount: 245.5,
          },
          {
            id: 2,
            orderNumber: "ORD-002",
            store: "مخبز النور",
            status: "delivered",
            amount: 180.25,
          },
          {
            id: 3,
            orderNumber: "ORD-003",
            store: "متجر السلام",
            status: "in_progress",
            amount: 320.0,
          },
        ],
        distributors: [
          {
            id: 1,
            name: "أحمد محمد",
            status: "active",
            orders: 12,
            location: "وسط البلد",
          },
          {
            id: 2,
            name: "سارة أحمد",
            status: "active",
            orders: 8,
            location: "الحمرا",
          },
          {
            id: 3,
            name: "محمد علي",
            status: "break",
            orders: 15,
            location: "الأشرفية",
          },
        ],
        notifications: [
          {
            id: 1,
            type: "warning",
            message: "تأخير في التسليم - الطلب #ORD-001",
            time: "10 دقائق",
          },
          {
            id: 2,
            type: "success",
            message: "تم تسليم الطلب #ORD-002 بنجاح",
            time: "15 دقيقة",
          },
          {
            id: 3,
            type: "info",
            message: "موزع جديد انضم للفريق",
            time: "30 دقيقة",
          },
        ],
      },
    };
  };

  // Helper function to parse JSON safely
  const parseJsonSafely = (response) => {
    if (typeof response === "string") {
      try {
        return JSON.parse(response);
      } catch (error) {
        console.warn("Failed to parse JSON response:", error);
        return null;
      }
    }
    return response;
  };

  // Quick action cards for main sections
  const QuickActionCard = ({
    title,
    description,
    icon: Icon,
    color,
    count,
    route,
    onClick,
  }) => (
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
              <p className="text-sm text-green-600 font-medium mt-1">
                {change}
              </p>
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
  ];

  // Quick actions removed - will be moved to separate pages

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

          {/* Overview - Simplified to show only distributors and basic stats */}
          {currentView === "overview" && (
            <div className="space-y-6">
              {/* Basic Statistics */}
              <div>
                <h2 className="text-xl font-bold text-gray-900 mb-4">
                  إحصائيات التوزيع العامة
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  <StatCard
                    title="إجمالي الطلبات"
                    value={dashboardData.statistics.totalOrders || 0}
                    change="+12%"
                    icon={Package}
                    color="blue"
                  />
                  <StatCard
                    title="الموزعين النشطين"
                    value={dashboardData.statistics.activeDistributors || 0}
                    change="+2"
                    icon={Users}
                    color="green"
                  />
                  <StatCard
                    title="التسليمات المكتملة"
                    value={dashboardData.statistics.completedDeliveries || 0}
                    change="+8%"
                    icon={CheckCircle}
                    color="purple"
                  />
                  <StatCard
                    title="إيرادات اليوم"
                    value={`€${dashboardData.statistics.todayRevenue || 0}`}
                    change="+15%"
                    icon={Euro}
                    color="orange"
                  />
                </div>
              </div>

              {/* Distributors List with their information */}
              <div>
                <h2 className="text-xl font-bold text-gray-900 mb-4">
                  الموزعين ومعلومات التوزيع
                </h2>
                <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
                  {dashboardData.distributors &&
                  dashboardData.distributors.length > 0 ? (
                    dashboardData.distributors.map((distributor) => (
                      <motion.div
                        key={distributor.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden"
                      >
                        <div className="p-6">
                          {/* Distributor Header */}
                          <div className="flex items-center justify-between mb-4">
                            <div className="flex items-center">
                              <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full flex items-center justify-center">
                                <User className="w-6 h-6 text-white" />
                              </div>
                              <div className="mr-3">
                                <h3 className="text-lg font-bold text-gray-900">
                                  {distributor.name}
                                </h3>
                                <p className="text-sm text-gray-600">
                                  {distributor.phone}
                                </p>
                              </div>
                            </div>
                            <div
                              className={`px-3 py-1 rounded-full text-xs font-medium ${
                                distributor.status === "active"
                                  ? "bg-green-100 text-green-800"
                                  : "bg-red-100 text-red-800"
                              }`}
                            >
                              {distributor.status === "active"
                                ? "نشط"
                                : "غير نشط"}
                            </div>
                          </div>

                          {/* Distributor Statistics */}
                          <div className="grid grid-cols-2 gap-4 mb-4">
                            <div className="text-center p-3 bg-blue-50 rounded-lg">
                              <div className="text-2xl font-bold text-blue-600">
                                {distributor.todayOrders || 0}
                              </div>
                              <div className="text-xs text-blue-700">
                                طلبات اليوم
                              </div>
                            </div>
                            <div className="text-center p-3 bg-green-50 rounded-lg">
                              <div className="text-2xl font-bold text-green-600">
                                {distributor.completedOrders || 0}
                              </div>
                              <div className="text-xs text-green-700">
                                مكتملة
                              </div>
                            </div>
                          </div>

                          {/* Current Location */}
                          {distributor.current_location && (
                            <div className="mb-4">
                              <div className="flex items-center text-sm text-gray-600 mb-1">
                                <MapPin className="w-4 h-4 ml-1" />
                                الموقع الحالي
                              </div>
                              <p className="text-sm text-gray-800">
                                {distributor.current_location.address ||
                                  "غير محدد"}
                              </p>
                            </div>
                          )}

                          {/* Current Route Progress */}
                          {distributor.current_route && (
                            <div className="mb-4">
                              <div className="flex items-center justify-between text-sm text-gray-600 mb-2">
                                <span>تقدم المسار</span>
                                <span>
                                  {distributor.current_route.completed_stops ||
                                    0}
                                  /{distributor.current_route.total_stops || 0}
                                </span>
                              </div>
                              <div className="w-full bg-gray-200 rounded-full h-2">
                                <div
                                  className="bg-blue-600 h-2 rounded-full"
                                  style={{
                                    width: `${
                                      distributor.current_route.total_stops > 0
                                        ? (distributor.current_route
                                            .completed_stops /
                                            distributor.current_route
                                              .total_stops) *
                                          100
                                        : 0
                                    }%`,
                                  }}
                                ></div>
                              </div>
                              {distributor.current_route.current_stop && (
                                <p className="text-xs text-gray-600 mt-1">
                                  المحطة الحالية:{" "}
                                  {distributor.current_route.current_stop}
                                </p>
                              )}
                            </div>
                          )}

                          {/* Revenue */}
                          <div className="border-t pt-3">
                            <div className="flex items-center justify-between">
                              <span className="text-sm text-gray-600">
                                إيرادات اليوم
                              </span>
                              <span className="text-lg font-bold text-green-600">
                                €{distributor.todayRevenue || 0}
                              </span>
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    ))
                  ) : (
                    <div className="col-span-full text-center py-12">
                      <Truck className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                      <p className="text-gray-500 text-lg">
                        لا توجد موزعين متاحين
                      </p>
                      <p className="text-gray-400 text-sm">
                        قم بإضافة موزعين من قسم إدارة المستخدمين
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Other Views */}
          {currentView === "dailyOps" && (
            <DailyOperationsManager selectedDate={selectedDate} />
          )}
          {currentView === "tracking" && (
            <LiveDistributorTracking selectedDate={selectedDate} />
          )}
        </motion.div>
      </div>
    </div>
  );
};

export default DistributionManagerDashboard;
