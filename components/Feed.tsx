"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import { useSession } from "next-auth/react";
import { Compass, Users, Sparkles, X, RefreshCw, Radio } from "lucide-react";
import { ShipCard, ShipPost } from "./ShipCard";
import { PostForm } from "./PostForm";
import { PledgeBanner } from "./PledgeBanner";

interface FeedProps {
  onWsStatusChange?: (connected: boolean) => void;
}

export function Feed({ onWsStatusChange }: FeedProps) {
  const { data: session } = useSession();
  const [activeTab, setActiveTab] = useState<"discover" | "following">("discover");
  const [selectedTag, setSelectedTag] = useState<string | null>(null);

  const [posts, setPosts] = useState<ShipPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [wsConnected, setWsConnected] = useState(false);

  const socketRef = useRef<WebSocket | null>(null);

  // Fetch posts from API
  const fetchFeed = useCallback(async () => {
    try {
      const endpoint =
        activeTab === "following" && session?.user
          ? "/api/posts/feed"
          : "/api/posts/discover";

      const url = new URL(endpoint, window.location.origin);
      if (selectedTag) {
        url.searchParams.set("tag", selectedTag);
      }

      const res = await fetch(url.toString());
      if (res.ok) {
        const data = await res.json();
        setPosts(data.posts || []);
      }
    } catch (err) {
      console.error("Failed to load feed:", err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [activeTab, selectedTag, session?.user]);

  useEffect(() => {
    setLoading(true);
    fetchFeed();
  }, [fetchFeed]);

  // WebSocket connection & room subscription
  useEffect(() => {
    const wsUrl =
      process.env.NEXT_PUBLIC_WS_URL ||
      (typeof window !== "undefined"
        ? `ws://${window.location.hostname}:8080`
        : "ws://localhost:8080");

    let socket: WebSocket;
    let reconnectTimer: NodeJS.Timeout;

    function connect() {
      try {
        socket = new WebSocket(wsUrl);
        socketRef.current = socket;

        socket.onopen = () => {
          setWsConnected(true);
          onWsStatusChange?.(true);

          // Join active room
          const room =
            activeTab === "following" && session?.user?.id
              ? `user:${session.user.id}`
              : "discover";

          socket.send(
            JSON.stringify({
              type: "join",
              payload: { room },
            })
          );
        };

        socket.onmessage = (event) => {
          try {
            const data = JSON.parse(event.data);
            if (data.type === "new_post" && data.payload) {
              const newPost = { ...data.payload, isNew: true };
              setPosts((prev) => {
                // Prevent duplicate
                if (prev.some((p) => p.id === newPost.id)) return prev;
                return [newPost, ...prev];
              });
            }
          } catch (e) {
            console.error("WS message parse error:", e);
          }
        };

        socket.onclose = () => {
          setWsConnected(false);
          onWsStatusChange?.(false);
          // Try to reconnect in 4 seconds
          reconnectTimer = setTimeout(connect, 4000);
        };

        socket.onerror = () => {
          setWsConnected(false);
          onWsStatusChange?.(false);
        };
      } catch {
        setWsConnected(false);
        onWsStatusChange?.(false);
      }
    }

    connect();

    return () => {
      clearTimeout(reconnectTimer);
      if (socket) {
        socket.close();
      }
    };
  }, [activeTab, session?.user?.id, onWsStatusChange]);

  // Handle new post created locally
  function handlePostCreated(newPost: ShipPost) {
    setPosts((prev) => {
      if (prev.some((p) => p.id === newPost.id)) return prev;
      return [{ ...newPost, isNew: true }, ...prev];
    });
  }

  function handleTagClick(tag: string) {
    setSelectedTag((prev) => (prev === tag ? null : tag));
  }

  return (
    <div className="space-y-4">
      {/* Tomorrow's Pledge Banner */}
      <PledgeBanner />

      {/* Daily Ship Post Form */}
      <PostForm
        onPostCreated={handlePostCreated}
        onStreakUpdated={fetchFeed}
      />

      {/* Feed Filter Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2">
        {/* Tabs: Discover vs Following */}
        <div className="flex items-center rounded-lg border border-zinc-800 bg-zinc-950 p-1 w-fit">
          <button
            onClick={() => {
              setActiveTab("discover");
            }}
            className={`flex items-center gap-2 rounded-md px-3.5 py-1.5 text-xs font-semibold transition-colors ${
              activeTab === "discover"
                ? "bg-zinc-800 text-zinc-100 shadow-sm"
                : "text-zinc-400 hover:text-zinc-200"
            }`}
          >
            <Compass size={14} />
            <span>Discover</span>
          </button>

          <button
            onClick={() => {
              setActiveTab("following");
            }}
            className={`flex items-center gap-2 rounded-md px-3.5 py-1.5 text-xs font-semibold transition-colors ${
              activeTab === "following"
                ? "bg-zinc-800 text-zinc-100 shadow-sm"
                : "text-zinc-400 hover:text-zinc-200"
            }`}
          >
            <Users size={14} />
            <span>Following</span>
          </button>
        </div>

        {/* Tag Filter & Refresh */}
        <div className="flex items-center gap-2 flex-wrap">
          {selectedTag && (
            <div className="inline-flex items-center gap-1.5 rounded-full border border-zinc-700 bg-zinc-900 px-2.5 py-1 text-xs text-zinc-200">
              <span className="font-mono font-medium">#{selectedTag}</span>
              <button
                onClick={() => setSelectedTag(null)}
                className="text-zinc-400 hover:text-white"
                title="Clear filter"
              >
                <X size={12} />
              </button>
            </div>
          )}

          <button
            onClick={() => {
              setRefreshing(true);
              fetchFeed();
            }}
            disabled={refreshing}
            className="inline-flex items-center gap-1 rounded-md border border-zinc-800 bg-zinc-950 px-2.5 py-1 text-xs text-zinc-400 hover:border-zinc-700 hover:text-zinc-200 transition-colors"
            title="Refresh feed"
          >
            <RefreshCw
              size={12}
              className={refreshing ? "animate-spin" : ""}
            />
            <span className="hidden sm:inline">Refresh</span>
          </button>
        </div>
      </div>

      {/* Feed Stream */}
      {loading ? (
        <div className="space-y-3 pt-2">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="rounded-xl border border-zinc-900 bg-zinc-950/60 p-5 space-y-3 animate-pulse"
            >
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-full bg-zinc-900" />
                <div className="space-y-1.5 flex-1">
                  <div className="h-3.5 w-28 bg-zinc-900 rounded" />
                  <div className="h-2.5 w-40 bg-zinc-900 rounded" />
                </div>
              </div>
              <div className="h-4 w-3/4 bg-zinc-900 rounded" />
              <div className="h-4 w-1/2 bg-zinc-900 rounded" />
            </div>
          ))}
        </div>
      ) : posts.length === 0 ? (
        <div className="rounded-xl border border-zinc-900 bg-zinc-950/60 p-10 text-center">
          <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-full border border-zinc-800 bg-zinc-900 text-zinc-400">
            {activeTab === "following" ? <Users size={18} /> : <Compass size={18} />}
          </div>
          <h3 className="mt-3 text-sm font-semibold text-zinc-200">
            {activeTab === "following"
              ? "No ships from your network yet"
              : selectedTag
              ? `No ships tagged #${selectedTag}`
              : "No ships recorded yet today"}
          </h3>
          <p className="mt-1 text-xs text-zinc-400 max-w-sm mx-auto">
            {activeTab === "following"
              ? "Follow other builders from the Discover feed or the sidebar to see their daily ships here."
              : "Be the first to ship and set the tone for today!"}
          </p>
          {activeTab === "following" && (
            <button
              onClick={() => setActiveTab("discover")}
              className="mt-4 inline-flex items-center gap-1.5 rounded-lg border border-zinc-800 bg-zinc-900 px-3.5 py-1.5 text-xs font-semibold text-zinc-200 hover:border-zinc-700 transition-colors"
            >
              <Compass size={13} />
              <span>Explore Discover Feed</span>
            </button>
          )}
        </div>
      ) : (
        <div className="space-y-3 pt-1">
          {posts.map((post) => (
            <ShipCard
              key={post.id}
              post={post}
              onTagClick={handleTagClick}
              onFollowToggle={() => {
                if (activeTab === "following") {
                  fetchFeed();
                }
              }}
            />
          ))}
        </div>
      )}
    </div>
  );
}
