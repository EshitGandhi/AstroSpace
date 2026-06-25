import { redirect } from "next/navigation";
import { getSession } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import type { Metadata } from "next";
import ProfileEditClient from "@/components/profile/ProfileEditClient";

export const metadata: Metadata = {
  title: "My Profile | AstroGuru",
  description: "View and update your astrological profile — birth details, location, and personal information.",
};

export default async function ProfilePage() {
  const session = await getSession();
  if (!session?.user?.id) redirect("/sign-in");

  const dbProfile = await prisma.userProfile.findUnique({
    where: { userId: session.user.id },
  });

  return (
    <ProfileEditClient
      profile={dbProfile}
      clerkName={session.user.name ?? ""}
      clerkEmail={session.user.email ?? ""}
      clerkPhoto=""
    />
  );
}
