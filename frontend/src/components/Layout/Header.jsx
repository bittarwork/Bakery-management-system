import React, { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { usePreferences } from "../../contexts/PreferencesContext";
import NotificationCenter from "../NotificationCenter";
import LogoutConfirmation from "../LogoutConfirmation";
import notificationAPI from "../../services/notificationAPI";

const Header = ({ user, onMenuClick, onSessionManagerOpen }) => {
  const { preferences, updatePreferences } = usePreferences();
  const [showNotifications, setShowNotifications] = useState(false);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const [logoutType, setLogoutType] = useState("single");
  const [unreadNotifications, setUnreadNotifications] = useState(0);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const navigate = useNavigate();

  // تحميل عدد الإشعارات غير المقروءة
  const loadUnreadCount = async () => {
    try {
      if (preferences?.notifications?.system) {
        const count = await notificationAPI.getUnreadCount();
        setUnreadNotifications(count);
      } else {
        setUnreadNotifications(0);
      }
    } catch (error) {
      console.error("خطأ في تحميل عدد الإشعارات:", error);
      setUnreadNotifications(0);
    }
  };

  // تحميل العدد عند تحميل المكون
  useEffect(() => {
    if (preferences?.notifications?.system) {
      loadUnreadCount();
      const updateInterval = preferences?.privacy?.analytics ? 30000 : 60000;
      const interval = setInterval(loadUnreadCount, updateInterval);
      return () => clearInterval(interval);
    }
  }, [preferences?.notifications?.system, preferences?.privacy?.analytics]);

  // تحديث العدد عند إغلاق مركز الإشعارات
  const handleNotificationClose = () => {
    setShowNotifications(false);
    if (preferences?.notifications?.system) {
      loadUnreadCount();
    }
  };

  const handleLogout = (type = "single") => {
    setLogoutType(type);
    setShowLogoutConfirm(true);
  };

  // تبديل المظهر
  const toggleTheme = async () => {
    const currentTheme = preferences?.general?.theme || "light";
    let newTheme;

    if (currentTheme === "light") {
      newTheme = "dark";
    } else if (currentTheme === "dark") {
      newTheme = "auto";
    } else {
      newTheme = "light";
    }

    try {
      await updatePreferences({
        ...preferences,
        general: {
          ...preferences?.general,
          theme: newTheme,
        },
      });
    } catch (error) {
      console.error("خطأ في تحديث المظهر:", error);
    }
  };

  // الحصول على أيقونة المظهر الحالي
  const getThemeIcon = () => {
    const theme = preferences?.general?.theme || "light";
    switch (theme) {
      case "dark":
        return "🌙";
      case "auto":
        return "🔄";
      default:
        return "☀️";
    }
  };

  // الحصول على نص المظهر الحالي
  const getThemeText = () => {
    const theme = preferences?.general?.theme || "light";
    const language = preferences?.general?.language || "ar";

    const texts = {
      ar: {
        light: "فاتح",
        dark: "داكن",
        auto: "تلقائي",
      },
      en: {
        light: "Light",
        dark: "Dark",
        auto: "Auto",
      },
    };

    return texts[language]?.[theme] || texts.ar[theme];
  };

  // تطبيق المظهر فوراً عند التغيير
  useEffect(() => {
    if (preferences?.general?.theme) {
      const root = document.documentElement;
      const theme = preferences.general.theme;

      // إزالة جميع فئات المظهر أولاً
      root.classList.remove("dark");

      if (theme === "dark") {
        root.classList.add("dark");
      } else if (theme === "light") {
        root.classList.remove("dark");
      } else if (theme === "auto") {
        // Auto theme based on system preference
        const isDarkMode = window.matchMedia(
          "(prefers-color-scheme: dark)"
        ).matches;
        if (isDarkMode) {
          root.classList.add("dark");
        } else {
          root.classList.remove("dark");
        }
      }
    }
  }, [preferences?.general?.theme]);

  // Keyboard shortcuts
  useEffect(() => {
    if (!preferences?.accessibility?.keyboard_navigation) return;

    const handleKeyDown = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key === "L") {
        e.preventDefault();
        handleLogout("single");
      }
      if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key === "N") {
        e.preventDefault();
        if (preferences?.notifications?.system) {
          setShowNotifications(!showNotifications);
        }
      }
      if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key === "S") {
        e.preventDefault();
        navigate("/settings");
      }
      if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key === "T") {
        e.preventDefault();
        toggleTheme();
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [
    preferences?.accessibility?.keyboard_navigation,
    navigate,
    showNotifications,
    preferences?.notifications?.system,
    preferences,
  ]);

  // الحصول على class الاتجاه
  const getCurrentDirection = () => {
    return preferences?.general?.language === "ar" ? "rtl" : "ltr";
  };

  // نصوص تدعم تعدد اللغات
  const getLocalizedText = (key) => {
    const language = preferences?.general?.language || "ar";
    const texts = {
      ar: {
        openMenu: "فتح القائمة",
        notifications: "الإشعارات",
        settings: "الإعدادات",
        emergencyLogout: "خروج طارئ",
        toggleTheme: "تبديل المظهر",
        userMenu: "قائمة المستخدم",
        profile: "الملف الشخصي",
        bakerySystem: "نظام إدارة المخبز",
        welcome: "مرحباً",
        keyboardShortcuts: "(Ctrl+Shift+L)",
        notificationShortcuts: "(Ctrl+Shift+N)",
        settingsShortcuts: "(Ctrl+Shift+S)",
        themeShortcuts: "(Ctrl+Shift+T)",
      },
      en: {
        openMenu: "Open Menu",
        notifications: "Notifications",
        settings: "Settings",
        emergencyLogout: "Emergency Logout",
        toggleTheme: "Toggle Theme",
        userMenu: "User Menu",
        profile: "Profile",
        bakerySystem: "Bakery Management System",
        welcome: "Welcome",
        keyboardShortcuts: "(Ctrl+Shift+L)",
        notificationShortcuts: "(Ctrl+Shift+N)",
        settingsShortcuts: "(Ctrl+Shift+S)",
        themeShortcuts: "(Ctrl+Shift+T)",
      },
      fr: {
        openMenu: "Ouvrir le menu",
        notifications: "Notifications",
        settings: "Paramètres",
        emergencyLogout: "Déconnexion d'urgence",
        toggleTheme: "Changer le thème",
        userMenu: "Menu utilisateur",
        profile: "Profil",
        bakerySystem: "Système de gestion de boulangerie",
        welcome: "Bienvenue",
        keyboardShortcuts: "(Ctrl+Shift+L)",
        notificationShortcuts: "(Ctrl+Shift+N)",
        settingsShortcuts: "(Ctrl+Shift+S)",
        themeShortcuts: "(Ctrl+Shift+T)",
      },
      nl: {
        openMenu: "Menu openen",
        notifications: "Meldingen",
        settings: "Instellingen",
        emergencyLogout: "Nooduitlog",
        toggleTheme: "Thema wisselen",
        userMenu: "Gebruikersmenu",
        profile: "Profiel",
        bakerySystem: "Bakkerij beheersysteem",
        welcome: "Welkom",
        keyboardShortcuts: "(Ctrl+Shift+L)",
        notificationShortcuts: "(Ctrl+Shift+N)",
        settingsShortcuts: "(Ctrl+Shift+S)",
        themeShortcuts: "(Ctrl+Shift+T)",
      },
    };
    return texts[language]?.[key] || texts.ar[key];
  };

  // الحصول على حجم النص بناءً على التفضيلات
  const getTextSizeClass = () => {
    if (preferences?.accessibility?.large_text) {
      return "text-lg";
    }
    return "text-base";
  };

  // الحصول على كلاسات التباين العالي
  const getContrastClasses = () => {
    if (preferences?.accessibility?.high_contrast) {
      return "ring-2 ring-blue-300 dark:ring-blue-600";
    }
    return "";
  };

  // تحديد ما إذا كان يجب إظهار زر الإشعارات
  const shouldShowNotifications = preferences?.notifications?.system !== false;
  const shouldShowBadge = shouldShowNotifications && unreadNotifications > 0;

  return (
    <>
      <header
        className={`bg-white dark:bg-gray-800 shadow-lg border-b border-gray-200 dark:border-gray-700 sticky top-0 z-40 transition-all duration-300 ${getContrastClasses()}`}
      >
        <div
          className={`flex items-center justify-between h-16 px-4 sm:px-6 ${
            getCurrentDirection() === "rtl" ? "flex-row-reverse" : ""
          }`}
        >
          {/* Left Section - Menu */}
          <div className="flex items-center">
            {/* Mobile Menu Button */}
            <button
              onClick={onMenuClick}
              className={`p-2 rounded-md text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 lg:hidden transition-all duration-200 ${getTextSizeClass()}`}
              aria-label={getLocalizedText("openMenu")}
              title={getLocalizedText("openMenu")}
            >
              <svg
                className="h-6 w-6"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 6h16M4 12h16M4 18h16"
                />
              </svg>
              {preferences?.accessibility?.screen_reader && (
                <span className="sr-only">{getLocalizedText("openMenu")}</span>
              )}
            </button>
          </div>

          {/* Right Section - Actions */}
          <div
            className={`flex items-center space-x-3 ${
              getCurrentDirection() === "rtl" ? "space-x-reverse" : ""
            }`}
          >
            {/* Theme Toggle */}
            <button
              onClick={toggleTheme}
              className={`p-2 text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 transition-all duration-200 ${getTextSizeClass()}`}
              title={`${getLocalizedText("toggleTheme")} - ${getThemeText()} ${
                preferences?.accessibility?.keyboard_navigation
                  ? getLocalizedText("themeShortcuts")
                  : ""
              }`}
              aria-label={getLocalizedText("toggleTheme")}
            >
              <span className="text-xl">{getThemeIcon()}</span>
              {preferences?.accessibility?.screen_reader && (
                <span className="sr-only">
                  {getLocalizedText("toggleTheme")} - {getThemeText()}
                </span>
              )}
            </button>

            {/* Notifications */}
            {shouldShowNotifications && (
              <div className="relative">
                <button
                  onClick={() => setShowNotifications(!showNotifications)}
                  className={`relative p-2 text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 transition-all duration-200 ${getTextSizeClass()}`}
                  title={`${getLocalizedText("notifications")} ${
                    preferences?.accessibility?.keyboard_navigation
                      ? getLocalizedText("notificationShortcuts")
                      : ""
                  }`}
                  aria-label={getLocalizedText("notifications")}
                >
                  <svg
                    className="h-6 w-6"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
                    />
                  </svg>
                  {shouldShowBadge && (
                    <span className="absolute -top-1 -right-1 h-5 w-5 bg-red-500 dark:bg-red-600 text-white text-xs rounded-full flex items-center justify-center animate-pulse font-bold">
                      {unreadNotifications > 9 ? "9+" : unreadNotifications}
                    </span>
                  )}
                  {preferences?.accessibility?.screen_reader && (
                    <span className="sr-only">
                      {getLocalizedText("notifications")}
                      {shouldShowBadge && ` - ${unreadNotifications} غير مقروء`}
                    </span>
                  )}
                </button>

                <NotificationCenter
                  isOpen={showNotifications}
                  onClose={handleNotificationClose}
                />
              </div>
            )}

            {/* Settings */}
            <button
              onClick={() => navigate("/settings")}
              className={`p-2 text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 transition-all duration-200 ${getTextSizeClass()}`}
              title={`${getLocalizedText("settings")} ${
                preferences?.accessibility?.keyboard_navigation
                  ? getLocalizedText("settingsShortcuts")
                  : ""
              }`}
              aria-label={getLocalizedText("settings")}
            >
              <svg
                className="h-6 w-6"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
                />
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                />
              </svg>
              {preferences?.accessibility?.screen_reader && (
                <span className="sr-only">{getLocalizedText("settings")}</span>
              )}
            </button>

            {/* Emergency Logout */}
            <button
              onClick={() => handleLogout("emergency")}
              className={`p-2 text-red-600 dark:text-red-400 hover:text-red-800 dark:hover:text-red-300 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 dark:focus:ring-red-400 transition-all duration-200 ${getTextSizeClass()}`}
              title={`${getLocalizedText("emergencyLogout")} ${
                preferences?.accessibility?.keyboard_navigation
                  ? getLocalizedText("keyboardShortcuts")
                  : ""
              }`}
              aria-label={getLocalizedText("emergencyLogout")}
            >
              <svg
                className="h-6 w-6"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z"
                />
              </svg>
              {preferences?.accessibility?.screen_reader && (
                <span className="sr-only">
                  {getLocalizedText("emergencyLogout")}
                </span>
              )}
            </button>
          </div>
        </div>
      </header>

      {/* Logout Confirmation Modal */}
      <LogoutConfirmation
        isOpen={showLogoutConfirm}
        onClose={() => setShowLogoutConfirm(false)}
        type={logoutType}
      />
    </>
  );
};

export default Header;
