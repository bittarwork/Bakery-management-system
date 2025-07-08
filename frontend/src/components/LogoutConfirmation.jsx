import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useUser } from "../contexts";
import sessionAPI from "../services/sessionAPI";
import toast from "react-hot-toast";

const LogoutConfirmation = ({ isOpen, onClose, type = "single" }) => {
  const [loading, setLoading] = useState(false);
  const [countdown, setCountdown] = useState(0);
  const [autoLogout, setAutoLogout] = useState(false);
  const { user, handleLogout } = useUser();
  const navigate = useNavigate();

  // Auto logout countdown (for emergency logout)
  useEffect(() => {
    if (type === "emergency" && isOpen) {
      setCountdown(10);
      setAutoLogout(true);

      const timer = setInterval(() => {
        setCountdown((prev) => {
          if (prev <= 1) {
            clearInterval(timer);
            handleEmergencyLogout();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);

      return () => clearInterval(timer);
    }
  }, [type, isOpen]);

  const handleSingleLogout = async () => {
    try {
      setLoading(true);
      await handleLogout();
      toast.success("تم تسجيل الخروج بنجاح");
      navigate("/login");
      onClose();
    } catch (error) {
      console.error("خطأ في تسجيل الخروج:", error);
      toast.error("فشل في تسجيل الخروج");
    } finally {
      setLoading(false);
    }
  };

  const handleAllDevicesLogout = async () => {
    try {
      setLoading(true);
      await sessionAPI.logoutAll();
      toast.success("تم تسجيل الخروج من جميع الأجهزة بنجاح");
      navigate("/login");
      onClose();
    } catch (error) {
      console.error("خطأ في تسجيل الخروج من جميع الأجهزة:", error);
      toast.error("فشل في تسجيل الخروج من جميع الأجهزة");
    } finally {
      setLoading(false);
    }
  };

  const handleEmergencyLogout = async () => {
    try {
      setLoading(true);
      // إزالة البيانات المحلية فوراً
      localStorage.clear();
      sessionStorage.clear();

      // محاولة إشعار الخادم (بدون انتظار)
      sessionAPI.logoutAll().catch(() => {
        // تجاهل الأخطاء في حالة الطوارئ
      });

      toast.success("تم تسجيل الخروج الطارئ بنجاح");
      window.location.href = "/login";
    } catch (error) {
      // في حالة الطوارئ، نتجاهل الأخطاء ونخرج بأي حال
      window.location.href = "/login";
    }
  };

  const cancelAutoLogout = () => {
    setAutoLogout(false);
    setCountdown(0);
  };

  if (!isOpen) return null;

  const getTitle = () => {
    switch (type) {
      case "all":
        return "تسجيل الخروج من جميع الأجهزة";
      case "emergency":
        return "تسجيل خروج طارئ";
      default:
        return "تسجيل الخروج";
    }
  };

  const getMessage = () => {
    switch (type) {
      case "all":
        return "سيتم تسجيل خروجك من جميع الأجهزة والمتصفحات. ستحتاج لإعادة تسجيل الدخول في كل جهاز.";
      case "emergency":
        return "سيتم تسجيل خروجك فوراً من جميع الأجهزة وحذف جميع البيانات المحفوظة محلياً.";
      default:
        return "هل أنت متأكد من تسجيل الخروج من هذا الجهاز؟";
    }
  };

  const getIcon = () => {
    switch (type) {
      case "all":
        return (
          <svg
            className="h-12 w-12 text-orange-500"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z"
            />
          </svg>
        );
      case "emergency":
        return (
          <svg
            className="h-12 w-12 text-red-500"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z"
            />
          </svg>
        );
      default:
        return (
          <svg
            className="h-12 w-12 text-blue-500"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
            />
          </svg>
        );
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4 transform transition-all">
        <div className="p-6">
          {/* Icon and Title */}
          <div className="flex items-center justify-center mb-4">
            {getIcon()}
          </div>

          <h3 className="text-lg font-semibold text-gray-900 text-center mb-2">
            {getTitle()}
          </h3>

          {/* User Info */}
          <div className="bg-gray-50 rounded-lg p-3 mb-4">
            <div className="flex items-center space-x-3">
              <div className="h-10 w-10 bg-blue-600 rounded-full flex items-center justify-center">
                <span className="text-sm font-bold text-white">
                  {user?.full_name?.charAt(0) ||
                    user?.username?.charAt(0) ||
                    "U"}
                </span>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-900">
                  {user?.full_name || user?.username}
                </p>
                <p className="text-xs text-gray-500">{user?.email}</p>
              </div>
            </div>
          </div>

          {/* Message */}
          <p className="text-sm text-gray-600 text-center mb-6">
            {getMessage()}
          </p>

          {/* Emergency Countdown */}
          {type === "emergency" && autoLogout && countdown > 0 && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <svg
                    className="h-5 w-5 text-red-500 mr-2"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                  <span className="text-sm text-red-700">
                    تسجيل خروج تلقائي خلال {countdown} ثانية
                  </span>
                </div>
                <button
                  onClick={cancelAutoLogout}
                  className="text-xs text-red-600 hover:text-red-800 underline"
                >
                  إلغاء
                </button>
              </div>
              <div className="mt-2 bg-red-200 rounded-full h-2">
                <div
                  className="bg-red-500 h-2 rounded-full transition-all duration-1000"
                  style={{ width: `${(countdown / 10) * 100}%` }}
                ></div>
              </div>
            </div>
          )}

          {/* Security Warning */}
          {type !== "single" && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 mb-4">
              <div className="flex">
                <svg
                  className="h-5 w-5 text-yellow-500 mr-2 mt-0.5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z"
                  />
                </svg>
                <div>
                  <p className="text-sm font-medium text-yellow-800">
                    تحذير أمني
                  </p>
                  <p className="text-xs text-yellow-700 mt-1">
                    استخدم هذا الخيار فقط إذا كنت تشك في تعرض حسابك للاختراق أو
                    فقدان جهاز.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex space-x-3">
            <button
              onClick={onClose}
              disabled={loading || (autoLogout && countdown > 0)}
              className="flex-1 px-4 py-2 text-sm font-medium text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-500 disabled:opacity-50 transition-colors"
            >
              إلغاء
            </button>

            <button
              onClick={() => {
                switch (type) {
                  case "all":
                    handleAllDevicesLogout();
                    break;
                  case "emergency":
                    handleEmergencyLogout();
                    break;
                  default:
                    handleSingleLogout();
                    break;
                }
              }}
              disabled={loading}
              className={`flex-1 px-4 py-2 text-sm font-medium text-white rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 transition-colors ${
                type === "emergency"
                  ? "bg-red-600 hover:bg-red-700 focus:ring-red-500"
                  : type === "all"
                  ? "bg-orange-600 hover:bg-orange-700 focus:ring-orange-500"
                  : "bg-blue-600 hover:bg-blue-700 focus:ring-blue-500"
              }`}
            >
              {loading ? (
                <div className="flex items-center justify-center">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  جاري التنفيذ...
                </div>
              ) : (
                <>
                  {type === "emergency"
                    ? "خروج طارئ"
                    : type === "all"
                    ? "خروج من الكل"
                    : "تسجيل خروج"}
                  {autoLogout && countdown > 0 && ` (${countdown})`}
                </>
              )}
            </button>
          </div>

          {/* Additional Info */}
          <div className="mt-4 text-center">
            <p className="text-xs text-gray-500">
              {type === "single"
                ? "يمكنك تسجيل الدخول مرة أخرى في أي وقت"
                : "ستحتاج لإعادة تسجيل الدخول في جميع الأجهزة"}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LogoutConfirmation;
