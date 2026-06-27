import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { setProfileCompleteCookie } from "@/lib/profile/cookies";

// GET /api/profile
export async function GET() {
  const session = await getSession();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const profile = await prisma.userProfile.findUnique({
    where: { userId: session.user.id },
  });

  const response = NextResponse.json(profile ?? null);

  if (profile?.profileComplete) {
    setProfileCompleteCookie(response);
  }

  return response;
}

// POST /api/profile – full upsert (onboarding)
export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json();
  const {
    photoUrl, gender, dateOfBirth, timeOfBirth, birthTimeUnknown,
    birthCity, birthState, birthCountry, birthLat, birthLng, birthTimezone,
    currentCity, currentLat, currentLng, language, maritalStatus, caste,
  } = body;

  const profileComplete = Boolean(gender && dateOfBirth && birthCity && birthCountry);

  try {
    const profile = await prisma.userProfile.upsert({
      where: { userId: session.user.id },
      create: {
        userId: session.user.id,
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
    setProfileCompleteCookie(response);
    return response;
  } catch (err) {
    console.error("Profile upsert error:", err);
    return NextResponse.json({ error: "Failed to save profile" }, { status: 500 });
  }
}

// PATCH /api/profile – partial update
export async function PATCH(req: NextRequest) {
  const session = await getSession();
  if (!session?.user?.id) {
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
      updateData[key] = key === "dateOfBirth" && body[key] ? new Date(body[key]) : body[key];
    }
  }

  const existing = await prisma.userProfile.findUnique({ where: { userId: session.user.id } });
  const merged = { ...existing, ...updateData };
  updateData.profileComplete = Boolean(
    merged.gender && merged.dateOfBirth && merged.birthCity && merged.birthCountry
  );

  try {
    const profile = await prisma.userProfile.upsert({
      where: { userId: session.user.id },
      create: { userId: session.user.id, ...updateData },
      update: updateData,
    });

    const response = NextResponse.json(profile, { status: 200 });
    if (profile.profileComplete) {
      setProfileCompleteCookie(response);
    }
    return response;
  } catch (err) {
    console.error("Profile patch error:", err);
    return NextResponse.json({ error: "Failed to update profile" }, { status: 500 });
  }
}
