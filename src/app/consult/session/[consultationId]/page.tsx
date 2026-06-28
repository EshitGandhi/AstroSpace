"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import {
  MessageSquare, Phone, Video, Send, Wallet, Clock, PhoneOff,
  Loader2, User, Mic, MicOff, Camera, CameraOff
} from "lucide-react";
import toast from "react-hot-toast";

type SessionData = {
  id: string;
  mode: string;
  status: string;
  startedAt?: string;
  pricePerMinute: number;
  totalMinutes: number;
  totalCost: number;
  pandit: { displayName: string; profileImage?: string; userId: string };
  user: { name: string; id: string };
};

export default function ConsultSessionPage({ params }: { params: { consultationId: string } }) {
  const { data: session } = useSession();
  const router = useRouter();
  const [sessionData, setSessionData] = useState<SessionData | null>(null);
  const [loading, setLoading] = useState(true);
  const [messages, setMessages] = useState<{ id: string; text: string; sender: string; time: Date }[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [walletBalance, setWalletBalance] = useState(0);
  const [ending, setEnding] = useState(false);
  const [muted, setMuted] = useState(false);
  const [cameraOff, setCameraOff] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const billingRef = useRef<NodeJS.Timeout | null>(null);

  const isPandit = session?.user?.id === sessionData?.pandit.userId;
  const otherName = isPandit ? sessionData?.user.name : sessionData?.pandit.displayName;

  const fetchSession = useCallback(async () => {
    try {
      const res = await fetch(`/api/consultation/${params.consultationId}`);
      if (res.ok) {
        const data = await res.json();
        setSessionData(data);
        
        // Auto-start if ACCEPTED
        if (data.status === "ACCEPTED") {
          await fetch(`/api/consultation/${params.consultationId}/start`, { method: "POST" });
          // Refetch after starting
          const res2 = await fetch(`/api/consultation/${params.consultationId}`);
          if (res2.ok) setSessionData(await res2.json());
        }
      } else {
        toast.error("Session not found");
        router.push("/dashboard/consultations");
      }
    } catch {
      toast.error("Failed to load session");
    } finally {
      setLoading(false);
    }
  }, [params.consultationId, router]);

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
  }, [fetchSession]);

  // Timer
  useEffect(() => {
    if (!sessionData?.startedAt || sessionData.status !== "ONGOING") return;
    
    const startTime = new Date(sessionData.startedAt).getTime();
    
    const update = () => {
      setElapsedSeconds(Math.floor((Date.now() - startTime) / 1000));
    };
    update();
    timerRef.current = setInterval(update, 1000);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [sessionData?.startedAt, sessionData?.status]);

  // Billing tick every 60 seconds
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
            toast("⚠️ Low balance! Recharge to continue.", { icon: "💳" });
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
  }, [sessionData?.status, params.consultationId]);

  const handleEndSession = async () => {
    setEnding(true);
    try {
      await fetch(`/api/consultation/${params.consultationId}/end`, { method: "POST" });
      toast.success("Session ended");
      router.push("/dashboard/consultations");
    } catch {
      toast.error("Failed to end session");
    } finally {
      setEnding(false);
    }
  };

  const handleSendMessage = () => {
    if (!newMessage.trim()) return;
    setMessages((prev) => [
      ...prev,
      { id: Date.now().toString(), text: newMessage, sender: session?.user?.id || "", time: new Date() },
    ]);
    setNewMessage("");
    setTimeout(() => messagesEndRef.current?.scrollIntoView({ behavior: "smooth" }), 100);
  };

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-cream">
        <Loader2 className="w-10 h-10 animate-spin text-bhagva" />
      </div>
    );
  }

  if (!sessionData) return null;

  const isCompleted = sessionData.status === "COMPLETED";

  return (
    <div className="min-h-screen bg-cream flex flex-col">
      {/* Top Bar */}
      <div className="bg-white border-b border-ink/10 px-4 py-3 flex items-center justify-between sticky top-0 z-50 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-cream-tint flex items-center justify-center overflow-hidden">
            {sessionData.pandit.profileImage ? (
              <img src={sessionData.pandit.profileImage} alt="" className="w-full h-full object-cover" />
            ) : (
              <User className="w-5 h-5 text-bhagva" />
            )}
          </div>
          <div>
            <h3 className="font-bold text-ink text-sm">{otherName}</h3>
            <div className="flex items-center gap-2 text-xs text-ink/50">
              {sessionData.mode === "CHAT" && <MessageSquare className="w-3 h-3" />}
              {sessionData.mode === "VOICE" && <Phone className="w-3 h-3" />}
              {sessionData.mode === "VIDEO" && <Video className="w-3 h-3" />}
              <span>{sessionData.mode} Session</span>
              {sessionData.status === "ONGOING" && (
                <span className="ml-1 w-2 h-2 bg-green-500 rounded-full animate-pulse" />
              )}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-4">
          {/* Timer */}
          <div className="flex items-center gap-1.5 bg-cream-tint px-3 py-1.5 rounded-full">
            <Clock className="w-4 h-4 text-bhagva" />
            <span className="font-mono font-bold text-sm text-ink">{formatTime(elapsedSeconds)}</span>
          </div>

          {/* Wallet */}
          <div className="hidden sm:flex items-center gap-1.5 bg-cream-tint px-3 py-1.5 rounded-full">
            <Wallet className="w-4 h-4 text-green-600" />
            <span className="font-bold text-sm text-ink">₹{walletBalance.toFixed(0)}</span>
          </div>

          {/* End */}
          {!isCompleted && (
            <button
              onClick={handleEndSession}
              disabled={ending}
              className="flex items-center gap-1.5 px-4 py-2 bg-red-500 text-white rounded-xl font-bold text-sm hover:bg-red-600 transition-colors"
            >
              {ending ? <Loader2 className="w-4 h-4 animate-spin" /> : <PhoneOff className="w-4 h-4" />}
              End
            </button>
          )}
        </div>
      </div>

      {/* Session Content */}
      {isCompleted ? (
        <div className="flex-1 flex items-center justify-center p-8">
          <div className="text-center max-w-md">
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <MessageSquare className="w-10 h-10 text-green-600" />
            </div>
            <h2 className="text-2xl font-bold font-heading text-ink mb-2">Session Completed</h2>
            <p className="text-ink-muted mb-6">
              Duration: {sessionData.totalMinutes} min · Total: ₹{(sessionData.totalCost / 100).toFixed(0)}
            </p>
            <button
              onClick={() => router.push("/dashboard/consultations")}
              className="px-6 py-3 bg-bhagva text-white rounded-xl font-bold hover:bg-bhagva/90 transition-colors"
            >
              Back to My Consultations
            </button>
          </div>
        </div>
      ) : sessionData.mode === "CHAT" ? (
        /* Chat Mode */
        <div className="flex-1 flex flex-col">
          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {/* GetStream placeholder message */}
            <div className="text-center py-8">
              <div className="inline-flex items-center gap-2 bg-yellow-50 text-yellow-700 px-4 py-2 rounded-full text-sm font-semibold">
                <MessageSquare className="w-4 h-4" />
                Chat powered by GetStream — Connect your API keys to enable real-time messaging
              </div>
            </div>

            {messages.map((msg) => {
              const isMe = msg.sender === session?.user?.id;
              return (
                <div key={msg.id} className={`flex ${isMe ? "justify-end" : "justify-start"}`}>
                  <div className={`max-w-[75%] px-4 py-2.5 rounded-2xl text-sm ${
                    isMe ? "bg-bhagva text-white rounded-br-md" : "bg-white text-ink border border-ink/10 rounded-bl-md"
                  }`}>
                    {msg.text}
                  </div>
                </div>
              );
            })}
            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <div className="bg-white border-t border-ink/10 p-4">
            <div className="max-w-3xl mx-auto flex gap-3">
              <input
                type="text"
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSendMessage()}
                placeholder="Type a message..."
                className="flex-1 px-4 py-3 rounded-xl border border-ink/10 bg-cream focus:border-bhagva outline-none text-sm"
              />
              <button
                onClick={handleSendMessage}
                disabled={!newMessage.trim()}
                className="px-4 py-3 bg-bhagva text-white rounded-xl hover:bg-bhagva/90 transition-colors disabled:opacity-50"
              >
                <Send className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      ) : (
        /* Voice / Video Mode */
        <div className="flex-1 flex flex-col items-center justify-center p-8">
          <div className="text-center mb-12">
            {sessionData.mode === "VIDEO" && !cameraOff ? (
              <div className="w-64 h-48 bg-ink rounded-3xl flex items-center justify-center mb-6 mx-auto shadow-xl">
                <div className="text-center text-white/60">
                  <Video className="w-12 h-12 mx-auto mb-2" />
                  <p className="text-sm">GetStream Video — Connect API keys</p>
                </div>
              </div>
            ) : (
              <div className="w-32 h-32 bg-cream-tint rounded-full flex items-center justify-center mx-auto mb-6 shadow-xl">
                {sessionData.pandit.profileImage ? (
                  <img src={sessionData.pandit.profileImage} alt="" className="w-full h-full object-cover rounded-full" />
                ) : (
                  <User className="w-16 h-16 text-bhagva/50" />
                )}
              </div>
            )}
            <h3 className="text-2xl font-bold text-ink mb-1">{otherName}</h3>
            <p className="text-ink/50 font-mono text-lg">{formatTime(elapsedSeconds)}</p>
          </div>

          {/* Call Controls */}
          <div className="flex items-center gap-4">
            <button
              onClick={() => setMuted(!muted)}
              className={`w-14 h-14 rounded-full flex items-center justify-center transition-all ${
                muted ? "bg-red-100 text-red-600" : "bg-ink/10 text-ink hover:bg-ink/20"
              }`}
            >
              {muted ? <MicOff className="w-6 h-6" /> : <Mic className="w-6 h-6" />}
            </button>

            <button
              onClick={handleEndSession}
              disabled={ending}
              className="w-16 h-16 bg-red-500 text-white rounded-full flex items-center justify-center hover:bg-red-600 transition-all shadow-lg"
            >
              {ending ? <Loader2 className="w-7 h-7 animate-spin" /> : <PhoneOff className="w-7 h-7" />}
            </button>

            {sessionData.mode === "VIDEO" && (
              <button
                onClick={() => setCameraOff(!cameraOff)}
                className={`w-14 h-14 rounded-full flex items-center justify-center transition-all ${
                  cameraOff ? "bg-red-100 text-red-600" : "bg-ink/10 text-ink hover:bg-ink/20"
                }`}
              >
                {cameraOff ? <CameraOff className="w-6 h-6" /> : <Camera className="w-6 h-6" />}
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
