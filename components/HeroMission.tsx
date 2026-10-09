"use client";

import React, { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { Flame, Clock, CheckCircle2, AlertCircle } from "lucide-react";

export function HeroMission() {
  const { data: session } = useSession();
  const [streakStatus, setStreakStatus] = useState<{
    currentStreak: number;
    longestStreak: number;
    hasShippedToday: boolean;
  } | null>(null);

  useEffect(() => {
    if (session?.user) {
      fetch("/api/streak")
        .then((r) => (r.ok ? r.json() : null))
        .then((data) => {
          if (data) setStreakStatus(data);
        })
        .catch(() => {});
    }
  }, [session?.user]);

  return (
    <div className="mb-4">
      {streakStatus?.hasShippedToday ? (
        <div className="flex items-center justify-between rounded-xl border border-emerald-200/90 bg-emerald-50/70 px-4 py-2.5 text-xs text-emerald-900 shadow-xs">
          <div className="flex items-center gap-2.5">
            <CheckCircle2 size={16} className="text-emerald-600 flex-shrink-0" />
            <span>
              <strong>Today&apos;s ship is locked in!</strong> Your streak is safe. Next post unlocks at midnight IST.
            </span>
          </div>
          <span className="font-mono font-bold text-emerald-800 bg-emerald-100/80 px-2 py-0.5 rounded text-[11px] flex-shrink-0">
            🔥 {streakStatus.currentStreak}d Streak
          </span>
        </div>
      ) : (
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 rounded-xl border border-zinc-200 bg-white px-4 py-3 shadow-xs">
          <div className="flex items-center gap-2.5">
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-orange-50 border border-orange-200 text-[#eb5e52] flex-shrink-0">
              <Flame size={15} className="fill-[#eb5e52]" />
            </div>
            <div>
              <span className="font-semibold text-xs text-zinc-900">
                {session?.user ? "Daily Ship Pending" : "Welcome to ShipIt"}
              </span>
              <p className="text-[11px] text-zinc-500">
                {session?.user
                  ? "Post what you built below before midnight IST to advance your streak."
                  : "Daily accountability for developers. Ship 1 update per day before midnight IST."}
              </p>
            </div>
          </div>

          {streakStatus && (
            <div className="flex items-center gap-2 self-end sm:self-center">
              <span className="font-mono text-xs font-semibold text-orange-800 bg-orange-50 px-2 py-0.5 rounded border border-orange-200">
                ⚡ {streakStatus.currentStreak}d Active
              </span>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
