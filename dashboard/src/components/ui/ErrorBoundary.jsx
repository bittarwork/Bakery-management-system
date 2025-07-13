import React from "react";
import { motion } from "framer-motion";
import { XCircleIcon, RefreshCwIcon, HomeIcon, BugIcon } from "lucide-react";

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
      errorId: null,
    };
  }

  static getDerivedStateFromError(error) {
    // Update state so the next render will show the fallback UI
    return {
      hasError: true,
      errorId: Date.now().toString(36),
    };
  }

  componentDidCatch(error, errorInfo) {
    // Log the error to console in development
    if (process.env.NODE_ENV === "development") {
      console.error("ErrorBoundary caught an error:", error, errorInfo);
    }

    // Update state with error details
    this.setState({
      error,
      errorInfo,
    });

    // You can also log the error to an error reporting service
    this.logErrorToService(error, errorInfo);
  }

  logErrorToService = (error, errorInfo) => {
    // In production, you would send this to your error reporting service
    // For now, we'll just log it
    const errorData = {
      message: error.message,
      stack: error.stack,
      componentStack: errorInfo.componentStack,
      timestamp: new Date().toISOString(),
      userAgent: navigator.userAgent,
      url: window.location.href,
      userId: this.props.userId || "anonymous",
    };

    if (process.env.NODE_ENV === "production") {
      // Replace with your actual error reporting service
      // Example: Sentry, LogRocket, Bugsnag, etc.
      console.error("Production Error:", errorData);
    }
  };

  handleRetry = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
      errorId: null,
    });
  };

  handleReload = () => {
    window.location.reload();
  };

  handleGoHome = () => {
    window.location.href = "/";
  };

  render() {
    if (this.state.hasError) {
      // Custom fallback UI
      return (
        <motion.div
          className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
        >
          <div className="max-w-md w-full">
            <motion.div
              className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl p-8 text-center"
              initial={{ scale: 0.8, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
            >
              {/* Error Icon */}
              <motion.div
                className="w-16 h-16 mx-auto mb-6 text-red-500"
                initial={{ rotate: -10 }}
                animate={{ rotate: 0 }}
                transition={{ duration: 0.5, delay: 0.2 }}
              >
                <XCircleIcon className="w-full h-full" />
              </motion.div>

              {/* Error Title */}
              <motion.h1
                className="text-2xl font-bold text-gray-900 dark:text-white mb-2"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.3 }}
              >
                عذراً، حدث خطأ
              </motion.h1>

              {/* Error Description */}
              <motion.p
                className="text-gray-600 dark:text-gray-400 mb-6"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.4 }}
              >
                حدث خطأ غير متوقع. يرجى المحاولة مرة أخرى أو الاتصال بالدعم
                الفني.
              </motion.p>

              {/* Error ID */}
              <motion.div
                className="bg-gray-100 dark:bg-gray-700 rounded-lg p-3 mb-6"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.5 }}
              >
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  رقم الخطأ:{" "}
                  <span className="font-mono text-primary-600">
                    {this.state.errorId}
                  </span>
                </p>
              </motion.div>

              {/* Error Details in Development */}
              {process.env.NODE_ENV === "development" && this.state.error && (
                <motion.details
                  className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4 mb-6 text-right"
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  transition={{ duration: 0.5, delay: 0.6 }}
                >
                  <summary className="cursor-pointer text-sm font-medium text-red-700 dark:text-red-400 mb-2">
                    تفاصيل الخطأ (للمطورين)
                  </summary>
                  <div className="text-xs text-red-600 dark:text-red-400 font-mono text-left">
                    <div className="mb-2">
                      <strong>الرسالة:</strong> {this.state.error.message}
                    </div>
                    <div className="mb-2">
                      <strong>المكدس:</strong>
                      <pre className="whitespace-pre-wrap mt-1 text-xs">
                        {this.state.error.stack}
                      </pre>
                    </div>
                    {this.state.errorInfo && (
                      <div>
                        <strong>مكدس المكونات:</strong>
                        <pre className="whitespace-pre-wrap mt-1 text-xs">
                          {this.state.errorInfo.componentStack}
                        </pre>
                      </div>
                    )}
                  </div>
                </motion.details>
              )}

              {/* Action Buttons */}
              <motion.div
                className="flex flex-col sm:flex-row gap-3"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.7 }}
              >
                <button
                  onClick={this.handleRetry}
                  className="flex items-center justify-center gap-2 px-4 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition-colors"
                >
                  <RefreshCwIcon className="w-4 h-4" />
                  المحاولة مرة أخرى
                </button>

                <button
                  onClick={this.handleReload}
                  className="flex items-center justify-center gap-2 px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors"
                >
                  <RefreshCwIcon className="w-4 h-4" />
                  إعادة تحميل الصفحة
                </button>

                <button
                  onClick={this.handleGoHome}
                  className="flex items-center justify-center gap-2 px-4 py-2 bg-secondary-500 text-white rounded-lg hover:bg-secondary-600 transition-colors"
                >
                  <HomeIcon className="w-4 h-4" />
                  العودة للرئيسية
                </button>
              </motion.div>

              {/* Report Bug Link */}
              <motion.div
                className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.5, delay: 0.8 }}
              >
                <button
                  onClick={() => this.reportBug()}
                  className="flex items-center justify-center gap-2 text-sm text-gray-600 dark:text-gray-400 hover:text-primary-500 transition-colors"
                >
                  <BugIcon className="w-4 h-4" />
                  الإبلاغ عن هذا الخطأ
                </button>
              </motion.div>
            </motion.div>
          </div>
        </motion.div>
      );
    }

    return this.props.children;
  }

  reportBug = () => {
    const errorReport = {
      errorId: this.state.errorId,
      message: this.state.error?.message || "Unknown error",
      timestamp: new Date().toISOString(),
      userAgent: navigator.userAgent,
      url: window.location.href,
    };

    // Here you would typically send this to your bug reporting system
    // For now, we'll just copy it to clipboard
    navigator.clipboard
      .writeText(JSON.stringify(errorReport, null, 2))
      .then(() => {
        alert("تم نسخ تقرير الخطأ إلى الحافظة");
      })
      .catch(() => {
        alert("فشل في نسخ تقرير الخطأ");
      });
  };
}

