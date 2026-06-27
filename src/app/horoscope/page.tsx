import { Metadata } from "next";
import HoroscopeClient from "@/components/horoscope/HoroscopeClient";

export const metadata: Metadata = {
  title: "Horoscope | AstroGuru",
  description: "Read your daily, weekly, and monthly horoscopes to gain insights into your life and future.",
};

export default function HoroscopePage() {
  return (
    <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 lg:py-12 bg-cream text-ink">
      <div className="mb-10 text-center">
        <h1 className="text-3xl md:text-5xl font-extrabold font-heading text-bhagva mb-4 tracking-tight">
          Your Horoscope
        </h1>
        <p className="text-base md:text-lg text-ink-muted max-w-2xl mx-auto leading-relaxed">
          Discover what the stars have in store for you today, this week, and this month. Let the cosmic energies guide your path.
        </p>
      </div>
      
      <HoroscopeClient />
    </div>
  );
}
