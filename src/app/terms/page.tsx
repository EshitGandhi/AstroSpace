import type { Metadata } from "next";
import Badge from "@/components/ui/Badge";

export const metadata: Metadata = {
  title: "Terms of Service | AstroGuru",
  description: "Terms governing use of AstroGuru astrology tools and consultation services.",
};

export default function TermsPage() {
  return (
    <div className="bg-cream min-h-screen pt-32 pb-24 px-6 text-ink">
      <div className="max-w-3xl mx-auto space-y-8">
        <Badge>Legal</Badge>
        <h1 className="text-4xl font-heading font-bold">Terms of Service</h1>
        <p className="text-ink-muted text-sm">Last updated: June 2026</p>

        <section className="space-y-4 text-ink-muted leading-relaxed">
          <h2 className="text-xl font-heading font-bold text-ink">Use of Services</h2>
          <p>
            AstroGuru provides Vedic astrology tools and consultation booking for informational and
            guidance purposes. Astrological readings are not a substitute for professional medical,
            legal, or financial advice.
          </p>

          <h2 className="text-xl font-heading font-bold text-ink pt-4">Accuracy</h2>
          <p>
            We strive for accurate calculations using Lahiri ayanamsa and Swiss Ephemeris precision
            via our calculation library. Results may vary slightly from other software due to
            ayanamsa or house system differences.
          </p>

          <h2 className="text-xl font-heading font-bold text-ink pt-4">Consultations</h2>
          <p>
            Consultation fees are charged at booking. Cancellations and rescheduling policies will
            be communicated at the time of booking confirmation.
          </p>

          <h2 className="text-xl font-heading font-bold text-ink pt-4">Account</h2>
          <p>
            You are responsible for maintaining the security of your account credentials managed
            through our authentication provider.
          </p>
        </section>
      </div>
    </div>
  );
}
