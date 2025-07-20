/**
 * Enhanced Features Widget
 * Dashboard widget showcasing Phase 6 Enhanced Order Management features
 */

import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import {
  Euro,
  UserCheck,
  CalendarClock,
  TrendingUp,
  ArrowRight,
  Zap,
  Clock,
  CheckCircle,
  AlertCircle,
} from "lucide-react";

// Services
import pricingService from "../../services/pricingService";
import distributorService from "../../services/distributorService";
import deliverySchedulingService from "../../services/deliverySchedulingService";

const EnhancedFeaturesWidget = ({ className = "" }) => {
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    pricing: { activeRules: 0, todayChanges: 0 },
    distributors: { available: 0, activeAssignments: 0 },
    delivery: { todaySchedules: 0, pendingConfirmations: 0 },
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadQuickStats();
  }, []);

  const loadQuickStats = async () => {
    try {
      // This would normally make actual API calls
      // For now, we'll use mock data
      setStats({
        pricing: { activeRules: 15, todayChanges: 8 },
        distributors: { available: 6, activeAssignments: 12 },
        delivery: { todaySchedules: 24, pendingConfirmations: 3 },
      });
    } catch (error) {
      console.error("Error loading stats:", error);
    } finally {
      setLoading(false);
    }
  };

  const features = [
    {
      id: "pricing",
      title: "إدارة التسعير المتقدم",
      subtitle: "قواعد التسعير الديناميكي وتتبع الأسعار",
      icon: Euro,
      color: "blue",
      path: "/pricing",
      stats: [
        {
          label: "قواعد نشطة",
          value: stats.pricing.activeRules,
          color: "text-blue-600",
        },
        {
          label: "تغييرات اليوم",
          value: stats.pricing.todayChanges,
          color: "text-green-600",
        },
      ],
      features: ["تسعير ديناميكي", "تحديث مجمع للأسعار", "تاريخ التغييرات"],
    },
    {
      id: "distributors",
      title: "إدارة الموزعين الذكية",
      subtitle: "تعيين وتتبع أداء الموزعين",
      icon: UserCheck,
      color: "green",
      path: "/distributors",
      stats: [
        {
          label: "موزع متاح",
          value: stats.distributors.available,
          color: "text-green-600",
        },
        {
          label: "تعيين نشط",
          value: stats.distributors.activeAssignments,
          color: "text-blue-600",
        },
      ],
      features: ["تعيين تلقائي", "تتبع الأداء", "تحليلات الكفاءة"],
    },
    {
      id: "delivery",
      title: "جدولة التسليم المتقدم",
      subtitle: "نظام تقويم تفاعلي وإدارة المواعيد",
      icon: CalendarClock,
      color: "purple",
      path: "/delivery",
      stats: [
        {
          label: "مواعيد اليوم",
          value: stats.delivery.todaySchedules,
          color: "text-purple-600",
        },
        {
          label: "قيد التأكيد",
          value: stats.delivery.pendingConfirmations,
          color: "text-orange-600",
        },
      ],
      features: ["تقويم تفاعلي", "تأكيد العملاء", "تحسين المسارات"],
    },
  ];

  if (loading) {
    return (
      <div className={`bg-white rounded-lg shadow-sm p-6 ${className}`}>
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 rounded mb-4"></div>
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-20 bg-gray-100 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={`bg-white rounded-lg shadow-sm overflow-hidden ${className}`}
    >
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3 space-x-reverse">
            <div className="bg-white bg-opacity-20 p-2 rounded-lg">
              <Zap className="w-6 h-6 text-white" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-white">
                الميزات المتقدمة
              </h3>
              <p className="text-blue-100 text-sm">
                نظام إدارة الطلبات المحسن - المرحلة 6
              </p>
            </div>
          </div>

          <div className="text-white text-sm">
            <TrendingUp className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Features List */}
      <div className="p-6">
        <div className="space-y-4">
          {features.map((feature, index) => {
            const Icon = feature.icon;

            return (
              <motion.div
                key={feature.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                className="group cursor-pointer"
                onClick={() => navigate(feature.path)}
              >
                <div className="border border-gray-200 rounded-lg p-4 hover:border-gray-300 hover:shadow-md transition-all duration-200 group-hover:bg-gray-50">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start space-x-4 space-x-reverse flex-1">
                      {/* Icon */}
                      <div
                        className={`p-3 bg-${feature.color}-100 rounded-lg group-hover:bg-${feature.color}-200 transition-colors`}
                      >
                        <Icon className={`w-6 h-6 text-${feature.color}-600`} />
                      </div>

                      {/* Content */}
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-2">
                          <h4 className="font-semibold text-gray-900 group-hover:text-gray-700">
                            {feature.title}
                          </h4>
                          <ArrowRight className="w-4 h-4 text-gray-400 group-hover:text-gray-600 transform group-hover:-translate-x-1 transition-all" />
                        </div>

                        <p className="text-sm text-gray-600 mb-3">
                          {feature.subtitle}
                        </p>

                        {/* Stats */}
                        <div className="flex items-center space-x-4 space-x-reverse mb-3">
                          {feature.stats.map((stat, idx) => (
                            <div
                              key={idx}
                              className="flex items-center space-x-1 space-x-reverse"
                            >
                              <span className="text-xs text-gray-500">
                                {stat.label}:
                              </span>
                              <span
                                className={`text-sm font-semibold ${stat.color}`}
                              >
                                {stat.value}
                              </span>
                            </div>
                          ))}
                        </div>

                        {/* Features Tags */}
                        <div className="flex flex-wrap gap-1">
                          {feature.features.map((feat, idx) => (
                            <span
                              key={idx}
                              className={`px-2 py-1 text-xs rounded-full bg-${feature.color}-50 text-${feature.color}-700 border border-${feature.color}-200`}
                            >
                              {feat}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* Quick Actions Footer */}
        <div className="mt-6 pt-4 border-t border-gray-200">
          <div className="grid grid-cols-3 gap-2">
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => navigate("/pricing")}
              className="flex flex-col items-center p-2 rounded-lg hover:bg-blue-50 transition-colors group"
            >
              <Euro className="w-5 h-5 text-blue-600 mb-1" />
              <span className="text-xs text-gray-600 group-hover:text-blue-700">
                التسعير
              </span>
            </motion.button>

            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => navigate("/distributors")}
              className="flex flex-col items-center p-2 rounded-lg hover:bg-green-50 transition-colors group"
            >
              <UserCheck className="w-5 h-5 text-green-600 mb-1" />
              <span className="text-xs text-gray-600 group-hover:text-green-700">
                الموزعين
              </span>
            </motion.button>

            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => navigate("/delivery")}
              className="flex flex-col items-center p-2 rounded-lg hover:bg-purple-50 transition-colors group"
            >
              <CalendarClock className="w-5 h-5 text-purple-600 mb-1" />
              <span className="text-xs text-gray-600 group-hover:text-purple-700">
                التسليم
              </span>
            </motion.button>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

// Compact version for smaller spaces
export const CompactEnhancedFeaturesWidget = ({ className = "" }) => {
  const navigate = useNavigate();

  const quickFeatures = [
    {
      id: "pricing",
      title: "التسعير الذكي",
      icon: Euro,
      color: "blue",
      path: "/pricing",
      count: "15 قاعدة",
    },
    {
      id: "distributors",
      title: "إدارة الموزعين",
      icon: UserCheck,
      color: "green",
      path: "/distributors",
      count: "6 متاح",
    },
    {
      id: "delivery",
      title: "جدولة التسليم",
      icon: CalendarClock,
      color: "purple",
      path: "/delivery",
      count: "24 موعد",
    },
  ];

  return (
    <div className={`bg-white rounded-lg shadow-sm p-4 ${className}`}>
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold text-gray-900 flex items-center">
          <Zap className="w-4 h-4 ml-2 text-blue-600" />
          الميزات المتقدمة
        </h3>
        <span className="text-xs text-gray-500">المرحلة 6</span>
      </div>

      <div className="space-y-2">
        {quickFeatures.map((feature) => {
          const Icon = feature.icon;

          return (
            <motion.button
              key={feature.id}
              whileHover={{ x: -2 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => navigate(feature.path)}
              className="w-full flex items-center justify-between p-2 rounded-lg hover:bg-gray-50 transition-colors group"
            >
              <div className="flex items-center space-x-2 space-x-reverse">
                <div className={`p-1.5 bg-${feature.color}-100 rounded`}>
                  <Icon className={`w-3.5 h-3.5 text-${feature.color}-600`} />
                </div>
                <span className="text-sm font-medium text-gray-700 group-hover:text-gray-900">
                  {feature.title}
                </span>
              </div>

              <div className="flex items-center space-x-1 space-x-reverse">
                <span className="text-xs text-gray-500">{feature.count}</span>
                <ArrowRight className="w-3 h-3 text-gray-400 transform group-hover:-translate-x-0.5 transition-transform" />
              </div>
            </motion.button>
          );
        })}
      </div>
    </div>
  );
};

export default EnhancedFeaturesWidget;
