"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { createPortal } from "react-dom";
import { ChevronDown, Check } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface Option {
  label: string;
  value: string;
}

interface CustomSelectProps {
  value: string;
  onChange: (value: string) => void;
  options: Option[];
  placeholder?: string;
  className?: string;
  openDirection?: "up" | "down" | "auto";
}

export default function CustomSelect({
  value,
  onChange,
  options,
  placeholder = "Select...",
  className = "",
  openDirection = "auto",
}: CustomSelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isMounted, setIsMounted] = useState(false);
  const [openUpward, setOpenUpward] = useState(false);
  const [coords, setCoords] = useState<{
    top: number;
    bottom: number;
    left: number;
    width: number;
  } | null>(null);

  const containerRef = useRef<HTMLDivElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const selectedOption = options.find((opt) => opt.value === value);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const updateCoords = useCallback(() => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    setCoords({
      top: rect.top,
      bottom: rect.bottom,
      left: rect.left,
      width: rect.width,
    });

    if (openDirection === "down") {
      setOpenUpward(false);
    } else if (openDirection === "up") {
      setOpenUpward(true);
    } else {
      const spaceBelow = window.innerHeight - rect.bottom;
      const spaceAbove = rect.top;
      // Estimate dropdown height: up to 10 options × ~36px + padding
      const estimatedHeight = Math.min(options.length * 36 + 8, 280);
      setOpenUpward(spaceBelow < estimatedHeight && spaceAbove > spaceBelow);
    }
  }, [options.length, openDirection]);

  const handleToggle = () => {
    if (!isOpen) {
      updateCoords();
    }
    setIsOpen((prev) => !prev);
  };

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      const target = event.target as Node;
      const clickedInsideContainer = containerRef.current?.contains(target);
      const clickedInsideDropdown = dropdownRef.current?.contains(target);

      if (!clickedInsideContainer && !clickedInsideDropdown) {
        setIsOpen(false);
      }
    }

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return;
    window.addEventListener("scroll", updateCoords, true);
    window.addEventListener("resize", updateCoords);
    return () => {
      window.removeEventListener("scroll", updateCoords, true);
      window.removeEventListener("resize", updateCoords);
    };
  }, [isOpen, updateCoords]);

  // Build inline style for the fixed dropdown overlay
  const getDropdownStyle = (): React.CSSProperties => {
    if (!coords) return {};
    const baseStyle: React.CSSProperties = {
      position: "fixed",
      left: `${coords.left}px`,
      width: `${coords.width}px`,
      zIndex: 99999,
      maxHeight: "min(280px, 50vh)",
    };

    if (openUpward) {
      return {
        ...baseStyle,
        bottom: `${window.innerHeight - coords.top + 4}px`,
      };
    } else {
      return {
        ...baseStyle,
        top: `${coords.bottom + 4}px`,
      };
    }
  };

  return (
    <div className={`relative ${className}`} ref={containerRef}>
      <button
        type="button"
        onClick={handleToggle}
        className={`w-full flex items-center justify-between px-3 py-2 bg-white border ${
          isOpen ? "border-bhagva shadow-sm" : "border-ink/10"
        } rounded-xl text-xs font-semibold text-ink hover:border-bhagva/50 transition-all outline-none`}
      >
        <span className={selectedOption ? "text-ink truncate" : "text-ink/60 truncate"}>
          {selectedOption ? selectedOption.label : placeholder}
        </span>
        <ChevronDown
          className={`w-3.5 h-3.5 text-ink/40 flex-shrink-0 ml-1 transition-transform duration-200 ${
            isOpen ? "rotate-180" : ""
          }`}
        />
      </button>

      {isMounted && isOpen && coords && createPortal(
        <AnimatePresence>
          <motion.div
            ref={dropdownRef}
            initial={{ opacity: 0, y: openUpward ? 5 : -5, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: openUpward ? 5 : -5, scale: 0.98 }}
            transition={{ duration: 0.12 }}
            className="bg-white border border-ink/10 rounded-xl shadow-2xl overflow-y-auto py-1"
            style={getDropdownStyle()}
          >
            {options.map((option) => {
              const isSelected = value === option.value;
              return (
                <button
                  key={option.value}
                  onClick={() => {
                    onChange(option.value);
                    setIsOpen(false);
                  }}
                  className={`w-full text-left px-3 py-2 text-xs font-medium flex items-center justify-between hover:bg-cream-tint transition-colors ${
                    isSelected ? "text-bhagva bg-bhagva/5" : "text-ink/80"
                  }`}
                >
                  <span className="truncate">{option.label}</span>
                  {isSelected && <Check className="w-3.5 h-3.5 text-bhagva flex-shrink-0 ml-1" />}
                </button>
              );
            })}
          </motion.div>
        </AnimatePresence>,
        document.body
      )}
    </div>
  );
}
