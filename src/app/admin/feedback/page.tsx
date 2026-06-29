"use client";

import { useState, useEffect, useCallback } from "react";
import { Loader2, MessageSquare, Trash2, Mail } from "lucide-react";
import { formatDistanceToNow } from "date-fns";

type Feedback = {
  id: string;
  name: string;
  email: string | null;
  role: string;
  feedback: string;
  category: string;
  currentPage: string | null;
  status: string;
  createdAt: string;
};

export default function AdminFeedbackPage() {
  const [feedbacks, setFeedbacks] = useState<Feedback[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchFeedback = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/feedback");
      if (res.ok) setFeedbacks(await res.json());
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchFeedback();
  }, [fetchFeedback]);

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this feedback?")) return;
    try {
      const res = await fetch(`/api/admin/feedback/${id}`, { method: "DELETE" });
      if (res.ok) fetchFeedback();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="space-y-6">
      <div className="mb-6">
        <h1 className="text-3xl font-heading font-bold text-ink">User Feedback</h1>
        <p className="text-ink-muted mt-1">Review feedback submitted by users and pandits.</p>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-ink/10 overflow-hidden">
        {loading ? (
          <div className="py-12 flex justify-center">
            <Loader2 className="w-8 h-8 animate-spin text-bhagva" />
          </div>
        ) : feedbacks.length === 0 ? (
          <div className="py-12 text-center text-ink-muted">
            <MessageSquare className="w-12 h-12 text-ink/20 mx-auto mb-4" />
            No feedback entries found.
          </div>
        ) : (
          <div className="divide-y divide-ink/5">
            {feedbacks.map(f => (
              <div key={f.id} className="p-6 hover:bg-ink/5 transition-colors group relative">
                <button
                  onClick={() => handleDelete(f.id)}
                  className="absolute top-6 right-6 p-2 text-ink-muted hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors opacity-0 group-hover:opacity-100"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
                <div className="flex items-start justify-between mb-2 pr-12">
                  <div>
                    <h3 className="font-bold text-ink">{f.name}</h3>
                    <div className="flex items-center gap-3 text-sm text-ink-muted mt-1">
                      <span className="font-medium px-2 py-0.5 bg-ink/5 rounded-full">{f.role}</span>
                      {f.email && (
                        <span className="flex items-center gap-1">
                          <Mail className="w-3.5 h-3.5" />
                          {f.email}
                        </span>
                      )}
                      <span>•</span>
                      <span>{formatDistanceToNow(new Date(f.createdAt), { addSuffix: true })}</span>
                    </div>
                  </div>
                </div>
                <div className="mt-3 text-ink leading-relaxed whitespace-pre-wrap">{f.feedback}</div>
                {f.currentPage && (
                  <div className="mt-3 text-xs text-ink-muted">
                    Submitted from page: <span className="font-mono bg-ink/5 px-1 py-0.5 rounded">{f.currentPage}</span>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
