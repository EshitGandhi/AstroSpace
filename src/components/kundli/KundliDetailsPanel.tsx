"use client";

import type { KundliResult } from "@/lib/vedic/types";

type KundliDetailsPanelProps = {
  result: KundliResult;
  placeName?: string;
};

export default function KundliDetailsPanel({ result, placeName }: KundliDetailsPanelProps) {
  return (
    <div className="space-y-8">
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { label: "Lagna (Ascendant)", value: result.lagnaSign },
          { label: "Moon Rashi", value: result.moonRashi },
          { label: "Sun Rashi", value: result.sunRashi },
          { label: "Nakshatra", value: `${result.nakshatra} (Pada ${result.nakshatraPada})` },
        ].map((item) => (
          <div key={item.label} className="bg-night-2 border border-gold/20 rounded-xl p-4 text-center">
            <span className="text-xs text-white/60 uppercase tracking-wider block mb-1">
              {item.label}
            </span>
            <span className="text-lg font-bold font-heading text-gold">{item.value}</span>
          </div>
        ))}
      </div>

      <div className="bg-night-2 border border-gold/20 rounded-xl p-4">
        <h3 className="text-sm font-bold text-gold mb-2">Current Vimshottari Dasha</h3>
        <p className="text-white">
          Mahadasha: <strong>{result.dasha.currentLord}</strong>
          {result.dasha.antardashaLord && (
            <> · Antardasha: <strong>{result.dasha.antardashaLord}</strong></>
          )}
        </p>
        {placeName && (
          <p className="text-white/60 text-sm mt-2">Birth place: {placeName}</p>
        )}
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-white/10 text-white/60">
              <th className="text-left py-2 px-3">Planet</th>
              <th className="text-left py-2 px-3">Sign</th>
              <th className="text-left py-2 px-3">Degree</th>
              <th className="text-left py-2 px-3">House</th>
              <th className="text-left py-2 px-3">Status</th>
            </tr>
          </thead>
          <tbody>
            {result.planets.map((p) => (
              <tr key={p.planet} className="border-b border-white/5 text-white">
                <td className="py-2 px-3 font-medium">{p.planet}</td>
                <td className="py-2 px-3">{p.sign}</td>
                <td className="py-2 px-3">{p.degree}°</td>
                <td className="py-2 px-3">H{p.house}</td>
                <td className="py-2 px-3">
                  {p.isRetrograde ? (
                    <span className="text-bhagva text-xs font-semibold">Retrograde</span>
                  ) : (
                    <span className="text-white/40 text-xs">Direct</span>
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
