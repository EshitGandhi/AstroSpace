"use client";

import { useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Camera, User } from "lucide-react";

interface PhotoUploadProps {
  value?: string;
  onChange: (dataUrl: string) => void;
}

export default function PhotoUpload({ value, onChange }: PhotoUploadProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);

  const handleFile = (file: File | undefined) => {
    if (!file || !file.type.startsWith("image/")) return;
    const reader = new FileReader();
    reader.onload = (e) => {
      const result = e.target?.result as string;
      onChange(result);
    };
    reader.readAsDataURL(file);
  };

  return (
    <div className="flex flex-col items-center gap-3">
      <motion.div
        className={`relative w-28 h-28 rounded-full cursor-pointer group ${
          isDragging ? "ring-4 ring-bhagva/50 ring-offset-2" : ""
        }`}
        whileHover={{ scale: 1.04 }}
        whileTap={{ scale: 0.97 }}
        onClick={() => inputRef.current?.click()}
        onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={(e) => {
          e.preventDefault();
          setIsDragging(false);
          handleFile(e.dataTransfer.files[0]);
        }}
      >
        {/* Avatar circle */}
        <div className="w-28 h-28 rounded-full overflow-hidden bg-cream-tint border-4 border-white shadow-lg">
          <AnimatePresence mode="wait">
            {value ? (
              <motion.img
                key="photo"
                src={value}
                alt="Profile"
                className="w-full h-full object-cover"
                initial={{ opacity: 0, scale: 1.1 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.3 }}
              />
            ) : (
              <motion.div
                key="placeholder"
                className="w-full h-full flex items-center justify-center"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                {/* Zodiac-inspired default avatar */}
                <svg viewBox="0 0 112 112" className="w-full h-full" fill="none">
                  <circle cx="56" cy="56" r="56" fill="#FCE9DA" />
                  {/* Subtle mandala ring */}
                  <circle cx="56" cy="56" r="44" stroke="#E8590C" strokeWidth="0.5" strokeDasharray="4 6" opacity="0.4" />
                  <circle cx="56" cy="56" r="34" stroke="#E0B33C" strokeWidth="0.5" strokeDasharray="2 8" opacity="0.3" />
                  {/* Person silhouette */}
                  <circle cx="56" cy="42" r="14" fill="#E8590C" opacity="0.25" />
                  <ellipse cx="56" cy="82" rx="22" ry="16" fill="#E8590C" opacity="0.2" />
                  <User className="text-bhagva" strokeWidth={1} />
                </svg>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Camera overlay */}
        <motion.div
          className="absolute inset-0 rounded-full bg-black/30 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200"
        >
          <div className="w-9 h-9 rounded-full bg-white/90 flex items-center justify-center shadow">
            <Camera className="w-4 h-4 text-bhagva" />
          </div>
        </motion.div>

        {/* Edit badge */}
        <div className="absolute bottom-1 right-1 w-7 h-7 rounded-full bg-bhagva flex items-center justify-center shadow-md border-2 border-white">
          <Camera className="w-3.5 h-3.5 text-white" />
        </div>
      </motion.div>

      <p className="text-xs text-ink-muted">Tap to upload photo</p>

      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="hidden"
        id="photo-upload-input"
        onChange={(e) => handleFile(e.target.files?.[0])}
      />
    </div>
  );
}
