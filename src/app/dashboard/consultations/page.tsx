"use client";

import { useState, useEffect, useCallback } from "react";
import { MessageSquare, Phone, Video, Loader2, Star } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import Link from "next/link";
import { toast } from "react-hot-toast";
import ReviewModal from "@/components/consultation/ReviewModal";

type Consultation = {
  id: string;
  mode: string;
  status: string;
  isInstant: boolean;
  description?: string;
  scheduledTime?: string;
  joinExpiresAt?: string;
  createdAt: string;
  startedAt?: string;
  endedAt?: string;
  totalMinutes: number;
  totalCost: number;
  pricePerMinute: number;
  pandit: { id: string; displayName: string; profileImage?: string };
};

const TABS = [
  { key: "PENDING,ACCEPTED,WAITING", label: "Upcoming" },
  { key: "ONGOING", label: "Active" },
  { key: "COMPLETED", label: "Completed" },
  { key: "CANCELLED,REJECTED,EXPIRED,MISSED,TIMED_OUT", label: "Cancelled" },
];

const statusBadge = (status: string) => {
  const map: Record<string, string> = {
    PENDING: "bg-yellow-100 text-yellow-700",
    ACCEPTED: "bg-blue-100 text-blue-700",
    WAITING: "bg-blue-100 text-blue-700",
    ONGOING: "bg-green-100 text-green-700",
    COMPLETED: "bg-green-100 text-green-700",
    CANCELLED: "bg-red-100 text-red-700",
    REJECTED: "bg-red-100 text-red-700",
    EXPIRED: "bg-ink/10 text-ink/60",
    MISSED: "bg-orange-100 text-orange-700",
    TIMED_OUT: "bg-ink/10 text-ink/60",
  };
  return map[status] || "bg-ink/5 text-ink";
};

const modeIcon = (mode: string) => {
  switch (mode) {
    case "CHAT": return <MessageSquare className="w-4 h-4" />;
    case "VOICE": return <Phone className="w-4 h-4" />;
    case "VIDEO": return <Video className="w-4 h-4" />;
    default: return null;
  }
};

function JoinCountdown({ expiresAt }: { expiresAt: string }) {
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
    <span className={`font-mono text-xs font-bold ${timeLeft === "Expired" ? "text-red-500" : "text-bhagva"}`}>
      Join in {timeLeft}
    </span>
  );
}

function joinLabel(mode: string, status: string) {
  if (status === "ONGOING") {
    if (mode === "CHAT") return "Open Chat";
    if (mode === "VOICE") return "Join Voice";
    if (mode === "VIDEO") return "Join Video";
  }
  if (mode === "CHAT") return "Open Chat";
  if (mode === "VOICE") return "Join Voice";
  if (mode === "VIDEO") return "Join Video";
  return "Join";
}

