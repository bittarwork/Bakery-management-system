import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  Mail,
  Lock,
  Eye,
  EyeOff,
  AlertCircle,
  Loader2,
  User,
  ChefHat,
} from "lucide-react";
import { useAuthStore } from "../../stores/authStore";
import Input from "../../components/ui/Input";
import Logo from "../../components/ui/Logo";

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

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 relative overflow-hidden">
      {/* Simple Background Elements */}
      <div className="absolute inset-0">
        {/* Soft grid pattern */}
        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:80px_80px]" />

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
          className="absolute top-20 left-20 w-32 h-32 bg-gradient-to-r from-amber-500/5 to-orange-500/5 rounded-full blur-3xl"
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
          className="absolute bottom-20 right-20 w-40 h-40 bg-gradient-to-r from-purple-500/5 to-pink-500/5 rounded-full blur-3xl"
        />
      </div>

      {/* Main Content */}
      <div className="relative z-10 min-h-screen flex items-center justify-center p-8">
        <div className="w-full max-w-md">
          {/* Logo */}
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.8, ease: "backOut" }}
            className="flex justify-center mb-8"
          >
            <Logo size="3xl" animated={true} />
          </motion.div>

          {/* Form Header */}
          <motion.div
            initial={{ y: 30, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.3, duration: 0.8 }}
            className="text-center mb-8"
          >
            <h2 className="text-3xl font-bold text-white mb-3 bg-gradient-to-r from-amber-300 to-orange-300 bg-clip-text text-transparent">
              أهلاً بك مرة أخرى
            </h2>
            <p className="text-gray-300 text-lg">
              سجل دخولك للوصول إلى لوحة التحكم
            </p>
            <div className="w-20 h-1 bg-gradient-to-r from-amber-500 to-orange-500 mx-auto mt-4 rounded-full" />
          </motion.div>

          {/* Security Status */}
          {formData.password && (
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.5, duration: 0.6 }}
              className="mb-6"
            >
              <div className="p-4 bg-white/5 backdrop-blur-md rounded-2xl border border-white/10 hover:bg-white/8 transition-all duration-300">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-blue-500/20 rounded-lg">
                      <Lock className="w-4 h-4 text-blue-400" />
                    </div>
                    <span className="text-white text-sm font-medium">
                      قوة كلمة المرور
                    </span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span
                      className={`text-xs font-semibold bg-gradient-to-r ${getSecurityColor()} bg-clip-text text-transparent`}
                    >
                      {getSecurityText()}
                    </span>
                    <div className="w-16 h-2 bg-gray-700 rounded-full overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${(securityLevel / 5) * 100}%` }}
                        transition={{ duration: 0.8, ease: "easeOut" }}
                        className={`h-2 rounded-full bg-gradient-to-r ${getSecurityColor()} shadow-lg`}
                      />
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {/* Lockout Warning */}
          <AnimatePresence>
            {isLocked && (
              <motion.div
                initial={{ opacity: 0, height: 0, scale: 0.9 }}
                animate={{ opacity: 1, height: "auto", scale: 1 }}
                exit={{ opacity: 0, height: 0, scale: 0.9 }}
                className="mb-6 p-4 bg-red-500/10 backdrop-blur-md rounded-2xl border border-red-500/20"
              >
                <div className="flex items-center gap-3 text-red-400">
                  <div className="p-2 bg-red-500/20 rounded-lg">
                    <AlertCircle className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="font-semibold text-sm">
                      الحساب مقفل مؤقتاً
                    </div>
                    <div className="text-xs text-red-300">
                      انتظر {formatTime(lockoutTime)} للمحاولة مرة أخرى
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Login Form */}
          <motion.form
            initial={{ y: 30, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.7, duration: 0.8 }}
            onSubmit={handleSubmit}
            className="space-y-6"
          >
            <AnimatePresence>
              {error && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95, y: -10 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95, y: -10 }}
                  className="p-4 bg-red-500/10 backdrop-blur-md rounded-2xl border border-red-500/20"
                >
                  <div className="flex items-center gap-3 text-red-400">
                    <div className="p-1.5 bg-red-500/20 rounded-lg">
                      <AlertCircle className="w-4 h-4" />
                    </div>
                    <span className="text-sm font-medium">{error}</span>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            <div className="space-y-5">
              <div className="relative group">
                <Input
                  label="البريد الإلكتروني أو اسم المستخدم"
                  name="usernameOrEmail"
                  type="text"
                  required
                  value={formData.usernameOrEmail}
                  onChange={handleChange}
                  placeholder="أدخل بريدك الإلكتروني أو اسم المستخدم"
                  disabled={isLocked}
                  className="bg-white/5 backdrop-blur-md border-white/10 text-white placeholder-gray-400 focus:border-amber-500/50 focus:ring-amber-500/20 group-hover:border-white/20 transition-all duration-300"
                />
                <div className="absolute right-4 top-10 text-gray-400 group-hover:text-amber-400 transition-colors duration-300">
                  <User className="w-5 h-5" />
                </div>
              </div>

              <div className="relative group">
                <Input
                  label="كلمة المرور"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  required
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="أدخل كلمة المرور"
                  disabled={isLocked}
                  className="bg-white/5 backdrop-blur-md border-white/10 text-white placeholder-gray-400 focus:border-amber-500/50 focus:ring-amber-500/20 group-hover:border-white/20 transition-all duration-300"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-10 text-gray-400 hover:text-amber-400 transition-colors duration-300"
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

            {/* Login Button */}
            <motion.div
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="pt-2"
            >
              <button
                type="submit"
                disabled={isLocked || isLoading}
                className="w-full h-14 bg-gradient-to-r from-amber-500 via-orange-500 to-red-500 hover:from-amber-600 hover:via-orange-600 hover:to-red-600 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold rounded-2xl flex items-center justify-center gap-3 transition-all duration-300 shadow-lg hover:shadow-amber-500/25 hover:shadow-xl transform hover:-translate-y-0.5"
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

          {/* Simple Security Features */}
          <motion.div
            initial={{ y: 30, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 1.0, duration: 0.8 }}
            className="mt-8 p-4 bg-white/5 backdrop-blur-md rounded-2xl border border-white/10"
          >
            <div className="flex items-center justify-center gap-8 text-xs text-gray-400">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                <span>تسجيل دخول آمن</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                <span>حماية البيانات</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                <span>دعم 24/7</span>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
