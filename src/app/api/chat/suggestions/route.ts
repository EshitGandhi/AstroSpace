import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const adminContexts = await prisma.chatbotContext.findMany({
      where: { isButton: true, buttonLabel: { not: null } }
    });
    const suggestions = adminContexts.map(c => c.buttonLabel as string);
    return NextResponse.json(suggestions);
  } catch (error) {
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }
}
