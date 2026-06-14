import { ReactNode } from "react";

type GlassCardProps = {
  children: ReactNode;
  className?: string;
};

export default function GlassCard({ children, className = "" }: GlassCardProps) {
  return (
    <div className={`bg-cream-tint/50 border border-ink/10 rounded-2xl p-6 md:p-8 ${className}`}>
      {children}
    </div>
  );
}
