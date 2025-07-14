import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useNavigate, useParams } from "react-router-dom";
import {
  User,
  Mail,
  Phone,
  Save,
  ArrowLeft,
  AlertCircle,
  CheckCircle,
  Loader2,
} from "lucide-react";
import { Card, CardHeader, CardBody } from "../../components/ui/Card";
import Button from "../../components/ui/Button";
import Input from "../../components/ui/Input";
import LoadingSpinner from "../../components/ui/LoadingSpinner";
import userService from "../../services/userService";

const EditUserPage = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    full_name: "",
    phone: "",
    role: "",
    status: "active",
  });
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [userNotFound, setUserNotFound] = useState(false);

  const roles = [
    {
      value: "admin",
      label: "مدير النظام",
      description: "صلاحيات كاملة على النظام",
    },
    {
      value: "manager",
      label: "مدير",
      description: "إدارة المخبز والموظفين",
    },
    {
      value: "distributor",
      label: "موزع",
      description: "توزيع المنتجات والتوصيل",
    },
    {
      value: "cashier",
      label: "كاشير",
      description: "المبيعات والمدفوعات",
    },
    {
      value: "accountant",
      label: "محاسب",
      description: "إدارة الحسابات والتقارير المالية",
    },
  ];

  const statuses = [
    { value: "active", label: "نشط" },
    { value: "inactive", label: "غير نشط" },
    { value: "suspended", label: "معلق" },
  ];

  // تحميل بيانات الموظف
  useEffect(() => {
    loadUser();
  }, [id]);

  const loadUser = async () => {
    try {
      setIsLoading(true);
      setErrors({});

      const response = await userService.getUser(id);

      if (response.success) {
        setFormData({
          username: response.data.username || "",
          email: response.data.email || "",
          full_name: response.data.full_name || "",
          phone: response.data.phone || "",
          role: response.data.role || "",
          status: response.data.status || "active",
        });
      } else {
        setUserNotFound(true);
        setErrors({ submit: response.message });
      }
    } catch (error) {
      setUserNotFound(true);
      setErrors({ submit: "خطأ في تحميل بيانات الموظف" });
      console.error("Error loading user:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));

    // إزالة خطأ الحقل عند الكتابة
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    // التحقق من اسم المستخدم
    if (!formData.username.trim()) {
      newErrors.username = "اسم المستخدم مطلوب";
    } else if (formData.username.length < 3) {
      newErrors.username = "اسم المستخدم يجب أن يكون 3 أحرف على الأقل";
    } else if (!/^[a-zA-Z0-9_]+$/.test(formData.username)) {
      newErrors.username =
        "اسم المستخدم يجب أن يحتوي على أحرف وأرقام وشرطة سفلية فقط";
    }

    // التحقق من البريد الإلكتروني
    if (!formData.email.trim()) {
      newErrors.email = "البريد الإلكتروني مطلوب";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = "البريد الإلكتروني غير صحيح";
    }

    // التحقق من الاسم الكامل
    if (!formData.full_name.trim()) {
      newErrors.full_name = "الاسم الكامل مطلوب";
    } else if (formData.full_name.trim().length < 2) {
      newErrors.full_name = "الاسم الكامل يجب أن يكون حرفين على الأقل";
    }

    // التحقق من رقم الهاتف
    if (formData.phone && !/^\+?[\d\s\-\(\)]+$/.test(formData.phone)) {
      newErrors.phone = "رقم الهاتف غير صحيح";
    }

    // التحقق من الدور
    if (!formData.role) {
      newErrors.role = "الدور مطلوب";
    }

    // التحقق من الحالة
    if (!formData.status) {
      newErrors.status = "الحالة مطلوبة";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsSaving(true);
    setErrors({});

    try {
      const response = await userService.updateUser(id, formData);

      if (response.success) {
        setIsSuccess(true);
        setTimeout(() => {
          navigate("/users");
        }, 2000);
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

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <LoadingSpinner size="xl" text="جاري تحميل بيانات الموظف..." />
      </div>
    );
  }

  if (userNotFound) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-4xl mx-auto">
          <div className="text-center">
            <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
            <h1 className="text-2xl font-bold text-gray-900 mb-2">
              الموظف غير موجود
            </h1>
            <p className="text-gray-600 mb-6">{errors.submit}</p>
            <Button
              onClick={() => navigate("/users")}
              className="bg-blue-600 hover:bg-blue-700 text-white"
            >
              العودة إلى قائمة الموظفين
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center mb-4">
            <Button
              onClick={() => navigate("/users")}
              variant="ghost"
              className="mr-4"
            >
              <ArrowLeft className="w-4 h-4 ml-2" />
              العودة
            </Button>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                تعديل بيانات الموظف
              </h1>
              <p className="text-gray-600 mt-2">
                تعديل معلومات الموظف في المخبز
              </p>
            </div>
          </div>
        </div>

        {/* رسالة النجاح */}
        {isSuccess && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg"
          >
            <div className="flex items-center">
              <CheckCircle className="w-5 h-5 text-green-600 ml-2" />
              <span className="text-green-800">
                تم تحديث بيانات الموظف بنجاح! جاري التحويل...
              </span>
            </div>
          </motion.div>
        )}

        {/* رسالة الخطأ */}
        {errors.submit && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg"
          >
            <div className="flex items-center">
              <AlertCircle className="w-5 h-5 text-red-600 ml-2" />
              <span className="text-red-800">{errors.submit}</span>
            </div>
          </motion.div>
        )}

        {/* النموذج */}
        <Card>
          <CardHeader>
            <h2 className="text-xl font-semibold text-gray-900">
              معلومات الموظف
            </h2>
            <p className="text-gray-600">تعديل معلومات الموظف</p>
          </CardHeader>
          <CardBody>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* الاسم الكامل */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    الاسم الكامل *
                  </label>
                  <div className="relative">
                    <User className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <Input
                      type="text"
                      name="full_name"
                      value={formData.full_name}
                      onChange={handleChange}
                      placeholder="أدخل الاسم الكامل"
                      className={`pr-10 bg-white border-gray-300 focus:border-blue-500 focus:ring-blue-500 ${
                        errors.full_name ? "border-red-500" : ""
                      }`}
                    />
                  </div>
                  {errors.full_name && (
                    <p className="mt-1 text-sm text-red-600">
                      {errors.full_name}
                    </p>
                  )}
                </div>

                {/* اسم المستخدم */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    اسم المستخدم *
                  </label>
                  <Input
                    type="text"
                    name="username"
                    value={formData.username}
                    onChange={handleChange}
                    placeholder="أدخل اسم المستخدم"
                    className={`bg-white border-gray-300 focus:border-blue-500 focus:ring-blue-500 ${
                      errors.username ? "border-red-500" : ""
                    }`}
                  />
                  {errors.username && (
                    <p className="mt-1 text-sm text-red-600">
                      {errors.username}
                    </p>
                  )}
                </div>

                {/* البريد الإلكتروني */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    البريد الإلكتروني *
                  </label>
                  <div className="relative">
                    <Mail className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <Input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      placeholder="أدخل البريد الإلكتروني"
                      className={`pr-10 bg-white border-gray-300 focus:border-blue-500 focus:ring-blue-500 ${
                        errors.email ? "border-red-500" : ""
                      }`}
                    />
                  </div>
                  {errors.email && (
                    <p className="mt-1 text-sm text-red-600">{errors.email}</p>
                  )}
                </div>

                {/* رقم الهاتف */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    رقم الهاتف
                  </label>
                  <div className="relative">
                    <Phone className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <Input
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={handleChange}
                      placeholder="أدخل رقم الهاتف"
                      className={`pr-10 bg-white border-gray-300 focus:border-blue-500 focus:ring-blue-500 ${
                        errors.phone ? "border-red-500" : ""
                      }`}
                    />
                  </div>
                  {errors.phone && (
                    <p className="mt-1 text-sm text-red-600">{errors.phone}</p>
                  )}
                </div>

                {/* الدور */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    الدور الوظيفي *
                  </label>
                  <select
                    name="role"
                    value={formData.role}
                    onChange={handleChange}
                    className={`w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white ${
                      errors.role ? "border-red-500" : ""
                    }`}
                  >
                    <option value="">اختر الدور</option>
                    {roles.map((role) => (
                      <option key={role.value} value={role.value}>
                        {role.label} - {role.description}
                      </option>
                    ))}
                  </select>
                  {errors.role && (
                    <p className="mt-1 text-sm text-red-600">{errors.role}</p>
                  )}
                </div>

                {/* الحالة */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    الحالة *
                  </label>
                  <select
                    name="status"
                    value={formData.status}
                    onChange={handleChange}
                    className={`w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white ${
                      errors.status ? "border-red-500" : ""
                    }`}
                  >
                    {statuses.map((status) => (
                      <option key={status.value} value={status.value}>
                        {status.label}
                      </option>
                    ))}
                  </select>
                  {errors.status && (
                    <p className="mt-1 text-sm text-red-600">{errors.status}</p>
                  )}
                </div>
              </div>

              {/* أزرار الإجراءات */}
              <div className="flex justify-end gap-4 pt-6 border-t border-gray-200">
                <Button
                  type="button"
                  onClick={() => navigate("/users")}
                  className="bg-gray-600 hover:bg-gray-700 text-white"
                >
                  إلغاء
                </Button>
                <Button
                  type="submit"
                  disabled={isSaving}
                  className="bg-blue-600 hover:bg-blue-700 text-white"
                >
                  {isSaving ? (
                    <>
                      <Loader2 className="w-4 h-4 ml-2 animate-spin" />
                      جاري الحفظ...
                    </>
                  ) : (
                    <>
                      <Save className="w-4 h-4 ml-2" />
                      حفظ التغييرات
                    </>
                  )}
                </Button>
              </div>
            </form>
          </CardBody>
        </Card>
      </div>
    </div>
  );
};

export default EditUserPage;
