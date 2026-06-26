"use client";

import { useEffect, useRef, useState } from "react";
import { useSession } from "next-auth/react";
import toast from "react-hot-toast";
import Badge from "@/components/ui/Badge";
import AnimatedButton from "@/components/ui/AnimatedButton";
import KundliForm, { type KundliFormInitialValues } from "@/components/kundli/KundliForm";
import KundliChart from "@/components/kundli/KundliChart";
import KundliDetailsPanel from "@/components/kundli/KundliDetailsPanel";
import DashaTimelinePanel from "@/components/kundli/DashaTimeline";
import type { KundliResult } from "@/lib/vedic/types";
import { buildKundliShareSummary } from "@/lib/kundli/share-summary";
import { Share2, Printer } from "lucide-react";

type ResultView = "chart" | "dasha";

type UserProfileResponse = {
  dateOfBirth?: string | null;
  timeOfBirth?: string | null;
  birthTimeUnknown?: boolean;
  birthCity?: string | null;
  birthState?: string | null;
  birthCountry?: string | null;
  birthLat?: number | null;
  birthLng?: number | null;
  birthTimezone?: string | null;
};

function profileToInitialValues(
  profile: UserProfileResponse,
  userName?: string | null
): KundliFormInitialValues | undefined {
  const hasAnyField =
    userName ||
    profile.dateOfBirth ||
    profile.timeOfBirth ||
    profile.birthCity ||
    (profile.birthLat != null && profile.birthLng != null);

  if (!hasAnyField) return undefined;

  const placeParts = [profile.birthCity, profile.birthState, profile.birthCountry].filter(Boolean);
  const placeName = placeParts.length > 0 ? placeParts.join(", ") : undefined;

  return {
    name: userName ?? undefined,
    date: profile.dateOfBirth
      ? new Date(profile.dateOfBirth).toISOString().split("T")[0]
      : undefined,
    time: profile.birthTimeUnknown ? undefined : profile.timeOfBirth ?? undefined,
    placeName,
    lat: profile.birthLat ?? undefined,
    lng: profile.birthLng ?? undefined,
    timezone: profile.birthTimezone ?? undefined,
    birthTimeUnknown: profile.birthTimeUnknown ?? false,
  };
}

