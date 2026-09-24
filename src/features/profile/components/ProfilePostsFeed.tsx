"use client";

import { useEffect } from "react";
import { FileTextIcon } from "lucide-react";
import { PostCard } from "@/features/home/components/PostCard";
import { Tabs } from "@/shared/components/ui/Tabs";
import { Skeleton } from "@/shared/components/ui/Skeleton";
import { EmptyState } from "@/shared/components/ui/EmptyState";
import { InfiniteScrollTrigger } from "@/shared/components/ui/InfiniteScrollTrigger";
import { useProfileStore } from "../store/useProfileStore";
import type { PostSort } from "@/shared/constants";

const SORT_TABS = [
  { value: "recent", label: "New" },
  { value: "top", label: "Top" },
  { value: "hot", label: "Hot" },
  { value: "views", label: "Most Viewed" },
];

interface ProfilePostsFeedProps {
  username: string;
}

export function ProfilePostsFeed({ username }: ProfilePostsFeedProps) {
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
  } = useProfileStore();

  useEffect(() => {
    getPosts(username, 1);
  }, [username, postsSort, getPosts]);

  return (
    <div className="flex flex-col gap-3 max-w-xl">
      <Tabs items={SORT_TABS} value={postsSort} onChange={(v) => setPostsSort(v as PostSort)} />

      {postsLoading ? (
        <div className="space-y-3">
          <Skeleton className="h-40 w-full" />
          <Skeleton className="h-40 w-full" />
        </div>
      ) : posts.length === 0 ? (
        <EmptyState icon={FileTextIcon} title="No posts yet" description="This user hasn't posted anything yet." />
      ) : (
        <>
          {posts.map((post) => (
            <PostCard key={post.id} post={post} onVote={votePost} />
          ))}

          <InfiniteScrollTrigger
            hasMore={postsHasMore}
            loading={postsLoadingMore}
            onLoadMore={() => getPosts(username, postsPage + 1)}
          />
        </>
      )}
    </div>
  );
}
