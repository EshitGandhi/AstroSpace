"use client";

import { useState, useEffect, useCallback } from "react";
import { MessageSquare, Phone, Video, Loader2, Star, ExternalLink } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import Link from "next/link";
import ReviewModal from "@/components/consultation/ReviewModal";

type Consultation = {
  id: string;
  mode: string;
  status: string;
  isInstant: boolean;
  description?: string;
  scheduledTime?: string;
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

export default function UserConsultationsPage() {
  const [activeTab, setActiveTab] = useState("PENDING,ACCEPTED,WAITING");
  const [reviewTarget, setReviewTarget] = useState<{
    panditId: string;
    panditName: string;
    consultationId: string;
  } | null>(null);
  const [consultations, setConsultations] = useState<Consultation[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchConsultations = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/consultation/list?role=user&status=${activeTab}`);
      if (res.ok) {
        setConsultations(await res.json());
      }
    } catch (err) {
      console.error("Failed to fetch:", err);
    } finally {
      setLoading(false);
    }
  }, [activeTab]);

  useEffect(() => {
    fetchConsultations();
  }, [fetchConsultations]);

  return (
    <div className="bg-cream min-h-screen py-24 px-6 max-w-5xl mx-auto">
      <div className="mb-8">
        <h1 className="text-4xl font-heading font-bold text-ink flex items-center gap-3">
          <MessageSquare className="w-9 h-9 text-bhagva" /> My Consultations
        </h1>
        <p className="text-ink-muted mt-2">Track your consultation requests and history.</p>
      </div>

      <div className="flex gap-1 bg-white rounded-2xl p-1.5 shadow-sm border border-ink/5 overflow-x-auto mb-8">
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

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-8 h-8 animate-spin text-bhagva" />
        </div>
      ) : consultations.length === 0 ? (
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
          {consultations.map((c) => (
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
                      <ExternalLink className="w-4 h-4" /> Join
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
