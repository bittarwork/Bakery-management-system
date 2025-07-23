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
} from "lucide-react";
import { useAuthStore } from "../../stores/authStore";
import Logo from "../ui/Logo";

const DashboardLayout = ({ children }) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const location = useLocation();
  const { user, logout } = useAuthStore();

  const navigation = [
    { name: "لوحة التحكم", path: "/dashboard", icon: LayoutDashboard },
    { name: "الإحصائيات", path: "/analytics", icon: BarChart3 },
    { name: "التوزيع", path: "/distribution", icon: Truck },
    { name: "الطلبات", path: "/orders", icon: Package },
    { name: "تقارير الطلبات", path: "/orders/reports", icon: FileText },
    { name: "المدفوعات", path: "/payments", icon: CreditCard },
    { name: "المتاجر", path: "/stores", icon: Store },
    { name: "المنتجات", path: "/products", icon: ShoppingBag },
    { name: "التقارير", path: "/reports", icon: FileText },
    { name: "المستخدمون", path: "/users", icon: Users },
    // Enhanced Order Management Features (Phase 6)
    { name: "إدارة التسعير", path: "/pricing", icon: Euro },
    { name: "إدارة الموزعين", path: "/distributors", icon: UserCheck },
    { name: "جدولة التسليم", path: "/delivery", icon: CalendarClock },
    {
      name: "مراجعة الجدولة التلقائية",
      path: "/scheduling/auto-review",
      icon: Brain,
    },
    { name: "الإعدادات", path: "/settings", icon: Settings },
  ];

  const handleLogout = () => {
    logout();
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
        } transition-transform duration-300 ease-in-out lg:translate-x-0`}
      >
        {/* Sidebar Header */}
        <div className="flex items-center justify-between h-16 px-6 bg-gradient-to-r from-amber-600 via-orange-600 to-red-600 text-white">
          <button
            onClick={() => setIsSidebarOpen(false)}
            className="lg:hidden p-1 rounded-md hover:bg-white hover:bg-opacity-20"
          >
            <X className="w-5 h-5" />
          </button>
          <div className="flex items-center space-x-3 space-x-reverse">
            <Logo size="sm" variant="icon-only" animated={false} />
            <h1 className="text-xl font-bold">نظام المخبز</h1>
          </div>
        </div>

        {/* Navigation */}
        <nav className="mt-6 px-3">
          <div className="space-y-1">
            {navigation.map((item) => {
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
                        ? "bg-blue-50 text-blue-700 border-l-2 border-blue-600"
                        : "text-gray-700 hover:bg-gray-50 hover:text-gray-900"
                    }`}
                  >
                    <span className="ml-3">{item.name}</span>
                    <Icon
                      className={`w-5 h-5 ${
                        isActive
                          ? "text-blue-600"
                          : "text-gray-400 group-hover:text-gray-600"
                      }`}
                    />
                  </Link>
                </motion.div>
              );
            })}
          </div>
        </nav>

        {/* User Profile Section */}
        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-gray-200">
          <div className="flex items-center space-x-3 space-x-reverse">
            <button
              onClick={handleLogout}
              className="p-1 text-gray-400 hover:text-red-600 transition-colors"
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
            <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
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
              className="p-2 text-gray-400 hover:text-gray-600 relative"
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
                {navigation.find((item) => item.path === location.pathname)
                  ?.name || "لوحة التحكم"}
              </h2>
            </div>
            <button
              onClick={() => setIsSidebarOpen(true)}
              className={`${
                isSidebarOpen ? "hidden" : "block"
              } lg:hidden p-2 rounded-md text-gray-600 hover:text-gray-900 hover:bg-gray-100`}
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
