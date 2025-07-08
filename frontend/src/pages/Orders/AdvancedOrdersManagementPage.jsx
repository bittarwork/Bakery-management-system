import React, {
  useState,
  useEffect,
  useCallback,
  useMemo,
  useRef,
} from "react";
import {
  PlusIcon,
  AdjustmentsHorizontalIcon,
  FunnelIcon,
  ViewColumnsIcon,
  TableCellsIcon,
  Squares2X2Icon,
  ArrowDownTrayIcon,
  CheckCircleIcon,
  TruckIcon,
  CreditCardIcon,
  MagnifyingGlassIcon,
  XMarkIcon,
  ExclamationTriangleIcon,
  ArrowPathIcon,
} from "@heroicons/react/24/outline";
import { CheckCircleIcon as CheckCircleIconSolid } from "@heroicons/react/24/solid";

// Components
import OrdersAdvancedStats from "../../components/Orders/OrdersAdvancedStats";
import OrdersAdvancedFilters from "../../components/Orders/OrdersAdvancedFilters";
import OrderCard from "../../components/Orders/OrderCard";
import CreateOrderModal from "../../components/Orders/CreateOrderModal";
import OrderDetailsModal from "../../components/Orders/OrderDetailsModal";

// Services
import ordersAPI from "../../services/ordersAPI";
import storesAPI from "../../services/storesAPI";

// Utils
import { useToastContext } from "../../components/common";
import { usePreferences } from "../../contexts/PreferencesContext";
import {
  formatCurrency,
  formatDate,
  formatStatus,
  getLocalizedText,
} from "../../utils/formatters";

