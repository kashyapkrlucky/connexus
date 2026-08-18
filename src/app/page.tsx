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
import { getCodeFromURL } from "@/features/auth/utils";
import useAuthStore from "@/features/auth/store/useAuthStore";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import PageLoader from "@/shared/components/ui/PageLoader";
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

  const { getUserData, isAuthenticated, loading } = useAuthStore();
  const [isOAuthChecked, setIsOAuthChecked] = useState(false);

  const router = useRouter();

  useEffect(() => {
    const handleOAuthCallback = async () => {
      const code = getCodeFromURL();
      if (code) {
        try {
          const result = await getUserData(code);
          if (!result) {
            toast.error("Failed to complete sign in. Please try again.");
          }
          router.push("/");
        } catch (error) {
          console.error("OAuth callback failed:", error);
          toast.error("Failed to complete sign in. Please try again.");
        } finally {
          setIsOAuthChecked(true);
        }
      } else {
        setIsOAuthChecked(true);
      }
    };

    handleOAuthCallback();
  }, [getUserData, router]);

  useEffect(() => {
    if (isOAuthChecked && !isAuthenticated && !loading) {
      router.push("/");
    }
  }, [isAuthenticated, loading, isOAuthChecked, router]);

  if (loading || !isOAuthChecked) {
    return <PageLoader />;
  }

  return (
    <div className="flex flex-1 flex-col">
      <TopBar />

      <div className="mx-auto flex w-full max-w-7xl flex-1">
        <SideBar />

        <main className="flex flex-1 flex-col p-4 gap-4 ">
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
