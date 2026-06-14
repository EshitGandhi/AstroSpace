"use client";

import { useState } from "react";
import toast from "react-hot-toast";
import Badge from "@/components/ui/Badge";
import AnimatedButton from "@/components/ui/AnimatedButton";
import KundliForm from "@/components/kundli/KundliForm";
import KundliChart from "@/components/kundli/KundliChart";
import KundliDetailsPanel from "@/components/kundli/KundliDetailsPanel";
import type { KundliResult } from "@/lib/vedic/types";
import { Share2 } from "lucide-react";

export default function KundliPageClient() {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<KundliResult | null>(null);
  const [placeName, setPlaceName] = useState("");
  const [chartStyle, setChartStyle] = useState<"north" | "south">("north");

  const handleSubmit = async (data: {
    name: string;
    date: string;
    time: string;
    lat: number;
    lng: number;
    timezone: string;
    placeName: string;
  }) => {
    setLoading(true);
    setPlaceName(data.placeName);
    try {
      const res = await fetch("/api/kundli", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error("Failed");
      const chart = await res.json();
      setResult(chart);
      toast.success("Kundli generated!");
    } catch {
      toast.error("Could not generate Kundli. Please check your details.");
    } finally {
      setLoading(false);
    }
  };

  const shareSummary = () => {
    if (!result) return;
    const text = [
      `${result.name ?? "My"} Vedic Birth Chart`,
      `Lagna: ${result.lagnaSign}`,
      `Moon: ${result.moonRashi} (${result.nakshatra})`,
      `Current Dasha: ${result.dasha.currentLord}`,
      `Generated at AstroGuru`,
    ].join("\n");
    navigator.clipboard.writeText(text);
    toast.success("Summary copied to clipboard!");
  };

  return (
    <div className="bg-night min-h-screen pt-32 pb-24 px-6 text-white">
      <div className="max-w-6xl mx-auto space-y-12">
        <div className="text-center space-y-4">
          <Badge>Kundli Generator</Badge>
          <h1 className="text-4xl md:text-5xl font-heading font-bold text-gold">
            Apni Kundli Banayein
          </h1>
          <p className="text-lg text-white/80 max-w-2xl mx-auto">
            Enter your birth details for a precise Vedic chart calculated with Lahiri ayanamsa.
          </p>
        </div>

        {!result ? (
          <div className="max-w-xl mx-auto bg-night-2 border border-white/10 rounded-3xl p-8">
            <KundliForm onSubmit={handleSubmit} loading={loading} />
          </div>
        ) : (
          <div className="space-y-12 animate-in fade-in duration-500">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <h2 className="text-2xl font-heading font-bold text-gold">
                {result.name ? `${result.name}'s` : "Your"} Birth Chart
              </h2>
              <div className="flex gap-3">
                <div className="flex rounded-full border border-white/20 overflow-hidden">
                  <button
                    onClick={() => setChartStyle("north")}
                    className={`px-4 py-2 text-sm font-medium ${chartStyle === "north" ? "bg-bhagva text-white" : "text-white/70"}`}
                  >
                    North
                  </button>
                  <button
                    onClick={() => setChartStyle("south")}
                    className={`px-4 py-2 text-sm font-medium ${chartStyle === "south" ? "bg-bhagva text-white" : "text-white/70"}`}
                  >
                    South
                  </button>
                </div>
                <AnimatedButton variant="secondary" size="sm" surface="night" onClick={shareSummary}>
                  <Share2 className="w-4 h-4 mr-1" /> Share
                </AnimatedButton>
                <AnimatedButton variant="secondary" size="sm" surface="night" onClick={() => setResult(null)}>
                  New Chart
                </AnimatedButton>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
              <KundliChart houses={result.houses} style={chartStyle} surface="night" />
              <KundliDetailsPanel result={result} placeName={placeName} />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
