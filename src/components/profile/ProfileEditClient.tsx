"use client";

import { useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  User, Calendar, MapPin, Globe, Heart, Camera, Edit3, Save,
  X, Check, ChevronDown, AlertCircle, Loader2, Clock, Info,
} from "lucide-react";
import type { UserProfile } from "@prisma/client";
import LocationSearch, { LocationResult } from "@/components/profile/LocationSearch";
import PhotoUpload from "@/components/profile/PhotoUpload";
import toast from "react-hot-toast";
import { useRouter } from "next/navigation";

/* ─── Types ─── */
type EditableProfile = Omit<UserProfile, "id" | "userId" | "createdAt" | "updatedAt" | "profileComplete" | "dateOfBirth"> & {
  dateOfBirth: string; // ISO string for input
};

/* ─── Constants ─── */
const GENDER_OPTIONS = [
  { value: "male", label: "Male", emoji: "♂" },
  { value: "female", label: "Female", emoji: "♀" },
  { value: "other", label: "Other", emoji: "⚧" },
  { value: "prefer_not", label: "Prefer not to say", emoji: "—" },
];
const LANGUAGES = ["English","Hindi","Gujarati","Marathi","Tamil","Telugu","Kannada","Bengali","Punjabi","Malayalam"];
const MARITAL_STATUSES = ["Single","Married","Divorced","Widowed","Prefer not to say"];
const CASTES = ["Brahmin","Rajput","Vaishya","Jat","Kayastha","SC","ST","OBC","Other","Prefer not to say"];

/* ─── Sub-components ─── */
function InfoRow({ label, value, icon: Icon }: { label: string; value?: string | null; icon?: React.ComponentType<{className?: string}> }) {
  return (
    <div className="flex items-start gap-3 py-3 border-b border-ink/5 last:border-0">
      {Icon && <Icon className="w-4 h-4 text-bhagva mt-0.5 flex-shrink-0" />}
      <div className="flex-1 min-w-0">
        <p className="text-xs text-ink-muted font-medium mb-0.5">{label}</p>
        <p className="text-sm font-semibold text-ink truncate">{value || <span className="text-ink-muted/60 font-normal italic">Not set</span>}</p>
      </div>
    </div>
  );
}

