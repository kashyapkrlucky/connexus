"use client";

import { useEffect } from "react";
import { FileTextIcon } from "lucide-react";
import { PostCard } from "@/features/home/components/PostCard";
import { Tabs } from "@/shared/components/ui/Tabs";
import { Skeleton } from "@/shared/components/ui/Skeleton";
import { EmptyState } from "@/shared/components/ui/EmptyState";
import { InfiniteScrollTrigger } from "@/shared/components/ui/InfiniteScrollTrigger";
import { useCommunityStore } from "../store/useCommunityStore";
import type { PostSort } from "@/shared/constants";

const SORT_TABS = [
  { value: "hot", label: "Hot" },
  { value: "top", label: "Top" },
  { value: "recent", label: "New" },
  { value: "views", label: "Most Viewed" },
];

interface CommunityPostsFeedProps {
  slug: string;
}

export function CommunityPostsFeed({ slug }: CommunityPostsFeedProps) {
  const {
    posts,
    postsLoading,
    postsLoadingMore,
    postsSort,
    setPostsSort,
    postsPage,
    postsHasMore,
    getPosts,
    votePost,
  } = useCommunityStore();

  useEffect(() => {
    getPosts(slug, 1);
  }, [slug, postsSort, getPosts]);

  return (
    <div className="flex min-w-0 max-w-xl flex-col gap-3">
      <Tabs items={SORT_TABS} value={postsSort} onChange={(v) => setPostsSort(v as PostSort)} />

      {postsLoading ? (
        <div className="space-y-3">
          <Skeleton className="h-40 w-full" />
          <Skeleton className="h-40 w-full" />
          <Skeleton className="h-40 w-full" />
        </div>
      ) : posts.length === 0 ? (
        <EmptyState icon={FileTextIcon} title="No posts yet" description="Be the first to post in this community." />
      ) : (
        <>
          {posts.map((post) => (
            <PostCard key={post.id} post={post} onVote={votePost} />
          ))}

          <InfiniteScrollTrigger
            hasMore={postsHasMore}
            loading={postsLoadingMore}
            onLoadMore={() => getPosts(slug, postsPage + 1)}
          />
        </>
      )}
    </div>
  );
}
