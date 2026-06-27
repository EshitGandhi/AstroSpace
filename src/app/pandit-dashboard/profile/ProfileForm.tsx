"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Save, Camera, User } from "lucide-react";

export default function ProfileForm({ profile, user }: { profile: any, user: any }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  
  const [form, setForm] = useState({
    profileImage: profile.profileImage || "",
    displayName: profile.displayName || "",
    experience: profile.experience || "",
    bio: profile.bio || "",
    aadhaarNumber: profile.aadhaarNumber || "",
    chatPrice: profile.chatPrice || "",
    callPrice: profile.callPrice || "",
    videoCallPrice: profile.videoCallPrice || "",
    expertise: profile.expertise?.join(", ") || "",
    languages: profile.languages?.join(", ") || "",
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

    const payload = {
      ...form,
      expertise: form.expertise.split(",").map((s: string) => s.trim()).filter(Boolean),
      languages: form.languages.split(",").map((s: string) => s.trim()).filter(Boolean),
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
        <div>
          <label className="block text-sm font-semibold text-ink mb-1">Expertise (Comma separated)</label>
          <input type="text" value={form.expertise} onChange={(e) => setForm({...form, expertise: e.target.value})} placeholder="e.g. Vedic, Tarot, Vastu" className="w-full px-4 py-2.5 rounded-xl border border-ink/10 bg-white text-sm focus:ring-2 focus:ring-bhagva/20 focus:border-bhagva/60 outline-none" />
        </div>
        <div>
          <label className="block text-sm font-semibold text-ink mb-1">Languages Spoken (Comma separated)</label>
          <input type="text" value={form.languages} onChange={(e) => setForm({...form, languages: e.target.value})} placeholder="e.g. English, Hindi" className="w-full px-4 py-2.5 rounded-xl border border-ink/10 bg-white text-sm focus:ring-2 focus:ring-bhagva/20 focus:border-bhagva/60 outline-none" />
        </div>
        <div>
          <label className="block text-sm font-semibold text-ink mb-1">Aadhaar Number</label>
          <input type="text" value={form.aadhaarNumber} onChange={(e) => setForm({...form, aadhaarNumber: e.target.value})} className="w-full px-4 py-2.5 rounded-xl border border-ink/10 bg-white text-sm focus:ring-2 focus:ring-bhagva/20 focus:border-bhagva/60 outline-none" />
        </div>
      </div>

      <div className="h-px bg-ink/10" />

      <h3 className="font-bold font-heading text-lg">Consultation Pricing (₹)</h3>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <label className="block text-sm font-semibold text-ink mb-1">Chat Price / Min</label>
          <input type="number" value={form.chatPrice} onChange={(e) => setForm({...form, chatPrice: e.target.value})} className="w-full px-4 py-2.5 rounded-xl border border-ink/10 bg-white text-sm focus:ring-2 focus:ring-bhagva/20 focus:border-bhagva/60 outline-none" />
        </div>
        <div>
          <label className="block text-sm font-semibold text-ink mb-1">Call Price / Min</label>
          <input type="number" value={form.callPrice} onChange={(e) => setForm({...form, callPrice: e.target.value})} className="w-full px-4 py-2.5 rounded-xl border border-ink/10 bg-white text-sm focus:ring-2 focus:ring-bhagva/20 focus:border-bhagva/60 outline-none" />
        </div>
        <div>
          <label className="block text-sm font-semibold text-ink mb-1">Video Call Price / Min</label>
          <input type="number" value={form.videoCallPrice} onChange={(e) => setForm({...form, videoCallPrice: e.target.value})} className="w-full px-4 py-2.5 rounded-xl border border-ink/10 bg-white text-sm focus:ring-2 focus:ring-bhagva/20 focus:border-bhagva/60 outline-none" />
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
