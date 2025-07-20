/**
 * Pricing Management Page
 * Enhanced Dynamic Pricing and Price History Management
 * Phase 6 - Complete Order Management
 */

import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { toast } from "react-hot-toast";
import {
  ChartBarIcon,
  ClockIcon,
  CogIcon,
  CurrencyEuroIcon,
  PlusIcon,
  MagnifyingGlassIcon,
  AdjustmentsHorizontalIcon,
  ArrowTrendingUpIcon,
  ArrowTrendingDownIcon,
} from "@heroicons/react/24/outline";

// Services
import pricingService from "../../services/pricingService";
import LoadingSpinner from "../../components/ui/LoadingSpinner";

const PricingManagementPage = () => {
  const [activeTab, setActiveTab] = useState("rules");
  const [loading, setLoading] = useState(false);
  const [pricingRules, setPricingRules] = useState([]);
  const [priceHistory, setPriceHistory] = useState([]);
  const [statistics, setStatistics] = useState({});
  const [productsOverview, setProductsOverview] = useState([]);
  const [bulkOperations, setBulkOperations] = useState([]);
  const [filters, setFilters] = useState({
    search: "",
    rule_type: "",
    is_active: "",
    date_from: "",
    date_to: "",
  });
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalItems: 0,
  });

  // Load initial data
  useEffect(() => {
    loadTabData();
  }, [activeTab, filters, pagination.currentPage]);

  const loadTabData = async () => {
    setLoading(true);
    try {
      switch (activeTab) {
        case "rules":
          await loadPricingRules();
          break;
        case "history":
          await loadPriceHistory();
          break;
        case "statistics":
          await loadStatistics();
          break;
        case "products":
          await loadProductsOverview();
          break;
        case "bulk":
          await loadBulkOperations();
          break;
        default:
          break;
      }
    } catch (error) {
      console.error("Error loading data:", error);
      toast.error("خطأ في تحميل البيانات");
    } finally {
      setLoading(false);
    }
  };

  const loadPricingRules = async () => {
    try {
      const response = await pricingService.getPricingRules({
        page: pagination.currentPage,
        ...filters,
      });

      if (response.success) {
        setPricingRules(response.data.rules || []);
        setPagination(response.data.pagination || {});
      }
    } catch (error) {
      console.error("Error loading pricing rules:", error);
    }
  };

  const loadPriceHistory = async () => {
    try {
      const response = await pricingService.getPriceHistory({
        page: pagination.currentPage,
        ...filters,
      });

      if (response.success) {
        setPriceHistory(response.data.history || []);
        setPagination(response.data.pagination || {});
      }
    } catch (error) {
      console.error("Error loading price history:", error);
    }
  };

  const loadStatistics = async () => {
    try {
      const response = await pricingService.getPricingStatistics({
        date_from: filters.date_from,
        date_to: filters.date_to,
      });

      if (response.success) {
        setStatistics(response.data || {});
      }
    } catch (error) {
      console.error("Error loading statistics:", error);
    }
  };

  const loadProductsOverview = async () => {
    try {
      const response = await pricingService.getProductsPricingOverview({
        search: filters.search,
        category: filters.category,
        price_range: filters.price_range,
      });

      if (response.success) {
        setProductsOverview(response.data.products || []);
      }
    } catch (error) {
      console.error("Error loading products overview:", error);
    }
  };

  const loadBulkOperations = async () => {
    try {
      const response = await pricingService.getBulkOperations({
        page: pagination.currentPage,
        ...filters,
      });

      if (response.success) {
        setBulkOperations(response.data.operations || []);
        setPagination(response.data.pagination || {});
      }
    } catch (error) {
      console.error("Error loading bulk operations:", error);
    }
  };

  const handleFilterChange = (key, value) => {
    setFilters((prev) => ({
      ...prev,
      [key]: value,
    }));
    setPagination((prev) => ({ ...prev, currentPage: 1 }));
  };

  const clearFilters = () => {
    setFilters({
      search: "",
      rule_type: "",
      is_active: "",
      date_from: "",
      date_to: "",
    });
    setPagination((prev) => ({ ...prev, currentPage: 1 }));
  };

  // Tabs configuration
  const tabs = [
    {
      id: "rules",
      name: "قواعد التسعير",
      icon: CogIcon,
      description: "إدارة قواعد التسعير الديناميكي",
    },
    {
      id: "history",
      name: "تاريخ الأسعار",
      icon: ClockIcon,
      description: "تتبع تغييرات الأسعار",
    },
    {
      id: "statistics",
      name: "الإحصائيات",
      icon: ChartBarIcon,
      description: "إحصائيات التسعير والتحليلات",
    },
    {
      id: "products",
      name: "نظرة عامة",
      icon: CurrencyEuroIcon,
      description: "نظرة عامة على أسعار المنتجات",
    },
    {
      id: "bulk",
      name: "العمليات المجمعة",
      icon: AdjustmentsHorizontalIcon,
      description: "سجل العمليات المجمعة",
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      {/* Page Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              إدارة التسعير المتقدم
            </h1>
            <p className="text-gray-600">
              نظام التسعير الديناميكي وتتبع تاريخ الأسعار
            </p>
          </div>

          <div className="flex items-center space-x-4 space-x-reverse">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="flex items-center space-x-2 space-x-reverse bg-blue-600 text-white px-4 py-2 rounded-lg shadow-lg hover:bg-blue-700 transition-colors"
              onClick={() => {
                /* TODO: Open create modal */
              }}
            >
              <PlusIcon className="w-5 h-5" />
              <span>قاعدة تسعير جديدة</span>
            </motion.button>
          </div>
        </div>
      </motion.div>

      {/* Navigation Tabs */}
      <div className="mb-6">
        <div className="border-b border-gray-200">
          <nav className="flex space-x-8 space-x-reverse">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center space-x-2 space-x-reverse py-4 px-1 border-b-2 font-medium text-sm ${
                    activeTab === tab.id
                      ? "border-blue-500 text-blue-600"
                      : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  <span>{tab.name}</span>
                </button>
              );
            })}
          </nav>
        </div>
      </div>

      {/* Filters Bar */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-lg shadow-sm p-4 mb-6"
      >
        <div className="flex flex-wrap items-center gap-4">
          {/* Search */}
          <div className="flex-1 min-w-64">
            <div className="relative">
              <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="البحث..."
                value={filters.search}
                onChange={(e) => handleFilterChange("search", e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>

          {/* Rule Type Filter (for rules tab) */}
          {activeTab === "rules" && (
            <select
              value={filters.rule_type}
              onChange={(e) => handleFilterChange("rule_type", e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">جميع الأنواع</option>
              <option value="percentage">نسبة مئوية</option>
              <option value="fixed">مبلغ ثابت</option>
              <option value="tiered">متدرج</option>
              <option value="seasonal">موسمي</option>
            </select>
          )}

          {/* Active Status Filter (for rules tab) */}
          {activeTab === "rules" && (
            <select
              value={filters.is_active}
              onChange={(e) => handleFilterChange("is_active", e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">جميع الحالات</option>
              <option value="true">نشط</option>
              <option value="false">غير نشط</option>
            </select>
          )}

          {/* Date Range */}
          <div className="flex items-center space-x-2 space-x-reverse">
            <input
              type="date"
              value={filters.date_from}
              onChange={(e) => handleFilterChange("date_from", e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            <span className="text-gray-500">إلى</span>
            <input
              type="date"
              value={filters.date_to}
              onChange={(e) => handleFilterChange("date_to", e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          {/* Clear Filters */}
          <button
            onClick={clearFilters}
            className="px-4 py-2 text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
          >
            مسح المرشحات
          </button>
        </div>
      </motion.div>

      {/* Content Area */}
      <div className="bg-white rounded-lg shadow-sm min-h-96">
        {loading ? (
          <div className="flex items-center justify-center h-64">
            <LoadingSpinner />
          </div>
        ) : (
          <div className="p-6">
            {/* Pricing Rules Tab */}
            {activeTab === "rules" && (
              <PricingRulesTab
                rules={pricingRules}
                pagination={pagination}
                onPageChange={(page) =>
                  setPagination((prev) => ({ ...prev, currentPage: page }))
                }
              />
            )}

            {/* Price History Tab */}
            {activeTab === "history" && (
              <PriceHistoryTab
                history={priceHistory}
                pagination={pagination}
                onPageChange={(page) =>
                  setPagination((prev) => ({ ...prev, currentPage: page }))
                }
              />
            )}

            {/* Statistics Tab */}
            {activeTab === "statistics" && (
              <StatisticsTab statistics={statistics} />
            )}

            {/* Products Overview Tab */}
            {activeTab === "products" && (
              <ProductsOverviewTab products={productsOverview} />
            )}

            {/* Bulk Operations Tab */}
            {activeTab === "bulk" && (
              <BulkOperationsTab
                operations={bulkOperations}
                pagination={pagination}
                onPageChange={(page) =>
                  setPagination((prev) => ({ ...prev, currentPage: page }))
                }
              />
            )}
          </div>
        )}
      </div>
    </div>
  );
};

// Pricing Rules Tab Component
const PricingRulesTab = ({ rules, pagination, onPageChange }) => {
  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold">
          قواعد التسعير ({rules.length})
        </h3>
      </div>

      {rules.length === 0 ? (
        <div className="text-center py-12">
          <CogIcon className="mx-auto h-12 w-12 text-gray-400 mb-4" />
          <p className="text-gray-500">لا توجد قواعد تسعير</p>
        </div>
      ) : (
        <div className="space-y-4">
          {rules.map((rule) => (
            <RuleCard key={rule.id} rule={rule} />
          ))}

          {pagination.totalPages > 1 && (
            <div className="mt-6">
              <Pagination
                currentPage={pagination.currentPage}
                totalPages={pagination.totalPages}
                onPageChange={onPageChange}
              />
            </div>
          )}
        </div>
      )}
    </div>
  );
};

// Rule Card Component
const RuleCard = ({ rule }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
    >
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center space-x-3 space-x-reverse">
          <h4 className="font-semibold text-gray-900">{rule.name}</h4>
          <span
            className={`px-2 py-1 rounded-full text-xs ${
              rule.is_active
                ? "bg-green-100 text-green-800"
                : "bg-gray-100 text-gray-800"
            }`}
          >
            {rule.is_active ? "نشط" : "غير نشط"}
          </span>
          <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs">
            {rule.rule_type}
          </span>
        </div>

        <div className="flex items-center space-x-2 space-x-reverse">
          <span className="text-sm text-gray-500">أولوية {rule.priority}</span>
        </div>
      </div>

      {rule.description && (
        <p className="text-gray-600 text-sm mb-3">{rule.description}</p>
      )}

      <div className="flex items-center justify-between text-sm text-gray-500">
        <span>
          الشروط: {pricingService.formatRuleConditions(rule.conditions)}
        </span>
        <span>
          الإجراء:{" "}
          {pricingService.formatRuleAction(rule.action, rule.rule_type)}
        </span>
      </div>

      {rule.start_date && rule.end_date && (
        <div className="mt-2 text-xs text-gray-400">
          صالح من {new Date(rule.start_date).toLocaleDateString("ar-AE")} إلى{" "}
          {new Date(rule.end_date).toLocaleDateString("ar-AE")}
        </div>
      )}
    </motion.div>
  );
};

// Price History Tab Component
const PriceHistoryTab = ({ history, pagination, onPageChange }) => {
  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold">
          تاريخ الأسعار ({history.length})
        </h3>
      </div>

      {history.length === 0 ? (
        <div className="text-center py-12">
          <ClockIcon className="mx-auto h-12 w-12 text-gray-400 mb-4" />
          <p className="text-gray-500">لا يوجد تاريخ أسعار</p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  المنتج
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  السعر السابق
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  السعر الجديد
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  التغيير
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  النوع
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  التاريخ
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {history.map((record) => {
                const changeInfo = pricingService.getPriceChangeInfo(
                  record.old_price_eur,
                  record.new_price_eur
                );
                return (
                  <tr key={record.id}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        {record.product_name}
                      </div>
                      {record.product_category && (
                        <div className="text-sm text-gray-500">
                          {record.product_category}
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      €{parseFloat(record.old_price_eur || 0).toFixed(2)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      €{parseFloat(record.new_price_eur || 0).toFixed(2)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`inline-flex items-center text-sm ${changeInfo.color}`}
                      >
                        {changeInfo.direction === "increase" ? (
                          <ArrowTrendingUpIcon className="w-4 h-4 ml-1" />
                        ) : changeInfo.direction === "decrease" ? (
                          <ArrowTrendingDownIcon className="w-4 h-4 ml-1" />
                        ) : null}
                        {changeInfo.text}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs">
                        {record.change_type}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(record.created_at).toLocaleString("ar-AE")}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>

          {pagination.totalPages > 1 && (
            <div className="mt-6">
              <Pagination
                currentPage={pagination.currentPage}
                totalPages={pagination.totalPages}
                onPageChange={onPageChange}
              />
            </div>
          )}
        </div>
      )}
    </div>
  );
};

// Statistics Tab Component
const StatisticsTab = ({ statistics }) => {
  const overall = statistics.overall_stats || {};
  const topProducts = statistics.top_changed_products || [];
  const dailyTrend = statistics.daily_trend || [];

  return (
    <div className="space-y-6">
      <h3 className="text-lg font-semibold">إحصائيات التسعير</h3>

      {/* Overview Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="إجمالي التغييرات"
          value={overall.total_price_changes || 0}
          icon={ChartBarIcon}
          color="blue"
        />
        <StatCard
          title="المنتجات المتأثرة"
          value={overall.affected_products || 0}
          icon={CurrencyEuroIcon}
          color="green"
        />
        <StatCard
          title="التغييرات اليدوية"
          value={overall.manual_changes || 0}
          icon={CogIcon}
          color="orange"
        />
        <StatCard
          title="التغييرات المجمعة"
          value={overall.bulk_changes || 0}
          icon={AdjustmentsHorizontalIcon}
          color="purple"
        />
      </div>

      {/* Top Changed Products */}
      {topProducts.length > 0 && (
        <div>
          <h4 className="text-md font-semibold mb-4">
            المنتجات الأكثر تغييراً
          </h4>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                    المنتج
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                    عدد التغييرات
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                    السعر الحالي
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                    أقل سعر
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                    أعلى سعر
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {topProducts.map((product) => (
                  <tr key={product.id}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        {product.name}
                      </div>
                      <div className="text-sm text-gray-500">
                        {product.category}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {product.change_count}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      €{parseFloat(product.current_price || 0).toFixed(2)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      €{parseFloat(product.lowest_price || 0).toFixed(2)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      €{parseFloat(product.highest_price || 0).toFixed(2)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

// Products Overview Tab Component
const ProductsOverviewTab = ({ products }) => {
  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold">
          نظرة عامة على المنتجات ({products.length})
        </h3>
      </div>

      {products.length === 0 ? (
        <div className="text-center py-12">
          <CurrencyEuroIcon className="mx-auto h-12 w-12 text-gray-400 mb-4" />
          <p className="text-gray-500">لا توجد منتجات</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {products.map((product) => {
            const changeInfo = pricingService.getPriceChangeInfo(
              product.previous_price_eur || product.current_price_eur,
              product.current_price_eur
            );

            return (
              <motion.div
                key={product.id}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
              >
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-semibold text-gray-900 truncate">
                    {product.name}
                  </h4>
                  <span className="text-lg font-bold text-blue-600">
                    €{parseFloat(product.current_price_eur || 0).toFixed(2)}
                  </span>
                </div>

                {product.category && (
                  <p className="text-sm text-gray-500 mb-2">
                    {product.category}
                  </p>
                )}

                {product.price_difference !== 0 && (
                  <div
                    className={`flex items-center text-sm ${changeInfo.color}`}
                  >
                    {changeInfo.direction === "increase" ? (
                      <ArrowTrendingUpIcon className="w-4 h-4 ml-1" />
                    ) : changeInfo.direction === "decrease" ? (
                      <ArrowTrendingDownIcon className="w-4 h-4 ml-1" />
                    ) : null}
                    <span>{changeInfo.text}</span>
                  </div>
                )}

                {product.last_price_change && (
                  <div className="text-xs text-gray-400 mt-2">
                    آخر تحديث:{" "}
                    {new Date(product.last_price_change).toLocaleDateString(
                      "ar-AE"
                    )}
                  </div>
                )}
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
};

// Bulk Operations Tab Component
const BulkOperationsTab = ({ operations, pagination, onPageChange }) => {
  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold">
          العمليات المجمعة ({operations.length})
        </h3>
      </div>

      {operations.length === 0 ? (
        <div className="text-center py-12">
          <AdjustmentsHorizontalIcon className="mx-auto h-12 w-12 text-gray-400 mb-4" />
          <p className="text-gray-500">لا توجد عمليات مجمعة</p>
        </div>
      ) : (
        <div className="space-y-4">
          {operations.map((operation) => {
            const statusInfo = pricingService.getBulkOperationStatus(operation);

            return (
              <motion.div
                key={operation.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="border border-gray-200 rounded-lg p-4"
              >
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center space-x-3 space-x-reverse">
                    <h4 className="font-semibold text-gray-900">
                      {operation.operation_type}
                    </h4>
                    <span
                      className={`px-2 py-1 rounded-full text-xs ${statusInfo.bgColor} ${statusInfo.color}`}
                    >
                      {statusInfo.text}
                    </span>
                  </div>
                  <div className="text-sm text-gray-500">
                    {new Date(operation.started_at).toLocaleString("ar-AE")}
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-4 text-sm">
                  <div>
                    <span className="text-gray-500">إجمالي العناصر:</span>
                    <span className="font-semibold text-gray-900 mr-2">
                      {operation.total_items}
                    </span>
                  </div>
                  <div>
                    <span className="text-gray-500">نجح:</span>
                    <span className="font-semibold text-green-600 mr-2">
                      {operation.successful_items}
                    </span>
                  </div>
                  <div>
                    <span className="text-gray-500">فشل:</span>
                    <span className="font-semibold text-red-600 mr-2">
                      {operation.failed_items}
                    </span>
                  </div>
                </div>

                {operation.executed_by_name && (
                  <div className="mt-2 text-xs text-gray-400">
                    نفذ بواسطة: {operation.executed_by_name}
                  </div>
                )}
              </motion.div>
            );
          })}

          {pagination.totalPages > 1 && (
            <div className="mt-6">
              <Pagination
                currentPage={pagination.currentPage}
                totalPages={pagination.totalPages}
                onPageChange={onPageChange}
              />
            </div>
          )}
        </div>
      )}
    </div>
  );
};

// Statistics Card Component
const StatCard = ({ title, value, icon: Icon, color }) => {
  const colorClasses = {
    blue: "bg-blue-50 text-blue-600",
    green: "bg-green-50 text-green-600",
    orange: "bg-orange-50 text-orange-600",
    purple: "bg-purple-50 text-purple-600",
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="bg-white p-4 rounded-lg border border-gray-200"
    >
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-gray-600">{title}</p>
          <p className="text-2xl font-bold text-gray-900">
            {value.toLocaleString()}
          </p>
        </div>
        <div className={`p-3 rounded-lg ${colorClasses[color]}`}>
          <Icon className="w-6 h-6" />
        </div>
      </div>
    </motion.div>
  );
};

// Pagination Component
const Pagination = ({ currentPage, totalPages, onPageChange }) => {
  return (
    <div className="flex items-center justify-center space-x-2 space-x-reverse">
      <button
        onClick={() => onPageChange(Math.max(1, currentPage - 1))}
        disabled={currentPage === 1}
        className="px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        السابق
      </button>

      <span className="px-3 py-2 text-sm text-gray-700">
        الصفحة {currentPage} من {totalPages}
      </span>

      <button
        onClick={() => onPageChange(Math.min(totalPages, currentPage + 1))}
        disabled={currentPage === totalPages}
        className="px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        التالي
      </button>
    </div>
  );
};

export default PricingManagementPage;
