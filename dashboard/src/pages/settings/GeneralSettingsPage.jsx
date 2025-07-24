import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  Settings,
  Globe,
  Palette,
  Clock,
  Save,
  RefreshCw,
  CheckCircle,
  XCircle,
  AlertCircle,
  Building,
  DollarSign,
  Calendar,
  Monitor,
} from "lucide-react";
import { Card, CardHeader, CardBody } from "../../components/ui/Card";
import EnhancedButton from "../../components/ui/EnhancedButton";
import LoadingSpinner from "../../components/ui/LoadingSpinner";
import { useSystemStore } from "../../stores/systemStore";

const GeneralSettingsPage = () => {
  const { systemSettings, updateSystemSettings, loadSystemSettings } =
    useSystemStore();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // Form state
  const [formData, setFormData] = useState({
    siteName: "",
    currency: "EUR",
    secondaryCurrency: "SYP",
    exchangeRate: "15000",
    theme: "light",
    language: "ar",
    timezone: "Asia/Damascus",
    dateFormat: "DD/MM/YYYY",
    timeFormat: "24h",
    maintenanceMode: false,
    debugMode: false,
  });

  useEffect(() => {
    loadSystemSettings();
  }, [loadSystemSettings]);

  useEffect(() => {
    if (systemSettings) {
      setFormData({
        siteName: systemSettings.siteName || "Bakery Management System",
        currency: systemSettings.currency || "EUR",
        secondaryCurrency: systemSettings.secondaryCurrency || "SYP",
        exchangeRate: systemSettings.exchangeRate || "15000",
        theme: systemSettings.theme || "light",
        language: systemSettings.language || "ar",
        timezone: systemSettings.timezone || "Asia/Damascus",
        dateFormat: systemSettings.dateFormat || "DD/MM/YYYY",
        timeFormat: systemSettings.timeFormat || "24h",
        maintenanceMode: systemSettings.maintenanceMode || false,
        debugMode: systemSettings.debugMode || false,
      });
    }
  }, [systemSettings]);

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setIsLoading(true);
      setError("");
      setSuccess("");

      const response = await updateSystemSettings(formData);

      if (response.success) {
        setSuccess("تم حفظ الإعدادات بنجاح");
      } else {
        setError(response.message || "خطأ في حفظ الإعدادات");
      }
    } catch (error) {
      setError("خطأ في حفظ الإعدادات");
    } finally {
      setIsLoading(false);
    }
  };

  const handleReset = () => {
    if (systemSettings) {
      setFormData({
        siteName: systemSettings.siteName || "Bakery Management System",
        currency: systemSettings.currency || "EUR",
        secondaryCurrency: systemSettings.secondaryCurrency || "SYP",
        exchangeRate: systemSettings.exchangeRate || "15000",
        theme: systemSettings.theme || "light",
        language: systemSettings.language || "ar",
        timezone: systemSettings.timezone || "Asia/Damascus",
        dateFormat: systemSettings.dateFormat || "DD/MM/YYYY",
        timeFormat: systemSettings.timeFormat || "24h",
        maintenanceMode: systemSettings.maintenanceMode || false,
        debugMode: systemSettings.debugMode || false,
      });
    }
    setError("");
    setSuccess("");
  };

  return (
    <div className="container mx-auto px-4 py-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            الإعدادات العامة
          </h1>
          <p className="text-gray-600">تكوين الإعدادات الأساسية للنظام</p>
        </div>

        {/* Success/Error Messages */}
        {success && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-4 p-4 bg-green-100 border border-green-400 text-green-700 rounded-lg flex items-center"
          >
            <CheckCircle className="w-5 h-5 mr-2" />
            {success}
          </motion.div>
        )}

        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded-lg flex items-center"
          >
            <XCircle className="w-5 h-5 mr-2" />
            {error}
          </motion.div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* General Settings */}
            <Card>
              <CardHeader>
                <div className="flex items-center">
                  <Building className="w-6 h-6 text-gray-600 mr-2" />
                  <h2 className="text-xl font-semibold text-gray-900">
                    إعدادات عامة
                  </h2>
                </div>
              </CardHeader>
              <CardBody>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      اسم الموقع
                    </label>
                    <input
                      type="text"
                      name="siteName"
                      value={formData.siteName}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="اسم الموقع"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      العملة الأساسية
                    </label>
                    <select
                      name="currency"
                      value={formData.currency}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="EUR">يورو (EUR)</option>
                      <option value="USD">دولار أمريكي (USD)</option>
                      <option value="SYP">ليرة سورية (SYP)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      العملة الثانوية
                    </label>
                    <select
                      name="secondaryCurrency"
                      value={formData.secondaryCurrency}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="SYP">ليرة سورية (SYP)</option>
                      <option value="EUR">يورو (EUR)</option>
                      <option value="USD">دولار أمريكي (USD)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      سعر الصرف
                    </label>
                    <input
                      type="number"
                      name="exchangeRate"
                      value={formData.exchangeRate}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="سعر الصرف"
                      step="0.01"
                    />
                  </div>
                </div>
              </CardBody>
            </Card>

            {/* Appearance Settings */}
            <Card>
              <CardHeader>
                <div className="flex items-center">
                  <Palette className="w-6 h-6 text-gray-600 mr-2" />
                  <h2 className="text-xl font-semibold text-gray-900">
                    إعدادات المظهر
                  </h2>
                </div>
              </CardHeader>
              <CardBody>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      المظهر
                    </label>
                    <select
                      name="theme"
                      value={formData.theme}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="light">فاتح</option>
                      <option value="dark">داكن</option>
                      <option value="system">حسب النظام</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      اللغة
                    </label>
                    <select
                      name="language"
                      value={formData.language}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="ar">العربية</option>
                      <option value="en">English</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      المنطقة الزمنية
                    </label>
                    <select
                      name="timezone"
                      value={formData.timezone}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="Asia/Damascus">دمشق (GMT+3)</option>
                      <option value="Asia/Beirut">بيروت (GMT+3)</option>
                      <option value="Asia/Amman">عمان (GMT+3)</option>
                      <option value="UTC">UTC (GMT+0)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      تنسيق التاريخ
                    </label>
                    <select
                      name="dateFormat"
                      value={formData.dateFormat}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="DD/MM/YYYY">DD/MM/YYYY</option>
                      <option value="MM/DD/YYYY">MM/DD/YYYY</option>
                      <option value="YYYY-MM-DD">YYYY-MM-DD</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      تنسيق الوقت
                    </label>
                    <select
                      name="timeFormat"
                      value={formData.timeFormat}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="24h">24 ساعة</option>
                      <option value="12h">12 ساعة</option>
                    </select>
                  </div>
                </div>
              </CardBody>
            </Card>

            {/* System Settings */}
            <Card>
              <CardHeader>
                <div className="flex items-center">
                  <Settings className="w-6 h-6 text-gray-600 mr-2" />
                  <h2 className="text-xl font-semibold text-gray-900">
                    إعدادات النظام
                  </h2>
                </div>
              </CardHeader>
              <CardBody>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        وضع الصيانة
                      </label>
                      <p className="text-sm text-gray-500">
                        إيقاف النظام مؤقتاً للصيانة
                      </p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        name="maintenanceMode"
                        checked={formData.maintenanceMode}
                        onChange={handleInputChange}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                    </label>
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        وضع التطوير
                      </label>
                      <p className="text-sm text-gray-500">
                        عرض معلومات التطوير والأخطاء
                      </p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        name="debugMode"
                        checked={formData.debugMode}
                        onChange={handleInputChange}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                    </label>
                  </div>
                </div>
              </CardBody>
            </Card>

            {/* Action Buttons */}
            <Card>
              <CardHeader>
                <div className="flex items-center">
                  <Save className="w-6 h-6 text-gray-600 mr-2" />
                  <h2 className="text-xl font-semibold text-gray-900">
                    حفظ الإعدادات
                  </h2>
                </div>
              </CardHeader>
              <CardBody>
                <div className="space-y-4">
                  <p className="text-sm text-gray-600">
                    انقر على "حفظ الإعدادات" لتطبيق التغييرات على النظام
                  </p>

                  <div className="flex space-x-3 space-x-reverse">
                    <EnhancedButton
                      type="button"
                      onClick={handleReset}
                      variant="outline"
                      disabled={isLoading}
                      className="flex items-center"
                    >
                      <RefreshCw className="w-4 h-4 mr-1" />
                      إعادة تعيين
                    </EnhancedButton>

                    <EnhancedButton
                      type="submit"
                      disabled={isLoading}
                      className="flex items-center"
                    >
                      {isLoading ? (
                        <LoadingSpinner size="sm" />
                      ) : (
                        <Save className="w-4 h-4 mr-1" />
                      )}
                      حفظ الإعدادات
                    </EnhancedButton>
                  </div>
                </div>
              </CardBody>
            </Card>
          </div>
        </form>
      </motion.div>
    </div>
  );
};

export default GeneralSettingsPage;
