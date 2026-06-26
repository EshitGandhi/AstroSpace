import { format } from "date-fns";
import type { KundliResult } from "@/lib/vedic/types";

function formatDashaDate(iso: string): string {
  return format(new Date(iso), "MMM d, yyyy");
}

/** Build clipboard/share text for a generated Kundli. */
export function buildKundliShareSummary(result: KundliResult): string {
  const lines = [
    `${result.name ?? "My"} Vedic Birth Chart`,
    `Lagna: ${result.lagnaSign}`,
    `Moon: ${result.moonRashi} (${result.nakshatra})`,
  ];

  const currentMaha = result.dashaTimeline?.mahadashas.find((m) => m.isCurrent);
  const currentAntara = result.dashaTimeline?.mahadashas
    .flatMap((m) => m.antardashas)
    .find((a) => a.isCurrent);

  let dashaLine = `Mahadasha: ${result.dasha.currentLord}`;
  if (currentMaha) {
    dashaLine += ` (${formatDashaDate(currentMaha.start)} – ${formatDashaDate(currentMaha.end)})`;
  }
  if (result.dasha.antardashaLord) {
    dashaLine += ` · Antardasha: ${result.dasha.antardashaLord}`;
    if (currentAntara) {
      dashaLine += ` (${formatDashaDate(currentAntara.start)} – ${formatDashaDate(currentAntara.end)})`;
    }
  }
  lines.push(dashaLine);
  lines.push("Generated at AstroGuru");

  return lines.join("\n");
}
