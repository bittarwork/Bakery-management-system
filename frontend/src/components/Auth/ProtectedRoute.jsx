import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Lock, Loader } from "lucide-react";
import toast from "react-hot-toast";

const ProtectedRoute = ({ children, requiredRole = null }) => {
  const navigate = useNavigate();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const checkAuth = () => {
      const token = localStorage.getItem("token");
      const userStr = localStorage.getItem("user");

      if (!token || !userStr) {
        toast.error("يجب تسجيل الدخول أولاً");
        navigate("/auth/login");
        return;
      }

      try {
        const user = JSON.parse(userStr);

        // التحقق من الدور إذا كان مطلوباً
        if (requiredRole && user.role !== requiredRole) {
          toast.error("غير مصرح لك بالوصول إلى هذه الصفحة");
          navigate("/dashboard");
          return;
        }

        // التحقق من صلاحية التوكن
        const tokenParts = token.split(".");
        if (tokenParts.length !== 3) {
          localStorage.removeItem("token");
          localStorage.removeItem("user");
          toast.error("انتهت صلاحية جلسة العمل");
          navigate("/auth/login");
          return;
        }

        try {
          const payload = JSON.parse(atob(tokenParts[1]));
          const now = Date.now() / 1000;

          if (payload.exp < now) {
            localStorage.removeItem("token");
            localStorage.removeItem("user");
            toast.error("انتهت صلاحية جلسة العمل");
            navigate("/auth/login");
            return;
          }
        } catch (e) {
          console.error("Error parsing token:", e);
          localStorage.removeItem("token");
          localStorage.removeItem("user");
          toast.error("رمز المصادقة غير صحيح");
          navigate("/auth/login");
          return;
        }

        setIsAuthenticated(true);
      } catch (e) {
        console.error("Error parsing user data:", e);
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        toast.error("بيانات المستخدم غير صحيحة");
        navigate("/auth/login");
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();
  }, [navigate, requiredRole]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <Loader className="h-8 w-8 animate-spin text-blue-500 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            جاري التحقق من المصادقة...
          </h3>
          <p className="text-gray-500">الرجاء الانتظار</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <Lock className="h-16 w-16 text-red-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            غير مصرح بالوصول
          </h3>
          <p className="text-gray-500 mb-4">
            يتم إعادة توجيهك لصفحة تسجيل الدخول...
          </p>
        </div>
      </div>
    );
  }

  return children;
};

export default ProtectedRoute;
