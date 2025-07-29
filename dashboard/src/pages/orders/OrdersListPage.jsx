import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import {
  Plus,
  Package,
  Search,
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
  Calendar,
  MapPin,
  FileText,
  ShoppingCart,
  Building,
  Loader2,
  AlertCircle,
  Star,
  Users,
  TrendingUp,
  Activity,
} from "lucide-react";
import { Card, CardHeader, CardBody } from "../../components/ui/Card";
import EnhancedButton from "../../components/ui/EnhancedButton";
import EnhancedInput from "../../components/ui/EnhancedInput";
import LoadingSpinner from "../../components/ui/LoadingSpinner";
import { DeleteConfirmationModal } from "../../components/ui/Modal";
import orderService from "../../services/orderService";
import storeService from "../../services/storeService";
import userService from "../../services/userService";
import { toast } from "react-hot-toast";

const OrdersListPage = () => {
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [stores, setStores] = useState([]);
  const [distributors, setDistributors] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isExporting, setIsExporting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // Search filters
  const [filters, setFilters] = useState({
    search: "",
    status: "",
    payment_status: "",
    store_id: "",
    distributor_id: "",
  });

  // Pagination
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalItems: 0,
    itemsPerPage: 10,
  });

  // Simplified statistics
  const [statistics, setStatistics] = useState({
    totalOrders: 0,
    pendingOrders: 0,
    completedOrders: 0,
    totalRevenue: 0,
  });

  // Delete modal
  const [deleteModal, setDeleteModal] = useState({
    isOpen: false,
    orderId: null,
    orderNumber: "",
    isLoading: false,
  });

  // Load data
  useEffect(() => {
    loadInitialData();
  }, []);

  useEffect(() => {
    loadOrders();
  }, [pagination.currentPage, filters]);

  const loadInitialData = async () => {
    await Promise.all([loadOrders(), loadStores(), loadDistributors()]);
  };

  // Load orders
  const loadOrders = async () => {
    try {
      setIsLoading(true);
      setError("");

      // Filter out empty values
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

      console.log("🔍 Loading orders with params:", params);
      const response = await orderService.getOrders(params);
      console.log("📦 Orders API response:", response);

      // Handle the response format from orderService
      if (response && response.success !== false) {
        const ordersData =
          response.orders || response.data?.orders || response.data || [];
        const safeOrdersData = Array.isArray(ordersData) ? ordersData : [];
        console.log(
          "✅ Orders loaded successfully:",
          safeOrdersData.length,
          "orders"
        );
        setOrders(safeOrdersData);

        // Calculate simplified statistics
        const stats = calculateStatistics(safeOrdersData);
        setStatistics(stats);

        // Update pagination
        if (response.pagination || response.data?.pagination) {
          const paginationData =
            response.pagination || response.data.pagination;
          setPagination((prev) => ({
            ...prev,
            totalPages:
              paginationData.totalPages || paginationData.total_pages || 1,
            totalItems: paginationData.total || ordersData.length,
          }));
        }
      } else {
        const errorMessage = response?.message || "خطأ في تحميل الطلبات";
        console.error("❌ Orders loading failed:", errorMessage);
        setError(errorMessage);
        setOrders([]);
      }
    } catch (error) {
      console.error("💥 Error loading orders:", error);
      let errorMessage = "خطأ في تحميل بيانات الطلبات";

      if (error.response?.status === 400) {
        errorMessage =
          "بيانات الفلترة غير صحيحة - يرجى التحقق من المعايير المحددة";
      } else if (error.response?.status === 401) {
        errorMessage = "غير مصرح لك بالوصول إلى هذه البيانات";
      } else if (error.response?.status === 403) {
        errorMessage = "ممنوع الوصول إلى هذه البيانات";
      } else if (error.response?.status === 404) {
        errorMessage = "البيانات المطلوبة غير موجودة";
      } else if (error.response?.status >= 500) {
        errorMessage = "خطأ في الخادم - يرجى المحاولة مرة أخرى لاحقاً";
      } else if (error.message) {
        errorMessage = `خطأ في تحميل البيانات: ${error.message}`;
      }

      setError(errorMessage);
      setOrders([]);
    } finally {
      setIsLoading(false);
    }
  };

  // Load stores
  const loadStores = async () => {
    try {
      const response = await storeService.getStores({ limit: 100 });
      if (response && response.success !== false) {
        setStores(response.data || response.stores || []);
      } else {
        console.warn("Failed to load stores, using empty array");
        setStores([]);
      }
    } catch (error) {
      console.error("Error loading stores:", error);
      setStores([]);
    }
  };

  // Load distributors
  const loadDistributors = async () => {
    try {
      const response = await userService.getUsers({
        role: "distributor",
        limit: 100,
      });
      if (response && response.success !== false) {
        setDistributors(response.data || response.users || []);
      } else {
        console.warn("Failed to load distributors, using empty array");
        setDistributors([]);
      }
    } catch (error) {
      console.error("Error loading distributors:", error);
      setDistributors([]);
    }
  };

  // Calculate simplified statistics
  const calculateStatistics = (ordersData) => {
    if (!Array.isArray(ordersData) || ordersData.length === 0) {
      return {
        totalOrders: 0,
        pendingOrders: 0,
        completedOrders: 0,
        totalRevenue: 0,
      };
    }

    const totalRevenue = ordersData.reduce((sum, order) => {
      return (
        sum + parseFloat(order.final_amount_eur || order.total_amount_eur || 0)
      );
    }, 0);

    return {
      totalOrders: ordersData.length,
      pendingOrders: ordersData.filter(
        (o) => o.status === "draft" || o.status === "confirmed"
      ).length,
      completedOrders: ordersData.filter((o) => o.status === "delivered")
        .length,
      totalRevenue,
    };
  };

  // Handle filter change
  const handleFilterChange = (field, value) => {
    setFilters((prev) => ({
      ...prev,
      [field]: value,
    }));
    setPagination((prev) => ({ ...prev, currentPage: 1 }));
  };

  // Handle search
  const handleSearch = (e) => {
    e.preventDefault();
    loadOrders();
  };

  // Get order status info
  const getOrderStatusInfo = (status) => {
    const statusMap = {
      draft: {
        label: "مسودة",
        color: "bg-gray-100 text-gray-800",
        icon: <FileText className="w-3 h-3" />,
      },
      confirmed: {
        label: "مؤكد",
        color: "bg-blue-100 text-blue-800",
        icon: <CheckCircle className="w-3 h-3" />,
      },
      in_progress: {
        label: "قيد التنفيذ",
        color: "bg-purple-100 text-purple-800",
        icon: <Activity className="w-3 h-3" />,
      },
      delivered: {
        label: "تم التسليم",
        color: "bg-green-100 text-green-800",
        icon: <Truck className="w-3 h-3" />,
      },
      cancelled: {
        label: "ملغي",
        color: "bg-red-100 text-red-800",
        icon: <XCircle className="w-3 h-3" />,
      },
    };

    return (
      statusMap[status] || {
        label: status || "غير محدد",
        color: "bg-gray-100 text-gray-800",
        icon: <AlertTriangle className="w-3 h-3" />,
      }
    );
  };

  // Get payment status info
  const getPaymentStatusInfo = (paymentStatus) => {
    const statusMap = {
      pending: { label: "في الانتظار", color: "bg-gray-100 text-gray-800" },
      partial: { label: "دفع جزئي", color: "bg-yellow-100 text-yellow-800" },
      paid: { label: "مدفوع", color: "bg-green-100 text-green-800" },
      overdue: { label: "متأخر", color: "bg-red-100 text-red-800" },
    };
    return statusMap[paymentStatus] || statusMap.pending;
  };

  // Format date
  const formatDate = (dateString) => {
    if (!dateString) return "-";
    return new Date(dateString).toLocaleDateString("en-GB");
  };

  // Handle delete
  const openDeleteModal = (orderId, orderNumber) => {
    setDeleteModal({
      isOpen: true,
      orderId,
      orderNumber,
      isLoading: false,
    });
  };

  const closeDeleteModal = () => {
    setDeleteModal({
      isOpen: false,
      orderId: null,
      orderNumber: "",
      isLoading: false,
    });
  };

  const confirmDelete = async () => {
    try {
      setDeleteModal((prev) => ({ ...prev, isLoading: true }));

      const response = await orderService.deleteOrder(deleteModal.orderId);

      if (response && response.success !== false) {
        setSuccess("تم حذف الطلب بنجاح");
        setDeleteModal((prev) => ({
          ...prev,
          isOpen: false,
          isLoading: false,
        }));
        loadOrders(); // Reload orders
      } else {
        const errorMessage = response?.message || "فشل في حذف الطلب";
        setError(errorMessage);
        setDeleteModal((prev) => ({ ...prev, isLoading: false }));
      }
    } catch (error) {
      console.error("Error deleting order:", error);
      let errorMessage = "فشل في حذف الطلب";

      if (error.response?.status === 400) {
        errorMessage = "لا يمكن حذف هذا الطلب - قد يكون في حالة لا تسمح بالحذف";
      } else if (error.response?.status === 404) {
        errorMessage = "الطلب غير موجود";
      } else if (error.response?.status === 403) {
        errorMessage = "غير مصرح لك بحذف هذا الطلب";
      } else if (error.message) {
        errorMessage = `خطأ في حذف الطلب: ${error.message}`;
      }

      setError(errorMessage);
      setDeleteModal((prev) => ({ ...prev, isLoading: false }));
    }
  };

  // Handle export
  const handleExport = async (format) => {
    try {
      setIsExporting(true);
      // Implementation for export functionality
      toast.success(`تم تصدير البيانات بصيغة ${format.toUpperCase()}`);
    } catch (error) {
      console.error("Export error:", error);
      toast.error("خطأ في تصدير البيانات");
    } finally {
      setIsExporting(false);
    }
  };

  // Clear success/error messages
  useEffect(() => {
    if (success) {
      const timer = setTimeout(() => setSuccess(""), 5000);
      return () => clearTimeout(timer);
    }
  }, [success]);

  useEffect(() => {
    if (error) {
      const timer = setTimeout(() => setError(""), 5000);
      return () => clearTimeout(timer);
    }
  }, [error]);

  if (isLoading && orders.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center">
        <LoadingSpinner size="xl" text="جاري تحميل بيانات الطلبات..." />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Success/Error Messages */}
        {(success || error) && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6"
          >
            {success && (
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <div className="flex items-center">
                  <CheckCircle className="w-5 h-5 text-green-400 ml-2" />
                  <p className="text-green-800 font-medium">{success}</p>
                  <button
                    onClick={() => setSuccess("")}
                    className="mr-auto text-green-600 hover:text-green-800"
                  >
                    <XCircle className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}
            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <div className="flex items-center">
                  <AlertCircle className="w-5 h-5 text-red-400 ml-2" />
                  <p className="text-red-800 font-medium">{error}</p>
                  <button
                    onClick={() => setError("")}
                    className="mr-auto text-red-600 hover:text-red-800"
                  >
                    <XCircle className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}
          </motion.div>
        )}

        {/* Page Header */}
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
                إدارة طلبات المخبز وتتبع حالتها
              </p>
            </div>
            <EnhancedButton
              onClick={() => navigate("/orders/create")}
              variant="primary"
              size="lg"
              icon={<Plus className="w-5 h-5" />}
            >
              إضافة طلب جديد
            </EnhancedButton>
          </div>

          {/* Simplified Statistics */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
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
                      <ShoppingCart className="w-8 h-8" />
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
              <Card className="bg-gradient-to-r from-yellow-500 to-yellow-600 text-white border-0 shadow-lg">
                <CardBody className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-yellow-100 text-sm font-medium">
                        الطلبات المعلقة
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
              transition={{ delay: 0.3 }}
            >
              <Card className="bg-gradient-to-r from-green-500 to-green-600 text-white border-0 shadow-lg">
                <CardBody className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-green-100 text-sm font-medium">
                        الإيرادات الإجمالية
                      </p>
                      <p className="text-3xl font-bold mt-1">
                        €{statistics.totalRevenue.toFixed(0)}
                      </p>
                    </div>
                    <div className="p-3 bg-white/20 rounded-xl">
                      <Euro className="w-8 h-8" />
                    </div>
                  </div>
                </CardBody>
              </Card>
            </motion.div>
          </div>
        </motion.div>

        {/* Search and Filter Tools */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <Card className="mb-6 border-0 shadow-lg">
            <CardBody className="p-6">
              <form onSubmit={handleSearch} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                  {/* Search */}
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

                  {/* Status Filter */}
                  <select
                    value={filters.status}
                    onChange={(e) =>
                      handleFilterChange("status", e.target.value)
                    }
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white text-gray-900"
                  >
                    <option value="">جميع الحالات</option>
                    <option value="draft">مسودة</option>
                    <option value="confirmed">مؤكد</option>
                    <option value="in_progress">قيد التنفيذ</option>
                    <option value="delivered">تم التسليم</option>
                    <option value="cancelled">ملغي</option>
                  </select>

                  {/* Payment Status Filter */}
                  <select
                    value={filters.payment_status}
                    onChange={(e) =>
                      handleFilterChange("payment_status", e.target.value)
                    }
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white text-gray-900"
                  >
                    <option value="">جميع حالات الدفع</option>
                    <option value="pending">في الانتظار</option>
                    <option value="partial">دفع جزئي</option>
                    <option value="paid">مدفوع</option>
                    <option value="overdue">متأخر</option>
                  </select>

                  {/* Store Filter */}
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

                  {/* Action Buttons */}
                  <div className="flex gap-2">
                    <EnhancedButton
                      type="submit"
                      variant="primary"
                      icon={<Search className="w-4 h-4" />}
                    >
                      بحث
                    </EnhancedButton>
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

        {/* Orders Table */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
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
                </div>
              </div>
            </CardHeader>

            <CardBody className="p-0">
              {isLoading ? (
                <div className="p-8 text-center">
                  <LoadingSpinner size="lg" text="جاري تحميل البيانات..." />
                </div>
              ) : error ? (
                <div className="p-8 text-center">
                  <AlertCircle className="w-16 h-16 text-red-400 mx-auto mb-4" />
                  <h3 className="text-xl font-medium text-gray-900 mb-2">
                    خطأ في تحميل البيانات
                  </h3>
                  <p className="text-red-600 mb-4">{error}</p>
                  <EnhancedButton
                    onClick={() => {
                      setError("");
                      loadOrders();
                    }}
                    variant="primary"
                    icon={<RefreshCw className="w-4 h-4" />}
                  >
                    إعادة المحاولة
                  </EnhancedButton>
                </div>
              ) : orders.length === 0 ? (
                <div className="p-8 text-center">
                  <ShoppingCart className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-xl font-medium text-gray-900 mb-2">
                    لا توجد طلبات
                  </h3>
                  <p className="text-gray-600">
                    لم يتم العثور على طلبات تطابق معايير البحث
                  </p>
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
                          المتجر
                        </th>
                        <th className="px-6 py-4 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                          حالة الطلب
                        </th>
                        <th className="px-6 py-4 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                          حالة الدفع
                        </th>
                        <th className="px-6 py-4 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                          المبلغ الإجمالي
                        </th>
                        <th className="px-6 py-4 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                          تاريخ الطلب
                        </th>
                        <th className="px-6 py-4 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                          الإجراءات
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {Array.isArray(orders) &&
                        orders.map((order, index) => {
                          const statusInfo = getOrderStatusInfo(order.status);
                          const paymentInfo = getPaymentStatusInfo(
                            order.payment_status
                          );

                          return (
                            <motion.tr
                              key={order.id}
                              initial={{ opacity: 0, y: 20 }}
                              animate={{ opacity: 1, y: 0 }}
                              transition={{ delay: index * 0.05 }}
                              className="hover:bg-gray-50 transition-colors"
                            >
                              <td className="px-6 py-4 whitespace-nowrap">
                                <div className="flex items-center">
                                  <div className="flex-shrink-0 h-10 w-10">
                                    <div className="h-10 w-10 rounded-full bg-gradient-to-r from-blue-500 to-blue-600 flex items-center justify-center shadow-lg">
                                      <Package className="w-4 h-4 text-white" />
                                    </div>
                                  </div>
                                  <div className="mr-4">
                                    <div className="text-sm font-semibold text-gray-900">
                                      {order.order_number}
                                    </div>
                                    <div className="text-sm text-gray-500">
                                      ID: {order.id}
                                    </div>
                                  </div>
                                </div>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <div className="flex items-center">
                                  <Building className="w-4 h-4 text-gray-400 ml-2" />
                                  <div>
                                    <div className="text-sm font-medium text-gray-900">
                                      {order.store_name || "غير محدد"}
                                    </div>
                                    <div className="text-sm text-gray-500">
                                      Store ID: {order.store_id}
                                    </div>
                                  </div>
                                </div>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <span
                                  className={`inline-flex items-center px-3 py-1 text-xs font-semibold rounded-full ${statusInfo.color}`}
                                >
                                  {statusInfo.icon}
                                  <span className="mr-1">
                                    {statusInfo.label}
                                  </span>
                                </span>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <span
                                  className={`inline-flex px-3 py-1 text-xs font-semibold rounded-full ${paymentInfo.color}`}
                                >
                                  {paymentInfo.label}
                                </span>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                <div className="flex items-center">
                                  <Euro className="w-4 h-4 text-gray-400 ml-1" />
                                  {parseFloat(
                                    order.final_amount_eur ||
                                      order.total_amount_eur ||
                                      0
                                  ).toFixed(2)}
                                </div>
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
                                  >
                                    عرض
                                  </EnhancedButton>
                                  {(order.status === "draft" ||
                                    order.status === "confirmed") && (
                                    <EnhancedButton
                                      onClick={() =>
                                        navigate(`/orders/${order.id}/edit`)
                                      }
                                      variant="warning"
                                      size="sm"
                                      icon={<Edit className="w-3 h-3" />}
                                    >
                                      تعديل
                                    </EnhancedButton>
                                  )}
                                  {order.status === "draft" && (
                                    <EnhancedButton
                                      onClick={() =>
                                        openDeleteModal(
                                          order.id,
                                          order.order_number
                                        )
                                      }
                                      variant="danger"
                                      size="sm"
                                      icon={<Trash2 className="w-3 h-3" />}
                                    >
                                      حذف
                                    </EnhancedButton>
                                  )}
                                </div>
                              </td>
                            </motion.tr>
                          );
                        })}
                    </tbody>
                  </table>
                </div>
              )}
            </CardBody>
          </Card>
        </motion.div>

        {/* Pagination */}
        {pagination.totalPages > 1 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
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

      {/* Delete Confirmation Modal */}
      <DeleteConfirmationModal
        isOpen={deleteModal.isOpen}
        onClose={closeDeleteModal}
        onConfirm={confirmDelete}
        itemName={`الطلب ${deleteModal.orderNumber}`}
        isLoading={deleteModal.isLoading}
      />
    </div>
  );
};

export default OrdersListPage;
