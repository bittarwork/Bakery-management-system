import React from "react";
import { motion } from "framer-motion";
import { clsx } from "clsx";

const LoadingSpinner = ({
  size = "md",
  color = "primary",
  className = "",
  text = null,
  fullScreen = false,
}) => {
  const sizeClasses = {
    xs: "w-4 h-4 border-2",
    sm: "w-6 h-6 border-2",
    md: "w-8 h-8 border-2",
    lg: "w-12 h-12 border-3",
    xl: "w-16 h-16 border-4",
  };

  const colorClasses = {
    primary: "border-gray-300 border-t-primary-500",
    secondary: "border-gray-300 border-t-secondary-500",
    white: "border-gray-500 border-t-white",
    success: "border-gray-300 border-t-success-500",
    warning: "border-gray-300 border-t-warning-500",
    danger: "border-gray-300 border-t-danger-500",
  };

  const textSizes = {
    xs: "text-xs",
    sm: "text-sm",
    md: "text-base",
    lg: "text-lg",
    xl: "text-xl",
  };

  const spinnerClasses = clsx(
    "animate-spin rounded-full",
    sizeClasses[size],
    colorClasses[color],
    className
  );

  const spinnerVariants = {
    initial: { opacity: 0 },
    animate: { opacity: 1 },
    exit: { opacity: 0 },
  };

  const containerClasses = clsx(
    "flex items-center justify-center",
    fullScreen &&
      "fixed inset-0 bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm z-50"
  );

  return (
    <motion.div
      className={containerClasses}
      variants={spinnerVariants}
      initial="initial"
      animate="animate"
      exit="exit"
      transition={{ duration: 0.2 }}
    >
      <div className="flex flex-col items-center space-y-3">
        <div className={spinnerClasses} />
        {text && (
          <motion.p
            className={clsx(
              "text-gray-600 dark:text-gray-400 font-medium",
              textSizes[size]
            )}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            {text}
          </motion.p>
        )}
      </div>
    </motion.div>
  );
};

// Different spinner variations
export const DotSpinner = ({
  size = "md",
  color = "primary",
  className = "",
}) => {
  const sizeClasses = {
    xs: "w-1 h-1",
    sm: "w-1.5 h-1.5",
    md: "w-2 h-2",
    lg: "w-3 h-3",
    xl: "w-4 h-4",
  };

  const colorClasses = {
    primary: "bg-primary-500",
    secondary: "bg-secondary-500",
    white: "bg-white",
    success: "bg-success-500",
    warning: "bg-warning-500",
    danger: "bg-danger-500",
  };

  const dotClasses = clsx(
    "rounded-full",
    sizeClasses[size],
    colorClasses[color],
    className
  );

  return (
    <div className="flex items-center space-x-1">
      {[0, 1, 2].map((i) => (
        <motion.div
          key={i}
          className={dotClasses}
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.7, 1, 0.7],
          }}
          transition={{
            duration: 0.6,
            repeat: Infinity,
            delay: i * 0.1,
          }}
        />
      ))}
    </div>
  );
};

