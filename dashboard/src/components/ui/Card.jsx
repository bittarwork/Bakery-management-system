import React from "react";
import { motion } from "framer-motion";
import { clsx } from "clsx";

const Card = ({
  children,
  className = "",
  hover = true,
  padding = "default",
  ...props
}) => {
  const paddingClasses = {
    none: "",
    sm: "p-3",
    default: "p-6",
    lg: "p-8",
  };

  const classes = clsx(
    "bg-white rounded-lg shadow-sm border border-gray-200",
    paddingClasses[padding],
    className
  );

  const MotionCard = motion.div;

  return (
    <MotionCard
      className={classes}
      whileHover={
        hover ? { y: -2, boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.1)" } : {}
      }
      transition={{ duration: 0.2 }}
      {...props}
    >
      {children}
    </MotionCard>
  );
};

const CardHeader = ({ children, className = "", ...props }) => (
  <div
    className={clsx("border-b border-gray-200 pb-4 mb-4", className)}
    {...props}
  >
    {children}
  </div>
);

const CardBody = ({ children, className = "", ...props }) => (
  <div className={clsx("", className)} {...props}>
    {children}
  </div>
);

const CardFooter = ({ children, className = "", ...props }) => (
  <div
    className={clsx("border-t border-gray-200 pt-4 mt-4", className)}
    {...props}
  >
    {children}
  </div>
);

Card.Header = CardHeader;
Card.Body = CardBody;
Card.Footer = CardFooter;

export default Card;
