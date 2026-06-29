import { NextResponse } from "next/server";
import { getSession } from "@/lib/session";
import { processBillingTick } from "@/lib/services/consultation";

export async function POST(req: Request, { params }: { params: { id: string } }) {
  try {
    const session = await getSession();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const result = await processBillingTick(params.id);
    return NextResponse.json(result);
  } catch (err) {
    console.error("Billing tick error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
