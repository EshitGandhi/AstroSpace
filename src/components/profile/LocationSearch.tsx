"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MapPin, X } from "lucide-react";

export interface LocationResult {
  name: string;
  lat: number;
  lng: number;
  timezone: string;
  displayName: string;
}

interface LocationSearchProps {
  label: string;
  placeholder?: string;
  value: string;
  required?: boolean;
  error?: string;
  disabled?: boolean;
  id: string;
  onSelect: (result: LocationResult | null) => void;
}

export default function LocationSearch({
  label,
  placeholder = "Search…",
  value,
  required = false,
  error,
  disabled = false,
  id,
  onSelect,
}: LocationSearchProps) {
  const [query, setQuery] = useState(value);
  const [results, setResults] = useState<LocationResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const wrapperRef = useRef<HTMLDivElement>(null);

  // Sync external value → local query when parent clears
  useEffect(() => {
    setQuery(value);
  }, [value]);

  const search = useCallback(async (q: string) => {
    if (q.length < 2) { setResults([]); return; }
    setLoading(true);
    try {
      const res = await fetch(`/api/geocode?q=${encodeURIComponent(q)}`);
      if (res.ok) {
        const data: LocationResult[] = await res.json();
        setResults(data);
      }
    } finally {
      setLoading(false);
    }
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setQuery(val);
    setOpen(true);
    if (val === "") { onSelect(null); setResults([]); return; }
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => search(val), 300);
  };

  const handleSelect = (r: LocationResult) => {
    setQuery(r.name);
    setResults([]);
    setOpen(false);
    onSelect(r);
  };

  const handleClear = () => {
    setQuery("");
    setResults([]);
    setOpen(false);
    onSelect(null);
  };

  // Close on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  return (
    <div ref={wrapperRef} className="relative">
      <label htmlFor={id} className="block text-sm font-semibold text-ink mb-1.5">
        {label}
        {required && <span className="text-bhagva ml-1">*</span>}
      </label>

      <div
        className={`relative flex items-center gap-2 rounded-xl border bg-white px-3.5 py-3 transition-all duration-200 shadow-sm
          ${error ? "border-red-400 ring-1 ring-red-300" : "border-ink/10 focus-within:border-bhagva/60 focus-within:ring-2 focus-within:ring-bhagva/20"}
          ${disabled ? "opacity-50 cursor-not-allowed bg-cream" : ""}
        `}
      >
        <MapPin className="w-4 h-4 text-ink-muted flex-shrink-0" />
        <input
          id={id}
          type="text"
          value={query}
          onChange={handleChange}
          onFocus={() => query.length >= 2 && setOpen(true)}
          placeholder={placeholder}
          disabled={disabled}
          autoComplete="off"
          className="flex-1 bg-transparent text-sm text-ink placeholder:text-ink-muted/60 outline-none min-w-0"
        />
        {query && !disabled && (
          <button type="button" onClick={handleClear} className="flex-shrink-0 text-ink-muted hover:text-ink transition-colors">
            <X className="w-3.5 h-3.5" />
          </button>
        )}
        {loading && (
          <div className="flex-shrink-0 w-4 h-4 border-2 border-bhagva/30 border-t-bhagva rounded-full animate-spin" />
        )}
      </div>

      {/* Dropdown */}
      <AnimatePresence>
        {open && results.length > 0 && (
          <motion.ul
            initial={{ opacity: 0, y: -6, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -6, scale: 0.98 }}
            transition={{ duration: 0.15 }}
            className="absolute z-50 top-full mt-1.5 w-full bg-white border border-ink/10 rounded-xl shadow-xl overflow-hidden"
          >
            {results.map((r, i) => (
              <li key={`${r.lat}-${r.lng}-${i}`}>
                <button
                  type="button"
                  onClick={() => handleSelect(r)}
                  className="w-full text-left px-4 py-3 flex gap-3 items-start hover:bg-cream-tint transition-colors group"
                >
                  <MapPin className="w-4 h-4 text-bhagva mt-0.5 flex-shrink-0" />
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-ink truncate group-hover:text-bhagva transition-colors">{r.name}</p>
                    <p className="text-xs text-ink-muted truncate">{r.displayName}</p>
                  </div>
                </button>
              </li>
            ))}
          </motion.ul>
        )}
      </AnimatePresence>

      {error && (
        <motion.p
          initial={{ opacity: 0, y: -4 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-1.5 text-xs text-red-500"
        >
          {error}
        </motion.p>
      )}
    </div>
  );
}
