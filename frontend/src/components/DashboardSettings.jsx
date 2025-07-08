import React, { useState, useEffect } from "react";
import toast from "react-hot-toast";
import preferencesAPI from "../services/preferencesAPI";

const DashboardSettings = ({ isOpen, onClose, onLayoutChange }) => {
  const [dashboardLayout, setDashboardLayout] = useState({
    widgets: ["orders", "products", "payments", "reports"],
    columns: 2,
    compact: false,
  });
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  const availableWidgets = [
    {
      id: "orders",
      name: "الطلبات",
      icon: "📋",
      description: "عرض آخر الطلبات والإحصائيات",
    },
    {
      id: "products",
      name: "المنتجات",
      icon: "🥖",
      description: "إدارة المنتجات والمخزون",
    },
    {
      id: "payments",
      name: "المدفوعات",
      icon: "💰",
      description: "تتبع المدفوعات والإيرادات",
    },
    {
      id: "reports",
      name: "التقارير",
      icon: "📊",
      description: "تقارير الأداء والمبيعات",
    },
    {
      id: "stores",
      name: "المتاجر",
      icon: "🏪",
      description: "إدارة الفروع والمتاجر",
    },
    {
      id: "analytics",
      name: "التحليلات",
      icon: "📈",
      description: "تحليلات مفصلة للبيانات",
    },
  ];

  useEffect(() => {
    if (isOpen) {
      loadDashboardLayout();
    }
  }, [isOpen]);

  const loadDashboardLayout = async () => {
    setLoading(true);
    try {
      const response = await preferencesAPI.getUserPreferences();
      if (response.data?.dashboard) {
        setDashboardLayout(response.data.dashboard);
      }
    } catch (error) {
      console.error("خطأ في تحميل إعدادات الداشبورد:", error);
      toast.error("فشل في تحميل إعدادات الداشبورد");
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const response = await preferencesAPI.updateDashboardLayout(
        dashboardLayout
      );
      if (response.success) {
        toast.success("تم حفظ إعدادات الداشبورد بنجاح");
        if (onLayoutChange) {
          onLayoutChange(dashboardLayout);
        }
        onClose();
      }
    } catch (error) {
      console.error("خطأ في حفظ إعدادات الداشبورد:", error);
      toast.error("فشل في حفظ إعدادات الداشبورد");
    } finally {
      setSaving(false);
    }
  };

  const toggleWidget = (widgetId) => {
    setDashboardLayout((prev) => ({
      ...prev,
      widgets: prev.widgets.includes(widgetId)
        ? prev.widgets.filter((id) => id !== widgetId)
        : [...prev.widgets, widgetId],
    }));
  };

  const moveWidget = (widgetId, direction) => {
    setDashboardLayout((prev) => {
      const widgets = [...prev.widgets];
      const currentIndex = widgets.indexOf(widgetId);
      const newIndex = direction === "up" ? currentIndex - 1 : currentIndex + 1;

      if (newIndex >= 0 && newIndex < widgets.length) {
        [widgets[currentIndex], widgets[newIndex]] = [
          widgets[newIndex],
          widgets[currentIndex],
        ];
      }

      return { ...prev, widgets };
    });
  };

  const resetToDefault = () => {
    if (
      confirm("هل أنت متأكد من إعادة تعيين الداشبورد للإعدادات الافتراضية؟")
    ) {
      setDashboardLayout({
        widgets: ["orders", "products", "payments", "reports"],
        columns: 2,
        compact: false,
      });
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-xl font-bold text-gray-900">
            إعدادات لوحة التحكم
          </h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <svg
              className="h-5 w-5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <span className="mr-3">جاري تحميل الإعدادات...</span>
          </div>
        ) : (
          <div className="p-6">
            {/* Layout Settings */}
            <div className="mb-8">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                إعدادات التخطيط
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    عدد الأعمدة
                  </label>
                  <select
                    value={dashboardLayout.columns}
                    onChange={(e) =>
                      setDashboardLayout((prev) => ({
                        ...prev,
                        columns: parseInt(e.target.value),
                      }))
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value={1}>عمود واحد</option>
                    <option value={2}>عمودان</option>
                    <option value={3}>ثلاثة أعمدة</option>
                    <option value={4}>أربعة أعمدة</option>
                  </select>
                </div>

                <div className="flex items-center">
                  <label className="flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={dashboardLayout.compact}
                      onChange={(e) =>
                        setDashboardLayout((prev) => ({
                          ...prev,
                          compact: e.target.checked,
                        }))
                      }
                      className="sr-only peer"
                    />
                    <div className="relative w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                    <span className="mr-3 text-sm font-medium text-gray-700">
                      العرض المضغوط
                    </span>
                  </label>
                </div>
              </div>
            </div>

            {/* Widget Selection */}
            <div className="mb-8">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                اختيار الأدوات
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {availableWidgets.map((widget) => (
                  <div
                    key={widget.id}
                    className={`p-4 border-2 rounded-lg transition-colors ${
                      dashboardLayout.widgets.includes(widget.id)
                        ? "border-blue-500 bg-blue-50"
                        : "border-gray-200 hover:border-gray-300"
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex items-start space-x-3">
                        <span className="text-2xl">{widget.icon}</span>
                        <div>
                          <h4 className="font-medium text-gray-900">
                            {widget.name}
                          </h4>
                          <p className="text-sm text-gray-500">
                            {widget.description}
                          </p>
                        </div>
                      </div>
                      <button
                        onClick={() => toggleWidget(widget.id)}
                        className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${
                          dashboardLayout.widgets.includes(widget.id)
                            ? "bg-blue-600 text-white hover:bg-blue-700"
                            : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                        }`}
                      >
                        {dashboardLayout.widgets.includes(widget.id)
                          ? "إزالة"
                          : "إضافة"}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Widget Order */}
            {dashboardLayout.widgets.length > 0 && (
              <div className="mb-8">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  ترتيب الأدوات
                </h3>

                <div className="space-y-2">
                  {dashboardLayout.widgets.map((widgetId, index) => {
                    const widget = availableWidgets.find(
                      (w) => w.id === widgetId
                    );
                    return (
                      <div
                        key={widgetId}
                        className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                      >
                        <div className="flex items-center space-x-3">
                          <span className="text-lg">{widget?.icon}</span>
                          <span className="font-medium">{widget?.name}</span>
                          <span className="text-sm text-gray-500">
                            #{index + 1}
                          </span>
                        </div>
                        <div className="flex space-x-2">
                          <button
                            onClick={() => moveWidget(widgetId, "up")}
                            disabled={index === 0}
                            className="p-1 text-gray-400 hover:text-gray-600 disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            <svg
                              className="h-4 w-4"
                              fill="none"
                              viewBox="0 0 24 24"
                              stroke="currentColor"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M5 15l7-7 7 7"
                              />
                            </svg>
                          </button>
                          <button
                            onClick={() => moveWidget(widgetId, "down")}
                            disabled={
                              index === dashboardLayout.widgets.length - 1
                            }
                            className="p-1 text-gray-400 hover:text-gray-600 disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            <svg
                              className="h-4 w-4"
                              fill="none"
                              viewBox="0 0 24 24"
                              stroke="currentColor"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M19 9l-7 7-7-7"
                              />
                            </svg>
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Preview */}
            <div className="mb-8">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                معاينة التخطيط
              </h3>

              <div
                className={`grid gap-4 p-4 bg-gray-100 rounded-lg ${
                  dashboardLayout.columns === 1
                    ? "grid-cols-1"
                    : dashboardLayout.columns === 2
                    ? "grid-cols-2"
                    : dashboardLayout.columns === 3
                    ? "grid-cols-3"
                    : "grid-cols-4"
                }`}
              >
                {dashboardLayout.widgets.map((widgetId) => {
                  const widget = availableWidgets.find(
                    (w) => w.id === widgetId
                  );
                  return (
                    <div
                      key={widgetId}
                      className={`bg-white rounded-lg border-2 border-dashed border-gray-300 flex items-center justify-center ${
                        dashboardLayout.compact ? "h-20" : "h-32"
                      }`}
                    >
                      <div className="text-center">
                        <span className="text-2xl">{widget?.icon}</span>
                        <p className="text-sm font-medium text-gray-600 mt-1">
                          {widget?.name}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Actions */}
            <div className="flex justify-between items-center pt-6 border-t">
              <button
                onClick={resetToDefault}
                className="px-4 py-2 bg-gray-500 text-white rounded-md hover:bg-gray-600 transition-colors"
              >
                إعادة تعيين
              </button>

              <div className="flex space-x-3">
                <button
                  onClick={onClose}
                  className="px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400 transition-colors"
                >
                  إلغاء
                </button>
                <button
                  onClick={handleSave}
                  disabled={saving}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors disabled:opacity-50"
                >
                  {saving ? "جاري الحفظ..." : "حفظ الإعدادات"}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default DashboardSettings;
