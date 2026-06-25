import { auth, currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import type { Metadata } from "next";
import ProfileEditClient from "@/components/profile/ProfileEditClient";

export const metadata: Metadata = {
  title: "My Profile | AstroGuru",
  description: "View and update your astrological profile — birth details, location, and personal information.",
};

export default async function ProfilePage() {
  const { userId } = auth();
  if (!userId) redirect("/sign-in");

  // Fetch from both Clerk (name/email/avatar) and our DB (astrological details) in parallel
  const [clerkUser, dbProfile] = await Promise.all([
    currentUser(),
    prisma.userProfile.findUnique({ where: { clerkUserId: userId } }),
  ]);

  const clerkName = clerkUser
    ? [clerkUser.firstName, clerkUser.lastName].filter(Boolean).join(" ")
    : "";
  const clerkEmail = clerkUser?.primaryEmailAddress?.emailAddress ?? "";
  const clerkPhoto = clerkUser?.imageUrl ?? "";

  return (
    <ProfileEditClient
      profile={dbProfile}
      clerkName={clerkName}
      clerkEmail={clerkEmail}
      clerkPhoto={clerkPhoto}
    />
  );
}
