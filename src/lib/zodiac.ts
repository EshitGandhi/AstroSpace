export type ZodiacSign = {
  name: string;
  element: string;
  ruler: string;
  traits: string[];
  startDate: string;
  endDate: string;
};

export const ZODIAC_SIGNS: ZodiacSign[] = [
  { name: "Mesha (Aries)", element: "Fire", ruler: "Mars", traits: ["Courageous", "Determined", "Confident"], startDate: "04-14", endDate: "05-14" },
  { name: "Vrishabha (Taurus)", element: "Earth", ruler: "Venus", traits: ["Reliable", "Patient", "Practical"], startDate: "05-15", endDate: "06-14" },
  { name: "Mithuna (Gemini)", element: "Air", ruler: "Mercury", traits: ["Adaptable", "Outgoing", "Intelligent"], startDate: "06-15", endDate: "07-16" },
  { name: "Karka (Cancer)", element: "Water", ruler: "Moon", traits: ["Compassionate", "Emotional", "Protective"], startDate: "07-17", endDate: "08-16" },
  { name: "Simha (Leo)", element: "Fire", ruler: "Sun", traits: ["Charismatic", "Generous", "Creative"], startDate: "08-17", endDate: "09-16" },
  { name: "Kanya (Virgo)", element: "Earth", ruler: "Mercury", traits: ["Analytical", "Hardworking", "Practical"], startDate: "09-17", endDate: "10-17" },
  { name: "Tula (Libra)", element: "Air", ruler: "Venus", traits: ["Diplomatic", "Fair-minded", "Social"], startDate: "10-18", endDate: "11-16" },
  { name: "Vrishchika (Scorpio)", element: "Water", ruler: "Mars/Ketu", traits: ["Resourceful", "Brave", "Passionate"], startDate: "11-17", endDate: "12-15" },
  { name: "Dhanu (Sagittarius)", element: "Fire", ruler: "Jupiter", traits: ["Optimistic", "Adventurous", "Hilarious"], startDate: "12-16", endDate: "01-14" },
  { name: "Makara (Capricorn)", element: "Earth", ruler: "Saturn", traits: ["Responsible", "Disciplined", "Self-control"], startDate: "01-15", endDate: "02-12" },
  { name: "Kumbha (Aquarius)", element: "Air", ruler: "Saturn/Rahu", traits: ["Progressive", "Original", "Independent"], startDate: "02-13", endDate: "03-14" },
  { name: "Meena (Pisces)", element: "Water", ruler: "Jupiter", traits: ["Compassionate", "Artistic", "Intuitive"], startDate: "03-15", endDate: "04-13" },
];

export function getZodiacSign(date: Date): ZodiacSign | null {
  const month = date.getMonth() + 1; // 1-12
  const day = date.getDate();

  for (const sign of ZODIAC_SIGNS) {
    const [startMonth, startDay] = sign.startDate.split("-").map(Number);
    const [endMonth, endDay] = sign.endDate.split("-").map(Number);

    // Handle spanning across Jan/Dec if logic requires
    if (startMonth > endMonth) {
      if ((month === startMonth && day >= startDay) || (month === endMonth && day <= endDay)) {
        return sign;
      }
    } else {
      if ((month === startMonth && day >= startDay) || (month === endMonth && day <= endDay)) {
        return sign;
      }
    }
  }

  return null;
}
