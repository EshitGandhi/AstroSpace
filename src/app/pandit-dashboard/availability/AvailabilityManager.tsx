"use client";

import { useState, useEffect } from "react";
import { format, addDays, startOfToday } from "date-fns";
import { Loader2, Save, Plus, Trash2, Calendar, Clock } from "lucide-react";

export default function AvailabilityManager() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  
  // Format: { "YYYY-MM-DD": ["10:00 AM - 11:00 AM", ...] }
  const [availability, setAvailability] = useState<Record<string, string[]>>({});
  
  const [selectedDate, setSelectedDate] = useState<string>("");
  const [newSlotStart, setNewSlotStart] = useState("");
  const [newSlotEnd, setNewSlotEnd] = useState("");

  const today = startOfToday();
  const next7Days = Array.from({ length: 7 }).map((_, i) => {
    const d = addDays(today, i);
    return {
      dateObj: d,
      key: format(d, "yyyy-MM-dd"),
      label: format(d, "EEE, MMM d"),
    };
  });

  useEffect(() => {
    const fetchAvailability = async () => {
      try {
        const res = await fetch("/api/astrologer/availability");
        if (res.ok) {
          const data = await res.json();
          setAvailability(data.availability || {});
        }
      } catch (error) {
        console.error("Failed to fetch availability", error);
      } finally {
        setLoading(false);
      }
    };
    fetchAvailability();
    setSelectedDate(next7Days[0].key);
  }, []);

  const handleAddSlot = () => {
    if (!newSlotStart || !newSlotEnd) {
      setMessage("Please select both start and end times.");
      return;
    }

    const startMins = parseInt(newSlotStart.split(":")[0]) * 60 + parseInt(newSlotStart.split(":")[1]);
    const endMins = parseInt(newSlotEnd.split(":")[0]) * 60 + parseInt(newSlotEnd.split(":")[1]);

    if (startMins >= endMins) {
      setMessage("End time must be after start time.");
      return;
    }

    const existing = availability[selectedDate] || [];
    let hasOverlap = false;

    for (const slot of existing) {
      const [sStr, eStr] = slot.split(" - ");
      const existingStartMins = parseInt(sStr.split(":")[0]) * 60 + parseInt(sStr.split(":")[1]);
      const existingEndMins = parseInt(eStr.split(":")[0]) * 60 + parseInt(eStr.split(":")[1]);

      if (startMins < existingEndMins && endMins > existingStartMins) {
        hasOverlap = true;
        break;
      }
    }

    if (hasOverlap) {
      setMessage("This time slot overlaps with an existing slot. Each time period can only be set once.");
      return;
    }
    
    const slotStr = `${newSlotStart} - ${newSlotEnd}`;
    
    setAvailability((prev) => {
      const existingSlots = prev[selectedDate] || [];
      return {
        ...prev,
        [selectedDate]: [...existingSlots, slotStr].sort(),
      };
    });
    
    setNewSlotStart("");
    setNewSlotEnd("");
    setMessage("");
  };

  const handleRemoveSlot = (dateKey: string, slotIndex: number) => {
    setAvailability((prev) => {
      const existing = prev[dateKey] || [];
      const updated = existing.filter((_, i) => i !== slotIndex);
      return {
        ...prev,
        [dateKey]: updated,
      };
    });
    setMessage("");
  };

  const handleSave = async () => {
    setSaving(true);
    setMessage("");

    try {
      const res = await fetch("/api/astrologer/availability", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ availability }),
      });

      if (!res.ok) {
        throw new Error("Failed to save availability");
      }

      setMessage("Availability saved successfully!");
    } catch (err: any) {
      setMessage(err.message || "An error occurred");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div className="flex items-center gap-2"><Loader2 className="w-5 h-5 animate-spin" /> Loading your schedule...</div>;
  }

  const currentSlots = availability[selectedDate] || [];

  return (
    <div className="space-y-6">
      {message && (
        <div className={`p-4 rounded-xl text-sm ${message.includes("success") ? "bg-green-50 text-green-700 border border-green-200" : "bg-red-50 text-red-700 border border-red-200"}`}>
          {message}
        </div>
      )}

      <div className="flex flex-col lg:flex-row gap-8">
        {/* Left Side: 7 Days Calendar List */}
        <div className="w-full lg:w-1/3 space-y-3">
          <h3 className="font-bold font-heading text-lg flex items-center gap-2">
            <Calendar className="w-5 h-5 text-bhagva" />
            Next 7 Days
          </h3>
          <div className="flex flex-col gap-2">
            {next7Days.map((day) => {
              const isActive = selectedDate === day.key;
              const slotsCount = (availability[day.key] || []).length;
              return (
                <button
                  key={day.key}
                  onClick={() => {
                    setSelectedDate(day.key);
                    setMessage("");
                  }}
                  className={`flex items-center justify-between p-4 rounded-xl transition-all border text-left ${
                    isActive 
                      ? "bg-bhagva text-white shadow-md border-bhagva" 
                      : "bg-white text-ink border-ink/10 hover:border-bhagva/40"
                  }`}
                >
                  <span className="font-medium">{day.label}</span>
                  <span className={`text-xs px-2 py-1 rounded-full ${isActive ? "bg-white/20" : "bg-cream-tint text-bhagva font-semibold"}`}>
                    {slotsCount} slots
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Right Side: Slots Manager for Selected Day */}
        <div className="w-full lg:w-2/3 bg-white border border-ink/10 rounded-2xl p-6">
          <h3 className="font-bold font-heading text-xl mb-1 text-ink">
            Slots for {next7Days.find(d => d.key === selectedDate)?.label}
          </h3>
          <p className="text-sm text-ink-muted mb-6">Set the specific times you are available for consultation.</p>
          
          <div className="bg-cream/40 p-4 rounded-xl mb-6 flex flex-col sm:flex-row items-end gap-3 border border-ink/5">
            <div className="w-full">
              <label className="block text-xs font-semibold text-ink mb-1">Start Time</label>
              <input 
                type="time" 
                value={newSlotStart}
                onChange={(e) => setNewSlotStart(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl border border-ink/10 bg-white text-sm focus:ring-2 focus:ring-bhagva/20 outline-none" 
              />
            </div>
            <div className="w-full">
              <label className="block text-xs font-semibold text-ink mb-1">End Time</label>
              <input 
                type="time" 
                value={newSlotEnd}
                onChange={(e) => setNewSlotEnd(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl border border-ink/10 bg-white text-sm focus:ring-2 focus:ring-bhagva/20 outline-none" 
              />
            </div>
            <button 
              type="button"
              onClick={handleAddSlot}
              className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-bhagva text-white font-bold text-sm shadow-md hover:bg-bhagva/90 transition-colors flex items-center justify-center gap-2"
            >
              <Plus className="w-4 h-4" /> Add
            </button>
          </div>

          <div className="space-y-2">
            {currentSlots.length === 0 ? (
              <div className="text-center py-8 text-ink-muted flex flex-col items-center">
                <Clock className="w-10 h-10 mb-2 opacity-20" />
                <p>No slots added for this day.</p>
                <p className="text-xs mt-1">You will appear as unavailable.</p>
              </div>
            ) : (
              currentSlots.map((slot, index) => (
                <div key={index} className="flex items-center justify-between p-3 px-4 bg-white border border-ink/10 rounded-xl hover:border-bhagva/30 transition-colors">
                  <span className="font-medium text-ink flex items-center gap-2">
                    <Clock className="w-4 h-4 text-bhagva" /> {slot}
                  </span>
                  <button 
                    onClick={() => handleRemoveSlot(selectedDate, index)}
                    className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      <div className="pt-4 flex justify-end">
        <button 
          onClick={handleSave} 
          disabled={saving} 
          className="w-full md:w-auto px-10 py-3 rounded-xl bg-night text-white font-bold text-sm shadow-md hover:bg-night/90 transition-colors flex items-center justify-center gap-2"
        >
          {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
          {saving ? "Saving..." : "Save All Availability"}
        </button>
      </div>
    </div>
  );
}
