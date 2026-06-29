"use client";

import { useState } from "react";
import { MessageSquare, X, Loader2, Send } from "lucide-react";
import { usePathname } from "next/navigation";
import { toast } from "react-hot-toast";

export default function FeedbackModal() {
  const [isOpen, setIsOpen] = useState(false);
  const [feedback, setFeedback] = useState("");
  const [category, setCategory] = useState("General");
  const [loading, setLoading] = useState(false);
  const pathname = usePathname();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!feedback.trim()) return;
    setLoading(true);
    
    try {
      const res = await fetch("/api/feedback", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ feedback, category, currentPage: pathname })
      });
      
      if (res.ok) {
        toast.success("Feedback submitted successfully. Thank you!");
        setFeedback("");
        setIsOpen(false);
      } else {
        toast.error("Failed to submit feedback.");
      }
    } catch (err) {
      toast.error("An error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {/* Inline Feedback Button */}
      <button
        onClick={() => setIsOpen(true)}
        className="w-full flex items-center justify-center gap-2 bg-bhagva/20 hover:bg-bhagva text-bhagva hover:text-white border border-bhagva transition-all px-6 py-3 rounded-2xl font-bold tracking-wide shadow-[0_0_15px_rgba(255,107,0,0.3)] hover:shadow-[0_0_25px_rgba(255,107,0,0.6)]"
      >
        <MessageSquare className="w-5 h-5" />
        Give Us Feedback
      </button>

      {/* Modal */}
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 p-4">
          <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl overflow-hidden relative">
            <div className="flex items-center justify-between p-5 border-b border-ink/10 bg-cream">
              <h2 className="font-bold text-lg text-ink flex items-center gap-2">
                <MessageSquare className="w-5 h-5 text-bhagva" />
                Submit Feedback
              </h2>
              <button onClick={() => setIsOpen(false)} className="text-ink-muted hover:text-ink transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="p-5 space-y-4">
              <div>
                <label className="block text-sm font-semibold text-ink mb-1">Category</label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full border border-ink/20 rounded-xl px-4 py-2.5 bg-white text-sm"
                >
                  <option value="General">General</option>
                  <option value="Bug Report">Bug Report</option>
                  <option value="Feature Request">Feature Request</option>
                  <option value="Consultation Issue">Consultation Issue</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold text-ink mb-1">Your Feedback</label>
                <textarea
                  required
                  value={feedback}
                  onChange={(e) => setFeedback(e.target.value)}
                  placeholder="Tell us what you think or report an issue..."
                  className="w-full border border-ink/20 rounded-xl px-4 py-2.5 text-sm h-32 resize-none"
                />
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={loading || !feedback.trim()}
                  className="w-full flex items-center justify-center gap-2 bg-bhagva hover:bg-orange-600 text-white font-bold py-2.5 rounded-xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-4 h-4" />}
                  Submit Feedback
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
