import type { Metadata } from "next";
import HoroscopePageClient from "./HoroscopePageClient";

export const metadata: Metadata = {
  title: "Daily Horoscope | AstroGuru",
  description: "Sun-sign based daily and weekly Vedic horoscope forecasts for all 12 Rashis.",
};

export default function HoroscopePage() {
  return <HoroscopePageClient />;
}
