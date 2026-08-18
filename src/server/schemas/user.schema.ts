import { z } from "zod";

export const updateProfileSchema = z.object({
  displayName: z.string().trim().min(1, "Display name is required").max(60),
  bio: z.string().trim().max(280).optional(),
  avatarUrl: z.string().url().optional(),
});
export type UpdateProfileInput = z.infer<typeof updateProfileSchema>;
