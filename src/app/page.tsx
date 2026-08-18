"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { TopBar } from "@/shared/components/layout/TopBar";
import { SideBar } from "@/shared/components/layout/SideBar";
import { RightSidePanel } from "@/shared/components/layout/RightSidePanel";
import { Compass, SparklesIcon, UsersIcon } from "lucide-react";
import { Avatar } from "@/shared/components/ui/Avatar";
import { useHomeStore } from "@/features/home/store/useHomeStore";
import { formatCompactNumber } from "@/shared/utils/format";
import { Tabs } from "@/shared/components/ui/Tabs";
import { PostSort } from "@/features/home/types";
import { getCodeFromURL } from "@/features/auth/utils";
import useAuthStore from "@/features/auth/store/useAuthStore";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import PageLoader from "@/shared/components/ui/PageLoader";
import { Post } from "@/features/home/types";
import { PostCard } from "@/features/home/components/PostCard";

export default function Home() {
  const { memberships, getMemberships, topCommunities, getTopCommunities } = useHomeStore();
  const TABS = [
    { value: "top", label: "Top" },
    { value: "recent", label: "Recent" },
    { value: "views", label: "Most Viewed" },
  ];

  const sortVal: PostSort = "top";

  const [sort, setSort] = useState<PostSort>(sortVal);
  useEffect(() => {
    getMemberships();
    getTopCommunities();
  }, []);


  const posts: Post[] = [{
    id: "1",
    community: {
      id: "1",
      name: "Community 1",
      slug: "community-1",
    },
    title: "Title 1",
    content: "Content 1",
    createdAt: "2022-01-01",
    author: {
      id: "1",
      name: "Author 1",
      avatar: "https://via.placeholder.com/150",
    },
  }];

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
  }, [getUserData]);

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

          {posts.map((post) => (
            <PostCard key={post.id} post={post} />
          ))}

        </main>

        <RightSidePanel />
      </div>
    </div>
  );
}
