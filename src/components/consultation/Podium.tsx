"use client";

import PanditCard from "./PanditCard";
import { Trophy } from "lucide-react";

interface PodiumProps {
  top3: any[];
}

export default function Podium({ top3 }: PodiumProps) {
  if (!top3 || top3.length === 0) return null;

  const first = top3[0];
  const second = top3[1];
  const third = top3[2];

  return (
    <div className="w-full max-w-5xl mx-auto my-12 px-4">
      <div className="text-center mb-12 flex flex-col items-center">
        <div className="inline-flex items-center justify-center p-3 bg-yellow-100 rounded-full mb-4">
          <Trophy className="w-8 h-8 text-yellow-600" />
        </div>
        <h2 className="text-3xl font-black font-heading text-ink">🏆 Top Astrologers This Month</h2>
        <p className="text-ink-muted mt-2">The highest rated experts chosen by our community</p>
      </div>
      
      <div className="flex flex-col md:flex-row items-end justify-center gap-6 md:gap-8 min-h-[460px]">
        {/* Rank 2 (Left) */}
        {second && (
          <div className="w-full md:w-1/3 order-2 md:order-1 transform transition-transform hover:-translate-y-2">
            <div className="bg-gradient-to-t from-slate-200 to-transparent p-1 rounded-3xl pb-0">
              <div className="mb-[-20px] relative z-10 mx-auto w-16 h-16 bg-slate-200 rounded-full flex items-center justify-center border-4 border-white shadow-lg text-2xl font-black text-slate-700">
                2
              </div>
              <div className="pt-8 bg-white rounded-3xl shadow-lg border-2 border-slate-200 h-[440px]">
                <PanditCard pandit={second} />
              </div>
            </div>
          </div>
        )}

        {/* Rank 1 (Center) */}
        {first && (
          <div className="w-full md:w-1/3 order-1 md:order-2 z-20 transform transition-transform hover:-translate-y-2">
            <div className="bg-gradient-to-t from-yellow-300 to-transparent p-1 rounded-3xl pb-0">
              <div className="mb-[-24px] relative z-10 mx-auto w-20 h-20 bg-yellow-400 rounded-full flex items-center justify-center border-4 border-white shadow-xl text-4xl font-black text-yellow-900">
                1
              </div>
              <div className="pt-10 bg-white rounded-3xl shadow-2xl border-2 border-yellow-400 md:-mt-8 md:min-h-[480px] h-[460px]">
                <PanditCard pandit={first} />
              </div>
            </div>
          </div>
        )}

        {/* Rank 3 (Right) */}
        {third && (
          <div className="w-full md:w-1/3 order-3 md:order-3 transform transition-transform hover:-translate-y-2">
            <div className="bg-gradient-to-t from-orange-300 to-transparent p-1 rounded-3xl pb-0">
              <div className="mb-[-20px] relative z-10 mx-auto w-16 h-16 bg-orange-300 rounded-full flex items-center justify-center border-4 border-white shadow-lg text-2xl font-black text-orange-900">
                3
              </div>
              <div className="pt-8 bg-white rounded-3xl shadow-lg border-2 border-orange-300 h-[440px]">
                <PanditCard pandit={third} />
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
