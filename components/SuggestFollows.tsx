"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useSession } from "next-auth/react";
import { UserPlus, UserCheck, Flame, Users } from "lucide-react";
import { StreakBadge } from "./StreakBadge";

interface SuggestionUser {
  id: string;
  name: string;
  username: string;
  image?: string | null;
  bio?: string | null;
  city?: string | null;
  college?: string | null;
  currentStreak: number;
  longestStreak: number;
  isFollowing: boolean;
}

export function SuggestFollows() {
  const { data: session } = useSession();
  const [suggestions, setSuggestions] = useState<SuggestionUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [toggling, setToggling] = useState<Record<string, boolean>>({});

  useEffect(() => {
    fetch("/api/users/suggestions")
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data?.suggestions) {
          setSuggestions(data.suggestions);
        }
      })
      .catch((err) => console.error("Failed to load suggestions:", err))
      .finally(() => setLoading(false));
  }, [session?.user]);

  async function handleToggleFollow(user: SuggestionUser) {
    if (!session?.user) return;
    setToggling((prev) => ({ ...prev, [user.id]: true }));

    const nextState = !user.isFollowing;
    try {
      const res = await fetch(`/api/users/${user.id}/follow`, {
        method: nextState ? "POST" : "DELETE",
      });
      if (res.ok) {
        setSuggestions((prev) =>
          prev.map((u) => (u.id === user.id ? { ...u, isFollowing: nextState } : u))
        );
      }
    } catch (err) {
      console.error("Failed to toggle follow:", err);
    } finally {
      setToggling((prev) => ({ ...prev, [user.id]: false }));
    }
  }

  if (loading) {
    return (
      <div className="rounded-xl border border-zinc-200 bg-white p-4">
        <div className="h-4 w-28 bg-zinc-100 rounded animate-pulse mb-3" />
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="flex items-center gap-3">
              <div className="h-8 w-8 rounded-full bg-zinc-100 animate-pulse" />
              <div className="space-y-1 flex-1">
                <div className="h-3 w-20 bg-zinc-100 rounded animate-pulse" />
                <div className="h-2.5 w-14 bg-zinc-100 rounded animate-pulse" />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (suggestions.length === 0) return null;

  return (
    <div className="rounded-xl border border-zinc-200 bg-white p-4 shadow-xs minimal-card">
      <div className="flex items-center justify-between pb-3 border-b border-zinc-100">
        <div className="flex items-center gap-2">
          <Users size={14} className="text-zinc-500" />
          <h3 className="text-xs font-semibold uppercase tracking-wider text-zinc-900">
            Top Builders
          </h3>
        </div>
        <span className="text-[10px] font-mono text-zinc-400">
          Streak Board
        </span>
      </div>

      <div className="mt-3 divide-y divide-zinc-100">
        {suggestions.map((u, idx) => (
          <div
            key={u.id}
            className="flex items-center justify-between gap-3 py-2.5 first:pt-0 last:pb-0"
          >
            <div className="flex items-center gap-2.5 min-w-0">
              {/* Rank indicator */}
              <span className="font-mono text-[11px] font-bold text-zinc-400 w-4 text-center flex-shrink-0">
                #{idx + 1}
              </span>

              <Link
                href={`/profile/${u.username}`}
                className="flex-shrink-0 group"
              >
                {u.image ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={u.image}
                    alt={u.name}
                    className="h-8 w-8 rounded-full border border-zinc-200 object-cover bg-zinc-100"
                  />
                ) : (
                  <div className="flex h-8 w-8 items-center justify-center rounded-full border border-zinc-200 bg-zinc-100 text-xs font-bold text-zinc-700">
                    {u.name.slice(0, 1)}
                  </div>
                )}
              </Link>

              <div className="min-w-0">
                <Link
                  href={`/profile/${u.username}`}
                  className="font-medium text-xs text-zinc-900 hover:underline truncate block"
                >
                  {u.name}
                </Link>
                <div className="flex items-center gap-1.5 flex-wrap">
                  <span className="text-[11px] text-zinc-400">
                    @{u.username}
                  </span>
                  {u.city && (
                    <span className="text-[10px] text-zinc-400 truncate max-w-[80px]">
                      · {u.city}
                    </span>
                  )}
                  {u.currentStreak > 0 && (
                    <span className="inline-flex items-center gap-0.5 text-[10px] font-semibold text-orange-700 bg-orange-50 px-1.5 py-0.2 rounded border border-orange-200">
                      <Flame size={10} className="text-[#eb5e52] fill-[#eb5e52]" />
                      {u.currentStreak}d
                    </span>
                  )}
                </div>
              </div>
            </div>

            {session?.user && session.user.id !== u.id && (
              <button
                onClick={() => handleToggleFollow(u)}
                disabled={toggling[u.id]}
                className={`inline-flex items-center gap-1 rounded px-2 py-1 text-[11px] font-medium border transition-colors flex-shrink-0 ${
                  u.isFollowing
                    ? "border-zinc-200 bg-zinc-50 text-zinc-600 hover:text-zinc-900"
                    : "border-zinc-300 bg-zinc-900 text-white hover:bg-zinc-800"
                }`}
              >
                {u.isFollowing ? (
                  <>
                    <UserCheck size={11} />
                    <span>Following</span>
                  </>
                ) : (
                  <>
                    <UserPlus size={11} />
                    <span>Follow</span>
                  </>
                )}
              </button>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
