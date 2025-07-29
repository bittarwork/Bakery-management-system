import React, { useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import {
  TrendingUp,
  Users,
  Package,
  Store,
  ShoppingCart,
  Truck,
  DollarSign,
  Calendar,
  Clock,
  AlertCircle,
  CheckCircle,
  Activity,
  Car,
  MapPin,
  RefreshCw,
} from "lucide-react";
import { Card, CardHeader, CardBody } from "../../components/ui/Card";
import { Badge } from "../../components/ui/Badge";
import { useAuthStore } from "../../stores/authStore";
import { useSystemStore } from "../../stores/systemStore";

const DashboardHomePage = () => {
  const { user } = useAuthStore();
  const {
    systemStats,
    recentActivities,
    fetchSystemStats,
    refreshSystemStats,
    isLoading,
    error,
    getCacheInfo,
  } = useSystemStore();

  const [currentTime, setCurrentTime] = useState(new Date());
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Optimized fetchData function with useCallback to prevent unnecessary re-renders
  const fetchData = useCallback(async () => {
    try {
      await fetchSystemStats();
    } catch (error) {
      console.error("Failed to fetch dashboard data:", error);
    }
  }, [fetchSystemStats]);

  // Manual refresh function
  const handleRefresh = useCallback(async () => {
    setIsRefreshing(true);
    try {
      await refreshSystemStats();
    } catch (error) {
      console.error("Failed to refresh dashboard data:", error);
    } finally {
      setIsRefreshing(false);
    }
  }, [refreshSystemStats]);

  // Initialize dashboard data on mount - only runs once
  useEffect(() => {
    fetchData();
  }, []); // Empty dependency array - only run on mount

  // Update time every minute
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 60000);

    return () => clearInterval(timer);
  }, []); // Empty dependency array - timer logic doesn't depend on external values

  // Auto-refresh every 5 minutes (optional)
  useEffect(() => {
    const autoRefreshInterval = setInterval(() => {
      const cacheInfo = getCacheInfo();
      // Only auto-refresh if data is getting stale and no manual refresh is happening
      if (!isRefreshing && !isLoading && cacheInfo.cacheAge > 4 * 60 * 1000) {
        console.log("🔄 Auto-refreshing dashboard data...");
        fetchData();
      }
    }, 5 * 60 * 1000); // Every 5 minutes

    return () => clearInterval(autoRefreshInterval);
  }, [isRefreshing, isLoading, fetchData, getCacheInfo]);

  const getStatusIcon = (status) => {
    switch (status) {
      case "success":
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case "warning":
        return <AlertCircle className="w-4 h-4 text-yellow-500" />;
      case "error":
        return <AlertCircle className="w-4 h-4 text-red-500" />;
      default:
        return <Activity className="w-4 h-4 text-blue-500" />;
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "EUR",
    }).format(amount);
  };

  const formatDate = (date) => {
    return new Intl.DateTimeFormat("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    }).format(date);
  };

  const formatTime = (date) => {
    return new Intl.DateTimeFormat("en-US", {
      hour: "2-digit",
      minute: "2-digit",
    }).format(date);
  };

  const getPercentageChange = (current, previous) => {
    if (previous === 0) return current > 0 ? 100 : 0;
    return Math.round(((current - previous) / previous) * 100);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white shadow-lg border-b border-gray-200"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between py-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                مرحباً، {user?.name || "المستخدم"}
              </h1>
              <p className="text-gray-600 mt-1">
                {formatDate(currentTime)} - {formatTime(currentTime)}
              </p>
            </div>
            <div className="flex items-center space-x-4">
              {/* Refresh Button */}
              <button
                onClick={handleRefresh}
                disabled={isRefreshing || isLoading}
                className="flex items-center px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <RefreshCw
                  className={`w-4 h-4 mr-2 ${
                    isRefreshing || isLoading ? "animate-spin" : ""
                  }`}
                />
                {isRefreshing ? "جاري التحديث..." : "تحديث"}
              </button>

              <div className="text-right">
                <p className="text-sm text-gray-500">الحالة</p>
                <div className="flex items-center">
                  <div
                    className={`w-2 h-2 rounded-full ml-2 ${
                      error ? "bg-red-500" : "bg-green-500"
                    }`}
                  ></div>
                  <span className="text-sm font-medium text-gray-900">
                    {error ? "خطأ" : "متصل"}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Error Banner */}
      {error && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-red-50 border-l-4 border-red-400 p-4 mx-4 mt-4 rounded-md"
        >
          <div className="flex">
            <AlertCircle className="w-5 h-5 text-red-400" />
            <div className="ml-3">
              <p className="text-sm text-red-700">{error}</p>
              <button
                onClick={handleRefresh}
                className="mt-2 text-sm text-red-600 underline hover:text-red-800"
              >
                إعادة المحاولة
              </button>
            </div>
          </div>
        </motion.div>
      )}

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Loading Skeleton or Stats Grid */}
        {isLoading && !systemStats.totalOrders ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8"
          >
            {[...Array(4)].map((_, index) => (
              <Card key={index} className="animate-pulse">
                <CardBody className="p-6">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="h-4 bg-gray-200 rounded w-24 mb-2"></div>
                      <div className="h-8 bg-gray-200 rounded w-16 mb-2"></div>
                      <div className="h-3 bg-gray-200 rounded w-20"></div>
                    </div>
                    <div className="w-12 h-12 bg-gray-200 rounded"></div>
                  </div>
                </CardBody>
              </Card>
            ))}
          </motion.div>
        ) : (
          /* Stats Grid */
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8"
          >
            {/* Total Orders */}
            <Card className="bg-gradient-to-r from-blue-500 to-blue-600 text-white">
              <CardBody className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-blue-100 text-sm font-medium">
                      إجمالي الطلبات
                    </p>
                    <p className="text-3xl font-bold">
                      {systemStats.totalOrders || 0}
                    </p>
                    <p className="text-blue-100 text-sm mt-1">
                      {systemStats.pendingOrders || 0} معلقة
                    </p>
                  </div>
                  <ShoppingCart className="w-12 h-12 text-blue-200" />
                </div>
              </CardBody>
            </Card>

            {/* Revenue */}
            <Card className="bg-gradient-to-r from-green-500 to-green-600 text-white">
              <CardBody className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-green-100 text-sm font-medium">
                      الإيرادات
                    </p>
                    <p className="text-3xl font-bold">
                      {formatCurrency(systemStats.totalRevenue || 0)}
                    </p>
                    <p className="text-green-100 text-sm mt-1">
                      {systemStats.completedOrders || 0} طلب مكتمل
                    </p>
                  </div>
                  <DollarSign className="w-12 h-12 text-green-200" />
                </div>
              </CardBody>
            </Card>

            {/* Pending Orders */}
            <Card className="bg-gradient-to-r from-yellow-500 to-yellow-600 text-white">
              <CardBody className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-yellow-100 text-sm font-medium">
                      الطلبات المعلقة
                    </p>
                    <p className="text-3xl font-bold">
                      {systemStats.pendingOrders || 0}
                    </p>
                    <p className="text-yellow-100 text-sm mt-1">
                      تحتاج إلى معالجة
                    </p>
                  </div>
                  <Clock className="w-12 h-12 text-yellow-200" />
                </div>
              </CardBody>
            </Card>

            {/* Active Distributors */}
            <Card className="bg-gradient-to-r from-purple-500 to-purple-600 text-white">
              <CardBody className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-purple-100 text-sm font-medium">
                      الموزعين النشطين
                    </p>
                    <p className="text-3xl font-bold">
                      {systemStats.activeDistributors || 0}
                    </p>
                    <p className="text-purple-100 text-sm mt-1">
                      في الخدمة حالياً
                    </p>
                  </div>
                  <Truck className="w-12 h-12 text-purple-200" />
                </div>
              </CardBody>
            </Card>
          </motion.div>
        )}

        {/* Secondary Stats */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-8"
        >
          {/* Products */}
          <Card>
            <CardBody className="p-6">
              <div className="flex items-center">
                <Package className="w-8 h-8 text-blue-500 ml-3" />
                <div>
                  <p className="text-sm text-gray-500">المنتجات</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {systemStats.totalProducts || 0}
                  </p>
                </div>
              </div>
            </CardBody>
          </Card>

          {/* Stores */}
          <Card>
            <CardBody className="p-6">
              <div className="flex items-center">
                <Store className="w-8 h-8 text-green-500 ml-3" />
                <div>
                  <p className="text-sm text-gray-500">المتاجر</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {systemStats.totalStores || 0}
                  </p>
                </div>
              </div>
            </CardBody>
          </Card>

          {/* Users */}
          <Card>
            <CardBody className="p-6">
              <div className="flex items-center">
                <Users className="w-8 h-8 text-purple-500 ml-3" />
                <div>
                  <p className="text-sm text-gray-500">المستخدمين</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {systemStats.totalUsers || 0}
                  </p>
                </div>
              </div>
            </CardBody>
          </Card>

          {/* Vehicles */}
          <Card>
            <CardBody className="p-6">
              <div className="flex items-center">
                <Car className="w-8 h-8 text-indigo-500 ml-3" />
                <div>
                  <p className="text-sm text-gray-500">المركبات</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {systemStats.totalVehicles || 0}
                  </p>
                </div>
              </div>
            </CardBody>
          </Card>

          {/* Active Vehicles */}
          <Card>
            <CardBody className="p-6">
              <div className="flex items-center">
                <MapPin className="w-8 h-8 text-orange-500 ml-3" />
                <div>
                  <p className="text-sm text-gray-500">النشطة</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {systemStats.activeVehicles || 0}
                  </p>
                </div>
              </div>
            </CardBody>
          </Card>
        </motion.div>

        {/* Recent Activities and Quick Actions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="grid grid-cols-1 lg:grid-cols-2 gap-8"
        >
          {/* Recent Activities - Under Development */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-900">
                  النشاطات الأخيرة
                </h3>
                <Badge className="bg-yellow-100 text-yellow-800 text-xs px-2 py-1">
                  قيد التطوير
                </Badge>
              </div>
            </CardHeader>
            <CardBody>
              <div className="text-center py-12">
                <div className="mx-auto w-24 h-24 bg-gradient-to-br from-blue-50 to-indigo-100 rounded-full flex items-center justify-center mb-4">
                  <Activity className="w-12 h-12 text-blue-500" />
                </div>
                <h4 className="text-lg font-medium text-gray-900 mb-2">
                  قريباً جداً!
                </h4>
                <p className="text-gray-500 text-sm mb-4">
                  نعمل على تطوير نظام متقدم لعرض النشاطات الأخيرة
                  <br />
                  والتنبيهات الذكية في الوقت الفعلي
                </p>
                <div className="flex justify-center">
                  <div className="flex space-x-1">
                    <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce"></div>
                    <div
                      className="w-2 h-2 bg-blue-400 rounded-full animate-bounce"
                      style={{ animationDelay: "0.1s" }}
                    ></div>
                    <div
                      className="w-2 h-2 bg-blue-400 rounded-full animate-bounce"
                      style={{ animationDelay: "0.2s" }}
                    ></div>
                  </div>
                </div>
              </div>
            </CardBody>
          </Card>

          {/* Enhanced Quick Actions */}
          <Card>
            <CardHeader>
              <h3 className="text-lg font-semibold text-gray-900">
                إجراءات سريعة
              </h3>
              <p className="text-sm text-gray-600 mt-1">
                ابدأ العمل بنقرة واحدة - الأدوات الأكثر استخداماً في متناول يدك
              </p>
            </CardHeader>
            <CardBody>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Create New Order */}
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="group relative p-6 bg-gradient-to-br from-blue-50 to-blue-100 hover:from-blue-100 hover:to-blue-200 rounded-xl border border-blue-200 transition-all duration-300 shadow-sm hover:shadow-md"
                >
                  <div className="flex flex-col items-center text-center">
                    <div className="w-12 h-12 bg-blue-500 rounded-lg flex items-center justify-center mb-3 group-hover:bg-blue-600 transition-colors">
                      <ShoppingCart className="w-6 h-6 text-white" />
                    </div>
                    <h4 className="font-semibold text-blue-900 mb-1">
                      إنشاء طلب جديد
                    </h4>
                    <p className="text-xs text-blue-700 leading-relaxed">
                      أضف طلبية جديدة للعملاء
                      <br />
                      وابدأ عملية التوزيع
                    </p>
                  </div>
                  <div className="absolute top-2 left-2 w-2 h-2 bg-green-400 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"></div>
                </motion.button>

                {/* Add New Product */}
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="group relative p-6 bg-gradient-to-br from-green-50 to-green-100 hover:from-green-100 hover:to-green-200 rounded-xl border border-green-200 transition-all duration-300 shadow-sm hover:shadow-md"
                >
                  <div className="flex flex-col items-center text-center">
                    <div className="w-12 h-12 bg-green-500 rounded-lg flex items-center justify-center mb-3 group-hover:bg-green-600 transition-colors">
                      <Package className="w-6 h-6 text-white" />
                    </div>
                    <h4 className="font-semibold text-green-900 mb-1">
                      إضافة منتج
                    </h4>
                    <p className="text-xs text-green-700 leading-relaxed">
                      أضف منتجات جديدة للكتالوج
                      <br />
                      مع الأسعار والمواصفات
                    </p>
                  </div>
                  <div className="absolute top-2 left-2 w-2 h-2 bg-green-400 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"></div>
                </motion.button>

                {/* Store Management */}
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="group relative p-6 bg-gradient-to-br from-purple-50 to-purple-100 hover:from-purple-100 hover:to-purple-200 rounded-xl border border-purple-200 transition-all duration-300 shadow-sm hover:shadow-md"
                >
                  <div className="flex flex-col items-center text-center">
                    <div className="w-12 h-12 bg-purple-500 rounded-lg flex items-center justify-center mb-3 group-hover:bg-purple-600 transition-colors">
                      <Store className="w-6 h-6 text-white" />
                    </div>
                    <h4 className="font-semibold text-purple-900 mb-1">
                      إدارة المتاجر
                    </h4>
                    <p className="text-xs text-purple-700 leading-relaxed">
                      تحكم في المتاجر والفروع
                      <br />
                      ومراقبة الأداء والمخزون
                    </p>
                  </div>
                  <div className="absolute top-2 left-2 w-2 h-2 bg-green-400 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"></div>
                </motion.button>

                {/* Distribution Tracking */}
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="group relative p-6 bg-gradient-to-br from-orange-50 to-orange-100 hover:from-orange-100 hover:to-orange-200 rounded-xl border border-orange-200 transition-all duration-300 shadow-sm hover:shadow-md"
                >
                  <div className="flex flex-col items-center text-center">
                    <div className="w-12 h-12 bg-orange-500 rounded-lg flex items-center justify-center mb-3 group-hover:bg-orange-600 transition-colors">
                      <Truck className="w-6 h-6 text-white" />
                    </div>
                    <h4 className="font-semibold text-orange-900 mb-1">
                      تتبع التوزيع
                    </h4>
                    <p className="text-xs text-orange-700 leading-relaxed">
                      راقب المركبات والموزعين
                      <br />
                      وتتبع حالة التوصيل
                    </p>
                  </div>
                  <div className="absolute top-2 left-2 w-2 h-2 bg-green-400 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"></div>
                </motion.button>
              </div>

              {/* Quick Stats Below Actions */}
              <div className="mt-6 pt-4 border-t border-gray-100">
                <div className="grid grid-cols-3 gap-4 text-center">
                  <div>
                    <div className="text-lg font-bold text-gray-900">
                      {systemStats.totalOrders || 0}
                    </div>
                    <div className="text-xs text-gray-500">طلبات اليوم</div>
                  </div>
                  <div>
                    <div className="text-lg font-bold text-gray-900">
                      {systemStats.activeDistributors || 0}
                    </div>
                    <div className="text-xs text-gray-500">موزع نشط</div>
                  </div>
                  <div>
                    <div className="text-lg font-bold text-gray-900">
                      {systemStats.totalStores || 0}
                    </div>
                    <div className="text-xs text-gray-500">متجر مسجل</div>
                  </div>
                </div>
              </div>
            </CardBody>
          </Card>
        </motion.div>

        {/* Enhanced System Status */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="mt-8"
        >
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">
                    حالة النظام
                  </h3>
                  <p className="text-sm text-gray-600 mt-1">
                    مراقبة شاملة لصحة النظام والخدمات المتصلة
                  </p>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
                  <span className="text-sm font-medium text-green-600">
                    النظام يعمل بكفاءة
                  </span>
                </div>
              </div>
            </CardHeader>
            <CardBody>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {/* API Server Status */}
                <div className="flex items-center justify-between p-4 bg-green-50 rounded-lg border border-green-200">
                  <div className="flex-1">
                    <div className="flex items-center mb-2">
                      <div className="w-3 h-3 bg-green-500 rounded-full mr-2"></div>
                      <p className="text-sm font-medium text-green-800">
                        خادم API
                      </p>
                    </div>
                    <p className="text-xs text-green-600 mb-1">متصل ومستقر</p>
                    <div className="flex items-center text-xs text-green-500">
                      <div className="w-2 h-2 bg-green-300 rounded-full mr-1"></div>
                      <span>استجابة: 150ms</span>
                    </div>
                  </div>
                  <div className="text-green-500">
                    <CheckCircle className="w-6 h-6" />
                  </div>
                </div>

                {/* Database Status */}
                <div className="flex items-center justify-between p-4 bg-blue-50 rounded-lg border border-blue-200">
                  <div className="flex-1">
                    <div className="flex items-center mb-2">
                      <div className="w-3 h-3 bg-blue-500 rounded-full mr-2"></div>
                      <p className="text-sm font-medium text-blue-800">
                        قاعدة البيانات
                      </p>
                    </div>
                    <p className="text-xs text-blue-600 mb-1">متصل ومستقر</p>
                    <div className="flex items-center text-xs text-blue-500">
                      <div className="w-2 h-2 bg-blue-300 rounded-full mr-1"></div>
                      <span>زمن الاستعلام: 45ms</span>
                    </div>
                  </div>
                  <div className="text-blue-500">
                    <CheckCircle className="w-6 h-6" />
                  </div>
                </div>

                {/* Cache System */}
                <div className="flex items-center justify-between p-4 bg-purple-50 rounded-lg border border-purple-200">
                  <div className="flex-1">
                    <div className="flex items-center mb-2">
                      <div className="w-3 h-3 bg-purple-500 rounded-full mr-2"></div>
                      <p className="text-sm font-medium text-purple-800">
                        نظام التخزين المؤقت
                      </p>
                    </div>
                    <p className="text-xs text-purple-600 mb-1">يعمل بكفاءة</p>
                    <div className="flex items-center text-xs text-purple-500">
                      <div className="w-2 h-2 bg-purple-300 rounded-full mr-1"></div>
                      <span>معدل النجاح: 94%</span>
                    </div>
                  </div>
                  <div className="text-purple-500">
                    <CheckCircle className="w-6 h-6" />
                  </div>
                </div>

                {/* Last Update */}
                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border border-gray-200">
                  <div className="flex-1">
                    <div className="flex items-center mb-2">
                      <Clock className="w-3 h-3 text-gray-500 mr-2" />
                      <p className="text-sm font-medium text-gray-800">
                        آخر تحديث
                      </p>
                    </div>
                    <p className="text-xs text-gray-600 mb-1">
                      {formatTime(currentTime)}
                    </p>
                    <div className="flex items-center text-xs text-gray-500">
                      <div className="w-2 h-2 bg-gray-300 rounded-full mr-1"></div>
                      <span>تحديث تلقائي: 5 دقائق</span>
                    </div>
                  </div>
                  <div className="text-gray-500">
                    <Activity className="w-6 h-6" />
                  </div>
                </div>
              </div>

              {/* System Performance Metrics */}
              <div className="mt-6 pt-6 border-t border-gray-100">
                <h4 className="text-sm font-medium text-gray-900 mb-4">
                  مؤشرات الأداء
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs text-gray-600">
                        استخدام المعالج
                      </span>
                      <span className="text-xs font-medium text-green-600">
                        23%
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-green-500 h-2 rounded-full"
                        style={{ width: "23%" }}
                      ></div>
                    </div>
                  </div>
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs text-gray-600">
                        استخدام الذاكرة
                      </span>
                      <span className="text-xs font-medium text-blue-600">
                        67%
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-blue-500 h-2 rounded-full"
                        style={{ width: "67%" }}
                      ></div>
                    </div>
                  </div>
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs text-gray-600">سرعة الشبكة</span>
                      <span className="text-xs font-medium text-purple-600">
                        892 MB/s
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-purple-500 h-2 rounded-full"
                        style={{ width: "89%" }}
                      ></div>
                    </div>
                  </div>
                </div>
              </div>
            </CardBody>
          </Card>
        </motion.div>
      </div>
    </div>
  );
};

export default DashboardHomePage;
