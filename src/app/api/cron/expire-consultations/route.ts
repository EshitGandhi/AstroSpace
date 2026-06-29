import { NextResponse } from "next/server";
import { expireStaleConsultations } from "@/lib/services/consultation";

export async function POST(req: Request) {
  const authHeader = req.headers.get("authorization");
  const cronSecret = process.env.CRON_SECRET;

  if (!cronSecret || authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const expiredCount = await expireStaleConsultations();
    return NextResponse.json({ success: true, expiredCount });
  } catch (err) {
    console.error("Cron expire error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function GET(req: Request) {
  return POST(req);
}
