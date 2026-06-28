import { NextResponse } from "next/server";
import { getSession } from "@/lib/session";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  try {
    const session = await getSession();
    if (!session?.user?.id || session.user.role !== "ASTROLOGER") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { profileId, isOnline } = await req.json();

    // Verify ownership
    const profile = await prisma.astrologerProfile.findUnique({
      where: { id: profileId },
    });

    if (!profile || profile.userId !== session.user.id) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const updated = await prisma.astrologerProfile.update({
      where: { id: profileId },
      data: { isOnline: Boolean(isOnline) },
    });

    return NextResponse.json({ isOnline: updated.isOnline });
  } catch (err) {
    console.error("Toggle availability error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
