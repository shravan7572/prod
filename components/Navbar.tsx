"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useSession, signOut } from "next-auth/react";
import { Flame, LogOut, User, Terminal, Radio } from "lucide-react";
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
    <header className="sticky top-0 z-40 border-b border-zinc-900 bg-zinc-950/80 backdrop-blur-md">
      <div className="mx-auto flex h-14 max-w-5xl items-center justify-between px-4 sm:px-6">
        {/* Brand */}
        <div className="flex items-center gap-4">
          <Link href="/" className="flex items-center gap-2.5 group">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg border border-zinc-700 bg-zinc-900 text-zinc-100 group-hover:border-zinc-500 transition-colors">
              <Terminal size={16} />
            </div>
            <div className="flex flex-col">
              <span className="font-mono text-sm font-bold tracking-tight text-zinc-100">
                ShipIt
              </span>
              <span className="text-[10px] text-zinc-400 hidden sm:inline -mt-0.5">
                what did you ship today?
              </span>
            </div>
          </Link>

          {/* WS live status pill */}
          <div
            className={`hidden sm:inline-flex items-center gap-1.5 rounded-full border px-2 py-0.5 text-[10px] font-mono transition-colors ${
              wsConnected
                ? "border-zinc-800 bg-zinc-900/60 text-zinc-300"
                : "border-zinc-800/60 bg-zinc-950 text-zinc-400"
            }`}
            title={wsConnected ? "Real-time WebSocket feed active" : "Feed connected via HTTP"}
          >
            <span
              className={`h-1.5 w-1.5 rounded-full ${
                wsConnected ? "bg-emerald-400 live-indicator" : "bg-zinc-600"
              }`}
            />
            <span>{wsConnected ? "Live Feed" : "Synced"}</span>
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

              <div className="flex items-center gap-2 pl-2 border-l border-zinc-800">
                <Link
                  href={`/profile/${session.user.username || session.user.id}`}
                  className="flex items-center gap-2 rounded-lg border border-zinc-800/80 bg-zinc-900/60 py-1 px-2 text-xs text-zinc-200 hover:border-zinc-700 hover:bg-zinc-900 transition-colors"
                >
                  {session.user.image ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={session.user.image}
                      alt={session.user.name || "User"}
                      className="h-5 w-5 rounded-full object-cover border border-zinc-700"
                    />
                  ) : (
                    <User size={13} className="text-zinc-400" />
                  )}
                  <span className="font-mono text-xs max-w-[100px] truncate">
                    @{session.user.username || "me"}
                  </span>
                </Link>

                <button
                  onClick={() => signOut({ callbackUrl: "/login" })}
                  title="Sign out"
                  className="flex h-7 w-7 items-center justify-center rounded-lg border border-zinc-800/80 text-zinc-400 hover:border-zinc-700 hover:text-zinc-200 hover:bg-zinc-900 transition-colors"
                >
                  <LogOut size={13} />
                </button>
              </div>
            </>
          ) : (
            <Link
              href="/login"
              className="inline-flex items-center gap-1.5 rounded-lg border border-zinc-700 bg-zinc-100 px-3.5 py-1.5 text-xs font-semibold text-zinc-950 hover:bg-white transition-colors"
            >
              <Flame size={13} />
              <span>Sign In</span>
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}
