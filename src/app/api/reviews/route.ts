import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/session";

export async function POST(req: Request) {
  try {
    const session = await getSession();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { panditId, rating, comment, consultationId } = await req.json();

    if (!panditId || !rating || rating < 1 || rating > 10) {
      return NextResponse.json({ error: "Invalid rating data. Rating must be 1-10." }, { status: 400 });
    }

    // 1. Get the current profile stats
    const profile = await prisma.astrologerProfile.findUnique({
      where: { id: panditId },
      select: { ratingAverage: true, totalReviews: true }
    });

    if (!profile) {
      return NextResponse.json({ error: "Pandit not found" }, { status: 404 });
    }

    // 2. Calculate the new average
    // If totalReviews is 0, the previous default rating of 1 is completely ignored.
    // The new rating becomes the new average.
    let newAverage = rating;
    const newTotal = profile.totalReviews + 1;

    if (profile.totalReviews > 0) {
      newAverage = ((profile.ratingAverage * profile.totalReviews) + rating) / newTotal;
    }

    // 3. Create the review and update the profile in a transaction
    const [review, updatedProfile] = await prisma.$transaction([
      prisma.review.create({
        data: {
          userId: session.user.id,
          panditId,
          rating,
          comment,
          consultationId: consultationId || undefined,
        },
      }),
      prisma.astrologerProfile.update({
        where: { id: panditId },
        data: {
          ratingAverage: newAverage,
          totalReviews: newTotal
        }
      })
    ]);

    return NextResponse.json({ success: true, review, updatedProfile });
  } catch (err) {
    console.error("Failed to submit review:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
