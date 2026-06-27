import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const endpoint = searchParams.get("endpoint"); // e.g. "cards", "cards/random", "cards/major"
  const n = searchParams.get("n"); // Optional count for random
  
  if (!endpoint) {
    return NextResponse.json({ error: "Missing endpoint parameter" }, { status: 400 });
  }

  try {
    let url = `https://freehoroscopeapi.com/api/v1/tarot/${endpoint}`;
    if (n) {
      url += `?n=${n}`;
    }

    const response = await fetch(url, {
      next: { revalidate: 3600 },
    });
    
    if (!response.ok) {
      throw new Error("Failed to fetch from external API");
    }

    const data = await response.json();
    
    return NextResponse.json(data);
  } catch (error) {
    console.error("Tarot Proxy Error:", error);
    return NextResponse.json({ error: "Failed to fetch tarot data" }, { status: 500 });
  }
}
