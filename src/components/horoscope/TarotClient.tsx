"use client";

import { useState, useEffect, useRef } from "react";
import { TarotCard, TarotResponse } from "@/types/tarot";
import GlassCard from "@/components/ui/GlassCard";
import AnimatedButton from "@/components/ui/AnimatedButton";
import { Sparkles, ArrowLeft, RefreshCw, Layers, Star, Info, Search, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

type TarotView = "home" | "daily" | "three_card" | "major_arcana" | "complete_deck";

// Beautiful placeholder for Tarot Cards
function TarotCardVisual({ card, onClick, className = "" }: { card: TarotCard; onClick?: () => void; className?: string }) {
  return (
    <button
      onClick={onClick}
      disabled={!onClick}
      className={`relative w-full aspect-[2/3] rounded-2xl overflow-hidden border border-ink/10 shadow-sm transition-all duration-300 group ${
        onClick ? "hover:shadow-lg hover:-translate-y-1 hover:border-bhagva/30 cursor-pointer" : "cursor-default"
      } ${className}`}
    >
      <div className="absolute inset-0 bg-gradient-to-br from-night-2 to-night opacity-95"></div>
      
      {/* Mystical Pattern Overlay */}
      <div className="absolute inset-0 opacity-10 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-gold via-transparent to-transparent"></div>
      
      <div className="absolute inset-0 flex flex-col items-center justify-between p-4 z-10 text-cream">
        <div className="text-xs uppercase tracking-widest font-semibold opacity-70">
          {card.type === "major" ? "Major" : card.suit}
        </div>
        
        <div className="flex flex-col items-center gap-2">
          {card.type === "major" ? <Star className="w-8 h-8 text-gold" /> : <Sparkles className="w-8 h-8 text-gold" />}
          <h4 className="text-lg font-heading font-bold text-center leading-tight">
            {card.name}
          </h4>
        </div>
        
        <div className="text-xl font-heading font-bold text-gold">
          {card.value}
        </div>
      </div>
    </button>
  );
}

// Modal for Card Details
import { createPortal } from "react-dom";

function TarotCardModal({ card, onClose }: { card: TarotCard | null; onClose: () => void }) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  if (!mounted) return null;

  return createPortal(
    <AnimatePresence>
      {card && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-night/80 backdrop-blur-sm"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.95, y: 20, opacity: 0 }}
            animate={{ scale: 1, y: 0, opacity: 1 }}
            exit={{ scale: 0.95, y: 20, opacity: 0 }}
            className="bg-cream w-full max-w-lg max-h-[90vh] overflow-y-auto rounded-3xl p-6 relative border border-white/20 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <button onClick={onClose} className="absolute top-4 right-4 p-2 bg-ink/5 rounded-full hover:bg-ink/10 transition-colors">
              <X className="w-5 h-5 text-ink" />
            </button>
            
            <div className="flex flex-col sm:flex-row gap-6 mt-2">
              <div className="w-full sm:w-1/3 shrink-0 mx-auto max-w-[200px]">
                <TarotCardVisual card={card} />
              </div>
              
              <div className="flex-grow space-y-4">
                <div>
                  <h3 className="text-2xl font-bold font-heading text-ink">{card.name}</h3>
                  <p className="text-sm font-medium text-ink-muted uppercase tracking-wider">
                    {card.type === "major" ? "Major Arcana" : `Minor Arcana • ${card.suit}`}
                  </p>
                </div>
                
                <div className="space-y-2">
                  <h4 className="text-sm font-bold text-bhagva flex items-center gap-1.5">
                    <Sparkles className="w-4 h-4" /> Meaning
                  </h4>
                  <p className="text-sm text-ink/90 leading-relaxed">{card.meaning_up}</p>
                </div>
              </div>
            </div>
            
            <div className="mt-6 pt-6 border-t border-ink/10 space-y-2">
              <h4 className="text-sm font-bold text-ink flex items-center gap-1.5">
                <Info className="w-4 h-4" /> Description
              </h4>
              <p className="text-sm text-ink-muted leading-relaxed whitespace-pre-wrap">{card.desc}</p>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>,
    document.body
  );
}

// Sub-component: Daily Card Reading
function TarotDaily({ onBack }: { onBack: () => void }) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [card, setCard] = useState<TarotCard | null>(null);

  const fetchCard = async () => {
    setLoading(true);
    setError(false);
    try {
      const res = await fetch("/api/tarot?endpoint=cards/random&n=1");
      if (!res.ok) throw new Error("Failed");
      const data: TarotResponse = await res.json();
      if (data.cards && data.cards.length > 0) {
        setCard(data.cards[0]);
      } else throw new Error("No cards");
    } catch (e) {
      setError(true);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCard();
  }, []);

  return (
    <div className="space-y-6">
      <button onClick={onBack} className="text-sm font-semibold text-ink-muted hover:text-ink flex items-center gap-1.5 transition-colors">
        <ArrowLeft className="w-4 h-4" /> Back to Tarot Menu
      </button>

      <GlassCard className="min-h-[400px] flex flex-col items-center justify-center p-8">
        {loading ? (
          <div className="flex flex-col items-center animate-pulse gap-6 w-full max-w-sm">
            <div className="w-48 aspect-[2/3] bg-ink/5 rounded-2xl"></div>
            <div className="h-6 w-3/4 bg-ink/5 rounded"></div>
            <div className="h-20 w-full bg-ink/5 rounded"></div>
          </div>
        ) : error || !card ? (
          <div className="text-center space-y-4">
            <p className="text-ink-muted">Unable to load tarot cards. Please try again later.</p>
            <AnimatedButton onClick={fetchCard} variant="outline" className="mx-auto">
              <RefreshCw className="w-4 h-4 mr-2" /> Retry
            </AnimatedButton>
          </div>
        ) : (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col md:flex-row gap-10 max-w-4xl w-full items-center md:items-start">
            <div className="w-64 shrink-0 mx-auto md:mx-0">
              <TarotCardVisual card={card} />
            </div>
            <div className="flex-grow space-y-6 text-center md:text-left">
              <div>
                <p className="text-bhagva font-semibold tracking-widest uppercase text-sm mb-2 flex items-center justify-center md:justify-start gap-2">
                  <Sparkles className="w-4 h-4" /> Your Daily Card
                </p>
                <h2 className="text-4xl font-heading font-bold text-ink">{card.name}</h2>
                <p className="text-sm font-medium text-ink-muted mt-1 uppercase tracking-wider">
                  {card.type === "major" ? "Major Arcana" : `Minor Arcana • ${card.suit}`}
                </p>
              </div>

              <div>
                <h3 className="text-lg font-bold text-ink mb-2">Meaning</h3>
                <p className="text-ink/90 leading-relaxed bg-white/50 p-4 rounded-xl border border-white">{card.meaning_up}</p>
              </div>

              <div>
                <h3 className="text-lg font-bold text-ink mb-2">Description</h3>
                <p className="text-sm text-ink-muted leading-relaxed max-h-60 overflow-y-auto pr-2">{card.desc}</p>
              </div>
            </div>
          </motion.div>
        )}
      </GlassCard>
    </div>
  );
}

