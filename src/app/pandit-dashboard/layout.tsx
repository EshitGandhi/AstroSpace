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

      <div className="pt-16 lg:pt-8 pb-12 px-4 md:px-6">
        <div className="max-w-7xl mx-auto">{children}</div>
      </div>
    </div>
  );
}
