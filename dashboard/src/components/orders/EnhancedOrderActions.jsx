/**
 * Enhanced Order Actions Component
 * Integration buttons for Phase 6 Enhanced Order Management features
 */

import React from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import {
  Euro,
  UserCheck,
  CalendarClock,
  TrendingUp,
  ArrowRight,
  BarChart3,
  ExternalLink,
  Settings,
  Zap,
  Package,
} from "lucide-react";

const EnhancedOrderActions = ({
  order = null,
  showPricing = true,
  showDistributor = true,
  showScheduling = true,
  className = "",
}) => {
  const navigate = useNavigate();

  const actions = [
    {
      id: "pricing",
      label: "التسعير الديناميكي",
      description: "إدارة الأسعار والعروض الخاصة",
      icon: Euro,
      color: "emerald",
      path: "/pricing",
      show: showPricing,
    },
    {
      id: "distributor",
      label: "إدارة الموزعين",
      description: "تعيين وإدارة الموزعين",
      icon: UserCheck,
      color: "blue",
      path: "/distributors",
      show: showDistributor,
    },
    {
      id: "scheduling",
      label: "جدولة التسليم",
      description: "تنظيم مواعيد التسليم",
      icon: CalendarClock,
      color: "purple",
      path: "/delivery",
      show: showScheduling,
    },
  ];

  const visibleActions = actions.filter((action) => action.show);

  if (visibleActions.length === 0) {
    return null;
  }

  const getColorClasses = (color) => {
    const colorMap = {
      emerald: {
        bg: "bg-emerald-50",
        iconBg: "bg-emerald-100",
        iconText: "text-emerald-600",
        titleText: "text-emerald-800",
        border: "border-emerald-200",
        hoverBg: "hover:bg-emerald-100",
        hoverBorder: "hover:border-emerald-300",
      },
      blue: {
        bg: "bg-blue-50",
        iconBg: "bg-blue-100",
        iconText: "text-blue-600",
        titleText: "text-blue-800",
        border: "border-blue-200",
        hoverBg: "hover:bg-blue-100",
        hoverBorder: "hover:border-blue-300",
      },
      purple: {
        bg: "bg-purple-50",
        iconBg: "bg-purple-100",
        iconText: "text-purple-600",
        titleText: "text-purple-800",
        border: "border-purple-200",
        hoverBg: "hover:bg-purple-100",
        hoverBorder: "hover:border-purple-300",
      },
    };
    return colorMap[color] || colorMap.blue;
  };

  // Check if we're inside a parent container (no header needed)
  const isNested =
    className.includes("bg-transparent") || className.includes("border-0");

  return (
    <div
      className={`${
        isNested
          ? ""
          : "bg-white rounded-2xl border border-gray-200 overflow-hidden"
      } ${className}`}
    >
      {/* Header - only show if not nested */}
      {!isNested && (
        <div className="px-6 py-4 bg-gradient-to-r from-gray-50 to-blue-50 border-b border-gray-100">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3 space-x-reverse">
              <div className="p-2 bg-blue-100 rounded-xl">
                <Zap className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-gray-900">
                  الميزات المتقدمة
                </h3>
                <p className="text-sm text-gray-600">
                  أدوات إضافية لإدارة الطلب
                </p>
              </div>
            </div>
            {order && (
              <div className="text-right">
                <div className="text-xs text-gray-500">رقم الطلب</div>
                <div className="text-sm font-mono font-bold text-gray-800">
                  #{order.order_number}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Actions Grid */}
      <div className={isNested ? "" : "p-6"}>
        <div className="space-y-4">
          {visibleActions.map((action, index) => {
            const Icon = action.icon;
            const colors = getColorClasses(action.color);

            return (
              <motion.div
                key={action.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                whileHover={{ scale: 1.02, y: -2 }}
                whileTap={{ scale: 0.98 }}
                className="group cursor-pointer"
                onClick={() => navigate(action.path)}
              >
                <div
                  className={`p-5 ${colors.bg} ${colors.border} border-2 rounded-2xl ${colors.hoverBg} ${colors.hoverBorder} transition-all duration-300 shadow-sm hover:shadow-lg`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4 space-x-reverse">
                      <div
                        className={`p-3 ${colors.iconBg} rounded-2xl group-hover:scale-110 transition-transform duration-300`}
                      >
                        <Icon className={`w-6 h-6 ${colors.iconText}`} />
                      </div>
                      <div>
                        <h4
                          className={`text-lg font-bold ${colors.titleText} mb-1`}
                        >
                          {action.label}
                        </h4>
                        <p className="text-sm text-gray-600 leading-relaxed">
                          {action.description}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2 space-x-reverse">
                      <div
                        className={`p-2 ${colors.iconBg} rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300`}
                      >
                        <ExternalLink
                          className={`w-4 h-4 ${colors.iconText}`}
                        />
                      </div>
                      <ArrowRight
                        className={`w-5 h-5 ${colors.iconText} group-hover:translate-x-1 transition-transform duration-300`}
                      />
                    </div>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* Order Summary Footer - only show if not nested */}
      {order && !isNested && (
        <div className="px-6 py-4 bg-gray-50 border-t border-gray-100">
          <div className="flex items-center justify-between">
            <h4 className="text-sm font-bold text-gray-700 flex items-center">
              <BarChart3 className="w-4 h-4 mr-2" />
              ملخص الطلب
            </h4>
          </div>
          <div className="grid grid-cols-3 gap-6 mt-3">
            <div className="text-center">
              <div className="text-xs font-medium text-gray-500 mb-1">
                القيمة الإجمالية
              </div>
              <div className="text-lg font-bold text-emerald-600">
                €
                {parseFloat(
                  order.final_amount_eur || order.total_amount_eur || 0
                ).toFixed(2)}
              </div>
            </div>
            <div className="text-center">
              <div className="text-xs font-medium text-gray-500 mb-1">
                حالة الطلب
              </div>
              <div className="text-sm font-bold text-gray-800">
                {getStatusLabel(order.status)}
              </div>
            </div>
            <div className="text-center">
              <div className="text-xs font-medium text-gray-500 mb-1">
                تاريخ الإنشاء
              </div>
              <div className="text-sm font-bold text-gray-800">
                {order.created_at
                  ? new Date(order.created_at).toLocaleDateString("ar")
                  : "غير محدد"}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Nested Summary - show simplified version when nested */}
      {order && isNested && (
        <div className="mt-6 pt-4 border-t border-gray-200">
          <div className="grid grid-cols-3 gap-4 text-center">
            <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-200">
              <div className="text-xs font-medium text-emerald-600 mb-1">
                القيمة
              </div>
              <div className="text-lg font-bold text-emerald-700">
                €
                {parseFloat(
                  order.final_amount_eur || order.total_amount_eur || 0
                ).toFixed(2)}
              </div>
            </div>
            <div className="p-3 bg-blue-50 rounded-xl border border-blue-200">
              <div className="text-xs font-medium text-blue-600 mb-1">
                الحالة
              </div>
              <div className="text-sm font-bold text-blue-700">
                {getStatusLabel(order.status)}
              </div>
            </div>
            <div className="p-3 bg-gray-50 rounded-xl border border-gray-200">
              <div className="text-xs font-medium text-gray-600 mb-1">
                التاريخ
              </div>
              <div className="text-sm font-bold text-gray-700">
                {order.created_at
                  ? new Date(order.created_at).toLocaleDateString("ar")
                  : "غير محدد"}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// Helper function to get status label
const getStatusLabel = (status) => {
  const statusLabels = {
    draft: "مسودة",
    confirmed: "مؤكد",
    processing: "قيد المعالجة",
    ready: "جاهز",
    delivered: "تم التسليم",
    cancelled: "ملغي",
  };

  return statusLabels[status] || status;
};

// Variant for compact display in lists
export const CompactEnhancedActions = ({ order, className = "" }) => {
  const navigate = useNavigate();

  const actions = [
    {
      id: "pricing",
      icon: Euro,
      tooltip: "التسعير الديناميكي",
      path: "/pricing",
      color: "emerald",
    },
    {
      id: "distributor",
      icon: UserCheck,
      tooltip: "إدارة الموزعين",
      path: "/distributors",
      color: "blue",
    },
    {
      id: "scheduling",
      icon: CalendarClock,
      tooltip: "جدولة التسليم",
      path: "/delivery",
      color: "purple",
    },
  ];

  const getColorClasses = (color) => {
    const colorMap = {
      emerald: "bg-emerald-100 text-emerald-700 hover:bg-emerald-200",
      blue: "bg-blue-100 text-blue-700 hover:bg-blue-200",
      purple: "bg-purple-100 text-purple-700 hover:bg-purple-200",
    };
    return colorMap[color] || colorMap.blue;
  };

  return (
    <div className={`flex items-center space-x-2 space-x-reverse ${className}`}>
      {actions.map((action) => {
        const Icon = action.icon;
        const colors = getColorClasses(action.color);

        return (
          <motion.button
            key={action.id}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={() => navigate(action.path)}
            className={`p-3 rounded-xl ${colors} transition-all duration-200 shadow-sm hover:shadow-md`}
            title={action.tooltip}
          >
            <Icon className="w-5 h-5" />
          </motion.button>
        );
      })}
    </div>
  );
};

// Dashboard variant for home page
export const DashboardEnhancedActions = ({ className = "" }) => {
  const navigate = useNavigate();

  const dashboardActions = [
    {
      id: "orders",
      label: "إدارة الطلبات",
      description: "عرض وإدارة جميع الطلبات",
      icon: Package,
      color: "blue",
      path: "/orders",
    },
    {
      id: "pricing",
      label: "التسعير الديناميكي",
      description: "إدارة الأسعار والعروض الخاصة",
      icon: Euro,
      color: "emerald",
      path: "/pricing",
    },
    {
      id: "distributors",
      label: "إدارة الموزعين",
      description: "تعيين وإدارة الموزعين",
      icon: UserCheck,
      color: "purple",
      path: "/distributors",
    },
    {
      id: "delivery",
      label: "جدولة التسليم",
      description: "تنظيم مواعيد التسليم",
      icon: CalendarClock,
      color: "orange",
      path: "/delivery",
    },
  ];

  const getColorClasses = (color) => {
    const colorMap = {
      blue: {
        bg: "bg-blue-50",
        iconBg: "bg-blue-100",
        iconText: "text-blue-600",
        titleText: "text-blue-800",
        border: "border-blue-200",
        hoverBg: "hover:bg-blue-100",
        hoverBorder: "hover:border-blue-300",
      },
      emerald: {
        bg: "bg-emerald-50",
        iconBg: "bg-emerald-100",
        iconText: "text-emerald-600",
        titleText: "text-emerald-800",
        border: "border-emerald-200",
        hoverBg: "hover:bg-emerald-100",
        hoverBorder: "hover:border-emerald-300",
      },
      purple: {
        bg: "bg-purple-50",
        iconBg: "bg-purple-100",
        iconText: "text-purple-600",
        titleText: "text-purple-800",
        border: "border-purple-200",
        hoverBg: "hover:bg-purple-100",
        hoverBorder: "hover:border-purple-300",
      },
      orange: {
        bg: "bg-orange-50",
        iconBg: "bg-orange-100",
        iconText: "text-orange-600",
        titleText: "text-orange-800",
        border: "border-orange-200",
        hoverBg: "hover:bg-orange-100",
        hoverBorder: "hover:border-orange-300",
      },
    };
    return colorMap[color] || colorMap.blue;
  };

  return (
    <div
      className={`bg-white rounded-2xl border border-gray-200 overflow-hidden ${className}`}
    >
      {/* Header */}
      <div className="px-6 py-4 bg-gradient-to-r from-indigo-600 to-purple-600">
        <h2 className="text-xl font-bold text-white flex items-center">
          <Zap className="w-6 h-6 text-yellow-300 mr-3" />
          الميزات المتقدمة
        </h2>
        <p className="text-indigo-100 text-sm mt-1">
          أدوات متقدمة لإدارة النظام
        </p>
      </div>

      {/* Actions Grid */}
      <div className="p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {dashboardActions.map((action, index) => {
            const Icon = action.icon;
            const colors = getColorClasses(action.color);

            return (
              <motion.div
                key={action.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                whileHover={{ scale: 1.02, y: -2 }}
                whileTap={{ scale: 0.98 }}
                className="group cursor-pointer"
                onClick={() => navigate(action.path)}
              >
                <div
                  className={`p-4 ${colors.bg} ${colors.border} border-2 rounded-xl ${colors.hoverBg} ${colors.hoverBorder} transition-all duration-300 shadow-sm hover:shadow-lg`}
                >
                  <div className="flex items-center space-x-3 space-x-reverse">
                    <div
                      className={`p-2 ${colors.iconBg} rounded-xl group-hover:scale-110 transition-transform duration-300`}
                    >
                      <Icon className={`w-5 h-5 ${colors.iconText}`} />
                    </div>
                    <div className="flex-1">
                      <h4
                        className={`text-sm font-bold ${colors.titleText} mb-1`}
                      >
                        {action.label}
                      </h4>
                      <p className="text-xs text-gray-600 leading-relaxed">
                        {action.description}
                      </p>
                    </div>
                    <ArrowRight
                      className={`w-4 h-4 ${colors.iconText} group-hover:translate-x-1 transition-transform duration-300`}
                    />
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default EnhancedOrderActions;
