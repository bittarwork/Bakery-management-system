import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  User,
  Store,
  Calendar,
  Euro,
  FileText,
  CheckCircle,
  XCircle,
  ArrowLeft,
  Package,
  Clock,
  CreditCard,
  Truck,
  MapPin,
  Phone,
  Mail,
  Hash,
  ShoppingCart,
  DollarSign,
  AlertTriangle,
  Info,
  Activity,
  Printer,
  Copy,
  RefreshCw,
} from "lucide-react";
import { toast } from "react-hot-toast";
import orderService from "../../services/orderService.js";
import { Card, CardHeader, CardBody } from "../../components/ui/Card";
import EnhancedButton from "../../components/ui/EnhancedButton";
import LoadingSpinner from "../../components/ui/LoadingSpinner";

const OrderDetailsPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  // State management
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);

  // Load order data
  useEffect(() => {
    if (id) {
      loadOrder();
    }
  }, [id]);

  const loadOrder = async () => {
    try {
      setLoading(true);
      const response = await orderService.getOrder(id);

      if (response && response.success !== false) {
        const orderData = response.data || response;
        setOrder(orderData);
      } else {
        const errorMessage = response?.message || "خطأ في تحميل الطلب";
        toast.error(errorMessage);
        navigate("/orders");
      }
    } catch (error) {
      console.error("Error loading order:", error);
      let errorMessage = "خطأ في تحميل الطلب";

      if (error.response?.status === 404) {
        errorMessage = "الطلب غير موجود";
      } else if (error.response?.status === 403) {
        errorMessage = "غير مصرح لك بالوصول إلى هذا الطلب";
      } else if (error.response?.status >= 500) {
        errorMessage = "خطأ في الخادم - يرجى المحاولة مرة أخرى لاحقاً";
      } else if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error.message) {
        errorMessage = error.message;
      }

      toast.error(errorMessage);
      navigate("/orders");
    } finally {
      setLoading(false);
    }
  };

  // Helper functions
  const formatDate = (dateString) => {
    if (!dateString) return "غير محدد";
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const formatDateTime = (dateString) => {
    if (!dateString) return "غير محدد";
    return new Date(dateString).toLocaleString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const formatAmount = (amount, currency = "EUR") => {
    const numAmount = parseFloat(amount || 0);
    return currency === "EUR"
      ? `€${numAmount.toFixed(2)}`
      : `${numAmount.toLocaleString()} ل.س`;
  };

  const calculateOrderStats = () => {
    if (!order?.items) return { totalItems: 0, totalQuantity: 0 };

    return {
      totalItems: order.items.length,
      totalQuantity: order.items.reduce(
        (sum, item) => sum + (parseInt(item.quantity) || 0),
        0
      ),
    };
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (!order) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card>
          <CardBody>
            <div className="text-center py-12">
              <Package className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                الطلب غير موجود
              </h3>
              <p className="text-gray-600 mb-6">
                الطلب الذي تبحث عنه غير موجود أو تم حذفه.
              </p>
              <EnhancedButton
                onClick={() => navigate("/orders")}
                variant="primary"
                icon={<ArrowLeft className="w-4 h-4" />}
              >
                العودة إلى الطلبات
              </EnhancedButton>
            </div>
          </CardBody>
        </Card>
      </div>
    );
  }

  const orderStats = calculateOrderStats();

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-4">
              <EnhancedButton
                onClick={() => navigate("/orders")}
                variant="ghost"
                size="sm"
                icon={<ArrowLeft className="w-4 h-4" />}
              >
                العودة
              </EnhancedButton>
              <div>
                <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-3">
                  <ShoppingCart className="w-7 h-7 text-blue-600" />
                  طلب #{order.order_number || order.id}
                </h1>
                <p className="text-sm text-gray-500 mt-1">
                  تفاصيل الطلب وإدارته
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <EnhancedButton
                onClick={() => window.print()}
                variant="outline"
                size="sm"
                icon={<Printer className="w-4 h-4" />}
              >
                طباعة
              </EnhancedButton>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Status Cards */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8"
        >
          <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
            <CardBody>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-blue-600 text-xs font-medium uppercase tracking-wide">
                    حالة الطلب
                  </p>
                  <p className="text-lg font-bold text-blue-900 mt-1">
                    {order.status === "draft" && "مسودة"}
                    {order.status === "pending" && "معلق"}
                    {order.status === "confirmed" && "مؤكد"}
                    {order.status === "processing" && "قيد المعالجة"}
                    {order.status === "ready" && "جاهز"}
                    {order.status === "delivered" && "مُسلّم"}
                    {order.status === "cancelled" && "ملغي"}
                  </p>
                </div>
                <Activity className="w-8 h-8 text-blue-600" />
              </div>
            </CardBody>
          </Card>

          <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200">
            <CardBody>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-green-600 text-xs font-medium uppercase tracking-wide">
                    حالة الدفع
                  </p>
                  <p className="text-lg font-bold text-green-900 mt-1">
                    {order.payment_status === "pending" && "معلق"}
                    {order.payment_status === "paid" && "مدفوع"}
                    {order.payment_status === "partial" && "جزئي"}
                    {order.payment_status === "failed" && "فاشل"}
                    {order.payment_status === "overdue" && "متأخر"}
                  </p>
                </div>
                <CreditCard className="w-8 h-8 text-green-600" />
              </div>
            </CardBody>
          </Card>

          <Card className="bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200">
            <CardBody>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-purple-600 text-xs font-medium uppercase tracking-wide">
                    المبلغ الإجمالي
                  </p>
                  <p className="text-lg font-bold text-purple-900 mt-1">
                    {formatAmount(
                      order.final_amount_eur || order.total_amount_eur
                    )}
                  </p>
                </div>
                <Euro className="w-8 h-8 text-purple-600" />
              </div>
            </CardBody>
          </Card>

          <Card className="bg-gradient-to-br from-orange-50 to-orange-100 border-orange-200">
            <CardBody>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-orange-600 text-xs font-medium uppercase tracking-wide">
                    عدد المنتجات
                  </p>
                  <p className="text-lg font-bold text-orange-900 mt-1">
                    {orderStats.totalItems}
                  </p>
                </div>
                <Package className="w-8 h-8 text-orange-600" />
              </div>
            </CardBody>
          </Card>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Order Information */}
            <Card>
              <CardHeader>
                <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                  <Info className="w-5 h-5 text-blue-600" />
                  معلومات الطلب
                </h2>
              </CardHeader>
              <CardBody>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <span className="text-sm text-gray-600">رقم الطلب:</span>
                    <p className="text-sm font-medium text-gray-900 mt-1">
                      #{order.order_number || order.id}
                    </p>
                  </div>

                  <div>
                    <span className="text-sm text-gray-600">المتجر:</span>
                    <p className="text-sm font-medium text-gray-900 mt-1">
                      {order.store_name || "غير محدد"}
                    </p>
                  </div>

                  <div>
                    <span className="text-sm text-gray-600">تاريخ الطلب:</span>
                    <p className="text-sm font-medium text-gray-900 mt-1">
                      {formatDate(order.order_date)}
                    </p>
                  </div>

                  {order.delivery_date && (
                    <div>
                      <span className="text-sm text-gray-600">
                        تاريخ التسليم:
                      </span>
                      <p className="text-sm font-medium text-gray-900 mt-1">
                        {formatDate(order.delivery_date)}
                      </p>
                    </div>
                  )}

                  <div>
                    <span className="text-sm text-gray-600">العملة:</span>
                    <p className="text-sm font-medium text-gray-900 mt-1">
                      {order.currency === "EUR" ? "يورو" : "ليرة سورية"}
                    </p>
                  </div>

                  <div>
                    <span className="text-sm text-gray-600">
                      المبلغ الإجمالي:
                    </span>
                    <p className="text-sm font-medium text-gray-900 mt-1">
                      {formatAmount(
                        order.final_amount_eur || order.total_amount_eur
                      )}
                    </p>
                  </div>
                </div>
              </CardBody>
            </Card>

            {/* Order Items */}
            <Card>
              <CardHeader>
                <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                  <Package className="w-5 h-5 text-green-600" />
                  منتجات الطلب ({orderStats.totalItems} منتج)
                </h2>
              </CardHeader>
              <CardBody>
                {order.items && order.items.length > 0 ? (
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                            المنتج
                          </th>
                          <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                            الكمية
                          </th>
                          <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                            سعر الوحدة
                          </th>
                          <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                            المجموع
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {order.items.map((item, index) => {
                          const product = item.product || {};
                          const unitPrice = parseFloat(
                            item.unit_price_eur || product.price_eur || 0
                          );
                          const quantity = parseInt(item.quantity || 0);
                          const total = unitPrice * quantity;

                          return (
                            <tr
                              key={item.id || index}
                              className="hover:bg-gray-50"
                            >
                              <td className="px-6 py-4">
                                <div>
                                  <div className="text-sm font-medium text-gray-900">
                                    {product.name ||
                                      item.product_name ||
                                      "منتج غير محدد"}
                                  </div>
                                  <div className="text-sm text-gray-500">
                                    الوحدة: {product.unit || "قطعة"}
                                  </div>
                                  {item.notes && (
                                    <div className="text-sm text-gray-500 italic mt-1">
                                      ملاحظة: {item.notes}
                                    </div>
                                  )}
                                </div>
                              </td>
                              <td className="px-6 py-4 text-center">
                                <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800">
                                  {quantity}
                                </span>
                              </td>
                              <td className="px-6 py-4 text-center text-sm text-gray-900 font-medium">
                                {formatAmount(unitPrice)}
                              </td>
                              <td className="px-6 py-4 text-center text-sm font-bold text-green-600">
                                {formatAmount(total)}
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>

                    {/* Order Total */}
                    <div className="bg-gray-50 px-6 py-4 border-t border-gray-200">
                      <div className="flex justify-between items-center">
                        <div className="text-base font-semibold text-gray-900">
                          المجموع الكلي:
                        </div>
                        <div className="text-xl font-bold text-green-600 flex items-center gap-2">
                          <Euro className="w-5 h-5" />
                          {formatAmount(
                            order.final_amount_eur || order.total_amount_eur
                          )}
                        </div>
                      </div>

                      {order.final_amount_syp && (
                        <div className="flex justify-between items-center mt-2">
                          <div className="text-sm text-gray-600">
                            بالليرة السورية:
                          </div>
                          <div className="text-lg font-semibold text-blue-600 flex items-center gap-2">
                            <DollarSign className="w-4 h-4" />
                            {formatAmount(order.final_amount_syp, "SYP")}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    <Package className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                    <p>لا توجد منتجات في هذا الطلب</p>
                  </div>
                )}
              </CardBody>
            </Card>

            {/* Order Notes */}
            {(order.notes || order.special_instructions) && (
              <Card>
                <CardHeader>
                  <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                    <FileText className="w-5 h-5 text-purple-600" />
                    ملاحظات الطلب
                  </h2>
                </CardHeader>
                <CardBody>
                  <div className="space-y-4">
                    {order.notes && (
                      <div>
                        <h4 className="font-medium text-gray-900 mb-2">
                          ملاحظات عامة:
                        </h4>
                        <p className="text-gray-700 bg-gray-50 p-3 rounded-lg">
                          {order.notes}
                        </p>
                      </div>
                    )}

                    {order.special_instructions && (
                      <div>
                        <h4 className="font-medium text-gray-900 mb-2 flex items-center gap-2">
                          <AlertTriangle className="w-4 h-4 text-orange-500" />
                          تعليمات خاصة للتسليم:
                        </h4>
                        <p className="text-gray-700 bg-orange-50 p-3 rounded-lg border border-orange-200">
                          {order.special_instructions}
                        </p>
                      </div>
                    )}
                  </div>
                </CardBody>
              </Card>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Store Information */}
            <Card>
              <CardHeader>
                <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                  <Store className="w-5 h-5 text-green-600" />
                  معلومات المتجر
                </h2>
              </CardHeader>
              <CardBody>
                <div className="space-y-3">
                  <div>
                    <h3 className="text-base font-semibold text-gray-900">
                      {order.store?.name || order.store_name || "غير محدد"}
                    </h3>
                  </div>

                  {order.store?.phone && (
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <Phone className="w-4 h-4" />
                      <span>{order.store.phone}</span>
                    </div>
                  )}

                  {order.store?.email && (
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <Mail className="w-4 h-4" />
                      <span>{order.store.email}</span>
                    </div>
                  )}

                  {order.store?.address && (
                    <div className="flex items-start gap-2 text-sm text-gray-600">
                      <MapPin className="w-4 h-4 mt-0.5" />
                      <span>{order.store.address}</span>
                    </div>
                  )}

                  {order.store?.contact_person && (
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <User className="w-4 h-4" />
                      <span>المسؤول: {order.store.contact_person}</span>
                    </div>
                  )}
                </div>
              </CardBody>
            </Card>

            {/* Distributor Assignment */}
            <Card>
              <CardHeader>
                <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                  <Truck className="w-5 h-5 text-purple-600" />
                  الموزع المعين
                </h2>
              </CardHeader>
              <CardBody>
                {order.distributor ? (
                  <div className="space-y-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h3 className="text-sm font-semibold text-gray-900 flex items-center gap-2">
                          <CheckCircle className="w-4 h-4 text-green-600" />
                          {order.distributor.name}
                        </h3>
                        {order.distributor.phone && (
                          <p className="text-sm text-gray-600 flex items-center gap-1 mt-1">
                            <Phone className="w-3 h-3" />
                            {order.distributor.phone}
                          </p>
                        )}
                        {order.distributor.email && (
                          <p className="text-sm text-gray-600 flex items-center gap-1 mt-1">
                            <Mail className="w-3 h-3" />
                            {order.distributor.email}
                          </p>
                        )}
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800 mt-2">
                          مُعيّن
                        </span>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="flex items-center text-gray-500">
                      <XCircle className="w-5 h-5 mr-2" />
                      <span className="text-sm">لم يتم تعيين موزع</span>
                    </div>
                  </div>
                )}
              </CardBody>
            </Card>

            {/* Important Dates */}
            <Card>
              <CardHeader>
                <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                  <Calendar className="w-5 h-5 text-indigo-600" />
                  التواريخ المهمة
                </h2>
              </CardHeader>
              <CardBody>
                <div className="space-y-3">
                  <div>
                    <span className="text-sm text-gray-600">
                      تاريخ الإنشاء:
                    </span>
                    <p className="text-sm font-medium text-gray-900 mt-1">
                      {formatDateTime(order.created_at)}
                    </p>
                  </div>

                  <div>
                    <span className="text-sm text-gray-600">آخر تحديث:</span>
                    <p className="text-sm font-medium text-gray-900 mt-1">
                      {formatDateTime(order.updated_at)}
                    </p>
                  </div>
                </div>
              </CardBody>
            </Card>

            {/* Actions */}
            <Card>
              <CardHeader>
                <h2 className="text-lg font-semibold text-gray-900">
                  إجراءات إضافية
                </h2>
              </CardHeader>
              <CardBody>
                <div className="space-y-3">
                  <EnhancedButton
                    onClick={() =>
                      navigate(`/orders/create?duplicate=${order.id}`)
                    }
                    variant="outline"
                    size="sm"
                    icon={<Copy className="w-4 h-4" />}
                    className="w-full"
                  >
                    تكرار الطلب
                  </EnhancedButton>

                  <EnhancedButton
                    onClick={() => window.print()}
                    variant="outline"
                    size="sm"
                    icon={<Printer className="w-4 h-4" />}
                    className="w-full"
                  >
                    طباعة الطلب
                  </EnhancedButton>

                  <EnhancedButton
                    onClick={loadOrder}
                    variant="outline"
                    size="sm"
                    icon={<RefreshCw className="w-4 h-4" />}
                    className="w-full"
                  >
                    تحديث البيانات
                  </EnhancedButton>
                </div>
              </CardBody>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderDetailsPage;
