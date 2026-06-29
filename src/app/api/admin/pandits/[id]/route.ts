import { NextResponse } from "next/server";
import { getSession } from "@/lib/session";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request, { params }: { params: { id: string } }) {
  try {
    const session = await getSession();
    if (session?.user?.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { action } = body;

    if (action === "approve") {
      await prisma.astrologerProfile.update({
        where: { id: params.id },
        data: { verificationStatus: "APPROVED" },
      });
    } else if (action === "reject") {
      await prisma.astrologerProfile.update({
        where: { id: params.id },
        data: { verificationStatus: "REJECTED" },
      });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function DELETE(req: Request, { params }: { params: { id: string } }) {
  try {
    const session = await getSession();
    if (session?.user?.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const profile = await prisma.astrologerProfile.findUnique({
      where: { id: params.id },
      select: { userId: true },
    });

    if (!profile) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    // Since deleting User cascades to AstrologerProfile, delete the underlying user.
    await prisma.user.delete({
      where: { id: profile.userId },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
