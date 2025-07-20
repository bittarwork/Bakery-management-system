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
  TrendingUp,
  AlertTriangle,
} from "lucide-react";
import Button from "../../components/ui/Button";
import LoadingSpinner from "../../components/ui/LoadingSpinner";
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

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-white p-6 rounded-lg shadow"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-2">
                  المبلغ الإجمالي (ليرة)
                </p>
                <p className="text-2xl font-bold text-purple-600">
                  {new Intl.NumberFormat("ar-SY").format(
                    order.final_amount_syp || order.total_amount_syp || 0
                  )}{" "}
                  ل.س
                </p>
              </div>
              <div className="p-2 bg-purple-100 rounded-lg">
                <DollarSign className="w-6 h-6 text-purple-600" />
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
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        العملة
                      </label>
                      <div className="flex items-center space-x-2 text-sm text-gray-900">
                        <Globe className="w-4 h-4 text-gray-400" />
                        <span>{order.currency || "EUR"}</span>
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        سعر الصرف
                      </label>
                      <div className="flex items-center space-x-2 text-sm text-gray-900">
                        <Calculator className="w-4 h-4 text-gray-400" />
                        <span>1 EUR = {order.exchange_rate || 0} SYP</span>
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
                            {order.currency === "EUR" ? "€" : "ل.س"}
                            {(item.unit_price || 0).toFixed(2)}
                          </span>
                        </td>
                        <td className="py-4 px-6 text-center">
                          {(item.discount_amount || 0) > 0 ? (
                            <span className="text-red-600 font-medium">
                              -{order.currency === "EUR" ? "€" : "ل.س"}
                              {(item.discount_amount || 0).toFixed(2)}
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
                            {order.currency === "EUR" ? "€" : "ل.س"}
                            {(
                              item.final_price ||
                              item.total_price ||
                              0
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
                    {order.currency === "EUR" ? "€" : "ل.س"}
                    {(
                      order.total_amount_eur ||
                      order.total_amount_syp ||
                      0
                    ).toFixed(2)}
                  </span>
                </div>

                {(order.discount_amount || 0) > 0 && (
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">خصم الطلب:</span>
                    <span className="font-medium text-red-600">
                      -{order.currency === "EUR" ? "€" : "ل.س"}
                      {(order.discount_amount || 0).toFixed(2)}
                    </span>
                  </div>
                )}

                <div className="border-t pt-4">
                  <div className="flex justify-between items-center">
                    <span className="text-lg font-semibold">
                      المجموع النهائي:
                    </span>
                    <span className="text-xl font-bold text-green-600">
                      {order.currency === "EUR" ? "€" : "ل.س"}
                      {(
                        order.final_amount_eur ||
                        order.final_amount_syp ||
                        order.total_amount_eur ||
                        order.total_amount_syp ||
                        0
                      ).toFixed(2)}
                    </span>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Quick Actions */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.7 }}
              className="bg-white shadow rounded-lg"
            >
              <div className="px-6 py-4 border-b border-gray-200">
                <h2 className="text-lg font-semibold text-gray-900">
                  إجراءات سريعة
                </h2>
              </div>
              <div className="p-6 space-y-3">
                <Button
                  variant="outline"
                  className="w-full justify-start"
                  onClick={() => {
                    setSelectedStatus(order.status);
                    setShowStatusModal(true);
                  }}
                >
                  <Edit className="w-4 h-4 mr-2" />
                  تحديث حالة الطلب
                </Button>
                <Button
                  variant="outline"
                  className="w-full justify-start"
                  onClick={() => {
                    setSelectedPaymentStatus(order.payment_status);
                    setShowPaymentModal(true);
                  }}
                >
                  <CreditCard className="w-4 h-4 mr-2" />
                  تحديث حالة الدفع
                </Button>
                <Button
                  variant="outline"
                  className="w-full justify-start"
                  onClick={() => navigate(`/orders/${id}/edit`)}
                >
                  <Edit className="w-4 h-4 mr-2" />
                  تعديل الطلب
                </Button>
                <Button
                  variant="outline"
                  className="w-full justify-start"
                  onClick={handlePrint}
                >
                  <Printer className="w-4 h-4 mr-2" />
                  طباعة الطلب
                </Button>
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
