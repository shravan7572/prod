"use client";

import React, { useState } from "react";
import { signIn } from "next-auth/react";
import Link from "next/link";
import { Flame } from "lucide-react";

export default function LoginPage() {
  const [demoLoading, setDemoLoading] = useState<string | null>(null);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [customEmail, setCustomEmail] = useState("");
  const [customName, setCustomName] = useState("");
  const [customUsername, setCustomUsername] = useState("");
  const [showCustom, setShowCustom] = useState(false);

  async function handleGoogleLogin() {
    setGoogleLoading(true);
    await signIn("google", { callbackUrl: "/feed" });
  }

  async function handleQuickLogin(account: {
    email: string;
    name: string;
    username: string;
  }) {
    setDemoLoading(account.username);
    await signIn("credentials", {
      email: account.email,
      name: account.name,
      username: account.username,
      callbackUrl: "/feed",
    });
  }

  async function handleCustomLogin(e: React.FormEvent) {
    e.preventDefault();
    if (!customEmail) return;
    setDemoLoading("custom");
    await signIn("credentials", {
      email: customEmail,
      name: customName || "Developer",
      username: customUsername || customEmail.split("@")[0],
      callbackUrl: "/feed",
    });
  }

  const demoAccounts = [
    {
      name: "Shravan Choudhary",
      username: "shravan",
      email: "shravan@shipit.dev",
      role: "Creator · COEP Pune",
      streak: 7,
    },
    {
      name: "Aarav Sharma",
      username: "aarav_builds",
      email: "aarav@shipit.dev",
      role: "Indie Hacker · Mumbai",
      streak: 14,
    },
    {
      name: "Priya Patel",
      username: "priyacodes",
      email: "priya@shipit.dev",
      role: "Student Dev · Bangalore",
      streak: 5,
    },
  ];

  return (
    <div className="min-h-screen bg-[#f6f8f6] flex flex-col justify-center py-12 sm:px-6 lg:px-8 px-4">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        <Link href="/" className="inline-flex items-center gap-2 mb-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#eb5e52] text-white font-bold text-base">
            S
          </div>
          <span className="text-xl font-bold tracking-tight text-zinc-900">
            ShipIt
          </span>
        </Link>
        <h2 className="text-xl font-bold tracking-tight text-zinc-900">
          Daily accountability for developers who build.
        </h2>
        <p className="mt-1 text-xs text-zinc-500 max-w-sm mx-auto">
          One ship per day. Streaks reset at midnight IST. Discover peers actively shipping.
        </p>
      </div>

      <div className="mt-6 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="rounded-xl border border-zinc-200 bg-white p-6 sm:p-7 shadow-xs">
          {/* Google OAuth Button */}
          <div>
            <button
              onClick={handleGoogleLogin}
              disabled={googleLoading}
              className="w-full flex items-center justify-center gap-2.5 rounded-lg bg-[#eb5e52] hover:bg-[#de5044] px-4 py-2.5 text-sm font-semibold text-white shadow-xs disabled:opacity-50 transition-colors"
            >
              <svg className="h-4 w-4" viewBox="0 0 24 24">
                <path
                  fill="currentColor"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="currentColor"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="currentColor"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                />
                <path
                  fill="currentColor"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                />
              </svg>
              <span>{googleLoading ? "Connecting..." : "Continue with Google"}</span>
            </button>
          </div>

          {/* Divider */}
          <div className="relative my-5">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-zinc-200" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-white px-2.5 text-zinc-400 font-medium">
                Demo Accounts
              </span>
            </div>
          </div>

          {/* Quick Sign In options */}
          <div className="space-y-2">
            {demoAccounts.map((account) => (
              <button
                key={account.username}
                onClick={() => handleQuickLogin(account)}
                disabled={!!demoLoading}
                className="w-full flex items-center justify-between rounded-lg border border-zinc-200 bg-zinc-50 hover:bg-zinc-100 px-3.5 py-2.5 text-left text-xs text-zinc-800 transition-colors group"
              >
                <div className="flex items-center gap-2.5">
                  <div className="flex h-7 w-7 items-center justify-center rounded-full bg-zinc-200 text-xs font-bold text-zinc-700">
                    {account.username.slice(0, 1).toUpperCase()}
                  </div>
                  <div>
                    <div className="font-semibold text-zinc-900">
                      {account.name}
                    </div>
                    <div className="text-[11px] text-zinc-500">
                      @{account.username} · {account.role}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-1 text-orange-700 font-semibold text-xs bg-orange-50 border border-orange-200 px-2 py-0.5 rounded">
                  <Flame size={11} className="text-[#eb5e52] fill-[#eb5e52]" />
                  <span>{account.streak}d</span>
                </div>
              </button>
            ))}
          </div>

          {/* Custom Dev Login Toggle */}
          <div className="mt-4 pt-3 border-t border-zinc-100 text-center">
            <button
              onClick={() => setShowCustom(!showCustom)}
              className="text-xs text-zinc-500 hover:text-zinc-900 transition-colors"
            >
              {showCustom ? "Hide custom login" : "Or sign in with custom email →"}
            </button>

            {showCustom && (
              <form onSubmit={handleCustomLogin} className="mt-3 space-y-2 text-left">
                <input
                  type="email"
                  value={customEmail}
                  onChange={(e) => setCustomEmail(e.target.value)}
                  placeholder="your.email@example.com"
                  required
                  className="w-full rounded-lg border border-zinc-200 bg-zinc-50 px-3 py-1.5 text-xs text-zinc-900 placeholder-zinc-400 focus:border-zinc-400 focus:bg-white focus:outline-none"
                />
                <div className="grid grid-cols-2 gap-2">
                  <input
                    type="text"
                    value={customName}
                    onChange={(e) => setCustomName(e.target.value)}
                    placeholder="Full Name"
                    className="w-full rounded-lg border border-zinc-200 bg-zinc-50 px-3 py-1.5 text-xs text-zinc-900 placeholder-zinc-400 focus:border-zinc-400 focus:bg-white focus:outline-none"
                  />
                  <input
                    type="text"
                    value={customUsername}
                    onChange={(e) => setCustomUsername(e.target.value)}
                    placeholder="username"
                    className="w-full rounded-lg border border-zinc-200 bg-zinc-50 px-3 py-1.5 text-xs text-zinc-900 placeholder-zinc-400 focus:border-zinc-400 focus:bg-white focus:outline-none"
                  />
                </div>
                <button
                  type="submit"
                  disabled={demoLoading === "custom" || !customEmail}
                  className="w-full rounded-lg bg-zinc-900 hover:bg-zinc-800 py-2 text-xs font-semibold text-white transition-colors"
                >
                  {demoLoading === "custom" ? "Signing In..." : "Sign In with Custom Profile"}
                </button>
              </form>
            )}
          </div>
        </div>

        {/* Feature summary bullets */}
        <div className="mt-5 grid grid-cols-3 gap-2.5 text-center">
          <div className="rounded-lg border border-zinc-200 bg-white p-2.5">
            <div className="text-xs font-bold text-zinc-900">1 / Day</div>
            <div className="text-[10px] text-zinc-500 mt-0.5">Enforced Post</div>
          </div>
          <div className="rounded-lg border border-zinc-200 bg-white p-2.5">
            <div className="text-xs font-bold text-zinc-900">00:00 IST</div>
            <div className="text-[10px] text-zinc-500 mt-0.5">Daily Reset</div>
          </div>
          <div className="rounded-lg border border-zinc-200 bg-white p-2.5">
            <div className="text-xs font-bold text-zinc-900">Real-time</div>
            <div className="text-[10px] text-zinc-500 mt-0.5">Live Feed</div>
          </div>
        </div>
      </div>
    </div>
  );
}
