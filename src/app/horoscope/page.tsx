"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import GlassCard from "@/components/ui/GlassCard";
import AnimatedButton from "@/components/ui/AnimatedButton";
import { ZODIAC_SIGNS } from "@/lib/zodiac";
import { Star } from "lucide-react";

export default function HoroscopePage() {
  const [selectedSign, setSelectedSign] = useState(ZODIAC_SIGNS[0].name);
  const [type, setType] = useState<"daily" | "weekly">("daily");

  const horoscopeTexts = {
    daily: "Today is a day of unexpected connections. The cosmic energies are aligning to bring new people into your orbit. Be open to conversations with strangers, as they might hold the key to a problem you've been trying to solve. Your intuition is particularly strong right now.",
    weekly: "This week requires patience. As the moon transits your ruling sector, emotions may run high. Focus on grounding exercises and avoid making major financial decisions until Friday. A surprising message mid-week will clarify your next steps."
  };

  return (
    <div className="py-24 px-6 max-w-5xl mx-auto">
      <div className="text-center mb-16">
        <h1 className="text-4xl md:text-6xl font-heading font-bold mb-6 text-glow-blue">Your Cosmic Forecast</h1>
        <p className="text-xl text-gray-300">Select your sign to reveal your personalized horoscopes.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
        <div className="hidden md:flex flex-col gap-2">
          {ZODIAC_SIGNS.map(sign => (
            <button 
              key={sign.name}
              onClick={() => setSelectedSign(sign.name)}
              className={`text-left px-4 py-2 rounded-lg transition-all ${selectedSign === sign.name ? 'bg-accent-blue/20 text-accent-blue font-bold border border-accent-blue/30' : 'text-gray-400 hover:bg-white/5 hover:text-white'}`}
            >
              {sign.name}
            </button>
          ))}
        </div>
        
        {/* Mobile Dropdown */}
        <div className="md:hidden">
          <select 
            className="w-full p-4 bg-[#151226] border border-white/10 rounded-lg text-white"
            value={selectedSign}
            onChange={(e) => setSelectedSign(e.target.value)}
          >
            {ZODIAC_SIGNS.map(sign => (
              <option key={sign.name} value={sign.name}>{sign.name}</option>
            ))}
          </select>
        </div>

        <GlassCard className="md:col-span-3 min-h-[400px] flex flex-col relative overflow-hidden">
          <div className="absolute top-0 right-0 p-8 opacity-10">
            <Star className="w-48 h-48 animate-[spin_60s_linear_infinite]" />
          </div>

          <div className="flex gap-4 mb-8 relative z-10 border-b border-white/10 pb-4">
            <button 
              onClick={() => setType("daily")}
              className={`text-lg font-bold pb-2 border-b-2 transition-all ${type === "daily" ? "border-accent-pink text-accent-pink" : "border-transparent text-gray-400 hover:text-white"}`}
            >
              Daily
            </button>
            <button 
              onClick={() => setType("weekly")}
              className={`text-lg font-bold pb-2 border-b-2 transition-all ${type === "weekly" ? "border-accent-pink text-accent-pink" : "border-transparent text-gray-400 hover:text-white"}`}
            >
              Weekly
            </button>
          </div>

          <motion.div 
            key={selectedSign + type}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="relative z-10 flex-1"
          >
            <h2 className="text-3xl font-heading font-bold mb-6 text-white">{selectedSign} Forecast</h2>
            <p className="text-gray-300 text-lg leading-relaxed mix-blend-lighten">
              {horoscopeTexts[type]}
            </p>
          </motion.div>

          <div className="mt-8 pt-6 border-t border-white/10 flex justify-between items-center relative z-10">
            <p className="text-sm text-gray-500">Updated: Today, 12:00 AM</p>
            <AnimatedButton variant="outline" size="sm">Get Full Report</AnimatedButton>
          </div>
        </GlassCard>
      </div>
    </div>
  );
}