export const PulseSpinner = ({
  size = "md",
  color = "primary",
  className = "",
}) => {
  const sizeClasses = {
    xs: "w-4 h-4",
    sm: "w-6 h-6",
    md: "w-8 h-8",
    lg: "w-12 h-12",
    xl: "w-16 h-16",
  };

  const colorClasses = {
    primary: "bg-primary-500/20",
    secondary: "bg-secondary-500/20",
    white: "bg-white/20",
    success: "bg-success-500/20",
    warning: "bg-warning-500/20",
    danger: "bg-danger-500/20",
  };

  const pulseClasses = clsx(
    "rounded-full",
    sizeClasses[size],
    colorClasses[color],
    className
  );

  return (
    <div className="relative">
      <motion.div
        className={pulseClasses}
        animate={{
          scale: [1, 1.2, 1],
          opacity: [0.7, 1, 0.7],
        }}
        transition={{
          duration: 1.5,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      />
      <motion.div
        className={clsx(pulseClasses, "absolute inset-0")}
        animate={{
          scale: [1, 1.5, 1],
          opacity: [0.5, 0, 0.5],
        }}
        transition={{
          duration: 1.5,
          repeat: Infinity,
          ease: "easeInOut",
          delay: 0.2,
        }}
      />
    </div>
  );
};

export const BarsSpinner = ({
  size = "md",
  color = "primary",
  className = "",
}) => {
  const sizeClasses = {
    xs: "w-0.5 h-3",
    sm: "w-0.5 h-4",
    md: "w-1 h-5",
    lg: "w-1 h-6",
    xl: "w-1.5 h-8",
  };

  const colorClasses = {
    primary: "bg-primary-500",
    secondary: "bg-secondary-500",
    white: "bg-white",
    success: "bg-success-500",
    warning: "bg-warning-500",
    danger: "bg-danger-500",
  };

  const barClasses = clsx(
    "rounded-full",
    sizeClasses[size],
    colorClasses[color],
    className
  );

  return (
    <div className="flex items-center space-x-1">
      {[0, 1, 2, 3, 4].map((i) => (
        <motion.div
          key={i}
          className={barClasses}
          animate={{
            scaleY: [1, 0.4, 1],
            opacity: [0.8, 0.4, 0.8],
          }}
          transition={{
            duration: 0.8,
            repeat: Infinity,
            delay: i * 0.1,
          }}
        />
      ))}
    </div>
  );
};

export const RingSpinner = ({
  size = "md",
  color = "primary",
  className = "",
}) => {
  const sizeClasses = {
    xs: "w-4 h-4",
    sm: "w-6 h-6",
    md: "w-8 h-8",
    lg: "w-12 h-12",
    xl: "w-16 h-16",
  };

  const colorClasses = {
    primary: "border-primary-500",
    secondary: "border-secondary-500",
    white: "border-white",
    success: "border-success-500",
    warning: "border-warning-500",
    danger: "border-danger-500",
  };

  const ringClasses = clsx(
    "border-2 border-transparent rounded-full",
    sizeClasses[size],
    colorClasses[color],
    className
  );

  return (
    <div className="relative">
      <motion.div
        className={ringClasses}
        style={{
          borderTopColor: "currentColor",
        }}
        animate={{ rotate: 360 }}
        transition={{
          duration: 1,
          repeat: Infinity,
          ease: "linear",
        }}
      />
      <motion.div
        className={clsx(ringClasses, "absolute inset-0")}
        style={{
          borderRightColor: "currentColor",
          opacity: 0.3,
        }}
        animate={{ rotate: -360 }}
        transition={{
          duration: 1.5,
          repeat: Infinity,
          ease: "linear",
        }}
      />
    </div>
  );
};

// Loading skeleton for content
export const LoadingSkeleton = ({
  className = "",
  width = "w-full",
  height = "h-4",
}) => {
  return (
    <div
      className={clsx(
        "animate-pulse bg-gray-200 dark:bg-gray-700 rounded",
        width,
        height,
        className
      )}
    />
  );
};

// Loading card skeleton
export const LoadingCard = ({ className = "" }) => {
  return (
    <div
      className={clsx(
        "p-6 bg-white dark:bg-gray-800 rounded-xl shadow-soft border border-gray-200 dark:border-gray-700",
        className
      )}
    >
      <div className="animate-pulse">
        <div className="flex items-center space-x-4 mb-4">
          <div className="w-12 h-12 bg-gray-200 dark:bg-gray-700 rounded-full" />
          <div className="flex-1 space-y-2">
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4" />
            <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/2" />
          </div>
        </div>
        <div className="space-y-2">
          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded" />
          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-5/6" />
          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-4/6" />
        </div>
      </div>
    </div>
  );
};

// Loading table skeleton
export const LoadingTable = ({ rows = 5, cols = 4, className = "" }) => {
  return (
    <div
      className={clsx(
        "overflow-hidden shadow ring-1 ring-black ring-opacity-5 rounded-lg",
        className
      )}
    >
      <div className="bg-white dark:bg-gray-800">
        {/* Header */}
        <div className="border-b border-gray-200 dark:border-gray-700 px-6 py-3">
          <div className="flex space-x-4">
            {Array.from({ length: cols }).map((_, i) => (
              <div
                key={i}
                className="h-4 bg-gray-200 dark:bg-gray-700 rounded flex-1 animate-pulse"
              />
            ))}
          </div>
        </div>

        {/* Rows */}
        {Array.from({ length: rows }).map((_, rowIndex) => (
          <div
            key={rowIndex}
            className="border-b border-gray-200 dark:border-gray-700 px-6 py-4"
          >
            <div className="flex space-x-4">
              {Array.from({ length: cols }).map((_, colIndex) => (
                <div
                  key={colIndex}
                  className="h-4 bg-gray-200 dark:bg-gray-700 rounded flex-1 animate-pulse"
                />
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default LoadingSpinner;
