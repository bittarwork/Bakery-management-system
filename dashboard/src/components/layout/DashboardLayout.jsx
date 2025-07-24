import React, { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { motion } from "framer-motion";
import {
  LayoutDashboard,
  BarChart3,
  Truck,
  Package,
  CreditCard,
  Store,
  ShoppingBag,
  FileText,
  Users,
  Settings,
  LogOut,
  Menu,
  X,
  User,
  Euro,
  UserCheck,
  CalendarClock,
  Brain,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import { useAuthStore } from "../../stores/authStore";
import Logo from "../ui/Logo";

const DashboardLayout = ({ children }) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [expandedSections, setExpandedSections] = useState({
    orders: true,
    management: true,
    reports: true,
  });
  const location = useLocation();
  const { user, logout } = useAuthStore();

  // Enhanced navigation structure with better organization and descriptions
  const navigationSections = [
    {
      id: "main",
      title: "لوحة التحكم الرئيسية",
      items: [
        { name: "الصفحة الرئيسية", path: "/dashboard", icon: LayoutDashboard },
        { name: "التحليلات والإحصائيات", path: "/analytics", icon: BarChart3 },
        { name: "نظام التوزيع المتقدم", path: "/distribution", icon: Truck },
      ],
    },
    {
      id: "core_operations",
      title: "العمليات الأساسية",
      items: [
        { name: "إدارة الطلبات", path: "/orders", icon: Package },
        { name: "إدارة المنتجات", path: "/products", icon: ShoppingBag },
        { name: "إدارة المتاجر", path: "/stores", icon: Store },
        { name: "إدارة المستخدمين", path: "/users", icon: Users },
      ],
    },
    {
      id: "financial",
      title: "الإدارة المالية",
      items: [
        { name: "المدفوعات والفواتير", path: "/payments", icon: CreditCard },
        { name: "إدارة الأسعار", path: "/pricing", icon: Euro },
      ],
    },
    {
      id: "distribution_management",
      title: "إدارة التوزيع",
      items: [
        { name: "إدارة الموزعين", path: "/distributors", icon: UserCheck },
        { name: "جدولة التسليم", path: "/delivery", icon: CalendarClock },
      ],
    },
    {
      id: "reports",
      title: "التقارير المتقدمة",
      items: [
        { name: "التقارير الشاملة", path: "/reports", icon: FileText },
        { name: "تقارير الطلبات", path: "/orders/reports", icon: BarChart3 },
      ],
    },
    {
      id: "settings",
      title: "إعدادات النظام",
      items: [{ name: "الإعدادات العامة", path: "/settings", icon: Settings }],
    },
  ];

  const handleLogout = () => {
    logout();
  };

  const toggleSection = (sectionId) => {
    setExpandedSections((prev) => ({
      ...prev,
      [sectionId]: !prev[sectionId],
    }));
  };

  return (
    <div className="min-h-screen bg-gray-50" dir="rtl">
      {/* Sidebar */}
      <motion.div
        initial={{ x: 300 }}
        animate={{ x: isSidebarOpen ? 0 : 300 }}
        transition={{ type: "spring", stiffness: 300, damping: 30 }}
        className={`fixed inset-y-0 right-0 z-30 w-64 bg-white shadow-xl transform ${
          isSidebarOpen ? "translate-x-0" : "translate-x-full"
        } transition-transform duration-300 ease-in-out lg:translate-x-0 flex flex-col`}
      >
        {/* Sidebar Header */}
        <div className="flex-shrink-0 flex items-center justify-between h-16 px-6 bg-gradient-to-r from-amber-600 via-orange-600 to-red-600 text-white">
          <button
            onClick={() => setIsSidebarOpen(false)}
            className="lg:hidden p-1 rounded-md hover:bg-white hover:bg-opacity-20 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
          <div className="flex items-center space-x-3 space-x-reverse">
            <Logo size="sm" variant="icon-only" animated={false} />
            <h1 className="text-xl font-bold">نظام المخبز</h1>
          </div>
        </div>

        {/* Scrollable Navigation */}
        <div className="flex-1 overflow-hidden">
          <div className="h-full overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100 hover:scrollbar-thumb-gray-400">
            <nav className="px-3 py-4">
              <div className="space-y-2">
                {navigationSections.map((section) => {
                  const isExpanded = expandedSections[section.id];
                  const hasActiveItem = section.items.some(
                    (item) => location.pathname === item.path
                  );

                  return (
                    <div key={section.id} className="space-y-1">
                      {/* Section Header */}
                      <button
                        onClick={() => toggleSection(section.id)}
                        className={`w-full flex items-center justify-between px-3 py-2 text-xs font-semibold text-gray-500 uppercase tracking-wider rounded-md transition-colors ${
                          hasActiveItem
                            ? "bg-blue-50 text-blue-600"
                            : "hover:bg-gray-50 hover:text-gray-700"
                        }`}
                      >
                        <span>{section.title}</span>
                        {section.items.length > 1 && (
                          <motion.div
                            animate={{ rotate: isExpanded ? 180 : 0 }}
                            transition={{ duration: 0.2 }}
                          >
                            <ChevronDown className="w-3 h-3" />
                          </motion.div>
                        )}
                      </button>

                      {/* Section Items */}
                      <motion.div
                        initial={false}
                        animate={{
                          height: isExpanded ? "auto" : 0,
                          opacity: isExpanded ? 1 : 0,
                        }}
                        transition={{ duration: 0.3, ease: "easeInOut" }}
                        className="overflow-hidden"
                      >
                        <div className="space-y-1 pr-4">
                          {section.items.map((item) => {
                            const Icon = item.icon;
                            const isActive = location.pathname === item.path;

                            return (
                              <motion.div
                                key={item.name}
                                whileHover={{ x: -4 }}
                                whileTap={{ scale: 0.95 }}
                              >
                                <Link
                                  to={item.path}
                                  className={`group flex items-center px-3 py-2.5 text-sm font-medium rounded-lg transition-all duration-200 ${
                                    isActive
                                      ? "bg-blue-50 text-blue-700 border-r-2 border-blue-600 shadow-sm"
                                      : "text-gray-700 hover:bg-gray-50 hover:text-gray-900"
                                  }`}
                                >
                                  <Icon
                                    className={`w-4 h-4 ml-2 flex-shrink-0 ${
                                      isActive
                                        ? "text-blue-600"
                                        : "text-gray-400 group-hover:text-gray-600"
                                    }`}
                                  />
                                  <span className="truncate">{item.name}</span>
                                </Link>
                              </motion.div>
                            );
                          })}
                        </div>
                      </motion.div>
                    </div>
                  );
                })}
              </div>
            </nav>
          </div>
        </div>

        {/* User Profile Section */}
        <div className="flex-shrink-0 p-4 border-t border-gray-200 bg-gray-50">
          <div className="flex items-center space-x-3 space-x-reverse">
            <button
              onClick={handleLogout}
              className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-md transition-all duration-200"
              title="تسجيل الخروج"
            >
              <LogOut className="w-4 h-4" />
            </button>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900 truncate">
                {user?.name || "المدير"}
              </p>
              <p className="text-xs text-gray-500 truncate">
                {user?.role || "مدير النظام"}
              </p>
            </div>
            <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
              <User className="w-4 h-4 text-blue-600" />
            </div>
          </div>
        </div>
      </motion.div>

      {/* Main content */}
      <div
        className={`${
          isSidebarOpen ? "lg:pr-64" : ""
        } flex flex-col flex-1 transition-all duration-300`}
      >
        {/* Top navigation */}
        <motion.div
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="sticky top-0 z-20 flex items-center justify-between h-16 bg-white shadow-sm px-4 lg:px-6"
        >
          <div className="flex items-center space-x-4 space-x-reverse">
            {/* User Menu */}
            <div className="flex items-center space-x-3 space-x-reverse">
              <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                <User className="w-4 h-4 text-blue-600" />
              </div>
              <div className="hidden sm:block text-right">
                <p className="text-sm font-medium text-gray-900">
                  {user?.name || "المدير"}
                </p>
                <p className="text-xs text-gray-500">
                  {user?.role || "مدير النظام"}
                </p>
              </div>
            </div>

            {/* Notifications */}
            <button
              className="p-2 text-gray-400 hover:text-gray-600 relative transition-colors"
              title="التنبيهات"
            >
              <div className="w-2 h-2 bg-red-500 rounded-full absolute top-2 left-2"></div>
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 17h5l-5 5v-5z"
                />
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z"
                />
              </svg>
            </button>
          </div>

          <div className="flex items-center space-x-4 space-x-reverse">
            <div className="hidden sm:block">
              <h2 className="text-lg font-semibold text-gray-900">
                {navigationSections
                  .flatMap((section) => section.items)
                  .find((item) => item.path === location.pathname)?.name ||
                  "لوحة التحكم"}
              </h2>
            </div>
            <button
              onClick={() => setIsSidebarOpen(true)}
              className={`${
                isSidebarOpen ? "hidden" : "block"
              } lg:hidden p-2 rounded-md text-gray-600 hover:text-gray-900 hover:bg-gray-100 transition-colors`}
            >
              <Menu className="w-5 h-5" />
            </button>
          </div>
        </motion.div>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto p-4 lg:p-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            {children}
          </motion.div>
        </main>
      </div>

      {/* Mobile overlay */}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 z-20 bg-black bg-opacity-50 lg:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}
    </div>
  );
};

export default DashboardLayout;
