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
  ArrowRight,
} from "lucide-react";
import { Card, CardHeader, CardBody } from "../../components/ui/Card";
import EnhancedButton from "../../components/ui/EnhancedButton";
import BackButton from "../../components/ui/BackButton";
import LoadingSpinner from "../../components/ui/LoadingSpinner";
import { DeleteConfirmationModal } from "../../components/ui/Modal";
import userService from "../../services/userService";

const UserDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [isEditing, setIsEditing] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [editForm, setEditForm] = useState({});
  const [errors, setErrors] = useState({});
  const [isSaving, setIsSaving] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

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
        setEditForm({
          username: response.data.username || "",
          email: response.data.email || "",
          full_name: response.data.full_name || "",
          phone: response.data.phone || "",
          role: response.data.role || "",
          status: response.data.status || "active",
        });
      } else {
        setError(response.message);
      }
    } catch (error) {
      setError("خطأ في تحميل بيانات الموظف");
      console.error("Error loading user:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "active":
        return "bg-green-100 text-green-800";
      case "inactive":
        return "bg-red-100 text-red-800";
      case "suspended":
        return "bg-yellow-100 text-yellow-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case "active":
        return <UserCheck className="w-4 h-4" />;
      case "inactive":
        return <UserX className="w-4 h-4" />;
      case "suspended":
        return <AlertCircle className="w-4 h-4" />;
      default:
        return <User className="w-4 h-4" />;
    }
  };

  const getRoleColor = (role) => {
    switch (role) {
      case "admin":
        return "bg-purple-100 text-purple-800";
      case "manager":
        return "bg-blue-100 text-blue-800";
      case "distributor":
        return "bg-green-100 text-green-800";
      case "cashier":
        return "bg-yellow-100 text-yellow-800";
      case "accountant":
        return "bg-gray-100 text-gray-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getRoleIcon = (role) => {
    switch (role) {
      case "admin":
        return <Shield className="w-4 h-4" />;
      case "manager":
        return <Briefcase className="w-4 h-4" />;
      case "distributor":
        return <Truck className="w-4 h-4" />;
      case "cashier":
        return <ShoppingCart className="w-4 h-4" />;
      case "accountant":
        return <Calculator className="w-4 h-4" />;
      default:
        return <User className="w-4 h-4" />;
    }
  };

  const handleEdit = () => {
    setIsEditing(true);
    setErrors({});
  };

  const handleSave = async () => {
    try {
      setIsSaving(true);
      setErrors({});

      const response = await userService.updateUser(id, editForm);

      if (response.success) {
        setIsSuccess(true);
        setIsEditing(false);
        loadUser();
        setTimeout(() => setIsSuccess(false), 3000);
      } else {
        setErrors({ submit: response.message });
      }
    } catch (error) {
      setErrors({
        submit: "خطأ في تحديث بيانات الموظف. يرجى المحاولة مرة أخرى.",
      });
      console.error("Error updating user:", error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    setIsEditing(false);
    setEditForm({
      username: user?.username || "",
      email: user?.email || "",
      full_name: user?.full_name || "",
      phone: user?.phone || "",
      role: user?.role || "",
      status: user?.status || "active",
    });
    setErrors({});
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setEditForm((prev) => ({ ...prev, [name]: value }));

    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
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
        navigate("/users");
      } else {
        setError(response.message);
      }
    } catch (error) {
      setError("خطأ في حذف الموظف");
      console.error("Error deleting user:", error);
    } finally {
      setDeleteModal((prev) => ({ ...prev, isLoading: false }));
    }
  };

  const handleStatusToggle = async () => {
    const newStatus = user.status === "active" ? "inactive" : "active";

    try {
      setError("");
      const response = await userService.toggleUserStatus(id, newStatus);

      if (response.success) {
        loadUser();
      } else {
        setError(response.message);
      }
    } catch (error) {
      setError("خطأ في تغيير حالة الموظف");
      console.error("Error toggling user status:", error);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center">
        <LoadingSpinner size="xl" text="جاري تحميل بيانات الموظف..." />
      </div>
    );
  }

  if (error && !user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-6">
        <div className="max-w-4xl mx-auto">
          <div className="text-center">
            <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
            <h1 className="text-2xl font-bold text-gray-900 mb-2">
              خطأ في تحميل البيانات
            </h1>
            <p className="text-gray-600 mb-6">{error}</p>
            <BackButton variant="primary" />
          </div>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-6">
        <div className="max-w-4xl mx-auto">
          <div className="text-center">
            <User className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h1 className="text-2xl font-bold text-gray-900 mb-2">
              الموظف غير موجود
            </h1>
            <p className="text-gray-600 mb-6">
              لم يتم العثور على الموظف المطلوب
            </p>
            <BackButton variant="primary" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-4xl font-bold text-gray-900 mb-2">
                تفاصيل الموظف
              </h1>
              <p className="text-gray-600 text-lg">عرض وتعديل معلومات الموظف</p>
            </div>
            <div className="flex items-center gap-3">
              <BackButton variant="outline" size="lg" />
              {!isEditing && (
                <>
                  <EnhancedButton
                    onClick={handleEdit}
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
                </>
              )}
            </div>
          </div>
        </motion.div>

        {/* رسائل النجاح والخطأ */}
        <AnimatePresence>
          {isSuccess && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="mb-6 p-4 bg-green-50 border border-green-200 rounded-xl shadow-sm"
            >
              <div className="flex items-center">
                <CheckCircle className="w-5 h-5 text-green-600 ml-2" />
                <span className="text-green-800 font-medium">
                  تم تحديث بيانات الموظف بنجاح!
                </span>
              </div>
            </motion.div>
          )}

          {error && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl shadow-sm"
            >
              <div className="flex items-center">
                <AlertCircle className="w-5 h-5 text-red-600 ml-2" />
                <span className="text-red-800 font-medium">{error}</span>
              </div>
            </motion.div>
          )}

          {errors.submit && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl shadow-sm"
            >
              <div className="flex items-center">
                <AlertCircle className="w-5 h-5 text-red-600 ml-2" />
                <span className="text-red-800 font-medium">
                  {errors.submit}
                </span>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* معلومات الموظف الأساسية */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="lg:col-span-2"
          >
            <Card className="border-0 shadow-lg">
              <CardHeader className="border-b border-gray-200 bg-gradient-to-r from-gray-50 to-white">
                <h2 className="text-xl font-semibold text-gray-900">
                  المعلومات الأساسية
                </h2>
              </CardHeader>
              <CardBody className="p-6">
                {isEditing ? (
                  <div className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          اسم المستخدم <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="text"
                          name="username"
                          value={editForm.username}
                          onChange={handleChange}
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white text-gray-900"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          البريد الإلكتروني{" "}
                          <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="email"
                          name="email"
                          value={editForm.email}
                          onChange={handleChange}
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white text-gray-900"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          الاسم الكامل <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="text"
                          name="full_name"
                          value={editForm.full_name}
                          onChange={handleChange}
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white text-gray-900"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          رقم الهاتف
                        </label>
                        <input
                          type="tel"
                          name="phone"
                          value={editForm.phone}
                          onChange={handleChange}
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white text-gray-900"
                        />
                      </div>
                    </div>

                    <div className="flex gap-4 pt-6 border-t border-gray-200">
                      <EnhancedButton
                        onClick={handleSave}
                        variant="primary"
                        size="lg"
                        loading={isSaving}
                        icon={<Edit className="w-5 h-5" />}
                      >
                        {isSaving ? "جاري الحفظ..." : "حفظ التغييرات"}
                      </EnhancedButton>
                      <EnhancedButton
                        onClick={handleCancel}
                        variant="secondary"
                        size="lg"
                      >
                        إلغاء
                      </EnhancedButton>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-6">
                    <div className="flex items-center gap-4">
                      <div className="h-20 w-20 rounded-full bg-gradient-to-r from-blue-500 to-blue-600 flex items-center justify-center shadow-lg">
                        <span className="text-2xl font-bold text-white">
                          {user.full_name
                            .split(" ")
                            .map((n) => n[0])
                            .join("")
                            .toUpperCase()}
                        </span>
                      </div>
                      <div>
                        <h3 className="text-2xl font-bold text-gray-900">
                          {user.full_name}
                        </h3>
                        <p className="text-gray-600">{user.email}</p>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg">
                        <User className="w-5 h-5 text-gray-500" />
                        <div>
                          <p className="text-sm text-gray-500">اسم المستخدم</p>
                          <p className="font-medium text-gray-900">
                            {user.username}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg">
                        <Mail className="w-5 h-5 text-gray-500" />
                        <div>
                          <p className="text-sm text-gray-500">
                            البريد الإلكتروني
                          </p>
                          <p className="font-medium text-gray-900">
                            {user.email}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg">
                        <Phone className="w-5 h-5 text-gray-500" />
                        <div>
                          <p className="text-sm text-gray-500">رقم الهاتف</p>
                          <p className="font-medium text-gray-900">
                            {user.phone || "غير محدد"}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg">
                        <Calendar className="w-5 h-5 text-gray-500" />
                        <div>
                          <p className="text-sm text-gray-500">تاريخ الإنشاء</p>
                          <p className="font-medium text-gray-900">
                            {new Date(user.created_at).toLocaleDateString(
                              "ar-SA"
                            )}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </CardBody>
            </Card>
          </motion.div>

          {/* معلومات إضافية */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
            className="space-y-6"
          >
            {/* الدور والحالة */}
            <Card className="border-0 shadow-lg">
              <CardHeader className="border-b border-gray-200 bg-gradient-to-r from-gray-50 to-white">
                <h3 className="text-lg font-semibold text-gray-900">
                  الدور والحالة
                </h3>
              </CardHeader>
              <CardBody className="p-6 space-y-4">
                <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg">
                  <div className="p-2 bg-gray-100 rounded-lg">
                    {getRoleIcon(user.role)}
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">الدور</p>
                    <span
                      className={`inline-flex px-3 py-1 text-xs font-semibold rounded-full ${getRoleColor(
                        user.role
                      )}`}
                    >
                      {userService.getRoleDisplayName(user.role)}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg">
                  <div className="p-2 bg-gray-100 rounded-lg">
                    {getStatusIcon(user.status)}
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">الحالة</p>
                    <span
                      className={`inline-flex px-3 py-1 text-xs font-semibold rounded-full ${getStatusColor(
                        user.status
                      )}`}
                    >
                      {userService.getStatusDisplayName(user.status)}
                    </span>
                  </div>
                </div>

                {!isEditing && (
                  <EnhancedButton
                    onClick={handleStatusToggle}
                    variant={user.status === "active" ? "danger" : "success"}
                    size="sm"
                    icon={
                      user.status === "active" ? (
                        <UserX className="w-4 h-4" />
                      ) : (
                        <UserCheck className="w-4 h-4" />
                      )
                    }
                    fullWidth
                  >
                    {user.status === "active" ? "إلغاء التفعيل" : "تفعيل"}
                  </EnhancedButton>
                )}
              </CardBody>
            </Card>

            {/* آخر تسجيل دخول */}
            <Card className="border-0 shadow-lg">
              <CardHeader className="border-b border-gray-200 bg-gradient-to-r from-gray-50 to-white">
                <h3 className="text-lg font-semibold text-gray-900">
                  آخر تسجيل دخول
                </h3>
              </CardHeader>
              <CardBody className="p-6">
                <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg">
                  <Clock className="w-5 h-5 text-gray-500" />
                  <div>
                    <p className="text-sm text-gray-500">آخر تسجيل دخول</p>
                    <p className="font-medium text-gray-900">
                      {user.last_login
                        ? new Date(user.last_login).toLocaleDateString("ar-SA")
                        : "لم يسجل دخول"}
                    </p>
                  </div>
                </div>
              </CardBody>
            </Card>

            {/* إجراءات سريعة */}
            <Card className="border-0 shadow-lg">
              <CardHeader className="border-b border-gray-200 bg-gradient-to-r from-gray-50 to-white">
                <h3 className="text-lg font-semibold text-gray-900">
                  إجراءات سريعة
                </h3>
              </CardHeader>
              <CardBody className="p-6 space-y-3">
                <EnhancedButton
                  onClick={() => navigate(`/users/${id}/edit`)}
                  variant="primary"
                  size="sm"
                  icon={<Edit className="w-4 h-4" />}
                  fullWidth
                >
                  تعديل كامل
                </EnhancedButton>
                <EnhancedButton
                  onClick={() => navigate("/users")}
                  variant="secondary"
                  size="sm"
                  icon={<ArrowRight className="w-4 h-4" />}
                  fullWidth
                >
                  العودة للقائمة
                </EnhancedButton>
              </CardBody>
            </Card>
          </motion.div>
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
  );
};

export default UserDetailPage;
