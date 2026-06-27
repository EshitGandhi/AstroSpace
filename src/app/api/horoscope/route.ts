import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const sign = searchParams.get("sign");
  const type = searchParams.get("type");
  const lang = searchParams.get("lang") || "en";

  if (!sign || !type) {
    return NextResponse.json({ error: "Missing sign or type parameter" }, { status: 400 });
  }

  try {
    const response = await fetch(`https://freehoroscopeapi.com/api/v1/get-horoscope/${type}?sign=${sign}`, {
      next: { revalidate: 3600 },
    });
    
    if (!response.ok) {
      throw new Error("Failed to fetch from external API");
    }

    const data = await response.json();
    
    // Translate if Hindi is requested
    if (lang === "hi" && data.data && data.data.horoscope) {
      const textToTranslate = encodeURIComponent(data.data.horoscope);
      const translateUrl = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=en&tl=hi&dt=t&q=${textToTranslate}`;
      
      const transResponse = await fetch(translateUrl);
      if (transResponse.ok) {
        const transData = await transResponse.json();
        // The Google Translate API returns an array of arrays for the translation segments
        if (transData && transData[0]) {
          const translatedText = transData[0].map((item: any) => item[0]).join("");
          data.data.horoscope = translatedText;
        }
      }
    }
    
    return NextResponse.json(data);
  } catch (error) {
    console.error("Horoscope Proxy Error:", error);
    return NextResponse.json({ error: "Failed to fetch horoscope" }, { status: 500 });
  }
}
