"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { createPortal } from "react-dom";
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
  const [isMounted, setIsMounted] = useState(false);
  const [coords, setCoords] = useState<{
    top: number;
    bottom: number;
    left: number;
    width: number;
  } | null>(null);

  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const inputContainerRef = useRef<HTMLDivElement>(null);
  const dropdownRef = useRef<HTMLUListElement>(null);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Sync external value → local query when parent clears/changes
  useEffect(() => {
    setQuery(value);
  }, [value]);

  const updateCoords = useCallback(() => {
    if (!inputContainerRef.current) return;
    const rect = inputContainerRef.current.getBoundingClientRect();
    setCoords({
      top: rect.top,
      bottom: rect.bottom,
      left: rect.left,
      width: rect.width,
    });
  }, []);

  const search = useCallback(async (q: string) => {
    if (q.length < 2) {
      setResults([]);
      return;
    }
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
    if (val === "") {
      onSelect(null);
      setResults([]);
      setOpen(false);
      return;
    }
    updateCoords();
    setOpen(true);
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
      const target = e.target as Node;
      const clickedInsideWrapper = wrapperRef.current?.contains(target);
      const clickedInsideDropdown = dropdownRef.current?.contains(target);

      if (!clickedInsideWrapper && !clickedInsideDropdown) {
        setOpen(false);
      }
    };
    if (open) {
      document.addEventListener("mousedown", handler);
    }
    return () => document.removeEventListener("mousedown", handler);
  }, [open]);

  // Keep dropdown attached to the input on scroll or resize
  useEffect(() => {
    if (!open) return;
    window.addEventListener("scroll", updateCoords, true);
    window.addEventListener("resize", updateCoords);
    return () => {
      window.removeEventListener("scroll", updateCoords, true);
      window.removeEventListener("resize", updateCoords);
    };
  }, [open, updateCoords]);

  const getDropdownStyle = (): React.CSSProperties => {
    if (!coords) return {};
    return {
      position: "fixed",
      top: `${coords.bottom + 6}px`,
      left: `${coords.left}px`,
      width: `${coords.width}px`,
      zIndex: 99999,
      maxHeight: "220px",
    };
  };

  return (
    <div ref={wrapperRef} className="relative">
      {label && (
        <label htmlFor={id} className="block text-sm font-semibold text-ink mb-1.5">
          {label}
          {required && <span className="text-bhagva ml-1">*</span>}
        </label>
      )}

      <div
        ref={inputContainerRef}
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
          onFocus={() => {
            if (query.length >= 2) {
              updateCoords();
              setOpen(true);
            }
          }}
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

      {/* Portal Dropdown Options */}
      {isMounted && open && results.length > 0 && coords && createPortal(
        <AnimatePresence>
          <motion.ul
            ref={dropdownRef}
            initial={{ opacity: 0, y: -6, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -6, scale: 0.98 }}
            transition={{ duration: 0.15 }}
            className="bg-white border border-ink/10 rounded-xl shadow-2xl overflow-y-auto py-1"
            style={getDropdownStyle()}
          >
            {results.map((r, i) => (
              <li key={`${r.lat}-${r.lng}-${i}`}>
                <button
                  type="button"
                  onClick={() => handleSelect(r)}
                  className="w-full text-left px-4 py-2.5 flex gap-3 items-start hover:bg-cream-tint transition-colors group"
                >
                  <MapPin className="w-4 h-4 text-bhagva mt-0.5 flex-shrink-0" />
                  <div className="min-w-0">
                    <p className="text-xs font-medium text-ink truncate group-hover:text-bhagva transition-colors">{r.name}</p>
                    <p className="text-[10px] text-ink-muted truncate">{r.displayName}</p>
                  </div>
                </button>
              </li>
            ))}
          </motion.ul>
        </AnimatePresence>,
        document.body
      )}

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
