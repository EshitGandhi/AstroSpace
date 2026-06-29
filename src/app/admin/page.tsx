import { getSession } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { Users, UserCheck, CreditCard, MessageSquare } from "lucide-react";
import GlassCard from "@/components/ui/GlassCard";

export default async function AdminDashboardPage() {
  const session = await getSession();
  if (session?.user?.role !== "ADMIN") {
    redirect("/");
  }

  // Fetch basic stats
  const [totalUsers, totalPandits, pendingPandits, totalRevenueAgg] = await Promise.all([
    prisma.user.count({ where: { role: "USER" } }),
    prisma.astrologerProfile.count(),
    prisma.astrologerProfile.count({ where: { verificationStatus: "PENDING" } }),
    prisma.walletTransaction.aggregate({
      where: { type: "CONSULTATION_DEBIT" },
      _sum: { amount: true },
    }),
  ]);

  const totalRevenue = Math.abs((totalRevenueAgg._sum.amount || 0) / 100);

  return (
    <div className="space-y-6">
      <div className="mb-6">
        <h1 className="text-3xl font-heading font-bold text-ink">Admin Dashboard</h1>
        <p className="text-ink-muted mt-1">Overview of website metrics and pending actions.</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <GlassCard className="p-6 flex items-center gap-4">
          <div className="w-14 h-14 bg-blue-100 rounded-2xl flex items-center justify-center text-blue-600">
            <Users className="w-7 h-7" />
          </div>
          <div>
            <div className="text-3xl font-black text-ink">{totalUsers}</div>
            <div className="text-sm font-semibold text-ink-muted">Total Users</div>
          </div>
        </GlassCard>

        <GlassCard className="p-6 flex items-center gap-4">
          <div className="w-14 h-14 bg-green-100 rounded-2xl flex items-center justify-center text-green-600">
            <UserCheck className="w-7 h-7" />
          </div>
          <div>
            <div className="text-3xl font-black text-ink">{totalPandits}</div>
            <div className="text-sm font-semibold text-ink-muted">Total Pandits</div>
          </div>
        </GlassCard>

        <GlassCard className="p-6 flex items-center gap-4">
          <div className="w-14 h-14 bg-yellow-100 rounded-2xl flex items-center justify-center text-yellow-600">
            <MessageSquare className="w-7 h-7" />
          </div>
          <div>
            <div className="text-3xl font-black text-ink">{pendingPandits}</div>
            <div className="text-sm font-semibold text-ink-muted">Pending Approvals</div>
          </div>
        </GlassCard>

        <GlassCard className="p-6 flex items-center gap-4">
          <div className="w-14 h-14 bg-purple-100 rounded-2xl flex items-center justify-center text-purple-600">
            <CreditCard className="w-7 h-7" />
          </div>
          <div>
            <div className="text-3xl font-black text-ink">₹{totalRevenue.toFixed(0)}</div>
            <div className="text-sm font-semibold text-ink-muted">Revenue</div>
          </div>
        </GlassCard>
      </div>
    </div>
  );
}
