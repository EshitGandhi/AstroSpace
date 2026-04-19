"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import GlassCard from "@/components/ui/GlassCard";
import { ZODIAC_SIGNS } from "@/lib/zodiac";

export default function ZodiacExplorer() {
  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.1 }
    }
  };

  const item = {
    hidden: { opacity: 0, scale: 0.8 },
    show: { opacity: 1, scale: 1, transition: { duration: 0.4 } }
  };

  return (
    <div className="py-24 px-6 md:px-12 max-w-7xl mx-auto">
      <div className="text-center mb-16">
        <h1 className="text-4xl md:text-6xl font-heading font-bold mb-6 text-glow">Zodiac Explorer</h1>
        <p className="text-xl text-gray-300 max-w-2xl mx-auto">
          Delve into the 12 cosmic archetypes. Discover the traits, elements, and ruling planets that shape each sign's destiny.
        </p>
      </div>

      <motion.div 
        variants={container}
        initial="hidden"
        animate="show"
        className="grid grid-cols-2 md:grid-cols-4 gap-6"
      >
        {ZODIAC_SIGNS.map((sign, i) => (
          <motion.div key={i} variants={item}>
            <Link href={`/zodiac-explorer/${sign.name.toLowerCase()}`}>
              <GlassCard className="h-full cursor-pointer hover:border-accent-pink/50 transition-colors group">
                <div className="flex flex-col items-center text-center space-y-4">
                  <div className="w-16 h-16 rounded-full bg-white/10 flex items-center justify-center text-2xl font-bold group-hover:bg-accent-pink/20 transition-colors">
                    {/* Placeholder for real zodiac glyph */}
                    {sign.name[0]}
                  </div>
                  <div>
                    <h3 className="text-xl font-bold">{sign.name}</h3>
                    <p className="text-sm text-gray-400">{sign.startDate} - {sign.endDate}</p>
                  </div>
                  <div className="flex gap-2 flex-wrap justify-center mt-2">
                    <span className="text-xs px-2 py-1 rounded bg-white/5 border border-white/10">{sign.element}</span>
                    <span className="text-xs px-2 py-1 rounded bg-white/5 border border-white/10">{sign.ruler}</span>
                  </div>
                </div>
              </GlassCard>
            </Link>
          </motion.div>
        ))}
      </motion.div>
    </div>
  );
}
