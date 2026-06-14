import Link from "next/link";
import Image from "next/image";
import { MessageCircle, Globe, Mail } from "lucide-react";

export default function Footer() {
  return (
    <footer className="bg-night text-white mt-20 pt-16 pb-8">
      <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 md:grid-cols-4 gap-12">

        {/* Brand */}
        <div className="col-span-1 md:col-span-2">
          <Link href="/" className="flex items-center gap-3 group mb-4">
            <Image
              src="/logo.svg"
              alt="AstroGuru Logo"
              width={40}
              height={40}
              className="rounded-full"
            />
            <span className="text-2xl font-heading font-bold">
              <span className="text-white">Astro</span>
              <span className="text-bhagva">Guru</span>
            </span>
          </Link>
          <p className="text-white/60 max-w-sm">
            Vedic astrology insights — Kundli, Rashi, daily horoscopes, and
            expert consultations to guide your journey through the stars.
          </p>
        </div>

        {/* Quick Links */}
        <div>
          <h4 className="text-lg font-bold text-gold mb-4">Quick Links</h4>
          <ul className="space-y-2">
            <li>
              <Link href="/tools" className="text-white/60 hover:text-bhagva transition-colors">
                Free Tools
              </Link>
            </li>
            <li>
              <Link href="/kundli" className="text-white/60 hover:text-bhagva transition-colors">
                Kundli
              </Link>
            </li>
            <li>
              <Link href="/consultation" className="text-white/60 hover:text-bhagva transition-colors">
                Consultation
              </Link>
            </li>
            <li>
              <Link href="/blog" className="text-white/60 hover:text-bhagva transition-colors">
                Blog
              </Link>
            </li>
          </ul>
        </div>

        {/* Connect */}
        <div>
          <h4 className="text-lg font-bold text-gold mb-4">Connect</h4>
          <div className="flex gap-4 mb-4">
            <a
              href="#"
              className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center text-white hover:bg-bhagva transition-all"
            >
              <MessageCircle className="w-5 h-5" />
            </a>
            <a
              href="#"
              className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center text-white hover:bg-bhagva transition-all"
            >
              <Globe className="w-5 h-5" />
            </a>
            <a
              href="mailto:hello@astroguru.com"
              className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center text-white hover:bg-bhagva transition-all"
            >
              <Mail className="w-5 h-5" />
            </a>
          </div>
          <p className="text-white/40 text-sm">hello@astroguru.com</p>
        </div>

      </div>

      {/* Bottom bar */}
      <div className="max-w-7xl mx-auto px-6 mt-12 pt-8 border-t border-white/10 text-center text-white/40 text-sm flex flex-col md:flex-row justify-between items-center">
        <p>&copy; {new Date().getFullYear()} AstroGuru. All rights reserved.</p>
        <div className="flex gap-4 mt-4 md:mt-0">
          <Link href="/privacy" className="hover:text-white transition-colors">
            Privacy Policy
          </Link>
          <Link href="/terms" className="hover:text-white transition-colors">
            Terms of Service
          </Link>
        </div>
      </div>
    </footer>
  );
}

