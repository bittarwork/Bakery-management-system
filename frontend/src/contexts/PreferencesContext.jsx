import React, { createContext, useContext, useState, useEffect } from "react";
import preferencesAPI from "../services/preferencesAPI";

const PreferencesContext = createContext();

export const PreferencesProvider = ({
  children,
  initialPreferences,
  onPreferencesUpdate,
  toast = null,
}) => {
  const [preferences, setPreferences] = useState(initialPreferences || null);
  const [loading, setLoading] = useState(false);

  // تطبيق التفضيلات على DOM فوراً
  const applyPreferences = (newPreferences) => {
    if (!newPreferences) return;

    // تطبيق المظهر
    const theme = newPreferences.general?.theme || "light";
    const root = document.documentElement;

    if (theme === "dark") {
      root.classList.add("dark");
    } else if (theme === "light") {
      root.classList.remove("dark");
    } else {
      // Auto theme
      const isDarkMode = window.matchMedia(
        "(prefers-color-scheme: dark)"
      ).matches;
      if (isDarkMode) {
        root.classList.add("dark");
      } else {
        root.classList.remove("dark");
      }
    }

    // تطبيق اللغة
    const language = newPreferences.general?.language || "ar";
    document.documentElement.lang = language;
    document.documentElement.dir = language === "ar" ? "rtl" : "ltr";

    // تطبيق إعدادات إمكانية الوصول
    if (newPreferences.accessibility?.high_contrast) {
      root.classList.add("high-contrast");
    } else {
      root.classList.remove("high-contrast");
    }

    if (newPreferences.accessibility?.large_text) {
      root.classList.add("large-text");
    } else {
      root.classList.remove("large-text");
    }

    // حفظ في localStorage
    localStorage.setItem("userPreferences", JSON.stringify(newPreferences));
  };

  // تحديث التفضيلات مع التطبيق الفوري
  const updatePreferences = async (newPreferences, skipAPI = false) => {
    try {
      setLoading(true);

      // تطبيق التفضيلات فوراً
      setPreferences(newPreferences);
      applyPreferences(newPreferences);

      // إشعار المكون الأب
      if (onPreferencesUpdate) {
        onPreferencesUpdate(newPreferences);
      }

      // إذا لم نتخطى API، احفظ في الخادم
      if (!skipAPI) {
        // هنا يمكن إضافة حفظ في الخادم إذا لزم الأمر
        if (toast) {
          toast.success("تم تطبيق الإعدادات بنجاح");
        }
      }
    } catch (error) {
      console.error("خطأ في تحديث التفضيلات:", error);
      if (toast) {
        toast.error("فشل في تطبيق الإعدادات");
      }
    } finally {
      setLoading(false);
    }
  };

  // تحديث إعداد واحد
  const updateSinglePreference = async (path, value) => {
    try {
      setLoading(true);

      const pathParts = path.split(".");
      const newPreferences = { ...preferences };

      // تحديث القيمة في المسار المحدد
      let current = newPreferences;
      for (let i = 0; i < pathParts.length - 1; i++) {
        if (!current[pathParts[i]]) {
          current[pathParts[i]] = {};
        }
        current = current[pathParts[i]];
      }
      current[pathParts[pathParts.length - 1]] = value;

      // تطبيق التحديث
      await updatePreferences(newPreferences);

      // حفظ في الخادم حسب نوع الإعداد
      if (pathParts[0] === "general") {
        if (pathParts[1] === "theme") {
          await preferencesAPI.updateTheme(value);
        } else if (pathParts[1] === "language") {
          await preferencesAPI.updateLanguage(value);
        } else {
          await preferencesAPI.updateGeneralSettings({ [pathParts[1]]: value });
        }
      }

      return true;
    } catch (error) {
      console.error("خطأ في تحديث الإعداد:", error);
      if (toast) {
        toast.error("فشل في حفظ الإعداد");
      }
      return false;
    } finally {
      setLoading(false);
    }
  };

  // تحديث قسم كامل
  const updateSection = async (section, data) => {
    try {
      setLoading(true);

      const newPreferences = {
        ...preferences,
        [section]: { ...preferences[section], ...data },
      };

      await updatePreferences(newPreferences);

      // حفظ في الخادم
      switch (section) {
        case "general":
          await preferencesAPI.updateGeneralSettings(data);
          break;
        case "notifications":
          await preferencesAPI.updateNotificationSettings(data);
          break;
        case "display":
          await preferencesAPI.updateDisplayPreferences(data);
          break;
        case "accessibility":
          await preferencesAPI.updateAccessibilitySettings(data);
          break;
        case "privacy":
          await preferencesAPI.updatePrivacySettings(data);
          break;
      }

      return true;
    } catch (error) {
      console.error("خطأ في تحديث القسم:", error);
      if (toast) {
        toast.error("فشل في حفظ الإعدادات");
      }
      return false;
    } finally {
      setLoading(false);
    }
  };

  // إعادة تحميل التفضيلات من الخادم
  const reloadPreferences = async () => {
    try {
      setLoading(true);
      const response = await preferencesAPI.getUserPreferences();
      const newPreferences = response.data;

      setPreferences(newPreferences);
      applyPreferences(newPreferences);

      if (onPreferencesUpdate) {
        onPreferencesUpdate(newPreferences);
      }

      return newPreferences;
    } catch (error) {
      console.error("خطأ في إعادة تحميل التفضيلات:", error);
      if (toast) {
        toast.error("فشل في تحميل الإعدادات");
      }
      return null;
    } finally {
      setLoading(false);
    }
  };

  // تطبيق التفضيلات عند التحميل الأولي
  useEffect(() => {
    if (preferences) {
      applyPreferences(preferences);
    }
  }, []);

  const value = {
    preferences,
    loading,
    updatePreferences,
    updateSinglePreference,
    updateSection,
    reloadPreferences,
    applyPreferences,
  };

  return (
    <PreferencesContext.Provider value={value}>
      {children}
    </PreferencesContext.Provider>
  );
};

export const usePreferences = () => {
  const context = useContext(PreferencesContext);
  if (!context) {
    throw new Error("usePreferences must be used within a PreferencesProvider");
  }
  return context;
};

export default PreferencesContext;
