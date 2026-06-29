"use client";

import { useState, useEffect, useCallback } from "react";
import { Loader2, Check, X, Trash2, Search, User } from "lucide-react";
import { formatDistanceToNow } from "date-fns";

type Pandit = {
  id: string;
  userId: string;
  displayName: string | null;
  profileImage: string | null;
  verificationStatus: string;
  status: string;
  createdAt: string;
  user: {
    name: string;
    email: string;
  };
};

export default function AdminPanditsPage() {
  const [pandits, setPandits] = useState<Pandit[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  const fetchPandits = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/pandits");
      if (res.ok) {
        setPandits(await res.json());
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPandits();
  }, [fetchPandits]);

  const handleAction = async (id: string, action: "approve" | "reject" | "delete") => {
    if (action === "delete" && !confirm("Are you sure you want to delete this pandit permanently?")) return;
    
    setActionLoading(id);
    try {
      const res = await fetch(`/api/admin/pandits/${id}`, {
        method: action === "delete" ? "DELETE" : "POST",
        headers: { "Content-Type": "application/json" },
        body: action === "delete" ? undefined : JSON.stringify({ action }),
      });
      if (res.ok) {
        fetchPandits();
      } else {
        alert("Failed to perform action");
      }
    } catch (err) {
      console.error(err);
    } finally {
      setActionLoading(null);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-3xl font-heading font-bold text-ink">Manage Pandits</h1>
          <p className="text-ink-muted mt-1">Approve, reject, or delete astrologer profiles.</p>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-ink/10 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-ink/5 text-ink-muted uppercase text-xs font-semibold">
              <tr>
                <th className="px-6 py-4">Pandit</th>
                <th className="px-6 py-4">Email</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4">Joined</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-ink/5">
              {loading ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center">
                    <Loader2 className="w-8 h-8 animate-spin text-bhagva mx-auto" />
                  </td>
                </tr>
              ) : pandits.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-ink-muted">
                    No pandits found.
                  </td>
                </tr>
              ) : (
                pandits.map((p) => (
                  <tr key={p.id} className="hover:bg-ink/5 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-cream-tint flex items-center justify-center overflow-hidden shrink-0">
                          {p.profileImage ? (
                            <img src={p.profileImage} alt="" className="w-full h-full object-cover" />
                          ) : (
                            <User className="w-5 h-5 text-ink/40" />
                          )}
                        </div>
                        <div className="font-semibold text-ink">{p.displayName || p.user.name}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-ink-muted">{p.user.email}</td>
                    <td className="px-6 py-4">
                      <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${
                        p.verificationStatus === "APPROVED" ? "bg-green-100 text-green-700" :
                        p.verificationStatus === "PENDING" ? "bg-yellow-100 text-yellow-700" :
                        "bg-red-100 text-red-700"
                      }`}>
                        {p.verificationStatus}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-ink-muted">
                      {formatDistanceToNow(new Date(p.createdAt), { addSuffix: true })}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-end gap-2">
                        {p.verificationStatus === "PENDING" && (
                          <>
                            <button
                              onClick={() => handleAction(p.id, "approve")}
                              disabled={actionLoading === p.id}
                              className="p-2 bg-green-100 text-green-700 rounded-lg hover:bg-green-200 transition-colors"
                              title="Approve"
                            >
                              <Check className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleAction(p.id, "reject")}
                              disabled={actionLoading === p.id}
                              className="p-2 bg-yellow-100 text-yellow-700 rounded-lg hover:bg-yellow-200 transition-colors"
                              title="Reject"
                            >
                              <X className="w-4 h-4" />
                            </button>
                          </>
                        )}
                        <button
                          onClick={() => handleAction(p.id, "delete")}
                          disabled={actionLoading === p.id}
                          className="p-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors"
                          title="Delete"
                        >
                          {actionLoading === p.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
