import { NextRequest, NextResponse } from "next/server";
import { hash } from "bcryptjs";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest) {
  try {
    const { name, email, password, mobile } = await req.json();

    if (!name || !email || !password || !mobile) {
      return NextResponse.json({ error: "Name, email, mobile, and password are required" }, { status: 400 });
    }

    if (password.length < 8) {
      return NextResponse.json({ error: "Password must be at least 8 characters" }, { status: 400 });
    }

    const existingUser = await prisma.user.findUnique({
      where: { email: email.toLowerCase().trim() },
    });

    if (existingUser) {
      return NextResponse.json({ error: "An account with this email already exists" }, { status: 409 });
    }

    const hashedPassword = await hash(password, 12);

    const user = await prisma.user.create({
      data: {
        name: name.trim(),
        email: email.toLowerCase().trim(),
        password: hashedPassword,
        mobile: mobile.trim(),
        role: "ASTROLOGER",
        astrologerProfile: {
          create: {
            displayName: name.trim(),
            verificationStatus: "PENDING",
            profileCompletion: 0,
          },
        },
      },
      select: { id: true, name: true, email: true, role: true, createdAt: true },
    });

    return NextResponse.json(user, { status: 201 });
  } catch (err) {
    console.error("[REGISTER_ASTROLOGER]", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
