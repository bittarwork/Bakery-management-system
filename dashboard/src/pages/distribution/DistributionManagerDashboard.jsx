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
  Fuel,
  Wrench,
  Phone,
  Mail,
} from "lucide-react";
import { Card, CardHeader, CardBody } from "../../components/ui/Card";
import EnhancedButton from "../../components/ui/EnhancedButton";
import LoadingSpinner from "../../components/ui/LoadingSpinner";
import distributionService from "../../services/distributionService";

/**
 * Distribution Manager Dashboard - Simplified Overview
 * Focused on distributor information and daily performance
 */
const DistributionManagerDashboard = () => {
  const navigate = useNavigate();

  // Main states
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedDate, setSelectedDate] = useState(
    new Date().toISOString().split("T")[0]
  );

  // Data states
  const [dashboardData, setDashboardData] = useState({
    distributors: [],
    statistics: {},
    notifications: [],
  });

  // Load dashboard data
  useEffect(() => {
    loadDashboardData();

    // Set up real-time updates
    const interval = setInterval(loadLiveData, 60000); // Update every minute
    return () => clearInterval(interval);
  }, [selectedDate]);

  const loadDashboardData = async () => {
    try {
      setIsLoading(true);
      setError("");

      const response = await distributionService.getDashboardData(selectedDate);

      if (response.success) {
        setDashboardData({
          distributors: response.data.distributors || [],
          statistics: response.data.statistics || {},
          notifications: response.data.notifications || [],
        });
      } else {
        setDashboardData(getMockDashboardData());
        toast.error("Error loading data - using mock data");
      }
    } catch (error) {
      console.error("Error loading dashboard data:", error);
      setError("Error loading dashboard data");
      setDashboardData(getMockDashboardData());
    } finally {
      setIsLoading(false);
    }
  };

  const loadLiveData = async () => {
    try {
      const response = await distributionService.getLiveTracking(selectedDate);
      if (response.success && response.data) {
        setDashboardData((prev) => ({
          ...prev,
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
      statistics: {
        totalOrders: 156,
        activeDistributors: 8,
        completedDeliveries: 124,
        pendingOrders: 32,
        todayRevenue: 8450.75,
        averageDeliveryTime: 42,
        onTimeDeliveryRate: 89,
      },
      distributors: [
        {
          id: 1,
          name: "أحمد محمود",
          phone: "+961 70 123 456",
          email: "ahmed@bakery.com",
          status: "active",
          current_location: {
            address: "بيروت - الحمرا",
            lat: 33.8938,
            lng: 35.5018,
            last_update: new Date().toISOString(),
          },
          current_route: {
            current_stop: "مخبزة النور",
            completed_stops: 12,
            total_stops: 18,
          },
          daily_expenses: {
            fuel: 45.5,
            maintenance: 12.0,
            other: 8.75,
          },
          daily_revenue: 1250.75,
          orders_delivered_today: 12,
          total_orders: 18,
          efficiency_score: 89,
        },
      ],
      notifications: [],
    };
  };

  const navigateToDistributorDetails = (distributorId) => {
    navigate(`/distribution/distributor/${distributorId}`, {
      state: { date: selectedDate },
    });
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "active":
        return "bg-green-100 text-green-800 border-green-200";
      case "completed":
        return "bg-blue-100 text-blue-800 border-blue-200";
      case "offline":
        return "bg-gray-100 text-gray-800 border-gray-200";
      default:
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case "active":
        return "نشط";
      case "completed":
        return "مكتمل";
      case "offline":
        return "غير متصل";
      default:
        return "غير محدد";
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <LoadingSpinner size="large" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="container mx-auto px-4 py-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex flex-col md:flex-row md:items-center md:justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                لوحة التوزيع
              </h1>
              <p className="text-gray-600">
                إدارة ومراقبة عمليات التوزيع اليومية
              </p>
            </div>

            <div className="flex items-center space-x-4 space-x-reverse mt-4 md:mt-0">
              <div className="flex items-center space-x-2 space-x-reverse">
                <Calendar className="w-5 h-5 text-gray-500" />
                <input
                  type="date"
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <EnhancedButton
                onClick={loadDashboardData}
                variant="outline"
                size="sm"
                className="flex items-center space-x-2 space-x-reverse"
              >
                <RefreshCw className="w-4 h-4" />
                <span>تحديث</span>
              </EnhancedButton>
            </div>
          </div>
        </motion.div>

        {/* Statistics Cards */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8"
        >
          <Card className="bg-white shadow-lg">
            <CardBody className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">إجمالي الطلبات</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {dashboardData.statistics.totalOrders || 0}
                  </p>
                </div>
                <Package className="w-8 h-8 text-blue-500" />
              </div>
            </CardBody>
          </Card>

          <Card className="bg-white shadow-lg">
            <CardBody className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">الموزعين النشطين</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {dashboardData.statistics.activeDistributors || 0}
                  </p>
                </div>
                <Users className="w-8 h-8 text-green-500" />
              </div>
            </CardBody>
          </Card>

          <Card className="bg-white shadow-lg">
            <CardBody className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">التسليمات المكتملة</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {dashboardData.statistics.completedDeliveries || 0}
                  </p>
                </div>
                <CheckCircle className="w-8 h-8 text-blue-500" />
              </div>
            </CardBody>
          </Card>

          <Card className="bg-white shadow-lg">
            <CardBody className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">إيرادات اليوم</p>
                  <p className="text-2xl font-bold text-gray-900">
                    €
                    {dashboardData.statistics.todayRevenue?.toFixed(2) ||
                      "0.00"}
                  </p>
                </div>
                <Euro className="w-8 h-8 text-yellow-500" />
              </div>
            </CardBody>
          </Card>
        </motion.div>

        {/* Distributors Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-900 flex items-center">
              <Truck className="w-6 h-6 mr-3" />
              الموزعين ومعلومات التوزيع
            </h2>

            <EnhancedButton
              onClick={() => navigate("/distribution/daily-operations")}
              variant="primary"
              className="flex items-center space-x-2 space-x-reverse"
            >
              <Coffee className="w-4 h-4" />
              <span>العمليات اليومية</span>
            </EnhancedButton>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {dashboardData.distributors &&
            dashboardData.distributors.length > 0 ? (
              dashboardData.distributors.map((distributor) => (
                <motion.div
                  key={distributor.id}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  whileHover={{ scale: 1.02 }}
                  className="bg-white rounded-lg shadow-lg p-6 border border-gray-200 hover:shadow-xl transition-all duration-300"
                >
                  {/* Distributor Header */}
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center space-x-3 space-x-reverse">
                      <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                        <User className="w-6 h-6 text-blue-600" />
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900">
                          {distributor.name}
                        </h3>
                        <span
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getStatusColor(
                            distributor.status
                          )}`}
                        >
                          {getStatusText(distributor.status)}
                        </span>
                      </div>
                    </div>

                    <EnhancedButton
                      onClick={() =>
                        navigateToDistributorDetails(distributor.id)
                      }
                      variant="outline"
                      size="sm"
                      className="flex items-center space-x-1 space-x-reverse"
                    >
                      <Eye className="w-4 h-4" />
                      <span>التفاصيل</span>
                    </EnhancedButton>
                  </div>

                  {/* Contact Information */}
                  <div className="mb-4 space-y-2">
                    <div className="flex items-center text-sm text-gray-600">
                      <Phone className="w-4 h-4 mr-2" />
                      <span>{distributor.phone || "غير محدد"}</span>
                    </div>
                    <div className="flex items-center text-sm text-gray-600">
                      <Mail className="w-4 h-4 mr-2" />
                      <span>{distributor.email || "غير محدد"}</span>
                    </div>
                  </div>

                  {/* Current Location */}
                  <div className="mb-4 p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-start space-x-2 space-x-reverse">
                      <MapPin className="w-4 h-4 text-red-500 mt-0.5" />
                      <div className="flex-1">
                        <p className="text-sm font-medium text-gray-900">
                          الموقع الحالي
                        </p>
                        <p className="text-sm text-gray-600">
                          {distributor.current_location?.address || "غير محدد"}
                        </p>
                        {distributor.current_route?.current_stop && (
                          <p className="text-xs text-blue-600 mt-1">
                            المحطة الحالية:{" "}
                            {distributor.current_route.current_stop}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Progress */}
                  <div className="mb-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm text-gray-600">
                        تقدم التوزيع
                      </span>
                      <span className="text-sm font-medium text-gray-900">
                        {distributor.current_route?.completed_stops || 0} /{" "}
                        {distributor.current_route?.total_stops || 0}
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-blue-500 h-2 rounded-full"
                        style={{
                          width: `${distributor.progress?.percentage || 0}%`,
                        }}
                      ></div>
                    </div>
                    <p className="text-xs text-gray-500 mt-1">
                      {distributor.progress?.percentage || 0}% مكتمل
                    </p>
                  </div>

                  {/* Daily Performance */}
                  <div className="grid grid-cols-2 gap-4 mb-4">
                    <div className="text-center p-2 bg-green-50 rounded-lg">
                      <p className="text-xs text-gray-600">طلبات اليوم</p>
                      <p className="text-lg font-bold text-green-700">
                        {distributor.orders_delivered_today || 0}
                      </p>
                    </div>
                    <div className="text-center p-2 bg-blue-50 rounded-lg">
                      <p className="text-xs text-gray-600">الكفاءة</p>
                      <p className="text-lg font-bold text-blue-700">
                        {distributor.efficiency_score || 0}%
                      </p>
                    </div>
                  </div>

                  {/* Daily Revenue & Expenses */}
                  <div className="border-t pt-4">
                    <div className="grid grid-cols-2 gap-4">
                      {/* Revenue */}
                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm text-gray-600 flex items-center">
                            <Euro className="w-4 h-4 mr-1" />
                            الإيرادات
                          </span>
                          <span className="text-lg font-bold text-green-600">
                            €{(distributor.daily_revenue || 0).toFixed(2)}
                          </span>
                        </div>
                      </div>

                      {/* Expenses */}
                      <div>
                        <div className="mb-2">
                          <span className="text-sm text-gray-600 flex items-center">
                            <DollarSign className="w-4 h-4 mr-1" />
                            المصاريف
                          </span>
                        </div>
                        {distributor.daily_expenses && (
                          <div className="space-y-1">
                            <div className="flex items-center justify-between text-xs">
                              <span className="flex items-center text-gray-500">
                                <Fuel className="w-3 h-3 mr-1" />
                                وقود
                              </span>
                              <span className="text-red-600">
                                €
                                {distributor.daily_expenses.fuel?.toFixed(2) ||
                                  "0.00"}
                              </span>
                            </div>
                            <div className="flex items-center justify-between text-xs">
                              <span className="flex items-center text-gray-500">
                                <Wrench className="w-3 h-3 mr-1" />
                                صيانة
                              </span>
                              <span className="text-red-600">
                                €
                                {distributor.daily_expenses.maintenance?.toFixed(
                                  2
                                ) || "0.00"}
                              </span>
                            </div>
                            <div className="flex items-center justify-between text-xs">
                              <span className="text-gray-500">أخرى</span>
                              <span className="text-red-600">
                                €
                                {distributor.daily_expenses.other?.toFixed(2) ||
                                  "0.00"}
                              </span>
                            </div>
                            <div className="border-t pt-1 mt-2">
                              <div className="flex items-center justify-between text-sm font-medium">
                                <span className="text-gray-700">المجموع</span>
                                <span className="text-red-700">
                                  €
                                  {(
                                    (distributor.daily_expenses.fuel || 0) +
                                    (distributor.daily_expenses.maintenance ||
                                      0) +
                                    (distributor.daily_expenses.other || 0)
                                  ).toFixed(2)}
                                </span>
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))
            ) : (
              <div className="col-span-full text-center py-12">
                <Truck className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500 text-lg">لا توجد موزعين متاحين</p>
                <p className="text-gray-400 text-sm">
                  قم بإضافة موزعين من قسم إدارة المستخدمين
                </p>
              </div>
            )}
          </div>
        </motion.div>

        {/* Quick Actions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="mt-8"
        >
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <EnhancedButton
              onClick={() => navigate("/distribution/live-tracking")}
              variant="outline"
              className="flex items-center justify-center space-x-2 space-x-reverse p-4"
            >
              <Navigation className="w-5 h-5" />
              <span>التتبع المباشر</span>
            </EnhancedButton>

            <EnhancedButton
              onClick={() => navigate("/reports")}
              variant="outline"
              className="flex items-center justify-center space-x-2 space-x-reverse p-4"
            >
              <BarChart3 className="w-5 h-5" />
              <span>التقارير</span>
            </EnhancedButton>

            <EnhancedButton
              onClick={() => navigate("/users?role=distributor")}
              variant="outline"
              className="flex items-center justify-center space-x-2 space-x-reverse p-4"
            >
              <UserPlus className="w-5 h-5" />
              <span>إدارة الموزعين</span>
            </EnhancedButton>

            <EnhancedButton
              onClick={() => navigate("/settings")}
              variant="outline"
              className="flex items-center justify-center space-x-2 space-x-reverse p-4"
            >
              <Settings className="w-5 h-5" />
              <span>الإعدادات</span>
            </EnhancedButton>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default DistributionManagerDashboard;
