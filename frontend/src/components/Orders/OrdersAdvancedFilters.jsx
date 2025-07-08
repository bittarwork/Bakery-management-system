import React, { useState, useEffect, useCallback } from "react";
import {
  Search,
  Filter,
  Calendar,
  DollarSign,
  Store,
  User,
  Package,
  Clock,
  X,
  ChevronDown,
  ChevronUp,
  RotateCcw,
  Save,
  BookOpen,
} from "lucide-react";

import { getLocalizedText, formatStatus } from "../../utils/formatters";

const OrdersAdvancedFilters = ({
  filters,
  onFiltersChange,
  stores = [],
  users = [],
  products = [],
  onSavePreset,
  savedPresets = [],
  onLoadPreset,
  onDeletePreset,
  className = "",
}) => {
  // Ensure stores is always an array
  const safeStores = Array.isArray(stores) ? stores : [];
  const safeUsers = Array.isArray(users) ? users : [];
  const safeProducts = Array.isArray(products) ? products : [];
  const safeSavedPresets = Array.isArray(savedPresets) ? savedPresets : [];

  // Default filter values to prevent undefined values
  const defaultFilters = {
    search: "",
    storeId: "",
    status: "",
    paymentStatus: "",
    dateFrom: "",
    dateTo: "",
    amountMin: "",
    amountMax: "",
    page: 1,
    ...filters, // Override with provided filters
  };

  const [showAdvanced, setShowAdvanced] = useState(false);
  const [tempFilters, setTempFilters] = useState(defaultFilters);
  const [presetName, setPresetName] = useState("");
  const [showPresetSave, setShowPresetSave] = useState(false);

  // Update tempFilters when filters prop changes
  useEffect(() => {
    setTempFilters({
      ...defaultFilters,
      ...filters,
    });
  }, [filters]);

  const getLocalizedText = (key) => {
    const language = "ar"; // Default language

    const translations = {
      ar: {
        filter: "تصفية",
        reset: "إعادة تعيين",
        advanced: "متقدم",
        apply: "تطبيق",
        all_stores: "جميع المتاجر",
        search: "بحث...",
        date_from: "من تاريخ",
        date_to: "إلى تاريخ",
        amount_min: "أقل مبلغ",
        amount_max: "أكبر مبلغ",
        saved_filters: "الفلاتر المحفوظة",
        save_preset: "حفظ إعداد",
        export: "تصدير",
        import_error: "خطأ في استيراد الإعدادات المحفوظة",
        preset_name: "اسم الإعداد",
        save: "حفظ",
        clear_all: "مسح الكل",
        active_filters: "الفلاتر النشطة",
      },
      en: {
        filter: "Filter",
        reset: "Reset",
        advanced: "Advanced",
        apply: "Apply",
        all_stores: "All Stores",
        search: "Search...",
        date_from: "From Date",
        date_to: "To Date",
        amount_min: "Min Amount",
        amount_max: "Max Amount",
        saved_filters: "Saved Filters",
        save_preset: "Save Preset",
        export: "Export",
        import_error: "Error importing saved settings",
        preset_name: "Preset Name",
        save: "Save",
        clear_all: "Clear All",
        active_filters: "Active Filters",
      },
    };

    return translations[language]?.[key] || key;
  };

  const getStatusOptions = () => {
    const language = "ar"; // Default language

    const options = {
      ar: [
        { value: "", label: "جميع الحالات" },
        { value: "draft", label: "مسودة" },
        { value: "confirmed", label: "مؤكد" },
        { value: "in_progress", label: "قيد التنفيذ" },
        { value: "delivered", label: "مُسلم" },
        { value: "cancelled", label: "ملغي" },
      ],
      en: [
        { value: "", label: "All Statuses" },
        { value: "draft", label: "Draft" },
        { value: "confirmed", label: "Confirmed" },
        { value: "in_progress", label: "In Progress" },
        { value: "delivered", label: "Delivered" },
        { value: "cancelled", label: "Cancelled" },
      ],
    };

    return options[language] || options.ar;
  };

  const getPaymentStatusOptions = () => {
    const language = "ar"; // Default language

    const options = {
      ar: [
        { value: "", label: "جميع حالات الدفع" },
        { value: "pending", label: "معلق" },
        { value: "partial", label: "جزئي" },
        { value: "paid", label: "مدفوع" },
        { value: "overdue", label: "متأخر" },
      ],
      en: [
        { value: "", label: "All Payment Statuses" },
        { value: "pending", label: "Pending" },
        { value: "partial", label: "Partial" },
        { value: "paid", label: "Paid" },
        { value: "overdue", label: "Overdue" },
      ],
    };

    return options[language] || options.ar;
  };

  const getQuickFilters = () => {
    const language = "ar"; // Default language

    const filters = {
      ar: [
        { key: "today", label: "اليوم", icon: Calendar },
        { key: "week", label: "هذا الأسبوع", icon: Calendar },
        { key: "month", label: "هذا الشهر", icon: Calendar },
        { key: "pending", label: "معلقة", icon: Clock },
        { key: "delivered", label: "مُسلمة", icon: Package },
        { key: "paid", label: "مدفوعة", icon: DollarSign },
      ],
      en: [
        { key: "today", label: "Today", icon: Calendar },
        { key: "week", label: "This Week", icon: Calendar },
        { key: "month", label: "This Month", icon: Calendar },
        { key: "pending", label: "Pending", icon: Clock },
        { key: "delivered", label: "Delivered", icon: Package },
        { key: "paid", label: "Paid", icon: DollarSign },
      ],
    };

    return filters[language] || filters.ar;
  };

  const statusOptions = getStatusOptions();
  const paymentStatusOptions = getPaymentStatusOptions();
  const quickFilters = getQuickFilters();

  const handleTempFilterChange = useCallback((key, value) => {
    setTempFilters((prev) => ({
      ...prev,
      [key]: value || "", // Ensure value is never undefined
    }));
  }, []);

  const applyFilters = useCallback(() => {
    onFiltersChange(tempFilters);
  }, [tempFilters, onFiltersChange]);

  const resetFilters = () => {
    const resetFilters = {
      search: "",
      storeId: "",
      status: "",
      paymentStatus: "",
      dateFrom: "",
      dateTo: "",
      amountMin: "",
      amountMax: "",
      page: 1,
    };
    setTempFilters(resetFilters);
    onFiltersChange(resetFilters);
  };

  const handleQuickFilter = (filterKey) => {
    const today = new Date();
    const startOfWeek = new Date(today);
    startOfWeek.setDate(today.getDate() - today.getDay());
    const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);

    let newFilters = { ...tempFilters };

    switch (filterKey) {
      case "today":
        newFilters.dateFrom = today.toISOString().split("T")[0];
        newFilters.dateTo = today.toISOString().split("T")[0];
        break;
      case "week":
        newFilters.dateFrom = startOfWeek.toISOString().split("T")[0];
        newFilters.dateTo = today.toISOString().split("T")[0];
        break;
      case "month":
        newFilters.dateFrom = startOfMonth.toISOString().split("T")[0];
        newFilters.dateTo = today.toISOString().split("T")[0];
        break;
      case "pending":
        newFilters.status = "confirmed";
        newFilters.paymentStatus = "pending";
        break;
      case "delivered":
        newFilters.status = "delivered";
        break;
      case "paid":
        newFilters.paymentStatus = "paid";
        break;
    }

    setTempFilters(newFilters);
    onFiltersChange(newFilters);
  };

  const savePreset = () => {
    if (!presetName.trim()) {
      return;
    }

    const preset = {
      name: presetName,
      filters: tempFilters,
      createdAt: new Date().toISOString(),
    };

    if (onSavePreset) {
      onSavePreset(preset);
    }

    setPresetName("");
    setShowPresetSave(false);
  };

  const exportPresets = () => {
    const data = JSON.stringify(safeSavedPresets, null, 2);
    const blob = new Blob([data], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `filter-presets-${
      new Date().toISOString().split("T")[0]
    }.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const importPresets = (event) => {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const importedPresets = JSON.parse(e.target.result);
        if (Array.isArray(importedPresets)) {
          const allPresets = [...safeSavedPresets, ...importedPresets];
          if (onSavePreset) {
            // Save each preset individually
            importedPresets.forEach((preset) => onSavePreset(preset));
          }
        }
      } catch (error) {
        console.error("Error importing presets:", error);
        alert(
          getLocalizedText("import_error", "خطأ في استيراد الإعدادات المحفوظة")
        );
      }
    };
    reader.readAsText(file);
  };

  // Count active filters
  const activeFiltersCount = Object.entries(tempFilters).filter(
    ([key, value]) => {
      if (key === "page") return false;
      return value && value !== "";
    }
  ).length;

  return (
    <div
      className={`bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 ${className}`}
    >
      {/* Header */}
      <div className="p-4 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3 rtl:space-x-reverse">
            <Filter className="h-5 w-5 text-gray-500 dark:text-gray-400" />
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              {getLocalizedText("filter", "تصفية")}
            </h3>
            {activeFiltersCount > 0 && (
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
                {activeFiltersCount}
              </span>
            )}
          </div>
          <div className="flex items-center space-x-2 rtl:space-x-reverse">
            <button
              onClick={resetFilters}
              className="p-2 text-gray-500 hover:text-red-600 dark:text-gray-400 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-900 rounded-lg transition-colors"
              title={getLocalizedText("reset", "إعادة تعيين")}
            >
              <RotateCcw className="h-4 w-4" />
            </button>
            <button
              onClick={() => setShowAdvanced(!showAdvanced)}
              className="flex items-center space-x-1 rtl:space-x-reverse px-3 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
            >
              <span>{getLocalizedText("advanced", "متقدم")}</span>
              {showAdvanced ? (
                <ChevronUp className="h-4 w-4" />
              ) : (
                <ChevronDown className="h-4 w-4" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Quick Filters */}
      <div className="p-4 border-b border-gray-200 dark:border-gray-700">
        <div className="flex flex-wrap gap-2">
          {quickFilters.map((filter) => {
            const Icon = filter.icon;
            return (
              <button
                key={filter.key}
                onClick={() => handleQuickFilter(filter.key)}
                className="inline-flex items-center px-3 py-1.5 text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 rounded-lg hover:bg-blue-100 dark:hover:bg-blue-900 hover:text-blue-700 dark:hover:text-blue-300 transition-colors"
              >
                <Icon className="h-4 w-4 mr-1.5 rtl:mr-0 rtl:ml-1.5" />
                {filter.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Basic Filters */}
      <div className="p-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 rtl:left-auto rtl:right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder={getLocalizedText("search", "بحث...")}
              value={tempFilters.search || ""}
              onChange={(e) => handleTempFilterChange("search", e.target.value)}
              onKeyPress={(e) => e.key === "Enter" && applyFilters()}
              className="w-full pl-10 rtl:pl-3 rtl:pr-10 pr-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
            />
          </div>

          {/* Store */}
          <div className="relative">
            <Store className="absolute left-3 rtl:left-auto rtl:right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <select
              value={tempFilters.storeId || ""}
              onChange={(e) =>
                handleTempFilterChange("storeId", e.target.value)
              }
              className="w-full pl-10 rtl:pl-3 rtl:pr-10 pr-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white appearance-none"
            >
              <option value="">
                {getLocalizedText("all_stores", "جميع المتاجر")}
              </option>
              {safeStores.map((store) => (
                <option key={store.id} value={store.id}>
                  {store.name}
                </option>
              ))}
            </select>
          </div>

          {/* Status */}
          <div className="relative">
            <Package className="absolute left-3 rtl:left-auto rtl:right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <select
              value={tempFilters.status || ""}
              onChange={(e) => handleTempFilterChange("status", e.target.value)}
              className="w-full pl-10 rtl:pl-3 rtl:pr-10 pr-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white appearance-none"
            >
              {statusOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          {/* Payment Status */}
          <div className="relative">
            <DollarSign className="absolute left-3 rtl:left-auto rtl:right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <select
              value={tempFilters.paymentStatus || ""}
              onChange={(e) =>
                handleTempFilterChange("paymentStatus", e.target.value)
              }
              className="w-full pl-10 rtl:pl-3 rtl:pr-10 pr-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white appearance-none"
            >
              {paymentStatusOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Apply Button */}
        <div className="mt-4 flex justify-end">
          <button
            onClick={applyFilters}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors"
          >
            {getLocalizedText("apply", "تطبيق")}
          </button>
        </div>
      </div>

      {/* Advanced Filters */}
      {showAdvanced && (
        <div className="border-t border-gray-200 dark:border-gray-700 p-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {/* Date Range */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                {getLocalizedText("date_from", "من تاريخ")}
              </label>
              <div className="relative">
                <Calendar className="absolute left-3 rtl:left-auto rtl:right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="date"
                  value={tempFilters.dateFrom || ""}
                  onChange={(e) =>
                    handleTempFilterChange("dateFrom", e.target.value)
                  }
                  className="w-full pl-10 rtl:pl-3 rtl:pr-10 pr-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                {getLocalizedText("date_to", "إلى تاريخ")}
              </label>
              <div className="relative">
                <Calendar className="absolute left-3 rtl:left-auto rtl:right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="date"
                  value={tempFilters.dateTo || ""}
                  onChange={(e) =>
                    handleTempFilterChange("dateTo", e.target.value)
                  }
                  className="w-full pl-10 rtl:pl-3 rtl:pr-10 pr-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                />
              </div>
            </div>

            {/* Amount Range */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                {getLocalizedText("amount_min", "أقل مبلغ")}
              </label>
              <div className="relative">
                <DollarSign className="absolute left-3 rtl:left-auto rtl:right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="number"
                  placeholder="0"
                  value={tempFilters.amountMin || ""}
                  onChange={(e) =>
                    handleTempFilterChange("amountMin", e.target.value)
                  }
                  className="w-full pl-10 rtl:pl-3 rtl:pr-10 pr-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                {getLocalizedText("amount_max", "أكبر مبلغ")}
              </label>
              <div className="relative">
                <DollarSign className="absolute left-3 rtl:left-auto rtl:right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="number"
                  placeholder="∞"
                  value={tempFilters.amountMax || ""}
                  onChange={(e) =>
                    handleTempFilterChange("amountMax", e.target.value)
                  }
                  className="w-full pl-10 rtl:pl-3 rtl:pr-10 pr-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                />
              </div>
            </div>
          </div>

          {/* Filter Presets */}
          <div className="mt-6 border-t border-gray-200 dark:border-gray-700 pt-4">
            <div className="flex items-center justify-between mb-4">
              <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300">
                {getLocalizedText("saved_filters", "الفلاتر المحفوظة")}
              </h4>
              <div className="flex items-center space-x-2 rtl:space-x-reverse">
                <button
                  onClick={() => setShowPresetSave(!showPresetSave)}
                  className="p-2 text-gray-500 hover:text-blue-600 dark:text-gray-400 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900 rounded-lg transition-colors"
                  title={getLocalizedText("save_preset", "حفظ إعداد")}
                >
                  <Save className="h-4 w-4" />
                </button>
                <button
                  onClick={exportPresets}
                  className="p-2 text-gray-500 hover:text-green-600 dark:text-gray-400 dark:hover:text-green-400 hover:bg-green-50 dark:hover:bg-green-900 rounded-lg transition-colors"
                  title={getLocalizedText("export", "تصدير")}
                >
                  <BookOpen className="h-4 w-4" />
                </button>
                <label className="p-2 text-gray-500 hover:text-purple-600 dark:text-gray-400 dark:hover:text-purple-400 hover:bg-purple-50 dark:hover:bg-purple-900 rounded-lg transition-colors cursor-pointer">
                  <input
                    type="file"
                    accept=".json"
                    onChange={importPresets}
                    className="hidden"
                  />
                  <BookOpen className="h-4 w-4" />
                </label>
              </div>
            </div>

            {/* Save Preset Form */}
            {showPresetSave && (
              <div className="mb-4 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                <div className="flex items-center space-x-2 rtl:space-x-reverse">
                  <input
                    type="text"
                    placeholder={getLocalizedText("preset_name", "اسم الإعداد")}
                    value={presetName}
                    onChange={(e) => setPresetName(e.target.value)}
                    className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                  />
                  <button
                    onClick={savePreset}
                    disabled={!presetName.trim()}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    {getLocalizedText("save", "حفظ")}
                  </button>
                  <button
                    onClick={() => setShowPresetSave(false)}
                    className="p-2 text-gray-500 hover:text-red-600 dark:text-gray-400 dark:hover:text-red-400 rounded-lg transition-colors"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              </div>
            )}

            {/* Saved Presets */}
            {safeSavedPresets.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {safeSavedPresets.map((preset, index) => (
                  <div
                    key={index}
                    className="flex items-center space-x-1 rtl:space-x-reverse bg-gray-100 dark:bg-gray-700 rounded-lg px-3 py-1.5"
                  >
                    <button
                      onClick={() => onLoadPreset && onLoadPreset(preset)}
                      className="text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                    >
                      {preset.name}
                    </button>
                    <button
                      onClick={() => onDeletePreset && onDeletePreset(index)}
                      className="p-1 text-gray-400 hover:text-red-600 dark:hover:text-red-400 rounded transition-colors"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Filter Summary */}
      {activeFiltersCount > 0 && (
        <div className="border-t border-gray-200 dark:border-gray-700 p-4 bg-blue-50 dark:bg-blue-900">
          <div className="flex items-center justify-between">
            <div className="text-sm text-blue-700 dark:text-blue-300">
              {getLocalizedText("active_filters", "الفلاتر النشطة")}:{" "}
              {activeFiltersCount}
            </div>
            <button
              onClick={resetFilters}
              className="text-sm font-medium text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-200 transition-colors"
            >
              {getLocalizedText("clear_all", "مسح الكل")}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default OrdersAdvancedFilters;
