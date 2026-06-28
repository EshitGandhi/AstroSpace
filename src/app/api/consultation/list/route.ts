import { NextResponse } from "next/server";
import { getSession } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { expireStaleConsultations } from "@/lib/services/consultation";

export async function GET(req: Request) {
  try {
    const session = await getSession();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await expireStaleConsultations();

    const { searchParams } = new URL(req.url);
    const status = searchParams.get("status");
    const role = searchParams.get("role") || "user"; // "user" or "pandit"

    let whereClause: Record<string, unknown> = {};

    if (role === "pandit") {
      // Get pandit's profile ID
      const profile = await prisma.astrologerProfile.findUnique({
        where: { userId: session.user.id },
        select: { id: true },
      });
      if (!profile) {
        return NextResponse.json({ error: "Pandit profile not found" }, { status: 404 });
      }
      whereClause.panditId = profile.id;
    } else {
      whereClause.userId = session.user.id;
    }

    if (status) {
      const statuses = status.split(",");
      whereClause.status = { in: statuses };
    }

    const consultations = await prisma.consultation.findMany({
      where: whereClause,
      include: {
        pandit: {
          select: {
            id: true,
            displayName: true,
            profileImage: true,
            chatPrice: true,
            callPrice: true,
            videoCallPrice: true,
            userId: true,
          },
        },
        user: {
          select: { id: true, name: true, email: true },
        },
      },
      orderBy: { createdAt: "desc" },
      take: 50,
    });

    return NextResponse.json(consultations);
  } catch (err) {
    console.error("List consultations error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
