"use client";

import React, { useState, useMemo } from "react";
import { Flame, Calendar, Sparkles } from "lucide-react";

interface ActivityHeatmapProps {
  posts?: Array<{ createdAt: string | Date }>;
  currentStreak?: number;
  longestStreak?: number;
  hasShippedToday?: boolean;
  weeksCount?: number;
}

function toLocalDateKey(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

export function ActivityHeatmap({
  posts = [],
  currentStreak = 0,
  longestStreak = 0,
  hasShippedToday = false,
  weeksCount = 14,
}: ActivityHeatmapProps) {
  const [selectedDay, setSelectedDay] = useState<{
    dateStr: string;
    count: number;
    formattedDate: string;
  } | null>(null);

  // Map dates (YYYY-MM-DD in local time) to ship counts
  const dateCounts = useMemo(() => {
    const map = new Map<string, number>();

    // 1. Map all actual recorded posts
    posts.forEach((p) => {
      const d = typeof p.createdAt === "string" ? new Date(p.createdAt) : p.createdAt;
      const key = toLocalDateKey(d);
      map.set(key, (map.get(key) || 0) + 1);
    });

    // 2. Ensure current streak days are also lit up if user has an active streak
    if (currentStreak > 0) {
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const todayKey = toLocalDateKey(today);
      const isTodayActive = hasShippedToday || map.has(todayKey);
      const startOffset = isTodayActive ? 0 : 1;

      for (let i = 0; i < currentStreak; i++) {
        const streakDay = new Date(today);
        streakDay.setDate(today.getDate() - (i + startOffset));
        const key = toLocalDateKey(streakDay);
        if (!map.has(key)) {
          map.set(key, 1);
        }
      }
    }

    return map;
  }, [posts, currentStreak, hasShippedToday]);

  // Generate matrix of weeks (cols: weeks, rows: 7 days, Mon -> Sun)
  // The rightmost column is ALWAYS the current week ending on Sunday.
  const { weeks, totalShippedDays, consistencyRate } = useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Day of week: 0 = Sun, 1 = Mon, ..., 6 = Sat
    const dayOfWeek = today.getDay();
    const daysSinceMonday = dayOfWeek === 0 ? 6 : dayOfWeek - 1;

    // Monday of the current week
    const currentMonday = new Date(today);
    currentMonday.setDate(today.getDate() - daysSinceMonday);

    // Start date is (weeksCount - 1) weeks before current Monday
    const startDate = new Date(currentMonday);
    startDate.setDate(currentMonday.getDate() - (weeksCount - 1) * 7);

    const generatedWeeks: Array<
      Array<{
        date: Date;
        dateStr: string;
        count: number;
        isToday: boolean;
        isFuture: boolean;
        formattedDate: string;
      }>
    > = [];

    let shippedCount = 0;
    let pastDaysCount = 0;

    for (let w = 0; w < weeksCount; w++) {
      const weekDays = [];
      for (let d = 0; d < 7; d++) {
        const dayDate = new Date(startDate);
        dayDate.setDate(startDate.getDate() + (w * 7 + d));

        const isToday = dayDate.getTime() === today.getTime();
        const isFuture = dayDate.getTime() > today.getTime();
        const dateStr = toLocalDateKey(dayDate);
        const count = isFuture ? 0 : dateCounts.get(dateStr) || 0;

        if (!isFuture) {
          pastDaysCount++;
          if (count > 0) shippedCount++;
        }

        weekDays.push({
          date: dayDate,
          dateStr,
          count,
          isToday,
          isFuture,
          formattedDate: dayDate.toLocaleDateString("en-US", {
            weekday: "short",
            month: "short",
            day: "numeric",
            year: "numeric",
          }),
        });
      }
      generatedWeeks.push(weekDays);
    }

    const rate = pastDaysCount > 0 ? Math.round((shippedCount / pastDaysCount) * 100) : 0;

    return {
      weeks: generatedWeeks,
      totalShippedDays: shippedCount,
      consistencyRate: rate,
    };
  }, [dateCounts, weeksCount]);

  return (
    <div className="rounded-xl border border-zinc-200 bg-white p-4 sm:p-5 shadow-xs minimal-card">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-zinc-100">
        <div className="flex items-center gap-2">
          <Calendar size={14} className="text-zinc-500" />
          <h3 className="text-xs font-semibold uppercase tracking-wider text-zinc-900">
            Shipping Activity
          </h3>
          <span className="text-[10px] text-zinc-400 font-mono">
            ({weeksCount} weeks)
          </span>
        </div>

        <div className="flex items-center gap-2.5 text-xs">
          <span className="text-zinc-500 text-[11px]">
            <strong className="text-zinc-900 font-mono font-bold">
              {totalShippedDays}
            </strong>{" "}
            day{totalShippedDays === 1 ? "" : "s"} shipped
          </span>

          <span className="text-zinc-300">·</span>

          <span className="text-zinc-500 text-[11px] font-mono">
            {consistencyRate}% consistency
          </span>

          {currentStreak > 0 && (
            <span className="inline-flex items-center gap-1 rounded border border-orange-200 bg-orange-50 px-2 py-0.5 text-[11px] font-semibold text-orange-700 ml-1">
              <Flame size={11} className="text-[#eb5e52] fill-[#eb5e52]" />
              {currentStreak}d streak
            </span>
          )}
        </div>
      </div>

      {/* Grid container with smooth horizontal scroll */}
      <div className="mt-4 overflow-x-auto pb-1">
        <div className="inline-block min-w-full">
          {/* Month labels header row */}
          <div className="flex gap-1.5 pl-6 sm:pl-7 mb-2 text-[10px] text-zinc-400 font-mono select-none h-4">
            {weeks.map((week, wIdx) => {
              // Show month label if week contains the 1st of month, or is first week
              const hasMonthStart =
                week.some((d) => d.date.getDate() === 1) || wIdx === 0;
              const monthDay =
                week.find((d) => d.date.getDate() === 1) || week[0];
              const monthName = monthDay.date.toLocaleDateString("en-US", {
                month: "short",
              });

              return (
                <div key={wIdx} className="w-3 sm:w-3.5 flex-shrink-0 relative">
                  {hasMonthStart && (
                    <span className="absolute left-0 -top-1 whitespace-nowrap text-[10px] text-zinc-500 font-medium">
                      {monthName}
                    </span>
                  )}
                </div>
              );
            })}
          </div>

          <div className="flex items-start">
            {/* Weekday labels (7 rows aligned 1:1 with squares) */}
            <div className="flex flex-col gap-1.5 text-[9px] text-zinc-400 font-mono select-none pr-1.5 text-right w-5 sm:w-6 flex-shrink-0">
              <div className="h-3 sm:h-3.5 flex items-center justify-end leading-none">
                Mon
              </div>
              <div className="h-3 sm:h-3.5 flex items-center justify-end leading-none opacity-0">
                Tue
              </div>
              <div className="h-3 sm:h-3.5 flex items-center justify-end leading-none">
                Wed
              </div>
              <div className="h-3 sm:h-3.5 flex items-center justify-end leading-none opacity-0">
                Thu
              </div>
              <div className="h-3 sm:h-3.5 flex items-center justify-end leading-none">
                Fri
              </div>
              <div className="h-3 sm:h-3.5 flex items-center justify-end leading-none opacity-0">
                Sat
              </div>
              <div className="h-3 sm:h-3.5 flex items-center justify-end leading-none">
                Sun
              </div>
            </div>

            {/* Week Columns */}
            <div className="flex gap-1.5">
              {weeks.map((week, wIdx) => (
                <div key={wIdx} className="flex flex-col gap-1.5">
                  {week.map((day) => {
                    const isSelected = selectedDay?.dateStr === day.dateStr;

                    return (
                      <div
                        key={day.dateStr}
                        onMouseEnter={() => setSelectedDay(day)}
                        onClick={() => setSelectedDay(day)}
                        className={`h-3 w-3 sm:h-3.5 sm:w-3.5 rounded-[2.5px] transition-all cursor-pointer ${
                          day.isFuture
                            ? "bg-zinc-50 border border-zinc-100 cursor-default"
                            : day.count >= 2
                            ? "bg-[#eb5e52] border border-[#de5044] shadow-2xs"
                            : day.count === 1
                            ? "bg-[#eb5e52]/70 border border-[#eb5e52]/90"
                            : "bg-zinc-100 border border-zinc-200/60 hover:bg-zinc-200"
                        } ${
                          day.isToday
                            ? "ring-1.5 ring-zinc-900 ring-offset-1"
                            : ""
                        } ${
                          isSelected && !day.isFuture
                            ? "scale-125 z-10 shadow-xs ring-1 ring-zinc-800"
                            : ""
                        }`}
                        title={`${day.formattedDate}: ${
                          day.isFuture
                            ? "Upcoming"
                            : day.count === 0
                            ? "No ships"
                            : `${day.count} ship${day.count === 1 ? "" : "s"}`
                        }`}
                      />
                    );
                  })}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Tooltip & Legend Footer */}
      <div className="mt-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-2 pt-2.5 border-t border-zinc-100 text-xs">
        {/* Hovered / selected day details */}
        <div className="text-[11px] text-zinc-600 min-h-[18px]">
          {selectedDay ? (
            <span className="font-medium text-zinc-800">
              {selectedDay.formattedDate} —{" "}
              {selectedDay.count === 0 ? (
                <span className="text-zinc-500">No ships logged</span>
              ) : (
                <span className="text-[#eb5e52] font-semibold">
                  {selectedDay.count} ship{selectedDay.count === 1 ? "" : "s"} logged 🔥
                </span>
              )}
            </span>
          ) : (
            <span className="text-zinc-400 text-[11px]">
              Hover or tap on any square to inspect daily shipping log
            </span>
          )}
        </div>

        {/* Legend */}
        <div className="flex items-center gap-1.5 text-[10px] text-zinc-400 font-mono">
          <span>Less</span>
          <div
            className="h-2.5 w-2.5 rounded-[2px] bg-zinc-100 border border-zinc-200/60"
            title="0 ships"
          />
          <div
            className="h-2.5 w-2.5 rounded-[2px] bg-[#eb5e52]/70 border border-[#eb5e52]/90"
            title="1 ship"
          />
          <div
            className="h-2.5 w-2.5 rounded-[2px] bg-[#eb5e52] border border-[#de5044]"
            title="2+ ships"
          />
          <span>More</span>
        </div>
      </div>
    </div>
  );
}
