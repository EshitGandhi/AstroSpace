"use client";

import { useState, useEffect, useRef } from "react";
import { ZODIAC_SIGNS, ZodiacSign } from "@/lib/constants/zodiac";
import GlassCard from "@/components/ui/GlassCard";
import AnimatedButton from "@/components/ui/AnimatedButton";
import { RefreshCw, Languages, Sparkles } from "lucide-react";
import TarotClient from "./TarotClient";

type HoroscopeType = "daily" | "weekly" | "monthly" | "tarot";
type Language = "en" | "hi";

type HoroscopeData = {
  data: {
    date: string;
    horoscope: string;
  };
};

function formatForecastDate(dateStr: string, type: HoroscopeType, lang: Language) {
  if (!dateStr) return "";
  
  try {
    const locale = lang === 'hi' ? 'hi-IN' : 'en-US';
    
    if (type === "daily") {
      // Date format is "YYYY-MM-DD"
      // Note: appending "T00:00:00" ensures it parses as local time correctly without timezone shifts
      const d = new Date(`${dateStr}T00:00:00`);
      return new Intl.DateTimeFormat(locale, { month: 'long', day: 'numeric' }).format(d);
    }
    
    if (type === "weekly") {
      const start = new Date(`${dateStr}T00:00:00`);
      const end = new Date(start);
      end.setDate(start.getDate() + 6);
      const formatter = new Intl.DateTimeFormat(locale, { month: 'short', day: 'numeric' });
      return `${formatter.format(start)} - ${formatter.format(end)}`;
    }
    
    if (type === "monthly") {
      // Date format is "YYYY-MM"
      const d = new Date(`${dateStr}-01T00:00:00`);
      return new Intl.DateTimeFormat(locale, { month: 'long', year: 'numeric' }).format(d);
    }
  } catch (e) {
    return dateStr;
  }
  return dateStr;
}

