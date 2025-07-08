import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import preferencesAPI from "../../services/preferencesAPI";
import sessionAPI from "../../services/sessionAPI";
import { useToastContext } from "../../components/common";

const EnhancedDashboard = () => {
  const navigate = useNavigate();
  const toast = useToastContext();
  const [preferences, setPreferences] = useState(null);
  const [dashboardData, setDashboardData] = useState({
    orders: 0,
    products: 0,
    revenue: 0,
    stores: 0,
  });
  const [sessionInfo, setSessionInfo] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      const [preferencesResponse, sessionResponse] = await Promise.all([
        preferencesAPI.getUserPreferences(),
        sessionAPI.getActiveSessions(),
      ]);

      setPreferences(preferencesResponse.data);

      // تحديد الجلسة الحالية
      const currentSession = sessionResponse.data?.find((s) => s.is_current);
      setSessionInfo(currentSession);

      // محاكاة تحميل بيانات Dashboard
      setTimeout(() => {
        setDashboardData({
          orders: 142,
          products: 89,
          revenue: 12547,
          stores: 23,
        });
      }, 1000);
    } catch (error) {
      console.error("خطأ في تحميل بيانات Dashboard:", error);
    } finally {
      setLoading(false);
    }
  };

  const getWidgetsByPreference = () => {
    if (!preferences?.dashboard?.widgets) {
      return ["orders", "products", "payments", "reports"];
    }
    return preferences.dashboard.widgets;
  };

  const getColumnCount = () => {
    return preferences?.dashboard?.columns || 2;
  };

  const isCompactView = () => {
    return preferences?.dashboard?.compact || false;
  };

  const formatCurrency = (amount) => {
    const currency = preferences?.general?.currency || "EUR";
    return new Intl.NumberFormat("en-GB", {
      style: "currency",
      currency: currency,
    }).format(amount);
  };

  const formatDate = (date) => {
    const format = preferences?.general?.date_format || "DD/MM/YYYY";
    const timeFormat = preferences?.general?.time_format || "24h";

    const options = {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      hour12: timeFormat === "12h",
    };

    return new Date(date).toLocaleString("en-GB", options);
  };

  const getThemeClasses = () => {
    const theme = preferences?.general?.theme || "light";
    return {
      background: theme === "dark" ? "bg-gray-900" : "bg-gray-50",
      card:
        theme === "dark" ? "bg-gray-800 text-white" : "bg-white text-gray-900",
      text: theme === "dark" ? "text-gray-100" : "text-gray-900",
      subtext: theme === "dark" ? "text-gray-400" : "text-gray-600",
    };
  };

  const renderWidget = (widgetType) => {
    const themes = getThemeClasses();
    const compact = isCompactView();

    const widgetConfigs = {
      orders: {
        title: "الطلبات",
        value: dashboardData.orders,
        icon: (
          <svg
            className="h-8 w-8 text-blue-600"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
            />
          </svg>
        ),
        trend: "+12%",
        trendColor: "text-green-600",
      },
      products: {
        title: "المنتجات",
        value: dashboardData.products,
        icon: (
          <svg
            className="h-8 w-8 text-purple-600"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"
            />
          </svg>
        ),
        trend: "+5%",
        trendColor: "text-green-600",
      },
      payments: {
        title: "الإيرادات",
        value: formatCurrency(dashboardData.revenue),
        icon: (
          <svg
            className="h-8 w-8 text-green-600"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1"
            />
          </svg>
        ),
        trend: "+23%",
        trendColor: "text-green-600",
      },
      reports: {
        title: "التقارير",
        value: "15",
        icon: (
          <svg
            className="h-8 w-8 text-orange-600"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
            />
          </svg>
        ),
        trend: "+8%",
        trendColor: "text-green-600",
      },
      stores: {
        title: "المتاجر",
        value: dashboardData.stores,
        icon: (
          <svg
            className="h-8 w-8 text-red-600"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
            />
          </svg>
        ),
        trend: "+3%",
        trendColor: "text-green-600",
      },
      analytics: {
        title: "التحليلات",
        value: "94%",
        icon: (
          <svg
            className="h-8 w-8 text-indigo-600"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M16 8v8m-4-5v5m-4-2v2m-2 4h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
            />
          </svg>
        ),
        trend: "+15%",
        trendColor: "text-green-600",
      },
    };

    const config = widgetConfigs[widgetType];
    if (!config) return null;

    return (
      <div
        key={widgetType}
        className={`${themes.card} rounded-lg shadow ${
          compact ? "p-4" : "p-6"
        } cursor-pointer hover:shadow-lg transition-shadow`}
        onClick={() => {
          switch (widgetType) {
            case "orders":
              navigate("/orders");
              break;
            case "products":
              navigate("/products");
              break;
            case "payments":
              navigate("/payments");
              break;
            case "reports":
              navigate("/reports");
              break;
            case "stores":
              navigate("/stores");
              break;
            default:
              break;
          }
        }}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            {config.icon}
            <div className={`${compact ? "mr-2" : "mr-4"}`}>
              <p
                className={`${compact ? "text-sm" : "text-lg"} font-medium ${
                  themes.text
                }`}
              >
                {config.title}
              </p>
              <p
                className={`${compact ? "text-lg" : "text-2xl"} font-bold ${
                  themes.text
                }`}
              >
                {config.value}
              </p>
            </div>
          </div>
          <div className="text-left">
            <span className={`text-sm font-medium ${config.trendColor}`}>
              {config.trend}
            </span>
            <p className={`text-xs ${themes.subtext}`}>من الشهر الماضي</p>
          </div>
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">جاري تحميل لوحة التحكم...</p>
        </div>
      </div>
    );
  }

  const themes = getThemeClasses();
  const widgets = getWidgetsByPreference();
  const columns = getColumnCount();

  return (
    <div className={`min-h-screen ${themes.background}`}>
      {/* Header */}
      <div className={`${themes.card} shadow`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="py-6">
            <div className="flex items-center justify-between">
              <div>
                <h1 className={`text-3xl font-bold ${themes.text}`}>
                  لوحة التحكم المخصصة
                </h1>
                <p className={`mt-1 text-sm ${themes.subtext}`}>
                  مرحباً، عرض مخصص حسب تفضيلاتك
                </p>
              </div>
              <div className="flex items-center gap-4">
                {sessionInfo && (
                  <div className={`text-sm ${themes.subtext}`}>
                    آخر نشاط: {formatDate(sessionInfo.last_activity)}
                  </div>
                )}
                <div
                  className={`px-3 py-1 rounded-full text-xs font-medium ${
                    preferences?.general?.theme === "dark"
                      ? "bg-gray-700 text-gray-300"
                      : "bg-gray-100 text-gray-600"
                  }`}
                >
                  {preferences?.general?.language === "ar"
                    ? "العربية"
                    : preferences?.general?.language === "en"
                    ? "English"
                    : preferences?.general?.language === "fr"
                    ? "Français"
                    : "Nederlands"}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Dashboard Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Widgets Grid */}
        <div
          className={`grid grid-cols-1 md:grid-cols-${columns} xl:grid-cols-${Math.min(
            columns * 2,
            4
          )} gap-6 mb-8`}
        >
          {widgets.map((widget) => renderWidget(widget))}
        </div>

        {/* Quick Actions */}
        <div className={`${themes.card} rounded-lg shadow p-6 mb-8`}>
          <h3 className={`text-lg font-medium ${themes.text} mb-4`}>
            العمليات السريعة
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <button
              onClick={() => navigate("/products/new")}
              className="flex flex-col items-center p-4 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors"
            >
              <svg
                className="h-8 w-8 text-blue-600 mb-2"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                />
              </svg>
              <span className="text-sm font-medium text-blue-700">
                إضافة منتج
              </span>
            </button>

            <button
              onClick={() => navigate("/orders/new")}
              className="flex flex-col items-center p-4 bg-green-50 hover:bg-green-100 rounded-lg transition-colors"
            >
              <svg
                className="h-8 w-8 text-green-600 mb-2"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                />
              </svg>
              <span className="text-sm font-medium text-green-700">
                إضافة طلب
              </span>
            </button>

            <button
              onClick={() => navigate("/stores/new")}
              className="flex flex-col items-center p-4 bg-purple-50 hover:bg-purple-100 rounded-lg transition-colors"
            >
              <svg
                className="h-8 w-8 text-purple-600 mb-2"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
                />
              </svg>
              <span className="text-sm font-medium text-purple-700">
                إضافة متجر
              </span>
            </button>

            <button
              onClick={() => navigate("/reports")}
              className="flex flex-col items-center p-4 bg-orange-50 hover:bg-orange-100 rounded-lg transition-colors"
            >
              <svg
                className="h-8 w-8 text-orange-600 mb-2"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                />
              </svg>
              <span className="text-sm font-medium text-orange-700">
                عرض التقارير
              </span>
            </button>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className={`${themes.card} rounded-lg shadow p-6`}>
            <h3 className={`text-lg font-medium ${themes.text} mb-4`}>
              الطلبات الأخيرة
            </h3>
            <div className="space-y-3">
              {[1, 2, 3].map((item) => (
                <div
                  key={item}
                  className="flex items-center justify-between p-3 border rounded-lg"
                >
                  <div>
                    <p className={`font-medium ${themes.text}`}>
                      طلب #{1000 + item}
                    </p>
                    <p className={`text-sm ${themes.subtext}`}>
                      {formatDate(new Date(Date.now() - item * 1000 * 60 * 60))}
                    </p>
                  </div>
                  <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">
                    مكتمل
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div className={`${themes.card} rounded-lg shadow p-6`}>
            <h3 className={`text-lg font-medium ${themes.text} mb-4`}>
              الإحصائيات السريعة
            </h3>
            <div className="space-y-4">
              <div className="flex justify-between">
                <span className={themes.subtext}>معدل النمو</span>
                <span className={`font-bold ${themes.text}`}>+18.2%</span>
              </div>
              <div className="flex justify-between">
                <span className={themes.subtext}>المبيعات اليوم</span>
                <span className={`font-bold ${themes.text}`}>
                  {formatCurrency(2340)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className={themes.subtext}>الطلبات المعلقة</span>
                <span className={`font-bold ${themes.text}`}>7</span>
              </div>
              <div className="flex justify-between">
                <span className={themes.subtext}>رضا العملاء</span>
                <span className={`font-bold text-green-600`}>96%</span>
              </div>
            </div>
          </div>
        </div>

        {/* Customization Hint */}
        <div className="mt-8 p-4 bg-blue-50 rounded-lg">
          <div className="flex items-center">
            <svg
              className="h-5 w-5 text-blue-600"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            <p className="mr-3 text-sm text-blue-800">
              يمكنك تخصيص هذه اللوحة من خلال
              <a
                href="/settings"
                className="font-medium underline hover:no-underline"
              >
                {" "}
                إعدادات التفضيلات
              </a>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EnhancedDashboard;
