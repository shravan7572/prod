"use client";

import React from "react";
import { Feed } from "@/components/Feed";
import { SuggestFollows } from "@/components/SuggestFollows";
import { HeroMission } from "@/components/HeroMission";
import { Zap } from "lucide-react";
import { useSession } from "next-auth/react";

export default function FeedPage() {
  const { data: session } = useSession();

  return (
    <div className="space-y-6">
      {/* Clean Hero Mission */}
      <HeroMission />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        {/* Main Feed Column */}
        <div className="lg:col-span-2">
          <Feed />
        </div>

        {/* Right Sidebar */}
        <div className="space-y-4">
          {/* Consistency Leaderboard / Builders Shipping Daily */}
          <SuggestFollows />

          {/* Clean Protocol Rules Card */}
          <div className="rounded-xl border border-zinc-200 bg-white p-4 shadow-xs minimal-card">
            <div className="flex items-center gap-2 pb-2.5 border-b border-zinc-100">
              <Zap size={13} className="text-zinc-500" />
              <h3 className="text-xs font-semibold uppercase tracking-wider text-zinc-900">
                ShipIt Protocol
              </h3>
            </div>
            <ul className="mt-3 space-y-2.5 text-xs text-zinc-600 leading-relaxed">
              <li className="flex items-start gap-2">
                <span className="font-semibold text-zinc-900 font-mono text-[11px]">1.</span>
                <span><strong>1 ship/day limit:</strong> Keep signal high. Summarize what you shipped in ≤280 chars.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="font-semibold text-zinc-900 font-mono text-[11px]">2.</span>
                <span><strong>Midnight IST reset:</strong> Daily cutoff is strictly 00:00 Indian Standard Time.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="font-semibold text-zinc-900 font-mono text-[11px]">3.</span>
                <span><strong>Miss 1 day = Streak 0:</strong> Active streak resets, but your longest record stays saved.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="font-semibold text-zinc-900 font-mono text-[11px]">4.</span>
                <span><strong>Real-time broadcast:</strong> Followed developers&apos; ships stream live via WebSocket.</span>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
