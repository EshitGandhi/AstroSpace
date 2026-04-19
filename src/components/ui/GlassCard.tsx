import { ReactNode } from "react";

type GlassCardProps = {
  children: ReactNode;
  className?: string;
};

export default function GlassCard({ children, className = "" }: GlassCardProps) {
  return (
    <div className={`glass-card p-6 md:p-8 ${className}`}>
      {children}
    </div>
  );
}
