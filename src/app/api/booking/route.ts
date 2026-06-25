import { NextResponse } from "next/server";
import { getSession } from "@/lib/session";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  try {
    const session = await getSession();
    if (!session?.user?.id) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const body = await req.json();
    const { name, email, dateTime, serviceType, astrologerId, amount } = body;

    if (!name || !email || !dateTime || !serviceType) {
      return new NextResponse("Missing fields", { status: 400 });
    }

    const booking = await prisma.booking.create({
      data: {
        name,
        email,
        dateTime: new Date(dateTime),
        serviceType,
        userId: session.user.id,
        astrologerId: astrologerId ?? null,
        amount: amount ?? null,
        paymentStatus: "pending",
      },
    });

    return NextResponse.json(booking, { status: 201 });
  } catch (error) {
    console.error("[BOOKING_POST]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
