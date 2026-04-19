"use client";

import { useState } from "react";
import { motion as fmotion, AnimatePresence } from "framer-motion";
import GlassCard from "@/components/ui/GlassCard";
import AnimatedButton from "@/components/ui/AnimatedButton";
import { getZodiacSign, ZodiacSign } from "@/lib/zodiac";
import { Sparkles, Calendar, User } from "lucide-react";

export default function ZodiacPredictor() {
  const [name, setName] = useState("");
  const [date, setDate] = useState("");
  const [result, setResult] = useState<ZodiacSign | null>(null);

  const handlePredict = (e: React.FormEvent) => {
    e.preventDefault();
    if (!date) return;
    
    // JS dates can be tricky with timezones, parse carefully
    const d = new Date(date);
    // Add timezone offset to prevent off-by-one day errors
    d.setMinutes(d.getMinutes() + d.getTimezoneOffset());
    
    const sign = getZodiacSign(d);
    setResult(sign);
  };

  const containerVariants = {
    hidden: { opacity: 0, scale: 0.95 },
    visible: { opacity: 1, scale: 1, transition: { duration: 0.5 } },
    exit: { opacity: 0, scale: 0.95, transition: { duration: 0.3 } }
  };

  return (
    <div className="py-24 px-6 max-w-4xl mx-auto flex flex-col items-center min-h-[80vh]">
      <div className="text-center mb-12">
        <h1 className="text-4xl md:text-6xl font-heading font-bold mb-6 text-glow-blue flex items-center justify-center gap-4">
          <Sparkles className="w-8 h-8 text-accent-gold" />
          Zodiac Predictor
        </h1>
        <p className="text-xl text-gray-300">Enter your birth date to precisely calculate your true cosmic alignment.</p>
      </div>

      <div className="w-full flex justify-center">
        {!result ? (
          <fmotion.div className="w-full max-w-md" variants={containerVariants} initial="hidden" animate="visible" exit="exit">
            <GlassCard>
              <form onSubmit={handlePredict} className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">First Name (Optional)</label>
                  <div className="relative">
                    <User className="absolute left-4 top-3.5 w-5 h-5 text-gray-500" />
                    <input 
                      type="text" 
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="Your name"
                      className="w-full pl-12 pr-4 py-3 bg-[#080b14]/50 border border-white/10 rounded-lg text-white focus:outline-none focus:border-accent-pink transition-colors"
                    />
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Birth Date (Required)</label>
                  <div className="relative">
                    <Calendar className="absolute left-4 top-3.5 w-5 h-5 text-gray-500" />
                    <input 
                      type="date" 
                      required
                      value={date}
                      onChange={(e) => setDate(e.target.value)}
                      className="w-full pl-12 pr-4 py-3 bg-[#080b14]/50 border border-white/10 rounded-lg text-white focus:outline-none focus:border-accent-blue transition-colors [color-scheme:dark]"
                    />
                  </div>
                </div>

                <AnimatedButton type="submit" className="w-full">Reveal Zodiac Sign</AnimatedButton>
              </form>
            </GlassCard>
          </fmotion.div>
        ) : (
          <fmotion.div className="w-full max-w-lg" variants={containerVariants} initial="hidden" animate="visible">
            <GlassCard className="text-center relative overflow-hidden">
              <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-accent-pink to-accent-blue" />
              
              <h2 className="text-2xl text-gray-300 mb-2">{name ? `${name}, your sign is` : "Your sign is"}</h2>
              <h1 className="text-6xl font-heading font-bold text-glow mb-4">{result.name}</h1>
              
              <div className="flex justify-center gap-4 mb-8">
                <span className="px-3 py-1 bg-white/10 rounded-full text-sm font-medium border border-white/20">Element: {result.element}</span>
                <span className="px-3 py-1 bg-white/10 rounded-full text-sm font-medium border border-white/20">Ruler: {result.ruler}</span>
              </div>

              <div className="mb-8">
                <h3 className="text-lg font-bold mb-3 text-accent-gold">Core Traits</h3>
                <div className="flex flex-wrap justify-center gap-2">
                  {result.traits.map(t => (
                    <span key={t} className="px-4 py-2 bg-accent-gold/10 text-accent-gold border border-accent-gold/30 rounded-lg">{t}</span>
                  ))}
                </div>
              </div>

              <AnimatedButton variant="outline" onClick={() => setResult(null)} className="mx-auto">
                Calculate Another
              </AnimatedButton>
            </GlassCard>
          </fmotion.div>
        )}
      </div>
    </div>
  );
}
