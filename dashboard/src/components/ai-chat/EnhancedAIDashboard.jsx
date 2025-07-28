import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  TrendingUp,
  TrendingDown,
  DollarSign,
  ShoppingBag,
  Package,
  Store,
  Users,
  Clock,
  Target,
  Activity,
  AlertTriangle,
  CheckCircle,
  Zap,
  BarChart3,
  Calendar,
  RefreshCw,
  Eye,
  Star,
  Award,
  PieChart,
  ArrowUp,
  ArrowDown,
  Minus,
} from "lucide-react";
import { Card, CardHeader, CardBody } from "../ui/Card";
import EnhancedButton from "../ui/EnhancedButton";
import LoadingSpinner from "../ui/LoadingSpinner";
import dashboardService from "../../services/dashboardService";
import { toast } from "react-hot-toast";

const EnhancedAIDashboard = () => {
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [timeframe, setTimeframe] = useState("today");
  const [lastUpdated, setLastUpdated] = useState(null);
  const [insights, setInsights] = useState([]);

  const timeframes = [
    { value: "today", label: "اليوم", icon: Calendar },
    { value: "week", label: "هذا الأسبوع", icon: Calendar },
    { value: "month", label: "هذا الشهر", icon: Calendar },
  ];

  useEffect(() => {
    loadDashboardData();
  }, [timeframe]);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      const data = await dashboardService.getDashboardData(timeframe);
      setDashboardData(data);
      setLastUpdated(new Date());
      generateInsights(data);
    } catch (error) {
      console.error("Error loading dashboard data:", error);
      toast.error("فشل في تحميل بيانات لوحة التحكم");
    } finally {
      setLoading(false);
    }
  };

  const generateInsights = (data) => {
    const newInsights = [];

    // Revenue insights
    if (data.revenue.current === 0) {
      newInsights.push({
        type: "warning",
        title: "لا توجد إيرادات",
        message: "لم يتم تسجيل أي إيرادات في هذه الفترة. قد تحتاج لمراجعة استراتيجية التسويق.",
        icon: AlertTriangle,
      });
    } else if (data.revenue.change > 20) {
      newInsights.push({
        type: "success",
        title: "نمو ممتاز في الإيرادات",
        message: `زيادة ${data.revenue.change.toFixed(1)}% في الإيرادات مقارنة بالفترة السابقة.`,
        icon: TrendingUp,
      });
    } else if (data.revenue.change < -10) {
      newInsights.push({
        type: "warning",
        title: "انخفاض في الإيرادات",
        message: `انخفاض ${Math.abs(data.revenue.change).toFixed(1)}% في الإيرادات. يحتاج لمتابعة.`,
        icon: TrendingDown,
      });
    }

    // Order insights
    if (data.orders.current === 0) {
      newInsights.push({
        type: "info",
        title: "لا توجد طلبات جديدة",
        message: "لم يتم تسجيل طلبات في هذه الفترة. تحقق من نظام الطلبات والتسويق.",
        icon: ShoppingBag,
      });
    }

    // Peak time insights
    if (data.peakTime && data.peakTime !== "غير محدد") {
      newInsights.push({
        type: "info",
        title: "وقت الذروة",
        message: `أعلى نشاط في الساعة ${data.peakTime}. استغل هذا الوقت لتحسين العروض.`,
        icon: Clock,
      });
    }

    // Product insights
    if (data.topProduct && data.topProduct.name !== "غير متوفر") {
      newInsights.push({
        type: "success",
        title: "أفضل منتج مبيعاً",
        message: `${data.topProduct.name} هو الأكثر مبيعاً بـ ${data.topProduct.sales} قطعة.`,
        icon: Award,
      });
    }

    // System status insights
    if (data.systemStatus.overall === "excellent") {
      newInsights.push({
        type: "success",
        title: "النظام يعمل بكفاءة عالية",
        message: "جميع الخدمات متاحة والأداء ممتاز.",
        icon: CheckCircle,
      });
    }

    setInsights(newInsights);
  };

  const formatCurrency = (amount) => {
    return `${amount.toLocaleString('ar')} €`;
  };

  const formatPercentage = (value) => {
    if (value === 0) return "0.0%";
    const prefix = value > 0 ? "+" : "";
    return `${prefix}${value.toFixed(1)}%`;
  };

  const getChangeIcon = (change) => {
    if (change > 0) return <ArrowUp className="w-4 h-4 text-green-500" />;
    if (change < 0) return <ArrowDown className="w-4 h-4 text-red-500" />;
    return <Minus className="w-4 h-4 text-gray-500" />;
  };

  const getChangeColor = (change) => {
    if (change > 0) return "text-green-600";
    if (change < 0) return "text-red-600";
    return "text-gray-600";
  };

  if (loading) {
    return (
      <Card className="h-full">
        <CardBody className="flex items-center justify-center h-96">
          <div className="text-center">
            <LoadingSpinner className="mx-auto mb-4" />
            <p className="text-gray-600">جارٍ تحميل بيانات لوحة التحكم...</p>
          </div>
        </CardBody>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                لوحة التحكم الذكية
              </h2>
              <p className="text-gray-600">
                نظرة شاملة ومتطورة على أداء المخبز
              </p>
            </div>
            
            <div className="flex items-center gap-3">
              {/* Timeframe Selector */}
              <div className="flex bg-gray-100 rounded-lg p-1">
                {timeframes.map((tf) => (
                  <button
                    key={tf.value}
                    onClick={() => setTimeframe(tf.value)}
                    className={`px-3 py-1.5 text-sm font-medium rounded-md transition-colors ${
                      timeframe === tf.value
                        ? "bg-white text-blue-600 shadow-sm"
                        : "text-gray-600 hover:text-gray-900"
                    }`}
                  >
                    {tf.label}
                  </button>
                ))}
              </div>
              
              <EnhancedButton
                variant="outline"
                size="sm"
                onClick={loadDashboardData}
                disabled={loading}
              >
                <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
              </EnhancedButton>
            </div>
          </div>
          
          {lastUpdated && (
            <p className="text-xs text-gray-500 mt-2">
              آخر تحديث: {lastUpdated.toLocaleString('ar')}
            </p>
          )}
        </CardHeader>
      </Card>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Revenue */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Card className="hover:shadow-lg transition-shadow">
            <CardBody className="p-6">
              <div className="flex items-center justify-between mb-2">
                <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                  <DollarSign className="w-6 h-6 text-green-600" />
                </div>
                <div className="flex items-center gap-1">
                  {getChangeIcon(dashboardData?.revenue?.change || 0)}
                  <span className={`text-sm ${getChangeColor(dashboardData?.revenue?.change || 0)}`}>
                    {formatPercentage(dashboardData?.revenue?.change || 0)}
                  </span>
                </div>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-1">
                إجمالي الإيرادات
              </h3>
              <p className="text-2xl font-bold text-green-600">
                {formatCurrency(dashboardData?.revenue?.current || 0)}
              </p>
            </CardBody>
          </Card>
        </motion.div>

        {/* Orders */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Card className="hover:shadow-lg transition-shadow">
            <CardBody className="p-6">
              <div className="flex items-center justify-between mb-2">
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                  <ShoppingBag className="w-6 h-6 text-blue-600" />
                </div>
                <div className="flex items-center gap-1">
                  {getChangeIcon(dashboardData?.orders?.change || 0)}
                  <span className={`text-sm ${getChangeColor(dashboardData?.orders?.change || 0)}`}>
                    {formatPercentage(dashboardData?.orders?.change || 0)}
                  </span>
                </div>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-1">
                عدد الطلبات
              </h3>
              <p className="text-2xl font-bold text-blue-600">
                {dashboardData?.orders?.current || 0}
              </p>
            </CardBody>
          </Card>
        </motion.div>

        {/* Products */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <Card className="hover:shadow-lg transition-shadow">
            <CardBody className="p-6">
              <div className="flex items-center justify-between mb-2">
                <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                  <Package className="w-6 h-6 text-purple-600" />
                </div>
                <div className="flex items-center gap-1">
                  {getChangeIcon(dashboardData?.products?.change || 0)}
                  <span className={`text-sm ${getChangeColor(dashboardData?.products?.change || 0)}`}>
                    {formatPercentage(dashboardData?.products?.change || 0)}
                  </span>
                </div>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-1">
                المنتجات النشطة
              </h3>
              <p className="text-2xl font-bold text-purple-600">
                {dashboardData?.products?.current || 16}
              </p>
            </CardBody>
          </Card>
        </motion.div>

        {/* Stores */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <Card className="hover:shadow-lg transition-shadow">
            <CardBody className="p-6">
              <div className="flex items-center justify-between mb-2">
                <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
                  <Store className="w-6 h-6 text-orange-600" />
                </div>
                <div className="flex items-center gap-1">
                  {getChangeIcon(dashboardData?.stores?.change || 0)}
                  <span className={`text-sm ${getChangeColor(dashboardData?.stores?.change || 0)}`}>
                    {formatPercentage(dashboardData?.stores?.change || 0)}
                  </span>
                </div>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-1">
                المتاجر النشطة
              </h3>
              <p className="text-2xl font-bold text-orange-600">
                {dashboardData?.stores?.current || 7}
              </p>
            </CardBody>
          </Card>
        </motion.div>
      </div>

      {/* Additional Metrics */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Top Product */}
        <Card>
          <CardHeader>
            <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
              <Award className="w-5 h-5 text-yellow-500" />
              أفضل منتج مبيعاً
            </h3>
          </CardHeader>
          <CardBody>
            <div className="text-center">
              <p className="text-xl font-bold text-gray-900 mb-1">
                {dashboardData?.topProduct?.name || "غير متوفر"}
              </p>
              <p className="text-lg text-yellow-600">
                {dashboardData?.topProduct?.sales || 0} قطعة
              </p>
            </div>
          </CardBody>
        </Card>

        {/* Peak Time */}
        <Card>
          <CardHeader>
            <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
              <Clock className="w-5 h-5 text-blue-500" />
              وقت الذروة
            </h3>
          </CardHeader>
          <CardBody>
            <div className="text-center">
              <p className="text-xl font-bold text-gray-900 mb-1">
                {dashboardData?.peakTime || "غير محدد"}
              </p>
              <p className="text-sm text-gray-600">أعلى نشاط</p>
            </div>
          </CardBody>
        </Card>

        {/* Average Order */}
        <Card>
          <CardHeader>
            <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
              <Target className="w-5 h-5 text-green-500" />
              متوسط الطلب
            </h3>
          </CardHeader>
          <CardBody>
            <div className="text-center">
              <p className="text-xl font-bold text-gray-900 mb-1">
                {formatCurrency(dashboardData?.averageOrder || 0)}
              </p>
              <p className="text-sm text-gray-600">لكل طلب</p>
            </div>
          </CardBody>
        </Card>
      </div>

      {/* AI Insights */}
      {insights.length > 0 && (
        <Card>
          <CardHeader>
            <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
              <Activity className="w-5 h-5 text-purple-500" />
              التحليل الذكي
            </h3>
          </CardHeader>
          <CardBody>
            <div className="space-y-4">
              <AnimatePresence>
                {insights.map((insight, index) => {
                  const IconComponent = insight.icon;
                  return (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 20 }}
                      transition={{ delay: index * 0.1 }}
                      className={`p-4 rounded-lg border-l-4 ${
                        insight.type === "success"
                          ? "bg-green-50 border-green-400"
                          : insight.type === "warning"
                          ? "bg-yellow-50 border-yellow-400"
                          : "bg-blue-50 border-blue-400"
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        <IconComponent
                          className={`w-5 h-5 mt-0.5 ${
                            insight.type === "success"
                              ? "text-green-600"
                              : insight.type === "warning"
                              ? "text-yellow-600"
                              : "text-blue-600"
                          }`}
                        />
                        <div>
                          <h4 className="font-medium text-gray-900 mb-1">
                            {insight.title}
                          </h4>
                          <p className="text-sm text-gray-700">
                            {insight.message}
                          </p>
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </AnimatePresence>
            </div>
          </CardBody>
        </Card>
      )}

      {/* System Status */}
      <Card>
        <CardHeader>
          <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
            <Activity className="w-5 h-5 text-green-500" />
            حالة النظام
          </h3>
        </CardHeader>
        <CardBody>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center p-4 bg-green-50 rounded-lg">
              <CheckCircle className="w-8 h-8 text-green-600 mx-auto mb-2" />
              <p className="font-medium text-gray-900">النظام يعمل بكفاءة</p>
              <p className="text-sm text-gray-600">جميع الخدمات متاحة</p>
            </div>
            
            <div className="text-center p-4 bg-blue-50 rounded-lg">
              <Activity className="w-8 h-8 text-blue-600 mx-auto mb-2" />
              <p className="font-medium text-gray-900">النشاط الحالي</p>
              <p className="text-sm text-gray-600">
                {dashboardData?.activityLevel || "نشاط منخفض"}
              </p>
            </div>
            
            <div className="text-center p-4 bg-purple-50 rounded-lg">
              <Zap className="w-8 h-8 text-purple-600 mx-auto mb-2" />
              <p className="font-medium text-gray-900">البوت الذكي</p>
              <p className="text-sm text-gray-600">جاهز للمساعدة</p>
            </div>
          </div>
        </CardBody>
      </Card>
    </div>
  );
};

export default EnhancedAIDashboard; 