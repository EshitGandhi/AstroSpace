import type { DashaPeriod, DashaTimeline, MahadashaPeriod } from "../types";

/** Vimshottari sequence and year lengths (120-year cycle). */
export const VIMSHOTTARI_ORDER = [
  "Ketu",
  "Venus",
  "Sun",
  "Moon",
  "Mars",
  "Rahu",
  "Jupiter",
  "Saturn",
  "Mercury",
] as const;

export const VIMSHOTTARI_YEARS: Record<(typeof VIMSHOTTARI_ORDER)[number], number> = {
  Ketu: 7,
  Venus: 20,
  Sun: 6,
  Moon: 10,
  Mars: 7,
  Rahu: 18,
  Jupiter: 16,
  Saturn: 19,
  Mercury: 17,
};

export type PanchangamDashaInput = {
  birthNakshatra: string;
  fullCycle: Array<{
    planet: string;
    startTime: Date;
    endTime: Date;
  }>;
};

function toIso(date: Date): string {
  return date.toISOString();
}

function isActive(now: Date, start: Date, end: Date): boolean {
  return now.getTime() >= start.getTime() && now.getTime() < end.getTime();
}

function orderIndex(planet: string): number {
  const idx = VIMSHOTTARI_ORDER.indexOf(planet as (typeof VIMSHOTTARI_ORDER)[number]);
  if (idx === -1) {
    throw new Error(`Unknown dasha lord: ${planet}`);
  }
  return idx;
}

/** Antardashas within one mahadasha — proportional to the Vimshottari year weights. */
export function buildAntardashas(
  mahaLord: string,
  start: Date,
  end: Date,
  now: Date = new Date()
): DashaPeriod[] {
  const totalMs = end.getTime() - start.getTime();
  const startIdx = orderIndex(mahaLord);
  const antardashas: DashaPeriod[] = [];
  let cursor = start.getTime();

  for (let i = 0; i < VIMSHOTTARI_ORDER.length; i++) {
    const lord = VIMSHOTTARI_ORDER[(startIdx + i) % VIMSHOTTARI_ORDER.length];
    const periodStart = new Date(cursor);
    const periodEnd =
      i === VIMSHOTTARI_ORDER.length - 1
        ? end
        : new Date(cursor + totalMs * (VIMSHOTTARI_YEARS[lord] / 120));

    antardashas.push({
      lord,
      start: toIso(periodStart),
      end: toIso(periodEnd),
      isCurrent: isActive(now, periodStart, periodEnd),
    });

    cursor = periodEnd.getTime();
  }

  return antardashas;
}

/** Map panchangam-js dasha.fullCycle into a full Vimshottari timeline. */
export function buildDashaTimeline(
  dasha: PanchangamDashaInput,
  now: Date = new Date()
): DashaTimeline {
  const birthNakshatraLord = dasha.fullCycle[0]?.planet ?? "";

  const mahadashas: MahadashaPeriod[] = dasha.fullCycle.map((maha) => {
    const start = maha.startTime;
    const end = maha.endTime;

    return {
      lord: maha.planet,
      start: toIso(start),
      end: toIso(end),
      isCurrent: isActive(now, start, end),
      antardashas: buildAntardashas(maha.planet, start, end, now),
    };
  });

  return {
    birthNakshatra: dasha.birthNakshatra,
    birthNakshatraLord,
    mahadashas,
  };
}

const MS_PER_YEAR = 365.25 * 24 * 60 * 60 * 1000;

/** Resolve today's mahadasha/antardasha from the full cycle (library birth-only fields are not "now"). */
export function getCurrentDashaFromTimeline(
  timeline: DashaTimeline,
  now: Date = new Date()
): {
  currentLord: string;
  antardashaLord?: string;
  balanceYears: number;
} {
  const currentMaha = timeline.mahadashas.find((m) => m.isCurrent);
  const currentAntara = timeline.mahadashas
    .flatMap((m) => m.antardashas)
    .find((a) => a.isCurrent);

  let balanceYears = 0;
  if (currentMaha) {
    balanceYears =
      Math.round(
        (Math.max(0, new Date(currentMaha.end).getTime() - now.getTime()) / MS_PER_YEAR) * 100
      ) / 100;
  }

  return {
    currentLord: currentMaha?.lord ?? timeline.mahadashas[0]?.lord ?? "",
    antardashaLord: currentAntara?.lord,
    balanceYears,
  };
}
