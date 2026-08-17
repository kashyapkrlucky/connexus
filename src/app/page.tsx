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
        <SideBar className="p-4">

          <div className="rounded-2xl border border-gray-700 bg-gray-900 p-3">
            <h2 className="mb-2 flex items-center gap-1.5 px-1 text-xs font-semibold uppercase tracking-wide text-gray-400">
              <Compass className="size-3.5" /> Your communities
            </h2>
            {memberships.length === 0 ? (
              <p className="px-1 text-sm text-gray-500">You haven&apos;t joined any yet.</p>
            ) : (
              <ul className="space-y-0.5">
                {memberships.map((m) => (
                  <li key={m.id}>
                    <Link
                      href={`/c/${m.community.slug}`}
                      className="flex items-center gap-2 rounded-xl px-2 py-1.5 text-sm text-gray-300 transition-colors hover:bg-gray-800"
                    >
                      <Avatar name={m.community.name} src={m.community.iconUrl} size={22} />
                      <span className="truncate">c/{m.community.slug}</span>
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </SideBar>

        <main className="flex flex-1 flex-col p-4 gap-4 ">
          <Tabs items={TABS} value={sort} onChange={(v) => setSort(v as PostSort)} />


        </main>

        <RightSidePanel className="p-4">

          <div className="rounded-2xl border border-gray-700 bg-gray-900 p-3">
            <h2 className="mb-3 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-gray-400">
              <SparklesIcon className="size-3.5" /> Popular communities
            </h2>
            {topCommunities.length === 0 ? (
              <p className="text-sm text-gray-500">No communities yet.</p>
            ) : (
              <ul className="space-y-0.5">
                {topCommunities.map((c) => (
                  <li key={c.id}>
                    <Link
                      href={`/c/${c.slug}`}
                      className="flex items-center justify-between gap-2 rounded-xl px-2 py-1.5 text-sm text-gray-300 transition-colors hover:bg-gray-800"
                    >
                      <span className="flex min-w-0 items-center gap-2">
                        <Avatar name={c.name} src={c.iconUrl} size={26} />
                        <span className="truncate">c/{c.slug}</span>
                      </span>
                      <span className="flex shrink-0 items-center gap-1 text-xs text-gray-500">
                        <UsersIcon className="size-3" />
                        {formatCompactNumber(c._count.members)}
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </div>

        </RightSidePanel>
      </div>
    </div>
  );
}
