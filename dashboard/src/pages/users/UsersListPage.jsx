import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
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
        },
      ]);
      setIsLoading(false);
    }, 1000);

    return () => clearTimeout(timer);
  }, []);

  const getStatusColor = (status) => {
    switch (status) {
      case "active":
        return "bg-green-100 text-green-800";
      case "inactive":
        return "bg-red-100 text-red-800";
      case "pending":
        return "bg-yellow-100 text-yellow-800";
      default:
        return "bg-gray-100 text-gray-800";
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
        return "bg-purple-100 text-purple-800";
      case "manager":
        return "bg-blue-100 text-blue-800";
      case "distributor":
        return "bg-orange-100 text-orange-800";
      case "cashier":
        return "bg-green-100 text-green-800";
      case "accountant":
        return "bg-indigo-100 text-indigo-800";
      default:
        return "bg-gray-100 text-gray-800";
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

  const columns = [
    {
      key: "name",
      title: "User",
      render: (value, row) => (
        <div className="flex items-center">
          <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center mr-3">
            <span className="text-sm font-medium text-blue-600">
              {row.avatar}
            </span>
          </div>
          <div>
            <div className="font-medium text-gray-900">{value}</div>
            <div className="text-sm text-gray-500">ID: {row.id}</div>
          </div>
        </div>
      ),
    },
    {
      key: "email",
      title: "Contact",
      render: (value, row) => (
        <div className="space-y-1">
          <div className="flex items-center text-sm text-gray-900">
            <Mail className="w-4 h-4 text-gray-400 mr-2" />
            {value}
          </div>
          <div className="flex items-center text-sm text-gray-500">
            <Phone className="w-4 h-4 text-gray-400 mr-2" />
            {row.phone}
          </div>
        </div>
      ),
    },
    {
      key: "role",
      title: "Role",
      render: (value) => {
        const Icon = getRoleIcon(value);
        return (
          <div className="flex items-center">
            <Icon className="w-4 h-4 text-gray-400 mr-2" />
            <span
              className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getRoleColor(
                value
              )}`}
            >
              {getRoleText(value)}
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
      key: "store",
      title: "Store",
      render: (value) => (
        <div className="flex items-center text-sm text-gray-900">
          <MapPin className="w-4 h-4 text-gray-400 mr-2" />
          {value}
        </div>
      ),
    },
    {
      key: "lastLogin",
      title: "Last Login",
      render: (value) => (
        <div className="flex items-center text-sm text-gray-900">
          <Calendar className="w-4 h-4 text-gray-400 mr-2" />
          <div>
            <div>{new Date(value).toLocaleDateString()}</div>
            <div className="text-gray-500">
              {new Date(value).toLocaleTimeString()}
            </div>
          </div>
        </div>
      ),
    },
    {
      key: "actions",
      title: "Actions",
      render: (value, row) => (
        <div className="flex items-center space-x-2">
          <Link to={`/users/${row.id}`}>
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

  const handleDelete = (userId) => {
    if (window.confirm("Are you sure you want to delete this user?")) {
      setUsers(users.filter((user) => user.id !== userId));
    }
  };

  const handleFilterChange = (key, value) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  };

  const handleExport = () => {
    // Export functionality
    console.log("Exporting users...");
  };

  const handleRefresh = () => {
    setIsLoading(true);
    // Simulate refresh
    setTimeout(() => setIsLoading(false), 1000);
  };

  const stats = {
    total: users.length,
    active: users.filter((u) => u.status === "active").length,
    admins: users.filter((u) => u.role === "admin").length,
    managers: users.filter((u) => u.role === "manager").length,
    distributors: users.filter((u) => u.role === "distributor").length,
    cashiers: users.filter((u) => u.role === "cashier").length,
    accountants: users.filter((u) => u.role === "accountant").length,
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
          <h1 className="text-3xl font-bold text-gray-900">Users</h1>
          <p className="text-gray-600">
            Manage system users and their permissions
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
          <Link to="/users/create">
            <Button variant="primary" icon={<Plus className="w-4 h-4" />}>
              Add User
            </Button>
          </Link>
        </div>
      </motion.div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-7 gap-6">
        <Card>
          <div className="flex items-center">
            <div className="p-3 bg-blue-100 rounded-full">
              <Users className="w-6 h-6 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Users</p>
              <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
            </div>
          </div>
        </Card>

        <Card>
          <div className="flex items-center">
            <div className="p-3 bg-green-100 rounded-full">
              <UserCheck className="w-6 h-6 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Active Users</p>
              <p className="text-2xl font-bold text-gray-900">{stats.active}</p>
            </div>
          </div>
        </Card>

        <Card>
          <div className="flex items-center">
            <div className="p-3 bg-purple-100 rounded-full">
              <Crown className="w-6 h-6 text-purple-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Admins</p>
              <p className="text-2xl font-bold text-gray-900">{stats.admins}</p>
            </div>
          </div>
        </Card>

        <Card>
          <div className="flex items-center">
            <div className="p-3 bg-blue-100 rounded-full">
              <Briefcase className="w-6 h-6 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Managers</p>
              <p className="text-2xl font-bold text-gray-900">
                {stats.managers}
              </p>
            </div>
          </div>
        </Card>

        <Card>
          <div className="flex items-center">
            <div className="p-3 bg-orange-100 rounded-full">
              <Truck className="w-6 h-6 text-orange-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Distributors</p>
              <p className="text-2xl font-bold text-gray-900">
                {stats.distributors}
              </p>
            </div>
          </div>
        </Card>

        <Card>
          <div className="flex items-center">
            <div className="p-3 bg-green-100 rounded-full">
              <ShoppingCart className="w-6 h-6 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Cashiers</p>
              <p className="text-2xl font-bold text-gray-900">
                {stats.cashiers}
              </p>
            </div>
          </div>
        </Card>

        <Card>
          <div className="flex items-center">
            <div className="p-3 bg-indigo-100 rounded-full">
              <Shield className="w-6 h-6 text-indigo-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Accountants</p>
              <p className="text-2xl font-bold text-gray-900">
                {stats.accountants}
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
              onClick={() => setFilters({ role: "", status: "", search: "" })}
            >
              Clear All
            </Button>
          </div>
        </CardHeader>
        <CardBody>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Role
              </label>
              <select
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                value={filters.role}
                onChange={(e) => handleFilterChange("role", e.target.value)}
              >
                <option value="">All Roles</option>
                <option value="admin">Admin</option>
                <option value="manager">Manager</option>
                <option value="distributor">Distributor</option>
                <option value="cashier">Cashier</option>
                <option value="accountant">Accountant</option>
              </select>
            </div>
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
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
                <option value="pending">Pending</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Search
              </label>
              <Input
                placeholder="Search users..."
                value={filters.search}
                onChange={(e) => handleFilterChange("search", e.target.value)}
                icon={<Search className="w-4 h-4" />}
              />
            </div>
          </div>
        </CardBody>
      </Card>

      {/* Users Table */}
      <Card>
        <CardHeader>
          <h2 className="text-lg font-semibold text-gray-900">
            User Management
          </h2>
        </CardHeader>
        <CardBody>
          <DataTable
            data={users}
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

export default UsersListPage;
