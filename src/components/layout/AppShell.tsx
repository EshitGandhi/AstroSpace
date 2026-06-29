"use client";

import { usePathname } from "next/navigation";
import NavRail from "@/components/layout/NavRail";
import Footer from "@/components/layout/Footer";
import NotificationBell from "@/components/layout/NotificationBell";
import GlobalChatbot from "@/components/chatbot/GlobalChatbot";

const HIDE_NAV_RAIL_PREFIXES = ["/pandit-dashboard", "/consult/session", "/admin"];

export default function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const hideNavRail = HIDE_NAV_RAIL_PREFIXES.some((prefix) => pathname.startsWith(prefix));

  return (
    <>
      {!hideNavRail && <NavRail />}
      {/* Global Desktop Notification Bell */}
      <div className="hidden lg:block fixed top-6 right-8 z-[100]">
        <NotificationBell />
      </div>
      <div
        className={`min-h-screen flex flex-col bg-cream ${
          hideNavRail ? "" : "lg:ml-[300px] pt-16 lg:pt-0"
        }`}
      >
        <main className="flex-1 max-w-full overflow-hidden">
          {children}
        </main>
        {!pathname.startsWith("/admin") && <GlobalChatbot />}
        <Footer />
      </div>
    </>
  );
}
