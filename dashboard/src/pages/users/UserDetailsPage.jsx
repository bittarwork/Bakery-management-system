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
  Eye,
  EyeOff,
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
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

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
        setUser(response.data);
      } else {
        setError(response.message);
      }
    } catch (error) {
      setError("خطأ في تحميل بيانات الموظف");
    } finally {
      setIsLoading(false);
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

  const openDeleteModal = () => {
    setDeleteModal({ isOpen: true, isLoading: false });
  };

  const closeDeleteModal = () => {
    setDeleteModal({ isOpen: false, isLoading: false });
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
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
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
                          {user.full_name
                            ?.split(" ")
                            .map((n) => n[0])
                            .join("")
                            .toUpperCase() || "N/A"}
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
                </CardBody>
              </Card>
            </motion.div>
          </div>

          {/* العمود الأيمن - المعلومات التفصيلية */}
          <div className="lg:col-span-2">
            <div className="space-y-6">
              {/* معلومات الاتصال */}
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 }}
              >
                <Card className="border-0 shadow-xl bg-white/70 backdrop-blur-sm">
                  <CardHeader className="border-b border-gray-100 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-t-2xl">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-blue-100 rounded-lg">
                        <Mail className="w-5 h-5 text-blue-600" />
                      </div>
                      <h3 className="text-xl font-semibold text-gray-900">
                        معلومات الاتصال
                      </h3>
                    </div>
                  </CardHeader>
                  <CardBody className="p-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-xl">
                        <div className="p-3 bg-blue-100 rounded-lg">
                          <Mail className="w-5 h-5 text-blue-600" />
                        </div>
                        <div>
                          <p className="text-sm text-gray-500 font-medium">
                            البريد الإلكتروني
                          </p>
                          <p className="font-semibold text-gray-900">
                            {user.email || "غير محدد"}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-xl">
                        <div className="p-3 bg-green-100 rounded-lg">
                          <Phone className="w-5 h-5 text-green-600" />
                        </div>
                        <div>
                          <p className="text-sm text-gray-500 font-medium">
                            رقم الهاتف
                          </p>
                          <p className="font-semibold text-gray-900">
                            {user.phone || "غير محدد"}
                          </p>
                        </div>
                      </div>
                    </div>
                  </CardBody>
                </Card>
              </motion.div>

              {/* معلومات الحساب */}
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 }}
              >
                <Card className="border-0 shadow-xl bg-white/70 backdrop-blur-sm">
                  <CardHeader className="border-b border-gray-100 bg-gradient-to-r from-purple-50 to-pink-50 rounded-t-2xl">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-purple-100 rounded-lg">
                        <User className="w-5 h-5 text-purple-600" />
                      </div>
                      <h3 className="text-xl font-semibold text-gray-900">
                        معلومات الحساب
                      </h3>
                    </div>
                  </CardHeader>
                  <CardBody className="p-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-xl">
                        <div className="p-3 bg-purple-100 rounded-lg">
                          <User className="w-5 h-5 text-purple-600" />
                        </div>
                        <div>
                          <p className="text-sm text-gray-500 font-medium">
                            اسم المستخدم
                          </p>
                          <p className="font-semibold text-gray-900">
                            {user.username || "غير محدد"}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-xl">
                        <div className="p-3 bg-indigo-100 rounded-lg">
                          <Building className="w-5 h-5 text-indigo-600" />
                        </div>
                        <div>
                          <p className="text-sm text-gray-500 font-medium">
                            الاسم الكامل
                          </p>
                          <p className="font-semibold text-gray-900">
                            {user.full_name || "غير محدد"}
                          </p>
                        </div>
                      </div>
                    </div>
                  </CardBody>
                </Card>
              </motion.div>

              {/* معلومات التواريخ */}
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.4 }}
              >
                <Card className="border-0 shadow-xl bg-white/70 backdrop-blur-sm">
                  <CardHeader className="border-b border-gray-100 bg-gradient-to-r from-emerald-50 to-teal-50 rounded-t-2xl">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-emerald-100 rounded-lg">
                        <Calendar className="w-5 h-5 text-emerald-600" />
                      </div>
                      <h3 className="text-xl font-semibold text-gray-900">
                        معلومات التواريخ
                      </h3>
                    </div>
                  </CardHeader>
                  <CardBody className="p-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-xl">
                        <div className="p-3 bg-emerald-100 rounded-lg">
                          <Calendar className="w-5 h-5 text-emerald-600" />
                        </div>
                        <div>
                          <p className="text-sm text-gray-500 font-medium">
                            تاريخ الإنشاء
                          </p>
                          <p className="font-semibold text-gray-900">
                            {formatDate(user.created_at)}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-xl">
                        <div className="p-3 bg-blue-100 rounded-lg">
                          <RefreshCw className="w-5 h-5 text-blue-600" />
                        </div>
                        <div>
                          <p className="text-sm text-gray-500 font-medium">
                            تاريخ آخر تحديث
                          </p>
                          <p className="font-semibold text-gray-900">
                            {formatDate(user.updated_at)}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-xl md:col-span-2">
                        <div className="p-3 bg-orange-100 rounded-lg">
                          <Clock className="w-5 h-5 text-orange-600" />
                        </div>
                        <div>
                          <p className="text-sm text-gray-500 font-medium">
                            آخر تسجيل دخول
                          </p>
                          <p className="font-semibold text-gray-900">
                            {user.last_login
                              ? formatDateTime(user.last_login)
                              : "لم يسجل دخول"}
                          </p>
                        </div>
                      </div>
                    </div>
                  </CardBody>
                </Card>
              </motion.div>

              {/* معلومات الأمان */}
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.5 }}
              >
                <Card className="border-0 shadow-xl bg-white/70 backdrop-blur-sm">
                  <CardHeader className="border-b border-gray-100 bg-gradient-to-r from-red-50 to-orange-50 rounded-t-2xl">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-red-100 rounded-lg">
                        <Shield className="w-5 h-5 text-red-600" />
                      </div>
                      <h3 className="text-xl font-semibold text-gray-900">
                        معلومات الأمان
                      </h3>
                    </div>
                  </CardHeader>
                  <CardBody className="p-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-xl">
                        <div className="p-3 bg-red-100 rounded-lg">
                          <Shield className="w-5 h-5 text-red-600" />
                        </div>
                        <div>
                          <p className="text-sm text-gray-500 font-medium">
                            مستوى الأمان
                          </p>
                          <p className="font-semibold text-gray-900">
                            {roleConfig.label}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-xl">
                        <div className="p-3 bg-yellow-100 rounded-lg">
                          <Key className="w-5 h-5 text-yellow-600" />
                        </div>
                        <div>
                          <p className="text-sm text-gray-500 font-medium">
                            حالة الحساب
                          </p>
                          <p className="font-semibold text-gray-900">
                            {statusConfig.label}
                          </p>
                        </div>
                      </div>
                    </div>
                  </CardBody>
                </Card>
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
