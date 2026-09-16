import { prisma } from "@/lib/prisma";
import { NextRequest } from "next/server";

export async function GET(){
    const posts=await prisma.post.findMany({
        include:{
            user:true
        }
    })

    return Response.json(posts)
}

export async function POST(req:NextRequest){
    const createpost= await req.json();

    const post=await prisma.post.create({
         data:{
            content:createpost.content,
            link:createpost.link,
            tags:createpost.tags,
            user:{
                connect:{
                    id:createpost.userId
                }
            }
         }
    })
}