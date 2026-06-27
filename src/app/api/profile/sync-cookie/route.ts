import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { setProfileCompleteCookie } from "@/lib/profile/cookies";

export async function GET(req: NextRequest) {
  const session = await getSession();

  if (!session?.user?.id) {
    return NextResponse.redirect(new URL("/sign-in", req.url));
  }

  const profile = await prisma.userProfile.findUnique({
    where: { userId: session.user.id },
  });

  if (profile?.profileComplete) {
    const response = NextResponse.redirect(new URL("/dashboard", req.url));
    setProfileCompleteCookie(response);
    return response;
  }

  return NextResponse.redirect(new URL("/profile-setup", req.url));
}
