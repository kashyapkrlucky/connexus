"use client";

import { useEffect } from "react";
import { useProfileStore } from "@/features/profile/store/useProfileStore";
import { ProfileEditFields } from "@/features/profile/components/ProfileEditFields";
import { Skeleton } from "@/shared/components/ui/Skeleton";

export default function SettingsPage() {
  const { profile, profileLoading, getOwnProfile } = useProfileStore();

  useEffect(() => {
    getOwnProfile();
  }, [getOwnProfile]);

  return (
    <div className="mx-auto max-w-xl">
      <h1 className="mb-6 text-2xl font-bold tracking-tight text-gray-200">Settings</h1>

      {profileLoading || !profile ? (
        <div className="space-y-3">
          <Skeleton className="h-16 w-full" />
          <Skeleton className="h-72 w-full" />
        </div>
      ) : (
        <div className="flex flex-col gap-4">
          <div className="rounded-2xl border border-gray-800 bg-gray-900 p-4">
            <h2 className="mb-1 text-sm font-semibold text-gray-200">Account</h2>
            <p className="text-sm text-gray-500">u/{profile.username}</p>
          </div>

          <div className="rounded-2xl border border-gray-800 bg-gray-900 p-4">
            <h2 className="mb-4 text-sm font-semibold text-gray-200">Profile</h2>
            <ProfileEditFields profile={profile} />
          </div>
        </div>
      )}
    </div>
  );
}
