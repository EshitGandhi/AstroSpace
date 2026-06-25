import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// GET /api/profile – fetch current user's profile
export async function GET() {
  const { userId } = auth();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const profile = await prisma.userProfile.findUnique({
    where: { clerkUserId: userId },
  });

  const response = NextResponse.json(profile ?? null);

  // Re-set cookie in case the user is on a new device / cleared cookies
  if (profile?.profileComplete) {
    response.cookies.set("profile_complete", "1", {
      httpOnly: false,
      path: "/",
      maxAge: 60 * 60 * 24 * 365,
      sameSite: "lax",
    });
  }

  return response;
}


// POST /api/profile – upsert current user's profile
export async function POST(req: NextRequest) {
  const { userId } = auth();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json();

  const {
    photoUrl,
    gender,
    dateOfBirth,
    timeOfBirth,
    birthTimeUnknown,
    birthCity,
    birthState,
    birthCountry,
    birthLat,
    birthLng,
    birthTimezone,
    currentCity,
    currentLat,
    currentLng,
    language,
    maritalStatus,
    caste,
  } = body;

  const profileComplete = Boolean(
    gender && dateOfBirth && birthCity && birthCountry
  );

  try {
    const profile = await prisma.userProfile.upsert({
      where: { clerkUserId: userId },
      create: {
        clerkUserId: userId,
        photoUrl: photoUrl ?? null,
        gender: gender ?? null,
        dateOfBirth: dateOfBirth ? new Date(dateOfBirth) : null,
        timeOfBirth: timeOfBirth ?? null,
        birthTimeUnknown: birthTimeUnknown ?? false,
        birthCity: birthCity ?? null,
        birthState: birthState ?? null,
        birthCountry: birthCountry ?? null,
        birthLat: birthLat ?? null,
        birthLng: birthLng ?? null,
        birthTimezone: birthTimezone ?? null,
        currentCity: currentCity ?? null,
        currentLat: currentLat ?? null,
        currentLng: currentLng ?? null,
        language: language ?? "English",
        maritalStatus: maritalStatus ?? null,
        caste: caste ?? null,
        profileComplete,
      },
      update: {
        photoUrl: photoUrl ?? undefined,
        gender: gender ?? undefined,
        dateOfBirth: dateOfBirth ? new Date(dateOfBirth) : undefined,
        timeOfBirth: timeOfBirth ?? undefined,
        birthTimeUnknown: birthTimeUnknown ?? undefined,
        birthCity: birthCity ?? undefined,
        birthState: birthState ?? undefined,
        birthCountry: birthCountry ?? undefined,
        birthLat: birthLat ?? undefined,
        birthLng: birthLng ?? undefined,
        birthTimezone: birthTimezone ?? undefined,
        currentCity: currentCity ?? undefined,
        currentLat: currentLat ?? undefined,
        currentLng: currentLng ?? undefined,
        language: language ?? undefined,
        maritalStatus: maritalStatus ?? undefined,
        caste: caste ?? undefined,
        profileComplete,
      },
    });

    const response = NextResponse.json(profile, { status: 200 });
    // Cookie lets middleware know this user has a saved profile (avoids DB in edge)
    response.cookies.set("profile_complete", "1", {
      httpOnly: false,
      path: "/",
      maxAge: 60 * 60 * 24 * 365, // 1 year
      sameSite: "lax",
    });
    return response;
  } catch (err) {
    console.error("Profile upsert error:", err);
    return NextResponse.json({ error: "Failed to save profile" }, { status: 500 });
  }
}

// PATCH /api/profile – partial update (only fields provided are updated)
export async function PATCH(req: NextRequest) {
  const { userId } = auth();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json();

  const allowed = [
    "photoUrl", "gender", "dateOfBirth", "timeOfBirth", "birthTimeUnknown",
    "birthCity", "birthState", "birthCountry", "birthLat", "birthLng",
    "birthTimezone", "currentCity", "currentLat", "currentLng",
    "language", "maritalStatus", "caste",
  ];

  const updateData: Record<string, unknown> = {};
  for (const key of allowed) {
    if (key in body) {
      updateData[key] = key === "dateOfBirth" && body[key]
        ? new Date(body[key])
        : body[key];
    }
  }

  // Recalculate profileComplete against merged state
  const existing = await prisma.userProfile.findUnique({ where: { clerkUserId: userId } });
  const merged = { ...existing, ...updateData };
  updateData.profileComplete = Boolean(
    merged.gender && merged.dateOfBirth && merged.birthCity && merged.birthCountry
  );

  try {
    const profile = await prisma.userProfile.upsert({
      where: { clerkUserId: userId },
      create: { clerkUserId: userId, ...updateData },
      update: updateData,
    });

    const response = NextResponse.json(profile, { status: 200 });
    if (profile.profileComplete) {
      response.cookies.set("profile_complete", "1", {
        httpOnly: false,
        path: "/",
        maxAge: 60 * 60 * 24 * 365,
        sameSite: "lax",
      });
    }
    return response;
  } catch (err) {
    console.error("Profile patch error:", err);
    return NextResponse.json({ error: "Failed to update profile" }, { status: 500 });
  }
}
