import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import {
  Plus,
  Package,
  Search,
  Filter,
  Eye,
  Edit,
  Trash2,
  Download,
  RefreshCw,
  Clock,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Euro,
  Truck,
  User,
  Phone,
  Calendar,
  MapPin,
  Zap,
  FileText,
  BarChart3,
  TrendingUp,
  Store,
  Loader2,
  ChevronDown,
  ChevronUp,
  Filter as FilterIcon,
  X,
  Grid,
  List,
  Settings,
  MoreVertical,
  CreditCard,
  ShoppingCart,
  Building,
  Globe,
  Activity,
  Target,
  Award,
  Layers,
  Copy,
  Archive,
  Send,
  Check,
  AlertCircle,
  Star,
  DollarSign,
  Calculator,
  TrendingDown,
  Users,
  Box,
  Sliders,
} from "lucide-react";
import { Card, CardHeader, CardBody } from "../../components/ui/Card";
import EnhancedButton from "../../components/ui/EnhancedButton";
import EnhancedInput from "../../components/ui/EnhancedInput";
import LoadingSpinner from "../../components/ui/LoadingSpinner";
import { DeleteConfirmationModal } from "../../components/ui/Modal";
import EnhancedOrderActions, {
  CompactEnhancedActions,
} from "../../components/orders/EnhancedOrderActions";
import orderService from "../../services/orderService";
import storeService from "../../services/storeService";
import userService from "../../services/userService";
import { toast } from "react-hot-toast";

