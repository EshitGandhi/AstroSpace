"use client";

import { useState, useCallback, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";
import {
  User, Calendar, MapPin, Globe, Heart, ChevronDown,
  CheckCircle2, AlertCircle, Info, Loader2, Star,
} from "lucide-react";
import PhotoUpload from "./PhotoUpload";
import LocationSearch, { LocationResult } from "./LocationSearch";
import type { UserProfile } from "@prisma/client";

/* ─────────────────────────────────────────────
   Types
───────────────────────────────────────────── */
interface FormData {
  photoUrl: string;
  gender: string;
  dateOfBirth: string;
  timeOfBirth: string;
  birthTimeUnknown: boolean;
  birthCity: string;
  birthState: string;
  birthCountry: string;
  birthLat: number | null;
  birthLng: number | null;
  birthTimezone: string;
  currentCity: string;
  currentLat: number | null;
  currentLng: number | null;
  language: string;
  maritalStatus: string;
  caste: string;
}

interface Errors {
  gender?: string;
  dateOfBirth?: string;
  birthCity?: string;
  birthCountry?: string;
}

/* ─────────────────────────────────────────────
   Constants
───────────────────────────────────────────── */
const GENDER_OPTIONS = [
  { value: "male", label: "Male", emoji: "♂" },
  { value: "female", label: "Female", emoji: "♀" },
  { value: "other", label: "Other", emoji: "⚧" },
  { value: "prefer_not", label: "Prefer not to say", emoji: "—" },
];

const LANGUAGES = [
  "English", "Hindi", "Gujarati", "Marathi", "Tamil",
  "Telugu", "Kannada", "Bengali", "Punjabi", "Malayalam",
];

const MARITAL_STATUSES = [
  "Single", "Married", "Divorced", "Widowed", "Prefer not to say",
];

const CASTES = [
  "Brahmin", "Rajput", "Vaishya", "Jat", "Kayastha",
  "SC", "ST", "OBC", "Other", "Prefer not to say",
];

/* ─────────────────────────────────────────────
   Helper sub-components
───────────────────────────────────────────── */
function SectionCard({
  title,
  subtitle,
  icon: Icon,
  children,
  delay = 0,
}: {
  title: string;
  subtitle?: string;
  icon: React.ComponentType<{ className?: string }>;
  children: React.ReactNode;
  delay?: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay, ease: "easeOut" }}
      className="bg-white rounded-2xl shadow-sm border border-ink/5 overflow-hidden"
    >
      {/* Section header */}
      <div className="flex items-center gap-3 px-6 py-4 bg-cream-tint/60 border-b border-ink/5">
        <div className="w-8 h-8 rounded-lg bg-bhagva/10 flex items-center justify-center flex-shrink-0">
          <Icon className="w-4 h-4 text-bhagva" />
        </div>
        <div>
          <h3 className="text-sm font-bold text-ink font-heading">{title}</h3>
          {subtitle && <p className="text-xs text-ink-muted">{subtitle}</p>}
        </div>
      </div>

      <div className="px-6 py-5 space-y-5">{children}</div>
    </motion.div>
  );
}

function FieldLabel({ children, required }: { children: React.ReactNode; required?: boolean }) {
  return (
    <label className="block text-sm font-semibold text-ink mb-1.5">
      {children}
      {required && <span className="text-bhagva ml-1">*</span>}
    </label>
  );
}

function InputField({
  id, type = "text", value, onChange, placeholder, disabled, error, className = "",
}: {
  id: string; type?: string; value: string; onChange: (v: string) => void;
  placeholder?: string; disabled?: boolean; error?: string; className?: string;
}) {
  return (
    <div>
      <input
        id={id}
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        disabled={disabled}
        className={`w-full rounded-xl border bg-white px-4 py-3 text-sm text-ink placeholder:text-ink-muted/60
          outline-none transition-all duration-200 shadow-sm
          ${error ? "border-red-400 ring-1 ring-red-300" : "border-ink/10 focus:border-bhagva/60 focus:ring-2 focus:ring-bhagva/20"}
          ${disabled ? "opacity-50 cursor-not-allowed bg-cream" : ""}
          ${className}`}
      />
      <AnimatePresence>
        {error && (
          <motion.p
            initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
            className="mt-1.5 text-xs text-red-500 flex items-center gap-1"
          >
            <AlertCircle className="w-3 h-3" /> {error}
          </motion.p>
        )}
      </AnimatePresence>
    </div>
  );
}

