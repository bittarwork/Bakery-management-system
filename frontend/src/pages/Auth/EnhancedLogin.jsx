import React, { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuthStore } from "../../store/authStore";
import authAPI from "../../services/authAPI";
import sessionAPI from "../../services/sessionAPI";
import preferencesAPI from "../../services/preferencesAPI";

const EnhancedLogin = ({ onLogin }) => {
  const navigate = useNavigate();
  const { login, isLoading: authLoading, isAuthenticated } = useAuthStore();
  const [formData, setFormData] = useState({
    username: "",
    password: "",
    remember_me: false,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [deviceInfo, setDeviceInfo] = useState(null);

  useEffect(() => {
    // جمع معلومات الجهاز
    const getDeviceInfo = () => {
      const userAgent = navigator.userAgent;
      const platform = navigator.platform;

      return {
        userAgent,
        platform,
        language: navigator.language,
        cookieEnabled: navigator.cookieEnabled,
        screenResolution: `${screen.width}x${screen.height}`,
        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      };
    };

    setDeviceInfo(getDeviceInfo());
  }, []);

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated) {
      navigate("/dashboard");
    }
  }, [isAuthenticated, navigate]);

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      // Use auth store login
      const result = await login({
        ...formData,
        device_info: deviceInfo,
      });

      if (result.success) {
        // محاولة تحميل التفضيلات
        let userPreferences = null;
        try {
          const preferencesResponse = await preferencesAPI.getUserPreferences();
          userPreferences = preferencesResponse.data;
          localStorage.setItem(
            "userPreferences",
            JSON.stringify(userPreferences)
          );
        } catch (prefError) {
          console.log("لم يتم العثور على تفضيلات، سيتم إنشاؤها تلقائياً");
          // إنشاء تفضيلات افتراضية
          userPreferences = {
            general: {
              language: "ar",
              theme: "light",
              timezone: "Asia/Riyadh",
            },
            notifications: {
              email: true,
              push: true,
              sms: false,
            },
            display: {
              items_per_page: 20,
              default_view: "table",
            },
          };
        }

        // استخدام دالة onLogin من App.jsx لتحديث التفضيلات
        if (onLogin) {
          console.log("🔄 تحديث تفضيلات التطبيق...", {
            userPreferences,
          });
          onLogin(null, userPreferences); // userData is handled by auth store
        }

        // إعادة التوجيه إلى الداشبورد
        console.log("🚀 إعادة التوجيه إلى /dashboard");
        navigate("/dashboard");
      } else {
        setError(result.error || "خطأ في تسجيل الدخول");
      }
    } catch (error) {
      console.error("خطأ في تسجيل الدخول:", error);
      setError(error.message || "خطأ في تسجيل الدخول");
    } finally {
      setLoading(false);
    }
  };

  const getBrowserIcon = () => {
    const userAgent = navigator.userAgent;

    if (userAgent.includes("Chrome")) {
      return (
        <svg
          className="h-5 w-5 text-blue-500"
          viewBox="0 0 24 24"
          fill="currentColor"
        >
          <path d="M12 0C5.37 0 0 5.37 0 12s5.37 12 12 12 12-5.37 12-12S18.63 0 12 0zM8.11 8.11c1.33-1.33 3.11-2.06 5.03-2.06h6.77c-.74-1.69-2.02-3.12-3.64-4.04C14.65.95 13.36.5 12 .5S9.35.95 7.73 2.01c-1.62.92-2.9 2.35-3.64 4.04h4.02zm3.89 3.89c1.1 0 2 .9 2 2s-.9 2-2 2-2-.9-2-2 .9-2 2-2z" />
        </svg>
      );
    }

    if (userAgent.includes("Firefox")) {
      return (
        <svg
          className="h-5 w-5 text-orange-500"
          viewBox="0 0 24 24"
          fill="currentColor"
        >
          <path d="M21.73 12.89c.29-1.2.27-2.47-.06-3.69-.33-1.21-.92-2.34-1.73-3.29-.81-.95-1.82-1.71-2.96-2.22C15.85 3.25 14.43 3 13 3.02c-.37 0-.73.02-1.1.06.2-.44.31-.92.31-1.42 0-.59-.17-1.15-.47-1.61l-.01-.01c-.05-.08-.1-.15-.16-.22-.86-.88-2.07-1.4-3.36-1.4-1.28 0-2.49.51-3.36 1.4-.07.07-.12.14-.17.22l-.01.01c-.3.46-.47 1.02-.47 1.61 0 .5.11.98.31 1.42-.37-.04-.73-.06-1.1-.06-1.43-.02-2.85.23-4.18.67-1.14.51-2.15 1.27-2.96 2.22-.81.95-1.4 2.08-1.73 3.29-.33 1.22-.35 2.49-.06 3.69.29 1.19.82 2.32 1.56 3.29.74.97 1.67 1.76 2.74 2.31 1.07.55 2.25.85 3.47.88 1.21.03 2.44-.21 3.59-.7 1.15-.49 2.18-1.24 3.01-2.19.83-.95 1.44-2.07 1.78-3.28.34-1.21.39-2.49.15-3.73z" />
        </svg>
      );
    }

    return (
      <svg
        className="h-5 w-5 text-gray-500"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
        />
      </svg>
    );
  };

  const getDeviceType = () => {
    const userAgent = navigator.userAgent;

    if (userAgent.includes("Mobile")) return "جوال";
    if (userAgent.includes("Tablet")) return "تابلت";
    return "كمبيوتر";
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 via-blue-800 to-indigo-900 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        {/* Header */}
        <div className="text-center">
          <div className="mx-auto h-16 w-16 bg-white rounded-full flex items-center justify-center shadow-lg">
            <svg
              className="h-10 w-10 text-blue-600"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
              />
            </svg>
          </div>
          <h2 className="mt-6 text-3xl font-extrabold text-white">
            نظام إدارة المخابز
          </h2>
          <p className="mt-2 text-sm text-blue-200">
            سجل دخولك للوصول إلى النظام المحسن
          </p>
        </div>

        {/* Device Info Card */}
        <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4 border border-white/20">
          <div className="flex items-center space-x-3">
            {getBrowserIcon()}
            <div className="flex-1 text-white">
              <p className="text-sm font-medium">
                تسجيل الدخول من {getDeviceType()}
              </p>
              <p className="text-xs text-blue-200">
                {deviceInfo?.timezone} • {deviceInfo?.language}
              </p>
            </div>
            <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
          </div>
        </div>

        {/* Login Form */}
        <div className="bg-white rounded-xl shadow-2xl p-8">
          <form className="space-y-6" onSubmit={handleSubmit}>
            {error && (
              <div className="bg-red-50 border border-red-200 rounded-md p-4">
                <div className="flex">
                  <svg
                    className="h-5 w-5 text-red-400"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                  <div className="mr-3">
                    <p className="text-sm text-red-800">{error}</p>
                  </div>
                </div>
              </div>
            )}

            <div>
              <label htmlFor="username" className="sr-only">
                اسم المستخدم
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                  <svg
                    className="h-5 w-5 text-gray-400"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                    />
                  </svg>
                </div>
                <input
                  id="username"
                  name="username"
                  type="text"
                  required
                  value={formData.username}
                  onChange={handleInputChange}
                  className="appearance-none rounded-lg relative block w-full px-3 py-3 pr-10 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm"
                  placeholder="اسم المستخدم"
                />
              </div>
            </div>

            <div>
              <label htmlFor="password" className="sr-only">
                كلمة المرور
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                  <svg
                    className="h-5 w-5 text-gray-400"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                    />
                  </svg>
                </div>
                <input
                  id="password"
                  name="password"
                  type="password"
                  required
                  value={formData.password}
                  onChange={handleInputChange}
                  className="appearance-none rounded-lg relative block w-full px-3 py-3 pr-10 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm"
                  placeholder="كلمة المرور"
                />
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <input
                  id="remember_me"
                  name="remember_me"
                  type="checkbox"
                  checked={formData.remember_me}
                  onChange={handleInputChange}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label
                  htmlFor="remember_me"
                  className="mr-2 block text-sm text-gray-900"
                >
                  تذكرني (30 يوم)
                </label>
              </div>
            </div>

            <div>
              <button
                type="submit"
                disabled={loading || authLoading}
                className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-lg text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
              >
                <span className="absolute right-0 inset-y-0 flex items-center pr-3">
                  {loading || authLoading ? (
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                  ) : (
                    <svg
                      className="h-5 w-5 text-blue-500 group-hover:text-blue-400"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                      />
                    </svg>
                  )}
                </span>
                {loading || authLoading
                  ? "جاري تسجيل الدخول..."
                  : "تسجيل الدخول"}
              </button>
            </div>

            <div className="text-center">
              <Link
                to="/register"
                className="text-sm text-blue-600 hover:text-blue-800 font-medium"
              >
                ليس لديك حساب؟ سجل الآن
              </Link>
            </div>
          </form>
        </div>

        {/* Security Notice */}
        <div className="bg-blue-800/30 backdrop-blur-sm rounded-lg p-4 border border-blue-400/30">
          <div className="flex items-start space-x-3">
            <svg
              className="h-5 w-5 text-blue-300 mt-0.5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
              />
            </svg>
            <div className="text-blue-100">
              <p className="text-sm font-medium">أمان محسن</p>
              <p className="text-xs text-blue-200 mt-1">
                يتم تتبع جلسات تسجيل الدخول وحمايتها بتشفير متقدم
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EnhancedLogin;
