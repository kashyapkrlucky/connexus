"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { FileTextIcon, PenSquareIcon, UserXIcon } from "lucide-react";
import { useCurrentUser } from "@/features/auth/hooks/useCurrentUser";
import { useProfileStore } from "@/features/profile/store/useProfileStore";
import { ProfileHeader } from "@/features/profile/components/ProfileHeader";
import { ProfilePostsFeed } from "@/features/profile/components/ProfilePostsFeed";
import { ProfileCommunities } from "@/features/profile/components/ProfileCommunities";
import { EditProfileModal } from "@/features/profile/components/EditProfileModal";
import { ProfileRankCard } from "@/features/profile/components/ProfileRankCard";
import { Skeleton } from "@/shared/components/ui/Skeleton";
import { EmptyState } from "@/shared/components/ui/EmptyState";

interface ProfilePageViewProps {
  username: string;
}

export function ProfilePageView({ username }: ProfilePageViewProps) {
  const { user } = useCurrentUser();
  const { profile, profileLoading, profileNotFound, getProfile, reset, ownScore, getOwnScore } = useProfileStore();
  const [editOpen, setEditOpen] = useState(false);

  const isOwnProfile = user?.username === username;

  useEffect(() => {
    reset();
    getProfile(username);
  }, [username, getProfile, reset]);

  useEffect(() => {
    if (isOwnProfile) getOwnScore();
  }, [isOwnProfile, getOwnScore]);

  if (profileLoading || (!profile && !profileNotFound)) {
    return (
      <div className="mx-auto max-w-4xl space-y-3">
        <Skeleton className="h-40 w-full" />
        <Skeleton className="h-40 w-full" />
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="mx-auto max-w-xl">
        <EmptyState icon={UserXIcon} title="User not found" description="This account doesn't exist." />
      </div>
    );
  }

  return (
    <div className="mx-auto flex max-w-4xl flex-col gap-4">
      <ProfileHeader profile={profile} isOwnProfile={isOwnProfile} onEdit={() => setEditOpen(true)} />

      <div className="grid grid-cols-1 items-start gap-4 lg:grid-cols-[minmax(0,1fr)_280px]">
        {profile.stats.postCount > 0 ? (
          <ProfilePostsFeed username={username} />
        ) : (
          <EmptyState
            icon={FileTextIcon}
            title={isOwnProfile ? "You haven't posted yet" : "No posts yet"}
            description={
              isOwnProfile
                ? "Share something with one of your communities — it'll show up here."
                : `u/${profile.username} hasn't posted anything yet.`
            }
            action={
              isOwnProfile ? (
                <Link
                  href="/create"
                  className="inline-flex items-center gap-1.5 rounded-lg bg-brand-500 px-3 py-1.5 text-sm font-medium text-white transition-colors hover:bg-brand-600"
                >
                  <PenSquareIcon className="size-4" /> Create a post
                </Link>
              ) : undefined
            }
          />
        )}

        {/* Above the feed on phones: an infinite feed would otherwise keep this out of reach. */}
        <div className="order-first flex flex-col gap-4 lg:order-none">
          {isOwnProfile && ownScore && <ProfileRankCard score={ownScore} />}
          <ProfileCommunities communities={profile.communities} />
        </div>
      </div>

      {editOpen && <EditProfileModal profile={profile} onClose={() => setEditOpen(false)} />}
    </div>
  );
}
