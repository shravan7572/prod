import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const limit = Math.min(parseInt(searchParams.get("limit") || "30", 10), 100);
    const tag = searchParams.get("tag");
    const city = searchParams.get("city");

    const whereClause: Record<string, unknown> = {};
    if (tag) {
      whereClause.tags = {
        has: tag.replace(/^#/, "").toLowerCase(),
      };
    }
    if (city && city !== "All") {
      whereClause.user = {
        city: {
          equals: city,
          mode: "insensitive",
        },
      };
    }

    const posts = await prisma.post.findMany({
      where: whereClause,
      take: limit,
      orderBy: {
        createdAt: "desc",
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            username: true,
            image: true,
            currentStreak: true,
            longestStreak: true,
            city: true,
            college: true,
            lastShippedAt: true,
          },
        },
      },
    });

    return NextResponse.json({ posts });
  } catch (error) {
    console.error("GET /api/posts/discover error:", error);
    return NextResponse.json({ error: "Failed to fetch discover feed" }, { status: 500 });
  }
}
