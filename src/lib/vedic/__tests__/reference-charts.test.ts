import { describe, it, expect } from "vitest";
import { calculateKundli } from "../calculate.server";

describe("reference birth charts (@ishubhamx/panchangam-js)", () => {
  it("Delhi — 15 May 1990, 10:30 IST", () => {
    const result = calculateKundli({
      date: "1990-05-15",
      time: "10:30",
      lat: 28.6139,
      lng: 77.209,
      timezone: "Asia/Kolkata",
    });

    expect(result.lagnaSign).toBe("Karka");
    expect(result.moonRashi).toBe("Dhanu");
    expect(result.nakshatra).toBeTruthy();
    expect(result.planets).toHaveLength(9);

    const moon = result.planets.find((p) => p.planet === "Moon");
    expect(moon?.house).toBe(6);

    const ketu = result.planets.find((p) => p.planet === "Ketu");
    expect(ketu?.house).toBe(1);
  });

  it("Mumbai — 20 Aug 1985, 06:15 IST", () => {
    const result = calculateKundli({
      date: "1985-08-20",
      time: "06:15",
      lat: 19.076,
      lng: 72.8777,
      timezone: "Asia/Kolkata",
    });

    expect(result.lagnaSign).toBeTruthy();
    expect(result.moonRashi).toBeTruthy();
    expect(result.sunRashi).toBe("Simha");
    expect(result.houses).toHaveLength(12);
    expect(result.houses.every((h) => h.house >= 1 && h.house <= 12)).toBe(true);
  });

  it("Chennai — 1 Jan 2000, 00:30 IST", () => {
    const result = calculateKundli({
      date: "2000-01-01",
      time: "00:30",
      lat: 13.0827,
      lng: 80.2707,
      timezone: "Asia/Kolkata",
    });

    expect(result.lagnaSign).toBeTruthy();
    expect(result.planets.find((p) => p.planet === "Sun")?.sign).toBe("Dhanu");
    expect(result.dasha.currentLord).toBeTruthy();
    expect(result.houses.reduce((sum, h) => sum + h.planets.length, 0)).toBeGreaterThan(0);
  });
});
