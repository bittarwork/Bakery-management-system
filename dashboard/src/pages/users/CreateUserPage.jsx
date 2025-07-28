import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import {
  User,
  Mail,
  Phone,
  Lock,
  Eye,
  EyeOff,
  Save,
  AlertCircle,
  CheckCircle,
  Loader2,
  Shield,
  Users,
  Truck,
  CreditCard,
  Calculator,
  Car,
  Briefcase,
  Building,
} from "lucide-react";
import { Card, CardHeader, CardBody } from "../../components/ui/Card";
import EnhancedButton from "../../components/ui/EnhancedButton";
import EnhancedInput from "../../components/ui/EnhancedInput";
import BackButton from "../../components/ui/BackButton";
import userService from "../../services/userService";
import vehicleService from "../../services/vehicleService";
import { AnimatePresence } from "framer-motion";

const CreateUserPage = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    // Basic information
    username: "",
    email: "",
    full_name: "",
    phone: "",
    password: "",
    confirmPassword: "",
    role: "distributor",

    // Job information
    address: "",
    hired_date: "",
    salary: "",

    // Distributor specific
    license_number: "",
    vehicle_id: "",
    work_status: "available",
  });

  const [availableVehicles, setAvailableVehicles] = useState([]);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  // Load available vehicles when role is distributor
  useEffect(() => {
    if (formData.role === "distributor") {
      loadAvailableVehicles();
    }
  }, [formData.role]);

  // Load vehicles on component mount if role is distributor
  useEffect(() => {
    if (formData.role === "distributor") {
      loadAvailableVehicles();
    }
  }, []);

  const loadAvailableVehicles = async () => {
    try {
      console.log("Loading available vehicles...");
      const response = await vehicleService.getAvailableVehicles();
      console.log("Vehicle response:", response);
      if (response.success) {
        setAvailableVehicles(response.data || []);
        console.log("Available vehicles loaded:", response.data);
      } else {
        console.error("Failed to load vehicles:", response.message);
        setAvailableVehicles([]);
      }
    } catch (error) {
      console.error("Error loading available vehicles:", error);
      setAvailableVehicles([]);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));

    // Clear field error when typing
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    // Basic validation
    if (!formData.username.trim()) {
      newErrors.username = "اسم المستخدم مطلوب";
    } else if (formData.username.length < 3) {
      newErrors.username = "اسم المستخدم يجب أن يكون 3 أحرف على الأقل";
    } else if (!/^[a-zA-Z0-9_]+$/.test(formData.username)) {
      newErrors.username =
        "اسم المستخدم يجب أن يحتوي على أحرف وأرقام وشرطة سفلية فقط";
    }

    if (!formData.email.trim()) {
      newErrors.email = "البريد الإلكتروني مطلوب";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = "البريد الإلكتروني غير صحيح";
    }

    if (!formData.full_name.trim()) {
      newErrors.full_name = "الاسم الكامل مطلوب";
    } else if (formData.full_name.trim().length < 2) {
      newErrors.full_name = "الاسم الكامل يجب أن يكون حرفين على الأقل";
    }

    if (formData.phone && !/^\+?[\d\s\-\(\)]+$/.test(formData.phone)) {
      newErrors.phone = "رقم الهاتف غير صحيح";
    }

    // Password validation
    if (!formData.password) {
      newErrors.password = "كلمة المرور مطلوبة";
    } else if (formData.password.length < 8) {
      newErrors.password = "كلمة المرور يجب أن تكون 8 أحرف على الأقل";
    } else if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(formData.password)) {
      newErrors.password =
        "كلمة المرور يجب أن تحتوي على حرف صغير وحرف كبير ورقم";
    }

    if (!formData.confirmPassword) {
      newErrors.confirmPassword = "تأكيد كلمة المرور مطلوب";
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = "كلمة المرور غير متطابقة";
    }

    if (!formData.role) {
      newErrors.role = "الدور مطلوب";
    }

    // Additional validations
    if (formData.hired_date && new Date(formData.hired_date) > new Date()) {
      newErrors.hired_date = "تاريخ التوظيف لا يمكن أن يكون في المستقبل";
    }

    if (
      formData.salary &&
      (isNaN(formData.salary) || parseFloat(formData.salary) < 0)
    ) {
      newErrors.salary = "الراتب يجب أن يكون رقم صحيح";
    }

    // Role-specific validations
    if (formData.role === "distributor") {
      if (formData.license_number && formData.license_number.length < 3) {
        newErrors.license_number = "رقم الرخصة يجب أن يكون 3 أحرف على الأقل";
      }
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
    setErrors({});

    try {
      // Prepare data for submission
      const submitData = {
        ...formData,
        // Format vehicle info as JSON for distributors
        vehicle_info:
          formData.role === "distributor" && formData.vehicle_id
            ? {
                vehicle_id: formData.vehicle_id,
                assigned_date: new Date().toISOString(),
              }
            : null,
        // Convert salary to number
        salary: formData.salary ? parseFloat(formData.salary) : null,
        // Remove temporary fields
        confirmPassword: undefined,
      };

      const response = await userService.createUser(submitData);

      if (response.success) {
        setIsSuccess(true);
        setTimeout(() => {
          navigate("/users");
        }, 2000);
      } else {
        setErrors({ submit: response.message });
      }
    } catch (error) {
      setErrors({ submit: "خطأ في إنشاء الموظف. يرجى المحاولة مرة أخرى." });
    } finally {
      setIsLoading(false);
    }
  };

  // Enhanced role definitions
  const roles = [
    {
      value: "admin",
      label: "مدير النظام",
      description: "صلاحيات كاملة على النظام والإعدادات",
      icon: <Shield className="w-5 h-5" />,
      color: "from-purple-500 to-purple-600",
    },
    {
      value: "manager",
      label: "مدير",
      description: "إدارة المخبز والموظفين والعمليات",
      icon: <Users className="w-5 h-5" />,
      color: "from-blue-500 to-blue-600",
    },
    {
      value: "distributor",
      label: "موزع",
      description: "توزيع المنتجات والتوصيل للمتاجر",
      icon: <Truck className="w-5 h-5" />,
      color: "from-green-500 to-green-600",
    },
    {
      value: "cashier",
      label: "كاشير",
      description: "المبيعات ومعالجة المدفوعات",
      icon: <CreditCard className="w-5 h-5" />,
      color: "from-yellow-500 to-yellow-600",
    },
    {
      value: "accountant",
      label: "محاسب",
      description: "إدارة الحسابات والتقارير المالية",
      icon: <Calculator className="w-5 h-5" />,
      color: "from-gray-500 to-gray-600",
    },
  ];

  const workStatuses = [
    { value: "available", label: "متاح" },
    { value: "busy", label: "مشغول" },
    { value: "offline", label: "غير متصل" },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 p-6">
      <div className="max-w-4xl mx-auto">
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
                  إضافة موظف جديد
                </h1>
                <p className="text-gray-600 text-lg">
                  إنشاء حساب جديد للموظف في النظام
                </p>
              </div>
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
              className="mb-6 p-4 bg-emerald-50 border border-emerald-200 rounded-xl shadow-sm"
            >
              <div className="flex items-center">
                <CheckCircle className="w-5 h-5 text-emerald-600 ml-2" />
                <span className="text-emerald-800 font-medium">
                  تم إنشاء الموظف بنجاح! جاري التوجيه...
                </span>
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

        {/* نموذج إنشاء الموظف */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Card className="border-0 shadow-lg">
            <CardHeader className="border-b border-gray-200 bg-gradient-to-r from-gray-50 to-white">
              <h2 className="text-xl font-semibold text-gray-900">
                معلومات الموظف
              </h2>
            </CardHeader>
            <CardBody className="p-6">
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* المعلومات الأساسية */}
                <div className="space-y-6">
                  <h3 className="text-lg font-semibold text-gray-900 border-b border-gray-200 pb-2">
                    المعلومات الأساسية
                  </h3>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* اسم المستخدم */}
                    <div>
                      <EnhancedInput
                        label="اسم المستخدم"
                        name="username"
                        value={formData.username}
                        onChange={handleChange}
                        error={errors.username}
                        required
                        icon={<User className="w-4 h-4" />}
                      />
                    </div>

                    {/* البريد الإلكتروني */}
                    <div>
                      <EnhancedInput
                        label="البريد الإلكتروني"
                        name="email"
                        type="email"
                        value={formData.email}
                        onChange={handleChange}
                        error={errors.email}
                        required
                        icon={<Mail className="w-4 h-4" />}
                      />
                    </div>

                    {/* الاسم الكامل */}
                    <div>
                      <EnhancedInput
                        label="الاسم الكامل"
                        name="full_name"
                        value={formData.full_name}
                        onChange={handleChange}
                        error={errors.full_name}
                        required
                        icon={<User className="w-4 h-4" />}
                      />
                    </div>

                    {/* رقم الهاتف */}
                    <div>
                      <EnhancedInput
                        label="رقم الهاتف"
                        name="phone"
                        value={formData.phone}
                        onChange={handleChange}
                        error={errors.phone}
                        icon={<Phone className="w-4 h-4" />}
                      />
                    </div>

                    {/* كلمة المرور */}
                    <div>
                      <EnhancedInput
                        label="كلمة المرور"
                        name="password"
                        type={showPassword ? "text" : "password"}
                        value={formData.password}
                        onChange={handleChange}
                        error={errors.password}
                        required
                        icon={<Lock className="w-4 h-4" />}
                        endIcon={
                          <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="text-gray-400 hover:text-gray-600"
                          >
                            {showPassword ? (
                              <EyeOff className="w-4 h-4" />
                            ) : (
                              <Eye className="w-4 h-4" />
                            )}
                          </button>
                        }
                      />
                    </div>

                    {/* تأكيد كلمة المرور */}
                    <div>
                      <EnhancedInput
                        label="تأكيد كلمة المرور"
                        name="confirmPassword"
                        type={showConfirmPassword ? "text" : "password"}
                        value={formData.confirmPassword}
                        onChange={handleChange}
                        error={errors.confirmPassword}
                        required
                        icon={<Lock className="w-4 h-4" />}
                        endIcon={
                          <button
                            type="button"
                            onClick={() =>
                              setShowConfirmPassword(!showConfirmPassword)
                            }
                            className="text-gray-400 hover:text-gray-600"
                          >
                            {showConfirmPassword ? (
                              <EyeOff className="w-4 h-4" />
                            ) : (
                              <Eye className="w-4 h-4" />
                            )}
                          </button>
                        }
                      />
                    </div>
                  </div>
                </div>

                {/* معلومات الوظيفة */}
                <div className="space-y-6">
                  <h3 className="text-lg font-semibold text-gray-900 border-b border-gray-200 pb-2">
                    معلومات الوظيفة
                  </h3>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* الدور */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        الدور
                      </label>
                      <div className="grid grid-cols-1 gap-3">
                        {roles.map((role) => (
                          <label
                            key={role.value}
                            className={`relative flex items-center p-4 border rounded-xl cursor-pointer transition-all duration-200 ${
                              formData.role === role.value
                                ? "border-blue-500 bg-blue-50"
                                : "border-gray-200 hover:border-gray-300"
                            }`}
                          >
                            <input
                              type="radio"
                              name="role"
                              value={role.value}
                              checked={formData.role === role.value}
                              onChange={handleChange}
                              className="sr-only"
                            />
                            <div className="flex items-center gap-3">
                              <div
                                className={`p-2 rounded-lg bg-gradient-to-r ${role.color}`}
                              >
                                {role.icon}
                              </div>
                              <div>
                                <div className="font-medium text-gray-900">
                                  {role.label}
                                </div>
                                <div className="text-sm text-gray-500">
                                  {role.description}
                                </div>
                              </div>
                            </div>
                          </label>
                        ))}
                      </div>
                      {errors.role && (
                        <p className="mt-1 text-sm text-red-600">
                          {errors.role}
                        </p>
                      )}
                    </div>

                    {/* معلومات إضافية للوظيفة */}
                    <div className="space-y-4">
                      {/* العنوان */}
                      <EnhancedInput
                        label="العنوان"
                        name="address"
                        value={formData.address}
                        onChange={handleChange}
                        error={errors.address}
                        icon={<Building className="w-4 h-4" />}
                      />

                      {/* تاريخ التوظيف */}
                      <EnhancedInput
                        label="تاريخ التوظيف"
                        name="hired_date"
                        type="date"
                        value={formData.hired_date}
                        onChange={handleChange}
                        error={errors.hired_date}
                        icon={<Building className="w-4 h-4" />}
                      />

                      {/* الراتب */}
                      <EnhancedInput
                        label="الراتب (EUR)"
                        name="salary"
                        type="number"
                        value={formData.salary}
                        onChange={handleChange}
                        error={errors.salary}
                        icon={<Building className="w-4 h-4" />}
                      />

                      {/* حالة العمل */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          حالة العمل
                        </label>
                        <select
                          name="work_status"
                          value={formData.work_status}
                          onChange={handleChange}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        >
                          {workStatuses.map((status) => (
                            <option key={status.value} value={status.value}>
                              {status.label}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>
                  </div>
                </div>

                {/* معلومات خاصة بالموزع */}
                {formData.role === "distributor" && (
                  <div className="space-y-6">
                    <h3 className="text-lg font-semibold text-gray-900 border-b border-gray-200 pb-2">
                      معلومات الموزع
                    </h3>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {/* رقم الرخصة */}
                      <EnhancedInput
                        label="رقم الرخصة"
                        name="license_number"
                        value={formData.license_number}
                        onChange={handleChange}
                        error={errors.license_number}
                        icon={<Truck className="w-4 h-4" />}
                      />

                      {/* تعيين المركبة */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          تعيين المركبة
                        </label>
                        <select
                          name="vehicle_id"
                          value={formData.vehicle_id}
                          onChange={handleChange}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        >
                          <option value="">اختر مركبة</option>
                          {availableVehicles.map((vehicle) => (
                            <option key={vehicle.id} value={vehicle.id}>
                              {vehicle.vehicle_plate || vehicle.plate_number} -{" "}
                              {vehicle.vehicle_model || vehicle.model} (
                              {vehicle.vehicle_type || vehicle.type})
                            </option>
                          ))}
                        </select>
                        {availableVehicles.length === 0 && (
                          <div className="mt-2 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                            <p className="text-sm text-yellow-700">
                              لا توجد مركبات متاحة حالياً. يمكنك إضافة مركبات
                              جديدة من صفحة إدارة المركبات.
                            </p>
                          </div>
                        )}
                        {availableVehicles.length > 0 && (
                          <p className="mt-1 text-sm text-gray-500">
                            تم العثور على {availableVehicles.length} مركبة متاحة
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                )}

                {/* أزرار التحكم */}
                <div className="flex items-center justify-between pt-6 border-t border-gray-200">
                  <BackButton variant="outline" />

                  <EnhancedButton
                    type="submit"
                    variant="primary"
                    loading={isLoading}
                    disabled={isLoading}
                    icon={
                      isLoading ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <Save className="w-4 h-4" />
                      )
                    }
                    className="px-8"
                  >
                    {isLoading ? "جاري الحفظ..." : "حفظ الموظف"}
                  </EnhancedButton>
                </div>
              </form>
            </CardBody>
          </Card>
        </motion.div>
      </div>
    </div>
  );
};

export default CreateUserPage;
