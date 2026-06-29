"use client";

import { useState, useEffect } from "react";
import { MessageCircle, Phone, Video, Calendar, Wallet, Loader2, X, AlertTriangle, Check } from "lucide-react";
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
  const [walletBalance, setWalletBalance] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const [loadingBalance, setLoadingBalance] = useState(false);
  const [packages, setPackages] = useState<any[]>([]);
  const [selectedPackage, setSelectedPackage] = useState<any | null>(null);
  const [loadingPackages, setLoadingPackages] = useState(false);

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

  const fetchPackages = async () => {
    setLoadingPackages(true);
    try {
      const res = await fetch(`/api/guru/${pandit.id}/packages`);
      if (res.ok) {
        const data = await res.json();
        setPackages(data);
      }
    } catch {
      // silent
    } finally {
      setLoadingPackages(false);
    }
  };

  useEffect(() => {
    if (modalOpen) {
      fetchBalance();
      fetchPackages();
    }
  }, [modalOpen, session]);

  // Reset selected package when mode changes
  useEffect(() => {
    setSelectedPackage(null);
  }, [selectedMode]);

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

  const getMinimumBalance = (mode: ConsultMode): number => {
    if (selectedPackage) return selectedPackage.packagePrice;
    return Math.max(50, getPricePerMinute(mode) * 5); // Require at least 5 mins or ₹50 for pay-per-minute
  };

  const hasSufficientBalance = (mode: ConsultMode | null): boolean => {
    if (!mode) return false;
    const required = selectedPackage ? selectedPackage.packagePrice : getMinimumBalance(mode);
    return walletBalance >= required;
  };

  const handleSubmit = async () => {
    if (!selectedMode) return;

    const requiredBalance = getMinimumBalance(selectedMode);
    if (walletBalance < requiredBalance) {
      toast.error(`Minimum ₹${requiredBalance} balance required. Please recharge.`);
      return;
    }

    if (!isInstant && (!scheduledDate || !scheduledTime)) {
      toast.error("Please select date and time for scheduling.");
      return;
    }

    setSubmitting(true);
    try {
      const perMinute = getPricePerMinute(selectedMode);

      const body: any = {
        panditId: pandit.id,
        mode: selectedMode,
        isInstant,
        perMinutePrice: perMinute,
      };

      if (selectedPackage) {
        const original = perMinute * selectedPackage.duration;
        const discountPercentage = original > 0 
          ? Math.round(((original - selectedPackage.packagePrice) / original) * 100)
          : 0;

        body.packageId = selectedPackage.id;
        body.duration = selectedPackage.duration;
        body.originalPrice = original;
        body.discountedPrice = selectedPackage.packagePrice;
        body.discountPercentage = discountPercentage;
      }

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

              {/* Package Selection */}
              {selectedMode && (
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <label className="text-sm font-bold text-ink block">Choose Your Consultation Package</label>
                    <span className="text-xs font-semibold text-ink/50 bg-ink/5 px-2 py-1 rounded-md">Optional</span>
                  </div>
                  {loadingPackages ? (
                    <div className="flex items-center justify-center py-6">
                      <Loader2 className="w-6 h-6 animate-spin text-bhagva" />
                    </div>
                  ) : (() => {
                    const filteredPkgs = packages.filter(p => p.type === selectedMode);
                    if (filteredPkgs.length === 0) {
                      return (
                        <p className="text-sm text-ink/50 italic py-2">
                          No packages configured for this mode yet.
                        </p>
                      );
                    }

                    // Sort packages by duration
                    const sorted = [...filteredPkgs].sort((a, b) => a.duration - b.duration);

                    // Precalculate original prices and discounts
                    const packagesWithDiscounts = sorted.map(pkg => {
                      const perMinutePrice = getPricePerMinute(pkg.type);
                      const originalPrice = perMinutePrice * pkg.duration;
                      const discountPercentage = originalPrice > 0 
                        ? Math.round(((originalPrice - pkg.packagePrice) / originalPrice) * 100)
                        : 0;
                      return { ...pkg, originalPrice, discountPercentage };
                    });

                    // Find package ID with highest discount
                    let highestDiscountId = "";
                    let maxDiscount = -1;
                    packagesWithDiscounts.forEach(p => {
                      if (p.discountPercentage > maxDiscount) {
                        maxDiscount = p.discountPercentage;
                        highestDiscountId = p.id;
                      }
                    });

                    const getBadgeText = (pkg: any, index: number, total: number) => {
                      if (total < 2) return null;
                      if (total === 2) {
                        return index === 0 ? "Most Popular" : "Best Value";
                      }
                      if (pkg.id === highestDiscountId && pkg.discountPercentage > 0) return "Best Value";
                      if (index === total - 1) return "Premium";
                      if (index === Math.floor(total / 2)) return "Most Popular";
                      return null;
                    };

                    return (
                      <div className="space-y-3">
                        {packagesWithDiscounts.map((pkg, idx) => {
                          const isSelected = selectedPackage?.id === pkg.id;
                          const badge = getBadgeText(pkg, idx, packagesWithDiscounts.length);
                          
                          return (
                            <button
                              key={pkg.id}
                              type="button"
                              onClick={() => setSelectedPackage(isSelected ? null : pkg)}
                              className={`w-full text-left p-4 rounded-2xl border-2 transition-all relative overflow-hidden flex items-center justify-between ${
                                isSelected
                                  ? "border-bhagva bg-orange-50/50 shadow-sm"
                                  : "border-ink/10 hover:border-bhagva/30 bg-white"
                              }`}
                            >
                              {/* Badge */}
                              {badge && (
                                <span className="absolute top-0 right-0 bg-bhagva text-white text-[10px] font-black px-2 py-0.5 rounded-bl-lg uppercase tracking-wider">
                                  {badge}
                                </span>
                              )}

                              <div className="flex-1">
                                <span className="block text-sm font-black text-ink mb-1">
                                  {pkg.duration} Minutes
                                </span>
                                <div className="flex items-baseline gap-2">
                                  <span className="text-lg font-black text-bhagva">
                                    ₹{pkg.packagePrice}
                                  </span>
                                  {pkg.discountPercentage > 0 && (
                                    <>
                                      <span className="text-xs text-ink/40 line-through">
                                        ₹{pkg.originalPrice}
                                      </span>
                                      <span className="text-xs font-bold text-green-600">
                                        Save {pkg.discountPercentage}%
                                      </span>
                                    </>
                                  )}
                                </div>
                              </div>

                              <div className="flex items-center justify-center">
                                {isSelected ? (
                                  <div className="w-6 h-6 rounded-full bg-bhagva flex items-center justify-center text-white">
                                    <Check className="w-4 h-4" />
                                  </div>
                                ) : (
                                  <div className="w-6 h-6 rounded-full border border-ink/10" />
                                )}
                              </div>
                            </button>
                          );
                        })}
                      </div>
                    );
                  })()}
                </div>
              )}

              {/* Wallet Info */}
              <div className="bg-cream rounded-2xl p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Wallet className="w-5 h-5 text-bhagva" />
                    <span className="font-bold text-sm text-ink">Wallet Balance</span>
                  </div>
                  <span className={`font-bold text-lg ${!selectedMode || hasSufficientBalance(selectedMode) ? "text-green-600" : "text-red-600"}`}>
                    {loadingBalance ? <Loader2 className="w-4 h-4 animate-spin" /> : `₹${walletBalance.toFixed(2)}`}
                  </span>
                </div>
                {selectedMode && !hasSufficientBalance(selectedMode) && (
                  <div className="mt-3 flex items-center gap-2 text-red-600 text-sm">
                    <AlertTriangle className="w-4 h-4 flex-shrink-0" />
                    <span>Minimum ₹{getMinimumBalance(selectedMode)} required. <a href="/wallet" className="underline font-bold">Recharge now</a></span>
                  </div>
                )}
                {selectedMode && selectedPackage && hasSufficientBalance(selectedMode) && (
                  <p className="mt-2 text-xs text-ink/50">
                    Includes {selectedPackage.duration} mins of {selectedMode.toLowerCase()} consultation.
                  </p>
                )}
                {selectedMode && !selectedPackage && (
                  <p className="mt-2 text-xs text-ink/60 font-medium">
                    Pay-per-minute mode: You will be charged ₹{getPricePerMinute(selectedMode)}/min.
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
