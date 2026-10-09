"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useSession } from "next-auth/react";
import { ExternalLink, UserPlus, UserCheck, MapPin, GraduationCap } from "lucide-react";
import { StreakBadge } from "./StreakBadge";

export interface ShipAuthor {
  id: string;
  name: string;
  username: string;
  image?: string | null;
  currentStreak: number;
  longestStreak?: number;
  city?: string | null;
  college?: string | null;
}

export interface ShipPost {
  id: string;
  content: string;
  links?: string | null;
  tags: string[];
  createdAt: string | Date;
  userId: string;
  user: ShipAuthor;
  isNew?: boolean;
}

interface ShipCardProps {
  post: ShipPost;
  onTagClick?: (tag: string) => void;
  isFollowingAuthor?: boolean;
  onFollowToggle?: (userId: string, isFollowing: boolean) => void;
}

function timeAgo(dateInput: string | Date): string {
  const date = typeof dateInput === "string" ? new Date(dateInput) : dateInput;
  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

  if (diffInSeconds < 60) return "just now";
  const minutes = Math.floor(diffInSeconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d ago`;
  return date.toLocaleDateString("en-IN", { month: "short", day: "numeric" });
}

function cleanUrlDisplay(url: string): string {
  try {
    const parsed = new URL(url.startsWith("http") ? url : `https://${url}`);
    return parsed.hostname + (parsed.pathname !== "/" ? parsed.pathname.slice(0, 20) + "..." : "");
  } catch {
    return url.replace(/^https?:\/\//, "").slice(0, 25);
  }
}

export function ShipCard({
  post,
  onTagClick,
  isFollowingAuthor = false,
  onFollowToggle,
}: ShipCardProps) {
  const { data: session } = useSession();
  const [following, setFollowing] = useState(isFollowingAuthor);
  const [loadingFollow, setLoadingFollow] = useState(false);

  const isSelf = session?.user?.id === post.user.id;

  async function handleToggleFollow() {
    if (!session?.user?.id || isSelf || loadingFollow) return;
    setLoadingFollow(true);
    const nextState = !following;

    try {
      const res = await fetch(`/api/users/${post.user.id}/follow`, {
        method: nextState ? "POST" : "DELETE",
      });
      if (res.ok) {
        setFollowing(nextState);
        onFollowToggle?.(post.user.id, nextState);
      }
    } catch (err) {
      console.error("Failed to toggle follow:", err);
    } finally {
      setLoadingFollow(false);
    }
  }

  const safeLink = post.links
    ? post.links.startsWith("http")
      ? post.links
      : `https://${post.links}`
    : null;

  return (
    <article
      className={`relative rounded-xl border p-5 card-hover backdrop-blur-sm ${
        post.isNew
          ? "border-zinc-500 bg-zinc-900/90 shadow-md shadow-zinc-900"
          : "border-zinc-800/80 bg-zinc-950/70 shadow-sm"
      }`}
    >
      {post.isNew && (
        <div className="absolute -top-2.5 right-4 rounded-full border border-zinc-600 bg-zinc-900 px-2 py-0.5 text-[10px] font-mono uppercase tracking-wider text-zinc-200 shadow-sm">
          Just Shipped
        </div>
      )}

      {/* Author Header */}
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3 min-w-0">
          <Link
            href={`/profile/${post.user.username}`}
            className="relative flex-shrink-0 group"
          >
            {post.user.image ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={post.user.image}
                alt={post.user.name}
                className="h-10 w-10 rounded-full border border-zinc-700 object-cover bg-zinc-900 transition-transform group-hover:scale-105"
              />
            ) : (
              <div className="flex h-10 w-10 items-center justify-center rounded-full border border-zinc-700 bg-zinc-900 text-sm font-semibold text-zinc-200 group-hover:border-zinc-500">
                {post.user.name.slice(0, 1).toUpperCase()}
              </div>
            )}
          </Link>

          <div className="min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <Link
                href={`/profile/${post.user.username}`}
                className="font-semibold text-sm text-zinc-100 hover:underline truncate"
              >
                {post.user.name}
              </Link>
              <Link
                href={`/profile/${post.user.username}`}
                className="text-xs text-zinc-400 font-mono hover:text-zinc-300 truncate"
              >
                @{post.user.username}
              </Link>
              <span className="text-zinc-600 text-xs">·</span>
              <span className="text-xs text-zinc-400 font-mono">
                {timeAgo(post.createdAt)}
              </span>
            </div>

            <div className="flex items-center gap-2 mt-0.5 flex-wrap text-xs text-zinc-400">
              <StreakBadge
                currentStreak={post.user.currentStreak}
                size="sm"
              />

              {post.user.city && (
                <span className="inline-flex items-center gap-1 text-[11px] text-zinc-400">
                  <MapPin size={10} className="text-zinc-400" />
                  {post.user.city}
                </span>
              )}

              {post.user.college && (
                <span className="inline-flex items-center gap-1 text-[11px] text-zinc-400 truncate max-w-[150px]">
                  <GraduationCap size={10} className="text-zinc-400" />
                  {post.user.college}
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Follow button if not self and logged in */}
        {session?.user && !isSelf && (
          <button
            onClick={handleToggleFollow}
            disabled={loadingFollow}
            className={`inline-flex items-center gap-1.5 rounded-md px-2.5 py-1 text-xs font-medium border transition-colors ${
              following
                ? "border-zinc-700 bg-zinc-900 text-zinc-300 hover:border-zinc-600 hover:text-zinc-100"
                : "border-zinc-700 bg-zinc-100 text-zinc-900 hover:bg-white font-semibold"
            }`}
          >
            {following ? (
              <>
                <UserCheck size={12} />
                <span>Following</span>
              </>
            ) : (
              <>
                <UserPlus size={12} />
                <span>Follow</span>
              </>
            )}
          </button>
        )}
      </div>

      {/* Shipped Content */}
      <div className="mt-3.5 text-sm leading-relaxed text-zinc-200 whitespace-pre-wrap break-words">
        {post.content}
      </div>

      {/* Tags & Links */}
      <div className="mt-3.5 flex flex-wrap items-center justify-between gap-2.5 pt-2 border-t border-zinc-900/80">
        <div className="flex flex-wrap items-center gap-1.5">
          {post.tags && post.tags.length > 0 ? (
            post.tags.map((tag) => (
              <button
                key={tag}
                onClick={() => onTagClick?.(tag)}
                className="rounded border border-zinc-800/90 bg-zinc-900/60 px-2 py-0.5 text-[11px] font-mono text-zinc-400 hover:border-zinc-700 hover:text-zinc-200 transition-colors"
              >
                #{tag}
              </button>
            ))
          ) : null}
        </div>

        {safeLink && (
          <a
            href={safeLink}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 rounded border border-zinc-800 bg-zinc-900/90 px-2.5 py-1 text-xs text-zinc-300 hover:border-zinc-600 hover:text-white transition-colors"
          >
            <span className="truncate max-w-[200px] font-mono text-[11px]">
              {cleanUrlDisplay(safeLink)}
            </span>
            <ExternalLink size={12} className="text-zinc-400 flex-shrink-0" />
          </a>
        )}
      </div>
    </article>
  );
}
