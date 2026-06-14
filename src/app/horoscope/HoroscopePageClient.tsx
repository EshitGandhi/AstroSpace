"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import GlassCard from "@/components/ui/GlassCard";
import AnimatedButton from "@/components/ui/AnimatedButton";
import Badge from "@/components/ui/Badge";
import { ZODIAC_SIGNS, getHoroscopeText } from "@/lib/horoscope";
import { Star } from "lucide-react";
import Link from "next/link";

export default function HoroscopePageClient() {
  const [selectedSign, setSelectedSign] = useState(ZODIAC_SIGNS[0].name);
  const [type, setType] = useState<"daily" | "weekly">("daily");

  const forecast = getHoroscopeText(selectedSign, type);

  return (
    <div className="bg-cream min-h-screen py-24 px-6 max-w-5xl mx-auto text-ink">
      <div className="text-center mb-16">
        <Badge>Daily Forecast</Badge>
        <h1 className="text-4xl md:text-5xl font-heading font-bold mb-4 mt-4">
          Your Cosmic Forecast
        </h1>
        <p className="text-xl text-ink-muted">
          Sun-sign based guidance keyed to your Vedic Rashi.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
        <div className="hidden md:flex flex-col gap-2" role="tablist" aria-label="Zodiac signs">
          {ZODIAC_SIGNS.map((sign) => (
            <button
              key={sign.name}
              role="tab"
              aria-selected={selectedSign === sign.name}
              onClick={() => setSelectedSign(sign.name)}
              className={`text-left px-4 py-2 rounded-lg transition-all focus:outline-none focus:ring-2 focus:ring-bhagva ${
                selectedSign === sign.name
                  ? "bg-cream-tint text-bhagva font-bold border border-bhagva/30"
                  : "text-ink-muted hover:bg-white hover:text-ink"
              }`}
            >
              {sign.name}
            </button>
          ))}
        </div>

        <div className="md:hidden">
          <label htmlFor="sign-select" className="sr-only">Select sign</label>
          <select
            id="sign-select"
            className="w-full p-4 bg-white border border-ink/20 rounded-xl text-ink focus:outline-none focus:ring-2 focus:ring-bhagva"
            value={selectedSign}
            onChange={(e) => setSelectedSign(e.target.value)}
          >
            {ZODIAC_SIGNS.map((sign) => (
              <option key={sign.name} value={sign.name}>
                {sign.name}
              </option>
            ))}
          </select>
        </div>

        <GlassCard className="md:col-span-3 min-h-[400px] flex flex-col relative overflow-hidden bg-white">
          <div className="absolute top-0 right-0 p-8 opacity-10" aria-hidden="true">
            <Star className="w-48 h-48 text-gold animate-[spin_60s_linear_infinite]" />
          </div>

          <div className="flex gap-4 mb-8 relative z-10 border-b border-ink/10 pb-4" role="tablist">
            {(["daily", "weekly"] as const).map((t) => (
              <button
                key={t}
                role="tab"
                aria-selected={type === t}
                onClick={() => setType(t)}
                className={`text-lg font-bold pb-2 border-b-2 transition-all capitalize focus:outline-none focus:ring-2 focus:ring-bhagva rounded ${
                  type === t
                    ? "border-bhagva text-bhagva"
                    : "border-transparent text-ink-muted hover:text-ink"
                }`}
              >
                {t}
              </button>
            ))}
          </div>

          <motion.div
            key={selectedSign + type}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="relative z-10 flex-1"
          >
            <h2 className="text-3xl font-heading font-bold mb-6">{selectedSign} Forecast</h2>
            <p className="text-ink-muted text-lg leading-relaxed">{forecast}</p>
          </motion.div>

          <div className="mt-8 pt-6 border-t border-ink/10 flex justify-between items-center relative z-10">
            <p className="text-sm text-ink-muted">Updated: Today, 12:00 AM IST</p>
            <Link href="/kundli">
              <AnimatedButton variant="secondary" size="sm">Get Full Kundli</AnimatedButton>
            </Link>
          </div>
        </GlassCard>
      </div>
    </div>
  );
}
