import { z } from "zod";

export const createCommentSchema = z.object({
  postId: z.string().min(1, "postId is required"),
  content: z.string().trim().min(1, "Comment can't be empty").max(2000),
  parentId: z.string().optional(),
});
export type CreateCommentInput = z.infer<typeof createCommentSchema>;

export const voteCommentSchema = z.object({
  value: z.enum(["UP", "DOWN", "NONE"]),
});
export type VoteCommentInput = z.infer<typeof voteCommentSchema>;
