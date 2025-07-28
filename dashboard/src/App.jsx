import React, { Suspense, useEffect, useState } from "react";
import { Routes, Route, Navigate, Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { useAuthStore } from "./stores/authStore";
import { useSystemStore } from "./stores/systemStore";
import { toast } from "react-hot-toast";

// Layout Components
import AuthLayout from "./components/layout/AuthLayout";
import DashboardLayout from "./components/layout/DashboardLayout";

// Pages - Authentication
import LoginPage from "./pages/auth/LoginPage";

// Pages - Dashboard
import DashboardHomePage from "./pages/dashboard/DashboardHomePage";
import AnalyticsPage from "./pages/dashboard/AnalyticsPage";

// Pages - Distribution
import DistributionManagerDashboard from "./pages/distribution/DistributionManagerDashboard";
import DailyOperationsPage from "./pages/distribution/DailyOperationsPage";
import LiveTrackingPage from "./pages/distribution/LiveTrackingPage";
import DistributorDetails from "./pages/distribution/DistributorDetails";

// Pages - Orders
import OrdersListPage from "./pages/orders/OrdersListPage";
import OrderDetailsPage from "./pages/orders/OrderDetailsPage";
import CreateOrderPage from "./pages/orders/CreateOrderPage";
import EditOrderPage from "./pages/orders/EditOrderPage";
import OrderReportsPage from "./pages/orders/OrderReportsPage";

// Pages - Stores
import StoresListPage from "./pages/stores/StoresListPage";
import StoreDetailsPage from "./pages/stores/StoreDetailsPage";
import CreateStorePage from "./pages/stores/CreateStorePage";
import EditStorePage from "./pages/stores/EditStorePage";

// Pages - Products
import ProductsListPage from "./pages/products/ProductsListPage";
import ProductDetailsPage from "./pages/products/ProductDetailsPage";
import CreateProductPage from "./pages/products/CreateProductPage";
import EditProductPage from "./pages/products/EditProductPage";

// Pages - Users
import UsersListPage from "./pages/users/UsersListPage";
import UserDetailsPage from "./pages/users/UserDetailsPage";
import CreateUserPage from "./pages/users/CreateUserPage";
import EditUserPage from "./pages/users/EditUserPage";
import UserProfilePage from "./pages/users/UserProfilePage";

// Pages - Vehicles
import VehicleManagementPage from "./pages/vehicles/VehicleManagementPage";
import VehicleDetailsPage from "./pages/vehicles/VehicleDetailsPage";
import AddVehiclePage from "./pages/vehicles/AddVehiclePage";
import EditVehiclePage from "./pages/vehicles/EditVehiclePage";
import VehicleExpensesPage from "./pages/vehicles/VehicleExpensesPage";

// Pages - Reports
import ReportsOverviewPage from "./pages/reports/ReportsOverviewPage";

// Pages - Settings
import GeneralSettingsPage from "./pages/settings/GeneralSettingsPage";
import SystemConfigPage from "./pages/settings/SystemConfigPage";

// Pages - AI Chat
import AIChatPage from "./pages/ai-chat/AIChatPage";

// Components
import LoadingSpinner from "./components/ui/LoadingSpinner";
import ErrorBoundary from "./components/ui/ErrorBoundary";

// Page transition animations
const pageVariants = {
  initial: { opacity: 0, x: -10 },
  animate: { opacity: 1, x: 0 },
  exit: { opacity: 0, x: 10 },
};

const pageTransition = {
  type: "tween",
  ease: "anticipate",
  duration: 0.3,
};

// Protected Route Component
const ProtectedRoute = ({ children, allowedRoles = [] }) => {
  const { user, isAuthenticated } = useAuthStore();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles.length > 0 && !allowedRoles.includes(user?.role)) {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
};

// Public Route Component (for login page)
const PublicRoute = ({ children }) => {
  const { isAuthenticated } = useAuthStore();

  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
};

const App = () => {
  const {
    initializeAuth,
    isAuthenticated,
    isLoading: authLoading,
    isInitialized: authInitialized,
  } = useAuthStore();
  const {
    loadSystemSettings,
    initializeSystemStore,
    isLoading: systemLoading,
    systemSettingsInitialized,
  } = useSystemStore();
  const [isOnline, setIsOnline] = useState(navigator.onLine);

  // Network status monitoring
  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      toast.success("تم استعادة الاتصال بالإنترنت");
    };
    const handleOffline = () => {
      setIsOnline(false);
      toast.error("فقد الاتصال بالإنترنت");
    };

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  useEffect(() => {
    // Initialize authentication state and basic system store
    initializeAuth();
    initializeSystemStore(); // Initialize with default settings immediately
  }, []); // Empty dependency array to run only once

  // Load system settings only after successful authentication
  useEffect(() => {
    if (authInitialized && isAuthenticated && !systemSettingsInitialized) {
      loadSystemSettings();
    }
  }, [
    authInitialized,
    isAuthenticated,
    systemSettingsInitialized,
    loadSystemSettings,
  ]);

  // Show toast when initialization is complete
  useEffect(() => {
    if (authInitialized && systemSettingsInitialized) {
      // Only show toast if we're not already showing one
      if (!isAuthenticated) {
        toast("مرحباً! يرجى تسجيل الدخول للوصول للنظام", {
          icon: "ℹ️",
          duration: 4000,
          id: "welcome-message", // Prevent duplicate toasts
        });
      } else {
        toast.success("تم تحميل النظام بنجاح", {
          id: "system-loaded", // Prevent duplicate toasts
        });
      }
    }
  }, [authInitialized, systemSettingsInitialized, isAuthenticated]);

  // Show loading spinner while initializing
  if (!authInitialized || !systemSettingsInitialized) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <ErrorBoundary>
      <div className="min-h-screen bg-gray-50">
        {/* Network Status Indicator */}
        {!isOnline && (
          <div className="fixed top-0 left-0 right-0 bg-red-500 text-white text-center py-2 z-50">
            لا يوجد اتصال بالإنترنت
          </div>
        )}

        <AnimatePresence mode="wait">
          <Routes>
            {/* Public Routes */}
            <Route
              path="/login"
              element={
                <PublicRoute>
                  <AuthLayout>
                    <motion.div
                      variants={pageVariants}
                      initial="initial"
                      animate="animate"
                      exit="exit"
                      transition={pageTransition}
                    >
                      <Suspense fallback={<LoadingSpinner />}>
                        <LoginPage />
                      </Suspense>
                    </motion.div>
                  </AuthLayout>
                </PublicRoute>
              }
            />

            {/* Protected Routes */}
            <Route
              path="/dashboard"
              element={
                <ProtectedRoute>
                  <DashboardLayout>
                    <motion.div
                      variants={pageVariants}
                      initial="initial"
                      animate="animate"
                      exit="exit"
                      transition={pageTransition}
                    >
                      <Suspense fallback={<LoadingSpinner />}>
                        <DashboardHomePage />
                      </Suspense>
                    </motion.div>
                  </DashboardLayout>
                </ProtectedRoute>
              }
            />

            <Route
              path="/analytics"
              element={
                <ProtectedRoute>
                  <DashboardLayout>
                    <motion.div
                      variants={pageVariants}
                      initial="initial"
                      animate="animate"
                      exit="exit"
                      transition={pageTransition}
                    >
                      <Suspense fallback={<LoadingSpinner />}>
                        <AnalyticsPage />
                      </Suspense>
                    </motion.div>
                  </DashboardLayout>
                </ProtectedRoute>
              }
            />

            {/* Distribution Routes */}
            <Route
              path="/distribution"
              element={<Navigate to="/distribution/manager" replace />}
            />

            <Route
              path="/distribution/manager"
              element={
                <ProtectedRoute allowedRoles={["admin", "manager"]}>
                  <DashboardLayout>
                    <motion.div
                      variants={pageVariants}
                      initial="initial"
                      animate="animate"
                      exit="exit"
                      transition={pageTransition}
                    >
                      <Suspense fallback={<LoadingSpinner />}>
                        <DistributionManagerDashboard />
                      </Suspense>
                    </motion.div>
                  </DashboardLayout>
                </ProtectedRoute>
              }
            />

            <Route
              path="/distribution/daily-operations"
              element={
                <ProtectedRoute allowedRoles={["admin", "manager"]}>
                  <DashboardLayout>
                    <motion.div
                      variants={pageVariants}
                      initial="initial"
                      animate="animate"
                      exit="exit"
                      transition={pageTransition}
                    >
                      <Suspense fallback={<LoadingSpinner />}>
                        <DailyOperationsPage />
                      </Suspense>
                    </motion.div>
                  </DashboardLayout>
                </ProtectedRoute>
              }
            />

            <Route
              path="/distribution/live-tracking"
              element={
                <ProtectedRoute allowedRoles={["admin", "manager"]}>
                  <DashboardLayout>
                    <motion.div
                      variants={pageVariants}
                      initial="initial"
                      animate="animate"
                      exit="exit"
                      transition={pageTransition}
                    >
                      <Suspense fallback={<LoadingSpinner />}>
                        <LiveTrackingPage />
                      </Suspense>
                    </motion.div>
                  </DashboardLayout>
                </ProtectedRoute>
              }
            />

            <Route
              path="/distribution/distributor/:id"
              element={
                <ProtectedRoute allowedRoles={["admin", "manager"]}>
                  <DashboardLayout>
                    <motion.div
                      variants={pageVariants}
                      initial="initial"
                      animate="animate"
                      exit="exit"
                      transition={pageTransition}
                    >
                      <Suspense fallback={<LoadingSpinner />}>
                        <DistributorDetails />
                      </Suspense>
                    </motion.div>
                  </DashboardLayout>
                </ProtectedRoute>
              }
            />

            {/* Orders Routes */}
            <Route
              path="/orders"
              element={
                <ProtectedRoute>
                  <DashboardLayout>
                    <motion.div
                      variants={pageVariants}
                      initial="initial"
                      animate="animate"
                      exit="exit"
                      transition={pageTransition}
                    >
                      <Suspense fallback={<LoadingSpinner />}>
                        <OrdersListPage />
                      </Suspense>
                    </motion.div>
                  </DashboardLayout>
                </ProtectedRoute>
              }
            />

            <Route
              path="/orders/:id"
              element={
                <ProtectedRoute>
                  <DashboardLayout>
                    <motion.div
                      variants={pageVariants}
                      initial="initial"
                      animate="animate"
                      exit="exit"
                      transition={pageTransition}
                    >
                      <Suspense fallback={<LoadingSpinner />}>
                        <OrderDetailsPage />
                      </Suspense>
                    </motion.div>
                  </DashboardLayout>
                </ProtectedRoute>
              }
            />

            <Route
              path="/orders/create"
              element={
                <ProtectedRoute>
                  <DashboardLayout>
                    <motion.div
                      variants={pageVariants}
                      initial="initial"
                      animate="animate"
                      exit="exit"
                      transition={pageTransition}
                    >
                      <Suspense fallback={<LoadingSpinner />}>
                        <CreateOrderPage />
                      </Suspense>
                    </motion.div>
                  </DashboardLayout>
                </ProtectedRoute>
              }
            />

            <Route
              path="/orders/:id/edit"
              element={
                <ProtectedRoute>
                  <DashboardLayout>
                    <motion.div
                      variants={pageVariants}
                      initial="initial"
                      animate="animate"
                      exit="exit"
                      transition={pageTransition}
                    >
                      <Suspense fallback={<LoadingSpinner />}>
                        <EditOrderPage />
                      </Suspense>
                    </motion.div>
                  </DashboardLayout>
                </ProtectedRoute>
              }
            />

            <Route
              path="/orders/reports"
              element={
                <ProtectedRoute allowedRoles={["admin", "manager"]}>
                  <DashboardLayout>
                    <motion.div
                      variants={pageVariants}
                      initial="initial"
                      animate="animate"
                      exit="exit"
                      transition={pageTransition}
                    >
                      <Suspense fallback={<LoadingSpinner />}>
                        <OrderReportsPage />
                      </Suspense>
                    </motion.div>
                  </DashboardLayout>
                </ProtectedRoute>
              }
            />

            {/* Stores Routes */}
            <Route
              path="/stores"
              element={
                <ProtectedRoute>
                  <DashboardLayout>
                    <motion.div
                      variants={pageVariants}
                      initial="initial"
                      animate="animate"
                      exit="exit"
                      transition={pageTransition}
                    >
                      <Suspense fallback={<LoadingSpinner />}>
                        <StoresListPage />
                      </Suspense>
                    </motion.div>
                  </DashboardLayout>
                </ProtectedRoute>
              }
            />

            <Route
              path="/stores/:id"
              element={
                <ProtectedRoute>
                  <DashboardLayout>
                    <motion.div
                      variants={pageVariants}
                      initial="initial"
                      animate="animate"
                      exit="exit"
                      transition={pageTransition}
                    >
                      <Suspense fallback={<LoadingSpinner />}>
                        <StoreDetailsPage />
                      </Suspense>
                    </motion.div>
                  </DashboardLayout>
                </ProtectedRoute>
              }
            />

            <Route
              path="/stores/create"
              element={
                <ProtectedRoute>
                  <DashboardLayout>
                    <motion.div
                      variants={pageVariants}
                      initial="initial"
                      animate="animate"
                      exit="exit"
                      transition={pageTransition}
                    >
                      <Suspense fallback={<LoadingSpinner />}>
                        <CreateStorePage />
                      </Suspense>
                    </motion.div>
                  </DashboardLayout>
                </ProtectedRoute>
              }
            />

            <Route
              path="/stores/:id/edit"
              element={
                <ProtectedRoute>
                  <DashboardLayout>
                    <motion.div
                      variants={pageVariants}
                      initial="initial"
                      animate="animate"
                      exit="exit"
                      transition={pageTransition}
                    >
                      <Suspense fallback={<LoadingSpinner />}>
                        <EditStorePage />
                      </Suspense>
                    </motion.div>
                  </DashboardLayout>
                </ProtectedRoute>
              }
            />

            {/* Products Routes */}
            <Route
              path="/products"
              element={
                <ProtectedRoute>
                  <DashboardLayout>
                    <motion.div
                      variants={pageVariants}
                      initial="initial"
                      animate="animate"
                      exit="exit"
                      transition={pageTransition}
                    >
                      <Suspense fallback={<LoadingSpinner />}>
                        <ProductsListPage />
                      </Suspense>
                    </motion.div>
                  </DashboardLayout>
                </ProtectedRoute>
              }
            />

            <Route
              path="/products/create"
              element={
                <ProtectedRoute>
                  <DashboardLayout>
                    <motion.div
                      variants={pageVariants}
                      initial="initial"
                      animate="animate"
                      exit="exit"
                      transition={pageTransition}
                    >
                      <Suspense fallback={<LoadingSpinner />}>
                        <CreateProductPage />
                      </Suspense>
                    </motion.div>
                  </DashboardLayout>
                </ProtectedRoute>
              }
            />

            <Route
              path="/products/:id"
              element={
                <ProtectedRoute>
                  <DashboardLayout>
                    <motion.div
                      variants={pageVariants}
                      initial="initial"
                      animate="animate"
                      exit="exit"
                      transition={pageTransition}
                    >
                      <Suspense fallback={<LoadingSpinner />}>
                        <ProductDetailsPage />
                      </Suspense>
                    </motion.div>
                  </DashboardLayout>
                </ProtectedRoute>
              }
            />

            <Route
              path="/products/:id/edit"
              element={
                <ProtectedRoute>
                  <DashboardLayout>
                    <motion.div
                      variants={pageVariants}
                      initial="initial"
                      animate="animate"
                      exit="exit"
                      transition={pageTransition}
                    >
                      <Suspense fallback={<LoadingSpinner />}>
                        <EditProductPage />
                      </Suspense>
                    </motion.div>
                  </DashboardLayout>
                </ProtectedRoute>
              }
            />

            {/* Users Routes */}
            <Route
              path="/users"
              element={
                <ProtectedRoute allowedRoles={["admin"]}>
                  <DashboardLayout>
                    <motion.div
                      variants={pageVariants}
                      initial="initial"
                      animate="animate"
                      exit="exit"
                      transition={pageTransition}
                    >
                      <Suspense fallback={<LoadingSpinner />}>
                        <UsersListPage />
                      </Suspense>
                    </motion.div>
                  </DashboardLayout>
                </ProtectedRoute>
              }
            />

            <Route
              path="/users/:id"
              element={
                <ProtectedRoute allowedRoles={["admin"]}>
                  <DashboardLayout>
                    <motion.div
                      variants={pageVariants}
                      initial="initial"
                      animate="animate"
                      exit="exit"
                      transition={pageTransition}
                    >
                      <Suspense fallback={<LoadingSpinner />}>
                        <UserDetailsPage />
                      </Suspense>
                    </motion.div>
                  </DashboardLayout>
                </ProtectedRoute>
              }
            />

            <Route
              path="/users/create"
              element={
                <ProtectedRoute allowedRoles={["admin"]}>
                  <DashboardLayout>
                    <motion.div
                      variants={pageVariants}
                      initial="initial"
                      animate="animate"
                      exit="exit"
                      transition={pageTransition}
                    >
                      <Suspense fallback={<LoadingSpinner />}>
                        <CreateUserPage />
                      </Suspense>
                    </motion.div>
                  </DashboardLayout>
                </ProtectedRoute>
              }
            />

            <Route
              path="/users/:id/edit"
              element={
                <ProtectedRoute allowedRoles={["admin"]}>
                  <DashboardLayout>
                    <motion.div
                      variants={pageVariants}
                      initial="initial"
                      animate="animate"
                      exit="exit"
                      transition={pageTransition}
                    >
                      <Suspense fallback={<LoadingSpinner />}>
                        <EditUserPage />
                      </Suspense>
                    </motion.div>
                  </DashboardLayout>
                </ProtectedRoute>
              }
            />

            <Route
              path="/profile"
              element={
                <ProtectedRoute>
                  <DashboardLayout>
                    <motion.div
                      variants={pageVariants}
                      initial="initial"
                      animate="animate"
                      exit="exit"
                      transition={pageTransition}
                    >
                      <Suspense fallback={<LoadingSpinner />}>
                        <UserProfilePage />
                      </Suspense>
                    </motion.div>
                  </DashboardLayout>
                </ProtectedRoute>
              }
            />

            {/* Vehicles Routes */}
            <Route
              path="/vehicles"
              element={
                <ProtectedRoute allowedRoles={["admin", "manager"]}>
                  <DashboardLayout>
                    <motion.div
                      variants={pageVariants}
                      initial="initial"
                      animate="animate"
                      exit="exit"
                      transition={pageTransition}
                    >
                      <Suspense fallback={<LoadingSpinner />}>
                        <VehicleManagementPage />
                      </Suspense>
                    </motion.div>
                  </DashboardLayout>
                </ProtectedRoute>
              }
            />

            <Route
              path="/vehicles/details/:id"
              element={
                <ProtectedRoute allowedRoles={["admin", "manager"]}>
                  <DashboardLayout>
                    <motion.div
                      variants={pageVariants}
                      initial="initial"
                      animate="animate"
                      exit="exit"
                      transition={pageTransition}
                    >
                      <Suspense fallback={<LoadingSpinner />}>
                        <VehicleDetailsPage />
                      </Suspense>
                    </motion.div>
                  </DashboardLayout>
                </ProtectedRoute>
              }
            />

            <Route
              path="/vehicles/add"
              element={
                <ProtectedRoute allowedRoles={["admin", "manager"]}>
                  <DashboardLayout>
                    <motion.div
                      variants={pageVariants}
                      initial="initial"
                      animate="animate"
                      exit="exit"
                      transition={pageTransition}
                    >
                      <Suspense fallback={<LoadingSpinner />}>
                        <AddVehiclePage />
                      </Suspense>
                    </motion.div>
                  </DashboardLayout>
                </ProtectedRoute>
              }
            />

            <Route
              path="/vehicles/edit/:id"
              element={
                <ProtectedRoute allowedRoles={["admin", "manager"]}>
                  <DashboardLayout>
                    <motion.div
                      variants={pageVariants}
                      initial="initial"
                      animate="animate"
                      exit="exit"
                      transition={pageTransition}
                    >
                      <Suspense fallback={<LoadingSpinner />}>
                        <EditVehiclePage />
                      </Suspense>
                    </motion.div>
                  </DashboardLayout>
                </ProtectedRoute>
              }
            />

            <Route
              path="/vehicles/expenses"
              element={
                <ProtectedRoute
                  allowedRoles={["distributor", "admin", "manager"]}
                >
                  <DashboardLayout>
                    <motion.div
                      variants={pageVariants}
                      initial="initial"
                      animate="animate"
                      exit="exit"
                      transition={pageTransition}
                    >
                      <Suspense fallback={<LoadingSpinner />}>
                        <VehicleExpensesPage />
                      </Suspense>
                    </motion.div>
                  </DashboardLayout>
                </ProtectedRoute>
              }
            />

            {/* Reports Routes */}
            <Route
              path="/reports"
              element={
                <ProtectedRoute allowedRoles={["admin", "manager"]}>
                  <DashboardLayout>
                    <motion.div
                      variants={pageVariants}
                      initial="initial"
                      animate="animate"
                      exit="exit"
                      transition={pageTransition}
                    >
                      <Suspense fallback={<LoadingSpinner />}>
                        <ReportsOverviewPage />
                      </Suspense>
                    </motion.div>
                  </DashboardLayout>
                </ProtectedRoute>
              }
            />

            {/* AI Chat Routes */}
            <Route
              path="/ai-chat"
              element={
                <ProtectedRoute>
                  <DashboardLayout>
                    <motion.div
                      variants={pageVariants}
                      initial="initial"
                      animate="animate"
                      exit="exit"
                      transition={pageTransition}
                    >
                      <Suspense fallback={<LoadingSpinner />}>
                        <AIChatPage />
                      </Suspense>
                    </motion.div>
                  </DashboardLayout>
                </ProtectedRoute>
              }
            />

            {/* Settings Routes */}
            <Route
              path="/settings"
              element={
                <ProtectedRoute allowedRoles={["admin"]}>
                  <DashboardLayout>
                    <motion.div
                      variants={pageVariants}
                      initial="initial"
                      animate="animate"
                      exit="exit"
                      transition={pageTransition}
                    >
                      <Suspense fallback={<LoadingSpinner />}>
                        <GeneralSettingsPage />
                      </Suspense>
                    </motion.div>
                  </DashboardLayout>
                </ProtectedRoute>
              }
            />

            <Route
              path="/settings/system"
              element={
                <ProtectedRoute allowedRoles={["admin"]}>
                  <DashboardLayout>
                    <motion.div
                      variants={pageVariants}
                      initial="initial"
                      animate="animate"
                      exit="exit"
                      transition={pageTransition}
                    >
                      <Suspense fallback={<LoadingSpinner />}>
                        <SystemConfigPage />
                      </Suspense>
                    </motion.div>
                  </DashboardLayout>
                </ProtectedRoute>
              }
            />

            {/* Redirect root to dashboard or login based on auth status */}
            <Route
              path="/"
              element={
                isAuthenticated ? (
                  <Navigate to="/dashboard" replace />
                ) : (
                  <Navigate to="/login" replace />
                )
              }
            />

            {/* 404 fallback */}
            <Route
              path="*"
              element={
                <DashboardLayout>
                  <div className="min-h-screen flex items-center justify-center">
                    <div className="text-center">
                      <h1 className="text-4xl font-bold text-gray-900 mb-4">
                        404
                      </h1>
                      <p className="text-gray-600 mb-4">الصفحة غير موجودة</p>
                      <Link
                        to="/dashboard"
                        className="text-blue-600 hover:text-blue-500"
                      >
                        العودة للرئيسية
                      </Link>
                    </div>
                  </div>
                </DashboardLayout>
              }
            />
          </Routes>
        </AnimatePresence>
      </div>
    </ErrorBoundary>
  );
};

export default App;
