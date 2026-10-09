import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { hasShippedToday, updateStreakOnPost } from "@/lib/streak";
import { broadcastNewPostToWSServer } from "@/lib/websocket";

function parseTags(input: unknown): string[] {
  if (!input) return [];
  if (Array.isArray(input)) {
    return input
      .map((t) => String(t).replace(/^#/, "").trim().toLowerCase())
      .filter(Boolean);
  }
  if (typeof input === "string") {
    const hashMatches = input.match(/#([a-zA-Z0-9_\-]+)/g);
    if (hashMatches && hashMatches.length > 0) {
      return Array.from(
        new Set(hashMatches.map((t) => t.replace(/^#/, "").trim().toLowerCase()))
      );
    }
    return Array.from(
      new Set(
        input
          .split(/[,\s]+/)
          .map((t) => t.replace(/^#/, "").trim().toLowerCase())
          .filter(Boolean)
      )
    );
  }
  return [];
}

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
    console.error("GET /api/posts error:", error);
    return NextResponse.json({ error: "Failed to fetch posts" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized. Please sign in." }, { status: 401 });
    }

    const userId = session.user.id;
    const body = await req.json();

    const content = (body.content || "").trim();
    if (!content) {
      return NextResponse.json({ error: "What did you ship? Content is required." }, { status: 400 });
    }

    if (content.length > 280) {
      return NextResponse.json({ error: "Post cannot exceed 280 characters." }, { status: 400 });
    }

    // 1 Post per day check (resets at midnight IST)
    const alreadyShipped = await hasShippedToday(userId);
    const allowOverride = body.allowAnotherToday === true;

    if (alreadyShipped && !allowOverride) {
      return NextResponse.json(
        {
          error: "Already shipped today! Only 1 ship per day is allowed. Next ship unlocks at midnight IST.",
          alreadyShipped: true,
        },
        { status: 400 }
      );
    }

    const links = (body.links || body.link || "").trim() || null;
    const tags = parseTags(body.tags);

    // Create post
    const post = await prisma.post.create({
      data: {
        content,
        links,
        tags,
        userId,
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
            followers: {
              select: {
                followerId: true,
              },
            },
          },
        },
      },
    });

    // Update streak
    const updatedUser = await updateStreakOnPost(userId);

    // Extract follower IDs for WS broadcast
    const followerIds = post.user.followers.map((f) => f.followerId);

    // Format post response
    const postWithStreak = {
      ...post,
      user: {
        ...post.user,
        currentStreak: updatedUser.currentStreak,
        longestStreak: updatedUser.longestStreak,
        lastShippedAt: updatedUser.lastShippedAt,
      },
    };

    // Broadcast over WebSocket asynchronously
    broadcastNewPostToWSServer(postWithStreak, followerIds).catch(() => {});

    return NextResponse.json({
      message: "Shipped successfully! Streak updated.",
      post: postWithStreak,
    });
  } catch (error) {
    console.error("POST /api/posts error:", error);
    return NextResponse.json({ error: "Failed to create ship post." }, { status: 500 });
  }
}