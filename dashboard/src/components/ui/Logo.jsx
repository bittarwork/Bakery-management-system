import React from "react";
import { motion } from "framer-motion";
import { ChefHat, Wheat, Cookie } from "lucide-react";

const Logo = ({
  size = "md",
  showText = true,
  animated = true,
  className = "",
  variant = "default", // 'default', 'simple', 'icon-only'
}) => {
  const sizeClasses = {
    sm: "w-8 h-8",
    md: "w-12 h-12",
    lg: "w-16 h-16",
    xl: "w-20 h-20",
    "2xl": "w-24 h-24",
  };

  const iconSizes = {
    sm: "w-4 h-4",
    md: "w-6 h-6",
    lg: "w-8 h-8",
    xl: "w-10 h-10",
    "2xl": "w-12 h-12",
  };

  const decorationSizes = {
    sm: "w-2 h-2",
    md: "w-3 h-3",
    lg: "w-4 h-4",
    xl: "w-5 h-5",
    "2xl": "w-6 h-6",
  };

  const textSizes = {
    sm: "text-sm",
    md: "text-base",
    lg: "text-lg",
    xl: "text-xl",
    "2xl": "text-2xl",
  };

  const LogoIcon = () => (
    <div className={`relative ${sizeClasses[size]} ${className}`}>
      <motion.div
        initial={animated ? { scale: 0, rotate: -180 } : false}
        animate={animated ? { scale: 1, rotate: 0 } : false}
        transition={{ delay: 0.3, type: "spring", stiffness: 200 }}
        className={`${sizeClasses[size]} bg-gradient-to-br from-amber-400 via-orange-500 to-red-500 rounded-2xl flex items-center justify-center shadow-2xl relative overflow-hidden`}
      >
        {/* Background pattern */}
        <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent" />

        {/* Main chef hat icon */}
        <ChefHat className={`${iconSizes[size]} text-white z-10`} />

        {/* Decorative elements - only show if not simple variant */}
        {variant !== "simple" && (
          <>
            <motion.div
              animate={animated ? { rotate: 360 } : false}
              transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
              className={`absolute -top-1 -right-1 ${decorationSizes[size]} bg-gradient-to-br from-yellow-400 to-amber-500 rounded-full flex items-center justify-center`}
            >
              <Wheat
                className={`${
                  size === "sm"
                    ? "w-1 h-1"
                    : size === "md"
                    ? "w-1.5 h-1.5"
                    : "w-2 h-2"
                } text-white`}
              />
            </motion.div>

            <motion.div
              animate={animated ? { rotate: -360 } : false}
              transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
              className={`absolute -bottom-1 -left-1 ${decorationSizes[size]} bg-gradient-to-br from-pink-400 to-red-500 rounded-full flex items-center justify-center`}
            >
              <Cookie
                className={`${
                  size === "sm"
                    ? "w-1 h-1"
                    : size === "md"
                    ? "w-1.5 h-1.5"
                    : "w-2 h-2"
                } text-white`}
              />
            </motion.div>
          </>
        )}
      </motion.div>
    </div>
  );

  if (variant === "icon-only") {
    return <LogoIcon />;
  }

  return (
    <div className="flex items-center gap-3">
      <LogoIcon />
      {showText && (
        <motion.div
          initial={animated ? { y: 20, opacity: 0 } : false}
          animate={animated ? { y: 0, opacity: 1 } : false}
          transition={{ delay: 0.6 }}
          className="flex flex-col"
        >
          <h1
            className={`${textSizes[size]} font-bold bg-gradient-to-r from-amber-300 via-orange-400 to-red-400 bg-clip-text text-transparent`}
          >
            BakeMaster
          </h1>
          {variant === "default" && (
            <p className="text-xs text-gray-500">نظام إدارة المخبزة</p>
          )}
        </motion.div>
      )}
    </div>
  );
};

export default Logo;
