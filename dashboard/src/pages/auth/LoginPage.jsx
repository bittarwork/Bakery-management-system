import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  Mail,
  Lock,
  Eye,
  EyeOff,
  Shield,
  CheckCircle,
  AlertCircle,
  Loader2,
  User,
  ChefHat,
  Wheat,
  Cookie,
  Zap,
  Users,
  LogIn,
} from "lucide-react";
import { useAuthStore } from "../../stores/authStore";
import Button from "../../components/ui/Button";
import Input from "../../components/ui/Input";

const LoginPage = () => {
  const navigate = useNavigate();
  const { login, clearError } = useAuthStore();
  const [formData, setFormData] = useState({
    usernameOrEmail: "",
    password: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [securityLevel, setSecurityLevel] = useState(0);
  const [attempts, setAttempts] = useState(0);
  const [isLocked, setIsLocked] = useState(false);
  const [lockoutTime, setLockoutTime] = useState(0);

  // Clear error when component mounts
  useEffect(() => {
    clearError();
  }, [clearError]);

  // Security level calculation
  useEffect(() => {
    let level = 0;
    if (formData.password.length >= 8) level++;
    if (/[A-Z]/.test(formData.password)) level++;
    if (/[a-z]/.test(formData.password)) level++;
    if (/[0-9]/.test(formData.password)) level++;
    if (/[^A-Za-z0-9]/.test(formData.password)) level++;
    setSecurityLevel(level);
  }, [formData.password]);

  // Lockout mechanism
  useEffect(() => {
    if (attempts >= 5) {
      setIsLocked(true);
      setLockoutTime(300);
    }
  }, [attempts]);

  useEffect(() => {
    if (lockoutTime > 0) {
      const timer = setTimeout(() => setLockoutTime(lockoutTime - 1), 1000);
      if (lockoutTime === 1) {
        setIsLocked(false);
        setAttempts(0);
      }
      return () => clearTimeout(timer);
    }
  }, [lockoutTime]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Form validation
    if (!formData.usernameOrEmail.trim()) {
      setError("يرجى إدخال البريد الإلكتروني أو اسم المستخدم");
      return;
    }

    if (!formData.password.trim()) {
      setError("يرجى إدخال كلمة المرور");
      return;
    }

    setError("");
    setIsLoading(true);

    try {
      console.log("Starting login process...");
      const result = await login(
        formData.usernameOrEmail.trim(),
        formData.password
      );

      if (result.success) {
        console.log("Login successful, navigating to dashboard...");
        navigate("/dashboard");
      } else {
        console.error("Login failed:", result.error);
        setAttempts((prev) => prev + 1);
        setError(result.error);
      }
    } catch (err) {
      console.error("Login failed:", err);
      setAttempts((prev) => prev + 1);

      // More specific error messages
      let errorMessage = "فشل في تسجيل الدخول";

      if (err.message.includes("401") || err.message.includes("Unauthorized")) {
        errorMessage = "بيانات تسجيل الدخول غير صحيحة";
      } else if (err.message.includes("404")) {
        errorMessage = "المستخدم غير موجود";
      } else if (err.message.includes("422")) {
        errorMessage = "بيانات غير صالحة";
      } else if (err.message.includes("500")) {
        errorMessage = "خطأ في الخادم، يرجى المحاولة لاحقاً";
      } else if (
        err.message.includes("network") ||
        err.message.includes("Network")
      ) {
        errorMessage = "خطأ في الاتصال بالخادم";
      } else if (err.message) {
        errorMessage = err.message;
      }

      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    // Clear error when user starts typing
    if (error) setError("");
  };

  const fillDemoAccount = (email, password) => {
    setFormData({
      usernameOrEmail: email,
      password: password,
    });
    setError("");
  };

  const getSecurityColor = () => {
    if (securityLevel <= 1) return "from-red-500 to-pink-500";
    if (securityLevel <= 2) return "from-orange-500 to-red-500";
    if (securityLevel <= 3) return "from-yellow-500 to-orange-500";
    if (securityLevel <= 4) return "from-blue-500 to-cyan-500";
    return "from-green-500 to-emerald-500";
  };

  const getSecurityText = () => {
    if (securityLevel <= 1) return "ضعيف";
    if (securityLevel <= 2) return "متوسط";
    if (securityLevel <= 3) return "جيد";
    if (securityLevel <= 4) return "قوي";
    return "ممتاز";
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  // Custom Bakery Logo Component
  const BakeryLogo = () => (
    <div className="relative">
      <motion.div
        initial={{ scale: 0, rotate: -180 }}
        animate={{ scale: 1, rotate: 0 }}
        transition={{ delay: 0.3, type: "spring", stiffness: 200 }}
        className="w-20 h-20 bg-gradient-to-br from-amber-400 via-orange-500 to-red-500 rounded-2xl flex items-center justify-center shadow-2xl relative overflow-hidden"
      >
        {/* Background pattern */}
        <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent" />

        {/* Main chef hat icon */}
        <ChefHat className="w-10 h-10 text-white z-10" />

        {/* Decorative elements */}
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
          className="absolute -top-1 -right-1 w-6 h-6 bg-gradient-to-br from-yellow-400 to-amber-500 rounded-full flex items-center justify-center"
        >
          <Wheat className="w-3 h-3 text-white" />
        </motion.div>

        <motion.div
          animate={{ rotate: -360 }}
          transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
          className="absolute -bottom-1 -left-1 w-5 h-5 bg-gradient-to-br from-pink-400 to-red-500 rounded-full flex items-center justify-center"
        >
          <Cookie className="w-2.5 h-2.5 text-white" />
        </motion.div>
      </motion.div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 relative overflow-hidden">
      {/* Subtle Background Elements */}
      <div className="absolute inset-0">
        {/* Soft grid pattern */}
        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.01)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.01)_1px,transparent_1px)] bg-[size:60px_60px]" />

        {/* Gentle floating orbs */}
        <motion.div
          animate={{
            x: [0, 50, 0],
            y: [0, -30, 0],
            scale: [1, 1.1, 1],
          }}
          transition={{
            duration: 15,
            repeat: Infinity,
            ease: "easeInOut",
          }}
          className="absolute top-20 left-20 w-24 h-24 bg-gradient-to-r from-amber-500/10 to-orange-500/10 rounded-full blur-xl"
        />
        <motion.div
          animate={{
            x: [0, -40, 0],
            y: [0, 40, 0],
            scale: [1, 0.9, 1],
          }}
          transition={{
            duration: 18,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 5,
          }}
          className="absolute bottom-20 right-20 w-32 h-32 bg-gradient-to-r from-red-500/10 to-pink-500/10 rounded-full blur-xl"
        />
      </div>

      {/* Main Content */}
      <div className="relative z-10 min-h-screen flex">
        {/* Left Side - Branding */}
        <motion.div
          initial={{ x: -100, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ duration: 1, ease: "easeOut" }}
          className="hidden lg:flex lg:w-1/2 flex-col justify-center items-center p-12 text-white"
        >
          {/* Logo */}
          <BakeryLogo />

          {/* Brand Name */}
          <motion.h1
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.6 }}
            className="text-4xl font-bold mt-8 mb-4 bg-gradient-to-r from-amber-300 via-orange-400 to-red-400 bg-clip-text text-transparent"
          >
            BakeMaster
          </motion.h1>

          {/* Tagline */}
          <motion.p
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.8 }}
            className="text-lg text-gray-300 text-center max-w-sm leading-relaxed"
          >
            نظام إدارة المخابز الاحترافي للأعمال الحديثة
          </motion.p>

          {/* Decorative bakery icons */}
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 1.0 }}
            className="mt-12 flex items-center gap-6 text-gray-400"
          >
            <motion.div
              animate={{ y: [0, -5, 0] }}
              transition={{ duration: 2, repeat: Infinity, delay: 0 }}
              className="text-amber-400/60"
            >
              <ChefHat size={24} />
            </motion.div>
            <motion.div
              animate={{ y: [0, -5, 0] }}
              transition={{ duration: 2, repeat: Infinity, delay: 0.5 }}
              className="text-orange-400/60"
            >
              <Wheat size={20} />
            </motion.div>
            <motion.div
              animate={{ y: [0, -5, 0] }}
              transition={{ duration: 2, repeat: Infinity, delay: 1 }}
              className="text-red-400/60"
            >
              <Cookie size={22} />
            </motion.div>
          </motion.div>
        </motion.div>

        {/* Right Side - Login Form */}
        <motion.div
          initial={{ x: 100, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ duration: 1, ease: "easeOut" }}
          className="w-full lg:w-1/2 flex items-center justify-center p-8"
        >
          <div className="w-full max-w-md">
            {/* Mobile Logo */}
            <div className="lg:hidden flex justify-center mb-8">
              <BakeryLogo />
            </div>

            {/* Form Header */}
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="text-center mb-8"
            >
              <h2 className="text-2xl font-bold text-white mb-2">
                أهلاً بك مرة أخرى
              </h2>
              <p className="text-gray-400 text-sm">
                سجل دخولك للوصول إلى لوحة التحكم
              </p>
            </motion.div>

            {/* Security Status - Simplified */}
            {formData.password && (
              <motion.div
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.5 }}
                className="mb-6"
              >
                <div className="flex items-center justify-between p-3 bg-white/5 backdrop-blur-sm rounded-xl border border-white/10">
                  <div className="flex items-center gap-2">
                    <Shield className="w-4 h-4 text-blue-400" />
                    <span className="text-white text-sm">قوة كلمة المرور</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span
                      className={`text-xs font-medium bg-gradient-to-r ${getSecurityColor()} bg-clip-text text-transparent`}
                    >
                      {getSecurityText()}
                    </span>
                    <div className="w-12 h-1 bg-gray-700 rounded-full">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${(securityLevel / 5) * 100}%` }}
                        className={`h-1 rounded-full bg-gradient-to-r ${getSecurityColor()}`}
                      />
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {/* Lockout Warning */}
            <AnimatePresence>
              {isLocked && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  className="mb-6 p-4 bg-red-500/10 backdrop-blur-sm rounded-xl border border-red-500/20"
                >
                  <div className="flex items-center gap-3 text-red-400">
                    <AlertCircle className="w-5 h-5" />
                    <div>
                      <div className="font-medium text-sm">
                        الحساب مقفل مؤقتاً
                      </div>
                      <div className="text-xs">
                        انتظر {formatTime(lockoutTime)} للمحاولة مرة أخرى
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Login Form */}
            <motion.form
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.7 }}
              onSubmit={handleSubmit}
              className="space-y-5"
            >
              <AnimatePresence>
                {error && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    className="p-3 bg-red-500/10 backdrop-blur-sm rounded-xl border border-red-500/20"
                  >
                    <div className="flex items-center gap-2 text-red-400">
                      <AlertCircle className="w-4 h-4" />
                      <span className="text-sm">{error}</span>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              <div className="space-y-4">
                <div className="relative">
                  <Input
                    label="البريد الإلكتروني أو اسم المستخدم"
                    name="usernameOrEmail"
                    type="text"
                    required
                    value={formData.usernameOrEmail}
                    onChange={handleChange}
                    placeholder="أدخل بريدك الإلكتروني أو اسم المستخدم"
                    disabled={isLocked}
                    className="bg-white/5 backdrop-blur-sm border-white/10 text-white placeholder-gray-400 focus:border-amber-500/50 focus:ring-amber-500/20"
                  />
                  <div className="absolute right-4 top-10 text-gray-400">
                    <User className="w-5 h-5" />
                  </div>
                </div>

                <div className="relative">
                  <Input
                    label="كلمة المرور"
                    name="password"
                    type={showPassword ? "text" : "password"}
                    required
                    value={formData.password}
                    onChange={handleChange}
                    placeholder="أدخل كلمة المرور"
                    disabled={isLocked}
                    className="bg-white/5 backdrop-blur-sm border-white/10 text-white placeholder-gray-400 focus:border-amber-500/50 focus:ring-amber-500/20"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-10 text-gray-400 hover:text-white transition-colors"
                    disabled={isLocked}
                  >
                    {showPassword ? (
                      <EyeOff className="w-5 h-5" />
                    ) : (
                      <Eye className="w-5 h-5" />
                    )}
                  </button>
                </div>
              </div>

              <motion.div
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.99 }}
                className="pt-2"
              >
                <button
                  type="submit"
                  disabled={isLocked || isLoading}
                  className="w-full h-12 bg-gradient-to-r from-amber-500 via-orange-500 to-red-500 hover:from-amber-600 hover:via-orange-600 hover:to-red-600 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold rounded-xl flex items-center justify-center gap-2 transition-all duration-300 shadow-lg hover:shadow-amber-500/25"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      <span>جاري تسجيل الدخول...</span>
                    </>
                  ) : (
                    <>
                      <ChefHat className="w-5 h-5" />
                      <span>تسجيل الدخول</span>
                    </>
                  )}
                </button>
              </motion.div>
            </motion.form>

            {/* Security Features - Simplified */}
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 1.0 }}
              className="mt-8 p-3 bg-white/5 backdrop-blur-sm rounded-xl border border-white/10"
            >
              <div className="flex items-center justify-center gap-6 text-xs text-gray-400">
                <div className="flex items-center gap-1">
                  <CheckCircle className="w-3 h-3 text-green-400" />
                  <span>تسجيل دخول آمن</span>
                </div>
                <div className="flex items-center gap-1">
                  <CheckCircle className="w-3 h-3 text-green-400" />
                  <span>حماية البيانات</span>
                </div>
                <div className="flex items-center gap-1">
                  <CheckCircle className="w-3 h-3 text-green-400" />
                  <span>دعم 24/7</span>
                </div>
              </div>
            </motion.div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default LoginPage;
