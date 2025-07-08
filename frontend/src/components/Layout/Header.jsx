import React, { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";

import NotificationCenter from "../NotificationCenter";
import LogoutConfirmation from "../LogoutConfirmation";

const Header = ({ user, onMenuClick, onSessionManagerOpen }) => {
  const [showNotifications, setShowNotifications] = useState(false);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const [logoutType, setLogoutType] = useState("single");
  const [unreadNotifications, setUnreadNotifications] = useState(0);
  const navigate = useNavigate();

  // Load unread notifications count
  const loadUnreadCount = async () => {
    try {
      // Check if notifications are enabled
      const response = await fetch("/api/notifications/unread-count");
      if (response.ok) {
        const data = await response.json();
        setUnreadNotifications(data.count);
      }
    } catch (error) {
      console.error("خطأ في تحميل عدد الإشعارات:", error);
    }
  };

  // Load notifications periodically
  useEffect(() => {
    loadUnreadCount();

    // Check if notifications are enabled
    const interval = setInterval(() => {
      // Check if notifications are enabled
      const updateInterval = true ? 30000 : 60000; // Default analytics enabled
      loadUnreadCount();
    }, 30000); // Default 30 seconds

    return () => clearInterval(interval);
  }, []);

  const handleNotificationClose = () => {
    setShowNotifications(false);
  };

  const handleLogout = (type = "single") => {
    setLogoutType(type);
    setShowLogoutConfirm(true);
  };

  const toggleTheme = async () => {
    try {
      const currentTheme = "light"; // Default theme
      const newTheme = currentTheme === "light" ? "dark" : "light";

      // Update theme in localStorage
      localStorage.setItem("theme", newTheme);

      // Apply theme to document
      const root = document.documentElement;
      if (newTheme === "dark") {
        root.classList.add("dark");
      } else {
        root.classList.remove("dark");
      }

      // Update theme in server if needed
      // await preferencesAPI.updateTheme(newTheme);
    } catch (error) {
      console.error("خطأ في تبديل المظهر:", error);
    }
  };

  const getThemeIcon = () => {
    const theme = "light"; // Default theme
    const language = "ar"; // Default language

    if (theme === "dark") {
      return "🌙";
    } else if (theme === "light") {
      return "☀️";
    } else {
      // Auto theme based on system preference
      const isDarkMode = window.matchMedia(
        "(prefers-color-scheme: dark)"
      ).matches;
      return isDarkMode ? "🌙" : "☀️";
    }
  };

  const getThemeText = () => {
    const theme = "light"; // Default theme
    const language = "ar"; // Default language

    if (theme === "dark") {
      return "الوضع الداكن";
    } else if (theme === "light") {
      return "الوضع الفاتح";
    } else {
      return "تلقائي";
    }
  };

  // Keyboard shortcuts
  useEffect(() => {
    // Check if keyboard navigation is enabled
    if (!true) return; // Default keyboard navigation enabled

    const handleKeyDown = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key === "L") {
        e.preventDefault();
        handleLogout("emergency");
      }
      if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key === "N") {
        e.preventDefault();
        // Check if notifications are enabled
        setShowNotifications(!showNotifications);
      }

      if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key === "T") {
        e.preventDefault();
        toggleTheme();
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [navigate, showNotifications]);

  // Get current direction
  const getCurrentDirection = () => {
    return "ar" === "ar" ? "rtl" : "ltr"; // Default Arabic
  };

  // Localized texts
  const getLocalizedText = (key) => {
    const language = "ar"; // Default language
    const texts = {
      ar: {
        openMenu: "فتح القائمة",
        notifications: "الإشعارات",
        emergencyLogout: "خروج طارئ",
        toggleTheme: "تبديل المظهر",
        userMenu: "قائمة المستخدم",
        profile: "الملف الشخصي",
        bakerySystem: "نظام إدارة المخبز",
        welcome: "مرحباً",
        keyboardShortcuts: "(Ctrl+Shift+L)",
        notificationShortcuts: "(Ctrl+Shift+N)",
        themeShortcuts: "(Ctrl+Shift+T)",
      },
      en: {
        openMenu: "Open Menu",
        notifications: "Notifications",
        emergencyLogout: "Emergency Logout",
        toggleTheme: "Toggle Theme",
        userMenu: "User Menu",
        profile: "Profile",
        bakerySystem: "Bakery Management System",
        welcome: "Welcome",
        keyboardShortcuts: "(Ctrl+Shift+L)",
        notificationShortcuts: "(Ctrl+Shift+N)",
        themeShortcuts: "(Ctrl+Shift+T)",
      },
      fr: {
        openMenu: "Ouvrir le menu",
        notifications: "Notifications",
        emergencyLogout: "Déconnexion d'urgence",
        toggleTheme: "Changer le thème",
        userMenu: "Menu utilisateur",
        profile: "Profil",
        bakerySystem: "Système de gestion de boulangerie",
        welcome: "Bienvenue",
        keyboardShortcuts: "(Ctrl+Shift+L)",
        notificationShortcuts: "(Ctrl+Shift+N)",
        themeShortcuts: "(Ctrl+Shift+T)",
      },
      nl: {
        openMenu: "Menu openen",
        notifications: "Meldingen",
        emergencyLogout: "Nooduitlog",
        toggleTheme: "Thema wisselen",
        userMenu: "Gebruikersmenu",
        profile: "Profiel",
        bakerySystem: "Bakkerij beheersysteem",
        welcome: "Welkom",
        keyboardShortcuts: "(Ctrl+Shift+L)",
        notificationShortcuts: "(Ctrl+Shift+N)",
        themeShortcuts: "(Ctrl+Shift+T)",
      },
    };
    return texts[language]?.[key] || texts.ar[key];
  };

  // Get text size class
  const getTextSizeClass = () => {
    if (false) {
      // Default large text disabled
      return "text-lg";
    }
    return "text-base";
  };

  // Get contrast classes
  const getContrastClasses = () => {
    if (false) {
      // Default high contrast disabled
      return "ring-2 ring-blue-300 dark:ring-blue-600";
    }
    return "";
  };

  // Determine if notifications should be shown
  const shouldShowNotifications = true !== false; // Default notifications enabled
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
              {false && ( // Default screen reader disabled
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
                true // Default keyboard navigation enabled
                  ? getLocalizedText("themeShortcuts")
                  : ""
              }`}
              aria-label={getLocalizedText("toggleTheme")}
            >
              <span className="text-xl">{getThemeIcon()}</span>
              {false && ( // Default screen reader disabled
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
                    true // Default keyboard navigation enabled
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
                  {false && ( // Default screen reader disabled
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

            {/* Emergency Logout */}
            <button
              onClick={() => handleLogout("emergency")}
              className={`p-2 text-red-600 dark:text-red-400 hover:text-red-800 dark:hover:text-red-300 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 dark:focus:ring-red-400 transition-all duration-200 ${getTextSizeClass()}`}
              title={`${getLocalizedText("emergencyLogout")} ${
                true // Default keyboard navigation enabled
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
              {false && ( // Default screen reader disabled
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
