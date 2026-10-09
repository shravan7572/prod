"use client";

import React from "react";
import { Feed } from "@/components/Feed";
import { SuggestFollows } from "@/components/SuggestFollows";
import { HeroMission } from "@/components/HeroMission";
import { PledgeBanner } from "@/components/PledgeBanner";
import { useSession } from "next-auth/react";

export default function FeedPage() {
  const { data: session } = useSession();

  return (
    <div className="space-y-6">
      {/* Clean Hero Mission */}
      <HeroMission />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        {/* Main Feed Column */}
        <div className="lg:col-span-2">
          <Feed />
        </div>

        {/* Right Sidebar */}
        <div className="space-y-4">
          {/* Tomorrow's Pledge Widget */}
          <PledgeBanner />

          {/* Consistency Leaderboard / Builders Shipping Daily */}
          <SuggestFollows />
        </div>
      </div>
    </div>
  );
}
