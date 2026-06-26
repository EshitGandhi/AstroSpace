import { describe, it, expect } from "vitest";
import { buildKundliShareSummary } from "@/lib/kundli/share-summary";
import type { KundliResult } from "@/lib/vedic/types";

const sampleResult: KundliResult = {
  name: "Ravi",
  ascendant: "Karka",
  lagnaSign: "Karka",
  moonRashi: "Dhanu",
  sunRashi: "Mesha",
  nakshatra: "Mula",
  nakshatraPada: 2,
  dasha: {
    currentLord: "Jupiter",
    balanceYears: 4.5,
    antardashaLord: "Saturn",
  },
  dashaTimeline: {
    birthNakshatra: "Mula",
    birthNakshatraLord: "Ketu",
    mahadashas: [
      {
        lord: "Jupiter",
        start: "2020-01-01T00:00:00.000Z",
        end: "2036-01-01T00:00:00.000Z",
        isCurrent: true,
        antardashas: [
          {
            lord: "Saturn",
            start: "2024-06-01T00:00:00.000Z",
            end: "2025-06-01T00:00:00.000Z",
            isCurrent: true,
          },
        ],
      },
    ],
  },
  planets: [],
  houses: [],
  birthDetails: {
    date: "1990-05-15",
    time: "10:30",
    lat: 28.6139,
    lng: 77.209,
    timezone: "Asia/Kolkata",
  },
};

describe("buildKundliShareSummary", () => {
  it("includes chart basics and dasha period dates", () => {
    const summary = buildKundliShareSummary(sampleResult);

    expect(summary).toContain("Ravi Vedic Birth Chart");
    expect(summary).toContain("Lagna: Karka");
    expect(summary).toContain("Mahadasha: Jupiter");
    expect(summary).toContain("Antardasha: Saturn");
    expect(summary).toContain("Jan 1, 2020");
    expect(summary).toContain("Generated at AstroGuru");
  });
});
