"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import AnimatedButton from "@/components/ui/AnimatedButton";
import HouseGridTexture from "@/components/animations/HouseGridTexture";

export default function Hero() {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.2 },
    },
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: { y: 0, opacity: 1, transition: { duration: 0.6 } },
  };

  return (
    <section className="relative min-h-[80vh] flex flex-col items-center justify-center text-center px-6 pt-16 pb-24 bg-cream text-ink overflow-hidden">
      <HouseGridTexture />

      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="relative z-10 max-w-5xl mx-auto space-y-6"
      >
        <motion.div
          variants={itemVariants}
          className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-gold/30 bg-gold/10 backdrop-blur-sm"
        >
          <span className="text-xs font-bold uppercase tracking-wider text-gold">
            Your Cosmic Compass
          </span>
        </motion.div>

        <motion.h1
          variants={itemVariants}
          className="text-5xl md:text-7xl lg:text-8xl font-heading font-extrabold leading-tight tracking-tight"
        >
          Sitaaron Ki Bhasha, Aapki Zaroorat Ke Hisaab Se —{" "}
          <span className="text-bhagva block mt-2">Ab Aasaan, Ab Sahi.</span>
        </motion.h1>

        <motion.p
          variants={itemVariants}
          className="text-lg md:text-xl text-ink-muted max-w-2xl mx-auto"
        >
          Discover profound astrological insights based on authentic Vedic principles.
          Generate your birth chart, find your sun sign, and consult expert astrologers.
        </motion.p>

        <motion.div
          variants={itemVariants}
          className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-8"
        >
          <Link href="/kundli">
            <AnimatedButton variant="primary" size="lg" className="w-full sm:w-auto">
              Apni Kundli Banayein <ArrowRight className="w-5 h-5 ml-2" />
            </AnimatedButton>
          </Link>
          <Link href="/tools">
            <AnimatedButton variant="secondary" size="lg" surface="cream" className="w-full sm:w-auto">
              Free Rashi Check
            </AnimatedButton>
          </Link>
        </motion.div>
      </motion.div>

      <div className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-b from-transparent to-cream z-10 pointer-events-none" />
    </section>
  );
}