export default function UserConsultationsPage() {
  const [activeTab, setActiveTab] = useState("PENDING,ACCEPTED,WAITING");
  const [reviewTarget, setReviewTarget] = useState<{
    panditId: string;
    panditName: string;
    consultationId: string;
  } | null>(null);
  const [allConsultations, setAllConsultations] = useState<Consultation[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchConsultations = useCallback(async (isInitial = false) => {
    if (isInitial) setLoading(true);
    try {
      const res = await fetch(`/api/consultation/list?role=user`);
      if (res.ok) {
        const data = await res.json();
        setAllConsultations((prev) => {
          if (prev.length > 0) {
            data.forEach((c: Consultation) => {
              const old = prev.find(p => p.id === c.id);
              if (old) {
                if (old.status !== "WAITING" && c.status === "WAITING") {
                  toast.success(`Pandit has joined! Please join the session.`);
                }
                if (old.status !== "ONGOING" && c.status === "ONGOING") {
                  toast.success(`Session started!`);
                  setActiveTab("ONGOING");
                }
              }
            });
          }
          return data;
        });
      }
    } catch (err) {
      console.error("Failed to fetch:", err);
    } finally {
      if (isInitial) setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchConsultations(true);
    const interval = setInterval(() => fetchConsultations(false), 5000);
    return () => clearInterval(interval);
  }, [fetchConsultations]);

  const currentTabKeys = activeTab.split(",");
  const displayedConsultations = allConsultations.filter(c => currentTabKeys.includes(c.status));

  const getTabCount = (keyStr: string) => {
    const keys = keyStr.split(",");
    return allConsultations.filter(c => keys.includes(c.status)).length;
  };

  return (
    <div className="bg-cream min-h-screen py-24 px-6 max-w-5xl mx-auto">
      <div className="mb-8">
        <h1 className="text-4xl font-heading font-bold text-ink flex items-center gap-3">
          <MessageSquare className="w-9 h-9 text-bhagva" /> Chat Menu
        </h1>
        <p className="text-ink-muted mt-2">Your consultation requests, active sessions, and history.</p>
      </div>

      <div className="flex gap-1 bg-white rounded-2xl p-1.5 shadow-sm border border-ink/5 overflow-x-auto mb-8">
        {TABS.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`px-4 py-2.5 rounded-xl text-sm font-bold transition-all whitespace-nowrap flex items-center gap-2 ${
              activeTab === tab.key
                ? "bg-bhagva text-white shadow-sm"
                : "text-ink/60 hover:text-ink hover:bg-ink/5"
            }`}
          >
            {tab.label}
            {tab.key !== "COMPLETED" && tab.key !== "CANCELLED,REJECTED,EXPIRED,MISSED,TIMED_OUT" && getTabCount(tab.key) > 0 && (
              <span className={`px-1.5 py-0.5 rounded-full text-xs ${activeTab === tab.key ? "bg-white/20 text-white" : "bg-ink/10 text-ink"}`}>
                {getTabCount(tab.key)}
              </span>
            )}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-8 h-8 animate-spin text-bhagva" />
        </div>
      ) : displayedConsultations.length === 0 ? (
        <div className="bg-white rounded-2xl p-12 text-center border border-ink/5">
          <MessageSquare className="w-12 h-12 text-bhagva/30 mx-auto mb-4" />
          <h3 className="text-lg font-bold text-ink mb-2">No consultations here</h3>
          <p className="text-ink-muted text-sm mb-6">Browse our experts and start a consultation.</p>
          <Link href="/consult" className="px-6 py-3 bg-bhagva text-white rounded-xl font-bold text-sm hover:bg-bhagva/90 transition-colors">
            Browse Experts
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {displayedConsultations.map((c) => (
            <div key={c.id} className="bg-white rounded-2xl p-5 border border-ink/5 shadow-sm hover:shadow-md transition-shadow">
              <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                <div className="flex items-center gap-3 flex-1 min-w-0">
                  <div className="w-12 h-12 rounded-full bg-cream-tint flex items-center justify-center overflow-hidden flex-shrink-0">
                    {c.pandit.profileImage ? (
                      <img src={c.pandit.profileImage} alt="" className="w-full h-full object-cover" />
                    ) : (
                      <span className="text-bhagva font-bold text-lg">{(c.pandit.displayName || "P")[0]}</span>
                    )}
                  </div>
                  <div className="min-w-0">
                    <h4 className="font-bold text-ink truncate">{c.pandit.displayName || "Pandit Ji"}</h4>
                    <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                      <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-bold ${statusBadge(c.status)}`}>
                        {c.status.replace("_", " ")}
                      </span>
                      <span className="inline-flex items-center gap-1 text-xs text-ink/50">
                        {modeIcon(c.mode)} {c.mode}
                      </span>
                      <span className="text-xs text-ink/40">
                        {formatDistanceToNow(new Date(c.createdAt), { addSuffix: true })}
                      </span>
                      {(c.status === "WAITING" || c.status === "ACCEPTED") && c.joinExpiresAt && (
                        <JoinCountdown expiresAt={c.joinExpiresAt} />
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-3 flex-shrink-0">
                  {c.status === "COMPLETED" && (
                    <div className="text-right">
                      <div className="text-sm font-bold text-ink">{c.totalMinutes} min</div>
                      <div className="text-xs text-ink/50">₹{(c.totalCost / 100).toFixed(0)}</div>
                    </div>
                  )}

                  {(c.status === "ACCEPTED" || c.status === "WAITING" || c.status === "ONGOING") && (
                    <Link
                      href={`/consult/session/${c.id}`}
                      className="px-4 py-2 bg-bhagva text-white rounded-xl text-sm font-bold hover:bg-bhagva/90 transition-colors flex items-center gap-1.5"
                    >
                      {modeIcon(c.mode)}
                      {joinLabel(c.mode, c.status)}
                    </Link>
                  )}

                  {c.status === "COMPLETED" && (
                    <button
                      onClick={() =>
                        setReviewTarget({
                          panditId: c.pandit.id,
                          panditName: c.pandit.displayName || "Pandit",
                          consultationId: c.id,
                        })
                      }
                      className="px-4 py-2 bg-yellow-100 text-yellow-700 rounded-xl text-sm font-bold hover:bg-yellow-200 transition-colors flex items-center gap-1.5"
                    >
                      <Star className="w-4 h-4" /> Review
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {reviewTarget && (
        <ReviewModal
          panditId={reviewTarget.panditId}
          panditName={reviewTarget.panditName}
          consultationId={reviewTarget.consultationId}
          onClose={() => setReviewTarget(null)}
          onSubmitted={fetchConsultations}
        />
      )}
    </div>
  );
}
