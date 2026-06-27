"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Save, Camera, User, ChevronDown, Check } from "lucide-react";

const EXPERTISE_OPTIONS = [
  { label: 'Astrologers', value: 'ASTROLOGERS' },
  { label: 'Tarot Readers', value: 'TAROT_READERS' },
  { label: 'Numerologists', value: 'NUMEROLOGISTS' },
  { label: 'Vastu Consultants', value: 'VASTU_CONSULTANTS' },
  { label: 'Reiki Healers', value: 'REIKI_HEALERS' },
  { label: 'Palmists', value: 'PALMISTS' },
  { label: 'Psychic Readers', value: 'PSYCHIC_READERS' },
  { label: 'Spiritual Healers', value: 'SPIRITUAL_HEALERS' },
  { label: 'Gemstone Experts', value: 'GEMSTONE_EXPERTS' },
  { label: 'Lal Kitab Experts', value: 'LAL_KITAB_EXPERTS' },
  { label: 'Face Readers', value: 'FACE_READERS' },
  { label: 'Aura Readers', value: 'AURA_READERS' },
  { label: 'Pranic Healers', value: 'PRANIC_HEALERS' },
  { label: 'Nadi Astrologers', value: 'NADI_ASTROLOGERS' },
  { label: 'Crystal Healers', value: 'CRYSTAL_HEALERS' },
  { label: 'Life Coaches', value: 'LIFE_COACHES' },
  { label: 'Meditation Coaches', value: 'MEDITATION_COACHES' },
  { label: 'Pandits (for Puja Booking)', value: 'PANDITS' },
  { label: 'Dream Analysts', value: 'DREAM_ANALYSTS' },
];

const LANGUAGE_OPTIONS = [
  { label: 'Hindi', value: 'HINDI' },
  { label: 'English', value: 'ENGLISH' },
  { label: 'Tamil', value: 'TAMIL' },
  { label: 'Telugu', value: 'TELUGU' },
  { label: 'Marathi', value: 'MARATHI' },
  { label: 'Bengali', value: 'BENGALI' },
  { label: 'Gujarati', value: 'GUJARATI' },
  { label: 'Kannada', value: 'KANNADA' },
  { label: 'Malayalam', value: 'MALAYALAM' },
  { label: 'Punjabi', value: 'PUNJABI' },
  { label: 'Odia', value: 'ODIA' },
];

