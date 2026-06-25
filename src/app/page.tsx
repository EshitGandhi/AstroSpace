"use client";

import Link from "next/link";
import Badge from "@/components/ui/Badge";
import AnimatedButton from "@/components/ui/AnimatedButton";
import HouseCard from "@/components/ui/HouseCard";
import ServiceCard from "@/components/ui/ServiceCard";
import Hero from "@/components/layout/Hero";
import KundliChart, { SAMPLE_CHART_HOUSES } from "@/components/kundli/KundliChart";

export default function Home() {
  return (
    <div className="relative w-full overflow-x-hidden">
      <Hero />

      <section className="bg-cream py-24 px-6 text-ink">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          <div className="space-y-8">
            <Badge>Your Vedic Companion</Badge>
            <h2 className="text-4xl md:text-5xl font-heading font-bold leading-tight text-ink">
              Ancient Wisdom <br /> for Modern Lives.
            </h2>
            <p className="text-lg text-ink-muted">
              We translate the complex mathematics of Vedic astrology into clear, actionable
              insights. Whether you&apos;re seeking daily guidance or deep karmic clarity, our
              tools are built for precision.
            </p>
          </div>
          <div className="relative max-w-md mx-auto w-full opacity-70">
            <KundliChart houses={SAMPLE_CHART_HOUSES} style="north" surface="cream" />
          </div>
        </div>
      </section>

      <section className="bg-cream pb-24 px-6">
        <div className="max-w-7xl mx-auto space-y-12">
          <div className="text-center space-y-4">
            <h3 className="text-3xl font-heading font-bold text-ink">The Four Pillars</h3>
            <p className="text-ink-muted">Explore the Kendra houses that anchor your cosmic chart.</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <HouseCard houseNumber={1} houseName="Tanu" title="Rashi Checker" description="Discover your Sun sign traits instantly." link="/tools" iconName="User" />
            <HouseCard houseNumber={4} houseName="Bandhu" title="Kundli Generator" description="Get your complete birth chart with detailed coordinates." link="/kundli" iconName="Compass" />
            <HouseCard houseNumber={7} houseName="Yuvati" title="Guna Matching" description="Analyze partnership compatibility score." link="/consultation" iconName="Heart" />
            <HouseCard houseNumber={10} houseName="Karma" title="Consultation" description="Book an expert astrologer for career guidance." link="/consultation" iconName="Briefcase" />
          </div>
        </div>
      </section>

      <section className="bg-cream pb-32 px-6 border-b border-ink/5">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-6">
          <ServiceCard title="Daily Horoscope" description="Sun-sign based advice updated every sunrise" link="/horoscope" iconName="Sun" />
          <ServiceCard title="Panchang Today" description="Calculate auspicious times (Muhurats) and Tithi" link="/tools" iconName="Calendar" />
          <ServiceCard title="Dasha Timeline" description="View your active planetary periods details" link="/kundli" iconName="Activity" />
        </div>
      </section>

      <section className="bg-cream-tint py-32 px-6 text-center border-t border-ink/5">
        <div className="max-w-4xl mx-auto space-y-8">
          <h2 className="text-4xl md:text-5xl font-heading font-bold text-ink">Ready to seek guidance?</h2>
          <p className="text-xl text-ink-muted">
            Book a consultation today and unlock the deepest secrets of your cosmic blueprint.
          </p>
          <Link href="/consultation">
            <AnimatedButton variant="primary" size="lg">Schedule Reading</AnimatedButton>
          </Link>
        </div>
      </section>
    </div>
  );
}
