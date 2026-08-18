"use client";

import { useEffect } from "react";
import Link from "next/link";
import { CompassIcon, FlameIcon } from "lucide-react";
import { useSidebarStore } from "../store/useSidebarStore";
import { Avatar } from "@/shared/components/ui/Avatar";
import { Button } from "@/shared/components/ui/Button";
import { Skeleton } from "@/shared/components/ui/Skeleton";
import { EmptyState } from "@/shared/components/ui/EmptyState";
import { formatCompactNumber } from "@/shared/utils/format";

interface CommunityRowData {
  id: string;
  slug: string;
  name: string;
  iconUrl: string | null;
  viewerIsMember: boolean;
}

function CommunityGridSkeleton() {
  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
      {Array.from({ length: 4 }).map((_, i) => (
        <Skeleton key={i} className="h-16 w-full" />
      ))}
    </div>
  );
}

function CommunityRow({
  community,
  extra,
  onJoin,
}: {
  community: CommunityRowData;
  extra: string;
  onJoin: (slug: string) => void;
}) {
  return (
    <div className="flex items-center justify-between gap-3 rounded-xl border border-gray-800 bg-gray-900 p-3">
      <Link href={`/c/${community.slug}`} className="flex min-w-0 items-center gap-2.5">
        <Avatar name={community.name} src={community.iconUrl} size={36} />
        <div className="min-w-0">
          <p className="truncate text-sm font-medium text-gray-200">c/{community.slug}</p>
          <p className="text-xs text-gray-500">{extra}</p>
        </div>
      </Link>
      {!community.viewerIsMember && (
        <Button size="sm" variant="outline" onClick={() => onJoin(community.slug)} className="shrink-0">
          Join
        </Button>
      )}
    </div>
  );
}

export function ExploreView() {
  const { trending, trendingLoading, getTrending, explore, exploreLoading, getExplore, joinCommunity } =
    useSidebarStore();

  useEffect(() => {
    getTrending(20);
    getExplore(20);
  }, [getTrending, getExplore]);

  return (
    <div className="flex flex-col gap-8">
      <section>
        <h2 className="mb-3 flex items-center gap-2 text-lg font-semibold text-gray-100">
          <FlameIcon className="size-4 text-orange-400" /> Trending today
        </h2>
        {trendingLoading ? (
          <CommunityGridSkeleton />
        ) : trending.length === 0 ? (
          <EmptyState
            icon={FlameIcon}
            title="Nothing trending yet"
            description="Check back once some communities pick up activity today."
          />
        ) : (
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            {trending.map((c) => (
              <CommunityRow
                key={c.id}
                community={c}
                extra={`${formatCompactNumber(c.postsToday)} posts today`}
                onJoin={joinCommunity}
              />
            ))}
          </div>
        )}
      </section>

      <section>
        <h2 className="mb-3 flex items-center gap-2 text-lg font-semibold text-gray-100">
          <CompassIcon className="size-4 text-brand-400" /> Communities to explore
        </h2>
        {exploreLoading ? (
          <CommunityGridSkeleton />
        ) : explore.length === 0 ? (
          <EmptyState
            icon={CompassIcon}
            title="You're all caught up"
            description="You've already joined the most popular communities."
          />
        ) : (
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            {explore.map((c) => (
              <CommunityRow
                key={c.id}
                community={c}
                extra={`${formatCompactNumber(c.memberCount)} members`}
                onJoin={joinCommunity}
              />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