// Sub-component: Three Card Reading
function TarotThreeCard({ onBack }: { onBack: () => void }) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [cards, setCards] = useState<TarotCard[]>([]);
  const [selectedCard, setSelectedCard] = useState<TarotCard | null>(null);

  const fetchCards = async () => {
    setLoading(true);
    setError(false);
    try {
      const res = await fetch("/api/tarot?endpoint=cards/random&n=3");
      if (!res.ok) throw new Error("Failed");
      const data: TarotResponse = await res.json();
      if (data.cards && data.cards.length === 3) {
        setCards(data.cards);
      } else throw new Error("Not enough cards");
    } catch (e) {
      setError(true);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCards();
  }, []);

  const labels = ["Past", "Present", "Future"];

  return (
    <div className="space-y-6">
      <button onClick={onBack} className="text-sm font-semibold text-ink-muted hover:text-ink flex items-center gap-1.5 transition-colors">
        <ArrowLeft className="w-4 h-4" /> Back to Tarot Menu
      </button>

      <GlassCard className="min-h-[400px] flex flex-col p-6 md:p-10">
        <div className="text-center mb-10">
          <h2 className="text-3xl font-heading font-bold text-ink mb-3">Three Card Reading</h2>
          <p className="text-ink-muted max-w-2xl mx-auto">Gain perspective on where you've been, where you are, and where you're headed.</p>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto w-full">
            {[1, 2, 3].map(i => (
              <div key={i} className="flex flex-col items-center animate-pulse gap-4">
                <div className="w-16 h-6 bg-ink/5 rounded"></div>
                <div className="w-full aspect-[2/3] bg-ink/5 rounded-2xl"></div>
                <div className="h-4 w-3/4 bg-ink/5 rounded mt-2"></div>
              </div>
            ))}
          </div>
        ) : error || cards.length < 3 ? (
          <div className="text-center space-y-4 my-auto">
            <p className="text-ink-muted">Unable to load tarot cards. Please try again later.</p>
            <AnimatedButton onClick={fetchCards} variant="outline" className="mx-auto">
              <RefreshCw className="w-4 h-4 mr-2" /> Retry
            </AnimatedButton>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto w-full">
            {cards.map((card, idx) => (
              <motion.div 
                key={card.name_short}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.2, duration: 0.5 }}
                className="flex flex-col items-center text-center group"
              >
                <div className="bg-white/80 border border-ink/5 px-4 py-1.5 rounded-full mb-6 shadow-sm">
                  <span className="text-sm font-bold tracking-widest uppercase text-bhagva">{labels[idx]}</span>
                </div>
                
                <TarotCardVisual card={card} onClick={() => setSelectedCard(card)} />
                
                <div className="mt-6 space-y-2">
                  <h4 className="text-lg font-heading font-bold text-ink group-hover:text-bhagva transition-colors">{card.name}</h4>
                  <p className="text-xs text-ink-muted line-clamp-2 px-2">{card.meaning_up}</p>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </GlassCard>

      <TarotCardModal card={selectedCard} onClose={() => setSelectedCard(null)} />
    </div>
  );
}

