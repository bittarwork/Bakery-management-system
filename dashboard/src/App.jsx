import React, { Suspense, useEffect } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { useAuthStore } from "./stores/authStore";
import { useSystemStore } from "./stores/systemStore";

// Layout Components
import AuthLayout from "./components/layout/AuthLayout";
import DashboardLayout from "./components/layout/DashboardLayout";

// Pages - Authentication
import LoginPage from "./pages/auth/LoginPage";

// Pages - Dashboard
import DashboardHomePage from "./pages/dashboard/DashboardHomePage";
import AnalyticsPage from "./pages/dashboard/AnalyticsPage";

// Pages - Distribution
import DistributionOverviewPage from "./pages/distribution/DistributionOverviewPage";
import DistributionSchedulePage from "./pages/distribution/DistributionSchedulePage";
import DistributionTrackingPage from "./pages/distribution/DistributionTrackingPage";
import DistributionReportsPage from "./pages/distribution/DistributionReportsPage";

// Pages - Orders
import OrdersListPage from "./pages/orders/OrdersListPage";
import OrderDetailsPage from "./pages/orders/OrderDetailsPage";
import CreateOrderPage from "./pages/orders/CreateOrderPage";
import EditOrderPage from "./pages/orders/EditOrderPage";
import OrderReportsPage from "./pages/orders/OrderReportsPage";

// Pages - Payments
import PaymentsListPage from "./pages/payments/PaymentsListPage";
import PaymentDetailsPage from "./pages/payments/PaymentDetailsPage";
import PaymentRecordPage from "./pages/payments/PaymentRecordPage";

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

// Pages - Reports
import ReportsOverviewPage from "./pages/reports/ReportsOverviewPage";
import DailyReportsPage from "./pages/reports/DailyReportsPage";
import WeeklyReportsPage from "./pages/reports/WeeklyReportsPage";
import MonthlyReportsPage from "./pages/reports/MonthlyReportsPage";

// Pages - Users
import UsersListPage from "./pages/users/UsersListPage";
import UserDetailsPage from "./pages/users/UserDetailsPage";
import CreateUserPage from "./pages/users/CreateUserPage";
import EditUserPage from "./pages/users/EditUserPage";

// Pages - Settings
import SettingsPage from "./pages/settings/SettingsPage";
import ProfilePage from "./pages/settings/ProfilePage";

// Pages - Enhanced Pricing (Phase 6)
import PricingManagementPage from "./pages/pricing/PricingManagementPage";

// Pages - Distributor Management (Phase 6)
import DistributorManagementPage from "./pages/distributors/DistributorManagementPage";

// Pages - Delivery Scheduling (Phase 6)
import DeliverySchedulingPage from "./pages/delivery/DeliverySchedulingPage";
import DeliveryConfirmationPage from "./pages/delivery/DeliveryConfirmationPage";

// Pages - Error
import NotFoundPage from "./pages/error/NotFoundPage";

// Components
import LoadingSpinner from "./components/ui/LoadingSpinner";
import ErrorBoundary from "./components/ui/ErrorBoundary";

// Page transition variants
const pageVariants = {
  initial: { opacity: 0, x: -20 },
  animate: { opacity: 1, x: 0 },
  exit: { opacity: 0, x: 20 },
};

const pageTransition = {
  type: "tween",
  ease: "anticipate",
  duration: 0.3,
};

// Protected Route Component
const ProtectedRoute = ({ children, requiredRole = null }) => {
  const { isAuthenticated, user } = useAuthStore();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (requiredRole && user?.role !== requiredRole) {
    return <Navigate to="/unauthorized" replace />;
  }

  return children;
};

// Public Route Component (redirect if authenticated)
const PublicRoute = ({ children }) => {
  const { isAuthenticated } = useAuthStore();

  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
};

