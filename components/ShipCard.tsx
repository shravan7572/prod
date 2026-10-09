"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useSession } from "next-auth/react";
import {
  ExternalLink,
  UserPlus,
  UserCheck,
  MapPin,
  GraduationCap,
  Share2,
  Copy,
  Check,
  Globe,
} from "lucide-react";
import { StreakBadge } from "./StreakBadge";
import { useToast } from "./Toast";

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

function GithubIcon({ size = 12, className = "" }: { size?: number; className?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" className={className}>
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z"
      />
    </svg>
  );
}

function TwitterIcon({ size = 11, className = "" }: { size?: number; className?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" className={className}>
      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
    </svg>
  );
}

function SmartLinkPreview({ url }: { url: string }) {
  const [imgError, setImgError] = useState(false);

  try {
    const parsed = new URL(url.startsWith("http") ? url : `https://${url}`);
    const hostname = parsed.hostname.replace(/^www\./, "");
    const isGithub = hostname === "github.com";

    // If GitHub, extract repo path
    if (isGithub) {
      const parts = parsed.pathname.split("/").filter(Boolean);
      const repoLabel = parts.length >= 2 ? `${parts[0]}/${parts[1]}` : "GitHub";

      return (
        <a
          href={url}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1.5 rounded-md border border-zinc-200 bg-zinc-50 hover:bg-zinc-100 px-2.5 py-1 text-xs text-zinc-800 transition-colors group"
        >
          <GithubIcon size={13} className="text-zinc-700 flex-shrink-0" />
          <span className="font-mono text-[11px] font-medium truncate max-w-[200px]">
            {repoLabel}
          </span>
          <ExternalLink size={10} className="text-zinc-400 group-hover:text-zinc-700 transition-colors flex-shrink-0" />
        </a>
      );
    }

    // Generic URL with Google favicon resolver
    const faviconUrl = `https://www.google.com/s2/favicons?domain=${hostname}&sz=32`;
    const displayLabel = hostname + (parsed.pathname !== "/" && parsed.pathname.length > 1 ? parsed.pathname.slice(0, 15) + "..." : "");

    return (
      <a
        href={url}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex items-center gap-1.5 rounded-md border border-zinc-200 bg-zinc-50 hover:bg-zinc-100 px-2.5 py-1 text-xs text-zinc-700 transition-colors group"
      >
        {!imgError ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={faviconUrl}
            alt=""
            className="w-3.5 h-3.5 rounded-xs flex-shrink-0"
            onError={() => setImgError(true)}
          />
        ) : (
          <Globe size={11} className="text-zinc-400 flex-shrink-0" />
        )}
        <span className="text-[11px] font-medium truncate max-w-[190px]">
          {displayLabel}
        </span>
        <ExternalLink size={10} className="text-zinc-400 group-hover:text-zinc-700 transition-colors flex-shrink-0" />
      </a>
    );
  } catch {
    return (
      <a
        href={url}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex items-center gap-1 rounded border border-zinc-200 bg-zinc-50 px-2 py-0.5 text-xs text-zinc-700"
      >
        <span className="text-[11px] truncate max-w-[150px]">{url}</span>
        <ExternalLink size={10} className="text-zinc-400" />
      </a>
    );
  }
}

