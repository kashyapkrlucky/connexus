"use client";

import { BotIcon, CalendarIcon, PencilIcon } from "lucide-react";
import type { UserProfileDTO } from "@/server/types/user.types";
import { Avatar } from "@/shared/components/ui/Avatar";
import { Badge } from "@/shared/components/ui/Badge";
import { Button } from "@/shared/components/ui/Button";
import { formatCompactNumber, pluralize } from "@/shared/utils/format";
import { formatMonthYear } from "@/shared/utils/date";

interface ProfileHeaderProps {
  profile: UserProfileDTO;
  isOwnProfile: boolean;
  onEdit: () => void;
}

function Stat({ value, label }: { value: number; label: string }) {
  return (
    <span>
      <strong className="font-semibold text-gray-200">{formatCompactNumber(value)}</strong> {label}
    </span>
  );
}

/** Mirrors CommunityHeader: banner, overlapping avatar, then everything on one left edge. */
export function ProfileHeader({ profile, isOwnProfile, onEdit }: ProfileHeaderProps) {
  const { stats } = profile;

  return (
    <div className="overflow-hidden rounded-2xl border border-gray-800 bg-gray-900">
      <div className="h-24 bg-linear-to-br from-brand-900 to-gray-900 sm:h-28" />

      <div className="px-4 pb-5 sm:px-6">
        <div className="-mt-10 flex items-end justify-between gap-3">
          <Avatar name={profile.displayName} src={profile.avatarUrl} size={80} className="border-4 border-gray-900" />
          {isOwnProfile && (
            <Button variant="outline" size="sm" onClick={onEdit} className="mb-1 whitespace-nowrap">
              <PencilIcon className="size-3.5" /> Edit profile
            </Button>
          )}
        </div>

        <div className="mt-3 flex min-w-0 items-center gap-2">
          <h1 className="truncate text-xl font-bold text-gray-100">{profile.displayName}</h1>
          {profile.isBot && (
            <Badge tone="blue" className="shrink-0">
              <BotIcon className="size-3" /> bot
            </Badge>
          )}
        </div>
        <p className="text-sm text-gray-500">u/{profile.username}</p>

        {profile.bio && <p className="mt-3 max-w-prose text-sm leading-relaxed text-gray-400">{profile.bio}</p>}

        <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-gray-500">
          <Stat value={stats.postCount} label={pluralize(stats.postCount, "post")} />
          <Stat value={stats.karma} label="karma" />
          <Stat value={stats.communityCount} label={pluralize(stats.communityCount, "community", "communities")} />
          <span className="flex items-center gap-1">
            <CalendarIcon className="size-3" /> Joined {formatMonthYear(profile.createdAt)}
          </span>
        </div>
      </div>
    </div>
  );
}
