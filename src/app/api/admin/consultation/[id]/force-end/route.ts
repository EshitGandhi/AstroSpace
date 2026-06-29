import { NextResponse } from "next/server";
import { getSession } from "@/lib/session";
import { endSession, releaseLockedBalance } from "@/lib/services/consultation";
import { prisma } from "@/lib/prisma";

export async function POST(_req: Request, { params }: { params: { id: string } }) {
  try {
    const session = await getSession();
    if (!session?.user?.id || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const consultation = await prisma.consultation.findUnique({ where: { id: params.id } });
    if (!consultation) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    if (consultation.status === "ONGOING") {
      await endSession(params.id);
    } else {
      await prisma.consultation.update({
        where: { id: params.id },
        data: { status: "CANCELLED", endedAt: new Date() },
      });
      await releaseLockedBalance(params.id);
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("Force end error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
