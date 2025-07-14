import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Plus,
  Users,
  User,
  Shield,
  UserCheck,
  UserX,
  Search,
  Filter,
  Eye,
  Edit,
  Trash2,
  Download,
  RefreshCw,
  Mail,
  Phone,
  Calendar,
  MapPin,
  Crown,
  Briefcase,
  Truck,
  ShoppingCart,
  TrendingUp,
  Activity,
  Clock,
  Star,
  Sparkles,
  Zap,
  Target,
  Award,
} from "lucide-react";
import { Link } from "react-router-dom";
import { Card, CardHeader, CardBody } from "../../components/ui/Card";
import Button from "../../components/ui/Button";
import Input from "../../components/ui/Input";
import DataTable from "../../components/ui/DataTable";

const UsersListPage = () => {
  const [users, setUsers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filters, setFilters] = useState({
    role: "",
    status: "",
    search: "",
  });
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [viewMode, setViewMode] = useState("table"); // table, grid, cards

  useEffect(() => {
    // Simulate loading data
    const timer = setTimeout(() => {
      setUsers([
        {
          id: 1,
          name: "Ahmed Hassan",
          email: "ahmed.hassan@bakery.com",
          phone: "+963 955 123 456",
          role: "admin",
          status: "active",
          lastLogin: "2024-03-25 09:30",
          store: "Main Office",
          avatar: "AH",
          createdAt: "2024-01-15",
          permissions: ["all"],
          performance: 95,
          ordersHandled: 1250,
          avgRating: 4.8,
        },
        {
          id: 2,
          name: "Fatima Ali",
          email: "fatima.ali@bakery.com",
          phone: "+963 955 789 012",
          role: "manager",
          status: "active",
          lastLogin: "2024-03-24 14:15",
          store: "Downtown Store",
          avatar: "FA",
          createdAt: "2024-02-10",
          permissions: ["orders", "products", "reports"],
          performance: 88,
          ordersHandled: 890,
          avgRating: 4.6,
        },
        {
          id: 3,
          name: "Omar Khalil",
          email: "omar.khalil@bakery.com",
          phone: "+963 955 345 678",
          role: "distributor",
          status: "active",
          lastLogin: "2024-03-25 08:45",
          store: "Distribution Center",
          avatar: "OK",
          createdAt: "2024-02-20",
          permissions: ["distribution", "delivery"],
          performance: 92,
          ordersHandled: 1560,
          avgRating: 4.9,
        },
        {
          id: 4,
          name: "Layla Mansour",
          email: "layla.mansour@bakery.com",
          phone: "+963 955 901 234",
          role: "cashier",
          status: "inactive",
          lastLogin: "2024-03-20 16:20",
          store: "Westside Store",
          avatar: "LM",
          createdAt: "2024-03-01",
          permissions: ["orders", "payments"],
          performance: 75,
          ordersHandled: 420,
          avgRating: 4.2,
        },
        {
          id: 5,
          name: "Youssef Ibrahim",
          email: "youssef.ibrahim@bakery.com",
          phone: "+963 955 567 890",
          role: "manager",
          status: "active",
          lastLogin: "2024-03-25 11:30",
          store: "Eastside Store",
          avatar: "YI",
          createdAt: "2024-01-25",
          permissions: ["orders", "products", "reports"],
          performance: 91,
          ordersHandled: 1100,
          avgRating: 4.7,
        },
        {
          id: 6,
          name: "Nour Al-Zahra",
          email: "nour.alzahra@bakery.com",
          phone: "+963 955 234 567",
          role: "accountant",
          status: "active",
          lastLogin: "2024-03-24 17:45",
          store: "Main Office",
          avatar: "NA",
          createdAt: "2024-02-05",
          permissions: ["payments", "reports", "financial"],
          performance: 87,
          ordersHandled: 0,
          avgRating: 4.5,
        },
      ]);
      setIsLoading(false);
    }, 1000);

    return () => clearTimeout(timer);
  }, []);

  const getStatusColor = (status) => {
    switch (status) {
      case "active":
        return "bg-green-100 text-green-800 border-green-200";
      case "inactive":
        return "bg-red-100 text-red-800 border-red-200";
      case "pending":
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case "active":
        return UserCheck;
      case "inactive":
        return UserX;
      case "pending":
        return User;
      default:
        return User;
    }
  };

  const getRoleColor = (role) => {
    switch (role) {
      case "admin":
        return "bg-purple-100 text-purple-800 border-purple-200";
      case "manager":
        return "bg-blue-100 text-blue-800 border-blue-200";
      case "distributor":
        return "bg-orange-100 text-orange-800 border-orange-200";
      case "cashier":
        return "bg-green-100 text-green-800 border-green-200";
      case "accountant":
        return "bg-indigo-100 text-indigo-800 border-indigo-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const getRoleIcon = (role) => {
    switch (role) {
      case "admin":
        return Crown;
      case "manager":
        return Briefcase;
      case "distributor":
        return Truck;
      case "cashier":
        return ShoppingCart;
      case "accountant":
        return Shield;
      default:
        return User;
    }
  };

  const getRoleText = (role) => {
    switch (role) {
      case "admin":
        return "Admin";
      case "manager":
        return "Manager";
      case "distributor":
        return "Distributor";
      case "cashier":
        return "Cashier";
      case "accountant":
        return "Accountant";
      default:
        return "User";
    }
  };

  const getPerformanceColor = (performance) => {
    if (performance >= 90) return "text-green-600";
    if (performance >= 80) return "text-blue-600";
    if (performance >= 70) return "text-yellow-600";
    return "text-red-600";
  };

  const getPerformanceBg = (performance) => {
    if (performance >= 90) return "bg-green-50 border-green-200";
    if (performance >= 80) return "bg-blue-50 border-blue-200";
    if (performance >= 70) return "bg-yellow-50 border-yellow-200";
    return "bg-red-50 border-red-200";
  };

  const columns = [
    {
      key: "name",
      title: "User",
      render: (value, row) => (
        <div className="flex items-center">
          <div className="relative">
            <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center mr-4 shadow-lg">
              <span className="text-sm font-bold text-white">{row.avatar}</span>
            </div>
            <div
              className={`absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 border-white ${
                row.status === "active" ? "bg-green-500" : "bg-red-500"
              }`}
            />
          </div>
          <div>
            <div className="font-semibold text-gray-900 text-lg">{value}</div>
            <div className="text-sm text-gray-500">ID: {row.id}</div>
            <div className="text-xs text-gray-400">{row.store}</div>
          </div>
        </div>
      ),
    },
    {
      key: "email",
      title: "Contact",
      render: (value, row) => (
        <div className="space-y-2">
          <div className="flex items-center text-sm text-gray-900">
            <Mail className="w-4 h-4 text-gray-400 mr-2" />
            <span className="font-medium">{value}</span>
          </div>
          <div className="flex items-center text-sm text-gray-500">
            <Phone className="w-4 h-4 text-gray-400 mr-2" />
            {row.phone}
          </div>
          <div className="flex items-center text-xs text-gray-400">
            <Calendar className="w-3 h-3 text-gray-400 mr-1" />
            Joined {row.createdAt}
          </div>
        </div>
      ),
    },
    {
      key: "role",
      title: "Role & Status",
      render: (value, row) => {
        const Icon = getRoleIcon(value);
        const StatusIcon = getStatusIcon(row.status);
        return (
          <div className="space-y-3">
            <div className="flex items-center">
              <div className="p-2 bg-gray-100 rounded-lg mr-3">
                <Icon className="w-4 h-4 text-gray-600" />
              </div>
              <span
                className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold border ${getRoleColor(
                  value
                )}`}
              >
                {getRoleText(value)}
              </span>
            </div>
            <div className="flex items-center">
              <div className="p-2 bg-gray-100 rounded-lg mr-3">
                <StatusIcon className="w-4 h-4 text-gray-600" />
              </div>
              <span
                className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold border ${getStatusColor(
                  row.status
                )}`}
              >
                {row.status === "active"
                  ? "Active"
                  : row.status === "inactive"
                  ? "Inactive"
                  : "Pending"}
              </span>
            </div>
          </div>
        );
      },
    },
    {
      key: "performance",
      title: "Performance",
      render: (value, row) => (
        <div className="space-y-3">
          <div className={`p-3 rounded-xl border ${getPerformanceBg(value)}`}>
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-medium text-gray-600">
                Performance
              </span>
              <span
                className={`text-sm font-bold ${getPerformanceColor(value)}`}
              >
                {value}%
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${value}%` }}
                transition={{ duration: 1, ease: "easeOut" }}
                className={`h-2 rounded-full ${
                  value >= 90
                    ? "bg-green-500"
                    : value >= 80
                    ? "bg-blue-500"
                    : value >= 70
                    ? "bg-yellow-500"
                    : "bg-red-500"
                }`}
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-2 text-xs">
            <div className="text-center p-2 bg-gray-50 rounded-lg">
              <div className="font-semibold text-gray-900">
                {row.ordersHandled}
              </div>
              <div className="text-gray-500">Orders</div>
            </div>
            <div className="text-center p-2 bg-gray-50 rounded-lg">
              <div className="font-semibold text-gray-900">{row.avgRating}</div>
              <div className="text-gray-500">Rating</div>
            </div>
          </div>
        </div>
      ),
    },
    {
      key: "lastLogin",
      title: "Last Activity",
      render: (value) => (
        <div className="space-y-2">
          <div className="flex items-center text-sm text-gray-900">
            <Clock className="w-4 h-4 text-gray-400 mr-2" />
            <span className="font-medium">{value}</span>
          </div>
          <div className="flex items-center text-xs text-gray-500">
            <Activity className="w-3 h-3 text-gray-400 mr-1" />
            Recently active
          </div>
        </div>
      ),
    },
    {
      key: "actions",
      title: "Actions",
      render: (value, row) => (
        <div className="flex items-center space-x-2 rtl:space-x-reverse">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors duration-200"
            title="View Details"
          >
            <Eye className="w-4 h-4" />
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors duration-200"
            title="Edit User"
          >
            <Edit className="w-4 h-4" />
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors duration-200"
            title="Delete User"
          >
            <Trash2 className="w-4 h-4" />
          </motion.button>
        </div>
      ),
    },
  ];

  const handleDelete = (userId) => {
    setUsers(users.filter((user) => user.id !== userId));
  };

  const handleFilterChange = (key, value) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  };

  const handleExport = () => {
    // TODO: Implement export functionality
    console.log("Exporting users...");
  };

  const handleRefresh = () => {
    setIsLoading(true);
    // Simulate refresh
    setTimeout(() => setIsLoading(false), 1000);
  };

  const filteredUsers = users.filter((user) => {
    const matchesSearch =
      user.name.toLowerCase().includes(filters.search.toLowerCase()) ||
      user.email.toLowerCase().includes(filters.search.toLowerCase());
    const matchesRole = !filters.role || user.role === filters.role;
    const matchesStatus = !filters.status || user.status === filters.status;
    return matchesSearch && matchesRole && matchesStatus;
  });

  const stats = {
    total: users.length,
    active: users.filter((u) => u.status === "active").length,
    inactive: users.filter((u) => u.status === "inactive").length,
    avgPerformance: Math.round(
      users.reduce((acc, u) => acc + u.performance, 0) / users.length
    ),
  };

  return (
    <div className="space-y-6">
      {/* Enhanced Header */}
      <motion.div
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.6 }}
        className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4"
      >
        <div>
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
            <div className="p-2 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl">
              <Users className="w-6 h-6 text-white" />
            </div>
            إدارة المستخدمين
          </h1>
          <p className="text-gray-600 mt-2">
            إدارة المستخدمين والصلاحيات والأنشطة
          </p>
        </div>

        <div className="flex items-center gap-3">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleRefresh}
            className="p-3 text-gray-600 hover:bg-gray-100 rounded-xl transition-colors duration-200"
            title="Refresh"
          >
            <RefreshCw
              className={`w-5 h-5 ${isLoading ? "animate-spin" : ""}`}
            />
          </motion.button>

          <Link to="/users/create">
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white px-6 py-3 rounded-xl font-semibold flex items-center gap-2 transition-all duration-300 shadow-lg hover:shadow-xl"
            >
              <Plus className="w-5 h-5" />
              إضافة مستخدم جديد
            </motion.button>
          </Link>
        </div>
      </motion.div>

      {/* Enhanced Stats Cards */}
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.2, duration: 0.6 }}
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
      >
        <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-2xl p-6 border border-blue-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-blue-600 text-sm font-medium">
                إجمالي المستخدمين
              </p>
              <p className="text-3xl font-bold text-blue-900">{stats.total}</p>
            </div>
            <div className="p-3 bg-blue-500 rounded-xl">
              <Users className="w-6 h-6 text-white" />
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-2xl p-6 border border-green-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-green-600 text-sm font-medium">
                المستخدمين النشطين
              </p>
              <p className="text-3xl font-bold text-green-900">
                {stats.active}
              </p>
            </div>
            <div className="p-3 bg-green-500 rounded-xl">
              <UserCheck className="w-6 h-6 text-white" />
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-red-50 to-red-100 rounded-2xl p-6 border border-red-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-red-600 text-sm font-medium">
                المستخدمين غير النشطين
              </p>
              <p className="text-3xl font-bold text-red-900">
                {stats.inactive}
              </p>
            </div>
            <div className="p-3 bg-red-500 rounded-xl">
              <UserX className="w-6 h-6 text-white" />
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-2xl p-6 border border-purple-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-purple-600 text-sm font-medium">
                متوسط الأداء
              </p>
              <p className="text-3xl font-bold text-purple-900">
                {stats.avgPerformance}%
              </p>
            </div>
            <div className="p-3 bg-purple-500 rounded-xl">
              <TrendingUp className="w-6 h-6 text-white" />
            </div>
          </div>
        </div>
      </motion.div>

      {/* Enhanced Filters */}
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.4, duration: 0.6 }}
        className="bg-white rounded-2xl p-6 shadow-sm border border-gray-200"
      >
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <Input
              placeholder="البحث في المستخدمين..."
              value={filters.search}
              onChange={(e) => handleFilterChange("search", e.target.value)}
              className="pl-10 bg-gray-50 border-gray-200 focus:bg-white focus:border-blue-500 transition-all duration-300"
            />
          </div>

          <select
            value={filters.role}
            onChange={(e) => handleFilterChange("role", e.target.value)}
            className="px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-300 bg-gray-50 focus:bg-white"
          >
            <option value="">جميع الأدوار</option>
            <option value="admin">Admin</option>
            <option value="manager">Manager</option>
            <option value="distributor">Distributor</option>
            <option value="cashier">Cashier</option>
            <option value="accountant">Accountant</option>
          </select>

          <select
            value={filters.status}
            onChange={(e) => handleFilterChange("status", e.target.value)}
            className="px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-300 bg-gray-50 focus:bg-white"
          >
            <option value="">جميع الحالات</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
            <option value="pending">Pending</option>
          </select>

          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={handleExport}
            className="bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white px-6 py-3 rounded-xl font-semibold flex items-center justify-center gap-2 transition-all duration-300 shadow-lg hover:shadow-xl"
          >
            <Download className="w-5 h-5" />
            تصدير البيانات
          </motion.button>
        </div>
      </motion.div>

      {/* Enhanced Data Table */}
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.6, duration: 0.6 }}
        className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden"
      >
        <DataTable
          data={filteredUsers}
          columns={columns}
          isLoading={isLoading}
          className="rounded-2xl"
        />
      </motion.div>
    </div>
  );
};

export default UsersListPage;
