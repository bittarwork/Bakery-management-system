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
  Zap,
  Settings,
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

  // Add creation mode state
  const [creationMode, setCreationMode] = useState("quick"); // "quick" or "detailed"
  const [currentLocation, setCurrentLocation] = useState(null);
  const [locationLoading, setLocationLoading] = useState(false);

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
    address_details: "", // Additional details for navigation help
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

  // Get current location
  const getCurrentLocation = async () => {
    setLocationLoading(true);
    try {
      if (!navigator.geolocation) {
        throw new Error("المتصفح لا يدعم تحديد الموقع");
      }

      const position = await new Promise((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(resolve, reject, {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 300000, // 5 minutes
        });
      });

      const location = {
        latitude: position.coords.latitude,
        longitude: position.coords.longitude,
        accuracy: position.coords.accuracy,
        timestamp: new Date().toISOString(),
      };

      setCurrentLocation(location);
      setSelectedLocation({
        lat: location.latitude,
        lng: location.longitude,
        name: "الموقع الحالي",
      });

      // Clear location error if it exists
      setErrors((prev) => ({ ...prev, location: "" }));
    } catch (error) {
      console.error("Error getting location:", error);
      setErrors((prev) => ({
        ...prev,
        location: error.message.includes("denied")
          ? "تم رفض الوصول للموقع. يرجى السماح بالوصول للموقع من إعدادات المتصفح"
          : "خطأ في تحديد الموقع الحالي",
      }));
    } finally {
      setLocationLoading(false);
    }
  };

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

    // Only validate required fields based on creation mode
    if (!formData.name.trim()) {
      newErrors.name = "اسم المحل مطلوب";
    } else if (formData.name.length < 2) {
      newErrors.name = "اسم المحل يجب أن يكون حرفين على الأقل";
    }

    // For quick mode, only location is required besides name
    if (creationMode === "quick") {
      if (!currentLocation && !selectedLocation) {
        newErrors.location =
          "يجب تحديد موقع المحل - استخدم زر 'استخدام الموقع الحالي' أو اختر من الخريطة";
      }
    } else {
      // Detailed mode validations
      if (!formData.address.trim()) {
        newErrors.address = "عنوان المحل مطلوب في الوضع التفصيلي";
      }

      // Optional validations for detailed mode
      if (formData.phone && !/^\+?[\d\s\-\(\)]+$/.test(formData.phone)) {
        newErrors.phone = "رقم الهاتف غير صحيح";
      }

      if (
        formData.email &&
        !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)
      ) {
        newErrors.email = "البريد الإلكتروني غير صحيح";
      }

      if (!selectedLocation && !currentLocation) {
        newErrors.location = "يجب اختيار موقع المحل على الخريطة";
      }
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
      let response;

      if (creationMode === "quick") {
        // Validate location data before sending
        if (!currentLocation && !selectedLocation) {
          setErrors({
            location:
              "يجب اختيار موقع المحل على الخريطة أو السماح بالوصول للموقع الحالي",
          });
          setIsLoading(false);
          return;
        }

        // Ensure location data is properly formatted
        let locationData;
        if (currentLocation) {
          locationData = {
            latitude: parseFloat(currentLocation.latitude),
            longitude: parseFloat(currentLocation.longitude),
          };
        } else if (selectedLocation) {
          locationData = {
            latitude: parseFloat(selectedLocation.lat),
            longitude: parseFloat(selectedLocation.lng),
          };
        }

        // Validate location coordinates
        if (
          !locationData ||
          isNaN(locationData.latitude) ||
          isNaN(locationData.longitude) ||
          locationData.latitude < -90 ||
          locationData.latitude > 90 ||
          locationData.longitude < -180 ||
          locationData.longitude > 180
        ) {
          setErrors({ location: "إحداثيات الموقع غير صحيحة" });
          setIsLoading(false);
          return;
        }

        // Use quick create API
        const quickData = {
          name: formData.name.trim(),
          current_location: locationData,
          owner_name: formData.owner_name?.trim() || null,
          phone: formData.phone?.trim() || null,
          category: formData.category,
          store_type: formData.store_type,
          address_details: formData.address_details?.trim() || null,
          special_instructions: formData.special_instructions?.trim() || null,
        };

        console.log("Quick create data being sent:", quickData); // Debug log

        response = await storeService.quickCreateStore(quickData);
      } else {
        // Use detailed create API
        const storeData = {
          ...formData,
          gps_coordinates: currentLocation
            ? {
                latitude: currentLocation.latitude,
                longitude: currentLocation.longitude,
                source: "distributor_current_location",
              }
            : selectedLocation
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

        response = await storeService.createStore(storeData);
      }

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
        // Handle validation errors from backend
        const backendErrors = {};
        error.response.data.errors.forEach((err) => {
          backendErrors[err.path || "submit"] = err.msg || err.message;
        });
        setErrors(backendErrors);
      } else if (error.response?.data?.message) {
        setErrors({ submit: error.response.data.message });
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

          {/* Creation Mode Selector */}
          <div className="flex items-center justify-center mb-6">
            <div className="bg-white p-1 rounded-xl border border-gray-200 shadow-sm">
              <EnhancedButton
                onClick={() => setCreationMode("quick")}
                variant={creationMode === "quick" ? "primary" : "ghost"}
                size="md"
                icon={<Zap className="w-4 h-4" />}
              >
                إضافة سريعة
              </EnhancedButton>
              <EnhancedButton
                onClick={() => setCreationMode("detailed")}
                variant={creationMode === "detailed" ? "primary" : "ghost"}
                size="md"
                icon={<Settings className="w-4 h-4" />}
              >
                إضافة تفصيلية
              </EnhancedButton>
            </div>
          </div>

          {/* Mode Description */}
          <div className="text-center mb-6">
            {creationMode === "quick" ? (
              <p className="text-gray-600">
                الوضع السريع: أدخل اسم المحل واستخدم موقعك الحالي للإضافة
                السريعة
              </p>
            ) : (
              <p className="text-gray-600">
                الوضع التفصيلي: أدخل جميع المعلومات التفصيلية للمحل
              </p>
            )}
          </div>
        </motion.div>

        {/* Success/Error Messages */}
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
          {/* Quick Create Mode */}
          {creationMode === "quick" && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
            >
              <Card className="border-0 shadow-lg">
                <CardHeader className="border-b border-gray-200 bg-gradient-to-r from-blue-50 to-white">
                  <h2 className="text-xl font-semibold text-gray-900 flex items-center">
                    <Zap className="w-5 h-5 ml-2" />
                    إضافة سريعة للمحل
                  </h2>
                </CardHeader>
                <CardBody className="p-6">
                  <div className="space-y-6">
                    {/* Store Name - Required */}
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

                    {/* Current Location Section */}
                    <div className="space-y-4">
                      <label className="block text-sm font-medium text-gray-700">
                        موقع المحل <span className="text-red-500">*</span>
                      </label>

                      <div className="flex gap-4">
                        <EnhancedButton
                          type="button"
                          onClick={getCurrentLocation}
                          loading={locationLoading}
                          variant="primary"
                          icon={<Navigation className="w-4 h-4" />}
                        >
                          {locationLoading
                            ? "جاري تحديد الموقع..."
                            : "استخدام الموقع الحالي"}
                        </EnhancedButton>

                        {currentLocation && (
                          <div className="flex-1 p-3 bg-green-50 border border-green-200 rounded-lg">
                            <div className="flex items-center text-green-800">
                              <CheckCircle className="w-4 h-4 ml-2" />
                              <span className="text-sm font-medium">
                                تم تحديد الموقع الحالي بنجاح
                              </span>
                            </div>
                            <div className="text-xs text-green-600 mt-1">
                              خط العرض: {currentLocation.latitude.toFixed(6)},
                              خط الطول: {currentLocation.longitude.toFixed(6)}
                            </div>
                          </div>
                        )}
                      </div>

                      {errors.location && (
                        <div className="text-sm text-red-600 flex items-center gap-1">
                          <AlertCircle className="w-4 h-4" />
                          <span>{errors.location}</span>
                        </div>
                      )}
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {/* Optional Quick Fields */}
                      <EnhancedInput
                        label="اسم المالك"
                        name="owner_name"
                        value={formData.owner_name}
                        onChange={handleChange}
                        placeholder="أدخل اسم مالك المحل (اختياري)"
                        icon={<User className="w-4 h-4" />}
                      />

                      <EnhancedInput
                        label="رقم الهاتف"
                        name="phone"
                        value={formData.phone}
                        onChange={handleChange}
                        placeholder="أدخل رقم الهاتف (اختياري)"
                        icon={<Phone className="w-4 h-4" />}
                      />

                      {/* Category */}
                      <div className="space-y-2">
                        <label className="block text-sm font-medium text-gray-700">
                          فئة المحل
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

                      {/* Store Type */}
                      <div className="space-y-2">
                        <label className="block text-sm font-medium text-gray-700">
                          نوع المحل
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
                    </div>

                    {/* Address Details for Navigation Help */}
                    <EnhancedInput
                      label="تفاصيل إضافية للموقع"
                      name="address_details"
                      value={formData.address_details}
                      onChange={handleChange}
                      placeholder="أدخل معلومات إضافية للمساعدة في الوصول (مثل: بجانب البنك، الطابق الثاني...)"
                      icon={<MapPin className="w-4 h-4" />}
                      multiline
                      rows={2}
                    />

                    {/* Special Instructions */}
                    <EnhancedInput
                      label="تعليمات خاصة"
                      name="special_instructions"
                      value={formData.special_instructions}
                      onChange={handleChange}
                      placeholder="أدخل أي تعليمات خاصة (اختياري)"
                      icon={<FileText className="w-4 h-4" />}
                      multiline
                      rows={2}
                    />
                  </div>
                </CardBody>
              </Card>
            </motion.div>
          )}

          {/* Detailed Create Mode - Keep existing detailed form */}
          {creationMode === "detailed" && (
            <>
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
                      {/* Required Fields */}
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

                      <EnhancedInput
                        label="العنوان"
                        name="address"
                        value={formData.address}
                        onChange={handleChange}
                        placeholder="أدخل العنوان الكامل للمحل"
                        required
                        error={errors.address}
                        icon={<MapPin className="w-4 h-4" />}
                      />

                      {/* Optional Fields */}
                      <EnhancedInput
                        label="اسم المالك"
                        name="owner_name"
                        value={formData.owner_name}
                        onChange={handleChange}
                        placeholder="أدخل اسم مالك المحل (اختياري)"
                        error={errors.owner_name}
                        icon={<User className="w-4 h-4" />}
                      />

                      <EnhancedInput
                        label="رقم الهاتف"
                        name="phone"
                        value={formData.phone}
                        onChange={handleChange}
                        placeholder="أدخل رقم الهاتف (اختياري)"
                        error={errors.phone}
                        icon={<Phone className="w-4 h-4" />}
                      />

                      <EnhancedInput
                        label="البريد الإلكتروني"
                        name="email"
                        type="email"
                        value={formData.email}
                        onChange={handleChange}
                        placeholder="أدخل البريد الإلكتروني (اختياري)"
                        error={errors.email}
                        icon={<Mail className="w-4 h-4" />}
                      />

                      {/* Store Categories and Types */}
                      <div className="space-y-2">
                        <label className="block text-sm font-medium text-gray-700">
                          فئة المحل
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
                    </div>
                  </CardBody>
                </Card>
              </motion.div>

              {/* Location Selection for Detailed Mode */}
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
                    <div className="space-y-4">
                      {/* Current Location Button */}
                      <div className="flex gap-4">
                        <EnhancedButton
                          type="button"
                          onClick={getCurrentLocation}
                          loading={locationLoading}
                          variant="primary"
                          icon={<Navigation className="w-4 h-4" />}
                        >
                          {locationLoading
                            ? "جاري تحديد الموقع..."
                            : "استخدام الموقع الحالي"}
                        </EnhancedButton>

                        {currentLocation && (
                          <div className="flex-1 p-3 bg-green-50 border border-green-200 rounded-lg">
                            <div className="flex items-center text-green-800">
                              <CheckCircle className="w-4 h-4 ml-2" />
                              <span className="text-sm font-medium">
                                تم تحديد الموقع الحالي
                              </span>
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Map */}
                      <div className="mb-4">
                        <StoreMap
                          stores={[]}
                          onLocationSelect={setSelectedLocation}
                          selectedLocation={selectedLocation}
                          height="400px"
                          interactive={true}
                          enableCurrentLocation={true}
                        />
                      </div>

                      <p className="text-sm text-gray-600">
                        استخدم زر "استخدام الموقع الحالي" أو انقر على الخريطة
                        لاختيار موقع المحل.
                      </p>

                      {errors.location && (
                        <div className="text-sm text-red-600 flex items-center gap-1">
                          <AlertCircle className="w-4 h-4" />
                          <span>{errors.location}</span>
                        </div>
                      )}
                    </div>
                  </CardBody>
                </Card>
              </motion.div>
            </>
          )}

          {/* Submit Buttons */}
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
              {isLoading
                ? "جاري الإنشاء..."
                : creationMode === "quick"
                ? "إنشاء المحل سريعاً"
                : "إنشاء المحل"}
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
