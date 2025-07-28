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
  MapPin,
  Calendar,
  DollarSign,
  FileText,
  UserCheck,
  Car,
  AlertTriangle,
  Briefcase,
  Building,
  IdCard,
  Clock,
  Settings,
  Star,
  Euro,
  Hash,
  Globe,
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

    // Personal information
    address: "",
    hired_date: "",
    salary: "",

    // Contact information
    emergency_contact_name: "",
    emergency_contact_phone: "",
    emergency_contact_relation: "",

    // Distributor specific
    license_number: "",
    vehicle_id: "",
    work_status: "available",

    // New enhanced fields
    employee_id: "",
    department: "",
    position_level: "",
    contract_type: "full_time",
    benefits: "",
    notes: "",
    nationality: "",
    date_of_birth: "",
    marital_status: "",
    education_level: "",
    languages: "",
    certifications: "",

    // Admin specific
    access_level: "standard",
    admin_notes: "",

    // System preferences
    preferred_language: "ar",
    timezone: "Europe/Brussels",
    notification_preferences: {
      email: true,
      sms: false,
      push: true,
    },
  });

  const [availableVehicles, setAvailableVehicles] = useState([]);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);

  // Enhanced role definitions with more details
  const roles = [
    {
      value: "admin",
      label: "مدير النظام",
      description: "صلاحيات كاملة على النظام والإعدادات",
      icon: <Shield className="w-5 h-5" />,
      color: "from-purple-500 to-purple-600",
      permissions: ["full_access", "user_management", "system_settings"],
    },
    {
      value: "manager",
      label: "مدير",
      description: "إدارة المخبز والموظفين والعمليات",
      icon: <Users className="w-5 h-5" />,
      color: "from-blue-500 to-blue-600",
      permissions: ["staff_management", "operations", "reports"],
    },
    {
      value: "distributor",
      label: "موزع",
      description: "توزيع المنتجات والتوصيل للمتاجر",
      icon: <Truck className="w-5 h-5" />,
      color: "from-green-500 to-green-600",
      permissions: ["delivery", "route_management", "inventory_check"],
    },
    {
      value: "cashier",
      label: "كاشير",
      description: "المبيعات ومعالجة المدفوعات",
      icon: <CreditCard className="w-5 h-5" />,
      color: "from-yellow-500 to-yellow-600",
      permissions: ["sales", "payment_processing", "customer_service"],
    },
    {
      value: "accountant",
      label: "محاسب",
      description: "إدارة الحسابات والتقارير المالية",
      icon: <Calculator className="w-5 h-5" />,
      color: "from-gray-500 to-gray-600",
      permissions: ["financial_reports", "accounting", "expense_tracking"],
    },
  ];

  const contractTypes = [
    { value: "full_time", label: "دوام كامل" },
    { value: "part_time", label: "دوام جزئي" },
    { value: "contract", label: "عقد مؤقت" },
    { value: "internship", label: "متدرب" },
    { value: "freelance", label: "مستقل" },
  ];

  const educationLevels = [
    { value: "high_school", label: "ثانوية عامة" },
    { value: "diploma", label: "دبلوم" },
    { value: "bachelor", label: "بكالوريوس" },
    { value: "master", label: "ماجستير" },
    { value: "phd", label: "دكتوراه" },
  ];

  const maritalStatuses = [
    { value: "single", label: "أعزب" },
    { value: "married", label: "متزوج" },
    { value: "divorced", label: "مطلق" },
    { value: "widowed", label: "أرمل" },
  ];

  const accessLevels = [
    { value: "standard", label: "عادي" },
    { value: "elevated", label: "مرتفع" },
    { value: "admin", label: "إداري" },
    { value: "super_admin", label: "مدير عام" },
  ];

  // Load available vehicles when role is distributor
  React.useEffect(() => {
    if (formData.role === "distributor") {
      loadAvailableVehicles();
    }
  }, [formData.role]);

  const loadAvailableVehicles = async () => {
    try {
      const response = await vehicleService.getAvailableVehicles();
      if (response.success) {
        setAvailableVehicles(response.data);
      }
    } catch (error) {
      console.error("Error loading available vehicles:", error);
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

  const handleNotificationChange = (type, checked) => {
    setFormData((prev) => ({
      ...prev,
      notification_preferences: {
        ...prev.notification_preferences,
        [type]: checked,
      },
    }));
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

    if (
      formData.date_of_birth &&
      new Date(formData.date_of_birth) > new Date()
    ) {
      newErrors.date_of_birth = "تاريخ الميلاد لا يمكن أن يكون في المستقبل";
    }

    // Role-specific validations
    if (formData.role === "distributor") {
      if (formData.license_number && formData.license_number.length < 3) {
        newErrors.license_number = "رقم الرخصة يجب أن يكون 3 أحرف على الأقل";
      }
    }

    if (
      formData.emergency_contact_phone &&
      !/^\+?[\d\s\-\(\)]+$/.test(formData.emergency_contact_phone)
    ) {
      newErrors.emergency_contact_phone =
        "رقم هاتف جهة الاتصال للطوارئ غير صحيح";
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

  const steps = [
    {
      id: 1,
      title: "المعلومات الأساسية",
      description: "البيانات الشخصية الأساسية",
    },
    {
      id: 2,
      title: "معلومات الوظيفة",
      description: "التفاصيل المهنية والراتب",
    },
    { id: 3, title: "معلومات إضافية", description: "التعليم والاتصال للطوارئ" },
    { id: 4, title: "إعدادات النظام", description: "التفضيلات والصلاحيات" },
  ];

  const handleStepChange = (stepNumber) => {
    if (stepNumber < currentStep || validateCurrentStep()) {
      setCurrentStep(stepNumber);
    }
  };

  const validateCurrentStep = () => {
    const currentStepErrors = {};

    if (currentStep === 1) {
      // Validate basic information
      if (!formData.username.trim())
        currentStepErrors.username = "اسم المستخدم مطلوب";
      if (!formData.email.trim())
        currentStepErrors.email = "البريد الإلكتروني مطلوب";
      if (!formData.full_name.trim())
        currentStepErrors.full_name = "الاسم الكامل مطلوب";
      if (!formData.password) currentStepErrors.password = "كلمة المرور مطلوبة";
      if (!formData.confirmPassword)
        currentStepErrors.confirmPassword = "تأكيد كلمة المرور مطلوب";
    } else if (currentStep === 2) {
      // Validate job information
      if (!formData.role) currentStepErrors.role = "الدور مطلوب";
    }

    setErrors(currentStepErrors);
    return Object.keys(currentStepErrors).length === 0;
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
        // Format emergency contact as JSON
        emergency_contact: formData.emergency_contact_name
          ? {
              name: formData.emergency_contact_name,
              phone: formData.emergency_contact_phone,
              relation: formData.emergency_contact_relation,
            }
          : null,
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
        emergency_contact_name: undefined,
        emergency_contact_phone: undefined,
        emergency_contact_relation: undefined,
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

  const renderStepIndicator = () => (
    <div className="flex items-center justify-center mb-8">
      {steps.map((step, index) => (
        <div key={step.id} className="flex items-center">
          <div className="flex flex-col items-center">
            <div
              className={`w-10 h-10 rounded-full flex items-center justify-center cursor-pointer transition-all duration-300 ${
                currentStep >= step.id
                  ? "bg-blue-600 text-white"
                  : "bg-gray-200 text-gray-600 hover:bg-gray-300"
              }`}
              onClick={() => handleStepChange(step.id)}
            >
              {step.id}
            </div>
            <div className="text-center mt-2">
              <div
                className={`text-sm font-medium ${
                  currentStep >= step.id ? "text-blue-600" : "text-gray-500"
                }`}
              >
                {step.title}
              </div>
              <div className="text-xs text-gray-400 mt-1">
                {step.description}
              </div>
            </div>
          </div>
          {index < steps.length - 1 && (
            <div
              className={`w-12 h-0.5 mx-4 ${
                currentStep > step.id ? "bg-blue-600" : "bg-gray-200"
              }`}
            />
          )}
        </div>
      ))}
    </div>
  );

  const renderBasicInformation = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Username */}
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

        {/* Email */}
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

        {/* Full Name */}
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

        {/* Phone */}
        <EnhancedInput
          label="رقم الهاتف"
          name="phone"
          value={formData.phone}
          onChange={handleChange}
          placeholder="أدخل رقم الهاتف"
          error={errors.phone}
          icon={<Phone className="w-4 h-4" />}
        />

        {/* Employee ID */}
        <EnhancedInput
          label="رقم الموظف"
          name="employee_id"
          value={formData.employee_id}
          onChange={handleChange}
          placeholder="أدخل رقم الموظف"
          error={errors.employee_id}
          icon={<IdCard className="w-4 h-4" />}
        />

        {/* Date of Birth */}
        <EnhancedInput
          label="تاريخ الميلاد"
          name="date_of_birth"
          type="date"
          value={formData.date_of_birth}
          onChange={handleChange}
          error={errors.date_of_birth}
          icon={<Calendar className="w-4 h-4" />}
        />

        {/* Nationality */}
        <EnhancedInput
          label="الجنسية"
          name="nationality"
          value={formData.nationality}
          onChange={handleChange}
          placeholder="أدخل الجنسية"
          error={errors.nationality}
          icon={<Globe className="w-4 h-4" />}
        />

        {/* Marital Status */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            الحالة الاجتماعية
          </label>
          <select
            name="marital_status"
            value={formData.marital_status}
            onChange={handleChange}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="">اختر الحالة الاجتماعية</option>
            {maritalStatuses.map((status) => (
              <option key={status.value} value={status.value}>
                {status.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Password Section */}
      <div className="bg-gray-50 p-6 rounded-xl border border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <Lock className="w-5 h-5" />
          إعدادات كلمة المرور
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Password */}
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
                  <span className="text-gray-500">قوة كلمة المرور:</span>
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

          {/* Confirm Password */}
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
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
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
      </div>
    </div>
  );

  const renderJobInformation = () => (
    <div className="space-y-6">
      {/* Role Selection */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-4">
          اختر الدور الوظيفي
        </label>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {roles.map((role) => (
            <div
              key={role.value}
              className={`relative cursor-pointer rounded-xl border-2 p-4 transition-all duration-300 ${
                formData.role === role.value
                  ? "border-blue-500 bg-blue-50"
                  : "border-gray-200 bg-white hover:border-gray-300"
              }`}
              onClick={() =>
                handleChange({ target: { name: "role", value: role.value } })
              }
            >
              <div
                className={`inline-flex p-3 rounded-lg bg-gradient-to-r ${role.color} text-white mb-3`}
              >
                {role.icon}
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                {role.label}
              </h3>
              <p className="text-sm text-gray-600 mb-3">{role.description}</p>
              <div className="flex flex-wrap gap-1">
                {role.permissions.map((permission, index) => (
                  <span
                    key={index}
                    className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800"
                  >
                    {permission}
                  </span>
                ))}
              </div>
              {formData.role === role.value && (
                <div className="absolute top-2 right-2">
                  <CheckCircle className="w-6 h-6 text-blue-500" />
                </div>
              )}
            </div>
          ))}
        </div>
        {errors.role && (
          <p className="text-red-500 text-sm mt-2">{errors.role}</p>
        )}
      </div>

      {/* Job Details */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <EnhancedInput
          label="القسم"
          name="department"
          value={formData.department}
          onChange={handleChange}
          placeholder="أدخل القسم"
          error={errors.department}
          icon={<Building className="w-4 h-4" />}
        />

        <EnhancedInput
          label="المستوى الوظيفي"
          name="position_level"
          value={formData.position_level}
          onChange={handleChange}
          placeholder="أدخل المستوى الوظيفي"
          error={errors.position_level}
          icon={<Star className="w-4 h-4" />}
        />

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            نوع العقد
          </label>
          <select
            name="contract_type"
            value={formData.contract_type}
            onChange={handleChange}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            {contractTypes.map((type) => (
              <option key={type.value} value={type.value}>
                {type.label}
              </option>
            ))}
          </select>
        </div>

        <EnhancedInput
          label="تاريخ التوظيف"
          name="hired_date"
          type="date"
          value={formData.hired_date}
          onChange={handleChange}
          error={errors.hired_date}
          icon={<Calendar className="w-4 h-4" />}
        />

        <EnhancedInput
          label="الراتب الشهري (€)"
          name="salary"
          type="number"
          value={formData.salary}
          onChange={handleChange}
          placeholder="أدخل الراتب الشهري"
          error={errors.salary}
          icon={<Euro className="w-4 h-4" />}
        />

        <EnhancedInput
          label="العنوان"
          name="address"
          value={formData.address}
          onChange={handleChange}
          placeholder="أدخل العنوان"
          error={errors.address}
          icon={<MapPin className="w-4 h-4" />}
        />
      </div>

      {/* Role-specific sections */}
      {formData.role === "distributor" && (
        <div className="bg-blue-50 p-6 rounded-xl border border-blue-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <Truck className="w-5 h-5" />
            معلومات الموزع
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <EnhancedInput
              label="رقم رخصة القيادة"
              name="license_number"
              value={formData.license_number}
              onChange={handleChange}
              placeholder="أدخل رقم رخصة القيادة"
              error={errors.license_number}
              icon={<FileText className="w-4 h-4" />}
            />
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                حالة العمل
              </label>
              <select
                name="work_status"
                value={formData.work_status}
                onChange={handleChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="available">متاح</option>
                <option value="busy">مشغول</option>
                <option value="offline">غير متصل</option>
                <option value="break">في استراحة</option>
              </select>
            </div>
          </div>

          {/* Vehicle Assignment */}
          {availableVehicles.length > 0 && (
            <div className="mt-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                تعيين مركبة
              </label>
              <select
                name="vehicle_id"
                value={formData.vehicle_id}
                onChange={handleChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">اختر مركبة متاحة...</option>
                {availableVehicles.map((vehicle) => (
                  <option key={vehicle.id} value={vehicle.id}>
                    {vehicle.vehicle_model} ({vehicle.vehicle_plate}) -{" "}
                    {vehicle.vehicle_type}
                  </option>
                ))}
              </select>
            </div>
          )}
        </div>
      )}

      {["admin", "manager"].includes(formData.role) && (
        <div className="bg-purple-50 p-6 rounded-xl border border-purple-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <Shield className="w-5 h-5" />
            إعدادات الإدارة
          </h3>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              مستوى الوصول
            </label>
            <select
              name="access_level"
              value={formData.access_level}
              onChange={handleChange}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              {accessLevels.map((level) => (
                <option key={level.value} value={level.value}>
                  {level.label}
                </option>
              ))}
            </select>
          </div>
        </div>
      )}
    </div>
  );

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
                {renderStepIndicator()}
                <div className="space-y-6">
                  {currentStep === 1 && renderBasicInformation()}
                  {currentStep === 2 && renderJobInformation()}
                  {/* Add more steps here as needed */}
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
