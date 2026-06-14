"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import AnimatedButton from "@/components/ui/AnimatedButton";
import HouseGridTexture from "@/components/animations/HouseGridTexture";
import Badge from "@/components/ui/Badge";
import HouseCard from "@/components/ui/HouseCard";
import ServiceCard from "@/components/ui/ServiceCard";

export default function Home() {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { 
      opacity: 1,
      transition: { staggerChildren: 0.2 }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: { y: 0, opacity: 1, transition: { duration: 0.6 } }
  };

  return (
    <div className="relative w-full overflow-x-hidden">
      {/* 1. Hero Section (Celestial Context) */}
      <section className="relative min-h-[80vh] flex flex-col items-center justify-center text-center px-6 pt-16 pb-24 bg-night text-white overflow-hidden">
        {/* Animated Background Texture */}
        <HouseGridTexture />

        <motion.div 
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="relative z-10 max-w-5xl mx-auto space-y-6"
        >
          <motion.div variants={itemVariants} className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-gold/30 bg-gold/10 backdrop-blur-sm">
            <span className="text-xs font-bold uppercase tracking-wider text-gold">Your Cosmic Compass</span>
          </motion.div>
          
          <motion.h1 variants={itemVariants} className="text-5xl md:text-7xl lg:text-8xl font-heading font-extrabold leading-tight tracking-tight">
            Navigate Life's Journey <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-bhagva to-gold">Sitaaron Ki Disha</span>
          </motion.h1>
          
          <motion.p variants={itemVariants} className="text-lg md:text-xl text-white/80 max-w-2xl mx-auto">
            Discover profound astrological insights based on authentic Vedic principles. Generate your birth chart, find your sun sign, and consult expert astrologers.
          </motion.p>
          
          <motion.div variants={itemVariants} className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-8">
            <Link href="/kundli">
              <AnimatedButton variant="primary" size="lg" className="w-full sm:w-auto">
                Apni Kundli Banayein <ArrowRight className="w-5 h-5 ml-2" />
              </AnimatedButton>
            </Link>
            <Link href="/tools">
              <AnimatedButton variant="secondary" size="lg" surface="night" className="w-full sm:w-auto">
                Free Rashi Check
              </AnimatedButton>
            </Link>
          </motion.div>
        </motion.div>
        
        {/* Bottom fade into Earthly surface */}
        <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-b from-transparent to-cream z-10 pointer-events-none" />
      </section>

      {/* 2. Earthly Intro */}
      <section className="bg-cream py-24 px-6 text-ink">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          <div className="space-y-8">
            <Badge>Your Vedic Companion</Badge>
            <h2 className="text-4xl md:text-5xl font-heading font-bold leading-tight text-ink">
              Ancient Wisdom <br /> for Modern Lives.
            </h2>
            <p className="text-lg text-ink-muted">
              We translate the complex mathematics of Vedic astrology into clear, actionable insights. Whether you're seeking daily guidance or deep karmic clarity, our tools are built for precision.
            </p>
          </div>
          <div className="relative aspect-square max-w-md mx-auto w-full opacity-60">
             {/* A stylized placeholder for the illustration, borrowing the HouseGrid texture visually but in dark ink */}
             <div className="absolute inset-0 border border-ink/10 rounded-full flex items-center justify-center">
               <div className="w-3/4 h-3/4 border border-ink/20 rotate-45" />
             </div>
          </div>
        </div>
      </section>

      {/* 3. House 1/4/7/10 Teaser Row */}
      <section className="bg-cream pb-24 px-6">
        <div className="max-w-7xl mx-auto space-y-12">
          <div className="text-center space-y-4">
            <h3 className="text-3xl font-heading font-bold text-ink">The Four Pillars</h3>
            <p className="text-ink-muted">Explore the Kendra houses that anchor your cosmic chart.</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <HouseCard houseNumber={1} houseName="Tanu" title="Rashi Checker" description="Discover your Sun sign traits instantly." link="/tools" iconName="User" />
            <HouseCard houseNumber={4} houseName="Bandhu" title="Kundli Generator" description="Get your complete birth chart with detailed coordinates." link="/kundli" iconName="Compass" />
            <HouseCard houseNumber={7} houseName="Yuvati" title="Guna Matching" description="Analyze partnership compatibility score." link="#" iconName="Heart" />
            <HouseCard houseNumber={10} houseName="Karma" title="Consultation" description="Book an expert astrologer for career guidance." link="/consultation" iconName="Briefcase" />
          </div>
        </div>
      </section>

      {/* 4. Secondary Services Strip */}
      <section className="bg-cream pb-32 px-6 border-b border-ink/5">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-6">
          <ServiceCard title="Daily Horoscope" description="Sun-sign based advice updated every sunrise" link="#" iconName="Sun" />
          <ServiceCard title="Panchang Today" description="Calculate auspicious times (Muhurats) and Tithi" link="#" iconName="Calendar" />
          <ServiceCard title="Dasha Timeline" description="View your active planetary periods details" link="#" iconName="Activity" />
        </div>
      </section>

      {/* 5. CTA Banner (Celestial Context) */}
      <section className="bg-night py-32 px-6 text-center">
        <div className="max-w-4xl mx-auto space-y-8">
          <h2 className="text-4xl md:text-5xl font-heading font-bold text-gold">Ready to seek guidance?</h2>
          <p className="text-xl text-white/80">Book a consultation today and unlock the deepest secrets of your cosmic blueprint.</p>
          <Link href="/consultation">
            <AnimatedButton variant="primary" size="lg">Schedule Reading</AnimatedButton>
          </Link>
        </div>
      </section>
    </div>
  );
}
