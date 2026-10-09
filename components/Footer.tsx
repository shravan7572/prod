"use client";

import React from "react";
import Link from "next/link";

function GithubIcon({ size = 13, className = "" }: { size?: number; className?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" className={className}>
      <path fillRule="evenodd" clipRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" />
    </svg>
  );
}

export function Footer() {
  return (
    <footer className="border-t border-zinc-200 bg-white mt-16">
      <div className="mx-auto max-w-5xl px-4 sm:px-6 py-10">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 pb-8 border-b border-zinc-100">
          {/* Brand info */}
          <div className="md:col-span-2 space-y-2">
            <Link href="/" className="inline-flex items-center gap-2 group">
              <div className="flex h-6 w-6 items-center justify-center rounded-md bg-[#eb5e52] text-white font-bold text-xs">
                S
              </div>
              <span className="text-sm font-bold tracking-tight text-zinc-900">
                ShipIt
              </span>
            </Link>
            <p className="text-xs text-zinc-500 max-w-sm leading-relaxed">
              Daily accountability for developers who build. Share what you shipped today,
              keep your streak alive, and discover peers shipping without social media noise.
            </p>
            <div className="pt-0.5 flex items-center gap-2 text-[11px] text-zinc-400">
              <span className="inline-block h-1.5 w-1.5 rounded-full bg-emerald-500" />
              <span>Resets strictly at 00:00 IST every day</span>
            </div>
          </div>

          {/* Core Features */}
          <div>
            <h4 className="text-xs font-semibold uppercase tracking-wider text-zinc-800 mb-2.5">
              Features
            </h4>
            <ul className="space-y-1.5 text-xs text-zinc-500">
              <li>
                <Link href="/" className="hover:text-zinc-900 transition-colors">
                  Discover Feed
                </Link>
              </li>
              <li>
                <Link href="/" className="hover:text-zinc-900 transition-colors">
                  Following Live Feed
                </Link>
              </li>
              <li>
                <Link href="/login" className="hover:text-zinc-900 transition-colors">
                  Daily Streak Tracking
                </Link>
              </li>
              <li>
                <Link href="/" className="hover:text-zinc-900 transition-colors">
                  Tomorrow&apos;s Pledge
                </Link>
              </li>
            </ul>
          </div>

          {/* Architecture */}
          <div>
            <h4 className="text-xs font-semibold uppercase tracking-wider text-zinc-800 mb-2.5">
              Tech Stack
            </h4>
            <ul className="space-y-1.5 text-xs text-zinc-500 font-mono text-[11px]">
              <li>Next.js 16 App Router</li>
              <li>Neon PostgreSQL & Prisma</li>
              <li>WebSocket Realtime (8080)</li>
              <li>NextAuth (Google OAuth)</li>
              <li>Tailwind CSS</li>
            </ul>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="pt-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-zinc-500">
          <div className="flex items-center gap-2">
            <span>Built for student devs & indie hackers across India</span>
            <span>🇮🇳</span>
          </div>

          <div className="flex items-center gap-4 text-xs">
            <span className="text-zinc-400">High signal · Zero noise</span>
            <span>·</span>
            <a
              href="https://github.com/shravan7572"
              target="_blank"
              rel="noopener noreferrer"
              className="text-zinc-500 hover:text-zinc-900 inline-flex items-center gap-1.5 transition-colors"
            >
              <GithubIcon size={12} />
              <span>GitHub</span>
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