export default function KundliPageClient() {
  const { data: session, status } = useSession();
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<KundliResult | null>(null);
  const [placeName, setPlaceName] = useState("");
  const [chartStyle, setChartStyle] = useState<"north" | "south">("north");
  const [formInitialValues, setFormInitialValues] = useState<KundliFormInitialValues | undefined>(
    undefined
  );
  const [profileReady, setProfileReady] = useState(false);
  const [resultView, setResultView] = useState<ResultView>("chart");
  const resultsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (status === "loading") return;

    if (!session?.user) {
      setProfileReady(true);
      return;
    }

    let cancelled = false;

    fetch("/api/profile")
      .then((res) => (res.ok ? res.json() : null))
      .then((profile: UserProfileResponse | null) => {
        if (cancelled) return;
        if (profile) {
          setFormInitialValues(profileToInitialValues(profile, session.user?.name));
        }
      })
      .catch(() => {
        /* fall back to empty form */
      })
      .finally(() => {
        if (!cancelled) setProfileReady(true);
      });

    return () => {
      cancelled = true;
    };
  }, [session, status]);

  useEffect(() => {
    if (!result) return;
    setResultView("chart");
    resultsRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  }, [result]);

  const handleSubmit = async (data: {
    name: string;
    date: string;
    time: string;
    lat: number;
    lng: number;
    timezone: string;
    placeName: string;
  }) => {
    setLoading(true);
    setPlaceName(data.placeName);
    try {
      const res = await fetch("/api/kundli", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error("Failed");
      const chart = await res.json();
      setResult(chart);
      toast.success("Kundli generated!");
    } catch {
      toast.error("Could not generate Kundli. Please check your details.");
    } finally {
      setLoading(false);
    }
  };

  const shareSummary = () => {
    if (!result) return;
    navigator.clipboard.writeText(buildKundliShareSummary(result));
    toast.success("Summary copied to clipboard!");
  };

  const printChart = () => {
    window.print();
  };

  const viewDashaTimeline = () => {
    setResultView("dasha");
    requestAnimationFrame(() => {
      document.getElementById("kundli-dasha-timeline")?.scrollIntoView({ behavior: "smooth", block: "start" });
    });
  };

  const tabClass = (active: boolean) =>
    `px-4 py-2 text-sm font-medium transition-colors ${
      active ? "bg-bhagva text-white" : "text-ink-muted hover:text-ink"
    }`;

  return (
    <div className="kundli-page bg-cream min-h-screen pt-32 pb-24 px-6 text-ink">
      <div className="max-w-6xl mx-auto space-y-12">
        <div className="text-center space-y-4 no-print">
          <Badge>Kundli Generator</Badge>
          <h1 className="text-4xl md:text-5xl font-heading font-bold text-ink">
            Apni Kundli Banayein
          </h1>
          <p className="text-lg text-ink-muted max-w-2xl mx-auto">
            Enter your birth details for a precise Vedic chart calculated with Lahiri ayanamsa.
          </p>
        </div>

        {!result ? (
          <div className="max-w-xl mx-auto bg-white border border-ink/10 rounded-3xl p-8 shadow-sm">
            {profileReady ? (
              <KundliForm
                onSubmit={handleSubmit}
                loading={loading}
                initialValues={formInitialValues}
              />
            ) : (
              <div className="space-y-4 animate-pulse">
                <div className="h-12 bg-cream-tint rounded-xl" />
                <div className="grid grid-cols-2 gap-4">
                  <div className="h-12 bg-cream-tint rounded-xl" />
                  <div className="h-12 bg-cream-tint rounded-xl" />
                </div>
                <div className="h-12 bg-cream-tint rounded-xl" />
              </div>
            )}
          </div>
        ) : (
          <div ref={resultsRef} id="kundli-results" className="space-y-8 animate-in fade-in duration-500 scroll-mt-28">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <h2 className="kundli-print-title text-2xl font-heading font-bold text-ink">
                {result.name ? `${result.name}'s` : "Your"} Birth Chart
              </h2>
              <div className="no-print flex flex-wrap gap-3">
                <div className="flex rounded-full border border-ink/20 overflow-hidden bg-white">
                  <button
                    type="button"
                    onClick={() => setChartStyle("north")}
                    className={`px-4 py-2 text-sm font-medium ${
                      chartStyle === "north" ? "bg-bhagva text-white" : "text-ink-muted hover:text-ink"
                    }`}
                  >
                    North
                  </button>
                  <button
                    type="button"
                    onClick={() => setChartStyle("south")}
                    className={`px-4 py-2 text-sm font-medium ${
                      chartStyle === "south" ? "bg-bhagva text-white" : "text-ink-muted hover:text-ink"
                    }`}
                  >
                    South
                  </button>
                </div>
                <AnimatedButton variant="secondary" size="sm" surface="cream" onClick={printChart}>
                  <Printer className="w-4 h-4 mr-1" /> Print / PDF
                </AnimatedButton>
                <AnimatedButton variant="secondary" size="sm" surface="cream" onClick={shareSummary}>
                  <Share2 className="w-4 h-4 mr-1" /> Share
                </AnimatedButton>
                <AnimatedButton variant="secondary" size="sm" surface="cream" onClick={() => setResult(null)}>
                  New Chart
                </AnimatedButton>
              </div>
            </div>

            <div className="no-print flex rounded-full border border-ink/20 overflow-hidden bg-white w-fit">
              <button type="button" onClick={() => setResultView("chart")} className={tabClass(resultView === "chart")}>
                Birth Chart
              </button>
              <button type="button" onClick={() => setResultView("dasha")} className={tabClass(resultView === "dasha")}>
                Dasha Timeline
              </button>
            </div>

            <div className={resultView === "chart" ? "block" : "hidden print:block"}>
              <div className="kundli-print-content grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
                <KundliChart houses={result.houses} style={chartStyle} surface="cream" />
                <KundliDetailsPanel
                  result={result}
                  placeName={placeName}
                  onViewTimeline={viewDashaTimeline}
                />
              </div>
            </div>

            {result.dashaTimeline && (
              <div className={resultView === "dasha" ? "block" : "hidden print:block"}>
                <DashaTimelinePanel timeline={result.dashaTimeline} />
              </div>
            )}

            <p className="kundli-print-footer hidden">
              Generated at AstroGuru · {new Date().toLocaleDateString()} · Lahiri ayanamsa
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
