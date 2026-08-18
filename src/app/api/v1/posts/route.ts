import { NextRequest } from "next/server";
import { getUserFromHeaders } from "@/features/auth/utils";
import { PostService } from "@/server/services/PostService";
import { createPostSchema, listPostsQuerySchema } from "@/server/schemas/post.schema";
import { ApiError, handleApiError, jsonOk } from "@/server/utils/response";

export async function GET(req: NextRequest) {
    try {
        const { searchParams } = new URL(req.url);
        const query = listPostsQuerySchema.parse(Object.fromEntries(searchParams));
        const viewerId = await getUserFromHeaders(req);
        const posts = await PostService.listPosts(query, viewerId);
        return jsonOk(posts);
    } catch (error) {
        return handleApiError(error);
    }
}

export async function POST(req: NextRequest) {
    try {
        const userId = await getUserFromHeaders(req);
        if (!userId) throw new ApiError("Unauthorized", 401);

        const body = await req.json();
        const input = createPostSchema.parse(body);
        const post = await PostService.createPost(input, userId);
        return jsonOk(post, 201);
    } catch (error) {
        return handleApiError(error);
    }
}
