// A placeholder for actual complex astronomy calculations.
// In a production app, this would use swisseph (Swiss Ephemeris) or a Vedic API.

export type PlanetaryPosition = {
  planet: string;
  degree: number;
  sign: string; // Vedic sign name
  house: number;
  isRetrograde: boolean;
};

export type KundliData = {
  ascendant: string;
  planets: PlanetaryPosition[];
};

export function calculateKundli(
  date: string,
  time: string,
  lat: number,
  lng: number
): KundliData {
  // Static mock data simulating a calculated birth chart
  // This satisfies the Phase 6 requirement for "fake astronomy math logic"
  return {
    ascendant: "Simha",
    planets: [
      { planet: "Sun", degree: 14.5, sign: "Simha", house: 1, isRetrograde: false },
      { planet: "Moon", degree: 28.2, sign: "Karka", house: 12, isRetrograde: false },
      { planet: "Mars", degree: 5.1, sign: "Mesha", house: 9, isRetrograde: false },
      { planet: "Mercury", degree: 12.0, sign: "Kanya", house: 2, isRetrograde: false },
      { planet: "Jupiter", degree: 20.4, sign: "Dhanu", house: 5, isRetrograde: true },
      { planet: "Venus", degree: 8.8, sign: "Tula", house: 3, isRetrograde: false },
      { planet: "Saturn", degree: 15.5, sign: "Makara", house: 6, isRetrograde: true },
      { planet: "Rahu", degree: 10.1, sign: "Vrishchika", house: 4, isRetrograde: true },
      { planet: "Ketu", degree: 10.1, sign: "Vrishabha", house: 10, isRetrograde: true },
    ],
  };
}
