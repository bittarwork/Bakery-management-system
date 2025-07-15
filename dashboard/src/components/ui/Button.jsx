import React from "react";
import { motion } from "framer-motion";
import { cn } from "../../utils/cn";

const Button = React.forwardRef(
  (
    {
      children,
      variant = "primary",
      size = "md",
      className = "",
      disabled = false,
      loading = false,
      icon,
      iconPosition = "left",
      fullWidth = false,
      onClick,
      type = "button",
      ...props
    },
    ref
  ) => {
    const baseClasses = "btn-modern relative overflow-hidden";

    const variantClasses = {
      primary: "btn-primary-modern",
      secondary: "btn-secondary-modern",
      ghost: "btn-ghost-modern",
      outline:
        "bg-transparent border-2 border-white/20 text-white hover:bg-white/10 focus:ring-white/30",
      success:
        "bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white shadow-lg hover:shadow-green-500/25 focus:ring-green-500/30",
      warning:
        "bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600 text-white shadow-lg hover:shadow-yellow-500/25 focus:ring-yellow-500/30",
      destructive:
        "bg-gradient-to-r from-red-500 to-pink-500 hover:from-red-600 hover:to-pink-600 text-white shadow-lg hover:shadow-red-500/25 focus:ring-red-500/30",
    };

    const sizeClasses = {
      sm: "px-4 py-2 text-sm h-8",
      md: "px-6 py-3 text-base h-10",
      lg: "px-8 py-4 text-lg h-12",
    };

    const classes = cn(
      baseClasses,
      variantClasses[variant],
      sizeClasses[size],
      fullWidth && "w-full",
      disabled && "opacity-50 cursor-not-allowed",
      loading && "opacity-75 cursor-wait",
      className
    );

    const handleClick = (e) => {
      if (disabled || loading) return;
      onClick?.(e);
    };

    return (
      <motion.button
        ref={ref}
        type={type}
        className={classes}
        disabled={disabled || loading}
        onClick={handleClick}
        whileHover={{ scale: disabled || loading ? 1 : 1.02 }}
        whileTap={{ scale: disabled || loading ? 1 : 0.98 }}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.2 }}
        {...props}
      >
        {/* Ripple effect */}
        <motion.div
          className="absolute inset-0 bg-white/20 rounded-2xl"
          initial={{ scale: 0, opacity: 0 }}
          whileHover={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.3 }}
        />

        {/* Loading spinner */}
        {loading && (
          <motion.div
            className="absolute inset-0 flex items-center justify-center bg-inherit rounded-2xl"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <div className="spinner w-4 h-4" />
          </motion.div>
        )}

        {/* Content */}
        <div
          className={cn(
            "flex items-center justify-center gap-2 relative z-10",
            loading && "opacity-0"
          )}
        >
          {icon && iconPosition === "left" && (
            <motion.div
              initial={{ scale: 0, rotate: -180 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ duration: 0.3, delay: 0.1 }}
            >
              {icon}
            </motion.div>
          )}

          <motion.span
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3, delay: 0.2 }}
          >
            {children}
          </motion.span>

          {icon && iconPosition === "right" && (
            <motion.div
              initial={{ scale: 0, rotate: 180 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ duration: 0.3, delay: 0.1 }}
            >
              {icon}
            </motion.div>
          )}
        </div>

        {/* Gradient overlay for certain variants */}
        {(variant === "primary" ||
          variant === "success" ||
          variant === "warning" ||
          variant === "destructive") && (
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent opacity-0 hover:opacity-100 transition-opacity duration-300" />
        )}
      </motion.button>
    );
  }
);

Button.displayName = "Button";

export default Button;
