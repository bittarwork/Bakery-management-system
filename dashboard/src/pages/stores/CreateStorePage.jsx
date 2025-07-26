import React, { useState } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import {
  Store,
  MapPin,
  Phone,
  Mail,
  User,
  CreditCard,
  Globe,
  Save,
  AlertCircle,
  CheckCircle,
  Loader2,
  Euro,
  Building,
  Navigation,
  FileText,
  Clock,
  ShoppingCart,
  Target,
  Percent,
  Calendar,
  Users,
} from "lucide-react";
import { Card, CardHeader, CardBody } from "../../components/ui/Card";
import EnhancedButton from "../../components/ui/EnhancedButton";
import EnhancedInput from "../../components/ui/EnhancedInput";
import BackButton from "../../components/ui/BackButton";
import StoreMap from "../../components/ui/StoreMap";
import storeService from "../../services/storeService";
import { AnimatePresence } from "framer-motion";

const CreateStorePage = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: "",
    owner_name: "",
    address: "",
    phone: "",
    email: "",
    store_type: "retail",
    category: "grocery",
    size_category: "small",
    credit_limit_eur: "",
    credit_limit_syp: "",
    commission_rate: "",
    payment_terms: "cash",
    preferred_delivery_time: "",
    special_instructions: "",
    status: "active",
    // Opening hours
    opening_hours: {
      monday: "08:00-20:00",
      tuesday: "08:00-20:00",
      wednesday: "08:00-20:00",
      thursday: "08:00-20:00",
      friday: "08:00-20:00",
      saturday: "08:00-20:00",
      sunday: "closed",
    },
  });
  const [selectedLocation, setSelectedLocation] = useState(null);
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const storeTypes = [
    {
      value: "retail",
      label: "تجارة تجزئة",
      description: "مبيعات للمستهلكين",
      icon: <ShoppingCart className="w-5 h-5" />,
    },
    {
      value: "wholesale",
      label: "تجارة جملة",
      description: "مبيعات بالجملة",
      icon: <Building className="w-5 h-5" />,
    },
    {
      value: "restaurant",
      label: "مطعم",
      description: "خدمات الطعام",
      icon: <Store className="w-5 h-5" />,
    },
  ];

  const storeCategories = [
    { value: "supermarket", label: "سوبر ماركت" },
    { value: "grocery", label: "بقالة" },
    { value: "cafe", label: "مقهى" },
    { value: "restaurant", label: "مطعم" },
    { value: "bakery", label: "مخبز" },
    { value: "hotel", label: "فندق" },
    { value: "other", label: "أخرى" },
  ];

  const sizeCategories = [
    { value: "small", label: "صغير", description: "أقل من 50 متر مربع" },
    { value: "medium", label: "متوسط", description: "50-200 متر مربع" },
    { value: "large", label: "كبير", description: "200-500 متر مربع" },
    {
      value: "enterprise",
      label: "مؤسسة",
      description: "أكثر من 500 متر مربع",
    },
  ];

  const paymentTerms = [
    {
      value: "cash",
      label: "نقداً",
      description: "الدفع فوري نقداً",
      icon: <Euro className="w-5 h-5" />,
      color: "from-green-500 to-green-600",
    },
    {
      value: "credit_7_days",
      label: "ائتمان 7 أيام",
      description: "الدفع خلال أسبوع",
      icon: <Calendar className="w-5 h-5" />,
      color: "from-blue-500 to-blue-600",
    },
    {
      value: "credit_15_days",
      label: "ائتمان 15 يوم",
      description: "الدفع خلال أسبوعين",
      icon: <Calendar className="w-5 h-5" />,
      color: "from-yellow-500 to-yellow-600",
    },
    {
      value: "credit_30_days",
      label: "ائتمان 30 يوم",
      description: "الدفع خلال شهر",
      icon: <Calendar className="w-5 h-5" />,
      color: "from-red-500 to-red-600",
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

  const handleOpeningHoursChange = (day, value) => {
    setFormData((prev) => ({
      ...prev,
      opening_hours: {
        ...prev.opening_hours,
        [day]: value,
      },
    }));
  };

  const validateForm = () => {
    const newErrors = {};

    // التحقق من اسم المحل
    if (!formData.name.trim()) {
      newErrors.name = "اسم المحل مطلوب";
    } else if (formData.name.length < 2) {
      newErrors.name = "اسم المحل يجب أن يكون حرفين على الأقل";
    }

    // التحقق من العنوان
    if (!formData.address.trim()) {
      newErrors.address = "عنوان المحل مطلوب";
    } else if (formData.address.length < 10) {
      newErrors.address = "العنوان يجب أن يكون 10 أحرف على الأقل";
    }

    // التحقق من رقم الهاتف
    if (formData.phone && !/^\+?[\d\s\-\(\)]+$/.test(formData.phone)) {
      newErrors.phone = "رقم الهاتف غير صحيح";
    }

    // التحقق من البريد الإلكتروني
    if (formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = "البريد الإلكتروني غير صحيح";
    }

    // التحقق من الحد الائتماني باليورو
    if (
      formData.credit_limit_eur &&
      (isNaN(formData.credit_limit_eur) ||
        parseFloat(formData.credit_limit_eur) < 0)
    ) {
      newErrors.credit_limit_eur =
        "الحد الائتماني باليورو يجب أن يكون رقم موجب";
    }

    // التحقق من الحد الائتماني بالليرة السورية
    if (
      formData.credit_limit_syp &&
      (isNaN(formData.credit_limit_syp) ||
        parseFloat(formData.credit_limit_syp) < 0)
    ) {
      newErrors.credit_limit_syp =
        "الحد الائتماني بالليرة السورية يجب أن يكون رقم موجب";
    }

    // التحقق من معدل العمولة
    if (
      formData.commission_rate &&
      (isNaN(formData.commission_rate) ||
        parseFloat(formData.commission_rate) < 0 ||
        parseFloat(formData.commission_rate) > 100)
    ) {
      newErrors.commission_rate = "معدل العمولة يجب أن يكون بين 0 و 100";
    }

    // التحقق من الموقع
    if (!selectedLocation) {
      newErrors.location = "يجب اختيار موقع المحل على الخريطة";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleLocationSelect = (location) => {
    setSelectedLocation(location);
    setErrors((prev) => ({ ...prev, location: "" }));
  };

  const clearLocation = () => {
    setSelectedLocation(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsLoading(true);
    setErrors({});

    try {
      const storeData = {
        ...formData,
        gps_coordinates: selectedLocation
          ? {
              latitude: selectedLocation.lat,
              longitude: selectedLocation.lng,
              name: selectedLocation.name || null,
            }
          : null,
        // Convert numeric fields
        credit_limit_eur: formData.credit_limit_eur
          ? parseFloat(formData.credit_limit_eur)
          : 0,
        credit_limit_syp: formData.credit_limit_syp
          ? parseFloat(formData.credit_limit_syp)
          : 0,
        commission_rate: formData.commission_rate
          ? parseFloat(formData.commission_rate)
          : 0,
      };

      const response = await storeService.createStore(storeData);

      if (response.success) {
        setIsSuccess(true);
        setTimeout(() => {
          navigate("/stores");
        }, 2000);
      } else {
        setErrors({ submit: response.message });
      }
    } catch (error) {
      console.error("Error creating store:", error);
      if (error.response?.data?.errors) {
        setErrors(error.response.data.errors);
      } else {
        setErrors({ submit: "خطأ في إنشاء المحل. يرجى المحاولة مرة أخرى." });
      }
    } finally {
      setIsLoading(false);
    }
  };

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
                إضافة محل جديد
              </h1>
              <p className="text-gray-600 text-lg">إنشاء محل جديد في النظام</p>
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
                  تم إنشاء المحل بنجاح! جاري التوجيه...
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

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* معلومات المحل الأساسية */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <Card className="border-0 shadow-lg">
              <CardHeader className="border-b border-gray-200 bg-gradient-to-r from-gray-50 to-white">
                <h2 className="text-xl font-semibold text-gray-900 flex items-center">
                  <Store className="w-5 h-5 ml-2" />
                  معلومات المحل الأساسية
                </h2>
              </CardHeader>
              <CardBody className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* اسم المحل */}
                  <EnhancedInput
                    label="اسم المحل"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    placeholder="أدخل اسم المحل"
                    required
                    error={errors.name}
                    icon={<Store className="w-4 h-4" />}
                  />

                  {/* اسم المالك */}
                  <EnhancedInput
                    label="اسم المالك"
                    name="owner_name"
                    value={formData.owner_name}
                    onChange={handleChange}
                    placeholder="أدخل اسم مالك المحل"
                    error={errors.owner_name}
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

                  {/* البريد الإلكتروني */}
                  <EnhancedInput
                    label="البريد الإلكتروني"
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="أدخل البريد الإلكتروني"
                    error={errors.email}
                    icon={<Mail className="w-4 h-4" />}
                  />

                  {/* العنوان */}
                  <div className="md:col-span-2">
                    <EnhancedInput
                      label="عنوان المحل"
                      name="address"
                      value={formData.address}
                      onChange={handleChange}
                      placeholder="أدخل العنوان الكامل للمحل"
                      required
                      error={errors.address}
                      icon={<MapPin className="w-4 h-4" />}
                      multiline
                      rows={3}
                    />
                  </div>

                  {/* نوع المحل */}
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-700">
                      نوع المحل <span className="text-red-500">*</span>
                    </label>
                    <select
                      name="store_type"
                      value={formData.store_type}
                      onChange={handleChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                    >
                      {storeTypes.map((type) => (
                        <option key={type.value} value={type.value}>
                          {type.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* فئة المحل */}
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-700">
                      فئة المحل <span className="text-red-500">*</span>
                    </label>
                    <select
                      name="category"
                      value={formData.category}
                      onChange={handleChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                    >
                      {storeCategories.map((category) => (
                        <option key={category.value} value={category.value}>
                          {category.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* حجم المحل */}
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-700">
                      حجم المحل <span className="text-red-500">*</span>
                    </label>
                    <select
                      name="size_category"
                      value={formData.size_category}
                      onChange={handleChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                    >
                      {sizeCategories.map((size) => (
                        <option key={size.value} value={size.value}>
                          {size.label} - {size.description}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* وقت التسليم المفضل */}
                  <EnhancedInput
                    label="وقت التسليم المفضل"
                    name="preferred_delivery_time"
                    value={formData.preferred_delivery_time}
                    onChange={handleChange}
                    placeholder="مثل: صباحاً من 8-10، مساءً من 5-7"
                    error={errors.preferred_delivery_time}
                    icon={<Clock className="w-4 h-4" />}
                  />
                </div>

                {/* التعليمات الخاصة */}
                <div className="mt-6">
                  <EnhancedInput
                    label="تعليمات خاصة"
                    name="special_instructions"
                    value={formData.special_instructions}
                    onChange={handleChange}
                    placeholder="أدخل أي تعليمات خاصة للتوصيل أو التعامل مع المحل..."
                    icon={<FileText className="w-4 h-4" />}
                    multiline
                    rows={3}
                  />
                </div>
              </CardBody>
            </Card>
          </motion.div>

          {/* المعلومات المالية */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <Card className="border-0 shadow-lg">
              <CardHeader className="border-b border-gray-200 bg-gradient-to-r from-blue-50 to-white">
                <h2 className="text-xl font-semibold text-gray-900 flex items-center">
                  <Euro className="w-5 h-5 ml-2" />
                  المعلومات المالية
                </h2>
              </CardHeader>
              <CardBody className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* الحد الائتماني باليورو */}
                  <EnhancedInput
                    label="الحد الائتماني (€)"
                    name="credit_limit_eur"
                    type="number"
                    value={formData.credit_limit_eur}
                    onChange={handleChange}
                    placeholder="0.00"
                    error={errors.credit_limit_eur}
                    icon={<Euro className="w-4 h-4" />}
                    min="0"
                    step="0.01"
                  />

                  {/* الحد الائتماني بالليرة السورية */}
                  <EnhancedInput
                    label="الحد الائتماني (ل.س)"
                    name="credit_limit_syp"
                    type="number"
                    value={formData.credit_limit_syp}
                    onChange={handleChange}
                    placeholder="0.00"
                    error={errors.credit_limit_syp}
                    icon={<CreditCard className="w-4 h-4" />}
                    min="0"
                    step="0.01"
                  />

                  {/* معدل العمولة */}
                  <EnhancedInput
                    label="معدل العمولة (%)"
                    name="commission_rate"
                    type="number"
                    value={formData.commission_rate}
                    onChange={handleChange}
                    placeholder="0.00"
                    error={errors.commission_rate}
                    icon={<Percent className="w-4 h-4" />}
                    min="0"
                    max="100"
                    step="0.01"
                  />
                </div>
              </CardBody>
            </Card>
          </motion.div>

          {/* ساعات العمل */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.25 }}
          >
            <Card className="border-0 shadow-lg">
              <CardHeader className="border-b border-gray-200 bg-gradient-to-r from-green-50 to-white">
                <h2 className="text-xl font-semibold text-gray-900 flex items-center">
                  <Clock className="w-5 h-5 ml-2" />
                  ساعات العمل
                </h2>
              </CardHeader>
              <CardBody className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {Object.entries(formData.opening_hours).map(
                    ([day, hours]) => (
                      <div key={day} className="space-y-2">
                        <label className="block text-sm font-medium text-gray-700">
                          {day === "monday"
                            ? "الاثنين"
                            : day === "tuesday"
                            ? "الثلاثاء"
                            : day === "wednesday"
                            ? "الأربعاء"
                            : day === "thursday"
                            ? "الخميس"
                            : day === "friday"
                            ? "الجمعة"
                            : day === "saturday"
                            ? "السبت"
                            : "الأحد"}
                        </label>
                        <select
                          value={hours}
                          onChange={(e) =>
                            handleOpeningHoursChange(day, e.target.value)
                          }
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                        >
                          <option value="closed">مغلق</option>
                          <option value="06:00-18:00">
                            6:00 صباحاً - 6:00 مساءً
                          </option>
                          <option value="07:00-19:00">
                            7:00 صباحاً - 7:00 مساءً
                          </option>
                          <option value="08:00-20:00">
                            8:00 صباحاً - 8:00 مساءً
                          </option>
                          <option value="09:00-21:00">
                            9:00 صباحاً - 9:00 مساءً
                          </option>
                          <option value="10:00-22:00">
                            10:00 صباحاً - 10:00 مساءً
                          </option>
                          <option value="24/7">24 ساعة</option>
                        </select>
                      </div>
                    )
                  )}
                </div>
              </CardBody>
            </Card>
          </motion.div>

          {/* شروط الدفع */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <Card className="border-0 shadow-lg">
              <CardHeader className="border-b border-gray-200 bg-gradient-to-r from-yellow-50 to-white">
                <h2 className="text-xl font-semibold text-gray-900 flex items-center">
                  <CreditCard className="w-5 h-5 ml-2" />
                  شروط الدفع
                </h2>
              </CardHeader>
              <CardBody className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  {paymentTerms.map((term) => (
                    <motion.div
                      key={term.value}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <input
                        type="radio"
                        id={term.value}
                        name="payment_terms"
                        value={term.value}
                        checked={formData.payment_terms === term.value}
                        onChange={handleChange}
                        className="sr-only"
                      />
                      <label
                        htmlFor={term.value}
                        className={`block p-4 border-2 rounded-xl cursor-pointer transition-all duration-200 ${
                          formData.payment_terms === term.value
                            ? `border-blue-500 bg-gradient-to-r ${term.color} text-white shadow-lg`
                            : "border-gray-200 bg-white hover:border-gray-300 hover:shadow-md"
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <div
                            className={`p-2 rounded-lg ${
                              formData.payment_terms === term.value
                                ? "bg-white/20"
                                : "bg-gray-100"
                            }`}
                          >
                            {term.icon}
                          </div>
                          <div>
                            <div className="font-semibold text-sm">
                              {term.label}
                            </div>
                            <div
                              className={`text-xs ${
                                formData.payment_terms === term.value
                                  ? "text-white/80"
                                  : "text-gray-500"
                              }`}
                            >
                              {term.description}
                            </div>
                          </div>
                        </div>
                      </label>
                    </motion.div>
                  ))}
                </div>
              </CardBody>
            </Card>
          </motion.div>

          {/* اختيار الموقع */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            <Card className="border-0 shadow-lg">
              <CardHeader className="border-b border-gray-200 bg-gradient-to-r from-gray-50 to-white">
                <h2 className="text-xl font-semibold text-gray-900 flex items-center">
                  <MapPin className="w-5 h-5 ml-2" />
                  موقع المحل
                </h2>
              </CardHeader>
              <CardBody className="p-6">
                {selectedLocation && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mb-4 p-4 bg-blue-50 border border-blue-200 rounded-xl"
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-blue-900">
                          الموقع المحدد
                        </p>
                        <p className="text-sm text-blue-700">
                          خط العرض: {selectedLocation.lat.toFixed(6)}, خط الطول:{" "}
                          {selectedLocation.lng.toFixed(6)}
                        </p>
                        {selectedLocation.name && (
                          <p className="text-sm text-blue-600">
                            {selectedLocation.name}
                          </p>
                        )}
                      </div>
                      <button
                        type="button"
                        onClick={clearLocation}
                        className="text-blue-600 hover:text-blue-800 transition-colors"
                      >
                        <AlertCircle className="w-4 h-4" />
                      </button>
                    </div>
                  </motion.div>
                )}

                <div className="mb-4">
                  <StoreMap
                    stores={[]}
                    onLocationSelect={handleLocationSelect}
                    selectedLocation={selectedLocation}
                    height="400px"
                    interactive={true}
                  />
                </div>

                <p className="text-sm text-gray-600">
                  انقر على الخريطة لاختيار موقع المحل، أو انقر على محل موجود
                  لاختيار موقعه.
                </p>

                {errors.location && (
                  <div className="mt-2 text-sm text-red-600 flex items-center gap-1">
                    <AlertCircle className="w-4 h-4" />
                    <span>{errors.location}</span>
                  </div>
                )}
              </CardBody>
            </Card>
          </motion.div>

          {/* أزرار الإجراءات */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="flex gap-4 pt-6"
          >
            <EnhancedButton
              type="submit"
              variant="primary"
              size="lg"
              loading={isLoading}
              icon={<Save className="w-5 h-5" />}
              fullWidth
            >
              {isLoading ? "جاري الإنشاء..." : "إنشاء المحل"}
            </EnhancedButton>
            <EnhancedButton
              type="button"
              variant="secondary"
              size="lg"
              onClick={() => navigate("/stores")}
              fullWidth
            >
              إلغاء
            </EnhancedButton>
          </motion.div>
        </form>
      </div>
    </div>
  );
};

export default CreateStorePage;
