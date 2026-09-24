"use client";

import { useEffect } from "react";
import { signOut } from "next-auth/react";
import { LogOutIcon, SettingsIcon } from "lucide-react";
import { useCurrentUser } from "@/features/auth/hooks/useCurrentUser";
import { GoogleSignInButton } from "@/features/auth/components/GoogleSignInButton";
import { useProfileStore } from "@/features/profile/store/useProfileStore";
import { ProfileEditFields } from "@/features/profile/components/ProfileEditFields";
import { Button } from "@/shared/components/ui/Button";
import { EmptyState } from "@/shared/components/ui/EmptyState";
import { Skeleton } from "@/shared/components/ui/Skeleton";

export default function SettingsPage() {
  const { user, isAuthenticated, isLoading } = useCurrentUser();
  const { profile, profileLoading, getOwnProfile } = useProfileStore();

  useEffect(() => {
    if (isAuthenticated) getOwnProfile();
  }, [isAuthenticated, getOwnProfile]);

  if (!isLoading && !isAuthenticated) {
    return (
      <div className="mx-auto max-w-xl">
        <h1 className="mb-6 text-2xl font-bold tracking-tight text-gray-200">Settings</h1>
        <EmptyState
          icon={SettingsIcon}
          title="Sign in to manage your settings"
          description="Edit your profile, avatar and bio once you're signed in."
          action={
            <div className="w-64">
              <GoogleSignInButton />
            </div>
          }
        />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-xl">
      <h1 className="mb-6 text-2xl font-bold tracking-tight text-gray-200">Settings</h1>

      {isLoading || profileLoading || !profile ? (
        <div className="space-y-3">
          <Skeleton className="h-24 w-full" />
          <Skeleton className="h-72 w-full" />
        </div>
      ) : (
        <div className="flex flex-col gap-4">
          <div className="rounded-2xl border border-gray-800 bg-gray-900 p-4">
            <h2 className="mb-3 text-sm font-semibold text-gray-200">Account</h2>
            <dl className="grid grid-cols-[auto_1fr] gap-x-6 gap-y-2 text-sm">
              <dt className="text-gray-500">Username</dt>
              <dd className="truncate text-gray-300">u/{profile.username}</dd>
              {user?.email && (
                <>
                  <dt className="text-gray-500">Email</dt>
                  <dd className="truncate text-gray-300">{user.email}</dd>
                </>
              )}
              <dt className="text-gray-500">Sign-in</dt>
              <dd className="text-gray-300">Google</dd>
            </dl>
            <Button variant="outline" size="sm" className="mt-4" onClick={() => signOut({ redirectTo: "/" })}>
              <LogOutIcon className="size-3.5" /> Sign out
            </Button>
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
