import React, { useState, useEffect } from "react";
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
} from "lucide-react";
import { Card, CardHeader, CardBody } from "../../components/ui/Card";
import { Badge } from "../../components/ui/Badge";
import { useAuthStore } from "../../stores/authStore";
import { useSystemStore } from "../../stores/systemStore";

const DashboardHomePage = () => {
  const { user } = useAuthStore();
  const { systemStats, recentActivities, fetchSystemStats, isLoading } =
    useSystemStore();
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    fetchSystemStats();

    // Update time every minute
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 60000);

    return () => clearInterval(timer);
  }, [fetchSystemStats]);

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
              <div className="text-right">
                <p className="text-sm text-gray-500">الحالة</p>
                <div className="flex items-center">
                  <div className="w-2 h-2 bg-green-500 rounded-full ml-2"></div>
                  <span className="text-sm font-medium text-gray-900">
                    متصل
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Grid */}
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
                    {systemStats.totalOrders}
                  </p>
                  <p className="text-blue-100 text-sm mt-1">
                    {systemStats.pendingOrders} معلقة
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
                    {formatCurrency(systemStats.totalRevenue)}
                  </p>
                  <p className="text-green-100 text-sm mt-1">
                    {systemStats.completedOrders} طلب مكتمل
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
                    {systemStats.pendingOrders}
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
                    {systemStats.activeDistributors}
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
                    {systemStats.totalProducts}
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
                    {systemStats.totalStores}
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
                    {systemStats.totalUsers}
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
                    {systemStats.totalVehicles}
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
                    {systemStats.activeVehicles}
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
          {/* Recent Activities */}
          <Card>
            <CardHeader>
              <h3 className="text-lg font-semibold text-gray-900">
                النشاطات الأخيرة
              </h3>
            </CardHeader>
            <CardBody>
              {isLoading ? (
                <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto"></div>
                  <p className="text-gray-500 mt-2">جاري تحميل النشاطات...</p>
                </div>
              ) : recentActivities.length > 0 ? (
                <div className="space-y-4">
                  {recentActivities.map((activity) => (
                    <div
                      key={activity.id}
                      className="flex items-center space-x-3"
                    >
                      {getStatusIcon(activity.status)}
                      <div className="flex-1">
                        <p className="text-sm text-gray-900">
                          {activity.message}
                        </p>
                        <p className="text-xs text-gray-500">{activity.time}</p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <Activity className="w-12 h-12 text-gray-300 mx-auto mb-2" />
                  <p className="text-gray-500">لا توجد نشاطات حديثة</p>
                </div>
              )}
            </CardBody>
          </Card>

          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <h3 className="text-lg font-semibold text-gray-900">
                إجراءات سريعة
              </h3>
            </CardHeader>
            <CardBody>
              <div className="grid grid-cols-2 gap-4">
                <button className="p-4 bg-blue-50 hover:bg-blue-100 rounded-lg border border-blue-200 transition-colors">
                  <ShoppingCart className="w-6 h-6 text-blue-600 mb-2" />
                  <p className="text-sm font-medium text-blue-900">
                    إنشاء طلب جديد
                  </p>
                </button>

                <button className="p-4 bg-green-50 hover:bg-green-100 rounded-lg border border-green-200 transition-colors">
                  <Package className="w-6 h-6 text-green-600 mb-2" />
                  <p className="text-sm font-medium text-green-900">
                    إضافة منتج
                  </p>
                </button>

                <button className="p-4 bg-purple-50 hover:bg-purple-100 rounded-lg border border-purple-200 transition-colors">
                  <Store className="w-6 h-6 text-purple-600 mb-2" />
                  <p className="text-sm font-medium text-purple-900">
                    إدارة المتاجر
                  </p>
                </button>

                <button className="p-4 bg-yellow-50 hover:bg-yellow-100 rounded-lg border border-yellow-200 transition-colors">
                  <Truck className="w-6 h-6 text-yellow-600 mb-2" />
                  <p className="text-sm font-medium text-yellow-900">
                    تتبع التوزيع
                  </p>
                </button>
              </div>
            </CardBody>
          </Card>
        </motion.div>

        {/* System Status */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="mt-8"
        >
          <Card>
            <CardHeader>
              <h3 className="text-lg font-semibold text-gray-900">
                حالة النظام
              </h3>
            </CardHeader>
            <CardBody>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="flex items-center justify-between p-4 bg-green-50 rounded-lg">
                  <div>
                    <p className="text-sm font-medium text-green-800">
                      API الخادم
                    </p>
                    <p className="text-xs text-green-600">متصل ومستقر</p>
                  </div>
                  <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                </div>

                <div className="flex items-center justify-between p-4 bg-blue-50 rounded-lg">
                  <div>
                    <p className="text-sm font-medium text-blue-800">
                      قاعدة البيانات
                    </p>
                    <p className="text-xs text-blue-600">متصل ومستقر</p>
                  </div>
                  <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                </div>

                <div className="flex items-center justify-between p-4 bg-purple-50 rounded-lg">
                  <div>
                    <p className="text-sm font-medium text-purple-800">
                      آخر تحديث
                    </p>
                    <p className="text-xs text-purple-600">
                      {formatTime(currentTime)}
                    </p>
                  </div>
                  <Clock className="w-4 h-4 text-purple-500" />
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
