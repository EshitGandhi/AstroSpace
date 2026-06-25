"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { motion, AnimatePresence } from "framer-motion";
import GlassCard from "@/components/ui/GlassCard";
import AnimatedButton from "@/components/ui/AnimatedButton";
import Badge from "@/components/ui/Badge";
import { Calendar, User, Mail, CheckCircle2 } from "lucide-react";

export default function BookingPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const userId = session?.user?.id;

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    dateTime: "",
    serviceType: "Natal Chart Analysis",
  });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userId) {
      toast.error("You must be logged in to book a session.");
      router.push("/sign-in");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/booking", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (!res.ok) throw new Error("Failed to book");

      setSuccess(true);
      toast.success("Booking confirmed!");
    } catch {
      toast.error("Failed to make booking. Try again.");
    } finally {
      setLoading(false);
    }
  };

  const formVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
  };

  if (status === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-cream">
        <div className="animate-spin w-8 h-8 border-4 border-bhagva border-t-transparent rounded-full" />
      </div>
    );
  }

  return (
    <div className="bg-cream min-h-screen py-24 px-6 max-w-4xl mx-auto flex flex-col items-center">
      <div className="text-center mb-12">
        <Badge>Consultation</Badge>
        <h1 className="text-4xl md:text-5xl font-heading font-bold mb-4 text-ink mt-4">
          Book a Session
        </h1>
        <p className="text-xl text-ink-muted">
          Reserve your specialized session with an expert astrologer.
        </p>
      </div>

      <AnimatePresence mode="wait">
        {!success ? (
          <motion.div
            key="form"
            className="w-full max-w-lg"
            variants={formVariants}
            initial="hidden"
            animate="visible"
            exit="hidden"
          >
            <GlassCard>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-ink mb-2">Full Name</label>
                  <div className="relative">
                    <User className="absolute left-4 top-3.5 w-5 h-5 text-ink-muted" />
                    <input
                      type="text"
                      required
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      placeholder="Jane Doe"
                      className="w-full pl-12 pr-4 py-3 bg-cream border border-ink/20 rounded-xl text-ink focus:outline-none focus:border-bhagva focus:ring-1 focus:ring-bhagva transition-colors"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-ink mb-2">Email Address</label>
                  <div className="relative">
                    <Mail className="absolute left-4 top-3.5 w-5 h-5 text-ink-muted" />
                    <input
                      type="email"
                      required
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      placeholder="jane@example.com"
                      className="w-full pl-12 pr-4 py-3 bg-cream border border-ink/20 rounded-xl text-ink focus:outline-none focus:border-bhagva focus:ring-1 focus:ring-bhagva transition-colors"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-ink mb-2">
                    Preferred Date & Time
                  </label>
                  <div className="relative">
                    <Calendar className="absolute left-4 top-3.5 w-5 h-5 text-ink-muted" />
                    <input
                      type="datetime-local"
                      required
                      value={formData.dateTime}
                      onChange={(e) => setFormData({ ...formData, dateTime: e.target.value })}
                      className="w-full pl-12 pr-4 py-3 bg-cream border border-ink/20 rounded-xl text-ink focus:outline-none focus:border-bhagva focus:ring-1 focus:ring-bhagva transition-colors"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-ink mb-2">Service Type</label>
                  <select
                    value={formData.serviceType}
                    onChange={(e) => setFormData({ ...formData, serviceType: e.target.value })}
                    className="w-full p-3 bg-cream border border-ink/20 rounded-xl text-ink focus:outline-none focus:border-bhagva focus:ring-1 focus:ring-bhagva transition-colors appearance-none"
                  >
                    <option value="Natal Chart Analysis">Natal Chart Analysis (60min)</option>
                    <option value="Relationship Compatibility">Relationship Compatibility (90min)</option>
                    <option value="Life Path & Career">Life Path & Career (60min)</option>
                    <option value="Quick Check-in">Quick Check-in (30min)</option>
                  </select>
                </div>

                <AnimatedButton type="submit" disabled={loading} className="w-full mt-4">
                  {loading ? "Aligning Stars..." : "Confirm Booking"}
                </AnimatedButton>
              </form>
            </GlassCard>
          </motion.div>
        ) : (
          <motion.div
            key="success"
            className="w-full max-w-lg text-center"
            variants={formVariants}
            initial="hidden"
            animate="visible"
          >
            <GlassCard className="flex flex-col items-center">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", bounce: 0.5, duration: 0.8 }}
                className="w-24 h-24 bg-gold/20 rounded-full flex items-center justify-center mb-6"
              >
                <CheckCircle2 className="w-12 h-12 text-gold" />
              </motion.div>
              <h2 className="text-3xl font-heading font-bold mb-4 text-ink">Booking Confirmed</h2>
              <p className="text-ink-muted mb-8">
                Your booking for {formData.serviceType} is confirmed! Check your email and
                dashboard for details.
              </p>
              <AnimatedButton variant="secondary" onClick={() => router.push("/dashboard")}>
                Go to Dashboard
              </AnimatedButton>
            </GlassCard>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