function HoroscopeCard({ zodiac, type, lang }: { zodiac: ZodiacSign; type: HoroscopeType; lang: Language }) {
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<boolean>(false);
  const [horoscopeInfo, setHoroscopeInfo] = useState<{ horoscope: string; date: string } | null>(null);
  const [expanded, setExpanded] = useState<boolean>(false);
  
  // Cache to store fetched horoscopes to prevent redundant API calls
  const cache = useRef<Record<string, { horoscope: string; date: string }>>({});

  const fetchHoroscope = async () => {
    const cacheKey = `${zodiac.id}-${type}-${lang}`;
    
    if (cache.current[cacheKey]) {
      setHoroscopeInfo(cache.current[cacheKey]);
      setError(false);
      return;
    }

    setLoading(true);
    setError(false);

    try {
      const response = await fetch(`/api/horoscope?sign=${zodiac.id}&type=${type}&lang=${lang}`);
      if (!response.ok) {
        throw new Error("Failed to fetch");
      }
      const data: HoroscopeData = await response.json();
      
      if (data.data?.horoscope) {
        const result = { horoscope: data.data.horoscope, date: data.data.date };
        cache.current[cacheKey] = result;
        setHoroscopeInfo(result);
      } else {
        throw new Error("Invalid response");
      }
    } catch (err) {
      console.error(err);
      setError(true);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHoroscope();
    setExpanded(false); // Reset expanded state when type changes
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [type, zodiac.id, lang]);

  return (
    <GlassCard className="flex flex-col h-full bg-white/60 hover:bg-white transition-all duration-300">
      <div className="flex items-center gap-4 mb-4 pb-4 border-b border-ink/10">
        <div className="w-12 h-12 bg-cream-tint rounded-xl flex items-center justify-center text-3xl shadow-sm shrink-0">
          {zodiac.symbol}
        </div>
        <div>
          <h3 className="text-xl font-bold font-heading text-ink flex items-center gap-2">
            {lang === "hi" ? zodiac.nameHi : zodiac.name}
          </h3>
          <p className="text-xs text-ink-muted capitalize font-medium">
            {horoscopeInfo?.date ? formatForecastDate(horoscopeInfo.date, type, lang) : zodiac.dateRange}
          </p>
        </div>
      </div>

      <div className="flex-grow flex flex-col">
        {loading ? (
          <div className="space-y-3 animate-pulse">
            <div className="h-4 bg-ink/5 rounded w-full"></div>
            <div className="h-4 bg-ink/5 rounded w-5/6"></div>
            <div className="h-4 bg-ink/5 rounded w-3/4"></div>
          </div>
        ) : error ? (
          <div className="text-center py-4">
            <p className="text-sm text-ink-muted mb-2">Unable to load horoscope.</p>
            <button onClick={fetchHoroscope} className="text-sm text-bhagva flex items-center justify-center w-full font-semibold hover:underline">
              <RefreshCw className="w-4 h-4 mr-1" /> Retry
            </button>
          </div>
        ) : (
          <div className="flex flex-col h-full">
            <p className={`text-sm text-ink/90 leading-relaxed whitespace-pre-wrap ${expanded ? "" : "line-clamp-3"}`}>
              {horoscopeInfo?.horoscope}
            </p>
            {horoscopeInfo?.horoscope && (
              <button 
                onClick={() => setExpanded(!expanded)} 
                className="text-sm font-semibold text-bhagva mt-3 self-start hover:underline"
              >
                {expanded ? (lang === "en" ? "Show Less" : "कम दिखाएं") : (lang === "en" ? "Read More" : "और पढ़ें")}
              </button>
            )}
          </div>
        )}
      </div>
    </GlassCard>
  );
}

export default function HoroscopeClient() {
  const [selectedType, setSelectedType] = useState<HoroscopeType>("daily");
  const [lang, setLang] = useState<Language>("en");

  return (
    <div className="space-y-10">
      {/* Controls */}
      <section className="flex flex-col sm:flex-row items-center justify-center gap-6">
        {/* Tabs */}
        <div className="flex gap-3 sm:gap-4 flex-wrap justify-center">
          {(["daily", "weekly", "monthly"] as HoroscopeType[]).map((type) => (
            <AnimatedButton
              key={type}
              variant={selectedType === type ? "primary" : "outline"}
              onClick={() => setSelectedType(type)}
              className="capitalize"
            >
              {lang === "hi" 
                ? type === "daily" ? "दैनिक राशिफल" : type === "weekly" ? "साप्ताहिक राशिफल" : "मासिक राशिफल" 
                : `${type} Horoscope`}
            </AnimatedButton>
          ))}
          
          <button
            onClick={() => setSelectedType("tarot")}
            className={`flex items-center gap-2 px-6 py-2.5 rounded-full font-semibold transition-all duration-300 shadow-sm ${
              selectedType === "tarot"
                ? "bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-purple-500/25 scale-105"
                : "bg-white border border-purple-200 text-purple-700 hover:bg-purple-50 hover:border-purple-300"
            }`}
          >
            <Sparkles className={`w-4 h-4 ${selectedType === "tarot" ? "animate-pulse" : ""}`} />
            Tarot Reading
          </button>
        </div>

        {/* Divider for desktop */}
        <div className="hidden sm:block w-px h-10 bg-ink/10"></div>

        {/* Language Toggle */}
        <AnimatedButton
          variant="outline"
          onClick={() => setLang(lang === "en" ? "hi" : "en")}
          className="flex items-center gap-2"
        >
          <Languages className="w-5 h-5" />
          {lang === "en" ? "हिंदी में पढ़ें" : "Read in English"}
        </AnimatedButton>
      </section>

      {/* Horoscope Grid or Tarot View */}
      <section>
        {selectedType === "tarot" ? (
          <TarotClient />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {ZODIAC_SIGNS.map((zodiac) => (
              <HoroscopeCard key={zodiac.id} zodiac={zodiac} type={selectedType as Exclude<HoroscopeType, "tarot">} lang={lang} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
