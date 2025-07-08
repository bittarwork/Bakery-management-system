import React, { useState, useEffect } from "react";
import toast from "react-hot-toast";
import preferencesAPI from "../services/preferencesAPI.js";

const PreferencesSettings = ({ isOpen, onClose }) => {
  const [preferences, setPreferences] = useState(null);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState("general");
  const [formData, setFormData] = useState({});

  const tabs = [
    { id: "general", name: "الإعدادات العامة", icon: "⚙️" },
    { id: "notifications", name: "الإشعارات", icon: "🔔" },
    { id: "display", name: "العرض", icon: "🖥️" },
    { id: "accessibility", name: "إمكانية الوصول", icon: "♿" },
    { id: "privacy", name: "الخصوصية", icon: "🔒" },
  ];

  useEffect(() => {
    if (isOpen) {
      loadPreferences();
    }
  }, [isOpen]);

  const loadPreferences = async () => {
    setLoading(true);
    try {
      const response = await preferencesAPI.getUserPreferences();
      setPreferences(response.data);
      setFormData(response.data);
    } catch (error) {
      console.error("خطأ في تحميل التفضيلات:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (section) => {
    setSaving(true);
    try {
      let response;
      const sectionData = formData[section];

      switch (section) {
        case "general":
          response = await preferencesAPI.updateGeneralSettings(sectionData);
          break;
        case "notifications":
          response = await preferencesAPI.updateNotificationSettings(
            sectionData
          );
          break;
        case "display":
          response = await preferencesAPI.updateDisplayPreferences(sectionData);
          break;
        case "accessibility":
          response = await preferencesAPI.updateAccessibilitySettings(
            sectionData
          );
          break;
        case "privacy":
          response = await preferencesAPI.updatePrivacySettings(sectionData);
          break;
      }

      if (response.success) {
        toast.success("تم حفظ الإعدادات بنجاح");
        await loadPreferences();
      }
    } catch (error) {
      console.error("خطأ في حفظ الإعدادات:", error);
      toast.error("فشل في حفظ الإعدادات");
    } finally {
      setSaving(false);
    }
  };

  const handleInputChange = (section, field, value) => {
    setFormData((prev) => ({
      ...prev,
      [section]: {
        ...prev[section],
        [field]: value,
      },
    }));
  };

  const handleResetSection = async (section) => {
    if (
      !confirm(
        `هل أنت متأكد من إعادة تعيين إعدادات ${
          tabs.find((t) => t.id === section)?.name
        }؟`
      )
    ) {
      return;
    }

    try {
      setSaving(true);
      await preferencesAPI.resetPreferences(section);
      await loadPreferences();
      toast.success("تم إعادة تعيين الإعدادات بنجاح");
    } catch (error) {
      console.error("خطأ في إعادة تعيين الإعدادات:", error);
      toast.error("فشل في إعادة تعيين الإعدادات");
    } finally {
      setSaving(false);
    }
  };

  const handleExportData = async () => {
    try {
      const response = await preferencesAPI.exportPreferences();
      const blob = new Blob([JSON.stringify(response.data, null, 2)], {
        type: "application/json",
      });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `user-preferences-${
        new Date().toISOString().split("T")[0]
      }.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
      toast.success("تم تصدير البيانات بنجاح");
    } catch (error) {
      console.error("خطأ في تصدير البيانات:", error);
      toast.error("فشل في تصدير البيانات");
    }
  };

  const renderGeneralSettings = () => (
    <div className="space-y-6">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          اللغة
        </label>
        <select
          value={formData.general?.language || "ar"}
          onChange={(e) =>
            handleInputChange("general", "language", e.target.value)
          }
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="ar">العربية</option>
          <option value="en">English</option>
          <option value="fr">Français</option>
          <option value="nl">Nederlands</option>
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          المظهر
        </label>
        <select
          value={formData.general?.theme || "light"}
          onChange={(e) =>
            handleInputChange("general", "theme", e.target.value)
          }
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="light">فاتح</option>
          <option value="dark">داكن</option>
          <option value="auto">تلقائي</option>
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          تنسيق التاريخ
        </label>
        <select
          value={formData.general?.date_format || "DD/MM/YYYY"}
          onChange={(e) =>
            handleInputChange("general", "date_format", e.target.value)
          }
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="DD/MM/YYYY">DD/MM/YYYY</option>
          <option value="MM/DD/YYYY">MM/DD/YYYY</option>
          <option value="YYYY-MM-DD">YYYY-MM-DD</option>
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          تنسيق الوقت
        </label>
        <select
          value={formData.general?.time_format || "24h"}
          onChange={(e) =>
            handleInputChange("general", "time_format", e.target.value)
          }
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="24h">24 ساعة</option>
          <option value="12h">12 ساعة</option>
        </select>
      </div>
    </div>
  );

  const renderNotificationSettings = () => (
    <div className="space-y-4">
      {Object.entries(formData.notifications || {}).map(([key, value]) => (
        <div key={key} className="flex items-center justify-between">
          <span className="text-sm font-medium text-gray-700">
            {key === "email" && "إشعارات البريد الإلكتروني"}
            {key === "push" && "الإشعارات المدفوعة"}
            {key === "sms" && "الرسائل النصية"}
            {key === "orders" && "إشعارات الطلبات"}
            {key === "payments" && "إشعارات المدفوعات"}
            {key === "system" && "إشعارات النظام"}
          </span>
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={value}
              onChange={(e) =>
                handleInputChange("notifications", key, e.target.checked)
              }
              className="sr-only peer"
            />
            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
          </label>
        </div>
      ))}
    </div>
  );

  const renderDisplaySettings = () => (
    <div className="space-y-6">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          عدد العناصر في الصفحة
        </label>
        <input
          type="number"
          min="10"
          max="100"
          value={formData.display?.items_per_page || 20}
          onChange={(e) =>
            handleInputChange(
              "display",
              "items_per_page",
              parseInt(e.target.value)
            )
          }
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          العرض الافتراضي
        </label>
        <select
          value={formData.display?.default_view || "table"}
          onChange={(e) =>
            handleInputChange("display", "default_view", e.target.value)
          }
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="table">جدول</option>
          <option value="grid">شبكة</option>
          <option value="list">قائمة</option>
        </select>
      </div>

      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium text-gray-700">عرض الصور</span>
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={formData.display?.show_images || false}
              onChange={(e) =>
                handleInputChange("display", "show_images", e.target.checked)
              }
              className="sr-only peer"
            />
            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
          </label>
        </div>

        <div className="flex items-center justify-between">
          <span className="text-sm font-medium text-gray-700">
            العرض المضغوط
          </span>
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={formData.display?.compact_mode || false}
              onChange={(e) =>
                handleInputChange("display", "compact_mode", e.target.checked)
              }
              className="sr-only peer"
            />
            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
          </label>
        </div>
      </div>
    </div>
  );

  const renderAccessibilitySettings = () => (
    <div className="space-y-6">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          حجم الخط
        </label>
        <select
          value={formData.accessibility?.font_size || "medium"}
          onChange={(e) =>
            handleInputChange("accessibility", "font_size", e.target.value)
          }
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="small">صغير</option>
          <option value="medium">متوسط</option>
          <option value="large">كبير</option>
          <option value="extra-large">كبير جداً</option>
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          التباين
        </label>
        <select
          value={formData.accessibility?.contrast || "normal"}
          onChange={(e) =>
            handleInputChange("accessibility", "contrast", e.target.value)
          }
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="normal">عادي</option>
          <option value="high">عالي</option>
          <option value="extra-high">عالي جداً</option>
        </select>
      </div>

      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium text-gray-700">
            تقليل الحركة
          </span>
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={formData.accessibility?.reduce_motion || false}
              onChange={(e) =>
                handleInputChange(
                  "accessibility",
                  "reduce_motion",
                  e.target.checked
                )
              }
              className="sr-only peer"
            />
            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
          </label>
        </div>

        <div className="flex items-center justify-between">
          <span className="text-sm font-medium text-gray-700">قارئ الشاشة</span>
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={formData.accessibility?.screen_reader || false}
              onChange={(e) =>
                handleInputChange(
                  "accessibility",
                  "screen_reader",
                  e.target.checked
                )
              }
              className="sr-only peer"
            />
            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
          </label>
        </div>

        <div className="flex items-center justify-between">
          <span className="text-sm font-medium text-gray-700">
            التنقل بلوحة المفاتيح
          </span>
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={formData.accessibility?.keyboard_navigation || false}
              onChange={(e) =>
                handleInputChange(
                  "accessibility",
                  "keyboard_navigation",
                  e.target.checked
                )
              }
              className="sr-only peer"
            />
            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
          </label>
        </div>
      </div>
    </div>
  );

  const renderPrivacySettings = () => (
    <div className="space-y-6">
      <div className="bg-yellow-50 border border-yellow-200 rounded-md p-4 mb-6">
        <div className="flex">
          <svg
            className="h-5 w-5 text-yellow-400"
            fill="currentColor"
            viewBox="0 0 20 20"
          >
            <path
              fillRule="evenodd"
              d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
              clipRule="evenodd"
            />
          </svg>
          <div className="mr-3">
            <h3 className="text-sm font-medium text-yellow-800">
              إعدادات الخصوصية
            </h3>
            <p className="text-sm text-yellow-700 mt-1">
              هذه الإعدادات تؤثر على كيفية جمع واستخدام بياناتك
            </p>
          </div>
        </div>
      </div>

      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <span className="text-sm font-medium text-gray-700">
              مشاركة بيانات الاستخدام
            </span>
            <p className="text-xs text-gray-500">مساعدتنا في تحسين المنتج</p>
          </div>
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={formData.privacy?.usage_analytics || false}
              onChange={(e) =>
                handleInputChange(
                  "privacy",
                  "usage_analytics",
                  e.target.checked
                )
              }
              className="sr-only peer"
            />
            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
          </label>
        </div>

        <div className="flex items-center justify-between">
          <div>
            <span className="text-sm font-medium text-gray-700">
              تتبع النشاط
            </span>
            <p className="text-xs text-gray-500">تتبع نشاطك لتحسين التجربة</p>
          </div>
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={formData.privacy?.activity_tracking || false}
              onChange={(e) =>
                handleInputChange(
                  "privacy",
                  "activity_tracking",
                  e.target.checked
                )
              }
              className="sr-only peer"
            />
            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
          </label>
        </div>

        <div className="flex items-center justify-between">
          <div>
            <span className="text-sm font-medium text-gray-700">
              الإعلانات المخصصة
            </span>
            <p className="text-xs text-gray-500">
              عرض إعلانات مناسبة لاهتماماتك
            </p>
          </div>
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={formData.privacy?.personalized_ads || false}
              onChange={(e) =>
                handleInputChange(
                  "privacy",
                  "personalized_ads",
                  e.target.checked
                )
              }
              className="sr-only peer"
            />
            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
          </label>
        </div>

        <div className="flex items-center justify-between">
          <div>
            <span className="text-sm font-medium text-gray-700">
              مشاركة البيانات مع الشركاء
            </span>
            <p className="text-xs text-gray-500">
              مشاركة بيانات مجهولة مع شركائنا
            </p>
          </div>
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={formData.privacy?.data_sharing || false}
              onChange={(e) =>
                handleInputChange("privacy", "data_sharing", e.target.checked)
              }
              className="sr-only peer"
            />
            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
          </label>
        </div>
      </div>

      <div className="mt-6 pt-6 border-t">
        <button
          onClick={() => handleExportData()}
          className="w-full px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
        >
          تصدير بياناتي
        </button>
        <p className="text-xs text-gray-500 mt-2 text-center">
          احصل على نسخة من جميع بياناتك المحفوظة
        </p>
      </div>
    </div>
  );

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-xl font-bold text-gray-900">إعدادات التفضيلات</h2>
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
            <span className="mr-3">جاري تحميل التفضيلات...</span>
          </div>
        ) : (
          <div className="flex">
            {/* Sidebar */}
            <div className="w-64 bg-gray-50 p-4">
              <nav className="space-y-2">
                {tabs.map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`w-full text-right px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                      activeTab === tab.id
                        ? "bg-blue-100 text-blue-700"
                        : "text-gray-600 hover:bg-gray-100"
                    }`}
                  >
                    <span className="ml-3">{tab.icon}</span>
                    {tab.name}
                  </button>
                ))}
              </nav>
            </div>

            {/* Content */}
            <div className="flex-1 p-6">
              {activeTab === "general" && renderGeneralSettings()}
              {activeTab === "notifications" && renderNotificationSettings()}
              {activeTab === "display" && renderDisplaySettings()}
              {activeTab === "accessibility" && renderAccessibilitySettings()}
              {activeTab === "privacy" && renderPrivacySettings()}

              <div className="mt-6 pt-6 border-t flex justify-between items-center">
                <button
                  onClick={() => handleResetSection(activeTab)}
                  className="px-4 py-2 bg-gray-500 text-white rounded-md hover:bg-gray-600 transition-colors"
                >
                  إعادة تعيين
                </button>
                <button
                  onClick={() => handleSave(activeTab)}
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

export default PreferencesSettings;
