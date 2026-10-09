"use client";

import React, { useState } from "react";
import { Feed } from "@/components/Feed";
import { SuggestFollows } from "@/components/SuggestFollows";
import { Flame, Clock, Hash, Zap } from "lucide-react";
import { useSession } from "next-auth/react";

export default function FeedPage() {
  const { data: session } = useSession();

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
      {/* Main Feed Column */}
      <div className="lg:col-span-2">
        <Feed />
      </div>

      {/* Right Sidebar */}
      <div className="space-y-4">
        {/* Suggest Builders to Follow */}
        <SuggestFollows />

        {/* Community Info Card */}
        <div className="rounded-xl border border-zinc-800/80 bg-zinc-950/70 backdrop-blur-sm shadow-sm p-4">
          <div className="flex items-center gap-2 pb-2.5 border-b border-zinc-900">
            <Zap size={14} className="text-zinc-400" />
            <h3 className="text-xs font-semibold uppercase tracking-wider text-zinc-300">
              ShipIt Protocol
            </h3>
          </div>
          <ul className="mt-3 space-y-2 text-xs text-zinc-400 leading-relaxed">
            <li className="flex items-start gap-2">
              <span className="font-mono text-zinc-300 font-bold">1.</span>
              <span><strong>One ship per day:</strong> Keep high signal without social media noise.</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="font-mono text-zinc-300 font-bold">2.</span>
              <span><strong>Midnight IST reset:</strong> Ship every calendar day in Indian Standard Time.</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="font-mono text-zinc-300 font-bold">3.</span>
              <span><strong>Real-time feed:</strong> Live WebSocket broadcast to peers following you.</span>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}
