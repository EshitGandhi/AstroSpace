"use client";

import { usePathname } from "next/navigation";
import NavRail from "@/components/layout/NavRail";
import Footer from "@/components/layout/Footer";

const HIDE_NAV_RAIL_PREFIXES = ["/pandit-dashboard"];

export default function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const hideNavRail = HIDE_NAV_RAIL_PREFIXES.some((prefix) => pathname.startsWith(prefix));

  return (
    <>
      {!hideNavRail && <NavRail />}
      <div
        className={`min-h-screen flex flex-col bg-cream ${
          hideNavRail ? "" : "lg:ml-[300px] pt-16 lg:pt-0"
        }`}
      >
        <main className="flex-1 bg-cream">{children}</main>
        <Footer />
      </div>
    </>
  );
}
