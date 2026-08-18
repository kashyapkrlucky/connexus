import { PostType, VoteValue, CommunityVisibility } from "../../../generated/prisma/enums";
import { UserSummary } from "../types/common.types";

export interface PostCommunitySummary {
  id: string;
  slug: string;
  name: string;
  visibility: CommunityVisibility;
  iconUrl: string | null;
}

export interface PostDTO {
  id: string;
  title: string;
  content: string | null;
  imageUrl: string | null;
  type: PostType;
  score: number;
  upvotes: number;
  downvotes: number;
  viewCount: number;
  shareCount: number;
  commentCount: number;
  hotScore: number;
  createdAt: string;
  author: UserSummary;
  community: PostCommunitySummary;
  viewerVote: VoteValue | null;
}
