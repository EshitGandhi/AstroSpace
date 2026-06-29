"use client";

import PanditDashboardSidebar from "@/components/pandit-dashboard/PanditDashboardSidebar";

export default function AstrologerDashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="bg-cream min-h-screen">
      <PanditDashboardSidebar />

      <div className="lg:ml-[240px] pt-14 lg:pt-0 pb-12 px-4 md:px-6">
        <div className="max-w-7xl mx-auto">{children}</div>
      </div>
    </div>
  );
}
