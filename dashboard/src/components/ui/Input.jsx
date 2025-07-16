import React from "react";
import { motion } from "framer-motion";
import { cn } from "../../utils/cn";

const Input = React.forwardRef(
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
      ...props
    },
    ref
  ) => {
    const inputId = id || name;

    return (
      <div className="form-group">
        {label && (
          <label
            htmlFor={inputId}
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            {label}
            {required && <span className="text-red-400 ml-1">*</span>}
          </label>
        )}

        <div className="relative">
          <input
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
            className={cn(
              "w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white text-gray-900",
              error &&
                "border-red-500/50 focus:border-red-500/50 focus:ring-red-500/20",
              disabled && "opacity-50 cursor-not-allowed",
              className
            )}
            {...props}
          />

          {icon && (
            <div className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400">
              {icon}
            </div>
          )}
        </div>

        {error && (
          <div className="mt-1 text-sm text-red-400 flex items-center gap-1">
            <span>{error}</span>
          </div>
        )}
      </div>
    );
  }
);

Input.displayName = "Input";

export default Input;
