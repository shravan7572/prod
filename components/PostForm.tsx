"use client";

import React, { useState, useEffect } from "react";
import { useSession, signIn } from "next-auth/react";
import Link from "next/link";
import {
  CheckCircle2,
  Flame,
  Clock,
  Link2,
  Hash,
  Plus,
  Send,
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
  const { data: session } = useSession();
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
      <div className="rounded-xl border border-emerald-200 bg-emerald-50/60 p-5 mb-6 minimal-card">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-100 text-emerald-700 flex-shrink-0">
              <CheckCircle2 size={20} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-bold text-zinc-900">
                  You shipped today!
                </h3>
                <span className="inline-flex items-center gap-1 rounded-full border border-orange-200 bg-orange-50 px-2 py-0.5 text-xs font-semibold text-orange-700">
                  <Flame size={12} className="text-[#eb5e52] fill-[#eb5e52]" />
                  {streakStatus.currentStreak} day streak
                </span>
              </div>
              <p className="text-xs text-zinc-600 mt-0.5">
                Your daily ship is saved. 1 post per day enforced. Next window opens at midnight IST.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 self-end sm:self-center">
            <div className="text-right">
              <div className="text-[11px] text-zinc-500">
                <span>Next window:</span>
              </div>
              <div className="font-mono text-xs font-bold text-zinc-800">
                {timeUntilReset || "Midnight IST"}
              </div>
            </div>

            <button
              onClick={() => setForceShowForm(true)}
              className="inline-flex items-center gap-1 rounded-lg border border-zinc-200 bg-white hover:bg-zinc-50 px-3 py-1.5 text-xs font-semibold text-zinc-700 transition-colors"
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
  const QUICK_TAGS = ["#nextjs", "#prisma", "#ai", "#buildinpublic", "#postgres", "#tailwind"];

  function handleAddTag(tag: string) {
    setTags((prev) => {
      if (prev.includes(tag)) return prev;
      return prev ? `${prev} ${tag}` : tag;
    });
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="rounded-xl border border-zinc-200 bg-white p-5 shadow-xs relative mb-6 minimal-card"
    >
      {/* Header */}
      <div className="flex items-center justify-between pb-3.5 border-b border-zinc-100">
        <div className="flex items-center gap-2">
          <span className="text-sm font-bold text-zinc-900">
            What did you ship today?
          </span>
          <span className="rounded-full bg-zinc-100 border border-zinc-200 px-2 py-0.5 text-[10px] font-medium text-zinc-600">
            1 post / day
          </span>
        </div>

        <div className="flex items-center gap-2 text-xs text-zinc-500">
          {forceShowForm && (
            <button
              type="button"
              onClick={() => setForceShowForm(false)}
              className="text-xs text-zinc-500 hover:text-zinc-800"
            >
              Cancel
            </button>
          )}
          <span className="hidden sm:inline font-mono">{timeUntilReset || "Midnight IST"}</span>
        </div>
      </div>

      {error && (
        <div className="mt-3 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-600">
          {error}
        </div>
      )}

      {/* Main Content Input */}
      <div className="mt-3.5">
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="What did you build, fix, or ship today? (≤280 chars)"
          rows={3}
          maxLength={280}
          required
          className="w-full rounded-lg border border-zinc-200 bg-zinc-50/50 p-3 text-sm text-zinc-900 placeholder-zinc-400 focus:border-zinc-400 focus:bg-white focus:outline-none focus:ring-1 focus:ring-zinc-400 resize-none transition-colors"
        />
      </div>

      {/* Quick Tag Pills */}
      <div className="mt-2.5 flex items-center gap-1.5 flex-wrap">
        <span className="text-xs text-zinc-500">Quick tags:</span>
        {QUICK_TAGS.map((t) => (
          <button
            key={t}
            type="button"
            onClick={() => handleAddTag(t)}
            className="rounded border border-zinc-200 bg-zinc-50 hover:bg-zinc-100 px-2 py-0.5 text-xs text-zinc-700 transition-colors"
          >
            + {t}
          </button>
        ))}
      </div>

      {/* Tags and Link inputs */}
      <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-2.5">
        <div className="relative">
          <Hash
            size={13}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400"
          />
          <input
            type="text"
            value={tags}
            onChange={(e) => setTags(e.target.value)}
            placeholder="Tags: #nextjs #prisma"
            className="w-full rounded-lg border border-zinc-200 bg-zinc-50/50 py-2 pl-8 pr-3 text-xs text-zinc-800 placeholder-zinc-400 focus:border-zinc-400 focus:bg-white focus:outline-none transition-colors"
          />
        </div>

        <div className="relative">
          <Link2
            size={13}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400"
          />
          <input
            type="url"
            value={link}
            onChange={(e) => setLink(e.target.value)}
            placeholder="Demo or GitHub Link (optional)"
            className="w-full rounded-lg border border-zinc-200 bg-zinc-50/50 py-2 pl-8 pr-3 text-xs text-zinc-800 placeholder-zinc-400 focus:border-zinc-400 focus:bg-white focus:outline-none transition-colors"
          />
        </div>
      </div>

      {/* If guest: quick identity switcher so they can post instantly */}
      {!session?.user && (
        <div className="mt-3.5 pt-3 border-t border-zinc-100 flex flex-wrap items-center justify-between gap-2 text-xs">
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="text-zinc-500">Post as demo:</span>
            {[
              { name: "Shravan Choudhary", username: "shravan", email: "shravan@shipit.dev" },
              { name: "Aarav Sharma", username: "aarav_builds", email: "aarav@shipit.dev" },
              { name: "Priya Patel", username: "priyacodes", email: "priya@shipit.dev" },
            ].map((dev) => (
              <button
                key={dev.username}
                type="button"
                onClick={() => setSelectedQuickDev(dev)}
                className={`rounded px-2 py-0.5 text-xs border transition-colors ${
                  selectedQuickDev.username === dev.username
                    ? "border-zinc-400 bg-zinc-200 font-semibold text-zinc-900"
                    : "border-zinc-200 bg-zinc-50 text-zinc-600 hover:text-zinc-900"
                }`}
              >
                @{dev.username}
              </button>
            ))}
          </div>

          <Link
            href="/login"
            className="text-xs font-semibold text-[#eb5e52] hover:text-[#de5044]"
          >
            Google Sign In →
          </Link>
        </div>
      )}

      {/* Footer / Submit */}
      <div className="mt-3.5 flex items-center justify-between pt-3 border-t border-zinc-100">
        <div className="flex items-center gap-2 text-xs text-zinc-500 font-mono">
          <span
            className={
              charsLeft < 20
                ? "text-red-500 font-bold"
                : charsLeft < 50
                ? "text-amber-500 font-semibold"
                : "text-zinc-600"
            }
          >
            {charsLeft}
          </span>
          <span>/ 280</span>
        </div>

        <button
          type="submit"
          disabled={loading || !content.trim()}
          className="inline-flex items-center gap-1.5 rounded-lg bg-[#eb5e52] hover:bg-[#de5044] px-4 py-2 text-xs font-semibold text-white shadow-xs disabled:opacity-50 transition-colors"
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
