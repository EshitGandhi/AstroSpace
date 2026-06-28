import { NextResponse } from "next/server";
import { getSession } from "@/lib/session";
import { startSession, endSession } from "@/lib/services/consultation";
import { prisma } from "@/lib/prisma";

export async function GET(req: Request, { params }: { params: { id: string } }) {
  try {
    const session = await getSession();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const consultation = await prisma.consultation.findUnique({
      where: { id: params.id },
      include: {
        pandit: { select: { displayName: true, profileImage: true, userId: true } },
        user: { select: { name: true, id: true } },
      },
    });

    if (!consultation) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    // Only allow participants to view
    if (consultation.userId !== session.user.id && consultation.pandit.userId !== session.user.id) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    return NextResponse.json(consultation);
  } catch (err) {
    console.error("Get consultation error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
