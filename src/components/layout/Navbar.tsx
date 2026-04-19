"use client";

import Link from "next/link";
import Image from "next/image";
import { UserButton, SignedIn, SignedOut } from "@clerk/nextjs";
import AnimatedButton from "../ui/AnimatedButton";

export default function Navbar() {
  return (
    <nav className="fixed top-0 w-full z-50 glass border-b border-white/10 px-6 py-4 transition-all duration-300">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        <Link href="/" className="flex items-center gap-3 group">
          <Image src="/logo.png" alt="AstroSpace Logo" width={40} height={40} className="rounded-full shadow-[0_0_15px_rgba(255,140,0,0.5)] group-hover:animate-pulse transition-all" />
          <span className="text-xl font-heading font-bold text-transparent bg-clip-text bg-gradient-to-r from-accent-pink to-accent-blue text-glow">
            AstroSpace
          </span>
        </Link>
        
        <div className="hidden md:flex items-center gap-8 text-sm font-medium">
          <Link href="/zodiac-explorer" className="hover:text-accent-blue transition-colors">Zodiac Explorer</Link>
          <Link href="/horoscope" className="hover:text-accent-pink transition-colors">Horoscope</Link>
          <Link href="/zodiac-predictor" className="hover:text-accent-gold transition-colors">Predictor</Link>
          <Link href="/blog" className="hover:text-accent-blue transition-colors">Blog</Link>
        </div>

        <div className="flex items-center gap-4">
          <SignedIn>
            <Link href="/dashboard" className="text-sm font-medium hover:text-white/80 transition-colors">Dashboard</Link>
            <UserButton afterSignOutUrl="/" />
          </SignedIn>
          <SignedOut>
            <Link href="/sign-in">
              <AnimatedButton variant="outline" size="sm">Sign In</AnimatedButton>
            </Link>
            <Link href="/sign-up">
              <AnimatedButton variant="primary" size="sm">Get Started</AnimatedButton>
            </Link>
          </SignedOut>
        </div>
      </div>
    </nav>
  );
}
