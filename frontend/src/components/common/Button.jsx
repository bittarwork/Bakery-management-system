import React from "react";
import clsx from "clsx";

// Reusable button with Tailwind variants
// Props:
//   variant: 'primary' | 'secondary' | 'outline' | 'danger'
//   size: 'sm' | 'md' | 'lg'
//   icon: optional React element placed before children
//   className: extra classes
//   disabled: boolean
//   ...rest: other button props (type,onClick,etc.)
const variantClasses = {
  primary:
    "bg-blue-600 hover:bg-blue-700 text-white border border-transparent shadow",
  secondary:
    "bg-gray-600 hover:bg-gray-700 text-white border border-transparent shadow",
  outline:
    "bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700 shadow-sm",
  danger:
    "bg-red-600 hover:bg-red-700 text-white border border-transparent shadow",
};

const sizeClasses = {
  sm: "px-3 py-1.5 text-xs",
  md: "px-4 py-2 text-sm",
  lg: "px-6 py-3 text-base",
};

const Button = ({
  variant = "primary",
  size = "md",
  icon: Icon,
  className = "",
  disabled,
  children,
  ...rest
}) => {
  return (
    <button
      disabled={disabled}
      className={clsx(
        "inline-flex items-center rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 transition-colors",
        variantClasses[variant],
        sizeClasses[size],
        className
      )}
      {...rest}
    >
      {Icon && <Icon className="h-4 w-4 ml-2" />}
      {children}
    </button>
  );
};

export default Button;
