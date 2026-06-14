"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import AnimatedButton from "@/components/ui/AnimatedButton";
import { Search, MapPin } from "lucide-react";

type GeocodeResult = {
  name: string;
  lat: number;
  lng: number;
  timezone: string;
  displayName: string;
};

type KundliFormProps = {
  onSubmit: (data: {
    name: string;
    date: string;
    time: string;
    lat: number;
    lng: number;
    timezone: string;
    placeName: string;
  }) => void;
  loading?: boolean;
};

export default function KundliForm({ onSubmit, loading = false }: KundliFormProps) {
  const [name, setName] = useState("");
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [cityQuery, setCityQuery] = useState("");
  const [suggestions, setSuggestions] = useState<GeocodeResult[]>([]);
  const [selectedPlace, setSelectedPlace] = useState<GeocodeResult | null>(null);
  const [searching, setSearching] = useState(false);

  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const searchCity = useCallback(async (query: string) => {
    if (query.length < 2) {
      setSuggestions([]);
      return;
    }
    setSearching(true);
    try {
      const res = await fetch(`/api/geocode?q=${encodeURIComponent(query)}`);
      if (res.ok) {
        const data = await res.json();
        setSuggestions(data);
      }
    } finally {
      setSearching(false);
    }
  }, []);

  const handleCityChange = (value: string) => {
    setCityQuery(value);
    setSelectedPlace(null);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => searchCity(value), 400);
  };

  useEffect(() => {
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPlace) return;
    onSubmit({
      name,
      date,
      time,
      lat: selectedPlace.lat,
      lng: selectedPlace.lng,
      timezone: selectedPlace.timezone,
      placeName: selectedPlace.displayName,
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-2">
        <label htmlFor="kundli-name" className="block text-sm font-bold text-white">
          Full Name
        </label>
        <input
          id="kundli-name"
          type="text"
          required
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Your name"
          className="w-full px-4 py-3 rounded-xl border border-white/20 bg-night-2 text-white focus:outline-none focus:border-gold focus:ring-1 focus:ring-gold"
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="space-y-2">
          <label htmlFor="kundli-dob" className="block text-sm font-bold text-white">
            Date of Birth
          </label>
          <input
            id="kundli-dob"
            type="date"
            required
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="w-full px-4 py-3 rounded-xl border border-white/20 bg-night-2 text-white focus:outline-none focus:border-gold focus:ring-1 focus:ring-gold [color-scheme:dark]"
          />
        </div>
        <div className="space-y-2">
          <label htmlFor="kundli-tob" className="block text-sm font-bold text-white">
            Time of Birth
          </label>
          <input
            id="kundli-tob"
            type="time"
            required
            value={time}
            onChange={(e) => setTime(e.target.value)}
            className="w-full px-4 py-3 rounded-xl border border-white/20 bg-night-2 text-white focus:outline-none focus:border-gold focus:ring-1 focus:ring-gold [color-scheme:dark]"
          />
        </div>
      </div>

      <div className="space-y-2 relative">
        <label htmlFor="kundli-place" className="block text-sm font-bold text-white">
          Place of Birth
        </label>
        <div className="relative">
          <Search className="absolute left-4 top-3.5 w-5 h-5 text-white/50" />
          <input
            id="kundli-place"
            type="text"
            required
            value={cityQuery}
            onChange={(e) => handleCityChange(e.target.value)}
            placeholder="Search city (e.g. Delhi, Mumbai)"
            className="w-full pl-12 pr-4 py-3 rounded-xl border border-white/20 bg-night-2 text-white focus:outline-none focus:border-gold focus:ring-1 focus:ring-gold"
          />
        </div>
        {searching && (
          <p className="text-xs text-white/50">Searching...</p>
        )}
        {suggestions.length > 0 && !selectedPlace && (
          <ul className="absolute z-20 w-full mt-1 bg-night-2 border border-white/20 rounded-xl overflow-hidden shadow-lg">
            {suggestions.map((s, i) => (
              <li key={i}>
                <button
                  type="button"
                  onClick={() => {
                    setSelectedPlace(s);
                    setCityQuery(s.displayName);
                    setSuggestions([]);
                  }}
                  className="w-full text-left px-4 py-3 hover:bg-white/10 text-sm text-white flex items-start gap-2"
                >
                  <MapPin className="w-4 h-4 text-gold shrink-0 mt-0.5" />
                  <span>{s.displayName}</span>
                </button>
              </li>
            ))}
          </ul>
        )}
        {selectedPlace && (
          <p className="text-xs text-gold flex items-center gap-1">
            <MapPin className="w-3 h-3" />
            {selectedPlace.lat.toFixed(4)}°N, {selectedPlace.lng.toFixed(4)}°E
          </p>
        )}
      </div>

      <AnimatedButton type="submit" variant="primary" size="lg" disabled={loading || !selectedPlace} className="w-full">
        {loading ? "Calculating..." : "Generate Kundli"}
      </AnimatedButton>
    </form>
  );
}
