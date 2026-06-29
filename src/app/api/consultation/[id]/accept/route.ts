import { NextResponse } from "next/server";
import { getSession } from "@/lib/session";
import { acceptConsultation } from "@/lib/services/consultation";
import { ensureStreamChannel, getStreamCallId } from "@/lib/stream/server";
import { prisma } from "@/lib/prisma";

export async function POST(_req: Request, { params }: { params: { id: string } }) {
  try {
    const session = await getSession();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const consultation = await acceptConsultation(params.id, session.user.id);

    const full = await prisma.consultation.findUnique({
      where: { id: params.id },
      include: {
        user: { select: { id: true, name: true } },
        pandit: { select: { userId: true, displayName: true } },
      },
    });

    if (full) {
      const streamChannelId = await ensureStreamChannel({
        consultationId: full.id,
        userId: full.user.id,
        panditUserId: full.pandit.userId,
        userName: full.user.name,
        panditName: full.pandit.displayName || "Pandit",
      });

      const streamCallId =
        full.mode === "VOICE" || full.mode === "VIDEO"
          ? getStreamCallId(full.id, full.mode)
          : null;

      if (streamChannelId || streamCallId) {
        await prisma.consultation.update({
          where: { id: full.id },
          data: {
            ...(streamChannelId ? { streamChannelId } : {}),
            ...(streamCallId ? { streamCallId } : {}),
          },
        });
      }
    }

    return NextResponse.json(consultation);
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Internal server error";
    const errorMap: Record<string, number> = {
      NOT_FOUND: 404,
      UNAUTHORIZED: 403,
      INVALID_STATUS: 400,
      REQUEST_EXPIRED: 410,
    };
    const status = errorMap[message] || 500;
    return NextResponse.json({ error: message }, { status });
  }
}