// Sub-component: Explorer (Major Arcana & Complete Deck)
function TarotExplorer({ type, onBack }: { type: "major" | "all"; onBack: () => void }) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [cards, setCards] = useState<TarotCard[]>([]);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<"all" | "major" | "minor">("all");
  const [selectedCard, setSelectedCard] = useState<TarotCard | null>(null);

  // Use ref to cache the deck so we don't refetch on every view switch
  const cacheKey = type;
  const cache = useRef<Record<string, TarotCard[]>>({});

  const fetchDeck = async () => {
    if (cache.current[cacheKey]) {
      setCards(cache.current[cacheKey]);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(false);
    try {
      const endpoint = type === "major" ? "cards/major" : "cards";
      const res = await fetch(`/api/tarot?endpoint=${endpoint}`);
      if (!res.ok) throw new Error("Failed");
      const data: TarotResponse = await res.json();
      if (data.cards) {
        cache.current[cacheKey] = data.cards;
        setCards(data.cards);
      } else throw new Error("No cards");
    } catch (e) {
      setError(true);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDeck();
    // Reset filters when type changes
    setSearch("");
    setFilter(type === "major" ? "major" : "all");
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [type]);

  const filteredCards = cards.filter(card => {
    const matchesSearch = card.name.toLowerCase().includes(search.toLowerCase());
    const matchesFilter = filter === "all" || card.type === filter;
    return matchesSearch && matchesFilter;
  });

  return (
    <div className="space-y-6">
      <button onClick={onBack} className="text-sm font-semibold text-ink-muted hover:text-ink flex items-center gap-1.5 transition-colors">
        <ArrowLeft className="w-4 h-4" /> Back to Tarot Menu
      </button>

      <GlassCard className="min-h-[400px] flex flex-col p-6 md:p-10">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10 pb-6 border-b border-ink/10">
          <div>
            <h2 className="text-3xl font-heading font-bold text-ink mb-2">
              {type === "major" ? "Major Arcana" : "Complete Tarot Deck"}
            </h2>
            <p className="text-ink-muted max-w-md">
              {type === "major" 
                ? "Explore the 22 major trump cards that signify life's karmic and spiritual lessons." 
                : "Browse the complete 78-card Ryder Waite tarot deck and uncover their meanings."}
            </p>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
            {type === "all" && (
              <select 
                value={filter} 
                onChange={(e) => setFilter(e.target.value as any)}
                className="bg-white border border-ink/10 rounded-lg px-4 py-2 text-sm text-ink focus:outline-none focus:ring-2 focus:ring-bhagva/50"
              >
                <option value="all">All Arcana</option>
                <option value="major">Major Arcana</option>
                <option value="minor">Minor Arcana</option>
              </select>
            )}
            
            <div className="relative w-full sm:w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-ink-muted" />
              <input 
                type="text" 
                placeholder="Search cards..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full bg-white border border-ink/10 rounded-lg pl-9 pr-4 py-2 text-sm text-ink focus:outline-none focus:ring-2 focus:ring-bhagva/50"
              />
            </div>
          </div>
        </div>

        {loading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 md:gap-6">
            {Array.from({ length: 10 }).map((_, i) => (
              <div key={i} className="animate-pulse flex flex-col gap-3">
                <div className="w-full aspect-[2/3] bg-ink/5 rounded-2xl"></div>
                <div className="h-4 w-3/4 bg-ink/5 rounded mx-auto"></div>
              </div>
            ))}
          </div>
        ) : error ? (
          <div className="text-center space-y-4 my-auto py-20">
            <p className="text-ink-muted">Unable to load tarot deck. Please try again later.</p>
            <AnimatedButton onClick={fetchDeck} variant="outline" className="mx-auto">
              <RefreshCw className="w-4 h-4 mr-2" /> Retry
            </AnimatedButton>
          </div>
        ) : filteredCards.length === 0 ? (
          <div className="text-center py-20 text-ink-muted">
            No cards found matching your search.
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 md:gap-6">
            {filteredCards.map((card) => (
              <motion.div 
                key={card.name_short}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="flex flex-col gap-3 text-center"
              >
                <TarotCardVisual card={card} onClick={() => setSelectedCard(card)} />
                <div>
                  <h4 className="text-sm font-bold font-heading text-ink truncate px-1">{card.name}</h4>
                  <p className="text-[10px] uppercase tracking-wider text-ink-muted font-semibold mt-0.5">
                    {card.type === "major" ? "Major" : card.suit}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </GlassCard>

      <TarotCardModal card={selectedCard} onClose={() => setSelectedCard(null)} />
    </div>
  );
}


// Main Home View for Tarot
function TarotHome({ setView }: { setView: (v: TarotView) => void }) {
  const options = [
    {
      id: "daily",
      title: "Daily Card",
      description: "Draw a single card to gain insight and guidance for your day ahead.",
      icon: Sparkles,
      color: "bg-amber-50 text-amber-600 border-amber-200 hover:border-amber-400"
    },
    {
      id: "three_card",
      title: "Three Card Reading",
      description: "A classic spread revealing the influences of your Past, Present, and Future.",
      icon: Layers,
      color: "bg-purple-50 text-purple-600 border-purple-200 hover:border-purple-400"
    },
    {
      id: "major_arcana",
      title: "Major Arcana Explorer",
      description: "Discover the 22 powerful cards representing life's spiritual lessons.",
      icon: Star,
      color: "bg-indigo-50 text-indigo-600 border-indigo-200 hover:border-indigo-400"
    },
    {
      id: "complete_deck",
      title: "Complete Deck",
      description: "Browse and learn the meanings of all 78 beautifully crafted tarot cards.",
      icon: Search,
      color: "bg-emerald-50 text-emerald-600 border-emerald-200 hover:border-emerald-400"
    }
  ] as const;

  return (
    <div className="space-y-10">
      <div className="text-center max-w-3xl mx-auto py-8">
        <h2 className="text-3xl md:text-5xl font-extrabold font-heading text-ink mb-4 tracking-tight">
          Discover Your Tarot Reading
        </h2>
        <p className="text-base md:text-lg text-ink-muted leading-relaxed">
          Draw tarot cards to gain insight into your love, career, finances, and life's journey. Let the ancient wisdom of the cards illuminate your path.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-5xl mx-auto">
        {options.map((opt) => (
          <button
            key={opt.id}
            onClick={() => setView(opt.id as TarotView)}
            className={`group flex flex-col items-start text-left p-8 rounded-2xl border transition-all duration-300 shadow-sm hover:shadow-md ${opt.color} bg-opacity-50 hover:bg-opacity-100 bg-white`}
          >
            <div className={`p-4 rounded-2xl mb-6 ${opt.color} bg-opacity-20`}>
              <opt.icon className="w-8 h-8" />
            </div>
            <h3 className="text-2xl font-bold font-heading text-ink mb-2 group-hover:text-current transition-colors">
              {opt.title}
            </h3>
            <p className="text-ink-muted leading-relaxed group-hover:text-current group-hover:opacity-80 transition-colors">
              {opt.description}
            </p>
          </button>
        ))}
      </div>
    </div>
  );
}

// Root Entry Point
export default function TarotClient() {
  const [view, setView] = useState<TarotView>("home");

  return (
    <div className="w-full animate-in fade-in slide-in-from-bottom-4 duration-500">
      {view === "home" && <TarotHome setView={setView} />}
      {view === "daily" && <TarotDaily onBack={() => setView("home")} />}
      {view === "three_card" && <TarotThreeCard onBack={() => setView("home")} />}
      {view === "major_arcana" && <TarotExplorer type="major" onBack={() => setView("home")} />}
      {view === "complete_deck" && <TarotExplorer type="all" onBack={() => setView("home")} />}
    </div>
  );
}
