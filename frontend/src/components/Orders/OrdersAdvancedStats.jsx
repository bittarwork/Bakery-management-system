import React from "react";
import {
  TrendingUp,
  TrendingDown,
  DollarSign,
  Calendar,
  Clock,
  AlertTriangle,
  CheckCircle,
  Package,
  Users,
  BarChart3,
} from "lucide-react";
import { formatCurrency, getLocalizedText } from "../../utils/formatters";
import { usePreferences } from "../../contexts/PreferencesContext";

const OrdersAdvancedStats = ({ statistics, className = "" }) => {
  const { preferences } = usePreferences();

  // حساب النسب المئوية للتغيير
  const getPercentageChange = (current, previous) => {
    if (!previous || previous === 0) return 0;
    return ((current - previous) / previous) * 100;
  };

  // الحصول على لون المؤشر
  const getTrendColor = (value) => {
    if (value > 0)
      return "text-green-600 bg-green-100 dark:text-green-400 dark:bg-green-900";
    if (value < 0)
      return "text-red-600 bg-red-100 dark:text-red-400 dark:bg-red-900";
    return "text-gray-600 bg-gray-100 dark:text-gray-400 dark:bg-gray-700";
  };

  const getTrendIcon = (value) => {
    if (value > 0) return <TrendingUp className="h-4 w-4" />;
    if (value < 0) return <TrendingDown className="h-4 w-4" />;
    return <BarChart3 className="h-4 w-4" />;
  };

  const getStatCards = () => {
    const language = preferences?.general?.language || "ar";

    const cards = {
      ar: [
        {
          title: "إجمالي الطلبات",
          value: statistics.totalOrders || 0,
          icon: Package,
          color: "blue",
          change: getPercentageChange(
            statistics.totalOrders,
            statistics.previousPeriod?.totalOrders
          ),
          description: "العدد الكلي للطلبات",
        },
        {
          title: "إجمالي المبيعات",
          value: formatCurrency(statistics.totalAmount || 0),
          icon: DollarSign,
          color: "green",
          change: getPercentageChange(
            statistics.totalAmount,
            statistics.previousPeriod?.totalAmount
          ),
          description: "قيمة المبيعات الإجمالية",
        },
        {
          title: "متوسط قيمة الطلب",
          value: formatCurrency(statistics.avgOrderValue || 0),
          icon: BarChart3,
          color: "purple",
          change: getPercentageChange(
            statistics.avgOrderValue,
            statistics.previousPeriod?.avgOrderValue
          ),
          description: "متوسط قيمة الطلب الواحد",
        },
        {
          title: "طلبات اليوم",
          value: statistics.todayOrders || 0,
          icon: Calendar,
          color: "orange",
          change: getPercentageChange(
            statistics.todayOrders,
            statistics.yesterdayOrders || 0
          ),
          description: "طلبات اليوم الحالي",
        },
        {
          title: "طلبات معلقة",
          value: statistics.pendingOrders || 0,
          icon: Clock,
          color: "yellow",
          change: 0,
          description: "طلبات في انتظار المعالجة",
        },
        {
          title: "مدفوعات متأخرة",
          value: statistics.overduePayments || 0,
          icon: AlertTriangle,
          color: "red",
          change: 0,
          description: "مدفوعات متأخرة عن موعدها",
          alert: true,
        },
        {
          title: "طلبات مكتملة",
          value: statistics.completedOrders || 0,
          icon: CheckCircle,
          color: "green",
          change: getPercentageChange(
            statistics.completedOrders,
            statistics.previousPeriod?.completedOrders
          ),
          description: "طلبات تم تسليمها بنجاح",
        },
        {
          title: "عدد العملاء النشطين",
          value: statistics.activeCustomers || 0,
          icon: Users,
          color: "indigo",
          change: getPercentageChange(
            statistics.activeCustomers,
            statistics.previousPeriod?.activeCustomers
          ),
          description: "عملاء قاموا بطلبات مؤخراً",
        },
      ],
      en: [
        {
          title: "Total Orders",
          value: statistics.totalOrders || 0,
          icon: Package,
          color: "blue",
          change: getPercentageChange(
            statistics.totalOrders,
            statistics.previousPeriod?.totalOrders
          ),
          description: "Total number of orders",
        },
        {
          title: "Total Sales",
          value: formatCurrency(statistics.totalAmount || 0),
          icon: DollarSign,
          color: "green",
          change: getPercentageChange(
            statistics.totalAmount,
            statistics.previousPeriod?.totalAmount
          ),
          description: "Total sales amount",
        },
        {
          title: "Average Order Value",
          value: formatCurrency(statistics.avgOrderValue || 0),
          icon: BarChart3,
          color: "purple",
          change: getPercentageChange(
            statistics.avgOrderValue,
            statistics.previousPeriod?.avgOrderValue
          ),
          description: "Average value per order",
        },
        {
          title: "Today's Orders",
          value: statistics.todayOrders || 0,
          icon: Calendar,
          color: "orange",
          change: getPercentageChange(
            statistics.todayOrders,
            statistics.yesterdayOrders || 0
          ),
          description: "Orders placed today",
        },
        {
          title: "Pending Orders",
          value: statistics.pendingOrders || 0,
          icon: Clock,
          color: "yellow",
          change: 0,
          description: "Orders awaiting processing",
        },
        {
          title: "Overdue Payments",
          value: statistics.overduePayments || 0,
          icon: AlertTriangle,
          color: "red",
          change: 0,
          description: "Payments past due date",
          alert: true,
        },
        {
          title: "Completed Orders",
          value: statistics.completedOrders || 0,
          icon: CheckCircle,
          color: "green",
          change: getPercentageChange(
            statistics.completedOrders,
            statistics.previousPeriod?.completedOrders
          ),
          description: "Successfully delivered orders",
        },
        {
          title: "Active Customers",
          value: statistics.activeCustomers || 0,
          icon: Users,
          color: "indigo",
          change: getPercentageChange(
            statistics.activeCustomers,
            statistics.previousPeriod?.activeCustomers
          ),
          description: "Customers with recent orders",
        },
      ],
    };

    return cards[language] || cards.ar;
  };

  const statCards = getStatCards();

  const getColorClasses = (color) => {
    const colors = {
      blue: "bg-blue-50 border-blue-200 dark:bg-blue-900 dark:border-blue-700",
      green:
        "bg-green-50 border-green-200 dark:bg-green-900 dark:border-green-700",
      purple:
        "bg-purple-50 border-purple-200 dark:bg-purple-900 dark:border-purple-700",
      orange:
        "bg-orange-50 border-orange-200 dark:bg-orange-900 dark:border-orange-700",
      yellow:
        "bg-yellow-50 border-yellow-200 dark:bg-yellow-900 dark:border-yellow-700",
      red: "bg-red-50 border-red-200 dark:bg-red-900 dark:border-red-700",
      indigo:
        "bg-indigo-50 border-indigo-200 dark:bg-indigo-900 dark:border-indigo-700",
    };
    return colors[color] || colors.blue;
  };

  const getIconColor = (color) => {
    const colors = {
      blue: "text-blue-600 dark:text-blue-400",
      green: "text-green-600 dark:text-green-400",
      purple: "text-purple-600 dark:text-purple-400",
      orange: "text-orange-600 dark:text-orange-400",
      yellow: "text-yellow-600 dark:text-yellow-400",
      red: "text-red-600 dark:text-red-400",
      indigo: "text-indigo-600 dark:text-indigo-400",
    };
    return colors[color] || colors.blue;
  };

  return (
    <div
      className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 ${className}`}
    >
      {statCards.map((stat, index) => {
        const IconComponent = stat.icon;

        return (
          <div
            key={index}
            className={`relative p-6 rounded-xl border-2 ${getColorClasses(
              stat.color
            )} ${
              stat.alert
                ? "ring-2 ring-red-200 dark:ring-red-800 animate-pulse"
                : ""
            } hover:shadow-lg dark:hover:shadow-xl transition-all duration-200 transform hover:scale-105`}
          >
            {/* أيقونة الحالة */}
            <div className="flex items-center justify-between mb-4">
              <div
                className={`p-3 rounded-full ${
                  stat.color === "red"
                    ? "bg-red-100 dark:bg-red-800"
                    : "bg-white dark:bg-gray-800"
                }`}
              >
                <IconComponent
                  className={`h-6 w-6 ${getIconColor(stat.color)}`}
                />
              </div>

              {/* مؤشر التغيير */}
              {stat.change !== 0 && (
                <div
                  className={`flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${getTrendColor(
                    stat.change
                  )}`}
                >
                  {getTrendIcon(stat.change)}
                  <span>{Math.abs(stat.change).toFixed(1)}%</span>
                </div>
              )}
            </div>

            {/* القيمة الرئيسية */}
            <div className="mb-2">
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-1">
                {stat.value}
              </h3>
              <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
                {stat.title}
              </p>
            </div>

            {/* الوصف */}
            <p className="text-xs text-gray-500 dark:text-gray-400">
              {stat.description}
            </p>

            {/* تنبيه للعناصر الحرجة */}
            {stat.alert && stat.value > 0 && (
              <div className="absolute top-2 right-2 rtl:right-auto rtl:left-2">
                <div className="w-3 h-3 bg-red-500 rounded-full animate-ping"></div>
                <div className="absolute top-0 w-3 h-3 bg-red-500 rounded-full"></div>
              </div>
            )}

            {/* شريط التقدم للطلبات المكتملة */}
            {stat.title.includes(getLocalizedText("completed", "مكتملة")) &&
              statistics.totalOrders > 0 && (
                <div className="mt-3">
                  <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                    <div
                      className="bg-green-600 h-2 rounded-full transition-all duration-500"
                      style={{
                        width: `${Math.min(
                          (statistics.completedOrders /
                            statistics.totalOrders) *
                            100,
                          100
                        )}%`,
                      }}
                    ></div>
                  </div>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    {(
                      (statistics.completedOrders / statistics.totalOrders) *
                      100
                    ).toFixed(1)}
                    % {getLocalizedText("completion_rate", "معدل الإنجاز")}
                  </p>
                </div>
              )}

            {/* مؤشر الأداء للمبيعات */}
            {stat.title.includes(getLocalizedText("sales", "المبيعات")) &&
              statistics.targetAmount && (
                <div className="mt-3">
                  <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                    <div
                      className="bg-green-600 h-2 rounded-full transition-all duration-500"
                      style={{
                        width: `${Math.min(
                          (statistics.totalAmount / statistics.targetAmount) *
                            100,
                          100
                        )}%`,
                      }}
                    ></div>
                  </div>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    {(
                      (statistics.totalAmount / statistics.targetAmount) *
                      100
                    ).toFixed(1)}
                    % {getLocalizedText("of_target", "من الهدف")}
                  </p>
                </div>
              )}
          </div>
        );
      })}
    </div>
  );
};

export default OrdersAdvancedStats;
