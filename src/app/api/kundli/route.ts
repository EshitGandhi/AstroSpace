import { NextRequest, NextResponse } from "next/server";
import { calculateKundli } from "@/lib/vedic/calculate.server";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { name, date, time, lat, lng, timezone } = body;

    if (!date || !time || lat === undefined || lng === undefined) {
      return NextResponse.json(
        { error: "Missing required birth details (date, time, lat, lng)" },
        { status: 400 }
      );
    }

    const chartData = calculateKundli({
      name,
      date,
      time,
      lat: Number(lat),
      lng: Number(lng),
      timezone: timezone ?? "Asia/Kolkata",
    });

    return NextResponse.json(chartData, { status: 200 });
  } catch (error) {
    console.error("Kundli API Error:", error);
    return NextResponse.json(
      { error: "Failed to generate birth chart" },
      { status: 500 }
    );
  }
}
