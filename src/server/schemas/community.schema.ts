import { z } from "zod";

export const createCommunitySchema = z.object({
  name: z.string().trim().min(3, "Name must be at least 3 characters").max(50),
  description: z.string().trim().min(1, "Description is required").max(500),
  visibility: z.enum(["PUBLIC", "PRIVATE"]).default("PUBLIC"),
  iconUrl: z.string().url().optional(),
  bannerUrl: z.string().url().optional(),
});
export type CreateCommunityInput = z.infer<typeof createCommunitySchema>;

export const updateCommunitySchema = z.object({
  description: z.string().trim().min(1, "Description is required").max(500).optional(),
  visibility: z.enum(["PUBLIC", "PRIVATE"]).optional(),
  iconUrl: z.string().url().optional(),
  bannerUrl: z.string().url().optional(),
});
export type UpdateCommunityInput = z.infer<typeof updateCommunitySchema>;

export const updateMemberRoleSchema = z.object({
  role: z.enum(["MODERATOR", "MEMBER"]),
});
export type UpdateMemberRoleInput = z.infer<typeof updateMemberRoleSchema>;

export const guidelineSchema = z.object({
  title: z.string().trim().min(1).max(100),
  body: z.string().trim().min(1).max(1000),
});

export const updateGuidelinesSchema = z.object({
  guidelines: z.array(guidelineSchema).max(20),
});
export type UpdateGuidelinesInput = z.infer<typeof updateGuidelinesSchema>;

export const inviteMemberSchema = z.object({
  userId: z.string().min(1, "userId is required"),
});
export type InviteMemberInput = z.infer<typeof inviteMemberSchema>;

export const banMemberSchema = z.object({
  userId: z.string().min(1, "userId is required"),
  reason: z.string().trim().max(300).optional(),
});
export type BanMemberInput = z.infer<typeof banMemberSchema>;

export const listCommunitiesQuerySchema = z.object({
  q: z.string().trim().max(100).optional(),
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(50).default(20),
});
export type ListCommunitiesQuery = z.infer<typeof listCommunitiesQuerySchema>;
