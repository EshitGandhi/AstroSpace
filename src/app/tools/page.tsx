"use client";

import { useState } from "react";
import Badge from "@/components/ui/Badge";
import AnimatedButton from "@/components/ui/AnimatedButton";
import Link from "next/link";
import { ArrowRight, Info } from "lucide-react";
import { getZodiacSign, ZodiacSign } from "@/lib/zodiac";

export default function FreeToolsPage() {
  const [dob, setDob] = useState("");
  const [tob, setTob] = useState("");
  const [result, setResult] = useState<ZodiacSign | null>(null);

  const handleCheckRashi = (e: React.FormEvent) => {
    e.preventDefault();
    if (!dob) return;
    
    // Wire up the actual logic from zodiac.ts
    const dateObj = new Date(dob);
    const sign = getZodiacSign(dateObj);
    
    if (sign) {
      setResult(sign);
    }
  };

  return (
    <div className="bg-cream min-h-screen pt-32 pb-24 px-6 text-ink">
      <div className="max-w-4xl mx-auto space-y-16">
        
        {/* Page Header */}
        <div className="text-center space-y-4">
          <Badge>Vedic Calculator</Badge>
          <h1 className="text-4xl md:text-5xl font-heading font-bold text-ink">Free Rashi Checker</h1>
          <p className="text-lg text-ink-muted max-w-2xl mx-auto">
            Discover your Vedic Sun sign instantly using your Date of Birth.
          </p>
        </div>

        {/* Input Form */}
        <section className="bg-white border border-ink/10 rounded-3xl p-8 md:p-12 shadow-sm max-w-2xl mx-auto">
          <form onSubmit={handleCheckRashi} className="space-y-6">
            <div className="space-y-2">
              <label htmlFor="dob" className="block text-sm font-bold text-ink">Date of Birth (Required)</label>
              <input
                id="dob"
                type="date"
                required
                value={dob}
                onChange={(e) => setDob(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-ink/20 bg-cream focus:outline-none focus:border-bhagva focus:ring-1 focus:ring-bhagva transition-colors"
              />
            </div>
            
            <div className="space-y-2">
              <label htmlFor="tob" className="block text-sm font-bold text-ink">
                Time of Birth (Optional)
              </label>
              <input
                id="tob"
                type="time"
                value={tob}
                onChange={(e) => setTob(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-ink/20 bg-cream focus:outline-none focus:border-bhagva focus:ring-1 focus:ring-bhagva transition-colors"
              />
              <p className="text-xs text-ink-muted flex items-center gap-1 mt-1">
                <Info className="w-3 h-3" /> Time helps calculate the exact Nakshatra if born on a cusp.
              </p>
            </div>

            <AnimatedButton variant="primary" size="lg" className="w-full mt-4">
              Check My Rashi
            </AnimatedButton>
          </form>
        </section>

        {/* Result Area */}
        {result && (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 space-y-8">
            <section className="border-2 border-gold/50 bg-gold/5 rounded-3xl p-8 text-center max-w-2xl mx-auto">
              <span className="text-sm font-bold uppercase tracking-widest text-bhagva">Your Vedic Sun Sign</span>
              <h2 className="text-4xl font-heading font-bold text-ink mt-2">{result.name}</h2>
              <div className="flex items-center justify-center gap-4 mt-4 text-sm font-semibold text-ink-muted">
                <span>Element: {result.element}</span>
                <span>•</span>
                <span>Ruling Planet: {result.ruler}</span>
              </div>
              <p className="text-lg text-ink mt-6">
                {result.traits.join(" • ")}
              </p>
            </section>

            {/* Upsell to Kundli */}
            <section className="bg-night rounded-3xl p-8 text-center text-white flex flex-col md:flex-row items-center justify-between gap-6 max-w-3xl mx-auto">
              <div className="text-left space-y-2">
                <h3 className="text-xl font-heading font-bold text-gold">Want the full picture?</h3>
                <p className="text-sm text-white/80">Your Sun sign is just 10% of your astrological identity. Generate your complete birth chart to find your Moon sign and ascendant.</p>
              </div>
              <Link href="/kundli" className="shrink-0 w-full md:w-auto">
                <AnimatedButton variant="primary" size="md" className="w-full">
                  Create Full Kundli <ArrowRight className="w-4 h-4 ml-2" />
                </AnimatedButton>
              </Link>
            </section>
          </div>
        )}
        
      </div>
    </div>
  );
}
