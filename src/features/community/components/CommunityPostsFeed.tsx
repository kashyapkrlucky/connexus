"use client";

import { useEffect } from "react";
import { FileTextIcon } from "lucide-react";
import { PostCard } from "@/features/home/components/PostCard";
import { Tabs } from "@/shared/components/ui/Tabs";
import { Skeleton } from "@/shared/components/ui/Skeleton";
import { EmptyState } from "@/shared/components/ui/EmptyState";
import { Button } from "@/shared/components/ui/Button";
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
    postsSort,
    setPostsSort,
    postsPage,
    postsPageSize,
    postsTotal,
    postsHasMore,
    getPosts,
    votePost,
  } = useCommunityStore();

  useEffect(() => {
    getPosts(slug, 1);
  }, [slug, postsSort, getPosts]);

  const totalPages = Math.max(1, Math.ceil(postsTotal / postsPageSize));

  return (
    <div className="flex flex-col gap-3">
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

          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-3 pt-2">
              <Button variant="outline" size="sm" disabled={postsPage <= 1} onClick={() => getPosts(slug, postsPage - 1)}>
                Previous
              </Button>
              <span className="text-xs text-gray-500">
                Page {postsPage} of {totalPages}
              </span>
              <Button variant="outline" size="sm" disabled={!postsHasMore} onClick={() => getPosts(slug, postsPage + 1)}>
                Next
              </Button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
