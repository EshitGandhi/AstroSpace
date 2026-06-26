"use client";

import type { KundliResult } from "@/lib/vedic/types";

type KundliDetailsPanelProps = {
  result: KundliResult;
  placeName?: string;
  onViewTimeline?: () => void;
};

export default function KundliDetailsPanel({ result, placeName, onViewTimeline }: KundliDetailsPanelProps) {
  return (
    <div className="space-y-8">
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { label: "Lagna (Ascendant)", value: result.lagnaSign },
          { label: "Moon Rashi", value: result.moonRashi },
          { label: "Sun Rashi", value: result.sunRashi },
          { label: "Nakshatra", value: `${result.nakshatra} (Pada ${result.nakshatraPada})` },
        ].map((item) => (
          <div
            key={item.label}
            className="bg-white border border-ink/10 rounded-xl p-4 text-center shadow-sm"
          >
            <span className="text-xs text-ink-muted uppercase tracking-wider block mb-1">
              {item.label}
            </span>
            <span className="text-lg font-bold font-heading text-bhagva">{item.value}</span>
          </div>
        ))}
      </div>

      <div className="bg-white border border-ink/10 rounded-xl p-4 shadow-sm">
        <h3 className="text-sm font-bold text-ink mb-2">Current Vimshottari Dasha</h3>
        <p className="text-ink">
          Mahadasha: <strong className="text-bhagva">{result.dasha.currentLord}</strong>
          {result.dasha.antardashaLord && (
            <>
              {" "}
              · Antardasha: <strong className="text-bhagva">{result.dasha.antardashaLord}</strong>
            </>
          )}
        </p>
        {onViewTimeline && (
          <button
            type="button"
            onClick={onViewTimeline}
            className="no-print mt-3 text-sm font-medium text-bhagva hover:underline"
          >
            View full dasha timeline →
          </button>
        )}
        {placeName && (
          <p className="text-ink-muted text-sm mt-2">Birth place: {placeName}</p>
        )}
      </div>

      <div className="overflow-x-auto bg-white border border-ink/10 rounded-xl shadow-sm">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-ink/10 bg-cream-tint/50 text-ink-muted">
              <th className="text-left py-3 px-3 font-semibold">Planet</th>
              <th className="text-left py-3 px-3 font-semibold">Sign</th>
              <th className="text-left py-3 px-3 font-semibold">Degree</th>
              <th className="text-left py-3 px-3 font-semibold">House</th>
              <th className="text-left py-3 px-3 font-semibold">Status</th>
            </tr>
          </thead>
          <tbody>
            {result.planets.map((p) => (
              <tr key={p.planet} className="border-b border-ink/5 text-ink">
                <td className="py-2 px-3 font-medium">{p.planet}</td>
                <td className="py-2 px-3">{p.sign}</td>
                <td className="py-2 px-3">{p.degree}°</td>
                <td className="py-2 px-3">H{p.house}</td>
                <td className="py-2 px-3">
                  {p.isRetrograde ? (
                    <span className="text-bhagva text-xs font-semibold">Retrograde</span>
                  ) : (
                    <span className="text-ink-muted text-xs">Direct</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
