import React from "react";
import { Loader2 } from "lucide-react";

const LoadingSpinner = ({
  size = "md",
  text = "",
  className = "",
  fullScreen = false,
}) => {
  const sizeClasses = {
    sm: "w-4 h-4",
    md: "w-6 h-6",
    lg: "w-8 h-8",
    xl: "w-12 h-12",
  };

  const spinnerSize = sizeClasses[size] || sizeClasses.md;

  const content = (
    <div className={`flex flex-col items-center justify-center ${className}`}>
      <Loader2 className={`animate-spin text-blue-600 ${spinnerSize}`} />
      {text && <p className="mt-3 text-gray-600 text-sm">{text}</p>}
    </div>
  );

  if (fullScreen) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        {content}
      </div>
    );
  }

  return content;
};

export default LoadingSpinner;
