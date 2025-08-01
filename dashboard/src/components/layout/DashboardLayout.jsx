import React, { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  LayoutDashboard,
  BarChart3,
  Truck,
  Package,
  Store,
  ShoppingBag,
  FileText,
  Users,
  Settings,
  LogOut,
  Menu,
  X,
  User,
  Coffee,
  Navigation,
  Brain,
  ChevronDown,
  ChevronRight,
  Bot,
  Search,
  Home,
  Activity,
  TrendingUp,
  Box,
  Building2,
  UserCheck,
  Cog,
  Car,
  Receipt,
  Clock,
} from "lucide-react";
import { useAuthStore } from "../../stores/authStore";
import Logo from "../ui/Logo";
import Breadcrumb from "../ui/Breadcrumb";
import SessionTimer from "../ui/SessionTimer";

const DashboardLayout = ({ children }) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [expandedSections, setExpandedSections] = useState({
    distribution: false,
    management: false,
    reports: false,
  });
  const [searchQuery, setSearchQuery] = useState("");
  const [currentTime, setCurrentTime] = useState(new Date());
  const location = useLocation();
  const { user, logout } = useAuthStore();

  // Update time every second
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  // Format time for display
  const formatTime = (date) => {
    return date.toLocaleTimeString("en-US", {
      hour12: false,
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    });
  };

  // Format date for display
  const formatDate = (date) => {
    return date.toLocaleDateString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  // Enhanced navigation structure with better organization and user-friendly descriptions
  const navigationSections = [
    {
      id: "main",
      title: "الصفحة الرئيسية",
      color: "blue",
      items: [
        {
          name: "لوحة التحكم",
          path: "/dashboard",
          icon: Home,
          description: "البداية - نظرة عامة سريعة",
          badge: null,
        },
        {
          name: "الإحصائيات",
          path: "/analytics",
          icon: TrendingUp,
          description: "أرقام ومخططات مهمة",
          badge: null,
        },
      ],
    },
    {
      id: "management",
      title: "إدارة المخبز",
      color: "green",
      expandable: true,
      icon: Building2,
      items: [
        {
          name: "الطلبات",
          path: "/orders",
          icon: Box,
          description: "طلبات العملاء الجديدة والمعلقة",
          badge: "جديد",
        },
        {
          name: "المتاجر",
          path: "/stores",
          icon: Building2,
          description: "قائمة المتاجر والعملاء",
          badge: null,
        },
        {
          name: "المنتجات",
          path: "/products",
          icon: Package,
          description: "أنواع الخبز والمعجنات",
          badge: null,
        },
        {
          name: "المستخدمين",
          path: "/users",
          icon: UserCheck,
          description: "الموظفين والمستخدمين",
          roles: ["admin"],
          badge: null,
        },
        {
          name: "المركبات",
          path: "/vehicles",
          icon: Car,
          description: "إدارة مركبات التوزيع",
          roles: ["admin", "manager"],
          badge: null,
        },
        {
          name: "جداول التوزيع اليومي",
          path: "/distribution-schedule",
          icon: Clock,
          description: "إدارة جداول التوزيع اليومي ومتابعة الزيارات",
          roles: ["admin", "manager"],
          badge: null,
        },
      ],
    },
    {
      id: "reports",
      title: "التقارير والإحصائيات",
      color: "purple",
      expandable: true,
      icon: BarChart3,
      roles: ["admin", "manager", "accountant"],
      items: [
        {
          name: "التقارير المفصلة",
          path: "/reports",
          icon: FileText,
          description: "تقارير شاملة ومخططات بيانية",
          badge: null,
        },
      ],
    },
    {
      id: "ai",
      title: "المساعد الذكي",
      color: "indigo",
      items: [
        {
          name: "الدردشة الذكية",
          path: "/ai-chat",
          icon: Bot,
          description: "اسأل المساعد الذكي أي سؤال",
          badge: "ذكي",
        },
      ],
    },
    {
      id: "system",
      title: "الإعدادات",
      color: "gray",
      items: [
        {
          name: "إعدادات النظام",
          path: "/settings",
          icon: Cog,
          description: "تخصيص النظام والإعدادات",
          roles: ["admin"],
          badge: null,
        },
        {
          name: "الملف الشخصي",
          path: "/profile",
          icon: User,
          description: "معلوماتك الشخصية",
          badge: null,
        },
        {
          name: "مصروفات المركبة",
          path: "/vehicles/expenses",
          icon: Receipt,
          description: "تسجيل مصروفات مركبة التوزيع",
          roles: ["distributor"],
          badge: null,
        },
      ],
    },
  ];

  const toggleSection = (sectionId) => {
    setExpandedSections((prev) => ({
      ...prev,
      [sectionId]: !prev[sectionId],
    }));
  };

  const handleLogout = () => {
    logout();
  };

  const isActiveLink = (path) => {
    if (path === "/dashboard") {
      return location.pathname === path;
    }
    return location.pathname.startsWith(path);
  };

  const hasPermission = (item) => {
    if (!item.roles) return true;
    return item.roles.includes(user?.role);
  };

  const hasSectionPermission = (section) => {
    if (!section.roles) return true;
    return section.roles.includes(user?.role);
  };

  const getColorClasses = (color, isActive = false) => {
    const colors = {
      blue: {
        bg: isActive
          ? "bg-blue-50 border-r-4 border-blue-500"
          : "hover:bg-blue-25",
        text: isActive ? "text-blue-700" : "text-gray-700 hover:text-blue-600",
        icon: isActive
          ? "text-blue-600"
          : "text-gray-500 group-hover:text-blue-500",
        section: "text-blue-600 bg-blue-50",
      },
      green: {
        bg: isActive
          ? "bg-green-50 border-r-4 border-green-500"
          : "hover:bg-green-25",
        text: isActive
          ? "text-green-700"
          : "text-gray-700 hover:text-green-600",
        icon: isActive
          ? "text-green-600"
          : "text-gray-500 group-hover:text-green-500",
        section: "text-green-600 bg-green-50",
      },
      orange: {
        bg: isActive
          ? "bg-orange-50 border-r-4 border-orange-500"
          : "hover:bg-orange-25",
        text: isActive
          ? "text-orange-700"
          : "text-gray-700 hover:text-orange-600",
        icon: isActive
          ? "text-orange-600"
          : "text-gray-500 group-hover:text-orange-500",
        section: "text-orange-600 bg-orange-50",
      },
      purple: {
        bg: isActive
          ? "bg-purple-50 border-r-4 border-purple-500"
          : "hover:bg-purple-25",
        text: isActive
          ? "text-purple-700"
          : "text-gray-700 hover:text-purple-600",
        icon: isActive
          ? "text-purple-600"
          : "text-gray-500 group-hover:text-purple-500",
        section: "text-purple-600 bg-purple-50",
      },
      indigo: {
        bg: isActive
          ? "bg-indigo-50 border-r-4 border-indigo-500"
          : "hover:bg-indigo-25",
        text: isActive
          ? "text-indigo-700"
          : "text-gray-700 hover:text-indigo-600",
        icon: isActive
          ? "text-indigo-600"
          : "text-gray-500 group-hover:text-indigo-500",
        section: "text-indigo-600 bg-indigo-50",
      },
      gray: {
        bg: isActive
          ? "bg-gray-50 border-r-4 border-gray-500"
          : "hover:bg-gray-50",
        text: isActive ? "text-gray-700" : "text-gray-700 hover:text-gray-800",
        icon: isActive
          ? "text-gray-600"
          : "text-gray-500 group-hover:text-gray-600",
        section: "text-gray-600 bg-gray-50",
      },
    };
    return colors[color] || colors.gray;
  };

  const filteredSections = navigationSections
    .map((section) => ({
      ...section,
      items: section.items.filter(
        (item) =>
          hasPermission(item) &&
          (searchQuery === "" ||
            item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            item.description.toLowerCase().includes(searchQuery.toLowerCase()))
      ),
    }))
    .filter(
      (section) =>
        hasSectionPermission(section) &&
        (section.items.length > 0 || searchQuery === "")
    );

  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* Enhanced Sidebar */}
      <motion.div
        animate={{ width: isSidebarOpen ? 320 : 72 }}
        transition={{ duration: 0.3, ease: "easeInOut" }}
        className="bg-white shadow-2xl border-r border-gray-200 flex flex-col"
      >
        {/* Enhanced Sidebar Header */}
        <div className="flex items-center justify-between h-20 px-6 border-b border-gray-100 bg-gradient-to-r from-blue-50 to-indigo-50">
          <AnimatePresence>
            {isSidebarOpen && (
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="flex items-center"
              >
                <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-lg">
                  <Coffee className="h-6 w-6 text-white" />
                </div>
                <div className="mr-3">
                  <h1 className="text-xl font-bold text-gray-900">
                    نظام المخبز
                  </h1>
                  <p className="text-sm text-gray-500">إدارة شاملة ومتطورة</p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
          <button
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            className="p-2.5 rounded-xl hover:bg-white hover:shadow-md transition-all duration-200 border border-gray-200 smooth-transition btn-enhanced enhanced-focus"
            title={
              isSidebarOpen
                ? "إخفاء القائمة الجانبية"
                : "إظهار القائمة الجانبية"
            }
          >
            {isSidebarOpen ? (
              <X className="h-5 w-5 text-gray-600" />
            ) : (
              <Menu className="h-5 w-5 text-gray-600" />
            )}
          </button>
        </div>

        {/* Search Bar */}
        <AnimatePresence>
          {isSidebarOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="p-4 border-b border-gray-100"
            >
              <div className="relative">
                <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="البحث في القوائم..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pr-10 pl-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm smooth-transition enhanced-focus"
                />
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Enhanced Navigation */}
        <nav className="flex-1 px-4 py-6 space-y-6 overflow-y-auto enhanced-scrollbar">
          {filteredSections.map((section) => {
            const colorClasses = getColorClasses(section.color);
            const sectionIcon = section.icon;

            return (
              <div key={section.id} className="space-y-2">
                {/* Enhanced Section Header */}
                {isSidebarOpen && (
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      {sectionIcon && (
                        <div
                          className={`p-1.5 rounded-lg mr-2 ${colorClasses.section}`}
                        >
                          {React.createElement(sectionIcon, {
                            className: "h-4 w-4",
                          })}
                        </div>
                      )}
                      <h3 className="text-sm font-bold text-gray-800 tracking-wide">
                        {section.title}
                      </h3>
                    </div>
                    {section.expandable && (
                      <button
                        onClick={() => toggleSection(section.id)}
                        className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors smooth-transition enhanced-focus"
                        title={
                          expandedSections[section.id]
                            ? `إخفاء ${section.title}`
                            : `إظهار ${section.title}`
                        }
                      >
                        {expandedSections[section.id] ? (
                          <ChevronDown className="h-4 w-4 text-gray-500" />
                        ) : (
                          <ChevronRight className="h-4 w-4 text-gray-500" />
                        )}
                      </button>
                    )}
                  </div>
                )}

                {/* Enhanced Section Items */}
                <AnimatePresence>
                  {(!section.expandable ||
                    expandedSections[section.id] ||
                    !isSidebarOpen) && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                      className="space-y-1"
                    >
                      {section.items.map((item) => {
                        const Icon = item.icon;
                        const isActive = isActiveLink(item.path);
                        const itemColorClasses = getColorClasses(
                          section.color,
                          isActive
                        );

                        return (
                          <Link
                            key={item.path}
                            to={item.path}
                            className={`group flex items-center px-4 py-3.5 text-sm font-medium rounded-xl transition-all duration-200 smooth-transition ${itemColorClasses.bg} ${itemColorClasses.text}`}
                          >
                            <div className="relative">
                              <Icon
                                className={`h-5 w-5 ml-3 transition-colors ${itemColorClasses.icon}`}
                              />
                              {item.badge && (
                                <span className="absolute -top-1 -left-1 h-2 w-2 bg-red-500 rounded-full"></span>
                              )}
                            </div>
                            {isSidebarOpen && (
                              <div className="flex-1 mr-3">
                                <div className="flex items-center justify-between">
                                  <span className="font-semibold">
                                    {item.name}
                                  </span>
                                  {item.badge && (
                                    <span className="px-2 py-0.5 text-xs font-medium bg-red-100 text-red-700 rounded-full">
                                      {item.badge}
                                    </span>
                                  )}
                                </div>
                                {item.description && (
                                  <div className="text-xs text-gray-500 mt-1 leading-relaxed">
                                    {item.description}
                                  </div>
                                )}
                              </div>
                            )}
                          </Link>
                        );
                      })}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            );
          })}
        </nav>

        {/* Enhanced User Section */}
        <div className="border-t border-gray-100 p-6 bg-gradient-to-r from-gray-50 to-blue-25">
          <div className="flex items-center justify-center">
            <div className="flex-shrink-0">
              <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-lg">
                <User className="h-6 w-6 text-white" />
              </div>
            </div>
            {isSidebarOpen && (
              <div className="mr-4 flex-1">
                <div className="text-sm font-bold text-gray-900">
                  {user?.name || "مستخدم"}
                </div>
                <div className="text-xs text-gray-600 mt-0.5">
                  {user?.role === "admin"
                    ? "مدير النظام الرئيسي"
                    : user?.role === "manager"
                    ? "مدير العمليات"
                    : user?.role === "distributor"
                    ? "مسؤول التوزيع"
                    : "مستخدم النظام"}
                </div>
              </div>
            )}
          </div>
        </div>
      </motion.div>

      {/* Enhanced Main Content Area */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Simple Header */}
        <header className="bg-white shadow-sm border-b border-gray-200 py-4 px-6">
          <div className="flex items-center justify-between">
            {/* Page Title */}
            <div className="flex items-center space-x-4 space-x-reverse">
              <div className="h-8 w-8 rounded-lg bg-blue-500 flex items-center justify-center">
                <Coffee className="h-4 w-4 text-white" />
              </div>
              <h2 className="text-xl font-bold text-gray-900">
                {(() => {
                  const currentPath = location.pathname;
                  for (const section of navigationSections) {
                    for (const item of section.items) {
                      if (isActiveLink(item.path)) {
                        return item.name;
                      }
                    }
                  }
                  return "لوحة التحكم";
                })()}
              </h2>
            </div>

            {/* Clock and Session Timer */}
            <div className="flex items-center space-x-6 space-x-reverse">
              {/* Current Time */}
              <div className="flex items-center space-x-2 space-x-reverse">
                <Clock className="h-4 w-4 text-gray-500" />
                <div className="text-lg font-mono text-gray-700">
                  {formatTime(currentTime)}
                </div>
              </div>
              
              {/* Session Timer */}
              <SessionTimer className="border-r border-gray-200 pr-6" />
            </div>

            {/* Logout Button */}
            <button
              onClick={handleLogout}
              className="flex items-center px-3 py-2 text-sm font-medium text-red-600 hover:text-red-700 hover:bg-red-50 rounded-lg transition-all duration-200 border border-red-200"
              title="تسجيل الخروج من النظام"
            >
              <LogOut className="h-4 w-4 ml-2" />
              <span>خروج</span>
            </button>
          </div>
        </header>

        {/* Main Content */}
        <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-50">
          <div className="min-h-full p-6">
            <Breadcrumb />
            {children}
          </div>
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;
