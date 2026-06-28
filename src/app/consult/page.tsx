"use client";

import { useState, useEffect, useRef } from "react";
import Podium from "@/components/consultation/Podium";
import PanditCard from "@/components/consultation/PanditCard";
import TrustStrip from "@/components/consultation/TrustStrip";
import CustomSelect from "@/components/ui/CustomSelect";
import { Search, Loader2, Sparkles, Telescope, RotateCcw, MessageCircle, ArrowDown, ChevronLeft, ChevronRight } from "lucide-react";

export default function ConsultPage() {
  const [pandits, setPandits] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const scrollRef = useRef<HTMLDivElement>(null);
  
  // Filter states
  const [search, setSearch] = useState("");
  const [specialization, setSpecialization] = useState("");
  const [language, setLanguage] = useState("");
  const [rating, setRating] = useState("");
  const [availability, setAvailability] = useState("");
  const [mode, setMode] = useState("");
  const [maxPrice, setMaxPrice] = useState("");
  const [minExperience, setMinExperience] = useState("");
  const [chatNow, setChatNow] = useState("");
  const [sort, setSort] = useState("recommended");

  const resetFilters = () => {
    setSearch("");
    setSpecialization("");
    setLanguage("");
    setRating("");
    setAvailability("");
    setMode("");
    setMaxPrice("");
    setMinExperience("");
    setChatNow("");
    setSort("recommended");
  };

  const scrollLeft = () => {
    if (scrollRef.current) {
      scrollRef.current.scrollBy({ left: -250, behavior: 'smooth' });
    }
  };

  const scrollRight = () => {
    if (scrollRef.current) {
      scrollRef.current.scrollBy({ left: 250, behavior: 'smooth' });
    }
  };

  useEffect(() => {
    const fetchPandits = async () => {
      setLoading(true);
      try {
        const queryParams = new URLSearchParams();
        if (search) queryParams.append("search", search);
        if (specialization) queryParams.append("specialization", specialization);
        if (language) queryParams.append("language", language);
        if (rating) queryParams.append("rating", rating);
        if (availability) queryParams.append("availability", availability);
        if (mode) queryParams.append("mode", mode);
        if (maxPrice) queryParams.append("maxPrice", maxPrice);
        if (minExperience) queryParams.append("minExperience", minExperience);
        if (chatNow) queryParams.append("chatNow", chatNow);
        if (sort) queryParams.append("sort", sort);

        const res = await fetch(`/api/consult?${queryParams.toString()}`);
        if (res.ok) {
          const data = await res.json();
          setPandits(data);
        }
      } catch (err) {
        console.error("Failed to fetch pandits", err);
      } finally {
        setLoading(false);
      }
    };
    
    const timer = setTimeout(() => {
      fetchPandits();
    }, 500);
    
    return () => clearTimeout(timer);
  }, [search, specialization, language, rating, availability, mode, maxPrice, minExperience, chatNow, sort]);

  const top3 = pandits.slice(0, 3);
  const remainingPandits = pandits.slice(3);

  const specOptions = [
    { label: "All Specializations", value: "" },
    { label: "Astrologers", value: "ASTROLOGERS" },
    { label: "Tarot Readers", value: "TAROT_READERS" },
    { label: "Numerologists", value: "NUMEROLOGISTS" },
    { label: "Vastu Consultants", value: "VASTU_CONSULTANTS" },
    { label: "Reiki Healers", value: "REIKI_HEALERS" },
    { label: "Palmists", value: "PALMISTS" },
    { label: "Psychic Readers", value: "PSYCHIC_READERS" },
    { label: "Spiritual Healers", value: "SPIRITUAL_HEALERS" },
    { label: "Gemstone Experts", value: "GEMSTONE_EXPERTS" },
    { label: "Lal Kitab Experts", value: "LAL_KITAB_EXPERTS" },
    { label: "Face Readers", value: "FACE_READERS" },
    { label: "Aura Readers", value: "AURA_READERS" },
    { label: "Pranic Healers", value: "PRANIC_HEALERS" },
    { label: "Nadi Astrologers", value: "NADI_ASTROLOGERS" },
    { label: "Crystal Healers", value: "CRYSTAL_HEALERS" },
    { label: "Life Coaches", value: "LIFE_COACHES" },
    { label: "Meditation Coaches", value: "MEDITATION_COACHES" },
    { label: "Pandits (Puja)", value: "PANDITS" },
    { label: "Dream Analysts", value: "DREAM_ANALYSTS" }
  ];

  const langOptions = [
    { label: "All Languages", value: "" },
    { label: "Hindi", value: "HINDI" },
    { label: "English", value: "ENGLISH" },
    { label: "Tamil", value: "TAMIL" },
    { label: "Telugu", value: "TELUGU" },
    { label: "Marathi", value: "MARATHI" },
    { label: "Bengali", value: "BENGALI" },
    { label: "Gujarati", value: "GUJARATI" },
    { label: "Kannada", value: "KANNADA" },
    { label: "Malayalam", value: "MALAYALAM" },
    { label: "Punjabi", value: "PUNJABI" },
    { label: "Odia", value: "ODIA" }
  ];

  const ratingOptions = [
    { label: "Any Rating", value: "" },
    { label: "4.5 & Above", value: "4.5" },
    { label: "4.0 & Above", value: "4.0" }
  ];

  const availOptions = [
    { label: "Any Time", value: "" },
    { label: "🟢 Online Now", value: "online" },
    { label: "Chat Now Available", value: "chatnow" },
  ];

  const modeOptions = [
    { label: "All Types", value: "" },
    { label: "Chat", value: "CHAT" },
    { label: "Voice", value: "VOICE" },
    { label: "Video", value: "VIDEO" },
  ];

  const priceOptions = [
    { label: "Any Price", value: "" },
    { label: "Under ₹20/min", value: "20" },
    { label: "Under ₹50/min", value: "50" },
    { label: "Under ₹100/min", value: "100" },
  ];

  const expOptions = [
    { label: "Any Experience", value: "" },
    { label: "5+ Years", value: "5" },
    { label: "10+ Years", value: "10" },
    { label: "15+ Years", value: "15" },
  ];

  const sortOptions = [
    { label: "Highest Rated", value: "recommended" },
    { label: "Most Popular", value: "popular" },
    { label: "Experience (High to Low)", value: "experience" },
    { label: "Price (Low to High)", value: "price_low" }
  ];

  return (
    <div className="flex flex-col w-full bg-cream min-h-screen">
      <main className="flex-1 flex flex-col w-full relative">
        {/* Hero Section */}
        <section className="bg-gradient-to-br from-[#E8590C] via-[#D04500] to-[#992800] text-white pt-12 pb-20 px-6 relative overflow-hidden">
          <div className="absolute inset-0 opacity-[0.03] bg-[url('/noise.png')] mix-blend-overlay pointer-events-none"></div>
          
          {/* Thematic Elements */}
          <div className="absolute -top-24 -right-24 w-96 h-96 bg-white opacity-5 rounded-full blur-3xl pointer-events-none"></div>
          <div className="absolute top-10 left-10 text-white/10 pointer-events-none">
            <Sparkles className="w-24 h-24" />
          </div>

          <div className="max-w-6xl mx-auto relative z-10 text-center">
            <h1 className="text-3xl md:text-5xl font-black font-heading mb-4 leading-tight flex items-center justify-center gap-3">
              Consult India's Best Astrologers
            </h1>
            <p className="text-base md:text-lg text-white/90 max-w-2xl mx-auto font-medium">
              Find clarity and guidance with top-rated verified experts in astrology, numerology, tarot, and vastu.
            </p>
            
            {/* Stats row */}
            <div className="flex flex-wrap items-center justify-center gap-4 md:gap-8 mt-6 mb-8 text-sm md:text-base font-bold text-white/90">
              <span className="flex items-center gap-1.5"><span className="text-yellow-400 text-xl">★</span> 4.9 Avg Rating</span>
              <span className="hidden md:inline text-white/40">•</span>
              <span>250+ Verified Experts</span>
              <span className="hidden md:inline text-white/40">•</span>
              <span>24×7 Available</span>
            </div>

            {/* CTAs */}
            <div className="flex items-center justify-center gap-4">
              <button onClick={() => window.scrollBy({ top: 400, behavior: "smooth" })} className="flex items-center gap-2 px-6 py-3 bg-white text-bhagva rounded-xl font-bold hover:bg-cream-tint transition-colors shadow-lg">
                <MessageCircle className="w-5 h-5" /> Chat Now
              </button>
              <button onClick={() => window.scrollBy({ top: 200, behavior: "smooth" })} className="flex items-center gap-2 px-6 py-3 bg-bhagva border-2 border-white text-white rounded-xl font-bold hover:bg-white/10 transition-colors">
                <ArrowDown className="w-5 h-5" /> Browse Experts
              </button>
            </div>
          </div>
        </section>

        <TrustStrip />

        {/* Filter Bar */}
        <div className="max-w-7xl mx-auto w-full px-4 md:px-6 py-6 border-b border-ink/5 bg-cream/80 backdrop-blur-md sticky top-0 z-40 shadow-sm">
          <div className="flex flex-col xl:flex-row gap-4 items-center">
            {/* Search (35%) */}
            <div className="relative w-full xl:w-[35%] flex-shrink-0">
              <input 
                type="text" 
                placeholder="Search by name, expertise or language..." 
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-11 pr-4 py-3 rounded-xl border border-ink/10 bg-white text-ink focus:ring-2 focus:ring-bhagva/20 focus:border-bhagva outline-none transition-all font-medium shadow-sm"
              />
              <Search className="absolute left-4 top-3.5 w-5 h-5 text-ink/40 pointer-events-none" />
            </div>
            
            {/* Filters */}
            <div className="w-full flex-1 flex items-center gap-2 relative">
              <button onClick={scrollLeft} className="p-2 bg-white rounded-full shadow-sm border border-ink/10 text-ink/60 hover:text-bhagva z-10 flex-shrink-0">
                <ChevronLeft className="w-5 h-5" />
              </button>
              
              <div 
                ref={scrollRef} 
                className="flex-1 flex gap-3 overflow-x-auto scroll-smooth [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none] py-1"
              >
                <CustomSelect className="min-w-[160px] flex-1" value={specialization} onChange={setSpecialization} options={specOptions} placeholder="Specialization" />
                <CustomSelect className="min-w-[140px] flex-1" value={language} onChange={setLanguage} options={langOptions} placeholder="Language" />
                <CustomSelect className="min-w-[140px] flex-1" value={rating} onChange={setRating} options={ratingOptions} placeholder="Rating" />
                <CustomSelect className="min-w-[140px] flex-1" value={mode} onChange={setMode} options={modeOptions} placeholder="Type" />
                <CustomSelect className="min-w-[140px] flex-1" value={maxPrice} onChange={setMaxPrice} options={priceOptions} placeholder="Max Price" />
                <CustomSelect className="min-w-[140px] flex-1" value={minExperience} onChange={setMinExperience} options={expOptions} placeholder="Experience" />
                <CustomSelect className="min-w-[140px] flex-1" value={availability} onChange={(v) => { setAvailability(v === "chatnow" ? "online" : v); setChatNow(v === "chatnow" ? "true" : ""); }} options={availOptions} placeholder="Availability" />
                <CustomSelect className="min-w-[180px] flex-1" value={sort} onChange={setSort} options={sortOptions} placeholder="Sort by" />
                
                {(search || specialization || language || rating || availability || mode || maxPrice || minExperience || chatNow) && (
                  <button onClick={resetFilters} className="flex-shrink-0 flex items-center justify-center p-3 rounded-xl bg-red-50 text-red-600 hover:bg-red-100 transition-colors border border-red-100" title="Reset Filters">
                    <RotateCcw className="w-5 h-5" />
                  </button>
                )}
              </div>

              <button onClick={scrollRight} className="p-2 bg-white rounded-full shadow-sm border border-ink/10 text-ink/60 hover:text-bhagva z-10 flex-shrink-0">
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 w-full max-w-7xl mx-auto px-4 md:px-6 py-12">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-32 text-bhagva">
              <Loader2 className="w-12 h-12 animate-spin mb-4" />
              <p className="font-bold font-heading text-lg">Aligning the stars...</p>
            </div>
          ) : pandits.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-24 text-center">
              <div className="w-24 h-24 bg-white rounded-full flex items-center justify-center mb-6 shadow-md border border-ink/5 text-ink/20">
                <Telescope className="w-12 h-12" />
              </div>
              <h3 className="text-2xl font-black font-heading text-ink mb-2">Couldn't find matching astrologers</h3>
              <p className="text-ink/60 max-w-md mb-8">Try tweaking your filters or adjusting your search terms to discover the right expert for you.</p>
              <button onClick={resetFilters} className="px-6 py-3 bg-bhagva text-white font-bold rounded-xl shadow-md hover:bg-bhagva/90 transition-colors">
                Reset All Filters
              </button>
            </div>
          ) : (
            <>
              {/* Leaderboard */}
              {!search && !specialization && !language && top3.length > 0 && (
                <div className="mb-20">
                  <Podium top3={top3} />
                </div>
              )}

              {/* Grid */}
              <div className="mb-12">
                <h2 className="text-2xl font-black font-heading text-ink mb-6 flex items-center gap-2">
                  {search || specialization || language ? "Search Results" : "All Verified Experts"}
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                  {(!search && !specialization && !language ? remainingPandits : pandits).map(pandit => (
                    <PanditCard key={pandit.id} pandit={pandit} />
                  ))}
                </div>
              </div>
            </>
          )}
        </div>
      </main>
    </div>
  );
}
