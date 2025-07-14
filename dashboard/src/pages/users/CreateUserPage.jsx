import React, { useState } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import {
  User,
  Mail,
  Phone,
  Lock,
  Eye,
  EyeOff,
  MapPin,
  Shield,
  Save,
  ArrowLeft,
  AlertCircle,
  CheckCircle,
  Crown,
  Briefcase,
  Truck,
  ShoppingCart,
  Settings,
} from "lucide-react";
import { Link } from "react-router-dom";
import { Card, CardHeader, CardBody } from "../../components/ui/Card";
import Button from "../../components/ui/Button";
import Input from "../../components/ui/Input";

const CreateUserPage = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
    role: "",
    store: "",
    status: "active",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const roles = [
    {
      value: "admin",
      label: "Admin",
      description: "Full system access and control",
      icon: Crown,
      color: "purple",
      permissions: ["all"],
    },
    {
      value: "manager",
      label: "Manager",
      description: "Store management and operations",
      icon: Briefcase,
      color: "blue",
      permissions: ["orders", "products", "reports", "users"],
    },
    {
      value: "distributor",
      label: "Distributor",
      description: "Distribution and delivery management",
      icon: Truck,
      color: "orange",
      permissions: ["distribution", "delivery", "reports"],
    },
    {
      value: "cashier",
      label: "Cashier",
      description: "Point of sale and customer service",
      icon: ShoppingCart,
      color: "green",
      permissions: ["orders", "payments"],
    },
    {
      value: "accountant",
      label: "Accountant",
      description: "Financial management and reporting",
      icon: Settings,
      color: "indigo",
      permissions: ["payments", "reports", "financial"],
    },
  ];

  const stores = [
    { id: 1, name: "Main Office" },
    { id: 2, name: "Downtown Store" },
    { id: 3, name: "Westside Store" },
    { id: 4, name: "Eastside Store" },
    { id: 5, name: "Distribution Center" },
  ];

  const validateForm = () => {
    const newErrors = {};

    // Name validation
    if (!formData.name.trim()) {
      newErrors.name = "Name is required";
    } else if (formData.name.trim().length < 2) {
      newErrors.name = "Name must be at least 2 characters";
    }

    // Email validation
    if (!formData.email.trim()) {
      newErrors.email = "Email is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = "Please enter a valid email address";
    }

    // Phone validation
    if (!formData.phone.trim()) {
      newErrors.phone = "Phone number is required";
    } else if (!/^\+?[\d\s\-\(\)]+$/.test(formData.phone)) {
      newErrors.phone = "Please enter a valid phone number";
    }

    // Password validation
    if (!formData.password) {
      newErrors.password = "Password is required";
    } else if (formData.password.length < 8) {
      newErrors.password = "Password must be at least 8 characters";
    } else if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(formData.password)) {
      newErrors.password =
        "Password must contain uppercase, lowercase, and number";
    }

    // Confirm password validation
    if (!formData.confirmPassword) {
      newErrors.confirmPassword = "Please confirm your password";
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match";
    }

    // Role validation
    if (!formData.role) {
      newErrors.role = "Please select a role";
    }

    // Store validation
    if (!formData.store) {
      newErrors.store = "Please select a store";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsLoading(true);

    try {
      // TODO: Implement API call to create user
      await new Promise((resolve) => setTimeout(resolve, 2000)); // Simulated API call
      setIsSuccess(true);

      // Redirect after success
      setTimeout(() => {
        navigate("/users");
      }, 2000);
    } catch (error) {
      console.error("Error creating user:", error);
      setErrors({ submit: "Failed to create user. Please try again." });
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));

    // Clear error when user starts typing
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const getPasswordStrength = (password) => {
    let strength = 0;
    if (password.length >= 8) strength++;
    if (/[A-Z]/.test(password)) strength++;
    if (/[a-z]/.test(password)) strength++;
    if (/[0-9]/.test(password)) strength++;
    if (/[^A-Za-z0-9]/.test(password)) strength++;
    return strength;
  };

  const getPasswordStrengthColor = (strength) => {
    if (strength <= 1) return "text-red-500";
    if (strength <= 2) return "text-orange-500";
    if (strength <= 3) return "text-yellow-500";
    if (strength <= 4) return "text-blue-500";
    return "text-green-500";
  };

  const getPasswordStrengthText = (strength) => {
    if (strength <= 1) return "Weak";
    if (strength <= 2) return "Fair";
    if (strength <= 3) return "Good";
    if (strength <= 4) return "Strong";
    return "Excellent";
  };

  const selectedRole = roles.find((role) => role.value === formData.role);

  if (isSuccess) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-50 flex items-center justify-center p-6">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="w-full max-w-md"
        >
          <div className="bg-white rounded-2xl shadow-2xl p-8 text-center">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircle className="w-8 h-8 text-green-600" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              User Created Successfully!
            </h2>
            <p className="text-gray-600 mb-6">
              The new user has been created and can now log in to the system.
            </p>
            <div className="text-sm text-gray-500">
              Redirecting to users list...
            </div>
          </div>
        </motion.div>
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
        <div className="flex items-center space-x-4">
          <Link to="/users">
            <Button variant="ghost" icon={<ArrowLeft className="w-4 h-4" />}>
              Back
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              Create New User
            </h1>
            <p className="text-gray-600">Add a new user to the system</p>
          </div>
        </div>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Form */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <h2 className="text-lg font-semibold text-gray-900">
                User Information
              </h2>
            </CardHeader>
            <CardBody>
              <form onSubmit={handleSubmit} className="space-y-6">
                {errors.submit && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="p-4 bg-red-50 border border-red-200 rounded-lg flex items-center"
                  >
                    <AlertCircle className="w-5 h-5 text-red-400 mr-3" />
                    <span className="text-red-700 text-sm">
                      {errors.submit}
                    </span>
                  </motion.div>
                )}

                {/* Name and Email */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Full Name *
                    </label>
                    <Input
                      type="text"
                      name="name"
                      placeholder="Enter full name"
                      value={formData.name}
                      onChange={handleChange}
                      icon={<User className="w-4 h-4" />}
                      error={errors.name}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Email Address *
                    </label>
                    <Input
                      type="email"
                      name="email"
                      placeholder="Enter email address"
                      value={formData.email}
                      onChange={handleChange}
                      icon={<Mail className="w-4 h-4" />}
                      error={errors.email}
                    />
                  </div>
                </div>

                {/* Phone and Store */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Phone Number *
                    </label>
                    <Input
                      type="tel"
                      name="phone"
                      placeholder="Enter phone number"
                      value={formData.phone}
                      onChange={handleChange}
                      icon={<Phone className="w-4 h-4" />}
                      error={errors.phone}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Store *
                    </label>
                    <select
                      name="store"
                      value={formData.store}
                      onChange={handleChange}
                      className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                        errors.store ? "border-red-300" : "border-gray-300"
                      }`}
                    >
                      <option value="">Select a store</option>
                      {stores.map((store) => (
                        <option key={store.id} value={store.name}>
                          {store.name}
                        </option>
                      ))}
                    </select>
                    {errors.store && (
                      <p className="mt-1 text-sm text-red-600">
                        {errors.store}
                      </p>
                    )}
                  </div>
                </div>

                {/* Password Fields */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Password *
                    </label>
                    <Input
                      type={showPassword ? "text" : "password"}
                      name="password"
                      placeholder="Enter password"
                      value={formData.password}
                      onChange={handleChange}
                      icon={<Lock className="w-4 h-4" />}
                      rightIcon={
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                        >
                          {showPassword ? (
                            <EyeOff className="w-4 h-4" />
                          ) : (
                            <Eye className="w-4 h-4" />
                          )}
                        </button>
                      }
                      error={errors.password}
                    />
                    {formData.password && (
                      <div className="mt-2">
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-gray-500">
                            Password strength:
                          </span>
                          <span
                            className={getPasswordStrengthColor(
                              getPasswordStrength(formData.password)
                            )}
                          >
                            {getPasswordStrengthText(
                              getPasswordStrength(formData.password)
                            )}
                          </span>
                        </div>
                        <div className="mt-1 h-1 bg-gray-200 rounded-full overflow-hidden">
                          <div
                            className={`h-full transition-all duration-300 ${getPasswordStrengthColor(
                              getPasswordStrength(formData.password)
                            ).replace("text-", "bg-")}`}
                            style={{
                              width: `${
                                (getPasswordStrength(formData.password) / 5) *
                                100
                              }%`,
                            }}
                          />
                        </div>
                      </div>
                    )}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Confirm Password *
                    </label>
                    <Input
                      type={showConfirmPassword ? "text" : "password"}
                      name="confirmPassword"
                      placeholder="Confirm password"
                      value={formData.confirmPassword}
                      onChange={handleChange}
                      icon={<Lock className="w-4 h-4" />}
                      rightIcon={
                        <button
                          type="button"
                          onClick={() =>
                            setShowConfirmPassword(!showConfirmPassword)
                          }
                        >
                          {showConfirmPassword ? (
                            <EyeOff className="w-4 h-4" />
                          ) : (
                            <Eye className="w-4 h-4" />
                          )}
                        </button>
                      }
                      error={errors.confirmPassword}
                    />
                  </div>
                </div>

                {/* Submit Button */}
                <div className="flex justify-end space-x-3 pt-6 border-t">
                  <Link to="/users">
                    <Button variant="outline">Cancel</Button>
                  </Link>
                  <Button
                    type="submit"
                    variant="primary"
                    icon={<Save className="w-4 h-4" />}
                    loading={isLoading}
                    disabled={isLoading}
                  >
                    {isLoading ? "Creating..." : "Create User"}
                  </Button>
                </div>
              </form>
            </CardBody>
          </Card>
        </div>

        {/* Role Selection */}
        <div className="lg:col-span-1">
          <Card>
            <CardHeader>
              <h2 className="text-lg font-semibold text-gray-900">
                Role & Permissions
              </h2>
            </CardHeader>
            <CardBody>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-3">
                    Select Role *
                  </label>
                  <div className="space-y-3">
                    {roles.map((role) => {
                      const Icon = role.icon;
                      return (
                        <div
                          key={role.value}
                          className={`p-4 border rounded-lg cursor-pointer transition-all ${
                            formData.role === role.value
                              ? `border-${role.color}-500 bg-${role.color}-50`
                              : "border-gray-200 hover:border-gray-300"
                          }`}
                          onClick={() =>
                            handleChange({
                              target: { name: "role", value: role.value },
                            })
                          }
                        >
                          <div className="flex items-center">
                            <div
                              className={`w-8 h-8 bg-${role.color}-100 rounded-full flex items-center justify-center mr-3`}
                            >
                              <Icon
                                className={`w-4 h-4 text-${role.color}-600`}
                              />
                            </div>
                            <div className="flex-1">
                              <div className="font-medium text-gray-900">
                                {role.label}
                              </div>
                              <div className="text-sm text-gray-500">
                                {role.description}
                              </div>
                            </div>
                            {formData.role === role.value && (
                              <CheckCircle
                                className={`w-5 h-5 text-${role.color}-600`}
                              />
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                  {errors.role && (
                    <p className="mt-2 text-sm text-red-600">{errors.role}</p>
                  )}
                </div>

                {/* Selected Role Permissions */}
                {selectedRole && (
                  <div className="mt-6 p-4 bg-gray-50 rounded-lg">
                    <h3 className="text-sm font-medium text-gray-900 mb-3">
                      Permissions for {selectedRole.label}
                    </h3>
                    <div className="space-y-2">
                      {selectedRole.permissions.map((permission, index) => (
                        <div
                          key={index}
                          className="flex items-center text-sm text-gray-600"
                        >
                          <CheckCircle className="w-4 h-4 text-green-500 mr-2" />
                          {permission.charAt(0).toUpperCase() +
                            permission.slice(1)}{" "}
                          access
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </CardBody>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default CreateUserPage;
