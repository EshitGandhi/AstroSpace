"use client";

import Badge from "@/components/ui/Badge";
import AnimatedButton from "@/components/ui/AnimatedButton";
import HouseCard from "@/components/ui/HouseCard";
import ServiceCard from "@/components/ui/ServiceCard";
import AstrologerCard from "@/components/ui/AstrologerCard";

export default function DevComponentsShowcase() {
  const handleBook = () => {
    alert("Booking astrologer...");
  };

  return (
    <div className="py-10 px-6 max-w-7xl mx-auto space-y-16">
      {/* Page Header */}
      <div>
        <Badge>Developer Sandbox</Badge>
        <h1 className="text-4xl font-extrabold font-heading text-ink mt-2">
          AstroGuru Component Showcase
        </h1>
        <p className="text-ink-muted mt-1">
          This playground displays all components in both Celestial (Dark) and Earthly (Light) surface contexts to verify contrast, styling, and branding.
        </p>
      </div>

      {/* ── Surface Context 1: Earthly Surface ── */}
      <section className="border border-ink/10 rounded-3xl p-8 bg-cream text-ink space-y-10">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-bhagva">
            Context 1: Earthly Surface
          </span>
          <h2 className="text-2xl font-bold font-heading text-ink mt-1">
            Flat Cream Canvas (`bg-cream`)
          </h2>
          <p className="text-sm text-ink-muted">
            Used for forms, search interfaces, listing grids, and textual content pages.
          </p>
        </div>

        {/* Badges Section */}
        <div className="space-y-4">
          <h3 className="text-lg font-bold font-heading text-ink border-b border-ink/5 pb-2">
            1. Badges (`Badge`)
          </h3>
          <div className="flex flex-wrap gap-3">
            <Badge>Sun Rashi</Badge>
            <Badge>Devanagari Headline</Badge>
            <Badge className="border-bhagva">Custom Border</Badge>
          </div>
        </div>

        {/* Buttons Section */}
        <div className="space-y-4">
          <h3 className="text-lg font-bold font-heading text-ink border-b border-ink/5 pb-2">
            2. Buttons (`AnimatedButton`)
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
            <div className="space-y-2">
              <span className="text-xs font-semibold text-ink-muted">Primary Button Variants</span>
              <div className="flex flex-wrap gap-3 items-center">
                <AnimatedButton variant="primary" size="sm">Primary Sm</AnimatedButton>
                <AnimatedButton variant="primary" size="md">Primary Md</AnimatedButton>
                <AnimatedButton variant="primary" size="lg">Primary Lg</AnimatedButton>
              </div>
            </div>
            <div className="space-y-2">
              <span className="text-xs font-semibold text-ink-muted">Secondary / Outline (Surface: Cream)</span>
              <div className="flex flex-wrap gap-3 items-center">
                <AnimatedButton variant="secondary" size="sm" surface="cream">Secondary Sm</AnimatedButton>
                <AnimatedButton variant="secondary" size="md" surface="cream">Secondary Md</AnimatedButton>
                <AnimatedButton variant="secondary" size="lg" surface="cream">Secondary Lg</AnimatedButton>
              </div>
            </div>
          </div>
        </div>

        {/* Kendra House Cards Section */}
        <div className="space-y-4">
          <h3 className="text-lg font-bold font-heading text-ink border-b border-ink/5 pb-2">
            3. Kendra House Cards (`HouseCard`)
          </h3>
          <p className="text-xs text-ink-muted mb-2">Teaser row showcasing angular houses in a diamond configuration.</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <HouseCard
              houseNumber={1}
              houseName="Tanu"
              title="Rashi Checker"
              description="Discover your Sun sign traits instantly using your date of birth."
              link="#"
              iconName="User"
            />
            <HouseCard
              houseNumber={4}
              houseName="Bandhu"
              title="Kundli Generator"
              description="Get your complete birth chart with detailed house & planet coordinates."
              link="#"
              iconName="Compass"
            />
            <HouseCard
              houseNumber={7}
              houseName="Yuvati"
              title="Guna Matching"
              description="Analyze partnership compatibility score out of 36 points."
              link="#"
              iconName="Heart"
            />
            <HouseCard
              houseNumber={10}
              houseName="Karma"
              title="Consultation"
              description="Book an expert astrologer for career & life guidance."
              link="#"
              iconName="Briefcase"
            />
          </div>
        </div>

        {/* Secondary Services Section */}
        <div className="space-y-4">
          <h3 className="text-lg font-bold font-heading text-ink border-b border-ink/5 pb-2">
            4. Secondary Service Cards (`ServiceCard`)
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <ServiceCard
              title="Daily Horoscope"
              description="Sun-sign based advice updated every sunrise"
              link="#"
              iconName="Sun"
            />
            <ServiceCard
              title="Panchang Today"
              description="Calculate auspicious times (Muhurats) and Tithi"
              link="#"
              iconName="Calendar"
            />
            <ServiceCard
              title="Dasha Timeline"
              description="View your active planetary periods details"
              link="#"
              iconName="Activity"
            />
          </div>
        </div>

        {/* Astrologers Section */}
        <div className="space-y-4">
          <h3 className="text-lg font-bold font-heading text-ink border-b border-ink/5 pb-2">
            5. Astrologer Cards (`AstrologerCard`)
          </h3>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <AstrologerCard
              name="Acharya Shrikant Shastri"
              specialties={["Vedic Astrology", "Kundli", "Muhurat"]}
              languages={["Hindi", "English"]}
              experience={15}
              rating={4.9}
              pricePerMinute={25}
              onBook={handleBook}
            />
            <AstrologerCard
              name="Dr. Anjali Deshmukh"
              specialties={["KP System", "Nadi Astrology", "Career Guidance"]}
              languages={["Marathi", "Hindi", "English"]}
              experience={12}
              rating={4.8}
              pricePerMinute={30}
              onBook={handleBook}
            />
          </div>
        </div>
      </section>

      {/* ── Surface Context 2: Celestial Surface ── */}
      <section className="border border-white/10 rounded-3xl p-8 bg-night text-white space-y-10">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-gold">
            Context 2: Celestial Surface
          </span>
          <h2 className="text-2xl font-bold font-heading text-gold mt-1">
            Deep Sky Canvas (`bg-night`)
          </h2>
          <p className="text-sm text-white/70">
            Used for hero banners, chart displays, footer areas, and navigation rails.
          </p>
        </div>

        {/* Badges Section */}
        <div className="space-y-4">
          <h3 className="text-lg font-bold font-heading text-gold border-b border-white/5 pb-2">
            1. Badges (`Badge`) on Night
          </h3>
          <div className="flex flex-wrap gap-3">
            <Badge>Vedic Wisdom</Badge>
            <Badge>Astronomy Engine</Badge>
          </div>
        </div>

        {/* Buttons Section */}
        <div className="space-y-4">
          <h3 className="text-lg font-bold font-heading text-gold border-b border-white/5 pb-2">
            2. Buttons (`AnimatedButton`) on Night
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
            <div className="space-y-2">
              <span className="text-xs font-semibold text-white/60">Primary Button (Always Bhagva)</span>
              <div className="flex flex-wrap gap-3 items-center">
                <AnimatedButton variant="primary" size="sm">Primary Sm</AnimatedButton>
                <AnimatedButton variant="primary" size="md">Primary Md</AnimatedButton>
              </div>
            </div>
            <div className="space-y-2">
              <span className="text-xs font-semibold text-white/60">Secondary / Outline (Surface: Night)</span>
              <div className="flex flex-wrap gap-3 items-center">
                <AnimatedButton variant="secondary" size="sm" surface="night">Secondary Sm</AnimatedButton>
                <AnimatedButton variant="secondary" size="md" surface="night">Secondary Md</AnimatedButton>
              </div>
            </div>
          </div>
        </div>

        {/* Cards inside Dark Layout */}
        <div className="space-y-4">
          <h3 className="text-lg font-bold font-heading text-gold border-b border-white/5 pb-2">
            3. Components styling inside Celestial containers
          </h3>
          <p className="text-xs text-white/60">
            Although service details usually live on Earthly backgrounds, here is how the cards contrast when placed on Celestial surfaces.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <HouseCard
              houseNumber={1}
              houseName="Tanu"
              title="Sun Rashi"
              description="Vedic Sun placements and element summaries."
              link="#"
              iconName="Zap"
            />
            <ServiceCard
              title="Planetary Strengths"
              description="Overview of Shadbala calculation metrics"
              link="#"
              iconName="TrendingUp"
            />
          </div>
          
          <div className="mt-6">
            <span className="text-xs font-semibold text-white/60 block mb-2">Astrologer Card inside Celestial context</span>
            <AstrologerCard
              name="Acharya Shrikant Shastri"
              specialties={["Vedic Astrology", "Kundli", "Muhurat"]}
              languages={["Hindi", "English"]}
              experience={15}
              rating={4.9}
              pricePerMinute={25}
              onBook={handleBook}
            />
          </div>
        </div>
      </section>
    </div>
  );
}