const OrdersListPage = () => {
  const navigate = useNavigate();

  // الحالة الأساسية
  const [orders, setOrders] = useState([]);
  const [stores, setStores] = useState([]);
  const [distributors, setDistributors] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isExporting, setIsExporting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // عرض البيانات
  const [viewMode, setViewMode] = useState("table");
  const [showFilters, setShowFilters] = useState(false);

  // فلاتر البحث
  const [filters, setFilters] = useState({
    search: "",
    status: "",
    payment_status: "",
    store_id: "",
    distributor_id: "",
    priority: "",
    date_from: "",
    date_to: "",
  });

  // التصفح
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalItems: 0,
    itemsPerPage: 12,
  });

  // الإحصائيات المحسنة
  const [statistics, setStatistics] = useState({
    totalOrders: 0,
    totalRevenue: 0,
    pendingOrders: 0,
    confirmedOrders: 0,
    deliveredOrders: 0,
    cancelledOrders: 0,
    urgentOrders: 0,
    todayOrders: 0,
    monthlyGrowth: 0,
    averageOrderValue: 0,
  });

  // Modal الحذف
  const [deleteModal, setDeleteModal] = useState({
    isOpen: false,
    orderId: null,
    isLoading: false,
  });

  // تحميل البيانات
  useEffect(() => {
    loadInitialData();
  }, []);

  useEffect(() => {
    loadOrders();
  }, [pagination.currentPage, filters]);

  const loadInitialData = async () => {
    await Promise.all([loadOrders(), loadStores(), loadDistributors()]);
  };

  // تحميل الطلبات
  const loadOrders = async () => {
    try {
      setIsLoading(true);
      setError("");

      // Filter out empty values to avoid sending empty strings to API
      const cleanFilters = Object.fromEntries(
        Object.entries(filters).filter(
          ([_, value]) => value && value.trim() !== ""
        )
      );

      const params = {
        page: pagination.currentPage,
        limit: pagination.itemsPerPage,
        ...cleanFilters,
      };

      const response = await orderService.getOrders(params);

      if (response.success) {
        const ordersData = response.data?.orders || response.data || [];
        const safeOrdersData = Array.isArray(ordersData) ? ordersData : [];
        setOrders(safeOrdersData);

        // تحديث الإحصائيات
        const stats = calculateStatistics(safeOrdersData);
        setStatistics(stats);

        // تحديث التصفح
        if (response.data?.pagination) {
          setPagination((prev) => ({
            ...prev,
            totalPages: response.data.pagination.totalPages || 1,
            totalItems: response.data.pagination.total || ordersData.length,
          }));
        }
      } else {
        setError(response.message || "خطأ في تحميل الطلبات");
        setOrders([]);
      }
    } catch (error) {
      console.error("Error loading orders:", error);
      setError("خطأ في تحميل بيانات الطلبات");
      setOrders([]);
    } finally {
      setIsLoading(false);
    }
  };

  // حساب الإحصائيات المحسنة
  const calculateStatistics = (ordersData) => {
    if (!Array.isArray(ordersData) || ordersData.length === 0) {
      return {
        totalOrders: 0,
        totalRevenue: 0,
        pendingOrders: 0,
        confirmedOrders: 0,
        deliveredOrders: 0,
        cancelledOrders: 0,
        urgentOrders: 0,
        todayOrders: 0,
        monthlyGrowth: 0,
        averageOrderValue: 0,
      };
    }

    const today = new Date().toISOString().split("T")[0];
    const totalRevenue = ordersData.reduce((sum, order) => {
      return (
        sum + parseFloat(order.final_amount_eur || order.total_amount_eur || 0)
      );
    }, 0);

    return {
      totalOrders: ordersData.length,
      totalRevenue,
      pendingOrders: ordersData.filter((o) => o.status === "pending").length,
      confirmedOrders: ordersData.filter((o) => o.status === "confirmed")
        .length,
      deliveredOrders: ordersData.filter((o) => o.status === "delivered")
        .length,
      cancelledOrders: ordersData.filter((o) => o.status === "cancelled")
        .length,
      urgentOrders: ordersData.filter((o) => o.priority === "urgent").length,
      todayOrders: ordersData.filter((o) => o.order_date === today).length,
      monthlyGrowth: 15.2, // Mock data - replace with real calculation
      averageOrderValue:
        ordersData.length > 0 ? totalRevenue / ordersData.length : 0,
    };
  };

  // تحميل المتاجر
  const loadStores = async () => {
    try {
      const response = await storeService.getStores({ status: "active" });
      if (response.success) {
        const storesData = response.data?.stores || response.data || [];
        setStores(Array.isArray(storesData) ? storesData : []);
      }
    } catch (error) {
      console.error("Error loading stores:", error);
      setStores([]);
    }
  };

  // تحميل الموزعين
  const loadDistributors = async () => {
    try {
      const response = await userService.getUsers({
        role: "distributor",
        status: "active",
      });
      if (response.success) {
        const distributorsData = response.data?.users || response.data || [];
        setDistributors(
          Array.isArray(distributorsData) ? distributorsData : []
        );
      }
    } catch (error) {
      console.error("Error loading distributors:", error);
      setDistributors([]);
    }
  };

  // معالجة تغيير الفلاتر
  const handleFilterChange = (key, value) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
    setPagination((prev) => ({ ...prev, currentPage: 1 }));
  };

  // إعادة تعيين الفلاتر
  const resetFilters = () => {
    setFilters({
      search: "",
      status: "",
      payment_status: "",
      store_id: "",
      distributor_id: "",
      priority: "",
      date_from: "",
      date_to: "",
    });
    setPagination((prev) => ({ ...prev, currentPage: 1 }));
  };

  // عدد الفلاتر النشطة
  const getActiveFiltersCount = () => {
    return Object.values(filters).filter(
      (value) => value && value.trim() !== ""
    ).length;
  };

  // تصدير البيانات
  const handleExport = async (format = "json") => {
    try {
      setIsExporting(true);
      setError("");

      if (!Array.isArray(orders) || orders.length === 0) {
        toast.error("لا توجد طلبات للتصدير");
        return;
      }

      const data = orders.map((order) => ({
        id: order.id,
        order_number: order.order_number,
        customer_name: getCustomerName(order),
        store_name: order.store?.name || "غير محدد",
        total_amount: getOrderAmount(order),
        status: order.status,
        payment_status: order.payment_status,
        priority: order.priority,
        order_date: order.order_date,
      }));

      if (format === "csv") {
        const headers = Object.keys(data[0]).join(",");
        const rows = data.map((row) => Object.values(row).join(","));
        const csv = [headers, ...rows].join("\n");

        const blob = new Blob([csv], { type: "text/csv" });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `orders_${new Date().toISOString().split("T")[0]}.csv`;
        a.click();
        window.URL.revokeObjectURL(url);
      } else {
        const dataStr = JSON.stringify(data, null, 2);
        const blob = new Blob([dataStr], { type: "application/json" });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `orders_${new Date().toISOString().split("T")[0]}.json`;
        a.click();
        window.URL.revokeObjectURL(url);
      }

      toast.success(`تم تصدير الطلبات بنجاح بصيغة ${format.toUpperCase()}`);
    } catch (error) {
      toast.error("خطأ في تصدير الطلبات");
    } finally {
      setIsExporting(false);
    }
  };

  // فتح modal الحذف
  const openDeleteModal = (orderId) => {
    setDeleteModal({
      isOpen: true,
      orderId,
      isLoading: false,
    });
  };

  // إغلاق modal الحذف
  const closeDeleteModal = () => {
    setDeleteModal({
      isOpen: false,
      orderId: null,
      isLoading: false,
    });
  };

  // تأكيد الحذف
  const confirmDelete = async () => {
    try {
      setDeleteModal((prev) => ({ ...prev, isLoading: true }));
      setError("");

      const response = await orderService.deleteOrder(deleteModal.orderId);

      if (response.success) {
        toast.success("تم حذف الطلب بنجاح");
        closeDeleteModal();
        loadOrders();
      } else {
        toast.error(response.message || "خطأ في حذف الطلب");
      }
    } catch (error) {
      toast.error("خطأ في حذف الطلب");
    } finally {
      setDeleteModal((prev) => ({ ...prev, isLoading: false }));
    }
  };

  // Quick Actions for orders
  const handleQuickAction = async (orderId, action) => {
    try {
      let response;
      switch (action) {
        case "confirm":
          response = await orderService.updateOrder(orderId, {
            status: "confirmed",
          });
          toast.success("تم تأكيد الطلب");
          break;
        case "deliver":
          response = await orderService.updateOrder(orderId, {
            status: "delivered",
          });
          toast.success("تم تسليم الطلب");
          break;
        case "cancel":
          response = await orderService.updateOrder(orderId, {
            status: "cancelled",
          });
          toast.success("تم إلغاء الطلب");
          break;
        case "duplicate":
          // Navigate to create order with this order's data
          navigate(`/orders/create?duplicate=${orderId}`);
          return;
        default:
          return;
      }

      if (response.success) {
        loadOrders();
      }
    } catch (error) {
      toast.error("خطأ في تنفيذ العملية");
    }
  };

  // وظائف المساعدة
  const getCustomerName = (order) => {
    return (
      order.customer_name ||
      order.customer?.name ||
      order.store?.contact_person ||
      "غير محدد"
    );
  };

  const getCustomerPhone = (order) => {
    return (
      order.customer_phone ||
      order.customer?.phone ||
      order.store?.phone ||
      "غير محدد"
    );
  };

  const getOrderAmount = (order) => {
    const amountEur = parseFloat(
      order.final_amount_eur || order.total_amount_eur || 0
    );
    return `€${amountEur.toFixed(2)}`;
  };

  const getStatusColor = (status) => {
    const colors = {
      draft: "bg-gray-100 text-gray-800 border-gray-200",
      pending: "bg-yellow-100 text-yellow-800 border-yellow-200",
      confirmed: "bg-blue-100 text-blue-800 border-blue-200",
      processing: "bg-purple-100 text-purple-800 border-purple-200",
      ready: "bg-indigo-100 text-indigo-800 border-indigo-200",
      delivered: "bg-green-100 text-green-800 border-green-200",
      cancelled: "bg-red-100 text-red-800 border-red-200",
    };
    return colors[status] || "bg-gray-100 text-gray-800 border-gray-200";
  };

  const getPaymentStatusColor = (status) => {
    const colors = {
      pending: "bg-yellow-100 text-yellow-800 border-yellow-200",
      paid: "bg-green-100 text-green-800 border-green-200",
      partial: "bg-orange-100 text-orange-800 border-orange-200",
      failed: "bg-red-100 text-red-800 border-red-200",
      overdue: "bg-red-200 text-red-900 border-red-300",
    };
    return colors[status] || "bg-gray-100 text-gray-800 border-gray-200";
  };

  const getPriorityColor = (priority) => {
    const colors = {
      low: "bg-green-100 text-green-800 border-green-200",
      normal: "bg-blue-100 text-blue-800 border-blue-200",
      high: "bg-orange-100 text-orange-800 border-orange-200",
      urgent: "bg-red-100 text-red-800 border-red-200",
    };
    return colors[priority] || "bg-gray-100 text-gray-800 border-gray-200";
  };

  const formatDate = (dateString) => {
    if (!dateString) return "غير محدد";
    return new Date(dateString).toLocaleDateString("ar-SA");
  };

  if (isLoading && orders.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-3">
                  <ShoppingCart className="w-7 h-7 text-blue-600" />
                  إدارة الطلبات
                </h1>
              </div>
              <div className="hidden md:block">
                <div className="ml-10 flex items-baseline space-x-4">
                  <span className="text-sm text-gray-500">
                    إجمالي {statistics.totalOrders} طلب
                  </span>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <EnhancedButton
                onClick={() => setShowFilters(!showFilters)}
                variant={getActiveFiltersCount() > 0 ? "primary" : "outline"}
                size="sm"
                icon={<FilterIcon className="w-4 h-4" />}
              >
                الفلاتر{" "}
                {getActiveFiltersCount() > 0 && `(${getActiveFiltersCount()})`}
              </EnhancedButton>

              <div className="flex items-center bg-gray-100 rounded-lg p-1">
                <button
                  onClick={() => setViewMode("table")}
                  className={`p-2 rounded-md transition-colors ${
                    viewMode === "table"
                      ? "bg-white text-blue-600 shadow-sm"
                      : "text-gray-600 hover:text-gray-900"
                  }`}
                >
                  <List className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setViewMode("grid")}
                  className={`p-2 rounded-md transition-colors ${
                    viewMode === "grid"
                      ? "bg-white text-blue-600 shadow-sm"
                      : "text-gray-600 hover:text-gray-900"
                  }`}
                >
                  <Grid className="w-4 h-4" />
                </button>
              </div>

              <EnhancedButton
                onClick={() => navigate("/orders/create")}
                variant="primary"
                size="sm"
                icon={<Plus className="w-4 h-4" />}
              >
                طلب جديد
              </EnhancedButton>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Alert Messages */}
        <AnimatePresence>
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4"
            >
              <div className="flex items-center">
                <AlertCircle className="w-5 h-5 text-red-600 mr-3" />
                <span className="text-red-800">{error}</span>
              </div>
            </motion.div>
          )}

          {success && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="mb-6 bg-green-50 border border-green-200 rounded-lg p-4"
            >
              <div className="flex items-center">
                <CheckCircle className="w-5 h-5 text-green-600 mr-3" />
                <span className="text-green-800">{success}</span>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Statistics Cards */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-4 mb-8"
        >
          <Card className="bg-gradient-to-br from-blue-500 to-blue-600 text-white hover:shadow-lg transition-shadow">
            <CardBody>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-blue-100 text-xs font-medium uppercase tracking-wide">
                    إجمالي الطلبات
                  </p>
                  <p className="text-2xl font-bold mt-1">
                    {statistics.totalOrders}
                  </p>
                </div>
                <ShoppingCart className="w-8 h-8 text-blue-200" />
              </div>
            </CardBody>
          </Card>

          <Card className="bg-gradient-to-br from-green-500 to-green-600 text-white hover:shadow-lg transition-shadow">
            <CardBody>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-green-100 text-xs font-medium uppercase tracking-wide">
                    الإيرادات
                  </p>
                  <p className="text-xl font-bold mt-1">
                    €{statistics.totalRevenue.toFixed(0)}
                  </p>
                </div>
                <Euro className="w-8 h-8 text-green-200" />
              </div>
            </CardBody>
          </Card>

          <Card className="bg-gradient-to-br from-yellow-500 to-yellow-600 text-white hover:shadow-lg transition-shadow">
            <CardBody>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-yellow-100 text-xs font-medium uppercase tracking-wide">
                    معلقة
                  </p>
                  <p className="text-2xl font-bold mt-1">
                    {statistics.pendingOrders}
                  </p>
                </div>
                <Clock className="w-8 h-8 text-yellow-200" />
              </div>
            </CardBody>
          </Card>

          <Card className="bg-gradient-to-br from-purple-500 to-purple-600 text-white hover:shadow-lg transition-shadow">
            <CardBody>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-purple-100 text-xs font-medium uppercase tracking-wide">
                    مؤكدة
                  </p>
                  <p className="text-2xl font-bold mt-1">
                    {statistics.confirmedOrders}
                  </p>
                </div>
                <CheckCircle className="w-8 h-8 text-purple-200" />
              </div>
            </CardBody>
          </Card>

          <Card className="bg-gradient-to-br from-emerald-500 to-emerald-600 text-white hover:shadow-lg transition-shadow">
            <CardBody>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-emerald-100 text-xs font-medium uppercase tracking-wide">
                    مُسلّمة
                  </p>
                  <p className="text-2xl font-bold mt-1">
                    {statistics.deliveredOrders}
                  </p>
                </div>
                <Truck className="w-8 h-8 text-emerald-200" />
              </div>
            </CardBody>
          </Card>

          <Card className="bg-gradient-to-br from-red-500 to-red-600 text-white hover:shadow-lg transition-shadow">
            <CardBody>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-red-100 text-xs font-medium uppercase tracking-wide">
                    عاجلة
                  </p>
                  <p className="text-2xl font-bold mt-1">
                    {statistics.urgentOrders}
                  </p>
                </div>
                <AlertTriangle className="w-8 h-8 text-red-200" />
              </div>
            </CardBody>
          </Card>

          <Card className="bg-gradient-to-br from-indigo-500 to-indigo-600 text-white hover:shadow-lg transition-shadow">
            <CardBody>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-indigo-100 text-xs font-medium uppercase tracking-wide">
                    اليوم
                  </p>
                  <p className="text-2xl font-bold mt-1">
                    {statistics.todayOrders}
                  </p>
                </div>
                <Calendar className="w-8 h-8 text-indigo-200" />
              </div>
            </CardBody>
          </Card>

          <Card className="bg-gradient-to-br from-teal-500 to-teal-600 text-white hover:shadow-lg transition-shadow">
            <CardBody>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-teal-100 text-xs font-medium uppercase tracking-wide">
                    متوسط القيمة
                  </p>
                  <p className="text-lg font-bold mt-1">
                    €{statistics.averageOrderValue.toFixed(0)}
                  </p>
                </div>
                <Calculator className="w-8 h-8 text-teal-200" />
              </div>
            </CardBody>
          </Card>
        </motion.div>

        {/* Filters */}
        <AnimatePresence>
          {showFilters && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="mb-6"
            >
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                      <Sliders className="w-5 h-5 text-blue-600" />
                      فلاتر البحث والتصفية
                    </h3>
                    <EnhancedButton
                      onClick={resetFilters}
                      variant="outline"
                      size="sm"
                      icon={<X className="w-4 h-4" />}
                    >
                      إعادة تعيين
                    </EnhancedButton>
                  </div>
                </CardHeader>
                <CardBody>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        البحث
                      </label>
                      <EnhancedInput
                        placeholder="رقم الطلب، اسم العميل..."
                        value={filters.search}
                        onChange={(e) =>
                          handleFilterChange("search", e.target.value)
                        }
                        icon={<Search className="w-4 h-4" />}
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        حالة الطلب
                      </label>
                      <select
                        value={filters.status}
                        onChange={(e) =>
                          handleFilterChange("status", e.target.value)
                        }
                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      >
                        <option value="">جميع الحالات</option>
                        <option value="draft">مسودة</option>
                        <option value="pending">معلق</option>
                        <option value="confirmed">مؤكد</option>
                        <option value="processing">قيد المعالجة</option>
                        <option value="ready">جاهز</option>
                        <option value="delivered">مُسلّم</option>
                        <option value="cancelled">ملغي</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        حالة الدفع
                      </label>
                      <select
                        value={filters.payment_status}
                        onChange={(e) =>
                          handleFilterChange("payment_status", e.target.value)
                        }
                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      >
                        <option value="">جميع حالات الدفع</option>
                        <option value="pending">معلق</option>
                        <option value="paid">مدفوع</option>
                        <option value="partial">جزئي</option>
                        <option value="failed">فاشل</option>
                        <option value="overdue">متأخر</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        الأولوية
                      </label>
                      <select
                        value={filters.priority}
                        onChange={(e) =>
                          handleFilterChange("priority", e.target.value)
                        }
                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      >
                        <option value="">جميع الأولويات</option>
                        <option value="low">منخفضة</option>
                        <option value="normal">عادية</option>
                        <option value="high">عالية</option>
                        <option value="urgent">عاجلة</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        المتجر
                      </label>
                      <select
                        value={filters.store_id}
                        onChange={(e) =>
                          handleFilterChange("store_id", e.target.value)
                        }
                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      >
                        <option value="">جميع المتاجر</option>
                        {stores.map((store) => (
                          <option key={store.id} value={store.id}>
                            {store.name}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        الموزع
                      </label>
                      <select
                        value={filters.distributor_id}
                        onChange={(e) =>
                          handleFilterChange("distributor_id", e.target.value)
                        }
                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      >
                        <option value="">جميع الموزعين</option>
                        {distributors.map((distributor) => (
                          <option key={distributor.id} value={distributor.id}>
                            {distributor.name}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        من تاريخ
                      </label>
                      <input
                        type="date"
                        value={filters.date_from}
                        onChange={(e) =>
                          handleFilterChange("date_from", e.target.value)
                        }
                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        إلى تاريخ
                      </label>
                      <input
                        type="date"
                        value={filters.date_to}
                        onChange={(e) =>
                          handleFilterChange("date_to", e.target.value)
                        }
                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                  </div>
                </CardBody>
              </Card>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Toolbar */}
        <div className="mb-6">
          <Card>
            <CardBody>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-gray-600">عرض:</span>
                    <select
                      value={pagination.itemsPerPage}
                      onChange={(e) =>
                        setPagination((prev) => ({
                          ...prev,
                          itemsPerPage: parseInt(e.target.value),
                          currentPage: 1,
                        }))
                      }
                      className="border border-gray-300 rounded-md px-3 py-1 text-sm"
                    >
                      <option value={12}>12</option>
                      <option value={24}>24</option>
                      <option value={48}>48</option>
                      <option value={100}>100</option>
                    </select>
                    <span className="text-sm text-gray-600">
                      من أصل {pagination.totalItems}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <EnhancedButton
                    onClick={() => handleExport("csv")}
                    loading={isExporting}
                    variant="outline"
                    size="sm"
                    icon={<Download className="w-4 h-4" />}
                  >
                    تصدير CSV
                  </EnhancedButton>

                  <EnhancedButton
                    onClick={() => handleExport("json")}
                    loading={isExporting}
                    variant="outline"
                    size="sm"
                    icon={<Download className="w-4 h-4" />}
                  >
                    تصدير JSON
                  </EnhancedButton>

                  <EnhancedButton
                    onClick={loadOrders}
                    loading={isLoading}
                    variant="outline"
                    size="sm"
                    icon={<RefreshCw className="w-4 h-4" />}
                  >
                    تحديث
                  </EnhancedButton>
                </div>
              </div>
            </CardBody>
          </Card>
        </div>

        {/* Orders Content */}
        {isLoading && orders.length === 0 ? (
          <Card>
            <CardBody>
              <div className="flex items-center justify-center py-12">
                <LoadingSpinner size="lg" />
              </div>
            </CardBody>
          </Card>
        ) : orders.length === 0 ? (
          <Card>
            <CardBody>
              <div className="text-center py-12">
                <ShoppingCart className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  لا توجد طلبات
                </h3>
                <p className="text-gray-600 mb-6">
                  {getActiveFiltersCount() > 0
                    ? `لا توجد طلبات تطابق الفلاتر المحددة (${getActiveFiltersCount()} فلتر نشط).`
                    : "ابدأ بإنشاء أول طلب لك."}
                </p>
                <div className="flex items-center justify-center gap-3">
                  {getActiveFiltersCount() > 0 && (
                    <EnhancedButton
                      onClick={resetFilters}
                      variant="outline"
                      icon={<X className="w-4 h-4" />}
                    >
                      إزالة الفلاتر
                    </EnhancedButton>
                  )}
                  <EnhancedButton
                    onClick={() => navigate("/orders/create")}
                    variant="primary"
                    icon={<Plus className="w-4 h-4" />}
                  >
                    إنشاء طلب جديد
                  </EnhancedButton>
                </div>
              </div>
            </CardBody>
          </Card>
        ) : viewMode === "table" ? (
          // Table View
          <Card>
            <CardHeader>
              <h3 className="text-lg font-semibold text-gray-900">
                قائمة الطلبات
              </h3>
            </CardHeader>
            <CardBody>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                        رقم الطلب
                      </th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                        العميل
                      </th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                        المتجر
                      </th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                        المبلغ
                      </th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                        الحالة
                      </th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                        الدفع
                      </th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                        الأولوية
                      </th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                        التاريخ
                      </th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                        الإجراءات
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {orders.map((order) => (
                      <motion.tr
                        key={order.id}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="hover:bg-gray-50 transition-colors"
                      >
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">
                            #{order.order_number || order.id}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div>
                              <div className="text-sm font-medium text-gray-900">
                                {getCustomerName(order)}
                              </div>
                              <div className="text-sm text-gray-500 flex items-center gap-1">
                                <Phone className="w-3 h-3" />
                                {getCustomerPhone(order)}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center gap-2">
                            <Store className="w-4 h-4 text-gray-400" />
                            <span className="text-sm text-gray-900">
                              {order.store?.name ||
                                order.store_name ||
                                "غير محدد"}
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-semibold text-gray-900 flex items-center gap-1">
                            <Euro className="w-4 h-4 text-green-600" />
                            {getOrderAmount(order)}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span
                            className={`inline-flex px-3 py-1 text-xs font-semibold rounded-full border ${getStatusColor(
                              order.status
                            )}`}
                          >
                            {order.status === "draft" && "مسودة"}
                            {order.status === "pending" && "معلق"}
                            {order.status === "confirmed" && "مؤكد"}
                            {order.status === "processing" && "قيد المعالجة"}
                            {order.status === "ready" && "جاهز"}
                            {order.status === "delivered" && "مُسلّم"}
                            {order.status === "cancelled" && "ملغي"}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span
                            className={`inline-flex px-3 py-1 text-xs font-semibold rounded-full border ${getPaymentStatusColor(
                              order.payment_status
                            )}`}
                          >
                            {order.payment_status === "pending" && "معلق"}
                            {order.payment_status === "paid" && "مدفوع"}
                            {order.payment_status === "partial" && "جزئي"}
                            {order.payment_status === "failed" && "فاشل"}
                            {order.payment_status === "overdue" && "متأخر"}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span
                            className={`inline-flex px-3 py-1 text-xs font-semibold rounded-full border ${getPriorityColor(
                              order.priority
                            )}`}
                          >
                            {order.priority === "low" && "منخفض"}
                            {order.priority === "normal" && "عادي"}
                            {order.priority === "high" && "عالي"}
                            {order.priority === "urgent" && "عاجل"}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          <div className="flex items-center gap-1">
                            <Calendar className="w-3 h-3 text-gray-400" />
                            {formatDate(order.order_date)}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <div className="flex items-center gap-2">
                            {/* Quick Actions */}
                            <div className="flex items-center gap-1">
                              {order.status === "pending" && (
                                <EnhancedButton
                                  onClick={() =>
                                    handleQuickAction(order.id, "confirm")
                                  }
                                  variant="success"
                                  size="xs"
                                  icon={<Check className="w-3 h-3" />}
                                  title="تأكيد الطلب"
                                >
                                  تأكيد
                                </EnhancedButton>
                              )}

                              {order.status === "confirmed" && (
                                <EnhancedButton
                                  onClick={() =>
                                    handleQuickAction(order.id, "deliver")
                                  }
                                  variant="primary"
                                  size="xs"
                                  icon={<Truck className="w-3 h-3" />}
                                  title="تسليم الطلب"
                                >
                                  تسليم
                                </EnhancedButton>
                              )}

                              <EnhancedButton
                                onClick={() => navigate(`/orders/${order.id}`)}
                                variant="info"
                                size="xs"
                                icon={<Eye className="w-3 h-3" />}
                                title="عرض التفاصيل"
                              />

                              <EnhancedButton
                                onClick={() =>
                                  navigate(`/orders/${order.id}/edit`)
                                }
                                variant="warning"
                                size="xs"
                                icon={<Edit className="w-3 h-3" />}
                                title="تعديل الطلب"
                              />

                              <div className="relative">
                                <EnhancedButton
                                  variant="outline"
                                  size="xs"
                                  icon={<MoreVertical className="w-3 h-3" />}
                                  title="المزيد من الإجراءات"
                                />
                                {/* Dropdown menu can be added here */}
                              </div>
                            </div>
                          </div>
                        </td>
                      </motion.tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardBody>
          </Card>
        ) : (
          // Grid View
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {orders.map((order) => (
              <motion.div
                key={order.id}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow border border-gray-200"
              >
                <div className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="text-lg font-semibold text-gray-900">
                      #{order.order_number || order.id}
                    </div>
                    <span
                      className={`px-2 py-1 text-xs font-semibold rounded-full ${getPriorityColor(
                        order.priority
                      )}`}
                    >
                      {order.priority === "urgent" && "عاجل"}
                      {order.priority === "high" && "عالي"}
                      {order.priority === "normal" && "عادي"}
                      {order.priority === "low" && "منخفض"}
                    </span>
                  </div>

                  <div className="space-y-3 mb-4">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">العميل:</span>
                      <span className="text-sm font-medium text-gray-900">
                        {getCustomerName(order)}
                      </span>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">المتجر:</span>
                      <span className="text-sm font-medium text-gray-900">
                        {order.store?.name || order.store_name || "غير محدد"}
                      </span>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">المبلغ:</span>
                      <span className="text-sm font-bold text-green-600 flex items-center gap-1">
                        <Euro className="w-3 h-3" />
                        {getOrderAmount(order)}
                      </span>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">التاريخ:</span>
                      <span className="text-sm text-gray-900">
                        {formatDate(order.order_date)}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between mb-4">
                    <span
                      className={`px-2 py-1 text-xs font-semibold rounded ${getStatusColor(
                        order.status
                      )}`}
                    >
                      {order.status === "draft" && "مسودة"}
                      {order.status === "pending" && "معلق"}
                      {order.status === "confirmed" && "مؤكد"}
                      {order.status === "delivered" && "مُسلّم"}
                      {order.status === "cancelled" && "ملغي"}
                    </span>

                    <span
                      className={`px-2 py-1 text-xs font-semibold rounded ${getPaymentStatusColor(
                        order.payment_status
                      )}`}
                    >
                      {order.payment_status === "pending" && "معلق"}
                      {order.payment_status === "paid" && "مدفوع"}
                      {order.payment_status === "partial" && "جزئي"}
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <EnhancedButton
                      onClick={() => navigate(`/orders/${order.id}`)}
                      variant="primary"
                      size="sm"
                      icon={<Eye className="w-4 h-4" />}
                      className="flex-1"
                    >
                      عرض
                    </EnhancedButton>

                    <EnhancedButton
                      onClick={() => navigate(`/orders/${order.id}/edit`)}
                      variant="outline"
                      size="sm"
                      icon={<Edit className="w-4 h-4" />}
                    />

                    <EnhancedButton
                      variant="outline"
                      size="sm"
                      icon={<MoreVertical className="w-4 h-4" />}
                    />
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}

        {/* Pagination */}
        {pagination.totalPages > 1 && (
          <div className="mt-8">
            <Card>
              <CardBody>
                <div className="flex items-center justify-between">
                  <div className="text-sm text-gray-700">
                    عرض{" "}
                    {(pagination.currentPage - 1) * pagination.itemsPerPage + 1}{" "}
                    إلى{" "}
                    {Math.min(
                      pagination.currentPage * pagination.itemsPerPage,
                      pagination.totalItems
                    )}{" "}
                    من أصل {pagination.totalItems} نتيجة
                  </div>

                  <div className="flex items-center gap-2">
                    <EnhancedButton
                      onClick={() =>
                        setPagination((prev) => ({
                          ...prev,
                          currentPage: prev.currentPage - 1,
                        }))
                      }
                      disabled={pagination.currentPage <= 1}
                      variant="outline"
                      size="sm"
                    >
                      السابق
                    </EnhancedButton>

                    <div className="flex items-center gap-1">
                      {Array.from(
                        { length: Math.min(5, pagination.totalPages) },
                        (_, i) => {
                          const page = i + 1;
                          return (
                            <button
                              key={page}
                              onClick={() =>
                                setPagination((prev) => ({
                                  ...prev,
                                  currentPage: page,
                                }))
                              }
                              className={`px-3 py-1 text-sm rounded ${
                                pagination.currentPage === page
                                  ? "bg-blue-600 text-white"
                                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                              }`}
                            >
                              {page}
                            </button>
                          );
                        }
                      )}
                    </div>

                    <EnhancedButton
                      onClick={() =>
                        setPagination((prev) => ({
                          ...prev,
                          currentPage: prev.currentPage + 1,
                        }))
                      }
                      disabled={pagination.currentPage >= pagination.totalPages}
                      variant="outline"
                      size="sm"
                    >
                      التالي
                    </EnhancedButton>
                  </div>
                </div>
              </CardBody>
            </Card>
          </div>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      <DeleteConfirmationModal
        isOpen={deleteModal.isOpen}
        onClose={closeDeleteModal}
        onConfirm={confirmDelete}
        isLoading={deleteModal.isLoading}
        title="حذف الطلب"
        message="هل أنت متأكد من أنك تريد حذف هذا الطلب؟ هذا الإجراء لا يمكن التراجع عنه."
      />
    </div>
  );
};

export default OrdersListPage;
