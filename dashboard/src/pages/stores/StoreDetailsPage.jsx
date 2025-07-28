import React, { useState, useEffect } from "react";
import { Link, useParams, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  ArrowLeft,
  MapPin,
  Phone,
  Mail,
  User,
  CreditCard,
  Edit,
  Trash2,
  Calendar,
  TrendingUp,
  Package,
  Euro,
  AlertCircle,
  Navigation,
  Building2,
  Clock,
  Star,
  ExternalLink,
  Copy,
  CheckCircle,
  XCircle,
  Activity,
  Loader2,
  Home,
  Info,
  DollarSign,
  Users,
  ShoppingCart,
  BarChart3,
  MapIcon,
  Target,
  Zap,
  Award,
  TrendingDown,
} from "lucide-react";
import { Card, CardHeader, CardBody } from "../../components/ui/Card";
import EnhancedButton from "../../components/ui/EnhancedButton";
import BackButton from "../../components/ui/BackButton";
import StoreMap from "../../components/ui/StoreMap";
import storeService from "../../services/storeService";
import { toast } from "react-hot-toast";
import { AnimatePresence } from "framer-motion";

const StoreDetailsPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [store, setStore] = useState(null);
  const [statistics, setStatistics] = useState(null);
  const [recentOrders, setRecentOrders] = useState([]);
  const [recentPayments, setRecentPayments] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [copiedField, setCopiedField] = useState(null);
  const [userLocation, setUserLocation] = useState(null);
  const [isLoadingLocation, setIsLoadingLocation] = useState(false);

  // Get user's current location
  useEffect(() => {
    const getUserLocation = async () => {
      if (navigator.geolocation) {
        setIsLoadingLocation(true);
        navigator.geolocation.getCurrentPosition(
          (position) => {
            setUserLocation({
              lat: position.coords.latitude,
              lng: position.coords.longitude,
            });
            setIsLoadingLocation(false);
          },
          (error) => {
            console.warn("Could not get user location:", error);
            // Default to Damascus, Syria
            setUserLocation({
              lat: 33.5138,
              lng: 36.2765,
            });
            setIsLoadingLocation(false);
          },
          {
            enableHighAccuracy: true,
            timeout: 10000,
            maximumAge: 300000, // 5 minutes
          }
        );
      } else {
        // Default to Damascus, Syria
        setUserLocation({
          lat: 33.5138,
          lng: 36.2765,
        });
      }
    };

    getUserLocation();
  }, []);

  // Load store data
  useEffect(() => {
    const loadStoreData = async () => {
      try {
        setIsLoading(true);

        // Load store details
        const storeResponse = await storeService.getStore(id);
        setStore(storeResponse.data);

        // Load store statistics
        try {
          const statsResponse = await storeService.getStoreStatistics(id);
          setStatistics(statsResponse.data);
        } catch (error) {
          console.warn("Could not load store statistics:", error);
        }

        // Load recent orders
        try {
          const ordersResponse = await storeService.getStoreOrders(id, {
            limit: 5,
          });
          setRecentOrders(ordersResponse.data || []);
        } catch (error) {
          console.warn("Could not load recent orders:", error);
        }

        // Load recent payments
        try {
          const paymentsResponse = await storeService.getStorePayments(id, {
            limit: 5,
          });
          setRecentPayments(paymentsResponse.data || []);
        } catch (error) {
          console.warn("Could not load recent payments:", error);
        }
      } catch (error) {
        console.error("Error loading store data:", error);
        toast.error("فشل في تحميل بيانات المتجر");
        navigate("/stores");
      } finally {
        setIsLoading(false);
      }
    };

    if (id) {
      loadStoreData();
    }
  }, [id, navigate]);

  const handleDelete = async () => {
    try {
      await storeService.deleteStore(id);
      toast.success("تم حذف المتجر بنجاح");
      navigate("/stores");
    } catch (error) {
      console.error("Error deleting store:", error);
      toast.error("فشل في حذف المتجر");
    }
  };

  const copyToClipboard = (text, field) => {
    navigator.clipboard.writeText(text);
    setCopiedField(field);
    toast.success(`تم نسخ ${field} بنجاح`);
    setTimeout(() => setCopiedField(null), 2000);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "active":
        return "bg-green-100 text-green-800 border-green-200";
      case "inactive":
        return "bg-red-100 text-red-800 border-red-200";
      case "suspended":
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case "active":
        return "نشط";
      case "inactive":
        return "غير نشط";
      case "suspended":
        return "معلق";
      default:
        return "غير معروف";
    }
  };

  const getPaymentMethodText = (method) => {
    switch (method) {
      case "cash":
        return "نقدي";
      case "bank":
        return "بنكي";
      case "mixed":
        return "مختلط";
      default:
        return "نقدي";
    }
  };

  const getOrderStatusColor = (status) => {
    switch (status) {
      case "pending":
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "processing":
        return "bg-blue-100 text-blue-800 border-blue-200";
      case "completed":
        return "bg-green-100 text-green-800 border-green-200";
      case "cancelled":
        return "bg-red-100 text-red-800 border-red-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const getOrderStatusText = (status) => {
    switch (status) {
      case "pending":
        return "في الانتظار";
      case "processing":
        return "قيد المعالجة";
      case "completed":
        return "مكتمل";
      case "cancelled":
        return "ملغي";
      default:
        return "غير معروف";
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-blue-600 animate-spin mx-auto mb-4" />
          <p className="text-gray-600 text-lg">جاري تحميل بيانات المتجر...</p>
        </div>
      </div>
    );
  }

  if (!store) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            المتجر غير موجود
          </h2>
          <p className="text-gray-600 mb-6">لم يتم العثور على المتجر المطلوب</p>
          <BackButton />
        </div>
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
            <div className="flex items-center space-x-4">
              <BackButton />
              <div>
                <h1 className="text-4xl font-bold text-gray-900 mb-2">
                  {store.name}
                </h1>
                <div className="flex items-center space-x-3">
                  <span
                    className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium border ${getStatusColor(
                      store.status
                    )}`}
                  >
                    <Activity className="w-4 h-4 mr-1" />
                    {getStatusText(store.status)}
                  </span>
                  <span className="text-gray-500">•</span>
                  <span className="text-gray-600 text-sm">
                    تم الإنشاء:{" "}
                    {new Date(store.created_at).toLocaleDateString("ar-EG")}
                  </span>
                </div>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <EnhancedButton
                variant="primary"
                size="lg"
                icon={<Edit className="w-5 h-5" />}
                onClick={() => navigate(`/stores/${id}/edit`)}
              >
                تعديل المتجر
              </EnhancedButton>
              <EnhancedButton
                variant="danger"
                size="lg"
                icon={<Trash2 className="w-5 h-5" />}
                onClick={() => setShowDeleteConfirm(true)}
              >
                حذف المتجر
              </EnhancedButton>
            </div>
          </div>
        </motion.div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Store Info & Orders */}
          <div className="lg:col-span-2 space-y-8">
            {/* Store Information Card */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
            >
              <Card className="border-0 shadow-lg">
                <CardHeader className="border-b border-gray-200 bg-gradient-to-r from-blue-50 to-indigo-50">
                  <h2 className="text-xl font-semibold text-gray-900 flex items-center">
                    <Info className="w-5 h-5 ml-2 text-blue-600" />
                    معلومات المتجر
                  </h2>
                </CardHeader>
                <CardBody className="p-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Basic Info */}
                    <div className="space-y-4">
                      <div className="bg-gray-50 rounded-lg p-4">
                        <h3 className="text-sm font-semibold text-gray-700 mb-3 flex items-center">
                          <Building2 className="w-4 h-4 ml-2" />
                          المعلومات الأساسية
                        </h3>
                        <div className="space-y-3">
                          <div className="flex justify-between items-center">
                            <span className="text-sm text-gray-600">
                              اسم المتجر
                            </span>
                            <span className="text-sm font-medium text-gray-900">
                              {store.name}
                            </span>
                          </div>
                          <div className="flex justify-between items-center">
                            <span className="text-sm text-gray-600">
                              اسم المالك
                            </span>
                            <span className="text-sm font-medium text-gray-900">
                              {store.owner_name || "غير محدد"}
                            </span>
                          </div>
                          <div className="flex justify-between items-center">
                            <span className="text-sm text-gray-600">
                              المنطقة
                            </span>
                            <span className="text-sm font-medium text-gray-900">
                              {store.region || "غير محدد"}
                            </span>
                          </div>
                          <div className="flex justify-between items-center">
                            <span className="text-sm text-gray-600">
                              نوع المتجر
                            </span>
                            <span className="text-sm font-medium text-gray-900">
                              {store.store_type || "تجزئة"}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Financial Info */}
                    <div className="space-y-4">
                      <div className="bg-gray-50 rounded-lg p-4">
                        <h3 className="text-sm font-semibold text-gray-700 mb-3 flex items-center">
                          <DollarSign className="w-4 h-4 ml-2" />
                          المعلومات المالية
                        </h3>
                        <div className="space-y-3">
                          <div className="flex justify-between items-center">
                            <span className="text-sm text-gray-600">
                              طريقة الدفع
                            </span>
                            <span className="text-sm font-medium text-gray-900">
                              {getPaymentMethodText(store.payment_method)}
                            </span>
                          </div>
                          <div className="flex justify-between items-center">
                            <span className="text-sm text-gray-600">
                              الحد الائتماني
                            </span>
                            <span className="text-sm font-medium text-gray-900">
                              {store.credit_limit || store.credit_limit_eur
                                ? `€${parseFloat(
                                    store.credit_limit || store.credit_limit_eur
                                  ).toLocaleString()}`
                                : "بدون حد"}
                            </span>
                          </div>
                          <div className="flex justify-between items-center">
                            <span className="text-sm text-gray-600">
                              الرصيد الحالي
                            </span>
                            <span className="text-sm font-medium text-gray-900">
                              €
                              {parseFloat(
                                store.current_balance_eur || 0
                              ).toLocaleString()}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Contact Info */}
                    <div className="space-y-4">
                      <div className="bg-gray-50 rounded-lg p-4">
                        <h3 className="text-sm font-semibold text-gray-700 mb-3 flex items-center">
                          <User className="w-4 h-4 ml-2" />
                          معلومات الاتصال
                        </h3>
                        <div className="space-y-3">
                          <div className="flex justify-between items-center">
                            <span className="text-sm text-gray-600">
                              الشخص المسؤول
                            </span>
                            <span className="text-sm font-medium text-gray-900">
                              {store.contact_person || "غير محدد"}
                            </span>
                          </div>
                          <div className="flex justify-between items-center group">
                            <span className="text-sm text-gray-600">
                              الهاتف
                            </span>
                            <div className="flex items-center space-x-2">
                              <span className="text-sm font-medium text-gray-900">
                                {store.phone || "غير محدد"}
                              </span>
                              {store.phone && (
                                <button
                                  onClick={() =>
                                    copyToClipboard(store.phone, "الهاتف")
                                  }
                                  className="opacity-0 group-hover:opacity-100 transition-opacity"
                                >
                                  {copiedField === "الهاتف" ? (
                                    <CheckCircle className="w-4 h-4 text-green-500" />
                                  ) : (
                                    <Copy className="w-4 h-4 text-gray-400 hover:text-gray-600" />
                                  )}
                                </button>
                              )}
                            </div>
                          </div>
                          <div className="flex justify-between items-center group">
                            <span className="text-sm text-gray-600">
                              البريد الإلكتروني
                            </span>
                            <div className="flex items-center space-x-2">
                              <span className="text-sm font-medium text-gray-900">
                                {store.email || "غير محدد"}
                              </span>
                              {store.email && (
                                <button
                                  onClick={() =>
                                    copyToClipboard(
                                      store.email,
                                      "البريد الإلكتروني"
                                    )
                                  }
                                  className="opacity-0 group-hover:opacity-100 transition-opacity"
                                >
                                  {copiedField === "البريد الإلكتروني" ? (
                                    <CheckCircle className="w-4 h-4 text-green-500" />
                                  ) : (
                                    <Copy className="w-4 h-4 text-gray-400 hover:text-gray-600" />
                                  )}
                                </button>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Address Section */}
                    <div className="space-y-4">
                      <div className="bg-gray-50 rounded-lg p-4">
                        <h3 className="text-sm font-semibold text-gray-700 mb-3 flex items-center">
                          <Home className="w-4 h-4 ml-2" />
                          العنوان
                        </h3>
                        <p className="text-sm text-gray-900">
                          {store.address || "العنوان غير متوفر"}
                        </p>
                        {store.notes && (
                          <div className="mt-4 pt-4 border-t border-gray-200">
                            <h4 className="text-sm font-semibold text-gray-700 mb-2">
                              ملاحظات
                            </h4>
                            <p className="text-sm text-gray-600">
                              {store.notes}
                            </p>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </CardBody>
              </Card>
            </motion.div>

            {/* Recent Orders Card */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              <Card className="border-0 shadow-lg">
                <CardHeader className="border-b border-gray-200 bg-gradient-to-r from-green-50 to-emerald-50">
                  <h2 className="text-xl font-semibold text-gray-900 flex items-center">
                    <Package className="w-5 h-5 ml-2 text-green-600" />
                    الطلبات الأخيرة
                  </h2>
                </CardHeader>
                <CardBody className="p-6">
                  {recentOrders.length > 0 ? (
                    <div className="space-y-4">
                      {recentOrders.map((order, index) => (
                        <motion.div
                          key={order.id}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: index * 0.1 }}
                          className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-4">
                              <div className="bg-blue-100 rounded-full p-2">
                                <Package className="w-5 h-5 text-blue-600" />
                              </div>
                              <div>
                                <h3 className="font-semibold text-gray-900">
                                  طلب رقم #{order.id}
                                </h3>
                                <p className="text-sm text-gray-500 flex items-center">
                                  <Clock className="w-3 h-3 ml-1" />
                                  {new Date(
                                    order.created_at
                                  ).toLocaleDateString("ar-EG")}
                                </p>
                              </div>
                            </div>
                            <div className="text-right">
                              <p className="text-lg font-bold text-gray-900">
                                €
                                {parseFloat(
                                  order.total_amount || 0
                                ).toLocaleString()}
                              </p>
                              <span
                                className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium border ${getOrderStatusColor(
                                  order.status
                                )}`}
                              >
                                {getOrderStatusText(order.status)}
                              </span>
                            </div>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-12">
                      <div className="bg-gray-100 rounded-full p-4 w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                        <Package className="w-8 h-8 text-gray-400" />
                      </div>
                      <h3 className="text-lg font-medium text-gray-900 mb-2">
                        لا توجد طلبات بعد
                      </h3>
                      <p className="text-gray-600">
                        لم يتم تسجيل أي طلبات لهذا المتجر حتى الآن
                      </p>
                    </div>
                  )}
                </CardBody>
              </Card>
            </motion.div>
          </div>

          {/* Right Column - Stats, Payments & Location */}
          <div className="space-y-8">
            {/* Statistics Card */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              <Card className="border-0 shadow-lg">
                <CardHeader className="border-b border-gray-200 bg-gradient-to-r from-purple-50 to-violet-50">
                  <h2 className="text-xl font-semibold text-gray-900 flex items-center">
                    <BarChart3 className="w-5 h-5 ml-2 text-purple-600" />
                    الإحصائيات
                  </h2>
                </CardHeader>
                <CardBody className="p-6 space-y-6">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="text-center p-4 bg-blue-50 rounded-lg">
                      <div className="bg-blue-100 rounded-full p-2 w-12 h-12 mx-auto mb-3 flex items-center justify-center">
                        <Package className="w-6 h-6 text-blue-600" />
                      </div>
                      <p className="text-2xl font-bold text-blue-600">
                        {store.total_orders || 0}
                      </p>
                      <p className="text-sm text-gray-600">إجمالي الطلبات</p>
                    </div>
                    <div className="text-center p-4 bg-green-50 rounded-lg">
                      <div className="bg-green-100 rounded-full p-2 w-12 h-12 mx-auto mb-3 flex items-center justify-center">
                        <Euro className="w-6 h-6 text-green-600" />
                      </div>
                      <p className="text-2xl font-bold text-green-600">
                        €
                        {parseFloat(
                          store.total_purchases_eur || 0
                        ).toLocaleString()}
                      </p>
                      <p className="text-sm text-gray-600">إجمالي المشتريات</p>
                    </div>
                    <div className="text-center p-4 bg-yellow-50 rounded-lg">
                      <div className="bg-yellow-100 rounded-full p-2 w-12 h-12 mx-auto mb-3 flex items-center justify-center">
                        <TrendingUp className="w-6 h-6 text-yellow-600" />
                      </div>
                      <p className="text-2xl font-bold text-yellow-600">
                        {store.completed_orders || 0}
                      </p>
                      <p className="text-sm text-gray-600">الطلبات المكتملة</p>
                    </div>
                    <div className="text-center p-4 bg-red-50 rounded-lg">
                      <div className="bg-red-100 rounded-full p-2 w-12 h-12 mx-auto mb-3 flex items-center justify-center">
                        <XCircle className="w-6 h-6 text-red-600" />
                      </div>
                      <p className="text-2xl font-bold text-red-600">
                        {store.cancelled_orders || 0}
                      </p>
                      <p className="text-sm text-gray-600">الطلبات الملغية</p>
                    </div>
                  </div>

                  {/* Performance Rating */}
                  <div className="bg-gradient-to-r from-indigo-50 to-purple-50 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-sm font-medium text-gray-700">
                        تقييم الأداء
                      </span>
                      <div className="flex items-center space-x-1">
                        {[...Array(5)].map((_, i) => (
                          <Star
                            key={i}
                            className={`w-4 h-4 ${
                              i < Math.floor(store.performance_rating || 0)
                                ? "text-yellow-400 fill-current"
                                : "text-gray-300"
                            }`}
                          />
                        ))}
                      </div>
                    </div>
                    <p className="text-2xl font-bold text-indigo-600">
                      {parseFloat(store.performance_rating || 0).toFixed(1)}/5.0
                    </p>
                  </div>

                  {/* Last Activity */}
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">آخر طلب</span>
                      <span className="text-sm font-medium text-gray-900">
                        {store.last_order_date
                          ? new Date(store.last_order_date).toLocaleDateString(
                              "ar-EG"
                            )
                          : "لا يوجد"}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">آخر دفعة</span>
                      <span className="text-sm font-medium text-gray-900">
                        {store.last_payment_date
                          ? new Date(
                              store.last_payment_date
                            ).toLocaleDateString("ar-EG")
                          : "لا يوجد"}
                      </span>
                    </div>
                  </div>
                </CardBody>
              </Card>
            </motion.div>

            {/* Location Card */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
            >
              <Card className="border-0 shadow-lg">
                <CardHeader className="border-b border-gray-200 bg-gradient-to-r from-orange-50 to-red-50">
                  <h2 className="text-xl font-semibold text-gray-900 flex items-center">
                    <MapPin className="w-5 h-5 ml-2 text-orange-600" />
                    الموقع
                  </h2>
                </CardHeader>
                <CardBody className="p-6">
                  {store.latitude && store.longitude ? (
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600">
                          الإحداثيات
                        </span>
                        <div className="text-right">
                          <p className="text-xs text-gray-500">
                            {parseFloat(store.latitude).toFixed(6)},{" "}
                            {parseFloat(store.longitude).toFixed(6)}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center justify-between mb-4">
                        <span className="text-sm text-gray-600">
                          فتح في الخرائط
                        </span>
                        <button
                          onClick={() => {
                            const url = `https://www.google.com/maps?q=${store.latitude},${store.longitude}`;
                            window.open(url, "_blank");
                          }}
                          className="text-xs text-blue-600 hover:text-blue-800 flex items-center space-x-1 bg-blue-50 px-2 py-1 rounded"
                        >
                          <ExternalLink className="w-3 h-3" />
                          <span>Google Maps</span>
                        </button>
                      </div>
                      <div className="rounded-lg overflow-hidden border border-gray-200">
                        {isLoadingLocation ? (
                          <div className="h-64 bg-gray-100 flex items-center justify-center">
                            <div className="text-center">
                              <Loader2 className="w-8 h-8 text-blue-600 animate-spin mx-auto mb-2" />
                              <p className="text-sm text-gray-600">
                                جاري تحديد الموقع...
                              </p>
                            </div>
                          </div>
                        ) : (
                          <StoreMap
                            stores={[store]}
                            height="250px"
                            showControls={true}
                            interactive={true}
                            enableCurrentLocation={true}
                            center={
                              userLocation || 
                              (store.gps_coordinates ? {
                                lat: parseFloat(store.gps_coordinates.latitude),
                                lng: parseFloat(store.gps_coordinates.longitude),
                              } : store.latitude && store.longitude ? {
                                lat: parseFloat(store.latitude),
                                lng: parseFloat(store.longitude),
                              } : null)
                            }
                            zoom={15}
                          />
                        )}
                      </div>
                    </div>
                  ) : (
                    <div className="h-48 bg-gray-100 rounded-lg flex items-center justify-center">
                      <div className="text-center">
                        <MapPin className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                        <p className="text-gray-600 mb-2 font-medium">
                          لا توجد بيانات موقع
                        </p>
                        <p className="text-xs text-gray-500">
                          أضف الإحداثيات لعرض الخريطة
                        </p>
                      </div>
                    </div>
                  )}

                  {/* Location Actions */}
                  {store.latitude && store.longitude && (
                    <div className="space-y-2 mt-4">
                      <EnhancedButton
                        variant="primary"
                        size="sm"
                        icon={<Navigation className="w-4 h-4" />}
                        onClick={() => {
                          const url = `https://www.google.com/maps/dir/?api=1&destination=${store.latitude},${store.longitude}`;
                          window.open(url, "_blank");
                        }}
                        className="w-full"
                      >
                        الحصول على الاتجاهات
                      </EnhancedButton>
                      <EnhancedButton
                        variant="secondary"
                        size="sm"
                        icon={<MapPin className="w-4 h-4" />}
                        onClick={() => {
                          const url = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
                            store.address || store.name
                          )}`;
                          window.open(url, "_blank");
                        }}
                        className="w-full"
                      >
                        البحث عن العنوان
                      </EnhancedButton>
                    </div>
                  )}
                </CardBody>
              </Card>
            </motion.div>
          </div>
        </div>

        {/* Delete Confirmation Modal */}
        <AnimatePresence>
          {showDeleteConfirm && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
            >
              <motion.div
                initial={{ scale: 0.95, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.95, opacity: 0 }}
                className="bg-white rounded-lg p-6 max-w-md w-full mx-4"
              >
                <div className="flex items-center mb-4">
                  <AlertCircle className="w-6 h-6 text-red-600 ml-2" />
                  <h3 className="text-lg font-semibold text-gray-900">
                    تأكيد الحذف
                  </h3>
                </div>
                <p className="text-gray-600 mb-6">
                  هل أنت متأكد من حذف المتجر "{store.name}"؟ هذا الإجراء لا يمكن
                  التراجع عنه.
                </p>
                <div className="flex justify-end space-x-3">
                  <EnhancedButton
                    variant="secondary"
                    onClick={() => setShowDeleteConfirm(false)}
                  >
                    إلغاء
                  </EnhancedButton>
                  <EnhancedButton
                    variant="danger"
                    onClick={handleDelete}
                    icon={<Trash2 className="w-4 h-4" />}
                  >
                    حذف المتجر
                  </EnhancedButton>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default StoreDetailsPage;
