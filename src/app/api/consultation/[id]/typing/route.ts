import { NextResponse } from "next/server";
import { getSession } from "@/lib/session";
import { startSessionOnTyping } from "@/lib/services/consultation";

export async function POST(_req: Request, { params }: { params: { id: string } }) {
  try {
    const session = await getSession();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const result = await startSessionOnTyping(params.id, session.user.id);
    return NextResponse.json(result);
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Internal server error";
    if (message === "ALREADY_STARTED") {
      return NextResponse.json({ started: false, alreadyStarted: true });
    }
    const errorMap: Record<string, number> = {
      NOT_FOUND: 404,
      UNAUTHORIZED: 403,
      INVALID_MODE: 400,
      INVALID_STATUS: 400,
      INSUFFICIENT_BALANCE: 402,
      JOIN_WINDOW_EXPIRED: 410,
    };
    const status = errorMap[message] || 500;
    return NextResponse.json({ error: message }, { status });
  }
}
