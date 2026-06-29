import { NextResponse } from "next/server";
import { getSession } from "@/lib/session";
import { createConsultationRequest } from "@/lib/services/consultation";

export async function POST(req: Request) {
  try {
    const session = await getSession();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const {
      panditId,
      mode,
      isInstant,
      scheduledTime,
      packageId,
      duration,
      perMinutePrice,
      originalPrice,
      discountedPrice,
      discountPercentage,
    } = body;

    if (!panditId || !mode) {
      return NextResponse.json({ error: "panditId and mode are required" }, { status: 400 });
    }

    if (!["CHAT", "VOICE", "VIDEO"].includes(mode)) {
      return NextResponse.json({ error: "Invalid mode" }, { status: 400 });
    }

    const consultation = await createConsultationRequest({
      userId: session.user.id,
      panditId,
      mode,
      isInstant: isInstant !== false,
      scheduledTime: scheduledTime ? new Date(scheduledTime) : undefined,
      packageId,
      duration,
      perMinutePrice,
      originalPrice,
      discountedPrice,
      discountPercentage,
    });

    return NextResponse.json(consultation, { status: 201 });
  } catch (err: any) {
    const knownErrors: Record<string, { msg: string; status: number }> = {
      USER_HAS_ACTIVE_CONSULTATION: { msg: "You already have an active consultation.", status: 409 },
      PANDIT_BUSY: { msg: "This pandit is currently in a session.", status: 409 },
      PANDIT_NOT_FOUND: { msg: "Pandit not found.", status: 404 },
      PANDIT_OFFLINE: { msg: "This pandit is currently offline.", status: 400 },
      INSUFFICIENT_BALANCE: { msg: "Insufficient wallet balance. Minimum ₹50 required.", status: 402 },
    };

    const known = knownErrors[err.message];
    if (known) {
      return NextResponse.json({ error: known.msg }, { status: known.status });
    }

    console.error("Create consultation error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
