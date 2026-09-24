"use client";

import { useEffect, useRef } from "react";
import { Loader2 } from "lucide-react";

interface InfiniteScrollTriggerProps {
  hasMore: boolean;
  loading: boolean;
  onLoadMore: () => void;
  endMessage?: string;
}

/**
 * Place after a list: calls `onLoadMore` as the user scrolls near the end. The observer
 * is re-attached after every load, so a page too short to fill the screen still
 * pulls the next one.
 */
export function InfiniteScrollTrigger({
  hasMore,
  loading,
  onLoadMore,
  endMessage = "You're all caught up",
}: InfiniteScrollTriggerProps) {
  const sentinelRef = useRef<HTMLDivElement>(null);
  const onLoadMoreRef = useRef(onLoadMore);

  useEffect(() => {
    onLoadMoreRef.current = onLoadMore;
  }, [onLoadMore]);

  useEffect(() => {
    const sentinel = sentinelRef.current;
    if (!sentinel || !hasMore || loading) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) onLoadMoreRef.current();
      },
      { rootMargin: "600px 0px" }
    );
    observer.observe(sentinel);
    return () => observer.disconnect();
  }, [hasMore, loading]);

  return (
    <div ref={sentinelRef} className="flex justify-center py-4" aria-live="polite">
      {loading ? (
        <Loader2 className="size-5 animate-spin text-gray-500" aria-label="Loading more posts" />
      ) : (
        !hasMore && <p className="text-xs text-gray-600">{endMessage}</p>
      )}
    </div>
  );
}
