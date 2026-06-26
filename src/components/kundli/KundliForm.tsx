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

export type KundliFormInitialValues = {
  name?: string;
  date?: string;
  time?: string;
  placeName?: string;
  lat?: number;
  lng?: number;
  timezone?: string;
  birthTimeUnknown?: boolean;
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
  initialValues?: KundliFormInitialValues;
};

const inputClass =
  "w-full px-4 py-3 rounded-xl border border-ink/20 bg-cream text-ink focus:outline-none focus:border-bhagva focus:ring-1 focus:ring-bhagva transition-colors";

export default function KundliForm({ onSubmit, loading = false, initialValues }: KundliFormProps) {
  const [name, setName] = useState("");
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [cityQuery, setCityQuery] = useState("");
  const [suggestions, setSuggestions] = useState<GeocodeResult[]>([]);
  const [selectedPlace, setSelectedPlace] = useState<GeocodeResult | null>(null);
  const [searching, setSearching] = useState(false);
  const [birthTimeUnknown, setBirthTimeUnknown] = useState(false);

  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const appliedInitialRef = useRef(false);

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

  useEffect(() => {
    if (!initialValues || appliedInitialRef.current) return;
    appliedInitialRef.current = true;

    if (initialValues.name) setName(initialValues.name);
    if (initialValues.date) setDate(initialValues.date);
    if (initialValues.time) setTime(initialValues.time.slice(0, 5));
    if (initialValues.birthTimeUnknown) setBirthTimeUnknown(true);

    if (initialValues.placeName) setCityQuery(initialValues.placeName);

    const { lat, lng, timezone, placeName } = initialValues;
    if (lat != null && lng != null && placeName) {
      setSelectedPlace({
        name: placeName.split(",")[0]?.trim() ?? placeName,
        lat,
        lng,
        timezone: timezone ?? "Asia/Kolkata",
        displayName: placeName,
      });
    }
  }, [initialValues]);

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
        <label htmlFor="kundli-name" className="block text-sm font-bold text-ink">
          Full Name
        </label>
        <input
          id="kundli-name"
          type="text"
          required
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Your name"
          className={inputClass}
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="space-y-2">
          <label htmlFor="kundli-dob" className="block text-sm font-bold text-ink">
            Date of Birth
          </label>
          <input
            id="kundli-dob"
            type="date"
            required
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className={inputClass}
          />
        </div>
        <div className="space-y-2">
          <label htmlFor="kundli-tob" className="block text-sm font-bold text-ink">
            Time of Birth
          </label>
          <input
            id="kundli-tob"
            type="time"
            required
            value={time}
            onChange={(e) => setTime(e.target.value)}
            className={inputClass}
          />
          {birthTimeUnknown && !time && (
            <p className="text-xs text-ink-muted">
              Birth time not set in your profile — enter a time here for an accurate chart, or update it in{" "}
              <a href="/profile" className="text-bhagva hover:underline font-medium">
                My Profile
              </a>
              .
            </p>
          )}
        </div>
      </div>

      <div className="space-y-2 relative">
        <label htmlFor="kundli-place" className="block text-sm font-bold text-ink">
          Place of Birth
        </label>
        <div className="relative">
          <Search className="absolute left-4 top-3.5 w-5 h-5 text-ink-muted" />
          <input
            id="kundli-place"
            type="text"
            required
            value={cityQuery}
            onChange={(e) => handleCityChange(e.target.value)}
            placeholder="Search city (e.g. Delhi, Mumbai)"
            className={`${inputClass} pl-12`}
          />
        </div>
        {searching && <p className="text-xs text-ink-muted">Searching...</p>}
        {suggestions.length > 0 && !selectedPlace && (
          <ul className="absolute z-20 w-full mt-1 bg-white border border-ink/20 rounded-xl overflow-hidden shadow-lg">
            {suggestions.map((s, i) => (
              <li key={i}>
                <button
                  type="button"
                  onClick={() => {
                    setSelectedPlace(s);
                    setCityQuery(s.displayName);
                    setSuggestions([]);
                  }}
                  className="w-full text-left px-4 py-3 hover:bg-cream-tint text-sm text-ink flex items-start gap-2"
                >
                  <MapPin className="w-4 h-4 text-bhagva shrink-0 mt-0.5" />
                  <span>{s.displayName}</span>
                </button>
              </li>
            ))}
          </ul>
        )}
        {selectedPlace && (
          <p className="text-xs text-bhagva font-medium flex items-center gap-1">
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
