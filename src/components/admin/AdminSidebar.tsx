"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useSession, signOut } from "next-auth/react";
import {
  LayoutDashboard,
  Users,
  MessageSquare,
  Bot,
  LogOut,
  Menu,
  X,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import NotificationBell from "@/components/layout/NotificationBell";

const RAIL_ORANGE = "#FF6B00";

const NAV_ITEMS: { name: string; href: string; icon: LucideIcon }[] = [
  { name: "Dashboard", href: "/admin", icon: LayoutDashboard },
  { name: "Pandits", href: "/admin/pandits", icon: Users },
  { name: "Feedback", href: "/admin/feedback", icon: MessageSquare },
  { name: "Chatbot Settings", href: "/admin/chatbot", icon: Bot },
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
      className={`nav-rail-link group flex items-center gap-4 py-3 px-2 transition-colors ${
        active
          ? "text-yellow-400 opacity-100"
          : "text-white opacity-90 hover:text-yellow-400 hover:opacity-100"
      }`}
    >
      <Icon className="w-7 h-7 shrink-0" strokeWidth={2.25} aria-hidden />
      <span className="nav-rail-label text-sm sm:text-base leading-tight">{item.name}</span>
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
      <div className="flex flex-col gap-2 py-3 border-t border-white/20 mt-auto">
        <div className="flex items-center gap-2.5 px-1">
          <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
            {session.user.name?.charAt(0).toUpperCase()}
          </div>
          <span className="text-white text-xs font-semibold truncate nav-rail-label-sm">
            {session.user.name}
          </span>
        </div>
        
        <button
          onClick={() => {
            onNavigate?.();
            signOut({ callbackUrl: "/" });
          }}
          className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-white/80 hover:text-white transition-colors px-1 nav-rail-label-sm"
        >
          <LogOut className="w-4 h-4" strokeWidth={2.5} />
          Logout
        </button>
      </div>
    );
  }

  return null;
}

function RailContent({ onNavigate, className = "" }: { onNavigate?: () => void; className?: string }) {
  const pathname = usePathname();

  return (
    <div className={`flex flex-col h-full px-5 py-8 ${className}`}>
      <div className="text-white font-bold text-xl mb-8 px-2 flex items-center gap-2">
        Admin Portal
      </div>
      <nav className="flex flex-col gap-1 pt-2 flex-1" aria-label="Admin navigation">
        {NAV_ITEMS.map((item) => (
          <NavLink
            key={item.href}
            item={item}
            active={pathname === item.href}
            onNavigate={onNavigate}
          />
        ))}
        <AuthBlock onNavigate={onNavigate} />
      </nav>
    </div>
  );
}

export default function AdminSidebar() {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const closeDrawer = () => setDrawerOpen(false);

  return (
    <>
      <aside
        className="hidden lg:flex fixed left-0 top-0 bottom-0 w-[300px] z-50 flex-col"
        style={{ backgroundColor: RAIL_ORANGE }}
      >
        <RailContent />
      </aside>

      <header
        className="lg:hidden fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-4 py-3 shadow-md"
        style={{ backgroundColor: RAIL_ORANGE }}
      >
        <Link href="/admin" className="flex items-center gap-2">
          <Image
            src="/guru-sidebar-reference.png"
            alt="AstroGuru"
            width={40}
            height={40}
            className="h-10 w-10 rounded-full object-cover object-[center_75%]"
          />
          <span className="nav-rail-label text-base text-white">ADMIN PORTAL</span>
        </Link>
        <div className="flex items-center gap-2">
          <NotificationBell light />
          <button
            type="button"
            onClick={() => setDrawerOpen(!drawerOpen)}
            className="text-white p-2 rounded-lg hover:bg-white/10 transition-colors"
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

      <aside
        className={`lg:hidden fixed top-0 left-0 bottom-0 w-[min(100vw,300px)] z-50 transition-transform duration-300 ease-in-out ${
          drawerOpen ? "translate-x-0" : "-translate-x-full"
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
