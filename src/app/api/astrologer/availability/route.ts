import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/session";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  try {
    const session = await getSession();

    if (!session?.user?.id || session.user.role !== "ASTROLOGER") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const profile = await prisma.astrologerProfile.findUnique({
      where: { userId: session.user.id },
      select: { availability: true },
    });

    return NextResponse.json({ availability: profile?.availability || {} });
  } catch (err) {
    console.error("[GET_AVAILABILITY]", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    const session = await getSession();

    if (!session?.user?.id || session.user.role !== "ASTROLOGER") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const data = await req.json();

    if (!data.availability) {
      return NextResponse.json({ error: "Availability data is required" }, { status: 400 });
    }

    const updatedProfile = await prisma.astrologerProfile.update({
      where: { userId: session.user.id },
      data: { availability: data.availability },
    });

    return NextResponse.json({ availability: updatedProfile.availability });
  } catch (err) {
    console.error("[UPDATE_AVAILABILITY]", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
