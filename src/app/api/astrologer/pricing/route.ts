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
      select: { pricingPackages: true },
    });

    return NextResponse.json({ pricingPackages: profile?.pricingPackages || [] });
  } catch (err) {
    console.error("[GET_PRICING_PACKAGES]", err);
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

    if (!Array.isArray(data.pricingPackages)) {
      return NextResponse.json({ error: "Pricing packages must be an array" }, { status: 400 });
    }

    const updatedProfile = await prisma.astrologerProfile.update({
      where: { userId: session.user.id },
      data: { pricingPackages: data.pricingPackages },
    });

    return NextResponse.json({ pricingPackages: updatedProfile.pricingPackages });
  } catch (err) {
    console.error("[UPDATE_PRICING_PACKAGES]", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
