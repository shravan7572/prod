"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import { useSession } from "next-auth/react";
import { Compass, Users, X, RefreshCw } from "lucide-react";
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
  const [selectedCity, setSelectedCity] = useState<string | null>(null);

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
      if (selectedCity && selectedCity !== "All") {
        url.searchParams.set("city", selectedCity);
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
  }, [activeTab, selectedTag, selectedCity, session?.user]);

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

      {/* Feed Navigation & Tabs */}
      <div className="pt-1 space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          {/* Tabs: Discover vs Following */}
          <div className="flex items-center rounded-lg border border-zinc-200 bg-white p-1 w-fit shadow-xs">
            <button
              onClick={() => setActiveTab("discover")}
              className={`flex items-center gap-1.5 rounded-md px-3.5 py-1.5 text-xs font-semibold transition-colors ${
                activeTab === "discover"
                  ? "bg-zinc-900 text-white"
                  : "text-zinc-600 hover:text-zinc-900"
              }`}
            >
              <Compass size={13} />
              <span>Discover</span>
            </button>

            <button
              onClick={() => setActiveTab("following")}
              className={`flex items-center gap-1.5 rounded-md px-3.5 py-1.5 text-xs font-semibold transition-colors ${
                activeTab === "following"
                  ? "bg-zinc-900 text-white"
                  : "text-zinc-600 hover:text-zinc-900"
              }`}
            >
              <Users size={13} />
              <span>Following</span>
            </button>
          </div>

          {/* Refresh & Active Filter Badges */}
          <div className="flex items-center gap-2 flex-wrap">
            {selectedCity && (
              <div className="inline-flex items-center gap-1.5 rounded-full border border-zinc-200 bg-white px-2.5 py-1 text-xs text-zinc-700">
                <span>📍 {selectedCity}</span>
                <button
                  onClick={() => setSelectedCity(null)}
                  className="text-zinc-400 hover:text-zinc-900"
                  title="Clear city filter"
                >
                  <X size={12} />
                </button>
              </div>
            )}

            {selectedTag && (
              <div className="inline-flex items-center gap-1.5 rounded-full border border-zinc-200 bg-white px-2.5 py-1 text-xs text-zinc-700">
                <span>#{selectedTag}</span>
                <button
                  onClick={() => setSelectedTag(null)}
                  className="text-zinc-400 hover:text-zinc-900"
                  title="Clear tag filter"
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
              className="inline-flex items-center gap-1 rounded-lg border border-zinc-200 bg-white hover:bg-zinc-50 px-2.5 py-1.5 text-xs font-medium text-zinc-600 transition-colors shadow-xs"
              title="Refresh feed"
            >
              <RefreshCw
                size={12}
                className={refreshing ? "animate-spin text-zinc-900" : ""}
              />
              <span className="hidden sm:inline">Refresh</span>
            </button>
          </div>
        </div>

        {/* Discovery Filter Chips: Cities & Stacks */}
        <div className="rounded-xl border border-zinc-200 bg-white p-3 space-y-2 text-xs shadow-xs">
          {/* City filters */}
          <div className="flex items-center gap-2 overflow-x-auto pb-0.5 text-xs">
            <span className="text-zinc-400 font-medium flex-shrink-0">City:</span>
            {[
              { label: "All", value: null },
              { label: "Pune", value: "Pune" },
              { label: "Bangalore", value: "Bangalore" },
              { label: "Mumbai", value: "Mumbai" },
            ].map((c) => (
              <button
                key={c.label}
                onClick={() => setSelectedCity(c.value)}
                className={`rounded px-2.5 py-0.5 text-xs font-medium transition-colors flex-shrink-0 border ${
                  selectedCity === c.value || (!selectedCity && c.value === null)
                    ? "border-zinc-900 bg-zinc-900 text-white"
                    : "border-zinc-200 bg-zinc-50 text-zinc-600 hover:text-zinc-900 hover:bg-zinc-100"
                }`}
              >
                {c.label}
              </button>
            ))}
          </div>

          {/* Popular Stack Pills */}
          <div className="flex items-center gap-1.5 overflow-x-auto pt-1.5 border-t border-zinc-100 text-xs">
            <span className="text-zinc-400 font-medium flex-shrink-0">Stacks:</span>
            {["nextjs", "react", "prisma", "ai", "websocket", "postgres", "tailwind"].map((t) => (
              <button
                key={t}
                onClick={() => handleTagClick(t)}
                className={`rounded px-2 py-0.5 text-xs transition-colors flex-shrink-0 border ${
                  selectedTag === t
                    ? "border-zinc-900 bg-zinc-900 text-white font-medium"
                    : "border-zinc-200 bg-zinc-50 text-zinc-600 hover:text-zinc-900 hover:bg-zinc-100"
                }`}
              >
                #{t}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Feed Stream */}
      {loading ? (
        <div className="space-y-3 pt-2">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="rounded-xl border border-zinc-200 bg-white p-5 space-y-3 animate-pulse"
            >
              <div className="flex items-center gap-3">
                <div className="h-9 w-9 rounded-full bg-zinc-100" />
                <div className="space-y-1.5 flex-1">
                  <div className="h-3.5 w-28 bg-zinc-100 rounded" />
                  <div className="h-2.5 w-40 bg-zinc-100 rounded" />
                </div>
              </div>
              <div className="h-3.5 w-3/4 bg-zinc-100 rounded" />
              <div className="h-3.5 w-1/2 bg-zinc-100 rounded" />
            </div>
          ))}
        </div>
      ) : posts.length === 0 ? (
        <div className="rounded-xl border border-zinc-200 bg-white p-10 text-center shadow-xs">
          <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-lg bg-zinc-100 text-zinc-500">
            {activeTab === "following" ? <Users size={18} /> : <Compass size={18} />}
          </div>
          <h3 className="mt-3 text-sm font-semibold text-zinc-900">
            {activeTab === "following"
              ? "No ships from your network yet"
              : selectedTag
              ? `No ships tagged #${selectedTag}`
              : "No ships recorded yet today"}
          </h3>
          <p className="mt-1 text-xs text-zinc-500 max-w-sm mx-auto">
            {activeTab === "following"
              ? "Follow other builders from Discover to see their daily ships here."
              : "Be the first to share what you shipped today."}
          </p>
          {activeTab === "following" && (
            <button
              onClick={() => setActiveTab("discover")}
              className="mt-4 inline-flex items-center gap-1.5 rounded-lg bg-zinc-900 hover:bg-zinc-800 px-4 py-1.5 text-xs font-semibold text-white transition-colors"
            >
              <Compass size={12} />
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
