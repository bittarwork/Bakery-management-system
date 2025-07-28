import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  Wifi,
  WifiOff,
  Activity,
  AlertCircle,
  CheckCircle,
  Clock,
} from "lucide-react";

const StatusIndicator = () => {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [systemStatus, setSystemStatus] = useState("healthy"); // healthy, warning, error

  useEffect(() => {
    // Update online status
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    // Update current time every minute
    const timeInterval = setInterval(() => {
      setCurrentTime(new Date());
    }, 60000);

    // Simulate system health check (in real app, this would be an API call)
    const healthCheck = setInterval(() => {
      // Random status for demo - in real app, this would be actual health checks
      const statuses = ["healthy", "healthy", "healthy", "warning", "healthy"];
      const randomStatus = statuses[Math.floor(Math.random() * statuses.length)];
      setSystemStatus(randomStatus);
    }, 30000);

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
      clearInterval(timeInterval);
      clearInterval(healthCheck);
    };
  }, []);

  const getStatusIcon = () => {
    switch (systemStatus) {
      case "healthy":
        return <CheckCircle className="h-3 w-3 text-green-500" />;
      case "warning":
        return <AlertCircle className="h-3 w-3 text-yellow-500" />;
      case "error":
        return <AlertCircle className="h-3 w-3 text-red-500" />;
      default:
        return <Activity className="h-3 w-3 text-gray-500" />;
    }
  };

  const getStatusColor = () => {
    switch (systemStatus) {
      case "healthy":
        return "text-green-600 bg-green-50 border-green-200";
      case "warning":
        return "text-yellow-600 bg-yellow-50 border-yellow-200";
      case "error":
        return "text-red-600 bg-red-50 border-red-200";
      default:
        return "text-gray-600 bg-gray-50 border-gray-200";
    }
  };

  const formatTime = (date) => {
    return date.toLocaleTimeString("ar-SA", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    });
  };

  const formatDate = (date) => {
    return date.toLocaleDateString("ar-SA", {
      weekday: "short",
      day: "numeric",
      month: "short",
    });
  };

  return (
    <div className="flex items-center space-x-3 space-x-reverse">
      {/* System Status */}
      <motion.div
        whileHover={{ scale: 1.05 }}
        className={`flex items-center px-2 py-1 rounded-lg border text-xs font-medium transition-all duration-200 ${getStatusColor()}`}
        title={`حالة النظام: ${
          systemStatus === "healthy"
            ? "ممتاز"
            : systemStatus === "warning"
            ? "تحذير"
            : "خطأ"
        }`}
      >
        {getStatusIcon()}
        <span className="mr-1">
          {systemStatus === "healthy"
            ? "ممتاز"
            : systemStatus === "warning"
            ? "تحذير"
            : "خطأ"}
        </span>
      </motion.div>

      {/* Connection Status */}
      <motion.div
        whileHover={{ scale: 1.05 }}
        className={`flex items-center px-2 py-1 rounded-lg border text-xs font-medium transition-all duration-200 ${
          isOnline
            ? "text-green-600 bg-green-50 border-green-200"
            : "text-red-600 bg-red-50 border-red-200"
        }`}
        title={isOnline ? "متصل بالإنترنت" : "غير متصل بالإنترنت"}
      >
        {isOnline ? (
          <Wifi className="h-3 w-3" />
        ) : (
          <WifiOff className="h-3 w-3" />
        )}
        <span className="mr-1">{isOnline ? "متصل" : "منقطع"}</span>
      </motion.div>

      {/* Current Time */}
      <motion.div
        whileHover={{ scale: 1.05 }}
        className="flex items-center px-2 py-1 rounded-lg border border-blue-200 bg-blue-50 text-blue-600 text-xs font-medium transition-all duration-200"
        title="الوقت الحالي"
      >
        <Clock className="h-3 w-3" />
        <div className="mr-1 flex flex-col items-end">
          <span className="font-mono">{formatTime(currentTime)}</span>
          <span className="text-xs opacity-75">{formatDate(currentTime)}</span>
        </div>
      </motion.div>
    </div>
  );
};

export default StatusIndicator; 