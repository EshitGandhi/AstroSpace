import { NextRequest, NextResponse } from "next/server";

type GeocodeResult = {
  name: string;
  lat: number;
  lng: number;
  timezone: string;
  displayName: string;
};

const cache = new Map<string, GeocodeResult[]>();

/** Resolve timezone from coordinates using geo-tz-free heuristic + Intl fallback. */
function guessTimezone(lat: number, lng: number): string {
  if (lat >= 6 && lat <= 37 && lng >= 68 && lng <= 97) return "Asia/Kolkata";
  if (lat >= 26 && lat <= 31 && lng >= 80 && lng <= 89) return "Asia/Kathmandu";
  if (lat >= 5 && lat <= 10 && lng >= 79 && lng <= 82) return "Asia/Colombo";
  if (lng >= -10 && lng <= 40 && lat >= 35 && lat <= 72) return "Europe/London";
  if (lng >= -130 && lng <= -60 && lat >= 24 && lat <= 50) return "America/New_York";
  return "UTC";
}

export async function GET(req: NextRequest) {
  const q = req.nextUrl.searchParams.get("q");
  if (!q || q.length < 2) {
    return NextResponse.json({ error: "Query too short" }, { status: 400 });
  }

  const cacheKey = q.toLowerCase().trim();
  if (cache.has(cacheKey)) {
    return NextResponse.json(cache.get(cacheKey));
  }

  try {
    const url = new URL("https://nominatim.openstreetmap.org/search");
    url.searchParams.set("q", q);
    url.searchParams.set("format", "json");
    url.searchParams.set("limit", "5");
    url.searchParams.set("addressdetails", "1");

    const res = await fetch(url.toString(), {
      headers: { "User-Agent": "AstroGuru/1.0 (kundli geocode)" },
      next: { revalidate: 86400 },
    });

    if (!res.ok) {
      return NextResponse.json({ error: "Geocoding failed" }, { status: 502 });
    }

    const data = await res.json();
    const results: GeocodeResult[] = data.map(
      (item: { lat: string; lon: string; display_name: string; name?: string }) => {
        const lat = parseFloat(item.lat);
        const lng = parseFloat(item.lon);
        return {
          name: item.name ?? item.display_name.split(",")[0],
          lat,
          lng,
          timezone: guessTimezone(lat, lng),
          displayName: item.display_name,
        };
      }
    );

    cache.set(cacheKey, results);
    return NextResponse.json(results);
  } catch (error) {
    console.error("Geocode error:", error);
    return NextResponse.json({ error: "Geocoding unavailable" }, { status: 500 });
  }
}
