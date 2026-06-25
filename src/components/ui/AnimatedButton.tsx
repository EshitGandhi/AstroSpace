"use client";

import { motion } from "framer-motion";
import { ReactNode } from "react";

type ButtonProps = {
  children: ReactNode;
  onClick?: () => void;
  variant?: "primary" | "secondary" | "outline";
  size?: "sm" | "md" | "lg";
  className?: string;
  type?: "button" | "submit" | "reset";
  disabled?: boolean;
  surface?: "night" | "cream";
};

export default function AnimatedButton({ 
  children, 
  onClick, 
  variant = "primary", 
  size = "md", 
  className = "",
  type = "button",
  disabled = false,
  surface = "cream"
}: ButtonProps) {
  
  const baseClasses = "relative font-semibold rounded-full flex items-center justify-center transition-all overflow-hidden border";
  
  const sizeClasses = {
    sm: "px-4 py-2 text-sm",
    md: "px-6 py-3 text-base",
    lg: "px-8 py-4 text-lg",
  };

  const getVariantClasses = () => {
    if (variant === "primary") {
      return "bg-bhagva text-white border-transparent hover:bg-bhagva/90";
    }
    
    // For secondary/outline
    if (surface === "night") {
      return "bg-transparent text-white border-white/40 hover:border-white hover:bg-white/10";
    } else {
      return "bg-transparent text-ink border-ink/20 hover:border-bhagva hover:text-bhagva";
    }
  };

  return (
    <motion.button
      type={type}
      onClick={onClick}
      disabled={disabled}
      whileHover={{ scale: disabled ? 1 : 1.02 }}
      whileTap={{ scale: disabled ? 1 : 0.98 }}
      className={`
        ${baseClasses} 
        ${sizeClasses[size]} 
        ${getVariantClasses()} 
        ${disabled ? "opacity-50 cursor-not-allowed" : ""} 
        ${className}
      `}
    >
      <span className="relative z-10">{children}</span>
      {variant === "primary" && !disabled && (
        <motion.div
          className="absolute inset-0 bg-white/10"
          initial={{ x: "-100%" }}
          whileHover={{ x: "100%" }}
          transition={{ duration: 0.5, ease: "easeInOut" }}
        />
      )}
    </motion.button>
  );
}
