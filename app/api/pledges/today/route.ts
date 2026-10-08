import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getISTMidnightUTC } from "@/lib/streak";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const todayMidnight = getISTMidnightUTC();
    const yesterdayMidnight = new Date(todayMidnight.getTime() - 24 * 60 * 60 * 1000);

    // Look for pledges created yesterday for today, or created today for tomorrow
    const pledge = await prisma.pledge.findFirst({
      where: {
        userId: session.user.id,
        createdAt: {
          gte: yesterdayMidnight,
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return NextResponse.json({ pledge: pledge || null });
  } catch (error) {
    console.error("GET /api/pledges/today error:", error);
    return NextResponse.json({ error: "Failed to fetch today's pledge" }, { status: 500 });
  }
}
