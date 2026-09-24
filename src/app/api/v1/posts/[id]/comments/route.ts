import { NextRequest } from "next/server";
import { getCurrentUserId } from "@/features/auth/server";
import { CommentService } from "@/server/services/CommentService";
import { handleApiError, jsonOk } from "@/server/utils/response";

export async function GET(
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const viewerId = await getCurrentUserId();
        const comments = await CommentService.getCommentsForPost(id, viewerId);
        return jsonOk(comments);
    } catch (error) {
        return handleApiError(error);
    }
}
