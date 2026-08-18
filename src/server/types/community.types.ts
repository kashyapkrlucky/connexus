import { CommunityRole, CommunityVisibility } from "../../../generated/prisma/enums";
import { UserSummary } from "../types/common.types";

export interface CommunitySummaryDTO {
  id: string;
  name: string;
  slug: string;
  description: string;
  visibility: CommunityVisibility;
  iconUrl: string | null;
  bannerUrl: string | null;
  memberCount: number;
  postCount: number;
  owner: UserSummary;
  viewerIsMember: boolean;
  viewerRole: CommunityRole | null;
}

export interface TrendingCommunityDTO extends CommunitySummaryDTO {
  postsToday: number;
}

export interface CommunityGuidelineDTO {
  id: string;
  order: number;
  title: string;
  body: string;
}

export interface CommunityDetailDTO extends CommunitySummaryDTO {
  guidelines: CommunityGuidelineDTO[];
  createdAt: string;
  viewerIsBanned: boolean;
}

export interface CommunityMemberDTO {
  id: string;
  role: CommunityRole;
  joinedAt: string;
  user: UserSummary;
  invitedBy: UserSummary | null;
}

export interface CommunityAnalyticsDTO {
  live: {
    memberCount: number;
    postCount: number;
    totalUpvotes: number;
    totalDownvotes: number;
    totalViews: number;
  };
  trend: Array<{
    date: string;
    memberCount: number;
    postCount: number;
    totalUpvotes: number;
    totalDownvotes: number;
    totalViews: number;
  }>;
}
