import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  Settings,
  Database,
  Mail,
  Server,
  Shield,
  Key,
  Save,
  RefreshCw,
  CheckCircle,
  XCircle,
  AlertCircle,
  Globe,
  Lock,
  Eye,
  EyeOff,
  TestTube,
  Activity,
  HardDrive,
  Wifi,
  Cloud,
} from "lucide-react";
import { Card, CardHeader, CardBody } from "../../components/ui/Card";
import EnhancedButton from "../../components/ui/EnhancedButton";
import LoadingSpinner from "../../components/ui/LoadingSpinner";
import { useSystemStore } from "../../stores/systemStore";

const SystemConfigPage = () => {
  const { systemSettings, updateSystemSettings, loadSystemSettings } =
    useSystemStore();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [showPasswords, setShowPasswords] = useState({});

  // Form state
  const [formData, setFormData] = useState({
    // Database settings
    dbHost: "",
    dbPort: "",
    dbName: "",
    dbUser: "",
    dbPassword: "",

    // Email settings
    emailHost: "",
    emailPort: "",
    emailUser: "",
    emailPassword: "",
    emailFrom: "",
    emailFromName: "",

    // API settings
    apiUrl: "",
    apiKey: "",
    apiSecret: "",

    // Security settings
    jwtSecret: "",
    sessionTimeout: "3600",
    maxLoginAttempts: "5",
    passwordMinLength: "8",

    // File storage settings
    storageType: "local",
    storagePath: "",
    maxFileSize: "10",
    allowedFileTypes: "jpg,jpeg,png,pdf,doc,docx",

    // Backup settings
    autoBackup: false,
    backupFrequency: "daily",
    backupRetention: "30",
    backupPath: "",
  });

  useEffect(() => {
    loadSystemSettings();
  }, [loadSystemSettings]);

  useEffect(() => {
    if (systemSettings) {
      setFormData({
        // Database settings
        dbHost: systemSettings.dbHost || "",
        dbPort: systemSettings.dbPort || "3306",
        dbName: systemSettings.dbName || "",
        dbUser: systemSettings.dbUser || "",
        dbPassword: systemSettings.dbPassword || "",

        // Email settings
        emailHost: systemSettings.emailHost || "",
        emailPort: systemSettings.emailPort || "587",
        emailUser: systemSettings.emailUser || "",
        emailPassword: systemSettings.emailPassword || "",
        emailFrom: systemSettings.emailFrom || "",
        emailFromName: systemSettings.emailFromName || "",

        // API settings
        apiUrl: systemSettings.apiUrl || "",
        apiKey: systemSettings.apiKey || "",
        apiSecret: systemSettings.apiSecret || "",

        // Security settings
        jwtSecret: systemSettings.jwtSecret || "",
        sessionTimeout: systemSettings.sessionTimeout || "3600",
        maxLoginAttempts: systemSettings.maxLoginAttempts || "5",
        passwordMinLength: systemSettings.passwordMinLength || "8",

        // File storage settings
        storageType: systemSettings.storageType || "local",
        storagePath: systemSettings.storagePath || "",
        maxFileSize: systemSettings.maxFileSize || "10",
        allowedFileTypes:
          systemSettings.allowedFileTypes || "jpg,jpeg,png,pdf,doc,docx",

        // Backup settings
        autoBackup: systemSettings.autoBackup || false,
        backupFrequency: systemSettings.backupFrequency || "daily",
        backupRetention: systemSettings.backupRetention || "30",
        backupPath: systemSettings.backupPath || "",
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

  const togglePasswordVisibility = (field) => {
    setShowPasswords((prev) => ({
      ...prev,
      [field]: !prev[field],
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
        emailFrom: systemSettings.emailFrom || "",
        emailFromName: systemSettings.emailFromName || "",
        apiUrl: systemSettings.apiUrl || "",
        apiKey: systemSettings.apiKey || "",
        apiSecret: systemSettings.apiSecret || "",
        jwtSecret: systemSettings.jwtSecret || "",
        sessionTimeout: systemSettings.sessionTimeout || "3600",
        maxLoginAttempts: systemSettings.maxLoginAttempts || "5",
        passwordMinLength: systemSettings.passwordMinLength || "8",
        storageType: systemSettings.storageType || "local",
        storagePath: systemSettings.storagePath || "",
        maxFileSize: systemSettings.maxFileSize || "10",
        allowedFileTypes:
          systemSettings.allowedFileTypes || "jpg,jpeg,png,pdf,doc,docx",
        autoBackup: systemSettings.autoBackup || false,
        backupFrequency: systemSettings.backupFrequency || "daily",
        backupRetention: systemSettings.backupRetention || "30",
        backupPath: systemSettings.backupPath || "",
      });
    }
    setError("");
    setSuccess("");
  };

  const testConnection = async (type) => {
    try {
      setIsLoading(true);
      setError("");

      // This would call the backend to test the connection
      console.log(`Testing ${type} connection...`);

      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000));

      setSuccess(`تم اختبار الاتصال بـ ${type} بنجاح`);
    } catch (error) {
      setError(`فشل في اختبار الاتصال بـ ${type}`);
    } finally {
      setIsLoading(false);
    }
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
            إعدادات النظام
          </h1>
          <p className="text-gray-600">تكوين الإعدادات المتقدمة للنظام</p>
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
            {/* Database Settings */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <Database className="w-6 h-6 text-gray-600 mr-2" />
                    <h2 className="text-xl font-semibold text-gray-900">
                      إعدادات قاعدة البيانات
                    </h2>
                  </div>
                  <EnhancedButton
                    type="button"
                    onClick={() => testConnection("قاعدة البيانات")}
                    variant="outline"
                    size="sm"
                    disabled={isLoading}
                    className="flex items-center"
                  >
                    <TestTube className="w-4 h-4 mr-1" />
                    اختبار الاتصال
                  </EnhancedButton>
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
                        {showPasswords.dbPassword ? (
                          <EyeOff className="w-4 h-4" />
                        ) : (
                          <Eye className="w-4 h-4" />
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              </CardBody>
            </Card>

            {/* Email Settings */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <Mail className="w-6 h-6 text-gray-600 mr-2" />
                    <h2 className="text-xl font-semibold text-gray-900">
                      إعدادات البريد الإلكتروني
                    </h2>
                  </div>
                  <EnhancedButton
                    type="button"
                    onClick={() => testConnection("البريد الإلكتروني")}
                    variant="outline"
                    size="sm"
                    disabled={isLoading}
                    className="flex items-center"
                  >
                    <TestTube className="w-4 h-4 mr-1" />
                    اختبار الاتصال
                  </EnhancedButton>
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
                        onClick={() =>
                          togglePasswordVisibility("emailPassword")
                        }
                        className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
                      >
                        {showPasswords.emailPassword ? (
                          <EyeOff className="w-4 h-4" />
                        ) : (
                          <Eye className="w-4 h-4" />
                        )}
                      </button>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        من
                      </label>
                      <input
                        type="email"
                        name="emailFrom"
                        value={formData.emailFrom}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="noreply@example.com"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        اسم المرسل
                      </label>
                      <input
                        type="text"
                        name="emailFromName"
                        value={formData.emailFromName}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="نظام إدارة المخبز"
                      />
                    </div>
                  </div>
                </div>
              </CardBody>
            </Card>

            {/* Security Settings */}
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
                        {showPasswords.jwtSecret ? (
                          <EyeOff className="w-4 h-4" />
                        ) : (
                          <Eye className="w-4 h-4" />
                        )}
                      </button>
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-4">
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
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        الحد الأقصى لمحاولات الدخول
                      </label>
                      <input
                        type="number"
                        name="maxLoginAttempts"
                        value={formData.maxLoginAttempts}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        min="3"
                        max="10"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        الحد الأدنى لكلمة المرور
                      </label>
                      <input
                        type="number"
                        name="passwordMinLength"
                        value={formData.passwordMinLength}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        min="6"
                        max="20"
                      />
                    </div>
                  </div>
                </div>
              </CardBody>
            </Card>

            {/* File Storage Settings */}
            <Card>
              <CardHeader>
                <div className="flex items-center">
                  <HardDrive className="w-6 h-6 text-gray-600 mr-2" />
                  <h2 className="text-xl font-semibold text-gray-900">
                    إعدادات التخزين
                  </h2>
                </div>
              </CardHeader>
              <CardBody>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      نوع التخزين
                    </label>
                    <select
                      name="storageType"
                      value={formData.storageType}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="local">محلي</option>
                      <option value="s3">Amazon S3</option>
                      <option value="cloudinary">Cloudinary</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      مسار التخزين
                    </label>
                    <input
                      type="text"
                      name="storagePath"
                      value={formData.storagePath}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="/uploads"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        الحد الأقصى لحجم الملف (MB)
                      </label>
                      <input
                        type="number"
                        name="maxFileSize"
                        value={formData.maxFileSize}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        min="1"
                        max="100"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        أنواع الملفات المسموحة
                      </label>
                      <input
                        type="text"
                        name="allowedFileTypes"
                        value={formData.allowedFileTypes}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="jpg,jpeg,png,pdf"
                      />
                    </div>
                  </div>
                </div>
              </CardBody>
            </Card>

            {/* Backup Settings */}
            <Card>
              <CardHeader>
                <div className="flex items-center">
                  <Cloud className="w-6 h-6 text-gray-600 mr-2" />
                  <h2 className="text-xl font-semibold text-gray-900">
                    إعدادات النسخ الاحتياطي
                  </h2>
                </div>
              </CardHeader>
              <CardBody>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        النسخ الاحتياطي التلقائي
                      </label>
                      <p className="text-sm text-gray-500">
                        إنشاء نسخ احتياطية تلقائية
                      </p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        name="autoBackup"
                        checked={formData.autoBackup}
                        onChange={handleInputChange}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                    </label>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        تكرار النسخ الاحتياطي
                      </label>
                      <select
                        name="backupFrequency"
                        value={formData.backupFrequency}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      >
                        <option value="daily">يومي</option>
                        <option value="weekly">أسبوعي</option>
                        <option value="monthly">شهري</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        الاحتفاظ بالنسخ (أيام)
                      </label>
                      <input
                        type="number"
                        name="backupRetention"
                        value={formData.backupRetention}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        min="1"
                        max="365"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      مسار النسخ الاحتياطي
                    </label>
                    <input
                      type="text"
                      name="backupPath"
                      value={formData.backupPath}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="/backups"
                    />
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

export default SystemConfigPage;
