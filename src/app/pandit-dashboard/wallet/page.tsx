import { redirect } from "next/navigation";
import { getSession } from "@/lib/session";
import GlassCard from "@/components/ui/GlassCard";
import { Wallet, Info } from "lucide-react";

export default async function AstrologerWalletPage() {
  const session = await getSession();

  if (!session?.user?.id || session.user.role !== "ASTROLOGER") {
    redirect("/sign-in");
  }

  return (
    <div className="space-y-6">
      <div className="mb-6">
        <h1 className="text-3xl font-heading font-bold text-ink flex items-center gap-3">
          <Wallet className="w-8 h-8 text-bhagva" />
          Wallet & Earnings
        </h1>
        <p className="text-ink-muted mt-2">
          Manage your earnings, view transaction history, and request payouts.
        </p>
      </div>
      
      <GlassCard className="p-8 md:p-12 text-center border-dashed border-2 border-ink/20">
        <div className="max-w-md mx-auto flex flex-col items-center">
          <div className="w-20 h-20 bg-cream rounded-full flex items-center justify-center mb-6">
            <Wallet className="w-10 h-10 text-bhagva opacity-50" />
          </div>
          <h2 className="text-2xl font-bold text-ink mb-3 font-heading">
            Coming Soon
          </h2>
          <p className="text-ink-muted mb-8 leading-relaxed">
            We are currently building the comprehensive Wallet and Earnings system. You will soon be able to track all your consultation revenues, view detailed transaction logs, and initiate withdrawals directly to your bank account.
          </p>
          <div className="flex items-center gap-2 text-sm text-bhagva bg-cream-tint px-4 py-2 rounded-lg font-medium">
            <Info className="w-4 h-4" />
            <p>This feature will be available in the next update.</p>
          </div>
        </div>
      </GlassCard>
    </div>
  );
}
