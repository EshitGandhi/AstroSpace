import { describe, it, expect } from "vitest";
import { buildAntardashas, buildDashaTimeline, getCurrentDashaFromTimeline } from "../dasha/timeline";

const sampleFullCycle = [
  {
    planet: "Sun",
    startTime: new Date("1990-05-15T05:00:00.000Z"),
    endTime: new Date("1994-12-09T04:26:34.178Z"),
  },
  {
    planet: "Moon",
    startTime: new Date("1994-12-09T04:26:34.178Z"),
    endTime: new Date("2004-12-08T16:26:34.178Z"),
  },
  {
    planet: "Mars",
    startTime: new Date("2004-12-08T16:26:34.178Z"),
    endTime: new Date("2011-12-09T10:26:34.178Z"),
  },
  {
    planet: "Rahu",
    startTime: new Date("2011-12-09T10:26:34.178Z"),
    endTime: new Date("2029-12-08T22:26:34.178Z"),
  },
  {
    planet: "Jupiter",
    startTime: new Date("2029-12-08T22:26:34.178Z"),
    endTime: new Date("2045-12-08T22:26:34.178Z"),
  },
  {
    planet: "Saturn",
    startTime: new Date("2045-12-08T22:26:34.178Z"),
    endTime: new Date("2064-12-08T16:26:34.178Z"),
  },
  {
    planet: "Mercury",
    startTime: new Date("2064-12-08T16:26:34.178Z"),
    endTime: new Date("2081-12-08T22:26:34.178Z"),
  },
  {
    planet: "Ketu",
    startTime: new Date("2081-12-08T22:26:34.178Z"),
    endTime: new Date("2088-12-08T16:26:34.178Z"),
  },
  {
    planet: "Venus",
    startTime: new Date("2088-12-08T16:26:34.178Z"),
    endTime: new Date("2108-12-09T16:26:34.178Z"),
  },
];

describe("buildDashaTimeline", () => {
  it("builds 9 mahadashas from fullCycle", () => {
    const timeline = buildDashaTimeline(
      { birthNakshatra: "Uttara Ashadha", fullCycle: sampleFullCycle },
      new Date("2000-01-01T00:00:00.000Z")
    );

    expect(timeline.birthNakshatra).toBe("Uttara Ashadha");
    expect(timeline.birthNakshatraLord).toBe("Sun");
    expect(timeline.mahadashas).toHaveLength(9);
    expect(timeline.mahadashas[0].lord).toBe("Sun");
    expect(timeline.mahadashas[1].start).toBe(timeline.mahadashas[0].end);
  });

  it("marks exactly one current mahadasha and antardasha", () => {
    const now = new Date("2000-01-01T00:00:00.000Z");
    const timeline = buildDashaTimeline(
      { birthNakshatra: "Uttara Ashadha", fullCycle: sampleFullCycle },
      now
    );

    const currentMaha = timeline.mahadashas.filter((m) => m.isCurrent);
    expect(currentMaha).toHaveLength(1);
    expect(currentMaha[0].lord).toBe("Moon");

    const currentAntara = timeline.mahadashas.flatMap((m) => m.antardashas).filter((a) => a.isCurrent);
    expect(currentAntara).toHaveLength(1);
  });

  it("antardashas span the full mahadasha without gaps", () => {
    const timeline = buildDashaTimeline(
      { birthNakshatra: "Uttara Ashadha", fullCycle: sampleFullCycle },
      new Date("2000-01-01T00:00:00.000Z")
    );

    for (const maha of timeline.mahadashas) {
      expect(maha.antardashas).toHaveLength(9);
      expect(maha.antardashas[0].start).toBe(maha.start);
      expect(maha.antardashas[8].end).toBe(maha.end);
      for (let i = 1; i < maha.antardashas.length; i++) {
        expect(maha.antardashas[i].start).toBe(maha.antardashas[i - 1].end);
      }
    }
  });
});

describe("getCurrentDashaFromTimeline", () => {
  it("returns the active mahadasha lord at a given date", () => {
    const timeline = buildDashaTimeline(
      { birthNakshatra: "Uttara Ashadha", fullCycle: sampleFullCycle },
      new Date("2000-01-01T00:00:00.000Z")
    );
    const current = getCurrentDashaFromTimeline(timeline, new Date("2000-01-01T00:00:00.000Z"));

    expect(current.currentLord).toBe("Moon");
    expect(current.antardashaLord).toBeTruthy();
    expect(current.balanceYears).toBeGreaterThan(0);
  });
});

describe("buildAntardashas", () => {
  it("starts antardasha sequence with the mahadasha lord", () => {
    const start = new Date("2004-12-08T16:26:34.178Z");
    const end = new Date("2011-12-09T10:26:34.178Z");
    const antardashas = buildAntardashas("Mars", start, end, start);

    expect(antardashas[0].lord).toBe("Mars");
    expect(antardashas[1].lord).toBe("Rahu");
  });
});