function SelectField({
  id, value, onChange, options, placeholder, error,
}: {
  id: string; value: string; onChange: (v: string) => void;
  options: string[]; placeholder?: string; error?: string;
}) {
  return (
    <div>
      <div className={`relative rounded-xl border bg-white shadow-sm transition-all duration-200
        ${error ? "border-red-400 ring-1 ring-red-300" : "border-ink/10 focus-within:border-bhagva/60 focus-within:ring-2 focus-within:ring-bhagva/20"}`}
      >
        <select
          id={id}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="w-full px-4 py-3 pr-10 text-sm text-ink bg-transparent outline-none appearance-none cursor-pointer"
        >
          {placeholder && <option value="">{placeholder}</option>}
          {options.map((o) => <option key={o} value={o}>{o}</option>)}
        </select>
        <ChevronDown className="absolute right-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-ink-muted pointer-events-none" />
      </div>
      <AnimatePresence>
        {error && (
          <motion.p
            initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
            className="mt-1.5 text-xs text-red-500 flex items-center gap-1"
          >
            <AlertCircle className="w-3 h-3" /> {error}
          </motion.p>
        )}
      </AnimatePresence>
    </div>
  );
}

/* ─────────────────────────────────────────────
   Main Component
───────────────────────────────────────────── */
interface UserProfileFormProps {
  initialData?: UserProfile | null;
}

