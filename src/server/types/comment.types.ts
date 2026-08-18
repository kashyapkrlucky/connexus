import { VoteValue } from "../../../generated/prisma/enums";
import { UserSummary } from "../types/common.types";

export interface CommentDTO {
  id: string;
  content: string;
  postId: string;
  parentId: string | null;
  score: number;
  createdAt: string;
  author: UserSummary;
  viewerVote: VoteValue | null;
  replies: CommentDTO[];
}
