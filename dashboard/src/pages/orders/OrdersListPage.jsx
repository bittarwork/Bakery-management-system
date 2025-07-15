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
} from "lucide-react";
import { Link } from "react-router-dom";
import { Card, CardHeader, CardBody } from "../../components/ui/Card";
import Button from "../../components/ui/Button";
import Input from "../../components/ui/Input";
import DataTable from "../../components/ui/DataTable";

const OrdersListPage = () => {
  const [orders, setOrders] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filters, setFilters] = useState({
    status: "",
    dateRange: "",
    store: "",
    search: "",
  });

  useEffect(() => {
    // Simulate loading data
    const timer = setTimeout(() => {
      setOrders([
        {
          id: "ORD-001",
          storeName: "Bakery Central",
          storeId: 1,
          date: "2024-03-25",
          time: "09:30",
          status: "pending",
          total: 1250.0,
          items: 15,
          customerName: "Ahmed Hassan",
          customerPhone: "+963 955 123 456",
          notes: "Delivery before 2 PM",
        },
        {
          id: "ORD-002",
          storeName: "Sweet Corner",
          storeId: 2,
          date: "2024-03-25",
          time: "10:15",
          status: "processing",
          total: 890.5,
          items: 8,
          customerName: "Fatima Ali",
          customerPhone: "+963 955 789 012",
          notes: "Special packaging required",
        },
        {
          id: "ORD-003",
          storeName: "Artisan Bakery",
          storeId: 4,
          date: "2024-03-25",
          time: "11:00",
          status: "completed",
          total: 2100.0,
          items: 22,
          customerName: "Omar Khalil",
          customerPhone: "+963 955 345 678",
          notes: "",
        },
        {
          id: "ORD-004",
          storeName: "Golden Crust",
          storeId: 5,
          date: "2024-03-24",
          time: "14:30",
          status: "cancelled",
          total: 750.0,
          items: 6,
          customerName: "Layla Mansour",
          customerPhone: "+963 955 901 234",
          notes: "Customer requested cancellation",
        },
        {
          id: "ORD-005",
          storeName: "Bakery Central",
          storeId: 1,
          date: "2024-03-24",
          time: "16:45",
          status: "completed",
          total: 1650.75,
          items: 18,
          customerName: "Youssef Ibrahim",
          customerPhone: "+963 955 567 890",
          notes: "Urgent delivery",
        },
      ]);
      setIsLoading(false);
    }, 1000);

    return () => clearTimeout(timer);
  }, []);

  const getStatusColor = (status) => {
    switch (status) {
      case "pending":
        return "bg-yellow-100 text-yellow-800";
      case "processing":
        return "bg-blue-100 text-blue-800";
      case "completed":
        return "bg-green-100 text-green-800";
      case "cancelled":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case "pending":
        return Clock;
      case "processing":
        return AlertCircle;
      case "completed":
        return CheckCircle;
      case "cancelled":
        return XCircle;
      default:
        return Package;
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case "pending":
        return "Pending";
      case "processing":
        return "Processing";
      case "completed":
        return "Completed";
      case "cancelled":
        return "Cancelled";
      default:
        return "Unknown";
    }
  };

  const columns = [
    {
      key: "id",
      title: "Order ID",
      render: (value) => (
        <div className="font-mono font-medium text-gray-900">{value}</div>
      ),
    },
    {
      key: "storeName",
      title: "Store",
      render: (value, row) => (
        <div className="flex items-center">
          <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center mr-3">
            <Store className="w-4 h-4 text-blue-600" />
          </div>
          <div>
            <div className="font-medium text-gray-900">{value}</div>
            <div className="text-sm text-gray-500">ID: {row.storeId}</div>
          </div>
        </div>
      ),
    },
    {
      key: "customerName",
      title: "Customer",
      render: (value, row) => (
        <div>
          <div className="font-medium text-gray-900">{value}</div>
          <div className="text-sm text-gray-500">{row.customerPhone}</div>
        </div>
      ),
    },
    {
      key: "date",
      title: "Date & Time",
      render: (value, row) => (
        <div className="flex items-center text-sm text-gray-900">
          <Calendar className="w-4 h-4 text-gray-400 mr-2" />
          <div>
            <div>{new Date(value).toLocaleDateString()}</div>
            <div className="text-gray-500">{row.time}</div>
          </div>
        </div>
      ),
    },
    {
      key: "status",
      title: "Status",
      render: (value) => {
        const Icon = getStatusIcon(value);
        return (
          <span
            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(
              value
            )}`}
          >
            <Icon className="w-3 h-3 mr-1" />
            {getStatusText(value)}
          </span>
        );
      },
    },
    {
      key: "total",
      title: "Total",
      render: (value, row) => (
        <div>
          <div className="font-medium text-gray-900">
            €{value.toLocaleString()}
          </div>
          <div className="text-sm text-gray-500">{row.items} items</div>
        </div>
      ),
    },
    {
      key: "actions",
      title: "Actions",
      render: (value, row) => (
        <div className="flex items-center space-x-2">
          <Link to={`/orders/${row.id}`}>
            <Button
              variant="ghost"
              size="sm"
              icon={<Eye className="w-4 h-4" />}
            >
              View
            </Button>
          </Link>
          <Button variant="ghost" size="sm" icon={<Edit className="w-4 h-4" />}>
            Edit
          </Button>
          <Button
            variant="ghost"
            size="sm"
            icon={<Trash2 className="w-4 h-4" />}
            onClick={() => handleDelete(row.id)}
          >
            Delete
          </Button>
        </div>
      ),
    },
  ];

  const handleDelete = (orderId) => {
    if (window.confirm("Are you sure you want to delete this order?")) {
      setOrders(orders.filter((order) => order.id !== orderId));
    }
  };

  const handleFilterChange = (key, value) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  };

  const handleExport = () => {
    // Export functionality
    console.log("Exporting orders...");
  };

  const handleRefresh = () => {
    setIsLoading(true);
    // Simulate refresh
    setTimeout(() => setIsLoading(false), 1000);
  };

  const stats = {
    total: orders.length,
    pending: orders.filter((o) => o.status === "pending").length,
    processing: orders.filter((o) => o.status === "processing").length,
    completed: orders.filter((o) => o.status === "completed").length,
    revenue: orders.reduce((sum, order) => sum + order.total, 0),
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between"
      >
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Orders</h1>
          <p className="text-gray-600">Manage and track all bakery orders</p>
        </div>
        <div className="flex items-center space-x-3">
          <Button
            variant="outline"
            icon={<Download className="w-4 h-4" />}
            onClick={handleExport}
          >
            Export
          </Button>
          <Button
            variant="outline"
            icon={<RefreshCw className="w-4 h-4" />}
            onClick={handleRefresh}
          >
            Refresh
          </Button>
          <Link to="/orders/create">
            <Button variant="primary" icon={<Plus className="w-4 h-4" />}>
              Create Order
            </Button>
          </Link>
        </div>
      </motion.div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
        <Card>
          <div className="flex items-center">
            <div className="p-3 bg-blue-100 rounded-full">
              <Package className="w-6 h-6 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Orders</p>
              <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
            </div>
          </div>
        </Card>

        <Card>
          <div className="flex items-center">
            <div className="p-3 bg-yellow-100 rounded-full">
              <Clock className="w-6 h-6 text-yellow-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Pending</p>
              <p className="text-2xl font-bold text-gray-900">
                {stats.pending}
              </p>
            </div>
          </div>
        </Card>

        <Card>
          <div className="flex items-center">
            <div className="p-3 bg-blue-100 rounded-full">
              <AlertCircle className="w-6 h-6 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Processing</p>
              <p className="text-2xl font-bold text-gray-900">
                {stats.processing}
              </p>
            </div>
          </div>
        </Card>

        <Card>
          <div className="flex items-center">
            <div className="p-3 bg-green-100 rounded-full">
              <CheckCircle className="w-6 h-6 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Completed</p>
              <p className="text-2xl font-bold text-gray-900">
                {stats.completed}
              </p>
            </div>
          </div>
        </Card>

        <Card>
          <div className="flex items-center">
            <div className="p-3 bg-purple-100 rounded-full">
              <DollarSign className="w-6 h-6 text-purple-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Revenue</p>
              <p className="text-2xl font-bold text-gray-900">
                €{stats.revenue.toLocaleString()}
              </p>
            </div>
          </div>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-900">Filters</h2>
            <Button
              variant="ghost"
              size="sm"
              onClick={() =>
                setFilters({ status: "", dateRange: "", store: "", search: "" })
              }
            >
              Clear All
            </Button>
          </div>
        </CardHeader>
        <CardBody>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Status
              </label>
              <select
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                value={filters.status}
                onChange={(e) => handleFilterChange("status", e.target.value)}
              >
                <option value="">All Status</option>
                <option value="pending">Pending</option>
                <option value="processing">Processing</option>
                <option value="completed">Completed</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Date Range
              </label>
              <input
                type="date"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                value={filters.dateRange}
                onChange={(e) =>
                  handleFilterChange("dateRange", e.target.value)
                }
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Store
              </label>
              <select
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                value={filters.store}
                onChange={(e) => handleFilterChange("store", e.target.value)}
              >
                <option value="">All Stores</option>
                <option value="1">Bakery Central</option>
                <option value="2">Sweet Corner</option>
                <option value="4">Artisan Bakery</option>
                <option value="5">Golden Crust</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Search
              </label>
              <Input
                placeholder="Search orders..."
                value={filters.search}
                onChange={(e) => handleFilterChange("search", e.target.value)}
                icon={<Search className="w-4 h-4" />}
              />
            </div>
          </div>
        </CardBody>
      </Card>

      {/* Orders Table */}
      <Card>
        <CardHeader>
          <h2 className="text-lg font-semibold text-gray-900">Orders List</h2>
        </CardHeader>
        <CardBody>
          <DataTable
            data={orders}
            columns={columns}
            searchable={true}
            sortable={true}
            pagination={true}
            itemsPerPage={10}
          />
        </CardBody>
      </Card>
    </div>
  );
};

export default OrdersListPage;
