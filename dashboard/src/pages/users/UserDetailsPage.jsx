import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useParams, useNavigate } from "react-router-dom";
import {
  User,
  Mail,
  Phone,
  Calendar,
  Clock,
  Shield,
  Edit,
  Trash2,
  Activity,
  Settings,
  Lock,
  CheckCircle,
  XCircle,
  AlertCircle,
  Crown,
  Briefcase,
  Truck,
  ShoppingCart,
  Calculator,
  UserCheck,
  UserX,
  MapPin,
  Download,
  RefreshCw,
  MoreVertical,
  ArrowLeft,
  Building,
  Globe,
  Zap,
  Star,
  TrendingUp,
  FileText,
  Award,
  Key,
  Fingerprint,
  Navigation,
  BarChart3,
  Euro,
  Package,
  Route,
  Timer,
  Target,
  Map,
  Gauge,
  History,
  Bell,
  Database,
  Users,
  Eye,
  IdCard,
  Languages,
  GraduationCap,
  Heart,
  Car
} from "lucide-react";
import { Card, CardHeader, CardBody } from "../../components/ui/Card";
import EnhancedButton from "../../components/ui/EnhancedButton";
import BackButton from "../../components/ui/BackButton";
import LoadingSpinner from "../../components/ui/LoadingSpinner";
import { DeleteConfirmationModal } from "../../components/ui/Modal";
import userService from "../../services/userService";

const UserDetailsPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [roleSpecificData, setRoleSpecificData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [activeTab, setActiveTab] = useState('overview');

  // Modal الحذف
  const [deleteModal, setDeleteModal] = useState({
    isOpen: false,
    isLoading: false,
  });

  useEffect(() => {
    loadUser();
  }, [id]);

  const loadUser = async () => {
    try {
      setIsLoading(true);
      setError("");

      const response = await userService.getUser(id);

      if (response.success) {
        const userData = response.data;
        setUser(userData);
        
        // Load role-specific data
        await loadRoleSpecificData(userData);
      } else {
        setError(response.message);
      }
    } catch (error) {
      setError("خطأ في تحميل بيانات الموظف");
    } finally {
      setIsLoading(false);
    }
  };

  const loadRoleSpecificData = async (userData) => {
    try {
      if (userData.role === 'distributor') {
        const distributorResponse = await userService.getDistributorDetails(id);
        if (distributorResponse.success) {
          setRoleSpecificData(distributorResponse.data);
        }
      } else if (['admin', 'manager'].includes(userData.role)) {
        const adminResponse = await userService.getAdminDetails(id);
        if (adminResponse.success) {
          setRoleSpecificData(adminResponse.data);
        }
      }
    } catch (error) {
      console.error('Error loading role-specific data:', error);
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
      case "suspended":
        return {
          color: "bg-amber-100 text-amber-800 border-amber-200",
          icon: <AlertCircle className="w-4 h-4" />,
          label: "معلق",
        };
      default:
        return {
          color: "bg-gray-100 text-gray-800 border-gray-200",
          icon: <User className="w-4 h-4" />,
          label: "غير محدد",
        };
    }
  };

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
          color: "bg-green-100 text-green-800 border-green-200",
          icon: <Truck className="w-4 h-4" />,
          label: "موزع",
        };
      case "cashier":
        return {
          color: "bg-orange-100 text-orange-800 border-orange-200",
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
          label: "غير محدد",
        };
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return "غير محدد";
    return new Date(dateString).toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  };

  const formatDateTime = (dateString) => {
    if (!dateString) return "غير محدد";
    return new Date(dateString).toLocaleString("en-GB", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getUserInitials = (fullName) => {
    return fullName
      ?.split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase() || "N/A";
  };

  const getTabsForRole = (role) => {
    const baseTabs = [
      { id: 'overview', label: 'نظرة عامة', icon: <Eye className="w-4 h-4" /> }
    ];

    switch (role) {
      case 'distributor':
        return [
          ...baseTabs,
          { id: 'performance', label: 'الأداء', icon: <BarChart3 className="w-4 h-4" /> },
          { id: 'location', label: 'الموقع', icon: <MapPin className="w-4 h-4" /> },
          { id: 'vehicle', label: 'المركبة', icon: <Car className="w-4 h-4" /> }
        ];
      case 'admin':
      case 'manager':
        return [
          ...baseTabs,
          { id: 'permissions', label: 'الصلاحيات', icon: <Shield className="w-4 h-4" /> },
          { id: 'activity', label: 'النشاط', icon: <Activity className="w-4 h-4" /> }
        ];
      default:
        return [
          ...baseTabs,
          { id: 'details', label: 'التفاصيل', icon: <FileText className="w-4 h-4" /> }
        ];
    }
  };

  const openDeleteModal = () => {
    setDeleteModal({ isOpen: true, isLoading: false });
  };

  const closeDeleteModal = () => {
    setDeleteModal({ isOpen: false, isLoading: false });
  };

  const renderDistributorPerformance = () => {
    const performanceData = userService.getDistributorPerformanceSummary(roleSpecificData || {});
    
    return (
      <div className="space-y-6">
        {/* Performance Overview */}
        <Card className="border-0 shadow-xl bg-white/70 backdrop-blur-sm">
          <CardHeader className="border-b border-gray-100 bg-gradient-to-r from-green-50 to-emerald-50 rounded-t-2xl">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-100 rounded-lg">
                <BarChart3 className="w-5 h-5 text-green-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900">مقاييس الأداء</h3>
            </div>
          </CardHeader>
          <CardBody className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Current Workload */}
              <div className="text-center p-6 bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl border border-blue-200">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-500 rounded-full mb-4">
                  <Package className="w-8 h-8 text-white" />
                </div>
                <h4 className="text-2xl font-bold text-blue-900 mb-2">{performanceData.current_workload}</h4>
                <p className="text-blue-700 font-medium">المهام الحالية</p>
                <div className={`inline-flex items-center gap-2 px-3 py-1 mt-2 rounded-full text-sm font-medium bg-${performanceData.summary.workload_level.color}-100 text-${performanceData.summary.workload_level.color}-800`}>
                  {performanceData.summary.workload_level.label}
                </div>
              </div>

              {/* Performance Rating */}
              <div className="text-center p-6 bg-gradient-to-br from-yellow-50 to-yellow-100 rounded-xl border border-yellow-200">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-yellow-500 rounded-full mb-4">
                  <Star className="w-8 h-8 text-white" />
                </div>
                <h4 className="text-2xl font-bold text-yellow-900 mb-2">{performanceData.performance_rating.toFixed(1)}/5</h4>
                <p className="text-yellow-700 font-medium">تقييم الأداء</p>
                <div className={`inline-flex items-center gap-2 px-3 py-1 mt-2 rounded-full text-sm font-medium bg-${performanceData.summary.performance_level.color}-100 text-${performanceData.summary.performance_level.color}-800`}>
                  {performanceData.summary.performance_level.label}
                </div>
              </div>

              {/* Work Status */}
              <div className="text-center p-6 bg-gradient-to-br from-green-50 to-green-100 rounded-xl border border-green-200">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-green-500 rounded-full mb-4">
                  <Activity className="w-8 h-8 text-white" />
                </div>
                <h4 className="text-lg font-bold text-green-900 mb-2">الحالة الحالية</h4>
                <p className="text-green-700 font-medium">{performanceData.summary.availability.label}</p>
                <div className="flex items-center justify-center gap-2 mt-2">
                  <div className={`w-3 h-3 rounded-full bg-${performanceData.summary.availability.color}-500`}></div>
                  <span className="text-sm text-gray-600">
                    {performanceData.last_active ? userService.formatLastActivity(performanceData.last_active) : 'غير محدد'}
                  </span>
                </div>
              </div>
            </div>
          </CardBody>
        </Card>

        {/* Performance Details */}
        {roleSpecificData?.performance_data?.daily_performance && (
          <Card className="border-0 shadow-xl bg-white/70 backdrop-blur-sm">
            <CardHeader className="border-b border-gray-100 bg-gradient-to-r from-indigo-50 to-purple-50 rounded-t-2xl">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-indigo-100 rounded-lg">
                  <TrendingUp className="w-5 h-5 text-indigo-600" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900">الأداء اليومي</h3>
              </div>
            </CardHeader>
            <CardBody className="p-6">
              <div className="text-center py-8">
                <History className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600">بيانات الأداء اليومي ستكون متاحة قريباً</p>
              </div>
            </CardBody>
          </Card>
        )}
      </div>
    );
  };

  const renderDistributorLocation = () => {
    const locationData = roleSpecificData?.performance_data?.location_info || {};
    
    return (
      <Card className="border-0 shadow-xl bg-white/70 backdrop-blur-sm">
        <CardHeader className="border-b border-gray-100 bg-gradient-to-r from-blue-50 to-cyan-50 rounded-t-2xl">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <MapPin className="w-5 h-5 text-blue-600" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900">معلومات الموقع</h3>
          </div>
        </CardHeader>
        <CardBody className="p-6">
          {locationData.current_location ? (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="flex items-center gap-4 p-4 bg-blue-50 rounded-xl">
                  <div className="p-3 bg-blue-100 rounded-lg">
                    <Navigation className="w-5 h-5 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-500 font-medium">خط العرض</p>
                    <p className="font-semibold text-gray-900">
                      {locationData.current_location.latitude || 'غير محدد'}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-4 p-4 bg-blue-50 rounded-xl">
                  <div className="p-3 bg-blue-100 rounded-lg">
                    <Navigation className="w-5 h-5 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-500 font-medium">خط الطول</p>
                    <p className="font-semibold text-gray-900">
                      {locationData.current_location.longitude || 'غير محدد'}
                    </p>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-4 p-4 bg-green-50 rounded-xl">
                <div className="p-3 bg-green-100 rounded-lg">
                  <Clock className="w-5 h-5 text-green-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-500 font-medium">آخر تحديث للموقع</p>
                  <p className="font-semibold text-gray-900">
                    {locationData.location_updated_at ? formatDateTime(locationData.location_updated_at) : 'غير محدد'}
                  </p>
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center py-12">
              <MapPin className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h4 className="text-lg font-semibold text-gray-900 mb-2">لم يتم تحديد الموقع</h4>
              <p className="text-gray-600">لم يقم الموزع بمشاركة موقعه بعد</p>
            </div>
          )}
        </CardBody>
      </Card>
    );
  };

  const renderDistributorVehicle = () => {
    const vehicleData = roleSpecificData?.vehicle_info || user.vehicle_info || {};
    
    return (
      <Card className="border-0 shadow-xl bg-white/70 backdrop-blur-sm">
        <CardHeader className="border-b border-gray-100 bg-gradient-to-r from-orange-50 to-red-50 rounded-t-2xl">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-orange-100 rounded-lg">
              <Car className="w-5 h-5 text-orange-600" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900">معلومات المركبة</h3>
          </div>
        </CardHeader>
        <CardBody className="p-6">
          {Object.keys(vehicleData).length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-xl">
                <div className="p-3 bg-blue-100 rounded-lg">
                  <Car className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-500 font-medium">نوع المركبة</p>
                  <p className="font-semibold text-gray-900">{vehicleData.type || 'غير محدد'}</p>
                </div>
              </div>
              <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-xl">
                <div className="p-3 bg-green-100 rounded-lg">
                  <FileText className="w-5 h-5 text-green-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-500 font-medium">رقم اللوحة</p>
                  <p className="font-semibold text-gray-900">{vehicleData.plate || 'غير محدد'}</p>
                </div>
              </div>
              {user.license_number && (
                <div className="flex items-center gap-4 p-4 bg-yellow-50 rounded-xl">
                  <div className="p-3 bg-yellow-100 rounded-lg">
                    <IdCard className="w-5 h-5 text-yellow-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-500 font-medium">رقم رخصة القيادة</p>
                    <p className="font-semibold text-gray-900">{user.license_number}</p>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="text-center py-12">
              <Car className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h4 className="text-lg font-semibold text-gray-900 mb-2">لم يتم تعيين مركبة</h4>
              <p className="text-gray-600">لم يتم تعيين مركبة لهذا الموزع بعد</p>
            </div>
          )}
        </CardBody>
      </Card>
    );
  };

  const renderAdminPermissions = () => {
    const permissions = roleSpecificData?.permissions || [];
    const permissionsSummary = userService.getAdminPermissionsSummary(permissions);
    
    return (
      <div className="space-y-6">
        {/* Permissions Overview */}
        <Card className="border-0 shadow-xl bg-white/70 backdrop-blur-sm">
          <CardHeader className="border-b border-gray-100 bg-gradient-to-r from-purple-50 to-indigo-50 rounded-t-2xl">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-purple-100 rounded-lg">
                  <Shield className="w-5 h-5 text-purple-600" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900">الصلاحيات والأذونات</h3>
              </div>
              <div className={`px-4 py-2 rounded-full text-sm font-medium bg-${permissionsSummary.access_level.color}-100 text-${permissionsSummary.access_level.color}-800`}>
                {permissionsSummary.access_level.label}
              </div>
            </div>
          </CardHeader>
          <CardBody className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {Object.entries(permissionsSummary.categories).map(([category, categoryPermissions]) => (
                <div key={category} className="p-4 bg-gray-50 rounded-xl">
                  <h4 className="font-semibold text-gray-900 mb-3 capitalize">
                    {category === 'users' && 'المستخدمين'}
                    {category === 'stores' && 'المتاجر'}
                    {category === 'products' && 'المنتجات'}
                    {category === 'orders' && 'الطلبات'}
                    {category === 'vehicles' && 'المركبات'}
                    {category === 'finance' && 'المالية'}
                    {category === 'system' && 'النظام'}
                    {category === 'export' && 'التصدير'}
                  </h4>
                  <div className="space-y-2">
                    {categoryPermissions.map((perm, index) => (
                      <div key={index} className="flex items-center gap-2">
                        <CheckCircle className="w-4 h-4 text-green-600" />
                        <span className="text-sm text-gray-700">{perm.label}</span>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
            
            {permissionsSummary.has_full_access && (
              <div className="mt-6 p-4 bg-gradient-to-r from-purple-50 to-purple-100 rounded-xl border border-purple-200">
                <div className="flex items-center gap-3">
                  <Crown className="w-6 h-6 text-purple-600" />
                  <div>
                    <h4 className="font-semibold text-purple-900">وصول كامل للنظام</h4>
                    <p className="text-purple-700 text-sm">هذا المستخدم لديه صلاحيات كاملة على جميع أجزاء النظام</p>
                  </div>
                </div>
              </div>
            )}
          </CardBody>
        </Card>
      </div>
    );
  };

  const renderAdminActivity = () => {
    return (
      <Card className="border-0 shadow-xl bg-white/70 backdrop-blur-sm">
        <CardHeader className="border-b border-gray-100 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-t-2xl">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Activity className="w-5 h-5 text-blue-600" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900">سجل النشاط</h3>
          </div>
        </CardHeader>
        <CardBody className="p-6">
          <div className="text-center py-12">
            <Activity className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h4 className="text-lg font-semibold text-gray-900 mb-2">سجل النشاط</h4>
            <p className="text-gray-600">سيتم إضافة سجل النشاط المفصل قريباً</p>
          </div>
        </CardBody>
      </Card>
    );
  };

  const confirmDelete = async () => {
    try {
      setDeleteModal((prev) => ({ ...prev, isLoading: true }));
      setError("");

      const response = await userService.deleteUser(id);

      if (response.success) {
        setSuccess("تم حذف الموظف بنجاح");
        setTimeout(() => navigate("/users"), 1500);
      } else {
        setError(response.message);
      }
    } catch (error) {
      setError("خطأ في حذف الموظف");
    } finally {
      setDeleteModal((prev) => ({ ...prev, isLoading: false }));
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 flex items-center justify-center">
        <LoadingSpinner size="xl" text="جاري تحميل بيانات الموظف..." />
      </div>
    );
  }

  if (error && !user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 p-6">
        <div className="max-w-4xl mx-auto">
          <div className="text-center py-20">
            <div className="bg-red-100 rounded-full p-6 w-24 h-24 mx-auto mb-6 flex items-center justify-center">
              <AlertCircle className="w-12 h-12 text-red-600" />
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mb-4">
              خطأ في تحميل البيانات
            </h1>
            <p className="text-gray-600 text-lg mb-8">{error}</p>
            <BackButton variant="primary" size="lg" />
          </div>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 p-6">
        <div className="max-w-4xl mx-auto">
          <div className="text-center py-20">
            <div className="bg-gray-100 rounded-full p-6 w-24 h-24 mx-auto mb-6 flex items-center justify-center">
              <User className="w-12 h-12 text-gray-400" />
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mb-4">
              الموظف غير موجود
            </h1>
            <p className="text-gray-600 text-lg mb-8">
              لم يتم العثور على الموظف المطلوب
            </p>
            <BackButton variant="primary" size="lg" />
          </div>
        </div>
      </div>
    );
  }

  const statusConfig = getStatusConfig(user.status);
  const roleConfig = getRoleConfig(user.role);
  const tabs = getTabsForRole(user.role);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-4">
              <BackButton variant="outline" size="lg" />
              <div>
                <h1 className="text-4xl font-bold text-gray-900 mb-2">
                  بطاقة الموظف
                </h1>
                <p className="text-gray-600 text-lg">
                  معلومات تفصيلية شاملة عن الموظف
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <EnhancedButton
                onClick={() => navigate(`/users/${id}/edit`)}
                variant="primary"
                size="lg"
                icon={<Edit className="w-5 h-5" />}
              >
                تعديل
              </EnhancedButton>
              <EnhancedButton
                onClick={openDeleteModal}
                variant="danger"
                size="lg"
                icon={<Trash2 className="w-5 h-5" />}
              >
                حذف
              </EnhancedButton>
            </div>
          </div>
        </motion.div>

        {/* رسائل النجاح والخطأ */}
        <AnimatePresence>
          {success && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="mb-6 p-4 bg-emerald-50 border border-emerald-200 rounded-2xl shadow-sm"
            >
              <div className="flex items-center">
                <CheckCircle className="w-5 h-5 text-emerald-600 ml-3" />
                <span className="text-emerald-800 font-medium">{success}</span>
              </div>
            </motion.div>
          )}

          {error && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="mb-6 p-4 bg-red-50 border border-red-200 rounded-2xl shadow-sm"
            >
              <div className="flex items-center">
                <AlertCircle className="w-5 h-5 text-red-600 ml-3" />
                <span className="text-red-800 font-medium">{error}</span>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* المحتوى الرئيسي */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* العمود الأيسر - بطاقة الهوية */}
          <div className="lg:col-span-1">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 }}
            >
              <Card className="border-0 shadow-xl bg-white/70 backdrop-blur-sm">
                <CardBody className="p-8">
                  {/* صورة الملف الشخصي */}
                  <div className="text-center mb-8">
                    <div className="relative inline-block">
                      <div className="h-32 w-32 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center shadow-2xl mx-auto mb-4">
                        <span className="text-4xl font-bold text-white">
                          {getUserInitials(user.full_name)}
                        </span>
                      </div>
                      <div className="absolute -bottom-2 -right-2 bg-white rounded-full p-2 shadow-lg">
                        <User className="w-6 h-6 text-blue-600" />
                      </div>
                    </div>
                    <h2 className="text-2xl font-bold text-gray-900 mb-2">
                      {user.full_name || "غير محدد"}
                    </h2>
                    <p className="text-gray-500 font-mono text-sm">
                      ID: {user.id}
                    </p>
                  </div>

                  {/* الحالة والدور */}
                  <div className="space-y-4 mb-8">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-500">الحالة</span>
                      <span
                        className={`inline-flex items-center gap-2 px-3 py-1.5 text-sm font-semibold rounded-full border ${statusConfig.color}`}
                      >
                        {statusConfig.icon}
                        {statusConfig.label}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-500">الدور</span>
                      <span
                        className={`inline-flex items-center gap-2 px-3 py-1.5 text-sm font-semibold rounded-full border ${roleConfig.color}`}
                      >
                        {roleConfig.icon}
                        {roleConfig.label}
                      </span>
                    </div>
                  </div>

                  {/* إجراءات سريعة */}
                  <div className="space-y-3">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">
                      إجراءات سريعة
                    </h3>
                    <EnhancedButton
                      onClick={() => navigate(`/users/${id}/edit`)}
                      variant="primary"
                      size="sm"
                      icon={<Edit className="w-4 h-4" />}
                      fullWidth
                    >
                      تعديل البيانات
                    </EnhancedButton>
                    <EnhancedButton
                      onClick={() => navigate("/users")}
                      variant="secondary"
                      size="sm"
                      icon={<ArrowLeft className="w-4 h-4" />}
                      fullWidth
                    >
                      العودة للقائمة
                    </EnhancedButton>
                  </div>

                  {/* معلومات إضافية سريعة */}
                  <div className="mt-8 pt-6 border-t border-gray-200">
                    <div className="space-y-3 text-sm">
                      <div className="flex items-center justify-between">
                        <span className="text-gray-500">تاريخ الانضمام</span>
                        <span className="font-medium">{formatDate(user.created_at)}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-gray-500">آخر نشاط</span>
                        <span className="font-medium">
                          {userService.formatLastActivity(user.last_login)}
                        </span>
                      </div>
                      {user.salary && (
                        <div className="flex items-center justify-between">
                          <span className="text-gray-500">الراتب</span>
                          <span className="font-medium text-green-600">€{user.salary}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </CardBody>
              </Card>
            </motion.div>
          </div>

          {/* العمود الأيمن - المعلومات التفصيلية */}
          <div className="lg:col-span-3">
            <div className="space-y-6">
              {/* Navigation Tabs */}
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
              >
                <div className="bg-white/70 backdrop-blur-sm rounded-2xl shadow-xl border-0">
                  <div className="flex items-center overflow-x-auto scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100 p-2">
                    {tabs.map((tab) => (
                      <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        className={`flex items-center gap-2 px-6 py-3 rounded-xl font-medium transition-all duration-300 whitespace-nowrap ${
                          activeTab === tab.id
                            ? 'bg-blue-600 text-white shadow-lg'
                            : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                        }`}
                      >
                        {tab.icon}
                        {tab.label}
                      </button>
                    ))}
                  </div>
                </div>
              </motion.div>

              {/* Tab Content */}
              <motion.div
                key={activeTab}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
              >
                {activeTab === 'overview' && renderOverviewTab()}
                {activeTab === 'performance' && user.role === 'distributor' && renderDistributorPerformance()}
                {activeTab === 'location' && user.role === 'distributor' && renderDistributorLocation()}
                {activeTab === 'vehicle' && user.role === 'distributor' && renderDistributorVehicle()}
                {activeTab === 'permissions' && ['admin', 'manager'].includes(user.role) && renderAdminPermissions()}
                {activeTab === 'activity' && ['admin', 'manager'].includes(user.role) && renderAdminActivity()}
                {activeTab === 'details' && renderDetailsTab()}
              </motion.div>
            </div>
          </div>
        </div>

        {/* Modal الحذف */}
        <DeleteConfirmationModal
          isOpen={deleteModal.isOpen}
          onClose={closeDeleteModal}
          onConfirm={confirmDelete}
          itemName={user?.full_name}
          isLoading={deleteModal.isLoading}
        />
      </div>
    </div>
  );
};

export default UserDetailsPage;
