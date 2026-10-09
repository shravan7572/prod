"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useSession, signOut } from "next-auth/react";
import { Flame, LogOut, Clock } from "lucide-react";
import { StreakBadge } from "./StreakBadge";

interface NavbarProps {
  wsConnected?: boolean;
}

export function Navbar({ wsConnected = false }: NavbarProps) {
  const { data: session } = useSession();
  const [streakData, setStreakData] = useState<{
    currentStreak: number;
    longestStreak: number;
  } | null>(null);
  const [timeUntilReset, setTimeUntilReset] = useState("");

  useEffect(() => {
    if (session?.user) {
      fetch("/api/streak")
        .then((res) => (res.ok ? res.json() : null))
        .then((data) => {
          if (data) {
            setStreakData({
              currentStreak: data.currentStreak,
              longestStreak: data.longestStreak,
            });
          }
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
        setTimeUntilReset("00h 00m");
        return;
      }

      const hours = Math.floor(diffMs / (1000 * 60 * 60));
      const minutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
      setTimeUntilReset(`${hours}h ${minutes}m left`);
    }

    updateCountdown();
    const interval = setInterval(updateCountdown, 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <header className="sticky top-0 z-40 border-b border-zinc-200/80 bg-white/85 backdrop-blur-xl">
      <div className="mx-auto flex h-14 max-w-5xl items-center justify-between px-4 sm:px-6">
        {/* Brand */}
        <div className="flex items-center gap-3">
          <Link href="/" className="flex items-center gap-2 group">
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-[#eb5e52] text-white font-bold text-xs shadow-xs group-hover:scale-105 transition-transform">
              S
            </div>
            <div className="flex items-baseline gap-1.5">
              <span className="font-bold text-sm tracking-tight text-zinc-900 group-hover:text-[#eb5e52] transition-colors">
                ShipIt
              </span>
              <span className="text-[10px] text-zinc-400 hidden sm:inline font-mono">
                /daily
              </span>
            </div>
          </Link>

          {/* Live indicator dot */}
          <div
            className="hidden sm:inline-flex items-center gap-1.5 rounded-full border border-zinc-200 bg-zinc-50/80 px-2 py-0.5 text-[10px] font-medium text-zinc-600"
            title={wsConnected ? "Real-time feed active" : "Connected via HTTP"}
          >
            <span
              className={`h-1.5 w-1.5 rounded-full ${
                wsConnected ? "bg-emerald-500" : "bg-zinc-400"
              }`}
            />
            <span>{wsConnected ? "Live" : "Synced"}</span>
          </div>
        </div>

        {/* Center: Live IST Countdown Pill */}
        <div className="hidden md:flex items-center gap-1.5 rounded-full border border-orange-200/80 bg-orange-50/60 px-3 py-1 text-xs text-orange-800">
          <Clock size={12} className="text-[#eb5e52]" />
          <span className="font-medium text-[11px]">Today&apos;s Window:</span>
          <span className="font-mono font-bold text-[11px] text-[#eb5e52]">
            {timeUntilReset || "Midnight IST"}
          </span>
        </div>

        {/* Right action controls */}
        <div className="flex items-center gap-2.5">
          {session?.user ? (
            <>
              {streakData && (
                <StreakBadge
                  currentStreak={streakData.currentStreak}
                  longestStreak={streakData.longestStreak}
                  size="sm"
                />
              )}

              <div className="flex items-center gap-1.5 pl-2 border-l border-zinc-200">
                <Link
                  href={`/profile/${session.user.username || session.user.id}`}
                  className="flex items-center gap-2 rounded-full border border-zinc-200 bg-white hover:bg-zinc-50 py-1 px-2.5 text-xs text-zinc-800 transition-all shadow-xs"
                >
                  {session.user.image ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={session.user.image}
                      alt={session.user.name || "User"}
                      className="h-5 w-5 rounded-full object-cover border border-zinc-200"
                    />
                  ) : (
                    <div className="flex h-5 w-5 items-center justify-center rounded-full bg-zinc-100 text-[10px] font-bold text-zinc-700">
                      {(session.user.name || "U").slice(0, 1)}
                    </div>
                  )}
                  <span className="font-semibold text-xs max-w-[100px] truncate text-zinc-800">
                    @{session.user.username || "me"}
                  </span>
                </Link>

                <button
                  onClick={() => signOut({ callbackUrl: "/login" })}
                  title="Sign out"
                  className="flex h-7 w-7 items-center justify-center rounded-full border border-zinc-200 bg-white text-zinc-400 hover:text-zinc-800 hover:bg-zinc-50 transition-all"
                >
                  <LogOut size={13} />
                </button>
              </div>
            </>
          ) : (
            <Link
              href="/login"
              className="inline-flex items-center gap-1.5 rounded-lg bg-[#eb5e52] hover:bg-[#de5044] px-3.5 py-1.5 text-xs font-semibold text-white transition-all shadow-xs"
            >
              <span>Sign In</span>
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}
