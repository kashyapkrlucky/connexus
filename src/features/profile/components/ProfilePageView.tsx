"use client";

import { useEffect, useState } from "react";
import { UserXIcon } from "lucide-react";
import { useCurrentUser } from "@/features/auth/hooks/useCurrentUser";
import { useProfileStore } from "@/features/profile/store/useProfileStore";
import { ProfileHeader } from "@/features/profile/components/ProfileHeader";
import { ProfilePostsFeed } from "@/features/profile/components/ProfilePostsFeed";
import { ProfileCommunities } from "@/features/profile/components/ProfileCommunities";
import { EditProfileModal } from "@/features/profile/components/EditProfileModal";
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
      <ProfileHeader profile={profile} isOwnProfile={isOwnProfile} ownScore={ownScore} onEdit={() => setEditOpen(true)} />

      <div className="grid grid-cols-1 items-start gap-4 lg:grid-cols-[1fr_280px]">
        <ProfilePostsFeed username={username} />
        <ProfileCommunities communities={profile.communities} />
      </div>

      {editOpen && <EditProfileModal profile={profile} onClose={() => setEditOpen(false)} />}
    </div>
  );
}
