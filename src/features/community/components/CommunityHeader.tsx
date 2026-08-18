"use client";

import Image from "next/image";
import Link from "next/link";
import { CalendarIcon, GlobeIcon, LockIcon, PencilIcon } from "lucide-react";
import type { CommunityDetailDTO } from "@/server/types/community.types";
import { Avatar } from "@/shared/components/ui/Avatar";
import { Button } from "@/shared/components/ui/Button";
import { Badge } from "@/shared/components/ui/Badge";
import { formatCompactNumber } from "@/shared/utils/format";
import { formatRelativeTime } from "@/shared/utils/date";

interface CommunityHeaderProps {
  community: CommunityDetailDTO;
  onToggleMembership: () => void;
  membershipUpdating: boolean;
  onEdit: () => void;
}

export function CommunityHeader({ community, onToggleMembership, membershipUpdating, onEdit }: CommunityHeaderProps) {
  const canManage = community.viewerRole === "OWNER" || community.viewerRole === "MODERATOR";

  return (
    <div className="overflow-hidden rounded-2xl border border-gray-800 bg-gray-900">
      <div className="relative h-32 w-full bg-linear-to-br from-brand-900 to-gray-900 sm:h-40">
        {community.bannerUrl && <Image src={community.bannerUrl} alt="" fill className="object-cover" />}
      </div>

      <div className="px-4 pb-4 sm:px-6 sm:pb-6">
        <div className="-mt-10 flex items-end justify-between gap-3 sm:-mt-12">
          <Avatar name={community.name} src={community.iconUrl} size={80} className="shrink-0 border-4 border-gray-900" />
          <div className="flex items-center gap-2 pb-1">
            {canManage && (
              <Button variant="outline" size="sm" onClick={onEdit}>
                <PencilIcon className="size-3.5" /> Edit
              </Button>
            )}
            {community.viewerIsBanned ? (
              <Badge tone="red">Banned</Badge>
            ) : community.viewerRole !== "OWNER" ? (
              <Button
                variant={community.viewerIsMember ? "outline" : "primary"}
                size="sm"
                onClick={onToggleMembership}
                loading={membershipUpdating}
              >
                {community.viewerIsMember ? "Leave" : "Join"}
              </Button>
            ) : null}
          </div>
        </div>

        <div className="mt-3 flex items-center gap-2">
          <h1 className="text-xl font-bold text-gray-100">c/{community.slug}</h1>
          <Badge tone={community.visibility === "PRIVATE" ? "red" : "brand"} className="gap-1">
            {community.visibility === "PRIVATE" ? (
              <LockIcon className="size-3" />
            ) : (
              <GlobeIcon className="size-3" />
            )}
            {community.visibility === "PRIVATE" ? "Private" : "Public"}
          </Badge>
        </div>
        {community.description && <p className="mt-1 text-sm text-gray-400">{community.description}</p>}

        <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-gray-500">
          <span>
            <strong className="text-gray-200">{formatCompactNumber(community.memberCount)}</strong> members
          </span>
          <span>
            <strong className="text-gray-200">{formatCompactNumber(community.postCount)}</strong> posts
          </span>
          <span className="flex items-center gap-1">
            <CalendarIcon className="size-3" /> Created {formatRelativeTime(community.createdAt)}
          </span>
          <span>
            Owned by{" "}
            <Link href={`/u/${community.owner.username}`} className="text-gray-300 hover:text-gray-100">
              u/{community.owner.username}
            </Link>
          </span>
        </div>
      </div>
    </div>
  );
}
