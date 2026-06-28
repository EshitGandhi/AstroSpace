"use client";

import { useState } from "react";
import { Star, X, Loader2 } from "lucide-react";
import toast from "react-hot-toast";

type ReviewModalProps = {
  panditId: string;
  panditName: string;
  consultationId?: string;
  onClose: () => void;
  onSubmitted?: () => void;
};

export default function ReviewModal({
  panditId,
  panditName,
  consultationId,
  onClose,
  onSubmitted,
}: ReviewModalProps) {
  const [rating, setRating] = useState(8);
  const [comment, setComment] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async () => {
    setSubmitting(true);
    try {
      const res = await fetch("/api/reviews", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ panditId, rating, comment, consultationId }),
      });
      if (res.ok) {
        toast.success("Review submitted!");
        onSubmitted?.();
        onClose();
      } else {
        const data = await res.json();
        toast.error(data.error || "Failed to submit review");
      }
    } catch {
      toast.error("Network error");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="bg-white rounded-3xl shadow-2xl max-w-md w-full p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold font-heading text-ink">Rate {panditName}</h2>
          <button onClick={onClose} className="p-2 hover:bg-ink/5 rounded-xl">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex items-center justify-center gap-2 mb-4">
          {Array.from({ length: 10 }, (_, i) => i + 1).map((n) => (
            <button
              key={n}
              onClick={() => setRating(n)}
              className={`p-1 ${n <= rating ? "text-yellow-500" : "text-ink/20"}`}
            >
              <Star className={`w-5 h-5 ${n <= rating ? "fill-yellow-500" : ""}`} />
            </button>
          ))}
        </div>
        <p className="text-center text-sm font-bold text-ink mb-4">{rating}/10</p>

        <textarea
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          placeholder="Share your experience (optional)"
          className="w-full px-4 py-3 rounded-xl border border-ink/10 bg-cream focus:border-bhagva outline-none text-sm resize-none h-24 mb-4"
        />

        <button
          onClick={handleSubmit}
          disabled={submitting}
          className="w-full py-3 bg-bhagva text-white rounded-xl font-bold hover:bg-bhagva/90 disabled:opacity-50 flex items-center justify-center gap-2"
        >
          {submitting ? <Loader2 className="w-5 h-5 animate-spin" /> : "Submit Review"}
        </button>
      </div>
    </div>
  );
}
