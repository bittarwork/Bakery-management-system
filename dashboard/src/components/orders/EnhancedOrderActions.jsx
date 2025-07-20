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
      description: "إدارة الأسعار والقواعد",
      icon: Euro,
      color: "blue",
      bgColor: "bg-blue-100",
      textColor: "text-blue-800",
      hoverBg: "hover:bg-blue-200",
      borderColor: "border-blue-300",
      path: "/pricing",
      show: showPricing,
    },
    {
      id: "distributor",
      label: "تعيين موزع",
      description: "إدارة الموزعين والتعيينات",
      icon: UserCheck,
      color: "green",
      bgColor: "bg-green-100",
      textColor: "text-green-800",
      hoverBg: "hover:bg-green-200",
      borderColor: "border-green-300",
      path: "/distributors",
      show: showDistributor,
    },
    {
      id: "scheduling",
      label: "جدولة التسليم",
      description: "جدولة وإدارة التسليم",
      icon: CalendarClock,
      color: "purple",
      bgColor: "bg-purple-100",
      textColor: "text-purple-800",
      hoverBg: "hover:bg-purple-200",
      borderColor: "border-purple-300",
      path: "/delivery",
      show: showScheduling,
    },
  ];

  const visibleActions = actions.filter((action) => action.show);

  if (visibleActions.length === 0) {
    return null;
  }

  return (
    <div
      className={`bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg p-4 border border-gray-200 ${className}`}
    >
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center space-x-2 space-x-reverse">
          <TrendingUp className="w-5 h-5 text-blue-600" />
          <h3 className="text-sm font-semibold text-gray-900">
            الميزات المتقدمة
          </h3>
        </div>
        {order && (
          <div className="text-xs text-gray-500">طلب #{order.order_number}</div>
        )}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {visibleActions.map((action) => {
          const Icon = action.icon;

          return (
            <motion.button
              key={action.id}
              whileHover={{ scale: 1.02, y: -1 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => navigate(action.path)}
              className={`p-3 bg-white rounded-lg border-2 ${action.borderColor} ${action.hoverBg} transition-all duration-200 group`}
            >
              <div className="flex items-center space-x-3 space-x-reverse">
                <div
                  className={`p-2 ${action.bgColor} rounded-lg group-hover:bg-opacity-80 transition-colors`}
                >
                  <Icon className={`w-4 h-4 ${action.textColor}`} />
                </div>
                <div className="flex-1 text-right">
                  <div
                    className={`text-sm font-medium ${action.textColor} group-hover:text-gray-900`}
                  >
                    {action.label}
                  </div>
                  <div className="text-xs text-gray-600 mt-0.5">
                    {action.description}
                  </div>
                </div>
              </div>
            </motion.button>
          );
        })}
      </div>

      {/* Quick Stats if order is provided */}
      {order && (
        <div className="mt-4 pt-3 border-t border-gray-200">
          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <div className="text-xs text-gray-500">القيمة</div>
              <div className="text-sm font-semibold text-gray-900">
                €{parseFloat(order.total_amount_eur || 0).toFixed(2)}
              </div>
            </div>
            <div>
              <div className="text-xs text-gray-500">الحالة</div>
              <div className="text-sm font-semibold text-gray-900">
                {getStatusLabel(order.status)}
              </div>
            </div>
            <div>
              <div className="text-xs text-gray-500">التاريخ</div>
              <div className="text-sm font-semibold text-gray-900">
                {order.created_at
                  ? new Date(order.created_at).toLocaleDateString("ar-AE")
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
    pending: "قيد الانتظار",
    confirmed: "مؤكد",
    preparing: "قيد التحضير",
    ready: "جاهز",
    out_for_delivery: "قيد التوصيل",
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
      bgColor: "bg-blue-100",
      textColor: "text-blue-700",
      hoverBg: "hover:bg-blue-200",
    },
    {
      id: "distributor",
      icon: UserCheck,
      tooltip: "تعيين موزع",
      path: "/distributors",
      bgColor: "bg-green-100",
      textColor: "text-green-700",
      hoverBg: "hover:bg-green-200",
    },
    {
      id: "scheduling",
      icon: CalendarClock,
      tooltip: "جدولة التسليم",
      path: "/delivery",
      bgColor: "bg-purple-100",
      textColor: "text-purple-700",
      hoverBg: "hover:bg-purple-200",
    },
  ];

  return (
    <div className={`flex items-center space-x-1 space-x-reverse ${className}`}>
      {actions.map((action) => {
        const Icon = action.icon;

        return (
          <motion.button
            key={action.id}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={(e) => {
              e.stopPropagation();
              navigate(action.path);
            }}
            className={`p-1.5 ${action.bgColor} ${action.textColor} rounded-md ${action.hoverBg} transition-colors`}
            title={action.tooltip}
          >
            <Icon className="w-3.5 h-3.5" />
          </motion.button>
        );
      })}
    </div>
  );
};

// Variant for dashboard quick access
export const DashboardEnhancedActions = ({ className = "" }) => {
  const navigate = useNavigate();

  const quickActions = [
    {
      id: "pricing",
      label: "إدارة التسعير",
      subtitle: "قواعد التسعير الديناميكي",
      icon: Euro,
      path: "/pricing",
      bgColor: "bg-blue-50",
      iconBg: "bg-blue-100",
      iconColor: "text-blue-600",
      hoverBorder: "hover:border-blue-300",
      stats: "15 قاعدة نشطة",
    },
    {
      id: "distributors",
      label: "إدارة الموزعين",
      subtitle: "تعيينات ومتابعة الأداء",
      icon: UserCheck,
      path: "/distributors",
      bgColor: "bg-green-50",
      iconBg: "bg-green-100",
      iconColor: "text-green-600",
      hoverBorder: "hover:border-green-300",
      stats: "8 موزع متاح",
    },
    {
      id: "delivery",
      label: "جدولة التسليم",
      subtitle: "تقويم ومواعيد التسليم",
      icon: CalendarClock,
      path: "/delivery",
      bgColor: "bg-purple-50",
      iconBg: "bg-purple-100",
      iconColor: "text-purple-600",
      hoverBorder: "hover:border-purple-300",
      stats: "24 موعد اليوم",
    },
  ];

  return (
    <div className={`grid grid-cols-1 md:grid-cols-3 gap-4 ${className}`}>
      {quickActions.map((action) => {
        const Icon = action.icon;

        return (
          <motion.div
            key={action.id}
            whileHover={{ y: -2, boxShadow: "0 4px 25px 0 rgba(0, 0, 0, 0.1)" }}
            whileTap={{ scale: 0.98 }}
            className="cursor-pointer"
            onClick={() => navigate(action.path)}
          >
            <div
              className={`bg-white rounded-lg p-4 border border-gray-200 ${action.hoverBorder} transition-all duration-200 ${action.bgColor}`}
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-2 space-x-reverse mb-2">
                    <div className={`p-2 ${action.iconBg} rounded-lg`}>
                      <Icon className={`w-5 h-5 ${action.iconColor}`} />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900 text-sm">
                        {action.label}
                      </h3>
                      <p className="text-xs text-gray-600 mt-0.5">
                        {action.subtitle}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-xs text-gray-500">
                      {action.stats}
                    </span>
                    <div className="flex items-center space-x-1 space-x-reverse">
                      <BarChart3 className="w-3 h-3 text-gray-400" />
                      <span className="text-xs text-gray-500">
                        عرض التفاصيل
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        );
      })}
    </div>
  );
};

export default EnhancedOrderActions;
