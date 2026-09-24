import { NextRequest } from "next/server";
import { getCurrentUserId } from "@/features/auth/server";
import { enforceRateLimit } from "@/server/utils/rateLimit";
import { PostService } from "@/server/services/PostService";
import { createPostSchema, listPostsQuerySchema } from "@/server/schemas/post.schema";
import { ApiError, handleApiError, jsonOk } from "@/server/utils/response";

export async function GET(req: NextRequest) {
    try {
        const { searchParams } = new URL(req.url);
        const query = listPostsQuerySchema.parse(Object.fromEntries(searchParams));
        const viewerId = await getCurrentUserId();
        const posts = await PostService.listPosts(query, viewerId);
        return jsonOk(posts);
    } catch (error) {
        return handleApiError(error);
    }
}

export async function POST(req: NextRequest) {
    try {
        const userId = await getCurrentUserId();
        if (!userId) throw new ApiError("Unauthorized", 401);
        await enforceRateLimit("post", userId);

        const body = await req.json();
        const input = createPostSchema.parse(body);
        const post = await PostService.createPost(input, userId);
        return jsonOk(post, 201);
    } catch (error) {
        return handleApiError(error);
    }
}
