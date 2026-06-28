import { NextResponse } from "next/server";
import { getSession } from "@/lib/session";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  try {
    const session = await getSession();
    if (!session?.user?.id || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { profileId, action } = await req.json();
    if (!profileId || !["approve", "reject"].includes(action)) {
      return NextResponse.json({ error: "Invalid request" }, { status: 400 });
    }

    await prisma.astrologerProfile.update({
      where: { id: profileId },
      data: { verificationStatus: action === "approve" ? "APPROVED" : "REJECTED" },
    });

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("Pandit verification error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
