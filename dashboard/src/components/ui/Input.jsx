import React, { forwardRef } from "react";
import { motion } from "framer-motion";
import { clsx } from "clsx";

const Input = forwardRef(
  (
    { label, error, icon, iconPosition = "left", className = "", ...props },
    ref
  ) => {
    const baseClasses =
      "block w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200";

    const errorClasses =
      "border-red-300 focus:ring-red-500 focus:border-red-500";
    const iconClasses = iconPosition === "left" ? "pl-10" : "pr-10";

    const classes = clsx(
      baseClasses,
      error && errorClasses,
      icon && iconClasses,
      className
    );

    return (
      <div className="space-y-1">
        {label && (
          <label className="block text-sm font-medium text-gray-700">
            {label}
          </label>
        )}

        <div className="relative">
          {icon && iconPosition === "left" && (
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <span className="text-gray-400 w-5 h-5">{icon}</span>
            </div>
          )}

          <motion.input
            ref={ref}
            className={classes}
            whileFocus={{ scale: 1.01 }}
            {...props}
          />

          {icon && iconPosition === "right" && (
            <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
              <span className="text-gray-400 w-5 h-5">{icon}</span>
            </div>
          )}
        </div>

        {error && (
          <motion.p
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-sm text-red-600"
          >
            {error}
          </motion.p>
        )}
      </div>
    );
  }
);

Input.displayName = "Input";

export default Input;
