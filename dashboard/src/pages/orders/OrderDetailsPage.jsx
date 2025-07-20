import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
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
  Phone,
  MapPin,
  Euro,
  DollarSign,
  Gift,
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
  MoreVertical,
  Truck,
  Building,
  Globe,
  Calculator,
  Zap,
  Copy,
  TrendingUp,
  AlertTriangle,
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
      const response = await orderService.updateOrderStatus(id, {
        status: newStatus,
      });

      if (response.success) {
        setOrder((prev) => ({
          ...prev,
          status: newStatus,
        }));
        toast.success(
          `تم تحديث حالة الطلب إلى: ${
            newStatus === "draft"
              ? "مسودة"
              : newStatus === "confirmed"
              ? "مؤكد"
              : newStatus === "processing"
              ? "قيد المعالجة"
              : newStatus === "ready"
              ? "جاهز"
              : newStatus === "delivered"
              ? "تم التسليم"
              : "ملغي"
          }`
        );
      } else {
        toast.error(response.message || "خطأ في تحديث حالة الطلب");
      }
    } catch (error) {
      console.error("Error updating order status:", error);
      toast.error("خطأ في تحديث حالة الطلب");
    }
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

  // Status update modal
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
    <div
      className={`fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 ${
        show ? "block" : "hidden"
      }`}
    >
      <div className="bg-white rounded-lg max-w-md w-full mx-4">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-gray-900">{title}</h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        <div className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              الحالة الحالية
            </label>
            {getStatusBadge(
              currentStatus,
              title.includes("Payment") ? "payment" : "order"
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              الحالة الجديدة
            </label>
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">اختر حالة جديدة</option>
              {statusOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="p-6 border-t border-gray-200 flex justify-end space-x-3">
          <Button variant="outline" onClick={onClose}>
            إلغاء
          </Button>
          <Button onClick={onUpdate} disabled={!selectedStatus || isUpdating}>
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
      </div>
    </div>
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
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="bg-white shadow rounded-lg mb-8">
          <div className="px-6 py-4">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center">
              <div className="flex items-center space-x-4">
                <Link
                  to="/orders"
                  className="text-gray-500 hover:text-gray-700"
                >
                  <ArrowLeft className="w-6 h-6" />
                </Link>
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">
                    الطلب رقم #{order.order_number}
                  </h1>
                  <p className="text-gray-600 mt-1">
                    تم إنشاؤه في{" "}
                    {new Date(order.created_at).toLocaleDateString("ar")}
                  </p>
                </div>
              </div>
              <div className="flex items-center space-x-3 mt-4 sm:mt-0">
                <Button variant="outline" size="sm" onClick={handlePrint}>
                  <Printer className="w-4 h-4 mr-2" />
                  طباعة
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => fetchOrder()}
                >
                  <RefreshCw className="w-4 h-4 mr-2" />
                  تحديث
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => navigate(`/orders/${id}/edit`)}
                >
                  <Edit className="w-4 h-4 mr-2" />
                  تعديل
                </Button>
                {order.status === "draft" && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleDeleteOrder}
                    className="text-red-600 hover:text-red-700"
                  >
                    <Trash2 className="w-4 h-4 mr-2" />
                    حذف
                  </Button>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Order Status Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white p-6 rounded-lg shadow"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-2">حالة الطلب</p>
                {getStatusBadge(order.status, "order")}
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setSelectedStatus(order.status);
                  setShowStatusModal(true);
                }}
              >
                <Edit className="w-4 h-4" />
              </Button>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white p-6 rounded-lg shadow"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-2">حالة الدفع</p>
                {getStatusBadge(order.payment_status, "payment")}
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setSelectedPaymentStatus(order.payment_status);
                  setShowPaymentModal(true);
                }}
              >
                <Edit className="w-4 h-4" />
              </Button>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white p-6 rounded-lg shadow"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-2">
                  المبلغ الإجمالي (يورو)
                </p>
                <p className="text-2xl font-bold text-green-600">
                  {formatCurrency(
                    order.final_amount_eur || order.total_amount_eur,
                    "EUR"
                  )}
                </p>
              </div>
              <div className="p-2 bg-green-100 rounded-lg">
                <Euro className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </motion.div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Order Details */}
          <div className="lg:col-span-2 space-y-8">
            {/* Basic Information */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="bg-white shadow rounded-lg"
            >
              <div className="px-6 py-4 border-b border-gray-200">
                <h2 className="text-lg font-semibold text-gray-900">
                  معلومات الطلب
                </h2>
              </div>
              <div className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        رقم الطلب
                      </label>
                      <p className="text-sm text-gray-900 font-mono bg-gray-50 px-3 py-2 rounded">
                        {order.order_number}
                      </p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        تاريخ الطلب
                      </label>
                      <div className="flex items-center space-x-2 text-sm text-gray-900">
                        <Calendar className="w-4 h-4 text-gray-400" />
                        <span>
                          {new Date(order.order_date).toLocaleDateString("ar")}
                        </span>
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        تاريخ التسليم
                      </label>
                      <div className="flex items-center space-x-2 text-sm text-gray-900">
                        <Truck className="w-4 h-4 text-gray-400" />
                        <span>
                          {order.delivery_date
                            ? new Date(order.delivery_date).toLocaleDateString(
                                "ar"
                              )
                            : "لم يتم تحديده"}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        المتجر
                      </label>
                      <div className="flex items-center space-x-2 text-sm text-gray-900">
                        <Store className="w-4 h-4 text-gray-400" />
                        <span>{order.store_name || "غير محدد"}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {order.notes && (
                  <div className="mt-6">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      الملاحظات
                    </label>
                    <div className="p-4 bg-gray-50 rounded-lg">
                      <p className="text-sm text-gray-900">{order.notes}</p>
                    </div>
                  </div>
                )}
              </div>
            </motion.div>

            {/* Order Items */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="bg-white shadow rounded-lg"
            >
              <div className="px-6 py-4 border-b border-gray-200">
                <h2 className="text-lg font-semibold text-gray-900">
                  عناصر الطلب
                </h2>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="text-right py-3 px-6 text-xs font-medium text-gray-500 uppercase tracking-wider">
                        المنتج
                      </th>
                      <th className="text-center py-3 px-6 text-xs font-medium text-gray-500 uppercase tracking-wider">
                        الكمية
                      </th>
                      <th className="text-center py-3 px-6 text-xs font-medium text-gray-500 uppercase tracking-wider">
                        سعر الوحدة
                      </th>
                      <th className="text-center py-3 px-6 text-xs font-medium text-gray-500 uppercase tracking-wider">
                        الخصم
                      </th>
                      <th className="text-center py-3 px-6 text-xs font-medium text-gray-500 uppercase tracking-wider">
                        هدية
                      </th>
                      <th className="text-center py-3 px-6 text-xs font-medium text-gray-500 uppercase tracking-wider">
                        المجموع
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {order.items?.map((item, index) => (
                      <tr key={item.id || index} className="hover:bg-gray-50">
                        <td className="py-4 px-6">
                          <div className="flex items-center space-x-3">
                            <div className="p-2 bg-blue-100 rounded-lg">
                              <Package className="w-4 h-4 text-blue-600" />
                            </div>
                            <div>
                              <p className="font-medium text-gray-900">
                                {item.product_name || "منتج غير محدد"}
                              </p>
                              {item.notes && (
                                <p className="text-xs text-gray-500 mt-1">
                                  {item.notes}
                                </p>
                              )}
                            </div>
                          </div>
                        </td>
                        <td className="py-4 px-6 text-center">
                          <span className="font-medium">
                            {item.quantity || 0}
                          </span>
                        </td>
                        <td className="py-4 px-6 text-center">
                          <span className="font-medium">
                            €{parseFloat(item.unit_price || 0).toFixed(2)}
                          </span>
                        </td>
                        <td className="py-4 px-6 text-center">
                          {(item.discount_amount || 0) > 0 ? (
                            <span className="text-red-600 font-medium">
                              -€
                              {parseFloat(item.discount_amount || 0).toFixed(2)}
                            </span>
                          ) : (
                            <span className="text-gray-400">-</span>
                          )}
                        </td>
                        <td className="py-4 px-6 text-center">
                          {(item.gift_quantity || 0) > 0 ? (
                            <div className="flex items-center justify-center space-x-1">
                              <Gift className="w-4 h-4 text-green-600" />
                              <span className="text-green-600 font-medium">
                                {item.gift_quantity}
                              </span>
                            </div>
                          ) : (
                            <span className="text-gray-400">-</span>
                          )}
                        </td>
                        <td className="py-4 px-6 text-center">
                          <span className="font-bold text-green-600">
                            €
                            {parseFloat(
                              item.final_price || item.total_price || 0
                            ).toFixed(2)}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </motion.div>
          </div>

          {/* Order Summary & Actions */}
          <div className="space-y-6">
            {/* Order Summary */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
              className="bg-white shadow rounded-lg"
            >
              <div className="px-6 py-4 border-b border-gray-200">
                <h2 className="text-lg font-semibold text-gray-900">
                  ملخص الطلب
                </h2>
              </div>
              <div className="p-6 space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">المبلغ الفرعي:</span>
                  <span className="font-medium">
                    €{parseFloat(order.total_amount_eur || 0).toFixed(2)}
                  </span>
                </div>

                {(order.discount_amount || 0) > 0 && (
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">خصم الطلب:</span>
                    <span className="font-medium text-red-600">
                      -€{parseFloat(order.discount_amount || 0).toFixed(2)}
                    </span>
                  </div>
                )}

                <div className="border-t pt-4">
                  <div className="flex justify-between items-center">
                    <span className="text-lg font-semibold">
                      المجموع النهائي:
                    </span>
                    <span className="text-xl font-bold text-green-600">
                      €
                      {parseFloat(
                        order.final_amount_eur || order.total_amount_eur || 0
                      ).toFixed(2)}
                    </span>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Enhanced Quick Actions */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.7 }}
              className="bg-gradient-to-r from-white via-blue-50 to-indigo-50 shadow-lg rounded-2xl overflow-hidden border-2 border-blue-100"
            >
              <div className="px-6 py-5 border-b-2 border-blue-200 bg-gradient-to-r from-blue-600 to-indigo-700">
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-bold text-white flex items-center">
                    <motion.div
                      animate={{ rotate: [0, 360] }}
                      transition={{
                        duration: 2,
                        repeat: Infinity,
                        ease: "linear",
                      }}
                      className="mr-3"
                    >
                      <Zap className="w-6 h-6 text-yellow-300" />
                    </motion.div>
                    الإجراءات السريعة
                  </h2>
                  <div className="bg-white/20 backdrop-blur-sm px-3 py-1 rounded-full">
                    <span className="text-sm font-medium text-white flex items-center">
                      <div
                        className={`w-2 h-2 rounded-full mr-2 ${
                          order.status === "draft"
                            ? "bg-yellow-400"
                            : order.status === "confirmed"
                            ? "bg-blue-400"
                            : order.status === "processing"
                            ? "bg-orange-400"
                            : order.status === "ready"
                            ? "bg-green-400"
                            : order.status === "delivered"
                            ? "bg-emerald-400"
                            : "bg-red-400"
                        }`}
                      ></div>
                      {order.status === "draft"
                        ? "مسودة"
                        : order.status === "confirmed"
                        ? "مؤكد"
                        : order.status === "processing"
                        ? "قيد المعالجة"
                        : order.status === "ready"
                        ? "جاهز"
                        : order.status === "delivered"
                        ? "تم التسليم"
                        : "ملغي"}
                    </span>
                  </div>
                </div>
              </div>

              <div className="p-6 bg-gradient-to-b from-transparent to-blue-50/50">
                {/* Primary Actions */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
                  <motion.div
                    whileHover={{ scale: 1.02, y: -2 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <Button
                      variant="primary"
                      className="w-full justify-center text-white bg-gradient-to-r from-blue-600 via-blue-700 to-indigo-700 hover:from-blue-700 hover:via-blue-800 hover:to-indigo-800 shadow-lg hover:shadow-xl transition-all duration-300 border-0 py-3"
                      onClick={() => {
                        setSelectedStatus(order.status);
                        setShowStatusModal(true);
                      }}
                    >
                      <motion.div
                        animate={{ rotate: [0, 15, -15, 0] }}
                        transition={{ duration: 2, repeat: Infinity }}
                        className="mr-2"
                      >
                        <Edit className="w-5 h-5" />
                      </motion.div>
                      تحديث حالة الطلب
                    </Button>
                  </motion.div>

                  <motion.div
                    whileHover={{ scale: 1.02, y: -2 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <Button
                      variant="primary"
                      className="w-full justify-center text-white bg-gradient-to-r from-emerald-600 via-green-700 to-teal-700 hover:from-emerald-700 hover:via-green-800 hover:to-teal-800 shadow-lg hover:shadow-xl transition-all duration-300 border-0 py-3"
                      onClick={() => {
                        setSelectedPaymentStatus(order.payment_status);
                        setShowPaymentModal(true);
                      }}
                    >
                      <motion.div
                        animate={{ scale: [1, 1.1, 1] }}
                        transition={{ duration: 1.5, repeat: Infinity }}
                        className="mr-2"
                      >
                        <CreditCard className="w-5 h-5" />
                      </motion.div>
                      تحديث الدفع
                    </Button>
                  </motion.div>
                </div>

                {/* Secondary Actions */}
                <div className="bg-gradient-to-r from-gray-50 to-blue-50 rounded-xl p-4 mb-4">
                  <h3 className="text-sm font-semibold text-gray-700 mb-3 flex items-center">
                    <div className="w-2 h-2 bg-blue-500 rounded-full mr-2"></div>
                    إجراءات إضافية
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <motion.div
                      whileHover={{ scale: 1.02, x: 5 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <Button
                        variant="outline"
                        className="w-full justify-start bg-white hover:bg-blue-50 border-2 border-blue-200 hover:border-blue-300 text-blue-700 hover:text-blue-800 transition-all duration-200"
                        onClick={() => navigate(`/orders/${id}/edit`)}
                      >
                        <div className="flex items-center">
                          <div className="p-1 bg-blue-100 rounded-lg mr-3">
                            <Edit className="w-4 h-4 text-blue-600" />
                          </div>
                          <div>
                            <div className="font-medium text-right">
                              تعديل الطلب
                            </div>
                            <div className="text-xs text-gray-500">
                              تحديث المحتويات
                            </div>
                          </div>
                        </div>
                      </Button>
                    </motion.div>

                    <motion.div
                      whileHover={{ scale: 1.02, x: 5 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <Button
                        variant="outline"
                        className="w-full justify-start bg-white hover:bg-purple-50 border-2 border-purple-200 hover:border-purple-300 text-purple-700 hover:text-purple-800 transition-all duration-200"
                        onClick={handlePrint}
                      >
                        <div className="flex items-center">
                          <div className="p-1 bg-purple-100 rounded-lg mr-3">
                            <Printer className="w-4 h-4 text-purple-600" />
                          </div>
                          <div>
                            <div className="font-medium text-right">
                              طباعة الفاتورة
                            </div>
                            <div className="text-xs text-gray-500">
                              PDF أو ورقي
                            </div>
                          </div>
                        </div>
                      </Button>
                    </motion.div>

                    <motion.div
                      whileHover={{ scale: 1.02, x: 5 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <Button
                        variant="outline"
                        className="w-full justify-start bg-white hover:bg-indigo-50 border-2 border-indigo-200 hover:border-indigo-300 text-indigo-700 hover:text-indigo-800 transition-all duration-200"
                        onClick={() => {
                          navigator.clipboard.writeText(
                            `طلب رقم ${
                              order.order_number || order.id
                            } - €${parseFloat(
                              order.final_amount_eur ||
                                order.total_amount_eur ||
                                0
                            ).toFixed(2)}`
                          );
                          toast.success("تم نسخ تفاصيل الطلب");
                        }}
                      >
                        <div className="flex items-center">
                          <div className="p-1 bg-indigo-100 rounded-lg mr-3">
                            <Copy className="w-4 h-4 text-indigo-600" />
                          </div>
                          <div>
                            <div className="font-medium text-right">
                              نسخ التفاصيل
                            </div>
                            <div className="text-xs text-gray-500">للحافظة</div>
                          </div>
                        </div>
                      </Button>
                    </motion.div>

                    <motion.div
                      whileHover={{ scale: 1.02, x: 5 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <Button
                        variant="outline"
                        className="w-full justify-start bg-white hover:bg-gray-50 border-2 border-gray-200 hover:border-gray-300 text-gray-700 hover:text-gray-800 transition-all duration-200"
                        onClick={() => navigate("/orders")}
                      >
                        <div className="flex items-center">
                          <div className="p-1 bg-gray-100 rounded-lg mr-3">
                            <ArrowLeft className="w-4 h-4 text-gray-600" />
                          </div>
                          <div>
                            <div className="font-medium text-right">
                              العودة للقائمة
                            </div>
                            <div className="text-xs text-gray-500">
                              جميع الطلبات
                            </div>
                          </div>
                        </div>
                      </Button>
                    </motion.div>
                  </div>
                </div>

                {/* Enhanced Features Integration */}
                <div className="bg-gradient-to-r from-indigo-50 to-purple-50 rounded-xl p-4 mb-4">
                  <h3 className="text-sm font-semibold text-gray-700 mb-3 flex items-center">
                    <div className="w-2 h-2 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full mr-2"></div>
                    الميزات المتقدمة
                  </h3>
                  <EnhancedOrderActions
                    order={order}
                    className="bg-white/50 backdrop-blur-sm border border-indigo-200 rounded-lg"
                  />
                </div>

                {/* Quick Status Actions */}
                {order.status === "draft" && (
                  <div className="bg-gradient-to-r from-yellow-50 to-blue-50 rounded-xl p-4 border-l-4 border-yellow-400">
                    <div className="flex items-center mb-3">
                      <div className="w-2 h-2 bg-yellow-500 rounded-full mr-2 animate-pulse"></div>
                      <p className="text-sm font-medium text-gray-700">
                        إجراءات سريعة - مسودة
                      </p>
                    </div>
                    <div className="flex flex-wrap gap-3">
                      <motion.button
                        whileHover={{ scale: 1.05, y: -2 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => handleQuickStatusUpdate("confirmed")}
                        className="flex items-center px-4 py-2 text-sm font-medium bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-lg hover:from-blue-600 hover:to-blue-700 shadow-md hover:shadow-lg transition-all duration-200"
                      >
                        <motion.div
                          animate={{ scale: [1, 1.2, 1] }}
                          transition={{ duration: 2, repeat: Infinity }}
                          className="mr-2"
                        >
                          ✓
                        </motion.div>
                        تأكيد الطلب
                      </motion.button>
                      <motion.button
                        whileHover={{ scale: 1.05, y: -2 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => handleQuickStatusUpdate("cancelled")}
                        className="flex items-center px-4 py-2 text-sm font-medium bg-gradient-to-r from-red-500 to-red-600 text-white rounded-lg hover:from-red-600 hover:to-red-700 shadow-md hover:shadow-lg transition-all duration-200"
                      >
                        <motion.div
                          animate={{ rotate: [0, 180, 360] }}
                          transition={{ duration: 3, repeat: Infinity }}
                          className="mr-2"
                        >
                          ✕
                        </motion.div>
                        إلغاء الطلب
                      </motion.button>
                    </div>
                  </div>
                )}

                {order.status === "confirmed" && (
                  <div className="bg-gradient-to-r from-blue-50 to-green-50 rounded-xl p-4 border-l-4 border-blue-400">
                    <div className="flex items-center mb-3">
                      <div className="w-2 h-2 bg-blue-500 rounded-full mr-2 animate-pulse"></div>
                      <p className="text-sm font-medium text-gray-700">
                        إجراءات سريعة - مؤكد
                      </p>
                    </div>
                    <div className="flex flex-wrap gap-3">
                      <motion.button
                        whileHover={{ scale: 1.05, y: -2 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => handleQuickStatusUpdate("processing")}
                        className="flex items-center px-4 py-2 text-sm font-medium bg-gradient-to-r from-yellow-500 to-orange-500 text-white rounded-lg hover:from-yellow-600 hover:to-orange-600 shadow-md hover:shadow-lg transition-all duration-200"
                      >
                        <motion.div
                          animate={{ rotate: [0, 360] }}
                          transition={{
                            duration: 2,
                            repeat: Infinity,
                            ease: "linear",
                          }}
                          className="mr-2"
                        >
                          🔄
                        </motion.div>
                        بدء المعالجة
                      </motion.button>
                      <motion.button
                        whileHover={{ scale: 1.05, y: -2 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => handleQuickStatusUpdate("ready")}
                        className="flex items-center px-4 py-2 text-sm font-medium bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-lg hover:from-green-600 hover:to-emerald-600 shadow-md hover:shadow-lg transition-all duration-200"
                      >
                        <motion.div
                          animate={{ scale: [1, 1.1, 1] }}
                          transition={{ duration: 1.5, repeat: Infinity }}
                          className="mr-2"
                        >
                          ✅
                        </motion.div>
                        جاهز للتسليم
                      </motion.button>
                    </div>
                  </div>
                )}

                {order.status === "ready" && (
                  <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl p-4 border-l-4 border-green-400">
                    <div className="flex items-center mb-3">
                      <div className="w-2 h-2 bg-green-500 rounded-full mr-2 animate-pulse"></div>
                      <p className="text-sm font-medium text-gray-700">
                        إجراءات سريعة - جاهز
                      </p>
                    </div>
                    <div className="flex flex-wrap gap-3">
                      <motion.button
                        whileHover={{ scale: 1.05, y: -2 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => handleQuickStatusUpdate("delivered")}
                        className="flex items-center px-4 py-2 text-sm font-medium bg-gradient-to-r from-emerald-500 to-green-600 text-white rounded-lg hover:from-emerald-600 hover:to-green-700 shadow-md hover:shadow-lg transition-all duration-200"
                      >
                        <motion.div
                          animate={{ x: [0, 10, 0] }}
                          transition={{ duration: 2, repeat: Infinity }}
                          className="mr-2"
                        >
                          🚚
                        </motion.div>
                        تم التسليم
                      </motion.button>
                    </div>
                  </div>
                )}

                {/* Processing and other statuses */}
                {order.status === "processing" && (
                  <div className="bg-gradient-to-r from-orange-50 to-yellow-50 rounded-xl p-4 border-l-4 border-orange-400">
                    <div className="flex items-center mb-3">
                      <div className="w-2 h-2 bg-orange-500 rounded-full mr-2 animate-pulse"></div>
                      <p className="text-sm font-medium text-gray-700">
                        إجراءات سريعة - قيد المعالجة
                      </p>
                    </div>
                    <div className="flex flex-wrap gap-3">
                      <motion.button
                        whileHover={{ scale: 1.05, y: -2 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => handleQuickStatusUpdate("ready")}
                        className="flex items-center px-4 py-2 text-sm font-medium bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-lg hover:from-green-600 hover:to-emerald-600 shadow-md hover:shadow-lg transition-all duration-200"
                      >
                        <motion.div
                          animate={{ scale: [1, 1.2, 1] }}
                          transition={{ duration: 1.5, repeat: Infinity }}
                          className="mr-2"
                        >
                          ✅
                        </motion.div>
                        جاهز للتسليم
                      </motion.button>
                    </div>
                  </div>
                )}
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
