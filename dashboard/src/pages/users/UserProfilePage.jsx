import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  User,
  Mail,
  Phone,
  MapPin,
  Camera,
  Save,
  Lock,
  Eye,
  EyeOff,
  Shield,
  Bell,
  Globe,
  Paintbrush,
  Download,
  Upload,
  Trash2,
  CheckCircle,
  AlertCircle,
  Crown,
  Briefcase,
  Truck,
  ShoppingCart,
  Settings,
  Edit,
  Star,
  TrendingUp,
  Calendar,
  DollarSign,
  Award,
  Users,
  Clock,
  Target,
  Activity,
  MapPinIcon,
  Smartphone,
  Home,
  BadgeCheck,
  Zap,
  BarChart3,
  Package,
  Timer,
  MessageSquare,
  Heart,
  Sparkles,
} from "lucide-react";
import { Card, CardHeader, CardBody } from "../../components/ui/Card";
import Button from "../../components/ui/Button";
import Input from "../../components/ui/Input";
import { useAuthStore } from "../../stores/authStore";
import { authService } from "../../services/authService";
import { toast } from "react-hot-toast";

const UserProfilePage = () => {
  const { user, updateUser } = useAuthStore();
  const fileInputRef = useRef(null);

  const [profile, setProfile] = useState({
    username: "",
    email: "",
    full_name: "",
    phone: "",
    address: "",
    role: "",
    status: "",
    hired_date: "",
    salary: "",
    license_number: "",
    bio: "",
    avatar: null,
    emergency_contact: {
      name: "",
      phone: "",
      relationship: "",
    },
    vehicle_info: {
      make: "",
      model: "",
      year: "",
      plate_number: "",
      capacity: "",
    },
  });

  const [security, setSecurity] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
    twoFactorEnabled: false,
    sessionTimeout: 30,
  });

  const [notifications, setNotifications] = useState({
    emailNotifications: true,
    pushNotifications: true,
    orderUpdates: true,
    paymentReminders: true,
    systemAlerts: true,
    marketingEmails: false,
  });

  const [performance, setPerformance] = useState({
    totalOrders: 0,
    successfulDeliveries: 0,
    rating: 0,
    currentWorkload: 0,
    todayDeliveries: 0,
    monthlyEarnings: 0,
  });

  const [isEditing, setIsEditing] = useState(false);
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [avatarPreview, setAvatarPreview] = useState(null);

  useEffect(() => {
    if (user) {
      setFormData({
        firstName: user.firstName || "",
        lastName: user.lastName || "",
        email: user.email || "",
        phone: user.phone || "",
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });
    }
  }, [user]);

  const getRoleConfig = (role) => {
    switch (role) {
      case "admin":
        return {
          color: "bg-purple-100 text-purple-800 border-purple-200",
          icon: <Crown className="w-4 h-4" />,
          label: "مدير النظام",
        };
      case "manager":
        return {
          color: "bg-blue-100 text-blue-800 border-blue-200",
          icon: <Briefcase className="w-4 h-4" />,
          label: "مدير",
        };
      case "distributor":
        return {
          color: "bg-orange-100 text-orange-800 border-orange-200",
          icon: <Truck className="w-4 h-4" />,
          label: "موزع",
        };
      case "cashier":
        return {
          color: "bg-green-100 text-green-800 border-green-200",
          icon: <ShoppingCart className="w-4 h-4" />,
          label: "كاشير",
        };
      case "accountant":
        return {
          color: "bg-indigo-100 text-indigo-800 border-indigo-200",
          icon: <Calculator className="w-4 h-4" />,
          label: "محاسب",
        };
      default:
        return {
          color: "bg-gray-100 text-gray-800 border-gray-200",
          icon: <User className="w-4 h-4" />,
          label: "مستخدم",
        };
    }
  };

  const getStatusConfig = (status) => {
    switch (status) {
      case "active":
        return {
          color: "bg-emerald-100 text-emerald-800 border-emerald-200",
          icon: <UserCheck className="w-4 h-4" />,
          label: "نشط",
        };
      case "inactive":
        return {
          color: "bg-red-100 text-red-800 border-red-200",
          icon: <UserX className="w-4 h-4" />,
          label: "غير نشط",
        };
      default:
        return {
          color: "bg-gray-100 text-gray-800 border-gray-200",
          icon: <AlertCircle className="w-4 h-4" />,
          label: "غير محدد",
        };
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return "غير محدد";
    return new Date(dateString).toLocaleDateString("ar-SA");
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSave = async () => {
    try {
      setIsLoading(true);
      setError("");
      setSuccess("");

      // Validate passwords if changing
      if (formData.newPassword) {
        if (!formData.currentPassword) {
          setError("كلمة المرور الحالية مطلوبة");
          return;
        }
        if (formData.newPassword !== formData.confirmPassword) {
          setError("كلمة المرور الجديدة غير متطابقة");
          return;
        }
        if (formData.newPassword.length < 6) {
          setError("كلمة المرور الجديدة يجب أن تكون 6 أحرف على الأقل");
          return;
        }
      }

      const updateData = {
        firstName: formData.firstName,
        lastName: formData.lastName,
        email: formData.email,
        phone: formData.phone,
      };

      if (formData.newPassword) {
        updateData.currentPassword = formData.currentPassword;
        updateData.newPassword = formData.newPassword;
      }

      const response = await userService.updateProfile(updateData);

      if (response.success) {
        setSuccess("تم تحديث الملف الشخصي بنجاح");
        updateUser(response.data);
        setIsEditing(false);
        // Clear password fields
        setFormData((prev) => ({
          ...prev,
          currentPassword: "",
          newPassword: "",
          confirmPassword: "",
        }));
      } else {
        setError(response.message);
      }
    } catch (error) {
      setError("خطأ في تحديث الملف الشخصي");
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    setIsEditing(false);
    setError("");
    setSuccess("");
    // Reset form data to original user data
    if (user) {
      setFormData({
        firstName: user.firstName || "",
        lastName: user.lastName || "",
        email: user.email || "",
        phone: user.phone || "",
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });
    }
  };

  if (!user) {
    return <LoadingSpinner />;
  }

  const roleConfig = getRoleConfig(user.role);
  const statusConfig = getStatusConfig(user.status);

  return (
    <div className="container mx-auto px-4 py-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            الملف الشخصي
          </h1>
          <p className="text-gray-600">عرض وتعديل معلوماتك الشخصية</p>
        </div>

        {/* Success/Error Messages */}
        {success && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-4 p-4 bg-green-100 border border-green-400 text-green-700 rounded-lg flex items-center"
          >
            <CheckCircle className="w-5 h-5 mr-2" />
            {success}
          </motion.div>
        )}

        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded-lg flex items-center"
          >
            <XCircle className="w-5 h-5 mr-2" />
            {error}
          </motion.div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Profile Information */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <User className="w-6 h-6 text-gray-600 mr-2" />
                    <h2 className="text-xl font-semibold text-gray-900">
                      المعلومات الشخصية
                    </h2>
                  </div>
                  {!isEditing && (
                    <EnhancedButton
                      onClick={() => setIsEditing(true)}
                      variant="outline"
                      size="sm"
                      className="flex items-center"
                    >
                      <Edit className="w-4 h-4 mr-1" />
                      تعديل
                    </EnhancedButton>
                  )}
                </div>
              </CardHeader>
              <CardBody>
                {isEditing ? (
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          الاسم الأول
                        </label>
                        <input
                          type="text"
                          name="firstName"
                          value={formData.firstName}
                          onChange={handleInputChange}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          الاسم الأخير
                        </label>
                        <input
                          type="text"
                          name="lastName"
                          value={formData.lastName}
                          onChange={handleInputChange}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        البريد الإلكتروني
                      </label>
                      <input
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        رقم الهاتف
                      </label>
                      <input
                        type="tel"
                        name="phone"
                        value={formData.phone}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>

                    {/* Password Change Section */}
                    <div className="border-t pt-4 mt-4">
                      <h3 className="text-lg font-medium text-gray-900 mb-3 flex items-center">
                        <Lock className="w-5 h-5 mr-2" />
                        تغيير كلمة المرور
                      </h3>
                      <div className="space-y-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            كلمة المرور الحالية
                          </label>
                          <div className="relative">
                            <input
                              type={showPassword ? "text" : "password"}
                              name="currentPassword"
                              value={formData.currentPassword}
                              onChange={handleInputChange}
                              className="w-full px-3 py-2 pr-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            />
                            <button
                              type="button"
                              onClick={() => setShowPassword(!showPassword)}
                              className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
                            >
                              {showPassword ? (
                                <EyeOff className="w-4 h-4" />
                              ) : (
                                <Eye className="w-4 h-4" />
                              )}
                            </button>
                          </div>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            كلمة المرور الجديدة
                          </label>
                          <input
                            type="password"
                            name="newPassword"
                            value={formData.newPassword}
                            onChange={handleInputChange}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            تأكيد كلمة المرور الجديدة
                          </label>
                          <input
                            type="password"
                            name="confirmPassword"
                            value={formData.confirmPassword}
                            onChange={handleInputChange}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          />
                        </div>
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex justify-end space-x-3 space-x-reverse pt-4">
                      <EnhancedButton
                        onClick={handleCancel}
                        variant="outline"
                        disabled={isLoading}
                      >
                        <X className="w-4 h-4 mr-1" />
                        إلغاء
                      </EnhancedButton>
                      <EnhancedButton
                        onClick={handleSave}
                        disabled={isLoading}
                        className="flex items-center"
                      >
                        {isLoading ? (
                          <LoadingSpinner size="sm" />
                        ) : (
                          <Save className="w-4 h-4 mr-1" />
                        )}
                        حفظ التغييرات
                      </EnhancedButton>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-500 mb-1">
                          الاسم الأول
                        </label>
                        <p className="text-gray-900">
                          {user.firstName || "غير محدد"}
                        </p>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-500 mb-1">
                          الاسم الأخير
                        </label>
                        <p className="text-gray-900">
                          {user.lastName || "غير محدد"}
                        </p>
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-500 mb-1">
                        البريد الإلكتروني
                      </label>
                      <p className="text-gray-900 flex items-center">
                        <Mail className="w-4 h-4 mr-2" />
                        {user.email}
                      </p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-500 mb-1">
                        رقم الهاتف
                      </label>
                      <p className="text-gray-900 flex items-center">
                        <Phone className="w-4 h-4 mr-2" />
                        {user.phone || "غير محدد"}
                      </p>
                    </div>
                  </div>
                )}
              </CardBody>
            </Card>
          </div>

          {/* Account Information */}
          <div className="lg:col-span-1">
            <Card>
              <CardHeader>
                <div className="flex items-center">
                  <Shield className="w-6 h-6 text-gray-600 mr-2" />
                  <h2 className="text-xl font-semibold text-gray-900">
                    معلومات الحساب
                  </h2>
                </div>
              </CardHeader>
              <CardBody>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-500 mb-1">
                      اسم المستخدم
                    </label>
                    <p className="text-gray-900 font-medium">{user.username}</p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-500 mb-1">
                      الدور
                    </label>
                    <div
                      className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium border ${roleConfig.color}`}
                    >
                      {roleConfig.icon}
                      <span className="mr-1">{roleConfig.label}</span>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-500 mb-1">
                      الحالة
                    </label>
                    <div
                      className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium border ${statusConfig.color}`}
                    >
                      {statusConfig.icon}
                      <span className="mr-1">{statusConfig.label}</span>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-500 mb-1">
                      تاريخ الإنشاء
                    </label>
                    <p className="text-gray-900 flex items-center">
                      <Calendar className="w-4 h-4 mr-2" />
                      {formatDate(user.createdAt)}
                    </p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-500 mb-1">
                      آخر تحديث
                    </label>
                    <p className="text-gray-900 flex items-center">
                      <Settings className="w-4 h-4 mr-2" />
                      {formatDate(user.updatedAt)}
                    </p>
                  </div>
                </div>
              </CardBody>
            </Card>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default UserProfilePage;
