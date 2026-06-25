export type ChartHouse = {
  house: number;
  planets: string[];
  sign?: string;
};

export type PlanetInfo = {
  planet: string;
  degree: number;
  sign: string;
  house: number;
  isRetrograde: boolean;
};

export type KundliInput = {
  name?: string;
  date: string;
  time: string;
  lat: number;
  lng: number;
  timezone: string;
};

export type KundliResult = {
  name?: string;
  ascendant: string;
  lagnaSign: string;
  moonRashi: string;
  sunRashi: string;
  nakshatra: string;
  nakshatraPada: number;
  dasha: {
    currentLord: string;
    balanceYears: number;
    antardashaLord?: string;
  };
  planets: PlanetInfo[];
  houses: ChartHouse[];
  birthDetails: {
    date: string;
    time: string;
    lat: number;
    lng: number;
    timezone: string;
  };
};
