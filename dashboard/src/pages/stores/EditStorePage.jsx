import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { motion } from "framer-motion";
import {
  Store,
  MapPin,
  Phone,
  Mail,
  User,
  CreditCard,
  Save,
  AlertCircle,
  CheckCircle,
  Loader2,
  Euro,
  Building,
  Navigation,
  FileText,
  Trash2,
  AlertTriangle,
  Edit3,
} from "lucide-react";
import { Card, CardHeader, CardBody } from "../../components/ui/Card";
import EnhancedButton from "../../components/ui/EnhancedButton";
import EnhancedInput from "../../components/ui/EnhancedInput";
import BackButton from "../../components/ui/BackButton";
import StoreMap from "../../components/ui/StoreMap";
import storeService from "../../services/storeService";
import { AnimatePresence } from "framer-motion";

const EditStorePage = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [errors, setErrors] = useState({});
  const [selectedLocation, setSelectedLocation] = useState(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

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

  // Load store data
  useEffect(() => {
    const loadStore = async () => {
      try {
        setIsLoading(true);
        const response = await storeService.getStore(id);
        const store = response.data;

        setFormData({
          name: store.name || "",
          region: store.region || "",
          address: store.address || "",
          contact_person: store.contact_person || "",
          phone: store.phone || "",
          email: store.email || "",
          payment_method: store.payment_method || "cash",
          // Load credit_limit_eur as credit_limit for the form
          credit_limit: store.credit_limit_eur || store.credit_limit || "",
          notes: store.notes || "",
          status: store.status || "active",
        });

        if (store.latitude && store.longitude) {
          setSelectedLocation({
            lat: parseFloat(store.latitude),
            lng: parseFloat(store.longitude),
            name: store.name,
          });
        }
      } catch (error) {
        console.error("Error loading store:", error);
        setErrors({ submit: "فشل في تحميل بيانات المحل" });
      } finally {
        setIsLoading(false);
      }
    };

    if (id) {
      loadStore();
    }
  }, [id]);

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

    setIsSaving(true);
    setErrors({});

    try {
      const storeData = {
        ...formData,
        latitude: selectedLocation?.lat,
        longitude: selectedLocation?.lng,
        // Convert credit_limit to number and send as credit_limit_eur
        credit_limit_eur: formData.credit_limit
          ? parseFloat(formData.credit_limit)
          : 0,
        // Remove the original credit_limit field to avoid confusion
        credit_limit: undefined,
      };

      const response = await storeService.updateStore(id, storeData);

      if (response.success) {
        setIsSuccess(true);
        setTimeout(() => {
          navigate("/stores");
        }, 2000);
      } else {
        setErrors({ submit: response.message });
      }
    } catch (error) {
      console.error("Error updating store:", error);
      if (error.response?.data?.errors) {
        setErrors(error.response.data.errors);
      } else {
        setErrors({ submit: "خطأ في تحديث المحل. يرجى المحاولة مرة أخرى." });
      }
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async () => {
    try {
      setIsDeleting(true);
      await storeService.deleteStore(id);
      setIsSuccess(true);
      setTimeout(() => {
        navigate("/stores");
      }, 2000);
    } catch (error) {
      console.error("Error deleting store:", error);
      setErrors({ submit: "خطأ في حذف المحل. يرجى المحاولة مرة أخرى." });
    } finally {
      setIsDeleting(false);
      setShowDeleteConfirm(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-blue-600 animate-spin mx-auto mb-4" />
          <p className="text-gray-600 text-lg">جاري تحميل بيانات المحل...</p>
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
                تعديل المحل
              </h1>
              <p className="text-gray-600 text-lg">
                تحديث معلومات المحل في النظام
              </p>
            </div>
            <div className="flex items-center gap-3">
              <EnhancedButton
                variant="danger"
                size="lg"
                icon={<Trash2 className="w-5 h-5" />}
                onClick={() => setShowDeleteConfirm(true)}
              >
                حذف المحل
              </EnhancedButton>
              <BackButton variant="outline" size="lg" />
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
                  تم تحديث المحل بنجاح! جاري التوجيه...
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

                  {/* الحالة */}
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-700">
                      الحالة
                    </label>
                    <select
                      name="status"
                      value={formData.status}
                      onChange={handleChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                    >
                      <option value="active">نشط</option>
                      <option value="inactive">غير نشط</option>
                    </select>
                  </div>
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
              loading={isSaving}
              icon={<Save className="w-5 h-5" />}
              fullWidth
            >
              {isSaving ? "جاري الحفظ..." : "حفظ التغييرات"}
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

        {/* Modal تأكيد الحذف */}
        <AnimatePresence>
          {showDeleteConfirm && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
            >
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6"
              >
                <div className="flex items-center gap-4 mb-6">
                  <div className="p-3 bg-red-100 rounded-full">
                    <Trash2 className="w-8 h-8 text-red-600" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-gray-900">
                      حذف المحل
                    </h3>
                    <p className="text-gray-600 text-sm">
                      هذا الإجراء لا يمكن التراجع عنه
                    </p>
                  </div>
                </div>

                <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-6">
                  <div className="flex items-start gap-3">
                    <AlertTriangle className="w-5 h-5 text-red-600 mt-0.5" />
                    <div>
                      <p className="text-red-800 font-medium mb-1">
                        تحذير: حذف المحل
                      </p>
                      <p className="text-red-700 text-sm">
                        سيتم حذف جميع البيانات المرتبطة بهذا المحل بما في ذلك
                        الطلبات والتقارير. لا يمكن استرداد هذه البيانات بعد
                        الحذف.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="flex gap-3">
                  <EnhancedButton
                    variant="secondary"
                    size="lg"
                    onClick={() => setShowDeleteConfirm(false)}
                    fullWidth
                  >
                    إلغاء
                  </EnhancedButton>
                  <EnhancedButton
                    variant="danger"
                    size="lg"
                    loading={isDeleting}
                    icon={<Trash2 className="w-5 h-5" />}
                    onClick={handleDelete}
                    fullWidth
                  >
                    {isDeleting ? "جاري الحذف..." : "حذف المحل"}
                  </EnhancedButton>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default EditStorePage;
