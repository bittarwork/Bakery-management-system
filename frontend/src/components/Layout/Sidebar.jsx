import React, { useState, useRef } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useUser } from "../../contexts";
import { usePreferences } from "../../contexts/PreferencesContext";
import sessionAPI from "../../services/sessionAPI";
import LogoutConfirmation from "../LogoutConfirmation";

const Sidebar = ({ isOpen, onClose }) => {
  const { user, handleLogout } = useUser();
  const { preferences } = usePreferences();
  const location = useLocation();
  const navigate = useNavigate();
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const [logoutType, setLogoutType] = useState("single");
  const userMenuRef = useRef(null);

  // نصوص تدعم تعدد اللغات
  const getLocalizedText = (key) => {
    const language = preferences?.general?.language || "ar";
    const texts = {
      ar: {
        dashboard: "لوحة التحكم",
        orders: "الطلبات",
        products: "المنتجات",
        stores: "المتاجر",
        distribution: "التوزيع",
        payments: "المدفوعات",
        reports: "التقارير",
        settings: "الإعدادات",
        logout: "تسجيل الخروج",
        profile: "الملف الشخصي",
        sessionsManager: "إدارة الجلسات",
        emergencyLogout: "خروج طارئ",
        viewProfile: "عرض الملف الشخصي",
        manageAccount: "إدارة الحساب",
      },
      en: {
        dashboard: "Dashboard",
        orders: "Orders",
        products: "Products",
        stores: "Stores",
        distribution: "Distribution",
        payments: "Payments",
        reports: "Reports",
        settings: "Settings",
        logout: "Logout",
        profile: "Profile",
        sessionsManager: "Manage Sessions",
        emergencyLogout: "Emergency Logout",
        viewProfile: "View Profile",
        manageAccount: "Manage Account",
      },
      fr: {
        dashboard: "Tableau de bord",
        orders: "Commandes",
        products: "Produits",
        stores: "Magasins",
        distribution: "Distribution",
        payments: "Paiements",
        reports: "Rapports",
        settings: "Paramètres",
        logout: "Déconnexion",
        profile: "Profil",
        sessionsManager: "Gérer les sessions",
        emergencyLogout: "Déconnexion d'urgence",
        viewProfile: "Voir le profil",
        manageAccount: "Gérer le compte",
      },
      nl: {
        dashboard: "Dashboard",
        orders: "Bestellingen",
        products: "Producten",
        stores: "Winkels",
        distribution: "Distributie",
        payments: "Betalingen",
        reports: "Rapporten",
        settings: "Instellingen",
        logout: "Uitloggen",
        profile: "Profiel",
        sessionsManager: "Sessies beheren",
        emergencyLogout: "Nooduitlog",
        viewProfile: "Profiel bekijken",
        manageAccount: "Account beheren",
      },
    };
    return texts[language]?.[key] || texts.ar[key];
  };

  const menuItems = [
    {
      name: getLocalizedText("dashboard"),
      path: "/dashboard",
      icon: (
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
            d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z"
          />
        </svg>
      ),
      roles: ["admin", "manager", "user"],
      badge: null,
    },
    {
      name: getLocalizedText("orders"),
      path: "/orders",
      icon: (
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
            d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
          />
        </svg>
      ),
      roles: ["admin", "manager"],
      badge: preferences?.notifications?.orders ? "7" : null,
    },
    {
      name: getLocalizedText("products"),
      path: "/products",
      icon: (
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
            d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"
          />
        </svg>
      ),
      roles: ["admin", "manager"],
      badge: null,
    },
    {
      name: getLocalizedText("stores"),
      path: "/stores",
      icon: (
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
            d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
          />
        </svg>
      ),
      roles: ["admin", "manager", "user"],
      badge: null,
    },
    {
      name: getLocalizedText("distribution"),
      path: "/distribution",
      icon: (
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
            d="M8 9l3 3-3 3m5 0h3M5 20h14a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v14a2 2 0 002 2z"
          />
        </svg>
      ),
      roles: ["admin", "manager", "distributor"],
      badge: null,
    },
    {
      name: getLocalizedText("payments"),
      path: "/payments",
      icon: (
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
            d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1"
          />
        </svg>
      ),
      roles: ["admin", "manager"],
      badge: null,
    },
    {
      name: getLocalizedText("reports"),
      path: "/reports",
      icon: (
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
            d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
          />
        </svg>
      ),
      roles: ["admin", "manager"],
      badge: null,
    },
  ];

  const filteredMenuItems = menuItems.filter((item) =>
    item.roles.includes(user?.role || "user")
  );

  const isCurrentPath = (path) => {
    return location.pathname === path;
  };

  // الحصول على class الاتجاه
  const getCurrentDirection = () => {
    return preferences?.general?.language === "ar" ? "rtl" : "ltr";
  };

  // الحصول على حجم النص بناءً على التفضيلات
  const getTextSizeClass = () => {
    if (preferences?.accessibility?.large_text) {
      return "text-lg";
    }
    return "text-sm";
  };

  // الحصول على كلاسات التباين العالي
  const getContrastClasses = () => {
    if (preferences?.accessibility?.high_contrast) {
      return "contrast-[1.5] saturate-[1.2]";
    }
    return "";
  };

  // الحصول على كلاسات العرض المدمج
  const getCompactClasses = () => {
    if (preferences?.dashboard?.compact) {
      return "py-2 px-3";
    }
    return "py-3 px-4";
  };

  const getThemeClasses = () => {
    const theme = preferences?.general?.theme || "light";
    return {
      sidebar:
        theme === "dark" ? "bg-gray-900 text-white" : "bg-white text-gray-900",
      activeItem:
        theme === "dark"
          ? "bg-blue-600 text-white shadow-lg"
          : "bg-blue-50 text-blue-700 border-r-4 border-blue-700 shadow-sm",
      inactiveItem:
        theme === "dark"
          ? "text-gray-300 hover:bg-gray-800 hover:text-white"
          : "text-gray-600 hover:bg-gray-50 hover:text-gray-900",
      divider: theme === "dark" ? "border-gray-700" : "border-gray-200",
      userArea: theme === "dark" ? "bg-gray-800" : "bg-gray-50",
    };
  };

  const handleLogoutAction = (type = "single") => {
    setLogoutType(type);
    setShowLogoutConfirm(true);
    setUserMenuOpen(false);
  };

  const themes = getThemeClasses();

  return (
    <>
      {/* Overlay للموبايل */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <div
        className={`fixed inset-y-0 ${
          getCurrentDirection() === "rtl" ? "right-0" : "left-0"
        } z-50 w-64 ${themes.sidebar} shadow-lg transform ${
          isOpen
            ? "translate-x-0"
            : getCurrentDirection() === "rtl"
            ? "translate-x-full"
            : "-translate-x-full"
        } transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:inset-0 ${getContrastClasses()}`}
      >
        {/* Header */}
        <div
          className={`flex items-center justify-between h-16 px-4 ${themes.userArea} border-b ${themes.divider}`}
        >
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <h1 className={`font-bold text-xl ${getTextSizeClass()}`}>
                مخبز بلجيكا
              </h1>
              <p className={`text-xs ${getTextSizeClass()}`}>
                نظام إدارة التوزيع
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="lg:hidden p-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700"
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
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        {/* Navigation */}
        <nav className="mt-5 px-2 space-y-1">
          {filteredMenuItems.map((item) => {
            const isActive = isCurrentPath(item.path);
            return (
              <Link
                key={item.path}
                to={item.path}
                onClick={() => {
                  if (window.innerWidth < 1024) {
                    onClose();
                  }
                }}
                className={`group flex items-center ${getCompactClasses()} ${getTextSizeClass()} font-medium rounded-md transition-colors duration-200 ${
                  isActive ? themes.activeItem : themes.inactiveItem
                }`}
                aria-label={item.name}
              >
                <div className="flex-shrink-0 mr-3">{item.icon}</div>
                <span className="flex-1">{item.name}</span>
                {item.badge && preferences?.notifications?.system && (
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300">
                    {item.badge}
                  </span>
                )}
                {preferences?.accessibility?.screen_reader && (
                  <span className="sr-only">
                    {isActive
                      ? `الصفحة الحالية: ${item.name}`
                      : `انتقل إلى ${item.name}`}
                  </span>
                )}
              </Link>
            );
          })}
        </nav>

        {/* Divider */}
        <div className={`my-6 border-t ${themes.divider}`} />

        {/* Additional Links */}
        <nav className="px-2 space-y-1">
          <Link
            to="/settings"
            onClick={() => {
              if (window.innerWidth < 1024) {
                onClose();
              }
            }}
            className={`group flex items-center ${getCompactClasses()} ${getTextSizeClass()} font-medium rounded-md ${
              isCurrentPath("/settings")
                ? themes.activeItem
                : themes.inactiveItem
            } transition-colors duration-200`}
            aria-label={getLocalizedText("settings")}
          >
            <svg
              className="flex-shrink-0 mr-3 h-5 w-5"
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
            <span>{getLocalizedText("settings")}</span>
            {preferences?.accessibility?.screen_reader && (
              <span className="sr-only">
                {isCurrentPath("/settings")
                  ? `الصفحة الحالية: ${getLocalizedText("settings")}`
                  : `انتقل إلى ${getLocalizedText("settings")}`}
              </span>
            )}
          </Link>
        </nav>

        {/* User Area */}
        <div
          className={`absolute bottom-0 left-0 right-0 ${themes.userArea} border-t ${themes.divider}`}
        >
          <div className="relative">
            <button
              ref={userMenuRef}
              onClick={() => setUserMenuOpen(!userMenuOpen)}
              className={`w-full flex items-center ${getCompactClasses()} ${getTextSizeClass()} hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors duration-200`}
              aria-label={getLocalizedText("profile")}
            >
              <div className="flex-shrink-0">
                <div className="h-10 w-10 rounded-full bg-blue-500 flex items-center justify-center">
                  <span className="text-white font-medium">
                    {user?.name?.charAt(0) || "U"}
                  </span>
                </div>
              </div>
              <div
                className={`ml-3 flex-1 ${
                  getCurrentDirection() === "rtl" ? "text-right" : "text-left"
                }`}
              >
                <p className="font-medium">{user?.name || "المستخدم"}</p>
                <p className="text-xs opacity-75">{user?.email}</p>
              </div>
              <svg
                className="flex-shrink-0 ml-2 h-5 w-5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M8 9l4-4 4 4m0 6l-4 4-4-4"
                />
              </svg>
            </button>

            {/* User Menu */}
            {userMenuOpen && (
              <div
                className={`absolute bottom-full left-0 right-0 mb-2 ${themes.sidebar} rounded-lg shadow-lg border ${themes.divider} overflow-hidden`}
              >
                <button
                  onClick={() => {
                    navigate("/profile");
                    setUserMenuOpen(false);
                    if (window.innerWidth < 1024) {
                      onClose();
                    }
                  }}
                  className={`w-full flex items-center ${getCompactClasses()} ${getTextSizeClass()} hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors duration-200`}
                  aria-label={getLocalizedText("viewProfile")}
                >
                  <svg
                    className="flex-shrink-0 mr-3 h-5 w-5"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                    />
                  </svg>
                  <span>{getLocalizedText("viewProfile")}</span>
                </button>

                <div className={`border-t ${themes.divider}`} />

                <button
                  onClick={() => handleLogoutAction("single")}
                  className={`w-full flex items-center ${getCompactClasses()} ${getTextSizeClass()} text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors duration-200`}
                  aria-label={getLocalizedText("logout")}
                >
                  <svg
                    className="flex-shrink-0 mr-3 h-5 w-5"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                    />
                  </svg>
                  <span>{getLocalizedText("logout")}</span>
                </button>

                <button
                  onClick={() => handleLogoutAction("emergency")}
                  className={`w-full flex items-center ${getCompactClasses()} ${getTextSizeClass()} text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors duration-200`}
                  aria-label={getLocalizedText("emergencyLogout")}
                >
                  <svg
                    className="flex-shrink-0 mr-3 h-5 w-5"
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
                  <span>{getLocalizedText("emergencyLogout")}</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Logout Confirmation Modal */}
      <LogoutConfirmation
        isOpen={showLogoutConfirm}
        onClose={() => setShowLogoutConfirm(false)}
        type={logoutType}
      />
    </>
  );
};

export default Sidebar;
