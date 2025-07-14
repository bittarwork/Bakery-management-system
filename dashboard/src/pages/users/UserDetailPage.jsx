import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useParams, useNavigate } from "react-router-dom";
import {
  User,
  Mail,
  Phone,
  MapPin,
  Calendar,
  Clock,
  Shield,
  Edit,
  Trash2,
  ArrowLeft,
  Activity,
  Settings,
  Lock,
  Eye,
  EyeOff,
  CheckCircle,
  XCircle,
  AlertCircle,
  Crown,
  Briefcase,
  Truck,
  ShoppingCart,
  Download,
  RefreshCw,
  MoreVertical,
} from "lucide-react";
import { Link } from "react-router-dom";
import { Card, CardHeader, CardBody } from "../../components/ui/Card";
import Button from "../../components/ui/Button";
import DataTable from "../../components/ui/DataTable";

const UserDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [editForm, setEditForm] = useState({});
  const [errors, setErrors] = useState({});

  useEffect(() => {
    // Simulate loading user data
    const timer = setTimeout(() => {
      setUser({
        id: parseInt(id),
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
        activityHistory: [
          {
            id: 1,
            action: "Login",
            description: "User logged in successfully",
            timestamp: "2024-03-25 09:30",
            ip: "192.168.1.100",
            device: "Chrome on Windows",
          },
          {
            id: 2,
            action: "Order Created",
            description: "Created order #ORD-2024-001",
            timestamp: "2024-03-25 08:45",
            ip: "192.168.1.100",
            device: "Chrome on Windows",
          },
          {
            id: 3,
            action: "Product Updated",
            description: "Updated product 'Fresh Bread'",
            timestamp: "2024-03-24 16:20",
            ip: "192.168.1.100",
            device: "Chrome on Windows",
          },
          {
            id: 4,
            action: "Report Generated",
            description: "Generated daily sales report",
            timestamp: "2024-03-24 14:30",
            ip: "192.168.1.100",
            device: "Chrome on Windows",
          },
          {
            id: 5,
            action: "Login",
            description: "User logged in successfully",
            timestamp: "2024-03-24 09:15",
            ip: "192.168.1.100",
            device: "Chrome on Windows",
          },
        ],
        recentOrders: [
          {
            id: "ORD-2024-001",
            customer: "Fatima Ali",
            amount: 45.5,
            status: "completed",
            date: "2024-03-25",
          },
          {
            id: "ORD-2024-002",
            customer: "Omar Khalil",
            amount: 32.75,
            status: "pending",
            date: "2024-03-24",
          },
          {
            id: "ORD-2024-003",
            customer: "Layla Mansour",
            amount: 67.25,
            status: "completed",
            date: "2024-03-23",
          },
        ],
      });
      setEditForm({
        name: "Ahmed Hassan",
        email: "ahmed.hassan@bakery.com",
        phone: "+963 955 123 456",
        role: "admin",
        store: "Main Office",
        status: "active",
      });
      setIsLoading(false);
    }, 1000);

    return () => clearTimeout(timer);
  }, [id]);

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
        return CheckCircle;
      case "inactive":
        return XCircle;
      case "pending":
        return AlertCircle;
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
        return Settings;
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

  const activityColumns = [
    {
      key: "action",
      title: "Action",
      render: (value) => (
        <span className="font-medium text-gray-900">{value}</span>
      ),
    },
    {
      key: "description",
      title: "Description",
      render: (value) => <span className="text-gray-600">{value}</span>,
    },
    {
      key: "timestamp",
      title: "Timestamp",
      render: (value) => (
        <div className="flex items-center text-sm text-gray-500">
          <Clock className="w-4 h-4 mr-2" />
          <div>
            <div>{new Date(value).toLocaleDateString()}</div>
            <div>{new Date(value).toLocaleTimeString()}</div>
          </div>
        </div>
      ),
    },
    {
      key: "ip",
      title: "IP Address",
      render: (value) => (
        <span className="text-sm text-gray-500 font-mono">{value}</span>
      ),
    },
  ];

  const orderColumns = [
    {
      key: "id",
      title: "Order ID",
      render: (value) => (
        <span className="font-medium text-blue-600">{value}</span>
      ),
    },
    {
      key: "customer",
      title: "Customer",
      render: (value) => <span className="text-gray-900">{value}</span>,
    },
    {
      key: "amount",
      title: "Amount",
      render: (value) => (
        <span className="font-medium text-gray-900">€{value.toFixed(2)}</span>
      ),
    },
    {
      key: "status",
      title: "Status",
      render: (value) => (
        <span
          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
            value === "completed"
              ? "bg-green-100 text-green-800"
              : "bg-yellow-100 text-yellow-800"
          }`}
        >
          {value.charAt(0).toUpperCase() + value.slice(1)}
        </span>
      ),
    },
    {
      key: "date",
      title: "Date",
      render: (value) => <span className="text-sm text-gray-500">{value}</span>,
    },
  ];

  const handleEdit = () => {
    setIsEditing(true);
  };

  const handleSave = async () => {
    // TODO: Implement save functionality
    setIsEditing(false);
    // Update user data
    setUser((prev) => ({ ...prev, ...editForm }));
  };

  const handleCancel = () => {
    setIsEditing(false);
    setEditForm({
      name: user.name,
      email: user.email,
      phone: user.phone,
      role: user.role,
      store: user.store,
      status: user.status,
    });
  };

  const handleDelete = () => {
    if (window.confirm("Are you sure you want to delete this user?")) {
      // TODO: Implement delete functionality
      navigate("/users");
    }
  };

  const handleStatusToggle = () => {
    const newStatus = user.status === "active" ? "inactive" : "active";
    setUser((prev) => ({ ...prev, status: newStatus }));
    setEditForm((prev) => ({ ...prev, status: newStatus }));
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="text-center py-12">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">
          User Not Found
        </h2>
        <p className="text-gray-600 mb-6">
          The user you're looking for doesn't exist.
        </p>
        <Link to="/users">
          <Button variant="primary">Back to Users</Button>
        </Link>
      </div>
    );
  }

  const StatusIcon = getStatusIcon(user.status);
  const RoleIcon = getRoleIcon(user.role);

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between"
      >
        <div className="flex items-center space-x-4">
          <Link to="/users">
            <Button variant="ghost" icon={<ArrowLeft className="w-4 h-4" />}>
              Back
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">User Details</h1>
            <p className="text-gray-600">View and manage user information</p>
          </div>
        </div>
        <div className="flex items-center space-x-3">
          <Button variant="outline" icon={<Download className="w-4 h-4" />}>
            Export
          </Button>
          <Button variant="outline" icon={<RefreshCw className="w-4 h-4" />}>
            Refresh
          </Button>
          <Button variant="ghost" icon={<MoreVertical className="w-4 h-4" />}>
            More
          </Button>
        </div>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* User Information */}
        <div className="lg:col-span-1">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold text-gray-900">
                  User Information
                </h2>
                {!isEditing && (
                  <Button
                    variant="ghost"
                    size="sm"
                    icon={<Edit className="w-4 h-4" />}
                    onClick={handleEdit}
                  >
                    Edit
                  </Button>
                )}
              </div>
            </CardHeader>
            <CardBody>
              <div className="text-center mb-6">
                <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl font-bold text-blue-600">
                    {user.avatar}
                  </span>
                </div>
                <h3 className="text-xl font-semibold text-gray-900">
                  {user.name}
                </h3>
                <p className="text-gray-500">User ID: {user.id}</p>
              </div>

              <div className="space-y-4">
                <div className="flex items-center">
                  <Mail className="w-4 h-4 text-gray-400 mr-3" />
                  <div>
                    <p className="text-sm text-gray-500">Email</p>
                    <p className="text-gray-900">{user.email}</p>
                  </div>
                </div>

                <div className="flex items-center">
                  <Phone className="w-4 h-4 text-gray-400 mr-3" />
                  <div>
                    <p className="text-sm text-gray-500">Phone</p>
                    <p className="text-gray-900">{user.phone}</p>
                  </div>
                </div>

                <div className="flex items-center">
                  <MapPin className="w-4 h-4 text-gray-400 mr-3" />
                  <div>
                    <p className="text-sm text-gray-500">Store</p>
                    <p className="text-gray-900">{user.store}</p>
                  </div>
                </div>

                <div className="flex items-center">
                  <Calendar className="w-4 h-4 text-gray-400 mr-3" />
                  <div>
                    <p className="text-sm text-gray-500">Member Since</p>
                    <p className="text-gray-900">
                      {new Date(user.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>

                <div className="flex items-center">
                  <Clock className="w-4 h-4 text-gray-400 mr-3" />
                  <div>
                    <p className="text-sm text-gray-500">Last Login</p>
                    <p className="text-gray-900">
                      {new Date(user.lastLogin).toLocaleString()}
                    </p>
                  </div>
                </div>
              </div>

              <div className="mt-6 pt-6 border-t">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-sm font-medium text-gray-700">
                    Role
                  </span>
                  <span
                    className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getRoleColor(
                      user.role
                    )}`}
                  >
                    <RoleIcon className="w-3 h-3 mr-1" />
                    {getRoleText(user.role)}
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-700">
                    Status
                  </span>
                  <span
                    className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(
                      user.status
                    )}`}
                  >
                    <StatusIcon className="w-3 h-3 mr-1" />
                    {user.status.charAt(0).toUpperCase() + user.status.slice(1)}
                  </span>
                </div>
              </div>

              {isEditing && (
                <div className="mt-6 pt-6 border-t space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Name
                    </label>
                    <input
                      type="text"
                      value={editForm.name}
                      onChange={(e) =>
                        setEditForm((prev) => ({
                          ...prev,
                          name: e.target.value,
                        }))
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Email
                    </label>
                    <input
                      type="email"
                      value={editForm.email}
                      onChange={(e) =>
                        setEditForm((prev) => ({
                          ...prev,
                          email: e.target.value,
                        }))
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Phone
                    </label>
                    <input
                      type="tel"
                      value={editForm.phone}
                      onChange={(e) =>
                        setEditForm((prev) => ({
                          ...prev,
                          phone: e.target.value,
                        }))
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div className="flex space-x-3">
                    <Button
                      variant="outline"
                      onClick={handleCancel}
                      className="flex-1"
                    >
                      Cancel
                    </Button>
                    <Button
                      variant="primary"
                      onClick={handleSave}
                      className="flex-1"
                    >
                      Save
                    </Button>
                  </div>
                </div>
              )}
            </CardBody>
          </Card>

          {/* Quick Actions */}
          <Card className="mt-6">
            <CardHeader>
              <h3 className="text-lg font-semibold text-gray-900">
                Quick Actions
              </h3>
            </CardHeader>
            <CardBody>
              <div className="space-y-3">
                <Button
                  variant="outline"
                  className="w-full justify-start"
                  icon={<Lock className="w-4 h-4" />}
                >
                  Reset Password
                </Button>
                <Button
                  variant="outline"
                  className="w-full justify-start"
                  icon={
                    user.status === "active" ? (
                      <XCircle className="w-4 h-4" />
                    ) : (
                      <CheckCircle className="w-4 h-4" />
                    )
                  }
                  onClick={handleStatusToggle}
                >
                  {user.status === "active"
                    ? "Deactivate User"
                    : "Activate User"}
                </Button>
                <Button
                  variant="outline"
                  className="w-full justify-start"
                  icon={<Shield className="w-4 h-4" />}
                >
                  Manage Permissions
                </Button>
                <Button
                  variant="outline"
                  className="w-full justify-start text-red-600 hover:text-red-700"
                  icon={<Trash2 className="w-4 h-4" />}
                  onClick={handleDelete}
                >
                  Delete User
                </Button>
              </div>
            </CardBody>
          </Card>
        </div>

        {/* Activity and Orders */}
        <div className="lg:col-span-2 space-y-6">
          {/* Recent Activity */}
          <Card>
            <CardHeader>
              <h3 className="text-lg font-semibold text-gray-900">
                Recent Activity
              </h3>
            </CardHeader>
            <CardBody>
              <DataTable
                data={user.activityHistory}
                columns={activityColumns}
                pagination={true}
                itemsPerPage={5}
              />
            </CardBody>
          </Card>

          {/* Recent Orders */}
          <Card>
            <CardHeader>
              <h3 className="text-lg font-semibold text-gray-900">
                Recent Orders
              </h3>
            </CardHeader>
            <CardBody>
              <DataTable
                data={user.recentOrders}
                columns={orderColumns}
                pagination={true}
                itemsPerPage={5}
              />
            </CardBody>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default UserDetailPage;
