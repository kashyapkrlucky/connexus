"use client";

import { useEffect } from "react";
import { FlameIcon } from "lucide-react";
import { usePopularStore } from "@/features/popular/store/usePopularStore";
import { PostCard } from "@/features/home/components/PostCard";
import { Tabs } from "@/shared/components/ui/Tabs";
import { Skeleton } from "@/shared/components/ui/Skeleton";
import { EmptyState } from "@/shared/components/ui/EmptyState";
import { Button } from "@/shared/components/ui/Button";
import type { PostSort } from "@/shared/constants";

const SORT_TABS = [
  { value: "hot", label: "Hot" },
  { value: "top", label: "Top" },
  { value: "recent", label: "New" },
  { value: "views", label: "Most Viewed" },
];

export default function PopularPage() {
  const { posts, postsLoading, postsSort, setPostsSort, postsPage, postsPageSize, postsTotal, postsHasMore, getPosts, votePost } =
    usePopularStore();

  useEffect(() => {
    getPosts(1);
  }, [postsSort, getPosts]);

  const totalPages = Math.max(1, Math.ceil(postsTotal / postsPageSize));

  return (
    <div className="mx-auto flex max-w-2xl flex-col gap-4">
      <h1 className="text-2xl font-bold tracking-tight text-gray-200">Popular</h1>

      <Tabs items={SORT_TABS} value={postsSort} onChange={(v) => setPostsSort(v as PostSort)} />

      {postsLoading ? (
        <div className="space-y-3">
          <Skeleton className="h-40 w-full" />
          <Skeleton className="h-40 w-full" />
          <Skeleton className="h-40 w-full" />
        </div>
      ) : posts.length === 0 ? (
        <EmptyState icon={FlameIcon} title="Nothing here yet" description="Check back once communities start posting." />
      ) : (
        <>
          {posts.map((post) => (
            <PostCard key={post.id} post={post} onVote={votePost} />
          ))}

          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-3 pt-2">
              <Button variant="outline" size="sm" disabled={postsPage <= 1} onClick={() => getPosts(postsPage - 1)}>
                Previous
              </Button>
              <span className="text-xs text-gray-500">
                Page {postsPage} of {totalPages}
              </span>
              <Button variant="outline" size="sm" disabled={!postsHasMore} onClick={() => getPosts(postsPage + 1)}>
                Next
              </Button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
