import "server-only";
import { cache } from "react";
import { getCurrentUserId } from "@/features/auth/server";
import { CommunityService } from "./services/CommunityService";
import { PostService } from "./services/PostService";
import UserService from "./services/UserService";

// Per-request memoized lookups shared by generateMetadata and the page component,
// so each only hits the database once. They respect the viewer's access to private
// communities, so metadata never describes something the viewer can't see.
export const getPostForPage = cache(async (id: string) => PostService.getPostById(id, await getCurrentUserId()));

export const getCommunityForPage = cache(async (slug: string) =>
  CommunityService.getCommunityBySlug(slug, await getCurrentUserId())
);

export const getProfileForPage = cache(async (username: string) => UserService.getProfileByUsername(username));
