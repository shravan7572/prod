import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const limit = Math.min(parseInt(searchParams.get("limit") || "30", 10), 100);

    // Get IDs of users being followed
    const follows = await prisma.follow.findMany({
      where: {
        followerId: session.user.id,
      },
      select: {
        followingId: true,
      },
    });

    const followingIds = follows.map((f) => f.followingId);

    // If not following anyone, return empty array with count
    if (followingIds.length === 0) {
      return NextResponse.json({ posts: [], followingCount: 0 });
    }

    const posts = await prisma.post.findMany({
      where: {
        userId: {
          in: followingIds,
        },
      },
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

    return NextResponse.json({ posts, followingCount: followingIds.length });
  } catch (error) {
    console.error("GET /api/posts/feed error:", error);
    return NextResponse.json({ error: "Failed to fetch following feed" }, { status: 500 });
  }
}
