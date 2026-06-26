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

export type DashaPeriod = {
  lord: string;
  start: string;
  end: string;
  isCurrent?: boolean;
};

export type MahadashaPeriod = DashaPeriod & {
  antardashas: DashaPeriod[];
};

export type DashaTimeline = {
  birthNakshatra: string;
  birthNakshatraLord: string;
  mahadashas: MahadashaPeriod[];
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
  dashaTimeline: DashaTimeline;
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
