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

      console.log("🔄 بدء جلب البيانات من جميع الأنظمة...");

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
        userService.getUsers({ limit: 100 }), // تحسين: جلب جميع المستخدمين للإحصائيات
        productService.getProducts({ limit: 100 }), // تحسين: جلب جميع المنتجات للإحصائيات
        storeService.getStores({ limit: 100 }), // تحسين: جلب جميع المتاجر للإحصائيات
        vehicleService.getAllVehicles({ limit: 100 }), // تحسين: جلب جميع المركبات للإحصائيات
      ]);

      // معالجة البيانات
      const newData = { ...dashboardData };
      let hasAnyData = false;

      console.log("📊 معالجة البيانات المُستلمة...");

      // إحصائيات الداشبورد الرئيسية
      if (
        dashboardStats.status === "fulfilled" &&
        dashboardStats.value?.success
      ) {
        console.log("✅ بيانات الإحصائيات:", dashboardStats.value.data);
        const stats = dashboardStats.value.data || {};

        // معالجة البيانات المختلفة من API
        if (stats.daily_overview) {
          newData.totalOrders = stats.daily_overview.total_orders || 0;
          newData.totalRevenue = stats.daily_overview.total_sales || 0;
          newData.activeStores = stats.daily_overview.active_stores || 0;
          newData.pendingOrders = stats.daily_overview.pending_orders || 0;
        } else if (stats.orders) {
          newData.totalOrders = stats.orders.total || 0;
          newData.pendingOrders = stats.orders.pending || 0;
          newData.completedOrders = stats.orders.completed || 0;
        }

        if (stats.revenue || stats.sales) {
          newData.totalRevenue =
            stats.revenue?.total || stats.sales?.total || 0;
          newData.todayRevenue =
            stats.revenue?.today || stats.sales?.today || 0;
        }

        hasAnyData = hasAnyData || Object.keys(stats).length > 0;
      } else {
        console.log(
          "❌ فشل في جلب إحصائيات الداشبورد:",
          dashboardStats.reason?.message
        );
      }

      // بيانات الطلبات
      if (ordersData.status === "fulfilled" && ordersData.value?.success) {
        console.log("✅ بيانات الطلبات:", ordersData.value.data);
        const orders = ordersData.value.data || [];
        if (Array.isArray(orders)) {
          newData.recentOrders = orders.slice(0, 5);
          newData.totalOrders = newData.totalOrders || orders.length; // استخدم البيانات إذا لم تكن متوفرة من الإحصائيات
          newData.completedOrders = orders.filter(
            (o) => o.status === "completed"
          ).length;
          newData.pendingOrders =
            newData.pendingOrders ||
            orders.filter((o) => o.status === "pending").length;

          // حساب الإيرادات من الطلبات إذا لم تكن متوفرة
          if (!newData.totalRevenue) {
            newData.totalRevenue = orders.reduce(
              (sum, order) => sum + (parseFloat(order.total_amount) || 0),
              0
            );
          }

          hasAnyData = true;
        }
      } else {
        console.log(
          "❌ فشل في جلب بيانات الطلبات:",
          ordersData.reason?.message
        );
      }

      // بيانات المستخدمين
      if (usersData.status === "fulfilled" && usersData.value?.success) {
        console.log("✅ بيانات المستخدمين:", usersData.value.data);
        const users = usersData.value.data || [];
        if (Array.isArray(users)) {
          newData.totalUsers = users.length;
          newData.activeUsers = users.filter(
            (u) => u.status === "active"
          ).length;
          hasAnyData = true;
        }
      } else {
        console.log(
          "❌ فشل في جلب بيانات المستخدمين:",
          usersData.reason?.message
        );
      }

      // بيانات المنتجات
      if (productsData.status === "fulfilled" && productsData.value?.success) {
        console.log("✅ بيانات المنتجات:", productsData.value.data);
        const products = productsData.value.data || [];
        if (Array.isArray(products)) {
          newData.topProducts = products.slice(0, 5);
          newData.totalProducts = products.length;
          newData.lowStockProducts = products.filter(
            (p) => (p.stock_quantity || 0) < (p.minimum_stock || 10)
          ).length;
          newData.outOfStockProducts = products.filter(
            (p) => (p.stock_quantity || 0) === 0
          ).length;
          hasAnyData = true;
        }
      } else {
        console.log(
          "❌ فشل في جلب بيانات المنتجات:",
          productsData.reason?.message
        );
      }

      // بيانات المتاجر
      if (storesData.status === "fulfilled" && storesData.value?.success) {
        console.log("✅ بيانات المتاجر:", storesData.value.data);
        const stores = storesData.value.data || [];
        if (Array.isArray(stores)) {
          newData.topStores = stores.slice(0, 5);
          newData.totalStores = stores.length;
          newData.activeStores =
            newData.activeStores ||
            stores.filter((s) => s.status === "active").length;
          newData.inactiveStores = stores.filter(
            (s) => s.status === "inactive"
          ).length;
          hasAnyData = true;
        }
      } else {
        console.log(
          "❌ فشل في جلب بيانات المتاجر:",
          storesData.reason?.message
        );
      }

      // بيانات المركبات
      if (vehiclesData.status === "fulfilled" && vehiclesData.value?.success) {
        console.log("✅ بيانات المركبات:", vehiclesData.value.data);
        const vehicles = vehiclesData.value.data || [];
        if (Array.isArray(vehicles)) {
          newData.totalVehicles = vehicles.length;
          newData.availableVehicles = vehicles.filter(
            (v) => v.status === "available"
          ).length;
          newData.busyVehicles = vehicles.filter(
            (v) => v.status === "busy"
          ).length;
          hasAnyData = true;
        }
      } else {
        console.log(
          "❌ فشل في جلب بيانات المركبات:",
          vehiclesData.reason?.message
        );
      }

      if (hasAnyData) {
        console.log("✅ تم تحديث البيانات بنجاح:", newData);
        setDashboardData(newData);
        setError(null);
      } else {
        console.log("⚠️ لم يتم العثور على أي بيانات من الخادم");
        setError(
          "لا توجد بيانات متاحة في النظام حالياً. قم بإضافة بعض البيانات لعرضها هنا."
        );
      }

      setLastUpdated(new Date());
    } catch (error) {
      console.error("❌ خطأ في جلب البيانات:", error);
      setError(
        "حدث خطأ في تحميل البيانات من الخادم. يرجى التحقق من الاتصال والمحاولة مرة أخرى."
      );
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

  // تنسيق العملة بالیورو (تحسين مع دعم أفضل للعربية)
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("ar-SA", {
      style: "currency",
      currency: "EUR",
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
      currencyDisplay: "symbol",
    }).format(amount || 0);
  };

  // تنسيق التاريخ بالميلادي (تحسين مع دعم أفضل)
  const formatDate = (date) => {
    return new Date(date).toLocaleDateString("ar-SA", {
      calendar: "gregory", // تأكد من استخدام التقويم الميلادي
      year: "numeric",
      month: "long",
      day: "numeric",
      weekday: "long",
    });
  };

  // تنسيق الوقت
  const formatTime = (date) => {
    return new Date(date).toLocaleTimeString("ar-SA", {
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hour12: false,
    });
  };

  // حساب النسبة المئوية للتقدم
  const calculatePercentage = (value, total) => {
    if (!total) return 0;
    return Math.round((value / total) * 100);
  };

  // البطاقات الإحصائية الرئيسية مع تحسينات UI/UX
  const statCards = [
    {
      title: "إجمالي الطلبات",
      value: dashboardData.totalOrders.toLocaleString("ar-SA"),
      change: `${dashboardData.pendingOrders} قيد الانتظار`,
      progress: calculatePercentage(
        dashboardData.completedOrders,
        dashboardData.totalOrders
      ),
      progressLabel: `${calculatePercentage(
        dashboardData.completedOrders,
        dashboardData.totalOrders
      )}% مكتملة`,
      trend: dashboardData.pendingOrders > 0 ? "neutral" : "up",
      icon: ShoppingCart,
      color: "blue",
      bgColor: "bg-blue-50",
      iconColor: "text-blue-600",
      borderColor: "border-blue-200",
      progressColor: "bg-blue-500",
    },
    {
      title: "إجمالي الإيرادات",
      value: formatCurrency(dashboardData.totalRevenue),
      change: "إجمالي المبيعات",
      progress:
        dashboardData.todayRevenue > 0
          ? calculatePercentage(
              dashboardData.todayRevenue,
              dashboardData.totalRevenue
            )
          : 85,
      progressLabel: `${formatCurrency(dashboardData.todayRevenue)} اليوم`,
      trend: "up",
      icon: Euro,
      color: "green",
      bgColor: "bg-green-50",
      iconColor: "text-green-600",
      borderColor: "border-green-200",
      progressColor: "bg-green-500",
    },
    {
      title: "المتاجر النشطة",
      value: dashboardData.activeStores.toLocaleString("ar-SA"),
      change: `من أصل ${dashboardData.totalStores} متجر`,
      progress: calculatePercentage(
        dashboardData.activeStores,
        dashboardData.totalStores
      ),
      progressLabel: `${calculatePercentage(
        dashboardData.activeStores,
        dashboardData.totalStores
      )}% نشطة`,
      trend: dashboardData.inactiveStores === 0 ? "up" : "neutral",
      icon: Store,
      color: "purple",
      bgColor: "bg-purple-50",
      iconColor: "text-purple-600",
      borderColor: "border-purple-200",
      progressColor: "bg-purple-500",
    },
    {
      title: "المركبات المتاحة",
      value: dashboardData.availableVehicles.toLocaleString("ar-SA"),
      change: `${dashboardData.busyVehicles} مشغولة`,
      progress: calculatePercentage(
        dashboardData.availableVehicles,
        dashboardData.totalVehicles
      ),
      progressLabel: `${calculatePercentage(
        dashboardData.availableVehicles,
        dashboardData.totalVehicles
      )}% متاحة`,
      trend:
        dashboardData.availableVehicles > dashboardData.busyVehicles
          ? "up"
          : "down",
      icon: Truck,
      color: "orange",
      bgColor: "bg-orange-50",
      iconColor: "text-orange-600",
      borderColor: "border-orange-200",
      progressColor: "bg-orange-500",
    },
    {
      title: "المنتجات",
      value: dashboardData.totalProducts.toLocaleString("ar-SA"),
      change: `${dashboardData.lowStockProducts} مخزون منخفض`,
      progress: calculatePercentage(
        dashboardData.totalProducts - dashboardData.outOfStockProducts,
        dashboardData.totalProducts
      ),
      progressLabel: `${calculatePercentage(
        dashboardData.totalProducts - dashboardData.outOfStockProducts,
        dashboardData.totalProducts
      )}% متوفرة`,
      trend: dashboardData.lowStockProducts > 0 ? "down" : "up",
      icon: Package,
      color: "indigo",
      bgColor: "bg-indigo-50",
      iconColor: "text-indigo-600",
      borderColor: "border-indigo-200",
      progressColor: "bg-indigo-500",
    },
    {
      title: "المستخدمون النشطون",
      value: dashboardData.activeUsers.toLocaleString("ar-SA"),
      change: `من أصل ${dashboardData.totalUsers} مستخدم`,
      progress: calculatePercentage(
        dashboardData.activeUsers,
        dashboardData.totalUsers
      ),
      progressLabel: `${calculatePercentage(
        dashboardData.activeUsers,
        dashboardData.totalUsers
      )}% نشطون`,
      trend: "up",
      icon: Users,
      color: "pink",
      bgColor: "bg-pink-50",
      iconColor: "text-pink-600",
      borderColor: "border-pink-200",
      progressColor: "bg-pink-500",
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
              أهلاً وسهلاً، {isLoading ? "..." : user?.name || "المدير"}
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
              onClick={() => {
                // يمكن إضافة منطق تصدير التقرير هنا
                alert("سيتم إضافة ميزة تصدير التقرير قريباً");
              }}
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
            className={`border rounded-lg p-4 mb-6 ${
              error.includes("تجريبية")
                ? "bg-yellow-50 border-yellow-200"
                : "bg-red-50 border-red-200"
            }`}
          >
            <div className="flex items-center space-x-3 space-x-reverse">
              {error.includes("تجريبية") ? (
                <AlertTriangle className="w-5 h-5 text-yellow-500" />
              ) : (
                <AlertTriangle className="w-5 h-5 text-red-500" />
              )}
              <div>
                <h3
                  className={`text-sm font-medium ${
                    error.includes("تجريبية")
                      ? "text-yellow-800"
                      : "text-red-800"
                  }`}
                >
                  {error.includes("تجريبية")
                    ? "تنبيه"
                    : "خطأ في تحميل البيانات"}
                </h3>
                <p
                  className={`text-sm mt-1 ${
                    error.includes("تجريبية")
                      ? "text-yellow-700"
                      : "text-red-700"
                  }`}
                >
                  {error}
                </p>
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

        {/* البطاقات الإحصائية المحسنة */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          {isLoading
            ? // مؤشرات تحميل للبطاقات الإحصائية
              Array.from({ length: 6 }).map((_, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <Card className="p-6 border-l-4 border-gray-200">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="w-24 h-4 bg-gray-200 rounded animate-pulse mb-2"></div>
                        <div className="w-16 h-8 bg-gray-200 rounded animate-pulse mb-3"></div>
                        <div className="w-full h-2 bg-gray-200 rounded animate-pulse mb-2"></div>
                        <div className="w-20 h-3 bg-gray-200 rounded animate-pulse"></div>
                      </div>
                      <div className="w-16 h-16 bg-gray-200 rounded-full animate-pulse"></div>
                    </div>
                  </Card>
                </motion.div>
              ))
            : statCards.map((stat, index) => {
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
                    <Card
                      className={`p-6 hover:shadow-xl transition-all duration-300 border-l-4 ${stat.borderColor} group cursor-pointer hover:-translate-y-1`}
                    >
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex-1">
                          <p className="text-sm font-medium text-gray-600 mb-1">
                            {stat.title}
                          </p>
                          <p className="text-3xl font-bold text-gray-900 mb-2 group-hover:text-blue-600 transition-colors">
                            {stat.value}
                          </p>
                        </div>
                        <div
                          className={`p-4 rounded-full ${stat.bgColor} group-hover:scale-110 transition-transform duration-300`}
                        >
                          <Icon className={`w-8 h-8 ${stat.iconColor}`} />
                        </div>
                      </div>

                      {/* شريط التقدم */}
                      <div className="mb-3">
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div
                            className={`h-2 rounded-full ${stat.progressColor} transition-all duration-1000 ease-out`}
                            style={{ width: `${stat.progress}%` }}
                          ></div>
                        </div>
                        <div className="flex justify-between items-center mt-2">
                          <span className="text-xs text-gray-500">
                            {stat.progressLabel}
                          </span>
                          <span className="text-xs font-medium text-gray-700">
                            {stat.progress}%
                          </span>
                        </div>
                      </div>

                      {/* المؤشرات والاتجاهات */}
                      <div className="flex items-center justify-between">
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
                        <div className="flex items-center space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <Eye className="w-4 h-4 text-gray-400" />
                          <span className="text-xs text-gray-400">
                            عرض التفاصيل
                          </span>
                        </div>
                      </div>
                    </Card>
                  </motion.div>
                );
              })}
        </div>

        {/* الإجراءات السريعة المحسنة */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="mb-8"
        >
          <Card className="overflow-hidden">
            <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50 border-b">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 mb-1">
                    الإجراءات السريعة
                  </h2>
                  <p className="text-sm text-gray-600">
                    الوصول السريع للعمليات الأساسية في النظام
                  </p>
                </div>
                <div className="flex items-center space-x-2 space-x-reverse">
                  <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                  <span className="text-xs text-gray-500">النظام متصل</span>
                </div>
              </div>
            </CardHeader>
            <CardBody className="p-6">
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                {isLoading
                  ? // مؤشرات تحميل للإجراءات السريعة
                    Array.from({ length: 6 }).map((_, index) => (
                      <div
                        key={index}
                        className="w-full p-6 rounded-xl bg-white border-2 border-gray-100"
                      >
                        <div className="w-14 h-14 mx-auto mb-4 rounded-xl bg-gray-200 animate-pulse"></div>
                        <div className="w-20 h-4 bg-gray-200 rounded animate-pulse mb-2 mx-auto"></div>
                        <div className="w-16 h-3 bg-gray-200 rounded animate-pulse mx-auto"></div>
                      </div>
                    ))
                  : quickActions.map((action, index) => {
                      const Icon = action.icon;
                      return (
                        <motion.div
                          key={action.title}
                          initial={{ opacity: 0, scale: 0.9 }}
                          animate={{ opacity: 1, scale: 1 }}
                          transition={{ delay: 0.1 * index }}
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                        >
                          <button
                            onClick={() => (window.location.href = action.path)}
                            className="w-full p-6 rounded-xl bg-white border-2 border-gray-100 hover:border-gray-300 transition-all duration-300 group hover:shadow-lg hover:-translate-y-1 cursor-pointer relative overflow-hidden"
                          >
                            {/* خلفية متحركة */}
                            <div className="absolute inset-0 bg-gradient-to-br from-white to-gray-50 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>

                            <div className="relative z-10">
                              <div
                                className={`w-14 h-14 mx-auto mb-4 rounded-xl flex items-center justify-center ${action.bgColor} group-hover:scale-110 transition-all duration-300 shadow-lg`}
                              >
                                <Icon className="w-7 h-7 text-white" />
                              </div>
                              <h3 className="font-semibold text-gray-900 text-sm mb-2 group-hover:text-blue-600 transition-colors">
                                {action.title}
                              </h3>
                              <p className="text-xs text-gray-500 group-hover:text-gray-600 transition-colors line-clamp-2">
                                {action.description}
                              </p>
                            </div>

                            {/* مؤشر الزاوية */}
                            <div className="absolute top-2 left-2 w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                              <ArrowUp className="w-3 h-3 text-white rotate-45" />
                            </div>
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
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => (window.location.href = "/orders")}
                  >
                    <Eye className="w-4 h-4 ml-1" />
                    عرض الكل
                  </Button>
                </div>
              </CardHeader>
              <CardBody>
                <div className="space-y-4">
                  {isLoading ? (
                    // مؤشرات تحميل للطلبات
                    Array.from({ length: 3 }).map((_, index) => (
                      <div
                        key={index}
                        className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                      >
                        <div className="flex items-center space-x-3 space-x-reverse">
                          <div className="w-10 h-10 bg-gray-200 rounded-full animate-pulse"></div>
                          <div>
                            <div className="w-20 h-4 bg-gray-200 rounded animate-pulse mb-1"></div>
                            <div className="w-24 h-3 bg-gray-200 rounded animate-pulse"></div>
                          </div>
                        </div>
                        <div className="text-left">
                          <div className="w-16 h-4 bg-gray-200 rounded animate-pulse mb-1"></div>
                          <div className="w-12 h-3 bg-gray-200 rounded animate-pulse"></div>
                        </div>
                      </div>
                    ))
                  ) : dashboardData.recentOrders.length > 0 ? (
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
                      <p className="text-sm font-medium">لا توجد طلبات حديثة</p>
                      <p className="text-xs mt-1">
                        سيتم عرض الطلبات الجديدة هنا
                      </p>
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
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => (window.location.href = "/products")}
                  >
                    <Eye className="w-4 h-4 ml-1" />
                    عرض الكل
                  </Button>
                </div>
              </CardHeader>
              <CardBody>
                <div className="space-y-4">
                  {isLoading ? (
                    // مؤشرات تحميل للمنتجات
                    Array.from({ length: 3 }).map((_, index) => (
                      <div
                        key={index}
                        className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                      >
                        <div className="flex items-center space-x-3 space-x-reverse">
                          <div className="w-10 h-10 bg-gray-200 rounded-full animate-pulse"></div>
                          <div>
                            <div className="w-24 h-4 bg-gray-200 rounded animate-pulse mb-1"></div>
                            <div className="w-20 h-3 bg-gray-200 rounded animate-pulse"></div>
                          </div>
                        </div>
                        <div className="text-left">
                          <div className="w-16 h-4 bg-gray-200 rounded animate-pulse mb-1"></div>
                          <div className="w-12 h-3 bg-gray-200 rounded animate-pulse"></div>
                        </div>
                      </div>
                    ))
                  ) : dashboardData.topProducts.length > 0 ? (
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
                      <p className="text-sm font-medium">لا توجد منتجات</p>
                      <p className="text-xs mt-1">
                        قم بإضافة منتجات جديدة لعرضها هنا
                      </p>
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
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => (window.location.href = "/stores")}
                  >
                    <MapPin className="w-4 h-4 ml-1" />
                    عرض الخريطة
                  </Button>
                </div>
              </CardHeader>
              <CardBody>
                <div className="space-y-4">
                  {isLoading ? (
                    // مؤشرات تحميل للمتاجر
                    Array.from({ length: 3 }).map((_, index) => (
                      <div
                        key={index}
                        className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                      >
                        <div className="flex items-center space-x-3 space-x-reverse">
                          <div className="w-10 h-10 bg-gray-200 rounded-full animate-pulse"></div>
                          <div>
                            <div className="w-28 h-4 bg-gray-200 rounded animate-pulse mb-1"></div>
                            <div className="w-32 h-3 bg-gray-200 rounded animate-pulse"></div>
                          </div>
                        </div>
                        <div className="text-left">
                          <div className="w-16 h-3 bg-gray-200 rounded animate-pulse"></div>
                        </div>
                      </div>
                    ))
                  ) : dashboardData.topStores.length > 0 ? (
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
                      <p className="text-sm font-medium">لا توجد متاجر مسجلة</p>
                      <p className="text-xs mt-1">
                        قم بإضافة متاجر جديدة لعرضها هنا
                      </p>
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
                  {isLoading ? (
                    // مؤشرات تحميل لملخص النظام
                    Array.from({ length: 4 }).map((_, index) => (
                      <div
                        key={index}
                        className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                      >
                        <div className="flex items-center">
                          <div className="w-5 h-5 bg-gray-200 rounded animate-pulse ml-3"></div>
                          <div className="w-20 h-4 bg-gray-200 rounded animate-pulse"></div>
                        </div>
                        <div className="w-16 h-3 bg-gray-200 rounded animate-pulse"></div>
                      </div>
                    ))
                  ) : (
                    <>
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
                          <span className="font-medium text-gray-900">
                            تنبيهات
                          </span>
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
                          <span className="font-medium text-gray-900">
                            التوصيل
                          </span>
                        </div>
                        <span className="text-sm font-medium text-gray-900">
                          {dashboardData.availableVehicles} مركبة متاحة
                        </span>
                      </div>
                    </>
                  )}
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
