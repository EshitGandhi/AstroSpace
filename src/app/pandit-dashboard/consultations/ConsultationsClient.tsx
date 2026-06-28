"use client";

import { useState, useEffect, useCallback } from "react";
import { MessageSquare, Phone, Video, Check, X, Clock, Loader2, User, Zap, Calendar } from "lucide-react";
import Link from "next/link";
import { formatDistanceToNow } from "date-fns";

type Consultation = {
  id: string;
  mode: string;
  status: string;
  isInstant: boolean;
  description?: string;
  scheduledTime?: string;
  expiresAt?: string;
  joinExpiresAt?: string;
  createdAt: string;
  startedAt?: string;
  totalMinutes: number;
  totalCost: number;
  pricePerMinute: number;
  user: { id: string; name: string; email: string };
  pandit: { id: string; displayName: string; profileImage?: string };
};

type TabDef = { key: string; label: string; isInstant?: string };

const TABS: TabDef[] = [
  { key: "PENDING", label: "Chat Now Requests", isInstant: "true" },
  { key: "PENDING", label: "Scheduled Requests", isInstant: "false" },
  { key: "ACCEPTED,WAITING", label: "Upcoming" },
  { key: "ONGOING", label: "Active" },
  { key: "COMPLETED", label: "Completed" },
  { key: "CANCELLED,REJECTED,EXPIRED,MISSED,TIMED_OUT", label: "Cancelled" },
];

function CountdownTimer({ expiresAt }: { expiresAt: string }) {
  const [timeLeft, setTimeLeft] = useState("");

  useEffect(() => {
    const update = () => {
      const diff = new Date(expiresAt).getTime() - Date.now();
      if (diff <= 0) {
        setTimeLeft("Expired");
        return;
      }
      const mins = Math.floor(diff / 60000);
      const secs = Math.floor((diff % 60000) / 1000);
      setTimeLeft(`${String(mins).padStart(2, "0")}:${String(secs).padStart(2, "0")}`);
    };
    update();
    const interval = setInterval(update, 1000);
    return () => clearInterval(interval);
  }, [expiresAt]);

  return (
    <span className={`font-mono text-sm font-bold ${timeLeft === "Expired" ? "text-red-500" : "text-bhagva"}`}>
      {timeLeft}
    </span>
  );
}

function JoinSessionButton({ mode, status, id }: { mode: string; status: string; id: string }) {
  const config = {
    CHAT: { icon: MessageSquare, label: status === "ONGOING" ? "Open Chat" : "Open Chat", color: "bg-blue-600 hover:bg-blue-700" },
    VOICE: { icon: Phone, label: status === "ONGOING" ? "Join Voice" : "Join Voice", color: "bg-green-600 hover:bg-green-700" },
    VIDEO: { icon: Video, label: status === "ONGOING" ? "Join Video" : "Join Video", color: "bg-purple-600 hover:bg-purple-700" },
  }[mode] || { icon: MessageSquare, label: "Join Session", color: "bg-bhagva hover:bg-bhagva/90" };

  const Icon = config.icon;

  return (
    <Link
      href={`/consult/session/${id}`}
      className={`flex items-center gap-2 px-4 py-2.5 text-white rounded-xl text-sm font-bold transition-colors ${config.color}`}
    >
      <Icon className="w-5 h-5" />
      {config.label}
    </Link>
  );
}

