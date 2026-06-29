"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useSession, signOut } from "next-auth/react";
import {
  LayoutDashboard,
  User,
  Clock,
  IndianRupee,
  Calendar,
  Wallet,
  Star,
  Settings,
  LogOut,
  Menu,
  X,
  MessageSquare,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import NotificationBell from "@/components/layout/NotificationBell";

const RAIL_ORANGE = "#FF6B00";

const NAV_ITEMS: { name: string; href: string; icon: LucideIcon }[] = [
  { name: "Dashboard", href: "/pandit-dashboard", icon: LayoutDashboard },
  { name: "Consultations", href: "/pandit-dashboard/consultations", icon: MessageSquare },
  { name: "My Profile", href: "/pandit-dashboard/profile", icon: User },
  { name: "Availability", href: "/pandit-dashboard/availability", icon: Clock },
  { name: "Pricing", href: "/pandit-dashboard/pricing", icon: IndianRupee },
  { name: "Bookings", href: "/pandit-dashboard/bookings", icon: Calendar },
  { name: "Wallet", href: "/pandit-dashboard/wallet", icon: Wallet },
  { name: "Reviews", href: "/pandit-dashboard/reviews", icon: Star },
  { name: "Settings", href: "/pandit-dashboard/settings", icon: Settings },
];

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
      className={`nav-rail-link group flex items-center gap-3 py-2 px-2 transition-colors ${active
        ? "text-yellow-400 opacity-100"
        : "text-white opacity-90 hover:text-yellow-400 hover:opacity-100"
        }`}
    >
      <Icon className="w-5 h-5 shrink-0" strokeWidth={2.25} aria-hidden />
      <span className="nav-rail-label text-xs leading-tight">{item.name}</span>
    </Link>
  );
}

function BrandBlock({ onNavigate }: { onNavigate?: () => void }) {
  return (
    <Link
      href="/pandit-dashboard"
      onClick={onNavigate}
      className="block w-full mt-auto pt-4 pb-4"
      aria-label="Pandit dashboard home"
    >
      <div className="flex flex-col items-center justify-center">
        {/* Larger cream-background circle to blend with the logo background perfectly */}
        <div className="relative w-[150px] h-[150px] rounded-full bg-[#FFF8F0] border-2 border-yellow-500/30 flex items-center justify-center shadow-2xl overflow-hidden group hover:border-yellow-500 transition-all duration-300">
          <Image
            src="/logo.png"
            alt="AstroGuru Logo"
            width={140}
            height={140}
            className="object-cover scale-110 group-hover:scale-115 transition-transform duration-300 pointer-events-none select-none"
            priority
          />
        </div>
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
        <div className="flex items-center gap-2 px-1">
          <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
            {session.user.name?.charAt(0).toUpperCase()}
          </div>
          <span className="text-white text-xs font-semibold truncate nav-rail-label-sm">
            {session.user.name}
          </span>
        </div>
        <div className="flex items-center justify-between px-1">
          <NotificationBell />
          <button
            onClick={() => {
              onNavigate?.();
              signOut({ callbackUrl: "/" });
            }}
            className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-white/80 hover:text-white transition-colors"
          >
            <LogOut className="w-4 h-4" strokeWidth={2.5} />
            Sign Out
          </button>
        </div>
      </div>
    );
  }

  return null;
}

function RailContent({ onNavigate, className = "" }: { onNavigate?: () => void; className?: string }) {
  const pathname = usePathname();

  return (
    <div className={`flex flex-col h-full px-4 py-5 ${className}`}>
      <nav className="flex flex-col gap-0.5 pt-1" aria-label="Pandit dashboard navigation">
        {NAV_ITEMS.map((item) => (
          <NavLink
            key={item.href}
            item={item}
            active={pathname === item.href}
            onNavigate={onNavigate}
          />
        ))}
      </nav>
      <div className="flex flex-col flex-1 min-h-0">
        <AuthBlock onNavigate={onNavigate} />
        <BrandBlock onNavigate={onNavigate} />
      </div>
    </div>
  );
}

export default function PanditDashboardSidebar() {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const closeDrawer = () => setDrawerOpen(false);

  return (
    <>
      {/* Desktop rail */}
      <aside
        className="hidden lg:flex fixed left-0 top-0 bottom-0 w-[240px] z-50 flex-col"
        style={{ backgroundColor: RAIL_ORANGE }}
      >
        <RailContent />
      </aside>

      {/* Mobile header */}
      <header
        className="lg:hidden fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-4 py-2.5 shadow-md"
        style={{ backgroundColor: RAIL_ORANGE }}
      >
        <Link href="/pandit-dashboard" className="flex items-center gap-2">
          {/* Logo container matching user mobile layout */}
          <div className="relative h-10 w-10 rounded-full bg-[#FFF8F0] border border-yellow-500/20 overflow-hidden flex items-center justify-center">
            <Image
              src="/logo.png"
              alt="AstroGuru"
              width={40}
              height={40}
              className="object-cover scale-110"
            />
          </div>
          <span className="nav-rail-label text-sm text-white">ASTRO GURU</span>
        </Link>
        <div className="flex items-center gap-2">
          <NotificationBell light />
          <button
            type="button"
            onClick={() => setDrawerOpen(!drawerOpen)}
            className="text-white p-2 rounded-lg hover:bg-white/10 transition-colors"
            aria-label={drawerOpen ? "Close menu" : "Open menu"}
            aria-expanded={drawerOpen}
          >
            {drawerOpen ? (
              <X className="w-6 h-6" strokeWidth={2.5} />
            ) : (
              <Menu className="w-6 h-6" strokeWidth={2.5} />
            )}
          </button>
        </div>
      </header>

      {drawerOpen && (
        <div
          className="lg:hidden fixed inset-0 z-40 bg-black/50"
          onClick={closeDrawer}
          aria-hidden
        />
      )}

      {/* Mobile drawer */}
      <aside
        className={`lg:hidden fixed top-0 left-0 bottom-0 w-[min(100vw,240px)] z-50 transition-transform duration-300 ease-in-out ${drawerOpen ? "translate-x-0" : "-translate-x-full"
          }`}
        style={{ backgroundColor: RAIL_ORANGE }}
        aria-hidden={!drawerOpen}
      >
        <div className="pt-14 h-full">
          <RailContent onNavigate={closeDrawer} />
        </div>
      </aside>
    </>
  );
}
