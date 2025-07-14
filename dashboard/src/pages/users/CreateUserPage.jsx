import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
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
  Sparkles,
  Zap,
  Target,
  Award,
  Star,
  Check,
  Users,
  Building,
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
      features: [
        "System Management",
        "User Management",
        "All Reports",
        "Settings",
      ],
    },
    {
      value: "manager",
      label: "Manager",
      description: "Store management and operations",
      icon: Briefcase,
      color: "blue",
      permissions: ["orders", "products", "reports", "users"],
      features: [
        "Order Management",
        "Product Management",
        "Reports",
        "Team Management",
      ],
    },
    {
      value: "distributor",
      label: "Distributor",
      description: "Distribution and delivery management",
      icon: Truck,
      color: "orange",
      permissions: ["distribution", "delivery", "reports"],
      features: [
        "Route Management",
        "Delivery Tracking",
        "Performance Reports",
      ],
    },
    {
      value: "cashier",
      label: "Cashier",
      description: "Point of sale and customer service",
      icon: ShoppingCart,
      color: "green",
      permissions: ["orders", "payments"],
      features: ["Point of Sale", "Payment Processing", "Customer Service"],
    },
    {
      value: "accountant",
      label: "Accountant",
      description: "Financial management and reporting",
      icon: Settings,
      color: "indigo",
      permissions: ["payments", "reports", "financial"],
      features: ["Financial Reports", "Payment Management", "Budget Tracking"],
    },
  ];

  const stores = [
    { id: 1, name: "Main Office", location: "Damascus Center" },
    { id: 2, name: "Downtown Store", location: "Damascus Downtown" },
    { id: 3, name: "Westside Store", location: "Damascus West" },
    { id: 4, name: "Eastside Store", location: "Damascus East" },
    { id: 5, name: "Distribution Center", location: "Industrial Zone" },
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

  const getPasswordStrengthBg = (strength) => {
    if (strength <= 1) return "from-red-500 to-pink-500";
    if (strength <= 2) return "from-orange-500 to-red-500";
    if (strength <= 3) return "from-yellow-500 to-orange-500";
    if (strength <= 4) return "from-blue-500 to-cyan-500";
    return "from-green-500 to-emerald-500";
  };

  const selectedRole = roles.find((role) => role.value === formData.role);

  if (isSuccess) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50 flex items-center justify-center p-6">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, ease: "backOut" }}
          className="w-full max-w-md"
        >
          <div className="bg-white rounded-3xl shadow-2xl p-8 text-center border border-green-200">
            <motion.div
              initial={{ scale: 0, rotate: -180 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ delay: 0.3, duration: 0.8, ease: "backOut" }}
              className="w-20 h-20 bg-gradient-to-r from-green-500 to-emerald-500 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg"
            >
              <CheckCircle className="w-10 h-10 text-white" />
            </motion.div>

            <motion.h2
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.5, duration: 0.6 }}
              className="text-2xl font-bold text-gray-900 mb-4"
            >
              تم إنشاء المستخدم بنجاح!
            </motion.h2>

            <motion.p
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.7, duration: 0.6 }}
              className="text-gray-600 mb-6 leading-relaxed"
            >
              تم إنشاء المستخدم الجديد ويمكنه الآن تسجيل الدخول إلى النظام.
            </motion.p>

            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.9, duration: 0.6 }}
              className="text-sm text-gray-500"
            >
              جاري إعادة التوجيه إلى قائمة المستخدمين...
            </motion.div>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Enhanced Header */}
      <motion.div
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.6 }}
        className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4"
      >
        <div className="flex items-center gap-4">
          <Link to="/users">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="p-3 text-gray-600 hover:bg-gray-100 rounded-xl transition-colors duration-200"
            >
              <ArrowLeft className="w-5 h-5" />
            </motion.button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
              <div className="p-2 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl">
                <Users className="w-6 h-6 text-white" />
              </div>
              إنشاء مستخدم جديد
            </h1>
            <p className="text-gray-600 mt-2">
              إضافة مستخدم جديد إلى النظام مع تحديد الصلاحيات
            </p>
          </div>
        </div>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Enhanced Main Form */}
        <div className="lg:col-span-2">
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.2, duration: 0.6 }}
            className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden"
          >
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-xl font-semibold text-gray-900 flex items-center gap-2">
                <User className="w-5 h-5 text-blue-500" />
                معلومات المستخدم
              </h2>
              <p className="text-gray-600 mt-1">
                أدخل المعلومات الأساسية للمستخدم الجديد
              </p>
            </div>

            <div className="p-6">
              <form onSubmit={handleSubmit} className="space-y-6">
                <AnimatePresence>
                  {errors.submit && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className="p-4 bg-red-50 border border-red-200 rounded-xl flex items-center"
                    >
                      <div className="p-2 bg-red-100 rounded-lg mr-3">
                        <AlertCircle className="w-5 h-5 text-red-500" />
                      </div>
                      <span className="text-red-700 text-sm font-medium">
                        {errors.submit}
                      </span>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Name and Email */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="block text-sm font-semibold text-gray-700">
                      الاسم الكامل *
                    </label>
                    <div className="relative group">
                      <Input
                        type="text"
                        name="name"
                        placeholder="أدخل الاسم الكامل"
                        value={formData.name}
                        onChange={handleChange}
                        className="bg-gray-50 border-gray-200 focus:bg-white focus:border-blue-500 transition-all duration-300"
                      />
                      <div className="absolute right-4 top-3 text-gray-400 group-hover:text-blue-500 transition-colors duration-300">
                        <User className="w-5 h-5" />
                      </div>
                    </div>
                    {errors.name && (
                      <p className="text-sm text-red-600 flex items-center gap-1">
                        <AlertCircle className="w-4 h-4" />
                        {errors.name}
                      </p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <label className="block text-sm font-semibold text-gray-700">
                      البريد الإلكتروني *
                    </label>
                    <div className="relative group">
                      <Input
                        type="email"
                        name="email"
                        placeholder="أدخل البريد الإلكتروني"
                        value={formData.email}
                        onChange={handleChange}
                        className="bg-gray-50 border-gray-200 focus:bg-white focus:border-blue-500 transition-all duration-300"
                      />
                      <div className="absolute right-4 top-3 text-gray-400 group-hover:text-blue-500 transition-colors duration-300">
                        <Mail className="w-5 h-5" />
                      </div>
                    </div>
                    {errors.email && (
                      <p className="text-sm text-red-600 flex items-center gap-1">
                        <AlertCircle className="w-4 h-4" />
                        {errors.email}
                      </p>
                    )}
                  </div>
                </div>

                {/* Phone and Store */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="block text-sm font-semibold text-gray-700">
                      رقم الهاتف *
                    </label>
                    <div className="relative group">
                      <Input
                        type="tel"
                        name="phone"
                        placeholder="أدخل رقم الهاتف"
                        value={formData.phone}
                        onChange={handleChange}
                        className="bg-gray-50 border-gray-200 focus:bg-white focus:border-blue-500 transition-all duration-300"
                      />
                      <div className="absolute right-4 top-3 text-gray-400 group-hover:text-blue-500 transition-colors duration-300">
                        <Phone className="w-5 h-5" />
                      </div>
                    </div>
                    {errors.phone && (
                      <p className="text-sm text-red-600 flex items-center gap-1">
                        <AlertCircle className="w-4 h-4" />
                        {errors.phone}
                      </p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <label className="block text-sm font-semibold text-gray-700">
                      الفرع *
                    </label>
                    <div className="relative group">
                      <select
                        name="store"
                        value={formData.store}
                        onChange={handleChange}
                        className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-300 bg-gray-50 focus:bg-white ${
                          errors.store ? "border-red-300" : "border-gray-200"
                        }`}
                      >
                        <option value="">اختر الفرع</option>
                        {stores.map((store) => (
                          <option key={store.id} value={store.name}>
                            {store.name} - {store.location}
                          </option>
                        ))}
                      </select>
                      <div className="absolute right-4 top-3 text-gray-400 group-hover:text-blue-500 transition-colors duration-300 pointer-events-none">
                        <Building className="w-5 h-5" />
                      </div>
                    </div>
                    {errors.store && (
                      <p className="text-sm text-red-600 flex items-center gap-1">
                        <AlertCircle className="w-4 h-4" />
                        {errors.store}
                      </p>
                    )}
                  </div>
                </div>

                {/* Password Fields */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="block text-sm font-semibold text-gray-700">
                      كلمة المرور *
                    </label>
                    <div className="relative group">
                      <Input
                        type={showPassword ? "text" : "password"}
                        name="password"
                        placeholder="أدخل كلمة المرور"
                        value={formData.password}
                        onChange={handleChange}
                        className="bg-gray-50 border-gray-200 focus:bg-white focus:border-blue-500 transition-all duration-300"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-4 top-3 text-gray-400 hover:text-blue-500 transition-colors duration-300"
                      >
                        {showPassword ? (
                          <EyeOff className="w-5 h-5" />
                        ) : (
                          <Eye className="w-5 h-5" />
                        )}
                      </button>
                    </div>

                    {/* Enhanced Password Strength */}
                    {formData.password && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        className="p-4 bg-gray-50 rounded-xl border border-gray-200"
                      >
                        <div className="flex items-center justify-between mb-3">
                          <span className="text-sm font-medium text-gray-700">
                            قوة كلمة المرور
                          </span>
                          <span
                            className={`text-xs font-semibold bg-gradient-to-r ${getPasswordStrengthBg(
                              getPasswordStrength(formData.password)
                            )} bg-clip-text text-transparent`}
                          >
                            {getPasswordStrengthText(
                              getPasswordStrength(formData.password)
                            )}
                          </span>
                        </div>
                        <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
                          <motion.div
                            initial={{ width: 0 }}
                            animate={{
                              width: `${
                                (getPasswordStrength(formData.password) / 5) *
                                100
                              }%`,
                            }}
                            transition={{ duration: 0.8, ease: "easeOut" }}
                            className={`h-2 rounded-full bg-gradient-to-r ${getPasswordStrengthBg(
                              getPasswordStrength(formData.password)
                            )} shadow-lg`}
                          />
                        </div>
                        <div className="mt-3 text-xs text-gray-600">
                          <div className="grid grid-cols-2 gap-2">
                            <div
                              className={`flex items-center gap-1 ${
                                formData.password.length >= 8
                                  ? "text-green-600"
                                  : "text-gray-400"
                              }`}
                            >
                              <Check className="w-3 h-3" />
                              <span>8 أحرف على الأقل</span>
                            </div>
                            <div
                              className={`flex items-center gap-1 ${
                                /[A-Z]/.test(formData.password)
                                  ? "text-green-600"
                                  : "text-gray-400"
                              }`}
                            >
                              <Check className="w-3 h-3" />
                              <span>حرف كبير</span>
                            </div>
                            <div
                              className={`flex items-center gap-1 ${
                                /[a-z]/.test(formData.password)
                                  ? "text-green-600"
                                  : "text-gray-400"
                              }`}
                            >
                              <Check className="w-3 h-3" />
                              <span>حرف صغير</span>
                            </div>
                            <div
                              className={`flex items-center gap-1 ${
                                /[0-9]/.test(formData.password)
                                  ? "text-green-600"
                                  : "text-gray-400"
                              }`}
                            >
                              <Check className="w-3 h-3" />
                              <span>رقم</span>
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    )}

                    {errors.password && (
                      <p className="text-sm text-red-600 flex items-center gap-1">
                        <AlertCircle className="w-4 h-4" />
                        {errors.password}
                      </p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <label className="block text-sm font-semibold text-gray-700">
                      تأكيد كلمة المرور *
                    </label>
                    <div className="relative group">
                      <Input
                        type={showConfirmPassword ? "text" : "password"}
                        name="confirmPassword"
                        placeholder="أعد إدخال كلمة المرور"
                        value={formData.confirmPassword}
                        onChange={handleChange}
                        className="bg-gray-50 border-gray-200 focus:bg-white focus:border-blue-500 transition-all duration-300"
                      />
                      <button
                        type="button"
                        onClick={() =>
                          setShowConfirmPassword(!showConfirmPassword)
                        }
                        className="absolute right-4 top-3 text-gray-400 hover:text-blue-500 transition-colors duration-300"
                      >
                        {showConfirmPassword ? (
                          <EyeOff className="w-5 h-5" />
                        ) : (
                          <Eye className="w-5 h-5" />
                        )}
                      </button>
                    </div>

                    {/* Password Match Indicator */}
                    {formData.confirmPassword && (
                      <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className={`p-3 rounded-xl border ${
                          formData.password === formData.confirmPassword
                            ? "bg-green-50 border-green-200"
                            : "bg-red-50 border-red-200"
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          {formData.password === formData.confirmPassword ? (
                            <CheckCircle className="w-4 h-4 text-green-500" />
                          ) : (
                            <AlertCircle className="w-4 h-4 text-red-500" />
                          )}
                          <span
                            className={`text-sm font-medium ${
                              formData.password === formData.confirmPassword
                                ? "text-green-700"
                                : "text-red-700"
                            }`}
                          >
                            {formData.password === formData.confirmPassword
                              ? "كلمات المرور متطابقة"
                              : "كلمات المرور غير متطابقة"}
                          </span>
                        </div>
                      </motion.div>
                    )}

                    {errors.confirmPassword && (
                      <p className="text-sm text-red-600 flex items-center gap-1">
                        <AlertCircle className="w-4 h-4" />
                        {errors.confirmPassword}
                      </p>
                    )}
                  </div>
                </div>

                {/* Enhanced Submit Button */}
                <div className="flex justify-end gap-4 pt-6 border-t border-gray-200">
                  <Link to="/users">
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      className="px-6 py-3 border border-gray-300 text-gray-700 rounded-xl font-semibold hover:bg-gray-50 transition-all duration-300"
                    >
                      إلغاء
                    </motion.button>
                  </Link>
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    type="submit"
                    disabled={isLoading}
                    className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed text-white px-8 py-3 rounded-xl font-semibold flex items-center gap-2 transition-all duration-300 shadow-lg hover:shadow-xl"
                  >
                    {isLoading ? (
                      <>
                        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        <span>جاري الإنشاء...</span>
                      </>
                    ) : (
                      <>
                        <Save className="w-5 h-5" />
                        <span>إنشاء المستخدم</span>
                      </>
                    )}
                  </motion.button>
                </div>
              </form>
            </div>
          </motion.div>
        </div>

        {/* Enhanced Role Selection */}
        <div className="lg:col-span-1">
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.4, duration: 0.6 }}
            className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden"
          >
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-xl font-semibold text-gray-900 flex items-center gap-2">
                <Shield className="w-5 h-5 text-purple-500" />
                الدور والصلاحيات
              </h2>
              <p className="text-gray-600 mt-1">
                اختر الدور المناسب للمستخدم الجديد
              </p>
            </div>

            <div className="p-6">
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-4">
                    اختر الدور *
                  </label>
                  <div className="space-y-3">
                    {roles.map((role) => {
                      const Icon = role.icon;
                      return (
                        <motion.div
                          key={role.value}
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                          className={`p-4 border-2 rounded-xl cursor-pointer transition-all duration-300 ${
                            formData.role === role.value
                              ? role.color === "purple"
                                ? "border-purple-500 bg-purple-50 shadow-lg"
                                : role.color === "blue"
                                ? "border-blue-500 bg-blue-50 shadow-lg"
                                : role.color === "orange"
                                ? "border-orange-500 bg-orange-50 shadow-lg"
                                : role.color === "green"
                                ? "border-green-500 bg-green-50 shadow-lg"
                                : role.color === "indigo"
                                ? "border-indigo-500 bg-indigo-50 shadow-lg"
                                : "border-gray-500 bg-gray-50 shadow-lg"
                              : "border-gray-200 hover:border-gray-300 hover:bg-gray-50"
                          }`}
                          onClick={() =>
                            handleChange({
                              target: { name: "role", value: role.value },
                            })
                          }
                        >
                          <div className="flex items-start">
                            <div
                              className={`w-10 h-10 rounded-xl flex items-center justify-center mr-3 ${
                                role.color === "purple"
                                  ? "bg-purple-100"
                                  : role.color === "blue"
                                  ? "bg-blue-100"
                                  : role.color === "orange"
                                  ? "bg-orange-100"
                                  : role.color === "green"
                                  ? "bg-green-100"
                                  : role.color === "indigo"
                                  ? "bg-indigo-100"
                                  : "bg-gray-100"
                              }`}
                            >
                              <Icon
                                className={`w-5 h-5 ${
                                  role.color === "purple"
                                    ? "text-purple-600"
                                    : role.color === "blue"
                                    ? "text-blue-600"
                                    : role.color === "orange"
                                    ? "text-orange-600"
                                    : role.color === "green"
                                    ? "text-green-600"
                                    : role.color === "indigo"
                                    ? "text-indigo-600"
                                    : "text-gray-600"
                                }`}
                              />
                            </div>
                            <div className="flex-1">
                              <div className="font-semibold text-gray-900 text-lg">
                                {role.label}
                              </div>
                              <div className="text-sm text-gray-600 mt-1">
                                {role.description}
                              </div>
                            </div>
                            {formData.role === role.value && (
                              <motion.div
                                initial={{ scale: 0 }}
                                animate={{ scale: 1 }}
                                transition={{ duration: 0.2 }}
                              >
                                <CheckCircle
                                  className={`w-6 h-6 ${
                                    role.color === "purple"
                                      ? "text-purple-600"
                                      : role.color === "blue"
                                      ? "text-blue-600"
                                      : role.color === "orange"
                                      ? "text-orange-600"
                                      : role.color === "green"
                                      ? "text-green-600"
                                      : role.color === "indigo"
                                      ? "text-indigo-600"
                                      : "text-gray-600"
                                  }`}
                                />
                              </motion.div>
                            )}
                          </div>
                        </motion.div>
                      );
                    })}
                  </div>
                  {errors.role && (
                    <p className="mt-3 text-sm text-red-600 flex items-center gap-1">
                      <AlertCircle className="w-4 h-4" />
                      {errors.role}
                    </p>
                  )}
                </div>

                {/* Enhanced Selected Role Permissions */}
                {selectedRole && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6 }}
                    className="mt-8 p-6 bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl border border-gray-200"
                  >
                    <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                      <Award className="w-5 h-5 text-purple-500" />
                      صلاحيات {selectedRole.label}
                    </h3>
                    <div className="space-y-3">
                      {selectedRole.features.map((feature, index) => (
                        <motion.div
                          key={index}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: index * 0.1, duration: 0.5 }}
                          className="flex items-center text-sm text-gray-700"
                        >
                          <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center mr-3">
                            <Check className="w-3 h-3 text-green-600" />
                          </div>
                          {feature}
                        </motion.div>
                      ))}
                    </div>
                  </motion.div>
                )}
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default CreateUserPage;
