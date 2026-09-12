import { prisma } from "@/lib/prisma";

export async function GET(){
    const posts=await prisma.post.findMany({
        include:{
            user:true
        }
    })

    return Response.json(posts)
}