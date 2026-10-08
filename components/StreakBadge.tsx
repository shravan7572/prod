"use client";

import React from "react";
import { Flame } from "lucide-react";

interface StreakBadgeProps {
  currentStreak: number;
  longestStreak?: number;
  showLongest?: boolean;
  size?: "sm" | "md" | "lg";
}

export function StreakBadge({
  currentStreak,
  longestStreak,
  showLongest = false,
  size = "md",
}: StreakBadgeProps) {
  const sizeClasses = {
    sm: "text-xs px-2 py-0.5 gap-1",
    md: "text-xs px-2.5 py-1 gap-1.5",
    lg: "text-sm px-3.5 py-1.5 gap-2",
  };

  const iconSizes = {
    sm: 12,
    md: 14,
    lg: 16,
  };

  return (
    <div className="inline-flex items-center gap-2">
      <div
        className={`inline-flex items-center font-medium rounded-full border transition-colors ${
          currentStreak > 0
            ? "border-zinc-700 bg-zinc-900 text-zinc-100"
            : "border-zinc-800 bg-zinc-950 text-zinc-500"
        } ${sizeClasses[size]}`}
        title={`${currentStreak} day current streak`}
      >
        <Flame
          size={iconSizes[size]}
          className={currentStreak > 0 ? "text-zinc-100 fill-zinc-100" : "text-zinc-600"}
        />
        <span>
          <span className="font-mono font-semibold">{currentStreak}</span>{" "}
          <span className="text-zinc-400">day{currentStreak === 1 ? "" : "s"}</span>
        </span>
      </div>

      {showLongest && longestStreak !== undefined && longestStreak > 0 && (
        <div
          className={`inline-flex items-center font-mono rounded-full border border-zinc-800/80 bg-zinc-900/40 text-zinc-400 ${sizeClasses[size]}`}
          title={`Longest streak record: ${longestStreak} days`}
        >
          <span className="text-zinc-500 text-[10px] uppercase tracking-wider mr-1">Best</span>
          <span className="font-semibold text-zinc-200">{longestStreak}d</span>
        </div>
      )}
    </div>
  );
}
