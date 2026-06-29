import { NextResponse } from "next/server";
import { getSession } from "@/lib/session";
import { getTransactions } from "@/lib/services/wallet";

export async function GET(req: Request) {
  try {
    const session = await getSession();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const transactions = await getTransactions(session.user.id, 100);
    return NextResponse.json(transactions);
  } catch (err) {
    console.error("Get transactions error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
