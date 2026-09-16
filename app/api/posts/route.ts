import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

export async function GET() {
    const posts = await prisma.post.findMany({
        include: {
            user: true
        }
    })

    return Response.json(posts)
}

export async function POST(req: NextRequest) {
    const createpost = await req.json();

    const post = await prisma.post.create({
        data: {
            content: createpost.content,
            link: createpost.link,
            tags: [createpost.tags]
        }
    })

    return NextResponse.json({
        message: "Post have been created"
    })
}