"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import dynamic from "next/dynamic";
import {
  MessageSquare, Phone, Video, Send, Wallet, Clock, PhoneOff,
  Loader2, User
} from "lucide-react";
import toast from "react-hot-toast";

const StreamChatPanel = dynamic(() => import("@/components/consultation/StreamChatPanel"), {
  ssr: false,
  loading: () => (
    <div className="flex-1 flex items-center justify-center">
      <Loader2 className="w-8 h-8 animate-spin text-bhagva" />
    </div>
  ),
});

const StreamCallPanel = dynamic(() => import("@/components/consultation/StreamCallPanel"), {
  ssr: false,
  loading: () => (
    <div className="flex-1 flex items-center justify-center">
      <Loader2 className="w-8 h-8 animate-spin text-bhagva" />
    </div>
  ),
});

type SessionData = {
  id: string;
  mode: string;
  status: string;
  startedAt?: string;
  streamChannelId?: string | null;
  streamCallId?: string | null;
  pricePerMinute: number;
  totalMinutes: number;
  totalCost: number;
  pandit: { displayName: string; profileImage?: string; userId: string };
  user: { name: string; id: string };
};

type Message = {
  id: string;
  messageText: string;
  senderId: string;
  sender?: { id: string; name: string };
  createdAt: string;
};

