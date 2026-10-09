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
    sm: "text-xs px-2.5 py-0.5 gap-1.5",
    md: "text-xs px-3 py-1 gap-1.5",
    lg: "text-sm px-3.5 py-1.5 gap-2",
  };

  const iconSizes = {
    sm: 13,
    md: 14,
    lg: 16,
  };

  return (
    <div className="inline-flex items-center gap-2">
      <div
        className={`inline-flex items-center font-medium rounded-full border transition-all ${
          currentStreak > 0
            ? "border-orange-200 bg-orange-50/80 text-orange-700"
            : "border-zinc-200 bg-zinc-100 text-zinc-600"
        } ${sizeClasses[size]}`}
        title={`${currentStreak} day streak`}
      >
        <Flame
          size={iconSizes[size]}
          className={currentStreak > 0 ? "text-[#eb5e52] fill-[#eb5e52]" : "text-zinc-400"}
        />
        <span>
          <span className="font-bold">{currentStreak}</span>{" "}
          <span className="text-zinc-500 font-normal">
            day{currentStreak === 1 ? "" : "s"}
          </span>
        </span>
      </div>

      {showLongest && longestStreak !== undefined && longestStreak > 0 && (
        <div
          className={`inline-flex items-center rounded-full border border-zinc-200 bg-zinc-50 text-zinc-600 ${sizeClasses[size]}`}
          title={`Best record: ${longestStreak} days`}
        >
          <span className="text-zinc-400 text-[10px] uppercase font-semibold mr-1">Best</span>
          <span className="font-bold text-zinc-700">{longestStreak}d</span>
        </div>
      )}
    </div>
  );
}
