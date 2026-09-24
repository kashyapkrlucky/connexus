"use client";

import { useEffect } from "react";
import { FlameIcon } from "lucide-react";
import { usePopularStore } from "@/features/popular/store/usePopularStore";
import { PostCard } from "@/features/home/components/PostCard";
import { Tabs } from "@/shared/components/ui/Tabs";
import { Skeleton } from "@/shared/components/ui/Skeleton";
import { EmptyState } from "@/shared/components/ui/EmptyState";
import { InfiniteScrollTrigger } from "@/shared/components/ui/InfiniteScrollTrigger";
import type { PostSort } from "@/shared/constants";

const SORT_TABS = [
  { value: "hot", label: "Hot" },
  { value: "top", label: "Top" },
  { value: "recent", label: "New" },
  { value: "views", label: "Most Viewed" },
];

export default function PopularPage() {
  const { posts, postsLoading, postsLoadingMore, postsSort, setPostsSort, postsPage, postsHasMore, getPosts, votePost } =
    usePopularStore();

  useEffect(() => {
    getPosts(1);
  }, [postsSort, getPosts]);

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

          <InfiniteScrollTrigger
            hasMore={postsHasMore}
            loading={postsLoadingMore}
            onLoadMore={() => getPosts(postsPage + 1)}
          />
        </>
      )}
    </div>
  );
}
