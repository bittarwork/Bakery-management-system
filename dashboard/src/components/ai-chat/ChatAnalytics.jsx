import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  AreaChart,
  Area,
} from "recharts";
import {
  MessageSquare,
  TrendingUp,
  Clock,
  Star,
  Brain,
  Heart,
  Activity,
  Target,
  Zap,
  Users,
} from "lucide-react";
import aiChatService from "../../services/aiChatService";

const ChatAnalytics = () => {
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedPeriod, setSelectedPeriod] = useState("30d");
  const [error, setError] = useState(null);

  const periods = [
    { value: "7d", label: "7 أيام" },
    { value: "30d", label: "30 يوم" },
    { value: "90d", label: "90 يوم" },
  ];

  useEffect(() => {
    fetchAnalytics();
  }, [selectedPeriod]);

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      setError(null);

      // Get conversation statistics
      const statsResponse = await aiChatService.getConversationStats(
        selectedPeriod
      );

      if (statsResponse.success) {
        setAnalytics(statsResponse.data);
      } else {
        throw new Error(statsResponse.message || "Failed to fetch analytics");
      }
    } catch (err) {
      console.error("Error fetching analytics:", err);
      setError("حدث خطأ أثناء جلب التحليلات");
    } finally {
      setLoading(false);
    }
  };

  const sentimentColors = {
    positive: "#10B981",
    negative: "#EF4444",
    neutral: "#6B7280",
  };

  const intentColors = [
    "#3B82F6",
    "#8B5CF6",
    "#10B981",
    "#F59E0B",
    "#EF4444",
    "#6366F1",
    "#EC4899",
    "#14B8A6",
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="flex flex-col items-center gap-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
          <p className="text-gray-600">جاري تحميل التحليلات...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="text-red-500 mb-2">⚠️</div>
          <p className="text-gray-600">{error}</p>
          <button
            onClick={fetchAnalytics}
            className="mt-4 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
          >
            إعادة المحاولة
          </button>
        </div>
      </div>
    );
  }

  if (!analytics || !analytics.stats) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-gray-600">لا توجد بيانات متاحة</p>
      </div>
    );
  }

  const { stats } = analytics;

  // Prepare sentiment data for pie chart
  const sentimentData = [
    {
      name: "إيجابية",
      value: stats.positiveCount || 0,
      color: sentimentColors.positive,
    },
    {
      name: "سلبية",
      value: stats.negativeCount || 0,
      color: sentimentColors.negative,
    },
    {
      name: "محايدة",
      value: stats.neutralCount || 0,
      color: sentimentColors.neutral,
    },
  ].filter((item) => item.value > 0);

  // Prepare intent data
  const intentData = Object.entries(stats.intentBreakdown || {}).map(
    ([intent, count], index) => ({
      name: translateIntent(intent),
      value: count,
      color: intentColors[index % intentColors.length],
    })
  );

  // Stats cards data
  const statsCards = [
    {
      title: "إجمالي الرسائل",
      value: stats.totalMessages || 0,
      icon: MessageSquare,
      color: "bg-blue-500",
      change: "+12%",
    },
    {
      title: "متوسط وقت الاستجابة",
      value: `${Math.round(stats.avgResponseTime || 0)}ms`,
      icon: Clock,
      color: "bg-green-500",
      change: "-8%",
    },
    {
      title: "متوسط التقييم",
      value: `${(stats.avgRating || 0).toFixed(1)}/5`,
      icon: Star,
      color: "bg-yellow-500",
      change: "+5%",
    },
    {
      title: "الاستجابات المخزنة",
      value: `${(
        (stats.cachedResponses / stats.totalMessages) * 100 || 0
      ).toFixed(1)}%`,
      icon: Zap,
      color: "bg-purple-500",
      change: "+15%",
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">
            تحليلات الدردشة الذكية
          </h2>
          <p className="text-gray-600">نظرة شاملة على أداء المساعد الذكي</p>
        </div>

        {/* Period Selector */}
        <div className="flex bg-gray-100 rounded-lg p-1">
          {periods.map((period) => (
            <button
              key={period.value}
              onClick={() => setSelectedPeriod(period.value)}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                selectedPeriod === period.value
                  ? "bg-white text-blue-600 shadow-sm"
                  : "text-gray-600 hover:text-gray-900"
              }`}
            >
              {period.label}
            </button>
          ))}
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statsCards.map((card, index) => (
          <motion.div
            key={card.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: index * 0.1 }}
            className="bg-white rounded-xl shadow-sm border border-gray-200 p-6"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">
                  {card.title}
                </p>
                <p className="text-2xl font-bold text-gray-900 mt-1">
                  {card.value}
                </p>
                {card.change && (
                  <p className="text-sm text-green-600 mt-1">{card.change}</p>
                )}
              </div>
              <div
                className={`w-12 h-12 rounded-lg ${card.color} flex items-center justify-center`}
              >
                <card.icon className="w-6 h-6 text-white" />
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Sentiment Analysis */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
          className="bg-white rounded-xl shadow-sm border border-gray-200 p-6"
        >
          <div className="flex items-center gap-2 mb-4">
            <Heart className="w-5 h-5 text-pink-500" />
            <h3 className="text-lg font-semibold text-gray-900">
              تحليل المشاعر
            </h3>
          </div>

          {sentimentData.length > 0 ? (
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={sentimentData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={100}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {sentimentData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(value, name) => [value, name]}
                    labelStyle={{ direction: "rtl" }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="h-64 flex items-center justify-center text-gray-500">
              لا توجد بيانات مشاعر متاحة
            </div>
          )}

          {/* Legend */}
          <div className="flex justify-center gap-4 mt-4">
            {sentimentData.map((item) => (
              <div key={item.name} className="flex items-center gap-2">
                <div
                  className="w-3 h-3 rounded-full"
                  style={{ backgroundColor: item.color }}
                ></div>
                <span className="text-sm text-gray-600">
                  {item.name}: {item.value}
                </span>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Intent Analysis */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
          className="bg-white rounded-xl shadow-sm border border-gray-200 p-6"
        >
          <div className="flex items-center gap-2 mb-4">
            <Target className="w-5 h-5 text-blue-500" />
            <h3 className="text-lg font-semibold text-gray-900">
              تحليل النوايا
            </h3>
          </div>

          {intentData.length > 0 ? (
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={intentData}
                  margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis
                    dataKey="name"
                    tick={{ fontSize: 12 }}
                    angle={-45}
                    textAnchor="end"
                    height={80}
                  />
                  <YAxis />
                  <Tooltip
                    formatter={(value, name) => [value, "العدد"]}
                    labelStyle={{ direction: "rtl" }}
                  />
                  <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                    {intentData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="h-64 flex items-center justify-center text-gray-500">
              لا توجد بيانات نوايا متاحة
            </div>
          )}
        </motion.div>
      </div>

      {/* Performance Insights */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.3 }}
        className="bg-white rounded-xl shadow-sm border border-gray-200 p-6"
      >
        <div className="flex items-center gap-2 mb-4">
          <Activity className="w-5 h-5 text-green-500" />
          <h3 className="text-lg font-semibold text-gray-900">رؤى الأداء</h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Performance Score */}
          <div className="text-center">
            <div className="w-20 h-20 mx-auto mb-3 rounded-full bg-gradient-to-r from-green-400 to-blue-500 flex items-center justify-center">
              <span className="text-2xl font-bold text-white">
                {Math.round(((stats.avgRating || 0) / 5) * 100)}
              </span>
            </div>
            <h4 className="font-semibold text-gray-900">نقاط الأداء</h4>
            <p className="text-sm text-gray-600">من 100</p>
          </div>

          {/* Response Quality */}
          <div className="text-center">
            <div className="w-20 h-20 mx-auto mb-3 rounded-full bg-gradient-to-r from-purple-400 to-pink-500 flex items-center justify-center">
              <Brain className="w-8 h-8 text-white" />
            </div>
            <h4 className="font-semibold text-gray-900">جودة الاستجابة</h4>
            <p className="text-sm text-gray-600">
              {stats.avgRating >= 4
                ? "ممتازة"
                : stats.avgRating >= 3
                ? "جيدة"
                : stats.avgRating >= 2
                ? "متوسطة"
                : "تحتاج تحسين"}
            </p>
          </div>

          {/* Efficiency */}
          <div className="text-center">
            <div className="w-20 h-20 mx-auto mb-3 rounded-full bg-gradient-to-r from-yellow-400 to-orange-500 flex items-center justify-center">
              <Zap className="w-8 h-8 text-white" />
            </div>
            <h4 className="font-semibold text-gray-900">الكفاءة</h4>
            <p className="text-sm text-gray-600">
              {(
                (stats.cachedResponses / stats.totalMessages) * 100 || 0
              ).toFixed(1)}
              % مخزن
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

// Helper function to translate intents
const translateIntent = (intent) => {
  const translations = {
    question: "سؤال",
    request: "طلب",
    complaint: "شكوى",
    compliment: "مجاملة",
    report_request: "طلب تقرير",
    sales_inquiry: "استفسار مبيعات",
    inventory_inquiry: "استفسار مخزون",
    store_inquiry: "استفسار متجر",
    greeting: "تحية",
    goodbye: "وداع",
  };
  return translations[intent] || intent;
};

export default ChatAnalytics;
