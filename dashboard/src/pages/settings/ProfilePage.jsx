import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  User,
  Mail,
  Phone,
  MapPin,
  Camera,
  Save,
  Lock,
  Eye,
  EyeOff,
  Shield,
  Bell,
  Globe,
  Paintbrush,
  Download,
  Upload,
  Trash2,
  CheckCircle,
  AlertCircle,
  Crown,
  Briefcase,
  Truck,
  ShoppingCart,
  Settings,
  Edit,
} from "lucide-react";
import { Card, CardHeader, CardBody } from "../../components/ui/Card";
import Button from "../../components/ui/Button";
import Input from "../../components/ui/Input";

const ProfilePage = () => {
  const [profile, setProfile] = useState({
    name: "Ahmed Hassan",
    email: "ahmed.hassan@bakery.com",
    phone: "+963 955 123 456",
    store: "Main Office",
    role: "admin",
    avatar: "AH",
    bio: "System administrator with 5+ years of experience in bakery management systems.",
    language: "en",
    currency: "EUR",
    timezone: "Asia/Damascus",
    theme: "light",
  });

  const [security, setSecurity] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
    twoFactorEnabled: false,
    sessionTimeout: 30,
  });

  const [notifications, setNotifications] = useState({
    emailNotifications: true,
    pushNotifications: true,
    orderUpdates: true,
    paymentReminders: true,
    systemAlerts: true,
    marketingEmails: false,
  });

  const [isEditing, setIsEditing] = useState(false);
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const roles = [
    {
      value: "admin",
      label: "Admin",
      icon: Crown,
      color: "purple",
      description: "Full system access and control",
    },
    {
      value: "manager",
      label: "Manager",
      icon: Briefcase,
      color: "blue",
      description: "Store management and operations",
    },
    {
      value: "distributor",
      label: "Distributor",
      icon: Truck,
      color: "orange",
      description: "Distribution and delivery management",
    },
    {
      value: "cashier",
      label: "Cashier",
      icon: ShoppingCart,
      color: "green",
      description: "Point of sale and customer service",
    },
    {
      value: "accountant",
      label: "Accountant",
      icon: Settings,
      color: "indigo",
      description: "Financial management and reporting",
    },
  ];

  const languages = [
    { value: "en", label: "English" },
    { value: "ar", label: "العربية" },
    { value: "fr", label: "Français" },
    { value: "de", label: "Deutsch" },
  ];

  const currencies = [
    { value: "EUR", label: "Euro (€)" },
    { value: "SYP", label: "Syrian Pound (ل.س)" },
    { value: "USD", label: "US Dollar ($)" },
  ];

  const timezones = [
    { value: "Asia/Damascus", label: "Damascus (UTC+3)" },
    { value: "Europe/London", label: "London (UTC+0)" },
    { value: "America/New_York", label: "New York (UTC-5)" },
  ];

  const themes = [
    { value: "light", label: "Light" },
    { value: "dark", label: "Dark" },
    { value: "auto", label: "Auto" },
  ];

  const validateProfileForm = () => {
    const newErrors = {};

    if (!profile.name.trim()) {
      newErrors.name = "Name is required";
    }

    if (!profile.email.trim()) {
      newErrors.email = "Email is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(profile.email)) {
      newErrors.email = "Please enter a valid email address";
    }

    if (!profile.phone.trim()) {
      newErrors.phone = "Phone number is required";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validatePasswordForm = () => {
    const newErrors = {};

    if (!security.currentPassword) {
      newErrors.currentPassword = "Current password is required";
    }

    if (!security.newPassword) {
      newErrors.newPassword = "New password is required";
    } else if (security.newPassword.length < 8) {
      newErrors.newPassword = "Password must be at least 8 characters";
    } else if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(security.newPassword)) {
      newErrors.newPassword =
        "Password must contain uppercase, lowercase, and number";
    }

    if (!security.confirmPassword) {
      newErrors.confirmPassword = "Please confirm your password";
    } else if (security.newPassword !== security.confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleProfileSave = async () => {
    if (!validateProfileForm()) {
      return;
    }

    setIsLoading(true);

    try {
      // TODO: Implement API call to update profile
      await new Promise((resolve) => setTimeout(resolve, 1500));
      setIsEditing(false);
      setIsSuccess(true);
      setTimeout(() => setIsSuccess(false), 3000);
    } catch (error) {
      console.error("Error updating profile:", error);
      setErrors({ submit: "Failed to update profile. Please try again." });
    } finally {
      setIsLoading(false);
    }
  };

  const handlePasswordChange = async () => {
    if (!validatePasswordForm()) {
      return;
    }

    setIsLoading(true);

    try {
      // TODO: Implement API call to change password
      await new Promise((resolve) => setTimeout(resolve, 1500));
      setIsChangingPassword(false);
      setSecurity({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
        twoFactorEnabled: security.twoFactorEnabled,
        sessionTimeout: security.sessionTimeout,
      });
      setIsSuccess(true);
      setTimeout(() => setIsSuccess(false), 3000);
    } catch (error) {
      console.error("Error changing password:", error);
      setErrors({ submit: "Failed to change password. Please try again." });
    } finally {
      setIsLoading(false);
    }
  };

  const handleProfileChange = (field, value) => {
    setProfile((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: "" }));
    }
  };

  const handleSecurityChange = (field, value) => {
    setSecurity((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: "" }));
    }
  };

  const handleNotificationChange = (field, value) => {
    setNotifications((prev) => ({ ...prev, [field]: value }));
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
    if (strength <= 1) return "Weak";
    if (strength <= 2) return "Fair";
    if (strength <= 3) return "Good";
    if (strength <= 4) return "Strong";
    return "Excellent";
  };

  const selectedRole = roles.find((role) => role.value === profile.role);
  const RoleIcon = selectedRole?.icon;

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between"
      >
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Profile Settings</h1>
          <p className="text-gray-600">
            Manage your account settings and preferences
          </p>
        </div>
        {isSuccess && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex items-center bg-green-50 border border-green-200 rounded-lg px-4 py-2"
          >
            <CheckCircle className="w-5 h-5 text-green-600 mr-2" />
            <span className="text-green-800 text-sm">
              Settings saved successfully!
            </span>
          </motion.div>
        )}
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Profile Information */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold text-gray-900">
                  Profile Information
                </h2>
                {!isEditing && (
                  <Button
                    variant="ghost"
                    size="sm"
                    icon={<Edit className="w-4 h-4" />}
                    onClick={() => setIsEditing(true)}
                  >
                    Edit
                  </Button>
                )}
              </div>
            </CardHeader>
            <CardBody>
              {errors.submit && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-center"
                >
                  <AlertCircle className="w-5 h-5 text-red-400 mr-3" />
                  <span className="text-red-700 text-sm">{errors.submit}</span>
                </motion.div>
              )}

              <div className="text-center mb-8">
                <div className="relative inline-block">
                  <div className="w-24 h-24 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <span className="text-3xl font-bold text-blue-600">
                      {profile.avatar}
                    </span>
                  </div>
                  <button className="absolute bottom-0 right-0 w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-white hover:bg-blue-700 transition-colors">
                    <Camera className="w-4 h-4" />
                  </button>
                </div>
                <h3 className="text-xl font-semibold text-gray-900">
                  {profile.name}
                </h3>
                <p className="text-gray-500">{selectedRole?.label}</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Full Name *
                  </label>
                  {isEditing ? (
                    <Input
                      type="text"
                      value={profile.name}
                      onChange={(e) =>
                        handleProfileChange("name", e.target.value)
                      }
                      error={errors.name}
                    />
                  ) : (
                    <div className="flex items-center p-3 bg-gray-50 rounded-md">
                      <User className="w-4 h-4 text-gray-400 mr-3" />
                      <span className="text-gray-900">{profile.name}</span>
                    </div>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Email Address *
                  </label>
                  {isEditing ? (
                    <Input
                      type="email"
                      value={profile.email}
                      onChange={(e) =>
                        handleProfileChange("email", e.target.value)
                      }
                      error={errors.email}
                    />
                  ) : (
                    <div className="flex items-center p-3 bg-gray-50 rounded-md">
                      <Mail className="w-4 h-4 text-gray-400 mr-3" />
                      <span className="text-gray-900">{profile.email}</span>
                    </div>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Phone Number *
                  </label>
                  {isEditing ? (
                    <Input
                      type="tel"
                      value={profile.phone}
                      onChange={(e) =>
                        handleProfileChange("phone", e.target.value)
                      }
                      error={errors.phone}
                    />
                  ) : (
                    <div className="flex items-center p-3 bg-gray-50 rounded-md">
                      <Phone className="w-4 h-4 text-gray-400 mr-3" />
                      <span className="text-gray-900">{profile.phone}</span>
                    </div>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Store
                  </label>
                  <div className="flex items-center p-3 bg-gray-50 rounded-md">
                    <MapPin className="w-4 h-4 text-gray-400 mr-3" />
                    <span className="text-gray-900">{profile.store}</span>
                  </div>
                </div>
              </div>

              <div className="mt-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Bio
                </label>
                {isEditing ? (
                  <textarea
                    value={profile.bio}
                    onChange={(e) => handleProfileChange("bio", e.target.value)}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Tell us about yourself..."
                  />
                ) : (
                  <div className="p-3 bg-gray-50 rounded-md">
                    <p className="text-gray-900">{profile.bio}</p>
                  </div>
                )}
              </div>

              {isEditing && (
                <div className="flex justify-end space-x-3 mt-6 pt-6 border-t">
                  <Button variant="outline" onClick={() => setIsEditing(false)}>
                    Cancel
                  </Button>
                  <Button
                    variant="primary"
                    icon={<Save className="w-4 h-4" />}
                    loading={isLoading}
                    disabled={isLoading}
                    onClick={handleProfileSave}
                  >
                    {isLoading ? "Saving..." : "Save Changes"}
                  </Button>
                </div>
              )}
            </CardBody>
          </Card>
        </div>

        {/* Settings Sidebar */}
        <div className="lg:col-span-1 space-y-6">
          {/* Role Information */}
          <Card>
            <CardHeader>
              <h3 className="text-lg font-semibold text-gray-900">
                Role Information
              </h3>
            </CardHeader>
            <CardBody>
              <div className="flex items-center">
                <div
                  className={`w-10 h-10 bg-${selectedRole?.color}-100 rounded-full flex items-center justify-center mr-3`}
                >
                  <RoleIcon
                    className={`w-5 h-5 text-${selectedRole?.color}-600`}
                  />
                </div>
                <div>
                  <p className="font-medium text-gray-900">
                    {selectedRole?.label}
                  </p>
                  <p className="text-sm text-gray-500">
                    {selectedRole?.description}
                  </p>
                </div>
              </div>
            </CardBody>
          </Card>

          {/* Preferences */}
          <Card>
            <CardHeader>
              <h3 className="text-lg font-semibold text-gray-900">
                Preferences
              </h3>
            </CardHeader>
            <CardBody>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Language
                  </label>
                  <select
                    value={profile.language}
                    onChange={(e) =>
                      handleProfileChange("language", e.target.value)
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    {languages.map((lang) => (
                      <option key={lang.value} value={lang.value}>
                        {lang.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Currency
                  </label>
                  <select
                    value={profile.currency}
                    onChange={(e) =>
                      handleProfileChange("currency", e.target.value)
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    {currencies.map((currency) => (
                      <option key={currency.value} value={currency.value}>
                        {currency.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Timezone
                  </label>
                  <select
                    value={profile.timezone}
                    onChange={(e) =>
                      handleProfileChange("timezone", e.target.value)
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    {timezones.map((tz) => (
                      <option key={tz.value} value={tz.value}>
                        {tz.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Theme
                  </label>
                  <select
                    value={profile.theme}
                    onChange={(e) =>
                      handleProfileChange("theme", e.target.value)
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    {themes.map((theme) => (
                      <option key={theme.value} value={theme.value}>
                        {theme.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </CardBody>
          </Card>
        </div>
      </div>

      {/* Security Settings */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-900">
              Security Settings
            </h2>
            {!isChangingPassword && (
              <Button
                variant="ghost"
                size="sm"
                icon={<Lock className="w-4 h-4" />}
                onClick={() => setIsChangingPassword(true)}
              >
                Change Password
              </Button>
            )}
          </div>
        </CardHeader>
        <CardBody>
          {isChangingPassword ? (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Current Password *
                  </label>
                  <Input
                    type={showCurrentPassword ? "text" : "password"}
                    value={security.currentPassword}
                    onChange={(e) =>
                      handleSecurityChange("currentPassword", e.target.value)
                    }
                    icon={<Lock className="w-4 h-4" />}
                    rightIcon={
                      <button
                        type="button"
                        onClick={() =>
                          setShowCurrentPassword(!showCurrentPassword)
                        }
                      >
                        {showCurrentPassword ? (
                          <EyeOff className="w-4 h-4" />
                        ) : (
                          <Eye className="w-4 h-4" />
                        )}
                      </button>
                    }
                    error={errors.currentPassword}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    New Password *
                  </label>
                  <Input
                    type={showNewPassword ? "text" : "password"}
                    value={security.newPassword}
                    onChange={(e) =>
                      handleSecurityChange("newPassword", e.target.value)
                    }
                    icon={<Lock className="w-4 h-4" />}
                    rightIcon={
                      <button
                        type="button"
                        onClick={() => setShowNewPassword(!showNewPassword)}
                      >
                        {showNewPassword ? (
                          <EyeOff className="w-4 h-4" />
                        ) : (
                          <Eye className="w-4 h-4" />
                        )}
                      </button>
                    }
                    error={errors.newPassword}
                  />
                  {security.newPassword && (
                    <div className="mt-2">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-500">
                          Password strength:
                        </span>
                        <span
                          className={getPasswordStrengthColor(
                            getPasswordStrength(security.newPassword)
                          )}
                        >
                          {getPasswordStrengthText(
                            getPasswordStrength(security.newPassword)
                          )}
                        </span>
                      </div>
                      <div className="mt-1 h-1 bg-gray-200 rounded-full overflow-hidden">
                        <div
                          className={`h-full transition-all duration-300 ${getPasswordStrengthColor(
                            getPasswordStrength(security.newPassword)
                          ).replace("text-", "bg-")}`}
                          style={{
                            width: `${
                              (getPasswordStrength(security.newPassword) / 5) *
                              100
                            }%`,
                          }}
                        />
                      </div>
                    </div>
                  )}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Confirm New Password *
                </label>
                <Input
                  type={showConfirmPassword ? "text" : "password"}
                  value={security.confirmPassword}
                  onChange={(e) =>
                    handleSecurityChange("confirmPassword", e.target.value)
                  }
                  icon={<Lock className="w-4 h-4" />}
                  rightIcon={
                    <button
                      type="button"
                      onClick={() =>
                        setShowConfirmPassword(!showConfirmPassword)
                      }
                    >
                      {showConfirmPassword ? (
                        <EyeOff className="w-4 h-4" />
                      ) : (
                        <Eye className="w-4 h-4" />
                      )}
                    </button>
                  }
                  error={errors.confirmPassword}
                />
              </div>

              <div className="flex justify-end space-x-3 pt-6 border-t">
                <Button
                  variant="outline"
                  onClick={() => setIsChangingPassword(false)}
                >
                  Cancel
                </Button>
                <Button
                  variant="primary"
                  icon={<Save className="w-4 h-4" />}
                  loading={isLoading}
                  disabled={isLoading}
                  onClick={handlePasswordChange}
                >
                  {isLoading ? "Changing..." : "Change Password"}
                </Button>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div>
                  <h3 className="font-medium text-gray-900">
                    Two-Factor Authentication
                  </h3>
                  <p className="text-sm text-gray-500">
                    Add an extra layer of security
                  </p>
                </div>
                <button
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                    security.twoFactorEnabled ? "bg-blue-600" : "bg-gray-200"
                  }`}
                  onClick={() =>
                    handleSecurityChange(
                      "twoFactorEnabled",
                      !security.twoFactorEnabled
                    )
                  }
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      security.twoFactorEnabled
                        ? "translate-x-6"
                        : "translate-x-1"
                    }`}
                  />
                </button>
              </div>

              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div>
                  <h3 className="font-medium text-gray-900">Session Timeout</h3>
                  <p className="text-sm text-gray-500">
                    Auto-logout after inactivity
                  </p>
                </div>
                <select
                  value={security.sessionTimeout}
                  onChange={(e) =>
                    handleSecurityChange(
                      "sessionTimeout",
                      parseInt(e.target.value)
                    )
                  }
                  className="px-3 py-1 border border-gray-300 rounded-md text-sm"
                >
                  <option value={15}>15 minutes</option>
                  <option value={30}>30 minutes</option>
                  <option value={60}>1 hour</option>
                  <option value={120}>2 hours</option>
                </select>
              </div>
            </div>
          )}
        </CardBody>
      </Card>

      {/* Notification Settings */}
      <Card>
        <CardHeader>
          <h2 className="text-lg font-semibold text-gray-900">
            Notification Settings
          </h2>
        </CardHeader>
        <CardBody>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-medium text-gray-900">
                    Email Notifications
                  </h3>
                  <p className="text-sm text-gray-500">
                    Receive notifications via email
                  </p>
                </div>
                <button
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                    notifications.emailNotifications
                      ? "bg-blue-600"
                      : "bg-gray-200"
                  }`}
                  onClick={() =>
                    handleNotificationChange(
                      "emailNotifications",
                      !notifications.emailNotifications
                    )
                  }
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      notifications.emailNotifications
                        ? "translate-x-6"
                        : "translate-x-1"
                    }`}
                  />
                </button>
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-medium text-gray-900">
                    Push Notifications
                  </h3>
                  <p className="text-sm text-gray-500">
                    Receive push notifications
                  </p>
                </div>
                <button
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                    notifications.pushNotifications
                      ? "bg-blue-600"
                      : "bg-gray-200"
                  }`}
                  onClick={() =>
                    handleNotificationChange(
                      "pushNotifications",
                      !notifications.pushNotifications
                    )
                  }
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      notifications.pushNotifications
                        ? "translate-x-6"
                        : "translate-x-1"
                    }`}
                  />
                </button>
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-medium text-gray-900">Order Updates</h3>
                  <p className="text-sm text-gray-500">
                    Get notified about order changes
                  </p>
                </div>
                <button
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                    notifications.orderUpdates ? "bg-blue-600" : "bg-gray-200"
                  }`}
                  onClick={() =>
                    handleNotificationChange(
                      "orderUpdates",
                      !notifications.orderUpdates
                    )
                  }
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      notifications.orderUpdates
                        ? "translate-x-6"
                        : "translate-x-1"
                    }`}
                  />
                </button>
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-medium text-gray-900">
                    Payment Reminders
                  </h3>
                  <p className="text-sm text-gray-500">
                    Receive payment reminders
                  </p>
                </div>
                <button
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                    notifications.paymentReminders
                      ? "bg-blue-600"
                      : "bg-gray-200"
                  }`}
                  onClick={() =>
                    handleNotificationChange(
                      "paymentReminders",
                      !notifications.paymentReminders
                    )
                  }
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      notifications.paymentReminders
                        ? "translate-x-6"
                        : "translate-x-1"
                    }`}
                  />
                </button>
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-medium text-gray-900">System Alerts</h3>
                  <p className="text-sm text-gray-500">
                    Important system notifications
                  </p>
                </div>
                <button
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                    notifications.systemAlerts ? "bg-blue-600" : "bg-gray-200"
                  }`}
                  onClick={() =>
                    handleNotificationChange(
                      "systemAlerts",
                      !notifications.systemAlerts
                    )
                  }
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      notifications.systemAlerts
                        ? "translate-x-6"
                        : "translate-x-1"
                    }`}
                  />
                </button>
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-medium text-gray-900">
                    Marketing Emails
                  </h3>
                  <p className="text-sm text-gray-500">
                    Receive promotional content
                  </p>
                </div>
                <button
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                    notifications.marketingEmails
                      ? "bg-blue-600"
                      : "bg-gray-200"
                  }`}
                  onClick={() =>
                    handleNotificationChange(
                      "marketingEmails",
                      !notifications.marketingEmails
                    )
                  }
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      notifications.marketingEmails
                        ? "translate-x-6"
                        : "translate-x-1"
                    }`}
                  />
                </button>
              </div>
            </div>
          </div>
        </CardBody>
      </Card>
    </div>
  );
};

export default ProfilePage;
