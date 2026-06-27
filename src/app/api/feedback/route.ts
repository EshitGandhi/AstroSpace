import { NextResponse } from "next/server";
import prisma from "@/lib/prisma"; // Assuming standard prisma client setup is here
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    const body = await req.json();
    
    const { feedback, category = "General", currentPage } = body;

    if (!feedback || feedback.trim().length === 0) {
      return NextResponse.json({ error: "Feedback content is required" }, { status: 400 });
    }

    const userId = session?.user?.id || null;
    const role = session?.user?.role || "GUEST";
    const name = session?.user?.name || "Guest User";
    const email = session?.user?.email || null;

    const newFeedback = await prisma.feedback.create({
      data: {
        userId,
        role,
        name,
        email,
        feedback,
        category,
        currentPage,
        status: "New"
      }
    });

    return NextResponse.json({ success: true, data: newFeedback }, { status: 201 });
  } catch (error) {
    console.error("Feedback creation error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
