"use client"
import { useRef } from "react"
import axios from "axios"
import { useRouter } from "next/navigation"
export default function createpost() {
    const router=useRouter()
    const contentref = useRef<HTMLInputElement>(null)
    const linkref = useRef<HTMLInputElement>(null)
    const tagsref = useRef<HTMLInputElement>(null)


    async function createpost(){
        await axios.post("http://localhost:3000/api/posts",{
            content:contentref.current?.value,
            link:linkref.current?.value,
            tags:tagsref.current?.value
        })
    }


    return <div>
        this is create post page.

        <div>
            <input ref={contentref} className="border-1 m-2 p-2" placeholder="content" ></input>
            <input ref={linkref} className="border-1 m-2 p-2" placeholder="link"></input>
            <input ref={tagsref}  className="border-1 m-2 p-2" placeholder="tags"></input>
            <br />
            <button onClick={createpost}
             className="border-1 m-2 p-2 hover cursor-pointer bg-white text-black">create post </button>

                <div>
                    <button onClick={()=>{
                        router.push("/post/fetchposts")
                    }}
                     className="border-1 m-2 p-2 hover cursor-pointer bg-white text-black"
                     >see all the posts</button>
                </div>
        </div>
    </div>
}