export default function ProfileForm({ profile, user }: { profile: any, user: any }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  
  const [expertiseOpen, setExpertiseOpen] = useState(false);
  const expertiseRef = useRef<HTMLDivElement>(null);
  
  const [languageOpen, setLanguageOpen] = useState(false);
  const languageRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (expertiseRef.current && !expertiseRef.current.contains(event.target as Node)) {
        setExpertiseOpen(false);
      }
      if (languageRef.current && !languageRef.current.contains(event.target as Node)) {
        setLanguageOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const [form, setForm] = useState({
    profileImage: profile.profileImage || "",
    displayName: profile.displayName || "",
    experience: profile.experience || "",
    bio: profile.bio || "",
    aadhaarNumber: profile.aadhaarNumber || "",
    expertise: profile.expertise || [],
    languages: profile.languages || [],
  });

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 1 * 1024 * 1024) {
        setMessage("Image size must be less than 1MB.");
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setForm({ ...form, profileImage: reader.result as string });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");

    if (form.expertise.length < 1 || form.expertise.length > 3) {
      setMessage("Please select between 1 and 3 Expertise options.");
      setLoading(false);
      return;
    }

    if (form.languages.length < 1 || form.languages.length > 3) {
      setMessage("Please select between 1 and 3 Language options.");
      setLoading(false);
      return;
    }

    const payload = {
      ...form,
      expertise: form.expertise,
      languages: form.languages,
    };

    try {
      const res = await fetch("/api/astrologer/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        throw new Error("Failed to update profile");
      }

      setMessage("Profile updated successfully!");
      router.refresh();
    } catch (err: any) {
      setMessage(err.message || "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {message && (
        <div className={`p-4 rounded-xl text-sm ${message.includes("success") ? "bg-green-50 text-green-700 border border-green-200" : "bg-red-50 text-red-700 border border-red-200"}`}>
          {message}
        </div>
      )}

      {/* Profile Image Upload */}
      <div className="flex flex-col items-center sm:items-start sm:flex-row gap-6">
        <div className="relative group">
          <div className="w-24 h-24 rounded-full overflow-hidden bg-cream-tint border-2 border-ink/10 flex items-center justify-center relative">
            {form.profileImage ? (
              <img src={form.profileImage} alt="Profile" className="w-full h-full object-cover" />
            ) : (
              <User className="w-10 h-10 text-ink/40" />
            )}
            <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
              <Camera className="w-6 h-6 text-white" />
            </div>
          </div>
          <input 
            type="file" 
            accept="image/jpeg, image/png, image/webp" 
            onChange={handleImageChange}
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
            title="Upload Profile Photo"
          />
        </div>
        <div className="pt-2 text-center sm:text-left">
          <h3 className="font-bold text-ink">Profile Photo</h3>
          <p className="text-xs text-ink-muted mt-1">Upload a professional square image.<br/>Max size 1MB. (JPG, PNG, WEBP)</p>
        </div>
      </div>

      <div className="h-px bg-ink/10" />

      {/* Basic Info (Read-only from User table) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-semibold text-ink mb-1">Full Name</label>
          <input type="text" value={user.name} disabled className="w-full px-4 py-2.5 rounded-xl border border-ink/10 bg-ink/5 text-sm text-ink/70" />
        </div>
        <div>
          <label className="block text-sm font-semibold text-ink mb-1">Email</label>
          <input type="email" value={user.email} disabled className="w-full px-4 py-2.5 rounded-xl border border-ink/10 bg-ink/5 text-sm text-ink/70" />
        </div>
        <div>
          <label className="block text-sm font-semibold text-ink mb-1">Mobile</label>
          <input type="text" value={user.mobile || ""} disabled className="w-full px-4 py-2.5 rounded-xl border border-ink/10 bg-ink/5 text-sm text-ink/70" />
        </div>
      </div>

      <div className="h-px bg-ink/10" />

      {/* Editable Astrologer Info */}
      <h3 className="font-bold font-heading text-lg">Professional Information</h3>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-semibold text-ink mb-1">Display Name</label>
          <input type="text" value={form.displayName} onChange={(e) => setForm({...form, displayName: e.target.value})} className="w-full px-4 py-2.5 rounded-xl border border-ink/10 bg-white text-sm focus:ring-2 focus:ring-bhagva/20 focus:border-bhagva/60 outline-none" />
        </div>
        <div>
          <label className="block text-sm font-semibold text-ink mb-1">Years of Experience</label>
          <input type="number" value={form.experience} onChange={(e) => setForm({...form, experience: e.target.value})} className="w-full px-4 py-2.5 rounded-xl border border-ink/10 bg-white text-sm focus:ring-2 focus:ring-bhagva/20 focus:border-bhagva/60 outline-none" />
        </div>
        <div className="md:col-span-2">
          <label className="block text-sm font-semibold text-ink mb-1">Bio / About Me</label>
          <textarea rows={4} value={form.bio} onChange={(e) => setForm({...form, bio: e.target.value})} className="w-full px-4 py-2.5 rounded-xl border border-ink/10 bg-white text-sm focus:ring-2 focus:ring-bhagva/20 focus:border-bhagva/60 outline-none"></textarea>
        </div>
        <div className="relative" ref={expertiseRef}>
          <label className="block text-sm font-semibold text-ink mb-1">Expertise (Select 1 to 3)</label>
          <div 
            onClick={() => setExpertiseOpen(!expertiseOpen)}
            className="w-full px-4 py-2.5 rounded-xl border border-ink/10 bg-white text-sm focus:ring-2 focus:ring-bhagva/20 focus:border-bhagva/60 outline-none cursor-pointer flex justify-between items-center"
          >
            <span className="truncate pr-4">
              {form.expertise.length > 0 
                ? form.expertise.map((val: string) => EXPERTISE_OPTIONS.find(o => o.value === val)?.label).join(", ")
                : "Select Expertise..."}
            </span>
            <ChevronDown className={`w-4 h-4 text-ink/50 transition-transform ${expertiseOpen ? "rotate-180" : ""}`} />
          </div>
          
          {expertiseOpen && (
            <div className="absolute z-[100] w-full mt-1 bg-white border border-ink/10 rounded-xl shadow-lg max-h-60 overflow-y-auto">
              {EXPERTISE_OPTIONS.map((option) => (
                <div 
                  key={option.value}
                  onClick={() => {
                    const isSelected = form.expertise.includes(option.value);
                    if (isSelected) {
                      setForm({ ...form, expertise: form.expertise.filter((v: string) => v !== option.value) });
                    } else {
                      if (form.expertise.length < 3) {
                        setForm({ ...form, expertise: [...form.expertise, option.value] });
                      } else {
                        setMessage("You can select up to 3 expertise options only.");
                      }
                    }
                  }}
                  className={`px-4 py-2 cursor-pointer text-sm flex justify-between items-center hover:bg-ink/5 ${form.expertise.includes(option.value) ? "bg-bhagva/5 text-bhagva font-medium" : "text-ink"}`}
                >
                  {option.label}
                  {form.expertise.includes(option.value) && <Check className="w-4 h-4" />}
                </div>
              ))}
            </div>
          )}
        </div>
        <div className="relative" ref={languageRef}>
          <label className="block text-sm font-semibold text-ink mb-1">Languages Spoken (Select 1 to 3)</label>
          <div 
            onClick={() => setLanguageOpen(!languageOpen)}
            className="w-full px-4 py-2.5 rounded-xl border border-ink/10 bg-white text-sm focus:ring-2 focus:ring-bhagva/20 focus:border-bhagva/60 outline-none cursor-pointer flex justify-between items-center"
          >
            <span className="truncate pr-4">
              {form.languages.length > 0 
                ? form.languages.map((val: string) => LANGUAGE_OPTIONS.find(o => o.value === val)?.label).join(", ")
                : "Select Languages..."}
            </span>
            <ChevronDown className={`w-4 h-4 text-ink/50 transition-transform ${languageOpen ? "rotate-180" : ""}`} />
          </div>
          
          {languageOpen && (
            <div className="absolute z-[100] w-full mt-1 bg-white border border-ink/10 rounded-xl shadow-lg max-h-60 overflow-y-auto">
              {LANGUAGE_OPTIONS.map((option) => (
                <div 
                  key={option.value}
                  onClick={() => {
                    const isSelected = form.languages.includes(option.value);
                    if (isSelected) {
                      setForm({ ...form, languages: form.languages.filter((v: string) => v !== option.value) });
                    } else {
                      if (form.languages.length < 3) {
                        setForm({ ...form, languages: [...form.languages, option.value] });
                      } else {
                        setMessage("You can select up to 3 language options only.");
                      }
                    }
                  }}
                  className={`px-4 py-2 cursor-pointer text-sm flex justify-between items-center hover:bg-ink/5 ${form.languages.includes(option.value) ? "bg-bhagva/5 text-bhagva font-medium" : "text-ink"}`}
                >
                  {option.label}
                  {form.languages.includes(option.value) && <Check className="w-4 h-4" />}
                </div>
              ))}
            </div>
          )}
        </div>
        <div>
          <label className="block text-sm font-semibold text-ink mb-1">Aadhaar Number</label>
          <input type="text" value={form.aadhaarNumber} onChange={(e) => setForm({...form, aadhaarNumber: e.target.value})} className="w-full px-4 py-2.5 rounded-xl border border-ink/10 bg-white text-sm focus:ring-2 focus:ring-bhagva/20 focus:border-bhagva/60 outline-none" />
        </div>
      </div>

      <div className="pt-4">
        <button type="submit" disabled={loading} className="w-full md:w-auto px-8 py-3 rounded-xl bg-bhagva text-white font-bold text-sm shadow-md hover:bg-bhagva/90 transition-colors flex items-center justify-center gap-2">
          {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
          {loading ? "Saving..." : "Save Changes"}
        </button>
      </div>
    </form>
  );
}
