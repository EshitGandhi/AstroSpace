/** Re-exports the Vedic Kundli engine (powered by @ishubhamx/panchangam-js). */
export { calculateKundli } from "./vedic/calculate.server";
export type { KundliInput, KundliResult, PlanetInfo } from "./vedic/types";

/** @deprecated Use KundliResult instead */
export type KundliData = import("./vedic/types").KundliResult;