// HOC wrapper for functional components
export const withErrorBoundary = (Component, errorBoundaryProps = {}) => {
  return function WithErrorBoundaryComponent(props) {
    return (
      <ErrorBoundary {...errorBoundaryProps}>
        <Component {...props} />
      </ErrorBoundary>
    );
  };
};

// Hook for error handling in functional components
export const useErrorHandler = () => {
  const [error, setError] = React.useState(null);

  const resetError = React.useCallback(() => {
    setError(null);
  }, []);

  const handleError = React.useCallback((error) => {
    setError(error);
    throw error; // Re-throw to be caught by ErrorBoundary
  }, []);

  React.useEffect(() => {
    if (error) {
      console.error("Error caught by useErrorHandler:", error);
    }
  }, [error]);

  return { error, resetError, handleError };
};

// Lightweight error fallback for smaller components
export const ErrorFallback = ({
  error,
  resetError,
  title = "حدث خطأ",
  message = "حدث خطأ غير متوقع. يرجى المحاولة مرة أخرى.",
  showRetry = true,
  className = "",
}) => {
  return (
    <motion.div
      className={`p-6 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg text-center ${className}`}
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3 }}
    >
      <XCircleIcon className="w-8 h-8 text-red-500 mx-auto mb-3" />
      <h3 className="text-lg font-medium text-red-800 dark:text-red-200 mb-2">
        {title}
      </h3>
      <p className="text-red-600 dark:text-red-400 mb-4">{message}</p>
      {showRetry && (
        <button
          onClick={resetError}
          className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
        >
          المحاولة مرة أخرى
        </button>
      )}
      {process.env.NODE_ENV === "development" && error && (
        <details className="mt-4 text-left">
          <summary className="cursor-pointer text-sm font-medium text-red-700 dark:text-red-400">
            تفاصيل الخطأ
          </summary>
          <pre className="mt-2 text-xs text-red-600 dark:text-red-400 overflow-auto">
            {error.stack}
          </pre>
        </details>
      )}
    </motion.div>
  );
};

export default ErrorBoundary;
