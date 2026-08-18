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
