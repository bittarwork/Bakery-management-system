import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import {
  CreditCard,
  Search,
  Filter,
  Eye,
  Edit,
  Trash2,
  Download,
  RefreshCw,
  Mail,
  Phone,
  Calendar,
  UserCheck,
  UserX,
  AlertCircle,
  CheckCircle,
  Loader2,
  MoreVertical,
  FileText,
  BarChart3,
  Euro,
  Clock,
  DollarSign,
  TrendingUp,
  TrendingDown,
  Filter as FilterIcon,
  SortAsc,
  SortDesc,
} from "lucide-react";
import { Card, CardHeader, CardBody } from "../ui/Card";
import EnhancedButton from "../ui/EnhancedButton";
import EnhancedInput from "../ui/EnhancedInput";
import LoadingSpinner from "../ui/LoadingSpinner";
import { DeleteConfirmationModal } from "../ui/Modal";
import orderService from "../../services/orderService";

const PaymentStatusManager = () => {
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isExporting, setIsExporting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // فلاتر البحث
  const [filters, setFilters] = useState({
    search: "",
    payment_status: "",
    order_status: "",
    date_from: "",
    date_to: "",
    min_amount: "",
    max_amount: "",
    currency: "",
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
    paidOrders: 0,
    pendingOrders: 0,
    failedOrders: 0,
    totalRevenue: 0,
    averageOrderValue: 0,
  });

  // Modal الحذف
  const [deleteModal, setDeleteModal] = useState({
    isOpen: false,
    orderId: null,
    orderNumber: "",
    isLoading: false,
  });

  // ترتيب البيانات
  const [sorting, setSorting] = useState({
    field: "created_at",
    direction: "desc",
  });

  // تحميل البيانات
  useEffect(() => {
    loadOrders();
    loadStatistics();
  }, [pagination.currentPage, filters, sorting]);

  const loadOrders = async () => {
    try {
      setIsLoading(true);
      setError("");

      const params = {
        page: pagination.currentPage,
        limit: pagination.itemsPerPage,
        sort_by: sorting.field,
        sort_order: sorting.direction,
        ...filters,
      };

      const response = await orderService.getOrders(params);

      if (response.success) {
        setOrders(response.data.orders || []);
        setPagination((prev) => ({
          ...prev,
          totalPages: response.data.pagination?.totalPages || 1,
          totalItems: response.data.pagination?.totalItems || 0,
        }));
      } else {
        setError(response.message || "خطأ في تحميل الطلبات");
      }
    } catch (error) {
      console.error("Error loading orders:", error);
      setError("خطأ في تحميل بيانات الطلبات");
    } finally {
      setIsLoading(false);
    }
  };

  const loadStatistics = async () => {
    try {
      const response = await orderService.getOrderStatistics();
      if (response.success) {
        setStatistics({
          totalOrders: response.data?.total_orders || 0,
          paidOrders: response.data?.paid_orders || 0,
          pendingOrders: response.data?.pending_orders || 0,
          failedOrders: response.data?.failed_orders || 0,
          totalRevenue: response.data?.total_revenue || 0,
          averageOrderValue: response.data?.average_order_value || 0,
        });
      }
    } catch (error) {
      console.error("Error loading statistics:", error);
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

  // معالجة الترتيب
  const handleSort = (field) => {
    setSorting((prev) => ({
      field,
      direction:
        prev.field === field && prev.direction === "asc" ? "desc" : "asc",
    }));
  };

  // تصدير البيانات
  const handleExport = async (format = "json") => {
    try {
      setIsExporting(true);
      setError("");

      const response = await orderService.exportOrders(format, filters);

      if (response.success) {
        if (format === "csv") {
          const blob = new Blob([response.data], { type: "text/csv" });
          const url = window.URL.createObjectURL(blob);
          const a = document.createElement("a");
          a.href = url;
          a.download = `payment_status_${
            new Date().toISOString().split("T")[0]
          }.csv`;
          a.click();
          window.URL.revokeObjectURL(url);
        } else {
          const dataStr = JSON.stringify(response.data, null, 2);
          const blob = new Blob([dataStr], { type: "application/json" });
          const url = window.URL.createObjectURL(blob);
          const a = document.createElement("a");
          a.href = url;
          a.download = `payment_status_${
            new Date().toISOString().split("T")[0]
          }.json`;
          a.click();
          window.URL.revokeObjectURL(url);
        }
        setSuccess(`تم تصدير البيانات بنجاح بصيغة ${format.toUpperCase()}`);
      } else {
        setError(response.message);
      }
    } catch (error) {
      setError("خطأ في تصدير البيانات");
    } finally {
      setIsExporting(false);
    }
  };

  // تحديث حالة الدفع
  const handleUpdatePaymentStatus = async (orderId, newStatus) => {
    try {
      setError("");
      const response = await orderService.updatePaymentStatus(
        orderId,
        newStatus
      );

      if (response.success) {
        setSuccess(`تم تحديث حالة الدفع بنجاح إلى ${newStatus}`);
        loadOrders();
        loadStatistics();
      } else {
        setError(response.message);
      }
    } catch (error) {
      setError("خطأ في تحديث حالة الدفع");
    }
  };

  // فتح modal الحذف
  const openDeleteModal = (orderId, orderNumber) => {
    setDeleteModal({
      isOpen: true,
      orderId,
      orderNumber,
      isLoading: false,
    });
  };

  // إغلاق modal الحذف
  const closeDeleteModal = () => {
    setDeleteModal({
      isOpen: false,
      orderId: null,
      orderNumber: "",
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
        loadStatistics();
      } else {
        setError(response.message);
      }
    } catch (error) {
      setError("خطأ في حذف الطلب");
    } finally {
      setDeleteModal((prev) => ({ ...prev, isLoading: false }));
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

  // الحصول على لون حالة الدفع
  const getPaymentStatusColor = (status) => {
    switch (status) {
      case "paid":
        return "bg-green-100 text-green-800";
      case "pending":
        return "bg-yellow-100 text-yellow-800";
      case "failed":
        return "bg-red-100 text-red-800";
      case "refunded":
        return "bg-blue-100 text-blue-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  // الحصول على أيقونة حالة الدفع
  const getPaymentStatusIcon = (status) => {
    switch (status) {
      case "paid":
        return <CheckCircle className="w-4 h-4" />;
      case "pending":
        return <Clock className="w-4 h-4" />;
      case "failed":
        return <XCircle className="w-4 h-4" />;
      case "refunded":
        return <RefreshCw className="w-4 h-4" />;
      default:
        return <AlertCircle className="w-4 h-4" />;
    }
  };

  // تنسيق المبلغ
  const formatAmount = (amount, currency = "EUR") => {
    const formatter = new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: currency,
    });
    return formatter.format(amount);
  };

  // تنسيق التاريخ
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

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
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-4xl font-bold text-gray-900 mb-2">
                إدارة حالات الدفع
              </h1>
              <p className="text-gray-600 text-lg">
                إدارة وتتبع حالات الدفع للطلبات
              </p>
            </div>
            <EnhancedButton
              onClick={() => loadOrders()}
              disabled={isLoading}
              variant="primary"
              size="lg"
              icon={
                <RefreshCw
                  className={`w-5 h-5 ${isLoading ? "animate-spin" : ""}`}
                />
              }
            >
              تحديث البيانات
            </EnhancedButton>
          </div>

          {/* الإحصائيات */}
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
                      <CreditCard className="w-8 h-8" />
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
                        الطلبات المدفوعة
                      </p>
                      <p className="text-3xl font-bold mt-1">
                        {statistics.paidOrders}
                      </p>
                    </div>
                    <div className="p-3 bg-white/20 rounded-xl">
                      <CheckCircle className="w-8 h-8" />
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
              <Card className="bg-gradient-to-r from-red-500 to-red-600 text-white border-0 shadow-lg">
                <CardBody className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-red-100 text-sm font-medium">
                        الطلبات الفاشلة
                      </p>
                      <p className="text-3xl font-bold mt-1">
                        {statistics.failedOrders}
                      </p>
                    </div>
                    <div className="p-3 bg-white/20 rounded-xl">
                      <XCircle className="w-8 h-8" />
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
                <AlertCircle className="w-5 h-5 text-red-600 ml-2" />
                <span className="text-red-800 font-medium">{error}</span>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* أدوات البحث والفلترة */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <Card className="mb-6 border-0 shadow-lg">
            <CardBody className="p-6">
              <form onSubmit={handleSearch} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
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

                  {/* فلتر حالة الدفع */}
                  <select
                    value={filters.payment_status}
                    onChange={(e) =>
                      handleFilterChange("payment_status", e.target.value)
                    }
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white text-gray-900"
                  >
                    <option value="">جميع حالات الدفع</option>
                    <option value="paid">مدفوع</option>
                    <option value="pending">معلق</option>
                    <option value="failed">فاشل</option>
                    <option value="refunded">مسترد</option>
                  </select>

                  {/* فلتر العملة */}
                  <select
                    value={filters.currency}
                    onChange={(e) =>
                      handleFilterChange("currency", e.target.value)
                    }
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white text-gray-900"
                  >
                    <option value="">جميع العملات</option>
                    <option value="EUR">يورو</option>
                    <option value="SYP">ليرة سورية</option>
                  </select>

                  {/* أزرار الإجراءات */}
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
                          payment_status: "",
                          order_status: "",
                          date_from: "",
                          date_to: "",
                          min_amount: "",
                          max_amount: "",
                          currency: "",
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

        {/* جدول الطلبات */}
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
              ) : orders.length === 0 ? (
                <div className="p-8 text-center">
                  <CreditCard className="w-16 h-16 text-gray-400 mx-auto mb-4" />
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
                          الطلب
                        </th>
                        <th className="px-6 py-4 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                          العميل
                        </th>
                        <th className="px-6 py-4 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                          المبلغ
                        </th>
                        <th className="px-6 py-4 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                          حالة الدفع
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
                      {orders.map((order, index) => (
                        <motion.tr
                          key={order.id}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: index * 0.05 }}
                          className="hover:bg-gray-50 transition-colors"
                        >
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                              <div className="flex-shrink-0 h-12 w-12">
                                <div className="h-12 w-12 rounded-full bg-gradient-to-r from-purple-500 to-purple-600 flex items-center justify-center shadow-lg">
                                  <span className="text-sm font-bold text-white">
                                    #{order.order_number}
                                  </span>
                                </div>
                              </div>
                              <div className="mr-4">
                                <div className="text-sm font-semibold text-gray-900">
                                  طلب #{order.order_number}
                                </div>
                                <div className="text-sm text-gray-500">
                                  {order.order_status}
                                </div>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div>
                              <div className="text-sm font-semibold text-gray-900">
                                {order.customer_name}
                              </div>
                              <div className="text-sm text-gray-500 flex items-center gap-1">
                                <Mail className="w-3 h-3" />
                                {order.customer_email}
                              </div>
                              {order.customer_phone && (
                                <div className="text-sm text-gray-500 flex items-center gap-1">
                                  <Phone className="w-3 h-3" />
                                  {order.customer_phone}
                                </div>
                              )}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm font-semibold text-gray-900">
                              {formatAmount(order.total_amount, order.currency)}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span
                              className={`inline-flex items-center px-3 py-1 text-xs font-semibold rounded-full ${getPaymentStatusColor(
                                order.payment_status
                              )}`}
                            >
                              {getPaymentStatusIcon(order.payment_status)}
                              <span className="mr-1">
                                {order.payment_status === "paid" && "مدفوع"}
                                {order.payment_status === "pending" && "معلق"}
                                {order.payment_status === "failed" && "فاشل"}
                                {order.payment_status === "refunded" && "مسترد"}
                              </span>
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            <div className="flex items-center gap-1">
                              <Calendar className="w-3 h-3" />
                              {formatDate(order.created_at)}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                            <div className="flex items-center gap-2">
                              <EnhancedButton
                                onClick={() => navigate(`/orders/${order.id}`)}
                                variant="primary"
                                size="sm"
                                icon={<Eye className="w-3 h-3" />}
                              >
                                عرض
                              </EnhancedButton>
                              <EnhancedButton
                                onClick={() =>
                                  handleUpdatePaymentStatus(order.id, "paid")
                                }
                                disabled={order.payment_status === "paid"}
                                variant="success"
                                size="sm"
                                icon={<CheckCircle className="w-3 h-3" />}
                              >
                                دفع
                              </EnhancedButton>
                              <EnhancedButton
                                onClick={() =>
                                  handleUpdatePaymentStatus(order.id, "pending")
                                }
                                disabled={order.payment_status === "pending"}
                                variant="warning"
                                size="sm"
                                icon={<Clock className="w-3 h-3" />}
                              >
                                تعليق
                              </EnhancedButton>
                              <EnhancedButton
                                onClick={() =>
                                  openDeleteModal(order.id, order.order_number)
                                }
                                variant="danger"
                                size="sm"
                                icon={<Trash2 className="w-3 h-3" />}
                              >
                                حذف
                              </EnhancedButton>
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

        {/* Delete Confirmation Modal */}
        <DeleteConfirmationModal
          isOpen={deleteModal.isOpen}
          onClose={closeDeleteModal}
          onConfirm={confirmDelete}
          isLoading={deleteModal.isLoading}
          title="حذف الطلب"
          message={`هل أنت متأكد من حذف الطلب رقم #${deleteModal.orderNumber}؟`}
        />
      </div>
    </div>
  );
};

export default PaymentStatusManager;
