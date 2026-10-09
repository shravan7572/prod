"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useSession, signOut } from "next-auth/react";
import { Flame, LogOut } from "lucide-react";
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

  return (
    <header className="sticky top-0 z-40 border-b border-zinc-200 bg-white/90 backdrop-blur-md transition-all">
      <div className="mx-auto flex h-14 max-w-5xl items-center justify-between px-4 sm:px-6">
        {/* Brand */}
        <div className="flex items-center gap-3">
          <Link href="/" className="flex items-center gap-2 group">
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-[#eb5e52] text-white font-bold text-sm">
              S
            </div>
            <div className="flex flex-col">
              <span className="font-bold text-sm tracking-tight text-zinc-900 group-hover:text-[#eb5e52] transition-colors">
                ShipIt
              </span>
              <span className="text-[10px] text-zinc-500 hidden sm:inline -mt-0.5">
                what did you ship today?
              </span>
            </div>
          </Link>

          {/* Status dot */}
          <div
            className="hidden sm:inline-flex items-center gap-1.5 rounded-full border border-zinc-200 bg-zinc-50 px-2 py-0.5 text-[10px] font-medium text-zinc-600"
            title={wsConnected ? "Live updates active" : "Connected via HTTP"}
          >
            <span
              className={`h-1.5 w-1.5 rounded-full ${
                wsConnected ? "bg-emerald-500" : "bg-zinc-400"
              }`}
            />
            <span>{wsConnected ? "Live" : "Synced"}</span>
          </div>
        </div>

        {/* Right action controls */}
        <div className="flex items-center gap-3">
          {session?.user ? (
            <>
              {streakData && (
                <StreakBadge
                  currentStreak={streakData.currentStreak}
                  longestStreak={streakData.longestStreak}
                  size="sm"
                />
              )}

              <div className="flex items-center gap-2 pl-2 border-l border-zinc-200">
                <Link
                  href={`/profile/${session.user.username || session.user.id}`}
                  className="flex items-center gap-2 rounded-lg border border-zinc-200 bg-zinc-50 hover:bg-zinc-100 py-1 px-2.5 text-xs text-zinc-800 transition-all"
                >
                  {session.user.image ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={session.user.image}
                      alt={session.user.name || "User"}
                      className="h-5 w-5 rounded-full object-cover border border-zinc-200"
                    />
                  ) : (
                    <div className="flex h-5 w-5 items-center justify-center rounded-full bg-zinc-200 text-[10px] font-bold text-zinc-700">
                      {(session.user.name || "U").slice(0, 1)}
                    </div>
                  )}
                  <span className="font-medium text-xs max-w-[110px] truncate text-zinc-800">
                    @{session.user.username || "me"}
                  </span>
                </Link>

                <button
                  onClick={() => signOut({ callbackUrl: "/login" })}
                  title="Sign out"
                  className="flex h-7 w-7 items-center justify-center rounded-lg border border-zinc-200 text-zinc-500 hover:text-zinc-900 hover:bg-zinc-100 transition-all"
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
