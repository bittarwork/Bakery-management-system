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
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="form-group"
      >
        {label && (
          <motion.label
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.1 }}
            htmlFor={inputId}
            className="form-label"
          >
            {label}
            {required && <span className="text-red-400 ml-1">*</span>}
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
            className={cn(
              "form-input",
              error &&
                "border-red-500/50 focus:border-red-500/50 focus:ring-red-500/20",
              disabled && "opacity-50 cursor-not-allowed",
              className
            )}
            whileFocus={{ scale: 1.02 }}
            transition={{ duration: 0.2 }}
            {...props}
          />

          {icon && (
            <div className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400">
              {icon}
            </div>
          )}
        </div>

        {error && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="mt-1 text-sm text-red-400 flex items-center gap-1"
          >
            <span>{error}</span>
          </motion.div>
        )}
      </motion.div>
    );
  }
);

Input.displayName = "Input";

export default Input;
