import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  User,
  Mail,
  Phone,
  MapPin,
  Bell,
  Crown,
  Briefcase,
  Truck,
  ShoppingCart,
  CheckCircle,
  AlertCircle,
  Clock,
  Timer,
  Star,
  Award,
  Users,
  Package,
  Activity,
  Target,
  Zap,
  Sparkles,
  TrendingUp,
  Calendar,
  BadgeCheck,
  BarChart3,
  Heart,
} from "lucide-react";
import { Card, CardHeader, CardBody } from "../../components/ui/Card";
import LocationMap from "../../components/ui/LocationMap";
import { useAuthStore } from "../../stores/authStore";
import { authService } from "../../services/authService";
import { toast } from "react-hot-toast";

const ProfilePage = () => {
  const { user, updateUser } = useAuthStore();

  const [profile, setProfile] = useState({
    username: "",
    email: "",
    full_name: "",
    phone: "",
    address: "",
    lat: null,
    lng: null,
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

  const [isLoading, setIsLoading] = useState(false);

  // Load user data on component mount
  useEffect(() => {
    if (user) {
      setProfile({
        username: user.username || "",
        email: user.email || "",
        full_name: user.full_name || "",
        phone: user.phone || "",
        address: user.address || "",
        lat: user.lat || null,
        lng: user.lng || null,
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
          relationship: "",
        },
        vehicle_info: user.vehicle_info || {
          make: "",
          model: "",
          year: "",
          plate_number: "",
          capacity: "",
        },
      });

      // Set performance data for distributors
      if (user.role === "distributor") {
        setPerformance({
          totalOrders: user.total_orders || 0,
          successfulDeliveries: user.successful_deliveries || 0,
          rating: user.performance_rating || 0,
          currentWorkload: user.current_workload || 0,
          todayDeliveries: user.today_deliveries || 0,
          monthlyEarnings: user.monthly_earnings || 0,
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
      gradient: "from-purple-500 to-indigo-500",
    },
    {
      value: "manager",
      label: "مدير فرع",
      icon: Briefcase,
      color: "blue",
      description: "إدارة العمليات والفروع",
      gradient: "from-blue-500 to-cyan-500",
    },
    {
      value: "distributor",
      label: "موزع",
      icon: Truck,
      color: "orange",
      description: "توزيع وتسليم الطلبات",
      gradient: "from-orange-500 to-red-500",
    },
    {
      value: "cashier",
      label: "كاشير",
      icon: ShoppingCart,
      color: "green",
      description: "نقاط البيع وخدمة العملاء",
      gradient: "from-green-500 to-emerald-500",
    },
    {
      value: "accountant",
      label: "محاسب",
      icon: BarChart3,
      color: "indigo",
      description: "الإدارة المالية والتقارير",
      gradient: "from-indigo-500 to-purple-500",
    },
  ];

  const statusColors = {
    active: { color: "green", label: "نشط", icon: CheckCircle },
    inactive: { color: "gray", label: "غير نشط", icon: Clock },
    suspended: { color: "red", label: "موقوف", icon: AlertCircle },
    pending: { color: "yellow", label: "في الانتظار", icon: Timer },
  };

  // Handle location change from map
  const handleLocationChange = async (locationData) => {
    setProfile((prev) => ({
      ...prev,
      address: locationData.address,
      lat: locationData.lat,
      lng: locationData.lng,
    }));

    // Save location to backend
    setIsLoading(true);
    try {
      const response = await authService.updateProfile({
        address: locationData.address,
        lat: locationData.lat,
        lng: locationData.lng,
      });

      if (response.success) {
        updateUser({
          address: locationData.address,
          lat: locationData.lat,
          lng: locationData.lng,
        });
        toast.success("تم تحديث الموقع بنجاح");
      } else {
        throw new Error(response.message);
      }
    } catch (error) {
      toast.error(error.message || "حدث خطأ في تحديث الموقع");
    } finally {
      setIsLoading(false);
    }
  };

  const selectedRole = roles.find((role) => role.value === profile.role);
  const RoleIcon = selectedRole?.icon || User;
  const currentStatus = statusColors[profile.status] || statusColors.active;
  const StatusIcon = currentStatus.icon;

  const getInitials = (name) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("ar-SY", {
      style: "currency",
      currency: "SYP",
    }).format(amount);
  };

  const formatDate = (dateString) => {
    if (!dateString) return "";
    return new Date(dateString).toLocaleDateString("ar-SY");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 p-6">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
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
              <p className="text-gray-600 mt-2">
                عرض معلوماتك الشخصية وإعداداتك
              </p>
            </div>
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
              <div
                className={`absolute inset-0 bg-gradient-to-br ${
                  selectedRole?.gradient || "from-blue-500 to-purple-500"
                } opacity-10`}
              ></div>

              <CardBody className="relative text-center p-8">
                {/* Avatar Section - Display Only */}
                <div className="relative inline-block mb-6">
                  <div className="relative">
                    {profile.avatar ? (
                      <img
                        src={profile.avatar}
                        alt={profile.full_name}
                        className="w-32 h-32 rounded-full object-cover border-4 border-white shadow-xl"
                      />
                    ) : (
                      <div
                        className={`w-32 h-32 rounded-full border-4 border-white shadow-xl bg-gradient-to-br ${
                          selectedRole?.gradient ||
                          "from-blue-500 to-purple-500"
                        } flex items-center justify-center`}
                      >
                        <span className="text-4xl font-bold text-white">
                          {getInitials(profile.full_name || "User")}
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                {/* User Info */}
                <h2 className="text-2xl font-bold text-gray-900 mb-2">
                  {profile.full_name || "المستخدم"}
                </h2>

                {/* Role Badge */}
                <div
                  className={`inline-flex items-center px-4 py-2 rounded-full bg-gradient-to-r ${
                    selectedRole?.gradient || "from-blue-500 to-purple-500"
                  } text-white mb-4`}
                >
                  <RoleIcon className="w-4 h-4 mr-2" />
                  <span className="font-medium">
                    {selectedRole?.label || "غير محدد"}
                  </span>
                </div>

                {/* Status */}
                <div className="flex items-center justify-center mb-6">
                  <div
                    className={`flex items-center px-3 py-1 rounded-full bg-${currentStatus.color}-100 text-${currentStatus.color}-700`}
                  >
                    <StatusIcon className="w-4 h-4 mr-2" />
                    <span className="text-sm font-medium">
                      {currentStatus.label}
                    </span>
                  </div>
                </div>

                {/* Quick Stats for Distributors */}
                {profile.role === "distributor" && (
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
            {/* Basic Information - Display Only */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              <Card>
                <CardHeader>
                  <div className="flex items-center">
                    <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-500 rounded-lg flex items-center justify-center mr-3">
                      <User className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-gray-900">
                        المعلومات الأساسية
                      </h3>
                      <p className="text-gray-600 text-sm">
                        معلوماتك الشخصية والمهنية
                      </p>
                    </div>
                  </div>
                </CardHeader>

                <CardBody>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Username */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        اسم المستخدم
                      </label>
                      <div className="flex items-center p-3 bg-gray-50 rounded-lg">
                        <User className="w-4 h-4 text-gray-400 mr-3" />
                        <span className="text-gray-900">
                          {profile.username}
                        </span>
                      </div>
                    </div>

                    {/* Full Name */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        الاسم الكامل
                      </label>
                      <div className="flex items-center p-3 bg-gray-50 rounded-lg">
                        <User className="w-4 h-4 text-gray-400 mr-3" />
                        <span className="text-gray-900">
                          {profile.full_name}
                        </span>
                      </div>
                    </div>

                    {/* Email */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        البريد الإلكتروني
                      </label>
                      <div className="flex items-center p-3 bg-gray-50 rounded-lg">
                        <Mail className="w-4 h-4 text-gray-400 mr-3" />
                        <span className="text-gray-900">{profile.email}</span>
                      </div>
                    </div>

                    {/* Phone */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        رقم الهاتف
                      </label>
                      <div className="flex items-center p-3 bg-gray-50 rounded-lg">
                        <Phone className="w-4 h-4 text-gray-400 mr-3" />
                        <span className="text-gray-900">{profile.phone}</span>
                      </div>
                    </div>

                    {/* Hired Date */}
                    {profile.hired_date && (
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          تاريخ التوظيف
                        </label>
                        <div className="flex items-center p-3 bg-gray-50 rounded-lg">
                          <Calendar className="w-4 h-4 text-gray-400 mr-3" />
                          <span className="text-gray-900">
                            {formatDate(profile.hired_date)}
                          </span>
                        </div>
                      </div>
                    )}

                    {/* License Number for Distributors */}
                    {profile.role === "distributor" && (
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          رقم رخصة القيادة
                        </label>
                        <div className="flex items-center p-3 bg-gray-50 rounded-lg">
                          <BadgeCheck className="w-4 h-4 text-gray-400 mr-3" />
                          <span className="text-gray-900">
                            {profile.license_number || "غير محدد"}
                          </span>
                        </div>
                      </div>
                    )}
                  </div>
                </CardBody>
              </Card>
            </motion.div>

            {/* Location Map */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              <Card>
                <CardHeader>
                  <div className="flex items-center">
                    <div className="w-10 h-10 bg-gradient-to-r from-green-500 to-blue-500 rounded-lg flex items-center justify-center mr-3">
                      <MapPin className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-gray-900">
                        تحديد الموقع
                      </h3>
                      <p className="text-gray-600 text-sm">
                        حدد موقعك على الخريطة
                      </p>
                    </div>
                  </div>
                </CardHeader>

                <CardBody>
                  <LocationMap
                    address={profile.address}
                    onLocationChange={handleLocationChange}
                    initialLocation={
                      profile.lat && profile.lng
                        ? { lat: profile.lat, lng: profile.lng }
                        : null
                    }
                  />
                </CardBody>
              </Card>
            </motion.div>

            {/* Emergency Contact & Vehicle Info for Distributors */}
            {profile.role === "distributor" && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
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
                        <h3 className="text-lg font-bold text-gray-900">
                          جهة الاتصال للطوارئ
                        </h3>
                        <p className="text-gray-600 text-sm">
                          معلومات الاتصال في حالات الطوارئ
                        </p>
                      </div>
                    </div>
                  </CardHeader>

                  <CardBody>
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          الاسم
                        </label>
                        <div className="flex items-center p-3 bg-gray-50 rounded-lg">
                          <User className="w-4 h-4 text-gray-400 mr-3" />
                          <span className="text-gray-900">
                            {profile.emergency_contact.name || "غير محدد"}
                          </span>
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          رقم الهاتف
                        </label>
                        <div className="flex items-center p-3 bg-gray-50 rounded-lg">
                          <Phone className="w-4 h-4 text-gray-400 mr-3" />
                          <span className="text-gray-900">
                            {profile.emergency_contact.phone || "غير محدد"}
                          </span>
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          صلة القرابة
                        </label>
                        <div className="flex items-center p-3 bg-gray-50 rounded-lg">
                          <Users className="w-4 h-4 text-gray-400 mr-3" />
                          <span className="text-gray-900">
                            {profile.emergency_contact.relationship ||
                              "غير محدد"}
                          </span>
                        </div>
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
                        <h3 className="text-lg font-bold text-gray-900">
                          معلومات المركبة
                        </h3>
                        <p className="text-gray-600 text-sm">
                          تفاصيل مركبة التوزيع
                        </p>
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
                          <div className="p-3 bg-gray-50 rounded-lg">
                            <span className="text-gray-900">
                              {profile.vehicle_info.make || "غير محدد"}
                            </span>
                          </div>
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            الموديل
                          </label>
                          <div className="p-3 bg-gray-50 rounded-lg">
                            <span className="text-gray-900">
                              {profile.vehicle_info.model || "غير محدد"}
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            سنة الصنع
                          </label>
                          <div className="p-3 bg-gray-50 rounded-lg">
                            <span className="text-gray-900">
                              {profile.vehicle_info.year || "غير محدد"}
                            </span>
                          </div>
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            رقم اللوحة
                          </label>
                          <div className="p-3 bg-gray-50 rounded-lg">
                            <span className="text-gray-900">
                              {profile.vehicle_info.plate_number || "غير محدد"}
                            </span>
                          </div>
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          سعة التحميل (كيلو)
                        </label>
                        <div className="p-3 bg-gray-50 rounded-lg">
                          <span className="text-gray-900">
                            {profile.vehicle_info.capacity
                              ? `${profile.vehicle_info.capacity} كيلو`
                              : "غير محدد"}
                          </span>
                        </div>
                      </div>
                    </div>
                  </CardBody>
                </Card>
              </motion.div>
            )}

            {/* Performance Dashboard for Distributors */}
            {profile.role === "distributor" && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
              >
                <Card>
                  <CardHeader>
                    <div className="flex items-center">
                      <div className="w-10 h-10 bg-gradient-to-r from-green-500 to-emerald-500 rounded-lg flex items-center justify-center mr-3">
                        <TrendingUp className="w-5 h-5 text-white" />
                      </div>
                      <div>
                        <h3 className="text-xl font-bold text-gray-900">
                          لوحة الأداء
                        </h3>
                        <p className="text-gray-600 text-sm">
                          إحصائيات الأداء والتوزيع
                        </p>
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
                          <div className="text-2xl font-bold">
                            {performance.totalOrders}
                          </div>
                          <div className="text-sm opacity-90">
                            إجمالي الطلبات
                          </div>
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
                          <div className="text-2xl font-bold">
                            {performance.successfulDeliveries}
                          </div>
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
                          <div className="text-2xl font-bold">
                            {performance.rating.toFixed(1)}
                          </div>
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
                          <div className="text-2xl font-bold">
                            {performance.currentWorkload}
                          </div>
                          <div className="text-sm opacity-90">
                            الطلبات المخصصة
                          </div>
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
                              ? Math.round(
                                  (performance.successfulDeliveries /
                                    performance.totalOrders) *
                                    100
                                )
                              : 0}
                            %
                          </span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <motion.div
                            initial={{ width: 0 }}
                            animate={{
                              width:
                                performance.totalOrders > 0
                                  ? `${Math.round(
                                      (performance.successfulDeliveries /
                                        performance.totalOrders) *
                                        100
                                    )}%`
                                  : "0%",
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
                            animate={{
                              width: `${(performance.rating / 5) * 100}%`,
                            }}
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
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
