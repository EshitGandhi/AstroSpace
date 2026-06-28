"use client";

import { useEffect, useState, useRef } from "react";
import { StreamChat, type Channel, type Event } from "stream-chat";
import { Loader2, Send } from "lucide-react";

type StreamChatPanelProps = {
  consultationId: string;
  streamChannelId: string | null;
  userId: string;
  userName: string;
  onPanditFirstMessage?: () => void;
  isPandit?: boolean;
};

type ChatMessage = {
  id: string;
  text: string;
  userId: string;
  createdAt: Date;
};

export default function StreamChatPanel({
  consultationId,
  streamChannelId,
  userId,
  userName,
  onPanditFirstMessage,
  isPandit,
}: StreamChatPanelProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [sending, setSending] = useState(false);
  const channelRef = useRef<Channel | null>(null);
  const clientRef = useRef<StreamChat | null>(null);
  const panditStartedRef = useRef(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let mounted = true;

    async function init() {
      try {
        const res = await fetch("/api/stream/token", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ name: userName }),
        });

        if (!res.ok) {
          if (mounted) setError("Stream chat unavailable");
          return;
        }

        const { token, apiKey } = await res.json();
        const client = StreamChat.getInstance(apiKey);
        await client.connectUser({ id: userId, name: userName }, token);
        clientRef.current = client;

        const channelId = streamChannelId || `consultation_${consultationId}`;
        const channel = client.channel("messaging", channelId);
        await channel.watch();
        channelRef.current = channel;

        const existing = channel.state.messages.map((m) => ({
          id: m.id,
          text: m.text || "",
          userId: m.user?.id || "",
          createdAt: new Date(m.created_at || Date.now()),
        }));
        if (mounted) setMessages(existing);

        channel.on("message.new", (event: Event) => {
          const msg = event.message;
          if (!msg?.id) return;
          setMessages((prev) => {
            if (prev.some((p) => p.id === msg.id)) return prev;
            return [
              ...prev,
              {
                id: msg.id,
                text: msg.text || "",
                userId: msg.user?.id || "",
                createdAt: new Date(msg.created_at || Date.now()),
              },
            ];
          });
        });
      } catch {
        if (mounted) setError("Failed to connect to chat");
      } finally {
        if (mounted) setLoading(false);
      }
    }

    init();

    return () => {
      mounted = false;
      channelRef.current = null;
      clientRef.current?.disconnectUser().catch(() => undefined);
    };
  }, [consultationId, streamChannelId, userId, userName]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = async () => {
    if (!newMessage.trim() || !channelRef.current) return;
    setSending(true);
    try {
      if (isPandit && !panditStartedRef.current && onPanditFirstMessage) {
        panditStartedRef.current = true;
        await onPanditFirstMessage();
      }

      await channelRef.current.sendMessage({ text: newMessage.trim() });

      await fetch(`/api/consultation/${consultationId}/message`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messageText: newMessage.trim() }),
      });

      setNewMessage("");
    } catch {
      setError("Failed to send message");
    } finally {
      setSending(false);
    }
  };

  if (error) {
    return (
      <div className="flex-1 flex items-center justify-center p-8 text-sm text-ink/60">
        {error}
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-bhagva" />
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col min-h-0">
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {messages.map((msg) => {
          const isMe = msg.userId === userId;
          return (
            <div key={msg.id} className={`flex ${isMe ? "justify-end" : "justify-start"}`}>
              <div
                className={`max-w-[75%] px-4 py-2.5 rounded-2xl text-sm ${
                  isMe
                    ? "bg-bhagva text-white rounded-br-md"
                    : "bg-white text-ink border border-ink/10 rounded-bl-md"
                }`}
              >
                {msg.text}
              </div>
            </div>
          );
        })}
        <div ref={messagesEndRef} />
      </div>
      <div className="bg-white border-t border-ink/10 p-4">
        <div className="max-w-3xl mx-auto flex gap-3">
          <input
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSend()}
            placeholder="Type a message..."
            className="flex-1 px-4 py-3 rounded-xl border border-ink/10 bg-cream focus:border-bhagva outline-none text-sm"
          />
          <button
            onClick={handleSend}
            disabled={!newMessage.trim() || sending}
            className="px-4 py-3 bg-bhagva text-white rounded-xl hover:bg-bhagva/90 transition-colors disabled:opacity-50"
          >
            {sending ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5" />}
          </button>
        </div>
      </div>
    </div>
  );
}
