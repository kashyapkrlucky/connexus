"use client";

import { useEffect, useState } from "react";
import { BarChart3Icon } from "lucide-react";
import internalApi from "@/lib/http/internal";
import { getErrorMessage } from "@/lib/http/errors";
import type { CommunityAnalyticsDTO } from "@/server/types/community.types";
import { Modal } from "@/shared/components/ui/Modal";
import { Skeleton } from "@/shared/components/ui/Skeleton";
import { EmptyState } from "@/shared/components/ui/EmptyState";
import { formatCompactNumber } from "@/shared/utils/format";
import { TrendChart } from "./TrendChart";

interface CommunityAnalyticsModalProps {
  slug: string;
  onClose: () => void;
}

function StatTile({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-xl border border-gray-800 bg-gray-950/40 px-3 py-2.5">
      <p className="text-xs text-gray-500">{label}</p>
      <p className="mt-0.5 text-xl font-semibold text-gray-100" title={value.toLocaleString()}>
        {formatCompactNumber(value)}
      </p>
    </div>
  );
}

/** Owner/moderator dashboard: live totals plus 30-day trends from the daily snapshots. */
export function CommunityAnalyticsModal({ slug, onClose }: CommunityAnalyticsModalProps) {
  const [data, setData] = useState<CommunityAnalyticsDTO | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    internalApi
      .get<CommunityAnalyticsDTO>(`/v1/communities/${slug}/analytics`)
      .then(({ data }) => setData(data))
      .catch((err) => setError(getErrorMessage(err, "Couldn't load analytics")));
  }, [slug]);

  return (
    <Modal open onClose={onClose} title={`c/${slug} analytics`} className="max-w-2xl">
      {error ? (
        <EmptyState icon={BarChart3Icon} title="Analytics unavailable" description={error} />
      ) : !data ? (
        <div className="space-y-3">
          <Skeleton className="h-16 w-full" />
          <Skeleton className="h-40 w-full" />
        </div>
      ) : (
        <div className="flex flex-col gap-4">
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
            <StatTile label="Members" value={data.live.memberCount} />
            <StatTile label="Posts" value={data.live.postCount} />
            <StatTile label="Upvotes" value={data.live.totalUpvotes} />
            <StatTile label="Views" value={data.live.totalViews} />
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <TrendChart title="Members" points={data.trend.map((t) => ({ date: t.date, value: t.memberCount }))} />
            <TrendChart title="Posts" points={data.trend.map((t) => ({ date: t.date, value: t.postCount }))} />
          </div>

          <p className="text-xs text-gray-600">Trends come from daily snapshots taken just after midnight UTC.</p>
        </div>
      )}
    </Modal>
  );
}
