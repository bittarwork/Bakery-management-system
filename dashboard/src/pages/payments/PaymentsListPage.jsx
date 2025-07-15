import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  Plus,
  DollarSign,
  CreditCard,
  Banknote,
  TrendingUp,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  Search,
  Filter,
  Calendar,
  Store,
  Eye,
  Edit,
  Trash2,
  Download,
  RefreshCw,
  Receipt,
} from "lucide-react";
import { Link } from "react-router-dom";
import { Card, CardHeader, CardBody } from "../../components/ui/Card";
import Button from "../../components/ui/Button";
import Input from "../../components/ui/Input";
import DataTable from "../../components/ui/DataTable";

const PaymentsListPage = () => {
  const [payments, setPayments] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filters, setFilters] = useState({
    status: "",
    method: "",
    dateRange: "",
    search: "",
  });

  useEffect(() => {
    // Simulate loading data
    const timer = setTimeout(() => {
      setPayments([
        {
          id: "PAY-001",
          storeName: "Bakery Central",
          storeId: 1,
          amount: 1250.0,
          currency: "EUR",
          method: "cash",
          status: "completed",
          date: "2024-03-25",
          time: "14:30",
          reference: "REF-2024-001",
          description: "Payment for order ORD-001",
          customerName: "Ahmed Hassan",
          notes: "Cash payment received",
        },
        {
          id: "PAY-002",
          storeName: "Sweet Corner",
          storeId: 2,
          amount: 890.5,
          currency: "EUR",
          method: "bank_transfer",
          status: "pending",
          date: "2024-03-25",
          time: "10:15",
          reference: "REF-2024-002",
          description: "Payment for order ORD-002",
          customerName: "Fatima Ali",
          notes: "Bank transfer initiated",
        },
        {
          id: "PAY-003",
          storeName: "Artisan Bakery",
          storeId: 4,
          amount: 2100.0,
          currency: "EUR",
          method: "credit_card",
          status: "completed",
          date: "2024-03-24",
          time: "16:45",
          reference: "REF-2024-003",
          description: "Payment for order ORD-003",
          customerName: "Omar Khalil",
          notes: "Credit card payment processed",
        },
        {
          id: "PAY-004",
          storeName: "Golden Crust",
          storeId: 5,
          amount: 750.0,
          currency: "EUR",
          method: "cash",
          status: "failed",
          date: "2024-03-24",
          time: "12:20",
          reference: "REF-2024-004",
          description: "Payment for order ORD-004",
          customerName: "Layla Mansour",
          notes: "Payment declined",
        },
        {
          id: "PAY-005",
          storeName: "Bakery Central",
          storeId: 1,
          amount: 1650.75,
          currency: "EUR",
          method: "bank_transfer",
          status: "completed",
          date: "2024-03-23",
          time: "09:30",
          reference: "REF-2024-005",
          description: "Payment for order ORD-005",
          customerName: "Youssef Ibrahim",
          notes: "Bank transfer completed",
        },
      ]);
      setIsLoading(false);
    }, 1000);

    return () => clearTimeout(timer);
  }, []);

  const getStatusColor = (status) => {
    switch (status) {
      case "completed":
        return "bg-green-100 text-green-800";
      case "pending":
        return "bg-yellow-100 text-yellow-800";
      case "failed":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case "completed":
        return CheckCircle;
      case "pending":
        return Clock;
      case "failed":
        return XCircle;
      default:
        return AlertCircle;
    }
  };

  const getMethodIcon = (method) => {
    switch (method) {
      case "cash":
        return Banknote;
      case "credit_card":
        return CreditCard;
      case "bank_transfer":
        return DollarSign;
      default:
        return Receipt;
    }
  };

  const getMethodText = (method) => {
    switch (method) {
      case "cash":
        return "Cash";
      case "credit_card":
        return "Credit Card";
      case "bank_transfer":
        return "Bank Transfer";
      default:
        return "Unknown";
    }
  };

  const columns = [
    {
      key: "id",
      title: "Payment ID",
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
      render: (value) => (
        <div className="font-medium text-gray-900">{value}</div>
      ),
    },
    {
      key: "amount",
      title: "Amount",
      render: (value, row) => (
        <div>
          <div className="font-medium text-gray-900">
            {row.currency} {value.toFixed(2)}
          </div>
          <div className="text-sm text-gray-500">{row.reference}</div>
        </div>
      ),
    },
    {
      key: "method",
      title: "Method",
      render: (value) => {
        const Icon = getMethodIcon(value);
        return (
          <div className="flex items-center">
            <Icon className="w-4 h-4 text-gray-400 mr-2" />
            <span className="text-sm font-medium text-gray-900">
              {getMethodText(value)}
            </span>
          </div>
        );
      },
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
            {value.charAt(0).toUpperCase() + value.slice(1)}
          </span>
        );
      },
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
      key: "actions",
      title: "Actions",
      render: (value, row) => (
        <div className="flex items-center space-x-2">
          <Link to={`/payments/${row.id}`}>
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

  const handleDelete = (paymentId) => {
    if (window.confirm("Are you sure you want to delete this payment?")) {
      setPayments(payments.filter((payment) => payment.id !== paymentId));
    }
  };

  const handleFilterChange = (key, value) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  };

  const handleExport = () => {
    // Export functionality
    console.log("Exporting payments...");
  };

  const handleRefresh = () => {
    setIsLoading(true);
    // Simulate refresh
    setTimeout(() => setIsLoading(false), 1000);
  };

  const stats = {
    total: payments.length,
    completed: payments.filter((p) => p.status === "completed").length,
    pending: payments.filter((p) => p.status === "pending").length,
    failed: payments.filter((p) => p.status === "failed").length,
    totalAmount: payments.reduce((sum, payment) => sum + payment.amount, 0),
    completedAmount: payments
      .filter((p) => p.status === "completed")
      .reduce((sum, payment) => sum + payment.amount, 0),
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
          <h1 className="text-3xl font-bold text-gray-900">Payments</h1>
          <p className="text-gray-600">
            Manage and track all payment transactions
          </p>
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
          <Link to="/payments/record">
            <Button variant="primary" icon={<Plus className="w-4 h-4" />}>
              Record Payment
            </Button>
          </Link>
        </div>
      </motion.div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-6 gap-6">
        <Card>
          <div className="flex items-center">
            <div className="p-3 bg-blue-100 rounded-full">
              <Receipt className="w-6 h-6 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">
                Total Payments
              </p>
              <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
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
            <div className="p-3 bg-red-100 rounded-full">
              <XCircle className="w-6 h-6 text-red-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Failed</p>
              <p className="text-2xl font-bold text-gray-900">{stats.failed}</p>
            </div>
          </div>
        </Card>

        <Card>
          <div className="flex items-center">
            <div className="p-3 bg-purple-100 rounded-full">
              <DollarSign className="w-6 h-6 text-purple-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Amount</p>
              <p className="text-2xl font-bold text-gray-900">
                €{stats.totalAmount.toLocaleString()}
              </p>
            </div>
          </div>
        </Card>

        <Card>
          <div className="flex items-center">
            <div className="p-3 bg-emerald-100 rounded-full">
              <TrendingUp className="w-6 h-6 text-emerald-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">
                Completed Amount
              </p>
              <p className="text-2xl font-bold text-gray-900">
                €{stats.completedAmount.toLocaleString()}
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
                setFilters({
                  status: "",
                  method: "",
                  dateRange: "",
                  search: "",
                })
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
                <option value="completed">Completed</option>
                <option value="pending">Pending</option>
                <option value="failed">Failed</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Payment Method
              </label>
              <select
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                value={filters.method}
                onChange={(e) => handleFilterChange("method", e.target.value)}
              >
                <option value="">All Methods</option>
                <option value="cash">Cash</option>
                <option value="credit_card">Credit Card</option>
                <option value="bank_transfer">Bank Transfer</option>
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
                Search
              </label>
              <Input
                placeholder="Search payments..."
                value={filters.search}
                onChange={(e) => handleFilterChange("search", e.target.value)}
                icon={<Search className="w-4 h-4" />}
              />
            </div>
          </div>
        </CardBody>
      </Card>

      {/* Payments Table */}
      <Card>
        <CardHeader>
          <h2 className="text-lg font-semibold text-gray-900">
            Payment History
          </h2>
        </CardHeader>
        <CardBody>
          <DataTable
            data={payments}
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

export default PaymentsListPage;
