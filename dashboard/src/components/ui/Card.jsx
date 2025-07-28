import React from "react";
import { motion } from "framer-motion";
import { cn } from "../../utils/cn";

const Card = React.forwardRef(
  (
    {
      children,
      className = "",
      variant = "default",
      hover = true,
      interactive = false,
      onClick,
      ...props
    },
    ref
  ) => {
    const baseClasses = "bg-white rounded-xl shadow-sm border border-gray-200";

    const variantClasses = {
      default: "bg-white border-gray-200",
      glass: "bg-white/5 backdrop-blur-xl border-white/10",
      elevated: "shadow-lg",
      bordered: "border-2 border-gray-300",
    };

    const classes = cn(
      baseClasses,
      variantClasses[variant],
      hover && "hover:shadow-md hover:scale-[1.01] transition-all duration-200",
      interactive && "cursor-pointer",
      className
    );

    const handleClick = () => {
      if (interactive && onClick) {
        onClick();
      }
    };

    return (
      <motion.div
        ref={ref}
        className={classes}
        onClick={handleClick}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, ease: "easeOut" }}
        whileHover={interactive ? { scale: 1.02 } : {}}
        whileTap={interactive ? { scale: 0.98 } : {}}
        {...props}
      >
        {/* Gradient overlay for glass variant */}
        {variant === "glass" && (
          <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent rounded-xl pointer-events-none" />
        )}

        {/* Content */}
        <div className="relative z-10">{children}</div>
      </motion.div>
    );
  }
);

const CardHeader = React.forwardRef(
  ({ children, className = "", ...props }, ref) => {
    return (
      <div ref={ref} className={cn("p-6 pb-0", className)} {...props}>
        {children}
      </div>
    );
  }
);

const CardBody = React.forwardRef(
  ({ children, className = "", ...props }, ref) => {
    return (
      <div ref={ref} className={cn("p-6", className)} {...props}>
        {children}
      </div>
    );
  }
);

const CardFooter = React.forwardRef(
  ({ children, className = "", ...props }, ref) => {
    return (
      <div ref={ref} className={cn("p-6 pt-0", className)} {...props}>
        {children}
      </div>
    );
  }
);

Card.displayName = "Card";
CardHeader.displayName = "CardHeader";
CardBody.displayName = "CardBody";
CardFooter.displayName = "CardFooter";

export { Card, CardHeader, CardBody, CardFooter };
export default Card;
