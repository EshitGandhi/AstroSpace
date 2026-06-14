export type Astrologer = {
  id: string;
  name: string;
  specialties: string[];
  languages: string[];
  experience: number;
  rating: number;
  pricePerMinute: number;
  sessionMinutes: number;
};

export const ASTROLOGERS: Astrologer[] = [
  {
    id: "astro-1",
    name: "Acharya Shrikant Shastri",
    specialties: ["Vedic Astrology", "Kundli", "Muhurat"],
    languages: ["Hindi", "English"],
    experience: 15,
    rating: 4.9,
    pricePerMinute: 25,
    sessionMinutes: 60,
  },
  {
    id: "astro-2",
    name: "Dr. Anjali Deshmukh",
    specialties: ["KP System", "Nadi Astrology", "Career Guidance"],
    languages: ["Marathi", "Hindi", "English"],
    experience: 12,
    rating: 4.8,
    pricePerMinute: 30,
    sessionMinutes: 60,
  },
];

export function getAstrologer(id: string): Astrologer | undefined {
  return ASTROLOGERS.find((a) => a.id === id);
}

export function generateTimeSlots(): string[] {
  const slots: string[] = [];
  for (let hour = 9; hour <= 20; hour++) {
    slots.push(`${String(hour).padStart(2, "0")}:00`);
    if (hour < 20) slots.push(`${String(hour).padStart(2, "0")}:30`);
  }
  return slots;
}
