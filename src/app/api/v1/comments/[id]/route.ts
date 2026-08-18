import { NextRequest } from "next/server";
import { getUserFromHeaders } from "@/features/auth/utils";
import { CommentService } from "@/server/services/CommentService";
import { ApiError, handleApiError, jsonOk } from "@/server/utils/response";

export async function DELETE(
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const userId = await getUserFromHeaders(req);
        if (!userId) throw new ApiError("Unauthorized", 401);

        await CommentService.deleteComment(id, userId);
        return jsonOk({ success: true });
    } catch (error) {
        return handleApiError(error);
    }
}
