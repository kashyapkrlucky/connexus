import { NextRequest } from "next/server";
import { getCurrentUserId } from "@/features/auth/server";
import { PostService } from "@/server/services/PostService";
import { ApiError, handleApiError, jsonOk } from "@/server/utils/response";

export async function GET(
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const viewerId = await getCurrentUserId();
        const post = await PostService.getPostById(id, viewerId);
        if (!post) throw new ApiError("Post not found", 404);
        return jsonOk(post);
    } catch (error) {
        return handleApiError(error);
    }
}

export async function DELETE(
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const userId = await getCurrentUserId();
        if (!userId) throw new ApiError("Unauthorized", 401);

        await PostService.deletePost(id, userId);
        return jsonOk({ success: true });
    } catch (error) {
        return handleApiError(error);
    }
}
