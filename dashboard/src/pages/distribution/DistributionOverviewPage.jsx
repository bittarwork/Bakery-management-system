/**
 * Distribution Overview Page
 * Comprehensive Distribution Dashboard Overview
 * Phase 6 - Complete Order Management
 */

import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { toast } from "react-hot-toast";
import {
  ChartBarIcon,
  TruckIcon,
  UserGroupIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  ClockIcon,
  MapPinIcon,
  CurrencyDollarIcon,
  ArrowTrendingUpIcon,
  ArrowTrendingDownIcon,
  CalendarIcon,
  StarIcon,
} from "@heroicons/react/24/outline";

// Services
import distributorService from "../../services/distributorService";
import dashboardService from "../../services/dashboardService";
import LoadingSpinner from "../../components/ui/LoadingSpinner";

const DistributionOverviewPage = () => {
  const [loading, setLoading] = useState(false);
  const [overviewData, setOverviewData] = useState({});
  const [recentActivity, setRecentActivity] = useState([]);
  const [topPerformers, setTopPerformers] = useState([]);
  const [distributionStats, setDistributionStats] = useState({});
  const [selectedPeriod, setSelectedPeriod] = useState("today");

  // Load initial data
  useEffect(() => {
    loadOverviewData();
  }, [selectedPeriod]);

  const loadOverviewData = async () => {
    setLoading(true);
    try {
      // Load distribution overview
      const overviewResponse = await dashboardService.getDistributionOverview({
        period: selectedPeriod,
      });

      if (overviewResponse.success) {
        setOverviewData(overviewResponse.data || {});
      }

      // Load recent activity
      const activityResponse =
        await distributorService.getDistributorAssignments({
          page: 1,
          limit: 10,
          status: "all",
        });

      if (activityResponse.success) {
        setRecentActivity(activityResponse.data.assignments || []);
      }

      // Load top performers
      const performersResponse = await distributorService.getDistributors({
        status: "active",
        page: 1,
        limit: 5,
        sort_by: "performance",
      });

      if (performersResponse.success) {
        setTopPerformers(performersResponse.data.distributors || []);
      }

      // Load distribution statistics
      const statsResponse = await distributorService.getDistributorAnalytics(
        null,
        {
          include_summary: true,
          period: selectedPeriod,
        }
      );

      if (statsResponse.success) {
        setDistributionStats(statsResponse.data.summary || {});
      }
    } catch (error) {
      console.error("Error loading overview data:", error);

      // استخدام بيانات تجريبية شاملة
      setOverviewData({
        total_deliveries: 186,
        completed_deliveries: 168,
        completion_rate: 90.3,
        total_revenue: 9825.45,
        active_distributors: 3,
        efficiency_score: 92,
        customer_satisfaction: 4.6,
        trends: {
          deliveries: 5.2,
          revenue: 8.1,
          satisfaction: 2.1,
        },
      });

      setRecentActivity([
        {
          id: 1,
          distributor_name: "أحمد محمد",
          order_number: "ORD-2024-101",
          store_name: "متجر الأمين",
          status: "completed",
          completed_at: "2024-01-20T14:30:00Z",
          delivery_priority: "high",
        },
        {
          id: 2,
          distributor_name: "محمد علي",
          order_number: "ORD-2024-102",
          store_name: "مخبز النور",
          status: "in_progress",
          estimated_delivery: "2024-01-20T16:30:00Z",
          delivery_priority: "normal",
        },
      ]);

      setTopPerformers([
        {
          id: 3,
          name: "سامر حسن",
          performance_score: 95,
          total_deliveries: 98,
          completed_today: 2,
        },
        {
          id: 1,
          name: "أحمد محمد",
          performance_score: 92,
          total_deliveries: 156,
          completed_today: 3,
        },
        {
          id: 2,
          name: "محمد علي",
          performance_score: 88,
          total_deliveries: 143,
          completed_today: 4,
        },
      ]);

      setDistributionStats({
        period_stats: {
          total_deliveries: 186,
          completion_rate: 90.3,
          average_delivery_time: 45,
          revenue: 9825.45,
        },
        trends: {
          delivery_completion: 2.5,
          revenue_growth: 8.2,
          efficiency_improvement: 1.8,
        },
        geographic_distribution: {
          brussels: 45,
          antwerp: 38,
          gent: 32,
          others: 71,
        },
      });

      toast.error("تم استخدام بيانات تجريبية - مشكلة في الاتصال بالخادم");
    } finally {
      setLoading(false);
    }
  };

  const handlePeriodChange = (period) => {
    setSelectedPeriod(period);
  };

  const getPeriodLabel = (period) => {
    switch (period) {
      case "today":
        return "اليوم";
      case "week":
        return "هذا الأسبوع";
      case "month":
        return "هذا الشهر";
      case "quarter":
        return "هذا الربع";
      default:
        return "اليوم";
    }
  };

  const getTrendIcon = (trend) => {
    if (trend > 0) {
      return <ArrowTrendingUpIcon className="w-4 h-4 text-green-600" />;
    } else if (trend < 0) {
      return <ArrowTrendingDownIcon className="w-4 h-4 text-red-600" />;
    }
    return null;
  };

  const getTrendColor = (trend) => {
    if (trend > 0) return "text-green-600";
    if (trend < 0) return "text-red-600";
    return "text-gray-600";
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            نظرة عامة على التوزيع
          </h1>
          <p className="text-gray-600 mt-1">
            لوحة تحكم شاملة لإدارة التوزيع والتسليم
          </p>
        </div>
        <div className="flex items-center space-x-2 rtl:space-x-reverse">
          {[
            { id: "today", label: "اليوم" },
            { id: "week", label: "الأسبوع" },
            { id: "month", label: "الشهر" },
            { id: "quarter", label: "الربع" },
          ].map((period) => (
            <button
              key={period.id}
              onClick={() => handlePeriodChange(period.id)}
              className={`px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
                selectedPeriod === period.id
                  ? "bg-blue-100 text-blue-700"
                  : "text-gray-500 hover:text-gray-700 hover:bg-gray-100"
              }`}
            >
              {period.label}
            </button>
          ))}
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <MetricCard
          title="إجمالي التسليمات"
          value={overviewData.total_deliveries || 0}
          icon={TruckIcon}
          color="blue"
          trend={overviewData.delivery_trend || 0}
          subtitle={getPeriodLabel(selectedPeriod)}
        />
        <MetricCard
          title="معدل الإنجاز"
          value={`${overviewData.completion_rate || 0}%`}
          icon={CheckCircleIcon}
          color="green"
          trend={overviewData.completion_trend || 0}
          subtitle={getPeriodLabel(selectedPeriod)}
        />
        <MetricCard
          title="متوسط وقت التسليم"
          value={`${overviewData.avg_delivery_time || 0} دقيقة`}
          icon={ClockIcon}
          color="orange"
          trend={overviewData.time_trend || 0}
          subtitle={getPeriodLabel(selectedPeriod)}
        />
        <MetricCard
          title="الموزعون النشطون"
          value={overviewData.active_distributors || 0}
          icon={UserGroupIcon}
          color="purple"
          trend={overviewData.distributor_trend || 0}
          subtitle={getPeriodLabel(selectedPeriod)}
        />
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Distribution Performance Chart */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-semibold text-gray-900">
                أداء التوزيع
              </h2>
              <div className="flex items-center space-x-4 rtl:space-x-reverse">
                <div className="flex items-center space-x-2 rtl:space-x-reverse">
                  <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                  <span className="text-sm text-gray-600">التسليمات</span>
                </div>
                <div className="flex items-center space-x-2 rtl:space-x-reverse">
                  <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                  <span className="text-sm text-gray-600">المكتملة</span>
                </div>
              </div>
            </div>

            {loading ? (
              <LoadingSpinner />
            ) : (
              <div className="h-64 flex items-center justify-center bg-gray-50 rounded-lg">
                <div className="text-center">
                  <ChartBarIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600">رسم بياني لأداء التوزيع</p>
                  <p className="text-sm text-gray-500">
                    سيتم إضافة الرسوم البيانية قريباً
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Top Performers */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-semibold text-gray-900">
                أفضل الموزعين
              </h2>
              <StarIcon className="w-5 h-5 text-yellow-500" />
            </div>

            {loading ? (
              <LoadingSpinner />
            ) : topPerformers.length === 0 ? (
              <div className="text-center py-8">
                <UserGroupIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600">لا توجد بيانات متاحة</p>
              </div>
            ) : (
              <div className="space-y-4">
                {topPerformers.map((distributor, index) => (
                  <TopPerformerCard
                    key={distributor.id}
                    distributor={distributor}
                    rank={index + 1}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Additional Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Revenue Metrics */}
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">الإيرادات</h3>
            <CurrencyDollarIcon className="w-6 h-6 text-green-600" />
          </div>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">إجمالي الإيرادات</span>
              <span className="font-semibold">
                {overviewData.total_revenue_eur || 0} EUR
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">متوسط الطلب</span>
              <span className="font-semibold">
                {overviewData.avg_order_value || 0} EUR
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">نمو الإيرادات</span>
              <div className="flex items-center space-x-1 rtl:space-x-reverse">
                {getTrendIcon(overviewData.revenue_trend || 0)}
                <span
                  className={`text-sm font-medium ${getTrendColor(
                    overviewData.revenue_trend || 0
                  )}`}
                >
                  {Math.abs(overviewData.revenue_trend || 0)}%
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Efficiency Metrics */}
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">الكفاءة</h3>
            <ChartBarIcon className="w-6 h-6 text-blue-600" />
          </div>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">معدل الدقة</span>
              <span className="font-semibold">
                {overviewData.accuracy_rate || 0}%
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">وقت الاستجابة</span>
              <span className="font-semibold">
                {overviewData.response_time || 0} دقيقة
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">رضا العملاء</span>
              <span className="font-semibold">
                {overviewData.customer_satisfaction || 0}%
              </span>
            </div>
          </div>
        </div>

        {/* Geographic Distribution */}
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">
              التوزيع الجغرافي
            </h3>
            <MapPinIcon className="w-6 h-6 text-purple-600" />
          </div>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">المناطق المغطاة</span>
              <span className="font-semibold">
                {overviewData.covered_areas || 0}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">متوسط المسافة</span>
              <span className="font-semibold">
                {overviewData.avg_distance || 0} كم
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">الوقت في الطريق</span>
              <span className="font-semibold">
                {overviewData.travel_time || 0} دقيقة
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="bg-white rounded-lg shadow">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-900">
              النشاط الأخير
            </h2>
            <CalendarIcon className="w-5 h-5 text-gray-400" />
          </div>
        </div>

        {loading ? (
          <div className="p-6">
            <LoadingSpinner />
          </div>
        ) : recentActivity.length === 0 ? (
          <div className="p-6 text-center">
            <TruckIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600">لا توجد أنشطة حديثة</p>
          </div>
        ) : (
          <div className="p-6">
            <div className="space-y-4">
              {recentActivity.map((activity) => (
                <ActivityCard key={activity.id} activity={activity} />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

// Metric Card Component
const MetricCard = ({ title, value, icon: Icon, color, trend, subtitle }) => {
  const colorClasses = {
    blue: "text-blue-600 bg-blue-100",
    green: "text-green-600 bg-green-100",
    orange: "text-orange-600 bg-orange-100",
    purple: "text-purple-600 bg-purple-100",
  };

  const getTrendIcon = (trend) => {
    if (trend > 0) {
      return <ArrowTrendingUpIcon className="w-4 h-4 text-green-600" />;
    } else if (trend < 0) {
      return <ArrowTrendingDownIcon className="w-4 h-4 text-red-600" />;
    }
    return null;
  };

  const getTrendColor = (trend) => {
    if (trend > 0) return "text-green-600";
    if (trend < 0) return "text-red-600";
    return "text-gray-600";
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-lg shadow p-6"
    >
      <div className="flex items-center justify-between mb-4">
        <div className={`p-3 rounded-lg ${colorClasses[color]}`}>
          <Icon className="w-6 h-6" />
        </div>
        {trend !== undefined && (
          <div className="flex items-center space-x-1 rtl:space-x-reverse">
            {getTrendIcon(trend)}
            <span className={`text-sm font-medium ${getTrendColor(trend)}`}>
              {Math.abs(trend)}%
            </span>
          </div>
        )}
      </div>

      <div>
        <p className="text-2xl font-bold text-gray-900 mb-1">{value}</p>
        <p className="text-sm font-medium text-gray-600 mb-2">{title}</p>
        <p className="text-xs text-gray-500">{subtitle}</p>
      </div>
    </motion.div>
  );
};

// Top Performer Card Component
const TopPerformerCard = ({ distributor, rank }) => {
  const getRankColor = (rank) => {
    switch (rank) {
      case 1:
        return "text-yellow-600 bg-yellow-100";
      case 2:
        return "text-gray-600 bg-gray-100";
      case 3:
        return "text-orange-600 bg-orange-100";
      default:
        return "text-gray-500 bg-gray-50";
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      className="flex items-center space-x-3 rtl:space-x-reverse p-3 bg-gray-50 rounded-lg"
    >
      <div
        className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${getRankColor(
          rank
        )}`}
      >
        {rank}
      </div>
      <div className="flex-1">
        <h4 className="font-medium text-gray-900">{distributor.name}</h4>
        <p className="text-sm text-gray-600">
          {distributor.performance_metrics?.completed_deliveries || 0} تسليم
        </p>
      </div>
      <div className="text-right">
        <div className="text-sm font-semibold text-gray-900">
          {distributor.performance_metrics?.efficiency_score || 0}%
        </div>
        <div className="text-xs text-gray-500">كفاءة</div>
      </div>
    </motion.div>
  );
};

// Activity Card Component
const ActivityCard = ({ activity }) => {
  const statusInfo = distributorService.getAssignmentStatusInfo(
    activity.status
  );

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex items-center space-x-4 rtl:space-x-reverse p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
    >
      <div
        className={`w-3 h-3 rounded-full`}
        style={{ backgroundColor: statusInfo.color }}
      ></div>
      <div className="flex-1">
        <div className="flex items-center justify-between">
          <h4 className="font-medium text-gray-900">
            طلب #{activity.order_number}
          </h4>
          <span className="text-sm text-gray-500">
            {new Date(activity.updated_at).toLocaleString("ar-SA")}
          </span>
        </div>
        <p className="text-sm text-gray-600">
          {activity.store_name} - {activity.distributor_name}
        </p>
        <div className="flex items-center space-x-4 rtl:space-x-reverse mt-1">
          <span
            className="px-2 py-1 text-xs font-medium rounded-full"
            style={{
              backgroundColor: statusInfo.bgColor,
              color: statusInfo.color,
            }}
          >
            {statusInfo.label}
          </span>
          {activity.estimated_delivery && (
            <span className="text-xs text-gray-500">
              {new Date(activity.estimated_delivery).toLocaleTimeString(
                "ar-SA",
                {
                  hour: "2-digit",
                  minute: "2-digit",
                }
              )}
            </span>
          )}
        </div>
      </div>
    </motion.div>
  );
};

export default DistributionOverviewPage;
