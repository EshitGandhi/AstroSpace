"use client";

import { useState } from "react";
import { X, Calendar, Clock, Video, Phone, MessageCircle, Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";

interface ScheduleModalProps {
  pandit: any;
  onClose: () => void;
}

export default function ScheduleModal({ pandit, onClose }: ScheduleModalProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [mode, setMode] = useState<"CHAT" | "VOICE" | "VIDEO">("CHAT");
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [notes, setNotes] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!date || !time) {
      setError("Please select both date and time.");
      return;
    }
    
    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/consult/schedule", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          panditId: pandit.id,
          mode,
          scheduledTime: new Date(`${date}T${time}`).toISOString(),
          notes
        }),
      });

      if (!res.ok) {
        throw new Error("Failed to schedule consultation");
      }

      onClose();
      router.push("/profile?tab=consultations"); // Redirect to user's bookings
    } catch (err: any) {
      setError(err.message || "An error occurred");
      setLoading(false);
    }
  };

  const getPrice = () => {
    if (mode === "CHAT") return pandit.chatPrice || 0;
    if (mode === "VOICE") return pandit.callPrice || 0;
    if (mode === "VIDEO") return pandit.videoCallPrice || 0;
    return 0;
  };

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in duration-200">
        <div className="bg-bhagva p-4 flex items-center justify-between text-white">
          <h2 className="text-xl font-bold font-heading">Schedule Consultation</h2>
          <button onClick={onClose} className="p-1 hover:bg-white/20 rounded-full transition-colors">
            <X className="w-6 h-6" />
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {error && <div className="p-3 bg-red-50 text-red-600 rounded-xl text-sm font-medium">{error}</div>}
          
          <div className="flex items-center gap-4 bg-cream-tint p-4 rounded-2xl">
            <div className="w-12 h-12 rounded-full bg-white border-2 border-bhagva/20 flex items-center justify-center overflow-hidden flex-shrink-0">
              {pandit.profileImage ? (
                <img src={pandit.profileImage} alt="" className="w-full h-full object-cover" />
              ) : (
                <span className="text-bhagva font-bold">{(pandit.displayName || "P")[0]}</span>
              )}
            </div>
            <div>
              <h3 className="font-bold text-ink">{pandit.displayName}</h3>
              <p className="text-sm text-ink/70 flex items-center gap-1">
                Estimated Rate: <span className="font-bold text-bhagva">₹{getPrice()}/min</span>
              </p>
            </div>
          </div>

          <div>
            <label className="block text-sm font-bold text-ink mb-2">Consultation Mode</label>
            <div className="grid grid-cols-3 gap-2">
              <button type="button" onClick={() => setMode("CHAT")} className={`flex flex-col items-center justify-center p-3 rounded-xl border-2 transition-all ${mode === "CHAT" ? "border-bhagva bg-bhagva/5 text-bhagva" : "border-ink/10 text-ink/60 hover:border-bhagva/30"}`}>
                <MessageCircle className="w-6 h-6 mb-1" />
                <span className="text-xs font-bold">Chat</span>
              </button>
              <button type="button" onClick={() => setMode("VOICE")} className={`flex flex-col items-center justify-center p-3 rounded-xl border-2 transition-all ${mode === "VOICE" ? "border-bhagva bg-bhagva/5 text-bhagva" : "border-ink/10 text-ink/60 hover:border-bhagva/30"}`}>
                <Phone className="w-6 h-6 mb-1" />
                <span className="text-xs font-bold">Voice</span>
              </button>
              <button type="button" onClick={() => setMode("VIDEO")} className={`flex flex-col items-center justify-center p-3 rounded-xl border-2 transition-all ${mode === "VIDEO" ? "border-bhagva bg-bhagva/5 text-bhagva" : "border-ink/10 text-ink/60 hover:border-bhagva/30"}`}>
                <Video className="w-6 h-6 mb-1" />
                <span className="text-xs font-bold">Video</span>
              </button>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-bold text-ink mb-2">Date</label>
              <div className="relative">
                <input type="date" required value={date} onChange={e => setDate(e.target.value)} min={new Date().toISOString().split("T")[0]} className="w-full pl-10 pr-4 py-3 rounded-xl border border-ink/20 bg-white text-ink focus:ring-2 focus:ring-bhagva/20 focus:border-bhagva outline-none transition-all" />
                <Calendar className="absolute left-3 top-3.5 w-5 h-5 text-ink/40 pointer-events-none" />
              </div>
            </div>
            <div>
              <label className="block text-sm font-bold text-ink mb-2">Time</label>
              <div className="relative">
                <input type="time" required value={time} onChange={e => setTime(e.target.value)} className="w-full pl-10 pr-4 py-3 rounded-xl border border-ink/20 bg-white text-ink focus:ring-2 focus:ring-bhagva/20 focus:border-bhagva outline-none transition-all" />
                <Clock className="absolute left-3 top-3.5 w-5 h-5 text-ink/40 pointer-events-none" />
              </div>
            </div>
          </div>

          <div>
            <label className="block text-sm font-bold text-ink mb-2">Any specific concerns? (Optional)</label>
            <textarea value={notes} onChange={e => setNotes(e.target.value)} rows={3} placeholder="E.g. I want to ask about my career..." className="w-full p-4 rounded-xl border border-ink/20 bg-white text-ink focus:ring-2 focus:ring-bhagva/20 focus:border-bhagva outline-none transition-all resize-none"></textarea>
          </div>

          <button type="submit" disabled={loading} className="w-full py-4 rounded-xl bg-bhagva text-white font-black shadow-lg hover:shadow-xl hover:bg-bhagva/90 transition-all flex items-center justify-center gap-2">
            {loading ? <Loader2 className="w-6 h-6 animate-spin" /> : <Calendar className="w-6 h-6" />}
            {loading ? "Scheduling..." : "Confirm Booking"}
          </button>
        </form>
      </div>
    </div>
  );
}
