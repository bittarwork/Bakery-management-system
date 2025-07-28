import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

const Tooltip = ({ children, content, position = "top", delay = 500 }) => {
  const [isVisible, setIsVisible] = useState(false);
  let timeoutId;

  const showTooltip = () => {
    timeoutId = setTimeout(() => {
      setIsVisible(true);
    }, delay);
  };

  const hideTooltip = () => {
    clearTimeout(timeoutId);
    setIsVisible(false);
  };

  const getPositionClasses = () => {
    switch (position) {
      case "top":
        return "bottom-full left-1/2 transform -translate-x-1/2 mb-2";
      case "bottom":
        return "top-full left-1/2 transform -translate-x-1/2 mt-2";
      case "left":
        return "right-full top-1/2 transform -translate-y-1/2 mr-2";
      case "right":
        return "left-full top-1/2 transform -translate-y-1/2 ml-2";
      default:
        return "bottom-full left-1/2 transform -translate-x-1/2 mb-2";
    }
  };

  const getArrowClasses = () => {
    switch (position) {
      case "top":
        return "top-full left-1/2 transform -translate-x-1/2 border-t-gray-800 border-t-4 border-x-transparent border-x-2 border-b-0";
      case "bottom":
        return "bottom-full left-1/2 transform -translate-x-1/2 border-b-gray-800 border-b-4 border-x-transparent border-x-2 border-t-0";
      case "left":
        return "left-full top-1/2 transform -translate-y-1/2 border-l-gray-800 border-l-4 border-y-transparent border-y-2 border-r-0";
      case "right":
        return "right-full top-1/2 transform -translate-y-1/2 border-r-gray-800 border-r-4 border-y-transparent border-y-2 border-l-0";
      default:
        return "top-full left-1/2 transform -translate-x-1/2 border-t-gray-800 border-t-4 border-x-transparent border-x-2 border-b-0";
    }
  };

  return (
    <div
      className="relative inline-block"
      onMouseEnter={showTooltip}
      onMouseLeave={hideTooltip}
    >
      {children}
      <AnimatePresence>
        {isVisible && content && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            transition={{ duration: 0.15 }}
            className={`absolute z-50 ${getPositionClasses()}`}
          >
            <div className="bg-gray-800 text-white text-xs px-3 py-2 rounded-lg shadow-lg whitespace-nowrap max-w-xs">
              {content}
              <div className={`absolute w-0 h-0 ${getArrowClasses()}`} />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Tooltip; 