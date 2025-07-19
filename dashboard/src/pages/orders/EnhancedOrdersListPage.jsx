import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import {
  Plus,
  Package,
  Clock,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Search,
  Filter,
  Store,
  Eye,
  Edit,
  Download,
  RefreshCw,
  Euro,
  ShoppingCart,
  CreditCard,
  FileText,
  Users,
  Truck,
  X,
  ChevronLeft,
  ChevronRight,
  User,
  Calendar as CalendarIcon,
  BarChart3,
  TrendingUp,
  Activity,
  Award,
  Target,
  Zap,
  Shield,
  Info,
  Settings,
  MoreVertical,
  Calculator,
  Coins,
  DollarSign,
  Globe,
  Loader2,
  Grid,
  List,
  Archive,
  Star,
  Heart,
  Bookmark,
  Tag,
  MapPin,
  Building,
  Receipt,
  Copy,
  ExternalLink,
  Share,
  Bell,
  Mail,
  MessageSquare,
  Phone,
  Calendar,
  Map,
  Layers,
  ArrowUpDown,
  ChevronDown,
  ChevronUp,
  ChevronsUpDown,
  SortAsc,
  SortDesc,
  Filter as FilterIcon,
  Trash2,
  Archive as ArchiveIcon,
  Send,
  Printer,
  FileText as FileTextIcon,
  Check,
} from "lucide-react";
import { Link } from "react-router-dom";
import { Card, CardHeader, CardBody } from "../../components/ui/Card";
import EnhancedButton from "../../components/ui/EnhancedButton";
import EnhancedInput from "../../components/ui/EnhancedInput";
import LoadingSpinner from "../../components/ui/LoadingSpinner";
import { DeleteConfirmationModal } from "../../components/ui/Modal";
import orderService from "../../services/orderService";
import storeService from "../../services/storeService";
import userService from "../../services/userService";
import { toast } from "react-hot-toast";