const AdvancedOrdersManagementPage = () => {
  // Preferences
  const { preferences } = usePreferences();

  // State Management
  const [orders, setOrders] = useState([]);
  const [stores, setStores] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [refreshing, setRefreshing] = useState(false);

  // Refs for preventing duplicate calls
  const loadingRef = useRef(false);
  const storesLoadedRef = useRef(false);
  const searchTimeoutRef = useRef(null);

  // View States
  const [viewMode, setViewMode] = useState("grid"); // grid, compact, table
  const [showFilters, setShowFilters] = useState(false);

  // Pagination & Sorting
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(12);
  const [sortBy, setSortBy] = useState("created_at");
  const [sortOrder, setSortOrder] = useState("desc");

  // Filtering
  const [searchTerm, setSearchTerm] = useState("");
  const [filters, setFilters] = useState({
    search: "",
    status: "",
    storeId: "",
    paymentStatus: "",
    dateFrom: "",
    dateTo: "",
    amountMin: "",
    amountMax: "",
    userId: "",
    page: 1,
  });

  // Selection & Bulk Operations
  const [selectedOrders, setSelectedOrders] = useState(new Set());
  const [bulkOperating, setBulkOperating] = useState(false);

  // Modals
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [showBulkConfirm, setShowBulkConfirm] = useState(false);
  const [bulkAction, setBulkAction] = useState("");
  const [showExportOptions, setShowExportOptions] = useState(false);

  // Statistics
  const [statistics, setStatistics] = useState({
    totalOrders: 0,
    totalRevenue: 0,
    pendingOrders: 0,
    completedOrders: 0,
    todayOrders: 0,
    todayRevenue: 0,
    averageOrderValue: 0,
    topSellingProduct: "",
  });

  // Filter Presets
  const [filterPresets, setFilterPresets] = useState(() => {
    const saved = localStorage.getItem("orderFilterPresets");
    return saved ? JSON.parse(saved) : [];
  });

  const toast = useToastContext();

  // Data Loading
  const loadOrders = useCallback(
    async (showLoader = true) => {
      // Prevent duplicate calls
      if (loadingRef.current) return;
      loadingRef.current = true;

      try {
        if (showLoader) setLoading(true);
        setError(null);

        // Add small delay to prevent rapid successive calls
        await new Promise((resolve) => setTimeout(resolve, 100));

        // Prepare params with correct parameter names for backend
        const params = {
          page: currentPage,
          limit: pageSize,
          ...(searchTerm && { search: searchTerm }),
          ...(filters.status && { status: filters.status }),
          ...(filters.storeId && { store_id: filters.storeId }),
          ...(filters.paymentStatus && {
            payment_status: filters.paymentStatus,
          }),
          ...(filters.startDate && { date_from: filters.startDate }),
          ...(filters.endDate && { date_to: filters.endDate }),
        };

        const response = await ordersAPI.getOrders(params);
        setOrders(response.data.orders || []);

        // Update statistics
        if (response.data.statistics) {
          setStatistics(response.data.statistics);
        }
      } catch (error) {
        console.error("Error loading orders:", error);

        // Handle rate limiting specifically
        if (error.response?.status === 429) {
          const errorMsg = getLocalizedText(
            "rate_limit_error",
            "تم تجاوز الحد المسموح من الطلبات. يرجى المحاولة بعد قليل."
          );
          setError(errorMsg);
          if (toast?.error) {
            toast.error(errorMsg);
          }
        } else {
          const errorMsg = getLocalizedText(
            "load_orders_error",
            "فشل في تحميل الطلبات"
          );
          setError(errorMsg);
          if (toast?.error) {
            toast.error(errorMsg);
          }
        }
      } finally {
        setLoading(false);
        loadingRef.current = false;
      }
    },
    [currentPage, pageSize, sortBy, sortOrder, searchTerm, filters, toast]
  );

  const loadStores = useCallback(async () => {
    // Prevent duplicate calls and only load once
    if (storesLoadedRef.current) return;
    storesLoadedRef.current = true;

    try {
      const response = await storesAPI.getStores();
      const storesData = response.data || [];
      // Ensure stores is always an array
      setStores(Array.isArray(storesData) ? storesData : []);
    } catch (error) {
      console.error("Error loading stores:", error);
      // Set empty array on error and reset flag to allow retry
      setStores([]);
      storesLoadedRef.current = false;
    }
  }, []);

  // Effects with cleanup
  useEffect(() => {
    loadStores();
  }, [loadStores]);

  useEffect(() => {
    loadOrders();

    // Cleanup function to clear timeouts on unmount
    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
      loadingRef.current = false;
    };
  }, [loadOrders]);

  // Search with debounce
  useEffect(() => {
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }

    searchTimeoutRef.current = setTimeout(() => {
      setFilters((prev) => ({ ...prev, search: searchTerm, page: 1 }));
      setCurrentPage(1);
    }, 500);

    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
    };
  }, [searchTerm]);

  // Click outside handler for dropdowns
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (!event.target.closest(".dropdown-container")) {
        setShowExportOptions(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadOrders(false);
    setRefreshing(false);

    if (toast?.success) {
      toast.success(
        getLocalizedText("refresh_success", "تم تحديث البيانات بنجاح")
      );
    }
  };

  // Filter handlers
  const handleFiltersChange = useCallback((newFilters) => {
    setFilters(newFilters);
    setCurrentPage(1);
  }, []);

  const handleSavePreset = useCallback(
    (preset) => {
      const updatedPresets = [...filterPresets, preset];
      setFilterPresets(updatedPresets);
      localStorage.setItem(
        "orderFilterPresets",
        JSON.stringify(updatedPresets)
      );

      if (toast?.success) {
        toast.success(getLocalizedText("preset_saved", "تم حفظ الإعداد بنجاح"));
      }
    },
    [filterPresets, toast]
  );

  const handleLoadPreset = useCallback(
    (preset) => {
      setFilters(preset.filters);
      setCurrentPage(1);

      if (toast?.success) {
        toast.success(
          getLocalizedText("preset_loaded", "تم تحميل الإعداد بنجاح")
        );
      }
    },
    [toast]
  );

  const handleDeletePreset = useCallback(
    (index) => {
      const updatedPresets = filterPresets.filter((_, i) => i !== index);
      setFilterPresets(updatedPresets);
      localStorage.setItem(
        "orderFilterPresets",
        JSON.stringify(updatedPresets)
      );

      if (toast?.success) {
        toast.success(
          getLocalizedText("preset_deleted", "تم حذف الإعداد بنجاح")
        );
      }
    },
    [filterPresets, toast]
  );

  // Selection handlers
  const handleSelectOrder = (orderId) => {
    const newSelected = new Set(selectedOrders);
    if (newSelected.has(orderId)) {
      newSelected.delete(orderId);
    } else {
      newSelected.add(orderId);
    }
    setSelectedOrders(newSelected);
  };

  const handleSelectAll = () => {
    if (selectedOrders.size === orders.length) {
      setSelectedOrders(new Set());
    } else {
      setSelectedOrders(new Set(orders.map((order) => order.id)));
    }
  };

  const handleBulkAction = async (action) => {
    setBulkAction(action);
    setShowBulkConfirm(true);
  };

  const executeBulkAction = async () => {
    setBulkOperating(true);
    try {
      const orderIds = Array.from(selectedOrders);

      switch (bulkAction) {
        case "confirm":
          await Promise.all(
            orderIds.map((id) => ordersAPI.updateOrderStatus(id, "confirmed"))
          );
          break;
        case "deliver":
          await Promise.all(
            orderIds.map((id) => ordersAPI.updateOrderStatus(id, "delivered"))
          );
          break;
        case "mark_paid":
          await Promise.all(
            orderIds.map((id) => ordersAPI.updatePaymentStatus(id, "paid"))
          );
          break;
      }

      await loadOrders(false);
      setSelectedOrders(new Set());

      if (toast?.success) {
        toast.success(
          getLocalizedText("bulk_action_success", "تم تنفيذ العملية بنجاح")
        );
      }
    } catch (error) {
      console.error("Bulk action error:", error);
      if (toast?.error) {
        toast.error(
          getLocalizedText("bulk_action_error", "فشل في تنفيذ العملية")
        );
      }
    } finally {
      setBulkOperating(false);
      setShowBulkConfirm(false);
    }
  };

  const handleOrderUpdate = async (orderId, updates) => {
    try {
      await ordersAPI.updateOrder(orderId, updates);
      await loadOrders(false);

      if (toast?.success) {
        toast.success(
          getLocalizedText("order_updated", "تم تحديث الطلب بنجاح")
        );
      }
    } catch (error) {
      console.error("Order update error:", error);
      if (toast?.error) {
        toast.error(
          getLocalizedText("order_update_error", "فشل في تحديث الطلب")
        );
      }
    }
  };

  // Remove delete functionality - orders should not be deleted
  const handleOrderView = (order) => {
    setSelectedOrder(order);
    setShowDetailsModal(true);
  };

  const handleOrderEdit = (order) => {
    setSelectedOrder(order);
    setShowCreateModal(true);
  };

  const handleStatusUpdate = async (orderId, newStatus) => {
    try {
      await ordersAPI.updateOrderStatus(orderId, newStatus);
      await loadOrders(false);

      if (toast?.success) {
        toast.success(
          getLocalizedText("status_updated", "تم تحديث الحالة بنجاح")
        );
      }
    } catch (error) {
      console.error("Status update error:", error);
      if (toast?.error) {
        toast.error(
          getLocalizedText("status_update_error", "فشل في تحديث الحالة")
        );
      }
    }
  };

  const handlePaymentStatusUpdate = async (orderId, newPaymentStatus) => {
    try {
      await ordersAPI.updatePaymentStatus(orderId, newPaymentStatus);
      await loadOrders(false);

      if (toast?.success) {
        toast.success(
          getLocalizedText(
            "payment_status_updated",
            "تم تحديث حالة الدفع بنجاح"
          )
        );
      }
    } catch (error) {
      console.error("Payment status update error:", error);
      if (toast?.error) {
        toast.error(
          getLocalizedText(
            "payment_status_update_error",
            "فشل في تحديث حالة الدفع"
          )
        );
      }
    }
  };

  // Export functionality
  const getActiveFiltersCount = () => {
    return Object.entries(filters).filter(([key, value]) => {
      if (key === "page") return false;
      return value && value !== "";
    }).length;
  };

  const handleExport = async (format = "csv") => {
    try {
      setShowExportOptions(false);

      // Get all orders for export (not just current page)
      const exportParams = {
        ...filters,
        page: 1,
        limit: 10000, // Large number to get all orders
      };

      const response = await ordersAPI.getOrders(exportParams);
      const ordersData = response.data.orders || [];

      let content, filename, mimeType;

      switch (format) {
        case "csv":
          content = generateCSVContent(ordersData);
          filename = `orders-${new Date().toISOString().split("T")[0]}.csv`;
          mimeType = "text/csv;charset=utf-8;";
          break;
        case "json":
          content = generateJSONContent(ordersData);
          filename = `orders-${new Date().toISOString().split("T")[0]}.json`;
          mimeType = "application/json;charset=utf-8;";
          break;
        case "excel":
          content = generateExcelCSVContent(ordersData);
          filename = `orders-${new Date().toISOString().split("T")[0]}.csv`;
          mimeType = "text/csv;charset=utf-8;";
          break;
      }

      // Create and download file
      const blob = new Blob([content], { type: mimeType });
      const link = document.createElement("a");
      link.href = URL.createObjectURL(blob);
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(link.href);

      if (toast?.success) {
        toast.success(
          getLocalizedText("export_success", "تم تصدير البيانات بنجاح")
        );
      }
    } catch (error) {
      console.error("Export error:", error);
      if (toast?.error) {
        toast.error(getLocalizedText("export_error", "فشل في تصدير البيانات"));
      }
    }
  };

  const generateCSVContent = (ordersData) => {
    const language = preferences?.general?.language || "ar";

    // CSV Headers based on language
    const headers =
      language === "ar"
        ? [
            "رقم الطلب",
            "تاريخ الطلب",
            "اسم المتجر",
            "حالة الطلب",
            "حالة الدفع",
            "المبلغ الإجمالي",
            "مبلغ الخصم",
            "المبلغ النهائي",
            "تاريخ التسليم",
            "ملاحظات",
          ]
        : [
            "Order Number",
            "Order Date",
            "Store Name",
            "Order Status",
            "Payment Status",
            "Total Amount",
            "Discount Amount",
            "Final Amount",
            "Delivery Date",
            "Notes",
          ];

    const escapeCSV = (value) => {
      if (value === null || value === undefined) return "";
      const stringValue = String(value);
      if (
        stringValue.includes(",") ||
        stringValue.includes('"') ||
        stringValue.includes("\n")
      ) {
        return `"${stringValue.replace(/"/g, '""')}"`;
      }
      return stringValue;
    };

    // Generate CSV content
    let csvContent = "\uFEFF"; // BOM for UTF-8

    // Add report header
    const reportDate = formatDate(new Date());
    const filterCount = getActiveFiltersCount();

    if (language === "ar") {
      csvContent += `تقرير الطلبات\n`;
      csvContent += `تاريخ التقرير: ${reportDate}\n`;
      csvContent += `عدد الفلاتر المطبقة: ${filterCount}\n`;
      csvContent += `إجمالي الطلبات: ${ordersData.length}\n\n`;
    } else {
      csvContent += `Orders Report\n`;
      csvContent += `Report Date: ${reportDate}\n`;
      csvContent += `Applied Filters: ${filterCount}\n`;
      csvContent += `Total Orders: ${ordersData.length}\n\n`;
    }

    // Add headers
    csvContent += headers.join(",") + "\n";

    // Add data rows
    ordersData.forEach((order) => {
      const row = [
        escapeCSV(order.order_number),
        escapeCSV(formatDate(order.order_date)),
        escapeCSV(order.store?.name || ""),
        escapeCSV(formatStatus(order.status)),
        escapeCSV(formatStatus(order.payment_status)),
        escapeCSV(formatCurrency(order.total_amount)),
        escapeCSV(formatCurrency(order.discount_amount || 0)),
        escapeCSV(formatCurrency(order.final_amount)),
        escapeCSV(order.delivery_date ? formatDate(order.delivery_date) : ""),
        escapeCSV(order.notes || ""),
      ];
      csvContent += row.join(",") + "\n";
    });

    // Add summary statistics
    const totalAmount = ordersData.reduce(
      (sum, order) => sum + (order.final_amount || 0),
      0
    );
    const avgAmount =
      ordersData.length > 0 ? totalAmount / ordersData.length : 0;

    csvContent += "\n";
    if (language === "ar") {
      csvContent += `الملخص الإحصائي\n`;
      csvContent += `إجمالي المبلغ: ${formatCurrency(totalAmount)}\n`;
      csvContent += `متوسط قيمة الطلب: ${formatCurrency(avgAmount)}\n`;
    } else {
      csvContent += `Summary Statistics\n`;
      csvContent += `Total Amount: ${formatCurrency(totalAmount)}\n`;
      csvContent += `Average Order Value: ${formatCurrency(avgAmount)}\n`;
    }

    return csvContent;
  };

  const generateJSONContent = (ordersData) => {
    const exportData = {
      metadata: {
        exportDate: new Date().toISOString(),
        totalOrders: ordersData.length,
        appliedFilters: filters,
        language: preferences?.general?.language || "ar",
      },
      orders: ordersData.map((order) => ({
        ...order,
        formattedData: {
          orderDate: formatDate(order.order_date),
          deliveryDate: order.delivery_date
            ? formatDate(order.delivery_date)
            : null,
          status: formatStatus(order.status),
          paymentStatus: formatStatus(order.payment_status),
          totalAmount: formatCurrency(order.total_amount),
          finalAmount: formatCurrency(order.final_amount),
        },
      })),
    };

    return JSON.stringify(exportData, null, 2);
  };

  const generateExcelCSVContent = (ordersData) => {
    // Similar to CSV but optimized for Excel
    const headers = [
      "Order Number",
      "Order Date",
      "Store Name",
      "Status",
      "Payment Status",
      "Total Amount",
      "Discount Amount",
      "Final Amount",
      "Delivery Date",
      "Notes",
    ];

    const escapeCSV = (value) => {
      if (value === null || value === undefined) return "";
      const stringValue = String(value);
      if (
        stringValue.includes(",") ||
        stringValue.includes('"') ||
        stringValue.includes("\n")
      ) {
        return `"${stringValue.replace(/"/g, '""')}"`;
      }
      return stringValue;
    };

    let csvContent = "\uFEFF"; // BOM for UTF-8
    csvContent += headers.join(",") + "\n";

    ordersData.forEach((order) => {
      const row = [
        escapeCSV(order.order_number),
        escapeCSV(formatDate(order.order_date)),
        escapeCSV(order.store?.name || ""),
        escapeCSV(formatStatus(order.status)),
        escapeCSV(formatStatus(order.payment_status)),
        escapeCSV(order.total_amount || 0),
        escapeCSV(order.discount_amount || 0),
        escapeCSV(order.final_amount || 0),
        escapeCSV(order.delivery_date ? formatDate(order.delivery_date) : ""),
        escapeCSV(order.notes || ""),
      ];
      csvContent += row.join(",") + "\n";
    });

    return csvContent;
  };

  if (loading && !refreshing) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600 dark:text-gray-300">
            جاري تحميل الطلبات...
          </p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <ExclamationTriangleIcon className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
            خطأ في التحميل
          </h3>
          <p className="text-gray-600 dark:text-gray-300 mb-4">{error}</p>
          <button
            onClick={() => loadOrders()}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            إعادة المحاولة
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              {getLocalizedText(
                "advanced_orders_management",
                "إدارة الطلبات المتقدمة",
                "Advanced Orders Management"
              )}
            </h1>
            <p className="text-gray-600 dark:text-gray-300 mt-1">
              {getLocalizedText(
                "orders_management_description",
                "إدارة شاملة لجميع طلبات المخبز مع إحصائيات متقدمة",
                "Comprehensive management of all bakery orders with advanced statistics"
              )}
            </p>
          </div>

          <div className="flex gap-3">
            <button
              onClick={handleRefresh}
              disabled={refreshing}
              className="flex items-center gap-2 px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors disabled:opacity-50"
            >
              <ArrowPathIcon
                className={`h-4 w-4 ${refreshing ? "animate-spin" : ""}`}
              />
              {getLocalizedText("refresh", "تحديث", "Refresh")}
            </button>

            <div className="relative export-dropdown">
              <button
                onClick={() => setShowExportOptions(!showExportOptions)}
                className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
              >
                <ArrowDownTrayIcon className="h-4 w-4" />
                {getLocalizedText("export", "تصدير", "Export")}
                <svg
                  className="w-4 h-4 ml-1"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 9l-7 7-7-7"
                  />
                </svg>
              </button>

              {showExportOptions && (
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 z-50">
                  <div className="py-1">
                    <button
                      onClick={() => {
                        handleExport("csv");
                        setShowExportOptions(false);
                      }}
                      className="flex items-center gap-2 w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
                    >
                      <ArrowDownTrayIcon className="h-4 w-4" />
                      {getLocalizedText(
                        "csv_formatted",
                        "CSV (عربي منسق)",
                        "CSV (Formatted)"
                      )}
                    </button>
                    <button
                      onClick={() => {
                        handleExport("excel");
                        setShowExportOptions(false);
                      }}
                      className="flex items-center gap-2 w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
                    >
                      <ArrowDownTrayIcon className="h-4 w-4" />
                      Excel CSV
                    </button>
                    <button
                      onClick={() => {
                        handleExport("json");
                        setShowExportOptions(false);
                      }}
                      className="flex items-center gap-2 w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
                    >
                      <ArrowDownTrayIcon className="h-4 w-4" />
                      JSON
                    </button>
                    <div className="border-t border-gray-200 my-1"></div>
                    <div className="px-4 py-2 text-xs text-gray-500">
                      {getLocalizedText(
                        "export_count",
                        `سيتم تصدير ${orders.length} طلب`,
                        `Will export ${orders.length} orders`
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>

            <button
              onClick={() => setShowCreateModal(true)}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <PlusIcon className="h-4 w-4" />
              {getLocalizedText("new_order", "طلب جديد", "New Order")}
            </button>
          </div>
        </div>

        {/* Statistics */}
        <OrdersAdvancedStats statistics={statistics} />
      </div>

      {/* Controls */}
      <div className="mb-6 space-y-4">
        {/* Search and View Controls */}
        <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
          {/* Search */}
          <div className="relative flex-1 max-w-md">
            <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder={getLocalizedText(
                "search_orders",
                "البحث في الطلبات...",
                "Search orders..."
              )}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm("")}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                <XMarkIcon className="h-4 w-4" />
              </button>
            )}
          </div>

          {/* View Mode Controls */}
          <div className="flex items-center gap-3">
            <div className="flex bg-gray-100 dark:bg-gray-700 rounded-lg p-1">
              <button
                onClick={() => setViewMode("grid")}
                className={`p-2 rounded-md transition-colors ${
                  viewMode === "grid"
                    ? "bg-white dark:bg-gray-600 text-blue-600 dark:text-blue-400 shadow-sm"
                    : "text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white"
                }`}
              >
                <Squares2X2Icon className="h-4 w-4" />
              </button>
              <button
                onClick={() => setViewMode("compact")}
                className={`p-2 rounded-md transition-colors ${
                  viewMode === "compact"
                    ? "bg-white dark:bg-gray-600 text-blue-600 dark:text-blue-400 shadow-sm"
                    : "text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white"
                }`}
              >
                <ViewColumnsIcon className="h-4 w-4" />
              </button>
              <button
                onClick={() => setViewMode("table")}
                className={`p-2 rounded-md transition-colors ${
                  viewMode === "table"
                    ? "bg-white dark:bg-gray-600 text-blue-600 dark:text-blue-400 shadow-sm"
                    : "text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white"
                }`}
              >
                <TableCellsIcon className="h-4 w-4" />
              </button>
            </div>

            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-colors ${
                showFilters
                  ? "bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300"
                  : "bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600"
              }`}
            >
              <FunnelIcon className="h-4 w-4" />
              {getLocalizedText("filter", "فلترة", "Filter")}
            </button>
          </div>
        </div>

        {/* Advanced Filters */}
        {showFilters && (
          <OrdersAdvancedFilters
            filters={filters}
            onFiltersChange={handleFiltersChange}
            stores={stores}
            users={[]} // Add users data when available
            products={[]} // Add products data when available
            onSavePreset={handleSavePreset}
            savedPresets={filterPresets}
            onLoadPreset={handleLoadPreset}
            onDeletePreset={handleDeletePreset}
          />
        )}

        {/* Bulk Actions */}
        {selectedOrders.size > 0 && (
          <div className="flex items-center gap-4 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
            <span className="text-blue-700 dark:text-blue-300 font-medium">
              {getLocalizedText(
                "selected_orders",
                `تم اختيار ${selectedOrders.size} طلب`,
                `${selectedOrders.size} orders selected`
              )}
            </span>

            <div className="flex gap-2">
              <button
                onClick={() => handleBulkAction("confirm")}
                disabled={bulkOperating}
                className="flex items-center gap-1 px-3 py-1 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors disabled:opacity-50 text-sm"
              >
                <CheckCircleIcon className="h-4 w-4" />
                {getLocalizedText("confirm_all", "تأكيد الكل", "Confirm All")}
              </button>

              <button
                onClick={() => handleBulkAction("deliver")}
                disabled={bulkOperating}
                className="flex items-center gap-1 px-3 py-1 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors disabled:opacity-50 text-sm"
              >
                <TruckIcon className="h-4 w-4" />
                {getLocalizedText("deliver_all", "تسليم الكل", "Deliver All")}
              </button>

              <button
                onClick={() => handleBulkAction("mark_paid")}
                disabled={bulkOperating}
                className="flex items-center gap-1 px-3 py-1 bg-purple-600 text-white rounded-md hover:bg-purple-700 transition-colors disabled:opacity-50 text-sm"
              >
                <CreditCardIcon className="h-4 w-4" />
                {getLocalizedText(
                  "mark_as_paid",
                  "تحديد كمدفوع",
                  "Mark as Paid"
                )}
              </button>
            </div>

            <button
              onClick={() => setSelectedOrders(new Set())}
              className="mr-auto text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
            >
              <XMarkIcon className="h-4 w-4" />
            </button>
          </div>
        )}
      </div>

      {/* Orders Content */}
      {orders.length === 0 ? (
        <div className="text-center py-12 bg-white dark:bg-gray-800 rounded-lg shadow-sm">
          <div className="text-gray-400 mb-4">
            <svg
              className="h-16 w-16 mx-auto"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1}
                d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
              />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
            {getLocalizedText("no_orders", "لا توجد طلبات", "No Orders")}
          </h3>
          <p className="text-gray-600 dark:text-gray-300 mb-4">
            {getLocalizedText(
              "no_orders_found",
              "لم يتم العثور على أي طلبات تطابق المعايير المحددة",
              "No orders found matching the specified criteria"
            )}
          </p>
          <button
            onClick={() => setShowCreateModal(true)}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            {getLocalizedText(
              "create_first_order",
              "إنشاء أول طلب",
              "Create First Order"
            )}
          </button>
        </div>
      ) : (
        <>
          {/* Orders Grid */}
          <div
            className={`grid gap-6 ${
              viewMode === "grid"
                ? "grid-cols-1 md:grid-cols-2 xl:grid-cols-3"
                : viewMode === "compact"
                ? "grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
                : "grid-cols-1"
            }`}
          >
            {orders.map((order) => (
              <div key={order.id} className="relative">
                {/* Selection Checkbox */}
                <div className="absolute top-3 left-3 z-10">
                  <input
                    type="checkbox"
                    checked={selectedOrders.has(order.id)}
                    onChange={() => handleSelectOrder(order.id)}
                    className="w-4 h-4 text-blue-600 bg-white border-gray-300 rounded focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
                  />
                </div>

                <OrderCard
                  order={order}
                  viewMode={viewMode}
                  onStatusUpdate={(orderId, status) =>
                    handleStatusUpdate(orderId, status)
                  }
                  onPaymentStatusUpdate={(orderId, paymentStatus) =>
                    handlePaymentStatusUpdate(orderId, paymentStatus)
                  }
                  onDelete={handleOrderView}
                  onView={(order) => {
                    setSelectedOrder(order);
                    setShowDetailsModal(true);
                  }}
                />
              </div>
            ))}
          </div>

          {/* Pagination */}
          {Math.ceil(orders.length / pageSize) > 1 && (
            <div className="flex items-center justify-between mt-8 px-4 py-3 bg-white dark:bg-gray-800 rounded-lg shadow-sm">
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-600 dark:text-gray-300">
                  {getLocalizedText(
                    "showing_results",
                    `عرض ${(currentPage - 1) * pageSize + 1} إلى ${Math.min(
                      currentPage * pageSize,
                      orders.length
                    )} من ${orders.length} طلب`,
                    `Showing ${(currentPage - 1) * pageSize + 1} to ${Math.min(
                      currentPage * pageSize,
                      orders.length
                    )} of ${orders.length} orders`
                  )}
                </span>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                  disabled={currentPage === 1}
                  className="px-3 py-1 text-sm bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded hover:bg-gray-200 dark:hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {getLocalizedText("previous", "السابق", "Previous")}
                </button>

                <span className="text-sm text-gray-600 dark:text-gray-300">
                  {getLocalizedText(
                    "page_of",
                    `${currentPage} من ${Math.ceil(orders.length / pageSize)}`,
                    `${currentPage} of ${Math.ceil(orders.length / pageSize)}`
                  )}
                </span>

                <button
                  onClick={() =>
                    setCurrentPage(
                      Math.min(
                        Math.ceil(orders.length / pageSize),
                        currentPage + 1
                      )
                    )
                  }
                  disabled={currentPage === Math.ceil(orders.length / pageSize)}
                  className="px-3 py-1 text-sm bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded hover:bg-gray-200 dark:hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {getLocalizedText("next", "التالي", "Next")}
                </button>
              </div>
            </div>
          )}
        </>
      )}

      {/* Modals */}
      {showCreateModal && (
        <CreateOrderModal
          isOpen={showCreateModal}
          onClose={() => setShowCreateModal(false)}
          onSuccess={() => {
            setShowCreateModal(false);
            loadOrders(false);
          }}
        />
      )}

      {showDetailsModal && selectedOrder && (
        <OrderDetailsModal
          isOpen={showDetailsModal}
          onClose={() => {
            setShowDetailsModal(false);
            setSelectedOrder(null);
          }}
          orderId={selectedOrder.id}
          onStatusUpdate={handleStatusUpdate}
          onPaymentStatusUpdate={handlePaymentStatusUpdate}
          onEdit={handleOrderEdit}
          onDelete={handleOrderView}
        />
      )}

      {/* Bulk Action Confirmation */}
      {showBulkConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-md w-full mx-4">
            <div className="flex items-center gap-3 mb-4">
              <ExclamationTriangleIcon className="h-6 w-6 text-amber-500" />
              <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                {getLocalizedText(
                  "confirm_bulk_action",
                  "تأكيد العملية المجمعة",
                  "Confirm Bulk Action"
                )}
              </h3>
            </div>

            <p className="text-gray-600 dark:text-gray-300 mb-6">
              {getLocalizedText(
                "bulk_action_confirmation",
                `هل أنت متأكد من تنفيذ هذه العملية على ${selectedOrders.size} طلب؟`,
                `Are you sure you want to perform this action on ${selectedOrders.size} orders?`
              )}
            </p>

            <div className="flex gap-3 justify-end">
              <button
                onClick={() => setShowBulkConfirm(false)}
                disabled={bulkOperating}
                className="px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors disabled:opacity-50"
              >
                {getLocalizedText("cancel", "إلغاء", "Cancel")}
              </button>
              <button
                onClick={executeBulkAction}
                disabled={bulkOperating}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50"
              >
                {bulkOperating
                  ? getLocalizedText(
                      "executing",
                      "جاري التنفيذ...",
                      "Executing..."
                    )
                  : getLocalizedText("confirm", "تأكيد", "Confirm")}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdvancedOrdersManagementPage;
