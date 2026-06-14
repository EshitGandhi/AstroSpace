import { ZODIAC_SIGNS } from "./zodiac";

const DAILY_TEMPLATES: Record<string, string> = {
  "Mesha (Aries)": "Mars energises your ambitions today. Take initiative on pending projects but avoid impulsive decisions before noon.",
  "Vrishabha (Taurus)": "Venus favours stability and comfort. Financial planning goes well; indulge in small pleasures that ground you.",
  "Mithuna (Gemini)": "Mercury sharpens communication. Conversations flow easily — ideal for networking, writing, and learning something new.",
  "Karka (Cancer)": "The Moon heightens emotional sensitivity. Nurture home and family connections; trust your intuition in personal matters.",
  "Simha (Leo)": "The Sun illuminates your creative path. Step into leadership roles confidently; recognition may come from unexpected quarters.",
  "Kanya (Virgo)": "Mercury supports detailed work. Organise, analyse, and refine — health routines started today will stick.",
  "Tula (Libra)": "Venus brings harmony to relationships. Diplomacy resolves conflicts; aesthetic pursuits bring satisfaction.",
  "Vrishchika (Scorpio)": "Mars and Ketu deepen introspection. Transformative insights emerge from solitude; release what no longer serves you.",
  "Dhanu (Sagittarius)": "Jupiter expands horizons. Travel, study, or philosophical discussions bring clarity about your direction.",
  "Makara (Capricorn)": "Saturn rewards discipline. Career milestones are within reach if you stay focused on long-term goals.",
  "Kumbha (Aquarius)": "Saturn and Rahu spark innovation. Community projects and humanitarian efforts align with your purpose.",
  "Meena (Pisces)": "Jupiter enhances compassion and creativity. Meditation, art, and spiritual practice bring deep peace.",
};

const WEEKLY_TEMPLATES: Record<string, string> = {
  "Mesha (Aries)": "This week demands patience in partnerships. Mid-week brings a breakthrough in a stalled project.",
  "Vrishabha (Taurus)": "Financial matters improve by Thursday. A conversation with a mentor clarifies your next career step.",
  "Mithuna (Gemini)": "Social connections multiply. Avoid spreading yourself too thin — prioritise quality over quantity.",
  "Karka (Cancer)": "Home and family take centre stage. Emotional honesty strengthens bonds with loved ones.",
  "Simha (Leo)": "Creative projects gain momentum. A surprise invitation mid-week opens new doors.",
  "Kanya (Virgo)": "Health and routine improvements pay off. Detail-oriented work earns recognition from superiors.",
  "Tula (Libra)": "Relationship dynamics shift positively. Balance giving and receiving in all partnerships.",
  "Vrishchika (Scorpio)": "Deep transformation is underway. Trust the process even when outcomes aren't immediately visible.",
  "Dhanu (Sagittarius)": "Travel or education plans crystallise. Jupiter's influence brings optimism and expansion.",
  "Makara (Capricorn)": "Professional responsibilities increase but so does respect. Delegate where possible.",
  "Kumbha (Aquarius)": "Innovative ideas attract supporters. Group collaborations yield better results than solo efforts.",
  "Meena (Pisces)": "Spiritual and creative pursuits flourish. Set boundaries to protect your energy.",
};

export function getHoroscopeText(sign: string, type: "daily" | "weekly"): string {
  const templates = type === "daily" ? DAILY_TEMPLATES : WEEKLY_TEMPLATES;
  return templates[sign] ?? `The stars align uniquely for ${sign} this ${type === "daily" ? "day" : "week"}. Stay open to cosmic guidance.`;
}

export { ZODIAC_SIGNS };
