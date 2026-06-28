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
    const sort = searchParams.get("sort") || "recommended";
    
    let whereClause: any = {
      verificationStatus: "APPROVED",
    };

    if (search) {
      whereClause.displayName = { contains: search, mode: "insensitive" };
    }
    
    // Arrays for Enums handling
    if (specialization) {
      whereClause.expertise = { has: specialization };
    }

    if (language) {
      whereClause.languages = { has: language };
    }

    if (rating) {
      whereClause.ratingAverage = { gte: parseFloat(rating) };
    }

    if (availability === "online") {
      whereClause.isOnline = true;
    }

    let orderByClause: any = [];
    
    switch (sort) {
      case "popular":
        orderByClause = [{ totalReviews: 'desc' }];
        break;
      case "experience":
        orderByClause = [{ experience: 'desc' }];
        break;
      case "price_low":
        orderByClause = [{ chatPrice: 'asc' }];
        break;
      case "recommended":
      default:
        orderByClause = [
          { ratingAverage: 'desc' },
          { totalReviews: 'desc' },
          { experience: 'desc' }
        ];
        break;
    }

    const pandits = await prisma.astrologerProfile.findMany({
      where: whereClause,
      orderBy: orderByClause
    });

    return NextResponse.json(pandits);
  } catch (err) {
    console.error("Failed to fetch pandits:", err);
    return NextResponse.json({ error: "Failed to fetch pandits" }, { status: 500 });
  }
}
