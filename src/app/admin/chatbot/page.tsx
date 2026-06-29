"use client";

import { useState, useEffect, useCallback } from "react";
import { Loader2, Plus, Trash2, Bot } from "lucide-react";

type Context = {
  id: string;
  keyword: string;
  reply: string;
  isButton: boolean;
  buttonLabel: string | null;
};

export default function AdminChatbotPage() {
  const [contexts, setContexts] = useState<Context[]>([]);
  const [loading, setLoading] = useState(true);
  const [formOpen, setFormOpen] = useState(false);
  
  const [keyword, setKeyword] = useState("");
  const [reply, setReply] = useState("");
  const [isButton, setIsButton] = useState(false);
  const [buttonLabel, setButtonLabel] = useState("");

  const fetchContexts = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/chatbot");
      if (res.ok) setContexts(await res.json());
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchContexts();
  }, [fetchContexts]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!keyword || !reply) return;
    try {
      const res = await fetch("/api/admin/chatbot", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ keyword, reply, isButton, buttonLabel: isButton ? buttonLabel : null }),
      });
      if (res.ok) {
        setKeyword(""); setReply(""); setIsButton(false); setButtonLabel(""); setFormOpen(false);
        fetchContexts();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this context?")) return;
    try {
      const res = await fetch(`/api/admin/chatbot/${id}`, { method: "DELETE" });
      if (res.ok) fetchContexts();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-3xl font-heading font-bold text-ink">Chatbot Settings</h1>
          <p className="text-ink-muted mt-1">Add custom responses and shortcut buttons for the Global Chatbot.</p>
        </div>
        <button
          onClick={() => setFormOpen(!formOpen)}
          className="bg-bhagva text-white px-4 py-2 rounded-xl flex items-center gap-2 hover:bg-orange-600 transition-colors"
        >
          {formOpen ? <Loader2 className="w-4 h-4 hidden" /> : <Plus className="w-4 h-4" />}
          {formOpen ? "Cancel" : "Add Context"}
        </button>
      </div>

      {formOpen && (
        <form onSubmit={handleSubmit} className="bg-white p-6 rounded-2xl border border-ink/10 shadow-sm space-y-4">
          <div>
            <label className="block text-sm font-semibold mb-1">Trigger Keyword</label>
            <input
              type="text"
              required
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
              placeholder="e.g. contact support"
              className="w-full px-4 py-2 border border-ink/20 rounded-xl"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold mb-1">Bot Reply</label>
            <textarea
              required
              value={reply}
              onChange={(e) => setReply(e.target.value)}
              placeholder="e.g. Please call 1800-ASTRO"
              className="w-full px-4 py-2 border border-ink/20 rounded-xl"
              rows={3}
            />
          </div>
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="isButton"
              checked={isButton}
              onChange={(e) => setIsButton(e.target.checked)}
              className="w-4 h-4"
            />
            <label htmlFor="isButton" className="text-sm font-semibold">Show as Shortcut Button</label>
          </div>
          {isButton && (
            <div>
              <label className="block text-sm font-semibold mb-1">Button Label</label>
              <input
                type="text"
                required={isButton}
                value={buttonLabel}
                onChange={(e) => setButtonLabel(e.target.value)}
                placeholder="e.g. Support"
                className="w-full px-4 py-2 border border-ink/20 rounded-xl"
              />
            </div>
          )}
          <button type="submit" className="bg-bhagva text-white px-6 py-2 rounded-xl hover:bg-orange-600 transition-colors">
            Save
          </button>
        </form>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {loading ? (
          <div className="col-span-full py-12 flex justify-center">
            <Loader2 className="w-8 h-8 animate-spin text-bhagva" />
          </div>
        ) : contexts.length === 0 ? (
          <div className="col-span-full py-12 text-center text-ink-muted">
            <Bot className="w-12 h-12 text-ink/20 mx-auto mb-4" />
            No custom context added yet.
          </div>
        ) : (
          contexts.map((c) => (
            <div key={c.id} className="bg-white p-5 rounded-2xl border border-ink/10 shadow-sm relative group">
              <button
                onClick={() => handleDelete(c.id)}
                className="absolute top-4 right-4 p-2 text-ink-muted hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors opacity-0 group-hover:opacity-100"
              >
                <Trash2 className="w-4 h-4" />
              </button>
              <div className="font-semibold text-ink mb-1 flex items-center gap-2">
                Keyword: <span className="text-bhagva font-bold">&quot;{c.keyword}&quot;</span>
              </div>
              <p className="text-sm text-ink-muted mb-3 line-clamp-2">{c.reply}</p>
              {c.isButton && (
                <div className="inline-flex px-3 py-1 bg-cream border border-ink/10 text-xs font-semibold rounded-full">
                  Button: {c.buttonLabel}
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}
