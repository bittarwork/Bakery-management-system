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
} from "lucide-react";
import { Card, CardHeader, CardBody } from "../ui/Card";
import EnhancedButton from "../ui/EnhancedButton";
import EnhancedInput from "../ui/EnhancedInput";
import LoadingSpinner from "../ui/LoadingSpinner";
import distributionService from "../../services/distributionService";
import orderService from "../../services/orderService";

/**
 * Daily Operations Manager Component - Enhanced View
 * Displays daily orders and distribution information without editing capabilities
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
  });
  const [sortField, setSortField] = useState("created_at");
  const [sortDirection, setSortDirection] = useState("desc");

  // Load initial data
  useEffect(() => {
    loadDailyData();
  }, [selectedDate]);

  const loadDailyData = async () => {
    try {
      setIsLoading(true);

      // Load orders for the selected date
      const ordersResponse = await orderService.getOrders({
        date: selectedDate,
        limit: 100,
      });

      if (ordersResponse.success) {
        setDailyOrders(ordersResponse.data.orders || []);

        // Calculate statistics
        const orders = ordersResponse.data.orders || [];
        const stats = {
          totalOrders: orders.length,
          completedOrders: orders.filter((o) => o.status === "delivered")
            .length,
          pendingOrders: orders.filter((o) => o.status === "pending").length,
          totalRevenue: orders.reduce(
            (sum, order) => sum + (parseFloat(order.total_amount_eur) || 0),
            0
          ),
          averageOrderValue:
            orders.length > 0
              ? orders.reduce(
                  (sum, order) =>
                    sum + (parseFloat(order.total_amount_eur) || 0),
                  0
                ) / orders.length
              : 0,
        };
        setStatistics(stats);
      } else {
        // Fallback to mock data
        const mockData = getMockDailyData();
        setDailyOrders(mockData.orders);
        setStatistics(mockData.statistics);
      }

      // Load distributor information
      const distributionResponse = await distributionService.getDashboardData(
        selectedDate
      );
      if (distributionResponse.success) {
        setDistributors(distributionResponse.data.distributors || []);
      }
    } catch (error) {
      console.error("Error loading daily data:", error);
      const mockData = getMockDailyData();
      setDailyOrders(mockData.orders);
      setStatistics(mockData.statistics);
      toast.error("Error loading data - using mock data");
    } finally {
      setIsLoading(false);
    }
  };

  // Mock data for fallback
  const getMockDailyData = () => {
    return {
      orders: [
        {
          id: 1,
          store_name: "مخبزة النور",
          store_address: "بيروت - الحمرا",
          status: "delivered",
          priority: "high",
          total_amount_eur: 125.5,
          items_count: 5,
          distributor_name: "أحمد محمود",
          created_at: new Date().toISOString(),
          notes: "طلب عاجل للصباح",
        },
        {
          id: 2,
          store_name: "متجر الصباح",
          store_address: "بيروت - وسط البلد",
          status: "pending",
          priority: "normal",
          total_amount_eur: 89.25,
          items_count: 3,
          distributor_name: "سارة أحمد",
          created_at: new Date().toISOString(),
          notes: "",
        },
      ],
      statistics: {
        totalOrders: 15,
        completedOrders: 8,
        pendingOrders: 7,
        totalRevenue: 1250.75,
        averageOrderValue: 83.38,
      },
    };
  };

  // Filter and sort orders
  const filteredOrders = dailyOrders
    .filter((order) => {
      const matchesSearch =
        !filters.search ||
        order.store_name
          ?.toLowerCase()
          .includes(filters.search.toLowerCase()) ||
        order.distributor_name
          ?.toLowerCase()
          .includes(filters.search.toLowerCase());
      const matchesStatus =
        filters.status === "all" || order.status === filters.status;
      const matchesPriority =
        filters.priority === "all" || order.priority === filters.priority;

      return matchesSearch && matchesStatus && matchesPriority;
    })
    .sort((a, b) => {
      const aValue = a[sortField];
      const bValue = b[sortField];
      const direction = sortDirection === "asc" ? 1 : -1;

      if (sortField === "created_at") {
        return direction * (new Date(aValue) - new Date(bValue));
      }
      if (typeof aValue === "string") {
        return direction * aValue.localeCompare(bValue);
      }
      return direction * (aValue - bValue);
    });

  // Helper functions
  const getStatusColor = (status) => {
    const colors = {
      pending: "bg-yellow-100 text-yellow-800 border-yellow-200",
      confirmed: "bg-blue-100 text-blue-800 border-blue-200",
      in_progress: "bg-purple-100 text-purple-800 border-purple-200",
      delivered: "bg-green-100 text-green-800 border-green-200",
      cancelled: "bg-red-100 text-red-800 border-red-200",
    };
    return colors[status] || colors.pending;
  };

  const getStatusText = (status) => {
    const texts = {
      pending: "معلق",
      confirmed: "مؤكد",
      in_progress: "قيد التنفيذ",
      delivered: "تم التسليم",
      cancelled: "ملغي",
    };
    return texts[status] || texts.pending;
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
      low: "منخفضة",
      normal: "عادية",
      high: "عالية",
      urgent: "عاجلة",
    };
    return texts[priority] || texts.normal;
  };

  const handleSort = (field) => {
    if (sortField === field) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortDirection("asc");
    }
  };

  const OrderCard = ({ order }) => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-lg shadow-md p-4 border border-gray-200 hover:shadow-lg transition-shadow"
    >
      {/* Order Header */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center space-x-3 space-x-reverse">
          <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
            <Package className="w-5 h-5 text-blue-600" />
          </div>
          <div>
            <h4 className="font-semibold text-gray-900">{order.store_name}</h4>
            <p className="text-sm text-gray-600">طلب #{order.id}</p>
          </div>
        </div>

        <span
          className={`px-2.5 py-1 rounded-full text-xs font-medium border ${getStatusColor(
            order.status
          )}`}
        >
          {getStatusText(order.status)}
        </span>
      </div>

      {/* Order Details */}
      <div className="grid grid-cols-2 gap-4 mb-3">
        <div>
          <p className="text-xs text-gray-500 mb-1">العنوان</p>
          <p className="text-sm text-gray-900">{order.store_address}</p>
        </div>
        <div>
          <p className="text-xs text-gray-500 mb-1">الموزع</p>
          <p className="text-sm text-gray-900">
            {order.distributor_name || "غير محدد"}
          </p>
        </div>
      </div>

      {/* Order Metrics */}
      <div className="grid grid-cols-3 gap-4 mb-3">
        <div className="text-center p-2 bg-gray-50 rounded-lg">
          <p className="text-xs text-gray-600">المنتجات</p>
          <p className="text-sm font-semibold text-gray-900">
            {order.items_count || 0}
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

      {/* Order Time */}
      <div className="flex items-center justify-between text-xs text-gray-500 border-t pt-3">
        <div className="flex items-center space-x-1 space-x-reverse">
          <Clock className="w-3 h-3" />
          <span>
            تاريخ الطلب:{" "}
            {new Date(order.created_at).toLocaleDateString("en-GB")}
          </span>
        </div>
        <div className="flex items-center space-x-1 space-x-reverse">
          <Calendar className="w-3 h-3" />
          <span>
            {new Date(order.created_at).toLocaleTimeString("ar-SA", {
              hour: "2-digit",
              minute: "2-digit",
            })}
          </span>
        </div>
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

      {/* Action Button */}
      <div className="mt-4">
        <EnhancedButton
          size="sm"
          variant="outline"
          className="w-full flex items-center justify-center space-x-2 space-x-reverse"
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
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 flex items-center">
            <Coffee className="w-6 h-6 mr-3" />
            العمليات اليومية
          </h2>
          <p className="text-gray-600 mt-1">
            إدارة ومراقبة الطلبات اليومية لتاريخ{" "}
            {new Date(selectedDate).toLocaleDateString("en-GB")}
          </p>
        </div>

        <div className="flex items-center space-x-4 space-x-reverse">
          <div className="flex items-center space-x-2 space-x-reverse text-sm text-gray-600">
            <Calendar className="w-4 h-4" />
            <span>{new Date(selectedDate).toLocaleDateString("en-GB")}</span>
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

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <Card className="bg-gradient-to-r from-blue-500 to-blue-600 text-white">
          <CardBody className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-blue-100 text-sm">إجمالي الطلبات</p>
                <p className="text-2xl font-bold">
                  {statistics.totalOrders || 0}
                </p>
              </div>
              <Package className="w-8 h-8 text-blue-200" />
            </div>
          </CardBody>
        </Card>

        <Card className="bg-gradient-to-r from-green-500 to-green-600 text-white">
          <CardBody className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-green-100 text-sm">تم التسليم</p>
                <p className="text-2xl font-bold">
                  {statistics.completedOrders || 0}
                </p>
              </div>
              <CheckCircle className="w-8 h-8 text-green-200" />
            </div>
          </CardBody>
        </Card>

        <Card className="bg-gradient-to-r from-yellow-500 to-yellow-600 text-white">
          <CardBody className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-yellow-100 text-sm">في الانتظار</p>
                <p className="text-2xl font-bold">
                  {statistics.pendingOrders || 0}
                </p>
              </div>
              <Clock className="w-8 h-8 text-yellow-200" />
            </div>
          </CardBody>
        </Card>

        <Card className="bg-gradient-to-r from-purple-500 to-purple-600 text-white">
          <CardBody className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-purple-100 text-sm">إجمالي الإيرادات</p>
                <p className="text-2xl font-bold">
                  €{(statistics.totalRevenue || 0).toFixed(2)}
                </p>
              </div>
              <Euro className="w-8 h-8 text-purple-200" />
            </div>
          </CardBody>
        </Card>

        <Card className="bg-gradient-to-r from-indigo-500 to-indigo-600 text-white">
          <CardBody className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-indigo-100 text-sm">متوسط قيمة الطلب</p>
                <p className="text-2xl font-bold">
                  €{(statistics.averageOrderValue || 0).toFixed(2)}
                </p>
              </div>
              <BarChart3 className="w-8 h-8 text-indigo-200" />
            </div>
          </CardBody>
        </Card>
      </div>

      {/* Filters and Search */}
      <Card className="bg-white shadow-lg">
        <CardBody className="p-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <EnhancedInput
                type="text"
                placeholder="البحث في الطلبات..."
                value={filters.search}
                onChange={(e) =>
                  setFilters((prev) => ({ ...prev, search: e.target.value }))
                }
                icon={<Search className="w-4 h-4" />}
              />
            </div>

            <div>
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

            <div>
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

            <div className="flex space-x-2 space-x-reverse">
              <EnhancedButton
                onClick={() => handleSort("created_at")}
                variant="outline"
                size="sm"
                className="flex items-center space-x-1 space-x-reverse flex-1"
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
        </CardBody>
      </Card>

      {/* Orders Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <AnimatePresence>
          {filteredOrders.length > 0 ? (
            filteredOrders.map((order) => (
              <OrderCard key={order.id} order={order} />
            ))
          ) : (
            <div className="col-span-full text-center py-12">
              <Package className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500 text-lg">لا توجد طلبات متاحة</p>
              <p className="text-gray-400 text-sm">
                {filters.search ||
                filters.status !== "all" ||
                filters.priority !== "all"
                  ? "جرب تغيير معايير البحث"
                  : "لم يتم إنشاء أي طلبات لهذا اليوم"}
              </p>
            </div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default DailyOperationsManager;
