import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { calculateEffectiveStreak } from "@/lib/streak";

export async function GET(
  req: NextRequest,
  context: { params: Promise<{ username: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    const { username } = await context.params;

    const user = await prisma.user.findFirst({
      where: {
        username: {
          equals: username,
          mode: "insensitive",
        },
      },
      include: {
        _count: {
          select: {
            followers: true,
            following: true,
            posts: true,
          },
        },
        posts: {
          orderBy: {
            createdAt: "desc",
          },
          take: 50,
        },
      },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    let isFollowing = false;
    if (session?.user?.id && session.user.id !== user.id) {
      const followRecord = await prisma.follow.findUnique({
        where: {
          followerId_followingId: {
            followerId: session.user.id,
            followingId: user.id,
          },
        },
      });
      isFollowing = !!followRecord;
    }

    const streakInfo = calculateEffectiveStreak({
      currentStreak: user.currentStreak,
      longestStreak: user.longestStreak,
      lastShippedAt: user.lastShippedAt,
    });

    return NextResponse.json({
      user: {
        id: user.id,
        name: user.name,
        username: user.username,
        email: session?.user?.id === user.id ? user.email : undefined,
        image: user.image,
        bio: user.bio,
        githubUrl: user.githubUrl,
        college: user.college,
        city: user.city,
        createdAt: user.createdAt,
        currentStreak: streakInfo.currentStreak,
        longestStreak: streakInfo.longestStreak,
        hasShippedToday: streakInfo.hasShippedToday,
        lastShippedAt: user.lastShippedAt,
        followerCount: user._count.followers,
        followingCount: user._count.following,
        postCount: user._count.posts,
        isFollowing,
        isSelf: session?.user?.id === user.id,
      },
      posts: user.posts.map((p) => ({
        ...p,
        user: {
          id: user.id,
          name: user.name,
          username: user.username,
          image: user.image,
          currentStreak: streakInfo.currentStreak,
          longestStreak: streakInfo.longestStreak,
        },
      })),
    });
  } catch (error) {
    console.error("GET user profile error:", error);
    return NextResponse.json({ error: "Failed to fetch profile" }, { status: 500 });
  }
}
