"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Bell, Zap } from "lucide-react";

type PendingRequest = {
  id: string;
  mode: string;
  isInstant: boolean;
  user: { name: string };
};

export default function PanditPendingAlert() {
  const [requests, setRequests] = useState<PendingRequest[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPending = async () => {
      try {
        const res = await fetch("/api/consultation/list?role=pandit&status=PENDING&isInstant=true");
        if (res.ok) {
          setRequests(await res.json());
        }
      } catch {
        // silent
      } finally {
        setLoading(false);
      }
    };
    fetchPending();
    const interval = setInterval(fetchPending, 15000);
    return () => clearInterval(interval);
  }, []);

  if (loading || requests.length === 0) return null;

  const latest = requests[0];

  return (
    <div className="bg-gradient-to-r from-bhagva/10 to-orange-50 border border-bhagva/30 rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center gap-4">
      <div className="flex items-center gap-3 flex-1">
        <div className="w-10 h-10 bg-bhagva rounded-full flex items-center justify-center flex-shrink-0 animate-pulse">
          <Bell className="w-5 h-5 text-white" />
        </div>
        <div>
          <p className="font-bold text-ink flex items-center gap-1.5">
            <Zap className="w-4 h-4 text-bhagva" />
            {requests.length} Chat Now {requests.length === 1 ? "request" : "requests"} waiting
          </p>
          <p className="text-sm text-ink/60">
            {latest.user.name} wants to {latest.mode.toLowerCase()} — respond within 3 minutes
          </p>
        </div>
      </div>
      <Link
        href="/pandit-dashboard/consultations"
        className="px-5 py-2.5 bg-bhagva text-white rounded-xl font-bold text-sm hover:bg-bhagva/90 transition-colors text-center whitespace-nowrap"
      >
        View Requests
      </Link>
    </div>
  );
}
