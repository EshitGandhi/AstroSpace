"use client";

import { useState } from "react";

export default function OnlineToggle({
  profileId,
  initialOnline,
}: {
  profileId: string;
  initialOnline: boolean;
}) {
  const [isOnline, setIsOnline] = useState(initialOnline);
  const [loading, setLoading] = useState(false);

  const toggle = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/astrologer/availability/toggle", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ profileId, isOnline: !isOnline }),
      });
      if (res.ok) {
        setIsOnline(!isOnline);
      }
    } catch (err) {
      console.error("Toggle failed:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      onClick={toggle}
      disabled={loading}
      className={`flex items-center gap-2 px-4 py-2 rounded-full font-bold text-sm transition-all shadow-sm ${
        isOnline
          ? "bg-green-500 text-white hover:bg-green-600"
          : "bg-white/20 text-white hover:bg-white/30"
      } ${loading ? "opacity-50 cursor-not-allowed" : ""}`}
    >
      <div className={`w-3 h-3 rounded-full ${isOnline ? "bg-white animate-pulse" : "bg-white/50"}`} />
      {isOnline ? "🟢 Online" : "🔴 Offline"}
    </button>
  );
}
