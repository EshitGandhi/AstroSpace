import type { Metadata } from "next";
import KundliPageClient from "./KundliPageClient";

export const metadata: Metadata = {
  title: "Kundli | AstroGuru",
  description: "Generate your Vedic birth chart with precise planetary positions using Lahiri ayanamsa.",
};

export default function KundliPage() {
  return <KundliPageClient />;
}
