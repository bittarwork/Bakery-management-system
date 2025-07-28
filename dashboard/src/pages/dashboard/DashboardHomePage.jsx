import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  TrendingUp,
  TrendingDown,
  Package,
  Euro,
  Store,
  Truck,
  Users,
  ShoppingCart,
  Plus,
  Calendar,
  Activity,
  BarChart3,
  AlertTriangle,
  CheckCircle,
  Clock,
  MapPin,
  RefreshCw,
  Eye,
  Filter,
  Download,
  ArrowUp,
  ArrowDown,
  Minus,
} from "lucide-react";
import { useAuthStore } from "../../stores/authStore";
import { Card, CardHeader, CardBody } from "../../components/ui/Card";
import Button from "../../components/ui/Button";
import dashboardService from "../../services/dashboardService";
import orderService from "../../services/orderService";
import userService from "../../services/userService";
import productService from "../../services/productService";
import storeService from "../../services/storeService";
import vehicleService from "../../services/vehicleService";

const DashboardHomePage = () => {
  const { user } = useAuthStore();
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [lastUpdated, setLastUpdated] = useState(null);

  // البيانات الرئيسية
  const [dashboardData, setDashboardData] = useState({
    // إحصائيات الطلبات
    totalOrders: 0,
    pendingOrders: 0,
    completedOrders: 0,
    totalRevenue: 0,
    todayRevenue: 0,

    // إحصائيات المتاجر
    totalStores: 0,
    activeStores: 0,
    inactiveStores: 0,

    // إحصائيات المركبات
    totalVehicles: 0,
    availableVehicles: 0,
    busyVehicles: 0,

    // إحصائيات المنتجات
    totalProducts: 0,
    lowStockProducts: 0,
    outOfStockProducts: 0,

    // إحصائيات المستخدمين
    totalUsers: 0,
    activeUsers: 0,

    // البيانات الحديثة
    recentOrders: [],
    recentActivities: [],
    topProducts: [],
    topStores: [],
  });

  // جلب البيانات من جميع الأنظمة
  const fetchAllData = async () => {
    try {
      setIsLoading(true);
      setError(null);

      // جلب البيانات بالتوازي من جميع الأنظمة
      const [
        dashboardStats,
        ordersData,
        usersData,
        productsData,
        storesData,
        vehiclesData,
      ] = await Promise.allSettled([
        dashboardService.getDashboardStats({
          period: "today",
          currency: "EUR",
        }),
        orderService.getOrders({
          limit: 10,
          sortBy: "created_at",
          sortOrder: "DESC",
        }),
        userService.getUsers({ limit: 5, status: "active" }),
        productService.getProducts({ limit: 5, lowStock: true }),
        storeService.getStores({ limit: 5, status: "active" }),
        vehicleService.getAllVehicles({ limit: 5 }),
      ]);

      // معالجة البيانات
      const newData = { ...dashboardData };

      // إحصائيات الداشبورد الرئيسية
      if (
        dashboardStats.status === "fulfilled" &&
        dashboardStats.value?.success
      ) {
        const stats = dashboardStats.value.data?.daily_overview || {};
        newData.totalOrders = stats.total_orders || 0;
        newData.totalRevenue = stats.total_sales || 0;
        newData.activeStores = stats.active_stores || 0;
        newData.pendingOrders = stats.pending_orders || 0;
      }

      // بيانات الطلبات
      if (ordersData.status === "fulfilled" && ordersData.value?.success) {
        const orders = ordersData.value.data || [];
        newData.recentOrders = orders.slice(0, 5);
        newData.completedOrders = orders.filter(
          (o) => o.status === "completed"
        ).length;
      }

      // بيانات المستخدمين
      if (usersData.status === "fulfilled" && usersData.value?.success) {
        const users = usersData.value.data || [];
        newData.totalUsers = users.length;
        newData.activeUsers = users.filter((u) => u.status === "active").length;
      }

      // بيانات المنتجات
      if (productsData.status === "fulfilled" && productsData.value?.success) {
        const products = productsData.value.data || [];
        newData.topProducts = products.slice(0, 5);
        newData.totalProducts = products.length;
        newData.lowStockProducts = products.filter(
          (p) => p.stock_quantity < 10
        ).length;
        newData.outOfStockProducts = products.filter(
          (p) => p.stock_quantity === 0
        ).length;
      }

      // بيانات المتاجر
      if (storesData.status === "fulfilled" && storesData.value?.success) {
        const stores = storesData.value.data || [];
        newData.topStores = stores.slice(0, 5);
        newData.totalStores = stores.length;
        newData.inactiveStores = stores.filter(
          (s) => s.status === "inactive"
        ).length;
      }

      // بيانات المركبات
      if (vehiclesData.status === "fulfilled" && vehiclesData.value?.success) {
        const vehicles = vehiclesData.value.data || [];
        newData.totalVehicles = vehicles.length;
        newData.availableVehicles = vehicles.filter(
          (v) => v.status === "available"
        ).length;
        newData.busyVehicles = vehicles.filter(
          (v) => v.status === "busy"
        ).length;
      }

      setDashboardData(newData);
      setLastUpdated(new Date());
    } catch (error) {
      console.error("خطأ في جلب البيانات:", error);
      setError("حدث خطأ في تحميل البيانات. يرجى المحاولة مرة أخرى.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchAllData();
    // تحديث البيانات كل 5 دقائق
    const interval = setInterval(fetchAllData, 300000);
    return () => clearInterval(interval);
  }, []);

  // تنسيق العملة بالیورو
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("ar-SA", {
      style: "currency",
      currency: "EUR",
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount || 0);
  };

  // تنسيق التاريخ بالميلادي
  const formatDate = (date) => {
    return new Date(date).toLocaleDateString("ar-SA", {
      year: "numeric",
      month: "long",
      day: "numeric",
      weekday: "long",
    });
  };

  // البطاقات الإحصائية الرئيسية
  const statCards = [
    {
      title: "إجمالي الطلبات",
      value: dashboardData.totalOrders.toLocaleString("ar-SA"),
      change: `${dashboardData.pendingOrders} قيد الانتظار`,
      trend: dashboardData.pendingOrders > 0 ? "neutral" : "up",
      icon: ShoppingCart,
      color: "blue",
      bgColor: "bg-blue-50",
      iconColor: "text-blue-600",
    },
    {
      title: "إجمالي الإيرادات",
      value: formatCurrency(dashboardData.totalRevenue),
      change: "اليوم",
      trend: "up",
      icon: Euro,
      color: "green",
      bgColor: "bg-green-50",
      iconColor: "text-green-600",
    },
    {
      title: "المتاجر النشطة",
      value: dashboardData.activeStores.toLocaleString("ar-SA"),
      change: `من أصل ${dashboardData.totalStores}`,
      trend: dashboardData.inactiveStores === 0 ? "up" : "neutral",
      icon: Store,
      color: "purple",
      bgColor: "bg-purple-50",
      iconColor: "text-purple-600",
    },
    {
      title: "المركبات المتاحة",
      value: dashboardData.availableVehicles.toLocaleString("ar-SA"),
      change: `${dashboardData.busyVehicles} مشغولة`,
      trend:
        dashboardData.availableVehicles > dashboardData.busyVehicles
          ? "up"
          : "down",
      icon: Truck,
      color: "orange",
      bgColor: "bg-orange-50",
      iconColor: "text-orange-600",
    },
    {
      title: "المنتجات",
      value: dashboardData.totalProducts.toLocaleString("ar-SA"),
      change: `${dashboardData.lowStockProducts} مخزون منخفض`,
      trend: dashboardData.lowStockProducts > 0 ? "down" : "up",
      icon: Package,
      color: "indigo",
      bgColor: "bg-indigo-50",
      iconColor: "text-indigo-600",
    },
    {
      title: "المستخدمون النشطون",
      value: dashboardData.activeUsers.toLocaleString("ar-SA"),
      change: `من أصل ${dashboardData.totalUsers}`,
      trend: "up",
      icon: Users,
      color: "pink",
      bgColor: "bg-pink-50",
      iconColor: "text-pink-600",
    },
  ];

  // الإجراءات السريعة
  const quickActions = [
    {
      title: "إنشاء طلب جديد",
      description: "إضافة طلب جديد للنظام",
      icon: Plus,
      color: "blue",
      path: "/orders/create",
      bgColor: "bg-blue-500 hover:bg-blue-600",
    },
    {
      title: "إضافة متجر",
      description: "تسجيل متجر جديد",
      icon: Store,
      color: "green",
      path: "/stores/create",
      bgColor: "bg-green-500 hover:bg-green-600",
    },
    {
      title: "إضافة منتج",
      description: "إدراج منتج جديد",
      icon: Package,
      color: "purple",
      path: "/products/create",
      bgColor: "bg-purple-500 hover:bg-purple-600",
    },
    {
      title: "إضافة مركبة",
      description: "تسجيل مركبة جديدة",
      icon: Truck,
      color: "orange",
      path: "/vehicles/create",
      bgColor: "bg-orange-500 hover:bg-orange-600",
    },
    {
      title: "التقارير",
      description: "عرض التحليلات المفصلة",
      icon: BarChart3,
      color: "indigo",
      path: "/reports",
      bgColor: "bg-indigo-500 hover:bg-indigo-600",
    },
    {
      title: "إضافة مستخدم",
      description: "إنشاء حساب مستخدم جديد",
      icon: Users,
      color: "pink",
      path: "/users/create",
      bgColor: "bg-pink-500 hover:bg-pink-600",
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50 rtl" dir="rtl">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* العنوان الرئيسي */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-between mb-8"
        >
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              لوحة التحكم الرئيسية
            </h1>
            <p className="text-gray-600">
              أهلاً وسهلاً، {user?.name || "المدير"}
            </p>
            <div className="flex items-center mt-2 text-sm text-gray-500">
              <Calendar className="w-4 h-4 ml-1" />
              <span>{formatDate(new Date())}</span>
              {lastUpdated && (
                <>
                  <span className="mx-2">•</span>
                  <Clock className="w-4 h-4 ml-1" />
                  <span>
                    آخر تحديث: {lastUpdated.toLocaleTimeString("ar-SA")}
                  </span>
                </>
              )}
            </div>
          </div>
          <div className="flex items-center space-x-4 space-x-reverse">
            <Button
              onClick={fetchAllData}
              disabled={isLoading}
              variant="outline"
              size="sm"
              className="flex items-center space-x-2 space-x-reverse"
            >
              <RefreshCw
                className={`w-4 h-4 ${isLoading ? "animate-spin" : ""}`}
              />
              <span>تحديث</span>
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="flex items-center space-x-2 space-x-reverse"
            >
              <Download className="w-4 h-4" />
              <span>تصدير التقرير</span>
            </Button>
          </div>
        </motion.div>

        {/* رسالة الخطأ */}
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6"
          >
            <div className="flex items-center space-x-3 space-x-reverse">
              <AlertTriangle className="w-5 h-5 text-red-500" />
              <div>
                <h3 className="text-sm font-medium text-red-800">
                  خطأ في تحميل البيانات
                </h3>
                <p className="text-sm text-red-700 mt-1">{error}</p>
              </div>
              <Button
                onClick={fetchAllData}
                variant="outline"
                size="sm"
                className="mr-auto"
              >
                إعادة المحاولة
              </Button>
            </div>
          </motion.div>
        )}

        {/* البطاقات الإحصائية */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          {statCards.map((stat, index) => {
            const Icon = stat.icon;
            const TrendIcon =
              stat.trend === "up"
                ? ArrowUp
                : stat.trend === "down"
                ? ArrowDown
                : Minus;

            return (
              <motion.div
                key={stat.title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <Card className="p-6 hover:shadow-lg transition-shadow duration-200">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-600 mb-1">
                        {stat.title}
                      </p>
                      <p className="text-2xl font-bold text-gray-900 mb-2">
                        {isLoading ? "..." : stat.value}
                      </p>
                      <div className="flex items-center">
                        <TrendIcon
                          className={`w-4 h-4 ml-1 ${
                            stat.trend === "up"
                              ? "text-green-500"
                              : stat.trend === "down"
                              ? "text-red-500"
                              : "text-gray-400"
                          }`}
                        />
                        <span
                          className={`text-xs font-medium ${
                            stat.trend === "up"
                              ? "text-green-600"
                              : stat.trend === "down"
                              ? "text-red-600"
                              : "text-gray-600"
                          }`}
                        >
                          {stat.change}
                        </span>
                      </div>
                    </div>
                    <div className={`p-3 rounded-full ${stat.bgColor}`}>
                      <Icon className={`w-6 h-6 ${stat.iconColor}`} />
                    </div>
                  </div>
                </Card>
              </motion.div>
            );
          })}
        </div>

        {/* الإجراءات السريعة */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="mb-8"
        >
          <Card>
            <CardHeader>
              <h2 className="text-xl font-semibold text-gray-900">
                الإجراءات السريعة
              </h2>
              <p className="text-sm text-gray-600">
                الوصول السريع للعمليات الأساسية في النظام
              </p>
            </CardHeader>
            <CardBody>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                {quickActions.map((action, index) => {
                  const Icon = action.icon;
                  return (
                    <motion.div
                      key={action.title}
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: 0.1 * index }}
                    >
                      <button className="w-full p-4 rounded-lg bg-white border-2 border-gray-200 hover:border-gray-300 transition-all duration-200 group hover:shadow-md">
                        <div
                          className={`w-12 h-12 mx-auto mb-3 rounded-lg flex items-center justify-center ${action.bgColor} transition-colors duration-200`}
                        >
                          <Icon className="w-6 h-6 text-white" />
                        </div>
                        <h3 className="font-medium text-gray-900 text-sm mb-1 group-hover:text-gray-700">
                          {action.title}
                        </h3>
                        <p className="text-xs text-gray-500 group-hover:text-gray-600">
                          {action.description}
                        </p>
                      </button>
                    </motion.div>
                  );
                })}
              </div>
            </CardBody>
          </Card>
        </motion.div>

        {/* الأقسام السفلية */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* الطلبات الحديثة */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4 }}
          >
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-semibold text-gray-900">
                    الطلبات الحديثة
                  </h2>
                  <Button variant="outline" size="sm">
                    <Eye className="w-4 h-4 ml-1" />
                    عرض الكل
                  </Button>
                </div>
              </CardHeader>
              <CardBody>
                <div className="space-y-4">
                  {dashboardData.recentOrders.length > 0 ? (
                    dashboardData.recentOrders.map((order, index) => (
                      <div
                        key={order.id || index}
                        className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                      >
                        <div className="flex items-center space-x-3 space-x-reverse">
                          <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                            <ShoppingCart className="w-5 h-5 text-blue-600" />
                          </div>
                          <div>
                            <p className="font-medium text-gray-900">
                              طلب #{order.id || "N/A"}
                            </p>
                            <p className="text-xs text-gray-500">
                              {order.store_name || "متجر غير محدد"}
                            </p>
                          </div>
                        </div>
                        <div className="text-left">
                          <p className="font-medium text-gray-900">
                            {formatCurrency(order.total_amount || 0)}
                          </p>
                          <span
                            className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                              order.status === "completed"
                                ? "bg-green-100 text-green-800"
                                : order.status === "pending"
                                ? "bg-yellow-100 text-yellow-800"
                                : "bg-gray-100 text-gray-800"
                            }`}
                          >
                            {order.status === "completed"
                              ? "مكتمل"
                              : order.status === "pending"
                              ? "قيد الانتظار"
                              : order.status || "غير محدد"}
                          </span>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-8 text-gray-500">
                      <ShoppingCart className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                      <p>لا توجد طلبات حديثة</p>
                    </div>
                  )}
                </div>
              </CardBody>
            </Card>
          </motion.div>

          {/* المنتجات */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.5 }}
          >
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-semibold text-gray-900">
                    المنتجات
                  </h2>
                  <Button variant="outline" size="sm">
                    <Eye className="w-4 h-4 ml-1" />
                    عرض الكل
                  </Button>
                </div>
              </CardHeader>
              <CardBody>
                <div className="space-y-4">
                  {dashboardData.topProducts.length > 0 ? (
                    dashboardData.topProducts.map((product, index) => (
                      <div
                        key={product.id || index}
                        className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                      >
                        <div className="flex items-center space-x-3 space-x-reverse">
                          <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
                            <Package className="w-5 h-5 text-purple-600" />
                          </div>
                          <div>
                            <p className="font-medium text-gray-900">
                              {product.name || "منتج غير محدد"}
                            </p>
                            <p className="text-xs text-gray-500">
                              الكمية: {product.stock_quantity || 0}
                            </p>
                          </div>
                        </div>
                        <div className="text-left">
                          <p className="font-medium text-gray-900">
                            {formatCurrency(product.price || 0)}
                          </p>
                          <span
                            className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                              (product.stock_quantity || 0) > 10
                                ? "bg-green-100 text-green-800"
                                : (product.stock_quantity || 0) > 0
                                ? "bg-yellow-100 text-yellow-800"
                                : "bg-red-100 text-red-800"
                            }`}
                          >
                            {(product.stock_quantity || 0) > 10
                              ? "متوفر"
                              : (product.stock_quantity || 0) > 0
                              ? "قليل"
                              : "نفد"}
                          </span>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-8 text-gray-500">
                      <Package className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                      <p>لا توجد منتجات</p>
                    </div>
                  )}
                </div>
              </CardBody>
            </Card>
          </motion.div>
        </div>

        {/* النشاطات الحديثة والمتاجر الأكثر نشاطاً */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
          {/* المتاجر النشطة */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
          >
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-semibold text-gray-900">
                    المتاجر النشطة
                  </h2>
                  <Button variant="outline" size="sm">
                    <MapPin className="w-4 h-4 ml-1" />
                    عرض الخريطة
                  </Button>
                </div>
              </CardHeader>
              <CardBody>
                <div className="space-y-4">
                  {dashboardData.topStores.length > 0 ? (
                    dashboardData.topStores.map((store, index) => (
                      <div
                        key={store.id || index}
                        className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                      >
                        <div className="flex items-center space-x-3 space-x-reverse">
                          <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                            <Store className="w-5 h-5 text-green-600" />
                          </div>
                          <div>
                            <p className="font-medium text-gray-900">
                              {store.name || "متجر غير محدد"}
                            </p>
                            <p className="text-xs text-gray-500">
                              {store.address ||
                                store.location ||
                                "العنوان غير محدد"}
                            </p>
                          </div>
                        </div>
                        <div className="text-left">
                          <span
                            className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                              store.status === "active"
                                ? "bg-green-100 text-green-800"
                                : "bg-red-100 text-red-800"
                            }`}
                          >
                            {store.status === "active" ? "نشط" : "غير نشط"}
                          </span>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-8 text-gray-500">
                      <Store className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                      <p>لا توجد متاجر مسجلة</p>
                    </div>
                  )}
                </div>
              </CardBody>
            </Card>
          </motion.div>

          {/* ملخص النظام */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7 }}
          >
            <Card>
              <CardHeader>
                <h2 className="text-xl font-semibold text-gray-900">
                  ملخص النظام
                </h2>
              </CardHeader>
              <CardBody>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                    <div className="flex items-center">
                      <Activity className="w-5 h-5 text-blue-600 ml-3" />
                      <span className="font-medium text-gray-900">
                        حالة النظام
                      </span>
                    </div>
                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                      <CheckCircle className="w-4 h-4 ml-1" />
                      يعمل بشكل طبيعي
                    </span>
                  </div>

                  <div className="flex items-center justify-between p-3 bg-yellow-50 rounded-lg">
                    <div className="flex items-center">
                      <AlertTriangle className="w-5 h-5 text-yellow-600 ml-3" />
                      <span className="font-medium text-gray-900">تنبيهات</span>
                    </div>
                    <span className="text-sm font-medium text-gray-900">
                      {dashboardData.lowStockProducts} منتج مخزون منخفض
                    </span>
                  </div>

                  <div className="flex items-center justify-between p-3 bg-indigo-50 rounded-lg">
                    <div className="flex items-center">
                      <BarChart3 className="w-5 h-5 text-indigo-600 ml-3" />
                      <span className="font-medium text-gray-900">
                        الأداء اليومي
                      </span>
                    </div>
                    <span className="text-sm font-medium text-green-600">
                      +12% من أمس
                    </span>
                  </div>

                  <div className="flex items-center justify-between p-3 bg-purple-50 rounded-lg">
                    <div className="flex items-center">
                      <Truck className="w-5 h-5 text-purple-600 ml-3" />
                      <span className="font-medium text-gray-900">التوصيل</span>
                    </div>
                    <span className="text-sm font-medium text-gray-900">
                      {dashboardData.availableVehicles} مركبة متاحة
                    </span>
                  </div>
                </div>
              </CardBody>
            </Card>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default DashboardHomePage;
