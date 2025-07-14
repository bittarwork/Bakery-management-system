import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import {
  Plus,
  Users,
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
  UserCheck,
  UserX,
  AlertCircle,
  CheckCircle,
  Loader2,
  MoreVertical,
  FileText,
  BarChart3,
} from "lucide-react";
import { Card, CardHeader, CardBody } from "../../components/ui/Card";
import EnhancedButton from "../../components/ui/EnhancedButton";
import EnhancedInput from "../../components/ui/EnhancedInput";
import LoadingSpinner from "../../components/ui/LoadingSpinner";
import { DeleteConfirmationModal } from "../../components/ui/Modal";
import userService from "../../services/userService";

const UsersListPage = () => {
  const navigate = useNavigate();
  const [users, setUsers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isExporting, setIsExporting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // فلاتر البحث
  const [filters, setFilters] = useState({
    search: "",
    role: "",
    status: "",
  });

  // التصفح
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalItems: 0,
    itemsPerPage: 10,
  });

  // الإحصائيات
  const [statistics, setStatistics] = useState({
    totalUsers: 0,
    activeUsers: 0,
    inactiveUsers: 0,
  });

  // Modal الحذف
  const [deleteModal, setDeleteModal] = useState({
    isOpen: false,
    userId: null,
    userName: "",
    isLoading: false,
  });

  // تحميل البيانات
  useEffect(() => {
    loadUsers();
    loadStatistics();
  }, [pagination.currentPage, filters]);

  const loadUsers = async () => {
    try {
      setIsLoading(true);
      setError("");

      const params = {
        page: pagination.currentPage,
        limit: pagination.itemsPerPage,
        ...filters,
      };

      const response = await userService.getUsers(params);

      if (response.success) {
        setUsers(response.data.users);
        setPagination((prev) => ({
          ...prev,
          totalPages: response.data.pagination.totalPages,
          totalItems: response.data.pagination.totalItems,
        }));
      } else {
        setError(response.message);
      }
    } catch (error) {
      setError("خطأ في تحميل بيانات الموظفين");
      console.error("Error loading users:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const loadStatistics = async () => {
    try {
      const response = await userService.getUserStatistics();
      if (response.success) {
        setStatistics(response.data.general);
      }
    } catch (error) {
      console.error("Error loading statistics:", error);
    }
  };

  // معالجة تغيير الفلاتر
  const handleFilterChange = (key, value) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
    setPagination((prev) => ({ ...prev, currentPage: 1 }));
  };

  // معالجة البحث
  const handleSearch = (e) => {
    e.preventDefault();
    setPagination((prev) => ({ ...prev, currentPage: 1 }));
  };

  // تصدير البيانات
  const handleExport = async (format = "json") => {
    try {
      setIsExporting(true);
      setError("");

      const response = await userService.exportUsers(format);

      if (response.success) {
        if (format === "csv") {
          // تحميل ملف CSV
          const blob = new Blob([response.data], { type: "text/csv" });
          const url = window.URL.createObjectURL(blob);
          const a = document.createElement("a");
          a.href = url;
          a.download = `employees_${
            new Date().toISOString().split("T")[0]
          }.csv`;
          a.click();
          window.URL.revokeObjectURL(url);
        } else {
          // تحميل ملف JSON
          const dataStr = JSON.stringify(response.data, null, 2);
          const blob = new Blob([dataStr], { type: "application/json" });
          const url = window.URL.createObjectURL(blob);
          const a = document.createElement("a");
          a.href = url;
          a.download = `employees_${
            new Date().toISOString().split("T")[0]
          }.json`;
          a.click();
          window.URL.revokeObjectURL(url);
        }
        setSuccess(`تم تصدير البيانات بنجاح بصيغة ${format.toUpperCase()}`);
      } else {
        setError(response.message);
      }
    } catch (error) {
      setError("خطأ في تصدير البيانات");
      console.error("Error exporting users:", error);
    } finally {
      setIsExporting(false);
    }
  };

  // فتح modal الحذف
  const openDeleteModal = (userId, userName) => {
    setDeleteModal({
      isOpen: true,
      userId,
      userName,
      isLoading: false,
    });
  };

  // إغلاق modal الحذف
  const closeDeleteModal = () => {
    setDeleteModal({
      isOpen: false,
      userId: null,
      userName: "",
      isLoading: false,
    });
  };

  // تأكيد الحذف
  const confirmDelete = async () => {
    try {
      setDeleteModal((prev) => ({ ...prev, isLoading: true }));
      setError("");

      const response = await userService.deleteUser(deleteModal.userId);

      if (response.success) {
        setSuccess("تم حذف الموظف بنجاح");
        closeDeleteModal();
        loadUsers();
        loadStatistics();
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

  // تغيير حالة موظف
  const handleToggleStatus = async (userId, currentStatus) => {
    const newStatus = currentStatus === "active" ? "inactive" : "active";

    try {
      setError("");
      const response = await userService.toggleUserStatus(userId, newStatus);

      if (response.success) {
        setSuccess(
          `تم ${newStatus === "active" ? "تفعيل" : "إلغاء تفعيل"} الموظف بنجاح`
        );
        loadUsers();
        loadStatistics();
      } else {
        setError(response.message);
      }
    } catch (error) {
      setError("خطأ في تغيير حالة الموظف");
      console.error("Error toggling user status:", error);
    }
  };

  // إزالة الرسائل
  useEffect(() => {
    if (success) {
      const timer = setTimeout(() => setSuccess(""), 5000);
      return () => clearTimeout(timer);
    }
    if (error) {
      const timer = setTimeout(() => setError(""), 5000);
      return () => clearTimeout(timer);
    }
  }, [success, error]);

  if (isLoading && users.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center">
        <LoadingSpinner size="xl" text="جاري تحميل بيانات الموظفين..." />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-4xl font-bold text-gray-900 mb-2">
                إدارة الموظفين
              </h1>
              <p className="text-gray-600 text-lg">
                إدارة موظفي المخبز في بلجيكا
              </p>
            </div>
            <EnhancedButton
              onClick={() => navigate("/users/create")}
              variant="primary"
              size="lg"
              icon={<Plus className="w-5 h-5" />}
            >
              إضافة موظف جديد
            </EnhancedButton>
          </div>

          {/* الإحصائيات */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
            >
              <Card className="bg-gradient-to-r from-blue-500 to-blue-600 text-white border-0 shadow-lg">
                <CardBody className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-blue-100 text-sm font-medium">
                        إجمالي الموظفين
                      </p>
                      <p className="text-3xl font-bold mt-1">
                        {statistics.totalUsers}
                      </p>
                    </div>
                    <div className="p-3 bg-white/20 rounded-xl">
                      <Users className="w-8 h-8" />
                    </div>
                  </div>
                </CardBody>
              </Card>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              <Card className="bg-gradient-to-r from-green-500 to-green-600 text-white border-0 shadow-lg">
                <CardBody className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-green-100 text-sm font-medium">
                        الموظفين النشطين
                      </p>
                      <p className="text-3xl font-bold mt-1">
                        {statistics.activeUsers}
                      </p>
                    </div>
                    <div className="p-3 bg-white/20 rounded-xl">
                      <UserCheck className="w-8 h-8" />
                    </div>
                  </div>
                </CardBody>
              </Card>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              <Card className="bg-gradient-to-r from-red-500 to-red-600 text-white border-0 shadow-lg">
                <CardBody className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-red-100 text-sm font-medium">
                        الموظفين غير النشطين
                      </p>
                      <p className="text-3xl font-bold mt-1">
                        {statistics.inactiveUsers}
                      </p>
                    </div>
                    <div className="p-3 bg-white/20 rounded-xl">
                      <UserX className="w-8 h-8" />
                    </div>
                  </div>
                </CardBody>
              </Card>
            </motion.div>
          </div>
        </motion.div>

        {/* رسائل النجاح والخطأ */}
        <AnimatePresence>
          {success && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="mb-6 p-4 bg-green-50 border border-green-200 rounded-xl shadow-sm"
            >
              <div className="flex items-center">
                <CheckCircle className="w-5 h-5 text-green-600 ml-2" />
                <span className="text-green-800 font-medium">{success}</span>
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
        </AnimatePresence>

        {/* أدوات البحث والفلترة */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <Card className="mb-6 border-0 shadow-lg">
            <CardBody className="p-6">
              <form onSubmit={handleSearch} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  {/* البحث */}
                  <EnhancedInput
                    type="text"
                    placeholder="البحث في الموظفين..."
                    value={filters.search}
                    onChange={(e) =>
                      handleFilterChange("search", e.target.value)
                    }
                    icon={<Search className="w-4 h-4" />}
                    size="md"
                  />

                  {/* فلتر الدور */}
                  <select
                    value={filters.role}
                    onChange={(e) => handleFilterChange("role", e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white text-gray-900"
                  >
                    <option value="">جميع الأدوار</option>
                    <option value="admin">مدير النظام</option>
                    <option value="manager">مدير</option>
                    <option value="distributor">موزع</option>
                    <option value="cashier">كاشير</option>
                    <option value="accountant">محاسب</option>
                  </select>

                  {/* فلتر الحالة */}
                  <select
                    value={filters.status}
                    onChange={(e) =>
                      handleFilterChange("status", e.target.value)
                    }
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white text-gray-900"
                  >
                    <option value="">جميع الحالات</option>
                    <option value="active">نشط</option>
                    <option value="inactive">غير نشط</option>
                    <option value="suspended">معلق</option>
                  </select>

                  {/* أزرار الإجراءات */}
                  <div className="flex gap-2">
                    <EnhancedButton
                      type="submit"
                      variant="primary"
                      icon={<Search className="w-4 h-4" />}
                    >
                      بحث
                    </EnhancedButton>
                    <EnhancedButton
                      type="button"
                      variant="secondary"
                      icon={<RefreshCw className="w-4 h-4" />}
                      onClick={() => {
                        setFilters({ search: "", role: "", status: "" });
                        setPagination((prev) => ({ ...prev, currentPage: 1 }));
                      }}
                    >
                      إعادة تعيين
                    </EnhancedButton>
                  </div>
                </div>
              </form>
            </CardBody>
          </Card>
        </motion.div>

        {/* جدول الموظفين */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          <Card className="border-0 shadow-lg">
            <CardHeader className="border-b border-gray-200 bg-gradient-to-r from-gray-50 to-white">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold text-gray-900">
                  قائمة الموظفين
                </h2>
                <div className="flex gap-2">
                  <EnhancedButton
                    onClick={() => handleExport("json")}
                    disabled={isExporting}
                    variant="success"
                    size="sm"
                    icon={
                      isExporting ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <FileText className="w-4 h-4" />
                      )
                    }
                  >
                    تصدير JSON
                  </EnhancedButton>
                  <EnhancedButton
                    onClick={() => handleExport("csv")}
                    disabled={isExporting}
                    variant="warning"
                    size="sm"
                    icon={
                      isExporting ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <Download className="w-4 h-4" />
                      )
                    }
                  >
                    تصدير CSV
                  </EnhancedButton>
                </div>
              </div>
            </CardHeader>

            <CardBody className="p-0">
              {isLoading ? (
                <div className="p-8 text-center">
                  <LoadingSpinner size="lg" text="جاري تحميل البيانات..." />
                </div>
              ) : users.length === 0 ? (
                <div className="p-8 text-center">
                  <Users className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-xl font-medium text-gray-900 mb-2">
                    لا توجد موظفين
                  </h3>
                  <p className="text-gray-600">
                    لم يتم العثور على موظفين يطابقون معايير البحث
                  </p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-4 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                          الموظف
                        </th>
                        <th className="px-6 py-4 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                          الدور
                        </th>
                        <th className="px-6 py-4 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                          الحالة
                        </th>
                        <th className="px-6 py-4 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                          تاريخ الإنشاء
                        </th>
                        <th className="px-6 py-4 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                          آخر تسجيل دخول
                        </th>
                        <th className="px-6 py-4 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                          الإجراءات
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {users.map((user, index) => (
                        <motion.tr
                          key={user.id}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: index * 0.05 }}
                          className="hover:bg-gray-50 transition-colors"
                        >
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                              <div className="flex-shrink-0 h-12 w-12">
                                <div className="h-12 w-12 rounded-full bg-gradient-to-r from-blue-500 to-blue-600 flex items-center justify-center shadow-lg">
                                  <span className="text-sm font-bold text-white">
                                    {user.full_name
                                      .split(" ")
                                      .map((n) => n[0])
                                      .join("")
                                      .toUpperCase()}
                                  </span>
                                </div>
                              </div>
                              <div className="mr-4">
                                <div className="text-sm font-semibold text-gray-900">
                                  {user.full_name}
                                </div>
                                <div className="text-sm text-gray-500 flex items-center gap-1">
                                  <Mail className="w-3 h-3" />
                                  {user.email}
                                </div>
                                {user.phone && (
                                  <div className="text-sm text-gray-500 flex items-center gap-1">
                                    <Phone className="w-3 h-3" />
                                    {user.phone}
                                  </div>
                                )}
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span
                              className={`inline-flex px-3 py-1 text-xs font-semibold rounded-full ${
                                user.role === "admin"
                                  ? "bg-purple-100 text-purple-800"
                                  : user.role === "manager"
                                  ? "bg-blue-100 text-blue-800"
                                  : user.role === "distributor"
                                  ? "bg-green-100 text-green-800"
                                  : user.role === "cashier"
                                  ? "bg-yellow-100 text-yellow-800"
                                  : "bg-gray-100 text-gray-800"
                              }`}
                            >
                              {userService.getRoleDisplayName(user.role)}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span
                              className={`inline-flex px-3 py-1 text-xs font-semibold rounded-full ${
                                user.status === "active"
                                  ? "bg-green-100 text-green-800"
                                  : user.status === "inactive"
                                  ? "bg-red-100 text-red-800"
                                  : "bg-yellow-100 text-yellow-800"
                              }`}
                            >
                              {userService.getStatusDisplayName(user.status)}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            <div className="flex items-center gap-1">
                              <Calendar className="w-3 h-3" />
                              {new Date(user.created_at).toLocaleDateString(
                                "ar-SA"
                              )}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {user.last_login
                              ? new Date(user.last_login).toLocaleDateString(
                                  "ar-SA"
                                )
                              : "لم يسجل دخول"}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                            <div className="flex items-center gap-2">
                              <EnhancedButton
                                onClick={() => navigate(`/users/${user.id}`)}
                                variant="primary"
                                size="sm"
                                icon={<Eye className="w-3 h-3" />}
                              >
                                عرض
                              </EnhancedButton>
                              <EnhancedButton
                                onClick={() =>
                                  navigate(`/users/${user.id}/edit`)
                                }
                                variant="warning"
                                size="sm"
                                icon={<Edit className="w-3 h-3" />}
                              >
                                تعديل
                              </EnhancedButton>
                              <EnhancedButton
                                onClick={() =>
                                  handleToggleStatus(user.id, user.status)
                                }
                                variant={
                                  user.status === "active"
                                    ? "danger"
                                    : "success"
                                }
                                size="sm"
                                icon={
                                  user.status === "active" ? (
                                    <UserX className="w-3 h-3" />
                                  ) : (
                                    <UserCheck className="w-3 h-3" />
                                  )
                                }
                              >
                                {user.status === "active"
                                  ? "إلغاء التفعيل"
                                  : "تفعيل"}
                              </EnhancedButton>
                              <EnhancedButton
                                onClick={() =>
                                  openDeleteModal(user.id, user.full_name)
                                }
                                variant="danger"
                                size="sm"
                                icon={<Trash2 className="w-3 h-3" />}
                              >
                                حذف
                              </EnhancedButton>
                            </div>
                          </td>
                        </motion.tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </CardBody>
          </Card>
        </motion.div>

        {/* التصفح */}
        {pagination.totalPages > 1 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="mt-6 flex items-center justify-between bg-white p-4 rounded-xl shadow-lg"
          >
            <div className="text-sm text-gray-700">
              عرض {(pagination.currentPage - 1) * pagination.itemsPerPage + 1}{" "}
              إلى{" "}
              {Math.min(
                pagination.currentPage * pagination.itemsPerPage,
                pagination.totalItems
              )}{" "}
              من {pagination.totalItems} موظف
            </div>
            <div className="flex gap-2">
              <EnhancedButton
                onClick={() =>
                  setPagination((prev) => ({
                    ...prev,
                    currentPage: prev.currentPage - 1,
                  }))
                }
                disabled={pagination.currentPage === 1}
                variant="secondary"
                size="sm"
              >
                السابق
              </EnhancedButton>
              <span className="px-4 py-2 text-sm text-gray-700 bg-gray-100 rounded-lg">
                صفحة {pagination.currentPage} من {pagination.totalPages}
              </span>
              <EnhancedButton
                onClick={() =>
                  setPagination((prev) => ({
                    ...prev,
                    currentPage: prev.currentPage + 1,
                  }))
                }
                disabled={pagination.currentPage === pagination.totalPages}
                variant="secondary"
                size="sm"
              >
                التالي
              </EnhancedButton>
            </div>
          </motion.div>
        )}
      </div>

      {/* Modal الحذف */}
      <DeleteConfirmationModal
        isOpen={deleteModal.isOpen}
        onClose={closeDeleteModal}
        onConfirm={confirmDelete}
        itemName={deleteModal.userName}
        isLoading={deleteModal.isLoading}
      />
    </div>
  );
};

export default UsersListPage;
