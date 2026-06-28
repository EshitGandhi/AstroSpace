import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/session";

export async function POST(req: Request) {
  try {
    const session = await getSession();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const data = await req.json();
    const { panditId, mode, scheduledTime, notes } = data;

    if (!panditId || !mode || !scheduledTime) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const consultation = await prisma.consultation.create({
      data: {
        userId: session.user.id,
        panditId,
        mode,
        scheduledTime: new Date(scheduledTime),
      }
    });

    return NextResponse.json(consultation);
  } catch (err) {
    console.error("Failed to schedule consultation:", err);
    return NextResponse.json({ error: "Failed to schedule consultation" }, { status: 500 });
  }
}
