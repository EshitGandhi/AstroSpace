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
};

export default function AnimatedButton({ 
  children, 
  onClick, 
  variant = "primary", 
  size = "md", 
  className = "",
  type = "button",
  disabled = false
}: ButtonProps) {
  
  const baseClasses = "relative font-semibold rounded-full flex items-center justify-center transition-all overflow-hidden";
  
  const sizeClasses = {
    sm: "px-4 py-2 text-sm",
    md: "px-6 py-3 text-base",
    lg: "px-8 py-4 text-lg",
  };

  const variantClasses = {
    primary: "bg-gradient-to-r from-accent-pink to-accent-purple text-white shadow-[0_0_15px_rgba(255,0,127,0.5)] border border-transparent",
    secondary: "bg-white/10 text-white backdrop-blur-md border border-white/20 hover:bg-white/20",
    outline: "bg-transparent text-white border border-accent-blue shadow-[0_0_10px_rgba(0,240,255,0.3)] hover:shadow-[0_0_20px_rgba(0,240,255,0.6)]",
  };

  return (
    <motion.button
      type={type}
      onClick={onClick}
      disabled={disabled}
      whileHover={{ scale: disabled ? 1 : 1.05 }}
      whileTap={{ scale: disabled ? 1 : 0.95 }}
      className={`
        ${baseClasses} 
        ${sizeClasses[size]} 
        ${variantClasses[variant]} 
        ${disabled ? "opacity-50 cursor-not-allowed" : ""} 
        ${className}
      `}
    >
      <span className="relative z-10">{children}</span>
      {variant === "primary" && !disabled && (
        <motion.div
          className="absolute inset-0 bg-white/20"
          initial={{ x: "-100%" }}
          whileHover={{ x: "100%" }}
          transition={{ duration: 0.5, ease: "easeInOut" }}
        />
      )}
    </motion.button>
  );
}
