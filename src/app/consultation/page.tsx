import type { Metadata } from "next";
import ConsultationPageClient from "./ConsultationPageClient";

export const metadata: Metadata = {
  title: "Consultation | AstroGuru",
  description: "Book a Vedic astrology consultation with expert astrologers. Secure payment via Razorpay.",
};

export default function ConsultationPage() {
  return <ConsultationPageClient />;
}
