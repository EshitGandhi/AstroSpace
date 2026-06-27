"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";
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
} from "lucide-react";

export default function AstrologerDashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  const navItems = [
    { name: "Dashboard", href: "/pandit-dashboard", icon: LayoutDashboard },
    { name: "My Profile", href: "/pandit-dashboard/profile", icon: User },
    { name: "Availability", href: "/pandit-dashboard/availability", icon: Clock },
    { name: "Pricing", href: "/pandit-dashboard/pricing", icon: IndianRupee },
    { name: "Bookings", href: "/pandit-dashboard/bookings", icon: Calendar },
    { name: "Wallet", href: "/pandit-dashboard/wallet", icon: Wallet },
    { name: "Reviews", href: "/pandit-dashboard/reviews", icon: Star },
    { name: "Settings", href: "/pandit-dashboard/settings", icon: Settings },
  ];

  return (
    <div className="bg-cream min-h-screen pt-24 pb-12 px-4 md:px-6">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row gap-8">
        {/* Sidebar */}
        <aside className="w-full md:w-64 flex-shrink-0">
          <div className="bg-white rounded-2xl shadow-sm border border-ink/5 p-4 flex flex-col gap-2 sticky top-24">
            {navItems.map((item) => {
              const isActive = pathname === item.href;
              const Icon = item.icon;
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-colors font-medium text-sm ${
                    isActive
                      ? "bg-bhagva text-white shadow-md shadow-bhagva/20"
                      : "text-ink hover:bg-cream-tint hover:text-bhagva"
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  {item.name}
                </Link>
              );
            })}
            
            <div className="h-px bg-ink/10 my-2" />
            
            <button
              onClick={() => signOut({ callbackUrl: "/" })}
              className="flex items-center gap-3 px-4 py-3 rounded-xl transition-colors font-medium text-sm text-red-600 hover:bg-red-50"
            >
              <LogOut className="w-5 h-5" />
              Logout
            </button>
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1">
          {children}
        </main>
      </div>
    </div>
  );
}
