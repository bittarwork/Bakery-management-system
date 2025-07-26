import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Link, useParams, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  Edit,
  Trash2,
  Printer,
  RefreshCw,
  Package,
  Store,
  Calendar,
  Clock,
  User,
  Euro,
  FileText,
  CheckCircle,
  XCircle,
  AlertCircle,
  CreditCard,
  Receipt,
  Tag,
  Info,
  Save,
  X,
  Eye,
  Truck,
  Calculator,
  Copy,
  TrendingUp,
  AlertTriangle,
  MessageSquare,
  Star,
  Activity,
  Target,
  Workflow,
  CheckCheck,
  PlayCircle,
} from "lucide-react";
import Button from "../../components/ui/Button";
import LoadingSpinner from "../../components/ui/LoadingSpinner";
import EnhancedOrderActions from "../../components/orders/EnhancedOrderActions";
import orderService from "../../services/orderService";
import { toast } from "react-hot-toast";

const OrderDetailsPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  // State
  const [order, setOrder] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isUpdating, setIsUpdating] = useState(false);
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState("");
  const [selectedPaymentStatus, setSelectedPaymentStatus] = useState("");
  const [activeTab, setActiveTab] = useState("details");

  // Fetch order details
  const fetchOrder = async () => {
    try {
      setIsLoading(true);
      const response = await orderService.getOrder(id);

      if (response.success) {
        setOrder(response.data);
      } else {
        toast.error("الطلب غير موجود");
        navigate("/orders");
      }
    } catch (error) {
      console.error("Error fetching order:", error);
      toast.error("خطأ في تحميل تفاصيل الطلب");
      navigate("/orders");
    } finally {
      setIsLoading(false);
    }
  };

  // Initialize
  useEffect(() => {
    if (id) {
      fetchOrder();
    }
  }, [id]);

  // Handle status update
  const handleStatusUpdate = async () => {
    if (!selectedStatus) return;

    try {
      setIsUpdating(true);
      const response = await orderService.updateOrderStatus(id, selectedStatus);

      if (response.success) {
        toast.success("تم تحديث حالة الطلب بنجاح");
        setShowStatusModal(false);
        fetchOrder();
      } else {
        toast.error(response.message || "خطأ في تحديث حالة الطلب");
      }
    } catch (error) {
      console.error("Error updating order status:", error);
      toast.error("خطأ في تحديث حالة الطلب");
    } finally {
      setIsUpdating(false);
    }
  };

  // Handle payment status update
  const handlePaymentStatusUpdate = async () => {
    if (!selectedPaymentStatus) return;

    try {
      setIsUpdating(true);
      const response = await orderService.updatePaymentStatus(
        id,
        selectedPaymentStatus
      );

      if (response.success) {
        toast.success("تم تحديث حالة الدفع بنجاح");
        setShowPaymentModal(false);
        fetchOrder();
      } else {
        toast.error(response.message || "خطأ في تحديث حالة الدفع");
      }
    } catch (error) {
      console.error("Error updating payment status:", error);
      toast.error("خطأ في تحديث حالة الدفع");
    } finally {
      setIsUpdating(false);
    }
  };

  // Handle order deletion
  const handleDeleteOrder = async () => {
    if (
      !window.confirm(
        "هل أنت متأكد من حذف هذا الطلب؟ لا يمكن حذف سوى الطلبات المسودة."
      )
    )
      return;

    try {
      const response = await orderService.deleteOrder(id);

      if (response.success) {
        toast.success("تم حذف الطلب بنجاح");
        navigate("/orders");
      } else {
        toast.error(response.message || "خطأ في حذف الطلب");
      }
    } catch (error) {
      console.error("Error deleting order:", error);
      toast.error("خطأ في حذف الطلب");
    }
  };

  // Handle print
  const handlePrint = () => {
    window.print();
  };

  // Handle quick status update
  const handleQuickStatusUpdate = async (newStatus) => {
    try {
      setIsUpdating(true);
      const response = await orderService.updateOrderStatus(id, {
        status: newStatus,
      });

      if (response.success) {
        setOrder((prev) => ({
          ...prev,
          status: newStatus,
        }));
        toast.success(`تم تحديث حالة الطلب إلى: ${getStatusLabel(newStatus)}`);
      } else {
        toast.error(response.message || "خطأ في تحديث حالة الطلب");
      }
    } catch (error) {
      console.error("Error updating order status:", error);
      toast.error("خطأ في تحديث حالة الطلب");
    } finally {
      setIsUpdating(false);
    }
  };

  // Get status label
  const getStatusLabel = (status) => {
    const statusMap = {
      draft: "مسودة",
      confirmed: "مؤكد",
      processing: "قيد المعالجة",
      ready: "جاهز",
      delivered: "تم التسليم",
      cancelled: "ملغي",
    };
    return statusMap[status] || status;
  };

  // Currency formatter
  const formatCurrency = (amount, currency = "EUR") => {
    if (!amount && amount !== 0) return "0.00";
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: currency,
      minimumFractionDigits: 2,
    }).format(amount);
  };

  // Get status badge
  const getStatusBadge = (status, type = "order") => {
    const statusOptions =
      type === "order"
        ? orderService.getStatusOptions()
        : orderService.getPaymentStatusOptions();

    const config = statusOptions.find((s) => s.value === status);
    if (!config) return null;

    const colorClasses = {
      gray: "bg-gray-100 text-gray-800 border-gray-200",
      blue: "bg-blue-100 text-blue-800 border-blue-200",
      yellow: "bg-yellow-100 text-yellow-800 border-yellow-200",
      green: "bg-green-100 text-green-800 border-green-200",
      red: "bg-red-100 text-red-800 border-red-200",
      purple: "bg-purple-100 text-purple-800 border-purple-200",
      indigo: "bg-indigo-100 text-indigo-800 border-indigo-200",
      orange: "bg-orange-100 text-orange-800 border-orange-200",
    };

    return (
      <div
        className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium border ${
          colorClasses[config.color] || colorClasses.gray
        }`}
      >
        <span>{config.label}</span>
      </div>
    );
  };

  // Status Modal Component
  const StatusUpdateModal = ({
    show,
    onClose,
    title,
    currentStatus,
    statusOptions,
    onUpdate,
    selectedStatus,
    setSelectedStatus,
  }) => (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
          onClick={onClose}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 50 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 50 }}
            className="bg-white rounded-2xl max-w-md w-full mx-4 shadow-2xl border border-gray-100"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-6 border-b border-gray-100">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold text-gray-900 flex items-center">
                  <div className="p-2 bg-blue-100 rounded-lg mr-3">
                    <Edit className="w-5 h-5 text-blue-600" />
                  </div>
                  {title}
                </h2>
                <button
                  onClick={onClose}
                  className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            <div className="p-6 space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  الحالة الحالية
                </label>
                <div className="p-4 bg-gray-50 rounded-xl">
                  {getStatusBadge(
                    currentStatus,
                    title.includes("Payment") ? "payment" : "order"
                  )}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  الحالة الجديدة
                </label>
                <div className="relative">
                  <select
                    value={selectedStatus}
                    onChange={(e) => setSelectedStatus(e.target.value)}
                    className="w-full p-4 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none bg-white pr-10"
                  >
                    <option value="">اختر حالة جديدة</option>
                    {statusOptions.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                  <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                    <svg
                      className="w-5 h-5 text-gray-400"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M19 9l-7 7-7-7"
                      />
                    </svg>
                  </div>
                </div>
              </div>
            </div>

            <div className="p-6 border-t border-gray-100 flex justify-end space-x-3 space-x-reverse">
              <Button
                variant="outline"
                onClick={onClose}
                className="px-6 py-3 border-2"
              >
                إلغاء
              </Button>
              <Button
                onClick={onUpdate}
                disabled={!selectedStatus || isUpdating}
                className="px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
              >
                {isUpdating ? (
                  <div className="flex items-center">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    جاري التحديث...
                  </div>
                ) : (
                  <div className="flex items-center">
                    <Save className="w-4 h-4 mr-2" />
                    تحديث الحالة
                  </div>
                )}
              </Button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );

  if (isLoading) {
    return (
      <LoadingSpinner fullScreen text="جاري تحميل تفاصيل الطلب..." size="lg" />
    );
  }

  if (!order) {
    return (
      <div className="text-center py-12">
        <Package className="w-12 h-12 text-gray-400 mx-auto mb-4" />
        <p className="text-gray-500">الطلب غير موجود</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white shadow-lg rounded-2xl mb-8 overflow-hidden border border-gray-100"
        >
          <div className="bg-gradient-to-r from-blue-600 to-indigo-600 px-6 py-6">
            <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center">
              <div className="flex items-center space-x-4 space-x-reverse">
                <Link
                  to="/orders"
                  className="p-2 bg-white/20 backdrop-blur-sm rounded-lg text-white hover:bg-white/30 transition-all duration-200"
                >
                  <ArrowLeft className="w-6 h-6" />
                </Link>
                <div>
                  <div className="flex items-center space-x-2 space-x-reverse text-white/80 text-sm mb-2">
                    <span>الطلبات</span>
                    <span>/</span>
                    <span>تفاصيل الطلب</span>
                  </div>
                  <h1 className="text-3xl font-bold text-white flex items-center">
                    <Receipt className="w-8 h-8 text-yellow-300 mr-3" />
                    الطلب #{order.order_number}
                  </h1>
                  <p className="text-white/80 mt-1 flex items-center">
                    <Calendar className="w-4 h-4 mr-2" />
                    تم إنشاؤه في{" "}
                    {new Date(order.created_at).toLocaleDateString("ar")}
                  </p>
                </div>
              </div>
              <div className="flex items-center space-x-3 space-x-reverse mt-4 lg:mt-0">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handlePrint}
                  className="bg-white/20 border-white/30 text-white hover:bg-white/30 backdrop-blur-sm"
                >
                  <Printer className="w-4 h-4 mr-2" />
                  طباعة
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => fetchOrder()}
                  className="bg-white/20 border-white/30 text-white hover:bg-white/30 backdrop-blur-sm"
                >
                  <RefreshCw className="w-4 h-4 mr-2" />
                  تحديث
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => navigate(`/orders/${id}/edit`)}
                  className="bg-white/20 border-white/30 text-white hover:bg-white/30 backdrop-blur-sm"
                >
                  <Edit className="w-4 h-4 mr-2" />
                  تعديل
                </Button>
                {order.status === "draft" && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleDeleteOrder}
                    className="bg-red-500/20 border-red-300/30 text-red-100 hover:bg-red-500/30 backdrop-blur-sm"
                  >
                    <Trash2 className="w-4 h-4 mr-2" />
                    حذف
                  </Button>
                )}
              </div>
            </div>
          </div>

          {/* Status Progress Bar */}
          <div className="bg-white/10 backdrop-blur-sm px-6 py-4">
            <div className="flex items-center justify-between max-w-4xl mx-auto">
              {[
                { id: "draft", label: "مسودة", icon: FileText },
                { id: "confirmed", label: "مؤكد", icon: CheckCircle },
                { id: "processing", label: "قيد المعالجة", icon: Activity },
                { id: "ready", label: "جاهز", icon: Target },
                { id: "delivered", label: "مسلم", icon: CheckCheck },
              ].map((step, index) => {
                const isActive = order.status === step.id;
                const isCompleted =
                  [
                    "draft",
                    "confirmed",
                    "processing",
                    "ready",
                    "delivered",
                  ].indexOf(order.status) >
                  [
                    "draft",
                    "confirmed",
                    "processing",
                    "ready",
                    "delivered",
                  ].indexOf(step.id);

                return (
                  <motion.div
                    key={step.id}
                    className="flex items-center flex-1"
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: index * 0.1 }}
                  >
                    <div className="flex items-center flex-1">
                      <div
                        className={`flex items-center justify-center w-10 h-10 rounded-full border-2 transition-all duration-300 ${
                          isActive
                            ? "bg-yellow-400 border-yellow-400 text-white scale-110"
                            : isCompleted
                            ? "bg-green-500 border-green-500 text-white"
                            : "bg-white/20 border-white/30 text-white/60"
                        }`}
                      >
                        <step.icon className="w-5 h-5" />
                      </div>
                      {index < 4 && (
                        <div
                          className={`flex-1 h-1 mx-2 transition-all duration-300 ${
                            isCompleted ? "bg-green-500" : "bg-white/20"
                          }`}
                        ></div>
                      )}
                    </div>
                    <div className="absolute -bottom-8 left-1/2 transform -translate-x-1/2 text-xs text-white/80 whitespace-nowrap">
                      {step.label}
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </div>
        </motion.div>

        {/* Status Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white p-6 rounded-2xl shadow-lg border border-gray-100 hover:shadow-xl transition-all duration-300"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-2 flex items-center">
                  <Activity className="w-4 h-4 mr-2" />
                  حالة الطلب
                </p>
                {getStatusBadge(order.status, "order")}
              </div>
              <button
                onClick={() => {
                  setSelectedStatus(order.status);
                  setShowStatusModal(true);
                }}
                className="p-2 bg-blue-100 hover:bg-blue-200 rounded-lg transition-colors"
              >
                <Edit className="w-4 h-4 text-blue-600" />
              </button>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white p-6 rounded-2xl shadow-lg border border-gray-100 hover:shadow-xl transition-all duration-300"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-2 flex items-center">
                  <CreditCard className="w-4 h-4 mr-2" />
                  حالة الدفع
                </p>
                {getStatusBadge(order.payment_status, "payment")}
              </div>
              <button
                onClick={() => {
                  setSelectedPaymentStatus(order.payment_status);
                  setShowPaymentModal(true);
                }}
                className="p-2 bg-green-100 hover:bg-green-200 rounded-lg transition-colors"
              >
                <Edit className="w-4 h-4 text-green-600" />
              </button>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white p-6 rounded-2xl shadow-lg border border-gray-100 hover:shadow-xl transition-all duration-300"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-2 flex items-center">
                  <Euro className="w-4 h-4 mr-2" />
                  المبلغ الإجمالي
                </p>
                <p className="text-2xl font-bold text-emerald-600">
                  {formatCurrency(
                    order.final_amount_eur || order.total_amount_eur,
                    "EUR"
                  )}
                </p>
              </div>
              <div className="p-3 bg-emerald-100 rounded-xl">
                <TrendingUp className="w-6 h-6 text-emerald-600" />
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-white p-6 rounded-2xl shadow-lg border border-gray-100 hover:shadow-xl transition-all duration-300"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-2 flex items-center">
                  <Package className="w-4 h-4 mr-2" />
                  عدد المنتجات
                </p>
                <p className="text-2xl font-bold text-purple-600">
                  {order.items?.length || 0}
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  {order.items?.reduce(
                    (sum, item) => sum + (item.quantity || 0),
                    0
                  )}{" "}
                  قطعة إجمالي
                </p>
              </div>
              <div className="p-3 bg-purple-100 rounded-xl">
                <Package className="w-6 h-6 text-purple-600" />
              </div>
            </div>
          </motion.div>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="xl:col-span-2 space-y-8">
            {/* Tabs Navigation */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden"
            >
              <div className="flex border-b border-gray-100">
                {[
                  { id: "details", label: "تفاصيل الطلب", icon: Info },
                  { id: "items", label: "المنتجات", icon: Package },
                  { id: "timeline", label: "التسلسل الزمني", icon: Clock },
                ].map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex items-center px-6 py-4 text-sm font-medium transition-all duration-200 ${
                      activeTab === tab.id
                        ? "bg-blue-50 text-blue-600 border-b-2 border-blue-600"
                        : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"
                    }`}
                  >
                    <tab.icon className="w-4 h-4 mr-2" />
                    {tab.label}
                  </button>
                ))}
              </div>

              <AnimatePresence mode="wait">
                {activeTab === "details" && (
                  <motion.div
                    key="details"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    className="p-6"
                  >
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-4">
                        <div className="p-4 bg-gray-50 rounded-xl border border-gray-100">
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            رقم الطلب
                          </label>
                          <div className="flex items-center justify-between">
                            <p className="text-lg font-mono font-bold text-blue-600">
                              #{order.order_number}
                            </p>
                            <button
                              onClick={() => {
                                navigator.clipboard.writeText(
                                  order.order_number
                                );
                                toast.success("تم نسخ رقم الطلب");
                              }}
                              className="p-2 bg-blue-100 hover:bg-blue-200 rounded-lg transition-colors"
                            >
                              <Copy className="w-4 h-4 text-blue-600" />
                            </button>
                          </div>
                        </div>

                        <div className="p-4 bg-gray-50 rounded-xl border border-gray-100">
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            تاريخ الطلب
                          </label>
                          <div className="flex items-center text-gray-700">
                            <Calendar className="w-5 h-5 mr-2" />
                            <span className="font-medium">
                              {new Date(order.order_date).toLocaleDateString(
                                "ar"
                              )}
                            </span>
                          </div>
                        </div>

                        <div className="p-4 bg-gray-50 rounded-xl border border-gray-100">
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            تاريخ التسليم المتوقع
                          </label>
                          <div className="flex items-center text-gray-700">
                            <Truck className="w-5 h-5 mr-2" />
                            <span className="font-medium">
                              {order.delivery_date
                                ? new Date(
                                    order.delivery_date
                                  ).toLocaleDateString("ar")
                                : "لم يتم تحديده"}
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="space-y-4">
                        <div className="p-4 bg-gray-50 rounded-xl border border-gray-100">
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            المتجر
                          </label>
                          <div className="flex items-center text-gray-700">
                            <Store className="w-5 h-5 mr-2" />
                            <span className="font-medium">
                              {order.store_name || "غير محدد"}
                            </span>
                          </div>
                        </div>

                        <div className="p-4 bg-gray-50 rounded-xl border border-gray-100">
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            تم الإنشاء بواسطة
                          </label>
                          <div className="flex items-center text-gray-700">
                            <User className="w-5 h-5 mr-2" />
                            <span className="font-medium">
                              {order.created_by_name || "غير محدد"}
                            </span>
                          </div>
                        </div>

                        <div className="p-4 bg-gray-50 rounded-xl border border-gray-100">
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            الأولوية
                          </label>
                          <div className="flex items-center">
                            <div
                              className={`w-3 h-3 rounded-full mr-2 ${
                                order.priority === "high"
                                  ? "bg-red-500"
                                  : order.priority === "medium"
                                  ? "bg-yellow-500"
                                  : "bg-green-500"
                              }`}
                            ></div>
                            <span className="font-medium text-gray-700">
                              {order.priority === "high"
                                ? "عالية"
                                : order.priority === "medium"
                                ? "متوسطة"
                                : "منخفضة"}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Distribution Information Section */}
                    <div className="mt-6 p-6 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl border border-blue-100">
                      <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center">
                        <Truck className="w-5 h-5 mr-2 text-blue-600" />
                        معلومات التوزيع
                      </h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="p-4 bg-white rounded-xl border border-gray-100">
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            الموظف المكلف
                          </label>
                          <div className="flex items-center text-gray-700">
                            <User className="w-5 h-5 mr-2" />
                            <span className="font-medium">
                              {order.assigned_distributor
                                ? order.assigned_distributor.full_name
                                : "لم يتم التعيين"}
                            </span>
                          </div>
                          {order.assigned_distributor && (
                            <div className="mt-2 text-sm text-gray-500 flex items-center">
                              <div className="w-3 h-3 bg-green-500 rounded-full mr-2"></div>
                              {order.assigned_distributor.phone ||
                                order.assigned_distributor.email}
                            </div>
                          )}
                        </div>

                        <div className="p-4 bg-white rounded-xl border border-gray-100">
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            حالة التوزيع
                          </label>
                          <div className="flex items-center">
                            <div
                              className={`w-3 h-3 rounded-full mr-2 ${
                                order.distribution_status_info?.color ===
                                "green"
                                  ? "bg-green-500"
                                  : order.distribution_status_info?.color ===
                                    "yellow"
                                  ? "bg-yellow-500"
                                  : order.distribution_status_info?.color ===
                                    "red"
                                  ? "bg-red-500"
                                  : "bg-gray-500"
                              }`}
                            ></div>
                            <span className="font-medium text-gray-700">
                              {order.distribution_status_info?.label ||
                                "في الانتظار"}
                            </span>
                            <span className="mr-2">
                              {order.distribution_status_info?.icon || "⏳"}
                            </span>
                          </div>
                        </div>

                        {order.assigned_at && (
                          <div className="p-4 bg-white rounded-xl border border-gray-100">
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              تاريخ التعيين
                            </label>
                            <div className="flex items-center text-gray-700">
                              <Calendar className="w-5 h-5 mr-2" />
                              <span className="font-medium">
                                {new Date(order.assigned_at).toLocaleDateString(
                                  "ar"
                                )}
                              </span>
                            </div>
                          </div>
                        )}

                        {order.delivery_started_at && (
                          <div className="p-4 bg-white rounded-xl border border-gray-100">
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              بدء التوصيل
                            </label>
                            <div className="flex items-center text-gray-700">
                              <Clock className="w-5 h-5 mr-2" />
                              <span className="font-medium">
                                {new Date(
                                  order.delivery_started_at
                                ).toLocaleDateString("ar")}{" "}
                                -{" "}
                                {new Date(
                                  order.delivery_started_at
                                ).toLocaleTimeString("ar")}
                              </span>
                            </div>
                          </div>
                        )}
                      </div>

                      {!order.has_assigned_distributor && (
                        <div className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded-xl flex items-center">
                          <AlertTriangle className="w-5 h-5 text-yellow-600 mr-2" />
                          <span className="text-yellow-800 font-medium">
                            هذا الطلب لم يتم تعيين موظف توزيع له بعد
                          </span>
                        </div>
                      )}
                    </div>

                    {order.notes && (
                      <div className="mt-6 p-4 bg-amber-50 rounded-xl border border-amber-100">
                        <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center">
                          <MessageSquare className="w-4 h-4 mr-2" />
                          الملاحظات
                        </label>
                        <p className="text-gray-800 leading-relaxed">
                          {order.notes}
                        </p>
                      </div>
                    )}
                  </motion.div>
                )}

                {activeTab === "items" && (
                  <motion.div
                    key="items"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    className="p-6"
                  >
                    <div className="space-y-4">
                      {order.items?.map((item, index) => (
                        <motion.div
                          key={item.id || index}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: index * 0.1 }}
                          className="p-6 bg-gray-50 rounded-xl border border-gray-100 hover:shadow-lg transition-all duration-300"
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-4 space-x-reverse">
                              <div className="p-3 bg-blue-100 rounded-xl">
                                <Package className="w-6 h-6 text-blue-600" />
                              </div>
                              <div>
                                <h3 className="font-bold text-gray-900 text-lg">
                                  {item.product_name || "منتج غير محدد"}
                                </h3>
                                {item.notes && (
                                  <p className="text-sm text-gray-500 mt-1">
                                    {item.notes}
                                  </p>
                                )}
                              </div>
                            </div>
                            <div className="text-right">
                              <p className="text-2xl font-bold text-emerald-600">
                                €
                                {parseFloat(
                                  item.final_price || item.total_price || 0
                                ).toFixed(2)}
                              </p>
                            </div>
                          </div>

                          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4 pt-4 border-t border-gray-100">
                            <div className="text-center">
                              <p className="text-sm text-gray-500">الكمية</p>
                              <p className="text-lg font-bold text-gray-900">
                                {item.quantity || 0}
                              </p>
                            </div>
                            <div className="text-center">
                              <p className="text-sm text-gray-500">
                                سعر الوحدة
                              </p>
                              <p className="text-lg font-bold text-gray-900">
                                €{parseFloat(item.unit_price || 0).toFixed(2)}
                              </p>
                            </div>
                            <div className="text-center">
                              <p className="text-sm text-gray-500">الخصم</p>
                              <p className="text-lg font-bold text-red-600">
                                {(item.discount_amount || 0) > 0
                                  ? `-€${parseFloat(
                                      item.discount_amount || 0
                                    ).toFixed(2)}`
                                  : "-"}
                              </p>
                            </div>
                            <div className="text-center">
                              <p className="text-sm text-gray-500">هدية</p>
                              <p className="text-lg font-bold text-green-600">
                                {(item.gift_quantity || 0) > 0
                                  ? `🎁 ${item.gift_quantity}`
                                  : "-"}
                              </p>
                            </div>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  </motion.div>
                )}

                {activeTab === "timeline" && (
                  <motion.div
                    key="timeline"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    className="p-6"
                  >
                    <div className="space-y-6">
                      <div className="flex items-center p-4 bg-green-50 rounded-xl border border-green-100">
                        <div className="p-2 bg-green-100 rounded-full mr-4">
                          <CheckCircle className="w-5 h-5 text-green-600" />
                        </div>
                        <div>
                          <h3 className="font-semibold text-green-800">
                            تم إنشاء الطلب
                          </h3>
                          <p className="text-sm text-green-600">
                            {new Date(order.created_at).toLocaleString("ar")}
                          </p>
                        </div>
                      </div>

                      {order.status !== "draft" && (
                        <div className="flex items-center p-4 bg-blue-50 rounded-xl border border-blue-100">
                          <div className="p-2 bg-blue-100 rounded-full mr-4">
                            <CheckCircle className="w-5 h-5 text-blue-600" />
                          </div>
                          <div>
                            <h3 className="font-semibold text-blue-800">
                              تم تأكيد الطلب
                            </h3>
                            <p className="text-sm text-blue-600">
                              تم تحديث الحالة إلى:{" "}
                              {getStatusLabel(order.status)}
                            </p>
                          </div>
                        </div>
                      )}

                      {order.updated_at !== order.created_at && (
                        <div className="flex items-center p-4 bg-yellow-50 rounded-xl border border-yellow-100">
                          <div className="p-2 bg-yellow-100 rounded-full mr-4">
                            <Clock className="w-5 h-5 text-yellow-600" />
                          </div>
                          <div>
                            <h3 className="font-semibold text-yellow-800">
                              آخر تحديث
                            </h3>
                            <p className="text-sm text-yellow-600">
                              {new Date(order.updated_at).toLocaleString("ar")}
                            </p>
                          </div>
                        </div>
                      )}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Order Summary */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
              className="bg-white shadow-lg rounded-2xl border border-gray-100 overflow-hidden"
            >
              <div className="px-6 py-4 bg-gradient-to-r from-emerald-600 to-green-600">
                <h2 className="text-xl font-bold text-white flex items-center">
                  <Calculator className="w-6 h-6 mr-3" />
                  ملخص الطلب
                </h2>
              </div>
              <div className="p-6 space-y-4">
                <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg border border-gray-100">
                  <span className="text-gray-600 flex items-center">
                    <Receipt className="w-4 h-4 mr-2" />
                    المبلغ الفرعي:
                  </span>
                  <span className="font-bold text-gray-900">
                    €{parseFloat(order.total_amount_eur || 0).toFixed(2)}
                  </span>
                </div>

                {(order.discount_amount || 0) > 0 && (
                  <div className="flex justify-between items-center p-3 bg-red-50 rounded-lg border border-red-100">
                    <span className="text-red-600 flex items-center">
                      <Tag className="w-4 h-4 mr-2" />
                      خصم الطلب:
                    </span>
                    <span className="font-bold text-red-600">
                      -€{parseFloat(order.discount_amount || 0).toFixed(2)}
                    </span>
                  </div>
                )}

                <div className="border-t-2 border-emerald-200 pt-4">
                  <div className="flex justify-between items-center p-4 bg-emerald-50 rounded-xl">
                    <span className="text-lg font-bold text-emerald-800 flex items-center">
                      <Star className="w-5 h-5 mr-2" />
                      المجموع النهائي:
                    </span>
                    <span className="text-2xl font-bold text-emerald-600">
                      €
                      {parseFloat(
                        order.final_amount_eur || order.total_amount_eur || 0
                      ).toFixed(2)}
                    </span>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Quick Actions Panel */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.7 }}
              className="bg-white shadow-lg rounded-2xl overflow-hidden border border-gray-100"
            >
              <div className="px-6 py-4 bg-gradient-to-r from-blue-600 to-indigo-600">
                <h2 className="text-xl font-bold text-white flex items-center">
                  <Workflow className="w-6 h-6 mr-3" />
                  الإجراءات السريعة
                </h2>
              </div>

              <div className="p-6">
                <div className="grid grid-cols-1 gap-4 mb-6">
                  <Button
                    variant="primary"
                    className="w-full justify-center text-white bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 shadow-lg hover:shadow-xl transition-all duration-300 border-0 py-4 text-lg font-semibold"
                    onClick={() => {
                      setSelectedStatus(order.status);
                      setShowStatusModal(true);
                    }}
                  >
                    <Workflow className="w-6 h-6 mr-3" />
                    تحديث حالة الطلب
                  </Button>

                  <Button
                    variant="primary"
                    className="w-full justify-center text-white bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-700 hover:to-green-700 shadow-lg hover:shadow-xl transition-all duration-300 border-0 py-4 text-lg font-semibold"
                    onClick={() => {
                      setSelectedPaymentStatus(order.payment_status);
                      setShowPaymentModal(true);
                    }}
                  >
                    <CreditCard className="w-6 h-6 mr-3" />
                    تحديث حالة الدفع
                  </Button>
                </div>

                {/* Status-based quick actions */}
                {order.status === "draft" && (
                  <div className="bg-yellow-50 rounded-2xl p-5 border border-yellow-200 mb-4">
                    <h3 className="text-sm font-bold text-yellow-800 mb-4">
                      إجراءات سريعة - مسودة
                    </h3>
                    <div className="grid grid-cols-1 gap-3">
                      <button
                        onClick={() => handleQuickStatusUpdate("confirmed")}
                        disabled={isUpdating}
                        className="flex items-center justify-center px-4 py-3 text-sm font-bold bg-blue-500 text-white rounded-xl hover:bg-blue-600 shadow-lg hover:shadow-xl transition-all duration-300 disabled:opacity-50"
                      >
                        <CheckCircle className="w-5 h-5 mr-2" />
                        {isUpdating ? "جاري التحديث..." : "تأكيد الطلب"}
                      </button>
                      <button
                        onClick={() => handleQuickStatusUpdate("cancelled")}
                        disabled={isUpdating}
                        className="flex items-center justify-center px-4 py-3 text-sm font-bold bg-red-500 text-white rounded-xl hover:bg-red-600 shadow-lg hover:shadow-xl transition-all duration-300 disabled:opacity-50"
                      >
                        <XCircle className="w-5 h-5 mr-2" />
                        إلغاء الطلب
                      </button>
                    </div>
                  </div>
                )}

                {order.status === "confirmed" && (
                  <div className="bg-blue-50 rounded-2xl p-5 border border-blue-200 mb-4">
                    <h3 className="text-sm font-bold text-blue-800 mb-4">
                      إجراءات سريعة - مؤكد
                    </h3>
                    <div className="grid grid-cols-1 gap-3">
                      <button
                        onClick={() => handleQuickStatusUpdate("processing")}
                        disabled={isUpdating}
                        className="flex items-center justify-center px-4 py-3 text-sm font-bold bg-orange-500 text-white rounded-xl hover:bg-orange-600 shadow-lg hover:shadow-xl transition-all duration-300 disabled:opacity-50"
                      >
                        <PlayCircle className="w-5 h-5 mr-2" />
                        بدء المعالجة
                      </button>
                      <button
                        onClick={() => handleQuickStatusUpdate("ready")}
                        disabled={isUpdating}
                        className="flex items-center justify-center px-4 py-3 text-sm font-bold bg-green-500 text-white rounded-xl hover:bg-green-600 shadow-lg hover:shadow-xl transition-all duration-300 disabled:opacity-50"
                      >
                        <Target className="w-5 h-5 mr-2" />
                        جاهز للتسليم
                      </button>
                    </div>
                  </div>
                )}

                {order.status === "processing" && (
                  <div className="bg-orange-50 rounded-2xl p-5 border border-orange-200 mb-4">
                    <h3 className="text-sm font-bold text-orange-800 mb-4">
                      إجراءات سريعة - قيد المعالجة
                    </h3>
                    <button
                      onClick={() => handleQuickStatusUpdate("ready")}
                      disabled={isUpdating}
                      className="w-full flex items-center justify-center px-4 py-3 text-sm font-bold bg-green-500 text-white rounded-xl hover:bg-green-600 shadow-lg hover:shadow-xl transition-all duration-300 disabled:opacity-50"
                    >
                      <CheckCheck className="w-5 h-5 mr-2" />
                      جاهز للتسليم
                    </button>
                  </div>
                )}

                {order.status === "ready" && (
                  <div className="bg-green-50 rounded-2xl p-5 border border-green-200 mb-4">
                    <h3 className="text-sm font-bold text-green-800 mb-4">
                      إجراءات سريعة - جاهز للتسليم
                    </h3>
                    <button
                      onClick={() => handleQuickStatusUpdate("delivered")}
                      disabled={isUpdating}
                      className="w-full flex items-center justify-center px-4 py-3 text-sm font-bold bg-emerald-500 text-white rounded-xl hover:bg-emerald-600 shadow-lg hover:shadow-xl transition-all duration-300 disabled:opacity-50"
                    >
                      <Truck className="w-5 h-5 mr-2" />
                      تم التسليم
                    </button>
                  </div>
                )}

                {/* Enhanced Features Integration */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.9 }}
                  className="bg-white shadow-lg rounded-2xl border border-gray-100 overflow-hidden"
                >
                  <div className="px-6 py-4 bg-gradient-to-r from-indigo-600 to-purple-600">
                    <h2 className="text-xl font-bold text-white flex items-center">
                      <motion.div
                        animate={{ rotate: [0, 360] }}
                        transition={{
                          duration: 8,
                          repeat: Infinity,
                          ease: "linear",
                        }}
                        className="mr-3"
                      >
                        <Star className="w-6 h-6 text-yellow-300" />
                      </motion.div>
                      الميزات المتقدمة
                    </h2>
                    <p className="text-indigo-100 text-sm mt-1">
                      أدوات متقدمة لإدارة وتحسين الطلب
                    </p>
                  </div>

                  <div className="p-6">
                    <EnhancedOrderActions
                      order={order}
                      className="border-0 shadow-none bg-transparent"
                    />
                  </div>
                </motion.div>
              </div>
            </motion.div>
          </div>
        </div>

        {/* Modals */}
        <StatusUpdateModal
          show={showStatusModal}
          onClose={() => setShowStatusModal(false)}
          title="تحديث حالة الطلب"
          currentStatus={order.status}
          statusOptions={orderService.getStatusOptions()}
          onUpdate={handleStatusUpdate}
          selectedStatus={selectedStatus}
          setSelectedStatus={setSelectedStatus}
        />

        <StatusUpdateModal
          show={showPaymentModal}
          onClose={() => setShowPaymentModal(false)}
          title="تحديث حالة الدفع"
          currentStatus={order.payment_status}
          statusOptions={orderService.getPaymentStatusOptions()}
          onUpdate={handlePaymentStatusUpdate}
          selectedStatus={selectedPaymentStatus}
          setSelectedStatus={setSelectedPaymentStatus}
        />
      </div>
    </div>
  );
};

export default OrderDetailsPage;
