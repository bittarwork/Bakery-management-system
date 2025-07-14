import React from "react";
import { motion } from "framer-motion";
import { Loader2, ChefHat } from "lucide-react";

const LoadingSpinner = ({
  size = "md",
  color = "primary",
  text = "جاري التحميل...",
  showLogo = false,
  fullScreen = false,
}) => {
  const sizeClasses = {
    sm: "w-4 h-4",
    md: "w-6 h-6",
    lg: "w-8 h-8",
    xl: "w-12 h-12",
    "2xl": "w-16 h-16",
  };

  const colorClasses = {
    primary: "text-amber-500",
    white: "text-white",
    gray: "text-gray-500",
    blue: "text-blue-500",
    green: "text-green-500",
    red: "text-red-500",
  };

  const spinnerContent = (
    <div className="flex flex-col items-center justify-center space-y-4">
      {/* Logo Animation */}
      {showLogo && (
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.5 }}
          className="mb-4"
        >
          <div className="relative">
            <motion.div
              animate={{
                rotate: 360,
                scale: [1, 1.1, 1],
              }}
              transition={{
                rotate: { duration: 2, repeat: Infinity, ease: "linear" },
                scale: { duration: 1.5, repeat: Infinity, ease: "easeInOut" },
              }}
              className="w-16 h-16 bg-gradient-to-br from-amber-500 to-orange-500 rounded-2xl flex items-center justify-center shadow-lg"
            >
              <ChefHat className="w-8 h-8 text-white" />
            </motion.div>

            {/* Orbiting dots */}
            <motion.div
              animate={{ rotate: -360 }}
              transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
              className="absolute inset-0"
            >
              <div className="absolute -top-1 left-1/2 transform -translate-x-1/2 w-2 h-2 bg-amber-300 rounded-full" />
              <div className="absolute top-1/2 -right-1 transform -translate-y-1/2 w-2 h-2 bg-orange-300 rounded-full" />
              <div className="absolute -bottom-1 left-1/2 transform -translate-x-1/2 w-2 h-2 bg-red-300 rounded-full" />
              <div className="absolute top-1/2 -left-1 transform -translate-y-1/2 w-2 h-2 bg-yellow-300 rounded-full" />
            </motion.div>
          </div>
        </motion.div>
      )}

      {/* Spinner */}
      <div className="relative">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          className={`${sizeClasses[size]} ${colorClasses[color]}`}
        >
          <Loader2 className="w-full h-full" />
        </motion.div>

        {/* Pulse ring */}
        <motion.div
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.5, 0, 0.5],
          }}
          transition={{
            duration: 1.5,
            repeat: Infinity,
            ease: "easeInOut",
          }}
          className={`absolute inset-0 rounded-full border-2 border-current ${sizeClasses[size]}`}
        />
      </div>

      {/* Loading text */}
      {text && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.5 }}
          className="text-center"
        >
          <motion.p
            animate={{ opacity: [0.6, 1, 0.6] }}
            transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
            className="text-gray-400 font-medium text-sm"
          >
            {text}
          </motion.p>

          {/* Animated dots */}
          <div className="flex justify-center space-x-1 mt-2">
            <motion.div
              animate={{ opacity: [0.3, 1, 0.3] }}
              transition={{
                duration: 1.4,
                repeat: Infinity,
                ease: "easeInOut",
              }}
              className="w-1 h-1 bg-amber-500 rounded-full"
            />
            <motion.div
              animate={{ opacity: [0.3, 1, 0.3] }}
              transition={{
                duration: 1.4,
                repeat: Infinity,
                ease: "easeInOut",
                delay: 0.2,
              }}
              className="w-1 h-1 bg-orange-500 rounded-full"
            />
            <motion.div
              animate={{ opacity: [0.3, 1, 0.3] }}
              transition={{
                duration: 1.4,
                repeat: Infinity,
                ease: "easeInOut",
                delay: 0.4,
              }}
              className="w-1 h-1 bg-red-500 rounded-full"
            />
          </div>
        </motion.div>
      )}
    </div>
  );

  if (fullScreen) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center p-8">
        <div className="relative">
          {/* Background elements */}
          <div className="absolute inset-0">
            <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:80px_80px]" />

            <motion.div
              animate={{
                x: [0, 50, 0],
                y: [0, -30, 0],
                scale: [1, 1.1, 1],
              }}
              transition={{
                duration: 15,
                repeat: Infinity,
                ease: "easeInOut",
              }}
              className="absolute top-20 left-20 w-32 h-32 bg-gradient-to-r from-amber-500/5 to-orange-500/5 rounded-full blur-3xl"
            />
            <motion.div
              animate={{
                x: [0, -40, 0],
                y: [0, 40, 0],
                scale: [1, 0.9, 1],
              }}
              transition={{
                duration: 18,
                repeat: Infinity,
                ease: "easeInOut",
                delay: 5,
              }}
              className="absolute bottom-20 right-20 w-40 h-40 bg-gradient-to-r from-purple-500/5 to-pink-500/5 rounded-full blur-3xl"
            />
          </div>

          {/* Content */}
          <div className="relative z-10">{spinnerContent}</div>
        </div>
      </div>
    );
  }

  return spinnerContent;
};

export default LoadingSpinner;
