"use client";

import { use, useEffect, useState } from "react";
import { LockIcon } from "lucide-react";
import { useCommunityStore } from "@/features/community/store/useCommunityStore";
import { CommunityHeader } from "@/features/community/components/CommunityHeader";
import { CommunityPostsFeed } from "@/features/community/components/CommunityPostsFeed";
import { CommunityGuidelines } from "@/features/community/components/CommunityGuidelines";
import { EditCommunityModal } from "@/features/community/components/EditCommunityModal";
import { Skeleton } from "@/shared/components/ui/Skeleton";
import { EmptyState } from "@/shared/components/ui/EmptyState";

interface CommunityPageProps {
  params: Promise<{ slug: string }>;
}

export default function CommunityPage({ params }: CommunityPageProps) {
  const { slug } = use(params);
  const { community, communityLoading, communityNotFound, getCommunity, reset, membershipUpdating, toggleMembership } =
    useCommunityStore();
  const [editOpen, setEditOpen] = useState(false);

  useEffect(() => {
    reset();
    getCommunity(slug);
  }, [slug, getCommunity, reset]);

  if (communityLoading || (!community && !communityNotFound)) {
    return (
      <div className="mx-auto max-w-4xl space-y-3">
        <Skeleton className="h-40 w-full" />
        <Skeleton className="h-40 w-full" />
      </div>
    );
  }

  if (!community) {
    return (
      <div className="mx-auto max-w-xl">
        <EmptyState
          icon={LockIcon}
          title="Community not found"
          description="It may not exist, or it's private and you're not a member."
        />
      </div>
    );
  }

  const canManage = community.viewerRole === "OWNER" || community.viewerRole === "MODERATOR";

  return (
    <div className="mx-auto flex max-w-4xl flex-col gap-4">
      <CommunityHeader
        community={community}
        onToggleMembership={toggleMembership}
        membershipUpdating={membershipUpdating}
        onEdit={() => setEditOpen(true)}
      />

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-[1fr_280px]">
        <CommunityPostsFeed slug={slug} />
        <CommunityGuidelines community={community} canManage={canManage} />
      </div>

      {editOpen && <EditCommunityModal community={community} onClose={() => setEditOpen(false)} />}
    </div>
  );
}
