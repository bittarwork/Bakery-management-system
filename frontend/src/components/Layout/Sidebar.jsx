import React, { useState, useRef, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useUser } from "../../contexts";

import sessionAPI from "../../services/sessionAPI";
import LogoutConfirmation from "../LogoutConfirmation";

const Sidebar = ({ isOpen, onClose }) => {
  const { user, handleLogout } = useUser();

  const location = useLocation();
  const navigate = useNavigate();
  const userMenuRef = useRef(null);

  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const [logoutType, setLogoutType] = useState("single");

  // Localized texts
  const getLocalizedText = (key) => {
    const language = "ar"; // Default language
    const texts = {
      ar: {
        dashboard: "لوحة التحكم",
        orders: "الطلبات",
        products: "المنتجات",
        stores: "المحلات",
        payments: "المدفوعات",
        reports: "التقارير",

        logout: "تسجيل الخروج",
        profile: "الملف الشخصي",
        viewProfile: "عرض الملف الشخصي",
        emergencyLogout: "خروج طارئ",
      },
      en: {
        dashboard: "Dashboard",
        orders: "Orders",
        products: "Products",
        stores: "Stores",
        payments: "Payments",
        reports: "Reports",

        logout: "Logout",
        profile: "Profile",
        viewProfile: "View Profile",
        emergencyLogout: "Emergency Logout",
      },
      fr: {
        dashboard: "Tableau de bord",
        orders: "Commandes",
        products: "Produits",
        stores: "Magasins",
        payments: "Paiements",
        reports: "Rapports",

        logout: "Déconnexion",
        profile: "Profil",
        viewProfile: "Voir le profil",
        emergencyLogout: "Déconnexion d'urgence",
      },
      nl: {
        dashboard: "Dashboard",
        orders: "Bestellingen",
        products: "Producten",
        stores: "Winkels",
        payments: "Betalingen",
        reports: "Rapporten",

        logout: "Uitloggen",
        profile: "Profiel",
        viewProfile: "Profiel bekijken",
        emergencyLogout: "Nooduitlog",
      },
    };
    return texts[language]?.[key] || texts.ar[key];
  };

  // Navigation items
  const navigationItems = [
    {
      name: getLocalizedText("dashboard"),
      href: "/dashboard",
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
            d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2H5a2 2 0 00-2-2z"
          />
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M8 5a2 2 0 012-2h4a2 2 0 012 2v6H8V5z"
          />
        </svg>
      ),
      badge: null,
    },
    {
      name: getLocalizedText("orders"),
      href: "/orders",
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
      badge: null, // Default no badge
    },
    {
      name: getLocalizedText("products"),
      href: "/products",
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
    },
    {
      name: getLocalizedText("stores"),
      href: "/stores",
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
    },
    {
      name: getLocalizedText("payments"),
      href: "/payments",
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
    },
    {
      name: getLocalizedText("reports"),
      href: "/reports",
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
    },
  ];

  // Check if current path matches
  const isCurrentPath = (path) => {
    return location.pathname === path;
  };

  // Get current direction
  const getCurrentDirection = () => {
    return "ar" === "ar" ? "rtl" : "ltr"; // Default Arabic
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

  // Get compact classes
  const getCompactClasses = () => {
    if (false) {
      // Default compact view disabled
      return "px-2 py-1";
    }
    return "px-3 py-2";
  };

  // Get theme classes
  const getThemeClasses = () => {
    const theme = "light"; // Default theme
    return {
      sidebar:
        theme === "dark" ? "bg-gray-900 text-white" : "bg-white text-gray-900",
      divider: theme === "dark" ? "border-gray-700" : "border-gray-200",
      userArea: theme === "dark" ? "bg-gray-800" : "bg-gray-50",
      activeItem:
        theme === "dark"
          ? "bg-blue-900 text-blue-100"
          : "bg-blue-50 text-blue-700",
      inactiveItem:
        theme === "dark"
          ? "text-gray-300 hover:bg-gray-700 hover:text-white"
          : "text-gray-600 hover:bg-gray-100 hover:text-gray-900",
    };
  };

  // Handle logout action
  const handleLogoutAction = (type = "single") => {
    setLogoutType(type);
    setShowLogoutConfirm(true);
  };

  // Close user menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target)) {
        setUserMenuOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const themes = getThemeClasses();

  return (
    <>
      <div
        className={`fixed inset-y-0 left-0 z-50 w-64 bg-white dark:bg-gray-900 shadow-lg transform transition-transform duration-300 ease-in-out ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        } lg:translate-x-0 lg:static lg:inset-0 ${getContrastClasses()}`}
      >
        <div className="flex flex-col h-full">
          {/* Logo/Brand */}
          <div className="flex items-center justify-between h-16 px-4 border-b border-gray-200 dark:border-gray-700">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <h1 className="text-xl font-bold text-gray-900 dark:text-white">
                  نظام المخبز
                </h1>
              </div>
            </div>
            <button
              onClick={onClose}
              className="lg:hidden p-2 rounded-md text-gray-400 hover:text-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700"
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
          <nav className="flex-1 px-2 py-4 space-y-1 overflow-y-auto">
            {navigationItems.map((item) => {
              const isActive = isCurrentPath(item.href);
              return (
                <Link
                  key={item.name}
                  to={item.href}
                  onClick={() => {
                    if (window.innerWidth < 1024) {
                      onClose();
                    }
                  }}
                  className={`group flex items-center ${getCompactClasses()} ${getTextSizeClass()} font-medium rounded-md ${
                    isActive ? themes.activeItem : themes.inactiveItem
                  } transition-colors duration-200`}
                  aria-label={getLocalizedText(item.name)}
                >
                  <span className="flex-shrink-0 mr-3">{item.icon}</span>
                  <span className="flex-1">{item.name}</span>
                  {item.badge &&
                    true && ( // Default notifications enabled
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300">
                        {item.badge}
                      </span>
                    )}
                  {false && ( // Default screen reader disabled
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
