import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  DollarSign,
  ShoppingCart,
  Package,
  Store,
  TrendingUp,
  TrendingDown,
  Activity,
  BarChart3,
  PieChart,
  Clock,
  Users,
  AlertTriangle,
  CheckCircle,
  Zap,
  Brain
} from 'lucide-react';
import { Card, CardHeader, CardBody } from '../ui/Card';
import LoadingSpinner from '../ui/LoadingSpinner';
import aiChatService from '../../services/aiChatService';
import dashboardService from '../../services/dashboardService';

const AIDashboard = () => {
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedPeriod, setSelectedPeriod] = useState('today');
  const [aiInsights, setAiInsights] = useState(null);

  const periods = [
    { value: 'today', label: 'اليوم' },
    { value: 'week', label: 'هذا الأسبوع' },
    { value: 'month', label: 'هذا الشهر' }
  ];

  useEffect(() => {
    fetchDashboardData();
  }, [selectedPeriod]);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Fetch dashboard statistics
      const [dashboardResponse, insightsResponse] = await Promise.all([
        dashboardService.getDashboardStats(selectedPeriod),
        aiChatService.sendMessage(`تحليل شامل لأداء المخبز ${selectedPeriod === 'today' ? 'اليوم' : selectedPeriod === 'week' ? 'هذا الأسبوع' : 'هذا الشهر'} مع أهم الإحصائيات والاتجاهات`)
      ]);

      if (dashboardResponse.success) {
        setDashboardData(dashboardResponse.data);
      }

      if (insightsResponse && insightsResponse.message) {
        setAiInsights(insightsResponse.message);
      }

    } catch (err) {
      console.error('Error fetching dashboard data:', err);
      setError('حدث خطأ أثناء جلب بيانات لوحة التحكم');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <LoadingSpinner className="mx-auto mb-4" />
          <p className="text-gray-600">جاري تحميل لوحة التحكم الذكية...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <Card className="p-8">
        <div className="text-center text-red-600">
          <AlertTriangle className="w-16 h-16 mx-auto mb-4" />
          <p className="text-lg font-semibold mb-2">خطأ في التحميل</p>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={fetchDashboardData}
            className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
          >
            إعادة المحاولة
          </button>
        </div>
      </Card>
    );
  }

  const stats = dashboardData || {
    totalRevenue: 0,
    totalOrders: 0,
    activeProducts: 0,
    activeStores: 0,
    averageOrderValue: 0,
    revenueChange: 0,
    ordersChange: 0,
    productsChange: 0,
    storesChange: 0,
    topProduct: null,
    peakHour: null,
    activeCustomers: 0
  };

  // Main KPI cards
  const kpiCards = [
    {
      title: 'إجمالي الإيرادات',
      value: `${(parseFloat(stats.totalRevenue) || 0).toFixed(2)} €`,
      change: stats.revenueChange || 0,
      icon: DollarSign,
      color: 'bg-green-500',
      bgColor: 'bg-green-50',
      textColor: 'text-green-700'
    },
    {
      title: 'عدد الطلبات',
      value: parseInt(stats.totalOrders) || 0,
      change: stats.ordersChange || 0,
      icon: ShoppingCart,
      color: 'bg-blue-500',
      bgColor: 'bg-blue-50',
      textColor: 'text-blue-700'
    },
    {
      title: 'المنتجات النشطة',
      value: parseInt(stats.activeProducts) || 0,
      change: stats.productsChange || 0,
      icon: Package,
      color: 'bg-purple-500',
      bgColor: 'bg-purple-50',
      textColor: 'text-purple-700'
    },
    {
      title: 'المتاجر النشطة',
      value: parseInt(stats.activeStores) || 0,
      change: stats.storesChange || 0,
      icon: Store,
      color: 'bg-orange-500',
      bgColor: 'bg-orange-50',
      textColor: 'text-orange-700'
    }
  ];

  // Quick insights cards
  const quickInsights = [
    {
      title: 'أفضل منتج مبيعاً',
      value: stats.topProduct?.name || 'غير متوفر',
      subtitle: `${stats.topProduct?.sales || 0} قطعة`,
      icon: TrendingUp,
      color: 'text-green-600'
    },
    {
      title: 'وقت الذروة',
      value: stats.peakHour || 'غير محدد',
      subtitle: `أعلى نشاط`,
      icon: Clock,
      color: 'text-blue-600'
    },
    {
      title: 'متوسط الطلب',
      value: `${(parseFloat(stats.averageOrderValue) || 0).toFixed(2)} €`,
      subtitle: 'لكل طلب',
      icon: BarChart3,
      color: 'text-purple-600'
    },
    {
      title: 'العملاء النشطين',
      value: parseInt(stats.activeCustomers) || 0,
      subtitle: 'اليوم',
      icon: Users,
      color: 'text-orange-600'
    }
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Brain className="w-8 h-8 text-blue-500" />
            لوحة التحكم الذكية
          </h2>
          <p className="text-gray-600">نظرة شاملة ومتطورة على أداء المخبز</p>
        </div>

        {/* Period Selector */}
        <div className="flex bg-gray-100 rounded-lg p-1">
          {periods.map((period) => (
            <button
              key={period.value}
              onClick={() => setSelectedPeriod(period.value)}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                selectedPeriod === period.value
                  ? 'bg-white text-blue-600 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              {period.label}
            </button>
          ))}
        </div>
      </div>

      {/* Main KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {kpiCards.map((card, index) => (
          <motion.div
            key={card.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: index * 0.1 }}
          >
            <Card className={`${card.bgColor} border-0`}>
              <CardBody className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className={`text-sm font-medium ${card.textColor} opacity-80`}>
                      {card.title}
                    </p>
                    <p className={`text-2xl font-bold ${card.textColor} mt-1`}>
                      {card.value}
                    </p>
                    <div className="flex items-center mt-2">
                      {card.change >= 0 ? (
                        <TrendingUp className="w-4 h-4 text-green-500 mr-1" />
                      ) : (
                        <TrendingDown className="w-4 h-4 text-red-500 mr-1" />
                      )}
                      <span className={`text-sm ${
                        card.change >= 0 ? 'text-green-600' : 'text-red-600'
                      }`}>
                        {Math.abs(card.change).toFixed(1)}%
                      </span>
                    </div>
                  </div>
                  <div className={`w-12 h-12 rounded-lg ${card.color} flex items-center justify-center`}>
                    <card.icon className="w-6 h-6 text-white" />
                  </div>
                </div>
              </CardBody>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Quick Insights Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {quickInsights.map((insight, index) => (
          <motion.div
            key={insight.title}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3, delay: index * 0.1 }}
          >
            <Card className="hover:shadow-md transition-shadow">
              <CardBody className="p-6">
                <div className="flex items-center gap-3">
                  <insight.icon className={`w-8 h-8 ${insight.color}`} />
                  <div>
                    <p className="text-sm text-gray-600">{insight.title}</p>
                    <p className="text-lg font-semibold text-gray-900">{insight.value}</p>
                    <p className="text-xs text-gray-500">{insight.subtitle}</p>
                  </div>
                </div>
              </CardBody>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* AI Insights Panel */}
      {aiInsights && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
        >
          <Card className="bg-gradient-to-r from-blue-50 to-purple-50 border-blue-200">
            <CardHeader>
              <div className="flex items-center gap-2">
                <Zap className="w-5 h-5 text-blue-500" />
                <h3 className="text-lg font-semibold text-gray-900">تحليل ذكي</h3>
              </div>
            </CardHeader>
            <CardBody>
              <div className="prose prose-sm max-w-none text-gray-700">
                <div className="whitespace-pre-wrap">{aiInsights}</div>
              </div>
            </CardBody>
          </Card>
        </motion.div>
      )}

      {/* Status Indicators */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="bg-green-50 border-green-200">
          <CardBody className="p-4">
            <div className="flex items-center gap-3">
              <CheckCircle className="w-8 h-8 text-green-500" />
              <div>
                <p className="font-semibold text-green-800">النظام يعمل بكفاءة</p>
                <p className="text-sm text-green-600">جميع الخدمات متاحة</p>
              </div>
            </div>
          </CardBody>
        </Card>

        <Card className="bg-blue-50 border-blue-200">
          <CardBody className="p-4">
            <div className="flex items-center gap-3">
              <Activity className="w-8 h-8 text-blue-500" />
              <div>
                <p className="font-semibold text-blue-800">النشاط الحالي</p>
                <p className="text-sm text-blue-600">{stats.currentActivity || 'نشاط طبيعي'}</p>
              </div>
            </div>
          </CardBody>
        </Card>

        <Card className="bg-purple-50 border-purple-200">
          <CardBody className="p-4">
            <div className="flex items-center gap-3">
              <Brain className="w-8 h-8 text-purple-500" />
              <div>
                <p className="font-semibold text-purple-800">البوت الذكي</p>
                <p className="text-sm text-purple-600">جاهز للمساعدة</p>
              </div>
            </div>
          </CardBody>
        </Card>
      </div>
    </div>
  );
};

export default AIDashboard; 