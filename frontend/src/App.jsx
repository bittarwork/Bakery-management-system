import React, { useState, useEffect } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
// import { Toaster } from "react-hot-toast"; // تم استبداله بنظام التوست الجديد

// Styles
import "./styles/layout.css";

// Pages
import EnhancedLogin from "./pages/Auth/EnhancedLogin";

import EnhancedDashboard from "./pages/Dashboard/EnhancedDashboard";
import SimpleOrdersPage from "./pages/Orders/SimpleOrdersPage";
import AdvancedOrdersManagementPage from "./pages/Orders/AdvancedOrdersManagementPage";
import ProductsPage from "./pages/Products/ProductsPage";
import StoresPage from "./pages/Stores/StoresPage";

// Components
import SessionStatus from "./components/common/SessionStatus";
import EnhancedSessionManager from "./components/EnhancedSessionManager";
import Header from "./components/Layout/Header";
import Sidebar from "./components/Layout/Sidebar";

// Services
import authAPI from "./services/authAPI";

import sessionAPI from "./services/sessionAPI";

// Contexts
import { UserProvider } from "./contexts";

import { ToastProvider, useToastContext } from "./components/common";
import { setToastInstance, useAuthStore } from "./store/authStore";

// Component to initialize toast in authStore
const ToastInitializer = ({ children }) => {
  const toast = useToastContext();

  React.useEffect(() => {
    setToastInstance(toast);
  }, [toast]);

  return children;
};

// Component to initialize auth store
const AuthInitializer = ({ children }) => {
  const { initializeAuth, isAuthenticated, user } = useAuthStore();

  React.useEffect(() => {
    initializeAuth();
  }, [initializeAuth]);

  return children;
};

