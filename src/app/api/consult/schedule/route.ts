import { NextResponse } from "next/server";
import { getSession } from "@/lib/session";
import { createConsultationRequest } from "@/lib/services/consultation";
import { ConsultMode } from "@prisma/client";

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

    const consultation = await createConsultationRequest({
      userId: session.user.id,
      panditId,
      mode: mode as ConsultMode,
      isInstant: false,
      scheduledTime: new Date(scheduledTime),
      description: notes,
    });

    return NextResponse.json(consultation);
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Failed to schedule consultation";
    const errorMap: Record<string, number> = {
      PANDIT_OFFLINE: 400,
      INSUFFICIENT_BALANCE: 402,
      USER_HAS_ACTIVE_CONSULTATION: 409,
      PANDIT_BUSY: 409,
    };
    const status = errorMap[message] || 500;
    return NextResponse.json({ error: message }, { status });
  }
}
