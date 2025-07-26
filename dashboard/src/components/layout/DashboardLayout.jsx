import React, { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { motion } from "framer-motion";
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
  ChevronUp,
  Bot,
  MessageCircle,
} from "lucide-react";
import { useAuthStore } from "../../stores/authStore";
import Logo from "../ui/Logo";

const DashboardLayout = ({ children }) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [expandedSections, setExpandedSections] = useState({
    distribution: true,
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
        {
          name: "الرئيسية",
          path: "/dashboard",
          icon: LayoutDashboard,
          description: "نظرة عامة على النظام",
        },
        {
          name: "التحليلات",
          path: "/analytics",
          icon: BarChart3,
          description: "تحليلات وإحصائيات أساسية",
        },
      ],
    },
    {
      id: "distribution",
      title: "إدارة التوزيع",
      expandable: true,
      roles: ["admin", "manager"],
      items: [
        {
          name: "لوحة التوزيع",
          path: "/distribution/manager",
          icon: Truck,
          description: "إدارة عمليات التوزيع",
        },
        {
          name: "العمليات اليومية",
          path: "/distribution/daily-operations",
          icon: Coffee,
          description: "إدارة المهام اليومية",
        },
        {
          name: "التتبع المباشر",
          path: "/distribution/live-tracking",
          icon: Navigation,
          description: "تتبع مواقع الموزعين",
        },
      ],
    },
    {
      id: "management",
      title: "إدارة البيانات الأساسية",
      expandable: true,
      items: [
        {
          name: "الطلبات",
          path: "/orders",
          icon: Package,
          description: "إدارة طلبات العملاء",
        },
        {
          name: "المتاجر",
          path: "/stores",
          icon: Store,
          description: "إدارة بيانات المتاجر",
        },
        {
          name: "المنتجات",
          path: "/products",
          icon: ShoppingBag,
          description: "إدارة كتالوج المنتجات",
        },
        {
          name: "المستخدمين",
          path: "/users",
          icon: Users,
          description: "إدارة المستخدمين",
          roles: ["admin"],
        },
      ],
    },
    {
      id: "reports",
      title: "التقارير والتحليلات المتقدمة",
      expandable: true,
      roles: ["admin", "manager"],
      items: [
        {
          name: "التقارير المتقدمة",
          path: "/reports",
          icon: Brain,
          description: "تقارير شاملة وتحليلات ذكية",
        },
      ],
    },
    {
      id: "ai",
      title: "الذكاء الاصطناعي",
      items: [
        {
          name: "المساعد الذكي",
          path: "/ai-chat",
          icon: Bot,
          description: "دردشة مع المساعد الذكي للمخبز",
        },
      ],
    },
    {
      id: "system",
      title: "إعدادات النظام",
      items: [
        {
          name: "الإعدادات العامة",
          path: "/settings",
          icon: Settings,
          description: "إعدادات النظام",
          roles: ["admin"],
        },
        {
          name: "الملف الشخصي",
          path: "/profile",
          icon: User,
          description: "إدارة الملف الشخصي",
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

  return (
    <div className="flex min-h-screen bg-gray-100">
      {/* Sidebar */}
      <div
        className={`bg-white shadow-xl transition-all duration-300 ${
          isSidebarOpen ? "w-72" : "w-16"
        }`}
      >
        {/* Header */}
        <div className="flex items-center justify-between h-16 px-4 border-b border-gray-200">
          {isSidebarOpen && (
            <div className="flex items-center">
              <Logo className="h-8 w-8 ml-2" />
              <span className="text-xl font-bold text-gray-900">
                نظام المخبز
              </span>
            </div>
          )}
          <button
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
          >
            {isSidebarOpen ? (
              <X className="h-5 w-5 text-gray-600" />
            ) : (
              <Menu className="h-5 w-5 text-gray-600" />
            )}
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-2 py-4 space-y-2 overflow-y-auto">
          {navigationSections.map((section) => {
            if (!hasSectionPermission(section)) return null;

            return (
              <div key={section.id} className="space-y-1">
                {/* Section Header */}
                {isSidebarOpen && (
                  <div className="flex items-center justify-between px-3 py-2">
                    <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                      {section.title}
                    </h3>
                    {section.expandable && (
                      <button
                        onClick={() => toggleSection(section.id)}
                        className="p-1 hover:bg-gray-100 rounded"
                      >
                        {expandedSections[section.id] ? (
                          <ChevronUp className="h-3 w-3 text-gray-400" />
                        ) : (
                          <ChevronDown className="h-3 w-3 text-gray-400" />
                        )}
                      </button>
                    )}
                  </div>
                )}

                {/* Section Items */}
                {(!section.expandable || expandedSections[section.id]) && (
                  <div className="space-y-1">
                    {section.items.map((item) => {
                      if (!hasPermission(item)) return null;

                      const Icon = item.icon;
                      const isActive = isActiveLink(item.path);

                      return (
                        <Link
                          key={item.path}
                          to={item.path}
                          className={`group flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-all duration-200 ${
                            isActive
                              ? "bg-blue-50 text-blue-700 border-r-4 border-blue-700"
                              : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                          }`}
                        >
                          <Icon
                            className={`h-5 w-5 ml-3 transition-colors ${
                              isActive
                                ? "text-blue-700"
                                : "text-gray-400 group-hover:text-gray-600"
                            }`}
                          />
                          {isSidebarOpen && (
                            <div className="flex-1">
                              <div className="font-medium">{item.name}</div>
                              {item.description && (
                                <div className="text-xs text-gray-500 mt-0.5">
                                  {item.description}
                                </div>
                              )}
                            </div>
                          )}
                        </Link>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </nav>

        {/* User Menu */}
        <div className="border-t border-gray-200 p-4">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="h-10 w-10 rounded-full bg-blue-500 flex items-center justify-center">
                <User className="h-6 w-6 text-white" />
              </div>
            </div>
            {isSidebarOpen && (
              <div className="ml-3 flex-1">
                <div className="text-sm font-medium text-gray-900">
                  {user?.name}
                </div>
                <div className="text-xs text-gray-500">
                  {user?.role === "admin"
                    ? "مدير النظام"
                    : user?.role === "manager"
                    ? "مدير"
                    : user?.role === "distributor"
                    ? "موزع"
                    : "مستخدم"}
                </div>
              </div>
            )}
          </div>
          {isSidebarOpen && (
            <button
              onClick={handleLogout}
              className="mt-3 w-full flex items-center px-3 py-2 text-sm text-gray-600 hover:bg-gray-50 hover:text-gray-900 rounded-lg transition-colors"
            >
              <LogOut className="h-4 w-4 ml-2" />
              تسجيل الخروج
            </button>
          )}
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <main className="flex-1 overflow-x-hidden overflow-y-auto">
          <div className="min-h-full">{children}</div>
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;
