import { redirect } from "next/navigation";
import { getSession } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import GlassCard from "@/components/ui/GlassCard";
import ProfileForm from "./ProfileForm";

export default async function AstrologerProfilePage() {
  const session = await getSession();

  if (!session?.user?.id || session.user.role !== "ASTROLOGER") {
    redirect("/sign-in");
  }

  const userId = session.user.id;

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { name: true, email: true, mobile: true },
  });

  const profile = await prisma.astrologerProfile.findUnique({
    where: { userId },
  });

  if (!profile || !user) {
    return <div>Profile not found.</div>;
  }

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-heading font-bold mb-6 text-ink">My Profile</h1>
      
      <GlassCard className="p-6 md:p-8">
        <ProfileForm profile={profile} user={user} />
      </GlassCard>
    </div>
  );
}
