import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Link } from "react-router-dom";
import {
  Plus,
  Package,
  Store,
  Users,
  FileText,
  Calendar,
  Clock,
  Zap,
  ChevronDown,
} from "lucide-react";
import { useAuthStore } from "../../stores/authStore";

const QuickActions = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { user } = useAuthStore();

  const quickActions = [
    {
      name: "طلب جديد",
      path: "/orders/new",
      icon: Package,
      description: "إضافة طلب عميل جديد",
      color: "text-blue-600 bg-blue-50",
    },
    {
      name: "متجر جديد",
      path: "/stores/new",
      icon: Store,
      description: "تسجيل متجر جديد",
      color: "text-green-600 bg-green-50",
    },
    {
      name: "منتج جديد",
      path: "/products/new",
      icon: Plus,
      description: "إضافة منتج جديد",
      color: "text-orange-600 bg-orange-50",
    },
    {
      name: "تقرير سريع",
      path: "/reports/quick",
      icon: FileText,
      description: "إنشاء تقرير سريع",
      color: "text-purple-600 bg-purple-50",
      roles: ["admin", "manager"],
    },
    {
      name: "مستخدم جديد",
      path: "/users/new",
      icon: Users,
      description: "إضافة مستخدم جديد",
      color: "text-indigo-600 bg-indigo-50",
      roles: ["admin"],
    },
  ];

  const hasPermission = (action) => {
    if (!action.roles) return true;
    return action.roles.includes(user?.role);
  };

  const filteredActions = quickActions.filter(hasPermission);

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center px-4 py-2 bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-xl hover:from-blue-600 hover:to-indigo-700 transition-all duration-200 shadow-lg hover:shadow-xl smooth-transition btn-enhanced"
      >
        <Zap className="h-4 w-4 ml-2" />
        <span className="text-sm font-medium">إجراءات سريعة</span>
        <ChevronDown
          className={`h-4 w-4 mr-2 transition-transform duration-200 ${
            isOpen ? "rotate-180" : ""
          }`}
        />
      </button>

      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop */}
            <div
              className="fixed inset-0 z-10"
              onClick={() => setIsOpen(false)}
            />
            
            {/* Dropdown */}
            <motion.div
              initial={{ opacity: 0, y: -10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -10, scale: 0.95 }}
              transition={{ duration: 0.15 }}
              className="absolute left-0 mt-2 w-80 bg-white rounded-xl shadow-2xl border border-gray-100 z-20 overflow-hidden"
            >
              <div className="p-4 border-b border-gray-100 bg-gradient-to-r from-gray-50 to-blue-50">
                <h3 className="text-sm font-bold text-gray-900 flex items-center">
                  <Zap className="h-4 w-4 ml-2 text-blue-600" />
                  الإجراءات السريعة
                </h3>
                <p className="text-xs text-gray-600 mt-1">
                  اختصارات للمهام الأكثر استخداماً
                </p>
              </div>
              
              <div className="p-2">
                {filteredActions.map((action, index) => {
                  const Icon = action.icon;
                  return (
                    <Link
                      key={action.path}
                      to={action.path}
                      onClick={() => setIsOpen(false)}
                      className="group flex items-center p-3 rounded-lg hover:bg-gray-50 transition-all duration-200 smooth-transition"
                    >
                      <div className={`p-2 rounded-lg ${action.color} group-hover:scale-110 transition-transform duration-200`}>
                        <Icon className="h-4 w-4" />
                      </div>
                      <div className="mr-3 flex-1">
                        <div className="text-sm font-medium text-gray-900 group-hover:text-blue-600 transition-colors">
                          {action.name}
                        </div>
                        <div className="text-xs text-gray-500 mt-0.5">
                          {action.description}
                        </div>
                      </div>
                      <div className="text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity">
                        <ChevronDown className="h-4 w-4 rotate-[-90deg]" />
                      </div>
                    </Link>
                  );
                })}
              </div>
              
              <div className="p-3 border-t border-gray-100 bg-gray-50">
                <div className="flex items-center justify-between text-xs text-gray-500">
                  <span>اختصارات لوحة المفاتيح:</span>
                  <span className="font-mono bg-white px-2 py-1 rounded border">
                    Ctrl + K
                  </span>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
};

export default QuickActions; 