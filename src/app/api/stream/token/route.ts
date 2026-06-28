import { NextResponse } from "next/server";
import { getSession } from "@/lib/session";
import { createStreamUserToken, getStreamServerClient } from "@/lib/stream/server";

export async function POST(req: Request) {
  try {
    const session = await getSession();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const client = getStreamServerClient();
    if (!client) {
      return NextResponse.json({ error: "Stream not configured" }, { status: 503 });
    }

    const { name } = await req.json().catch(() => ({ name: session.user.name }));

    await client.upsertUser({
      id: session.user.id,
      name: name || session.user.name,
      role: session.user.role === "ASTROLOGER" ? "admin" : "user",
    });

    const token = createStreamUserToken(session.user.id);
    if (!token) {
      return NextResponse.json({ error: "Failed to create token" }, { status: 500 });
    }

    return NextResponse.json({
      token,
      apiKey: process.env.NEXT_PUBLIC_STREAM_API_KEY,
      userId: session.user.id,
    });
  } catch (err) {
    console.error("Stream token error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
