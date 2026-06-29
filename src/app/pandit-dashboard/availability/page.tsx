import { redirect } from "next/navigation";
import { getSession } from "@/lib/session";
import GlassCard from "@/components/ui/GlassCard";
import AvailabilityManager from "./AvailabilityManager";

export default async function AstrologerAvailabilityPage() {
  const session = await getSession();

  if (!session?.user?.id || session.user.role !== "ASTROLOGER") {
    redirect("/sign-in");
  }

  return (
    <div className="space-y-6">
      <div className="mb-6">
        <h1 className="text-3xl font-heading font-bold text-ink">Manage Availability</h1>
        <p className="text-ink-muted mt-2">
          Set your working hours for the upcoming 7 days to let users book consultations with you.
        </p>
      </div>
      
      <GlassCard className="p-6 md:p-8">
        <AvailabilityManager />
      </GlassCard>
    </div>
  );
}