function App() {
  const {
    user,
    isAuthenticated,
    isLoading: authLoading,
    logout: authLogout,
  } = useAuthStore();

  const [sessionManagerOpen, setSessionManagerOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [sessionValidated, setSessionValidated] = useState(false);

  useEffect(() => {
    initializeApp();
  }, []);

  const initializeApp = async () => {
    try {
      // AuthInitializer will handle authentication initialization
      setSessionValidated(true);
    } catch (error) {
      console.error("خطأ في تهيئة التطبيق:", error);
    } finally {
      setLoading(false);
    }
  };

  // تطبيق التفضيلات فوراً بدون انتظار state update
  const applyPreferencesImmediately = (prefs) => {
    if (!prefs) return;

    const root = document.documentElement;

    // تطبيق المظهر
    const theme = prefs?.general?.theme || "light";
    root.classList.remove("dark");

    if (theme === "dark") {
      root.classList.add("dark");
    } else if (theme === "light") {
      root.classList.remove("dark");
    } else {
      // Auto theme
      const isDarkMode = window.matchMedia(
        "(prefers-color-scheme: dark)"
      ).matches;
      if (isDarkMode) {
        root.classList.add("dark");
      } else {
        root.classList.remove("dark");
      }
    }

    // تطبيق اللغة
    const language = prefs?.general?.language || "ar";
    root.lang = language;
    root.dir = language === "ar" ? "rtl" : "ltr";

    // تطبيق إعدادات إمكانية الوصول
    if (prefs?.accessibility?.high_contrast) {
      root.classList.add("high-contrast");
    } else {
      root.classList.remove("high-contrast");
    }

    if (prefs?.accessibility?.large_text) {
      root.classList.add("large-text");
    } else {
      root.classList.remove("large-text");
    }
  };

  const handleLogin = (userData, userPreferences) => {
    // The auth store will handle user state
    setPreferences(userPreferences);
    localStorage.setItem("userPreferences", JSON.stringify(userPreferences));
  };

  const handleLogout = async () => {
    try {
      // Use auth store logout which handles API call and state cleanup
      await authLogout();

      // Clean up local app state
      setPreferences(null);
      setSessionValidated(false);
      localStorage.removeItem("userPreferences");

      // إعادة تعيين DOM للحالة الافتراضية
      const root = document.documentElement;
      root.classList.remove("dark", "high-contrast", "large-text");
      root.lang = "ar";
      root.dir = "rtl";
    } catch (error) {
      console.error("خطأ في تسجيل الخروج:", error);
    }
  };

  // Protected Route Component
  const ProtectedRoute = ({ children }) => {
    if (!isAuthenticated || !user) {
      return <Navigate to="/login" replace />;
    }
    return children;
  };

  // Public Route Component
  const PublicRoute = ({ children }) => {
    if (isAuthenticated && user) {
      return <Navigate to="/dashboard" replace />;
    }
    return children;
  };

  if (loading || authLoading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 dark:border-blue-400 mx-auto"></div>
          <p className="mt-4 text-gray-600 dark:text-gray-300">
            جاري تحميل التطبيق...
          </p>
        </div>
      </div>
    );
  }

  return (
    <UserProvider value={{ user, handleLogout }}>
      <ToastProvider>
        <ToastInitializer>
          <AuthInitializer>
            <Router
              future={{
                v7_startTransition: true,
                v7_relativeSplatPath: true,
              }}
            >
              <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
                {/* تم استبدال react-hot-toast بنظام التوست الجديد المحسن */}

                <Routes>
                  {/* Public Routes */}
                  <Route
                    path="/login"
                    element={
                      <PublicRoute>
                        <EnhancedLogin onLogin={handleLogin} />
                      </PublicRoute>
                    }
                  />

                  {/* Protected Routes */}
                  <Route
                    path="/*"
                    element={
                      <ProtectedRoute>
                        <div className="flex h-screen bg-gray-50 dark:bg-gray-900">
                          {/* Sidebar */}
                          <Sidebar
                            isOpen={sidebarOpen}
                            onClose={() => setSidebarOpen(false)}
                          />

                          {/* Main content */}
                          <div className="flex-1 flex flex-col overflow-hidden">
                            {/* Header */}
                            <Header
                              user={user}
                              onMenuClick={() => setSidebarOpen(true)}
                              onSessionManagerOpen={() =>
                                setSessionManagerOpen(true)
                              }
                            />

                            {/* Main Content */}
                            <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-50 dark:bg-gray-900">
                              <Routes>
                                <Route
                                  path="/"
                                  element={<EnhancedDashboard />}
                                />
                                <Route
                                  path="/dashboard"
                                  element={<EnhancedDashboard />}
                                />
                                <Route
                                  path="/orders"
                                  element={<AdvancedOrdersManagementPage />}
                                />
                                <Route
                                  path="/orders/simple"
                                  element={<SimpleOrdersPage />}
                                />
                                <Route
                                  path="/orders/new"
                                  element={<AdvancedOrdersManagementPage />}
                                />
                                <Route
                                  path="/orders/:id"
                                  element={<AdvancedOrdersManagementPage />}
                                />

                                <Route
                                  path="/products"
                                  element={<ProductsPage />}
                                />
                                <Route
                                  path="/products/new"
                                  element={<ProductsPage />}
                                />
                                <Route
                                  path="/products/:id"
                                  element={<ProductsPage />}
                                />
                                <Route
                                  path="/stores"
                                  element={<StoresPage />}
                                />
                                <Route
                                  path="/stores/new"
                                  element={<div>إضافة متجر جديد</div>}
                                />
                                <Route
                                  path="/stores/:id"
                                  element={<div>تفاصيل المتجر</div>}
                                />
                                <Route
                                  path="/reports"
                                  element={<div>التقارير</div>}
                                />
                                <Route
                                  path="/reports/quick"
                                  element={<div>تقرير سريع</div>}
                                />

                                <Route
                                  path="/profile"
                                  element={<div>الصفحة الشخصية</div>}
                                />
                                <Route
                                  path="/notifications"
                                  element={<div>الإشعارات</div>}
                                />
                                <Route
                                  path="/search"
                                  element={<div>البحث</div>}
                                />
                                <Route
                                  path="*"
                                  element={<div>صفحة غير موجودة</div>}
                                />
                              </Routes>
                            </main>
                          </div>
                        </div>

                        {/* Session Manager Modal */}
                        {sessionManagerOpen && (
                          <EnhancedSessionManager
                            isOpen={sessionManagerOpen}
                            onClose={() => setSessionManagerOpen(false)}
                          />
                        )}
                      </ProtectedRoute>
                    }
                  />
                </Routes>
              </div>
            </Router>
          </AuthInitializer>
        </ToastInitializer>
      </ToastProvider>
    </UserProvider>
  );
}

export default App;
