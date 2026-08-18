import { CommunityRole } from "../../../generated/prisma/enums";

export interface UserProfileCommunityDTO {
  id: string;
  slug: string;
  name: string;
  iconUrl: string | null;
  role: CommunityRole;
}

export interface UserProfileDTO {
  id: string;
  username: string;
  displayName: string;
  avatarUrl: string | null;
  bio: string | null;
  createdAt: string;
  stats: {
    postCount: number;
    karma: number;
    communityCount: number;
  };
  communities: UserProfileCommunityDTO[];
}

export interface UserRankDTO {
  name: string;
  color: string;
  level: number;
  minXp: number;
  nextRank: { name: string; minXp: number } | null;
  progress: number;
}

export interface UserScoreDTO {
  xp: number;
  breakdown: {
    postCount: number;
    commentCount: number;
    communityCount: number;
    voteCount: number;
  };
  rank: UserRankDTO;
}
