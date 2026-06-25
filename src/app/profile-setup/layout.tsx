import type { ReactNode } from "react";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Complete Your Profile | AstroGuru",
  description: "Set up your astrological profile to receive personalized Kundli, horoscope, and guidance.",
};

/**
 * Standalone layout for /profile-setup — no NavRail or Footer.
 * Provides a focused, distraction-free onboarding experience.
 */
export default function ProfileSetupLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-cream via-cream-tint/30 to-cream relative overflow-x-hidden">
      {/* Ambient zodiac circles — purely decorative */}
      <div
        aria-hidden="true"
        className="pointer-events-none fixed inset-0 overflow-hidden"
      >
        {/* Top-right glow */}
        <div className="absolute -top-40 -right-40 w-[500px] h-[500px] rounded-full bg-bhagva/5 blur-3xl" />
        {/* Bottom-left glow */}
        <div className="absolute -bottom-32 -left-32 w-[400px] h-[400px] rounded-full bg-gold/8 blur-3xl" />
        {/* Subtle dashed ring */}
        <svg
          className="absolute top-8 right-8 w-48 h-48 text-bhagva/10 hidden lg:block"
          viewBox="0 0 200 200"
          fill="none"
        >
          <circle cx="100" cy="100" r="90" stroke="currentColor" strokeWidth="1" strokeDasharray="6 10" />
          <circle cx="100" cy="100" r="70" stroke="currentColor" strokeWidth="0.5" strokeDasharray="3 8" />
        </svg>
        <svg
          className="absolute bottom-16 left-8 w-32 h-32 text-gold/15 hidden lg:block"
          viewBox="0 0 200 200"
          fill="none"
        >
          <circle cx="100" cy="100" r="85" stroke="currentColor" strokeWidth="1" strokeDasharray="4 12" />
        </svg>
      </div>

      {/* Content */}
      <div className="relative z-10 lg:ml-0">{children}</div>
    </div>
  );
}
