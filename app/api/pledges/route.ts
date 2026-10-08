import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getISTMidnightUTC } from "@/lib/streak";

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const content = (body.content || "").trim();

    if (!content) {
      return NextResponse.json({ error: "Pledge content is required" }, { status: 400 });
    }

    if (content.length > 280) {
      return NextResponse.json({ error: "Pledge cannot exceed 280 characters" }, { status: 400 });
    }

    // Tomorrow in IST
    const todayMidnight = getISTMidnightUTC();
    const tomorrowMidnight = new Date(todayMidnight.getTime() + 24 * 60 * 60 * 1000);

    const pledge = await prisma.pledge.create({
      data: {
        content,
        date: tomorrowMidnight,
        userId: session.user.id,
      },
    });

    return NextResponse.json({
      message: "Tomorrow's pledge saved!",
      pledge,
    });
  } catch (error) {
    console.error("POST /api/pledges error:", error);
    return NextResponse.json({ error: "Failed to create pledge" }, { status: 500 });
  }
}

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const pledges = await prisma.pledge.findMany({
      where: { userId: session.user.id },
      orderBy: { createdAt: "desc" },
      take: 10,
    });

    return NextResponse.json({ pledges });
  } catch (error) {
    console.error("GET /api/pledges error:", error);
    return NextResponse.json({ error: "Failed to fetch pledges" }, { status: 500 });
  }
}
