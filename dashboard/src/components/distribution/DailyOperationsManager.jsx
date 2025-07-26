import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "react-hot-toast";
import {
  Calendar,
  Clock,
  Package,
  Store,
  Check,
  AlertTriangle,
  Star,
  FileText,
  Download,
  Truck,
  User,
  MapPin,
  Euro,
  MessageSquare,
  Eye,
  Loader2,
  RefreshCw,
  ChevronDown,
  ChevronUp,
  Target,
  CheckCircle,
  AlertCircle,
  Filter,
  Search,
  SortAsc,
  SortDesc,
  Activity,
  BarChart3,
  Coffee,
  Phone,
  Mail,
  TrendingUp,
  Timer,
} from "lucide-react";
import { Card, CardHeader, CardBody } from "../ui/Card";
import EnhancedButton from "../ui/EnhancedButton";
import EnhancedInput from "../ui/EnhancedInput";
import LoadingSpinner from "../ui/LoadingSpinner";
import distributionService from "../../services/distributionService";
import orderService from "../../services/orderService";
import {
  formatDateArabic,
  formatDateShort,
  formatTimeArabic,
  formatDateTimeArabic,
} from "../../utils/dateFormatter";

/**
 * Daily Operations Manager Component - Enhanced for Today's Orders Only
 * Displays only today's orders with real-time monitoring capabilities
 * Focus on direct monitoring without editing capabilities
 */
