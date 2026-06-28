import { NextResponse } from "next/server";
import { getSession } from "@/lib/session";
import { endSession } from "@/lib/services/consultation";

export async function POST(req: Request, { params }: { params: { id: string } }) {
  try {
    const session = await getSession();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const consultation = await endSession(params.id);
    return NextResponse.json(consultation);
  } catch (err: any) {
    const errorMap: Record<string, number> = {
      NOT_FOUND: 404,
      INVALID_STATUS: 400,
    };
    const status = errorMap[err.message] || 500;
    return NextResponse.json({ error: err.message }, { status });
  }
}
