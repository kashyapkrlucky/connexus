"use client";

import { useEffect, type ReactNode } from "react";
import Link from "next/link";
import { CompassIcon, FlameIcon, GlobeIcon, UsersIcon } from "lucide-react";
import { useSidebarStore } from "@/features/sidebar/store/useSidebarStore";
import { Avatar } from "../ui/Avatar";
import { RankBadge } from "../ui/RankBadge";
import { Skeleton } from "../ui/Skeleton";
import { formatCompactNumber } from "@/shared/utils/format";
import { formatRelativeTime } from "@/shared/utils/date";

interface RightSidePanelProps {
  children?: ReactNode;
  className?: string;
}

interface SectionCardProps {
  icon: ReactNode;
  title: string;
  viewMoreHref?: string;
  children: ReactNode;
}

function SectionCard({ icon, title, viewMoreHref, children }: SectionCardProps) {
  return (
    <div className="rounded-2xl border border-gray-700 bg-gray-900 p-3">
      <h2 className="mb-3 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-gray-400">
        {icon} {title}
      </h2>
      {children}
      {viewMoreHref && (
        <Link
          href={viewMoreHref}
          className="mt-3 block rounded-lg py-1.5 text-center text-xs font-medium text-brand-400 transition-colors hover:bg-gray-800 hover:text-brand-300"
        >
          View more
        </Link>
      )}
    </div>
  );
}

function ListSkeleton() {
  return (
    <div className="space-y-2">
      <Skeleton className="h-9 w-full" />
      <Skeleton className="h-9 w-full" />
      <Skeleton className="h-9 w-full" />
    </div>
  );
}

export function RightSidePanel({ children, className }: RightSidePanelProps) {
  const {
    trending,
    trendingLoading,
    getTrending,
    explore,
    exploreLoading,
    getExplore,
    score,
    scoreLoading,
    getScore,
    news,
    newsLoading,
    getNews,
  } = useSidebarStore();

  useEffect(() => {
    getTrending();
    getExplore();
    getScore();
    getNews();
  }, [getTrending, getExplore, getScore, getNews]);

  return (
    <aside className={`h-full w-72 shrink-0 space-y-3 border-l border-border/40 p-3 ${className ?? ""}`}>
      <SectionCard icon={<FlameIcon className="size-3.5" />} title="Trending today" viewMoreHref="/explore">
        {trendingLoading ? (
          <ListSkeleton />
        ) : trending.length === 0 ? (
          <p className="text-sm text-gray-500">No trending communities yet today.</p>
        ) : (
          <ul className="space-y-0.5">
            {trending.map((c) => (
              <li key={c.id}>
                <Link
                  href={`/c/${c.slug}`}
                  className="flex items-center justify-between gap-2 rounded-xl px-2 py-1.5 text-sm text-gray-300 transition-colors hover:bg-gray-800"
                >
                  <span className="flex min-w-0 items-center gap-2">
                    <Avatar name={c.name} src={c.iconUrl} size={26} />
                    <span className="truncate">c/{c.slug}</span>
                  </span>
                  <span className="shrink-0 text-xs text-gray-500">{formatCompactNumber(c.postsToday)} posts</span>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </SectionCard>

      <SectionCard icon={<CompassIcon className="size-3.5" />} title="Communities to explore" viewMoreHref="/explore">
        {exploreLoading ? (
          <ListSkeleton />
        ) : explore.length === 0 ? (
          <p className="text-sm text-gray-500">You&apos;re already in all the popular ones.</p>
        ) : (
          <ul className="space-y-0.5">
            {explore.map((c) => (
              <li key={c.id}>
                <Link
                  href={`/c/${c.slug}`}
                  className="flex items-center justify-between gap-2 rounded-xl px-2 py-1.5 text-sm text-gray-300 transition-colors hover:bg-gray-800"
                >
                  <span className="flex min-w-0 items-center gap-2">
                    <Avatar name={c.name} src={c.iconUrl} size={26} />
                    <span className="truncate">c/{c.slug}</span>
                  </span>
                  <span className="flex shrink-0 items-center gap-1 text-xs text-gray-500">
                    <UsersIcon className="size-3" />
                    {formatCompactNumber(c.memberCount)}
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </SectionCard>

      <div className="rounded-2xl border border-gray-700 bg-gray-900 p-3">
        <h2 className="mb-3 text-xs font-semibold uppercase tracking-wide text-gray-400">Your score</h2>
        {scoreLoading || !score ? <Skeleton className="h-10 w-full" /> : <RankBadge rank={score.rank} xp={score.xp} />}
      </div>

      <SectionCard icon={<GlobeIcon className="size-3.5" />} title="What's happening" viewMoreHref="/news">
        {newsLoading ? (
          <ListSkeleton />
        ) : news.length === 0 ? (
          <p className="text-sm text-gray-500">No news available right now.</p>
        ) : (
          <ul className="space-y-1">
            {news.map((item) => (
              <li key={item.url}>
                <a
                  href={item.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block rounded-xl px-2 py-1.5 transition-colors hover:bg-gray-800"
                >
                  <p className="line-clamp-2 text-sm text-gray-300">{item.title}</p>
                  <p className="mt-0.5 text-xs text-gray-500">
                    {item.source} • {formatRelativeTime(item.publishedAt)}
                  </p>
                </a>
              </li>
            ))}
          </ul>
        )}
      </SectionCard>

      {children}
    </aside>
  );
}
