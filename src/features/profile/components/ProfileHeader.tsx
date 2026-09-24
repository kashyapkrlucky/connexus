"use client";

import { CalendarIcon, PencilIcon, UsersIcon } from "lucide-react";
import type { UserProfileDTO, UserScoreDTO } from "@/server/types/user.types";
import { Avatar } from "@/shared/components/ui/Avatar";
import { Button } from "@/shared/components/ui/Button";
import { RankBadge } from "@/shared/components/ui/RankBadge";
import { formatCompactNumber, pluralize } from "@/shared/utils/format";
import { formatRelativeTime } from "@/shared/utils/date";

interface ProfileHeaderProps {
  profile: UserProfileDTO;
  isOwnProfile: boolean;
  ownScore: UserScoreDTO | null;
  onEdit: () => void;
}

export function ProfileHeader({ profile, isOwnProfile, ownScore, onEdit }: ProfileHeaderProps) {
  return (
    <div className="rounded-2xl border border-gray-800 bg-gray-900 p-4 sm:p-6">
      <div className="flex items-start gap-3 sm:gap-4">
        <Avatar name={profile.displayName} src={profile.avatarUrl} size={64} />
        <div className="min-w-0 flex-1 self-center">
          <h1 className="truncate text-lg font-bold text-gray-100">{profile.displayName}</h1>
          <p className="truncate text-sm text-gray-500">u/{profile.username}</p>
        </div>
        {isOwnProfile && (
          <Button variant="outline" size="sm" onClick={onEdit} className="shrink-0 whitespace-nowrap" aria-label="Edit profile">
            <PencilIcon className="size-3.5" /> <span className="hidden sm:inline">Edit profile</span>
          </Button>
        )}
      </div>

      {profile.bio && <p className="mt-3 text-sm text-gray-400">{profile.bio}</p>}

      <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-gray-500">
        <span>
          <strong className="text-gray-200">{formatCompactNumber(profile.stats.postCount)}</strong> {pluralize(profile.stats.postCount, "post")}
        </span>
        <span>
          <strong className="text-gray-200">{formatCompactNumber(profile.stats.karma)}</strong> karma
        </span>
        <span className="flex items-center gap-1">
          <UsersIcon className="size-3" />
          <strong className="text-gray-200">{formatCompactNumber(profile.stats.communityCount)}</strong> {pluralize(profile.stats.communityCount, "community", "communities")}
        </span>
        <span className="flex items-center gap-1">
          <CalendarIcon className="size-3" /> Joined {formatRelativeTime(profile.createdAt)}
        </span>
      </div>

      {isOwnProfile && ownScore && (
        <div className="mt-4 border-t border-gray-800 pt-4">
          <RankBadge rank={ownScore.rank} xp={ownScore.xp} />
        </div>
      )}
    </div>
  );
}
