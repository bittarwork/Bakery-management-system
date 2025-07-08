import React from "react";
import { ORDER_STATUS, PAYMENT_STATUS } from "../../constants";

const StatusBadge = ({
  status,
  type = "order",
  size = "md",
  showIcon = true,
  showLabel = true,
  className = "",
}) => {
  const getStatusConfig = () => {
    const statusMap = type === "order" ? ORDER_STATUS : PAYMENT_STATUS;
    const config = statusMap[status];

    if (!config) {
      return {
        label: status,
        color: "gray",
        icon: "❓",
        bgColor: "bg-gray-100",
        textColor: "text-gray-800",
        borderColor: "border-gray-300",
      };
    }

    const colorMap = {
      gray: {
        bgColor: "bg-gray-100",
        textColor: "text-gray-800",
        borderColor: "border-gray-300",
      },
      blue: {
        bgColor: "bg-blue-100",
        textColor: "text-blue-800",
        borderColor: "border-blue-300",
      },
      yellow: {
        bgColor: "bg-yellow-100",
        textColor: "text-yellow-800",
        borderColor: "border-yellow-300",
      },
      green: {
        bgColor: "bg-green-100",
        textColor: "text-green-800",
        borderColor: "border-green-300",
      },
      red: {
        bgColor: "bg-red-100",
        textColor: "text-red-800",
        borderColor: "border-red-300",
      },
    };

    return {
      ...config,
      ...colorMap[config.color],
    };
  };

  const getSizeClasses = () => {
    const sizeMap = {
      sm: "px-2 py-1 text-xs",
      md: "px-3 py-1 text-sm",
      lg: "px-4 py-2 text-base",
    };
    return sizeMap[size] || sizeMap.md;
  };

  const statusConfig = getStatusConfig();
  const sizeClasses = getSizeClasses();

  return (
    <span
      className={`
                inline-flex items-center gap-1 rounded-full border font-medium
                ${statusConfig.bgColor} 
                ${statusConfig.textColor} 
                ${statusConfig.borderColor}
                ${sizeClasses}
                ${className}
            `}
      title={statusConfig.label}
    >
      {showIcon && <span className="flex-shrink-0">{statusConfig.icon}</span>}
      {showLabel && <span className="truncate">{statusConfig.label}</span>}
    </span>
  );
};

export default StatusBadge;
