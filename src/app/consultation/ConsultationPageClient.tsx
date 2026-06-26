"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import Badge from "@/components/ui/Badge";
import AnimatedButton from "@/components/ui/AnimatedButton";
import AstrologerCard from "@/components/ui/AstrologerCard";
import GlassCard from "@/components/ui/GlassCard";
import PaymentCheckout from "@/components/consultation/PaymentCheckout";
import { ASTROLOGERS, generateTimeSlots, type Astrologer } from "@/lib/astrologers";
import { Calendar, CheckCircle2 } from "lucide-react";

export default function ConsultationPageClient() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const userId = session?.user?.id;

  const [selected, setSelected] = useState<Astrologer | null>(null);
  const [date, setDate] = useState("");
  const [slot, setSlot] = useState("");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [bookingId, setBookingId] = useState<string | null>(null);
  const [confirmed, setConfirmed] = useState(false);
  const [loading, setLoading] = useState(false);

  const slots = date ? generateTimeSlots() : [];

  const createBooking = async () => {
    if (!userId) {
      toast.error("Please sign in to book.");
      router.push("/sign-in");
      return;
    }
    if (!selected || !date || !slot || !name || !email) {
      toast.error("Please fill all fields.");
      return;
    }

    setLoading(true);
    try {
      const dateTime = new Date(`${date}T${slot}:00`);
      const res = await fetch("/api/booking", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          email,
          dateTime: dateTime.toISOString(),
          serviceType: `Consultation with ${selected.name}`,
          astrologerId: selected.id,
          amount: selected.pricePerMinute * selected.sessionMinutes,
        }),
      });
      if (!res.ok) throw new Error("Booking failed");
      const booking = await res.json();
      setBookingId(booking.id);
    } catch {
      toast.error("Could not create booking.");
    } finally {
      setLoading(false);
    }
  };

  if (!isLoaded) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-cream">
        <div className="animate-spin w-8 h-8 border-4 border-bhagva border-t-transparent rounded-full" />
      </div>
    );
  }

  if (confirmed) {
    return (
      <div className="bg-cream min-h-screen pt-32 pb-24 px-6 text-ink">
        <div className="max-w-lg mx-auto text-center space-y-6">
          <CheckCircle2 className="w-16 h-16 text-gold mx-auto" />
          <h1 className="text-3xl font-heading font-bold">Booking Confirmed</h1>
          <p className="text-ink-muted">
            Your consultation with {selected?.name} is confirmed. Check your dashboard for details.
          </p>
          <AnimatedButton onClick={() => router.push("/dashboard")}>Go to Dashboard</AnimatedButton>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-cream min-h-screen pt-32 pb-24 px-6 text-ink">
      <div className="max-w-7xl mx-auto space-y-12">
        <div className="text-center space-y-4">
          <Badge>Expert Guidance</Badge>
          <h1 className="text-4xl md:text-5xl font-heading font-bold">Book a Consultation</h1>
          <p className="text-lg text-ink-muted max-w-2xl mx-auto">
            Choose an astrologer, pick a slot, and complete payment securely via Razorpay.
          </p>
        </div>

        {!selected ? (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {ASTROLOGERS.map((astro) => (
              <AstrologerCard
                key={astro.id}
                name={astro.name}
                specialties={astro.specialties}
                languages={astro.languages}
                experience={astro.experience}
                rating={astro.rating}
                pricePerMinute={astro.pricePerMinute}
                onBook={() => setSelected(astro)}
              />
            ))}
          </div>
        ) : !bookingId ? (
          <div className="max-w-xl mx-auto space-y-6">
            <button
              onClick={() => setSelected(null)}
              className="text-sm text-ink-muted hover:text-bhagva"
            >
              ← Back to astrologers
            </button>
            <GlassCard className="bg-white space-y-6">
              <h2 className="text-xl font-heading font-bold">
                Book {selected.name} · ₹{selected.pricePerMinute * selected.sessionMinutes}
              </h2>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Date</label>
                  <input
                    type="date"
                    required
                    min={new Date().toISOString().split("T")[0]}
                    value={date}
                    onChange={(e) => { setDate(e.target.value); setSlot(""); }}
                    className="w-full px-4 py-3 rounded-xl border border-ink/20 bg-cream focus:outline-none focus:border-bhagva"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Time Slot</label>
                  <select
                    required
                    value={slot}
                    onChange={(e) => setSlot(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl border border-ink/20 bg-cream focus:outline-none focus:border-bhagva"
                  >
                    <option value="">Select slot</option>
                    {slots.map((s) => (
                      <option key={s} value={s}>{s}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Full Name</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-ink/20 bg-cream focus:outline-none focus:border-bhagva"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Email</label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-ink/20 bg-cream focus:outline-none focus:border-bhagva"
                />
              </div>

              <AnimatedButton
                onClick={createBooking}
                disabled={loading}
                className="w-full"
              >
                <Calendar className="w-4 h-4 mr-2" />
                {loading ? "Creating booking..." : "Proceed to Payment"}
              </AnimatedButton>
            </GlassCard>
          </div>
        ) : (
          <div className="max-w-xl mx-auto space-y-6">
            <PaymentCheckout
              bookingId={bookingId}
              amount={selected.pricePerMinute * selected.sessionMinutes}
              astrologerName={selected.name}
              onSuccess={() => setConfirmed(true)}
            />
          </div>
        )}
      </div>
    </div>
  );
}
