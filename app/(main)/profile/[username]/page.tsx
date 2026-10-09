"use client";

import React, { useState, useEffect, use } from "react";
import { useSession } from "next-auth/react";
import Link from "next/link";
import {
  MapPin,
  GraduationCap,
  Flame,
  UserPlus,
  UserCheck,
  Edit3,
  ExternalLink,
  Layers,
  ArrowLeft,
  X,
  Check,
} from "lucide-react";

function GithubIcon({ size = 12, className = "" }: { size?: number; className?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" className={className}>
      <path fillRule="evenodd" clipRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" />
    </svg>
  );
}
import { StreakBadge } from "@/components/StreakBadge";
import { ShipCard, ShipPost } from "@/components/ShipCard";

interface ProfileUser {
  id: string;
  name: string;
  username: string;
  email?: string;
  image?: string | null;
  bio?: string | null;
  githubUrl?: string | null;
  college?: string | null;
  city?: string | null;
  createdAt: string;
  currentStreak: number;
  longestStreak: number;
  hasShippedToday: boolean;
  followerCount: number;
  followingCount: number;
  postCount: number;
  isFollowing: boolean;
  isSelf: boolean;
}

export default function ProfilePage({
  params,
}: {
  params: Promise<{ username: string }>;
}) {
  const resolvedParams = use(params);
  const username = resolvedParams.username;
  const { data: session } = useSession();

  const [user, setUser] = useState<ProfileUser | null>(null);
  const [posts, setPosts] = useState<ShipPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [followLoading, setFollowLoading] = useState(false);

  // Edit profile state
  const [isEditing, setIsEditing] = useState(false);
  const [editName, setEditName] = useState("");
  const [editBio, setEditBio] = useState("");
  const [editGithub, setEditGithub] = useState("");
  const [editCollege, setEditCollege] = useState("");
  const [editCity, setEditCity] = useState("");
  const [savingProfile, setSavingProfile] = useState(false);

  useEffect(() => {
    fetchProfile();
  }, [username]);

  async function fetchProfile() {
    try {
      const res = await fetch(`/api/users/${username}`);
      if (res.ok) {
        const data = await res.json();
        setUser(data.user);
        setPosts(data.posts || []);
        setEditName(data.user.name || "");
        setEditBio(data.user.bio || "");
        setEditGithub(data.user.githubUrl || "");
        setEditCollege(data.user.college || "");
        setEditCity(data.user.city || "");
      }
    } catch (err) {
      console.error("Failed to load profile:", err);
    } finally {
      setLoading(false);
    }
  }

  async function handleToggleFollow() {
    if (!user || followLoading || user.isSelf) return;
    setFollowLoading(true);
    const nextState = !user.isFollowing;

    try {
      const res = await fetch(`/api/users/${user.id}/follow`, {
        method: nextState ? "POST" : "DELETE",
      });
      if (res.ok) {
        const data = await res.json();
        setUser({
          ...user,
          isFollowing: nextState,
          followerCount: data.followerCount,
        });
      }
    } catch (err) {
      console.error("Failed to toggle follow:", err);
    } finally {
      setFollowLoading(false);
    }
  }

  async function handleSaveProfile(e: React.FormEvent) {
    e.preventDefault();
    if (!user) return;
    setSavingProfile(true);

    try {
      const res = await fetch("/api/users/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: editName,
          bio: editBio,
          githubUrl: editGithub,
          college: editCollege,
          city: editCity,
        }),
      });

      if (res.ok) {
        setUser({
          ...user,
          name: editName,
          bio: editBio,
          githubUrl: editGithub,
          college: editCollege,
          city: editCity,
        });
        setIsEditing(false);
      }
    } catch (err) {
      console.error("Failed to update profile:", err);
    } finally {
      setSavingProfile(false);
    }
  }

  if (loading) {
    return (
      <div className="max-w-3xl mx-auto space-y-4 animate-pulse py-4">
        <div className="h-32 bg-white rounded-xl border border-zinc-200" />
        <div className="h-40 bg-white rounded-xl border border-zinc-200" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="max-w-md mx-auto text-center py-16">
        <h2 className="text-lg font-bold text-zinc-900">Developer not found</h2>
        <p className="text-xs text-zinc-500 mt-1">
          No profile with username @{username} exists.
        </p>
        <Link
          href="/"
          className="mt-4 inline-flex items-center gap-1.5 rounded-lg bg-zinc-900 px-3.5 py-1.5 text-xs font-semibold text-white"
        >
          <ArrowLeft size={13} /> Back to Feed
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto space-y-5">
      {/* Back button */}
      <div>
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 text-xs font-medium text-zinc-500 hover:text-zinc-900 transition-colors"
        >
          <ArrowLeft size={13} />
          <span>Back to Feed</span>
        </Link>
      </div>

      {/* Profile Card */}
      <div className="rounded-xl border border-zinc-200 bg-white p-5 sm:p-6 shadow-xs minimal-card">
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
          <div className="flex items-start gap-3.5">
            {user.image ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={user.image}
                alt={user.name}
                className="h-14 w-14 rounded-full border border-zinc-200 object-cover bg-zinc-100 flex-shrink-0"
              />
            ) : (
              <div className="flex h-14 w-14 items-center justify-center rounded-full border border-zinc-200 bg-zinc-100 text-lg font-bold text-zinc-700 flex-shrink-0">
                {user.name.slice(0, 1).toUpperCase()}
              </div>
            )}

            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="text-lg font-bold text-zinc-900">{user.name}</h1>
                <span className="text-xs text-zinc-400">
                  @{user.username}
                </span>
              </div>

              {user.bio && (
                <p className="mt-1 text-xs text-zinc-600 leading-relaxed max-w-lg">
                  {user.bio}
                </p>
              )}

              {/* Meta pills: City, College, Github */}
              <div className="mt-2.5 flex flex-wrap items-center gap-2.5 text-xs text-zinc-500">
                {user.city && (
                  <span className="inline-flex items-center gap-1">
                    <MapPin size={11} className="text-zinc-400" />
                    <span>{user.city}</span>
                  </span>
                )}
                {user.college && (
                  <span className="inline-flex items-center gap-1">
                    <GraduationCap size={12} className="text-zinc-400" />
                    <span>{user.college}</span>
                  </span>
                )}
                {user.githubUrl && (
                  <a
                    href={user.githubUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-zinc-700 hover:text-zinc-900 transition-colors"
                  >
                    <GithubIcon size={11} />
                    <span>GitHub</span>
                    <ExternalLink size={9} className="text-zinc-400" />
                  </a>
                )}
              </div>
            </div>
          </div>

          {/* Action button: Edit or Follow */}
          <div className="flex-shrink-0">
            {user.isSelf ? (
              <button
                onClick={() => setIsEditing(true)}
                className="inline-flex items-center gap-1 rounded-lg border border-zinc-200 bg-zinc-50 hover:bg-zinc-100 px-3 py-1.5 text-xs font-semibold text-zinc-700 transition-colors"
              >
                <Edit3 size={12} />
                <span>Edit Profile</span>
              </button>
            ) : session?.user ? (
              <button
                onClick={handleToggleFollow}
                disabled={followLoading}
                className={`inline-flex items-center gap-1 rounded-lg px-3.5 py-1.5 text-xs font-semibold transition-colors ${
                  user.isFollowing
                    ? "border border-zinc-200 bg-zinc-50 text-zinc-700 hover:text-zinc-900"
                    : "border border-zinc-300 bg-zinc-900 text-white hover:bg-zinc-800"
                }`}
              >
                {user.isFollowing ? (
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
            ) : (
              <Link
                href="/login"
                className="inline-flex items-center gap-1 rounded-lg bg-zinc-900 hover:bg-zinc-800 px-3.5 py-1.5 text-xs font-semibold text-white transition-colors"
              >
                <UserPlus size={12} />
                <span>Follow</span>
              </Link>
            )}
          </div>
        </div>

        {/* Stats bar */}
        <div className="mt-5 grid grid-cols-2 sm:grid-cols-4 gap-2.5 pt-4 border-t border-zinc-100">
          <div className="rounded-lg border border-zinc-200 bg-zinc-50 p-2.5">
            <div className="text-[10px] text-zinc-400 uppercase font-semibold">Current Streak</div>
            <div className="mt-0.5 flex items-center gap-1">
              <Flame size={13} className="text-[#eb5e52] fill-[#eb5e52]" />
              <span className="text-sm font-bold text-zinc-900 font-mono">
                {user.currentStreak}
              </span>
              <span className="text-[10px] text-zinc-500">days</span>
            </div>
          </div>

          <div className="rounded-lg border border-zinc-200 bg-zinc-50 p-2.5">
            <div className="text-[10px] text-zinc-400 uppercase font-semibold">Longest Streak</div>
            <div className="mt-0.5 flex items-center gap-1">
              <span className="text-sm font-bold text-zinc-900 font-mono">
                {user.longestStreak}
              </span>
              <span className="text-[10px] text-zinc-500">days</span>
            </div>
          </div>

          <div className="rounded-lg border border-zinc-200 bg-zinc-50 p-2.5">
            <div className="text-[10px] text-zinc-400 uppercase font-semibold">Total Ships</div>
            <div className="mt-0.5 flex items-center gap-1">
              <Layers size={13} className="text-zinc-500" />
              <span className="text-sm font-bold text-zinc-900 font-mono">
                {user.postCount}
              </span>
            </div>
          </div>

          <div className="rounded-lg border border-zinc-200 bg-zinc-50 p-2.5">
            <div className="text-[10px] text-zinc-400 uppercase font-semibold">Network</div>
            <div className="mt-0.5 text-xs text-zinc-800">
              <span className="font-bold">{user.followerCount}</span> followers ·{" "}
              <span className="font-bold">{user.followingCount}</span> following
            </div>
          </div>
        </div>
      </div>

      {/* Edit Profile Modal */}
      {isEditing && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
          <div className="w-full max-w-md rounded-xl border border-zinc-200 bg-white p-5 shadow-xl">
            <div className="flex items-center justify-between pb-3 border-b border-zinc-100">
              <h3 className="text-sm font-bold text-zinc-900">Edit Profile</h3>
              <button
                onClick={() => setIsEditing(false)}
                className="text-zinc-400 hover:text-zinc-700"
              >
                <X size={15} />
              </button>
            </div>

            <form onSubmit={handleSaveProfile} className="mt-3.5 space-y-3">
              <div>
                <label className="text-xs font-medium text-zinc-700 block mb-1">
                  Name
                </label>
                <input
                  type="text"
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  className="w-full rounded-lg border border-zinc-200 bg-zinc-50 px-3 py-1.5 text-xs text-zinc-900 focus:border-zinc-400 focus:bg-white focus:outline-none"
                />
              </div>

              <div>
                <label className="text-xs font-medium text-zinc-700 block mb-1">
                  Bio
                </label>
                <textarea
                  value={editBio}
                  onChange={(e) => setEditBio(e.target.value)}
                  rows={2}
                  maxLength={180}
                  className="w-full rounded-lg border border-zinc-200 bg-zinc-50 px-3 py-1.5 text-xs text-zinc-900 focus:border-zinc-400 focus:bg-white focus:outline-none resize-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-2.5">
                <div>
                  <label className="text-xs font-medium text-zinc-700 block mb-1">
                    City
                  </label>
                  <input
                    type="text"
                    value={editCity}
                    onChange={(e) => setEditCity(e.target.value)}
                    placeholder="e.g. Pune"
                    className="w-full rounded-lg border border-zinc-200 bg-zinc-50 px-3 py-1.5 text-xs text-zinc-900 focus:border-zinc-400 focus:bg-white focus:outline-none"
                  />
                </div>

                <div>
                  <label className="text-xs font-medium text-zinc-700 block mb-1">
                    College / Org
                  </label>
                  <input
                    type="text"
                    value={editCollege}
                    onChange={(e) => setEditCollege(e.target.value)}
                    placeholder="e.g. COEP"
                    className="w-full rounded-lg border border-zinc-200 bg-zinc-50 px-3 py-1.5 text-xs text-zinc-900 focus:border-zinc-400 focus:bg-white focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-medium text-zinc-700 block mb-1">
                  GitHub Profile URL
                </label>
                <input
                  type="url"
                  value={editGithub}
                  onChange={(e) => setEditGithub(e.target.value)}
                  placeholder="https://github.com/..."
                  className="w-full rounded-lg border border-zinc-200 bg-zinc-50 px-3 py-1.5 text-xs text-zinc-900 focus:border-zinc-400 focus:bg-white focus:outline-none"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-zinc-100">
                <button
                  type="button"
                  onClick={() => setIsEditing(false)}
                  className="rounded-lg border border-zinc-200 bg-white px-3 py-1.5 text-xs font-medium text-zinc-600 hover:text-zinc-900"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={savingProfile}
                  className="inline-flex items-center gap-1 rounded-lg bg-zinc-900 hover:bg-zinc-800 px-3.5 py-1.5 text-xs font-semibold text-white disabled:opacity-50"
                >
                  <Check size={12} />
                  <span>{savingProfile ? "Saving..." : "Save Changes"}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Shipped History Feed */}
      <div className="space-y-3">
        <div className="flex items-center justify-between pb-2 border-b border-zinc-200">
          <h2 className="text-xs font-semibold uppercase tracking-wider text-zinc-600">
            Shipped Posts ({posts.length})
          </h2>
          <span className="text-[11px] text-zinc-400 font-mono">
            Sorted by latest
          </span>
        </div>

        {posts.length === 0 ? (
          <div className="rounded-xl border border-zinc-200 bg-white p-8 text-center text-xs text-zinc-400">
            No ships recorded yet.
          </div>
        ) : (
          posts.map((post) => (
            <ShipCard
              key={post.id}
              post={{
                ...post,
                user: {
                  ...user,
                  currentStreak: user.currentStreak,
                  longestStreak: user.longestStreak,
                },
              }}
              isFollowingAuthor={user.isFollowing}
            />
          ))
        )}
      </div>
    </div>
  );
}
