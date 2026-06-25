/** Maps panchangam-js English rashi names to Vedic Sanskrit names. */
export const ENGLISH_TO_VEDIC: Record<string, string> = {
  Aries: "Mesha",
  Taurus: "Vrishabha",
  Gemini: "Mithuna",
  Cancer: "Karka",
  Leo: "Simha",
  Virgo: "Kanya",
  Libra: "Tula",
  Scorpio: "Vrishchika",
  Sagittarius: "Dhanu",
  Capricorn: "Makara",
  Aquarius: "Kumbha",
  Pisces: "Meena",
};

export const VEDIC_RASHIS = [
  "Mesha", "Vrishabha", "Mithuna", "Karka", "Simha", "Kanya",
  "Tula", "Vrishchika", "Dhanu", "Makara", "Kumbha", "Meena",
];

export function toVedicRashi(name: string): string {
  return ENGLISH_TO_VEDIC[name] ?? name;
}

export function rashiFromIndex(index: number): string {
  return VEDIC_RASHIS[index] ?? VEDIC_RASHIS[((index % 12) + 12) % 12];
}
