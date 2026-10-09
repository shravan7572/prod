"use client";

import React, { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { Target, Plus, Check, ChevronDown, ChevronUp } from "lucide-react";

export function PledgeBanner() {
  const { data: session } = useSession();
  const [pledge, setPledge] = useState<{ id: string; content: string } | null>(null);
  const [isAdding, setIsAdding] = useState(false);
  const [content, setContent] = useState("");
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    if (session?.user) {
      fetchPledge();
    }
  }, [session?.user]);

  async function fetchPledge() {
    try {
      const res = await fetch("/api/pledges/today");
      if (res.ok) {
        const data = await res.json();
        setPledge(data.pledge);
      }
    } catch (err) {
      console.error("Failed to fetch pledge:", err);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!content.trim() || loading) return;

    setLoading(true);
    try {
      const res = await fetch("/api/pledges", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content }),
      });
      if (res.ok) {
        const data = await res.json();
        setPledge(data.pledge);
        setContent("");
        setIsAdding(false);
        setSubmitted(true);
        setTimeout(() => setSubmitted(false), 3000);
      }
    } catch (err) {
      console.error("Failed to create pledge:", err);
    } finally {
      setLoading(false);
    }
  }

  if (!session?.user) return null;

  return (
    <div className="rounded-xl border border-zinc-800/80 bg-zinc-950/70 backdrop-blur-sm p-4 shadow-sm transition-colors">
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="flex h-7 w-7 items-center justify-center rounded-lg border border-zinc-800 bg-zinc-900 text-zinc-300">
            <Target size={14} />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold uppercase tracking-wider text-zinc-400">
                {pledge ? "Today's Pledge" : "Tomorrow's Pledge"}
              </span>
              {submitted && (
                <span className="inline-flex items-center gap-1 text-[10px] text-zinc-300 font-mono">
                  <Check size={10} /> Saved
                </span>
              )}
            </div>
            <p className="text-xs text-zinc-200 truncate mt-0.5">
              {pledge ? pledge.content : "Commit in advance. What will you build tomorrow?"}
            </p>
          </div>
        </div>

        <button
          onClick={() => setIsAdding(!isAdding)}
          className="inline-flex items-center gap-1 rounded-md border border-zinc-800 bg-zinc-900/80 px-2.5 py-1 text-xs font-medium text-zinc-300 hover:border-zinc-700 hover:text-zinc-100 transition-colors flex-shrink-0"
        >
          {isAdding ? (
            <>
              <span>Close</span>
              <ChevronUp size={12} />
            </>
          ) : (
            <>
              <span>{pledge ? "Change" : "Pledge"}</span>
              {pledge ? <ChevronDown size={12} /> : <Plus size={12} />}
            </>
          )}
        </button>
      </div>

      {isAdding && (
        <form onSubmit={handleSubmit} className="mt-3 pt-3 border-t border-zinc-900">
          <div className="flex gap-2">
            <input
              type="text"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Tomorrow I will ship..."
              maxLength={280}
              required
              className="flex-1 rounded-lg border border-zinc-800 bg-zinc-900/80 px-3 py-1.5 text-xs text-zinc-100 placeholder-zinc-500 focus:border-zinc-600 focus:outline-none transition-colors"
            />
            <button
              type="submit"
              disabled={loading || !content.trim()}
              className="rounded-lg border border-zinc-700 bg-zinc-100 px-3 py-1.5 text-xs font-semibold text-zinc-950 hover:bg-white disabled:opacity-40 transition-colors flex-shrink-0"
            >
              {loading ? "Saving..." : "Commit"}
            </button>
          </div>
        </form>
      )}
    </div>
  );
}
