import Link from "next/link";
import Image from "next/image";
import { MessageCircle, Camera, Mail } from "lucide-react";

export default function Footer() {
  return (
    <footer className="relative border-t border-white/10 glass mt-20 pt-16 pb-8">
      <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 md:grid-cols-4 gap-12">
        
        <div className="col-span-1 md:col-span-2">
          <Link href="/" className="flex items-center gap-3 group mb-4">
            <Image src="/logo.png" alt="AstroSpace Logo" width={40} height={40} className="rounded-full shadow-[0_0_15px_rgba(255,140,0,0.5)] group-hover:animate-pulse transition-all" />
            <span className="text-2xl font-heading font-bold text-transparent bg-clip-text bg-gradient-to-r from-accent-pink to-accent-blue text-glow">
              AstroSpace
            </span>
          </Link>
          <p className="text-gray-400 max-w-sm">
            Discover your cosmic path. We offer professional astrology services, deep insights into your zodiac, and personalized horoscopes to guide your journey.
          </p>
        </div>

        <div>
          <h4 className="text-lg font-bold text-white mb-4">Quick Links</h4>
          <ul className="space-y-2">
            <li><Link href="/zodiac-explorer" className="text-gray-400 hover:text-accent-pink transition-colors">Zodiac Explorer</Link></li>
            <li><Link href="/horoscope" className="text-gray-400 hover:text-accent-blue transition-colors">Horoscope</Link></li>
            <li><Link href="/booking" className="text-gray-400 hover:text-accent-gold transition-colors">Book Consultation</Link></li>
            <li><Link href="/blog" className="text-gray-400 hover:text-accent-pink transition-colors">Cosmic Blog</Link></li>
          </ul>
        </div>

        <div>
          <h4 className="text-lg font-bold text-white mb-4">Connect</h4>
          <div className="flex gap-4 mb-4">
            <a href="#" className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center text-white hover:bg-accent-pink hover:text-white transition-all">
              <MessageCircle className="w-5 h-5" />
            </a>
            <a href="#" className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center text-white hover:bg-accent-blue hover:text-white transition-all">
              <Camera className="w-5 h-5" />
            </a>
            <a href="mailto:hello@astrospace.com" className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center text-white hover:bg-accent-gold hover:text-white transition-all">
              <Mail className="w-5 h-5" />
            </a>
          </div>
          <p className="text-gray-400 text-sm">hello@astrospace.com</p>
        </div>

      </div>
      
      <div className="max-w-7xl mx-auto px-6 mt-12 pt-8 border-t border-white/5 text-center text-gray-500 text-sm flex flex-col md:flex-row justify-between items-center">
        <p>&copy; {new Date().getFullYear()} AstroSpace. All rights reserved.</p>
        <div className="flex gap-4 mt-4 md:mt-0">
          <Link href="/privacy" className="hover:text-white transition-colors">Privacy Policy</Link>
          <Link href="/terms" className="hover:text-white transition-colors">Terms of Service</Link>
        </div>
      </div>
    </footer>
  );
}
