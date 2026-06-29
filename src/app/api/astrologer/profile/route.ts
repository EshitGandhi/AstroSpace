import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/session";
import { prisma } from "@/lib/prisma";

export async function PUT(req: NextRequest) {
  try {
    const session = await getSession();

    if (!session?.user?.id || session.user.role !== "ASTROLOGER") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const data = await req.json();

    const allowedFields = [
      "displayName", "profileImage", "experience", "bio", 
      "expertise", "languages", "aadhaarNumber", "panNumber",
      "chatPrice", "callPrice", "videoCallPrice",
      "workingDays", "timeSlots", 
      "website", "instagram", "facebook", "youtube"
    ];

    const updateData: any = {};
    for (const key of allowedFields) {
      if (data[key] !== undefined) {
        // Experience is Int, Prices are Int
        if (["experience", "chatPrice", "callPrice", "videoCallPrice"].includes(key)) {
          updateData[key] = data[key] ? parseInt(data[key], 10) : null;
        } else {
          updateData[key] = data[key];
        }
      }
    }

    // First update the profile
    await prisma.astrologerProfile.update({
      where: { userId: session.user.id },
      data: updateData,
    });

    // Fetch full profile to calculate completion
    const fullProfile = await prisma.astrologerProfile.findUnique({
      where: { userId: session.user.id },
    });

    if (fullProfile) {
      const completionFields = [
        "displayName", "profileImage", "experience", "bio",
        "expertise", "languages", "aadhaarNumber", 
        "chatPrice", "workingDays", "timeSlots"
      ]; // Fields that count towards 100% completion (optional ones like social links don't count)

      let filledCount = 0;
      for (const field of completionFields) {
        const val = (fullProfile as any)[field];
        if (val !== null && val !== undefined && val !== "") {
          if (Array.isArray(val) && val.length === 0) continue;
          filledCount++;
        }
      }

      const percentage = Math.round((filledCount / completionFields.length) * 100);

      // Update completion percentage
      const updatedProfile = await prisma.astrologerProfile.update({
        where: { userId: session.user.id },
        data: { profileCompletion: percentage },
      });

      return NextResponse.json(updatedProfile);
    }

    return NextResponse.json({ error: "Profile not found" }, { status: 404 });
  } catch (err) {
    console.error("[UPDATE_ASTROLOGER_PROFILE]", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
