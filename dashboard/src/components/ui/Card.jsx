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
    const baseClasses = "card";

    const variantClasses = {
      default: "",
      glass: "card-glass",
      elevated: "shadow-large",
      bordered: "border-2 border-border/50",
    };

    const classes = cn(
      baseClasses,
      variantClasses[variant],
      hover && "hover:shadow-medium hover:scale-[1.01]",
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
      <div ref={ref} className={cn("card-header", className)} {...props}>
        {children}
      </div>
    );
  }
);

const CardBody = React.forwardRef(
  ({ children, className = "", ...props }, ref) => {
    return (
      <div ref={ref} className={cn("card-body", className)} {...props}>
        {children}
      </div>
    );
  }
);

const CardFooter = React.forwardRef(
  ({ children, className = "", ...props }, ref) => {
    return (
      <div ref={ref} className={cn("card-footer", className)} {...props}>
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
