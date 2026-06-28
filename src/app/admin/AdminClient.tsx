"use client";

import { useState } from "react";
import { Shield, Users, MessageSquare, Check, X, Loader2 } from "lucide-react";
import toast from "react-hot-toast";

type Consultation = {
  id: string;
  mode: string;
  status: string;
  totalCost: number;
  totalMinutes: number;
  createdAt: string;
  user: { name: string; email: string };
  pandit: { displayName: string | null };
};

type PendingPandit = {
  id: string;
  displayName: string | null;
  user: { name: string; email: string };
};

export default function AdminClient({
  consultations,
  pendingPandits,
  stats,
}: {
  consultations: Consultation[];
  pendingPandits: PendingPandit[];
  stats: { status: string; count: number }[];
}) {
  const [loading, setLoading] = useState<string | null>(null);

  const handlePanditAction = async (profileId: string, action: "approve" | "reject") => {
    setLoading(profileId);
    try {
      const res = await fetch("/api/admin/pandit-verification", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ profileId, action }),
      });
      if (res.ok) {
        toast.success(`Pandit ${action}d`);
        window.location.reload();
      } else {
        toast.error("Action failed");
      }
    } catch {
      toast.error("Network error");
    } finally {
      setLoading(null);
    }
  };

  const handleForceEnd = async (consultationId: string) => {
    setLoading(consultationId);
    try {
      const res = await fetch(`/api/admin/consultation/${consultationId}/force-end`, {
        method: "POST",
      });
      if (res.ok) {
        toast.success("Session ended");
        window.location.reload();
      } else {
        toast.error("Failed to end session");
      }
    } catch {
      toast.error("Network error");
    } finally {
      setLoading(null);
    }
  };

  return (
    <div className="bg-cream min-h-screen py-24 px-6 max-w-6xl mx-auto">
      <h1 className="text-4xl font-heading font-bold text-ink flex items-center gap-3 mb-8">
        <Shield className="w-9 h-9 text-bhagva" /> Admin Dashboard
      </h1>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10">
        {stats.map((s) => (
          <div key={s.status} className="bg-white rounded-2xl p-4 border border-ink/5 shadow-sm">
            <div className="text-2xl font-black text-bhagva">{s.count}</div>
            <div className="text-xs font-bold text-ink/60 uppercase">{s.status}</div>
          </div>
        ))}
      </div>

      {pendingPandits.length > 0 && (
        <section className="mb-10">
          <h2 className="text-xl font-bold text-ink flex items-center gap-2 mb-4">
            <Users className="w-5 h-5 text-bhagva" /> Pending Pandit Verifications
          </h2>
          <div className="space-y-3">
            {pendingPandits.map((p) => (
              <div key={p.id} className="bg-white rounded-2xl p-4 border border-ink/5 flex items-center justify-between">
                <div>
                  <div className="font-bold text-ink">{p.displayName || p.user.name}</div>
                  <div className="text-xs text-ink/50">{p.user.email}</div>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => handlePanditAction(p.id, "approve")}
                    disabled={loading === p.id}
                    className="p-2 bg-green-100 text-green-700 rounded-xl hover:bg-green-200"
                  >
                    {loading === p.id ? <Loader2 className="w-5 h-5 animate-spin" /> : <Check className="w-5 h-5" />}
                  </button>
                  <button
                    onClick={() => handlePanditAction(p.id, "reject")}
                    disabled={loading === p.id}
                    className="p-2 bg-red-100 text-red-700 rounded-xl hover:bg-red-200"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      <section>
        <h2 className="text-xl font-bold text-ink flex items-center gap-2 mb-4">
          <MessageSquare className="w-5 h-5 text-bhagva" /> Recent Consultations
        </h2>
        <div className="bg-white rounded-2xl border border-ink/5 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-cream-tint text-left">
                <tr>
                  <th className="px-4 py-3 font-bold">User</th>
                  <th className="px-4 py-3 font-bold">Pandit</th>
                  <th className="px-4 py-3 font-bold">Mode</th>
                  <th className="px-4 py-3 font-bold">Status</th>
                  <th className="px-4 py-3 font-bold">Amount</th>
                  <th className="px-4 py-3 font-bold">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-ink/5">
                {consultations.map((c) => (
                  <tr key={c.id} className="hover:bg-cream/50">
                    <td className="px-4 py-3">{c.user.name}</td>
                    <td className="px-4 py-3">{c.pandit.displayName || "—"}</td>
                    <td className="px-4 py-3">{c.mode}</td>
                    <td className="px-4 py-3">
                      <span className="px-2 py-0.5 rounded-full bg-ink/5 text-xs font-bold">{c.status}</span>
                    </td>
                    <td className="px-4 py-3">₹{(c.totalCost / 100).toFixed(0)}</td>
                    <td className="px-4 py-3">
                      {c.status === "ONGOING" && (
                        <button
                          onClick={() => handleForceEnd(c.id)}
                          disabled={loading === c.id}
                          className="text-xs text-red-600 font-bold hover:underline"
                        >
                          Force End
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>
    </div>
  );
}
