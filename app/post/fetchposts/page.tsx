"use client"

import axios from "axios"
import { useEffect, useState } from "react"

export default  function fetchposts() {
    const[posts,setposts]=useState<any[]>([])

    useEffect(()=>{
        const fetchposts=async ()=>{
            const response=await axios.get("http://localhost:3000/api/posts");
            setposts(response.data)
        };
        fetchposts()
    },[])
   
   return (
        <div>
            <h1>All Posts</h1>

            {posts.map((post) => (
                <div key={post.id}>
                    <h2>{post.content}</h2>

                    {post.link && (
                        <a href={post.link} target="_blank">
                            {post.link}
                        </a>
                    )}

                    <p>Tags: {post.tags.join(", ")}</p>

                    <p>
                        {new Date(post.createdAt).toLocaleDateString()}
                    </p>
                </div>
            ))}
        </div>
    );
}