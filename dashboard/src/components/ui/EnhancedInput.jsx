import React from "react";
import { motion } from "framer-motion";
import { cn } from "../../utils/cn";

const EnhancedInput = React.forwardRef(
  (
    {
      label,
      type = "text",
      placeholder,
      value,
      onChange,
      onBlur,
      onFocus,
      disabled = false,
      required = false,
      error,
      className = "",
      icon,
      name,
      id,
      variant = "default",
      size = "md",
      ...props
    },
    ref
  ) => {
    const inputId = id || name;

    const baseClasses =
      "w-full transition-all duration-200 border rounded-lg focus:outline-none focus:ring-2 focus:ring-offset-0";

    const variantClasses = {
      default:
        "bg-white border-gray-300 text-gray-900 placeholder-gray-500 focus:border-blue-500 focus:ring-blue-500/20",
      error:
        "bg-white border-red-300 text-gray-900 placeholder-gray-500 focus:border-red-500 focus:ring-red-500/20",
      success:
        "bg-white border-green-300 text-gray-900 placeholder-gray-500 focus:border-green-500 focus:ring-green-500/20",
      disabled: "bg-gray-50 border-gray-200 text-gray-500 cursor-not-allowed",
    };

    const sizeClasses = {
      sm: "px-3 py-2 text-sm",
      md: "px-4 py-3 text-base",
      lg: "px-4 py-4 text-lg",
    };

    const inputClasses = cn(
      baseClasses,
      sizeClasses[size],
      variantClasses[error ? "error" : disabled ? "disabled" : "default"],
      className
    );

    return (
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="space-y-2"
      >
        {label && (
          <motion.label
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.1 }}
            htmlFor={inputId}
            className="block text-sm font-medium text-gray-700"
          >
            {label}
            {required && <span className="text-red-500 ml-1">*</span>}
          </motion.label>
        )}

        <div className="relative">
          <motion.input
            ref={ref}
            type={type}
            name={name}
            id={inputId}
            placeholder={placeholder}
            value={value}
            onChange={onChange}
            onBlur={onBlur}
            onFocus={onFocus}
            disabled={disabled}
            required={required}
            className={inputClasses}
            whileFocus={{ scale: 1.01 }}
            transition={{ duration: 0.2 }}
            {...props}
          />

          {icon && (
            <div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 pointer-events-none">
              {icon}
            </div>
          )}
        </div>

        {error && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="text-sm text-red-600 flex items-center gap-1"
          >
            <span>⚠</span>
            <span>{error}</span>
          </motion.div>
        )}
      </motion.div>
    );
  }
);

EnhancedInput.displayName = "EnhancedInput";

export default EnhancedInput;
