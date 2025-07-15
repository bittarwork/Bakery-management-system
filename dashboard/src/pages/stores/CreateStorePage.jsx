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
    region: "",
    address: "",
    contact_person: "",
    phone: "",
    email: "",
    payment_method: "cash",
    credit_limit: "",
    notes: "",
    status: "active",
  });
  const [selectedLocation, setSelectedLocation] = useState(null);
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const regions = [
    {
      value: "north",
      label: "الشمال",
      description: "المنطقة الشمالية",
      icon: <Navigation className="w-5 h-5" />,
      color: "from-blue-500 to-blue-600",
    },
    {
      value: "south",
      label: "الجنوب",
      description: "المنطقة الجنوبية",
      icon: <Navigation className="w-5 h-5" />,
      color: "from-green-500 to-green-600",
    },
    {
      value: "east",
      label: "الشرق",
      description: "المنطقة الشرقية",
      icon: <Navigation className="w-5 h-5" />,
      color: "from-yellow-500 to-yellow-600",
    },
    {
      value: "west",
      label: "الغرب",
      description: "المنطقة الغربية",
      icon: <Navigation className="w-5 h-5" />,
      color: "from-purple-500 to-purple-600",
    },
    {
      value: "central",
      label: "الوسط",
      description: "المنطقة الوسطى",
      icon: <Navigation className="w-5 h-5" />,
      color: "from-red-500 to-red-600",
    },
  ];

  const paymentMethods = [
    {
      value: "cash",
      label: "نقداً",
      description: "الدفع النقدي",
      icon: <Euro className="w-5 h-5" />,
      color: "from-green-500 to-green-600",
    },
    {
      value: "bank",
      label: "تحويل بنكي",
      description: "الدفع عبر البنك",
      icon: <CreditCard className="w-5 h-5" />,
      color: "from-blue-500 to-blue-600",
    },
    {
      value: "mixed",
      label: "مختلط",
      description: "نقداً وتحويل بنكي",
      icon: <Building className="w-5 h-5" />,
      color: "from-purple-500 to-purple-600",
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

    // التحقق من الحد الائتماني
    if (formData.credit_limit && parseFloat(formData.credit_limit) < 0) {
      newErrors.credit_limit = "الحد الائتماني يجب أن يكون رقم موجب";
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
        latitude: selectedLocation?.lat,
        longitude: selectedLocation?.lng,
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

                  {/* المنطقة */}
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-700">
                      المنطقة
                    </label>
                    <select
                      name="region"
                      value={formData.region}
                      onChange={handleChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                    >
                      <option value="">اختر المنطقة</option>
                      {regions.map((region) => (
                        <option key={region.value} value={region.value}>
                          {region.label}
                        </option>
                      ))}
                    </select>
                  </div>

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

                  {/* الشخص المسؤول */}
                  <EnhancedInput
                    label="الشخص المسؤول"
                    name="contact_person"
                    value={formData.contact_person}
                    onChange={handleChange}
                    placeholder="أدخل اسم الشخص المسؤول"
                    error={errors.contact_person}
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

                  {/* الحد الائتماني */}
                  <EnhancedInput
                    label="الحد الائتماني (€)"
                    name="credit_limit"
                    type="number"
                    value={formData.credit_limit}
                    onChange={handleChange}
                    placeholder="0.00"
                    error={errors.credit_limit}
                    icon={<Euro className="w-4 h-4" />}
                    min="0"
                    step="0.01"
                  />
                </div>

                {/* الملاحظات */}
                <div className="mt-6">
                  <EnhancedInput
                    label="ملاحظات إضافية"
                    name="notes"
                    value={formData.notes}
                    onChange={handleChange}
                    placeholder="أدخل أي ملاحظات إضافية حول المحل..."
                    icon={<FileText className="w-4 h-4" />}
                    multiline
                    rows={3}
                  />
                </div>
              </CardBody>
            </Card>
          </motion.div>

          {/* طريقة الدفع */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <Card className="border-0 shadow-lg">
              <CardHeader className="border-b border-gray-200 bg-gradient-to-r from-gray-50 to-white">
                <h2 className="text-xl font-semibold text-gray-900 flex items-center">
                  <CreditCard className="w-5 h-5 ml-2" />
                  طريقة الدفع
                </h2>
              </CardHeader>
              <CardBody className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {paymentMethods.map((method) => (
                    <motion.div
                      key={method.value}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <input
                        type="radio"
                        id={method.value}
                        name="payment_method"
                        value={method.value}
                        checked={formData.payment_method === method.value}
                        onChange={handleChange}
                        className="sr-only"
                      />
                      <label
                        htmlFor={method.value}
                        className={`block p-4 border-2 rounded-xl cursor-pointer transition-all duration-200 ${
                          formData.payment_method === method.value
                            ? `border-blue-500 bg-gradient-to-r ${method.color} text-white shadow-lg`
                            : "border-gray-200 bg-white hover:border-gray-300 hover:shadow-md"
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <div
                            className={`p-2 rounded-lg ${
                              formData.payment_method === method.value
                                ? "bg-white/20"
                                : "bg-gray-100"
                            }`}
                          >
                            {method.icon}
                          </div>
                          <div>
                            <div className="font-semibold">{method.label}</div>
                            <div
                              className={`text-sm ${
                                formData.payment_method === method.value
                                  ? "text-white/80"
                                  : "text-gray-500"
                              }`}
                            >
                              {method.description}
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
            transition={{ delay: 0.3 }}
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
            transition={{ delay: 0.4 }}
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