export function ShipCard({
  post,
  onTagClick,
  isFollowingAuthor = false,
  onFollowToggle,
}: ShipCardProps) {
  const { data: session } = useSession();
  const { success } = useToast();
  const [following, setFollowing] = useState(isFollowingAuthor);
  const [loadingFollow, setLoadingFollow] = useState(false);
  const [copied, setCopied] = useState(false);

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
        if (nextState) {
          success(`Following @${post.user.username}`);
        }
      }
    } catch (err) {
      console.error("Failed to toggle follow:", err);
    } finally {
      setLoadingFollow(false);
    }
  }

  function handleCopyPost() {
    if (typeof window === "undefined") return;
    const shareUrl = `${window.location.origin}/profile/${post.user.username}#${post.id}`;
    navigator.clipboard.writeText(shareUrl);
    setCopied(true);
    success("Link copied to clipboard!");
    setTimeout(() => setCopied(false), 2000);
  }

  function handleShareX() {
    if (typeof window === "undefined") return;
    const postUrl = `${window.location.origin}/profile/${post.user.username}`;
    const text = `Shipped today on ShipIt: "${post.content.slice(0, 120)}${post.content.length > 120 ? "..." : ""}" 🔥`;
    const tweetUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(
      text
    )}&url=${encodeURIComponent(postUrl)}&hashtags=buildinpublic,shipit`;
    window.open(tweetUrl, "_blank", "noopener,noreferrer");
  }

  const safeLink = post.links
    ? post.links.startsWith("http")
      ? post.links
      : `https://${post.links}`
    : null;

  return (
    <article
      id={post.id}
      className={`relative rounded-xl border border-zinc-200 bg-white p-4 sm:p-5 shadow-xs cool-card transition-all ${
        post.isNew ? "ring-2 ring-[#eb5e52]/40" : ""
      }`}
    >
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
                className="h-9 w-9 rounded-full border border-zinc-200 object-cover bg-zinc-100 group-hover:scale-105 transition-transform"
              />
            ) : (
              <div className="flex h-9 w-9 items-center justify-center rounded-full border border-zinc-200 bg-zinc-100 text-xs font-bold text-zinc-700 group-hover:scale-105 transition-transform">
                {post.user.name.slice(0, 1).toUpperCase()}
              </div>
            )}
          </Link>

          <div className="min-w-0">
            <div className="flex items-center gap-1.5 flex-wrap">
              <Link
                href={`/profile/${post.user.username}`}
                className="font-semibold text-xs text-zinc-900 hover:underline truncate"
              >
                {post.user.name}
              </Link>
              <Link
                href={`/profile/${post.user.username}`}
                className="text-xs text-zinc-400 truncate"
              >
                @{post.user.username}
              </Link>
              <span className="text-zinc-300 text-xs">·</span>
              <span className="text-xs text-zinc-400">
                {timeAgo(post.createdAt)}
              </span>
            </div>

            <div className="flex items-center gap-2 mt-0.5 flex-wrap text-xs text-zinc-500">
              <StreakBadge
                currentStreak={post.user.currentStreak}
                size="sm"
              />

              {post.user.city && (
                <span className="inline-flex items-center gap-0.5 text-[11px] text-zinc-500">
                  <MapPin size={10} className="text-zinc-400" />
                  {post.user.city}
                </span>
              )}

              {post.user.college && (
                <span className="inline-flex items-center gap-0.5 text-[11px] text-zinc-400 truncate max-w-[140px]">
                  <GraduationCap size={10} className="text-zinc-400" />
                  {post.user.college}
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Top-Right: Follow or Actions */}
        <div className="flex items-center gap-1.5 flex-shrink-0">
          {session?.user && !isSelf && (
            <button
              onClick={handleToggleFollow}
              disabled={loadingFollow}
              className={`inline-flex items-center gap-1 rounded-md px-2.5 py-1 text-xs font-medium transition-colors ${
                following
                  ? "border border-zinc-200 bg-zinc-50 text-zinc-600 hover:text-zinc-900"
                  : "border border-zinc-300 bg-zinc-900 text-white hover:bg-zinc-800"
              }`}
            >
              {following ? (
                <>
                  <UserCheck size={11} />
                  <span>Following</span>
                </>
              ) : (
                <>
                  <UserPlus size={11} />
                  <span>Follow</span>
                </>
              )}
            </button>
          )}
        </div>
      </div>

      {/* Shipped Content */}
      <div className="mt-3 text-sm leading-relaxed text-zinc-800 whitespace-pre-wrap break-words selection:bg-orange-100">
        {post.content}
      </div>

      {/* Tags & Smart Link Previews */}
      <div className="mt-3.5 flex flex-wrap items-center justify-between gap-2 pt-2.5 border-t border-zinc-100">
        <div className="flex flex-wrap items-center gap-1.5">
          {post.tags && post.tags.length > 0 ? (
            post.tags.map((tag) => (
              <button
                key={tag}
                onClick={() => onTagClick?.(tag)}
                className="rounded border border-zinc-200 bg-zinc-50 hover:bg-zinc-100 px-2 py-0.5 text-[11px] text-zinc-600 transition-colors font-medium"
              >
                #{tag}
              </button>
            ))
          ) : null}
        </div>

        {safeLink && <SmartLinkPreview url={safeLink} />}
      </div>

      {/* Micro-actions toolbar: Copy link & Share on X */}
      <div className="mt-2.5 flex items-center justify-end gap-2 pt-1 text-zinc-400">
        <button
          onClick={handleCopyPost}
          className="inline-flex items-center gap-1 text-[11px] text-zinc-400 hover:text-zinc-700 transition-colors px-1.5 py-0.5 rounded hover:bg-zinc-100"
          title="Copy link to ship"
        >
          {copied ? (
            <>
              <Check size={11} className="text-emerald-500" />
              <span className="text-emerald-600 font-medium">Copied</span>
            </>
          ) : (
            <>
              <Copy size={11} />
              <span>Copy</span>
            </>
          )}
        </button>

        <button
          onClick={handleShareX}
          className="inline-flex items-center gap-1 text-[11px] text-zinc-400 hover:text-zinc-900 transition-colors px-1.5 py-0.5 rounded hover:bg-zinc-100"
          title="Share on X (Twitter)"
        >
          <TwitterIcon size={10} />
          <span>Share</span>
        </button>
      </div>
    </article>
  );
}
