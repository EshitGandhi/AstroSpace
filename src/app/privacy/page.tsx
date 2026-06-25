import type { Metadata } from "next";
import Badge from "@/components/ui/Badge";

export const metadata: Metadata = {
  title: "Privacy Policy | AstroGuru",
  description: "How AstroGuru collects, uses, and protects your personal and birth data.",
};

export default function PrivacyPage() {
  return (
    <div className="bg-cream min-h-screen pt-32 pb-24 px-6 text-ink">
      <div className="max-w-3xl mx-auto space-y-8">
        <Badge>Legal</Badge>
        <h1 className="text-4xl font-heading font-bold">Privacy Policy</h1>
        <p className="text-ink-muted text-sm">Last updated: June 2026</p>

        <section className="space-y-4 text-ink-muted leading-relaxed">
          <h2 className="text-xl font-heading font-bold text-ink">Birth Data</h2>
          <p>
            When you generate a Kundli or use our astrology tools, we collect your date of birth,
            time of birth, and place of birth (city/coordinates). This data is sensitive personal
            information used solely to calculate your Vedic birth chart.
          </p>
          <p>
            All astrological calculations are performed in-house using the{" "}
            <strong>@ishubhamx/panchangam-js</strong> library. Your birth data is{" "}
            <strong>not sent to third-party astrology APIs</strong>. Chart calculations happen on
            our servers and are not stored beyond what is needed for your active session unless you
            explicitly save a profile (future feature).
          </p>

          <h2 className="text-xl font-heading font-bold text-ink pt-4">Consultation Bookings</h2>
          <p>
            For consultations, we collect your name, email, and preferred appointment time. Payment
            is processed securely through Razorpay. We do not store your card or UPI details.
          </p>

          <h2 className="text-xl font-heading font-bold text-ink pt-4">Data Retention</h2>
          <p>
            Kundli calculation inputs are processed in real time and are not persisted in our
            database by default. Booking records are retained for service fulfilment and support.
          </p>

          <h2 className="text-xl font-heading font-bold text-ink pt-4">Contact</h2>
          <p>
            Questions about this policy? Email{" "}
            <a href="mailto:hello@astroguru.com" className="text-bhagva hover:underline">
              hello@astroguru.com
            </a>
            .
          </p>
        </section>
      </div>
    </div>
  );
}
