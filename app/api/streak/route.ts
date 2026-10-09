import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { calculateEffectiveStreak, getISTMidnightUTC } from "@/lib/streak";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: {
        id: true,
        username: true,
        currentStreak: true,
        longestStreak: true,
        lastShippedAt: true,
      },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const streakInfo = calculateEffectiveStreak({
      currentStreak: user.currentStreak,
      longestStreak: user.longestStreak,
      lastShippedAt: user.lastShippedAt,
    });

    const midnightIST = getISTMidnightUTC();

    return NextResponse.json({
      currentStreak: streakInfo.currentStreak,
      longestStreak: streakInfo.longestStreak,
      hasShippedToday: streakInfo.hasShippedToday,
      lastShippedAt: user.lastShippedAt,
      nextResetTime: new Date(midnightIST.getTime() + 24 * 60 * 60 * 1000).toISOString(),
    });
  } catch (error) {
    console.error("GET /api/streak error:", error);
    return NextResponse.json({
      currentStreak: 0,
      longestStreak: 0,
      hasShippedToday: false,
      nextResetTime: new Date().toISOString(),
    });
  }
}
