"use client";

import React, { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { Target, Plus, Check, ChevronDown, ChevronUp } from "lucide-react";
import { useToast } from "./Toast";

export function PledgeBanner() {
  const { data: session } = useSession();
  const { success } = useToast();
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
        success("Pledge saved! Tomorrow we ship 🔥");
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
    <div className="rounded-xl border border-zinc-200 bg-white p-3.5 shadow-xs mb-4 minimal-card">
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-zinc-100 text-zinc-600 flex-shrink-0">
            <Target size={14} />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold text-zinc-900">
                {pledge ? "Today's Pledge" : "Tomorrow's Pledge"}
              </span>
              {submitted && (
                <span className="inline-flex items-center gap-1 text-[11px] text-emerald-600 font-medium">
                  <Check size={11} /> Saved
                </span>
              )}
            </div>
            <p className="text-xs text-zinc-500 truncate mt-0.5">
              {pledge ? pledge.content : "Commit in advance: What will you build tomorrow?"}
            </p>
          </div>
        </div>

        <button
          onClick={() => setIsAdding(!isAdding)}
          className="inline-flex items-center gap-1 rounded-lg border border-zinc-200 bg-zinc-50 hover:bg-zinc-100 px-2.5 py-1 text-xs font-medium text-zinc-700 transition-colors flex-shrink-0"
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
        <form onSubmit={handleSubmit} className="mt-3 pt-3 border-t border-zinc-100">
          <div className="flex gap-2">
            <input
              type="text"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Tomorrow I will ship..."
              maxLength={280}
              required
              className="flex-1 rounded-lg border border-zinc-200 bg-zinc-50 px-3 py-1.5 text-xs text-zinc-900 placeholder-zinc-400 focus:border-zinc-400 focus:bg-white focus:outline-none transition-colors"
            />
            <button
              type="submit"
              disabled={loading || !content.trim()}
              className="rounded-lg bg-[#eb5e52] hover:bg-[#de5044] px-3.5 py-1.5 text-xs font-semibold text-white disabled:opacity-40 transition-colors flex-shrink-0 shadow-xs"
            >
              {loading ? "Saving..." : "Commit"}
            </button>
          </div>
        </form>
      )}
    </div>
  );
}