export default function ConsultSessionPage({ params }: { params: { consultationId: string } }) {
  const { data: session } = useSession();
  const router = useRouter();
  const [sessionData, setSessionData] = useState<SessionData | null>(null);
  const [loading, setLoading] = useState(true);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [walletBalance, setWalletBalance] = useState(0);
  const [ending, setEnding] = useState(false);
  const [useFallbackChat, setUseFallbackChat] = useState(false);
  const [typingTriggered, setTypingTriggered] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const billingRef = useRef<NodeJS.Timeout | null>(null);

  const isPandit = session?.user?.id === sessionData?.pandit.userId;
  const otherName = isPandit ? sessionData?.user.name : sessionData?.pandit.displayName;

  const defaultConsultationsPath =
    session?.user?.role === "ASTROLOGER"
      ? "/pandit-dashboard/consultations"
      : "/dashboard/consultations";

  const consultationsPath = sessionData
    ? isPandit
      ? "/pandit-dashboard/consultations"
      : "/dashboard/consultations"
    : defaultConsultationsPath;

  const fetchSession = useCallback(async () => {
    try {
      const res = await fetch(`/api/consultation/${params.consultationId}`);
      if (res.ok) {
        const data = await res.json();
        setSessionData(data);
      } else {
        toast.error("Session not found");
        router.push(defaultConsultationsPath);
      }
    } catch {
      toast.error("Failed to load session");
    } finally {
      setLoading(false);
    }
  }, [params.consultationId, router, defaultConsultationsPath]);

  const fetchMessages = useCallback(async () => {
    try {
      const res = await fetch(`/api/consultation/${params.consultationId}/message`);
      if (res.ok) {
        setMessages(await res.json());
      }
    } catch {
      // silent
    }
  }, [params.consultationId]);

  const fetchBalance = async () => {
    try {
      const res = await fetch("/api/wallet/balance");
      if (res.ok) {
        const data = await res.json();
        setWalletBalance(data.balanceRupees || 0);
      }
    } catch {
      // silent
    }
  };

  useEffect(() => {
    fetchSession();
    fetchBalance();
    fetchMessages();
  }, [fetchSession, fetchMessages]);

  useEffect(() => {
    if (sessionData?.mode !== "CHAT" || sessionData.status !== "ONGOING") return;
    const interval = setInterval(fetchMessages, 5000);
    return () => clearInterval(interval);
  }, [sessionData?.mode, sessionData?.status, fetchMessages]);

  useEffect(() => {
    if (!sessionData?.startedAt || sessionData.status !== "ONGOING") return;

    const startTime = new Date(sessionData.startedAt).getTime();
    const update = () => setElapsedSeconds(Math.floor((Date.now() - startTime) / 1000));
    update();
    timerRef.current = setInterval(update, 1000);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [sessionData?.startedAt, sessionData?.status]);

  const handleEndSession = useCallback(async () => {
    setEnding(true);
    try {
      await fetch(`/api/consultation/${params.consultationId}/end`, { method: "POST" });
      toast.success("Session ended");
      router.push(consultationsPath);
    } catch {
      toast.error("Failed to end session");
    } finally {
      setEnding(false);
    }
  }, [params.consultationId, router, consultationsPath]);

  useEffect(() => {
    if (sessionData?.status !== "ONGOING") return;

    billingRef.current = setInterval(async () => {
      try {
        const res = await fetch(`/api/consultation/${params.consultationId}/tick`, { method: "POST" });
        if (res.ok) {
          const data = await res.json();
          if (data.shouldEnd) {
            toast.error("Session ended — insufficient balance");
            handleEndSession();
          } else if (data.lowBalance) {
            toast("Low balance! Recharge to continue.", { icon: "💳" });
          }
          fetchBalance();
        }
      } catch {
        // silent
      }
    }, 60000);

    return () => {
      if (billingRef.current) clearInterval(billingRef.current);
    };
  }, [sessionData?.status, params.consultationId, handleEndSession]);

  const handlePanditJoinCall = async () => {
    try {
      const res = await fetch(`/api/consultation/${params.consultationId}/join`, { method: "POST" });
      if (res.ok) {
        await fetchSession();
        fetchBalance();
      } else {
        const data = await res.json();
        toast.error(data.error || "Failed to start call");
      }
    } catch {
      toast.error("Failed to join call");
    }
  };

  const handlePanditTyping = async () => {
    if (typingTriggered) return;
    setTypingTriggered(true);
    try {
      const res = await fetch(`/api/consultation/${params.consultationId}/typing`, { method: "POST" });
      if (res.ok) {
        const data = await res.json();
        if (data.started) {
          await fetchSession();
          fetchBalance();
        }
      }
    } catch {
      setTypingTriggered(false);
    }
  };

  const handleFallbackInputChange = (value: string) => {
    setNewMessage(value);
    if (isPandit && value.trim() && !typingTriggered) {
      handlePanditTyping();
    }
  };

  const handleSendMessage = async () => {
    if (!newMessage.trim()) return;
    try {
      const res = await fetch(`/api/consultation/${params.consultationId}/message`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messageText: newMessage.trim() }),
      });
      if (res.ok) {
        setNewMessage("");
        await fetchMessages();
        await fetchSession();
        fetchBalance();
        setTimeout(() => messagesEndRef.current?.scrollIntoView({ behavior: "smooth" }), 100);
      } else {
        const data = await res.json();
        toast.error(data.error || "Failed to send message");
      }
    } catch {
      toast.error("Failed to send message");
    }
  };

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
  };

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  if (loading) {
    return (
      <div className="h-[100dvh] flex items-center justify-center bg-cream">
        <Loader2 className="w-10 h-10 animate-spin text-bhagva" />
      </div>
    );
  }

  if (!sessionData || !session?.user) return null;

  const isCompleted = sessionData.status === "COMPLETED";
  const waitingToStart = ["WAITING", "ACCEPTED"].includes(sessionData.status);

  return (
    <div className="h-[100dvh] overflow-hidden bg-cream flex flex-col">
      <div className="bg-white border-b border-ink/10 px-4 py-3 flex items-center justify-between z-50 shadow-sm shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-cream-tint flex items-center justify-center overflow-hidden shrink-0">
            {sessionData.pandit.profileImage ? (
              <img src={sessionData.pandit.profileImage} alt="" className="w-full h-full object-cover" />
            ) : (
              <User className="w-5 h-5 text-bhagva" />
            )}
          </div>
          <div className="min-w-0">
            <h3 className="font-bold text-ink text-sm truncate">{otherName}</h3>
            <div className="flex items-center gap-2 text-xs text-ink/50 whitespace-nowrap">
              {sessionData.mode === "CHAT" && <MessageSquare className="w-3 h-3" />}
              {sessionData.mode === "VOICE" && <Phone className="w-3 h-3" />}
              {sessionData.mode === "VIDEO" && <Video className="w-3 h-3" />}
              <span>{sessionData.mode} Session</span>
              {sessionData.status === "ONGOING" && (
                <span className="ml-1 w-2 h-2 bg-green-500 rounded-full animate-pulse shrink-0" />
              )}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-4 shrink-0">
          <div className="flex items-center gap-1.5 bg-cream-tint px-3 py-1.5 rounded-full">
            <Clock className="w-4 h-4 text-bhagva shrink-0" />
            <span className="font-mono font-bold text-sm text-ink">{formatTime(elapsedSeconds)}</span>
          </div>
          <div className="hidden sm:flex items-center gap-1.5 bg-cream-tint px-3 py-1.5 rounded-full">
            <Wallet className="w-4 h-4 text-green-600 shrink-0" />
            <span className="font-bold text-sm text-ink">₹{walletBalance.toFixed(0)}</span>
          </div>
          {!isCompleted && (
            <button
              onClick={handleEndSession}
              disabled={ending || sessionData.status !== "ONGOING"}
              className="flex items-center gap-1.5 px-4 py-2 bg-red-500 text-white rounded-xl font-bold text-sm hover:bg-red-600 transition-colors disabled:opacity-50 shrink-0"
            >
              {ending ? <Loader2 className="w-4 h-4 animate-spin shrink-0" /> : <PhoneOff className="w-4 h-4 shrink-0" />}
              <span className="hidden sm:inline">End</span>
            </button>
          )}
        </div>
      </div>

      {waitingToStart && (
        <div className="bg-yellow-50 border-b border-yellow-200 px-4 py-3 text-center text-sm text-yellow-800 shrink-0">
          {isPandit
            ? sessionData.mode === "CHAT"
              ? "Start typing to begin billing and the session."
              : "Join the call to start billing."
            : "Waiting for pandit to join — you have 3 minutes after acceptance."}
        </div>
      )}

      {isCompleted ? (
        <div className="flex-1 overflow-y-auto flex items-center justify-center p-8">
          <div className="text-center max-w-md">
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <MessageSquare className="w-10 h-10 text-green-600" />
            </div>
            <h2 className="text-2xl font-bold font-heading text-ink mb-2">Session Completed</h2>
            <p className="text-ink-muted mb-6">
              Duration: {sessionData.totalMinutes} min · Total: ₹{(sessionData.totalCost / 100).toFixed(0)}
            </p>
            <button
              onClick={() => router.push(consultationsPath)}
              className="px-6 py-3 bg-bhagva text-white rounded-xl font-bold hover:bg-bhagva/90 transition-colors"
            >
              Back to My Consultations
            </button>
          </div>
        </div>
      ) : sessionData.mode === "CHAT" ? (
        <div className="flex-1 flex flex-col min-h-0 bg-white">
          {process.env.NEXT_PUBLIC_STREAM_API_KEY && !useFallbackChat ? (
            <StreamChatPanel
              consultationId={sessionData.id}
              streamChannelId={sessionData.streamChannelId || null}
              userId={session.user.id}
              userName={session.user.name}
              isPandit={isPandit}
              onPanditTyping={isPandit ? handlePanditTyping : undefined}
              onSessionStarted={fetchSession}
            />
          ) : (
            <>
              <div className="flex-1 overflow-y-auto p-4 space-y-3">
                {messages.map((msg) => {
                  const isMe = msg.senderId === session.user.id;
                  return (
                    <div key={msg.id} className={`flex ${isMe ? "justify-end" : "justify-start"}`}>
                      <div className={`max-w-[75%] px-4 py-2.5 rounded-2xl text-sm ${
                        isMe ? "bg-bhagva text-white rounded-br-md" : "bg-cream text-ink border border-ink/10 rounded-bl-md"
                      }`}>
                        {msg.messageText}
                      </div>
                    </div>
                  );
                })}
                <div ref={messagesEndRef} className="h-1" />
              </div>
              <div className="bg-white border-t border-ink/10 p-4 shrink-0">
                <div className="max-w-3xl mx-auto flex gap-3">
                  <input
                    type="text"
                    value={newMessage}
                    onChange={(e) => handleFallbackInputChange(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handleSendMessage()}
                    placeholder="Type a message..."
                    className="flex-1 px-4 py-3 rounded-xl border border-ink/10 bg-cream focus:border-bhagva outline-none text-sm"
                  />
                  <button
                    onClick={handleSendMessage}
                    disabled={!newMessage.trim()}
                    className="px-4 py-3 bg-bhagva text-white rounded-xl hover:bg-bhagva/90 transition-colors disabled:opacity-50 shrink-0"
                  >
                    <Send className="w-5 h-5" />
                  </button>
                </div>
              </div>
            </>
          )}
          {process.env.NEXT_PUBLIC_STREAM_API_KEY && (
            <button
              onClick={() => setUseFallbackChat(true)}
              className="text-xs text-center py-2 text-ink/40 hover:text-ink/60 bg-white shrink-0"
            >
              Switch to fallback messaging
            </button>
          )}
        </div>
      ) : (
        <div className="flex-1 flex flex-col min-h-0 bg-white">
          <StreamCallPanel
            consultationId={sessionData.id}
            streamCallId={sessionData.streamCallId || null}
            mode={sessionData.mode as "VOICE" | "VIDEO"}
            userId={session.user.id}
            userName={session.user.name}
            isPandit={isPandit}
            onPanditJoined={isPandit ? handlePanditJoinCall : undefined}
            otherName={otherName}
            otherImage={sessionData.pandit.profileImage}
          />
        </div>
      )}
    </div>
  );
}
