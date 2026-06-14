import type { Metadata } from "next";
import Badge from "@/components/ui/Badge";

export const metadata: Metadata = {
  title: "About | AstroGuru",
  description: "Learn about AstroGuru — your Vedic astrology companion.",
};

export default function AboutPage() {
  return (
    <div className="bg-cream min-h-screen pt-32 pb-24 px-6 text-ink">
      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
        <div className="space-y-8">
          <Badge>Our Story</Badge>
          <h1 className="text-4xl md:text-5xl font-heading font-bold leading-tight">
            Ancient Wisdom, Modern Guidance
          </h1>
          <p className="text-lg text-ink-muted leading-relaxed">
            AstroGuru brings authentic Vedic astrology to everyone — from instant Rashi checks
            to full birth charts and expert consultations. Our tools are built on precise
            astronomical calculations with Lahiri ayanamsa, keeping your birth data secure
            and processed entirely in-house.
          </p>
          <p className="text-lg text-ink-muted leading-relaxed">
            Whether you seek daily guidance or deep karmic clarity, we translate the
            mathematics of Jyotish into clear, actionable insights for modern lives.
          </p>
        </div>
        <div className="relative aspect-square max-w-md mx-auto w-full">
          <div className="absolute inset-0 bg-cream-tint border border-ink/10 rounded-3xl flex items-center justify-center">
            <div className="text-center space-y-2 p-8">
              <span className="text-6xl font-heading font-bold text-gold">15+</span>
              <p className="text-ink-muted font-medium">Years of Vedic Expertise</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
