"use client";

import axios from "axios";
import { useEffect, useState } from "react";

export default function FetchPosts() {
  const [posts, setPosts] = useState<any[]>([]);

  useEffect(() => {
    const fetchPosts = async () => {
      const response = await axios.get("/api/posts");
      setPosts(response.data);
    };

    fetchPosts();
  }, []);

  return (
    <div className="min-h-screen bg-black px-4 py-6 text-white">
      <div className="mx-auto max-w-2xl">
        <h1 className="mb-6 text-2xl font-semibold">All Posts</h1>

        <div className="space-y-4">
          {posts.map((post) => (
            <div
              key={post.id}
              className="rounded-xl border border-zinc-700 bg-zinc-950 p-5 transition hover:border-zinc-500"
            >
              {/* Post content */}
              <h2 className="text-base leading-6 text-zinc-100">
                {post.content}
              </h2>

              {/* Link */}
              {post.link && (
                <a
                  href={post.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-4 block break-all rounded-lg bg-zinc-900 p-3 text-sm text-blue-400 hover:text-blue-300"
                >
                  {post.link}
                </a>
              )}

              {/* Bottom section */}
              <div className="mt-4 flex items-center justify-between border-t border-zinc-800 pt-4">
                <div className="flex gap-2">
                  {post.tags.map((tag: string) => (
                    <span
                      key={tag}
                      className="rounded-full bg-zinc-800 px-3 py-1 text-xs text-zinc-300"
                    >
                      #{tag}
                    </span>
                  ))}
                </div>

                <p className="text-xs text-zinc-500">
                  {new Date(post.createdAt).toLocaleDateString()}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
