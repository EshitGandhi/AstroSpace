import { NextResponse } from "next/server";
import { getSession } from "@/lib/session";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const session = await getSession();
    if (session?.user?.role !== "ADMIN") return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const contexts = await prisma.chatbotContext.findMany({ orderBy: { createdAt: "desc" } });
    return NextResponse.json(contexts);
  } catch (error) {
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const session = await getSession();
    if (session?.user?.role !== "ADMIN") return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const body = await req.json();
    const { keyword, reply, isButton, buttonLabel } = body;

    const context = await prisma.chatbotContext.create({
      data: { keyword: keyword.toLowerCase(), reply, isButton, buttonLabel },
    });

    return NextResponse.json(context);
  } catch (error) {
    return NextResponse.json({ error: "Failed to create context" }, { status: 500 });
  }
}
