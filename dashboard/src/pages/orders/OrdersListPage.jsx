import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  Plus,
  Package,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  Search,
  Filter,
  Calendar,
  Store,
  DollarSign,
  Eye,
  Edit,
  Trash2,
  Download,
  RefreshCw,
  Euro,
  ShoppingCart,
  TrendingUp,
  CreditCard,
  FileText,
  MoreVertical,
  ArrowUpDown,
  Users,
  MapPin,
  Truck,
  Receipt,
  Settings,
  X,
  ChevronLeft,
  ChevronRight,
  CheckSquare,
  Square,
  Globe,
  Calculator,
  Target,
  Zap,
  Activity,
  User,
  Building,
  Phone,
  Calendar as CalendarIcon,
  Clock as ClockIcon,
  Star,
  AlertTriangle,
  Info,
  Check,
  Minus,
  ExternalLink,
  Printer,
} from "lucide-react";
import { Link } from "react-router-dom";
import { Card, CardHeader, CardBody } from "../../components/ui/Card";
import Button from "../../components/ui/Button";
import Input from "../../components/ui/Input";
import DataTable from "../../components/ui/DataTable";
import orderService from "../../services/orderService";
import storeService from "../../services/storeService";
import { toast } from "react-hot-toast";

const OrdersListPage = () => {
  const [orders, setOrders] = useState([]);
  const [stores, setStores] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showFilters, setShowFilters] = useState(false);
  const [selectedOrders, setSelectedOrders] = useState([]);
  const [filters, setFilters] = useState({
    status: "",
    payment_status: "",
    store_id: "",
    date_from: "",
    date_to: "",
    search: "",
    page: 1,
    limit: 10,
  });

  // Statistics state
  const [statistics, setStatistics] = useState({
    total_orders: 0,
    total_amount_eur: 0,
    total_amount_syp: 0,
    orders_by_status: {},
    orders_by_payment_status: {},
  });

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
        setOrders(response.data.orders || []);
        setStatistics(response.data.statistics || {});

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

  // Initialize data
  useEffect(() => {
    fetchOrders();
    fetchStores();
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
    filters.date_from,
    filters.date_to,
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
      date_from: "",
      date_to: "",
      search: "",
      page: 1,
      limit: 10,
    });
  };

  // Handle order status update
  const handleStatusUpdate = async (orderId, newStatus) => {
    try {
      await orderService.updateOrderStatus(orderId, newStatus);
      toast.success("Order status updated successfully");
      fetchOrders();
    } catch (error) {
      console.error("Error updating order status:", error);
      toast.error("Failed to update order status");
    }
  };

  // Handle payment status update
  const handlePaymentStatusUpdate = async (orderId, newPaymentStatus) => {
    try {
      await orderService.updatePaymentStatus(orderId, newPaymentStatus);
      toast.success("Payment status updated successfully");
      fetchOrders();
    } catch (error) {
      console.error("Error updating payment status:", error);
      toast.error("Failed to update payment status");
    }
  };

  // Handle order deletion
  const handleDeleteOrder = async (orderId) => {
    if (window.confirm("Are you sure you want to delete this order?")) {
      try {
        await orderService.deleteOrder(orderId);
        toast.success("Order deleted successfully");
        fetchOrders();
      } catch (error) {
        console.error("Error deleting order:", error);
        toast.error("Failed to delete order");
      }
    }
  };

  // Handle bulk operations
  const handleBulkStatusUpdate = async (newStatus) => {
    if (selectedOrders.length === 0) {
      toast.error("Please select orders first");
      return;
    }

    try {
      await Promise.all(
        selectedOrders.map((orderId) =>
          orderService.updateOrderStatus(orderId, newStatus)
        )
      );
      toast.success(`${selectedOrders.length} orders updated successfully`);
      setSelectedOrders([]);
      fetchOrders();
    } catch (error) {
      console.error("Error updating orders:", error);
      toast.error("Failed to update selected orders");
    }
  };

  // Handle export
  const handleExport = async () => {
    try {
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
      gray: "bg-gray-100 text-gray-800",
      blue: "bg-blue-100 text-blue-800",
      yellow: "bg-yellow-100 text-yellow-800",
      green: "bg-green-100 text-green-800",
      red: "bg-red-100 text-red-800",
    };

    return (
      <span
        className={`px-2 py-1 rounded-full text-xs font-medium ${
          colorClasses[config.color]
        }`}
      >
        {config.label}
      </span>
    );
  };

  // Currency formatter
  const formatCurrency = (amount, currency = "EUR") => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: currency,
      minimumFractionDigits: 2,
    }).format(amount);
  };

  // Statistics cards
  const StatisticsCards = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
      <Card>
        <CardBody>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Orders</p>
              <p className="text-2xl font-bold">{statistics.total_orders}</p>
            </div>
            <div className="p-2 bg-blue-100 rounded-lg">
              <ShoppingCart className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </CardBody>
      </Card>

      <Card>
        <CardBody>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Revenue (EUR)</p>
              <p className="text-2xl font-bold text-green-600">
                {formatCurrency(statistics.total_amount_eur || 0, "EUR")}
              </p>
            </div>
            <div className="p-2 bg-green-100 rounded-lg">
              <Euro className="w-6 h-6 text-green-600" />
            </div>
          </div>
        </CardBody>
      </Card>

      <Card>
        <CardBody>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Revenue (SYP)</p>
              <p className="text-2xl font-bold text-purple-600">
                {formatCurrency(statistics.total_amount_syp || 0, "SYP")}
              </p>
            </div>
            <div className="p-2 bg-purple-100 rounded-lg">
              <DollarSign className="w-6 h-6 text-purple-600" />
            </div>
          </div>
        </CardBody>
      </Card>

      <Card>
        <CardBody>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Pending Orders</p>
              <p className="text-2xl font-bold text-yellow-600">
                {statistics.orders_by_status?.pending || 0}
              </p>
            </div>
            <div className="p-2 bg-yellow-100 rounded-lg">
              <Clock className="w-6 h-6 text-yellow-600" />
            </div>
          </div>
        </CardBody>
      </Card>
    </div>
  );

  // Filters component
  const FiltersPanel = () => (
    <Card className={`mb-6 ${showFilters ? "block" : "hidden"}`}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold">Advanced Filters</h3>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowFilters(false)}
          >
            <X className="w-4 h-4" />
          </Button>
        </div>
      </CardHeader>
      <CardBody>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {/* Status filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Order Status
            </label>
            <select
              value={filters.status}
              onChange={(e) => handleFilterChange("status", e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Payment Status
            </label>
            <select
              value={filters.payment_status}
              onChange={(e) =>
                handleFilterChange("payment_status", e.target.value)
              }
              className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">All Payment Statuses</option>
              {orderService.getPaymentStatusOptions().map((status) => (
                <option key={status.value} value={status.value}>
                  {status.label}
                </option>
              ))}
            </select>
          </div>

          {/* Store filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Store
            </label>
            <select
              value={filters.store_id}
              onChange={(e) => handleFilterChange("store_id", e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">All Stores</option>
              {stores.map((store) => (
                <option key={store.id} value={store.id}>
                  {store.name}
                </option>
              ))}
            </select>
          </div>

          {/* Date From */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Date From
            </label>
            <Input
              type="date"
              value={filters.date_from}
              onChange={(e) => handleFilterChange("date_from", e.target.value)}
            />
          </div>

          {/* Date To */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Date To
            </label>
            <Input
              type="date"
              value={filters.date_to}
              onChange={(e) => handleFilterChange("date_to", e.target.value)}
            />
          </div>
        </div>

        <div className="flex justify-end space-x-3 mt-4">
          <Button variant="outline" onClick={clearFilters}>
            Clear Filters
          </Button>
          <Button onClick={() => setShowFilters(false)}>Apply Filters</Button>
        </div>
      </CardBody>
    </Card>
  );

  // Table columns
  const columns = [
    {
      key: "select",
      header: (
        <input
          type="checkbox"
          checked={selectedOrders.length === orders.length && orders.length > 0}
          onChange={(e) => {
            if (e.target.checked) {
              setSelectedOrders(orders.map((order) => order.id));
            } else {
              setSelectedOrders([]);
            }
          }}
        />
      ),
      render: (order) => (
        <input
          type="checkbox"
          checked={selectedOrders.includes(order.id)}
          onChange={(e) => {
            if (e.target.checked) {
              setSelectedOrders((prev) => [...prev, order.id]);
            } else {
              setSelectedOrders((prev) => prev.filter((id) => id !== order.id));
            }
          }}
        />
      ),
    },
    {
      key: "order_number",
      header: "Order #",
      sortable: true,
      render: (order) => (
        <div className="font-medium text-blue-600">
          <Link to={`/orders/${order.id}`} className="hover:underline">
            {order.order_number}
          </Link>
        </div>
      ),
    },
    {
      key: "store_name",
      header: "Store",
      sortable: true,
      render: (order) => (
        <div className="flex items-center space-x-2">
          <Store className="w-4 h-4 text-gray-400" />
          <span>{order.store_name}</span>
        </div>
      ),
    },
    {
      key: "order_date",
      header: "Date",
      sortable: true,
      render: (order) => (
        <div className="flex items-center space-x-2">
          <CalendarIcon className="w-4 h-4 text-gray-400" />
          <span>{new Date(order.order_date).toLocaleDateString()}</span>
        </div>
      ),
    },
    {
      key: "status",
      header: "Status",
      render: (order) => <StatusBadge status={order.status} type="order" />,
    },
    {
      key: "payment_status",
      header: "Payment",
      render: (order) => (
        <StatusBadge status={order.payment_status} type="payment" />
      ),
    },
    {
      key: "final_amount_eur",
      header: "Amount (EUR)",
      render: (order) => (
        <div className="font-medium text-green-600">
          {formatCurrency(order.final_amount_eur, "EUR")}
        </div>
      ),
    },
    {
      key: "final_amount_syp",
      header: "Amount (SYP)",
      render: (order) => (
        <div className="font-medium text-purple-600">
          {formatCurrency(order.final_amount_syp, "SYP")}
        </div>
      ),
    },
    {
      key: "actions",
      header: "Actions",
      render: (order) => (
        <div className="flex items-center space-x-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => (window.location.href = `/orders/${order.id}`)}
          >
            <Eye className="w-4 h-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => (window.location.href = `/orders/${order.id}/edit`)}
          >
            <Edit className="w-4 h-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => handleDeleteOrder(order.id)}
            className="text-red-600 hover:text-red-700"
          >
            <Trash2 className="w-4 h-4" />
          </Button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Orders Management
          </h1>
          <p className="text-gray-600 mt-1">Manage and track all orders</p>
        </div>
        <div className="flex space-x-3 mt-4 sm:mt-0">
          <Button
            variant="outline"
            onClick={() => setShowFilters(!showFilters)}
          >
            <Filter className="w-4 h-4 mr-2" />
            Filters
          </Button>
          <Button variant="outline" onClick={handleExport}>
            <Download className="w-4 h-4 mr-2" />
            Export
          </Button>
          <Button variant="outline" onClick={() => fetchOrders()}>
            <RefreshCw className="w-4 h-4 mr-2" />
            Refresh
          </Button>
          <Link to="/orders/create">
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              New Order
            </Button>
          </Link>
        </div>
      </div>

      {/* Statistics */}
      <StatisticsCards />

      {/* Search and Quick Filters */}
      <Card>
        <CardBody>
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <Input
                placeholder="Search orders..."
                value={filters.search}
                onChange={(e) => handleFilterChange("search", e.target.value)}
                icon={<Search className="w-4 h-4" />}
              />
            </div>
            <div className="flex space-x-2">
              <select
                value={filters.status}
                onChange={(e) => handleFilterChange("status", e.target.value)}
                className="p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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
                onChange={(e) => handleFilterChange("store_id", e.target.value)}
                className="p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">All Stores</option>
                {stores.map((store) => (
                  <option key={store.id} value={store.id}>
                    {store.name}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </CardBody>
      </Card>

      {/* Filters Panel */}
      <FiltersPanel />

      {/* Bulk Actions */}
      {selectedOrders.length > 0 && (
        <Card>
          <CardBody>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">
                {selectedOrders.length} orders selected
              </span>
              <div className="flex space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleBulkStatusUpdate("confirmed")}
                >
                  Mark as Confirmed
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleBulkStatusUpdate("cancelled")}
                >
                  Cancel Selected
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setSelectedOrders([])}
                >
                  Clear Selection
                </Button>
              </div>
            </div>
          </CardBody>
        </Card>
      )}

      {/* Orders Table */}
      <Card>
        <CardBody>
          <DataTable
            columns={columns}
            data={orders}
            isLoading={isLoading}
            emptyMessage="No orders found"
            onSort={(key, direction) => {
              handleFilterChange("sortBy", key);
              handleFilterChange("sortOrder", direction);
            }}
          />
        </CardBody>
      </Card>

      {/* Pagination */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <span className="text-sm text-gray-600">
            Showing {(filters.page - 1) * filters.limit + 1} to{" "}
            {Math.min(filters.page * filters.limit, orders.length)} of{" "}
            {orders.length} orders
          </span>
        </div>
        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => handlePageChange(filters.page - 1)}
            disabled={filters.page === 1}
          >
            <ChevronLeft className="w-4 h-4" />
            Previous
          </Button>
          <span className="text-sm text-gray-600">Page {filters.page}</span>
          <Button
            variant="outline"
            size="sm"
            onClick={() => handlePageChange(filters.page + 1)}
            disabled={orders.length < filters.limit}
          >
            Next
            <ChevronRight className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </div>
  );
};

export default OrdersListPage;