const DailyOperationsManager = ({ selectedDate, onDateChange }) => {
  // States
  const [isLoading, setIsLoading] = useState(false);
  const [dailyOrders, setDailyOrders] = useState([]);
  const [statistics, setStatistics] = useState({});
  const [distributors, setDistributors] = useState([]);

  // Filter and search states
  const [filters, setFilters] = useState({
    search: "",
    store: "",
    status: "all",
    priority: "all",
    distributor: "all",
  });
  const [sortField, setSortField] = useState("created_at");
  const [sortDirection, setSortDirection] = useState("desc");

  // Get today's date for comparison
  const today = new Date().toISOString().split("T")[0];
  const isToday = selectedDate === today;

  // Load initial data
  useEffect(() => {
    loadDailyData();

    // Set up auto-refresh for today's orders only
    if (isToday) {
      const interval = setInterval(loadDailyData, 30000); // Refresh every 30 seconds for today
      return () => clearInterval(interval);
    }
  }, [selectedDate, isToday]);

  const loadDailyData = async () => {
    try {
      setIsLoading(true);

      // Load only today's orders with real-time data
      const ordersResponse = await orderService.getOrders({
        date: selectedDate,
        limit: 200,
        include_distributor: true,
        include_store: true,
      });

      if (ordersResponse.success) {
        const orders = ordersResponse.data.orders || [];

        // Filter to show only orders for the selected date
        const dateFilteredOrders = orders.filter((order) => {
          const orderDate = new Date(order.created_at)
            .toISOString()
            .split("T")[0];
          return orderDate === selectedDate;
        });

        setDailyOrders(dateFilteredOrders);

        // Calculate real-time statistics
        const stats = calculateStatistics(dateFilteredOrders);
        setStatistics(stats);

        // Load active distributors
        const distributorsResponse =
          await distributionService.getActiveDistributors();
        if (distributorsResponse.success) {
          setDistributors(distributorsResponse.data.distributors || []);
        }
      } else {
        throw new Error("Failed to load orders");
      }
    } catch (error) {
      console.error("Error loading daily data:", error);
      toast.error("خطأ في تحميل البيانات اليومية");
      setDailyOrders([]);
      setStatistics({});
    } finally {
      setIsLoading(false);
    }
  };

  const calculateStatistics = (orders) => {
    const stats = {
      totalOrders: orders.length,
      completedOrders: orders.filter((o) => o.status === "delivered").length,
      pendingOrders: orders.filter((o) => o.status === "pending").length,
      inProgressOrders: orders.filter((o) => o.status === "in_progress").length,
      cancelledOrders: orders.filter((o) => o.status === "cancelled").length,
      totalRevenue: orders.reduce(
        (sum, order) => sum + (parseFloat(order.total_amount_eur) || 0),
        0
      ),
      averageOrderValue: 0,
      highPriorityOrders: orders.filter(
        (o) => o.priority === "high" || o.priority === "urgent"
      ).length,
    };

    if (stats.totalOrders > 0) {
      stats.averageOrderValue = stats.totalRevenue / stats.totalOrders;
    }

    return stats;
  };

  // Filter and sort orders
  const filteredAndSortedOrders = React.useMemo(() => {
    let filtered = dailyOrders.filter((order) => {
      const matchesSearch =
        !filters.search ||
        order.store_name
          ?.toLowerCase()
          .includes(filters.search.toLowerCase()) ||
        order.id.toString().includes(filters.search) ||
        order.distributor_name
          ?.toLowerCase()
          .includes(filters.search.toLowerCase());

      const matchesStore = !filters.store || order.store_name === filters.store;
      const matchesStatus =
        filters.status === "all" || order.status === filters.status;
      const matchesPriority =
        filters.priority === "all" || order.priority === filters.priority;
      const matchesDistributor =
        filters.distributor === "all" ||
        order.assigned_distributor_id?.toString() === filters.distributor;

      return (
        matchesSearch &&
        matchesStore &&
        matchesStatus &&
        matchesPriority &&
        matchesDistributor
      );
    });

    // Sort orders
    filtered.sort((a, b) => {
      let aValue = a[sortField];
      let bValue = b[sortField];

      if (sortField === "created_at") {
        aValue = new Date(aValue);
        bValue = new Date(bValue);
      } else if (sortField === "total_amount_eur") {
        aValue = parseFloat(aValue) || 0;
        bValue = parseFloat(bValue) || 0;
      }

      if (sortDirection === "asc") {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });

    return filtered;
  }, [dailyOrders, filters, sortField, sortDirection]);

  const handleSort = (field) => {
    if (sortField === field) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortDirection("desc");
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "delivered":
        return "bg-green-100 text-green-800 border-green-200";
      case "in_progress":
        return "bg-blue-100 text-blue-800 border-blue-200";
      case "pending":
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "cancelled":
        return "bg-red-100 text-red-800 border-red-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case "delivered":
        return "تم التسليم";
      case "in_progress":
        return "قيد التنفيذ";
      case "pending":
        return "معلق";
      case "cancelled":
        return "ملغي";
      case "confirmed":
        return "مؤكد";
      case "ready":
        return "جاهز للتسليم";
      default:
        return "غير محدد";
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case "urgent":
        return "bg-red-100 text-red-800";
      case "high":
        return "bg-orange-100 text-orange-800";
      case "normal":
        return "bg-blue-100 text-blue-800";
      case "low":
        return "bg-gray-100 text-gray-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getPriorityText = (priority) => {
    switch (priority) {
      case "urgent":
        return "عاجل";
      case "high":
        return "عالية";
      case "normal":
        return "عادية";
      case "low":
        return "منخفضة";
      default:
        return "عادية";
    }
  };

  // Order Card Component - Enhanced for Today's Monitoring
  const OrderCard = ({ order }) => (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      className="bg-white rounded-lg shadow-lg border border-gray-200 p-6 hover:shadow-xl transition-all duration-300"
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div>
          <h3 className="font-semibold text-gray-900 mb-1">طلب #{order.id}</h3>
          <div className="flex items-center space-x-2 space-x-reverse text-sm text-gray-600">
            <Store className="w-4 h-4" />
            <span>{order.store_name || "متجر غير محدد"}</span>
          </div>
          {order.store_address && (
            <div className="flex items-center space-x-2 space-x-reverse text-sm text-gray-500 mt-1">
              <MapPin className="w-3 h-3" />
              <span>{order.store_address}</span>
            </div>
          )}
        </div>
        <span
          className={`px-2 py-1 rounded-full text-xs font-medium border ${getStatusColor(
            order.status
          )}`}
        >
          {getStatusText(order.status)}
        </span>
      </div>

      {/* Distributor Info */}
      {order.distributor_name && (
        <div className="mb-4 p-3 bg-blue-50 rounded-lg">
          <div className="flex items-center space-x-2 space-x-reverse">
            <User className="w-4 h-4 text-blue-600" />
            <span className="text-sm font-medium text-blue-900">
              الموزع: {order.distributor_name}
            </span>
          </div>
          {order.assigned_at && (
            <div className="text-xs text-blue-700 mt-1">
              تم التعيين: {formatDateTimeArabic(order.assigned_at)}
            </div>
          )}
        </div>
      )}

      {/* Order Details Grid */}
      <div className="grid grid-cols-3 gap-3 mb-4">
        <div className="text-center p-2 bg-gray-50 rounded-lg">
          <p className="text-xs text-gray-600">العناصر</p>
          <p className="text-sm font-semibold text-gray-900">
            {order.items_count || order.order_items?.length || 0}
          </p>
        </div>
        <div className="text-center p-2 bg-green-50 rounded-lg">
          <p className="text-xs text-gray-600">القيمة</p>
          <p className="text-sm font-semibold text-green-600">
            €{parseFloat(order.total_amount_eur || 0).toFixed(2)}
          </p>
        </div>
        <div className="text-center p-2 bg-blue-50 rounded-lg">
          <p className="text-xs text-gray-600">الأولوية</p>
          <span
            className={`px-1.5 py-0.5 rounded-full text-xs font-medium ${getPriorityColor(
              order.priority
            )}`}
          >
            {getPriorityText(order.priority)}
          </span>
        </div>
      </div>

      {/* Delivery Progress */}
      {order.status === "in_progress" && (
        <div className="mb-4 p-3 bg-yellow-50 rounded-lg border-l-4 border-yellow-400">
          <div className="flex items-center space-x-2 space-x-reverse mb-2">
            <Truck className="w-4 h-4 text-yellow-600" />
            <span className="text-sm font-medium text-yellow-900">
              قيد التوصيل
            </span>
          </div>
          {order.delivery_started_at && (
            <div className="text-xs text-yellow-700">
              بدأ التوصيل: {formatTimeArabic(order.delivery_started_at)}
            </div>
          )}
        </div>
      )}

      {/* Order Timestamps - Gregorian dates */}
      <div className="border-t pt-3 space-y-2">
        <div className="flex items-center justify-between text-xs text-gray-500">
          <div className="flex items-center space-x-1 space-x-reverse">
            <Clock className="w-3 h-3" />
            <span>تاريخ الطلب:</span>
          </div>
          <span className="font-medium">
            {formatDateShort(order.created_at)}
          </span>
        </div>
        <div className="flex items-center justify-between text-xs text-gray-500">
          <div className="flex items-center space-x-1 space-x-reverse">
            <Timer className="w-3 h-3" />
            <span>الوقت:</span>
          </div>
          <span className="font-medium">
            {formatTimeArabic(order.created_at)}
          </span>
        </div>
        {order.delivery_completed_at && (
          <div className="flex items-center justify-between text-xs text-green-600">
            <div className="flex items-center space-x-1 space-x-reverse">
              <CheckCircle className="w-3 h-3" />
              <span>تم التسليم:</span>
            </div>
            <span className="font-medium">
              {formatDateTimeArabic(order.delivery_completed_at, {
                month: "short",
                day: "numeric",
                hour: "2-digit",
                minute: "2-digit",
              })}
            </span>
          </div>
        )}
      </div>

      {/* Notes */}
      {order.notes && (
        <div className="mt-3 p-2 bg-yellow-50 rounded-lg border-l-4 border-yellow-400">
          <div className="flex items-start space-x-2 space-x-reverse">
            <MessageSquare className="w-4 h-4 text-yellow-600 mt-0.5" />
            <p className="text-sm text-yellow-800">{order.notes}</p>
          </div>
        </div>
      )}

      {/* Delivery Notes */}
      {order.delivery_notes && (
        <div className="mt-3 p-2 bg-blue-50 rounded-lg border-l-4 border-blue-400">
          <div className="flex items-start space-x-2 space-x-reverse">
            <FileText className="w-4 h-4 text-blue-600 mt-0.5" />
            <div>
              <p className="text-xs text-blue-600 font-medium mb-1">
                ملاحظات التوصيل:
              </p>
              <p className="text-sm text-blue-800">{order.delivery_notes}</p>
            </div>
          </div>
        </div>
      )}

      {/* Action Button - View Only */}
      <div className="mt-4">
        <EnhancedButton
          size="sm"
          variant="outline"
          className="w-full flex items-center justify-center space-x-2 space-x-reverse hover:bg-blue-50"
          onClick={() => {
            // Navigate to order details page
            window.location.href = `/orders/${order.id}`;
          }}
        >
          <Eye className="w-4 h-4" />
          <span>عرض التفاصيل</span>
        </EnhancedButton>
      </div>
    </motion.div>
  );

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <LoadingSpinner size="large" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header - Enhanced for Today's Operations */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 flex items-center">
            <Coffee className="w-6 h-6 mr-3" />
            العمليات اليومية
            {isToday && (
              <span className="mr-3 bg-green-100 text-green-800 text-xs font-medium px-2.5 py-0.5 rounded-full">
                مباشر
              </span>
            )}
          </h2>
          <p className="text-gray-600 mt-1">
            إدارة ومراقبة الطلبات اليومية لتاريخ{" "}
            {formatDateArabic(selectedDate, {
              year: "numeric",
              month: "long",
              day: "numeric",
            })}
          </p>
        </div>

        <div className="flex items-center space-x-4 space-x-reverse">
          <div className="flex items-center space-x-2 space-x-reverse text-sm text-gray-600">
            <Calendar className="w-4 h-4" />
            <span>{formatDateShort(selectedDate)}</span>
          </div>

          <EnhancedButton
            onClick={loadDailyData}
            variant="outline"
            size="sm"
            disabled={isLoading}
            className="flex items-center space-x-2 space-x-reverse"
          >
            <RefreshCw
              className={`w-4 h-4 ${isLoading ? "animate-spin" : ""}`}
            />
            <span>تحديث</span>
          </EnhancedButton>
        </div>
      </div>

      {/* Statistics Cards - Enhanced */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-lg">
          <CardBody className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-blue-100 text-sm">إجمالي الطلبات</p>
                <p className="text-2xl font-bold">
                  {statistics.totalOrders || 0}
                </p>
                <p className="text-xs text-blue-200 mt-1">
                  عالية الأولوية: {statistics.highPriorityOrders || 0}
                </p>
              </div>
              <Package className="w-8 h-8 text-blue-200" />
            </div>
          </CardBody>
        </Card>

        <Card className="bg-gradient-to-r from-green-500 to-green-600 text-white shadow-lg">
          <CardBody className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-green-100 text-sm">طلبات مكتملة</p>
                <p className="text-2xl font-bold">
                  {statistics.completedOrders || 0}
                </p>
                <p className="text-xs text-green-200 mt-1">
                  نسبة الإنجاز:{" "}
                  {statistics.totalOrders > 0
                    ? (
                        (statistics.completedOrders / statistics.totalOrders) *
                        100
                      ).toFixed(1)
                    : 0}
                  %
                </p>
              </div>
              <CheckCircle className="w-8 h-8 text-green-200" />
            </div>
          </CardBody>
        </Card>

        <Card className="bg-gradient-to-r from-yellow-500 to-yellow-600 text-white shadow-lg">
          <CardBody className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-yellow-100 text-sm">قيد التنفيذ</p>
                <p className="text-2xl font-bold">
                  {statistics.inProgressOrders || 0}
                </p>
                <p className="text-xs text-yellow-200 mt-1">
                  معلقة: {statistics.pendingOrders || 0}
                </p>
              </div>
              <Activity className="w-8 h-8 text-yellow-200" />
            </div>
          </CardBody>
        </Card>

        <Card className="bg-gradient-to-r from-purple-500 to-purple-600 text-white shadow-lg">
          <CardBody className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-purple-100 text-sm">إجمالي الإيرادات</p>
                <p className="text-2xl font-bold">
                  €{(statistics.totalRevenue || 0).toFixed(2)}
                </p>
                <p className="text-xs text-purple-200 mt-1">
                  متوسط الطلب: €{(statistics.averageOrderValue || 0).toFixed(2)}
                </p>
              </div>
              <Euro className="w-8 h-8 text-purple-200" />
            </div>
          </CardBody>
        </Card>
      </div>

      {/* Filters and Search - Enhanced */}
      <Card className="bg-white shadow-lg">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2 space-x-reverse">
              <Filter className="w-5 h-5 text-blue-600" />
              <h3 className="text-lg font-semibold text-gray-900">
                تصفية وبحث الطلبات
              </h3>
            </div>
            <div className="text-sm text-gray-500">
              {filteredAndSortedOrders.length} من أصل {dailyOrders.length} طلب
            </div>
          </div>
        </CardHeader>
        <CardBody className="pt-0">
          <div className="grid grid-cols-1 md:grid-cols-6 gap-4">
            {/* Search */}
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                البحث
              </label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <EnhancedInput
                  type="text"
                  placeholder="البحث في الطلبات..."
                  value={filters.search}
                  onChange={(e) =>
                    setFilters((prev) => ({ ...prev, search: e.target.value }))
                  }
                  className="pl-10"
                />
              </div>
            </div>

            {/* Status Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                الحالة
              </label>
              <select
                value={filters.status}
                onChange={(e) =>
                  setFilters((prev) => ({ ...prev, status: e.target.value }))
                }
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="all">جميع الحالات</option>
                <option value="pending">معلق</option>
                <option value="confirmed">مؤكد</option>
                <option value="in_progress">قيد التنفيذ</option>
                <option value="delivered">تم التسليم</option>
                <option value="cancelled">ملغي</option>
              </select>
            </div>

            {/* Priority Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                الأولوية
              </label>
              <select
                value={filters.priority}
                onChange={(e) =>
                  setFilters((prev) => ({ ...prev, priority: e.target.value }))
                }
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="all">جميع الأولويات</option>
                <option value="low">منخفضة</option>
                <option value="normal">عادية</option>
                <option value="high">عالية</option>
                <option value="urgent">عاجلة</option>
              </select>
            </div>

            {/* Distributor Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                الموزع
              </label>
              <select
                value={filters.distributor}
                onChange={(e) =>
                  setFilters((prev) => ({
                    ...prev,
                    distributor: e.target.value,
                  }))
                }
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="all">جميع الموزعين</option>
                {distributors.map((distributor) => (
                  <option
                    key={distributor.id}
                    value={distributor.id.toString()}
                  >
                    {distributor.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Sort Options */}
            <div className="flex space-x-2 space-x-reverse">
              <div className="flex-1">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  ترتيب حسب
                </label>
                <EnhancedButton
                  onClick={() => handleSort("created_at")}
                  variant="outline"
                  size="sm"
                  className="w-full flex items-center justify-center space-x-1 space-x-reverse"
                >
                  {sortDirection === "asc" ? (
                    <SortAsc className="w-4 h-4" />
                  ) : (
                    <SortDesc className="w-4 h-4" />
                  )}
                  <span>التاريخ</span>
                </EnhancedButton>
              </div>
            </div>

            {/* Clear Filters */}
            <div className="flex items-end">
              <EnhancedButton
                onClick={() => {
                  setFilters({
                    search: "",
                    store: "",
                    status: "all",
                    priority: "all",
                    distributor: "all",
                  });
                }}
                variant="ghost"
                size="sm"
                className="w-full"
              >
                مسح الفلاتر
              </EnhancedButton>
            </div>
          </div>
        </CardBody>
      </Card>

      {/* Orders Grid - Today's Orders Only */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">
            طلبات اليوم -{" "}
            {new Date(selectedDate).toLocaleDateString("ar-SA", {
              weekday: "long",
              year: "numeric",
              month: "long",
              day: "numeric",
            })}
          </h3>
          {isToday && (
            <div className="flex items-center space-x-2 space-x-reverse text-sm text-green-600">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              <span>تحديث تلقائي كل 30 ثانية</span>
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <AnimatePresence>
            {filteredAndSortedOrders.length > 0 ? (
              filteredAndSortedOrders.map((order) => (
                <OrderCard key={order.id} order={order} />
              ))
            ) : (
              <div className="col-span-full text-center py-12">
                <Package className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500 text-lg">
                  {dailyOrders.length === 0
                    ? "لا توجد طلبات لهذا اليوم"
                    : "لا توجد طلبات تطابق معايير البحث"}
                </p>
                <p className="text-gray-400 text-sm mt-2">
                  {dailyOrders.length === 0
                    ? `لم يتم إنشاء أي طلبات لتاريخ ${new Date(
                        selectedDate
                      ).toLocaleDateString("ar-SA")}`
                    : "جرب تغيير معايير البحث أو الفلاتر"}
                </p>
                {dailyOrders.length === 0 && (
                  <div className="mt-4">
                    <EnhancedButton
                      onClick={() => (window.location.href = "/orders/create")}
                      variant="outline"
                      className="flex items-center space-x-2 space-x-reverse"
                    >
                      <Package className="w-4 h-4" />
                      <span>إنشاء طلب جديد</span>
                    </EnhancedButton>
                  </div>
                )}
              </div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Footer Summary - Today's Performance */}
      {dailyOrders.length > 0 && (
        <Card className="bg-gradient-to-r from-gray-50 to-blue-50 border-t-4 border-blue-500">
          <CardBody className="p-4">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-center">
              <div>
                <p className="text-sm text-gray-600">معدل التسليم</p>
                <p className="text-lg font-bold text-green-600">
                  {statistics.totalOrders > 0
                    ? (
                        (statistics.completedOrders / statistics.totalOrders) *
                        100
                      ).toFixed(1)
                    : 0}
                  %
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-600">الطلبات النشطة</p>
                <p className="text-lg font-bold text-blue-600">
                  {(statistics.inProgressOrders || 0) +
                    (statistics.pendingOrders || 0)}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-600">متوسط قيمة الطلب</p>
                <p className="text-lg font-bold text-purple-600">
                  €{(statistics.averageOrderValue || 0).toFixed(2)}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-600">آخر تحديث</p>
                <p className="text-lg font-bold text-gray-600">
                  {new Date().toLocaleTimeString("ar-SA", {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </p>
              </div>
            </div>
          </CardBody>
        </Card>
      )}
    </div>
  );
};

export default DailyOperationsManager;
