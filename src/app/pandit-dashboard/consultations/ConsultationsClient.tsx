"use client";

import { useState, useEffect, useCallback } from "react";
import { MessageSquare, Phone, Video, Check, X, Clock, Loader2, User } from "lucide-react";
import { formatDistanceToNow } from "date-fns";

type Consultation = {
  id: string;
  mode: string;
  status: string;
  isInstant: boolean;
  description?: string;
  scheduledTime?: string;
  expiresAt?: string;
  createdAt: string;
  startedAt?: string;
  totalMinutes: number;
  totalCost: number;
  pricePerMinute: number;
  user: { id: string; name: string; email: string };
  pandit: { id: string; displayName: string; profileImage?: string };
};

const TABS = [
  { key: "PENDING", label: "Pending" },
  { key: "ACCEPTED,WAITING", label: "Upcoming" },
  { key: "ONGOING", label: "Active" },
  { key: "COMPLETED", label: "Completed" },
  { key: "CANCELLED,REJECTED,EXPIRED,MISSED,TIMED_OUT", label: "Cancelled" },
];

const modeIcon = (mode: string) => {
  switch (mode) {
    case "CHAT": return <MessageSquare className="w-4 h-4" />;
    case "VOICE": return <Phone className="w-4 h-4" />;
    case "VIDEO": return <Video className="w-4 h-4" />;
    default: return null;
  }
};

const modeBadgeColor = (mode: string) => {
  switch (mode) {
    case "CHAT": return "bg-blue-100 text-blue-700";
    case "VOICE": return "bg-green-100 text-green-700";
    case "VIDEO": return "bg-purple-100 text-purple-700";
    default: return "bg-ink/5 text-ink";
  }
};

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

export default function PanditConsultationsPage() {
  const [activeTab, setActiveTab] = useState("PENDING");
  const [consultations, setConsultations] = useState<Consultation[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  const fetchConsultations = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/consultation/list?role=pandit&status=${activeTab}`);
      if (res.ok) {
        const data = await res.json();
        setConsultations(data);
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

  // Auto-refresh pending tab every 10 seconds
  useEffect(() => {
    if (activeTab !== "PENDING") return;
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
    } catch (err) {
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
          Consultations
        </h1>
        <p className="text-ink-muted mt-2">
          Manage your consultation requests, active sessions, and history.
        </p>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-white rounded-2xl p-1.5 shadow-sm border border-ink/5 overflow-x-auto">
        {TABS.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`px-4 py-2.5 rounded-xl text-sm font-bold transition-all whitespace-nowrap ${
              activeTab === tab.key
                ? "bg-bhagva text-white shadow-sm"
                : "text-ink/60 hover:text-ink hover:bg-ink/5"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Content */}
      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-8 h-8 animate-spin text-bhagva" />
        </div>
      ) : consultations.length === 0 ? (
        <div className="bg-white rounded-2xl p-12 text-center border border-ink/5 shadow-sm">
          <div className="w-16 h-16 bg-cream rounded-full flex items-center justify-center mx-auto mb-4">
            <MessageSquare className="w-8 h-8 text-bhagva/40" />
          </div>
          <h3 className="text-lg font-bold text-ink mb-1">No consultations here</h3>
          <p className="text-ink-muted text-sm">
            {activeTab === "PENDING" ? "No pending requests at the moment." : "Nothing to show in this tab yet."}
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {consultations.map((c) => (
            <div key={c.id} className="bg-white rounded-2xl p-5 border border-ink/5 shadow-sm hover:shadow-md transition-shadow">
              <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                {/* User Info */}
                <div className="flex items-center gap-3 flex-1 min-w-0">
                  <div className="w-12 h-12 rounded-full bg-cream-tint flex items-center justify-center text-bhagva font-bold text-lg flex-shrink-0">
                    {c.user.name?.[0]?.toUpperCase() || <User className="w-5 h-5" />}
                  </div>
                  <div className="min-w-0">
                    <h4 className="font-bold text-ink truncate">{c.user.name}</h4>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-bold ${modeBadgeColor(c.mode)}`}>
                        {modeIcon(c.mode)} {c.mode}
                      </span>
                      <span className="text-xs text-ink/50">
                        {formatDistanceToNow(new Date(c.createdAt), { addSuffix: true })}
                      </span>
                    </div>
                    {c.description && (
                      <p className="text-xs text-ink/60 mt-1 truncate max-w-xs">{c.description}</p>
                    )}
                  </div>
                </div>

                {/* Price & Timer */}
                <div className="flex items-center gap-4 flex-shrink-0">
                  <div className="text-right">
                    <div className="text-sm font-bold text-ink">₹{(c.pricePerMinute / 100).toFixed(0)}/min</div>
                    {c.status === "PENDING" && c.expiresAt && (
                      <div className="flex items-center gap-1 mt-0.5">
                        <Clock className="w-3 h-3 text-ink/40" />
                        <CountdownTimer expiresAt={c.expiresAt} />
                      </div>
                    )}
                    {c.status === "COMPLETED" && (
                      <div className="text-xs text-ink/50">{c.totalMinutes} min · ₹{(c.totalCost / 100).toFixed(0)}</div>
                    )}
                  </div>

                  {/* Actions */}
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
                    <a
                      href={`/consult/session/${c.id}`}
                      className="px-4 py-2 bg-bhagva text-white rounded-xl text-sm font-bold hover:bg-bhagva/90 transition-colors"
                    >
                      {c.status === "ONGOING" ? "Join Session" : "Open"}
                    </a>
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
