import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  Settings,
  Database,
  Mail,
  Shield,
  Save,
  RefreshCw,
  CheckCircle,
  XCircle,
  Eye,
  EyeOff,
} from "lucide-react";
import { Card, CardHeader, CardBody } from "../../components/ui/Card";
import EnhancedButton from "../../components/ui/EnhancedButton";
import LoadingSpinner from "../../components/ui/LoadingSpinner";
import { useSystemStore } from "../../stores/systemStore";

const SystemConfigPage = () => {
  const { systemSettings, updateSystemSettings, loadSystemSettings } = useSystemStore();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [showPasswords, setShowPasswords] = useState({});
  
  const [formData, setFormData] = useState({
    dbHost: "",
    dbPort: "3306",
    dbName: "",
    dbUser: "",
    dbPassword: "",
    emailHost: "",
    emailPort: "587",
    emailUser: "",
    emailPassword: "",
    jwtSecret: "",
    sessionTimeout: "3600",
  });

  useEffect(() => {
    loadSystemSettings();
  }, [loadSystemSettings]);

  useEffect(() => {
    if (systemSettings) {
      setFormData({
        dbHost: systemSettings.dbHost || "",
        dbPort: systemSettings.dbPort || "3306",
        dbName: systemSettings.dbName || "",
        dbUser: systemSettings.dbUser || "",
        dbPassword: systemSettings.dbPassword || "",
        emailHost: systemSettings.emailHost || "",
        emailPort: systemSettings.emailPort || "587",
        emailUser: systemSettings.emailUser || "",
        emailPassword: systemSettings.emailPassword || "",
        jwtSecret: systemSettings.jwtSecret || "",
        sessionTimeout: systemSettings.sessionTimeout || "3600",
      });
    }
  }, [systemSettings]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const togglePasswordVisibility = (field) => {
    setShowPasswords(prev => ({
      ...prev,
      [field]: !prev[field]
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
        setSuccess("تم حفظ إعدادات النظام بنجاح");
      } else {
        setError(response.message || "خطأ في حفظ إعدادات النظام");
      }
    } catch (error) {
      setError("خطأ في حفظ إعدادات النظام");
    } finally {
      setIsLoading(false);
    }
  };

  const handleReset = () => {
    if (systemSettings) {
      setFormData({
        dbHost: systemSettings.dbHost || "",
        dbPort: systemSettings.dbPort || "3306",
        dbName: systemSettings.dbName || "",
        dbUser: systemSettings.dbUser || "",
        dbPassword: systemSettings.dbPassword || "",
        emailHost: systemSettings.emailHost || "",
        emailPort: systemSettings.emailPort || "587",
        emailUser: systemSettings.emailUser || "",
        emailPassword: systemSettings.emailPassword || "",
        jwtSecret: systemSettings.jwtSecret || "",
        sessionTimeout: systemSettings.sessionTimeout || "3600",
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
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            إعدادات النظام
          </h1>
          <p className="text-gray-600">
            تكوين الإعدادات المتقدمة للنظام
          </p>
        </div>

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
            <Card>
              <CardHeader>
                <div className="flex items-center">
                  <Database className="w-6 h-6 text-gray-600 mr-2" />
                  <h2 className="text-xl font-semibold text-gray-900">
                    إعدادات قاعدة البيانات
                  </h2>
                </div>
              </CardHeader>
              <CardBody>
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        المضيف
                      </label>
                      <input
                        type="text"
                        name="dbHost"
                        value={formData.dbHost}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="localhost"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        المنفذ
                      </label>
                      <input
                        type="text"
                        name="dbPort"
                        value={formData.dbPort}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="3306"
                      />
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      اسم قاعدة البيانات
                    </label>
                    <input
                      type="text"
                      name="dbName"
                      value={formData.dbName}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="bakery_db"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      اسم المستخدم
                    </label>
                    <input
                      type="text"
                      name="dbUser"
                      value={formData.dbUser}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="root"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      كلمة المرور
                    </label>
                    <div className="relative">
                      <input
                        type={showPasswords.dbPassword ? "text" : "password"}
                        name="dbPassword"
                        value={formData.dbPassword}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 pr-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="كلمة المرور"
                      />
                      <button
                        type="button"
                        onClick={() => togglePasswordVisibility("dbPassword")}
                        className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
                      >
                        {showPasswords.dbPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>
                </div>
              </CardBody>
            </Card>

            <Card>
              <CardHeader>
                <div className="flex items-center">
                  <Mail className="w-6 h-6 text-gray-600 mr-2" />
                  <h2 className="text-xl font-semibold text-gray-900">
                    إعدادات البريد الإلكتروني
                  </h2>
                </div>
              </CardHeader>
              <CardBody>
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        مضيف SMTP
                      </label>
                      <input
                        type="text"
                        name="emailHost"
                        value={formData.emailHost}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="smtp.gmail.com"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        المنفذ
                      </label>
                      <input
                        type="text"
                        name="emailPort"
                        value={formData.emailPort}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="587"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      البريد الإلكتروني
                    </label>
                    <input
                      type="email"
                      name="emailUser"
                      value={formData.emailUser}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="user@example.com"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      كلمة المرور
                    </label>
                    <div className="relative">
                      <input
                        type={showPasswords.emailPassword ? "text" : "password"}
                        name="emailPassword"
                        value={formData.emailPassword}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 pr-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="كلمة المرور"
                      />
                      <button
                        type="button"
                        onClick={() => togglePasswordVisibility("emailPassword")}
                        className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
                      >
                        {showPasswords.emailPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>
                </div>
              </CardBody>
            </Card>

            <Card>
              <CardHeader>
                <div className="flex items-center">
                  <Shield className="w-6 h-6 text-gray-600 mr-2" />
                  <h2 className="text-xl font-semibold text-gray-900">
                    إعدادات الأمان
                  </h2>
                </div>
              </CardHeader>
              <CardBody>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      مفتاح JWT
                    </label>
                    <div className="relative">
                      <input
                        type={showPasswords.jwtSecret ? "text" : "password"}
                        name="jwtSecret"
                        value={formData.jwtSecret}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 pr-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="مفتاح JWT السري"
                      />
                      <button
                        type="button"
                        onClick={() => togglePasswordVisibility("jwtSecret")}
                        className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
                      >
                        {showPasswords.jwtSecret ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      مهلة الجلسة (ثانية)
                    </label>
                    <input
                      type="number"
                      name="sessionTimeout"
                      value={formData.sessionTimeout}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      min="300"
                      max="86400"
                    />
                  </div>
                </div>
              </CardBody>
            </Card>

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

export default SystemConfigPage;