export default function UserProfileForm({ initialData }: UserProfileFormProps) {
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [errors, setErrors] = useState<Errors>({});

  // Fix redirect loop: if profile is already complete in DB but cookie is missing
  useEffect(() => {
    if (initialData?.profileComplete && typeof document !== "undefined") {
      document.cookie = "profile_complete=1; path=/; max-age=31536000; SameSite=Lax";
    }
  }, [initialData?.profileComplete]);

  const [form, setForm] = useState<FormData>({
    photoUrl: initialData?.photoUrl ?? "",
    gender: initialData?.gender ?? "",
    dateOfBirth: initialData?.dateOfBirth
      ? new Date(initialData.dateOfBirth).toISOString().split("T")[0]
      : "",
    timeOfBirth: initialData?.timeOfBirth ?? "",
    birthTimeUnknown: initialData?.birthTimeUnknown ?? false,
    birthCity: initialData?.birthCity ?? "",
    birthState: initialData?.birthState ?? "",
    birthCountry: initialData?.birthCountry ?? "",
    birthLat: initialData?.birthLat ?? null,
    birthLng: initialData?.birthLng ?? null,
    birthTimezone: initialData?.birthTimezone ?? "",
    currentCity: initialData?.currentCity ?? "",
    currentLat: initialData?.currentLat ?? null,
    currentLng: initialData?.currentLng ?? null,
    language: initialData?.language ?? "English",
    maritalStatus: initialData?.maritalStatus ?? "",
    caste: initialData?.caste ?? "",
  });

  const set = useCallback(<K extends keyof FormData>(key: K, value: FormData[K]) => {
    setForm((prev) => ({ ...prev, [key]: value }));
    // clear related errors
    if (key in errors) setErrors((prev) => ({ ...prev, [key]: undefined }));
  }, [errors]);

  const handleBirthLocation = (r: LocationResult | null) => {
    if (!r) {
      setForm((prev) => ({
        ...prev, birthCity: "", birthState: "", birthCountry: "",
        birthLat: null, birthLng: null, birthTimezone: "",
      }));
      return;
    }
    const parts = r.displayName.split(",").map((s) => s.trim());
    setForm((prev) => ({
      ...prev,
      birthCity: r.name,
      birthState: parts.length >= 3 ? parts[parts.length - 2] : "",
      birthCountry: parts[parts.length - 1] ?? "",
      birthLat: r.lat,
      birthLng: r.lng,
      birthTimezone: r.timezone,
    }));
    setErrors((prev) => ({ ...prev, birthCity: undefined, birthCountry: undefined }));
  };

  const handleCurrentLocation = (r: LocationResult | null) => {
    if (!r) {
      setForm((prev) => ({ ...prev, currentCity: "", currentLat: null, currentLng: null }));
      return;
    }
    setForm((prev) => ({
      ...prev, currentCity: r.name, currentLat: r.lat, currentLng: r.lng,
    }));
  };

  const validate = (): boolean => {
    const newErrors: Errors = {};
    if (!form.gender) newErrors.gender = "Please select your gender";
    if (!form.dateOfBirth) newErrors.dateOfBirth = "Date of birth is required";
    if (!form.birthCity) newErrors.birthCity = "Birth city is required";
    if (!form.birthCountry) newErrors.birthCountry = "Birth country is required";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    setSubmitting(true);
    try {
      const res = await fetch("/api/profile", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (!res.ok) throw new Error("Failed to save");
      setSubmitSuccess(true);
      // Short delay so user sees the success state
      await new Promise((r) => setTimeout(r, 700));
      router.push("/kundli");
    } catch {
      alert("Something went wrong. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} noValidate className="space-y-6 pb-32 lg:pb-12">

      {/* ── 1. Profile Photo ── */}
      <SectionCard title="Profile Photo" icon={User} delay={0.05}>
        <div className="flex justify-center py-2">
          <PhotoUpload value={form.photoUrl} onChange={(url) => set("photoUrl", url)} />
        </div>
      </SectionCard>

      {/* ── 2. Basic Information ── */}
      <SectionCard title="Basic Information" icon={User} delay={0.1}>
        <div>
          <FieldLabel required>Gender</FieldLabel>
          <div className="grid grid-cols-2 gap-2">
            {GENDER_OPTIONS.map((opt) => (
              <motion.button
                key={opt.value}
                type="button"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.97 }}
                onClick={() => set("gender", opt.value)}
                className={`relative flex items-center gap-2.5 px-4 py-3 rounded-xl border text-sm font-medium transition-all duration-200
                  ${form.gender === opt.value
                    ? "bg-bhagva text-white border-bhagva shadow-md shadow-bhagva/20"
                    : "bg-white text-ink border-ink/10 hover:border-bhagva/40"
                  }`}
              >
                <span className="text-base">{opt.emoji}</span>
                {opt.label}
                {form.gender === opt.value && (
                  <CheckCircle2 className="w-4 h-4 ml-auto flex-shrink-0 text-white/80" />
                )}
              </motion.button>
            ))}
          </div>
          <AnimatePresence>
            {errors.gender && (
              <motion.p
                initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                className="mt-2 text-xs text-red-500 flex items-center gap-1"
              >
                <AlertCircle className="w-3 h-3" /> {errors.gender}
              </motion.p>
            )}
          </AnimatePresence>
        </div>
      </SectionCard>

      {/* ── 3. Birth Details ── */}
      <SectionCard
        title="Birth Details"
        subtitle="Required for accurate Kundli generation"
        icon={Calendar}
        delay={0.15}
      >
        {/* Date of Birth */}
        <div>
          <FieldLabel required>Date of Birth</FieldLabel>
          <InputField
            id="dateOfBirth"
            type="date"
            value={form.dateOfBirth}
            onChange={(v) => set("dateOfBirth", v)}
            error={errors.dateOfBirth}
            className="[color-scheme:light]"
          />
        </div>

        {/* Time of Birth */}
        <div>
          <FieldLabel>Time of Birth</FieldLabel>
          <InputField
            id="timeOfBirth"
            type="time"
            value={form.timeOfBirth}
            onChange={(v) => set("timeOfBirth", v)}
            disabled={form.birthTimeUnknown}
            className="[color-scheme:light]"
          />
          {/* Unknown time checkbox */}
          <label
            htmlFor="birthTimeUnknown"
            className="mt-3 flex items-start gap-2.5 cursor-pointer group"
          >
            <div className="relative mt-0.5 flex-shrink-0">
              <input
                id="birthTimeUnknown"
                type="checkbox"
                checked={form.birthTimeUnknown}
                onChange={(e) => {
                  set("birthTimeUnknown", e.target.checked);
                  if (e.target.checked) set("timeOfBirth", "");
                }}
                className="peer sr-only"
              />
              <div className={`w-4.5 h-4.5 w-[18px] h-[18px] rounded border-2 flex items-center justify-center transition-all duration-200
                ${form.birthTimeUnknown ? "bg-bhagva border-bhagva" : "bg-white border-ink/20 group-hover:border-bhagva/40"}`}
              >
                {form.birthTimeUnknown && (
                  <svg className="w-2.5 h-2.5 text-white" viewBox="0 0 10 10" fill="none">
                    <path d="M1.5 5L4 7.5L8.5 2.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                )}
              </div>
            </div>
            <span className="text-sm text-ink-muted">I don&apos;t know my exact birth time</span>
          </label>

          <AnimatePresence>
            {form.birthTimeUnknown && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.25 }}
                className="overflow-hidden"
              >
                <div className="mt-3 flex gap-2.5 bg-gold/10 border border-gold/30 rounded-xl p-3.5">
                  <Info className="w-4 h-4 text-gold mt-0.5 flex-shrink-0" />
                  <p className="text-xs text-ink-muted leading-relaxed">
                    An approximate horoscope can still be generated, but some predictions may be less accurate.
                  </p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </SectionCard>

      {/* ── 4. Place of Birth ── */}
      <SectionCard
        title="Place of Birth"
        subtitle="Search for your birth city to auto-fill coordinates & timezone"
        icon={MapPin}
        delay={0.2}
      >
        <LocationSearch
          id="birthPlace"
          label="Birth City"
          placeholder="Search city, district, or town…"
          value={form.birthCity}
          required
          error={errors.birthCity ?? errors.birthCountry}
          onSelect={handleBirthLocation}
        />

        {/* Show auto-filled details */}
        <AnimatePresence>
          {form.birthCity && form.birthCountry && (
            <motion.div
              initial={{ opacity: 0, y: -6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="grid grid-cols-2 sm:grid-cols-3 gap-2"
            >
              {[
                { label: "Country", value: form.birthCountry },
                { label: "State", value: form.birthState || "—" },
                { label: "Timezone", value: form.birthTimezone || "—" },
              ].map((item) => (
                <div key={item.label} className="bg-cream-tint/60 rounded-lg px-3 py-2">
                  <p className="text-xs text-ink-muted">{item.label}</p>
                  <p className="text-sm font-semibold text-ink truncate">{item.value}</p>
                </div>
              ))}
            </motion.div>
          )}
        </AnimatePresence>

        {form.birthLat && form.birthLng && (
          <p className="text-xs text-ink-muted">
            Coordinates: {form.birthLat.toFixed(4)}°, {form.birthLng.toFixed(4)}°
          </p>
        )}
      </SectionCard>

      {/* ── 5. Current Information ── */}
      <SectionCard title="Current Information" icon={Globe} delay={0.25}>
        <div>
          <FieldLabel>Current City <span className="text-ink-muted font-normal">(optional)</span></FieldLabel>
          <LocationSearch
            id="currentCity"
            label=""
            placeholder="Search your current city…"
            value={form.currentCity}
            onSelect={handleCurrentLocation}
          />
        </div>

        <div>
          <FieldLabel>Language Preference</FieldLabel>
          <SelectField
            id="language"
            value={form.language}
            onChange={(v) => set("language", v)}
            options={LANGUAGES}
            placeholder="Select language"
          />
        </div>
      </SectionCard>

      {/* ── 6. Personal Details ── */}
      <SectionCard title="Personal Details" icon={Heart} delay={0.3}>
        <div>
          <FieldLabel>Marital Status</FieldLabel>
          <SelectField
            id="maritalStatus"
            value={form.maritalStatus}
            onChange={(v) => set("maritalStatus", v)}
            options={MARITAL_STATUSES}
            placeholder="Select marital status"
          />
        </div>

        <div>
          <FieldLabel>Caste</FieldLabel>
          <SelectField
            id="caste"
            value={form.caste}
            onChange={(v) => set("caste", v)}
            options={CASTES}
            placeholder="Select or prefer not to say"
          />
        </div>
      </SectionCard>

      {/* ── Sticky Continue Button ── */}
      <div className="fixed bottom-0 left-0 right-0 lg:relative lg:bottom-auto lg:left-auto lg:right-auto z-40 p-4 lg:p-0 bg-cream/90 lg:bg-transparent backdrop-blur-md lg:backdrop-blur-none border-t border-ink/5 lg:border-0 lg:mt-0">
        <div className="max-w-2xl mx-auto lg:max-w-none">
          <motion.button
            type="submit"
            disabled={submitting}
            whileHover={{ scale: submitting ? 1 : 1.02 }}
            whileTap={{ scale: submitting ? 1 : 0.97 }}
            className={`relative w-full rounded-2xl py-4 px-8 font-bold text-base text-white transition-all duration-300 overflow-hidden shadow-lg
              ${submitSuccess
                ? "bg-green-500 shadow-green-200"
                : "bg-bhagva shadow-bhagva/30 hover:shadow-bhagva/40 hover:shadow-xl"
              }
              ${submitting ? "opacity-80 cursor-not-allowed" : ""}
            `}
          >
            {/* Shimmer */}
            {!submitting && !submitSuccess && (
              <motion.div
                className="absolute inset-0 bg-white/10"
                initial={{ x: "-100%" }}
                whileHover={{ x: "100%" }}
                transition={{ duration: 0.6 }}
              />
            )}
            <span className="relative z-10 flex items-center justify-center gap-2">
              {submitting ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Saving profile…
                </>
              ) : submitSuccess ? (
                <>
                  <CheckCircle2 className="w-5 h-5" />
                  Profile saved! Redirecting…
                </>
              ) : (
                <>
                  <Star className="w-5 h-5" />
                  Continue — Generate My Kundli
                </>
              )}
            </span>
          </motion.button>

          <p className="mt-2 text-center text-xs text-ink-muted lg:mt-3">
            You can update your profile anytime from your dashboard.
          </p>
        </div>
      </div>
    </form>
  );
}
