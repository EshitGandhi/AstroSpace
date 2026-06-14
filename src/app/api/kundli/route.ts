import { NextRequest, NextResponse } from "next/server";
import { calculateKundli } from "@/lib/jyotish";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { date, time, lat, lng } = body;

    // Strict validation to prevent silent failures
    if (!date || !time || lat === undefined || lng === undefined) {
      return NextResponse.json(
        { error: "Missing required birth details (date, time, lat, lng)" },
        { status: 400 }
      );
    }

    // Call our "astronomy engine"
    const chartData = calculateKundli(date, time, Number(lat), Number(lng));

    return NextResponse.json(chartData, { status: 200 });
  } catch (error) {
    console.error("Kundli API Error:", error);
    return NextResponse.json(
      { error: "Failed to generate birth chart" },
      { status: 500 }
    );
  }
}
