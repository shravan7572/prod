import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    const currentUserId = session?.user?.id;

    // Fetch top active users with streaks or recent ships
    const users = await prisma.user.findMany({
      where: currentUserId ? { id: { not: currentUserId } } : undefined,
      take: 6,
      orderBy: [
        { currentStreak: "desc" },
        { createdAt: "desc" },
      ],
      select: {
        id: true,
        name: true,
        username: true,
        image: true,
        bio: true,
        city: true,
        college: true,
        currentStreak: true,
        longestStreak: true,
        followers: currentUserId
          ? {
              where: { followerId: currentUserId },
              select: { followerId: true },
            }
          : false,
      },
    });

    const suggestions = users.map((u) => ({
      id: u.id,
      name: u.name,
      username: u.username,
      image: u.image,
      bio: u.bio,
      city: u.city,
      college: u.college,
      currentStreak: u.currentStreak,
      longestStreak: u.longestStreak,
      isFollowing: Array.isArray(u.followers) && u.followers.length > 0,
    }));

    return NextResponse.json({ suggestions });
  } catch (error) {
    console.error("GET suggestions error:", error);
    return NextResponse.json({ suggestions: [] });
  }
}
