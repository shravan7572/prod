import { prisma } from "@/lib/prisma";

const IST_OFFSET_MS = 5.5 * 60 * 60 * 1000; // +05:30

export function getISTDate(date: Date = new Date()): Date {
  return new Date(date.getTime() + IST_OFFSET_MS);
}

export function getISTDateString(date: Date = new Date()): string {
  const ist = getISTDate(date);
  const y = ist.getUTCFullYear();
  const m = String(ist.getUTCMonth() + 1).padStart(2, "0");
  const d = String(ist.getUTCDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

export function getISTMidnightUTC(date: Date = new Date()): Date {
  const ist = getISTDate(date);
  const midnightIST = Date.UTC(ist.getUTCFullYear(), ist.getUTCMonth(), ist.getUTCDate(), 0, 0, 0, 0);
  return new Date(midnightIST - IST_OFFSET_MS);
}

export function getDayDifferenceInIST(date1: Date, date2: Date): number {
  const str1 = getISTDateString(date1);
  const str2 = getISTDateString(date2);
  const ms1 = Date.parse(`${str1}T00:00:00Z`);
  const ms2 = Date.parse(`${str2}T00:00:00Z`);
  return Math.round((ms1 - ms2) / (24 * 60 * 60 * 1000));
}

/**
 * Checks whether user has already shipped today in IST.
 */
export async function hasShippedToday(userId: string): Promise<boolean> {
  const midnightUTC = getISTMidnightUTC(new Date());

  const existingPost = await prisma.post.findFirst({
    where: {
      userId,
      createdAt: {
        gte: midnightUTC,
      },
    },
  });

  return !!existingPost;
}

/**
 * Updates streak when user submits a post today.
 */
export async function updateStreakOnPost(userId: string) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
  });

  if (!user) throw new Error("User not found");

  const now = new Date();
  let newStreak = 1;

  if (user.lastShippedAt) {
    const dayDiff = getDayDifferenceInIST(now, new Date(user.lastShippedAt));
    if (dayDiff === 0) {
      // Same day, streak doesn't change
      newStreak = user.currentStreak;
    } else if (dayDiff === 1) {
      // Consecutive calendar day
      newStreak = user.currentStreak + 1;
    } else {
      // Missed 1 or more days
      newStreak = 1;
    }
  }

  const longestStreak = Math.max(newStreak, user.longestStreak);

  const updatedUser = await prisma.user.update({
    where: { id: userId },
    data: {
      currentStreak: newStreak,
      longestStreak,
      lastShippedAt: now,
    },
  });

  return updatedUser;
}

/**
 * Calculates current active streak for display (if missed yesterday, streak is 0 until shipping today)
 */
export function calculateEffectiveStreak(user: {
  currentStreak: number;
  longestStreak: number;
  lastShippedAt: Date | string | null;
}) {
  if (!user.lastShippedAt || user.currentStreak === 0) {
    return {
      currentStreak: 0,
      longestStreak: user.longestStreak,
      hasShippedToday: false,
    };
  }

  const lastShipped = new Date(user.lastShippedAt);
  const dayDiff = getDayDifferenceInIST(new Date(), lastShipped);

  if (dayDiff === 0) {
    return {
      currentStreak: user.currentStreak,
      longestStreak: user.longestStreak,
      hasShippedToday: true,
    };
  }

  if (dayDiff === 1) {
    // Yesterday shipped, today still has chance to ship
    return {
      currentStreak: user.currentStreak,
      longestStreak: user.longestStreak,
      hasShippedToday: false,
    };
  }

  // Broken streak (2 or more days ago)
  return {
    currentStreak: 0,
    longestStreak: user.longestStreak,
    hasShippedToday: false,
  };
}
