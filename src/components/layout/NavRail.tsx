"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useSession, signOut } from "next-auth/react";
import {
  Home,
  User,
  Briefcase,
  MessageCircle,
  Menu,
  X,
  LogIn,
  UserCircle2,
  LogOut,
  Moon,
} from "lucide-react";

const NAV_ITEMS = [
  { label: "HOME", href: "/", icon: Home },
  { label: "HOROSCOPE", href: "/horoscope", icon: Moon },
  { label: "ABOUT GURU", href: "/about", icon: User },
  { label: "SERVICES & FEATURES", href: "/tools", icon: Briefcase },
  { label: "TALK TO GURU", href: "/contact", icon: MessageCircle },
  { label: "MY PROFILE", href: "/profile", icon: UserCircle2 },
];

const RAIL_ORANGE = "#FF6B00";

function NavLink({
  item,
  active,
  onNavigate,
}: {
  item: (typeof NAV_ITEMS)[0];
  active: boolean;
  onNavigate?: () => void;
}) {
  const Icon = item.icon;
  return (
    <Link
      href={item.href}
      onClick={onNavigate}
      className={`nav-rail-link group flex items-center gap-4 py-3 px-2 transition-colors ${
        active 
          ? "text-yellow-400 opacity-100" 
          : "text-white opacity-90 hover:text-yellow-400 hover:opacity-100"
      }`}
    >
      <Icon className="w-7 h-7 shrink-0" strokeWidth={2.25} aria-hidden />
      <span className="nav-rail-label text-sm sm:text-base leading-tight">{item.label}</span>
    </Link>
  );
}

function BrandBlock({ onNavigate }: { onNavigate?: () => void }) {
  return (
    <Link href="/" onClick={onNavigate} className="block w-full mt-auto pt-6" aria-label="AstroGuru home">
      <div className="relative w-full h-[min(42vh,300px)] min-h-[200px] overflow-hidden">
        <Image
          src="/guru-sidebar-reference.png"
          alt="AstroGuru — Your Vedic Companion"
          fill
          sizes="300px"
          className="object-cover object-[center_92%] scale-110 pointer-events-none select-none"
          priority
        />
      </div>
    </Link>
  );
}

function AuthBlock({ onNavigate }: { onNavigate?: () => void }) {
  const { data: session, status } = useSession();

  if (status === "loading") {
    return (
      <div className="flex items-center justify-center py-3 border-t border-white/20">
        <div className="w-7 h-7 rounded-full bg-white/20 animate-pulse" />
      </div>
    );
  }

  if (session?.user) {
    return (
      <div className="flex flex-col gap-2 py-3 border-t border-white/20">
        {/* Avatar + name */}
        <div className="flex items-center gap-2.5 px-1">
          <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
            {session.user.name?.charAt(0).toUpperCase()}
          </div>
          <span className="text-white text-xs font-semibold truncate nav-rail-label-sm">
            {session.user.name}
          </span>
        </div>
        {/* Sign out */}
        <button
          onClick={() => signOut({ callbackUrl: "/" })}
          className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-white/80 hover:text-white transition-colors px-1 nav-rail-label-sm"
        >
          <LogOut className="w-4 h-4" strokeWidth={2.5} />
          Sign Out
        </button>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center gap-3 py-3 border-t border-white/20">
      <Link
        href="/sign-in"
        onClick={onNavigate}
        className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-white/90 hover:text-white nav-rail-label-sm"
      >
        <LogIn className="w-4 h-4" strokeWidth={2.5} />
        Sign In
      </Link>
    </div>
  );
}

function RailContent({ onNavigate, className = "" }: { onNavigate?: () => void; className?: string }) {
  const pathname = usePathname();
  const isActive = (href: string) => (href === "/" ? pathname === "/" : pathname.startsWith(href));

  return (
    <div className={`flex flex-col h-full px-5 py-8 ${className}`}>
      <nav className="flex flex-col gap-1 pt-2" aria-label="Main navigation">
        {NAV_ITEMS.map((item) => (
          <NavLink key={item.href} item={item} active={isActive(item.href)} onNavigate={onNavigate} />
        ))}
      </nav>
      <div className="flex flex-col flex-1 min-h-0">
        <AuthBlock onNavigate={onNavigate} />
        <BrandBlock onNavigate={onNavigate} />
      </div>
    </div>
  );
}

export default function NavRail() {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const closeDrawer = () => setDrawerOpen(false);

  return (
    <>
      {/* Desktop rail */}
      <aside className="hidden lg:flex fixed left-0 top-0 bottom-0 w-[300px] z-50 flex-col" style={{ backgroundColor: RAIL_ORANGE }}>
        <RailContent />
      </aside>

      {/* Mobile header */}
      <header className="lg:hidden fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-4 py-3 shadow-md" style={{ backgroundColor: RAIL_ORANGE }}>
        <Link href="/" className="flex items-center gap-2">
          <Image
            src="/guru-sidebar-reference.png"
            alt="AstroGuru"
            width={40}
            height={40}
            className="h-10 w-10 rounded-full object-cover object-[center_75%]"
          />
          <span className="nav-rail-label text-base text-white">ASTRO GURU</span>
        </Link>
        <button
          type="button"
          onClick={() => setDrawerOpen(!drawerOpen)}
          className="text-white p-2 rounded-lg hover:bg-white/10 transition-colors"
          aria-label={drawerOpen ? "Close menu" : "Open menu"}
          aria-expanded={drawerOpen}
        >
          {drawerOpen ? <X className="w-6 h-6" strokeWidth={2.5} /> : <Menu className="w-6 h-6" strokeWidth={2.5} />}
        </button>
      </header>

      {drawerOpen && (
        <div className="lg:hidden fixed inset-0 z-40 bg-black/50" onClick={closeDrawer} aria-hidden />
      )}

      {/* Mobile drawer */}
      <aside
        className={`lg:hidden fixed top-0 left-0 bottom-0 w-[min(100vw,300px)] z-50 transition-transform duration-300 ease-in-out ${drawerOpen ? "translate-x-0" : "-translate-x-full"
          }`}
        style={{ backgroundColor: RAIL_ORANGE }}
        aria-hidden={!drawerOpen}
      >
        <div className="pt-16 h-full">
          <RailContent onNavigate={closeDrawer} />
        </div>
      </aside>
    </>
  );
}
