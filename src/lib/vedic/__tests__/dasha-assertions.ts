import { expect } from "vitest";
import type { DashaTimeline, KundliResult } from "../types";

const MS_PER_YEAR = 365.25 * 24 * 60 * 60 * 1000;

/** Shared integrity checks for Vimshottari dasha timeline output. */
export function assertDashaTimelineIntegrity(timeline: DashaTimeline): void {
  expect(timeline.birthNakshatra).toBeTruthy();
  expect(timeline.birthNakshatraLord).toBe(timeline.mahadashas[0]?.lord);
  expect(timeline.mahadashas).toHaveLength(9);

  for (let i = 0; i < timeline.mahadashas.length; i++) {
    const maha = timeline.mahadashas[i];
    expect(maha.lord).toBeTruthy();
    expect(maha.antardashas).toHaveLength(9);
    expect(maha.antardashas[0].start).toBe(maha.start);
    expect(maha.antardashas[8].end).toBe(maha.end);

    if (i > 0) {
      expect(maha.start).toBe(timeline.mahadashas[i - 1].end);
    }

    for (let j = 1; j < maha.antardashas.length; j++) {
      expect(maha.antardashas[j].start).toBe(maha.antardashas[j - 1].end);
    }
  }

  const cycleStart = new Date(timeline.mahadashas[0].start).getTime();
  const cycleEnd = new Date(timeline.mahadashas[8].end).getTime();
  const cycleYears = (cycleEnd - cycleStart) / MS_PER_YEAR;
  expect(cycleYears).toBeGreaterThan(108);
  expect(cycleYears).toBeLessThan(122);

  const currentMahas = timeline.mahadashas.filter((m) => m.isCurrent);
  const currentAntaras = timeline.mahadashas.flatMap((m) => m.antardashas).filter((a) => a.isCurrent);
  expect(currentMahas.length).toBeLessThanOrEqual(1);
  expect(currentAntaras.length).toBeLessThanOrEqual(1);
}

export function assertDashaSummaryMatchesTimeline(result: KundliResult): void {
  const currentMaha = result.dashaTimeline.mahadashas.find((m) => m.isCurrent);
  if (currentMaha) {
    expect(result.dasha.currentLord).toBe(currentMaha.lord);
  }

  const currentAntara = result.dashaTimeline.mahadashas
    .flatMap((m) => m.antardashas)
    .find((a) => a.isCurrent);

  if (result.dasha.antardashaLord && currentAntara) {
    expect(result.dasha.antardashaLord).toBe(currentAntara.lord);
  }
}

export function assertDashaTimelineSerializable(timeline: DashaTimeline): void {
  const json = JSON.stringify({ dashaTimeline: timeline });
  const parsed = JSON.parse(json) as { dashaTimeline: DashaTimeline };
  expect(parsed.dashaTimeline.mahadashas).toHaveLength(9);
  expect(typeof parsed.dashaTimeline.mahadashas[0].start).toBe("string");
}
