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
      <div className="rounded-xl border border-zinc-900 bg-zinc-950/60 p-4">
        <div className="h-4 w-32 bg-zinc-900 rounded animate-pulse mb-3" />
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="flex items-center gap-3">
              <div className="h-8 w-8 rounded-full bg-zinc-900 animate-pulse" />
              <div className="space-y-1 flex-1">
                <div className="h-3 w-20 bg-zinc-900 rounded animate-pulse" />
                <div className="h-2.5 w-14 bg-zinc-900 rounded animate-pulse" />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (suggestions.length === 0) return null;

  return (
    <div className="rounded-xl border border-zinc-800/80 bg-zinc-950/70 backdrop-blur-sm p-4 shadow-sm">
      <div className="flex items-center gap-2 pb-3 border-b border-zinc-900">
        <Users size={14} className="text-zinc-400" />
        <h3 className="text-xs font-semibold uppercase tracking-wider text-zinc-300">
          Builders Shipping Daily
        </h3>
      </div>

      <div className="mt-3 divide-y divide-zinc-900">
        {suggestions.map((u) => (
          <div
            key={u.id}
            className="flex items-center justify-between gap-3 py-2.5 first:pt-0 last:pb-0"
          >
            <div className="flex items-center gap-2.5 min-w-0">
              <Link
                href={`/profile/${u.username}`}
                className="flex-shrink-0 group"
              >
                {u.image ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={u.image}
                    alt={u.name}
                    className="h-8 w-8 rounded-full border border-zinc-800 object-cover bg-zinc-900"
                  />
                ) : (
                  <div className="flex h-8 w-8 items-center justify-center rounded-full border border-zinc-800 bg-zinc-900 text-xs font-semibold text-zinc-300">
                    {u.name.slice(0, 1)}
                  </div>
                )}
              </Link>

              <div className="min-w-0">
                <Link
                  href={`/profile/${u.username}`}
                  className="font-medium text-xs text-zinc-200 hover:underline truncate block"
                >
                  {u.name}
                </Link>
                <div className="flex items-center gap-1.5 flex-wrap">
                  <span className="font-mono text-[11px] text-zinc-500">
                    @{u.username}
                  </span>
                  {u.currentStreak > 0 && (
                    <span className="inline-flex items-center gap-0.5 text-[10px] font-mono text-zinc-400">
                      <Flame size={10} className="text-zinc-300 fill-zinc-300" />
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
                    ? "border-zinc-800 bg-zinc-900 text-zinc-400 hover:text-zinc-200"
                    : "border-zinc-700 bg-zinc-200 text-zinc-950 hover:bg-white font-semibold"
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
