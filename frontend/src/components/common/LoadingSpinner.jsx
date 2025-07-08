import React from "react";
import { Loader } from "lucide-react";

const LoadingSpinner = ({
  size = "md",
  color = "blue",
  text = "",
  className = "",
  fullScreen = false,
}) => {
  const sizeClasses = {
    sm: "h-4 w-4",
    md: "h-6 w-6",
    lg: "h-8 w-8",
    xl: "h-12 w-12",
  };

  const colorClasses = {
    blue: "text-blue-600",
    green: "text-green-600",
    red: "text-red-600",
    yellow: "text-yellow-600",
    purple: "text-purple-600",
    gray: "text-gray-600",
  };

  const spinnerContent = (
    <div className={`flex items-center justify-center gap-3 ${className}`}>
      <Loader
        className={`animate-spin ${sizeClasses[size]} ${colorClasses[color]}`}
      />
      {text && (
        <span className={`font-medium ${colorClasses[color]}`}>{text}</span>
      )}
    </div>
  );

  if (fullScreen) {
    return (
      <div className="fixed inset-0 bg-white bg-opacity-90 flex items-center justify-center z-50">
        {spinnerContent}
      </div>
    );
  }

  return spinnerContent;
};

export default LoadingSpinner;