function SectionHeader({ icon: Icon, title, onEdit, isEditing, saving, onSave, onCancel }: {
  icon: React.ComponentType<{className?: string}>;
  title: string;
  onEdit: () => void;
  isEditing: boolean;
  saving?: boolean;
  onSave: () => void;
  onCancel: () => void;
}) {
  return (
    <div className="flex items-center justify-between px-5 py-3.5 bg-cream-tint/50 border-b border-ink/5">
      <div className="flex items-center gap-2.5">
        <div className="w-7 h-7 rounded-lg bg-bhagva/10 flex items-center justify-center">
          <Icon className="w-3.5 h-3.5 text-bhagva" />
        </div>
        <h3 className="text-sm font-bold text-ink font-heading">{title}</h3>
      </div>
      <AnimatePresence mode="wait">
        {isEditing ? (
          <motion.div key="actions" initial={{ opacity: 0, x: 8 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0 }} className="flex gap-1.5">
            <button onClick={onCancel} className="flex items-center gap-1 px-2.5 py-1.5 text-xs font-semibold rounded-lg text-ink-muted hover:bg-ink/5 transition-colors">
              <X className="w-3.5 h-3.5" /> Cancel
            </button>
            <button onClick={onSave} disabled={saving} className="flex items-center gap-1 px-3 py-1.5 text-xs font-semibold rounded-lg bg-bhagva text-white hover:bg-bhagva/90 transition-colors disabled:opacity-60">
              {saving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
              {saving ? "Saving…" : "Save"}
            </button>
          </motion.div>
        ) : (
          <motion.button key="edit" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={onEdit}
            className="flex items-center gap-1 px-2.5 py-1.5 text-xs font-semibold rounded-lg text-bhagva hover:bg-bhagva/10 transition-colors"
          >
            <Edit3 className="w-3.5 h-3.5" /> Edit
          </motion.button>
        )}
      </AnimatePresence>
    </div>
  );
}

function SelectInput({ id, value, onChange, options, placeholder }: {
  id: string; value: string; onChange: (v: string) => void; options: string[]; placeholder?: string;
}) {
  return (
    <div className="relative rounded-xl border border-ink/10 bg-white shadow-sm focus-within:border-bhagva/60 focus-within:ring-2 focus-within:ring-bhagva/20 transition-all">
      <select id={id} value={value} onChange={e => onChange(e.target.value)}
        className="w-full px-3.5 py-2.5 pr-9 text-sm text-ink bg-transparent outline-none appearance-none cursor-pointer">
        {placeholder && <option value="">{placeholder}</option>}
        {options.map(o => <option key={o} value={o}>{o}</option>)}
      </select>
      <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-ink-muted pointer-events-none" />
    </div>
  );
}

function TextInput({ id, type = "text", value, onChange, placeholder, disabled }: {
  id: string; type?: string; value: string; onChange: (v: string) => void; placeholder?: string; disabled?: boolean;
}) {
  return (
    <input id={id} type={type} value={value} onChange={e => onChange(e.target.value)}
      placeholder={placeholder} disabled={disabled}
      className="w-full rounded-xl border border-ink/10 bg-white px-3.5 py-2.5 text-sm text-ink
        outline-none focus:border-bhagva/60 focus:ring-2 focus:ring-bhagva/20 transition-all shadow-sm
        disabled:opacity-50 disabled:cursor-not-allowed [color-scheme:light]"
    />
  );
}

/* ─── Main Component ─── */
interface ProfileEditClientProps {
  profile: UserProfile | null;
  clerkName: string;
  clerkEmail: string;
  clerkPhoto: string;
}

export default function ProfileEditClient({ profile, clerkName, clerkEmail, clerkPhoto }: ProfileEditClientProps) {
  const router = useRouter();

  const initForm = (): EditableProfile => ({
    photoUrl: profile?.photoUrl ?? "",
    gender: profile?.gender ?? "",
    dateOfBirth: profile?.dateOfBirth
      ? new Date(profile.dateOfBirth).toISOString().split("T")[0]
      : "",
    timeOfBirth: profile?.timeOfBirth ?? "",
    birthTimeUnknown: profile?.birthTimeUnknown ?? false,
    birthCity: profile?.birthCity ?? "",
    birthState: profile?.birthState ?? "",
    birthCountry: profile?.birthCountry ?? "",
    birthLat: profile?.birthLat ?? null,
    birthLng: profile?.birthLng ?? null,
    birthTimezone: profile?.birthTimezone ?? "",
    currentCity: profile?.currentCity ?? "",
    currentLat: profile?.currentLat ?? null,
    currentLng: profile?.currentLng ?? null,
    language: profile?.language ?? "English",
    maritalStatus: profile?.maritalStatus ?? "",
    caste: profile?.caste ?? "",
  });

  const [form, setForm] = useState<EditableProfile>(initForm);
  const [saved, setSaved] = useState<EditableProfile>(initForm); // snapshot for cancel

  // Per-section edit state
  const [editing, setEditing] = useState<Record<string, boolean>>({});
  const [saving, setSaving] = useState<Record<string, boolean>>({});

  const set = useCallback(<K extends keyof EditableProfile>(key: K, value: EditableProfile[K]) => {
    setForm(prev => ({ ...prev, [key]: value }));
  }, []);

  const startEdit = (section: string) => {
    setSaved({ ...form }); // snapshot
    setEditing(prev => ({ ...prev, [section]: true }));
  };

  const cancelEdit = (section: string) => {
    setForm(saved); // restore
    setEditing(prev => ({ ...prev, [section]: false }));
  };

  const saveSection = async (section: string, fields: Partial<EditableProfile>) => {
    setSaving(prev => ({ ...prev, [section]: true }));
    try {
      const res = await fetch("/api/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(fields),
      });
      if (!res.ok) throw new Error();
      setSaved({ ...form });
      setEditing(prev => ({ ...prev, [section]: false }));
      toast.success("Changes saved!");
      router.refresh();
    } catch {
      toast.error("Failed to save. Please try again.");
    } finally {
      setSaving(prev => ({ ...prev, [section]: false }));
    }
  };

  const handleBirthLocation = (r: LocationResult | null) => {
    if (!r) {
      setForm(prev => ({ ...prev, birthCity: "", birthState: "", birthCountry: "", birthLat: null, birthLng: null, birthTimezone: "" }));
      return;
    }
    const parts = r.displayName.split(",").map(s => s.trim());
    setForm(prev => ({
      ...prev,
      birthCity: r.name,
      birthState: parts.length >= 3 ? parts[parts.length - 2] : "",
      birthCountry: parts[parts.length - 1] ?? "",
      birthLat: r.lat, birthLng: r.lng, birthTimezone: r.timezone,
    }));
  };

  const handleCurrentLocation = (r: LocationResult | null) => {
    setForm(prev => ({
      ...prev,
      currentCity: r?.name ?? "",
      currentLat: r?.lat ?? null,
      currentLng: r?.lng ?? null,
    }));
  };

  const displayPhoto = form.photoUrl || clerkPhoto;
  const completionFields = [form.gender, form.dateOfBirth, form.birthCity, form.birthCountry, form.language, form.maritalStatus];
  const completedCount = completionFields.filter(Boolean).length;
  const completionPct = Math.round((completedCount / completionFields.length) * 100);

  return (
    <div className="min-h-screen bg-cream py-8 px-4 sm:px-6">
      <div className="max-w-2xl mx-auto space-y-5">

        {/* ── Hero Card ── */}
        <motion.div
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}
          className="bg-white rounded-2xl shadow-sm border border-ink/5 overflow-hidden"
        >
          {/* Top banner */}
          <div className="h-24 bg-gradient-to-r from-bhagva via-bhagva/80 to-gold/60 relative">
            {/* Decorative circles */}
            <div className="absolute right-6 top-1/2 -translate-y-1/2 w-20 h-20 rounded-full bg-white/10 blur-xl" />
            <div className="absolute right-16 top-2 w-10 h-10 rounded-full bg-white/10" />
            <svg className="absolute right-4 bottom-2 w-16 h-16 text-white/10" viewBox="0 0 64 64" fill="none">
              <circle cx="32" cy="32" r="28" stroke="currentColor" strokeWidth="1" strokeDasharray="4 6" />
              <circle cx="32" cy="32" r="20" stroke="currentColor" strokeWidth="0.5" strokeDasharray="2 8" />
            </svg>
          </div>

          {/* Avatar + info row */}
          <div className="px-6 pb-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              
              {/* Left group: Avatar and Name/Email */}
              <div className="flex items-center gap-4">
                {/* Avatar overlapping the banner using translation */}
                <div className="relative w-20 h-20 -translate-y-8 rounded-full overflow-hidden border-4 border-white shadow-lg bg-cream-tint flex-shrink-0 z-10">
                  {displayPhoto ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={displayPhoto} alt={clerkName} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-bhagva/10">
                      <User className="w-8 h-8 text-bhagva/60" />
                    </div>
                  )}
                </div>

                {/* Name + email positioned fully in the white area */}
                <div className="-translate-y-3 min-w-0">
                  <h1 className="text-xl font-extrabold text-ink font-heading truncate">{clerkName || "Your Profile"}</h1>
                  <p className="text-sm text-ink-muted truncate">{clerkEmail}</p>
                </div>
              </div>

              {/* Completion badge */}
              <div className="flex flex-col items-center gap-1 flex-shrink-0 -translate-y-3">
                <div className="relative w-12 h-12">
                  <svg className="w-12 h-12 -rotate-90" viewBox="0 0 48 48">
                    <circle cx="24" cy="24" r="18" fill="none" stroke="#FCE9DA" strokeWidth="4" />
                    <circle cx="24" cy="24" r="18" fill="none" stroke="#E8590C" strokeWidth="4"
                      strokeLinecap="round"
                      strokeDasharray={`${2 * Math.PI * 18}`}
                      strokeDashoffset={`${2 * Math.PI * 18 * (1 - completionPct / 100)}`}
                      style={{ transition: "stroke-dashoffset 0.8s ease" }}
                    />
                  </svg>
                  <span className="absolute inset-0 flex items-center justify-center text-xs font-bold text-bhagva">
                    {completionPct}%
                  </span>
                </div>
                <span className="text-xs text-ink-muted font-medium">Complete</span>
              </div>
            </div>

            {/* Quick stat chips */}
            <div className="mt-4 flex flex-wrap gap-2">
              {[
                { label: form.birthCity || "—", icon: MapPin },
                { label: form.birthCountry || "—", icon: Globe },
                { label: form.language || "English", icon: Globe },
              ].map(({ label, icon: Icon }) => (
                <span key={label} className="inline-flex items-center gap-1.5 bg-cream-tint text-ink-muted text-xs font-medium px-3 py-1.5 rounded-full">
                  <Icon className="w-3 h-3 text-bhagva" /> {label}
                </span>
              ))}
            </div>
          </div>
        </motion.div>

        {/* ── Profile Photo Section ── */}
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05, duration: 0.4 }}
          className="bg-white rounded-2xl shadow-sm border border-ink/5 overflow-hidden">
          <SectionHeader icon={Camera} title="Profile Photo"
            isEditing={!!editing.photo} saving={saving.photo}
            onEdit={() => startEdit("photo")}
            onSave={() => saveSection("photo", { photoUrl: form.photoUrl })}
            onCancel={() => cancelEdit("photo")}
          />
          <div className="px-5 py-5 flex items-center gap-5">
            {editing.photo ? (
              <PhotoUpload value={form.photoUrl || ""} onChange={v => set("photoUrl", v)} />
            ) : (
              <div className="w-20 h-20 rounded-full overflow-hidden border-2 border-cream-tint bg-cream-tint flex-shrink-0">
                {displayPhoto
                  ? <img src={displayPhoto} alt="Profile" className="w-full h-full object-cover" />
                  : <div className="w-full h-full flex items-center justify-center"><User className="w-8 h-8 text-bhagva/40" /></div>
                }
              </div>
            )}
            {!editing.photo && (
              <div>
                <p className="text-sm font-semibold text-ink">{form.photoUrl ? "Custom photo uploaded" : "Using account photo"}</p>
                <p className="text-xs text-ink-muted mt-0.5">Tap Edit to upload a custom profile photo</p>
              </div>
            )}
          </div>
        </motion.div>

        {/* ── Basic Info ── */}
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1, duration: 0.4 }}
          className="bg-white rounded-2xl shadow-sm border border-ink/5 overflow-hidden">
          <SectionHeader icon={User} title="Basic Information"
            isEditing={!!editing.basic} saving={saving.basic}
            onEdit={() => startEdit("basic")}
            onSave={() => saveSection("basic", { gender: form.gender })}
            onCancel={() => cancelEdit("basic")}
          />
          <div className="px-5 py-4">
            {editing.basic ? (
              <div>
                <p className="text-xs font-semibold text-ink mb-2">Gender</p>
                <div className="grid grid-cols-2 gap-2">
                  {GENDER_OPTIONS.map(opt => (
                    <motion.button key={opt.value} type="button" whileTap={{ scale: 0.97 }}
                      onClick={() => set("gender", opt.value)}
                      className={`flex items-center gap-2 px-3.5 py-2.5 rounded-xl border text-sm font-medium transition-all
                        ${form.gender === opt.value
                          ? "bg-bhagva text-white border-bhagva"
                          : "bg-white text-ink border-ink/10 hover:border-bhagva/40"}`}
                    >
                      <span>{opt.emoji}</span>{opt.label}
                      {form.gender === opt.value && <Check className="w-3.5 h-3.5 ml-auto text-white/80" />}
                    </motion.button>
                  ))}
                </div>
              </div>
            ) : (
              <InfoRow icon={User} label="Gender"
                value={GENDER_OPTIONS.find(g => g.value === form.gender)?.label}
              />
            )}
          </div>
        </motion.div>

        {/* ── Birth Details ── */}
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15, duration: 0.4 }}
          className="bg-white rounded-2xl shadow-sm border border-ink/5 overflow-hidden">
          <SectionHeader icon={Calendar} title="Birth Details"
            isEditing={!!editing.birth} saving={saving.birth}
            onEdit={() => startEdit("birth")}
            onSave={() => saveSection("birth", {
              dateOfBirth: form.dateOfBirth, timeOfBirth: form.timeOfBirth,
              birthTimeUnknown: form.birthTimeUnknown,
            })}
            onCancel={() => cancelEdit("birth")}
          />
          <div className="px-5 py-4">
            {editing.birth ? (
              <div className="space-y-4">
                <div>
                  <label className="text-xs font-semibold text-ink mb-1.5 block">Date of Birth <span className="text-bhagva">*</span></label>
                  <TextInput id="dob" type="date" value={form.dateOfBirth} onChange={v => set("dateOfBirth", v)} />
                </div>
                <div>
                  <label className="text-xs font-semibold text-ink mb-1.5 block">Time of Birth</label>
                  <TextInput id="tob" type="time" value={form.timeOfBirth || ""} onChange={v => set("timeOfBirth", v)} disabled={!!form.birthTimeUnknown} />
                  <label className="mt-2.5 flex items-center gap-2 cursor-pointer">
                    <div
                      onClick={() => { set("birthTimeUnknown", !form.birthTimeUnknown); if (!form.birthTimeUnknown) set("timeOfBirth", ""); }}
                      className={`w-[18px] h-[18px] rounded border-2 flex items-center justify-center transition-all cursor-pointer
                        ${form.birthTimeUnknown ? "bg-bhagva border-bhagva" : "border-ink/20"}`}
                    >
                      {form.birthTimeUnknown && <Check className="w-3 h-3 text-white" />}
                    </div>
                    <span className="text-xs text-ink-muted">I don&apos;t know my exact birth time</span>
                  </label>
                  <AnimatePresence>
                    {form.birthTimeUnknown && (
                      <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }}
                        className="overflow-hidden mt-2">
                        <div className="flex gap-2 bg-gold/10 border border-gold/30 rounded-xl p-3">
                          <Info className="w-4 h-4 text-gold flex-shrink-0 mt-0.5" />
                          <p className="text-xs text-ink-muted">Approximate horoscope will be generated with reduced accuracy.</p>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </div>
            ) : (
              <div>
                <InfoRow icon={Calendar} label="Date of Birth"
                  value={form.dateOfBirth ? new Date(form.dateOfBirth).toLocaleDateString("en-IN", { day: "2-digit", month: "long", year: "numeric" }) : undefined}
                />
                <InfoRow icon={Clock} label="Time of Birth"
                  value={form.birthTimeUnknown ? "Not known (approximate horoscope)" : form.timeOfBirth || undefined}
                />
              </div>
            )}
          </div>
        </motion.div>

        {/* ── Place of Birth ── */}
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2, duration: 0.4 }}
          className="bg-white rounded-2xl shadow-sm border border-ink/5 overflow-hidden">
          <SectionHeader icon={MapPin} title="Place of Birth"
            isEditing={!!editing.place} saving={saving.place}
            onEdit={() => startEdit("place")}
            onSave={() => saveSection("place", {
              birthCity: form.birthCity, birthState: form.birthState,
              birthCountry: form.birthCountry, birthLat: form.birthLat,
              birthLng: form.birthLng, birthTimezone: form.birthTimezone,
            })}
            onCancel={() => cancelEdit("place")}
          />
          <div className="px-5 py-4">
            {editing.place ? (
              <div className="space-y-4">
                <LocationSearch id="editBirthPlace" label="Birth City" placeholder="Search city…"
                  value={form.birthCity ?? ""} required onSelect={handleBirthLocation} />
                <AnimatePresence>
                  {form.birthCity && form.birthCountry && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="grid grid-cols-3 gap-2">
                      {[
                        { label: "Country", value: form.birthCountry },
                        { label: "State", value: form.birthState || "—" },
                        { label: "Timezone", value: form.birthTimezone || "—" },
                      ].map(item => (
                        <div key={item.label} className="bg-cream-tint/60 rounded-lg px-3 py-2">
                          <p className="text-xs text-ink-muted">{item.label}</p>
                          <p className="text-xs font-semibold text-ink truncate">{item.value}</p>
                        </div>
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>
                {form.birthLat && form.birthLng && (
                  <p className="text-xs text-ink-muted">Coordinates: {form.birthLat.toFixed(4)}°, {form.birthLng.toFixed(4)}°</p>
                )}
              </div>
            ) : (
              <div>
                <InfoRow icon={MapPin} label="City" value={form.birthCity || undefined} />
                <InfoRow icon={Globe} label="State" value={form.birthState || undefined} />
                <InfoRow icon={Globe} label="Country" value={form.birthCountry || undefined} />
                <InfoRow icon={Clock} label="Timezone" value={form.birthTimezone || undefined} />
                {form.birthLat && form.birthLng && (
                  <p className="text-xs text-ink-muted px-0 pt-2">
                    📍 {form.birthLat.toFixed(4)}°, {form.birthLng.toFixed(4)}°
                  </p>
                )}
              </div>
            )}
          </div>
        </motion.div>

        {/* ── Current Info ── */}
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25, duration: 0.4 }}
          className="bg-white rounded-2xl shadow-sm border border-ink/5 overflow-hidden">
          <SectionHeader icon={Globe} title="Current Information"
            isEditing={!!editing.current} saving={saving.current}
            onEdit={() => startEdit("current")}
            onSave={() => saveSection("current", {
              currentCity: form.currentCity, currentLat: form.currentLat, currentLng: form.currentLng, language: form.language,
            })}
            onCancel={() => cancelEdit("current")}
          />
          <div className="px-5 py-4">
            {editing.current ? (
              <div className="space-y-4">
                <div>
                  <label className="text-xs font-semibold text-ink mb-1.5 block">Current City <span className="text-ink-muted font-normal">(optional)</span></label>
                  <LocationSearch id="editCurrentCity" label="" placeholder="Search city…"
                    value={form.currentCity ?? ""} onSelect={handleCurrentLocation} />
                </div>
                <div>
                  <label className="text-xs font-semibold text-ink mb-1.5 block">Language Preference</label>
                  <SelectInput id="editLanguage" value={form.language || ""} onChange={v => set("language", v)} options={LANGUAGES} placeholder="Select language" />
                </div>
              </div>
            ) : (
              <div>
                <InfoRow icon={MapPin} label="Current City" value={form.currentCity || undefined} />
                <InfoRow icon={Globe} label="Language" value={form.language || undefined} />
              </div>
            )}
          </div>
        </motion.div>

        {/* ── Personal Details ── */}
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3, duration: 0.4 }}
          className="bg-white rounded-2xl shadow-sm border border-ink/5 overflow-hidden">
          <SectionHeader icon={Heart} title="Personal Details"
            isEditing={!!editing.personal} saving={saving.personal}
            onEdit={() => startEdit("personal")}
            onSave={() => saveSection("personal", { maritalStatus: form.maritalStatus, caste: form.caste })}
            onCancel={() => cancelEdit("personal")}
          />
          <div className="px-5 py-4">
            {editing.personal ? (
              <div className="space-y-4">
                <div>
                  <label className="text-xs font-semibold text-ink mb-1.5 block">Marital Status</label>
                  <SelectInput id="editMarital" value={form.maritalStatus || ""} onChange={v => set("maritalStatus", v)} options={MARITAL_STATUSES} placeholder="Select status" />
                </div>
                <div>
                  <label className="text-xs font-semibold text-ink mb-1.5 block">Caste</label>
                  <SelectInput id="editCaste" value={form.caste || ""} onChange={v => set("caste", v)} options={CASTES} placeholder="Select or prefer not to say" />
                </div>
              </div>
            ) : (
              <div>
                <InfoRow icon={Heart} label="Marital Status" value={form.maritalStatus || undefined} />
                <InfoRow icon={User} label="Caste" value={form.caste || undefined} />
              </div>
            )}
          </div>
        </motion.div>

        {/* ── Setup link if profile incomplete ── */}
        {completionPct < 100 && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.35 }}
            className="flex gap-3 bg-gold/10 border border-gold/30 rounded-2xl p-4">
            <AlertCircle className="w-5 h-5 text-gold flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-semibold text-ink">Profile {completionPct}% complete</p>
              <p className="text-xs text-ink-muted mt-0.5">
                Complete all sections for an accurate Kundli.{" "}
                <a href="/profile-setup" className="text-bhagva font-semibold hover:underline">Go to setup →</a>
              </p>
            </div>
          </motion.div>
        )}

        <div className="h-6" />
      </div>
    </div>
  );
}
