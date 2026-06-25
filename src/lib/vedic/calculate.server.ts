import "server-only";

import { getKundli, Observer } from "@ishubhamx/panchangam-js";
import type { ChartHouse } from "./types";
import { parseBirthDateTime } from "./timezone";
import { toVedicRashi, rashiFromIndex } from "./rashi-map";
import type { KundliInput, KundliResult, PlanetInfo } from "./types";

const GRAHAS = ["Sun", "Moon", "Mars", "Mercury", "Jupiter", "Venus", "Saturn", "Rahu", "Ketu"];

export function calculateKundli(input: KundliInput): KundliResult {
  const { date, time, lat, lng, timezone, name } = input;
  const birthDate = parseBirthDateTime(date, time, timezone);
  const observer = new Observer(lat, lng, 0);

  const kundli = getKundli(birthDate, observer, {
    houseSystem: "whole_sign",
    ayanamsa: "lahiri",
  });

  const planets: PlanetInfo[] = GRAHAS.map((planet) => {
    const p = kundli.planets[planet];
    if (!p) {
      return { planet, degree: 0, sign: "", house: 0, isRetrograde: false };
    }
    const house = kundli.houses.find((h) => h.planets.includes(planet));
    return {
      planet,
      degree: Math.round(p.degree * 100) / 100,
      sign: toVedicRashi(p.rashiName),
      house: house?.number ?? 0,
      isRetrograde: p.isRetrograde,
    };
  });

  const houses: ChartHouse[] = kundli.houses.map((h) => ({
    house: h.number,
    sign: rashiFromIndex(h.rashi),
    planets: h.planets.filter((p) => GRAHAS.includes(p)),
  }));

  const moon = kundli.planets.Moon;
  const sun = kundli.planets.Sun;

  return {
    name,
    ascendant: toVedicRashi(kundli.ascendant.rashiName),
    lagnaSign: toVedicRashi(kundli.ascendant.rashiName),
    moonRashi: moon ? toVedicRashi(moon.rashiName) : "",
    sunRashi: sun ? toVedicRashi(sun.rashiName) : "",
    nakshatra: kundli.dasha.birthNakshatra,
    nakshatraPada: kundli.dasha.nakshatraPada,
    dasha: {
      currentLord: kundli.dasha.currentMahadasha.planet,
      balanceYears: parseFloat(kundli.dasha.dashaBalance) || 0,
      antardashaLord: kundli.dasha.currentAntardasha?.planet,
    },
    planets,
    houses,
    birthDetails: { date, time, lat, lng, timezone },
  };
}
