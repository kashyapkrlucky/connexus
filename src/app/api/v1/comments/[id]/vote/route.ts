import { NextRequest } from "next/server";
import { getUserFromHeaders } from "@/features/auth/utils";
import { CommentService } from "@/server/services/CommentService";
import { voteCommentSchema } from "@/server/schemas/comment.schema";
import { ApiError, handleApiError, jsonOk } from "@/server/utils/response";

export async function POST(
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const userId = await getUserFromHeaders(req);
        if (!userId) throw new ApiError("Unauthorized", 401);

        const body = await req.json();
        const { value } = voteCommentSchema.parse(body);
        const result = await CommentService.voteComment(id, userId, value);
        return jsonOk(result);
    } catch (error) {
        return handleApiError(error);
    }
}
