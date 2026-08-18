import { POST_SORTS } from "@/shared/constants";
import { z } from "zod";

export const createPostSchema = z
  .object({
    communityId: z.string().min(1, "communityId is required"),
    title: z.string().trim().min(1, "Title is required").max(300),
    content: z.string().trim().max(10000).optional(),
    imageUrl: z.string().url().optional(),
  })
  .refine((data) => Boolean(data.content?.length) || Boolean(data.imageUrl), {
    message: "Post must have text content or an image",
    path: ["content"],
  });
export type CreatePostInput = z.infer<typeof createPostSchema>;

export const voteSchema = z.object({
  value: z.enum(["UP", "DOWN", "NONE"]),
});
export type VoteInput = z.infer<typeof voteSchema>;

export const listPostsQuerySchema = z.object({
  scope: z.enum(["home", "popular", "community", "user"]).default("home"),
  communitySlug: z.string().optional(),
  username: z.string().optional(),
  sort: z.enum(POST_SORTS).default("recent"),
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(50).default(20),
});
export type ListPostsQuery = z.infer<typeof listPostsQuerySchema>;
