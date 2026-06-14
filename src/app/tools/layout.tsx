import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Free Rashi Checker | AstroGuru",
  description: "Instant Vedic Sun-sign Rashi check using your date of birth. Free and client-side.",
};

export default function ToolsLayout({ children }: { children: React.ReactNode }) {
  return children;
}
