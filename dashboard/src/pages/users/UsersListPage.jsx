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
} from "lucide-react";
import { Card, CardHeader, CardBody } from "../../components/ui/Card";
import Button from "../../components/ui/Button";
import Input from "../../components/ui/Input";
import LoadingSpinner from "../../components/ui/LoadingSpinner";
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

  // حذف موظف
  const handleDelete = async (userId, userName) => {
    if (!window.confirm(`هل أنت متأكد من حذف الموظف "${userName}"؟`)) {
      return;
    }

    try {
      setError("");
      const response = await userService.deleteUser(userId);

      if (response.success) {
        setSuccess("تم حذف الموظف بنجاح");
        loadUsers();
        loadStatistics();
      } else {
        setError(response.message);
      }
    } catch (error) {
      setError("خطأ في حذف الموظف");
      console.error("Error deleting user:", error);
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
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <LoadingSpinner size="xl" text="جاري تحميل بيانات الموظفين..." />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                إدارة الموظفين
              </h1>
              <p className="text-gray-600 mt-2">إدارة موظفي المخبز في بلجيكا</p>
            </div>
            <Button
              onClick={() => navigate("/users/create")}
              className="bg-blue-600 hover:bg-blue-700 text-white"
            >
              <Plus className="w-4 h-4 ml-2" />
              إضافة موظف جديد
            </Button>
          </div>

          {/* الإحصائيات */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
            <Card>
              <CardBody className="p-6">
                <div className="flex items-center">
                  <div className="p-3 bg-blue-100 rounded-lg">
                    <Users className="w-6 h-6 text-blue-600" />
                  </div>
                  <div className="mr-4">
                    <p className="text-sm font-medium text-gray-600">
                      إجمالي الموظفين
                    </p>
                    <p className="text-2xl font-bold text-gray-900">
                      {statistics.totalUsers}
                    </p>
                  </div>
                </div>
              </CardBody>
            </Card>

            <Card>
              <CardBody className="p-6">
                <div className="flex items-center">
                  <div className="p-3 bg-green-100 rounded-lg">
                    <UserCheck className="w-6 h-6 text-green-600" />
                  </div>
                  <div className="mr-4">
                    <p className="text-sm font-medium text-gray-600">
                      الموظفين النشطين
                    </p>
                    <p className="text-2xl font-bold text-gray-900">
                      {statistics.activeUsers}
                    </p>
                  </div>
                </div>
              </CardBody>
            </Card>

            <Card>
              <CardBody className="p-6">
                <div className="flex items-center">
                  <div className="p-3 bg-red-100 rounded-lg">
                    <UserX className="w-6 h-6 text-red-600" />
                  </div>
                  <div className="mr-4">
                    <p className="text-sm font-medium text-gray-600">
                      الموظفين غير النشطين
                    </p>
                    <p className="text-2xl font-bold text-gray-900">
                      {statistics.inactiveUsers}
                    </p>
                  </div>
                </div>
              </CardBody>
            </Card>
          </div>
        </div>

        {/* رسائل النجاح والخطأ */}
        <AnimatePresence>
          {success && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg"
            >
              <div className="flex items-center">
                <CheckCircle className="w-5 h-5 text-green-600 ml-2" />
                <span className="text-green-800">{success}</span>
              </div>
            </motion.div>
          )}

          {error && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg"
            >
              <div className="flex items-center">
                <AlertCircle className="w-5 h-5 text-red-600 ml-2" />
                <span className="text-red-800">{error}</span>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* أدوات البحث والفلترة */}
        <Card className="mb-6">
          <CardBody className="p-6">
            <form onSubmit={handleSearch} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                {/* البحث */}
                <div className="relative">
                  <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <Input
                    type="text"
                    placeholder="البحث في الموظفين..."
                    value={filters.search}
                    onChange={(e) =>
                      handleFilterChange("search", e.target.value)
                    }
                    className="pr-10 bg-white border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                  />
                </div>

                {/* فلتر الدور */}
                <select
                  value={filters.role}
                  onChange={(e) => handleFilterChange("role", e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
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
                  onChange={(e) => handleFilterChange("status", e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
                >
                  <option value="">جميع الحالات</option>
                  <option value="active">نشط</option>
                  <option value="inactive">غير نشط</option>
                  <option value="suspended">معلق</option>
                </select>

                {/* أزرار الإجراءات */}
                <div className="flex gap-2">
                  <Button
                    type="submit"
                    className="bg-blue-600 hover:bg-blue-700 text-white"
                  >
                    <Search className="w-4 h-4 ml-2" />
                    بحث
                  </Button>
                  <Button
                    type="button"
                    onClick={() => {
                      setFilters({ search: "", role: "", status: "" });
                      setPagination((prev) => ({ ...prev, currentPage: 1 }));
                    }}
                    className="bg-gray-600 hover:bg-gray-700 text-white"
                  >
                    <RefreshCw className="w-4 h-4 ml-2" />
                    إعادة تعيين
                  </Button>
                </div>
              </div>
            </form>
          </CardBody>
        </Card>

        {/* جدول الموظفين */}
        <Card>
          <CardHeader className="border-b border-gray-200">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-gray-900">
                قائمة الموظفين
              </h2>
              <div className="flex gap-2">
                <Button
                  onClick={() => handleExport("json")}
                  disabled={isExporting}
                  className="bg-green-600 hover:bg-green-700 text-white"
                >
                  {isExporting ? (
                    <Loader2 className="w-4 h-4 ml-2 animate-spin" />
                  ) : (
                    <Download className="w-4 h-4 ml-2" />
                  )}
                  تصدير JSON
                </Button>
                <Button
                  onClick={() => handleExport("csv")}
                  disabled={isExporting}
                  className="bg-purple-600 hover:bg-purple-700 text-white"
                >
                  {isExporting ? (
                    <Loader2 className="w-4 h-4 ml-2 animate-spin" />
                  ) : (
                    <Download className="w-4 h-4 ml-2" />
                  )}
                  تصدير CSV
                </Button>
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
                <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
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
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                        الموظف
                      </th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                        الدور
                      </th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                        الحالة
                      </th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                        تاريخ الإنشاء
                      </th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                        آخر تسجيل دخول
                      </th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                        الإجراءات
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {users.map((user) => (
                      <tr key={user.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="flex-shrink-0 h-10 w-10">
                              <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                                <span className="text-sm font-medium text-blue-600">
                                  {user.full_name
                                    .split(" ")
                                    .map((n) => n[0])
                                    .join("")
                                    .toUpperCase()}
                                </span>
                              </div>
                            </div>
                            <div className="mr-4">
                              <div className="text-sm font-medium text-gray-900">
                                {user.full_name}
                              </div>
                              <div className="text-sm text-gray-500">
                                {user.email}
                              </div>
                              {user.phone && (
                                <div className="text-sm text-gray-500">
                                  {user.phone}
                                </div>
                              )}
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span
                            className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-${userService.getRoleColor(
                              user.role
                            )}-100 text-${userService.getRoleColor(
                              user.role
                            )}-800`}
                          >
                            {userService.getRoleDisplayName(user.role)}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span
                            className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-${userService.getStatusColor(
                              user.status
                            )}-100 text-${userService.getStatusColor(
                              user.status
                            )}-800`}
                          >
                            {userService.getStatusDisplayName(user.status)}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {new Date(user.created_at).toLocaleDateString(
                            "ar-SA"
                          )}
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
                            <Button
                              onClick={() => navigate(`/users/${user.id}`)}
                              size="sm"
                              className="bg-blue-600 hover:bg-blue-700 text-white"
                            >
                              <Eye className="w-3 h-3 ml-1" />
                              عرض
                            </Button>
                            <Button
                              onClick={() => navigate(`/users/${user.id}/edit`)}
                              size="sm"
                              className="bg-yellow-600 hover:bg-yellow-700 text-white"
                            >
                              <Edit className="w-3 h-3 ml-1" />
                              تعديل
                            </Button>
                            <Button
                              onClick={() =>
                                handleToggleStatus(user.id, user.status)
                              }
                              size="sm"
                              className={
                                user.status === "active"
                                  ? "bg-red-600 hover:bg-red-700 text-white"
                                  : "bg-green-600 hover:bg-green-700 text-white"
                              }
                            >
                              {user.status === "active" ? (
                                <>
                                  <UserX className="w-3 h-3 ml-1" />
                                  إلغاء التفعيل
                                </>
                              ) : (
                                <>
                                  <UserCheck className="w-3 h-3 ml-1" />
                                  تفعيل
                                </>
                              )}
                            </Button>
                            <Button
                              onClick={() =>
                                handleDelete(user.id, user.full_name)
                              }
                              size="sm"
                              className="bg-red-600 hover:bg-red-700 text-white"
                            >
                              <Trash2 className="w-3 h-3 ml-1" />
                              حذف
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardBody>
        </Card>

        {/* التصفح */}
        {pagination.totalPages > 1 && (
          <div className="mt-6 flex items-center justify-between">
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
              <Button
                onClick={() =>
                  setPagination((prev) => ({
                    ...prev,
                    currentPage: prev.currentPage - 1,
                  }))
                }
                disabled={pagination.currentPage === 1}
                className="bg-gray-600 hover:bg-gray-700 text-white disabled:opacity-50"
              >
                السابق
              </Button>
              <span className="px-3 py-2 text-sm text-gray-700">
                صفحة {pagination.currentPage} من {pagination.totalPages}
              </span>
              <Button
                onClick={() =>
                  setPagination((prev) => ({
                    ...prev,
                    currentPage: prev.currentPage + 1,
                  }))
                }
                disabled={pagination.currentPage === pagination.totalPages}
                className="bg-gray-600 hover:bg-gray-700 text-white disabled:opacity-50"
              >
                التالي
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default UsersListPage;
