import { NextResponse } from "next/server";
import { getSession } from "@/lib/session";
import { sendChatMessage } from "@/lib/services/consultation";

export async function POST(req: Request, { params }: { params: { id: string } }) {
  try {
    const session = await getSession();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { messageText } = await req.json();
    if (!messageText?.trim()) {
      return NextResponse.json({ error: "Message required" }, { status: 400 });
    }

    const message = await sendChatMessage(params.id, session.user.id, messageText.trim());
    return NextResponse.json(message);
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Internal server error";
    const errorMap: Record<string, number> = {
      NOT_FOUND: 404,
      UNAUTHORIZED: 403,
      INVALID_STATUS: 400,
      INSUFFICIENT_BALANCE: 402,
      JOIN_WINDOW_EXPIRED: 410,
    };
    const status = errorMap[message] || 500;
    return NextResponse.json({ error: message }, { status });
  }
}

export async function GET(_req: Request, { params }: { params: { id: string } }) {
  try {
    const session = await getSession();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { prisma } = await import("@/lib/prisma");
    const consultation = await prisma.consultation.findUnique({
      where: { id: params.id },
      include: { pandit: { select: { userId: true } } },
    });

    if (!consultation) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    if (consultation.userId !== session.user.id && consultation.pandit.userId !== session.user.id) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const messages = await prisma.consultMessage.findMany({
      where: { consultationId: params.id },
      orderBy: { createdAt: "asc" },
      include: { sender: { select: { id: true, name: true } } },
    });

    return NextResponse.json(messages);
  } catch (err) {
    console.error("Get messages error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
