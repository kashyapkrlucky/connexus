"use client";

import { useEffect, useState } from "react";
import { TopBar } from "@/shared/components/layout/TopBar";
import { SideBar } from "@/shared/components/layout/SideBar";
import { RightSidePanel } from "@/shared/components/layout/RightSidePanel";
import { Compass } from "lucide-react";
import { useHomeStore } from "@/features/home/store/useHomeStore";
import { Tabs } from "@/shared/components/ui/Tabs";
import { Skeleton } from "@/shared/components/ui/Skeleton";
import { EmptyState } from "@/shared/components/ui/EmptyState";
import { PostSort } from "@/features/home/types";
import { PostCard } from "@/features/home/components/PostCard";

export default function Home() {
  const { getMemberships, posts, postsLoading, getPosts, votePost } = useHomeStore();
  const TABS = [
    { value: "top", label: "Top" },
    { value: "recent", label: "Recent" },
    { value: "views", label: "Most Viewed" },
  ];

  const [sort, setSort] = useState<PostSort>("top");
  useEffect(() => {
    getMemberships();
  }, [getMemberships]);

  useEffect(() => {
    getPosts(sort);
  }, [sort, getPosts]);

  return (
    <div className="flex flex-1 flex-col">
      <TopBar />

      <div className="mx-auto flex w-full max-w-7xl flex-1">
        <SideBar />

        <main className="flex flex-1 flex-col p-4 gap-4 max-w-2xl">
          <Tabs items={TABS} value={sort} onChange={(v) => setSort(v as PostSort)} />

          {postsLoading ? (
            <>
              <Skeleton className="h-40 w-full" />
              <Skeleton className="h-40 w-full" />
              <Skeleton className="h-40 w-full" />
            </>
          ) : posts.length === 0 ? (
            <EmptyState
              icon={Compass}
              title="No posts yet"
              description="Join some communities to start seeing posts in your home feed."
            />
          ) : (
            posts.map((post) => <PostCard key={post.id} post={post} onVote={votePost} />)
          )}
        </main>

        <RightSidePanel />
      </div>
    </div>
  );
}
