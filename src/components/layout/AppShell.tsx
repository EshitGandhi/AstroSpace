"use client";

import { usePathname } from "next/navigation";
import NavRail from "@/components/layout/NavRail";
import Footer from "@/components/layout/Footer";

const PANDIT_DASHBOARD_PREFIX = "/pandit-dashboard";

export default function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isPanditDashboard = pathname.startsWith(PANDIT_DASHBOARD_PREFIX);

  return (
    <>
      {!isPanditDashboard && <NavRail />}
      <div className="min-h-screen flex flex-col bg-cream lg:ml-[300px] pt-16 lg:pt-0">
        <main className="flex-1 bg-cream">{children}</main>
        <Footer />
      </div>
    </>
  );
}
