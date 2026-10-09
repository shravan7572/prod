"use client";

import React, { useState, useEffect, useRef } from "react";
import { useSession, signIn } from "next-auth/react";
import Link from "next/link";
import {
  CheckCircle2,
  Flame,
  Link2,
  Hash,
  Plus,
  Send,
  Sparkles,
} from "lucide-react";
import { ShipPost } from "./ShipCard";
import { useToast } from "./Toast";

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
  const { success, error: toastError } = useToast();
  const [content, setContent] = useState("");
  const [tags, setTags] = useState("");
  const [link, setLink] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [streakStatus, setStreakStatus] = useState<StreakStatus | null>(null);
  const [timeUntilReset, setTimeUntilReset] = useState<string>("");
  const [forceShowForm, setForceShowForm] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

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
      setTimeUntilReset(`${hours}h ${minutes}m`);
    }

    updateCountdown();
    const interval = setInterval(updateCountdown, 1000);
    return () => clearInterval(interval);
  }, []);

  async function handleSubmit(e?: React.FormEvent) {
    if (e) e.preventDefault();
    if (!content.trim() || loading) return;

    if (content.length > 280) {
      setError("Max 280 characters.");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // If user is not logged in, auto provision demo session
      if (!session?.user) {
        const loginRes = await signIn("credentials", {
          redirect: false,
          email: "shravan@shipit.dev",
          name: "Shravan Choudhary",
          username: "shravan",
        });

        if (loginRes?.error) {
          setError("Please sign in to post.");
          toastError("Please sign in to post.");
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
          allowAnotherToday: forceShowForm,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Failed to post ship.");
        toastError(data.error || "Failed to post ship.");
        if (data.alreadyShipped) {
          setStreakStatus((prev) =>
            prev ? { ...prev, hasShippedToday: true } : null
          );
        }
      } else {
        const nextStreak = data.post?.user?.currentStreak || (streakStatus?.currentStreak || 0) + 1;
        success(`🚀 Shipped! Daily streak is now ${nextStreak} day${nextStreak === 1 ? "" : "s"}.`);
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
      toastError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  // Handle keyboard shortcut: Cmd+Enter or Ctrl+Enter
  function handleKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if ((e.metaKey || e.ctrlKey) && e.key === "Enter") {
      e.preventDefault();
      handleSubmit();
    }
  }

  // If user already shipped today and hasn't clicked "Ship Another"
  if (session?.user && streakStatus?.hasShippedToday && !forceShowForm) {
    return (
      <div className="rounded-xl border border-zinc-200 bg-white p-4 sm:p-5 mb-5 shadow-xs minimal-card">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-emerald-50 text-emerald-600 border border-emerald-200 flex-shrink-0">
              <CheckCircle2 size={18} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-xs font-bold text-zinc-900">
                  You shipped today!
                </h3>
                <span className="inline-flex items-center gap-1 rounded-full border border-orange-200 bg-orange-50 px-2 py-0.5 text-[11px] font-semibold text-orange-700">
                  <Flame size={11} className="text-[#eb5e52] fill-[#eb5e52]" />
                  {streakStatus.currentStreak} day streak
                </span>
              </div>
              <p className="text-[11px] text-zinc-500 mt-0.5">
                Next shipping window unlocks at midnight IST ({timeUntilReset} remaining).
              </p>
            </div>
          </div>

          {process.env.NODE_ENV === "development" && (
            <button
              onClick={() => setForceShowForm(true)}
              className="inline-flex items-center gap-1.5 rounded-md border border-dashed border-zinc-300 bg-zinc-50 hover:bg-zinc-100 px-2.5 py-1 text-[11px] font-mono text-zinc-600 transition-colors self-start sm:self-center"
              title="Developer override (development only)"
            >
              <Plus size={11} />
              <span>Dev: Test Another Ship</span>
            </button>
          )}
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
      className="rounded-xl border border-zinc-200 bg-white p-4 sm:p-5 shadow-xs relative mb-5 cool-card"
    >
      <div className="flex items-start gap-3">
        {/* User avatar */}
        <div className="h-9 w-9 rounded-full bg-zinc-100 border border-zinc-200 flex items-center justify-center flex-shrink-0 text-xs font-bold text-zinc-700 overflow-hidden mt-0.5">
          {session?.user?.image ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={session.user.image}
              alt={session.user.name || "User"}
              className="h-full w-full object-cover"
            />
          ) : (
            <span>{(session?.user?.name || "U").slice(0, 1)}</span>
          )}
        </div>

        {/* Input body */}
        <div className="flex-1 min-w-0">
          <textarea
            ref={textareaRef}
            value={content}
            onChange={(e) => setContent(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="What did you build, fix, or ship today? (≤280 chars)"
            rows={3}
            maxLength={280}
            required
            className="w-full bg-transparent text-sm text-zinc-900 placeholder-zinc-400 focus:outline-none resize-none leading-relaxed"
          />

          {error && (
            <div className="my-2 rounded-lg border border-red-200 bg-red-50 px-3 py-1.5 text-xs text-red-600">
              {error}
            </div>
          )}

          {/* Quick tags row */}
          <div className="mt-1 flex items-center gap-1.5 flex-wrap">
            <span className="text-[11px] text-zinc-400 font-medium">Add tag:</span>
            {QUICK_TAGS.map((t) => (
              <button
                key={t}
                type="button"
                onClick={() => handleAddTag(t)}
                className="rounded border border-zinc-200 bg-zinc-50 hover:bg-zinc-100 px-2 py-0.5 text-[11px] text-zinc-600 transition-colors"
              >
                + {t}
              </button>
            ))}
          </div>

          {/* Tag & Link inline inputs */}
          <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-2">
            <div className="relative">
              <Hash size={12} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-zinc-400" />
              <input
                type="text"
                value={tags}
                onChange={(e) => setTags(e.target.value)}
                placeholder="Custom tags: #react #redis"
                className="w-full rounded-md border border-zinc-200 bg-zinc-50/50 py-1.5 pl-7 pr-2.5 text-xs text-zinc-800 placeholder-zinc-400 focus:bg-white focus:outline-none focus:border-zinc-300"
              />
            </div>

            <div className="relative">
              <Link2 size={12} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-zinc-400" />
              <input
                type="url"
                value={link}
                onChange={(e) => setLink(e.target.value)}
                placeholder="Demo URL or GitHub link"
                className="w-full rounded-md border border-zinc-200 bg-zinc-50/50 py-1.5 pl-7 pr-2.5 text-xs text-zinc-800 placeholder-zinc-400 focus:bg-white focus:outline-none focus:border-zinc-300"
              />
            </div>
          </div>

          {/* Bottom toolbar */}
          <div className="mt-3.5 flex items-center justify-between pt-2.5 border-t border-zinc-100">
            <div className="flex items-center gap-2">
              <span
                className={`font-mono text-xs ${
                  charsLeft < 20
                    ? "text-red-500 font-bold"
                    : charsLeft < 50
                    ? "text-amber-500 font-semibold"
                    : "text-zinc-400"
                }`}
              >
                {charsLeft}
              </span>
              <span className="text-[10px] text-zinc-400 font-mono">/ 280</span>

              {!session?.user && (
                <span className="text-[11px] text-zinc-400 hidden sm:inline ml-2">
                  (Posting as guest ·{" "}
                  <Link href="/login" className="text-[#eb5e52] hover:underline font-medium">
                    sign in with Google
                  </Link>
                  )
                </span>
              )}
            </div>

            <button
              type="submit"
              disabled={loading || !content.trim()}
              className="inline-flex items-center gap-1.5 rounded-lg bg-[#eb5e52] hover:bg-[#de5044] px-3.5 py-1.5 text-xs font-semibold text-white shadow-xs disabled:opacity-50 transition-colors"
            >
              {loading ? (
                <span>Posting...</span>
              ) : (
                <>
                  <span>Ship It</span>
                  <Send size={11} />
                  <kbd className="hidden sm:inline-block text-[9px] bg-white/20 border border-white/25 px-1 py-0.5 rounded font-mono font-normal">
                    ⌘↵
                  </kbd>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </form>
  );
}
