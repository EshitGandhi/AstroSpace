"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { UserButton, SignedIn, SignedOut } from "@clerk/nextjs";
import {
  Home,
  User,
  Wrench,
  Star,
  Calendar,
  MessageCircle,
  Menu,
  X,
  LogIn,
} from "lucide-react";

const NAV_ITEMS = [
  { label: "Home",              href: "/",              icon: Home },
  { label: "About",             href: "/about",         icon: User },
  { label: "Free Tools",        href: "/tools",         icon: Wrench },
  { label: "Kundli",            href: "/kundli",        icon: Star },
  { label: "Consultation",      href: "/consultation",  icon: Calendar },
  { label: "Talk to Astrologer", href: "/contact",      icon: MessageCircle },
];

export default function NavRail() {
  const pathname = usePathname();
  const [drawerOpen, setDrawerOpen] = useState(false);

  const isActive = (href: string) =>
    href === "/" ? pathname === "/" : pathname.startsWith(href);

  /* ── Shared nav list (used in both desktop rail and mobile drawer) ── */
  const navList = (
    <nav className="flex flex-col gap-1">
      {NAV_ITEMS.map((item) => {
        const active = isActive(item.href);
        return (
          <Link
            key={item.href}
            href={item.href}
            onClick={() => setDrawerOpen(false)}
            className={`
              flex items-center gap-4 px-5 py-3 rounded-xl text-sm font-medium
              transition-colors duration-200
              ${active
                ? "bg-bhagva text-white"
                : "text-white/70 hover:bg-white/10 hover:text-white"
              }
            `}
          >
            <item.icon className="w-5 h-5 shrink-0" />
            <span>{item.label}</span>
          </Link>
        );
      })}
    </nav>
  );

  /* ── Logo + wordmark block (anchored at bottom) ── */
  const brandBlock = (
    <div className="flex flex-col items-center text-center gap-3">
      <Link href="/" onClick={() => setDrawerOpen(false)}>
        <Image
          src="/logo.png"
          alt="AstroGuru Logo"
          width={72}
          height={72}
          className="rounded-full"
          priority
        />
      </Link>
      <div>
        <span className="text-white font-heading font-bold text-lg tracking-wide">
          Astro
        </span>
        <span className="text-bhagva font-heading font-bold text-lg tracking-wide">
          Guru
        </span>
      </div>
      <p className="text-white/50 text-xs">Your Vedic Companion</p>
    </div>
  );

  /* ── Auth block ── */
  const authBlock = (
    <div className="flex flex-col items-center gap-3 pt-4 border-t border-white/10">
      <SignedIn>
        <UserButton
          afterSignOutUrl="/"
          appearance={{
            elements: { avatarBox: "w-9 h-9" },
          }}
        />
      </SignedIn>
      <SignedOut>
        <Link
          href="/sign-in"
          onClick={() => setDrawerOpen(false)}
          className="flex items-center gap-2 text-sm text-white/70 hover:text-white transition-colors"
        >
          <LogIn className="w-4 h-4" />
          Sign In
        </Link>
      </SignedOut>
    </div>
  );

  return (
    <>
      {/* ════════ Desktop rail (>= 1024px) ════════ */}
      <aside className="hidden lg:flex fixed left-0 top-0 bottom-0 w-[280px] z-50 flex-col bg-night px-4 py-8">
        {/* Top: navigation */}
        <div className="flex-1 overflow-y-auto">
          {navList}
        </div>

        {/* Bottom: brand + auth */}
        <div className="flex flex-col gap-6">
          {authBlock}
          {brandBlock}
        </div>
      </aside>

      {/* ════════ Mobile header bar (< 1024px) ════════ */}
      <header className="lg:hidden fixed top-0 left-0 right-0 z-50 flex items-center justify-between bg-night px-4 py-3">
        <Link href="/" className="flex items-center gap-2">
          <Image src="/logo.png" alt="AstroGuru" width={36} height={36} className="rounded-full" />
          <span className="text-white font-heading font-bold text-base">
            Astro<span className="text-bhagva">Guru</span>
          </span>
        </Link>

        <button
          onClick={() => setDrawerOpen(!drawerOpen)}
          className="text-white p-2 hover:bg-white/10 rounded-lg transition-colors"
          aria-label={drawerOpen ? "Close menu" : "Open menu"}
        >
          {drawerOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </header>

      {/* ════════ Mobile drawer overlay ════════ */}
      {drawerOpen && (
        <div
          className="lg:hidden fixed inset-0 z-40 bg-black/50"
          onClick={() => setDrawerOpen(false)}
        />
      )}

      {/* ════════ Mobile slide-out drawer ════════ */}
      <aside
        className={`
          lg:hidden fixed top-0 left-0 bottom-0 w-[280px] z-50 bg-night
          flex flex-col px-4 py-8 pt-20
          transition-transform duration-300 ease-in-out
          ${drawerOpen ? "translate-x-0" : "-translate-x-full"}
        `}
      >
        <div className="flex-1 overflow-y-auto">
          {navList}
        </div>
        <div className="flex flex-col gap-6">
          {authBlock}
          {brandBlock}
        </div>
      </aside>
    </>
  );
}
