import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const search = searchParams.get("search");
    const specialization = searchParams.get("specialization");
    const language = searchParams.get("language");
    const rating = searchParams.get("rating");
    const availability = searchParams.get("availability");
    const mode = searchParams.get("mode");
    const maxPrice = searchParams.get("maxPrice");
    const minExperience = searchParams.get("minExperience");
    const chatNow = searchParams.get("chatNow");
    const scheduleAvailable = searchParams.get("scheduleAvailable");
    const sort = searchParams.get("sort") || "recommended";

    const whereClause: Record<string, unknown> = {
      verificationStatus: "APPROVED",
    };

    if (search) {
      whereClause.displayName = { contains: search, mode: "insensitive" };
    }

    if (specialization) {
      whereClause.expertise = { has: specialization };
    }

    if (language) {
      whereClause.languages = { has: language };
    }

    if (rating) {
      if (rating === "below_7") {
        whereClause.ratingAverage = { lt: 7 };
      } else {
        whereClause.ratingAverage = { gte: parseFloat(rating) };
      }
    }

    if (availability === "online" || chatNow === "true") {
      whereClause.isOnline = true;
    }

    if (scheduleAvailable === "true") {
      whereClause.status = "active";
    }

    if (mode === "CHAT") {
      whereClause.supportsChat = true;
    } else if (mode === "VOICE") {
      whereClause.supportsVoice = true;
    } else if (mode === "VIDEO") {
      whereClause.supportsVideo = true;
    }

    if (minExperience) {
      whereClause.experience = { gte: parseInt(minExperience, 10) };
    }

    if (maxPrice) {
      const price = parseInt(maxPrice, 10);
      whereClause.chatPrice = { lte: price };
    }

    let orderByClause: Record<string, string>[] = [];

    switch (sort) {
      case "popular":
        orderByClause = [{ totalReviews: "desc" }];
        break;
      case "experience":
        orderByClause = [{ experience: "desc" }];
        break;
      case "price_low":
        orderByClause = [{ chatPrice: "asc" }];
        break;
      default:
        orderByClause = [
          { ratingAverage: "desc" },
          { totalReviews: "desc" },
          { experience: "desc" },
        ];
        break;
    }

    const pandits = await prisma.astrologerProfile.findMany({
      where: whereClause,
      orderBy: orderByClause,
    });

    return NextResponse.json(pandits);
  } catch (err) {
    console.error("Failed to fetch pandits:", err);
    return NextResponse.json({ error: "Failed to fetch pandits" }, { status: 500 });
  }
}
