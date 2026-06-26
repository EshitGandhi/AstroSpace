"use client";

import { useEffect, useState } from "react";
import { format } from "date-fns";
import { ChevronDown } from "lucide-react";
import type { DashaTimeline } from "@/lib/vedic/types";

type DashaTimelineProps = {
  timeline: DashaTimeline;
};

function periodKey(lord: string, start: string): string {
  return `${lord}-${start}`;
}

function formatPeriodDate(iso: string): string {
  return format(new Date(iso), "MMM d, yyyy");
}

function DashaPeriodRow({
  lord,
  start,
  end,
  isCurrent,
  level,
}: {
  lord: string;
  start: string;
  end: string;
  isCurrent?: boolean;
  level: "maha" | "antara";
}) {
  return (
    <div
      className={`flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1 py-2 ${
        level === "antara" ? "pl-4 border-l-2 border-cream-tint ml-2" : ""
      }`}
    >
      <div className="flex items-center gap-2 min-w-0">
        <span
          className={`font-semibold ${level === "maha" ? "text-base" : "text-sm"} ${
            isCurrent ? "text-bhagva" : "text-ink"
          }`}
        >
          {lord}
        </span>
        {isCurrent && (
          <span className="text-[10px] uppercase tracking-wider font-bold px-2 py-0.5 rounded-full bg-bhagva/10 text-bhagva">
            Current
          </span>
        )}
      </div>
      <span className="text-xs sm:text-sm text-ink-muted whitespace-nowrap">
        {formatPeriodDate(start)} – {formatPeriodDate(end)}
      </span>
    </div>
  );
}

export default function DashaTimelinePanel({ timeline }: DashaTimelineProps) {
  const [expandedKey, setExpandedKey] = useState<string | null>(null);

  useEffect(() => {
    const current = timeline.mahadashas.find((m) => m.isCurrent);
    if (current) {
      setExpandedKey(periodKey(current.lord, current.start));
    }
  }, [timeline]);

  const toggleExpanded = (key: string) => {
    setExpandedKey((prev) => (prev === key ? null : key));
  };

  return (
    <section
      id="kundli-dasha-timeline"
      className="dasha-timeline bg-white border border-ink/10 rounded-xl shadow-sm overflow-hidden"
    >
      <div className="px-5 py-4 border-b border-ink/10 bg-cream-tint/30">
        <h3 className="text-lg font-heading font-bold text-ink">Vimshottari Dasha Timeline</h3>
        <p className="text-sm text-ink-muted mt-1">
          Birth Nakshatra: <strong className="text-ink">{timeline.birthNakshatra}</strong>
          {" · "}
          Starting lord: <strong className="text-bhagva">{timeline.birthNakshatraLord}</strong>
        </p>
      </div>

      <div className="divide-y divide-ink/5">
        {timeline.mahadashas.map((maha) => {
          const key = periodKey(maha.lord, maha.start);
          const isExpanded = expandedKey === key;
          const showAntardashas = isExpanded || maha.isCurrent;

          return (
            <div
              key={key}
              className={`px-5 py-3 ${maha.isCurrent ? "dasha-is-current bg-bhagva/[0.04]" : ""}`}
            >
              <div className="flex items-start gap-2">
                <button
                  type="button"
                  onClick={() => toggleExpanded(key)}
                  className="no-print mt-1 p-1 rounded-lg hover:bg-cream-tint text-ink-muted hover:text-ink transition-colors shrink-0"
                  aria-expanded={isExpanded}
                  aria-label={`${isExpanded ? "Collapse" : "Expand"} ${maha.lord} antardashas`}
                >
                  <ChevronDown
                    className={`w-4 h-4 transition-transform ${isExpanded ? "rotate-180" : ""}`}
                    strokeWidth={2.5}
                  />
                </button>

                <div className="flex-1 min-w-0">
                  <DashaPeriodRow
                    lord={maha.lord}
                    start={maha.start}
                    end={maha.end}
                    isCurrent={maha.isCurrent}
                    level="maha"
                  />

                  <div
                    className={`dasha-antardashas mt-2 space-y-0.5 ${
                      showAntardashas ? "block" : "hidden"
                    }`}
                  >
                    <p className="text-[10px] uppercase tracking-wider text-ink-muted font-semibold mb-1 pl-4">
                      Antardashas
                    </p>
                    {maha.antardashas.map((antara) => (
                      <DashaPeriodRow
                        key={`${antara.lord}-${antara.start}`}
                        lord={antara.lord}
                        start={antara.start}
                        end={antara.end}
                        isCurrent={antara.isCurrent}
                        level="antara"
                      />
                    ))}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
