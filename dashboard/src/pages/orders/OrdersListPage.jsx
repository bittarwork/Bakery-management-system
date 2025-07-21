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

  // فلاتر البحث
  const [filters, setFilters] = useState({
    search: "",
    status: "",
    payment_status: "",
    store_id: "",
    distributor_id: "",
    priority: "",
  });

  // التصفح
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalItems: 0,
    itemsPerPage: 10,
  });

  // الإحصائيات
  const [statistics, setStatistics] = useState({
    totalOrders: 0,
    totalRevenue: 0,
    pendingOrders: 0,
    urgentOrders: 0,
  });

  // Modal الحذف
  const [deleteModal, setDeleteModal] = useState({
    isOpen: false,
    orderId: null,
    isLoading: false,
  });

  // تحميل البيانات
  useEffect(() => {
    loadOrders();
    loadStores();
    loadDistributors();
  }, [pagination.currentPage, filters]);

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

      console.log("API call params:", params); // Debug log

      const response = await orderService.getOrders(params);

      if (response.success) {
        const ordersData = response.data?.orders || response.data || [];
        // Ensure ordersData is always an array
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

  // حساب الإحصائيات
  const calculateStatistics = (ordersData) => {
    // Ensure ordersData is an array
    const safeData = Array.isArray(ordersData) ? ordersData : [];

    // Debug: log data to understand structure
    console.log("Orders data for statistics:", safeData);

    const stats = {
      totalOrders: safeData.length,
      totalRevenue: safeData.reduce((sum, order) => {
        const amount = parseFloat(
          order.final_amount_eur || order.total_amount_eur || 0
        );
        return sum + amount;
      }, 0),
      // Fix: Use correct status values based on backend constants
      pendingOrders: safeData.filter(
        (order) => order.status === "draft" || order.status === "confirmed"
      ).length,
      urgentOrders: safeData.filter((order) => order.priority === "urgent")
        .length,
    };

    // Debug: log calculated statistics
    console.log("Calculated statistics:", stats);

    // More detailed breakdown for debugging
    console.log("Status breakdown:", {
      draft: safeData.filter((o) => o.status === "draft").length,
      confirmed: safeData.filter((o) => o.status === "confirmed").length,
      in_progress: safeData.filter((o) => o.status === "in_progress").length,
      delivered: safeData.filter((o) => o.status === "delivered").length,
      cancelled: safeData.filter((o) => o.status === "cancelled").length,
    });

    console.log("Priority breakdown:", {
      low: safeData.filter((o) => o.priority === "low").length,
      normal: safeData.filter((o) => o.priority === "normal").length,
      medium: safeData.filter((o) => o.priority === "medium").length,
      high: safeData.filter((o) => o.priority === "high").length,
      urgent: safeData.filter((o) => o.priority === "urgent").length,
    });

    return stats;
  };

  // تحميل المتاجر
  const loadStores = async () => {
    try {
      const response = await storeService.getStores();
      if (response.success) {
        // Handle different possible response structures
        const storesData = response.data?.stores || response.data || [];
        setStores(Array.isArray(storesData) ? storesData : []);
      } else {
        console.error("Failed to load stores:", response.message);
        setStores([]);
      }
    } catch (error) {
      console.error("Error loading stores:", error);
      setStores([]);
    }
  };

  // تحميل الموزعين
  const loadDistributors = async () => {
    try {
      const response = await userService.getDistributors();
      if (response.success) {
        // Handle different possible response structures
        const distributorsData =
          response.data?.distributors || response.data || [];
        setDistributors(
          Array.isArray(distributorsData) ? distributorsData : []
        );
      } else {
        console.error("Failed to load distributors:", response.message);
        setDistributors([]);
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

  // معالجة البحث
  const handleSearch = (e) => {
    e.preventDefault();
    setPagination((prev) => ({ ...prev, currentPage: 1 }));
  };

  // تصدير البيانات
  const handleExport = async (format = "json") => {
    try {
      setIsExporting(true);
      setError("");

      // Ensure orders is an array before mapping
      if (!Array.isArray(orders) || orders.length === 0) {
        setError("لا توجد طلبات للتصدير");
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

      setSuccess(`تم تصدير الطلبات بنجاح بصيغة ${format.toUpperCase()}`);
    } catch (error) {
      setError("خطأ في تصدير الطلبات");
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
        setSuccess("تم حذف الطلب بنجاح");
        closeDeleteModal();
        loadOrders();
      } else {
        setError(response.message || "خطأ في حذف الطلب");
      }
    } catch (error) {
      setError("خطأ في حذف الطلب");
    } finally {
      setDeleteModal((prev) => ({ ...prev, isLoading: false }));
    }
  };

  // تغيير حالة الطلب
  const handleStatusChange = async (orderId, newStatus) => {
    try {
      setError("");
      const response = await orderService.updateOrder(orderId, {
        status: newStatus,
      });

      if (response.success) {
        setSuccess("تم تحديث حالة الطلب بنجاح");
        loadOrders();
      } else {
        setError(response.message || "خطأ في تحديث حالة الطلب");
      }
    } catch (error) {
      setError("خطأ في تحديث حالة الطلب");
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
      pending: "bg-gray-100 text-gray-800 border-gray-200",
      paid: "bg-green-100 text-green-800 border-green-200",
      partial: "bg-yellow-100 text-yellow-800 border-yellow-200",
      failed: "bg-red-100 text-red-800 border-red-200",
      overdue: "bg-orange-100 text-orange-800 border-orange-200",
    };
    return colors[status] || "bg-gray-100 text-gray-800 border-gray-200";
  };

  const getPriorityColor = (priority) => {
    const colors = {
      low: "bg-green-100 text-green-800 border-green-200",
      normal: "bg-blue-100 text-blue-800 border-blue-200",
      medium: "bg-yellow-100 text-yellow-800 border-yellow-200",
      high: "bg-orange-100 text-orange-800 border-orange-200",
      urgent: "bg-red-100 text-red-800 border-red-200",
    };
    return colors[priority] || "bg-blue-100 text-blue-800 border-blue-200";
  };

  const formatDate = (date) => {
    if (!date) return "غير محدد";
    try {
      return new Date(date).toLocaleDateString("ar-EG");
    } catch (error) {
      return "تاريخ غير صحيح";
    }
  };

  // إزالة الرسائل
  useEffect(() => {
    if (success) {
      const timer = setTimeout(() => setSuccess(""), 5000);
      return () => clearTimeout(timer);
    }
    if (error) {
      const timer = setTimeout(() => setError(""), 5000);
      return () => clearTimeout(timer);
    }
  }, [success, error]);

  // Loading state
  if (isLoading && orders.length === 0) {
    return <LoadingSpinner fullScreen text="جاري تحميل الطلبات..." size="lg" />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-4xl font-bold text-gray-900 mb-2">
                إدارة الطلبات
              </h1>
              <p className="text-gray-600 text-lg">
                إدارة طلبات المخبز ومتابعة حالة التوصيل
              </p>
            </div>
            <div className="flex items-center gap-3">
              <EnhancedButton
                onClick={() => navigate("/orders/create")}
                variant="primary"
                size="lg"
                icon={<Plus className="w-5 h-5" />}
              >
                إضافة طلب جديد
              </EnhancedButton>
            </div>
          </div>

          {/* Enhanced Features Widget */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.05 }}
            className="mb-8"
          >
            <EnhancedOrderActions />
          </motion.div>

          {/* الإحصائيات */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
            >
              <Card className="bg-gradient-to-r from-blue-500 to-blue-600 text-white border-0 shadow-lg">
                <CardBody className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-blue-100 text-sm font-medium">
                        إجمالي الطلبات
                      </p>
                      <p className="text-3xl font-bold mt-1">
                        {statistics.totalOrders}
                      </p>
                    </div>
                    <div className="p-3 bg-white/20 rounded-xl">
                      <Package className="w-8 h-8" />
                    </div>
                  </div>
                </CardBody>
              </Card>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              <Card className="bg-gradient-to-r from-green-500 to-green-600 text-white border-0 shadow-lg">
                <CardBody className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-green-100 text-sm font-medium">
                        إجمالي الإيرادات
                      </p>
                      <p className="text-3xl font-bold mt-1">
                        €{statistics.totalRevenue.toLocaleString()}
                      </p>
                    </div>
                    <div className="p-3 bg-white/20 rounded-xl">
                      <Euro className="w-8 h-8" />
                    </div>
                  </div>
                </CardBody>
              </Card>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              <Card className="bg-gradient-to-r from-yellow-500 to-orange-500 text-white border-0 shadow-lg">
                <CardBody className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-yellow-100 text-sm font-medium">
                        طلبات معلقة
                      </p>
                      <p className="text-3xl font-bold mt-1">
                        {statistics.pendingOrders}
                      </p>
                    </div>
                    <div className="p-3 bg-white/20 rounded-xl">
                      <Clock className="w-8 h-8" />
                    </div>
                  </div>
                </CardBody>
              </Card>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
            >
              <Card className="bg-gradient-to-r from-red-500 to-pink-500 text-white border-0 shadow-lg">
                <CardBody className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-red-100 text-sm font-medium">
                        طلبات عاجلة
                      </p>
                      <p className="text-3xl font-bold mt-1">
                        {statistics.urgentOrders}
                      </p>
                    </div>
                    <div className="p-3 bg-white/20 rounded-xl">
                      <Zap className="w-8 h-8" />
                    </div>
                  </div>
                </CardBody>
              </Card>
            </motion.div>
          </div>
        </motion.div>

        {/* رسائل النجاح والخطأ */}
        <AnimatePresence>
          {success && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="mb-6 p-4 bg-green-50 border border-green-200 rounded-xl shadow-sm"
            >
              <div className="flex items-center">
                <CheckCircle className="w-5 h-5 text-green-600 ml-2" />
                <span className="text-green-800 font-medium">{success}</span>
              </div>
            </motion.div>
          )}

          {error && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl shadow-sm"
            >
              <div className="flex items-center">
                <XCircle className="w-5 h-5 text-red-600 ml-2" />
                <span className="text-red-800 font-medium">{error}</span>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* أدوات البحث والفلترة */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          <Card className="mb-6 border-0 shadow-lg">
            <CardBody className="p-6">
              <form onSubmit={handleSearch} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-6 gap-4">
                  {/* البحث */}
                  <EnhancedInput
                    type="text"
                    placeholder="البحث في الطلبات..."
                    value={filters.search}
                    onChange={(e) =>
                      handleFilterChange("search", e.target.value)
                    }
                    icon={<Search className="w-4 h-4" />}
                    size="md"
                  />

                  {/* فلتر الحالة */}
                  <select
                    value={filters.status}
                    onChange={(e) =>
                      handleFilterChange("status", e.target.value)
                    }
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white text-gray-900"
                  >
                    <option value="">جميع الحالات</option>
                    <option value="draft">مسودة</option>
                    <option value="pending">معلق</option>
                    <option value="confirmed">مؤكد</option>
                    <option value="processing">قيد التحضير</option>
                    <option value="ready">جاهز</option>
                    <option value="delivered">مُسلم</option>
                    <option value="cancelled">ملغي</option>
                  </select>

                  {/* فلتر حالة الدفع */}
                  <select
                    value={filters.payment_status}
                    onChange={(e) =>
                      handleFilterChange("payment_status", e.target.value)
                    }
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white text-gray-900"
                  >
                    <option value="">حالة الدفع</option>
                    <option value="pending">معلق</option>
                    <option value="paid">مدفوع</option>
                    <option value="partial">جزئي</option>
                    <option value="failed">فاشل</option>
                    <option value="overdue">متأخر</option>
                  </select>

                  {/* فلتر المتجر */}
                  <select
                    value={filters.store_id}
                    onChange={(e) =>
                      handleFilterChange("store_id", e.target.value)
                    }
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white text-gray-900"
                  >
                    <option value="">جميع المتاجر</option>
                    {Array.isArray(stores) &&
                      stores.map((store) => (
                        <option key={store.id} value={store.id}>
                          {store.name}
                        </option>
                      ))}
                  </select>

                  {/* فلتر الأولوية */}
                  <select
                    value={filters.priority}
                    onChange={(e) =>
                      handleFilterChange("priority", e.target.value)
                    }
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white text-gray-900"
                  >
                    <option value="">الأولوية</option>
                    <option value="low">منخفض</option>
                    <option value="normal">عادي</option>
                    <option value="medium">متوسط</option>
                    <option value="high">عالي</option>
                    <option value="urgent">عاجل</option>
                  </select>

                  {/* أزرار الإجراءات */}
                  <div className="flex gap-2">
                    <EnhancedButton
                      type="button"
                      variant="secondary"
                      icon={<RefreshCw className="w-4 h-4" />}
                      onClick={() => {
                        setFilters({
                          search: "",
                          status: "",
                          payment_status: "",
                          store_id: "",
                          distributor_id: "",
                          priority: "",
                        });
                        setPagination((prev) => ({ ...prev, currentPage: 1 }));
                      }}
                    >
                      إعادة تعيين
                    </EnhancedButton>
                  </div>
                </div>
              </form>
            </CardBody>
          </Card>
        </motion.div>

        {/* قائمة الطلبات */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
        >
          <Card className="border-0 shadow-lg">
            <CardHeader className="border-b border-gray-200 bg-gradient-to-r from-gray-50 to-white">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold text-gray-900">
                  قائمة الطلبات
                </h2>
                <div className="flex gap-2">
                  <EnhancedButton
                    onClick={() => handleExport("json")}
                    disabled={isExporting}
                    variant="success"
                    size="sm"
                    icon={
                      isExporting ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <FileText className="w-4 h-4" />
                      )
                    }
                  >
                    تصدير JSON
                  </EnhancedButton>
                  <EnhancedButton
                    onClick={() => handleExport("csv")}
                    disabled={isExporting}
                    variant="warning"
                    size="sm"
                    icon={
                      isExporting ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <Download className="w-4 h-4" />
                      )
                    }
                  >
                    تصدير CSV
                  </EnhancedButton>
                  <EnhancedButton
                    onClick={loadOrders}
                    variant="secondary"
                    size="sm"
                    icon={<RefreshCw className="w-4 h-4" />}
                  >
                    تحديث
                  </EnhancedButton>
                </div>
              </div>
            </CardHeader>

            <CardBody className="p-0">
              {isLoading ? (
                <div className="p-8 text-center">
                  <LoadingSpinner size="lg" text="جاري تحميل البيانات..." />
                </div>
              ) : orders.length === 0 ? (
                <div className="p-8 text-center">
                  <Package className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-xl font-medium text-gray-900 mb-2">
                    لا توجد طلبات
                  </h3>
                  <p className="text-gray-600 mb-4">
                    لم يتم العثور على طلبات تطابق معايير البحث
                  </p>
                  <EnhancedButton
                    onClick={() => navigate("/orders/create")}
                    variant="primary"
                    icon={<Plus className="w-4 h-4" />}
                  >
                    إضافة طلب جديد
                  </EnhancedButton>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-4 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                          رقم الطلب
                        </th>
                        <th className="px-6 py-4 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                          العميل
                        </th>
                        <th className="px-6 py-4 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                          المتجر
                        </th>
                        <th className="px-6 py-4 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                          المبلغ
                        </th>
                        <th className="px-6 py-4 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                          الحالة
                        </th>
                        <th className="px-6 py-4 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                          الدفع
                        </th>
                        <th className="px-6 py-4 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                          الأولوية
                        </th>
                        <th className="px-6 py-4 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                          التاريخ
                        </th>
                        <th className="px-6 py-4 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                          الإجراءات
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {Array.isArray(orders) &&
                        orders.map((order, index) => (
                          <motion.tr
                            key={order.id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.05 }}
                            className="hover:bg-gray-50 transition-colors"
                          >
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm font-semibold text-gray-900">
                                #{order.order_number || order.id}
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div>
                                <div className="text-sm font-medium text-gray-900 flex items-center gap-1">
                                  <User className="w-3 h-3 text-gray-400" />
                                  {getCustomerName(order)}
                                </div>
                                <div className="text-sm text-gray-500 flex items-center gap-1">
                                  <Phone className="w-3 h-3 text-gray-400" />
                                  {getCustomerPhone(order)}
                                </div>
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm text-gray-900 flex items-center gap-1">
                                <Store className="w-3 h-3 text-gray-400" />
                                {order.store?.name || "غير محدد"}
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm font-semibold text-gray-900">
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
                                {order.status === "processing" && "قيد التحضير"}
                                {order.status === "ready" && "جاهز"}
                                {order.status === "delivered" && "مُسلم"}
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
                                {order.priority === "normal" && "متوسط"}
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
                                <EnhancedButton
                                  onClick={() =>
                                    navigate(`/orders/${order.id}`)
                                  }
                                  variant="primary"
                                  size="sm"
                                  icon={<Eye className="w-3 h-3" />}
                                  className="bg-blue-600 hover:bg-blue-700 text-white border-blue-600"
                                >
                                  عرض
                                </EnhancedButton>
                                <EnhancedButton
                                  onClick={() =>
                                    navigate(`/orders/${order.id}/edit`)
                                  }
                                  variant="warning"
                                  size="sm"
                                  icon={<Edit className="w-3 h-3" />}
                                  className="bg-yellow-500 hover:bg-yellow-600 text-white border-yellow-500"
                                >
                                  تعديل
                                </EnhancedButton>
                                <EnhancedButton
                                  onClick={() => openDeleteModal(order.id)}
                                  variant="danger"
                                  size="sm"
                                  icon={<Trash2 className="w-3 h-3" />}
                                  className="bg-red-600 hover:bg-red-700 text-white border-red-600"
                                >
                                  حذف
                                </EnhancedButton>
                                {/* Enhanced Actions */}
                                <CompactEnhancedActions
                                  order={order}
                                  className="mr-2"
                                />
                              </div>
                            </td>
                          </motion.tr>
                        ))}
                    </tbody>
                  </table>
                </div>
              )}
            </CardBody>
          </Card>
        </motion.div>

        {/* التصفح */}
        {pagination.totalPages > 1 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7 }}
            className="mt-6 flex items-center justify-between bg-white p-4 rounded-xl shadow-lg"
          >
            <div className="text-sm text-gray-700">
              عرض {(pagination.currentPage - 1) * pagination.itemsPerPage + 1}{" "}
              إلى{" "}
              {Math.min(
                pagination.currentPage * pagination.itemsPerPage,
                pagination.totalItems
              )}{" "}
              من {pagination.totalItems} طلب
            </div>
            <div className="flex gap-2">
              <EnhancedButton
                onClick={() =>
                  setPagination((prev) => ({
                    ...prev,
                    currentPage: prev.currentPage - 1,
                  }))
                }
                disabled={pagination.currentPage === 1}
                variant="secondary"
                size="sm"
              >
                السابق
              </EnhancedButton>
              <span className="px-4 py-2 text-sm text-gray-700 bg-gray-100 rounded-lg">
                صفحة {pagination.currentPage} من {pagination.totalPages}
              </span>
              <EnhancedButton
                onClick={() =>
                  setPagination((prev) => ({
                    ...prev,
                    currentPage: prev.currentPage + 1,
                  }))
                }
                disabled={pagination.currentPage === pagination.totalPages}
                variant="secondary"
                size="sm"
              >
                التالي
              </EnhancedButton>
            </div>
          </motion.div>
        )}
      </div>

      {/* Modal تأكيد الحذف */}
      <DeleteConfirmationModal
        isOpen={deleteModal.isOpen}
        onClose={closeDeleteModal}
        onConfirm={confirmDelete}
        title="تأكيد حذف الطلب"
        message="هل أنت متأكد من حذف هذا الطلب؟ هذا الإجراء لا يمكن التراجع عنه."
        isLoading={deleteModal.isLoading}
      />
    </div>
  );
};

export default OrdersListPage;