export default function PanditConsultationsPage() {
  const [activeTabIndex, setActiveTabIndex] = useState(0);
  const [consultations, setConsultations] = useState<Consultation[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  const activeTab = TABS[activeTabIndex];

  const fetchConsultations = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        role: "pandit",
        status: activeTab.key,
      });
      if (activeTab.isInstant !== undefined) {
        params.set("isInstant", activeTab.isInstant);
      }
      const res = await fetch(`/api/consultation/list?${params.toString()}`);
      if (res.ok) {
        setConsultations(await res.json());
      }
    } catch (err) {
      console.error("Failed to fetch consultations:", err);
    } finally {
      setLoading(false);
    }
  }, [activeTab]);

  useEffect(() => {
    fetchConsultations();
  }, [fetchConsultations]);

  useEffect(() => {
    if (!activeTab.key.includes("PENDING")) return;
    const interval = setInterval(fetchConsultations, 10000);
    return () => clearInterval(interval);
  }, [activeTab, fetchConsultations]);

  const handleAction = async (id: string, action: "accept" | "reject") => {
    setActionLoading(id);
    try {
      const res = await fetch(`/api/consultation/${id}/${action}`, { method: "POST" });
      if (res.ok) {
        fetchConsultations();
      } else {
        const data = await res.json();
        alert(data.error || "Action failed");
      }
    } catch {
      alert("Network error");
    } finally {
      setActionLoading(null);
    }
  };

  return (
    <div className="space-y-6">
      <div className="mb-6">
        <h1 className="text-3xl font-heading font-bold text-ink flex items-center gap-3">
          <MessageSquare className="w-8 h-8 text-bhagva" />
          Bookings
        </h1>
        <p className="text-ink-muted mt-2">
          Manage Chat Now requests, scheduled bookings, and active sessions.
        </p>
      </div>

      <div className="flex gap-1 bg-white rounded-2xl p-1.5 shadow-sm border border-ink/5 overflow-x-auto">
        {TABS.map((tab, idx) => (
          <button
            key={`${tab.key}-${tab.isInstant ?? idx}`}
            onClick={() => setActiveTabIndex(idx)}
            className={`px-4 py-2.5 rounded-xl text-sm font-bold transition-all whitespace-nowrap flex items-center gap-1.5 ${
              activeTabIndex === idx
                ? "bg-bhagva text-white shadow-sm"
                : "text-ink/60 hover:text-ink hover:bg-ink/5"
            }`}
          >
            {tab.isInstant === "true" && <Zap className="w-3.5 h-3.5" />}
            {tab.isInstant === "false" && <Calendar className="w-3.5 h-3.5" />}
            {tab.label}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-8 h-8 animate-spin text-bhagva" />
        </div>
      ) : consultations.length === 0 ? (
        <div className="bg-white rounded-2xl p-12 text-center border border-ink/5 shadow-sm">
          <MessageSquare className="w-12 h-12 text-bhagva/30 mx-auto mb-4" />
          <h3 className="text-lg font-bold text-ink mb-1">No bookings here</h3>
          <p className="text-ink-muted text-sm">
            {activeTab.key === "PENDING" ? "No pending requests at the moment." : "Nothing to show in this tab yet."}
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {consultations.map((c) => (
            <div key={c.id} className="bg-white rounded-2xl p-5 border border-ink/5 shadow-sm hover:shadow-md transition-shadow">
              <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                <div className="flex items-center gap-3 flex-1 min-w-0">
                  <div className="w-12 h-12 rounded-full bg-cream-tint flex items-center justify-center text-bhagva font-bold text-lg flex-shrink-0">
                    {c.user.name?.[0]?.toUpperCase() || <User className="w-5 h-5" />}
                  </div>
                  <div className="min-w-0">
                    <h4 className="font-bold text-ink truncate">{c.user.name}</h4>
                    <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                      <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-bold ${
                        c.mode === "CHAT" ? "bg-blue-100 text-blue-700" :
                        c.mode === "VOICE" ? "bg-green-100 text-green-700" :
                        "bg-purple-100 text-purple-700"
                      }`}>
                        {c.mode === "CHAT" && <MessageSquare className="w-3 h-3" />}
                        {c.mode === "VOICE" && <Phone className="w-3 h-3" />}
                        {c.mode === "VIDEO" && <Video className="w-3 h-3" />}
                        {c.mode}
                      </span>
                      {c.isInstant ? (
                        <span className="text-xs font-bold text-bhagva flex items-center gap-0.5"><Zap className="w-3 h-3" /> Chat Now</span>
                      ) : (
                        <span className="text-xs font-bold text-ink/50 flex items-center gap-0.5"><Calendar className="w-3 h-3" /> Scheduled</span>
                      )}
                      <span className="text-xs text-ink/50">
                        {formatDistanceToNow(new Date(c.createdAt), { addSuffix: true })}
                      </span>
                    </div>
                    {c.description && (
                      <p className="text-xs text-ink/60 mt-1 line-clamp-2 max-w-md">{c.description}</p>
                    )}
                    {c.scheduledTime && !c.isInstant && (
                      <p className="text-xs text-ink/50 mt-0.5">
                        Scheduled: {new Date(c.scheduledTime).toLocaleString()}
                      </p>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-4 flex-shrink-0">
                  <div className="text-right">
                    <div className="text-sm font-bold text-ink">₹{(c.pricePerMinute / 100).toFixed(0)}/min</div>
                    {c.status === "PENDING" && c.expiresAt && (
                      <div className="flex items-center gap-1 mt-0.5 justify-end">
                        <Clock className="w-3 h-3 text-ink/40" />
                        <CountdownTimer expiresAt={c.expiresAt} />
                      </div>
                    )}
                    {(c.status === "WAITING" || c.status === "ACCEPTED") && c.joinExpiresAt && (
                      <div className="flex items-center gap-1 mt-0.5 justify-end">
                        <Clock className="w-3 h-3 text-ink/40" />
                        <span className="text-[10px] text-ink/50">Join:</span>
                        <CountdownTimer expiresAt={c.joinExpiresAt} />
                      </div>
                    )}
                    {c.status === "COMPLETED" && (
                      <div className="text-xs text-ink/50">{c.totalMinutes} min · ₹{(c.totalCost / 100).toFixed(0)}</div>
                    )}
                  </div>

                  {c.status === "PENDING" && (
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleAction(c.id, "accept")}
                        disabled={actionLoading === c.id}
                        className="p-2.5 bg-green-100 text-green-700 rounded-xl hover:bg-green-200 transition-colors disabled:opacity-50"
                        title="Accept"
                      >
                        {actionLoading === c.id ? <Loader2 className="w-5 h-5 animate-spin" /> : <Check className="w-5 h-5" />}
                      </button>
                      <button
                        onClick={() => handleAction(c.id, "reject")}
                        disabled={actionLoading === c.id}
                        className="p-2.5 bg-red-100 text-red-700 rounded-xl hover:bg-red-200 transition-colors disabled:opacity-50"
                        title="Reject"
                      >
                        <X className="w-5 h-5" />
                      </button>
                    </div>
                  )}

                  {(c.status === "ACCEPTED" || c.status === "WAITING" || c.status === "ONGOING") && (
                    <JoinSessionButton mode={c.mode} status={c.status} id={c.id} />
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
