import React, { useState } from "react";
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
} from "lucide-react";
import { Card, CardHeader, CardBody } from "../../components/ui/Card";
import EnhancedButton from "../../components/ui/EnhancedButton";
import EnhancedInput from "../../components/ui/EnhancedInput";
import BackButton from "../../components/ui/BackButton";
import userService from "../../services/userService";
import { AnimatePresence } from "framer-motion";

const CreateUserPage = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    full_name: "",
    phone: "",
    password: "",
    confirmPassword: "",
    role: "distributor",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const roles = [
    {
      value: "admin",
      label: "مدير النظام",
      description: "صلاحيات كاملة على النظام",
      icon: <Shield className="w-5 h-5" />,
      color: "from-purple-500 to-purple-600",
    },
    {
      value: "manager",
      label: "مدير",
      description: "إدارة المخبز والموظفين",
      icon: <Users className="w-5 h-5" />,
      color: "from-blue-500 to-blue-600",
    },
    {
      value: "distributor",
      label: "موزع",
      description: "توزيع المنتجات والتوصيل",
      icon: <Truck className="w-5 h-5" />,
      color: "from-green-500 to-green-600",
    },
    {
      value: "cashier",
      label: "كاشير",
      description: "المبيعات والمدفوعات",
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

    // التحقق من كلمة المرور
    if (!formData.password) {
      newErrors.password = "كلمة المرور مطلوبة";
    } else if (formData.password.length < 8) {
      newErrors.password = "كلمة المرور يجب أن تكون 8 أحرف على الأقل";
    } else if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(formData.password)) {
      newErrors.password =
        "كلمة المرور يجب أن تحتوي على حرف صغير وحرف كبير ورقم";
    }

    // التحقق من تأكيد كلمة المرور
    if (!formData.confirmPassword) {
      newErrors.confirmPassword = "تأكيد كلمة المرور مطلوب";
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = "كلمة المرور غير متطابقة";
    }

    // التحقق من الدور
    if (!formData.role) {
      newErrors.role = "الدور مطلوب";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const getPasswordStrength = (password) => {
    let strength = 0;
    if (password.length >= 8) strength++;
    if (/[A-Z]/.test(password)) strength++;
    if (/[a-z]/.test(password)) strength++;
    if (/[0-9]/.test(password)) strength++;
    if (/[^A-Za-z0-9]/.test(password)) strength++;
    return strength;
  };

  const getPasswordStrengthColor = (strength) => {
    if (strength <= 1) return "text-red-500";
    if (strength <= 2) return "text-orange-500";
    if (strength <= 3) return "text-yellow-500";
    if (strength <= 4) return "text-blue-500";
    return "text-green-500";
  };

  const getPasswordStrengthText = (strength) => {
    if (strength <= 1) return "ضعيف";
    if (strength <= 2) return "متوسط";
    if (strength <= 3) return "جيد";
    if (strength <= 4) return "قوي";
    return "ممتاز";
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsLoading(true);
    setErrors({});

    try {
      const response = await userService.createUser(formData);

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

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-4xl font-bold text-gray-900 mb-2">
                إضافة موظف جديد
              </h1>
              <p className="text-gray-600 text-lg">
                إنشاء حساب جديد لموظف في النظام
              </p>
            </div>
            <BackButton variant="outline" size="lg" />
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
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* اسم المستخدم */}
                  <EnhancedInput
                    label="اسم المستخدم"
                    name="username"
                    value={formData.username}
                    onChange={handleChange}
                    placeholder="أدخل اسم المستخدم"
                    required
                    error={errors.username}
                    icon={<User className="w-4 h-4" />}
                  />

                  {/* البريد الإلكتروني */}
                  <EnhancedInput
                    label="البريد الإلكتروني"
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="أدخل البريد الإلكتروني"
                    required
                    error={errors.email}
                    icon={<Mail className="w-4 h-4" />}
                  />

                  {/* الاسم الكامل */}
                  <EnhancedInput
                    label="الاسم الكامل"
                    name="full_name"
                    value={formData.full_name}
                    onChange={handleChange}
                    placeholder="أدخل الاسم الكامل"
                    required
                    error={errors.full_name}
                    icon={<User className="w-4 h-4" />}
                  />

                  {/* رقم الهاتف */}
                  <EnhancedInput
                    label="رقم الهاتف"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    placeholder="أدخل رقم الهاتف"
                    error={errors.phone}
                    icon={<Phone className="w-4 h-4" />}
                  />

                  {/* كلمة المرور */}
                  <div className="space-y-2">
                    <EnhancedInput
                      label="كلمة المرور"
                      name="password"
                      type={showPassword ? "text" : "password"}
                      value={formData.password}
                      onChange={handleChange}
                      placeholder="أدخل كلمة المرور"
                      required
                      error={errors.password}
                      icon={<Lock className="w-4 h-4" />}
                    />
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="text-gray-500 hover:text-gray-700 transition-colors"
                      >
                        {showPassword ? (
                          <EyeOff className="w-4 h-4" />
                        ) : (
                          <Eye className="w-4 h-4" />
                        )}
                      </button>
                      {formData.password && (
                        <div className="flex items-center gap-2 text-sm">
                          <span className="text-gray-500">
                            قوة كلمة المرور:
                          </span>
                          <span
                            className={`font-medium ${getPasswordStrengthColor(
                              getPasswordStrength(formData.password)
                            )}`}
                          >
                            {getPasswordStrengthText(
                              getPasswordStrength(formData.password)
                            )}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* تأكيد كلمة المرور */}
                  <div className="space-y-2">
                    <EnhancedInput
                      label="تأكيد كلمة المرور"
                      name="confirmPassword"
                      type={showConfirmPassword ? "text" : "password"}
                      value={formData.confirmPassword}
                      onChange={handleChange}
                      placeholder="أعد إدخال كلمة المرور"
                      required
                      error={errors.confirmPassword}
                      icon={<Lock className="w-4 h-4" />}
                    />
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() =>
                          setShowConfirmPassword(!showConfirmPassword)
                        }
                        className="text-gray-500 hover:text-gray-700 transition-colors"
                      >
                        {showConfirmPassword ? (
                          <EyeOff className="w-4 h-4" />
                        ) : (
                          <Eye className="w-4 h-4" />
                        )}
                      </button>
                    </div>
                  </div>
                </div>

                {/* اختيار الدور */}
                <div className="space-y-4">
                  <label className="block text-sm font-medium text-gray-700">
                    الدور <span className="text-red-500">*</span>
                  </label>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {roles.map((role) => (
                      <motion.div
                        key={role.value}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                      >
                        <input
                          type="radio"
                          id={role.value}
                          name="role"
                          value={role.value}
                          checked={formData.role === role.value}
                          onChange={handleChange}
                          className="sr-only"
                        />
                        <label
                          htmlFor={role.value}
                          className={`block p-4 border-2 rounded-xl cursor-pointer transition-all duration-200 ${
                            formData.role === role.value
                              ? `border-blue-500 bg-gradient-to-r ${role.color} text-white shadow-lg`
                              : "border-gray-200 bg-white hover:border-gray-300 hover:shadow-md"
                          }`}
                        >
                          <div className="flex items-center gap-3">
                            <div
                              className={`p-2 rounded-lg ${
                                formData.role === role.value
                                  ? "bg-white/20"
                                  : "bg-gray-100"
                              }`}
                            >
                              {role.icon}
                            </div>
                            <div>
                              <div className="font-semibold">{role.label}</div>
                              <div
                                className={`text-sm ${
                                  formData.role === role.value
                                    ? "text-white/80"
                                    : "text-gray-500"
                                }`}
                              >
                                {role.description}
                              </div>
                            </div>
                          </div>
                        </label>
                      </motion.div>
                    ))}
                  </div>
                  {errors.role && (
                    <div className="text-sm text-red-600 flex items-center gap-1">
                      <span>⚠</span>
                      <span>{errors.role}</span>
                    </div>
                  )}
                </div>

                {/* أزرار الإجراءات */}
                <div className="flex gap-4 pt-6 border-t border-gray-200">
                  <EnhancedButton
                    type="submit"
                    variant="primary"
                    size="lg"
                    loading={isLoading}
                    icon={<Save className="w-5 h-5" />}
                    fullWidth
                  >
                    {isLoading ? "جاري الإنشاء..." : "إنشاء الموظف"}
                  </EnhancedButton>
                  <EnhancedButton
                    type="button"
                    variant="secondary"
                    size="lg"
                    onClick={() => navigate("/users")}
                    fullWidth
                  >
                    إلغاء
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
