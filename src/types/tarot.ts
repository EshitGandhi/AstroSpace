export interface TarotCard {
  type: "major" | "minor";
  name_short: string;
  name: string;
  value: string;
  value_int: number;
  suit?: string;
  meaning_up: string;
  meaning_rev: string;
  desc: string;
}

export interface TarotResponse {
  nhits: number;
  cards: TarotCard[];
}
