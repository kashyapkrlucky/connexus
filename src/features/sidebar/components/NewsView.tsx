"use client";

import { useEffect } from "react";
import { GlobeIcon } from "lucide-react";
import { useSidebarStore } from "../store/useSidebarStore";
import { Skeleton } from "@/shared/components/ui/Skeleton";
import { EmptyState } from "@/shared/components/ui/EmptyState";
import { formatRelativeTime } from "@/shared/utils/date";

export function NewsView() {
  const { news, newsLoading, getNews } = useSidebarStore();

  useEffect(() => {
    getNews(20);
  }, [getNews]);

  if (newsLoading) {
    return (
      <div className="space-y-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <Skeleton key={i} className="h-16 w-full" />
        ))}
      </div>
    );
  }

  if (news.length === 0) {
    return <EmptyState icon={GlobeIcon} title="No news available" description="Check back again shortly." />;
  }

  return (
    <ul className="flex flex-col gap-2">
      {news.map((item) => (
        <li key={item.url}>
          <a
            href={item.url}
            target="_blank"
            rel="noopener noreferrer"
            className="block rounded-xl border border-gray-800 bg-gray-900 p-3 transition-colors hover:border-gray-700 hover:bg-gray-800"
          >
            <p className="text-sm font-medium text-gray-200">{item.title}</p>
            <p className="mt-1 text-xs text-gray-500">
              {item.source} • {formatRelativeTime(item.publishedAt)}
            </p>
          </a>
        </li>
      ))}
    </ul>
  );
}
