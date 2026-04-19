"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { ArrowRight, Star, Moon, Sun } from "lucide-react";
import AnimatedButton from "@/components/ui/AnimatedButton";
import GlassCard from "@/components/ui/GlassCard";

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
    <div className="relative">
      {/* Hero Section */}
      <section className="relative min-h-[90vh] flex flex-col items-center justify-center text-center px-6 pt-20">
        <motion.div 
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="max-w-4xl mx-auto space-y-8"
        >
          <motion.div variants={itemVariants} className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-accent-gold/40 bg-accent-gold/10 backdrop-blur-md">
            <Star className="w-4 h-4 text-accent-gold animate-pulse" />
            <span className="text-sm font-medium text-accent-gold">Reveal your destiny</span>
          </motion.div>
          
          <motion.h1 variants={itemVariants} className="text-5xl md:text-7xl font-heading font-bold leading-tight">
            Discover Your <span className="text-transparent bg-clip-text bg-gradient-to-r from-accent-pink to-accent-blue text-glow">Cosmic Path</span>
          </motion.h1>
          
          <motion.p variants={itemVariants} className="text-xl text-gray-300 max-w-2xl mx-auto">
            Navigate your life with precision through our advanced astrological insights, daily horoscopes, and expert consultations.
          </motion.p>
          
          <motion.div variants={itemVariants} className="flex flex-col sm:flex-row items-center justify-center gap-6 pt-8">
            <Link href="/booking">
              <AnimatedButton variant="primary" size="lg" className="w-full sm:w-auto">
                Book Consultation <ArrowRight className="w-5 h-5 ml-2" />
              </AnimatedButton>
            </Link>
            <Link href="/horoscope">
              <AnimatedButton variant="outline" size="lg" className="w-full sm:w-auto">
                Explore Horoscope
              </AnimatedButton>
            </Link>
          </motion.div>
        </motion.div>
      </section>

      {/* Services Section */}
      <section className="py-24 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-5xl font-heading font-bold mb-4">Cosmic Services</h2>
            <p className="text-gray-400">Unlock the secrets of the stars</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                title: "Natal Chart Analysis",
                description: "Deep dive into your personality based on planetary positions at your exact birth time.",
                icon: Moon,
                color: "pink"
              },
              {
                title: "Daily Horoscopes",
                description: "Actionable insights delivered daily to help you navigate cosmic energies.",
                icon: Sun,
                color: "blue"
              },
              {
                title: "Relationship Compatibility",
                description: "Understand the synastry between you and your partner for long-lasting harmony.",
                icon: Star,
                color: "gold"
              }
            ].map((service, i) => (
              <GlassCard key={i} className="hover:-translate-y-2 transition-transform duration-300">
                <service.icon className={`w-12 h-12 mb-6 text-accent-${service.color}`} />
                <h3 className="text-xl font-bold mb-3">{service.title}</h3>
                <p className="text-gray-400 mb-6">{service.description}</p>
                <Link href="/booking" className={`text-accent-${service.color} flex items-center hover:underline`}>
                  Learn more <ArrowRight className="w-4 h-4 ml-1" />
                </Link>
              </GlassCard>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-24 px-6 relative overflow-hidden">
        <div className="absolute inset-0 bg-accent-blue/5 blur-[120px] rounded-full" />
        <div className="max-w-7xl mx-auto relative z-10">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-5xl font-heading font-bold mb-4">Astral Testimonials</h2>
            <p className="text-gray-400">What our celestial travelers say</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <GlassCard>
              <div className="flex text-accent-gold mb-4">
                {[...Array(5)].map((_, i) => <Star key={i} className="w-5 h-5 fill-current" />)}
              </div>
              <p className="text-gray-300 italic mb-6">"AstroSpace completely changed how I view my career timeline. The natal chart reading was spot-on and incredibly revealing."</p>
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center text-white font-bold">SM</div>
                <div>
                  <h4 className="font-bold">Sarah M.</h4>
                  <p className="text-sm text-gray-400">Gemini</p>
                </div>
              </div>
            </GlassCard>
            <GlassCard>
              <div className="flex text-accent-gold mb-4">
                {[...Array(5)].map((_, i) => <Star key={i} className="w-5 h-5 fill-current" />)}
              </div>
              <p className="text-gray-300 italic mb-6">"The relationship compatibility reading gave me the confidence I needed. Truly magical experience and highly professional."</p>
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center text-white font-bold"> JD</div>
                <div>
                  <h4 className="font-bold">James D.</h4>
                  <p className="text-sm text-gray-400">Scorpio</p>
                </div>
              </div>
            </GlassCard>
          </div>
        </div>
      </section>
      
      {/* Footer CTA */}
      <section className="py-24 px-6">
        <GlassCard className="max-w-4xl mx-auto text-center py-16">
          <h2 className="text-3xl md:text-5xl font-heading font-bold mb-6">Ready to seek guidance?</h2>
          <p className="text-gray-300 max-w-xl mx-auto mb-8">Book a consultation today and unlock the deepest secrets of your cosmic blueprint.</p>
          <Link href="/booking">
            <AnimatedButton variant="primary" size="lg">Schedule Reading</AnimatedButton>
          </Link>
        </GlassCard>
      </section>
    </div>
  );
}
