"use client";

import { useState, useEffect } from "react";
import { MessageCircle, Phone, Video, Calendar, Wallet, Loader2, X, AlertTriangle } from "lucide-react";
import { useSession } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import toast from "react-hot-toast";

type ConsultMode = "CHAT" | "VOICE" | "VIDEO";

export default function ClientActions({ pandit }: { pandit: any }) {
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedMode, setSelectedMode] = useState<ConsultMode | null>(null);
  const [isInstant, setIsInstant] = useState(true);
  const [scheduledDate, setScheduledDate] = useState("");
  const [scheduledTime, setScheduledTime] = useState("");
  const [description, setDescription] = useState("");
  const [walletBalance, setWalletBalance] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const [loadingBalance, setLoadingBalance] = useState(false);

  const { data: session } = useSession();
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    if (searchParams.get("schedule") === "true") {
      setIsInstant(false);
      setModalOpen(true);
    }
  }, [searchParams]);

  const fetchBalance = async () => {
    if (!session?.user) return;
    setLoadingBalance(true);
    try {
      const res = await fetch("/api/wallet/balance");
      if (res.ok) {
        const data = await res.json();
        setWalletBalance(data.balanceRupees || 0);
      }
    } catch {
      // silent
    } finally {
      setLoadingBalance(false);
    }
  };

  useEffect(() => {
    if (modalOpen) fetchBalance();
  }, [modalOpen, session]);

  const handleOpenModal = (mode: ConsultMode, instant: boolean) => {
    if (!session?.user) {
      router.push("/sign-in?callbackUrl=/consult/" + pandit.id);
      return;
    }
    if (instant && !pandit.isOnline) {
      toast.error("Pandit is currently unavailable for instant consultation.");
      return;
    }
    setSelectedMode(mode);
    setIsInstant(instant);
    setModalOpen(true);
  };

  const getPricePerMinute = (mode: ConsultMode): number => {
    switch (mode) {
      case "CHAT": return pandit.chatPrice || 15;
      case "VOICE": return pandit.callPrice || 25;
      case "VIDEO": return pandit.videoCallPrice || 35;
    }
  };

  const getMinimumBalance = (mode: ConsultMode): number => getPricePerMinute(mode);

  const hasSufficientBalance = (mode: ConsultMode | null): boolean => {
    if (!mode) return false;
    return walletBalance >= getMinimumBalance(mode);
  };

  const handleSubmit = async () => {
    if (!selectedMode) return;

    const minRequired = getMinimumBalance(selectedMode);
    if (walletBalance < minRequired) {
      toast.error(`Minimum ₹${minRequired} balance required for ${selectedMode.toLowerCase()} (1 min). Please recharge.`);
      return;
    }

    if (!isInstant && (!scheduledDate || !scheduledTime)) {
      toast.error("Please select date and time for scheduling.");
      return;
    }

    setSubmitting(true);
    try {
      const body: any = {
        panditId: pandit.id,
        mode: selectedMode,
        isInstant,
        description: description || undefined,
      };

      if (!isInstant) {
        body.scheduledTime = new Date(`${scheduledDate}T${scheduledTime}:00`).toISOString();
      }

      const res = await fetch("/api/consultation/request", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      if (res.ok) {
        toast.success(isInstant ? "Request sent! Waiting for pandit to accept..." : "Consultation scheduled successfully!");
        setModalOpen(false);
        router.push(`/dashboard/consultations`);
      } else {
        const data = await res.json();
        toast.error(data.error || "Failed to create request");
      }
    } catch {
      toast.error("Network error. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  const modeOptions = [
    { mode: "CHAT" as ConsultMode, icon: MessageCircle, label: "Chat", price: pandit.chatPrice || 15, enabled: pandit.supportsChat },
    { mode: "VOICE" as ConsultMode, icon: Phone, label: "Voice", price: pandit.callPrice || 25, enabled: pandit.supportsVoice },
    { mode: "VIDEO" as ConsultMode, icon: Video, label: "Video", price: pandit.videoCallPrice || 35, enabled: pandit.supportsVideo },
  ];

  return (
    <>
      {/* Sticky Bottom Action Bar */}
      <div className="fixed bottom-0 left-0 lg:left-[300px] right-0 bg-white border-t border-ink/10 p-4 z-50 shadow-[0_-10px_40px_rgba(0,0,0,0.05)]">
        <div className="max-w-4xl mx-auto flex gap-3 overflow-x-auto hide-scrollbar">
          <button
            onClick={() => handleOpenModal("CHAT", true)}
            disabled={!pandit.isOnline}
            className="flex-1 min-w-[120px] flex items-center justify-center gap-2 py-3.5 rounded-xl bg-bhagva text-white font-bold shadow-md hover:bg-bhagva/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <MessageCircle className="w-5 h-5" /> Chat Now
          </button>
          {pandit.supportsVoice && (
            <button
              onClick={() => handleOpenModal("VOICE", true)}
              disabled={!pandit.isOnline}
              className="flex-1 min-w-[120px] flex items-center justify-center gap-2 py-3.5 rounded-xl bg-green-600 text-white font-bold shadow-md hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Phone className="w-5 h-5" /> Voice Call
            </button>
          )}
          {pandit.supportsVideo && (
            <button
              onClick={() => handleOpenModal("VIDEO", true)}
              disabled={!pandit.isOnline}
              className="flex-1 min-w-[120px] flex items-center justify-center gap-2 py-3.5 rounded-xl bg-purple-600 text-white font-bold shadow-md hover:bg-purple-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Video className="w-5 h-5" /> Video Call
            </button>
          )}
          <button
            onClick={() => {
              if (!session?.user) {
                router.push("/sign-in?callbackUrl=/consult/" + pandit.id);
                return;
              }
              setIsInstant(false);
              setModalOpen(true);
            }}
            className="flex-1 min-w-[160px] flex items-center justify-center gap-2 py-3.5 rounded-xl bg-white border-2 border-bhagva text-bhagva font-bold hover:bg-bhagva/5 transition-colors"
          >
            <Calendar className="w-5 h-5" /> Schedule
          </button>
        </div>
      </div>

      {/* Consultation Request Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-white rounded-3xl shadow-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-ink/5">
              <h2 className="text-xl font-bold font-heading text-ink">
                {isInstant ? "Start Consultation" : "Schedule Consultation"}
              </h2>
              <button onClick={() => setModalOpen(false)} className="p-2 hover:bg-ink/5 rounded-xl transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-6">
              {/* Mode Selection */}
              <div>
                <label className="text-sm font-bold text-ink mb-3 block">Select Mode</label>
                <div className="grid grid-cols-3 gap-3">
                  {modeOptions.filter(m => m.enabled).map(({ mode, icon: Icon, label, price }) => (
                    <button
                      key={mode}
                      onClick={() => setSelectedMode(mode)}
                      className={`p-4 rounded-2xl border-2 transition-all flex flex-col items-center gap-2 ${
                        selectedMode === mode
                          ? "border-bhagva bg-bhagva/5 shadow-sm"
                          : "border-ink/10 hover:border-bhagva/30"
                      }`}
                    >
                      <Icon className={`w-6 h-6 ${selectedMode === mode ? "text-bhagva" : "text-ink/50"}`} />
                      <span className="font-bold text-sm">{label}</span>
                      <span className="text-xs text-ink/60">₹{price}/min</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Schedule Date/Time */}
              {!isInstant && (
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-bold text-ink mb-2 block">Date</label>
                    <input
                      type="date"
                      min={new Date().toISOString().split("T")[0]}
                      value={scheduledDate}
                      onChange={(e) => setScheduledDate(e.target.value)}
                      className="w-full px-4 py-3 rounded-xl border border-ink/10 bg-cream focus:border-bhagva outline-none text-sm"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-bold text-ink mb-2 block">Time</label>
                    <input
                      type="time"
                      value={scheduledTime}
                      onChange={(e) => setScheduledTime(e.target.value)}
                      className="w-full px-4 py-3 rounded-xl border border-ink/10 bg-cream focus:border-bhagva outline-none text-sm"
                    />
                  </div>
                </div>
              )}

              {/* Description */}
              <div>
                <label className="text-sm font-bold text-ink mb-2 block">Message (optional)</label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Briefly describe what you'd like to discuss..."
                  className="w-full px-4 py-3 rounded-xl border border-ink/10 bg-cream focus:border-bhagva outline-none text-sm resize-none h-20"
                />
              </div>

              {/* Wallet Info */}
              <div className="bg-cream rounded-2xl p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Wallet className="w-5 h-5 text-bhagva" />
                    <span className="font-bold text-sm text-ink">Wallet Balance</span>
                  </div>
                  <span className={`font-bold text-lg ${hasSufficientBalance(selectedMode) ? "text-green-600" : "text-red-600"}`}>
                    {loadingBalance ? <Loader2 className="w-4 h-4 animate-spin" /> : `₹${walletBalance.toFixed(2)}`}
                  </span>
                </div>
                {selectedMode && !hasSufficientBalance(selectedMode) && (
                  <div className="mt-3 flex items-center gap-2 text-red-600 text-sm">
                    <AlertTriangle className="w-4 h-4 flex-shrink-0" />
                    <span>Minimum ₹{getMinimumBalance(selectedMode)} required (1 min). <a href="/wallet" className="underline font-bold">Recharge now</a></span>
                  </div>
                )}
                {selectedMode && hasSufficientBalance(selectedMode) && (
                  <p className="mt-2 text-xs text-ink/50">
                    Est. {Math.floor(walletBalance / getPricePerMinute(selectedMode))} minutes at ₹{getPricePerMinute(selectedMode)}/min
                  </p>
                )}
              </div>
            </div>

            {/* Footer */}
            <div className="p-6 border-t border-ink/5">
              <button
                onClick={handleSubmit}
                disabled={!selectedMode || submitting || !hasSufficientBalance(selectedMode)}
                className="w-full py-4 bg-bhagva text-white rounded-2xl font-bold text-base hover:bg-bhagva/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {submitting ? (
                  <><Loader2 className="w-5 h-5 animate-spin" /> Sending Request...</>
                ) : isInstant ? (
                  "Send Request"
                ) : (
                  "Schedule Consultation"
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
