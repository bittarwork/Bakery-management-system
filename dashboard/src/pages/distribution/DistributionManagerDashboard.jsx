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
 * Distribution Manager Dashboard - Real Data Display
 * Shows real distributors with their current locations and daily performance
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

    // Set up real-time updates every 2 minutes for live location tracking
    const interval = setInterval(loadLiveData, 120000);
    return () => clearInterval(interval);
  }, [selectedDate]);

  const loadDashboardData = async () => {
    try {
      setIsLoading(true);
      setError("");

      // Get real distributor data from the enhanced API
      const response = await distributionService.getActiveDistributors({
        include_location: true,
        include_performance: true,
      });

      if (response.success && response.data) {
        setDashboardData({
          distributors: response.data.distributors || [],
          statistics: response.data.statistics || {},
          notifications: response.data.notifications || [],
        });
      } else {
        // Fallback to try getting users with distributor role
        const usersResponse = await fetch(
          "/api/users?role=distributor&status=active"
        );
        if (usersResponse.ok) {
          const userData = await usersResponse.json();
          const distributors = userData.data?.users || [];

          // Transform user data to distributor format
          const transformedDistributors = distributors.map((user) => ({
            id: user.id,
            name: user.full_name,
            phone: user.phone,
            email: user.email,
            status: user.status,
            current_location: user.current_location || {
              address: "الموقع غير محدد",
              lat: 33.8938,
              lng: 35.5018,
              last_update: new Date().toISOString(),
            },
            vehicle_info: user.vehicle_info || {
              type: "شاحنة توزيع",
              plate_number: `ABC-${user.id}`,
              model: "Ford Transit",
            },
            current_route: {
              current_stop: "في انتظار التعيين",
              completed_stops: 0,
              total_stops: 0,
            },
            progress: {
              completed: 0,
              total: 0,
              percentage: 0,
            },
            orders_delivered_today: 0,
            efficiency_score: 0,
            daily_revenue: 0,
            daily_expenses: {
              fuel: 0,
              maintenance: 0,
              other: 0,
            },
            work_status: user.work_status || "offline",
            location_updated_at: user.location_updated_at,
            daily_performance: user.daily_performance,
          }));

          setDashboardData({
            distributors: transformedDistributors,
            statistics: {
              total_distributors: transformedDistributors.length,
              active_distributors: transformedDistributors.filter(
                (d) => d.status === "active"
              ).length,
              total_orders: 0,
              completed_orders: 0,
            },
            notifications: [],
          });
        } else {
          throw new Error("Failed to load distributor data");
        }
      }
    } catch (error) {
      console.error("Error loading dashboard data:", error);
      setError("حدث خطأ في تحميل البيانات");
      toast.error("خطأ في تحميل بيانات الموزعين");

      // Set empty state
      setDashboardData({
        distributors: [],
        statistics: {},
        notifications: [],
      });
    } finally {
      setIsLoading(false);
    }
  };

  const loadLiveData = async () => {
    try {
      // Refresh live tracking data without loading state
      const response = await distributionService.getLiveTracking(selectedDate);

      if (response.success && response.data) {
        setDashboardData((prev) => ({
          ...prev,
          distributors: response.data.distributors || prev.distributors,
        }));
      }
    } catch (error) {
      console.warn("Failed to refresh live data:", error);
    }
  };

  const handleDistributorClick = (distributorId) => {
    navigate(`/distribution/distributor/${distributorId}`);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "active":
        return "text-green-600 bg-green-100";
      case "busy":
        return "text-yellow-600 bg-yellow-100";
      case "offline":
        return "text-gray-600 bg-gray-100";
      case "break":
        return "text-blue-600 bg-blue-100";
      default:
        return "text-gray-600 bg-gray-100";
    }
  };

  const getWorkStatusText = (status) => {
    switch (status) {
      case "active":
        return "نشط";
      case "busy":
        return "مشغول";
      case "offline":
        return "غير متصل";
      case "break":
        return "استراحة";
      default:
        return "غير محدد";
    }
  };

  const isLocationFresh = (locationUpdatedAt) => {
    if (!locationUpdatedAt) return false;
    const updateTime = new Date(locationUpdatedAt);
    const now = new Date();
    const diffMinutes = (now - updateTime) / (1000 * 60);
    return diffMinutes <= 15; // Fresh if updated within 15 minutes
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

        {/* Distributors Section - Real Data Display */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-3 space-x-reverse">
              <Truck className="w-6 h-6 text-blue-600" />
              <h2 className="text-xl font-semibold text-gray-900">
                الموزعين النشطين
              </h2>
              <span className="bg-blue-100 text-blue-800 text-xs font-medium px-2.5 py-0.5 rounded-full">
                {dashboardData.distributors.length}
              </span>
            </div>

            <div className="flex items-center space-x-2 space-x-reverse text-sm text-gray-500">
              <div className="flex items-center space-x-1 space-x-reverse">
                <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                <span>موقع حديث</span>
              </div>
              <div className="flex items-center space-x-1 space-x-reverse">
                <div className="w-2 h-2 bg-gray-400 rounded-full"></div>
                <span>موقع قديم</span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {dashboardData.distributors.length > 0 ? (
              dashboardData.distributors.map((distributor) => (
                <motion.div
                  key={distributor.id}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  whileHover={{ scale: 1.02 }}
                  className="bg-white rounded-xl shadow-lg border border-gray-200 p-6 hover:shadow-xl transition-all duration-300 cursor-pointer"
                  onClick={() => handleDistributorClick(distributor.id)}
                >
                  {/* Header with name and status */}
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center space-x-3 space-x-reverse">
                      <div className="relative">
                        <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                          <User className="w-6 h-6 text-white" />
                        </div>
                        {/* Work status indicator */}
                        <div
                          className={`absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 border-white ${
                            distributor.work_status === "active"
                              ? "bg-green-500"
                              : distributor.work_status === "busy"
                              ? "bg-yellow-500"
                              : distributor.work_status === "break"
                              ? "bg-blue-500"
                              : "bg-gray-500"
                          }`}
                        ></div>
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-900">
                          {distributor.name}
                        </h3>
                        <div className="flex items-center space-x-2 space-x-reverse">
                          <Phone className="w-3 h-3 text-gray-400" />
                          <p className="text-sm text-gray-500">
                            {distributor.phone}
                          </p>
                        </div>
                      </div>
                    </div>
                    <span
                      className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(
                        distributor.work_status
                      )}`}
                    >
                      {getWorkStatusText(distributor.work_status)}
                    </span>
                  </div>

                  {/* Vehicle Information */}
                  {distributor.vehicle_info && (
                    <div className="mb-4 p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center space-x-2 space-x-reverse mb-2">
                        <Truck className="w-4 h-4 text-gray-600" />
                        <span className="text-sm font-medium text-gray-700">
                          المركبة
                        </span>
                      </div>
                      <div className="text-sm text-gray-600 space-y-1">
                        <div>
                          النوع: {distributor.vehicle_info.type || "غير محدد"}
                        </div>
                        <div>
                          رقم اللوحة:{" "}
                          {distributor.vehicle_info.plate_number || "غير محدد"}
                        </div>
                        <div>
                          الموديل:{" "}
                          {distributor.vehicle_info.model || "غير محدد"}
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Current Location */}
                  <div className="mb-4">
                    <div className="flex items-center space-x-2 space-x-reverse mb-2">
                      <div className="flex items-center space-x-1 space-x-reverse">
                        <MapPin className="w-4 h-4 text-gray-600" />
                        <span className="text-sm font-medium text-gray-700">
                          الموقع الحالي
                        </span>
                        {/* Location freshness indicator */}
                        <div
                          className={`w-2 h-2 rounded-full ${
                            isLocationFresh(distributor.location_updated_at)
                              ? "bg-green-400"
                              : "bg-gray-400"
                          }`}
                        ></div>
                      </div>
                    </div>
                    <p className="text-sm text-gray-600">
                      {distributor.current_location?.address ||
                        "الموقع غير محدد"}
                    </p>
                    {distributor.location_updated_at && (
                      <p className="text-xs text-gray-400 mt-1">
                        آخر تحديث:{" "}
                        {new Date(
                          distributor.location_updated_at
                        ).toLocaleDateString("ar-SA", {
                          year: "numeric",
                          month: "short",
                          day: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </p>
                    )}
                    {distributor.current_route?.current_stop && (
                      <p className="text-xs text-blue-600 mt-1">
                        المحطة الحالية: {distributor.current_route.current_stop}
                      </p>
                    )}
                  </div>

                  {/* Progress Bar */}
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
                        className="bg-blue-500 h-2 rounded-full transition-all duration-300"
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

                  {/* Daily Revenue & Expenses - Enhanced Display */}
                  <div className="border-t pt-4">
                    <div className="grid grid-cols-2 gap-4">
                      {/* Revenue */}
                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm text-gray-600 flex items-center">
                            <Euro className="w-4 h-4 mr-1 text-green-600" />
                            الإيرادات
                          </span>
                          <span className="text-lg font-bold text-green-600">
                            €{(distributor.daily_revenue || 0).toFixed(2)}
                          </span>
                        </div>
                      </div>

                      {/* Expenses - Detailed Breakdown */}
                      <div>
                        <div className="mb-2">
                          <span className="text-sm text-gray-600 flex items-center">
                            <DollarSign className="w-4 h-4 mr-1 text-red-600" />
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
                                {(distributor.daily_expenses.fuel || 0).toFixed(
                                  2
                                )}
                              </span>
                            </div>
                            <div className="flex items-center justify-between text-xs">
                              <span className="flex items-center text-gray-500">
                                <Wrench className="w-3 h-3 mr-1" />
                                صيانة
                              </span>
                              <span className="text-red-600">
                                €
                                {(
                                  distributor.daily_expenses.maintenance || 0
                                ).toFixed(2)}
                              </span>
                            </div>
                            <div className="flex items-center justify-between text-xs">
                              <span className="text-gray-500">أخرى</span>
                              <span className="text-red-600">
                                €
                                {(
                                  distributor.daily_expenses.other || 0
                                ).toFixed(2)}
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
                              {/* Net profit */}
                              <div className="flex items-center justify-between text-sm font-bold mt-1 pt-1 border-t">
                                <span className="text-gray-800">
                                  صافي الربح
                                </span>
                                <span
                                  className={`${
                                    (distributor.daily_revenue || 0) -
                                      ((distributor.daily_expenses?.fuel || 0) +
                                        (distributor.daily_expenses
                                          ?.maintenance || 0) +
                                        (distributor.daily_expenses?.other ||
                                          0)) >=
                                    0
                                      ? "text-green-700"
                                      : "text-red-700"
                                  }`}
                                >
                                  €
                                  {(
                                    (distributor.daily_revenue || 0) -
                                    ((distributor.daily_expenses?.fuel || 0) +
                                      (distributor.daily_expenses
                                        ?.maintenance || 0) +
                                      (distributor.daily_expenses?.other || 0))
                                  ).toFixed(2)}
                                </span>
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Action Button */}
                  <div className="mt-4">
                    <EnhancedButton
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDistributorClick(distributor.id);
                      }}
                      variant="outline"
                      size="sm"
                      className="w-full flex items-center justify-center space-x-2 space-x-reverse hover:bg-blue-50"
                    >
                      <Eye className="w-4 h-4" />
                      <span>عرض التفاصيل</span>
                      <ChevronRight className="w-4 h-4" />
                    </EnhancedButton>
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
                <EnhancedButton
                  onClick={() => navigate("/users")}
                  variant="outline"
                  className="mt-4"
                >
                  <UserPlus className="w-4 h-4 mr-2" />
                  إضافة موزع جديد
                </EnhancedButton>
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default DistributionManagerDashboard;
