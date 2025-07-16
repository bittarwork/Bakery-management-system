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
  Euro,
  Truck,
  ChevronLeft,
  ChevronRight,
  BarChart3,
  Zap,
  Loader2,
  Download,
  Calendar,
  Eye,
  Edit,
  Trash2,
  ChevronDown,
  ChevronUp,
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

const OrdersListPage = () => {
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
    limit: 10,
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
    monthly_growth: 0,
    revenue_growth: 0,
  });

  // Pagination state
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalItems: 0,
    itemsPerPage: 10,
  });

  // View mode state
  const [viewMode, setViewMode] = useState("table"); // "table" or "cards"

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
        console.log("Orders API Response:", response);
        setOrders(response.data.orders || []);
        setStatistics(response.data.statistics || {});
        setPagination({
          currentPage: response.data.pagination?.current_page || 1,
          totalPages: response.data.pagination?.total_pages || 1,
          totalItems: response.data.pagination?.total_items || 0,
          itemsPerPage: response.data.pagination?.items_per_page || 10,
        });
      } else {
        console.error("Failed to fetch orders:", response.message);
        toast.error("Failed to fetch orders");
      }
    } catch (error) {
      console.error("Error fetching orders:", error);
      toast.error("Error fetching orders");
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch stores for filter dropdown
  const fetchStores = async () => {
    try {
      const response = await storeService.getStores();
      if (response.success) {
        setStores(response.data || []);
      }
    } catch (error) {
      console.error("Error fetching stores:", error);
    }
  };

  // Fetch distributors for filter dropdown
  const fetchDistributors = async () => {
    try {
      const response = await userService.getDistributors();
      if (response.success) {
        setDistributors(response.data || []);
      }
    } catch (error) {
      console.error("Error fetching distributors:", error);
    }
  };

  // Load initial data
  useEffect(() => {
    fetchOrders();
    fetchStores();
    fetchDistributors();
  }, []);

  // Handle filter changes
  const handleFilterChange = (key, value) => {
    setFilters((prev) => ({
      ...prev,
      [key]: value,
      page: 1, // Reset to first page when filters change
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
      limit: 10,
      sortBy: "created_at",
      sortOrder: "DESC",
    });
  };

  // Apply quick filters
  const applyQuickFilter = (filterType, value) => {
    handleFilterChange(filterType, value);
  };

  // Handle status update
  const handleStatusUpdate = async (orderId, newStatus) => {
    try {
      const response = await orderService.updateOrderStatus(orderId, newStatus);
      if (response.success) {
        toast.success("Order status updated successfully");
        fetchOrders(); // Refresh the list
      } else {
        toast.error(response.message || "Failed to update order status");
      }
    } catch (error) {
      console.error("Error updating order status:", error);
      toast.error("Error updating order status");
    }
  };

  // Handle payment status update
  const handlePaymentStatusUpdate = async (orderId, newPaymentStatus) => {
    try {
      const response = await orderService.updatePaymentStatus(
        orderId,
        newPaymentStatus
      );
      if (response.success) {
        toast.success("Payment status updated successfully");
        fetchOrders(); // Refresh the list
      } else {
        toast.error(response.message || "Failed to update payment status");
      }
    } catch (error) {
      console.error("Error updating payment status:", error);
      toast.error("Error updating payment status");
    }
  };

  // Handle order deletion
  const handleDeleteOrder = async (orderId) => {
    try {
      setDeleteModal((prev) => ({ ...prev, isLoading: true }));
      const response = await orderService.deleteOrder(orderId);
      if (response.success) {
        toast.success("Order deleted successfully");
        setDeleteModal({ isOpen: false, orderId: null, isLoading: false });
        fetchOrders(); // Refresh the list
      } else {
        toast.error(response.message || "Failed to delete order");
      }
    } catch (error) {
      console.error("Error deleting order:", error);
      toast.error("Error deleting order");
    } finally {
      setDeleteModal((prev) => ({ ...prev, isLoading: false }));
    }
  };

  // Handle bulk status update
  const handleBulkStatusUpdate = async (newStatus) => {
    if (selectedOrders.length === 0) {
      toast.error("Please select orders to update");
      return;
    }

    try {
      const promises = selectedOrders.map((orderId) =>
        orderService.updateOrderStatus(orderId, newStatus)
      );
      await Promise.all(promises);
      toast.success(`Updated ${selectedOrders.length} orders to ${newStatus}`);
      setSelectedOrders([]);
      fetchOrders();
    } catch (error) {
      console.error("Error updating bulk orders:", error);
      toast.error("Error updating orders");
    }
  };

  // Handle bulk distributor assignment
  const handleBulkAssignDistributor = async (distributorId) => {
    if (selectedOrders.length === 0) {
      toast.error("Please select orders to assign");
      return;
    }

    try {
      const promises = selectedOrders.map((orderId) =>
        orderService.assignDistributor(orderId, distributorId)
      );
      await Promise.all(promises);
      toast.success(`Assigned ${selectedOrders.length} orders to distributor`);
      setSelectedOrders([]);
      fetchOrders();
    } catch (error) {
      console.error("Error assigning distributor:", error);
      toast.error("Error assigning distributor");
    }
  };

  // Handle bulk priority update
  const handleBulkPriorityUpdate = async (priority) => {
    if (selectedOrders.length === 0) {
      toast.error("Please select orders to update");
      return;
    }

    try {
      const promises = selectedOrders.map((orderId) =>
        orderService.updateOrderPriority(orderId, priority)
      );
      await Promise.all(promises);
      toast.success(`Updated priority for ${selectedOrders.length} orders`);
      setSelectedOrders([]);
      fetchOrders();
    } catch (error) {
      console.error("Error updating priority:", error);
      toast.error("Error updating priority");
    }
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
        a.download = `orders_export_${
          new Date().toISOString().split("T")[0]
        }.csv`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
        toast.success("Orders exported successfully");
      } else {
        toast.error("Failed to export orders");
      }
    } catch (error) {
      console.error("Error exporting orders:", error);
      toast.error("Error exporting orders");
    } finally {
      setIsExporting(false);
    }
  };

  // Handle page change
  const handlePageChange = (newPage) => {
    handleFilterChange("page", newPage);
  };

  // Status badge component
  const StatusBadge = ({ status, type = "order" }) => {
    const statusConfig = {
      pending: { color: "bg-yellow-100 text-yellow-800", icon: Clock },
      processing: { color: "bg-blue-100 text-blue-800", icon: Zap },
      ready: { color: "bg-green-100 text-green-800", icon: CheckCircle },
      delivered: { color: "bg-green-100 text-green-800", icon: CheckCircle },
      cancelled: { color: "bg-red-100 text-red-800", icon: XCircle },
      returned: { color: "bg-orange-100 text-orange-800", icon: AlertTriangle },
    };

    const config = statusConfig[status] || {
      color: "bg-gray-100 text-gray-800",
      icon: Zap,
    };
    const IconComponent = config.icon;

    return (
      <span
        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${config.color}`}
      >
        <IconComponent className="w-3 h-3 mr-1" />
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </span>
    );
  };

  // Priority badge component
  const PriorityBadge = ({ priority }) => {
    const priorityConfig = {
      low: { color: "bg-green-100 text-green-800", icon: ChevronDown },
      medium: { color: "bg-yellow-100 text-yellow-800", icon: ChevronDown },
      high: { color: "bg-orange-100 text-orange-800", icon: ChevronUp },
      urgent: { color: "bg-red-100 text-red-800", icon: Zap },
    };

    const config = priorityConfig[priority] || {
      color: "bg-gray-100 text-gray-800",
      icon: Zap,
    };
    const IconComponent = config.icon;

    return (
      <span
        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${config.color}`}
      >
        <IconComponent className="w-3 h-3 mr-1" />
        {priority.charAt(0).toUpperCase() + priority.slice(1)}
      </span>
    );
  };

  // Statistics cards component
  const StatisticsCards = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      <Card className="bg-gradient-to-r from-blue-500 to-blue-600 text-white">
        <CardBody className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm opacity-90">Total Orders</p>
              <p className="text-2xl font-bold">
                {statistics.total_orders || 0}
              </p>
            </div>
            <Package className="w-8 h-8 opacity-80" />
          </div>
        </CardBody>
      </Card>

      <Card className="bg-gradient-to-r from-green-500 to-green-600 text-white">
        <CardBody className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm opacity-90">Total Revenue (EUR)</p>
              <p className="text-2xl font-bold">
                €{statistics.total_amount_eur?.toLocaleString() || 0}
              </p>
            </div>
            <Euro className="w-8 h-8 opacity-80" />
          </div>
        </CardBody>
      </Card>

      <Card className="bg-gradient-to-r from-purple-500 to-purple-600 text-white">
        <CardBody className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm opacity-90">Pending Orders</p>
              <p className="text-2xl font-bold">
                {statistics.pending_orders || 0}
              </p>
            </div>
            <Clock className="w-8 h-8 opacity-80" />
          </div>
        </CardBody>
      </Card>

      <Card className="bg-gradient-to-r from-orange-500 to-orange-600 text-white">
        <CardBody className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm opacity-90">Urgent Orders</p>
              <p className="text-2xl font-bold">
                {statistics.urgent_orders || 0}
              </p>
            </div>
            <Zap className="w-8 h-8 opacity-80" />
          </div>
        </CardBody>
      </Card>
    </div>
  );

  // Filters panel component
  const FiltersPanel = () => (
    <AnimatePresence>
      {showFilters && (
        <motion.div
          initial={{ height: 0, opacity: 0 }}
          animate={{ height: "auto", opacity: 1 }}
          exit={{ height: 0, opacity: 0 }}
          transition={{ duration: 0.3 }}
          className="bg-white border border-gray-200 rounded-lg p-4 mb-6"
        >
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Status Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Status
              </label>
              <select
                value={filters.status}
                onChange={(e) => handleFilterChange("status", e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">All Statuses</option>
                <option value="pending">Pending</option>
                <option value="processing">Processing</option>
                <option value="ready">Ready</option>
                <option value="delivered">Delivered</option>
                <option value="cancelled">Cancelled</option>
                <option value="returned">Returned</option>
              </select>
            </div>

            {/* Payment Status Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Payment Status
              </label>
              <select
                value={filters.payment_status}
                onChange={(e) =>
                  handleFilterChange("payment_status", e.target.value)
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">All Payment Statuses</option>
                <option value="pending">Pending</option>
                <option value="paid">Paid</option>
                <option value="partial">Partial</option>
                <option value="failed">Failed</option>
                <option value="refunded">Refunded</option>
              </select>
            </div>

            {/* Store Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Store
              </label>
              <select
                value={filters.store_id}
                onChange={(e) => handleFilterChange("store_id", e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">All Stores</option>
                {stores.map((store) => (
                  <option key={store.id} value={store.id}>
                    {store.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Distributor Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Distributor
              </label>
              <select
                value={filters.distributor_id}
                onChange={(e) =>
                  handleFilterChange("distributor_id", e.target.value)
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">All Distributors</option>
                {distributors.map((distributor) => (
                  <option key={distributor.id} value={distributor.id}>
                    {distributor.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Priority Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Priority
              </label>
              <select
                value={filters.priority}
                onChange={(e) => handleFilterChange("priority", e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">All Priorities</option>
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
                <option value="urgent">Urgent</option>
              </select>
            </div>

            {/* Currency Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Currency
              </label>
              <select
                value={filters.currency}
                onChange={(e) => handleFilterChange("currency", e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">All Currencies</option>
                <option value="EUR">EUR</option>
                <option value="SYP">SYP</option>
              </select>
            </div>

            {/* Date From Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Date From
              </label>
              <input
                type="date"
                value={filters.date_from}
                onChange={(e) =>
                  handleFilterChange("date_from", e.target.value)
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Date To Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Date To
              </label>
              <input
                type="date"
                value={filters.date_to}
                onChange={(e) => handleFilterChange("date_to", e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Amount Min Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Min Amount
              </label>
              <input
                type="number"
                placeholder="0.00"
                value={filters.amount_min}
                onChange={(e) =>
                  handleFilterChange("amount_min", e.target.value)
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Amount Max Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Max Amount
              </label>
              <input
                type="number"
                placeholder="0.00"
                value={filters.amount_max}
                onChange={(e) =>
                  handleFilterChange("amount_max", e.target.value)
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          <div className="flex justify-end space-x-2 mt-4">
            <EnhancedButton onClick={clearFilters} variant="outline" size="sm">
              Clear Filters
            </EnhancedButton>
            <EnhancedButton
              onClick={() => setShowFilters(false)}
              variant="outline"
              size="sm"
            >
              Hide Filters
            </EnhancedButton>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );

  // Format currency helper
  const formatCurrency = (amount, currency = "EUR") => {
    if (!amount) return "€0.00";

    const formatter = new Intl.NumberFormat(
      currency === "EUR" ? "de-DE" : "ar-SY",
      {
        style: "currency",
        currency: currency,
        minimumFractionDigits: 2,
      }
    );

    return formatter.format(amount);
  };

  // Main render
  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              Orders Management
            </h1>
            <p className="text-gray-600 mt-1">
              Manage and track all bakery orders
            </p>
          </div>
          <div className="flex space-x-2 mt-4 sm:mt-0">
            <EnhancedButton
              onClick={() => navigate("/orders/create")}
              className="bg-blue-600 hover:bg-blue-700"
            >
              <Plus className="w-4 h-4 mr-2" />
              New Order
            </EnhancedButton>
          </div>
        </div>

        {/* Statistics Cards */}
        <StatisticsCards />

        {/* Search and Filters */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 mb-6">
          <div className="flex flex-col lg:flex-row gap-4">
            {/* Search */}
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                  type="text"
                  placeholder="Search orders by ID, customer name, or phone..."
                  value={filters.search}
                  onChange={(e) => handleFilterChange("search", e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            {/* Quick Actions */}
            <div className="flex space-x-2">
              <EnhancedButton
                onClick={() => setShowFilters(!showFilters)}
                variant="outline"
                size="sm"
              >
                <Filter className="w-4 h-4 mr-2" />
                {showFilters ? "Hide Filters" : "Show Filters"}
              </EnhancedButton>
              <EnhancedButton
                onClick={() => fetchOrders(true)}
                variant="outline"
                size="sm"
              >
                <Loader2 className="w-4 h-4 mr-2" />
                Refresh
              </EnhancedButton>
              <EnhancedButton
                onClick={handleExport}
                disabled={isExporting}
                variant="outline"
                size="sm"
              >
                {isExporting ? (
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                ) : (
                  <Download className="w-4 h-4 mr-2" />
                )}
                Export
              </EnhancedButton>
            </div>
          </div>
        </div>

        {/* Filters Panel */}
        <FiltersPanel />

        {/* Bulk Actions */}
        {selectedOrders.length > 0 && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
            <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
              <div className="flex items-center">
                <span className="text-sm font-medium text-blue-900">
                  {selectedOrders.length} order(s) selected
                </span>
              </div>
              <div className="flex flex-wrap gap-2">
                <select
                  onChange={(e) => handleBulkStatusUpdate(e.target.value)}
                  className="px-3 py-1 border border-gray-300 rounded text-sm"
                >
                  <option value="">Update Status</option>
                  <option value="pending">Pending</option>
                  <option value="processing">Processing</option>
                  <option value="ready">Ready</option>
                  <option value="delivered">Delivered</option>
                  <option value="cancelled">Cancelled</option>
                </select>
                <select
                  onChange={(e) => handleBulkAssignDistributor(e.target.value)}
                  className="px-3 py-1 border border-gray-300 rounded text-sm"
                >
                  <option value="">Assign Distributor</option>
                  {distributors.map((distributor) => (
                    <option key={distributor.id} value={distributor.id}>
                      {distributor.name}
                    </option>
                  ))}
                </select>
                <select
                  onChange={(e) => handleBulkPriorityUpdate(e.target.value)}
                  className="px-3 py-1 border border-gray-300 rounded text-sm"
                >
                  <option value="">Update Priority</option>
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                  <option value="urgent">Urgent</option>
                </select>
                <EnhancedButton
                  onClick={() => setSelectedOrders([])}
                  variant="outline"
                  size="sm"
                >
                  Clear Selection
                </EnhancedButton>
              </div>
            </div>
          </div>
        )}

        {/* Orders Table */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          {isLoading ? (
            <div className="flex justify-center items-center py-12">
              <LoadingSpinner size="lg" />
            </div>
          ) : orders.length === 0 ? (
            <div className="text-center py-12">
              <Package className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                No orders found
              </h3>
              <p className="text-gray-600 mb-4">
                Try adjusting your filters or create a new order.
              </p>
              <EnhancedButton
                onClick={() => navigate("/orders/create")}
                className="bg-blue-600 hover:bg-blue-700"
              >
                <Plus className="w-4 h-4 mr-2" />
                Create Order
              </EnhancedButton>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      <input
                        type="checkbox"
                        checked={selectedOrders.length === orders.length}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setSelectedOrders(orders.map((order) => order.id));
                          } else {
                            setSelectedOrders([]);
                          }
                        }}
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Order ID
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Customer
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Store
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Amount
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
                      Date
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {orders.map((order) => (
                    <tr key={order.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <input
                          type="checkbox"
                          checked={selectedOrders.includes(order.id)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setSelectedOrders([...selectedOrders, order.id]);
                            } else {
                              setSelectedOrders(
                                selectedOrders.filter((id) => id !== order.id)
                              );
                            }
                          }}
                          className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                        />
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        #{order.id}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div>
                          <div className="text-sm font-medium text-gray-900">
                            {order.customer_name || "N/A"}
                          </div>
                          <div className="text-sm text-gray-500">
                            {order.customer_phone || "N/A"}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {order.store?.name || "N/A"}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {formatCurrency(order.total_amount, order.currency)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <StatusBadge status={order.status} />
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
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        <div className="flex items-center space-x-2">
                          <Calendar className="w-4 h-4 text-gray-400" />
                          <span>
                            {order && order.order_date
                              ? new Date(order.order_date).toLocaleDateString()
                              : "N/A"}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex space-x-2">
                          <button
                            onClick={() => navigate(`/orders/${order.id}`)}
                            className="text-blue-600 hover:text-blue-900"
                            title="View Order"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => navigate(`/orders/${order.id}/edit`)}
                            className="text-green-600 hover:text-green-900"
                            title="Edit Order"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() =>
                              setDeleteModal({
                                isOpen: true,
                                orderId: order.id,
                                isLoading: false,
                              })
                            }
                            className="text-red-600 hover:text-red-900"
                            title="Delete Order"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Pagination */}
        {pagination.totalPages > 1 && (
          <div className="flex justify-between items-center mt-6">
            <div className="text-sm text-gray-700">
              Showing{" "}
              {(pagination.currentPage - 1) * pagination.itemsPerPage + 1} to{" "}
              {Math.min(
                pagination.currentPage * pagination.itemsPerPage,
                pagination.totalItems
              )}{" "}
              of {pagination.totalItems} results
            </div>
            <div className="flex space-x-2">
              <EnhancedButton
                onClick={() => handlePageChange(pagination.currentPage - 1)}
                disabled={pagination.currentPage === 1}
                variant="outline"
                size="sm"
              >
                <ChevronLeft className="w-4 h-4 mr-1" />
                Previous
              </EnhancedButton>
              <span className="px-3 py-2 text-sm text-gray-700">
                Page {pagination.currentPage} of {pagination.totalPages}
              </span>
              <EnhancedButton
                onClick={() => handlePageChange(pagination.currentPage + 1)}
                disabled={pagination.currentPage === pagination.totalPages}
                variant="outline"
                size="sm"
              >
                Next
                <ChevronRight className="w-4 h-4 ml-1" />
              </EnhancedButton>
            </div>
          </div>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      <DeleteConfirmationModal
        isOpen={deleteModal.isOpen}
        onClose={() =>
          setDeleteModal({ isOpen: false, orderId: null, isLoading: false })
        }
        onConfirm={() => handleDeleteOrder(deleteModal.orderId)}
        isLoading={deleteModal.isLoading}
        title="Delete Order"
        message="Are you sure you want to delete this order? This action cannot be undone."
      />
    </div>
  );
};

export default OrdersListPage;
