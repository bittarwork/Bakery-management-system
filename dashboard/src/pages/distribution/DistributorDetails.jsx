import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import { toast } from "react-hot-toast";
import {
  formatDateShort,
  formatDateTimeArabic,
} from "../../utils/dateFormatter";
import {
  ArrowLeft,
  User,
  Phone,
  Mail,
  MapPin,
  Package,
  CheckCircle,
  Clock,
  Euro,
  DollarSign,
  Fuel,
  Wrench,
  Target,
  TrendingUp,
  Calendar,
  Truck,
  Navigation,
  Star,
  Activity,
  BarChart3,
  FileText,
  Eye,
  Edit,
  RefreshCw,
  AlertCircle,
  Coffee,
  Store,
  Timer,
  Award,
  MapIcon,
  Route,
  History,
  Battery,
} from "lucide-react";
import { Card, CardHeader, CardBody } from "../../components/ui/Card";
import EnhancedButton from "../../components/ui/EnhancedButton";
import LoadingSpinner from "../../components/ui/LoadingSpinner";
import distributionService from "../../services/distributionService";

/**
 * Distributor Details Page - Real Data Display
 * Shows comprehensive distributor information including daily performance, vehicle info, and real-time location
 */
const DistributorDetails = () => {
  const { id: distributorId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();

  // Get date from state or use today
  const selectedDate =
    location.state?.date || new Date().toISOString().split("T")[0];

  // Main states
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [distributorData, setDistributorData] = useState(null);
  const [dailyPerformance, setDailyPerformance] = useState(null);
  const [orderHistory, setOrderHistory] = useState([]);
  const [locationHistory, setLocationHistory] = useState([]);
  const [activeTab, setActiveTab] = useState("overview");

  // Load distributor data
  useEffect(() => {
    loadDistributorData();
  }, [distributorId, selectedDate]);

  const loadDistributorData = async () => {
    try {
      setIsLoading(true);
      setError("");

      // Check if distributorId is available
      if (!distributorId) {
        setError("معرف الموزع غير محدد");
        toast.error("معرف الموزع غير محدد");
        setIsLoading(false);
        return;
      }

      // Try to get real distributor data from enhanced API
      const distributorResponse =
        await distributionService.getDistributorDetails(
          distributorId,
          selectedDate
        );

      if (distributorResponse.success && distributorResponse.data) {
        setDistributorData(distributorResponse.data.distributor);
        setDailyPerformance(distributorResponse.data.daily_performance);
        setOrderHistory(distributorResponse.data.orders || []);
        setLocationHistory(distributorResponse.data.location_history || []);
      } else {
        console.log(
          "Using fallback data due to API error or insufficient permissions"
        );
        // Fallback: Try to get user data
        const userResponse = await fetch(`/api/users/${distributorId}`);
        if (userResponse.ok) {
          const userData = await userResponse.json();
          const user = userData.data;

          // Transform user data to distributor format
          const transformedData = {
            id: user.id,
            name: user.full_name,
            phone: user.phone,
            email: user.email,
            status: user.status || "active",
            work_status: user.work_status || "offline",
            current_location: user.current_location || {
              address: "الموقع غير محدد",
              lat: 33.8938,
              lng: 35.5018,
              last_update: new Date().toISOString(),
            },
            location_updated_at: user.location_updated_at,
            vehicle_info: user.vehicle_info || {
              type: "شاحنة توزيع",
              plate_number: `ABC-${user.id}`,
              model: "Ford Transit",
              year: "2020",
              color: "أبيض",
            },
            daily_performance: user.daily_performance || {
              work_started_at: null,
              work_ended_at: null,
              total_work_hours: 0,
              total_orders_assigned: 0,
              total_orders_delivered: 0,
              total_distance_km: 0,
              efficiency_score: 0,
            },
            daily_revenue: 0,
            daily_expenses: {
              fuel: 0,
              maintenance: 0,
              other: 0,
            },
            orders_delivered_today: 0,
            current_route: {
              current_stop: "في انتظار التعيين",
              completed_stops: 0,
              total_stops: 0,
            },
          };

          setDistributorData(transformedData);

          // Try to get today's orders for this distributor
          const ordersResponse = await fetch(
            `/api/orders?distributor_id=${distributorId}&date=${selectedDate}`
          );
          if (ordersResponse.ok) {
            const ordersData = await ordersResponse.json();
            setOrderHistory(ordersData.data?.orders || []);
          }
        } else {
          throw new Error("Failed to load distributor data");
        }
      }
    } catch (error) {
      console.error("Error loading distributor data:", error);
      setError("حدث خطأ في تحميل بيانات الموزع");
      toast.error("خطأ في تحميل بيانات الموزع");

      // Try to use mock data as fallback
      try {
        const mockData = distributionService.getMockDistributorDetails(
          distributorId,
          selectedDate
        );
        if (mockData.success && mockData.data) {
          setDistributorData(mockData.data.distributor);
          setDailyPerformance(mockData.data.daily_performance);
          setOrderHistory(mockData.data.orders || []);
          setLocationHistory(mockData.data.location_history || []);
          setError(""); // Clear error if mock data loaded successfully
        } else {
          throw new Error("Mock data not available");
        }
      } catch (mockError) {
        // Create basic empty state
        setDistributorData({
          id: parseInt(distributorId),
          name: `موزع ${distributorId}`,
          phone: "غير محدد",
          email: "غير محدد",
          status: "active",
          work_status: "offline",
          current_location: {
            address: "الموقع غير محدد",
            lat: 33.8938,
            lng: 35.5018,
            last_update: new Date().toISOString(),
          },
          vehicle_info: {
            type: "شاحنة توزيع",
            plate_number: "غير محدد",
            model: "غير محدد",
          },
          daily_revenue: 0,
          daily_expenses: { fuel: 0, maintenance: 0, other: 0 },
          efficiency_score: 0,
          orders_delivered_today: 0,
        });
      }
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "active":
        return "bg-green-100 text-green-800 border-green-200";
      case "busy":
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "offline":
        return "bg-gray-100 text-gray-800 border-gray-200";
      case "break":
        return "bg-blue-100 text-blue-800 border-blue-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const getStatusText = (status) => {
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

  const getOrderStatusColor = (status) => {
    switch (status) {
      case "delivered":
        return "bg-green-100 text-green-800";
      case "pending":
        return "bg-yellow-100 text-yellow-800";
      case "in_progress":
        return "bg-blue-100 text-blue-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getOrderStatusText = (status) => {
    switch (status) {
      case "delivered":
        return "تم التسليم";
      case "pending":
        return "في الانتظار";
      case "in_progress":
        return "قيد التنفيذ";
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

  if (!distributorData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            خطأ في تحميل البيانات
          </h2>
          <p className="text-gray-600 mb-4">لم يتم العثور على بيانات الموزع</p>
          <EnhancedButton
            onClick={() => navigate("/distribution")}
            variant="primary"
          >
            العودة للوحة التوزيع
          </EnhancedButton>
        </div>
      </div>
    );
  }

  const totalExpenses =
    (distributorData.daily_expenses?.fuel || 0) +
    (distributorData.daily_expenses?.maintenance || 0) +
    (distributorData.daily_expenses?.other || 0);

  const netProfit = distributorData.daily_revenue - totalExpenses;

  const tabs = [
    { key: "overview", label: "نظرة عامة", icon: BarChart3 },
    { key: "orders", label: "الطلبات", icon: Package },
    { key: "expenses", label: "المصاريف", icon: DollarSign },
    { key: "performance", label: "الأداء", icon: TrendingUp },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="container mx-auto px-4 py-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4 space-x-reverse">
              <EnhancedButton
                onClick={() => navigate("/distribution")}
                variant="outline"
                size="sm"
                className="flex items-center space-x-2 space-x-reverse"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>العودة</span>
              </EnhancedButton>

              <div>
                <h1 className="text-3xl font-bold text-gray-900 mb-2">
                  تفاصيل الموزع - {distributorData.name}
                </h1>
                <p className="text-gray-600">
                  تفاصيل الأعمال اليومية لتاريخ {formatDateShort(selectedDate)}
                </p>
              </div>
            </div>

            <div className="flex items-center space-x-4 space-x-reverse">
              <div className="flex items-center space-x-2 space-x-reverse text-sm text-gray-600">
                <Calendar className="w-4 h-4" />
                <span>{formatDateShort(selectedDate)}</span>
              </div>

              <EnhancedButton
                onClick={loadDistributorData}
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

        {/* Distributor Header Card - Enhanced */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <Card className="bg-white shadow-lg">
            <CardBody className="p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-6 space-x-reverse">
                  <div className="relative">
                    <div className="w-20 h-20 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full flex items-center justify-center">
                      <User className="w-10 h-10 text-white" />
                    </div>
                    {/* Work status indicator */}
                    <div
                      className={`absolute -bottom-1 -right-1 w-6 h-6 rounded-full border-3 border-white ${
                        distributorData.work_status === "active"
                          ? "bg-green-500"
                          : distributorData.work_status === "busy"
                          ? "bg-yellow-500"
                          : distributorData.work_status === "break"
                          ? "bg-blue-500"
                          : "bg-gray-500"
                      }`}
                    ></div>
                  </div>

                  <div>
                    <h2 className="text-2xl font-bold text-gray-900 mb-2">
                      {distributorData.name}
                    </h2>
                    <div className="flex items-center space-x-4 space-x-reverse text-sm text-gray-600">
                      <div className="flex items-center space-x-1 space-x-reverse">
                        <Phone className="w-4 h-4" />
                        <span>{distributorData.phone}</span>
                      </div>
                      <div className="flex items-center space-x-1 space-x-reverse">
                        <Mail className="w-4 h-4" />
                        <span>{distributorData.email}</span>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2 space-x-reverse mt-2">
                      <MapPin className="w-4 h-4 text-red-500" />
                      <span className="text-sm text-gray-600">
                        {distributorData.current_location?.address ||
                          "الموقع غير محدد"}
                      </span>
                      {/* Location freshness indicator */}
                      <div
                        className={`w-2 h-2 rounded-full ${
                          isLocationFresh(distributorData.location_updated_at)
                            ? "bg-green-400"
                            : "bg-gray-400"
                        }`}
                      ></div>
                    </div>
                    {distributorData.location_updated_at && (
                      <div className="text-xs text-gray-400 mt-1">
                        آخر تحديث للموقع:{" "}
                        {formatDateTimeArabic(
                          distributorData.location_updated_at
                        )}
                      </div>
                    )}
                  </div>
                </div>

                <div className="text-right">
                  <span
                    className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium border ${getStatusColor(
                      distributorData.work_status
                    )}`}
                  >
                    {getStatusText(distributorData.work_status)}
                  </span>
                  {distributorData.current_route?.current_stop && (
                    <div className="mt-2 text-sm text-blue-600">
                      المحطة الحالية:{" "}
                      {distributorData.current_route.current_stop}
                    </div>
                  )}
                </div>
              </div>
            </CardBody>
          </Card>
        </motion.div>

        {/* Vehicle Information Card - Enhanced */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mb-8"
        >
          <Card className="bg-white shadow-lg">
            <CardHeader className="pb-3">
              <div className="flex items-center space-x-2 space-x-reverse">
                <Truck className="w-5 h-5 text-blue-600" />
                <h3 className="text-lg font-semibold text-gray-900">
                  معلومات المركبة
                </h3>
              </div>
            </CardHeader>
            <CardBody className="pt-0">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="bg-gray-50 p-4 rounded-lg">
                  <p className="text-sm text-gray-600 mb-2">نوع المركبة</p>
                  <p className="text-gray-900 font-medium">
                    {distributorData.vehicle_info?.type || "غير محدد"}
                  </p>
                </div>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <p className="text-sm text-gray-600 mb-2">رقم اللوحة</p>
                  <p className="text-gray-900 font-medium">
                    {distributorData.vehicle_info?.plate_number || "غير محدد"}
                  </p>
                </div>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <p className="text-sm text-gray-600 mb-2">الموديل</p>
                  <p className="text-gray-900 font-medium">
                    {distributorData.vehicle_info?.model || "غير محدد"}
                  </p>
                </div>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <p className="text-sm text-gray-600 mb-2">سنة الصنع</p>
                  <p className="text-gray-900 font-medium">
                    {distributorData.vehicle_info?.year || "غير محدد"}
                  </p>
                </div>
              </div>
              {distributorData.vehicle_info?.color && (
                <div className="mt-4 bg-blue-50 p-3 rounded-lg">
                  <div className="flex items-center space-x-2 space-x-reverse">
                    <div className="w-4 h-4 rounded-full bg-gray-400"></div>
                    <span className="text-sm text-gray-700">
                      اللون: {distributorData.vehicle_info.color}
                    </span>
                  </div>
                </div>
              )}
            </CardBody>
          </Card>
        </motion.div>

        {/* Quick Stats - Enhanced */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8"
        >
          <Card className="bg-gradient-to-r from-green-500 to-green-600 text-white shadow-lg">
            <CardBody className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-green-100 text-sm">الإيرادات اليومية</p>
                  <p className="text-2xl font-bold">
                    €{(distributorData.daily_revenue || 0).toFixed(2)}
                  </p>
                  {distributorData.daily_performance?.total_orders_delivered >
                    0 && (
                    <p className="text-xs text-green-200 mt-1">
                      متوسط الطلب: €
                      {(
                        (distributorData.daily_revenue || 0) /
                        distributorData.daily_performance.total_orders_delivered
                      ).toFixed(2)}
                    </p>
                  )}
                </div>
                <Euro className="w-8 h-8 text-green-200" />
              </div>
            </CardBody>
          </Card>

          <Card className="bg-gradient-to-r from-red-500 to-red-600 text-white shadow-lg">
            <CardBody className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-red-100 text-sm">إجمالي المصاريف</p>
                  <p className="text-2xl font-bold">
                    €
                    {(
                      (distributorData.daily_expenses?.fuel || 0) +
                      (distributorData.daily_expenses?.maintenance || 0) +
                      (distributorData.daily_expenses?.other || 0)
                    ).toFixed(2)}
                  </p>
                  <p className="text-xs text-red-200 mt-1">
                    وقود: €
                    {(distributorData.daily_expenses?.fuel || 0).toFixed(2)}
                  </p>
                </div>
                <DollarSign className="w-8 h-8 text-red-200" />
              </div>
            </CardBody>
          </Card>

          <Card className="bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-lg">
            <CardBody className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-blue-100 text-sm">صافي الربح</p>
                  <p className="text-2xl font-bold">
                    €
                    {(
                      (distributorData.daily_revenue || 0) -
                      ((distributorData.daily_expenses?.fuel || 0) +
                        (distributorData.daily_expenses?.maintenance || 0) +
                        (distributorData.daily_expenses?.other || 0))
                    ).toFixed(2)}
                  </p>
                  <p className="text-xs text-blue-200 mt-1">
                    هامش الربح:{" "}
                    {distributorData.daily_revenue > 0
                      ? (
                          ((distributorData.daily_revenue -
                            ((distributorData.daily_expenses?.fuel || 0) +
                              (distributorData.daily_expenses?.maintenance ||
                                0) +
                              (distributorData.daily_expenses?.other || 0))) /
                            distributorData.daily_revenue) *
                          100
                        ).toFixed(1)
                      : 0}
                    %
                  </p>
                </div>
                <TrendingUp className="w-8 h-8 text-blue-200" />
              </div>
            </CardBody>
          </Card>

          <Card className="bg-gradient-to-r from-purple-500 to-purple-600 text-white shadow-lg">
            <CardBody className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-purple-100 text-sm">نقاط الكفاءة</p>
                  <p className="text-2xl font-bold">
                    {distributorData.efficiency_score || 0}%
                  </p>
                  <p className="text-xs text-purple-200 mt-1">
                    طلبات مسلمة:{" "}
                    {distributorData.daily_performance
                      ?.total_orders_delivered || 0}
                  </p>
                </div>
                <Award className="w-8 h-8 text-purple-200" />
              </div>
            </CardBody>
          </Card>
        </motion.div>

        {/* Work Hours & Performance Card - New */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="mb-8"
        >
          <Card className="bg-white shadow-lg">
            <CardHeader className="pb-3">
              <div className="flex items-center space-x-2 space-x-reverse">
                <Clock className="w-5 h-5 text-blue-600" />
                <h3 className="text-lg font-semibold text-gray-900">
                  ساعات العمل والأداء اليومي
                </h3>
              </div>
            </CardHeader>
            <CardBody className="pt-0">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Trabalho horas */}
                <div className="bg-blue-50 p-4 rounded-lg">
                  <div className="flex items-center space-x-2 space-x-reverse mb-3">
                    <Timer className="w-5 h-5 text-blue-600" />
                    <h4 className="font-medium text-gray-900">ساعات العمل</h4>
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">بداية العمل:</span>
                      <span className="font-medium">
                        {distributorData.daily_performance?.work_started_at ||
                          "لم يبدأ"}
                      </span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">نهاية العمل:</span>
                      <span className="font-medium">
                        {distributorData.daily_performance?.work_ended_at ||
                          "لم ينته"}
                      </span>
                    </div>
                    <div className="flex justify-between text-sm font-bold border-t pt-2">
                      <span className="text-gray-700">إجمالي الساعات:</span>
                      <span className="text-blue-600">
                        {distributorData.daily_performance?.total_work_hours ||
                          0}{" "}
                        ساعة
                      </span>
                    </div>
                  </div>
                </div>

                {/* Orders Performance */}
                <div className="bg-green-50 p-4 rounded-lg">
                  <div className="flex items-center space-x-2 space-x-reverse mb-3">
                    <Package className="w-5 h-5 text-green-600" />
                    <h4 className="font-medium text-gray-900">أداء الطلبات</h4>
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">طلبات مُعينة:</span>
                      <span className="font-medium">
                        {distributorData.daily_performance
                          ?.total_orders_assigned || 0}
                      </span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">طلبات مُسلمة:</span>
                      <span className="font-medium text-green-600">
                        {distributorData.daily_performance
                          ?.total_orders_delivered || 0}
                      </span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">طلبات فاشلة:</span>
                      <span className="font-medium text-red-600">
                        {distributorData.daily_performance
                          ?.total_orders_failed || 0}
                      </span>
                    </div>
                    <div className="flex justify-between text-sm font-bold border-t pt-2">
                      <span className="text-gray-700">نسبة النجاح:</span>
                      <span className="text-green-600">
                        {distributorData.daily_performance
                          ?.total_orders_assigned > 0
                          ? (
                              (distributorData.daily_performance
                                .total_orders_delivered /
                                distributorData.daily_performance
                                  .total_orders_assigned) *
                              100
                            ).toFixed(1)
                          : 0}
                        %
                      </span>
                    </div>
                  </div>
                </div>

                {/* Distance & Route */}
                <div className="bg-orange-50 p-4 rounded-lg">
                  <div className="flex items-center space-x-2 space-x-reverse mb-3">
                    <Route className="w-5 h-5 text-orange-600" />
                    <h4 className="font-medium text-gray-900">
                      المسافة والمسار
                    </h4>
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">المسافة المقطوعة:</span>
                      <span className="font-medium">
                        {distributorData.daily_performance?.total_distance_km ||
                          0}{" "}
                        كم
                      </span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">متوسط وقت التسليم:</span>
                      <span className="font-medium">
                        {distributorData.daily_performance
                          ?.average_delivery_time_minutes || 0}{" "}
                        دقيقة
                      </span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">المحطة الحالية:</span>
                      <span className="font-medium text-orange-600">
                        {distributorData.current_route?.current_stop ||
                          "غير محدد"}
                      </span>
                    </div>
                    <div className="flex justify-between text-sm font-bold border-t pt-2">
                      <span className="text-gray-700">التقدم:</span>
                      <span className="text-orange-600">
                        {distributorData.current_route?.completed_stops || 0}/
                        {distributorData.current_route?.total_stops || 0}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </CardBody>
          </Card>
        </motion.div>

        {/* Tab Navigation */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="mb-8"
        >
          <div className="bg-white rounded-lg shadow-lg p-1">
            <div className="flex overflow-x-auto">
              {tabs.map((tab) => (
                <button
                  key={tab.key}
                  onClick={() => setActiveTab(tab.key)}
                  className={`flex items-center px-6 py-3 text-sm font-medium rounded-lg transition-all whitespace-nowrap ${
                    activeTab === tab.key
                      ? "bg-blue-500 text-white shadow-md"
                      : "text-gray-600 hover:text-blue-600 hover:bg-blue-50"
                  }`}
                >
                  <tab.icon className="w-4 h-4 mr-2" />
                  {tab.label}
                </button>
              ))}
            </div>
          </div>
        </motion.div>

        {/* Tab Content */}
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          {activeTab === "overview" && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Current Location */}
              <Card className="bg-white shadow-lg">
                <CardHeader className="border-b border-gray-200">
                  <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                    <MapPin className="w-5 h-5 mr-2 text-red-500" />
                    الموقع الحالي
                  </h3>
                </CardHeader>
                <CardBody className="p-6">
                  <div className="space-y-4">
                    <div>
                      <p className="text-sm text-gray-600 mb-2">العنوان</p>
                      <p className="text-gray-900 font-medium">
                        {distributorData.current_location?.address ||
                          "غير محدد"}
                      </p>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm text-gray-600 mb-1">خط العرض</p>
                        <p className="text-gray-900 font-mono text-sm">
                          {distributorData.current_location?.lat || "غير محدد"}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600 mb-1">خط الطول</p>
                        <p className="text-gray-900 font-mono text-sm">
                          {distributorData.current_location?.lng || "غير محدد"}
                        </p>
                      </div>
                    </div>

                    <div className="border-t pt-4">
                      <p className="text-xs text-gray-500">
                        آخر تحديث:{" "}
                        {formatDateTimeArabic(
                          distributorData.current_location?.last_update ||
                            new Date()
                        )}
                      </p>
                    </div>
                  </div>
                </CardBody>
              </Card>

              {/* Vehicle Information */}
              <Card className="bg-white shadow-lg">
                <CardHeader className="border-b border-gray-200">
                  <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                    <Truck className="w-5 h-5 mr-2 text-blue-500" />
                    معلومات المركبة
                  </h3>
                </CardHeader>
                <CardBody className="p-6">
                  <div className="space-y-4">
                    <div>
                      <p className="text-sm text-gray-600 mb-2">نوع المركبة</p>
                      <p className="text-gray-900 font-medium">
                        {distributorData.vehicle_info?.type || "مركبة توزيع"}
                      </p>
                    </div>

                    <div>
                      <p className="text-sm text-gray-600 mb-2">الحالة</p>
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(
                          distributorData.status
                        )}`}
                      >
                        {getStatusText(distributorData.status)}
                      </span>
                    </div>

                    <div>
                      <p className="text-sm text-gray-600 mb-2">نقاط الكفاءة</p>
                      <div className="flex items-center space-x-2 space-x-reverse">
                        <div className="flex-1 bg-gray-200 rounded-full h-2">
                          <div
                            className="bg-green-500 h-2 rounded-full"
                            style={{
                              width: `${
                                distributorData.efficiency_score || 0
                              }%`,
                            }}
                          ></div>
                        </div>
                        <span className="text-sm font-medium text-green-600">
                          {distributorData.efficiency_score || 0}%
                        </span>
                      </div>
                    </div>
                  </div>
                </CardBody>
              </Card>
            </div>
          )}

          {activeTab === "orders" && (
            <Card className="bg-white shadow-lg">
              <CardHeader className="border-b border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                  <Package className="w-5 h-5 mr-2" />
                  طلبات اليوم ({distributorData.deliveries?.length || 0})
                </h3>
              </CardHeader>
              <CardBody className="p-6">
                {distributorData.deliveries &&
                distributorData.deliveries.length > 0 ? (
                  <div className="space-y-4">
                    {distributorData.deliveries.map((delivery, index) => (
                      <div
                        key={delivery.order_id}
                        className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
                      >
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center space-x-3 space-x-reverse">
                            <div className="flex items-center justify-center w-8 h-8 bg-blue-100 rounded-full">
                              <span className="text-sm font-medium text-blue-600">
                                {index + 1}
                              </span>
                            </div>
                            <div>
                              <h4 className="font-medium text-gray-900">
                                {delivery.store_name}
                              </h4>
                              <p className="text-sm text-gray-600">
                                طلب #{delivery.order_id}
                              </p>
                            </div>
                          </div>

                          <span
                            className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${getOrderStatusColor(
                              delivery.status
                            )}`}
                          >
                            {getOrderStatusText(delivery.status)}
                          </span>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                          <div>
                            <p className="text-gray-600 mb-1">العنوان</p>
                            <p className="text-gray-900">{delivery.address}</p>
                          </div>

                          <div>
                            <p className="text-gray-600 mb-1">القيمة</p>
                            <p className="text-gray-900 font-medium">
                              €{delivery.amount_eur?.toFixed(2) || "0.00"}
                            </p>
                          </div>

                          <div>
                            <p className="text-gray-600 mb-1">هاتف المتجر</p>
                            <p className="text-gray-900">
                              {delivery.store_phone || "غير متوفر"}
                            </p>
                          </div>
                        </div>

                        <div className="mt-3 pt-3 border-t border-gray-100">
                          <p className="text-xs text-gray-500">
                            تاريخ الطلب:{" "}
                            {formatDateTimeArabic(delivery.created_at)}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <Package className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                    <p className="text-gray-500">لا توجد طلبات لهذا اليوم</p>
                  </div>
                )}
              </CardBody>
            </Card>
          )}

          {activeTab === "expenses" && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Expenses Breakdown */}
              <Card className="bg-white shadow-lg">
                <CardHeader className="border-b border-gray-200">
                  <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                    <DollarSign className="w-5 h-5 mr-2" />
                    تفصيل المصاريف اليومية
                  </h3>
                </CardHeader>
                <CardBody className="p-6">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-3 bg-red-50 rounded-lg">
                      <div className="flex items-center space-x-3 space-x-reverse">
                        <Fuel className="w-5 h-5 text-red-500" />
                        <span className="text-gray-700">وقود</span>
                      </div>
                      <span className="text-lg font-semibold text-red-600">
                        €
                        {distributorData.daily_expenses?.fuel?.toFixed(2) ||
                          "0.00"}
                      </span>
                    </div>

                    <div className="flex items-center justify-between p-3 bg-orange-50 rounded-lg">
                      <div className="flex items-center space-x-3 space-x-reverse">
                        <Wrench className="w-5 h-5 text-orange-500" />
                        <span className="text-gray-700">صيانة</span>
                      </div>
                      <span className="text-lg font-semibold text-orange-600">
                        €
                        {distributorData.daily_expenses?.maintenance?.toFixed(
                          2
                        ) || "0.00"}
                      </span>
                    </div>

                    <div className="flex items-center justify-between p-3 bg-purple-50 rounded-lg">
                      <div className="flex items-center space-x-3 space-x-reverse">
                        <FileText className="w-5 h-5 text-purple-500" />
                        <span className="text-gray-700">مصاريف أخرى</span>
                      </div>
                      <span className="text-lg font-semibold text-purple-600">
                        €
                        {distributorData.daily_expenses?.other?.toFixed(2) ||
                          "0.00"}
                      </span>
                    </div>

                    <div className="border-t pt-4">
                      <div className="flex items-center justify-between p-3 bg-gray-100 rounded-lg">
                        <span className="text-gray-700 font-medium">
                          إجمالي المصاريف
                        </span>
                        <span className="text-xl font-bold text-gray-900">
                          €{totalExpenses.toFixed(2)}
                        </span>
                      </div>
                    </div>
                  </div>
                </CardBody>
              </Card>

              {/* Profit Analysis */}
              <Card className="bg-white shadow-lg">
                <CardHeader className="border-b border-gray-200">
                  <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                    <TrendingUp className="w-5 h-5 mr-2" />
                    تحليل الربحية
                  </h3>
                </CardHeader>
                <CardBody className="p-6">
                  <div className="space-y-6">
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-gray-600">إجمالي الإيرادات</span>
                        <span className="text-lg font-semibold text-green-600">
                          €{distributorData.daily_revenue?.toFixed(2) || "0.00"}
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-green-500 h-2 rounded-full"
                          style={{ width: "100%" }}
                        ></div>
                      </div>
                    </div>

                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-gray-600">إجمالي المصاريف</span>
                        <span className="text-lg font-semibold text-red-600">
                          €{totalExpenses.toFixed(2)}
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-red-500 h-2 rounded-full"
                          style={{
                            width: `${
                              distributorData.daily_revenue > 0
                                ? (totalExpenses /
                                    distributorData.daily_revenue) *
                                  100
                                : 0
                            }%`,
                          }}
                        ></div>
                      </div>
                    </div>

                    <div className="border-t pt-4">
                      <div className="flex items-center justify-between p-4 bg-blue-50 rounded-lg">
                        <span className="text-blue-700 font-medium text-lg">
                          صافي الربح
                        </span>
                        <span
                          className={`text-2xl font-bold ${
                            netProfit >= 0 ? "text-green-600" : "text-red-600"
                          }`}
                        >
                          €{netProfit.toFixed(2)}
                        </span>
                      </div>

                      <div className="mt-3 text-center">
                        <span className="text-sm text-gray-600">
                          هامش الربح:{" "}
                          {distributorData.daily_revenue > 0
                            ? (
                                (netProfit / distributorData.daily_revenue) *
                                100
                              ).toFixed(1)
                            : 0}
                          %
                        </span>
                      </div>
                    </div>
                  </div>
                </CardBody>
              </Card>
            </div>
          )}

          {activeTab === "performance" && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Performance Metrics */}
              <Card className="bg-white shadow-lg">
                <CardHeader className="border-b border-gray-200">
                  <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                    <Target className="w-5 h-5 mr-2" />
                    مؤشرات الأداء
                  </h3>
                </CardHeader>
                <CardBody className="p-6">
                  <div className="space-y-6">
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-gray-600">
                          نسبة إنجاز الطلبات
                        </span>
                        <span className="text-lg font-semibold text-blue-600">
                          {distributorData.progress?.percentage || 0}%
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-3">
                        <div
                          className="bg-blue-500 h-3 rounded-full"
                          style={{
                            width: `${
                              distributorData.progress?.percentage || 0
                            }%`,
                          }}
                        ></div>
                      </div>
                    </div>

                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-gray-600">نقاط الكفاءة</span>
                        <span className="text-lg font-semibold text-green-600">
                          {distributorData.efficiency_score || 0}%
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-3">
                        <div
                          className="bg-green-500 h-3 rounded-full"
                          style={{
                            width: `${distributorData.efficiency_score || 0}%`,
                          }}
                        ></div>
                      </div>
                    </div>

                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-gray-600">
                          معدل الإيرادات لكل طلب
                        </span>
                        <span className="text-lg font-semibold text-purple-600">
                          €
                          {distributorData.total_orders > 0
                            ? (
                                distributorData.daily_revenue /
                                distributorData.total_orders
                              ).toFixed(2)
                            : "0.00"}
                        </span>
                      </div>
                    </div>
                  </div>
                </CardBody>
              </Card>

              {/* Performance Summary */}
              <Card className="bg-white shadow-lg">
                <CardHeader className="border-b border-gray-200">
                  <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                    <Award className="w-5 h-5 mr-2" />
                    ملخص الأداء
                  </h3>
                </CardHeader>
                <CardBody className="p-6">
                  <div className="space-y-4">
                    {distributorData.efficiency_score >= 90 && (
                      <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
                        <div className="flex items-center">
                          <Star className="w-5 h-5 text-green-500 mr-2" />
                          <span className="text-green-800 font-medium">
                            أداء ممتاز
                          </span>
                        </div>
                        <p className="text-green-700 text-sm mt-1">
                          الموزع يحقق معدل كفاءة عالي جداً
                        </p>
                      </div>
                    )}

                    {distributorData.efficiency_score >= 70 &&
                      distributorData.efficiency_score < 90 && (
                        <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                          <div className="flex items-center">
                            <CheckCircle className="w-5 h-5 text-blue-500 mr-2" />
                            <span className="text-blue-800 font-medium">
                              أداء جيد
                            </span>
                          </div>
                          <p className="text-blue-700 text-sm mt-1">
                            الموزع يحقق معدل كفاءة مقبول
                          </p>
                        </div>
                      )}

                    {distributorData.efficiency_score < 70 && (
                      <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                        <div className="flex items-center">
                          <AlertCircle className="w-5 h-5 text-yellow-500 mr-2" />
                          <span className="text-yellow-800 font-medium">
                            يحتاج تحسين
                          </span>
                        </div>
                        <p className="text-yellow-700 text-sm mt-1">
                          يمكن تحسين كفاءة الموزع
                        </p>
                      </div>
                    )}

                    <div className="grid grid-cols-2 gap-4 mt-6">
                      <div className="text-center p-3 bg-gray-50 rounded-lg">
                        <div className="text-2xl font-bold text-gray-900 mb-1">
                          {distributorData.orders_delivered_today || 0}
                        </div>
                        <p className="text-sm text-gray-600">طلبات مكتملة</p>
                      </div>

                      <div className="text-center p-3 bg-gray-50 rounded-lg">
                        <div className="text-2xl font-bold text-gray-900 mb-1">
                          {distributorData.total_orders || 0}
                        </div>
                        <p className="text-sm text-gray-600">إجمالي الطلبات</p>
                      </div>
                    </div>
                  </div>
                </CardBody>
              </Card>
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
};

export default DistributorDetails;
