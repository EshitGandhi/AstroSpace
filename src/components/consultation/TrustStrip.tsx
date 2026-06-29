"use client";

import { ShieldCheck, Lock, Users, Zap } from "lucide-react";

export default function TrustStrip() {
  const items = [
    { icon: ShieldCheck, text: "Verified Experts" },
    { icon: Lock, text: "Secure Payments" },
    { icon: Users, text: "Private Consultations" },
    { icon: Zap, text: "Instant Chat & Video" },
  ];

  return (
    <div className="w-full bg-white border-y border-ink/5 py-4">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-8">
          {items.map((item, idx) => (
            <div key={idx} className="flex items-center justify-center gap-2 text-ink/70">
              <item.icon className="w-5 h-5 text-green-500" />
              <span className="text-sm font-bold">{item.text}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
