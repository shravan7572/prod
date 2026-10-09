"use client";

import React, { useState, useEffect } from "react";
import { useSession, signIn } from "next-auth/react";
import Link from "next/link";
import {
  CheckCircle2,
  Flame,
  Send,
  Clock,
  Link2,
  Hash,
  Plus,
  User,
  Users,
} from "lucide-react";
import { ShipPost } from "./ShipCard";

interface PostFormProps {
  onPostCreated?: (post: ShipPost) => void;
  onStreakUpdated?: () => void;
}

interface StreakStatus {
  currentStreak: number;
  longestStreak: number;
  hasShippedToday: boolean;
  nextResetTime?: string;
}

export function PostForm({ onPostCreated, onStreakUpdated }: PostFormProps) {
  const { data: session, status } = useSession();
  const [content, setContent] = useState("");
  const [tags, setTags] = useState("");
  const [link, setLink] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [streakStatus, setStreakStatus] = useState<StreakStatus | null>(null);
  const [timeUntilReset, setTimeUntilReset] = useState<string>("");
  const [forceShowForm, setForceShowForm] = useState(false);

  // Quick account selection for guests
  const [selectedQuickDev, setSelectedQuickDev] = useState({
    name: "Shravan Choudhary",
    username: "shravan",
    email: "shravan@shipit.dev",
  });

  // Fetch today's shipping status
  useEffect(() => {
    if (session?.user) {
      fetchStreak();
    }
  }, [session?.user]);

  async function fetchStreak() {
    try {
      const res = await fetch("/api/streak");
      if (res.ok) {
        const data = await res.json();
        setStreakStatus(data);
      }
    } catch (err) {
      console.error("Failed to check streak status:", err);
    }
  }

  // Calculate countdown to midnight IST
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
        setTimeUntilReset("resetting...");
        fetchStreak();
        return;
      }

      const hours = Math.floor(diffMs / (1000 * 60 * 60));
      const minutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((diffMs % (1000 * 60)) / 1000);
      setTimeUntilReset(`${hours}h ${minutes}m ${seconds}s`);
    }

    updateCountdown();
    const interval = setInterval(updateCountdown, 1000);
    return () => clearInterval(interval);
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!content.trim() || loading) return;

    if (content.length > 280) {
      setError("Max 280 characters.");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // If user is not logged in, log in automatically with selected dev profile first
      if (!session?.user) {
        const loginRes = await signIn("credentials", {
          redirect: false,
          email: selectedQuickDev.email,
          name: selectedQuickDev.name,
          username: selectedQuickDev.username,
        });

        if (loginRes?.error) {
          setError("Quick login failed. Please sign in via /login.");
          setLoading(false);
          return;
        }
      }

      const res = await fetch("/api/posts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          content,
          tags,
          link,
          allowAnotherToday: forceShowForm, // allows test posting when user deliberately clicked 'Ship Another'
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Failed to post ship.");
        if (data.alreadyShipped) {
          setStreakStatus((prev) =>
            prev ? { ...prev, hasShippedToday: true } : null
          );
        }
      } else {
        setContent("");
        setTags("");
        setLink("");
        setForceShowForm(false);
        onPostCreated?.(data.post);
        onStreakUpdated?.();
        fetchStreak();
      }
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  // If user already shipped today and hasn't clicked "Ship Another"
  if (session?.user && streakStatus?.hasShippedToday && !forceShowForm) {
    return (
      <div className="rounded-xl border border-zinc-800 bg-zinc-950/90 p-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full border border-zinc-700 bg-zinc-900 text-zinc-100 flex-shrink-0">
              <CheckCircle2 size={20} className="text-zinc-100" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-semibold text-zinc-100">
                  You shipped today!
                </h3>
                <span className="inline-flex items-center gap-1 rounded-full border border-zinc-700 bg-zinc-900 px-2 py-0.5 text-xs font-mono text-zinc-200">
                  <Flame size={12} className="text-zinc-100 fill-zinc-100" />
                  {streakStatus.currentStreak} day streak
                </span>
              </div>
              <p className="text-xs text-zinc-400 mt-0.5">
                Awesome work! Your daily ship is recorded. 1 post per day enforced.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 self-end sm:self-center">
            <div className="text-right">
              <div className="inline-flex items-center gap-1 text-[11px] font-mono text-zinc-400">
                <Clock size={11} />
                <span>Next ship:</span>
              </div>
              <div className="font-mono text-xs font-semibold text-zinc-200">
                {timeUntilReset || "Midnight IST"}
              </div>
            </div>

            <button
              onClick={() => setForceShowForm(true)}
              className="inline-flex items-center gap-1 rounded-lg border border-zinc-800 bg-zinc-900 px-2.5 py-1.5 text-xs font-medium text-zinc-300 hover:border-zinc-700 hover:text-white transition-colors"
              title="Post another ship in test mode"
            >
              <Plus size={13} />
              <span>Ship Another</span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  const charsLeft = 280 - content.length;

  return (
    <form
      onSubmit={handleSubmit}
      className="rounded-xl border border-zinc-800 bg-zinc-950/90 p-5 shadow-sm"
    >
      <div className="flex items-center justify-between pb-3 border-b border-zinc-900">
        <div className="flex items-center gap-2">
          <span className="h-2 w-2 rounded-full bg-zinc-100" />
          <h3 className="text-sm font-semibold text-zinc-100">
            What did you ship today?
          </h3>
        </div>
        <div className="flex items-center gap-3">
          {forceShowForm && (
            <button
              type="button"
              onClick={() => setForceShowForm(false)}
              className="text-[11px] font-mono text-zinc-400 hover:text-zinc-200"
            >
              Cancel
            </button>
          )}
          <span className="text-[11px] font-mono text-zinc-400 hidden sm:inline">
            Resets at midnight IST
          </span>
        </div>
      </div>

      {error && (
        <div className="mt-3 rounded-lg border border-red-900/60 bg-red-950/30 px-3 py-2 text-xs text-red-300">
          {error}
        </div>
      )}

      {/* Main Content Input */}
      <div className="mt-3">
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="I built and shipped..."
          rows={3}
          maxLength={280}
          required
          className="w-full rounded-lg border border-zinc-800 bg-zinc-900/60 p-3 text-sm text-zinc-100 placeholder-zinc-500 focus:border-zinc-600 focus:outline-none focus:ring-1 focus:ring-zinc-600 resize-none transition-colors"
        />
      </div>

      {/* Tags and Link inputs */}
      <div className="mt-2.5 grid grid-cols-1 sm:grid-cols-2 gap-2">
        <div className="relative">
          <Hash
            size={13}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500"
          />
          <input
            type="text"
            value={tags}
            onChange={(e) => setTags(e.target.value)}
            placeholder="Tags: #nextjs #prisma #websocket"
            className="w-full rounded-lg border border-zinc-800 bg-zinc-900/60 py-2 pl-8 pr-3 text-xs text-zinc-200 placeholder-zinc-500 focus:border-zinc-600 focus:outline-none focus:ring-1 focus:ring-zinc-600 font-mono transition-colors"
          />
        </div>

        <div className="relative">
          <Link2
            size={13}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500"
          />
          <input
            type="url"
            value={link}
            onChange={(e) => setLink(e.target.value)}
            placeholder="Link: GitHub repo, demo, or commit"
            className="w-full rounded-lg border border-zinc-800 bg-zinc-900/60 py-2 pl-8 pr-3 text-xs text-zinc-200 placeholder-zinc-500 focus:border-zinc-600 focus:outline-none focus:ring-1 focus:ring-zinc-600 font-mono transition-colors"
          />
        </div>
      </div>

      {/* If guest: quick identity switcher so they can post instantly */}
      {!session?.user && (
        <div className="mt-3 pt-2.5 border-t border-zinc-900 flex flex-wrap items-center justify-between gap-2 text-xs">
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="text-zinc-500 font-mono text-[11px]">Post as:</span>
            {[
              { name: "Shravan Choudhary", username: "shravan", email: "shravan@shipit.dev" },
              { name: "Aarav Sharma", username: "aarav_builds", email: "aarav@shipit.dev" },
              { name: "Priya Patel", username: "priyacodes", email: "priya@shipit.dev" },
              { name: "Fresh Builder", username: "fresh_dev", email: "fresh@shipit.dev" },
            ].map((dev) => (
              <button
                key={dev.username}
                type="button"
                onClick={() => setSelectedQuickDev(dev)}
                className={`rounded px-2 py-0.5 text-[11px] font-mono border transition-colors ${
                  selectedQuickDev.username === dev.username
                    ? "border-zinc-600 bg-zinc-800 text-zinc-100"
                    : "border-zinc-800/80 bg-zinc-900/40 text-zinc-400 hover:text-zinc-200"
                }`}
              >
                @{dev.username}
              </button>
            ))}
          </div>

          <Link
            href="/login"
            className="text-[11px] text-zinc-400 hover:text-zinc-200 font-mono underline"
          >
            Or Google Sign In
          </Link>
        </div>
      )}

      {/* Footer / Submit */}
      <div className="mt-3.5 flex items-center justify-between pt-2 border-t border-zinc-900">
        <div className="flex items-center gap-2">
          <span
            className={`font-mono text-xs ${
              charsLeft < 20
                ? "text-red-400 font-bold"
                : charsLeft < 50
                ? "text-zinc-400 font-medium"
                : "text-zinc-400"
            }`}
          >
            {charsLeft}
          </span>
          <span className="text-[11px] text-zinc-400">/ 280</span>
        </div>

        <button
          type="submit"
          disabled={loading || !content.trim()}
          className="inline-flex items-center gap-1.5 rounded-lg border border-zinc-700 bg-zinc-100 px-4 py-2 text-xs font-semibold text-zinc-950 hover:bg-white disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
        >
          {loading ? (
            <span>Shipping...</span>
          ) : (
            <>
              <span>Ship It</span>
              <Send size={12} />
            </>
          )}
        </button>
      </div>
    </form>
  );
}
