import { redirect } from "next/navigation";
import { getSession } from "@/lib/session";
import GlassCard from "@/components/ui/GlassCard";
import PricingManager from "./PricingManager";

export default async function AstrologerPricingPage() {
  const session = await getSession();

  if (!session?.user?.id || session.user.role !== "ASTROLOGER") {
    redirect("/sign-in");
  }

  return (
    <div className="space-y-6">
      <div className="mb-6">
        <h1 className="text-3xl font-heading font-bold text-ink">Manage Pricing</h1>
        <p className="text-ink-muted mt-2">
          Set custom prices for different consultation durations and types (Call, Chat, Video).
        </p>
      </div>
      
      <GlassCard className="p-6 md:p-8">
        <PricingManager />
      </GlassCard>
    </div>
  );
}
