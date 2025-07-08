import React, { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { usePreferences } from "../contexts";
import { useToastContext } from "./common";

const QuickSettings = ({ className = "" }) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);
  const navigate = useNavigate();
  const { preferences, updateSinglePreference, loading } = usePreferences();
  const toast = useToastContext();

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const getThemeIcon = () => {
    const theme = preferences?.general?.theme || "light";

    if (theme === "dark") {
      return (
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
            d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z"
          />
        </svg>
      );
    }

    if (theme === "light") {
      return (
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
            d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z"
          />
        </svg>
      );
    }

    return (
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
          d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
        />
      </svg>
    );
  };

  const getLanguageFlag = () => {
    const language = preferences?.general?.language || "ar";
    switch (language) {
      case "ar":
        return "🇸🇦";
      case "en":
        return "🇺🇸";
      case "fr":
        return "🇫🇷";
      case "nl":
        return "🇳🇱";
      default:
        return "🌐";
    }
  };

  const getLanguageName = () => {
    const language = preferences?.general?.language || "ar";
    switch (language) {
      case "ar":
        return "العربية";
      case "en":
        return "English";
      case "fr":
        return "Français";
      case "nl":
        return "Nederlands";
      default:
        return "اللغة";
    }
  };

  const getThemeName = () => {
    const theme = preferences?.general?.theme || "light";
    switch (theme) {
      case "dark":
        return "داكن";
      case "light":
        return "فاتح";
      case "auto":
        return "تلقائي";
      default:
        return "فاتح";
    }
  };

  const toggleTheme = async () => {
    const currentTheme = preferences?.general?.theme || "light";
    const themes = ["light", "dark", "auto"];
    const currentIndex = themes.indexOf(currentTheme);
    const nextTheme = themes[(currentIndex + 1) % themes.length];

    try {
      const success = await updateSinglePreference("general.theme", nextTheme);
      if (success) {
        toast.success(
          `تم تغيير المظهر إلى ${getThemeNameByValue(nextTheme)} ✨`
        );
      } else {
        toast.error("فشل في تغيير المظهر");
      }
    } catch (error) {
      console.error("Error changing theme:", error);
      toast.error("حدث خطأ أثناء تغيير المظهر");
    }
  };

  const toggleLanguage = async () => {
    const currentLang = preferences?.general?.language || "ar";
    const languages = ["ar", "en"];
    const currentIndex = languages.indexOf(currentLang);
    const nextLang = languages[(currentIndex + 1) % languages.length];

    try {
      const success = await updateSinglePreference(
        "general.language",
        nextLang
      );
      if (success) {
        toast.success(
          `تم تغيير اللغة إلى ${getLanguageNameByValue(nextLang)} 🌍`
        );
      } else {
        toast.error("فشل في تغيير اللغة");
      }
    } catch (error) {
      console.error("Error changing language:", error);
      toast.error("حدث خطأ أثناء تغيير اللغة");
    }
  };

  const getThemeNameByValue = (theme) => {
    switch (theme) {
      case "dark":
        return "داكن";
      case "light":
        return "فاتح";
      case "auto":
        return "تلقائي";
      default:
        return "فاتح";
    }
  };

  const getLanguageNameByValue = (lang) => {
    switch (lang) {
      case "ar":
        return "العربية";
      case "en":
        return "English";
      case "fr":
        return "Français";
      case "nl":
        return "Nederlands";
      default:
        return "اللغة";
    }
  };

  return (
    <div className={`relative ${className}`} ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        disabled={loading}
        className="flex items-center space-x-2 px-3 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors disabled:opacity-50"
        title="الإعدادات السريعة"
      >
        <span className="text-lg">{getLanguageFlag()}</span>
        {getThemeIcon()}
        {loading && (
          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
        )}
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

      {isOpen && (
        <div className="absolute left-0 mt-2 w-80 bg-white rounded-lg shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none z-50">
          <div className="py-2">
            <div className="px-4 py-3 border-b">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-semibold text-gray-900">
                  الإعدادات السريعة
                </h3>
              </div>
            </div>

            {/* Quick Toggle Buttons */}
            <div className="px-4 py-3 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">اللغة:</span>
                <button
                  onClick={toggleLanguage}
                  disabled={loading}
                  className="flex items-center space-x-2 px-3 py-1 bg-blue-50 hover:bg-blue-100 text-blue-700 rounded-md transition-colors disabled:opacity-50"
                >
                  <span className="text-lg">{getLanguageFlag()}</span>
                  <span className="text-sm font-medium">
                    {getLanguageName()}
                  </span>
                  {loading && (
                    <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-blue-600"></div>
                  )}
                </button>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">المظهر:</span>
                <button
                  onClick={toggleTheme}
                  disabled={loading}
                  className="flex items-center space-x-2 px-3 py-1 bg-gray-50 hover:bg-gray-100 text-gray-700 rounded-md transition-colors disabled:opacity-50"
                >
                  {getThemeIcon()}
                  <span className="text-sm font-medium">{getThemeName()}</span>
                  {loading && (
                    <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-gray-600"></div>
                  )}
                </button>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">المنطقة الزمنية:</span>
                <span className="text-sm font-medium text-gray-900">
                  {preferences?.general?.timezone || "Asia/Riyadh"}
                </span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">العملة:</span>
                <span className="text-sm font-medium text-gray-900">
                  {preferences?.general?.currency || "SAR"}
                </span>
              </div>

              {/* إعدادات إمكانية الوصول السريعة */}
              <div className="border-t pt-3 mt-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">التباين العالي:</span>
                  <button
                    onClick={() =>
                      updateSinglePreference(
                        "accessibility.high_contrast",
                        !preferences?.accessibility?.high_contrast
                      )
                    }
                    disabled={loading}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                      preferences?.accessibility?.high_contrast
                        ? "bg-blue-600"
                        : "bg-gray-200"
                    }`}
                  >
                    <span
                      className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                        preferences?.accessibility?.high_contrast
                          ? "translate-x-6"
                          : "translate-x-1"
                      }`}
                    />
                  </button>
                </div>

                <div className="flex items-center justify-between mt-2">
                  <span className="text-sm text-gray-600">النص الكبير:</span>
                  <button
                    onClick={() =>
                      updateSinglePreference(
                        "accessibility.large_text",
                        !preferences?.accessibility?.large_text
                      )
                    }
                    disabled={loading}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                      preferences?.accessibility?.large_text
                        ? "bg-blue-600"
                        : "bg-gray-200"
                    }`}
                  >
                    <span
                      className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                        preferences?.accessibility?.large_text
                          ? "translate-x-6"
                          : "translate-x-1"
                      }`}
                    />
                  </button>
                </div>
              </div>
            </div>

            <div className="px-4 py-3 border-t bg-gray-50 rounded-b-lg">
              <div className="flex space-x-2">
                <button
                  onClick={() => {
                    navigate("/settings");
                    setIsOpen(false);
                  }}
                  className="flex-1 px-3 py-2 bg-blue-600 text-white text-sm font-medium rounded-md hover:bg-blue-700 transition-colors text-center"
                >
                  جميع الإعدادات
                </button>
                <button
                  onClick={() => setIsOpen(false)}
                  className="px-3 py-2 bg-gray-200 text-gray-700 text-sm font-medium rounded-md hover:bg-gray-300 transition-colors"
                >
                  إغلاق
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default QuickSettings;
