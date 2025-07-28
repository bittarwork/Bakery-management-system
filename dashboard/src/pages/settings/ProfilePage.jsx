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
  Sparkles
} from "lucide-react";
import { Card, CardHeader, CardBody } from "../../components/ui/Card";
import Button from "../../components/ui/Button";
import Input from "../../components/ui/Input";
import { useAuthStore } from "../../stores/authStore";
import { authService } from "../../services/authService";
import { toast } from "react-hot-toast";

const ProfilePage = () => {
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
      relationship: ""
    },
    vehicle_info: {
      make: "",
      model: "",
      year: "",
      plate_number: "",
      capacity: ""
    }
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
    monthlyEarnings: 0
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

  // Load user data on component mount
  useEffect(() => {
    if (user) {
      setProfile({
        username: user.username || "",
        email: user.email || "",
        full_name: user.full_name || "",
        phone: user.phone || "",
        address: user.address || "",
        role: user.role || "",
        status: user.status || "",
        hired_date: user.hired_date || "",
        salary: user.salary || "",
        license_number: user.license_number || "",
        bio: user.bio || "",
        avatar: user.avatar || null,
        emergency_contact: user.emergency_contact || {
          name: "",
          phone: "",
          relationship: ""
        },
        vehicle_info: user.vehicle_info || {
          make: "",
          model: "",
          year: "",
          plate_number: "",
          capacity: ""
        }
      });

      // Set performance data for distributors
      if (user.role === 'distributor') {
        setPerformance({
          totalOrders: user.total_orders || 0,
          successfulDeliveries: user.successful_deliveries || 0,
          rating: user.performance_rating || 0,
          currentWorkload: user.current_workload || 0,
          todayDeliveries: user.today_deliveries || 0,
          monthlyEarnings: user.monthly_earnings || 0
        });
      }
    }
  }, [user]);

  const roles = [
    {
      value: "admin",
      label: "مدير النظام",
      icon: Crown,
      color: "purple",
      description: "صلاحية كاملة على النظام",
      gradient: "from-purple-500 to-indigo-500"
    },
    {
      value: "manager",
      label: "مدير فرع",
      icon: Briefcase,
      color: "blue",
      description: "إدارة العمليات والفروع",
      gradient: "from-blue-500 to-cyan-500"
    },
    {
      value: "distributor",
      label: "موزع",
      icon: Truck,
      color: "orange",
      description: "توزيع وتسليم الطلبات",
      gradient: "from-orange-500 to-red-500"
    },
    {
      value: "cashier",
      label: "كاشير",
      icon: ShoppingCart,
      color: "green",
      description: "نقاط البيع وخدمة العملاء",
      gradient: "from-green-500 to-emerald-500"
    },
    {
      value: "accountant",
      label: "محاسب",
      icon: BarChart3,
      color: "indigo",
      description: "الإدارة المالية والتقارير",
      gradient: "from-indigo-500 to-purple-500"
    },
  ];

  const statusColors = {
    active: { color: "green", label: "نشط", icon: CheckCircle },
    inactive: { color: "gray", label: "غير نشط", icon: Clock },
    suspended: { color: "red", label: "موقوف", icon: AlertCircle },
    pending: { color: "yellow", label: "في الانتظار", icon: Timer }
  };

  const workStatusColors = {
    available: { color: "green", label: "متاح", icon: CheckCircle },
    busy: { color: "orange", label: "مشغول", icon: Clock },
    offline: { color: "gray", label: "غير متصل", icon: AlertCircle },
    break: { color: "blue", label: "استراحة", icon: Timer }
  };

  const handleAvatarChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) { // 5MB limit
        toast.error("حجم الملف يجب أن يكون أقل من 5 ميجابايت");
        return;
      }

      const reader = new FileReader();
      reader.onload = (e) => {
        setAvatarPreview(e.target.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleAvatarUpload = async () => {
    if (!avatarPreview) return;

    setIsLoading(true);
    try {
      const file = fileInputRef.current.files[0];
      const response = await authService.updateAvatar(file);
      
      if (response.success) {
        updateUser({ avatar: response.data.avatar });
        setProfile(prev => ({ ...prev, avatar: response.data.avatar }));
        toast.success("تم تحديث الصورة الشخصية بنجاح");
        setAvatarPreview(null);
      } else {
        throw new Error(response.message);
      }
    } catch (error) {
      toast.error(error.message || "حدث خطأ في تحديث الصورة");
    } finally {
      setIsLoading(false);
    }
  };

  const validateProfileForm = () => {
    const newErrors = {};

    if (!profile.full_name.trim()) {
      newErrors.full_name = "الاسم الكامل مطلوب";
    }

    if (!profile.email.trim()) {
      newErrors.email = "البريد الإلكتروني مطلوب";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(profile.email)) {
      newErrors.email = "يرجى إدخال بريد إلكتروني صحيح";
    }

    if (!profile.phone.trim()) {
      newErrors.phone = "رقم الهاتف مطلوب";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validatePasswordForm = () => {
    const newErrors = {};

    if (!security.currentPassword) {
      newErrors.currentPassword = "كلمة المرور الحالية مطلوبة";
    }

    if (!security.newPassword) {
      newErrors.newPassword = "كلمة المرور الجديدة مطلوبة";
    } else if (security.newPassword.length < 8) {
      newErrors.newPassword = "كلمة المرور يجب أن تحتوي على 8 أحرف على الأقل";
    }

    if (!security.confirmPassword) {
      newErrors.confirmPassword = "يرجى تأكيد كلمة المرور";
    } else if (security.newPassword !== security.confirmPassword) {
      newErrors.confirmPassword = "كلمتا المرور غير متطابقتان";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleProfileSave = async () => {
    if (!validateProfileForm()) {
      return;
    }

    setIsLoading(true);
    try {
      const response = await authService.updateProfile(profile);
      
      if (response.success) {
        updateUser(response.data);
        setIsEditing(false);
        toast.success("تم تحديث الملف الشخصي بنجاح");
        setIsSuccess(true);
        setTimeout(() => setIsSuccess(false), 3000);
      } else {
        throw new Error(response.message);
      }
    } catch (error) {
      toast.error(error.message || "حدث خطأ في تحديث الملف الشخصي");
      setErrors({ submit: error.message });
    } finally {
      setIsLoading(false);
    }
  };

  const handlePasswordChange = async () => {
    if (!validatePasswordForm()) {
      return;
    }

    setIsLoading(true);
    try {
      const response = await authService.changePassword({
        currentPassword: security.currentPassword,
        newPassword: security.newPassword,
        confirmPassword: security.confirmPassword
      });
      
      if (response.success) {
        setIsChangingPassword(false);
        setSecurity({
          currentPassword: "",
          newPassword: "",
          confirmPassword: "",
          twoFactorEnabled: security.twoFactorEnabled,
          sessionTimeout: security.sessionTimeout,
        });
        toast.success("تم تغيير كلمة المرور بنجاح");
      } else {
        throw new Error(response.message);
      }
    } catch (error) {
      toast.error(error.message || "حدث خطأ في تغيير كلمة المرور");
      setErrors({ submit: error.message });
    } finally {
      setIsLoading(false);
    }
  };

  const handleProfileChange = (field, value) => {
    setProfile((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: "" }));
    }
  };

  const handleEmergencyContactChange = (field, value) => {
    setProfile((prev) => ({
      ...prev,
      emergency_contact: { ...prev.emergency_contact, [field]: value }
    }));
  };

  const handleVehicleInfoChange = (field, value) => {
    setProfile((prev) => ({
      ...prev,
      vehicle_info: { ...prev.vehicle_info, [field]: value }
    }));
  };

  const selectedRole = roles.find((role) => role.value === profile.role);
  const RoleIcon = selectedRole?.icon || User;
  const currentStatus = statusColors[profile.status] || statusColors.active;
  const StatusIcon = currentStatus.icon;

  const getInitials = (name) => {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('ar-SY', {
      style: 'currency',
      currency: 'SYP'
    }).format(amount);
  };

  const formatDate = (dateString) => {
    if (!dateString) return '';
    return new Date(dateString).toLocaleDateString('ar-SY');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 p-6">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header with Success Animation */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative"
        >
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent">
                الملف الشخصي
              </h1>
              <p className="text-gray-600 mt-2">إدارة معلوماتك الشخصية وإعداداتك</p>
            </div>
            
            <AnimatePresence>
              {isSuccess && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.8, x: 50 }}
                  animate={{ opacity: 1, scale: 1, x: 0 }}
                  exit={{ opacity: 0, scale: 0.8, x: 50 }}
                  className="flex items-center bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-xl px-6 py-3 shadow-lg"
                >
                  <CheckCircle className="w-5 h-5 mr-2" />
                  <span className="font-medium">تم الحفظ بنجاح!</span>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </motion.div>

        <div className="grid grid-cols-1 xl:grid-cols-4 gap-8">
          {/* Left Sidebar - Profile Card */}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
            className="xl:col-span-1"
          >
            <Card className="relative overflow-hidden">
              {/* Gradient Background */}
              <div className={`absolute inset-0 bg-gradient-to-br ${selectedRole?.gradient || 'from-blue-500 to-purple-500'} opacity-10`}></div>
              
              <CardBody className="relative text-center p-8">
                {/* Avatar Section */}
                <div className="relative inline-block mb-6">
                  <div className="relative">
                    {avatarPreview ? (
                      <img
                        src={avatarPreview}
                        alt="Preview"
                        className="w-32 h-32 rounded-full object-cover border-4 border-white shadow-xl"
                      />
                    ) : profile.avatar ? (
                      <img
                        src={profile.avatar}
                        alt={profile.full_name}
                        className="w-32 h-32 rounded-full object-cover border-4 border-white shadow-xl"
                      />
                    ) : (
                      <div className={`w-32 h-32 rounded-full border-4 border-white shadow-xl bg-gradient-to-br ${selectedRole?.gradient || 'from-blue-500 to-purple-500'} flex items-center justify-center`}>
                        <span className="text-4xl font-bold text-white">
                          {getInitials(profile.full_name || 'User')}
                        </span>
                      </div>
                    )}
                    
                    {/* Camera Button */}
                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => fileInputRef.current?.click()}
                      className="absolute -bottom-2 -right-2 w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white shadow-lg hover:shadow-xl transition-all duration-300"
                    >
                      <Camera className="w-5 h-5" />
                    </motion.button>
                    
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      onChange={handleAvatarChange}
                      className="hidden"
                    />
                  </div>
                  
                  {/* Upload Button */}
                  {avatarPreview && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="mt-4 flex space-x-2 justify-center"
                    >
                      <Button
                        size="sm"
                        variant="primary"
                        onClick={handleAvatarUpload}
                        loading={isLoading}
                        icon={<Upload className="w-4 h-4" />}
                      >
                        رفع
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => setAvatarPreview(null)}
                        icon={<Trash2 className="w-4 h-4" />}
                      >
                        إلغاء
                      </Button>
                    </motion.div>
                  )}
                </div>

                {/* User Info */}
                <h2 className="text-2xl font-bold text-gray-900 mb-2">
                  {profile.full_name || 'المستخدم'}
                </h2>
                
                {/* Role Badge */}
                <div className={`inline-flex items-center px-4 py-2 rounded-full bg-gradient-to-r ${selectedRole?.gradient || 'from-blue-500 to-purple-500'} text-white mb-4`}>
                  <RoleIcon className="w-4 h-4 mr-2" />
                  <span className="font-medium">{selectedRole?.label || 'غير محدد'}</span>
                </div>

                {/* Status */}
                <div className="flex items-center justify-center mb-6">
                  <div className={`flex items-center px-3 py-1 rounded-full bg-${currentStatus.color}-100 text-${currentStatus.color}-700`}>
                    <StatusIcon className="w-4 h-4 mr-2" />
                    <span className="text-sm font-medium">{currentStatus.label}</span>
                  </div>
                </div>

                {/* Quick Stats for Distributors */}
                {profile.role === 'distributor' && (
                  <div className="grid grid-cols-2 gap-4 mt-6">
                    <div className="text-center p-3 bg-white/50 rounded-lg">
                      <div className="flex items-center justify-center text-orange-500 mb-1">
                        <Star className="w-5 h-5" />
                      </div>
                      <div className="text-lg font-bold text-gray-900">
                        {performance.rating.toFixed(1)}
                      </div>
                      <div className="text-sm text-gray-600">التقييم</div>
                    </div>
                    <div className="text-center p-3 bg-white/50 rounded-lg">
                      <div className="flex items-center justify-center text-blue-500 mb-1">
                        <Package className="w-5 h-5" />
                      </div>
                      <div className="text-lg font-bold text-gray-900">
                        {performance.todayDeliveries}
                      </div>
                      <div className="text-sm text-gray-600">تسليم اليوم</div>
                    </div>
                  </div>
                )}

                {/* Contact Info */}
                <div className="mt-6 space-y-2 text-sm text-gray-600">
                  {profile.email && (
                    <div className="flex items-center justify-center">
                      <Mail className="w-4 h-4 mr-2" />
                      <span>{profile.email}</span>
                    </div>
                  )}
                  {profile.phone && (
                    <div className="flex items-center justify-center">
                      <Phone className="w-4 h-4 mr-2" />
                      <span>{profile.phone}</span>
                    </div>
                  )}
                  {profile.address && (
                    <div className="flex items-center justify-center">
                      <MapPin className="w-4 h-4 mr-2" />
                      <span className="text-center">{profile.address}</span>
                    </div>
                  )}
                </div>
              </CardBody>
            </Card>
          </motion.div>

          {/* Main Content */}
          <div className="xl:col-span-3 space-y-8">
            {/* Basic Information */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-500 rounded-lg flex items-center justify-center mr-3">
                        <User className="w-5 h-5 text-white" />
                      </div>
                      <div>
                        <h3 className="text-xl font-bold text-gray-900">المعلومات الأساسية</h3>
                        <p className="text-gray-600 text-sm">معلوماتك الشخصية والمهنية</p>
                      </div>
                    </div>
                    {!isEditing && (
                      <Button
                        variant="ghost"
                        size="sm"
                        icon={<Edit className="w-4 h-4" />}
                        onClick={() => setIsEditing(true)}
                      >
                        تعديل
                      </Button>
                    )}
                  </div>
                </CardHeader>
                
                <CardBody>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Username */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        اسم المستخدم
                      </label>
                      {isEditing ? (
                        <Input
                          type="text"
                          value={profile.username}
                          onChange={(e) => handleProfileChange("username", e.target.value)}
                          icon={<User className="w-4 h-4" />}
                          error={errors.username}
                        />
                      ) : (
                        <div className="flex items-center p-3 bg-gray-50 rounded-lg">
                          <User className="w-4 h-4 text-gray-400 mr-3" />
                          <span className="text-gray-900">{profile.username}</span>
                        </div>
                      )}
                    </div>

                    {/* Full Name */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        الاسم الكامل *
                      </label>
                      {isEditing ? (
                        <Input
                          type="text"
                          value={profile.full_name}
                          onChange={(e) => handleProfileChange("full_name", e.target.value)}
                          icon={<User className="w-4 h-4" />}
                          error={errors.full_name}
                        />
                      ) : (
                        <div className="flex items-center p-3 bg-gray-50 rounded-lg">
                          <User className="w-4 h-4 text-gray-400 mr-3" />
                          <span className="text-gray-900">{profile.full_name}</span>
                        </div>
                      )}
                    </div>

                    {/* Email */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        البريد الإلكتروني *
                      </label>
                      {isEditing ? (
                        <Input
                          type="email"
                          value={profile.email}
                          onChange={(e) => handleProfileChange("email", e.target.value)}
                          icon={<Mail className="w-4 h-4" />}
                          error={errors.email}
                        />
                      ) : (
                        <div className="flex items-center p-3 bg-gray-50 rounded-lg">
                          <Mail className="w-4 h-4 text-gray-400 mr-3" />
                          <span className="text-gray-900">{profile.email}</span>
                        </div>
                      )}
                    </div>

                    {/* Phone */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        رقم الهاتف *
                      </label>
                      {isEditing ? (
                        <Input
                          type="tel"
                          value={profile.phone}
                          onChange={(e) => handleProfileChange("phone", e.target.value)}
                          icon={<Phone className="w-4 h-4" />}
                          error={errors.phone}
                        />
                      ) : (
                        <div className="flex items-center p-3 bg-gray-50 rounded-lg">
                          <Phone className="w-4 h-4 text-gray-400 mr-3" />
                          <span className="text-gray-900">{profile.phone}</span>
                        </div>
                      )}
                    </div>

                    {/* Hired Date */}
                    {profile.hired_date && (
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          تاريخ التوظيف
                        </label>
                        <div className="flex items-center p-3 bg-gray-50 rounded-lg">
                          <Calendar className="w-4 h-4 text-gray-400 mr-3" />
                          <span className="text-gray-900">{formatDate(profile.hired_date)}</span>
                        </div>
                      </div>
                    )}

                    {/* License Number for Distributors */}
                    {profile.role === 'distributor' && (
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          رقم رخصة القيادة
                        </label>
                        {isEditing ? (
                          <Input
                            type="text"
                            value={profile.license_number}
                            onChange={(e) => handleProfileChange("license_number", e.target.value)}
                            icon={<BadgeCheck className="w-4 h-4" />}
                          />
                        ) : (
                          <div className="flex items-center p-3 bg-gray-50 rounded-lg">
                            <BadgeCheck className="w-4 h-4 text-gray-400 mr-3" />
                            <span className="text-gray-900">{profile.license_number || 'غير محدد'}</span>
                          </div>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Address */}
                  <div className="mt-6">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      العنوان
                    </label>
                    {isEditing ? (
                      <textarea
                        value={profile.address}
                        onChange={(e) => handleProfileChange("address", e.target.value)}
                        rows={3}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="أدخل عنوانك..."
                      />
                    ) : (
                      <div className="flex items-start p-3 bg-gray-50 rounded-lg">
                        <MapPin className="w-4 h-4 text-gray-400 mr-3 mt-1" />
                        <span className="text-gray-900">{profile.address || 'غير محدد'}</span>
                      </div>
                    )}
                  </div>

                  {isEditing && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="flex justify-end space-x-3 mt-8 pt-6 border-t"
                    >
                      <Button 
                        variant="outline" 
                        onClick={() => setIsEditing(false)}
                        className="ml-3"
                      >
                        إلغاء
                      </Button>
                      <Button
                        variant="primary"
                        icon={<Save className="w-4 h-4" />}
                        loading={isLoading}
                        disabled={isLoading}
                        onClick={handleProfileSave}
                      >
                        {isLoading ? "جاري الحفظ..." : "حفظ التغييرات"}
                      </Button>
                    </motion.div>
                  )}
                </CardBody>
              </Card>
            </motion.div>

            {/* Emergency Contact & Vehicle Info for Distributors */}
            {profile.role === 'distributor' && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="grid grid-cols-1 lg:grid-cols-2 gap-6"
              >
                {/* Emergency Contact */}
                <Card>
                  <CardHeader>
                    <div className="flex items-center">
                      <div className="w-10 h-10 bg-gradient-to-r from-red-500 to-pink-500 rounded-lg flex items-center justify-center mr-3">
                        <Heart className="w-5 h-5 text-white" />
                      </div>
                      <div>
                        <h3 className="text-lg font-bold text-gray-900">جهة الاتصال للطوارئ</h3>
                        <p className="text-gray-600 text-sm">معلومات الاتصال في حالات الطوارئ</p>
                      </div>
                    </div>
                  </CardHeader>
                  
                  <CardBody>
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          الاسم
                        </label>
                        <Input
                          type="text"
                          value={profile.emergency_contact.name}
                          onChange={(e) => handleEmergencyContactChange("name", e.target.value)}
                          icon={<User className="w-4 h-4" />}
                          placeholder="الاسم الكامل"
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          رقم الهاتف
                        </label>
                        <Input
                          type="tel"
                          value={profile.emergency_contact.phone}
                          onChange={(e) => handleEmergencyContactChange("phone", e.target.value)}
                          icon={<Phone className="w-4 h-4" />}
                          placeholder="رقم الهاتف"
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          صلة القرابة
                        </label>
                        <Input
                          type="text"
                          value={profile.emergency_contact.relationship}
                          onChange={(e) => handleEmergencyContactChange("relationship", e.target.value)}
                          icon={<Users className="w-4 h-4" />}
                          placeholder="والد، أخ، صديق..."
                        />
                      </div>
                    </div>
                  </CardBody>
                </Card>

                {/* Vehicle Information */}
                <Card>
                  <CardHeader>
                    <div className="flex items-center">
                      <div className="w-10 h-10 bg-gradient-to-r from-orange-500 to-red-500 rounded-lg flex items-center justify-center mr-3">
                        <Truck className="w-5 h-5 text-white" />
                      </div>
                      <div>
                        <h3 className="text-lg font-bold text-gray-900">معلومات المركبة</h3>
                        <p className="text-gray-600 text-sm">تفاصيل مركبة التوزيع</p>
                      </div>
                    </div>
                  </CardHeader>
                  
                  <CardBody>
                    <div className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            الماركة
                          </label>
                          <Input
                            type="text"
                            value={profile.vehicle_info.make}
                            onChange={(e) => handleVehicleInfoChange("make", e.target.value)}
                            placeholder="مثال: تويوتا"
                          />
                        </div>
                        
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            الموديل
                          </label>
                          <Input
                            type="text"
                            value={profile.vehicle_info.model}
                            onChange={(e) => handleVehicleInfoChange("model", e.target.value)}
                            placeholder="مثال: هايس"
                          />
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            سنة الصنع
                          </label>
                          <Input
                            type="number"
                            value={profile.vehicle_info.year}
                            onChange={(e) => handleVehicleInfoChange("year", e.target.value)}
                            placeholder="2020"
                          />
                        </div>
                        
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            رقم اللوحة
                          </label>
                          <Input
                            type="text"
                            value={profile.vehicle_info.plate_number}
                            onChange={(e) => handleVehicleInfoChange("plate_number", e.target.value)}
                            placeholder="123456"
                          />
                        </div>
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          سعة التحميل (كيلو)
                        </label>
                        <Input
                          type="number"
                          value={profile.vehicle_info.capacity}
                          onChange={(e) => handleVehicleInfoChange("capacity", e.target.value)}
                          placeholder="1000"
                        />
                      </div>
                    </div>
                  </CardBody>
                </Card>
              </motion.div>
            )}

            {/* Performance Dashboard for Distributors */}
            {profile.role === 'distributor' && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
              >
                <Card>
                  <CardHeader>
                    <div className="flex items-center">
                      <div className="w-10 h-10 bg-gradient-to-r from-green-500 to-emerald-500 rounded-lg flex items-center justify-center mr-3">
                        <TrendingUp className="w-5 h-5 text-white" />
                      </div>
                      <div>
                        <h3 className="text-xl font-bold text-gray-900">لوحة الأداء</h3>
                        <p className="text-gray-600 text-sm">إحصائيات الأداء والتوزيع</p>
                      </div>
                    </div>
                  </CardHeader>
                  
                  <CardBody>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                      {/* Total Orders */}
                      <div className="relative p-6 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-xl text-white overflow-hidden">
                        <div className="absolute inset-0 bg-white/10 backdrop-blur-sm"></div>
                        <div className="relative">
                          <div className="flex items-center justify-between mb-2">
                            <Package className="w-8 h-8" />
                            <Sparkles className="w-5 h-5 opacity-60" />
                          </div>
                          <div className="text-2xl font-bold">{performance.totalOrders}</div>
                          <div className="text-sm opacity-90">إجمالي الطلبات</div>
                        </div>
                      </div>

                      {/* Successful Deliveries */}
                      <div className="relative p-6 bg-gradient-to-br from-green-500 to-emerald-500 rounded-xl text-white overflow-hidden">
                        <div className="absolute inset-0 bg-white/10 backdrop-blur-sm"></div>
                        <div className="relative">
                          <div className="flex items-center justify-between mb-2">
                            <CheckCircle className="w-8 h-8" />
                            <Zap className="w-5 h-5 opacity-60" />
                          </div>
                          <div className="text-2xl font-bold">{performance.successfulDeliveries}</div>
                          <div className="text-sm opacity-90">تسليم ناجح</div>
                        </div>
                      </div>

                      {/* Performance Rating */}
                      <div className="relative p-6 bg-gradient-to-br from-yellow-500 to-orange-500 rounded-xl text-white overflow-hidden">
                        <div className="absolute inset-0 bg-white/10 backdrop-blur-sm"></div>
                        <div className="relative">
                          <div className="flex items-center justify-between mb-2">
                            <Star className="w-8 h-8" />
                            <Award className="w-5 h-5 opacity-60" />
                          </div>
                          <div className="text-2xl font-bold">{performance.rating.toFixed(1)}</div>
                          <div className="text-sm opacity-90">تقييم الأداء</div>
                        </div>
                      </div>

                      {/* Current Workload */}
                      <div className="relative p-6 bg-gradient-to-br from-purple-500 to-indigo-500 rounded-xl text-white overflow-hidden">
                        <div className="absolute inset-0 bg-white/10 backdrop-blur-sm"></div>
                        <div className="relative">
                          <div className="flex items-center justify-between mb-2">
                            <Activity className="w-8 h-8" />
                            <Target className="w-5 h-5 opacity-60" />
                          </div>
                          <div className="text-2xl font-bold">{performance.currentWorkload}</div>
                          <div className="text-sm opacity-90">الطلبات المخصصة</div>
                        </div>
                      </div>
                    </div>

                    {/* Progress Bars */}
                    <div className="mt-8 space-y-4">
                      <div>
                        <div className="flex justify-between text-sm mb-2">
                          <span className="text-gray-600">معدل النجاح</span>
                          <span className="font-medium text-gray-900">
                            {performance.totalOrders > 0 
                              ? Math.round((performance.successfulDeliveries / performance.totalOrders) * 100)
                              : 0}%
                          </span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <motion.div
                            initial={{ width: 0 }}
                            animate={{ 
                              width: performance.totalOrders > 0 
                                ? `${Math.round((performance.successfulDeliveries / performance.totalOrders) * 100)}%`
                                : '0%'
                            }}
                            transition={{ duration: 1, delay: 0.5 }}
                            className="bg-gradient-to-r from-green-500 to-emerald-500 h-2 rounded-full"
                          ></motion.div>
                        </div>
                      </div>

                      <div>
                        <div className="flex justify-between text-sm mb-2">
                          <span className="text-gray-600">تقييم الأداء</span>
                          <span className="font-medium text-gray-900">
                            {performance.rating.toFixed(1)}/5.0
                          </span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${(performance.rating / 5) * 100}%` }}
                            transition={{ duration: 1, delay: 0.7 }}
                            className="bg-gradient-to-r from-yellow-500 to-orange-500 h-2 rounded-full"
                          ></motion.div>
                        </div>
                      </div>
                    </div>
                  </CardBody>
                </Card>
              </motion.div>
            )}

            {/* Security Settings */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
            >
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <div className="w-10 h-10 bg-gradient-to-r from-red-500 to-pink-500 rounded-lg flex items-center justify-center mr-3">
                        <Shield className="w-5 h-5 text-white" />
                      </div>
                      <div>
                        <h3 className="text-xl font-bold text-gray-900">إعدادات الأمان</h3>
                        <p className="text-gray-600 text-sm">إدارة كلمة المرور والأمان</p>
                      </div>
                    </div>
                    {!isChangingPassword && (
                      <Button
                        variant="ghost"
                        size="sm"
                        icon={<Lock className="w-4 h-4" />}
                        onClick={() => setIsChangingPassword(true)}
                      >
                        تغيير كلمة المرور
                      </Button>
                    )}
                  </div>
                </CardHeader>
                
                <CardBody>
                  <AnimatePresence>
                    {isChangingPassword ? (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="space-y-6"
                      >
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              كلمة المرور الحالية *
                            </label>
                            <Input
                              type={showCurrentPassword ? "text" : "password"}
                              value={security.currentPassword}
                              onChange={(e) => setSecurity(prev => ({ ...prev, currentPassword: e.target.value }))}
                              icon={<Lock className="w-4 h-4" />}
                              rightIcon={
                                <button
                                  type="button"
                                  onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                                  className="text-gray-400 hover:text-gray-600"
                                >
                                  {showCurrentPassword ? (
                                    <EyeOff className="w-4 h-4" />
                                  ) : (
                                    <Eye className="w-4 h-4" />
                                  )}
                                </button>
                              }
                              error={errors.currentPassword}
                            />
                          </div>

                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              كلمة المرور الجديدة *
                            </label>
                            <Input
                              type={showNewPassword ? "text" : "password"}
                              value={security.newPassword}
                              onChange={(e) => setSecurity(prev => ({ ...prev, newPassword: e.target.value }))}
                              icon={<Lock className="w-4 h-4" />}
                              rightIcon={
                                <button
                                  type="button"
                                  onClick={() => setShowNewPassword(!showNewPassword)}
                                  className="text-gray-400 hover:text-gray-600"
                                >
                                  {showNewPassword ? (
                                    <EyeOff className="w-4 h-4" />
                                  ) : (
                                    <Eye className="w-4 h-4" />
                                  )}
                                </button>
                              }
                              error={errors.newPassword}
                            />
                          </div>
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            تأكيد كلمة المرور الجديدة *
                          </label>
                          <Input
                            type={showConfirmPassword ? "text" : "password"}
                            value={security.confirmPassword}
                            onChange={(e) => setSecurity(prev => ({ ...prev, confirmPassword: e.target.value }))}
                            icon={<Lock className="w-4 h-4" />}
                            rightIcon={
                              <button
                                type="button"
                                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                className="text-gray-400 hover:text-gray-600"
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

                        <div className="flex justify-end space-x-3 pt-6 border-t">
                          <Button
                            variant="outline"
                            onClick={() => setIsChangingPassword(false)}
                            className="ml-3"
                          >
                            إلغاء
                          </Button>
                          <Button
                            variant="primary"
                            icon={<Save className="w-4 h-4" />}
                            loading={isLoading}
                            disabled={isLoading}
                            onClick={handlePasswordChange}
                          >
                            {isLoading ? "جاري التغيير..." : "تغيير كلمة المرور"}
                          </Button>
                        </div>
                      </motion.div>
                    ) : (
                      <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="grid grid-cols-1 md:grid-cols-2 gap-6"
                      >
                        <div className="flex items-center justify-between p-4 bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl border border-green-200">
                          <div className="flex items-center">
                            <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center mr-3">
                              <Shield className="w-5 h-5 text-green-600" />
                            </div>
                            <div>
                              <h4 className="font-medium text-gray-900">المصادقة الثنائية</h4>
                              <p className="text-sm text-gray-600">طبقة حماية إضافية</p>
                            </div>
                          </div>
                          <button
                            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                              security.twoFactorEnabled ? "bg-green-600" : "bg-gray-200"
                            }`}
                            onClick={() => setSecurity(prev => ({ ...prev, twoFactorEnabled: !prev.twoFactorEnabled }))}
                          >
                            <span
                              className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                                security.twoFactorEnabled ? "translate-x-6" : "translate-x-1"
                              }`}
                            />
                          </button>
                        </div>

                        <div className="flex items-center justify-between p-4 bg-gradient-to-r from-blue-50 to-cyan-50 rounded-xl border border-blue-200">
                          <div className="flex items-center">
                            <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center mr-3">
                              <Clock className="w-5 h-5 text-blue-600" />
                            </div>
                            <div>
                              <h4 className="font-medium text-gray-900">انتهاء الجلسة</h4>
                              <p className="text-sm text-gray-600">خروج تلقائي بعد عدم النشاط</p>
                            </div>
                          </div>
                          <select
                            value={security.sessionTimeout}
                            onChange={(e) => setSecurity(prev => ({ ...prev, sessionTimeout: parseInt(e.target.value) }))}
                            className="px-3 py-1 border border-gray-300 rounded-md text-sm bg-white"
                          >
                            <option value={15}>15 دقيقة</option>
                            <option value={30}>30 دقيقة</option>
                            <option value={60}>1 ساعة</option>
                            <option value={120}>2 ساعة</option>
                          </select>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </CardBody>
              </Card>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
