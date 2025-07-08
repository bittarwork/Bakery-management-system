import React, { useState, useEffect, useMemo } from "react";
import PreferencesSettings from "../../components/PreferencesSettings";
import EnhancedSessionManager from "../../components/EnhancedSessionManager";
import { usePreferences } from "../../contexts/PreferencesContext";

const UserSettings = () => {
  const [activeTab, setActiveTab] = useState("preferences");
  const [preferencesModalOpen, setPreferencesModalOpen] = useState(false);
  const [sessionManagerOpen, setSessionManagerOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  // استخدام context التفضيلات للحصول على البيانات الحية
  const {
    preferences,
    updatePreferences,
    reloadPreferences,
    loading: preferencesLoading,
  } = usePreferences();

  // وظائف مساعدة للترجمة والتنسيق
  const getLanguageDisplayName = (lang) => {
    const languageMap = {
      ar: "العربية",
      en: "English",
      fr: "Français",
      nl: "Nederlands",
    };
    return languageMap[lang] || "العربية";
  };

  const getThemeDisplayName = (theme) => {
    const themeMap = {
      light: "فاتح",
      dark: "داكن",
      auto: "تلقائي",
    };
    return themeMap[theme] || "تلقائي";
  };

  // تحديد اتجاه النص حسب اللغة
  const getCurrentDirection = () => {
    const language = preferences?.general?.language || "ar";
    return language === "ar" ? "rtl" : "ltr";
  };

  const getTextSizeClass = () => {
    if (preferences?.accessibility?.large_text) {
      return "text-lg";
    }
    return "text-base";
  };

  const getContrastClasses = () => {
    if (preferences?.accessibility?.high_contrast) {
      return "ring-2 ring-blue-300 dark:ring-blue-600";
    }
    return "";
  };

  // نصوص تدعم تعدد اللغات
  const getLocalizedText = (key) => {
    const language = preferences?.general?.language || "ar";
    const texts = {
      ar: {
        userSettings: "إعدادات المستخدم",
        managePreferences: "إدارة تفضيلاتك وإعدادات النظام",
        preferences: "التفضيلات",
        profile: "الملف الشخصي",
        quickInfo: "معلومات سريعة",
        generalSettings: "الإعدادات العامة",
        notifications: "الإشعارات",
        language: "اللغة",
        theme: "المظهر",
        enabled: "مفعل",
        disabled: "معطل",
      },
      en: {
        userSettings: "User Settings",
        managePreferences: "Manage your preferences and system settings",
        preferences: "Preferences",
        profile: "Profile",
        quickInfo: "Quick Info",
        generalSettings: "General Settings",
        notifications: "Notifications",
        language: "Language",
        theme: "Theme",
        enabled: "Enabled",
        disabled: "Disabled",
      },
    };
    return texts[language]?.[key] || texts.ar[key];
  };

  // تعريف التبويبات
  const tabs = useMemo(
    () => [
      {
        id: "preferences",
        name: getLocalizedText("preferences"),
        description: "إدارة التفضيلات العامة",
        icon: "⚙️",
        color: "blue",
      },
      {
        id: "profile",
        name: getLocalizedText("profile"),
        description: "إعدادات الملف الشخصي",
        icon: "👤",
        color: "purple",
      },
    ],
    [preferences?.general?.language]
  );

  // إنشاء تفضيلات افتراضية إذا لم تكن موجودة
  const defaultPreferences = {
    general: {
      language: "ar",
      theme: "light",
      timezone: "Asia/Riyadh",
      currency: "SAR",
    },
    notifications: {
      system: true,
      email: true,
    },
    accessibility: {
      high_contrast: false,
      large_text: false,
    },
  };

  const currentPreferences = preferences || defaultPreferences;

  const handlePreferencesUpdate = async (newPreferences) => {
    if (updatePreferences) {
      await updatePreferences(newPreferences);
    }
  };

  // بيانات وهمية للاختبار
  const testData = {
    activeSessions: 1,
    lastLogin: new Date().toLocaleDateString("ar-SA"),
  };

  return (
    <div
      className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-300"
      dir={getCurrentDirection()}
    >
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="py-8">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <h1
                  className={`text-3xl font-bold text-gray-900 dark:text-gray-100 ${getTextSizeClass()}`}
                >
                  {getLocalizedText("userSettings")}
                </h1>
                <p
                  className={`mt-2 text-sm text-gray-500 dark:text-gray-400 ${getTextSizeClass()}`}
                >
                  {getLocalizedText("managePreferences")}
                </p>
              </div>

              <div className="flex items-center gap-2">
                <div className="flex items-center px-3 py-2 bg-purple-100 dark:bg-purple-900/20 rounded-lg">
                  <div className="h-2 w-2 bg-purple-400 rounded-full mr-2"></div>
                  <span
                    className={`text-sm text-purple-600 dark:text-purple-400 font-medium ${getTextSizeClass()}`}
                  >
                    {getThemeDisplayName(currentPreferences?.general?.theme)}
                  </span>
                </div>

                <div className="flex items-center px-3 py-2 bg-orange-100 dark:bg-orange-900/20 rounded-lg">
                  <div className="h-2 w-2 bg-orange-400 rounded-full mr-2"></div>
                  <span
                    className={`text-sm text-orange-600 dark:text-orange-400 font-medium ${getTextSizeClass()}`}
                  >
                    {getLanguageDisplayName(
                      currentPreferences?.general?.language
                    )}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="lg:grid lg:grid-cols-12 lg:gap-8">
          {/* Quick Info Card */}
          <div className="lg:col-span-3 mb-8 lg:mb-0">
            <div
              className={`bg-gradient-to-br from-indigo-50 to-purple-50 dark:from-indigo-900/20 dark:to-purple-900/20 rounded-xl p-6 border border-indigo-100 dark:border-indigo-800 ${getContrastClasses()}`}
            >
              <div className="flex items-center justify-between mb-4">
                <h3
                  className={`font-semibold text-indigo-900 dark:text-indigo-100 ${getTextSizeClass()}`}
                >
                  {getLocalizedText("quickInfo")}
                </h3>
                <div className="h-3 w-3 bg-green-400 rounded-full animate-pulse"></div>
              </div>

              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span
                    className={`text-sm text-indigo-700 dark:text-indigo-300 ${getTextSizeClass()}`}
                  >
                    {getLocalizedText("language")}:
                  </span>
                  <span
                    className={`font-medium text-indigo-900 dark:text-indigo-100 ${getTextSizeClass()}`}
                  >
                    {getLanguageDisplayName(
                      currentPreferences?.general?.language
                    )}
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <span
                    className={`text-sm text-indigo-700 dark:text-indigo-300 ${getTextSizeClass()}`}
                  >
                    {getLocalizedText("theme")}:
                  </span>
                  <span
                    className={`font-medium text-indigo-900 dark:text-indigo-100 ${getTextSizeClass()}`}
                  >
                    {getThemeDisplayName(currentPreferences?.general?.theme)}
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <span
                    className={`text-sm text-indigo-700 dark:text-indigo-300 ${getTextSizeClass()}`}
                  >
                    الجلسات النشطة:
                  </span>
                  <span
                    className={`font-medium text-indigo-900 dark:text-indigo-100 ${getTextSizeClass()}`}
                  >
                    {testData.activeSessions}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-9">
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
              {/* Sidebar */}
              <div className="lg:col-span-1">
                <div
                  className={`bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 ${getContrastClasses()}`}
                >
                  <nav className="space-y-2">
                    {tabs.map((tab) => {
                      const isActive = activeTab === tab.id;
                      const getTabColors = () => {
                        if (isActive) {
                          switch (tab.color) {
                            case "blue":
                              return "bg-gradient-to-r from-blue-50 to-blue-100 dark:from-blue-900/30 dark:to-blue-800/30 text-blue-700 dark:text-blue-300 border-l-4 border-blue-500";
                            case "purple":
                              return "bg-gradient-to-r from-purple-50 to-purple-100 dark:from-purple-900/30 dark:to-purple-800/30 text-purple-700 dark:text-purple-300 border-l-4 border-purple-500";
                            default:
                              return "bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-900/30 dark:to-gray-800/30 text-gray-700 dark:text-gray-300 border-l-4 border-gray-500";
                          }
                        }
                        return "text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700 hover:text-gray-900 dark:hover:text-gray-200";
                      };

                      const getIndicatorColor = () => {
                        switch (tab.color) {
                          case "blue":
                            return "bg-blue-500";
                          case "purple":
                            return "bg-purple-500";
                          default:
                            return "bg-gray-500";
                        }
                      };

                      return (
                        <button
                          key={tab.id}
                          onClick={() => setActiveTab(tab.id)}
                          className={`w-full flex items-center ${
                            getCurrentDirection() === "rtl"
                              ? "text-right"
                              : "text-left"
                          } px-4 py-3 rounded-lg transition-all duration-200 ${getTextSizeClass()} ${getTabColors()} ${
                            isActive ? "shadow-md" : ""
                          }`}
                        >
                          <span className="text-2xl mr-3">{tab.icon}</span>
                          <div className="flex-1">
                            <div className="font-medium">{tab.name}</div>
                            <div className="text-xs opacity-75 mt-1">
                              {tab.description}
                            </div>
                          </div>
                          {isActive && (
                            <div
                              className={`w-2 h-2 ${getIndicatorColor()} rounded-full animate-pulse`}
                            ></div>
                          )}
                        </button>
                      );
                    })}
                  </nav>
                </div>
              </div>

              {/* Content Area */}
              <div className="lg:col-span-3">
                {activeTab === "preferences" && (
                  <div className="space-y-8">
                    <div
                      className={`bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 ${getContrastClasses()}`}
                    >
                      <div className="flex items-center justify-between mb-6">
                        <div>
                          <h3
                            className={`text-xl font-bold text-gray-900 dark:text-gray-100 ${getTextSizeClass()}`}
                          >
                            {getLocalizedText("generalSettings")}
                          </h3>
                          <p
                            className={`text-gray-600 dark:text-gray-400 ${getTextSizeClass()}`}
                          >
                            اللغة والمظهر والتنسيق
                          </p>
                        </div>
                        <button
                          onClick={() => setPreferencesModalOpen(true)}
                          className={`inline-flex items-center px-4 py-2 bg-blue-500 hover:bg-blue-600 dark:bg-blue-600 dark:hover:bg-blue-700 text-white rounded-lg transition-colors ${getTextSizeClass()}`}
                        >
                          <svg
                            className="h-4 w-4 mr-2"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                            />
                          </svg>
                          تحرير الإعدادات
                        </button>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                          <label
                            className={`font-medium text-gray-700 dark:text-gray-300 ${getTextSizeClass()}`}
                          >
                            {getLocalizedText("language")}
                          </label>
                          <div
                            className={`p-3 bg-gray-50 dark:bg-gray-700 rounded-lg ${getTextSizeClass()}`}
                          >
                            <div className="flex items-center justify-between">
                              <span>
                                {getLanguageDisplayName(
                                  currentPreferences?.general?.language
                                )}
                              </span>
                              <span
                                className={`text-2xl ${
                                  currentPreferences?.general?.language === "ar"
                                    ? "🇸🇦"
                                    : currentPreferences?.general?.language ===
                                      "en"
                                    ? "🇺🇸"
                                    : currentPreferences?.general?.language ===
                                      "fr"
                                    ? "🇫🇷"
                                    : "🇳🇱"
                                }`}
                              ></span>
                            </div>
                          </div>
                        </div>

                        <div className="space-y-2">
                          <label
                            className={`font-medium text-gray-700 dark:text-gray-300 ${getTextSizeClass()}`}
                          >
                            {getLocalizedText("theme")}
                          </label>
                          <div
                            className={`p-3 bg-gray-50 dark:bg-gray-700 rounded-lg ${getTextSizeClass()}`}
                          >
                            <div className="flex items-center justify-between">
                              <span>
                                {getThemeDisplayName(
                                  currentPreferences?.general?.theme
                                )}
                              </span>
                              <span
                                className={`text-xl ${
                                  currentPreferences?.general?.theme === "light"
                                    ? "☀️"
                                    : currentPreferences?.general?.theme ===
                                      "dark"
                                    ? "🌙"
                                    : "🔄"
                                }`}
                              ></span>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* معلومات النظام */}
                      <div className="mt-8">
                        <h4
                          className={`text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4 ${getTextSizeClass()}`}
                        >
                          معلومات النظام
                        </h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                            <div className="flex items-center justify-between">
                              <span className="text-sm text-gray-600 dark:text-gray-400">
                                آخر تسجيل دخول:
                              </span>
                              <span className="font-medium text-gray-900 dark:text-gray-100">
                                {testData.lastLogin}
                              </span>
                            </div>
                          </div>

                          <div className="p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                            <div className="flex items-center justify-between">
                              <span className="text-sm text-gray-600 dark:text-gray-400">
                                الجلسات النشطة:
                              </span>
                              <span className="font-medium text-gray-900 dark:text-gray-100 flex items-center">
                                <div className="h-2 w-2 bg-green-400 rounded-full mr-2"></div>
                                {testData.activeSessions}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {activeTab === "profile" && (
                  <div className="space-y-8">
                    <div
                      className={`bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 text-center ${getContrastClasses()}`}
                    >
                      <div className="h-20 w-20 bg-gradient-to-br from-purple-400 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-4">
                        <span className="text-white text-2xl">👤</span>
                      </div>
                      <h3
                        className={`text-xl font-bold text-gray-900 dark:text-gray-100 mb-2 ${getTextSizeClass()}`}
                      >
                        الملف الشخصي
                      </h3>
                      <p
                        className={`text-gray-600 dark:text-gray-400 mb-6 ${getTextSizeClass()}`}
                      >
                        قريباً - سيتم إضافة إدارة الملف الشخصي
                      </p>
                      <div className="inline-flex items-center px-4 py-2 bg-purple-100 dark:bg-purple-900/20 text-purple-800 dark:text-purple-300 rounded-lg">
                        <span className="text-sm">🚧 قيد التطوير</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Modals */}
      <PreferencesSettings
        isOpen={preferencesModalOpen}
        onClose={() => {
          setPreferencesModalOpen(false);
        }}
        userPreferences={currentPreferences}
        onUpdate={async (newPreferences) => {
          await handlePreferencesUpdate(newPreferences);
          setPreferencesModalOpen(false);
        }}
      />

      <EnhancedSessionManager
        isOpen={sessionManagerOpen}
        onClose={() => setSessionManagerOpen(false)}
      />
    </div>
  );
};

export default UserSettings;