const EnhancedOrdersListPage = () => {
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [stores, setStores] = useState([]);
  const [distributors, setDistributors] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isExporting, setIsExporting] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [selectedOrders, setSelectedOrders] = useState([]);
  const [deleteModal, setDeleteModal] = useState({
    isOpen: false,
    orderId: null,
    isLoading: false,
  });

  // Enhanced filters state
  const [filters, setFilters] = useState({
    status: "",
    payment_status: "",
    store_id: "",
    distributor_id: "",
    priority: "",
    date_from: "",
    date_to: "",
    delivery_date_from: "",
    delivery_date_to: "",
    amount_min: "",
    amount_max: "",
    currency: "",
    search: "",
    page: 1,
    limit: 12,
    sortBy: "created_at",
    sortOrder: "DESC",
  });

  // Statistics state
  const [statistics, setStatistics] = useState({
    total_orders: 0,
    total_amount_eur: 0,
    total_amount_syp: 0,
    orders_by_status: {},
    orders_by_payment_status: {},
    orders_by_priority: {},
    orders_by_currency: {},
    average_order_value: 0,
    pending_orders: 0,
    completed_orders: 0,
    urgent_orders: 0,
    overdue_orders: 0,
    monthly_growth: 12.5,
    revenue_growth: 18.3,
  });

  // Pagination state
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalItems: 0,
    itemsPerPage: 12,
  });

  // View mode state
  const [viewMode, setViewMode] = useState("table"); // "table" or "cards"

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.3,
      },
    },
  };

  // Format currency helper
  const formatCurrency = (amount, currency = "EUR") => {
    if (currency === "SYP") {
      return new Intl.NumberFormat("en-US", {
        style: "currency",
        currency: "SYP",
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
      }).format(amount);
    }
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "EUR",
      minimumFractionDigits: 2,
    }).format(amount);
  };

  // Statistics Cards Component
  const StatisticsCards = () => (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6"
    >
      {/* Total Orders */}
      <motion.div variants={itemVariants}>
        <Card className="border-0 shadow-lg hover:shadow-xl transition-all duration-300 bg-gradient-to-br from-blue-50 to-blue-100">
          <CardBody className="p-6">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <div className="flex items-center space-x-3">
                  <div className="p-3 bg-blue-500 rounded-xl shadow-md">
                    <Package className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-600">
                      Total Orders
                    </p>
                    <p className="text-2xl font-bold text-gray-900">
                      {statistics.total_orders?.toLocaleString() || 0}
                    </p>
                  </div>
                </div>
                <div className="mt-3 flex items-center space-x-1">
                  <TrendingUp className="w-4 h-4 text-green-600" />
                  <span className="text-sm text-green-600 font-medium">
                    +{statistics.monthly_growth || 0}%
                  </span>
                  <span className="text-sm text-gray-500">vs last month</span>
                </div>
              </div>
            </div>
          </CardBody>
        </Card>
      </motion.div>

      {/* Total Revenue EUR */}
      <motion.div variants={itemVariants}>
        <Card className="border-0 shadow-lg hover:shadow-xl transition-all duration-300 bg-gradient-to-br from-green-50 to-green-100">
          <CardBody className="p-6">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <div className="flex items-center space-x-3">
                  <div className="p-3 bg-green-500 rounded-xl shadow-md">
                    <Euro className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-600">
                      Revenue (EUR)
                    </p>
                    <p className="text-2xl font-bold text-gray-900">
                      {formatCurrency(statistics.total_amount_eur || 0)}
                    </p>
                  </div>
                </div>
                <div className="mt-3 flex items-center space-x-1">
                  <TrendingUp className="w-4 h-4 text-green-600" />
                  <span className="text-sm text-green-600 font-medium">
                    +{statistics.revenue_growth || 0}%
                  </span>
                  <span className="text-sm text-gray-500">vs last month</span>
                </div>
              </div>
            </div>
          </CardBody>
        </Card>
      </motion.div>

      {/* Total Revenue SYP */}
      <motion.div variants={itemVariants}>
        <Card className="border-0 shadow-lg hover:shadow-xl transition-all duration-300 bg-gradient-to-br from-purple-50 to-purple-100">
          <CardBody className="p-6">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <div className="flex items-center space-x-3">
                  <div className="p-3 bg-purple-500 rounded-xl shadow-md">
                    <Coins className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-600">
                      Revenue (SYP)
                    </p>
                    <p className="text-2xl font-bold text-gray-900">
                      {formatCurrency(statistics.total_amount_syp || 0, "SYP")}
                    </p>
                  </div>
                </div>
                <div className="mt-3 flex items-center space-x-1">
                  <Globe className="w-4 h-4 text-purple-600" />
                  <span className="text-sm text-purple-600 font-medium">
                    Multi-Currency
                  </span>
                </div>
              </div>
            </div>
          </CardBody>
        </Card>
      </motion.div>

      {/* Pending Orders */}
      <motion.div variants={itemVariants}>
        <Card className="border-0 shadow-lg hover:shadow-xl transition-all duration-300 bg-gradient-to-br from-orange-50 to-orange-100">
          <CardBody className="p-6">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <div className="flex items-center space-x-3">
                  <div className="p-3 bg-orange-500 rounded-xl shadow-md">
                    <Clock className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-600">
                      Pending Orders
                    </p>
                    <p className="text-2xl font-bold text-gray-900">
                      {statistics.pending_orders || 0}
                    </p>
                  </div>
                </div>
                <div className="mt-3 flex items-center space-x-1">
                  <AlertTriangle className="w-4 h-4 text-orange-600" />
                  <span className="text-sm text-orange-600 font-medium">
                    {statistics.urgent_orders || 0} urgent
                  </span>
                </div>
              </div>
            </div>
          </CardBody>
        </Card>
      </motion.div>
    </motion.div>
  );

  // Fetch orders with current filters
  const fetchOrders = async (resetPage = false) => {
    try {
      setIsLoading(true);

      const queryParams = {
        ...filters,
        page: resetPage ? 1 : filters.page,
      };

      const response = await orderService.getOrders(queryParams);

      if (response.success) {
        // Filter out any null/undefined orders
        const validOrders = (response.data.orders || []).filter(
          (order) => order && order.id !== undefined && order.id !== null
        );

        setOrders(validOrders);
        setStatistics(response.data.statistics || {});
        setPagination({
          currentPage: response.data.pagination?.page || 1,
          totalPages: response.data.pagination?.totalPages || 1,
          totalItems: response.data.pagination?.total || 0,
          itemsPerPage: response.data.pagination?.limit || 12,
        });

        // Update pagination if needed
        if (resetPage) {
          setFilters((prev) => ({ ...prev, page: 1 }));
        }
      }
    } catch (error) {
      console.error("Error fetching orders:", error);
      toast.error("Failed to fetch orders");
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch stores for filter dropdown
  const fetchStores = async () => {
    try {
      const response = await storeService.getStores({ limit: 1000 });
      if (response.success) {
        setStores(response.data.stores || []);
      }
    } catch (error) {
      console.error("Error fetching stores:", error);
    }
  };

  // Fetch distributors for filter dropdown
  const fetchDistributors = async () => {
    try {
      const response = await userService.getUsers({
        role: "distributor",
        limit: 1000,
      });
      if (response.success) {
        setDistributors(response.data.users || []);
      }
    } catch (error) {
      console.error("Error fetching distributors:", error);
    }
  };

  // Initialize data
  useEffect(() => {
    fetchOrders();
    fetchStores();
    fetchDistributors();
  }, []);

  // Refetch when filters change
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      fetchOrders(true);
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [
    filters.status,
    filters.payment_status,
    filters.store_id,
    filters.distributor_id,
    filters.priority,
    filters.date_from,
    filters.date_to,
    filters.delivery_date_from,
    filters.delivery_date_to,
    filters.amount_min,
    filters.amount_max,
    filters.currency,
    filters.search,
  ]);

  // Handle filter changes
  const handleFilterChange = (key, value) => {
    setFilters((prev) => ({
      ...prev,
      [key]: value,
      page: 1, // Reset page when filters change
    }));
  };

  // Clear all filters
  const clearFilters = () => {
    setFilters({
      status: "",
      payment_status: "",
      store_id: "",
      distributor_id: "",
      priority: "",
      date_from: "",
      date_to: "",
      delivery_date_from: "",
      delivery_date_to: "",
      amount_min: "",
      amount_max: "",
      currency: "",
      search: "",
      page: 1,
      limit: 12,
      sortBy: "created_at",
      sortOrder: "DESC",
    });
  };

  // Apply quick filters
  const applyQuickFilter = (filterType, value) => {
    setFilters((prev) => ({
      ...prev,
      [filterType]: value,
      page: 1,
    }));
  };

  // Handle export
  const handleExport = async () => {
    try {
      setIsExporting(true);
      const response = await orderService.exportOrders(filters);
      if (response.success) {
        // Create download link
        const blob = new Blob([response.data], { type: "text/csv" });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `orders-${new Date().toISOString().split("T")[0]}.csv`;
        a.click();
        window.URL.revokeObjectURL(url);
        toast.success("Orders exported successfully");
      }
    } catch (error) {
      console.error("Error exporting orders:", error);
      toast.error("Failed to export orders");
    } finally {
      setIsExporting(false);
    }
  };

  // Handle pagination
  const handlePageChange = (newPage) => {
    setFilters((prev) => ({ ...prev, page: newPage }));
    fetchOrders();
  };

  // Status badge component
  const StatusBadge = ({ status, type = "order" }) => {
    const statusConfig =
      type === "order"
        ? orderService.getStatusOptions()
        : orderService.getPaymentStatusOptions();

    const config = statusConfig.find((s) => s.value === status);

    if (!config) return null;

    const colorClasses = {
      gray: "bg-gray-100 text-gray-800 border-gray-200",
      blue: "bg-blue-100 text-blue-800 border-blue-200",
      yellow: "bg-yellow-100 text-yellow-800 border-yellow-200",
      green: "bg-green-100 text-green-800 border-green-200",
      red: "bg-red-100 text-red-800 border-red-200",
    };

    return (
      <span
        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${
          colorClasses[config.color]
        }`}
      >
        {config.label}
      </span>
    );
  };

  // Priority badge component
  const PriorityBadge = ({ priority }) => {
    const priorityConfig = {
      low: {
        label: "Low",
        color: "bg-gray-100 text-gray-800 border-gray-200",
        icon: Clock,
      },
      medium: {
        label: "Medium",
        color: "bg-blue-100 text-blue-800 border-blue-200",
        icon: Clock,
      },
      high: {
        label: "High",
        color: "bg-orange-100 text-orange-800 border-orange-200",
        icon: AlertTriangle,
      },
      urgent: {
        label: "Urgent",
        color: "bg-red-100 text-red-800 border-red-200",
        icon: AlertTriangle,
      },
    };

    const config = priorityConfig[priority] || priorityConfig.medium;
    const IconComponent = config.icon;

    return (
      <span
        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${config.color}`}
      >
        <IconComponent className="w-3 h-3 mr-1" />
        {config.label}
      </span>
    );
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Enhanced Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="flex flex-col sm:flex-row justify-between items-start sm:items-center bg-gradient-to-r from-blue-50 to-purple-50 p-6 rounded-xl border border-blue-100"
      >
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Orders Management
          </h1>
          <p className="text-gray-600 flex items-center space-x-2">
            <Package className="w-4 h-4" />
            <span>Manage and track all bakery orders</span>
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-3 mt-4 sm:mt-0">
          <EnhancedButton
            variant="outline"
            size="sm"
            onClick={() => setShowFilters(!showFilters)}
            icon={<Filter className="w-4 h-4" />}
            className="bg-white hover:bg-gray-50"
          >
            {showFilters ? "Hide Filters" : "Show Filters"}
          </EnhancedButton>
          <EnhancedButton
            variant="outline"
            size="sm"
            onClick={handleExport}
            icon={<Download className="w-4 h-4" />}
            loading={isExporting}
            className="bg-white hover:bg-gray-50"
          >
            Export
          </EnhancedButton>
          <EnhancedButton
            variant="outline"
            size="sm"
            onClick={() => fetchOrders()}
            icon={<RefreshCw className="w-4 h-4" />}
            className="bg-white hover:bg-gray-50"
          >
            Refresh
          </EnhancedButton>
          <EnhancedButton
            variant="outline"
            size="sm"
            onClick={() =>
              setViewMode(viewMode === "table" ? "cards" : "table")
            }
            icon={
              viewMode === "table" ? (
                <Grid className="w-4 h-4" />
              ) : (
                <List className="w-4 h-4" />
              )
            }
            className="bg-white hover:bg-gray-50"
          >
            {viewMode === "table" ? "Card View" : "Table View"}
          </EnhancedButton>
          <Link to="/orders/create">
            <EnhancedButton
              variant="primary"
              size="sm"
              icon={<Plus className="w-4 h-4" />}
              className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
            >
              New Order
            </EnhancedButton>
          </Link>
        </div>
      </motion.div>

      {/* Statistics */}
      <StatisticsCards />

      {/* Enhanced Search and Quick Filters */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <Card className="border-0 shadow-lg">
          <CardBody className="p-6">
            <div className="flex flex-col lg:flex-row gap-4">
              <div className="flex-1">
                <EnhancedInput
                  placeholder="Search orders by number, store, or customer..."
                  value={filters.search}
                  onChange={(e) => handleFilterChange("search", e.target.value)}
                  icon={<Search className="w-4 h-4" />}
                  className="w-full"
                />
              </div>
              <div className="flex flex-wrap gap-3">
                <select
                  value={filters.status}
                  onChange={(e) => handleFilterChange("status", e.target.value)}
                  className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white text-gray-900 min-w-32"
                >
                  <option value="">All Statuses</option>
                  {orderService.getStatusOptions().map((status) => (
                    <option key={status.value} value={status.value}>
                      {status.label}
                    </option>
                  ))}
                </select>
                <select
                  value={filters.store_id}
                  onChange={(e) =>
                    handleFilterChange("store_id", e.target.value)
                  }
                  className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white text-gray-900 min-w-32"
                >
                  <option value="">All Stores</option>
                  {stores.map((store) => (
                    <option key={store.id} value={store.id}>
                      {store.name}
                    </option>
                  ))}
                </select>
                <select
                  value={filters.priority}
                  onChange={(e) =>
                    handleFilterChange("priority", e.target.value)
                  }
                  className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white text-gray-900 min-w-32"
                >
                  <option value="">All Priorities</option>
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                  <option value="urgent">Urgent</option>
                </select>
                <select
                  value={filters.currency}
                  onChange={(e) =>
                    handleFilterChange("currency", e.target.value)
                  }
                  className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white text-gray-900 min-w-32"
                >
                  <option value="">All Currencies</option>
                  <option value="EUR">EUR</option>
                  <option value="SYP">SYP</option>
                </select>
              </div>
            </div>
          </CardBody>
        </Card>
      </motion.div>

      {/* Enhanced Filters Panel */}
      <AnimatePresence>
        {showFilters && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
          >
            <Card className="border-0 shadow-lg">
              <CardHeader className="border-b border-gray-200 bg-gradient-to-r from-gray-50 to-white">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <FilterIcon className="w-5 h-5 text-gray-600" />
                    <h3 className="text-lg font-semibold text-gray-900">
                      Advanced Filters
                    </h3>
                  </div>
                  <EnhancedButton
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowFilters(false)}
                    icon={<X className="w-4 h-4" />}
                  />
                </div>
              </CardHeader>
              <CardBody className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                  {/* Status filter */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Order Status
                    </label>
                    <select
                      value={filters.status}
                      onChange={(e) =>
                        handleFilterChange("status", e.target.value)
                      }
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white text-gray-900"
                    >
                      <option value="">All Statuses</option>
                      {orderService.getStatusOptions().map((status) => (
                        <option key={status.value} value={status.value}>
                          {status.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Payment Status filter */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Payment Status
                    </label>
                    <select
                      value={filters.payment_status}
                      onChange={(e) =>
                        handleFilterChange("payment_status", e.target.value)
                      }
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white text-gray-900"
                    >
                      <option value="">All Payment Statuses</option>
                      {orderService.getPaymentStatusOptions().map((status) => (
                        <option key={status.value} value={status.value}>
                          {status.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Priority filter */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Priority Level
                    </label>
                    <select
                      value={filters.priority}
                      onChange={(e) =>
                        handleFilterChange("priority", e.target.value)
                      }
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white text-gray-900"
                    >
                      <option value="">All Priorities</option>
                      <option value="low">Low Priority</option>
                      <option value="medium">Medium Priority</option>
                      <option value="high">High Priority</option>
                      <option value="urgent">Urgent</option>
                    </select>
                  </div>

                  {/* Store filter */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Store
                    </label>
                    <select
                      value={filters.store_id}
                      onChange={(e) =>
                        handleFilterChange("store_id", e.target.value)
                      }
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white text-gray-900"
                    >
                      <option value="">All Stores</option>
                      {stores.map((store) => (
                        <option key={store.id} value={store.id}>
                          {store.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Distributor filter */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Distributor
                    </label>
                    <select
                      value={filters.distributor_id}
                      onChange={(e) =>
                        handleFilterChange("distributor_id", e.target.value)
                      }
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white text-gray-900"
                    >
                      <option value="">All Distributors</option>
                      {distributors.map((distributor) => (
                        <option key={distributor.id} value={distributor.id}>
                          {distributor.full_name || distributor.username}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Currency filter */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Currency
                    </label>
                    <select
                      value={filters.currency}
                      onChange={(e) =>
                        handleFilterChange("currency", e.target.value)
                      }
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white text-gray-900"
                    >
                      <option value="">All Currencies</option>
                      <option value="EUR">EUR - Euro</option>
                      <option value="SYP">SYP - Syrian Pound</option>
                    </select>
                  </div>

                  {/* Date From */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Order Date From
                    </label>
                    <EnhancedInput
                      type="date"
                      value={filters.date_from}
                      onChange={(e) =>
                        handleFilterChange("date_from", e.target.value)
                      }
                      className="w-full"
                    />
                  </div>

                  {/* Date To */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Order Date To
                    </label>
                    <EnhancedInput
                      type="date"
                      value={filters.date_to}
                      onChange={(e) =>
                        handleFilterChange("date_to", e.target.value)
                      }
                      className="w-full"
                    />
                  </div>

                  {/* Amount Min */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Min Amount (EUR)
                    </label>
                    <EnhancedInput
                      type="number"
                      placeholder="0.00"
                      value={filters.amount_min}
                      onChange={(e) =>
                        handleFilterChange("amount_min", e.target.value)
                      }
                      icon={<Euro className="w-4 h-4" />}
                      className="w-full"
                    />
                  </div>

                  {/* Amount Max */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Max Amount (EUR)
                    </label>
                    <EnhancedInput
                      type="number"
                      placeholder="1000.00"
                      value={filters.amount_max}
                      onChange={(e) =>
                        handleFilterChange("amount_max", e.target.value)
                      }
                      icon={<Euro className="w-4 h-4" />}
                      className="w-full"
                    />
                  </div>

                  {/* Delivery Date From */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Delivery Date From
                    </label>
                    <EnhancedInput
                      type="date"
                      value={filters.delivery_date_from}
                      onChange={(e) =>
                        handleFilterChange("delivery_date_from", e.target.value)
                      }
                      className="w-full"
                    />
                  </div>

                  {/* Delivery Date To */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Delivery Date To
                    </label>
                    <EnhancedInput
                      type="date"
                      value={filters.delivery_date_to}
                      onChange={(e) =>
                        handleFilterChange("delivery_date_to", e.target.value)
                      }
                      className="w-full"
                    />
                  </div>
                </div>

                <div className="flex flex-wrap justify-between items-center mt-8 pt-6 border-t border-gray-200">
                  <div className="flex flex-wrap gap-2">
                    <EnhancedButton
                      variant="outline"
                      size="sm"
                      onClick={() => applyQuickFilter("status", "pending")}
                      icon={<Clock className="w-4 h-4" />}
                      className="bg-yellow-50 hover:bg-yellow-100 text-yellow-700 border-yellow-300"
                    >
                      Pending Orders
                    </EnhancedButton>
                    <EnhancedButton
                      variant="outline"
                      size="sm"
                      onClick={() => applyQuickFilter("status", "confirmed")}
                      icon={<CheckCircle className="w-4 h-4" />}
                      className="bg-green-50 hover:bg-green-100 text-green-700 border-green-300"
                    >
                      Confirmed Orders
                    </EnhancedButton>
                    <EnhancedButton
                      variant="outline"
                      size="sm"
                      onClick={() => applyQuickFilter("priority", "urgent")}
                      icon={<AlertTriangle className="w-4 h-4" />}
                      className="bg-red-50 hover:bg-red-100 text-red-700 border-red-300"
                    >
                      Urgent Orders
                    </EnhancedButton>
                    <EnhancedButton
                      variant="outline"
                      size="sm"
                      onClick={() =>
                        applyQuickFilter("payment_status", "pending")
                      }
                      icon={<CreditCard className="w-4 h-4" />}
                      className="bg-blue-50 hover:bg-blue-100 text-blue-700 border-blue-300"
                    >
                      Payment Due
                    </EnhancedButton>
                  </div>
                  <div className="flex flex-wrap gap-3 mt-4 lg:mt-0">
                    <EnhancedButton
                      variant="outline"
                      onClick={clearFilters}
                      icon={<X className="w-4 h-4" />}
                    >
                      Clear Filters
                    </EnhancedButton>
                    <EnhancedButton
                      variant="primary"
                      onClick={() => setShowFilters(false)}
                      icon={<Check className="w-4 h-4" />}
                    >
                      Apply Filters
                    </EnhancedButton>
                  </div>
                </div>
              </CardBody>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Orders List */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
      >
        <Card className="border-0 shadow-lg">
          <CardHeader className="border-b border-gray-200 bg-gradient-to-r from-gray-50 to-white">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Package className="w-5 h-5 text-gray-600" />
                <h3 className="text-lg font-semibold text-gray-900">
                  Orders ({pagination.totalItems})
                </h3>
              </div>
              <div className="flex items-center space-x-2">
                <span className="text-sm text-gray-500">
                  Showing{" "}
                  {Math.min(
                    pagination.currentPage * pagination.itemsPerPage,
                    pagination.totalItems
                  )}{" "}
                  of {pagination.totalItems} orders
                </span>
              </div>
            </div>
          </CardHeader>
          <CardBody className="p-0">
            {orders.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12">
                <Package className="w-12 h-12 text-gray-400 mb-4" />
                <p className="text-gray-500 text-lg">No orders found</p>
                <p className="text-gray-400 text-sm">
                  Try adjusting your search or filters
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Order
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Store
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Payment
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Priority
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Amount
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Date
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {orders.map((order, index) => (
                      <motion.tr
                        key={order.id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.1 }}
                        className="hover:bg-gray-50 transition-colors duration-150"
                      >
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="flex-shrink-0 h-10 w-10">
                              <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                                <Package className="w-5 h-5 text-blue-600" />
                              </div>
                            </div>
                            <div className="ml-4">
                              <div className="text-sm font-medium text-gray-900">
                                #{order.order_number || order.id}
                              </div>
                              <div className="text-sm text-gray-500">
                                {order.customer_name || "N/A"}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <Store className="w-4 h-4 text-gray-400 mr-2" />
                            <span className="text-sm text-gray-900">
                              {order.store_name || "N/A"}
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <StatusBadge status={order.status} type="order" />
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <StatusBadge
                            status={order.payment_status}
                            type="payment"
                          />
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <PriorityBadge priority={order.priority} />
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">
                            {formatCurrency(
                              order.final_amount_eur || order.total_amount_eur
                            )}
                          </div>
                          <div className="text-sm text-gray-500">
                            {formatCurrency(
                              order.final_amount_syp || order.total_amount_syp,
                              "SYP"
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <CalendarIcon className="w-4 h-4 text-gray-400 mr-2" />
                            <span className="text-sm text-gray-900">
                              {order.order_date
                                ? new Date(
                                    order.order_date
                                  ).toLocaleDateString()
                                : "N/A"}
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <div className="flex items-center space-x-2">
                            <Link to={`/orders/${order.id}`}>
                              <EnhancedButton
                                variant="ghost"
                                size="sm"
                                icon={<Eye className="w-4 h-4" />}
                                className="text-blue-600 hover:text-blue-700"
                              />
                            </Link>
                            <Link to={`/orders/${order.id}/edit`}>
                              <EnhancedButton
                                variant="ghost"
                                size="sm"
                                icon={<Edit className="w-4 h-4" />}
                                className="text-gray-600 hover:text-gray-700"
                              />
                            </Link>
                          </div>
                        </td>
                      </motion.tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardBody>
        </Card>
      </motion.div>

      {/* Pagination */}
      {pagination.totalPages > 1 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="flex items-center justify-between"
        >
          <div className="flex items-center space-x-2">
            <span className="text-sm text-gray-600">
              Showing{" "}
              {(pagination.currentPage - 1) * pagination.itemsPerPage + 1} to{" "}
              {Math.min(
                pagination.currentPage * pagination.itemsPerPage,
                pagination.totalItems
              )}{" "}
              of {pagination.totalItems} orders
            </span>
          </div>
          <div className="flex items-center space-x-2">
            <EnhancedButton
              variant="outline"
              size="sm"
              onClick={() => handlePageChange(pagination.currentPage - 1)}
              disabled={pagination.currentPage === 1}
              icon={<ChevronLeft className="w-4 h-4" />}
            >
              Previous
            </EnhancedButton>
            <span className="text-sm text-gray-600">
              Page {pagination.currentPage} of {pagination.totalPages}
            </span>
            <EnhancedButton
              variant="outline"
              size="sm"
              onClick={() => handlePageChange(pagination.currentPage + 1)}
              disabled={pagination.currentPage === pagination.totalPages}
              icon={<ChevronRight className="w-4 h-4" />}
            >
              Next
            </EnhancedButton>
          </div>
        </motion.div>
      )}
    </div>
  );
};

export default EnhancedOrdersListPage;
