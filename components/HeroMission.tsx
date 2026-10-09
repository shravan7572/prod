"use client";

import React, { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import {
  Flame,
  Clock,
  CheckCircle2,
  HelpCircle,
  ChevronDown,
  ChevronUp,
} from "lucide-react";

export function HeroMission() {
  const { data: session } = useSession();
  const [streakStatus, setStreakStatus] = useState<{
    currentStreak: number;
    longestStreak: number;
    hasShippedToday: boolean;
  } | null>(null);
  const [showGuide, setShowGuide] = useState(false);
  const [timeUntilReset, setTimeUntilReset] = useState("");

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

  // Midnight IST countdown
  useEffect(() => {
    function updateCountdown() {
      const now = new Date();
      const istNow = new Date(now.getTime() + 5.5 * 3600 * 1000);
      const nextMidnightIST = new Date(
        Date.UTC(
          istNow.getUTCFullYear(),
          istNow.getUTCMonth(),
          istNow.getUTCDate() + 1,
          0,
          0,
          0
        ) -
          5.5 * 3600 * 1000
      );

      const diffMs = nextMidnightIST.getTime() - now.getTime();
      if (diffMs <= 0) {
        setTimeUntilReset("00h 00m 00s");
        return;
      }

      const hours = Math.floor(diffMs / (1000 * 60 * 60));
      const minutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((diffMs % (1000 * 60)) / 1000);
      setTimeUntilReset(
        `${String(hours).padStart(2, "0")}h ${String(minutes).padStart(2, "0")}m ${String(seconds).padStart(2, "0")}s`
      );
    }

    updateCountdown();
    const interval = setInterval(updateCountdown, 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="rounded-xl border border-zinc-200 bg-white p-5 sm:p-6 shadow-xs mb-6 minimal-card">
      {/* Top Banner Row */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-zinc-100">
        <div>
          <div className="inline-flex items-center gap-1.5 rounded-full border border-zinc-200 bg-zinc-50 px-2.5 py-0.5 text-xs font-medium text-zinc-600 mb-2">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
            <span>Developer Accountability</span>
          </div>

          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-zinc-900">
            Build Every Day. Ship Before Midnight.
          </h1>

          <p className="mt-1 text-xs sm:text-sm text-zinc-500 max-w-xl leading-relaxed">
            Share 1 genuine progress update daily, keep your streak unbroken, and discover peers building in Pune, Bangalore & across India.
          </p>
        </div>

        {/* Live IST Countdown Widget */}
        <div className="rounded-lg border border-zinc-200 bg-zinc-50 p-3 sm:text-right flex-shrink-0">
          <div className="flex items-center gap-1.5 text-xs text-zinc-500 sm:justify-end">
            <Clock size={12} className="text-zinc-500" />
            <span>Today&apos;s Window Closes In</span>
          </div>

          <div className="font-mono text-lg font-bold text-zinc-900 mt-0.5">
            {timeUntilReset || "Midnight IST"}
          </div>

          <p className="text-[10px] text-zinc-400 mt-0.5">
            Strict 00:00 IST reset
          </p>
        </div>
      </div>

      {/* Cockpit Status Bar */}
      <div className="pt-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div
            className={`flex h-9 w-9 items-center justify-center rounded-lg border flex-shrink-0 ${
              streakStatus?.hasShippedToday
                ? "border-emerald-200 bg-emerald-50 text-emerald-600"
                : "border-orange-200 bg-orange-50 text-[#eb5e52]"
            }`}
          >
            {streakStatus?.hasShippedToday ? (
              <CheckCircle2 size={18} />
            ) : (
              <Flame size={18} />
            )}
          </div>

          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold text-zinc-900">
                {streakStatus?.hasShippedToday
                  ? "Today's Ship Recorded"
                  : session?.user
                  ? "Today's Ship Pending"
                  : "Welcome to ShipIt"}
              </span>
              {streakStatus && (
                <span className="font-mono text-xs font-bold text-orange-700 bg-orange-50 px-2 py-0.5 rounded border border-orange-200">
                  ⚡ {streakStatus.currentStreak}d Streak
                </span>
              )}
            </div>
            <p className="text-xs text-zinc-500 mt-0.5">
              {streakStatus?.hasShippedToday
                ? "You did your part today. Next window opens at midnight IST."
                : session?.user
                ? "Post what you built below before midnight to advance your streak."
                : "Post what you built today, start your streak, and stay accountable."}
            </p>
          </div>
        </div>

        {/* Toggle How It Works Guide */}
        <button
          onClick={() => setShowGuide(!showGuide)}
          className="inline-flex items-center gap-1 rounded-lg border border-zinc-200 bg-white hover:bg-zinc-50 px-3 py-1.5 text-xs text-zinc-600 transition-colors self-start sm:self-center"
        >
          <HelpCircle size={13} className="text-zinc-500" />
          <span>{showGuide ? "Hide Rules" : "How It Works"}</span>
          {showGuide ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
        </button>
      </div>

      {/* Collapsible 3-Step Guide */}
      {showGuide && (
        <div className="mt-4 pt-3.5 border-t border-zinc-100 grid grid-cols-1 sm:grid-cols-3 gap-3 animate-in fade-in duration-150">
          <div className="rounded-lg border border-zinc-200 bg-zinc-50/60 p-3 space-y-1">
            <div className="text-xs font-semibold text-zinc-800 flex items-center gap-1.5">
              <span className="font-mono text-zinc-400">1.</span> Build & Ship
            </div>
            <p className="text-xs text-zinc-500 leading-relaxed">
              1 post per user per day. Summarize what you shipped in ≤280 chars. Add your stack tags and demo link.
            </p>
          </div>

          <div className="rounded-lg border border-zinc-200 bg-zinc-50/60 p-3 space-y-1">
            <div className="text-xs font-semibold text-zinc-800 flex items-center gap-1.5">
              <span className="font-mono text-zinc-400">2.</span> Keep Streaks Alive
            </div>
            <p className="text-xs text-zinc-500 leading-relaxed">
              Ship every calendar day in IST. Miss a day and your active streak resets to 0. Prove your consistency.
            </p>
          </div>

          <div className="rounded-lg border border-zinc-200 bg-zinc-50/60 p-3 space-y-1">
            <div className="text-xs font-semibold text-zinc-800 flex items-center gap-1.5">
              <span className="font-mono text-zinc-400">3.</span> Connect with Peers
            </div>
            <p className="text-xs text-zinc-500 leading-relaxed">
              Filter by your city or stack. Follow peers and watch their ships appear in real-time.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