// App Component
function App() {
  const { initializeAuth, isLoading } = useAuthStore();
  const { initializeSystem } = useSystemStore();

  useEffect(() => {
    // Initialize authentication and system
    initializeAuth();
    initializeSystem();
  }, [initializeAuth, initializeSystem]);

  if (isLoading) {
    return (
      <LoadingSpinner
        size="2xl"
        color="white"
        text="جاري تحميل النظام..."
        showLogo={true}
        fullScreen={true}
      />
    );
  }

  return (
    <ErrorBoundary>
      <div className="min-h-screen bg-gray-50">
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
              element={
                <ProtectedRoute requiredRole="manager">
                  <DashboardLayout>
                    <motion.div
                      variants={pageVariants}
                      initial="initial"
                      animate="animate"
                      exit="exit"
                      transition={pageTransition}
                    >
                      <Suspense fallback={<LoadingSpinner />}>
                        <DistributionOverviewPage />
                      </Suspense>
                    </motion.div>
                  </DashboardLayout>
                </ProtectedRoute>
              }
            />

            <Route
              path="/distribution/schedule"
              element={
                <ProtectedRoute requiredRole="manager">
                  <DashboardLayout>
                    <motion.div
                      variants={pageVariants}
                      initial="initial"
                      animate="animate"
                      exit="exit"
                      transition={pageTransition}
                    >
                      <Suspense fallback={<LoadingSpinner />}>
                        <DistributionSchedulePage />
                      </Suspense>
                    </motion.div>
                  </DashboardLayout>
                </ProtectedRoute>
              }
            />

            <Route
              path="/distribution/tracking"
              element={
                <ProtectedRoute requiredRole="manager">
                  <DashboardLayout>
                    <motion.div
                      variants={pageVariants}
                      initial="initial"
                      animate="animate"
                      exit="exit"
                      transition={pageTransition}
                    >
                      <Suspense fallback={<LoadingSpinner />}>
                        <DistributionTrackingPage />
                      </Suspense>
                    </motion.div>
                  </DashboardLayout>
                </ProtectedRoute>
              }
            />

            <Route
              path="/distribution/reports"
              element={
                <ProtectedRoute requiredRole="manager">
                  <DashboardLayout>
                    <motion.div
                      variants={pageVariants}
                      initial="initial"
                      animate="animate"
                      exit="exit"
                      transition={pageTransition}
                    >
                      <Suspense fallback={<LoadingSpinner />}>
                        <DistributionReportsPage />
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
                        <OrderReportsPage />
                      </Suspense>
                    </motion.div>
                  </DashboardLayout>
                </ProtectedRoute>
              }
            />

            {/* Payments Routes */}
            <Route
              path="/payments"
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
                        <PaymentsListPage />
                      </Suspense>
                    </motion.div>
                  </DashboardLayout>
                </ProtectedRoute>
              }
            />

            <Route
              path="/payments/:id"
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
                        <PaymentDetailsPage />
                      </Suspense>
                    </motion.div>
                  </DashboardLayout>
                </ProtectedRoute>
              }
            />

            <Route
              path="/payments/record"
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
                        <PaymentRecordPage />
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
                <ProtectedRoute requiredRole="admin">
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
              path="/stores/edit/:id"
              element={
                <ProtectedRoute requiredRole="admin">
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
                <ProtectedRoute requiredRole="admin">
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

            <Route
              path="/products/create"
              element={
                <ProtectedRoute requiredRole="admin">
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

            {/* Reports Routes */}
            <Route
              path="/reports"
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
                        <ReportsOverviewPage />
                      </Suspense>
                    </motion.div>
                  </DashboardLayout>
                </ProtectedRoute>
              }
            />

            <Route
              path="/reports/daily"
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
                        <DailyReportsPage />
                      </Suspense>
                    </motion.div>
                  </DashboardLayout>
                </ProtectedRoute>
              }
            />

            <Route
              path="/reports/weekly"
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
                        <WeeklyReportsPage />
                      </Suspense>
                    </motion.div>
                  </DashboardLayout>
                </ProtectedRoute>
              }
            />

            <Route
              path="/reports/monthly"
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
                        <MonthlyReportsPage />
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
                <ProtectedRoute requiredRole="admin">
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
                <ProtectedRoute requiredRole="admin">
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
                <ProtectedRoute requiredRole="admin">
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
                <ProtectedRoute requiredRole="admin">
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

            {/* Settings Routes */}
            <Route
              path="/settings"
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
                        <SettingsPage />
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
                        <ProfilePage />
                      </Suspense>
                    </motion.div>
                  </DashboardLayout>
                </ProtectedRoute>
              }
            />

            {/* Enhanced Order Management Routes (Phase 6) */}
            <Route
              path="/pricing"
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
                        <PricingManagementPage />
                      </Suspense>
                    </motion.div>
                  </DashboardLayout>
                </ProtectedRoute>
              }
            />

            <Route
              path="/distributors"
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
                        <DistributorManagementPage />
                      </Suspense>
                    </motion.div>
                  </DashboardLayout>
                </ProtectedRoute>
              }
            />

            <Route
              path="/delivery"
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
                        <DeliverySchedulingPage />
                      </Suspense>
                    </motion.div>
                  </DashboardLayout>
                </ProtectedRoute>
              }
            />

            {/* Customer Delivery Confirmation - Public Route */}
            <Route
              path="/delivery/confirm/:token"
              element={
                <motion.div
                  variants={pageVariants}
                  initial="initial"
                  animate="animate"
                  exit="exit"
                  transition={pageTransition}
                >
                  <Suspense fallback={<LoadingSpinner />}>
                    <DeliveryConfirmationPage />
                  </Suspense>
                </motion.div>
              }
            />

            {/* Default routes */}
            <Route path="/" element={<Navigate to="/dashboard" replace />} />
            <Route
              path="/unauthorized"
              element={
                <div className="min-h-screen flex items-center justify-center">
                  <div className="text-center">
                    <h1 className="text-2xl font-bold text-red-600 mb-4">
                      غير مصرح
                    </h1>
                    <p className="text-gray-600 mb-8">
                      ليس لديك صلاحية للوصول إلى هذه الصفحة
                    </p>
                    <button
                      onClick={() => window.history.back()}
                      className="btn btn-primary"
                    >
                      العودة
                    </button>
                  </div>
                </div>
              }
            />
            <Route
              path="*"
              element={
                <motion.div
                  variants={pageVariants}
                  initial="initial"
                  animate="animate"
                  exit="exit"
                  transition={pageTransition}
                >
                  <Suspense fallback={<LoadingSpinner />}>
                    <NotFoundPage />
                  </Suspense>
                </motion.div>
              }
            />
          </Routes>
        </AnimatePresence>
      </div>
    </ErrorBoundary>
  );
}

export default App;
