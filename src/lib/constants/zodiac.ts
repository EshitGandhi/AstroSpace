export type ZodiacSign = {
  id: string;
  name: string;
  nameHi: string;
  dateRange: string;
  description: string;
  symbol: string;
};

export const ZODIAC_SIGNS: ZodiacSign[] = [
  {
    id: "aries",
    name: "Aries",
    nameHi: "मेष",
    dateRange: "March 21 - April 19",
    description: "The fearless leader.",
    symbol: "♈",
  },
  {
    id: "taurus",
    name: "Taurus",
    nameHi: "वृषभ",
    dateRange: "April 20 - May 20",
    description: "The grounded builder.",
    symbol: "♉",
  },
  {
    id: "gemini",
    name: "Gemini",
    nameHi: "मिथुन",
    dateRange: "May 21 - June 20",
    description: "The versatile communicator.",
    symbol: "♊",
  },
  {
    id: "cancer",
    name: "Cancer",
    nameHi: "कर्क",
    dateRange: "June 21 - July 22",
    description: "The intuitive nurturer.",
    symbol: "♋",
  },
  {
    id: "leo",
    name: "Leo",
    nameHi: "सिंह",
    dateRange: "July 23 - August 22",
    description: "The passionate creator.",
    symbol: "♌",
  },
  {
    id: "virgo",
    name: "Virgo",
    nameHi: "कन्या",
    dateRange: "August 23 - September 22",
    description: "The analytical perfectionist.",
    symbol: "♍",
  },
  {
    id: "libra",
    name: "Libra",
    nameHi: "तुला",
    dateRange: "September 23 - October 22",
    description: "The harmonious diplomat.",
    symbol: "♎",
  },
  {
    id: "scorpio",
    name: "Scorpio",
    nameHi: "वृश्चिक",
    dateRange: "October 23 - November 21",
    description: "The intense transformer.",
    symbol: "♏",
  },
  {
    id: "sagittarius",
    name: "Sagittarius",
    nameHi: "धनु",
    dateRange: "November 22 - December 21",
    description: "The adventurous seeker.",
    symbol: "♐",
  },
  {
    id: "capricorn",
    name: "Capricorn",
    nameHi: "मकर",
    dateRange: "December 22 - January 19",
    description: "The ambitious achiever.",
    symbol: "♑",
  },
  {
    id: "aquarius",
    name: "Aquarius",
    nameHi: "कुंभ",
    dateRange: "January 20 - February 18",
    description: "The visionary rebel.",
    symbol: "♒",
  },
  {
    id: "pisces",
    name: "Pisces",
    nameHi: "मीन",
    dateRange: "February 19 - March 20",
    description: "The compassionate dreamer.",
    symbol: "♓",
  },
];
